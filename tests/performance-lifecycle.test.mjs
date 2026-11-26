import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {frameTask,reconcileVirtualWindow} from "../packages/web/src/components/_shared.js";
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
