import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuDataTable,CuTreeTable,normalizeTreeTableItems,filterTreeTableItems,sortTreeTableItems,visibleTreeTableRows} from "../packages/web/src/components/index.js";
import {NUMERIC_FILTER_OPERATORS,applyFilterBar,filterTableRows,uniqueTableFilterValues} from "../packages/web/src/components/filter-utils.js";
import {assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
if(!globalThis.CustomEvent)globalThis.CustomEvent=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};
test("numeric filter operators are shared and facets honor other filters and external search",()=>{
 assert.ok(NUMERIC_FILTER_OPERATORS.has("between"));
 const rows=[{name:"Ada",status:"Active",score:2},{name:"Ada",status:"Inactive",score:3},{name:"Bob",status:"Active",score:4}];
 const facets=applyFilterBar(filterTableRows(rows,{status:["Active"],score:[4]},"score"),"Ada",{},["name"]);
 assert.deepEqual(uniqueTableFilterValues(facets,"score").map(x=>x.value),[2]);
});
test("hiding a sorted column invalidates the cached ordering",()=>{
 const table=Object.create(CuDataTable.prototype);table._columns=[{key:"name"},{key:"score"}];table._hiddenColumns=new Set();table._sortKey="score";table._direction="desc";table._sortedCache=[{score:2},{score:1}];table._page=2;table._render=()=>{};table._notifyColumnVisibility=()=>{};table.dispatchEvent=()=>true;
 table.hideColumn("score");assert.equal(table.sortKey,"");assert.equal(table._sortedCache,null);assert.equal(table.page,1);
});
test("selection assignment and preserved explicit IDs are defensive",()=>{
 const table=Object.create(CuDataTable.prototype);table._rows=[{id:"a"},{id:"b"}];table._selected=new Set();table._rowIndex=new WeakMap();table._render=()=>{};table.hasAttribute=k=>k==="preserve-selection";table._notifySelection=()=>{};
 assignCuProperties(table,"cu-data-table",{selectedIds:["a","missing"]});assert.deepEqual(table.selectedIds,["a"]);table.selectedIds.push("b");assert.deepEqual(table.selectedIds,["a"]);
 table.rows=[{id:"a"},{id:"c"}];assert.deepEqual(table.selectedIds,["a"]);
 table.rows=[{id:"a"},{id:"a"}];assert.deepEqual(table.selectedIds,[]);
});
test("tree search preserves ancestors and ignores Vietnamese diacritics",()=>{
 const items=normalizeTreeTableItems([{id:"root",label:"Root",children:[{id:"a",label:"Độ rộng"},{id:"b",label:"Other"}]},{id:"else",label:"Else"}]);
 const result=filterTreeTableItems(items,"do rong");
 assert.deepEqual(visibleTreeTableRows(result,["root"]).map(x=>x.item.id),["root","a"]);
 assert.equal(items[0].children.length,2);
});
test("tree sorting preserves hierarchy and original order",()=>{
 const items=normalizeTreeTableItems([{id:"b",label:"B",children:[{id:"10",label:"Item 10"},{id:"2",label:"Item 2"}]},{id:"a",label:"A"}]);
 const sorted=sortTreeTableItems(items,"","asc");assert.deepEqual(sorted.map(x=>x.id),["a","b"]);assert.deepEqual(sorted[1].children.map(x=>x.id),["2","10"]);assert.equal(items[0].children[0].id,"10");
});
test("tree expanded values prune unknown and leaf IDs",()=>{
 const table=Object.create(CuTreeTable.prototype);table._items=normalizeTreeTableItems([{id:"a",children:[{id:"b"}]}]);table._render=()=>{};table.expandedValues=["a","b","missing"];assert.deepEqual(table.expandedValues,["a"]);
});
test("filter and editor interaction regression contracts",async()=>{
 const table=await read("../packages/web/src/components/data-table.js"),grid=await read("../packages/web/src/components/data-grid.js"),tree=await read("../packages/web/src/components/tree-table.js");
 assert.ok(table.includes("NUMERIC_FILTER_OPERATORS, isTableFilterCondition"));
 assert.ok(table.includes("matching.slice(0,editor.limit??200)"));
 assert.ok(table.includes("Upper bound must be at least the lower bound."));
 assert.ok(table.includes("isTopOverlay(this)"));
 assert.ok(grid.includes('event.key==="Tab"'));assert.ok(grid.includes("cancel(false)"));
 assert.ok(tree.includes('aria-keyshortcuts","Shift+F10"'));
});
