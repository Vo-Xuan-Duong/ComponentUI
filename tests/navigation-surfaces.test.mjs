import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuDisclosure,CuAccordion,CuAccordionItem,CuPagination,CuDrawer,
  accordionValues,normalizePagination,paginationItems
} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("navigation surfaces import safely without browser globals",()=>{
  for(const Component of [CuDisclosure,CuAccordion,CuAccordionItem,CuPagination,CuDrawer])
    assert.equal(typeof Component,"function");
  assert.ok(CuAccordionItem.prototype instanceof CuDisclosure);
  assert.ok(CuDisclosure.observedAttributes.includes("open"));
  assert.ok(CuAccordion.observedAttributes.includes("multiple"));
  assert.ok(CuPagination.observedAttributes.includes("page"));
  assert.ok(CuDrawer.observedAttributes.includes("dismissible"));
});

test("Disclosure toggles and emits only on user action; disabled guard works",()=>{
  const disclosure=Object.create(CuDisclosure.prototype);
  const attrs=new Map([["value","advanced"]]);
  const events=[];
  disclosure.getAttribute=k=>attrs.get(k)??null;
  disclosure.hasAttribute=k=>attrs.has(k);
  disclosure.toggleAttribute=(k,enabled)=>{
    if(enabled)attrs.set(k,"");else attrs.delete(k);
  };
  disclosure.dispatchEvent=e=>{events.push(e);return true;};
  disclosure._sync=()=>{};
  assert.equal(disclosure.open,false);
  assert.equal(disclosure.toggle(),true);
  assert.equal(disclosure.open,true);
  assert.deepEqual(events.map(e=>e.type),["cu-toggle"]);
  assert.deepEqual(events[0].detail,{open:true,value:"advanced"});
  disclosure.hide();
  assert.equal(disclosure.open,false);
  assert.equal(events.length,1);
  disclosure.disabled=true;
  assert.equal(disclosure.toggle(),false);
  assert.equal(disclosure.show(),false);
  assert.equal(disclosure.open,false);
});

test("Accordion manages single- and multi-open items without dispatching setter changes",()=>{
  const accordion=Object.create(CuAccordion.prototype);
  const attrs=new Set();
  const events=[];
  accordion.hasAttribute=k=>attrs.has(k);
  accordion.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  accordion.children=[
    {localName:"cu-accordion-item",value:"first",open:true,disabled:false},
    {localName:"cu-accordion-item",value:"second",open:false,disabled:false},
    {localName:"cu-accordion-item",value:"third",open:false,disabled:true}
  ];
  accordion.dispatchEvent=e=>{events.push(e);return true;};
  assert.deepEqual(accordionValues(accordion.children),["first"]);
  accordion.value="second";
  assert.equal(accordion.value,"second");
  assert.deepEqual(accordion.values,["second"]);
  accordion.values=["first","second","third"];
  assert.deepEqual(accordion.values,["first"]);
  accordion.multiple=true;
  accordion.values=["first","second","third"];
  assert.deepEqual(accordion.values,["first","second"]);
  assert.deepEqual(accordionValues(accordion.children,true),["first","second"]);
  const values=accordion.values;values.push("third");
  assert.deepEqual(accordion.values,["first","second"]);
  assert.equal(events.length,0);
});

test("Accordion reacts to child user toggles and closes siblings in single mode",()=>{
  const accordion=Object.create(CuAccordion.prototype);
  accordion.children=[
    {localName:"cu-accordion-item",value:"first",open:true,disabled:false},
    {localName:"cu-accordion-item",value:"second",open:true,disabled:false},
    {localName:"cu-accordion-item",value:"third",open:false,disabled:false}
  ];
  const events=[];
  accordion.hasAttribute=()=>false; // default single mode
  accordion.dispatchEvent=e=>{events.push(e);return true;};
  let stopped=false;
  accordion._handleToggle({target:accordion.children[1],
    stopPropagation(){stopped=true;}});
  assert.equal(stopped,true);
  assert.deepEqual(accordion.values,["second"]);
  assert.equal(accordion.children[0].open,false);
  assert.equal(events.length,1);
  assert.equal(events[0].type,"cu-change");
  assert.deepEqual(events[0].detail,
    {value:"second",values:["second"],changedValue:"second",open:true});
});

test("Pagination clamps out-of-bounds and empty records",()=>{
  assert.deepEqual(normalizePagination(9,0,10),
    {page:1,pageCount:1,total:0,pageSize:10,start:0,end:0});
  assert.deepEqual(normalizePagination(20,101,10),
    {page:11,pageCount:11,total:101,pageSize:10,start:101,end:101});
  assert.deepEqual(normalizePagination(-5,25,10),
    {page:1,pageCount:3,total:25,pageSize:10,start:1,end:10});
  assert.deepEqual(normalizePagination(2,25,0),
    {page:2,pageCount:3,total:25,pageSize:10,start:11,end:20});
  assert.deepEqual(normalizePagination("garbage",null,NaN),
    {page:1,pageCount:1,total:0,pageSize:10,start:0,end:0});
  assert.deepEqual(normalizePagination(2.5,21,5),
    {page:2,pageCount:5,total:21,pageSize:5,start:6,end:10});
});

test("Pagination generates no duplicate pages or isolated ellipses",()=>{
  assert.deepEqual(paginationItems(5,10,1),
    [1,"ellipsis",4,5,6,"ellipsis",10]);
  assert.deepEqual(paginationItems(1,1,1),[1]);
  assert.deepEqual(paginationItems(4,7,1),[1,2,3,4,5,6,7]);
  assert.deepEqual(paginationItems(2,4,1),[1,2,3,4]);
  const items=paginationItems(42,100,0);
  assert.deepEqual(items,[1,"ellipsis",42,"ellipsis",100]);
});

test("Pagination goTo, next and previous emit only for valid user transitions",()=>{
  const pager=Object.create(CuPagination.prototype);
  const attrs=new Map([["page","1"],["page-size","10"],["total","24"]]);
  const events=[];
  pager.getAttribute=k=>attrs.get(k)??null;
  pager.setAttribute=(k,v)=>{attrs.set(k,String(v));};
  pager.dispatchEvent=e=>{events.push(e);return true;};
  pager._render=()=>{};
  assert.equal(pager.next(),true);
  assert.equal(pager.page,2);
  assert.equal(pager.goTo(999),false);
  assert.equal(pager.goTo(2.5),false);
  assert.equal(pager.goTo(2),false);
  assert.equal(pager.next(),true);
  assert.equal(pager.page,3);
  assert.equal(pager.next(),false);
  assert.equal(pager.previous(),true);
  assert.equal(pager.page,2);
  assert.equal(events.length,3);
  assert.deepEqual(events[0].detail,
    {page:2,pageCount:3,total:24,pageSize:10,start:11,end:20});
  pager.total=0;
  assert.equal(pager.page,1);
  assert.equal(pager.goTo(1),false);
  assert.equal(events.length,3);
});

test("Drawer controls modal lifecycle and dismissible state",()=>{
  const drawer=Object.create(CuDrawer.prototype);
  const attrs=new Map([["title","Example"],["dismissible",""]]);
  const events=[];
  drawer.hasAttribute=k=>attrs.has(k);
  drawer.getAttribute=k=>attrs.get(k)??null;
  drawer.toggleAttribute=(k,v)=>{if(v)attrs.set(k,"");else attrs.delete(k);drawer.attributeChangedCallback();};
  drawer.removeAttribute=k=>attrs.delete(k);
  drawer.dispatchEvent=e=>{events.push(e);return true;};
  drawer._dialog={open:false,returnValue:"",
    showModal(){this.open=true;},close(v=""){this.open=false;this.returnValue=v;}};
  drawer._title={textContent:""};drawer._close={hidden:false};
  drawer._footer={hidden:false};
  drawer._actions={assignedElements:()=>[]};
  drawer.isConnected=true;
  drawer.show();
  assert.equal(drawer.open,true);
  assert.equal(drawer._dialog.open,true);
  assert.equal(drawer._title.textContent,"Example");
  assert.equal(drawer._footer.hidden,true);
  assert.equal(drawer._close.hidden,false);
  assert.equal(events[0].type,"cu-open");
  drawer.close("saved");
  assert.equal(drawer._dialog.open,false);
  assert.equal(drawer._dialog.returnValue,"saved");
  drawer.open=false;
  assert.equal(drawer.open,false);
  assert.equal(events.length,1); // Native dialog close event issues cu-close
  drawer.show();
  assert.equal(drawer._dialog.returnValue,""); // No stale saved status on reopen
  assert.equal(events.length,2);
  drawer.close();
  drawer.open=false;
  drawer.dismissible=false;
  assert.equal(drawer._close.hidden,true);
});

test("Navigation surfaces use accessible controls, native modal, and safe text",async()=>{
  const [disclosure,accordion,pagination,drawer]=await Promise.all(
    ["disclosure","accordion","pagination","drawer"]
      .map(name=>read("../packages/web/src/components/"+name+".js")));
  assert.match(disclosure,/aria-expanded="false"/);
  assert.match(disclosure,/aria-controls/);
  assert.match(disclosure,/part="panel" hidden/);
  assert.match(disclosure,/notify\(this,"cu-toggle"/);
  assert.match(accordion,/cu-accordion-item/);
  assert.match(accordion,/MutationObserver/);
  assert.match(accordion,/notify\(this,"cu-change"/);
  assert.match(pagination,/aria-current","page"/);
  assert.match(pagination,/aria-label="Previous page"/);
  assert.match(pagination,/aria-label="Next page"/);
  assert.match(pagination,/data-page/);
  assert.match(drawer,/<dialog part="dialog"/);
  assert.match(drawer,/showModal\(\)/);
  assert.match(drawer,/aria-modal="true"/);
  assert.match(drawer,/assignedElements\(\{flatten:true\}\)/);
  assert.match(drawer,/restoreOverlayFocus\(trigger\)/);
  for(const source of [disclosure,pagination,drawer]){
    assert.match(source,/focus-visible/);
    assert.match(source,/forced-colors:active/);
  }
});

test("Web and React adapters register all five Custom Element tags",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const types=await read("../packages/web/src/components/index.d.ts");
  const react=await read("../packages/react/src/components.js");
  const barrel=await read("../packages/web/src/components/index.js");
  for(const name of ["disclosure","accordion","pagination","drawer"]){
    assert.equal(manifest.exports["./components/"+name].default,
      "./dist/components/"+name+".js");
    assert.equal(manifest.exports["./components/"+name].types,
      "./dist/components/index.d.ts");
    assert.ok(barrel.includes("./"+name+".js"));
  }
  for(const [name,tag] of Object.entries({
    Disclosure:"cu-disclosure",Accordion:"cu-accordion",
    AccordionItem:"cu-accordion-item",Pagination:"cu-pagination",Drawer:"cu-drawer"
  })){
    assert.equal(REACT_TAGS[name],tag);
    assert.ok(types.includes("class Cu"+name+" extends "));
    assert.ok(react.includes(name));
  }
  assert.equal(Object.keys(REACT_TAGS).length,72);
  let sets=0;
  const accordion={};
  Object.defineProperty(accordion,"values",{get(){return [];},set(){sets++;}});
  const values=["install","theme"];
  assignCuProperties(accordion,"cu-accordion",{values});
  assignCuProperties(accordion,"cu-accordion",{values});
  assert.equal(sets,1);
  const pager={page:1,pageSize:10,total:10};
  assignCuProperties(pager,"cu-pagination",{page:3,pageSize:20,total:250});
  assert.deepEqual(pager,{page:3,pageSize:20,total:250});
});

test("Playground exposes interactions and catalog stays at 129 entries",async()=>{
  const [html,script,json]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../design-system/components/catalog.json")
  ]);
  for(const tag of ["cu-disclosure","cu-accordion","cu-accordion-item",
    "cu-pagination","cu-drawer"])assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-accordion","wc-accordion-reset","wc-pagination",
    "wc-pagination-next","wc-native-drawer","wc-drawer-done"])
    assert.ok(html.includes('id="'+id+'"'));
  assert.match(script,/nativeAccordion\.addEventListener\("cu-change"/);
  assert.match(script,/nativePager\.addEventListener\("cu-page-change"/);
  assert.match(script,/nativeDrawer\.addEventListener\("cu-close"/);
  const items=JSON.parse(json).groups.flatMap(g=>g.components);
  for(const name of ["Accordion","Pagination","Drawer"])
    assert.equal(items.find(c=>c.name===name)?.status,"preview");
  assert.equal(items.length,129);
  assert.equal(items.filter(c=>c.status==="preview").length,61);
  assert.equal(items.filter(c=>c.status==="planned").length,68);
  assert.equal(items.filter(c=>c.status==="ready").length,0);
});
