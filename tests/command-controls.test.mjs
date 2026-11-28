import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {CuIconButton,CuToggleButtonGroup,CuToolbar,CuCommandBar,
  normalizeToggleOptions,toggleGroupValues,nextToolbarIndex,normalizeCommands,
  partitionCommands} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("command controls import without DOM and expose observed attributes",()=>{
  for(const klass of [CuIconButton,CuToggleButtonGroup,CuToolbar,CuCommandBar])
    assert.equal(typeof klass,"function");
  assert.ok(CuIconButton.observedAttributes.includes("pressed"));
  assert.ok(CuToggleButtonGroup.observedAttributes.includes("multiple"));
  assert.ok(CuToolbar.observedAttributes.includes("orientation"));
  assert.ok(CuCommandBar.observedAttributes.includes("max-visible"));
});

test("IconButton dispatches toggle and press events with disabled guard",()=>{
  const button=Object.create(CuIconButton.prototype);
  const attrs=new Map([["name","eye"],["toggle",""]]),events=[];
  button.hasAttribute=k=>attrs.has(k);
  button.getAttribute=k=>attrs.get(k)??null;
  button.toggleAttribute=(k,on)=>on?attrs.set(k,""):attrs.delete(k);
  button.dispatchEvent=e=>{events.push(e);return true;};
  button._sync=()=>{};
  assert.equal(button.press(),true);
  assert.equal(button.pressed,true);
  assert.deepEqual(events.map(e=>e.type),["cu-change","cu-press"]);
  assert.deepEqual(events[0].detail,{value:"eye",pressed:true});
  assert.deepEqual(events[1].detail,{type:"button",name:"eye"});
  button.press();assert.equal(button.pressed,false);
  attrs.set("disabled","");assert.equal(button.press(),false);
  attrs.delete("disabled");attrs.set("loading","");assert.equal(button.press(),false);
  attrs.delete("loading");attrs.delete("toggle");
  assert.equal(button.press(),true);
  assert.equal(events.length,5);
});

test("ToggleButtonGroup normalizes options and applies single/multi selection",()=>{
  assert.deepEqual(normalizeToggleOptions(null),[]);
  assert.deepEqual(normalizeToggleOptions([
    {value:"left",label:"Left",icon:"menu"},
    {value:"left"},{value:"right",disabled:true},{value:4},null
  ]),[{value:"left",label:"Left",icon:"menu",disabled:false},
      {value:"right",label:"right",icon:"",disabled:true}]);
  assert.equal(toggleGroupValues("left","right",false),"right");
  assert.deepEqual(toggleGroupValues(["left"],"right",true),["left","right"]);
  assert.deepEqual(toggleGroupValues(["left","right"],"left",true),["right"]);
  const group=Object.create(CuToggleButtonGroup.prototype);
  const attrs=new Set(["multiple"]),events=[];
  group.hasAttribute=k=>attrs.has(k);
  group.toggleAttribute=(k,on)=>on?attrs.add(k):attrs.delete(k);
  group.dispatchEvent=e=>{events.push(e);return true;};
  group._syncPressed=()=>{};
  group._items=normalizeToggleOptions([
    {value:"draft"},{value:"review"},{value:"archived",disabled:true}
  ]);
  group._selected=["draft"];
  assert.equal(group.select("review"),true);
  assert.deepEqual(group.value,["draft","review"]);
  assert.equal(group.select("review"),true);
  assert.deepEqual(group.value,["draft"]);
  assert.equal(group.select("archived"),false);
  const prepared=Object.create(CuToggleButtonGroup.prototype);
  prepared._items=[];prepared._selected=[];
  prepared.hasAttribute=k=>k==="multiple";
  prepared._syncPressed=()=>{};prepared._render=()=>{};
  prepared.value=["draft"];
  assert.deepEqual(prepared.value,["draft"]);
  prepared.items=[{value:"draft",label:"Draft"}];
  assert.deepEqual(prepared.value,["draft"]);
  attrs.add("disabled");
  assert.equal(group.select("draft"),false);
  attrs.delete("disabled");group.multiple=false;
  assert.equal(group.select("review"),true);
  assert.equal(group.value,"review");
  assert.equal(group.select("review"),false);
  assert.equal(events.length,3);
  assert.deepEqual(events[0].detail,
    {value:["draft","review"],values:["draft","review"]});
});

test("Toolbar roving index skips disabled items and wraps",()=>{
  const items=[{disabled:false},{disabled:true},{disabled:false},{disabled:false}];
  assert.equal(nextToolbarIndex(items,0,"next"),2);
  assert.equal(nextToolbarIndex(items,3,"next"),0);
  assert.equal(nextToolbarIndex(items,0,"previous"),3);
  assert.equal(nextToolbarIndex(items,2,"Home"),0);
  assert.equal(nextToolbarIndex(items,2,"End"),3);
  assert.equal(nextToolbarIndex(items,-1,"next"),0);
  assert.equal(nextToolbarIndex(items,-1,"previous"),3);
  assert.equal(nextToolbarIndex([],0,"next"),-1);
});

test("CommandBar normalizes, partitions and blocks disabled actions",()=>{
  const actions=normalizeCommands([
    {value:"save",label:"Save",icon:"save"},
    {value:"copy",disabled:true},{value:"save"},{value:""},null
  ]);
  assert.deepEqual(actions,[
    {value:"save",label:"Save",icon:"save",disabled:false},
    {value:"copy",label:"copy",icon:"",disabled:true}
  ]);
  assert.deepEqual(partitionCommands(actions,1),
    {visible:[actions[0]],overflow:[actions[1]]});
  assert.deepEqual(partitionCommands(actions,0),{visible:[],overflow:actions});
  assert.deepEqual(partitionCommands(actions,99),{visible:actions,overflow:[]});
  const bar=Object.create(CuCommandBar.prototype);
  const attrs=new Map([["max-visible","3"]]),events=[];
  bar.getAttribute=k=>attrs.get(k)??null;bar.hasAttribute=k=>attrs.has(k);
  bar.dispatchEvent=e=>{events.push(e);return true;};
  bar._commands=actions;bar._overflow=[actions[0]];
  bar._more={getBoundingClientRect:()=>({left:10,bottom:30})};
  bar._menu={open:false,showAt(x,y,target){
    assert.deepEqual([x,y],[10,34]);assert.equal(target,bar._more);this.open=true;
  }};
  assert.equal(bar.activate("save"),true);
  assert.equal(bar.activate("copy"),false);
  assert.equal(bar.activate("missing"),false);
  assert.equal(bar.showOverflow(),true);
  assert.equal(bar.maxVisible,3);
  attrs.set("disabled","");
  assert.equal(bar.activate("save"),false);
  assert.equal(bar.showOverflow(),false);
  assert.equal(events.length,1);
  assert.deepEqual(events[0].detail,{value:"save",label:"Save"});
});

test("command controls expose keyboard and accessibility semantics",async()=>{
  const [icon,group,toolbar,bar]=await Promise.all([
    "icon-button","toggle-button-group","toolbar","command-bar"
  ].map(n=>read("../packages/web/src/components/"+n+".js")));
  assert.match(icon,/aria-pressed/);
  assert.match(icon,/prefers-reduced-motion:reduce/);
  assert.match(group,/role="group"/);
  assert.match(group,/ArrowRight/);
  assert.match(toolbar,/role="toolbar"/);
  assert.match(toolbar,/slotchange/);
  assert.match(toolbar,/ArrowLeft/);
  assert.match(bar,/ResizeObserver/);
  assert.match(bar,/cu-context-menu class="overflow"/);
  assert.match(bar,/if\(this\._capacity\(\)!==this\._lastCapacity\)/);
  for(const src of [icon,group,toolbar,bar]){
    assert.match(src,/focus-visible/);
    assert.match(src,/forced-colors:active/);
    assert.doesNotMatch(src,/innerHTML\s*=.*(?:value|label)/);
  }
});

test("Web packages, React event and property bindings cover four new controls",async()=>{
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  const types=await read("../packages/web/src/components/index.d.ts");
  const react=await read("../packages/react/src/components.js");
  for(const id of ["icon-button","toggle-button-group","toolbar","command-bar"]){
    assert.equal(pkg.exports["./components/"+id].default,
      "./dist/components/"+id+".js");
    assert.equal(pkg.exports["./components/"+id].types,
      "./dist/components/index.d.ts");
  }
  for(const name of ["IconButton","ToggleButtonGroup","Toolbar","CommandBar"]){
    assert.equal(REACT_TAGS[name],"cu-"+name.replace(/[A-Z]/g,(c,i)=>
      (i?"-":"")+c.toLowerCase()));
    assert.ok(types.includes("class Cu"+name+" extends HTMLElement"));
  }
  assert.equal(Object.keys(REACT_TAGS).length,195);
  assert.equal(REACT_EVENT_PROPS.onCuAction,"cu-action");
  assert.match(react,/Button, IconButton, ToggleButtonGroup, Toolbar, CommandBar/);
  let sets=0,values=0,commandsCount=0;
  const group={};
  Object.defineProperty(group,"items",{get(){return [];},set(){sets++;}});
  Object.defineProperty(group,"value",{get(){return [];},set(){values++;}});
  const items=[{value:"left"}],value=["left"];
  assignCuProperties(group,"cu-toggle-button-group",{items,value});
  assignCuProperties(group,"cu-toggle-button-group",{items,value});
  assert.equal(sets,1);assert.equal(values,1);
  const bar={};
  Object.defineProperty(bar,"commands",{get(){return [];},set(){commandsCount++;}});
  const commands=[{value:"save"}];
  assignCuProperties(bar,"cu-command-bar",{commands});
  assignCuProperties(bar,"cu-command-bar",{commands});
  assert.equal(commandsCount,1);
});

test("Playground and catalog include four experimental command controls",async()=>{
  const [html,js,json]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../design-system/components/catalog.json")
  ]);
  for(const tag of ["cu-icon-button","cu-toggle-button-group","cu-toolbar","cu-command-bar"])
    assert.ok(html.includes("<"+tag));
  for(const id of ["wc-icon-action","wc-toggle-group","wc-toolbar","wc-command-bar"])
    assert.ok(html.includes('id="'+id+'"'));
  assert.match(js,/wcCommands\.commands=/);
  assert.match(js,/alignGroup\.items=/);
  const catalog=JSON.parse(json).groups.flatMap(g=>g.components);
  for(const name of ["IconButton","ToggleButtonGroup","Toolbar","CommandBar"])
    assert.equal(catalog.find(c=>c.name===name)?.status,"preview");
  assert.equal(catalog.length,184);
  assert.equal(catalog.filter(c=>c.status==="preview").length,184);
  assert.equal(catalog.filter(c=>c.status==="planned").length,0);
  assert.equal(catalog.filter(c=>c.status==="ready").length,0);
});
