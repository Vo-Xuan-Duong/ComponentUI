import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuDockLayout,CuKanbanBoard,normalizeDockLayout,normalizeKanbanLanes,normalizeKanbanItems,moveKanbanItem} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("dock layout clamps sizes and preserves collapsed state",()=>{
  assert.deepEqual(normalizeDockLayout(),{start:24,end:24,bottom:28,startOpen:true,endOpen:true,bottomOpen:true});
  const v=normalizeDockLayout({start:99,end:1,bottom:Infinity,startOpen:false});
  assert.equal(v.start,40);assert.equal(v.end,10);assert.equal(v.bottom,28);assert.equal(v.startOpen,false);
});
test("dock layout property is defensive and React bound",()=>{
  const el=Object.create(CuDockLayout.prototype);el._finish=()=>{};el._sync=()=>{};
  assignCuProperties(el,"cu-dock-layout",{layout:{start:30,bottomOpen:false}});
  assert.equal(el.layout.start,30);assert.equal(el.layout.bottomOpen,false);
  el.layout.start=10;assert.equal(el.layout.start,30);
});
test("kanban lanes and tasks normalize duplicates and invalid references",()=>{
  const lanes=normalizeKanbanLanes([{id:"a"},{id:"a",label:"duplicate"},{id:"b",label:"Done"}]);
  assert.deepEqual(lanes.map(x=>x.id),["a","b"]);
  const items=normalizeKanbanItems([{id:"1",laneId:"a",title:" Task "},{id:"1",laneId:"b",title:"duplicate"},{id:"2",laneId:"missing",title:"Invalid"}],lanes);
  assert.equal(items.length,1);assert.equal(items[0].title,"Task");
});
test("kanban movement preserves original records and supports lane reordering",()=>{
  const items=[{id:"1",laneId:"a",title:"One"},{id:"2",laneId:"a",title:"Two"},{id:"3",laneId:"b",title:"Three"}];
  const next=moveKanbanItem(items,"1","b","3");
  assert.equal(items[0].laneId,"a");assert.deepEqual(next.filter(x=>x.laneId==="b").map(x=>x.id),["1","3"]);
  assert.deepEqual(moveKanbanItem(items,"2","a","1").filter(x=>x.laneId==="a").map(x=>x.id),["2","1"]);
  assert.equal(moveKanbanItem(items,"2","a"),items);
  assert.equal(moveKanbanItem(items,"1","b","2"),items);
});
test("kanban property binding accepts tasks before lanes and returns snapshots",()=>{
  const el=Object.create(CuKanbanBoard.prototype);el._lanes=[];el._source=[];el._items=[];el._render=()=>{};
  el.items=[{id:"1",laneId:"a",title:"One"}];assert.equal(el.items.length,0);
  assignCuProperties(el,"cu-kanban-board",{lanes:[{id:"a",label:"Todo"}]});
  assert.equal(el.items.length,1);el.items[0].title="Changed";assert.equal(el.items[0].title,"One");
});
test("new modules are registered with events, contracts and playground examples",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["DockLayout","dock-layout"],["KanbanBoard","kanban-board"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuMove,"cu-move");
  assert.ok((await read("../packages/web/src/components/dock-layout.js")).includes('role="separator"'));
  assert.ok((await read("../packages/web/src/components/kanban-board.js")).includes('select.setAttribute("aria-label","Move "'));
});
