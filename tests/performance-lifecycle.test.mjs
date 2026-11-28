import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {frameTask,reconcileVirtualWindow,reconcileElementChildren} from "../packages/web/src/components/_shared.js";
import {virtualListRange,flattenTreeList,initialTreeExpansion,CuInfiniteScroll,CuTreeTable} from "../packages/web/src/components/index.js";
test("frame task coalesces requests, cancels and ignores stale callbacks",()=>{
 const queue=new Map();let sequence=0,calls=0;const host={isConnected:true,ownerDocument:{defaultView:{requestAnimationFrame(fn){queue.set(++sequence,fn);return sequence;},cancelAnimationFrame(id){queue.delete(id);}}}};
 const task=frameTask(host,()=>calls++);task.request();task.request();assert.equal(queue.size,1);
 const stale=queue.get(1);task.cancel();stale();assert.equal(calls,0);task.request();queue.get(2)();assert.equal(calls,1);
 host.isConnected=false;task.request();assert.equal(sequence,2);
});
test("window reconciliation retains overlaps, drops old rows and invalidates revisions",()=>{
 let created=0;const make=i=>({index:i,serial:++created});
 let state=reconcileVirtualWindow(null,0,20,1,make);const prior=state.nodes.get(5);
 state=reconcileVirtualWindow(state,1,21,1,make);assert.equal(created,21);assert.equal(state.nodes.get(5),prior);assert.equal(state.nodes.size,20);assert.equal(state.nodes.has(0),false);
 state=reconcileVirtualWindow(state,1,21,2,make);assert.equal(created,41);assert.notEqual(state.nodes.get(5),prior);
});
test("100k items: overlapping windows allocate only incoming rows",()=>{
 let state=null,created=0,max=0;
 for(let i=0;i<1000;i++){const r=virtualListRange(i*40,400,100000,40,5);state=reconcileVirtualWindow(state,r.start,r.end,0,index=>({index,sequence:++created}));max=Math.max(max,state.nodes.size);}
 assert.equal(max,20);assert.equal(created,1014);
});
test("virtual ranges clamp stale offsets after dataset shrink and nonfinite inputs",()=>{
 assert.deepEqual(virtualListRange(1000000,100,3,40,0),{start:0,end:3,top:0,bottom:0,totalHeight:120});
 assert.equal(virtualListRange(Infinity,Infinity,Infinity,Infinity,Infinity).totalHeight,0);
});
test("tree traversal is cycle-safe and supports id-based initial expansion",()=>{
 const root={id:"root",expanded:true,children:[]};root.children.push({id:"leaf"},root);
 assert.deepEqual([...initialTreeExpansion([root])],["root"]);
 assert.deepEqual(flattenTreeList([root],new Set(["root"])).map(x=>x.value),["root","leaf"]);
});
test("replaced or disconnected intersection observers cannot request data",()=>{
 const callbacks=[];class Observer{constructor(fn){callbacks.push(fn);}observe(){}disconnect(){}}
 const el=Object.create(CuInfiniteScroll.prototype);Object.defineProperty(el,"ownerDocument",{value:{defaultView:{IntersectionObserver:Observer}}});Object.defineProperty(el,"isConnected",{value:true,writable:true});el._observer=null;el._viewport={};el._sentinel={};el.getAttribute=()=>null;el.hasAttribute=()=>false;let calls=0;el.requestMore=()=>calls++;
 el._setupObserver();el._setupObserver();callbacks[0]([{isIntersecting:true}]);assert.equal(calls,0);callbacks[1]([{isIntersecting:true}]);assert.equal(calls,1);el.isConnected=false;callbacks[1]([{isIntersecting:true}]);assert.equal(calls,1);
});
test("tree table rendering batch is bounded and configurable",()=>{
 const el=Object.create(CuTreeTable.prototype);el.getAttribute=()=>null;assert.equal(el.renderBatch,200);el.getAttribute=()=>"1";assert.equal(el.renderBatch,25);el.getAttribute=()=>"5000";assert.equal(el.renderBatch,1000);
});
test("performance contracts use passive scheduling and incremental rows",async()=>{
 const read=p=>readFile(new URL(p,import.meta.url),"utf8");
 for(const name of ["virtual-list","tree-list","scroll-area"]){const source=await read("../packages/web/src/components/"+name+".js");assert.ok(source.includes("frameTask"));assert.ok(source.includes("this._frame.cancel()"));}
 const tree=await read("../packages/web/src/components/tree-table.js");assert.ok(tree.includes("rows.slice(0,this._limit)"));assert.ok(tree.includes("Show more ("));
});

test("DOM window reconciliation only detaches departing rows and inserts arrivals",()=>{
 const counts={insert:0,remove:0};const parent={children:[],insertBefore(node,before){counts.insert++;const old=this.children.indexOf(node);if(old>=0)this.children.splice(old,1);const index=before?this.children.indexOf(before):this.children.length;this.children.splice(index,0,node);}};
 const make=index=>({index,remove(){counts.remove++;parent.children.splice(parent.children.indexOf(this),1);}});
 let state=reconcileVirtualWindow(null,0,20,1,make);
 reconcileElementChildren(parent,[...state.nodes.values()]);assert.equal(counts.insert,20);
 const retained=parent.children[5];
 state=reconcileVirtualWindow(state,1,21,1,make);reconcileElementChildren(parent,[...state.nodes.values()]);
 assert.equal(counts.insert,21);assert.equal(counts.remove,1);assert.equal(parent.children[4],retained);
 reconcileElementChildren(parent,[...state.nodes.values()]);assert.equal(counts.insert,21);assert.equal(counts.remove,1);
 state=reconcileVirtualWindow(state,0,20,1,make);reconcileElementChildren(parent,[...state.nodes.values()]);
 assert.equal(counts.insert,22);assert.equal(counts.remove,2);assert.equal(parent.children[5],retained);
 assert.deepEqual(parent.children.map(n=>n.index),Array.from({length:20},(_,i)=>i));
 reconcileElementChildren(parent,[]);assert.equal(parent.children.length,0);
});
test("virtual controls reconcile mounted children and tree ARIA avoids per-row sibling scans",async()=>{
 const read=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");
 for(const name of ["virtual-list","tree-list"]){const code=await read(name);assert.match(code,/reconcileElementChildren\(this\._itemsRoot/);assert.doesNotMatch(code,/this\._itemsRoot\.replaceChildren/);}
 const tree=await read("tree-view");assert.match(tree,/siblingsByParent/);assert.doesNotMatch(tree,/this\._visible\.filter\(x=>x\.level===item\.level/);
 const list=await read("tree-list");assert.match(list,/if\(active&&!active\.disabled/);
 const tabs=await read("tabs");assert.match(tabs,/panel\.inert=!active/);assert.match(tabs,/panel\.matches\(":focus-within"\)/);
 const box=await read("listbox");assert.match(box,/this\._disabled\(\)\|\|event\.pointerType==="touch"/);
});

test("DataTable selection updates mounted rows without a table render",async()=>{
 const {CuDataTable}=await import("../packages/web/src/components/data-table.js");
 const table=Object.create(CuDataTable.prototype);
 table._rows=[{id:"a"},{id:"b"}];table._selected=new Set();table._rowIndex=new WeakMap();
 const boxes=[{checked:false},{checked:false}];
 const nodes=table._rows.map((r,i)=>({dataset:{selectionId:r.id},querySelector:()=>boxes[i]}));
 table._body={querySelectorAll:()=>nodes};table._syncSelectAll=()=>{};
 table._render=()=>assert.fail("selection must not rebuild cells");table._notifySelection=()=>{};
 table.selectedIds=["b"];assert.deepEqual(boxes.map(b=>b.checked),[false,true]);assert.equal(nodes[1].dataset.selected,"true");
 table.clearSelection();assert.deepEqual(boxes.map(b=>b.checked),[false,false]);
});
test("DataGrid unique row index caches a dataset and rejects duplicate IDs",async()=>{
 const {CuDataGrid}=await import("../packages/web/src/components/data-grid.js");
 const grid=Object.create(CuDataGrid.prototype);
 grid._rows=[{id:"a"},{id:"b"},{id:"b"},{id:"b"},{id:0}];
 assert.equal(grid._uniqueRowIndex("a"),0);assert.equal(grid._uniqueRowIndex("b"),-1);
 assert.equal(grid._uniqueRowIndex(0),4);assert.equal(grid._uniqueRowIndex("missing"),-1);
 const prior=grid._gridRowIndexes;grid._uniqueRowIndex("a");assert.equal(grid._gridRowIndexes,prior);
 grid._rows=[{id:"b"}];assert.equal(grid._uniqueRowIndex("b"),0);assert.notEqual(grid._gridRowIndexes,prior);
});
test("TreeTable reuses ordered hierarchy until dataset query or sort changes",()=>{
 const tree=Object.create(CuTreeTable.prototype);let query="";
 tree.getAttribute=k=>k==="query"?query:null;
 tree._items=[{id:"b",label:"Beta",children:[]},{id:"a",label:"Alpha",children:[]}];
 tree._sortKey="";tree._direction="asc";
 const first=tree._orderedItems();assert.equal(first[0].id,"a");assert.equal(tree._orderedItems(),first);
 tree._direction="desc";const second=tree._orderedItems();assert.notEqual(second,first);assert.equal(second[0].id,"b");
 query="alpha";assert.deepEqual(tree._orderedItems().map(x=>x.id),["a"]);
 tree._items=[];assert.deepEqual(tree._orderedItems(),[]);
});
test("scroll components scope deferred callbacks to their lifecycle",async()=>{
 const read=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");
 const area=await read("scroll-area"),infinite=await read("infinite-scroll");
 assert.match(area,/this\._observer===observer&&this\.isConnected/);
 assert.match(infinite,/this\._fallbackFrame\.cancel\(\)/);
 assert.match(infinite,/this\._viewport\.focus\(\{preventScroll:true\}\)/);
});
