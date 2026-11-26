
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuDataTable, CuTreeView, CuTreeItem, CuListBox, CuListOption,
  CuCombobox, CuComboOption, CuContextMenu,
  sortTableRows, paginateRows, filterTableRows, uniqueTableFilterValues,
  tableFilterValueKey, tableFilterValueLabel,
  TABLE_FILTER_OPERATORS, isTableFilterCondition,
  matchTableFilterCondition, normalizeTableFilterSpec,
  flattenVisibleTree, readListOptions,
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

test("Excel-style DataTable filters combine multi-value OR and multi-column AND",()=>{
  const rows=[
    {id:1,status:"Active",owner:"Ada",amount:2},
    {id:2,status:"Active",owner:"Lin",amount:10},
    {id:3,status:"Review",owner:"Ada",amount:2},
    {id:4,status:"Draft",owner:"Lin",amount:0},
    {id:5,status:null,owner:"Ada",amount:0},
    {id:6,status:"",owner:"Lin",amount:2}
  ];
  assert.equal(tableFilterValueKey(null),tableFilterValueKey(""));
  assert.equal(tableFilterValueKey(undefined),tableFilterValueKey(""));
  assert.notEqual(tableFilterValueKey("2"),tableFilterValueKey(2));
  assert.notEqual(tableFilterValueKey(false),tableFilterValueKey("false"));
  assert.equal(tableFilterValueLabel(null),"(Blanks)");
  const distinct=uniqueTableFilterValues(rows,"status");
  assert.equal(distinct.find(option=>option.label==="(Blanks)").count,2);
  assert.equal(distinct.find(option=>option.label==="Active").count,2);
  const filters={status:["Active","Review"],owner:["Ada"]};
  assert.deepEqual(filterTableRows(rows,filters).map(row=>row.id),[1,3]);
  assert.deepEqual(filterTableRows(rows,filters,"status").map(row=>row.id),[1,3,5]);
  assert.deepEqual(filterTableRows(rows,{amount:[0]}).map(row=>row.id),[4,5]);
  assert.deepEqual(filterTableRows(rows,{status:[null]}).map(row=>row.id),[5,6]);
  assert.deepEqual(filterTableRows(rows,{status:[]}),[]);
  assert.equal(paginateRows(sortTableRows(filterTableRows(rows,filters),"amount"),1,2).total,2);
  assert.equal(rows.length,6);
});

test("DataTable column filter API supports set, reset, and filtered state",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._columns=[
    {key:"status",filterable:true},{key:"owner"},{key:"private",filterable:false}
  ];
  table._rows=[
    {status:"Active",owner:"Ada",private:"a"},
    {status:"Draft",owner:"Ada",private:"b"},
    {status:"Active",owner:"Lin",private:"c"}
  ];
  table._columnFilters=new Map();
  table._page=3;
  let renders=0;
  const emitted=[];
  table._render=()=>{renders++;};
  table._notifyFilterChange=()=>emitted.push({
    filters:table.columnFilters,visible:table.filteredRows.length
  });

  table.setColumnFilter("status",["Active","Active"]);
  assert.deepEqual(table.columnFilters,{status:["Active"]});
  assert.equal(table.filteredRows.length,2);
  assert.equal(table.page,1);
  table.setColumnFilter("owner",["Ada"]);
  assert.equal(table.filteredRows.length,1);
  table.setColumnFilter("private",["a"]);
  assert.equal(Object.hasOwn(table.columnFilters,"private"),false);
  table.clearColumnFilter("status");
  assert.equal(table.filteredRows.length,2);
  table.columnFilters={status:["Draft"],owner:["Lin"],unknown:["x"]};
  assert.deepEqual(table.columnFilters,{status:["Draft"],owner:["Lin"]});
  assert.equal(table.filteredRows.length,0);
  table.clearAllFilters();
  assert.equal(table.filteredRows.length,3);
  assert.deepEqual(table.columnFilters,{});
  assert.equal(renders,5);
  assert.equal(emitted.length,5);
  assert.deepEqual(emitted.at(-1),{filters:{},visible:3});
});

test("DataTable offers Excel-like header filtering with discoverable controls",async()=>{
  const [source,types,react,docs,demo]=await Promise.all([
    read("../packages/web/src/components/data-table.js"),
    read("../packages/web/src/components/index.d.ts"),
    read("../packages/react/src/index.js"),
    read("../docs/DATA_COMPONENTS.md"),
    read("../apps/playground-web/index.html")
  ]);
  assert.match(source,/class="filter-panel"/);
  assert.match(source,/className="select-all"/);
  assert.match(source,/this\._syncSelectAll\(\)/);
  assert.match(source,/input\.indeterminate=selected>0/);
  assert.match(source,/class="filter-search"/);
  assert.match(source,/class="filter-all"/);
  assert.match(source,/class="filter-options"/);
  for(const name of ["filter-clear","filter-cancel","filter-apply","filter-trigger"])
    assert.ok(source.includes(name));
  assert.match(source,/this\.filteredRows,this\._sortKey/);
  assert.match(source,/h\.dataset\.filtered=/);
  assert.match(source,/column\.filterable!==false/);
  assert.match(source,/event\.key==="Escape"/);
  assert.match(source,/notify\(this,"cu-filter-change"/);
  assert.match(source,/value:"filter-values"/);
  assert.match(source,/value:"clear-filter"/);
  assert.match(source,/value:"clear-all-filters"/);
  assert.match(types,/columnFilters:Record<string,CuTableFilterSpec>/);
  assert.match(react,/onCuFilterChange:"cu-filter-change"/);
  assert.match(react,/"headerActions","columnFilters","page"/);
  assert.match(docs,/Excel-style column filtering/);
  assert.match(demo,/Click the sliders icon/);
  assert.equal(REACT_EVENT_PROPS.onCuFilterChange,"cu-filter-change");
});

test("DataTable Select All reflects current page and partial selection",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._visiblePageRows=[{id:"alpha"},{id:"beta"}];
  table._page=2;
  table._selected=new Set(["alpha"]);
  table._pageSize=()=>2;
  table.hasAttribute=()=>false;
  const checkbox={checked:false,indeterminate:false,disabled:false};
  table._head={querySelector:()=>checkbox};
  table._syncSelectAll();
  assert.equal(checkbox.checked,false);
  assert.equal(checkbox.indeterminate,true);
  table._selected.add("beta");
  table._syncSelectAll();
  assert.equal(checkbox.checked,true);
  assert.equal(checkbox.indeterminate,false);
  table._selected.clear();
  table._syncSelectAll();
  assert.equal(checkbox.checked,false);
  assert.equal(checkbox.indeterminate,false);
  table._visiblePageRows=[];
  table._syncSelectAll();
  assert.equal(checkbox.disabled,true);
  table._visiblePageRows=[{id:"alpha"}];
  table.hasAttribute=attribute=>attribute==="loading";
  table._syncSelectAll();
  assert.equal(checkbox.disabled,true);
});

test("DataTable condition filters support text, number ranges, and blanks",()=>{
  assert.ok(TABLE_FILTER_OPERATORS.includes("between"));
  assert.ok(TABLE_FILTER_OPERATORS.includes("is-blank"));
  const check=(value,operator,expected,value2)=>{
    assert.equal(matchTableFilterCondition(value,{operator,value:expected,value2}),true);
  };
  check("NovaBrowser","contains","BROWSER");
  check("NovaBrowser","not-contains","GITHUB");
  check("NovaBrowser","starts-with","NOVA");
  check("NovaBrowser","ends-with","BROWSER");
  check("ACTIVE","equals","active");
  check("ACTIVE","not-equals","inactive");
  check(15,"greater-than",10);
  check(15,"greater-or-equal",15);
  check(15,"less-than",20);
  check(15,"less-or-equal",15);
  check(15,"between",10,20);
  check(null,"is-blank");
  check("","is-blank");
  check(0,"is-not-blank");
  assert.equal(matchTableFilterCondition("hello",{operator:"contains",value:"absent"}),false);
  assert.equal(matchTableFilterCondition(5,{operator:"between",value:10,value2:30}),false);
  assert.equal(matchTableFilterCondition("abc",{operator:"greater-than",value:2}),false);
  assert.equal(matchTableFilterCondition("",{operator:"greater-or-equal",value:0}),false);
  assert.equal(matchTableFilterCondition(null,{operator:"not-contains",value:"x"}),false);
  assert.equal(isTableFilterCondition({operator:"unknown"}),false);
  assert.throws(()=>normalizeTableFilterSpec({operator:"unknown"}),TypeError);
  assert.deepEqual(normalizeTableFilterSpec(["Active","Active"]),["Active"]);
  assert.deepEqual(normalizeTableFilterSpec({operator:"between",value:1,value2:3}),
    {operator:"between",value:1,value2:3});

  const rows=[
    {status:"Active",owner:"Anna",amount:100},
    {status:"Active",owner:"Bob",amount:250},
    {status:"Draft",owner:"Andi",amount:500},
    {status:null,owner:"Andy",amount:null}
  ];
  assert.deepEqual(filterTableRows(rows,{
    owner:{operator:"starts-with",value:"an"},
    amount:{operator:"between",value:50,value2:300}
  }).map(row=>row.owner),["Anna"]);
  assert.equal(filterTableRows(rows,{status:{operator:"is-blank"}}).length,1);
  assert.equal(filterTableRows(rows,{status:["Active"],amount:{operator:"greater-than",value:200}}).length,1);
});

test("DataTable condition filter state preserves value arrays and exposes copies",()=>{
  const table=Object.create(CuDataTable.prototype);
  table._columns=[{key:"status"},{key:"amount"},{key:"hidden",filterable:false}];
  table._rows=[{status:"Active",amount:50},{status:"Draft",amount:150},
    {status:"Review",amount:250}];
  table._columnFilters=new Map();
  table._page=3;
  let renders=0,changes=0;
  table._render=()=>renders++;
  table._notifyFilterChange=()=>changes++;
  table.setColumnCondition("amount","greater-or-equal",150);
  assert.deepEqual(table.filteredRows.map(row=>row.amount),[150,250]);
  assert.equal(table.page,1);
  table.columnFilters={status:["Draft","Review"],amount:{operator:"less-than",value:220},
    hidden:{operator:"equals",value:"x"}};
  assert.deepEqual(table.filteredRows.map(row=>row.amount),[150]);
  assert.deepEqual(Object.keys(table.columnFilters),["status","amount"]);
  const snapshot=table.columnFilters;
  snapshot.status.push("Active");
  snapshot.amount.value=300;
  assert.deepEqual(table.columnFilters.status,["Draft","Review"]);
  assert.equal(table.columnFilters.amount.value,220);
  assert.equal(renders,2);
  assert.equal(changes,2);
});

test("DataTable Conditions flyout uses shared CuSelect and keyboard-accessible tabs",async()=>{
  const source=await read("../packages/web/src/components/data-table.js");
  const declaration=await read("../packages/web/src/components/index.d.ts");
  assert.match(source,/import "\.\/select\.js"/);
  assert.match(source,/<cu-select class="filter-operator"/);
  assert.match(source,/role="tablist"/);
  assert.match(source,/role="tabpanel"/);
  assert.match(source,/ArrowLeft/);
  assert.match(source,/ArrowRight/);
  assert.match(source,/filter-condition-error/);
  assert.match(source,/setColumnCondition\(key,operator/);
  assert.match(declaration,/type CuTableFilterOperator/);
  assert.match(declaration,/setColumnCondition\(key:string/);
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
  assert.match(table,/from "\.\/context-menu\.js"/);
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
  instance._columnFilters=new Map();
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
  assert.equal(Object.keys(REACT_TAGS).length,92);
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
  assert.equal(items.length,131);
  assert.equal(items.filter(x=>x.name==="ListBox").length,1);
  assert.equal(items.filter(x=>x.status==="preview").length,79);
  assert.equal(items.filter(x=>x.status==="planned").length,52);
  assert.equal(items.filter(x=>x.status==="ready").length,0);
});
