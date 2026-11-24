import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuSplitter,CuResizablePanel,CuDataFilter,CuFilterBar,
  clampSplitPosition,splitPositionFromPointer,
  DATA_FILTER_OPERATORS,buildFilterCondition,applyFilterBar
} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties}
  from "../packages/react/src/index.js";

const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("layout and filter components import without browser globals",()=>{
  for(const klass of [CuSplitter,CuResizablePanel,CuDataFilter,CuFilterBar])
    assert.equal(typeof klass,"function");
  assert.ok(CuSplitter.observedAttributes.includes("position"));
  assert.ok(CuResizablePanel.observedAttributes.includes("resizable"));
  assert.ok(CuDataFilter.observedAttributes.includes("operator"));
  assert.ok(CuFilterBar.observedAttributes.includes("query"));
});

test("Splitter clamps percent values and handles invalid bounds",()=>{
  assert.equal(clampSplitPosition(50),50);
  assert.equal(clampSplitPosition(0),10);
  assert.equal(clampSplitPosition(100),90);
  assert.equal(clampSplitPosition(85,25,75),75);
  assert.equal(clampSplitPosition(-20,25,75),25);
  assert.equal(clampSplitPosition("42",20,80),42);
  assert.equal(clampSplitPosition(NaN),50);
  assert.equal(clampSplitPosition(null),50);
  assert.equal(clampSplitPosition(90,60,40),60);
});

test("Splitter maps horizontal and vertical pointer positions",()=>{
  const rect={left:100,top:200,width:400,height:250};
  assert.equal(splitPositionFromPointer(260,220,rect),40);
  assert.equal(splitPositionFromPointer(100,300,rect),10);
  assert.equal(splitPositionFromPointer(500,300,rect),90);
  assert.equal(splitPositionFromPointer(180,325,rect,"vertical"),50);
  assert.equal(splitPositionFromPointer(180,225,rect,"vertical",20,80),20);
  assert.equal(splitPositionFromPointer(0,0,{left:0,top:0,width:0,height:0}),50);
});

test("Splitter updates position and notifies only on actual changes",()=>{
  const splitter=Object.create(CuSplitter.prototype);
  const attrs=new Map([["min","20"],["max","80"],["position","40"]]);
  const events=[];
  splitter.getAttribute=k=>attrs.get(k)??null;
  splitter.hasAttribute=k=>attrs.has(k);
  splitter.setAttribute=(k,v)=>{attrs.set(k,String(v));};
  splitter.dispatchEvent=e=>{events.push(e);return true;};
  assert.equal(splitter.position,40);
  assert.equal(splitter._updatePosition(40,"cu-input"),false);
  assert.equal(splitter._updatePosition(88,"cu-change"),true);
  assert.equal(splitter.position,80);
  assert.deepEqual(events[0].detail,{position:80});
  assert.equal(splitter._updatePosition(100,"cu-change"),false);
  splitter.position=12;
  assert.equal(splitter.position,20);
  assert.equal(events.length,1);
});

test("Splitter exposes accessible range and orientation at sync",()=>{
  const splitter=Object.create(CuSplitter.prototype);
  const attrs=new Map([["position","40"],["min","20"],["max","80"],["label","Workspace"]]);
  const aria=new Map(),css=new Map();
  splitter.getAttribute=k=>attrs.get(k)??null;
  splitter.hasAttribute=k=>attrs.has(k);
  splitter.style={setProperty:(k,v)=>css.set(k,v)};
  splitter._handle={
    tabIndex:-1,
    setAttribute:(k,v)=>aria.set(k,v)
  };
  splitter._sync();
  assert.equal(css.get("--cu-split-position"),"40%");
  assert.equal(aria.get("aria-valuenow"),"40");
  assert.equal(aria.get("aria-valuemin"),"20");
  assert.equal(aria.get("aria-valuemax"),"80");
  assert.equal(aria.get("aria-orientation"),"vertical");
  assert.equal(aria.get("aria-label"),"Workspace");
  assert.equal(splitter._handle.tabIndex,0);
  attrs.set("orientation","vertical");
  attrs.set("disabled","");
  splitter._sync();
  assert.equal(aria.get("aria-orientation"),"horizontal");
  assert.equal(aria.get("aria-disabled"),"true");
  assert.equal(splitter._handle.tabIndex,-1);
});

test("DataFilter validates conditions and blank-state operators",()=>{
  assert.ok(DATA_FILTER_OPERATORS.includes("contains"));
  assert.ok(DATA_FILTER_OPERATORS.includes("is-blank"));
  assert.equal(buildFilterCondition("","contains","ABC"),null);
  assert.equal(buildFilterCondition("status","unknown","Active"),null);
  assert.equal(buildFilterCondition("status","contains",""),null);
  assert.deepEqual(buildFilterCondition("status","equals","Active"),
    {field:"status",operator:"equals",value:"Active"});
  assert.deepEqual(buildFilterCondition("age","greater-than",20),
    {field:"age",operator:"greater-than",value:"20"});
  assert.deepEqual(buildFilterCondition("owner","is-blank","ignored"),
    {field:"owner",operator:"is-blank",value:""});
});

test("DataFilter respects disabled state and clears only active conditions",()=>{
  const filter=Object.create(CuDataFilter.prototype),events=[];
  const attrs=new Map([["field","status"],["operator","contains"],["value","Active"]]);
  filter.getAttribute=k=>attrs.get(k)??null;
  filter.hasAttribute=k=>attrs.has(k);
  filter.setAttribute=(k,v)=>attrs.set(k,String(v));
  filter.toggleAttribute=(k,on)=>on?attrs.set(k,""):attrs.delete(k);
  filter.dispatchEvent=e=>{events.push(e);return true;};
  filter._sync=()=>{};
  assert.equal(filter.active,true);
  assert.equal(filter.condition.field,"status");
  assert.equal(filter.clear(),true);
  assert.equal(filter.active,false);
  assert.equal(filter.value,"");
  assert.equal(filter.operator,"contains");
  assert.equal(events.length,1);
  assert.equal(events[0].type,"cu-change");
  assert.equal(events[0].detail.active,false);
  assert.equal(filter.clear(),false);
  assert.equal(events.length,1);
  filter.value="Review";
  filter.disabled=true;
  assert.equal(filter.active,false);
  assert.equal(filter.condition,null);
});

test("DataFilter sync hides comparison input for blank operators",()=>{
  const filter=Object.create(CuDataFilter.prototype);
  const attrs=new Map([
    ["field","owner"],["operator","is-blank"],["label","Project owner"]
  ]);
  filter.getAttribute=k=>attrs.get(k)??null;
  filter.hasAttribute=k=>attrs.has(k);
  filter._label={textContent:""};
  filter._select={value:"",disabled:false};
  filter._input={value:"",hidden:false,disabled:false,
    setAttribute(k,v){this[k]=v;}};
  filter._clear={hidden:true,disabled:false};
  filter._sync();
  assert.equal(filter._label.textContent,"Project owner");
  assert.equal(filter._input.hidden,true);
  assert.equal(filter._clear.hidden,false);
  assert.equal(filter._select.value,"is-blank");
  assert.equal(filter._input["aria-label"],"Filter Project owner");
  attrs.set("disabled","");
  filter._sync();
  assert.equal(filter._input.disabled,true);
  assert.equal(filter._select.disabled,true);
  assert.equal(filter._clear.disabled,true);
});

test("applyFilterBar combines structured conditions and keyword search",()=>{
  const rows=[
    {id:"1",name:"ComponentUI",owner:"Dương",status:"Active",count:20},
    {id:"2",name:"NovaBrowser",owner:"Dương",status:"Draft",count:5},
    {id:"3",name:"Storage",owner:"Ops",status:"Active",count:15},
    {id:"4",name:"Docs",owner:"Ops",status:"Review",count:10}
  ];
  assert.equal(applyFilterBar(rows).length,4);
  assert.deepEqual(applyFilterBar(rows,"dương",{},["owner"]).map(x=>x.id),["1","2"]);
  assert.deepEqual(applyFilterBar(rows,"component",{},["name"]).map(x=>x.id),["1"]);
  assert.deepEqual(applyFilterBar(rows,"",{
    status:{operator:"equals",value:"Active"}
  }).map(x=>x.id),["1","3"]);
  assert.deepEqual(applyFilterBar(rows,"dương",{
    status:{operator:"equals",value:"Active"}
  },["owner"]).map(x=>x.id),["1"]);
  assert.deepEqual(applyFilterBar(rows,"",{
    count:{operator:"greater-than",value:"10"}
  }).map(x=>x.id),["1","3"]);
  assert.deepEqual(applyFilterBar(null).length,0);
});

test("FilterBar aggregates child conditions and clears in a single event",()=>{
  const bar=Object.create(CuFilterBar.prototype),events=[];
  const attrs=new Map([["query","  ui "]]);
  bar.getAttribute=k=>attrs.get(k)??null;
  bar.setAttribute=(k,v)=>attrs.set(k,String(v));
  bar.dispatchEvent=e=>{events.push(e);return true;};
  bar._sync=()=>{};
  const child=(field,condition)=>({localName:"cu-data-filter",
    condition,clear(emit){assert.equal(emit,false);this.condition=null;}});
  bar.children=[
    child("status",{field:"status",operator:"equals",value:"Active"}),
    child("owner",null),
    {localName:"div"}
  ];
  assert.equal(bar.activeCount,2);
  assert.deepEqual({...bar.conditions},{
    status:{operator:"equals",value:"Active"}
  });
  assert.equal(bar.clear(),true);
  assert.equal(bar.query,"");
  assert.equal(bar.activeCount,0);
  assert.equal(events.length,1);
  assert.equal(events[0].type,"cu-filter-change");
  assert.deepEqual({...events[0].detail.conditions},{});
  assert.equal(events[0].detail.activeCount,0);
  assert.equal(bar.clear(),false);
  assert.equal(events.length,1);
});

test("FilterBar refreshes clear action after programmatic filter updates",()=>{
  const bar=Object.create(CuFilterBar.prototype);
  const attrs=new Map();
  bar.getAttribute=k=>attrs.get(k)??null;
  bar.setAttribute=(k,v)=>attrs.set(k,String(v));
  bar._search={
    value:"",placeholder:"",
    setAttribute(k,v){this[k]=v;}
  };
  bar._clear={disabled:true};
  const child={localName:"cu-data-filter",condition:null};
  bar.children=[child];
  bar.refresh();
  assert.equal(bar._clear.disabled,true);
  child.condition={field:"status",operator:"equals",value:"Active"};
  bar.refresh();
  assert.equal(bar._clear.disabled,false);
  assert.equal(bar.activeCount,1);
  child.condition=null;
  bar.query="ui";
  bar.refresh();
  assert.equal(bar._search.value,"ui");
  assert.equal(bar._clear.disabled,false);
  bar.query="";
  bar.refresh();
  assert.equal(bar._clear.disabled,true);
});

test("components declare accessible keyboard, input and focus patterns",async()=>{
  const [split,panel,filter,bar]=await Promise.all(
    ["splitter","resizable-panel","data-filter","filter-bar"].map(n=>
      read("../packages/web/src/components/"+n+".js")));
  assert.match(split,/role="separator"/);
  assert.match(split,/aria-valuenow/);
  assert.match(split,/setPointerCapture/);
  assert.match(split,/pointercancel/);
  assert.match(split,/ArrowRight/);
  assert.match(split,/ArrowDown/);
  assert.match(split,/prefers-reduced-motion:reduce/);
  assert.match(panel,/ResizeObserver/);
  assert.match(panel,/cu-resize/);
  assert.match(filter,/cu-select class="operator"/);
  assert.match(filter,/aria-label="Filter value"/);
  assert.match(filter,/stopPropagation/);
  assert.match(bar,/role="search"/);
  assert.match(bar,/cu-filter-change/);
  assert.match(bar,/MutationObserver/);
  assert.match(bar,/this\.refresh\(\)/);
  assert.match(bar,/input.*type="search"/);
  for(const src of [split,filter,bar])assert.match(src,/focus-visible/);
  for(const src of [split,panel,filter,bar])assert.match(src,/forced-colors:active/);
});

test("React adapter and Web package expose four new components",async()=>{
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  const types=await read("../packages/web/src/components/index.d.ts");
  const web=await read("../packages/web/src/components/index.js");
  const react=await read("../packages/react/src/components.js");
  for(const n of ["splitter","resizable-panel","filter-bar","data-filter"]){
    assert.equal(pkg.exports["./components/"+n].default,
      "./dist/components/"+n+".js");
    assert.equal(pkg.exports["./components/"+n].types,
      "./dist/components/index.d.ts");
    assert.ok(web.includes("./"+n+".js"));
  }
  for(const [name,tag] of Object.entries({
    Splitter:"cu-splitter",ResizablePanel:"cu-resizable-panel",
    FilterBar:"cu-filter-bar",DataFilter:"cu-data-filter"
  })){
    assert.equal(REACT_TAGS[name],tag);
    assert.ok(types.includes("class Cu"+name+" extends HTMLElement"));
    assert.ok(react.includes(name));
  }
  assert.equal(Object.keys(REACT_TAGS).length,64);
  assert.equal(REACT_EVENT_PROPS.onCuResize,"cu-resize");
  assert.equal(REACT_EVENT_PROPS.onCuFilterChange,"cu-filter-change");
  const split={position:50,min:10,max:90,disabled:false};
  assignCuProperties(split,"cu-splitter",{position:35,min:20,max:80,disabled:true});
  assert.deepEqual(split,{position:35,min:20,max:80,disabled:true});
  const filter={query:""};
  assignCuProperties(filter,"cu-filter-bar",{query:"active"});
  assert.equal(filter.query,"active");
});

test("Playground and catalog implement four new experimental components",async()=>{
  const [html,js,json,root]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../design-system/components/catalog.json"),
    read("../package.json")
  ]);
  for(const tag of ["cu-splitter","cu-resizable-panel","cu-filter-bar","cu-data-filter"])
    assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-splitter","wc-splitter-reset","wc-filter-bar","wc-filter-active",
    "wc-resizable-standalone","wc-filter-result"])
    assert.ok(html.includes('id="'+id+'"'));
  assert.match(js,/applyFilterBar\(previewProjects/);
  assert.match(js,/workspaceSplitter\.addEventListener\("cu-change"/);
  assert.match(js,/projectFilters\.addEventListener\("cu-filter-change"/);
  const records=JSON.parse(json).groups.flatMap(g=>g.components);
  for(const n of ["Splitter","ResizablePanel","FilterBar","DataFilter"])
    assert.equal(records.find(c=>c.name===n)?.status,"preview");
  assert.equal(records.length,129);
  assert.equal(records.filter(c=>c.status==="preview").length,54);
  assert.equal(records.filter(c=>c.status==="planned").length,75);
  assert.equal(records.filter(c=>c.status==="ready").length,0);
  const syntax=JSON.parse(root).scripts["syntax:check"];
  for(const n of ["splitter","resizable-panel","filter-bar","data-filter"])
    assert.ok(syntax.includes("components/"+n+".js"));
});
