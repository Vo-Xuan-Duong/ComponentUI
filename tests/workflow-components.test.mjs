import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuSplitButton, CuStepper, CuInfoBar,
  normalizeSplitActions, normalizeSteps, canVisitStep
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS, assignCuProperties }
  from "../packages/react/src/index.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("new workflow components import without browser globals",()=>{
  for(const component of [CuSplitButton,CuStepper,CuInfoBar])
    assert.equal(typeof component,"function");
  assert.ok(CuSplitButton.observedAttributes.includes("loading"));
  assert.ok(CuStepper.observedAttributes.includes("value"));
  assert.ok(CuInfoBar.observedAttributes.includes("dismissible"));
});

test("SplitButton actions normalize labels and discard invalid or duplicate entries",()=>{
  assert.deepEqual(normalizeSplitActions(null),[]);
  assert.deepEqual(normalizeSplitActions([
    {value:"open",label:"Open"},{value:"open",label:"Duplicate"},
    {value:"archive",disabled:true},{value:""},{value:7},null
  ]),[
    {value:"open",label:"Open",disabled:false},
    {value:"archive",label:"archive",disabled:true}
  ]);
});

test("SplitButton forwards primary press and secondary action guards",()=>{
  const button=Object.create(CuSplitButton.prototype);
  const attrs=new Set();
  const events=[];
  button.hasAttribute=name=>attrs.has(name);
  button.dispatchEvent=event=>{events.push(event);return true;};
  button._sync=()=>{};
  button._arrow={getBoundingClientRect:()=>({left:20,bottom:30})};
  button._menu={open:false,showAt(x,y,target){
    assert.deepEqual([x,y],[20,34]);
    assert.equal(target,button._arrow);
    this.open=true;
  },hide(){this.open=false;}};
  button.actions=[
    {value:"save-copy",label:"Save copy"},
    {value:"archive",disabled:true}
  ];
  assert.equal(button.press(),true);
  assert.equal(events.at(-1).type,"cu-press");
  assert.deepEqual(events.at(-1).detail,{type:"button"});
  assert.equal(button.showMenu(),true);
  assert.equal(button.open,true);
  button.hideMenu();
  assert.equal(button.open,false);
  const copy=button.actions;copy[0].label="Changed";
  assert.equal(button.actions[0].label,"Save copy");
  attrs.add("loading");
  assert.equal(button.press(),false);
  assert.equal(button.showMenu(),false);
  attrs.delete("loading");
  attrs.add("disabled");
  assert.equal(button.press(),false);
  assert.equal(button.showMenu(),false);
  attrs.delete("disabled");
  button.actions=[{value:"archive",disabled:true}];
  assert.equal(button.showMenu(),false);
  assert.equal(events.length,1);
});

test("Stepper deduplicates and normalizes step metadata",()=>{
  assert.deepEqual(normalizeSteps(undefined),[]);
  assert.deepEqual(normalizeSteps([
    {value:"draft",label:"Draft"},
    {value:"review",description:"Review changes",optional:true},
    {value:"draft",label:"duplicate"},
    {value:42},null
  ]),[
    {value:"draft",label:"Draft",description:"",disabled:false,optional:false},
    {value:"review",label:"review",description:"Review changes",disabled:false,optional:true}
  ]);
});

test("Stepper linear navigation blocks skipping and disabled stages",()=>{
  const steps=normalizeSteps([
    {value:"draft"},{value:"review"},{value:"approval",disabled:true},
    {value:"publish"}
  ]);
  assert.equal(canVisitStep(steps,0,0,true),true);
  assert.equal(canVisitStep(steps,1,0,true),true);
  assert.equal(canVisitStep(steps,3,0,true),false);
  assert.equal(canVisitStep(steps,2,2,true),false);
  assert.equal(canVisitStep(steps,3,0,false),true);
  assert.equal(canVisitStep(steps,-1,0),false);
  assert.equal(canVisitStep(steps,99,0),false);
});

test("Stepper emits cu-change for next, previous and explicit transitions",()=>{
  const stepper=Object.create(CuStepper.prototype);
  const attrs=new Map([["linear",""]]);
  const events=[];
  stepper.getAttribute=name=>attrs.get(name)??null;
  stepper.hasAttribute=name=>attrs.has(name);
  stepper.setAttribute=(key,value)=>{attrs.set(key,value);};
  stepper.toggleAttribute=(name,on)=>on?attrs.set(name,""):attrs.delete(name);
  stepper.dispatchEvent=event=>{events.push(event);return true;};
  stepper._steps=normalizeSteps([
    {value:"draft"},{value:"review"},{value:"approve"},{value:"publish"}
  ]);
  stepper._focusIndex=0;
  stepper._render=()=>{};
  assert.equal(stepper.value,"draft");
  assert.equal(stepper.goTo("publish"),false);
  assert.equal(stepper.next(),true);
  assert.equal(stepper.value,"review");
  assert.equal(stepper._focusIndex,1);
  assert.equal(stepper.next(),true);
  assert.equal(stepper.previous(),true);
  assert.equal(stepper.currentIndex,1);
  assert.equal(stepper.goTo("review"),false);
  assert.deepEqual(events.map(e=>e.detail.value),["review","approve","review"]);
  assert.deepEqual(events[0].detail,
    {value:"review",index:1,previousValue:"draft"});
  stepper.linear=false;
  assert.equal(stepper.goTo("publish"),true);
  assert.equal(events.at(-1).detail.index,3);
  assert.equal(stepper._focusIndex,3);
  stepper.value="draft";
  assert.equal(stepper._focusIndex,0);
  const copy=stepper.steps;copy[0].label="Mutated";
  assert.equal(stepper.steps[0].label,"draft");
});

test("InfoBar dismiss and restore respect the dismissible flag",()=>{
  const bar=Object.create(CuInfoBar.prototype);
  const attrs=new Map([["tone","warning"]]);
  const events=[];
  bar.getAttribute=name=>attrs.get(name)??null;
  bar.hasAttribute=name=>attrs.has(name);
  bar.dispatchEvent=event=>{events.push(event);return true;};
  bar.hidden=false;
  assert.equal(bar.dismiss(),false);
  attrs.set("dismissible","");
  assert.equal(bar.dismiss(),true);
  assert.equal(bar.hidden,true);
  assert.equal(events[0].type,"cu-dismiss");
  assert.deepEqual(events[0].detail,{tone:"warning"});
  assert.equal(bar.dismiss(),false);
  bar.show();
  assert.equal(bar.hidden,false);
});

test("workflow components expose safe DOM markup and accessibility behavior",async()=>{
  const [split,stepper,info]=await Promise.all(["split-button","stepper","info-bar"]
    .map(name=>read("../packages/web/src/components/"+name+".js")));
  assert.match(split,/cu-context-menu class="actions-menu"/);
  assert.match(split,/aria-haspopup="menu"/);
  assert.match(split,/event.key==="ArrowDown"/);
  assert.match(split,/this\._arrow\.addEventListener\("pointerdown"/);
  assert.match(split,/if\(this\._menu\.open\)event\.stopPropagation\(\)/);
  assert.match(split,/notify\(this,"cu-action"/);
  assert.match(stepper,/role="list"/);
  assert.match(stepper,/aria-current","step"/);
  assert.match(stepper,/ArrowRight/);
  assert.match(stepper,/Home/);
  assert.match(stepper,/End/);
  assert.match(stepper,/button\.disabled=!this\._canVisit/);
  assert.match(info,/slot name="action"/);
  assert.match(info,/aria-label="Dismiss information"/);
  assert.match(info,/tone==="danger"\?"alert":"status"/);
  for(const src of [split,stepper,info]){
    assert.match(src,/focus-visible/);
    assert.match(src,/forced-colors:active/);
    assert.doesNotMatch(src,/innerHTML\s*=.*label/);
  }
});

test("new workflow components are wired through Web exports and React events",async()=>{
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  const types=await read("../packages/web/src/components/index.d.ts");
  const react=await read("../packages/react/src/components.js");
  for(const id of ["split-button","stepper","info-bar"]){
    assert.equal(pkg.exports["./components/"+id].default,
      "./dist/components/"+id+".js");
    assert.equal(pkg.exports["./components/"+id].types,"./dist/components/index.d.ts");
  }
  assert.equal(REACT_TAGS.SplitButton,"cu-split-button");
  assert.equal(REACT_TAGS.Stepper,"cu-stepper");
  assert.equal(REACT_TAGS.InfoBar,"cu-info-bar");
  assert.equal(REACT_EVENT_PROPS.onCuAction,"cu-action");
  assert.equal(Object.keys(REACT_TAGS).length,155);
  for(const name of ["CuSplitButton","CuStepper","CuInfoBar"])
    assert.ok(types.includes("class "+name+" extends HTMLElement"));
  const declared=react.match(/export const\s*\{([^}]+)\}\s*=\s*createReactComponents\(React\)/);
  assert.ok(declared,"React components must be exported by the component factory");
  const names=new Set(declared[1].split(",").map(name=>name.trim()));
  for(const name of ["SplitButton","Stepper","InfoBar"])
    assert.ok(names.has(name),"Missing React component export: "+name);
  const attrs={value:""};
  const calls={actions:0,steps:0};
  Object.defineProperty(attrs,"actions",{get(){return [];},set(){calls.actions++;}});
  Object.defineProperty(attrs,"steps",{get(){return [];},set(){calls.steps++;}});
  const actions=[{value:"save"}],steps=[{value:"draft"}];
  assignCuProperties(attrs,"cu-split-button",{actions});
  assignCuProperties(attrs,"cu-split-button",{actions});
  assignCuProperties(attrs,"cu-stepper",{steps});
  assignCuProperties(attrs,"cu-stepper",{steps});
  assert.equal(calls.actions,1);
  assert.equal(calls.steps,1);
});

test("Playground and catalog include three new experimental workflow components",async()=>{
  const [html,script,catalog]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../design-system/components/catalog.json")
  ]);
  for(const tag of ["cu-split-button","cu-stepper","cu-info-bar"])
    assert.ok(html.includes("<"+tag));
  for(const id of ["wc-split-button","wc-stepper","wc-info-bar","wc-stepper-next",
    "wc-info-restore","wc-split-result"])assert.ok(html.includes('id="'+id+'"'));
  assert.match(script,/wcSplit\.actions=/);
  assert.match(script,/wcStepper\.steps=/);
  assert.match(script,/wcInfo\.addEventListener\("cu-dismiss"/);
  const entries=JSON.parse(catalog).groups.flatMap(group=>group.components);
  for(const name of ["SplitButton","Stepper","InfoBar"])
    assert.equal(entries.find(item=>item.name===name)?.status,"preview");
  assert.equal(entries.length,144);
  assert.equal(entries.filter(item=>item.status==="preview").length,144);
  assert.equal(entries.filter(item=>item.status==="planned").length,0);
  assert.equal(entries.filter(item=>item.status==="ready").length,0);
});
