import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuSplitView,CuVirtualList,CuDataTable,
  virtualListRange,virtualListLabel,
  applyFilterBar,filterTableRows
} from "../packages/web/src/components/index.js";
import { REACT_TAGS,assignCuProperties } from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("SplitView and VirtualList are import-safe native Custom Elements",()=>{
  assert.equal(typeof CuSplitView,"function");
  assert.equal(typeof CuVirtualList,"function");
  assert.ok(CuSplitView.observedAttributes.includes("collapsed"));
  assert.ok(CuVirtualList.observedAttributes.includes("item-height"));
  assert.equal(REACT_TAGS.SplitView,"cu-split-view");
  assert.equal(REACT_TAGS.VirtualList,"cu-virtual-list");
  assert.equal(Object.keys(REACT_TAGS).length,147);
});

test("VirtualList range bounds large datasets to a small DOM window",()=>{
  assert.deepEqual(virtualListRange(0,100,10000,20,2),
    {start:0,end:7,top:0,bottom:199860,totalHeight:200000});
  assert.deepEqual(virtualListRange(1000,100,10000,20,2),
    {start:48,end:57,top:960,bottom:198860,totalHeight:200000});
  const tail=virtualListRange(199900,100,10000,20,2);
  assert.equal(tail.end,10000);
  assert.ok(tail.end-tail.start<=8);
  assert.deepEqual(virtualListRange(0,100,0,40,4),
    {start:0,end:0,top:0,bottom:0,totalHeight:0});
  assert.equal(virtualListRange(-10,0,2,40,0).start,0);
});

test("VirtualList renders bounded accessible DOM for 10,000 items",()=>{
  const prior=globalThis.document;
  try{
    globalThis.document={
      createDocumentFragment:()=>({children:[],append(n){this.children.push(n);}}),
      createElement:()=>({
        dataset:{},style:{},setAttribute(k,v){this[k]=v;}
      })
    };
    const list=Object.create(CuVirtualList.prototype);
    list._items=Array.from({length:10000},(_,i)=>({label:"Row "+(i+1)}));
    list._selected=1000;
    list._idBase="test-virtual";
    list._lastRange=null;
    list.getAttribute=k=>({overscan:"5","item-height":"40"}[k]??null);
    list.hasAttribute=k=>k==="overscan"||k==="item-height";
    list._viewport={scrollTop:40000,clientHeight:200,
      setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}};
    list._top={style:{}};list._bottom={style:{}};list._empty={hidden:true};
    list._itemsRoot={replaceChildren(fragment){this.rows=[...fragment.children];}};
    list._render();
    assert.equal(list._itemsRoot.rows.length,15);
    assert.equal(list._itemsRoot.rows[0].dataset.index,"995");
    assert.equal(list._itemsRoot.rows[0]["aria-posinset"],"996");
    assert.equal(list._itemsRoot.rows[0]["aria-setsize"],"10000");
    assert.equal(list._viewport["aria-activedescendant"],"test-virtual-1000");
    assert.equal(list._top.style.height,"39800px");
    assert.equal(list._bottom.style.height,"359600px");
    const snapshot=list._itemsRoot.rows;
    list._render();
    assert.equal(list._itemsRoot.rows,snapshot);
  }finally{
    if(prior===undefined)delete globalThis.document;
    else globalThis.document=prior;
  }
});

test("VirtualList labels safely handle values, fallback and custom label keys",()=>{
  assert.equal(virtualListLabel("hello",0),"hello");
  assert.equal(virtualListLabel(42,1),"42");
  assert.equal(virtualListLabel({title:"File"},2,"title"),"File");
  assert.equal(virtualListLabel({label:"Fallback"},3,"title"),"Fallback");
  assert.equal(virtualListLabel(null,4),"Item 5");
  assert.equal(virtualListLabel({},0),"Item 1");
});

test("VirtualList selection scrolls and emits one semantic change event",()=>{
  const list=Object.create(CuVirtualList.prototype);
  list._items=[{label:"One"},{label:"Two",disabled:true},{label:"Three"}];
  list._selected=-1;
  const events=[];
  list.getAttribute=k=>k==="item-height"?"40":null;
  list.hasAttribute=k=>k==="item-height";
  list._viewport={clientHeight:40,scrollTop:0};
  list._render=()=>{};
  list.dispatchEvent=e=>{events.push(e);return true;};
  assert.equal(list.select(1),false);
  assert.equal(list.select(2),true);
  assert.equal(list.selectedIndex,2);
  assert.equal(list._viewport.scrollTop,80);
  assert.equal(events.length,1);
  assert.deepEqual(events[0].detail,
    {index:2,previousIndex:-1,item:{label:"Three"},value:"Three"});
  assert.equal(list.select(2),false);
  assert.equal(list.select(2,{force:true}),true);
  assert.equal(events.length,2);
  list.selectedIndex=0;
  assert.equal(list.selectedIndex,0);
  assert.equal(events.length,2);
  assert.equal(list.scrollToIndex(99),false);
});

test("SplitView collapse, expand and toggle retain expanded position",()=>{
  const view=Object.create(CuSplitView.prototype);
  const attrs=new Map([["position","35"],["collapsible",""]]),events=[];
  view.hasAttribute=k=>attrs.has(k);
  view.getAttribute=k=>attrs.get(k)??null;
  view.toggleAttribute=(k,on)=>on?attrs.set(k,""):attrs.delete(k);
  view.setAttribute=(k,v)=>attrs.set(k,String(v));
  view.dispatchEvent=e=>{events.push(e);return true;};
  view._sync=()=>{};
  assert.equal(view.collapsed,false);
  assert.equal(view.collapse(),true);
  assert.equal(view.collapsed,true);
  assert.equal(view.position,35);
  assert.equal(view.collapse(),false);
  assert.equal(view.expand(),true);
  assert.equal(view.collapsed,false);
  assert.equal(view.position,35);
  assert.equal(view.toggle(),true);
  assert.deepEqual(events.map(e=>e.type),["cu-toggle","cu-toggle","cu-toggle"]);
  assert.deepEqual(events[0].detail,{collapsed:true,position:35});
  assert.equal(events.length,3);
});

test("SplitView ignores nested child controls and only relays own splitter events",()=>{
  const view=Object.create(CuSplitView.prototype);
  const attrs=new Map([["position","30"]]),out=[];
  view._splitter={};
  view.hasAttribute=k=>attrs.has(k);
  view.getAttribute=k=>attrs.get(k)??null;
  view.setAttribute=(k,v)=>attrs.set(k,String(v));
  view.dispatchEvent=e=>{out.push(e);return true;};
  view._sync=()=>{};
  let stopped=0;
  const nested={type:"cu-change",target:{},detail:{value:"other"},
    stopPropagation(){stopped++;}};
  view._handleSplitEvent(nested);
  assert.equal(stopped,0);
  assert.equal(out.length,0);
  assert.equal(view.position,30);
  const fromSplitter={type:"cu-change",target:view._splitter,
    detail:{position:45},stopPropagation(){stopped++;}};
  view._handleSplitEvent(fromSplitter);
  assert.equal(stopped,1);
  assert.equal(view.position,45);
  assert.equal(out.length,1);
  assert.deepEqual(out[0].detail,{position:45,collapsed:false});
});

test("SplitView position respects the configured min/max bounds",()=>{
  const view=Object.create(CuSplitView.prototype);
  const attrs=new Map([["min","20"],["max","75"],["position","35"]]);
  view.hasAttribute=k=>attrs.has(k);
  view.getAttribute=k=>attrs.get(k)??null;
  view.setAttribute=(k,v)=>attrs.set(k,String(v));
  view._sync=()=>{};
  view.position=110;
  assert.equal(view.position,75);
  assert.equal(attrs.get("position"),"75");
  view.position=-20;
  assert.equal(view.position,20);
  assert.equal(attrs.get("position"),"20");
  attrs.set("position","invalid");
  assert.equal(view.position,50);
  attrs.delete("position");
  assert.equal(view.position,32);
});

test("SplitView configures inner splitter and excludes collapsed sidebar focus",()=>{
  const view=Object.create(CuSplitView.prototype);
  const attrs=new Map([["position","34"],["collapsible",""],["collapsed",""],["label","Workspace"]]);
  view.hasAttribute=k=>attrs.has(k);
  view.getAttribute=k=>attrs.get(k)??null;
  view._splitter={
    min:15,max:85,disabled:false,position:34,
    setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}
  };
  view._sidebar={inert:false};
  view._toolbar={hidden:true};
  const aria=new Map();
  view._toggle={disabled:false,setAttribute:(k,v)=>aria.set(k,v)};
  view._toggleLabel={textContent:""};
  view._sync();
  assert.equal(view._splitter.min,0);
  assert.equal(view._splitter.position,0);
  assert.equal(view._splitter.disabled,true);
  assert.equal(view._sidebar.inert,true);
  assert.equal(view._toolbar.hidden,false);
  assert.equal(aria.get("aria-expanded"),"false");
  assert.equal(view._toggleLabel.textContent,"Show sidebar");
  attrs.delete("collapsed");
  view._sync();
  assert.equal(view._splitter.position,34);
  assert.equal(view._sidebar.inert,false);
  assert.equal(aria.get("aria-expanded"),"true");
});

test("Filter helper imports remain independent from DataTable UI graph",async()=>{
  const [helper,bar,table]=await Promise.all([
    read("../packages/web/src/components/filter-utils.js"),
    read("../packages/web/src/components/filter-bar.js"),
    read("../packages/web/src/components/data-table.js")
  ]);
  assert.doesNotMatch(helper,/from ".\/data-table\.js"/);
  assert.doesNotMatch(helper,/\.\/context-menu/);
  assert.doesNotMatch(bar,/from ".\/data-table\.js"/);
  assert.match(bar,/from ".\/filter-utils\.js"/);
  assert.match(table,/from ".\/filter-utils\.js"/);
  assert.match(table,/export \{ .*filterTableRows/);
  assert.deepEqual(filterTableRows([
    {status:"Active"},{status:"Draft"}
  ],{status:{operator:"equals",value:"Active"}}),[{status:"Active"}]);
  assert.equal(applyFilterBar([{name:"Demo"}],"dem").length,1);
});

test("DataTable and FilterBar combine existing column and external filters",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._rows=[
    {id:"1",name:"ComponentUI",owner:"Ada",status:"Active"},
    {id:"2",name:"NovaBrowser",owner:"Ada",status:"Draft"},
    {id:"3",name:"Storage",owner:"Lin",status:"Active"},
    {id:"4",name:"API",owner:"Ada",status:"Active"}
  ];
  table._columnFilters=new Map([["status",{operator:"equals",value:"Active"}]]);
  table._page=3;
  let renders=0,notifies=0;
  table._render=()=>{renders++;};
  table._notifyFilterChange=()=>{notifies++;};
  const listeners=new Map();
  const bar={
    query:"ada",conditions:{owner:{operator:"equals",value:"Ada"}},
    addEventListener:(name,fn)=>listeners.set(name,fn),
    removeEventListener:(name,fn)=>{
      if(listeners.get(name)===fn)listeners.delete(name);
    }
  };
  const cleanup=table.bindFilterBar(bar,{searchKeys:["name","owner"]});
  assert.equal(table.page,1);
  assert.deepEqual(table.filteredRows.map(x=>x.id),["1","4"]);
  assert.deepEqual(table.externalFilterState,{
    query:"ada",conditions:{owner:{operator:"equals",value:"Ada"}}
  });
  bar.query="component";
  bar.conditions={};
  listeners.get("cu-filter-change")();
  assert.deepEqual(table.filteredRows.map(x=>x.id),["1"]);
  assert.equal(table._page,1);
  assert.equal(renders,2);
  assert.equal(notifies,2);
  cleanup();
  assert.equal(listeners.size,0);
  assert.deepEqual(table.filteredRows.map(x=>x.id),["1","3","4"]);
  assert.deepEqual(table.externalFilterState,{query:"",conditions:{}});
  assert.equal(renders,3);
  assert.equal(notifies,3);
});

test("DataTable cu-filter-change reports combined filtered count and external state",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._rows=[
    {id:1,name:"ComponentUI",owner:"Ada",status:"Active"},
    {id:2,name:"Other",owner:"Lin",status:"Active"},
    {id:3,name:"Draft",owner:"Ada",status:"Draft"}
  ];
  table._columnFilters=new Map([["status",{operator:"equals",value:"Active"}]]);
  table._externalQuery="ada";
  table._externalConditions={owner:{operator:"equals",value:"Ada"}};
  table._externalSearchKeys=["owner"];
  const emitted=[];
  table.dispatchEvent=e=>{emitted.push(e);return true;};
  table._notifyFilterChange();
  assert.equal(emitted.length,1);
  assert.equal(emitted[0].type,"cu-filter-change");
  assert.deepEqual(emitted[0].detail,{
    filters:{status:{operator:"equals",value:"Active"}},
    query:"ada",
    externalFilters:{owner:{operator:"equals",value:"Ada"}},
    filteredCount:1,totalCount:3
  });
});

test("DataTable bindFilterBar rejects non-event targets",()=>{
  const table=Object.create(CuDataTable.prototype);
  assert.throws(()=>table.bindFilterBar(null),TypeError);
  assert.throws(()=>table.bindFilterBar({addEventListener(){}}),TypeError);
  table.unbindFilterBar();
});

test("React property bridge preserves stable VirtualList item arrays",()=>{
  let writes=0;
  const el={};
  Object.defineProperty(el,"items",{
    get(){return null;},
    set(){writes++;}
  });
  const items=[{id:1,label:"Record"}];
  assignCuProperties(el,"cu-virtual-list",{items});
  assignCuProperties(el,"cu-virtual-list",{items});
  assert.equal(writes,1);
  assignCuProperties(el,"cu-virtual-list",{items:[...items]});
  assert.equal(writes,2);
});

test("Playground, manifests, types and catalog include the two preview components",async()=>{
  const [html,js,pkg,types,react,root,json]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../packages/web/package.json"),
    read("../packages/web/src/components/index.d.ts"),
    read("../packages/react/src/components.js"),
    read("../package.json"),
    read("../design-system/components/catalog.json")
  ]);
  const manifest=JSON.parse(pkg);
  for(const name of ["split-view","virtual-list","filter-utils"])
    assert.equal(manifest.exports["./components/"+name].default,
      "./dist/components/"+name+".js");
  for(const tag of ["cu-split-view","cu-virtual-list"])
    assert.ok(html.includes("<"+tag),tag);
  for(const key of ["wc-split-view","wc-virtual-list","wc-virtual-jump"])
    assert.ok(html.includes('id="'+key+'"'),key);
  assert.match(js,/wcTable\.bindFilterBar\(projectFilters/);
  assert.match(js,/largeList\.items=Array\.from\(\{length:10000\}/);
  assert.match(types,/class CuSplitView extends HTMLElement/);
  assert.match(types,/class CuVirtualList extends HTMLElement/);
  assert.match(types,/bindFilterBar\(bar:CuFilterBar/);
  assert.match(react,/SplitView, VirtualList/);
  assert.equal(JSON.parse(root).scripts["syntax:check"], "node scripts/check-syntax.mjs");
  const catalog=JSON.parse(json).groups.flatMap(group=>group.components);
  for(const name of ["SplitView","VirtualList"])
    assert.equal(catalog.find(item=>item.name===name)?.status,"preview");
  assert.equal(catalog.length,136);
  assert.equal(catalog.filter(item=>item.status==="preview").length,136);
  assert.equal(catalog.filter(item=>item.status==="planned").length,0);
});
