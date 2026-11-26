import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuTreeList,CuInfiniteScroll,CuDataTable,
  flattenTreeList,initialTreeExpansion,shouldLoadMore,
  virtualListRange
} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("new data components are import-safe without browser globals",()=>{
  for(const Component of [CuTreeList,CuInfiniteScroll,CuDataTable])
    assert.equal(typeof Component,"function");
  assert.ok(CuTreeList.observedAttributes.includes("item-height"));
  assert.ok(CuInfiniteScroll.observedAttributes.includes("has-more"));
  assert.equal(REACT_TAGS.TreeList,"cu-tree-list");
  assert.equal(REACT_TAGS.InfiniteScroll,"cu-infinite-scroll");
  assert.equal(REACT_EVENT_PROPS.onCuLoadMore,"cu-load-more");
  assert.equal(Object.keys(REACT_TAGS).length,131);
});

test("TreeList pure helper flattens only expanded branches with correct semantics",()=>{
  const items=[
    {value:"root",label:"Root",expanded:true,children:[
      {value:"one",label:"One"},
      {value:"branch",label:"Branch",children:[{value:"hidden",label:"Hidden"}]},
      {value:"disabled",label:"Disabled",disabled:true}
    ]},
    {value:"next",label:"Next"}
  ];
  const expanded=initialTreeExpansion(items);
  assert.deepEqual([...expanded],["root"]);
  const first=flattenTreeList(items,expanded);
  assert.deepEqual(first.map(x=>x.value),["root","one","branch","disabled","next"]);
  assert.equal(first[0].level,1);
  assert.equal(first[0].posinset,1);
  assert.equal(first[0].setsize,2);
  assert.equal(first[1].level,2);
  assert.equal(first[1].parent,"root");
  assert.equal(first[1].setsize,3);
  assert.equal(first[2].hasChildren,true);
  assert.equal(first[2].expanded,false);
  assert.equal(first[3].disabled,true);
  const second=flattenTreeList(items,new Set(["root","branch"]));
  assert.deepEqual(second.map(x=>x.value),["root","one","branch","hidden","disabled","next"]);
  assert.equal(second[3].level,3);
  assert.deepEqual(flattenTreeList(null),[]);
  assert.deepEqual([...initialTreeExpansion(null)],[]);
});

test("TreeList expands and selects nodes while blocking disabled entries",()=>{
  const tree=Object.create(CuTreeList.prototype);
  const events=[];
  tree._items=[{value:"root",label:"Root",children:[
    {value:"first",label:"First"},{value:"off",disabled:true},
    {value:"branch",label:"Branch",children:[{value:"leaf",label:"Leaf"}]}
  ]}];
  tree._expanded=new Set();
  tree._selected="";
  tree._active=0;
  tree._lastRange=null;
  tree._viewport={scrollTop:0,clientHeight:100};
  tree.getAttribute=k=>k==="item-height"?"38":null;
  tree.hasAttribute=k=>k==="item-height";
  tree._render=()=>{};
  tree.dispatchEvent=e=>{events.push(e);return true;};
  tree._refresh();
  assert.equal(tree.visibleCount,1);
  assert.equal(tree.expand("root"),true);
  assert.equal(tree.visibleCount,4);
  assert.equal(tree.expand("root"),false);
  assert.equal(tree.select("off"),false);
  assert.equal(tree.select("first"),true);
  assert.equal(tree.value,"first");
  assert.equal(tree.expand("branch"),true);
  assert.equal(tree.visibleCount,5);
  assert.deepEqual(tree.expandedValues,["root","branch"]);
  assert.equal(tree.select("leaf"),true);
  assert.equal(tree.collapse("branch"),true);
  assert.equal(tree.visibleCount,4);
  assert.equal(tree.value,"branch"); // Selected leaf is hidden; nearest visible ancestor is selected.
  assert.equal(tree.toggle("branch"),true);
  assert.equal(tree.visibleCount,5);
  assert.deepEqual(events.map(e=>e.type),[
    "cu-toggle","cu-change","cu-toggle","cu-change","cu-toggle","cu-change","cu-toggle"
  ]);
  assert.deepEqual(events[1].detail,{value:"first",item:tree._items[0].children[0],index:1});
  assert.deepEqual(events[5].detail,{value:"branch",item:tree._items[0].children[2],index:3});
});

test("TreeList uses virtual window independent of deep hierarchy size",()=>{
  const items=Array.from({length:300},(_,i)=>({
    value:"folder-"+i,label:"Folder "+i,
    children:Array.from({length:10},(_,j)=>({value:"file-"+i+"-"+j,label:"File "+j}))
  }));
  const expanded=new Set(items.map(x=>x.value));
  const flattened=flattenTreeList(items,expanded);
  assert.equal(flattened.length,3300);
  const window=virtualListRange(40000,220,flattened.length,38,4);
  assert.ok(window.end-window.start<22);
  assert.ok(window.top>0);
  assert.ok(window.bottom>0);
});

test("TreeList renders accessible rows without interpreting HTML labels",()=>{
  const saved=globalThis.document;
  try{
    globalThis.document={
      createDocumentFragment:()=>({children:[],append(el){this.children.push(el);}}),
      createElement:tag=>({
        tag,style:{setProperty(k,v){this[k]=v;}},dataset:{},
        children:[],append(...els){this.children.push(...els);},
        setAttribute(k,v){this[k]=v;},
        textContent:""
      })
    };
    const tree=Object.create(CuTreeList.prototype);
    tree._visible=[
      {value:"parent",label:"<svg onload=evil()>",level:1,parent:null,
        posinset:1,setsize:1,disabled:false,hasChildren:true,expanded:true,item:{}},
      {value:"child",label:"Child",level:2,parent:"parent",
        posinset:1,setsize:1,disabled:false,hasChildren:false,expanded:false,item:{}}
    ];
    tree._expanded=new Set(["parent"]);
    tree._selected="parent";
    tree._active=0;
    tree._prefix="test-tree";
    tree._lastRange=null;
    tree.getAttribute=k=>k==="item-height"?"38":null;
    tree.hasAttribute=k=>k==="item-height";
    tree._viewport={scrollTop:0,clientHeight:80,setAttribute(k,v){this[k]=v;},
      removeAttribute(k){delete this[k];}};
    tree._top={style:{}};tree._bottom={style:{}};tree._empty={hidden:true};
    tree._itemsRoot={replaceChildren(fragment){this.rows=fragment.children;}};
    tree._render();
    assert.equal(tree._itemsRoot.rows.length,2);
    const root=tree._itemsRoot.rows[0];
    assert.equal(root.role,"treeitem");
    assert.equal(root["aria-level"],"1");
    assert.equal(root["aria-expanded"],"true");
    assert.equal(root.children[1].textContent,"<svg onload=evil()>");
    assert.equal(tree._viewport["aria-activedescendant"],"test-tree-0");
  }finally{
    if(saved===undefined)delete globalThis.document;
    else globalThis.document=saved;
  }
});

test("InfiniteScroll threshold helper detects near end and ignores zero viewport",()=>{
  assert.equal(shouldLoadMore(0,200,1000,180),false);
  assert.equal(shouldLoadMore(620,200,1000,180),true);
  assert.equal(shouldLoadMore(800,200,1000,0),true);
  assert.equal(shouldLoadMore(0,0,0),false);
  assert.equal(shouldLoadMore(-30,100,1000),false);
  assert.equal(shouldLoadMore(0,200,100,0),true);
});

test("InfiniteScroll emits one request at a time and re-arms after completion",()=>{
  const scroll=Object.create(CuInfiniteScroll.prototype);
  const attrs=new Map([["has-more",""],["threshold","110"]]);
  const events=[];
  scroll.hasAttribute=k=>attrs.has(k);
  scroll.getAttribute=k=>attrs.get(k)??null;
  scroll.toggleAttribute=(k,on)=>on?attrs.set(k,""):attrs.delete(k);
  scroll.dispatchEvent=e=>{events.push(e);return true;};
  scroll._viewport={scrollTop:20,scrollHeight:200,clientHeight:100,
    setAttribute(){}};
  scroll._button={};scroll._status={};scroll._page=0;scroll._requesting=false;
  assert.equal(scroll.threshold,110);
  assert.equal(scroll._nearBottom(),true);
  assert.equal(scroll.requestMore("intersection"),true);
  assert.equal(scroll.loading,true);
  assert.equal(scroll.requestMore("scroll"),false);
  assert.deepEqual(events[0].detail,{page:1,reason:"intersection"});
  scroll.complete({hasMore:true});
  assert.equal(scroll.loading,false);
  assert.equal(scroll.requestMore("button"),true);
  assert.deepEqual(events[1].detail,{page:2,reason:"button"});
  scroll.complete({hasMore:false});
  assert.equal(scroll.requestMore("manual"),false);
  assert.equal(scroll._status.textContent,"All records loaded");
  scroll.reset();
  assert.equal(scroll.page,0);
  assert.equal(scroll._viewport.scrollTop,0);
  assert.equal(events.length,2);
});

test("DataTable memoizes 10k-row filtered and sorted views across pagination",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._rows=Array.from({length:10000},(_,i)=>({
    id:i,name:"Project "+i,status:i%2?"Draft":"Active",rank:10000-i
  }));
  table._columns=[{key:"name"},{key:"status"},{key:"rank"}];
  table._columnFilters=new Map([["status",{operator:"equals",value:"Active"}]]);
  table._sortKey="rank";table._direction="asc";table._page=1;
  table._externalQuery="";table._externalConditions={};table._externalSearchKeys=null;
  table._filteredCache=null;table._sortedCache=null;
  table.getAttribute=k=>k==="page-size"?"25":null;
  table._render=()=>{};
  table.dispatchEvent=()=>true;
  const first=table._getFilteredRows();
  assert.equal(first.length,5000);
  assert.equal(table._getFilteredRows(),first);
  const sorted=table._getSortedRows();
  assert.equal(table._getSortedRows(),sorted);
  assert.equal(sorted[0].rank,2);
  assert.equal(table._setPage(2),undefined);
  assert.equal(table._getSortedRows(),sorted);
  const external=table.filteredRows;
  external.pop();
  assert.equal(table.filteredRows.length,5000);
  table.setColumnFilter("status",{operator:"equals",value:"Draft"});
  assert.equal(table._getFilteredRows().length,5000);
  assert.notEqual(table._getSortedRows(),sorted);
  assert.equal(table._getSortedRows()[0].rank,1);
});

test("DataTable avoids repeated copy and filter passes with no active criteria",()=>{
  const table=Object.create(CuDataTable.prototype);
  const rows=Array.from({length:10000},(_,i)=>({id:i,score:i}));
  table._rows=rows;table._columnFilters=new Map();
  table._externalQuery="";table._externalConditions={};table._externalSearchKeys=null;
  table._sortKey="";table._direction="asc";
  assert.equal(table._getFilteredRows(),rows);
  assert.equal(table._getFilteredRows(),rows);
  const sorted=table._getSortedRows();
  assert.notEqual(sorted,rows);
  assert.equal(sorted.length,10000);
  assert.equal(table._getSortedRows(),sorted);
  assert.notEqual(table.filteredRows,rows);
  table._externalQuery="999";
  table._invalidateView();
  assert.equal(table._getFilteredRows().length,19);
});

test("DataTable invalidates view caches when data and sorting changes",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._rows=[{id:"1",rank:2},{id:"2",rank:1}];
  table._columnFilters=new Map();table._externalQuery="";
  table._externalConditions={};table._externalSearchKeys=null;
  table._sortKey="rank";table._direction="asc";
  table._columns=[{key:"rank",sortable:true}];
  table._selected=new Set();
  table._page=1;table._render=()=>{};table.dispatchEvent=()=>true;
  const before=table._getSortedRows();
  table._setSort("rank","desc");
  assert.notEqual(table._getSortedRows(),before);
  assert.deepEqual(table._getSortedRows().map(x=>x.rank),[2,1]);
  const rows=[{rank:15},{rank:10}];
  table.rows=rows;
  assert.equal(table._rowId(rows[0],0),"0");
  assert.equal(table._rowId(rows[1],1),"1");
  assert.deepEqual(table._getSortedRows().map(x=>x.rank),[15,10]);
});

test("Source, package and playground integrate native controls",async()=>{
  const [tree,scroll,table,react,html,script,webTypes,pkg,json,root]=await Promise.all([
    read("../packages/web/src/components/tree-list.js"),
    read("../packages/web/src/components/infinite-scroll.js"),
    read("../packages/web/src/components/data-table.js"),
    read("../packages/react/src/components.js"),
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../packages/web/src/components/index.d.ts"),
    read("../packages/web/package.json"),
    read("../design-system/components/catalog.json"),
    read("../package.json")
  ]);
  assert.match(tree,/role="tree"/);
  assert.match(tree,/aria-level/);
  assert.match(tree,/aria-posinset/);
  assert.match(tree,/virtualListRange/);
  assert.match(scroll,/IntersectionObserver/);
  assert.match(scroll,/cu-load-more/);
  assert.match(scroll,/aria-busy/);
  assert.match(table,/_getSortedRows\(\)/);
  assert.match(table,/_rowIndex=new WeakMap/);
  assert.match(react,/TreeList, InfiniteScroll/);
  assert.match(html,/<cu-tree-list/);
  assert.match(html,/<cu-infinite-scroll/);
  assert.match(script,/largeTree\.items=/);
  assert.match(script,/incrementalFeed\.addEventListener\("cu-load-more"/);
  assert.match(script,/wcTable\.rows=Array\.from\(\{length:5000\}/);
  for(const name of ["tree-list","infinite-scroll"]){
    assert.equal(JSON.parse(pkg).exports["./components/"+name].default,
      "./dist/components/"+name+".js");
    assert.ok(JSON.parse(root).scripts["syntax:check"].includes("components/"+name+".js"));
  }
  assert.match(webTypes,/class CuTreeList extends HTMLElement/);
  assert.match(webTypes,/class CuInfiniteScroll extends HTMLElement/);
  const catalog=JSON.parse(json).groups.flatMap(x=>x.components);
  assert.equal(catalog.length,132);
  assert.equal(catalog.find(x=>x.name==="TreeList")?.status,"preview");
  assert.equal(catalog.filter(x=>x.status==="preview").length,120);
  assert.equal(catalog.filter(x=>x.status==="planned").length,12);
});

test("React property bridge keeps tree arrays stable across rerenders",()=>{
  let writes=0;
  const el={};
  Object.defineProperty(el,"items",{get(){return [];},set(){writes++;}});
  const items=[{value:"root"}];
  assignCuProperties(el,"cu-tree-list",{items});
  assignCuProperties(el,"cu-tree-list",{items});
  assert.equal(writes,1);
  assignCuProperties(el,"cu-tree-list",{items:[...items]});
  assert.equal(writes,2);
});
