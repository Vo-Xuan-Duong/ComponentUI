
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuDataTable, CuTreeView, CuTreeItem, CuListBox, CuListOption,
  CuCombobox, CuComboOption, CuContextMenu,
  sortTableRows, paginateRows, flattenVisibleTree, readListOptions,
  filterComboOptions, clampMenuPosition
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS } from "../packages/react/src/index.js";
const read = path => readFile(new URL(path,import.meta.url),"utf8");

test("fifth wave exposes native Custom Elements without browser globals",()=>{
  for(const type of [CuDataTable,CuTreeView,CuTreeItem,CuListBox,
    CuListOption,CuCombobox,CuComboOption,CuContextMenu]){
    assert.equal(typeof type,"function");
  }
  assert.equal(CuListBox.formAssociated,true);
  assert.equal(CuCombobox.formAssociated,true);
  assert.equal(CuDataTable.observedAttributes.includes("page-size"),true);
});

test("DataTable numeric and text sorting preserve stable input order",()=>{
  const rows=[{id:"x",name:"Beta",count:10},{id:"a",name:"Alpha",count:2},
    {id:"b",name:"Alpha",count:2}];
  assert.deepEqual(sortTableRows(rows,"name").map(x=>x.id),["a","b","x"]);
  assert.deepEqual(sortTableRows(rows,"count","desc").map(x=>x.id),["x","a","b"]);
  assert.deepEqual(rows.map(x=>x.id),["x","a","b"]);
  assert.equal(sortTableRows(rows,"").length,3);
});

test("DataTable pagination clamps range and supports the last page",()=>{
  const rows=Array.from({length:11},(_,i)=>({id:i}));
  const page=paginateRows(rows,3,5);
  assert.deepEqual(page.rows.map(x=>x.id),[10]);
  assert.equal(page.totalPages,3);
  assert.equal(paginateRows(rows,999,5).page,3);
  assert.equal(paginateRows([],1,5).totalPages,1);
});

test("DataTable row actions use the shared context menu rather than an Actions column",async()=>{
  const [table,menu,types,docs,markup,script]=await Promise.all([
    read("../packages/web/src/components/data-table.js"),
    read("../packages/web/src/components/context-menu.js"),
    read("../packages/web/src/components/index.d.ts"),
    read("../docs/DATA_COMPONENTS.md"),
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js")
  ]);
  assert.match(table,/import "\.\/context-menu\.js"/);
  assert.match(table,/<cu-context-menu class="row-menu"/);
  assert.match(table,/addEventListener\("contextmenu"/);
  assert.match(table,/event\.shiftKey&&event\.key==="F10"/);
  assert.match(table,/this\._menu\.showAt\(x,y,element\)/);
  assert.match(table,/notify\(this,"cu-row-action"/);
  assert.match(table,/notify\(this,"cu-row-activate"/);
  assert.doesNotMatch(table,/this\._makeCell\("Actions","th"\)/);
  assert.doesNotMatch(table,/button\.textContent=actionLabel/);
  assert.match(menu,/set items\(value\)/);
  assert.match(menu,/showAt\(x,y,focusTarget=null\)/);
  assert.match(types,/rowActions:CuTableRowAction\[\]/);
  assert.match(docs,/Shift\+F10/);
  assert.doesNotMatch(markup,/selectable row-action="Open"/);
  assert.match(script,/wcTable\.rowActions=/);
  assert.equal(REACT_EVENT_PROPS.onCuRowAction,"cu-row-action");
});

test("DataTable header menu provides accessible sorting and column visibility",async()=>{
  const [table,types,docs,script]=await Promise.all([
    read("../packages/web/src/components/data-table.js"),
    read("../packages/web/src/components/index.d.ts"),
    read("../docs/DATA_COMPONENTS.md"),
    read("../apps/playground-web/main.js")
  ]);
  assert.match(table,/<cu-context-menu class="header-menu"/);
  assert.match(table,/this\._bindHeaderMenu\(h,column\)/);
  assert.match(table,/header\.addEventListener\("contextmenu"/);
  assert.match(table,/event\.shiftKey&&event\.key==="F10"/);
  assert.match(table,/notify\(this,"cu-header-action"/);
  assert.match(table,/notify\(this,"cu-column-visibility-change"/);
  for(const key of ["sort-asc","sort-desc","clear-sort","hide-column","show-all-columns"])
    assert.ok(table.includes('value:"'+key+'"'));
  assert.match(types,/readonly hiddenColumnKeys:string\[\]/);
  assert.match(types,/showAllColumns\(\):void/);
  assert.match(docs,/Header context menu/);
  assert.match(script,/wcTable\.headerActions=/);
  assert.equal(REACT_EVENT_PROPS.onCuHeaderAction,"cu-header-action");
  assert.equal(REACT_EVENT_PROPS.onCuColumnVisibilityChange,"cu-column-visibility-change");

  const instance=Object.create(CuDataTable.prototype);
  instance._columns=[
    {key:"name",label:"Name"},{key:"status",label:"Status",sortable:false}
  ];
  instance._hiddenColumns=new Set();
  instance._headerActions=[];
  instance._sortKey="";
  let renderCount=0;
  let visibilityCount=0;
  instance._render=()=>{renderCount++;};
  instance._notifyColumnVisibility=()=>{visibilityCount++;};

  const statusMenu=instance._headerActionsFor(instance._columns[1]);
  assert.equal(statusMenu.find(a=>a.value==="sort-asc").disabled,true);
  assert.equal(statusMenu.find(a=>a.value==="hide-column").disabled,false);
  instance.hideColumn("status");
  assert.deepEqual(instance.hiddenColumnKeys,["status"]);
  assert.deepEqual(instance.visibleColumnKeys,["name"]);
  const nameMenu=instance._headerActionsFor(instance._columns[0]);
  assert.equal(nameMenu.find(a=>a.value==="hide-column").disabled,true);
  assert.equal(nameMenu.find(a=>a.value==="show-all-columns").disabled,false);
  instance.hideColumn("name");
  assert.deepEqual(instance.visibleColumnKeys,["name"]);
  instance.showAllColumns();
  assert.deepEqual(instance.hiddenColumnKeys,[]);
  assert.equal(renderCount,2);
  assert.equal(visibilityCount,2);
});

test("TreeView flatten helper respects collapsed descendants and levels",()=>{
  const nodes=[{value:"root",expanded:true,children:[
    {value:"open",expanded:true,children:[{value:"file"}]},
    {value:"closed",expanded:false,children:[{value:"hidden"}]}]}];
  assert.deepEqual(flattenVisibleTree(nodes).map(x=>x.value),
    ["root","open","file","closed"]);
  assert.deepEqual(flattenVisibleTree(nodes).map(x=>x.level),[1,2,3,2]);
  assert.equal(flattenVisibleTree(nodes)[2].parent,"open");
});

test("ListBox option normalization and Combobox search filter disabled options",()=>{
  const options=readListOptions([
    {tag:"cu-list-option",value:"react",label:"React",selected:true},
    {tag:"cu-list-option",value:"vue",label:"Vue",disabled:true},
    {tag:"something-else",value:"other"},
  ]);
  assert.deepEqual(options.map(x=>x.value),["react","vue"]);
  assert.equal(options[0].selected,true);
  assert.equal(options[1].disabled,true);
  const matches=filterComboOptions([
    {value:"r",label:"React"},{value:"v",label:"Vue",disabled:true},
    {value:"n",label:"Next.js"},{value:"s",label:"Svelte"}
  ],"E");
  assert.deepEqual(matches.map(x=>x.value),["r","n","s"]);
});

test("ContextMenu clamps viewport position without using browser global APIs",()=>{
  assert.deepEqual(clampMenuPosition(1000,1000,210,180,600,400),
    {x:382,y:212});
  assert.deepEqual(clampMenuPosition(-12,-8,210,180,600,400),{x:8,y:8});
});

test("new controls use keyboard semantics, safe textContent and Lucide icons",async()=>{
  const files=await Promise.all(["data-table","tree-view","listbox","combobox","context-menu"]
    .map(name=>read("../packages/web/src/components/"+name+".js")));
  const [table,tree,listbox,combobox,context]=files;
  assert.match(table,/<table part="table"/);
  assert.match(table,/aria-sort/);
  assert.match(table,/cu-selection-change/);
  assert.match(table,/textContent=String\(text\?\?""\)/);
  assert.match(tree,/role="tree"/);
  assert.match(tree,/aria-level/);
  assert.match(tree,/aria-activedescendant/);
  assert.match(tree,/chevron-down/);
  assert.match(listbox,/setFormValue/);
  assert.match(listbox,/formResetCallback/);
  assert.match(listbox,/role="listbox"/);
  assert.match(combobox,/aria-autocomplete="list"/);
  assert.match(combobox,/setValidity/);
  assert.match(combobox,/cu-change/);
  assert.match(context,/contextmenu/);
  assert.match(context,/Shift\+F10|shiftKey/);
  assert.match(context,/Escape/);
  assert.match(context,/role="menuitem"/);
  for(const source of files)assert.doesNotMatch(source,/border-left:\s*3px solid/);
});

test("package entry points, React event handlers and Playground match new elements",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  for(const name of ["data-table","tree-view","listbox","combobox","context-menu"]){
    assert.equal(manifest.exports["./components/"+name].default,
      "./dist/components/"+name+".js");
  }
  assert.equal(Object.keys(REACT_TAGS).length,45);
  assert.equal(REACT_TAGS.ContextMenu,"cu-context-menu");
  assert.equal(REACT_TAGS.DataTable,"cu-data-table");
  assert.equal(REACT_EVENT_PROPS.onCuSort,"cu-sort");
  assert.equal(REACT_EVENT_PROPS.onCuSelectionChange,"cu-selection-change");
  assert.equal(REACT_EVENT_PROPS.onCuToggle,"cu-toggle");
  const html=await read("../apps/playground-web/index.html");
  const script=await read("../apps/playground-web/main.js");
  for(const tag of ["cu-data-table","cu-tree-view","cu-listbox","cu-combobox","cu-context-menu"])
    assert.ok(html.includes("<"+tag));
  assert.match(script,/wcTable\.columns=/);
  assert.match(script,/context\.showAt/);
});

test("catalog includes one new ListBox and five previews without ready releases",async()=>{
  const cat=JSON.parse(await read("../design-system/components/catalog.json"));
  const items=cat.groups.flatMap(g=>g.components);
  const statuses=new Map(items.map(x=>[x.name,x.status]));
  for(const name of ["DataTable","TreeView","ListBox","Combobox","ContextMenu"])
    assert.equal(statuses.get(name),"preview");
  assert.equal(items.length,129);
  assert.equal(items.filter(x=>x.name==="ListBox").length,1);
  assert.equal(items.filter(x=>x.status==="preview").length,40);
  assert.equal(items.filter(x=>x.status==="planned").length,89);
  assert.equal(items.filter(x=>x.status==="ready").length,0);
});
