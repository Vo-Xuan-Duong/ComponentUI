import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {filterDashboardWidgets} from "../packages/web/src/components/dashboard-viewer.js";
import {normalizeProjectWorkspace} from "../packages/web/src/components/project-workspace.js";
import {normalizeSearchRecords,filterSearchRecords} from "../packages/web/src/components/search-workspace.js";
import {normalizeManagedDocuments} from "../packages/web/src/components/document-manager.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("dashboard viewer shares normalized chart descriptors and accent-insensitive filters",()=>{
  const items=[{id:"a",config:{title:"Doanh thu",description:"Đà Nẵng"},items:[{label:"A",value:1}]},{id:"b",config:{title:"Costs"},items:[]}];
  assert.deepEqual(filterDashboardWidgets(items,"doanh da nang").map(x=>x.id),["a"]);
  assert.equal(filterDashboardWidgets(items,"missing").length,0);
});
test("project workspace normalizes independent views",()=>{
  const v=normalizeProjectWorkspace({tasks:[{id:"a",title:"Task",start:"2026-11-28",end:"2026-11-29",progress:150},{id:"bad",title:"Invalid",start:"2026-02-30",end:"2026-03-01"}],events:[{id:"e",title:"Review",date:"2026-11-28",start:"09:00",end:"10:00"}],workItems:[{id:"w",laneId:"todo",title:"Work"},{id:"bad",laneId:"unknown",title:"Unknown"}]});
  assert.equal(v.tasks.length,1);assert.equal(v.tasks[0].progress,100);assert.equal(v.events.length,1);assert.equal(v.lanes.length,3);assert.equal(v.workItems.length,1);
});
test("search records support diacritics, all terms and category filtering",()=>{
  const rows=normalizeSearchRecords([{id:"a",title:"Đồ án",keywords:["thiết kế"],category:"Projects"},{id:"b",title:"Đồ án",category:"Documents"},{id:"a",title:"Duplicate"}]);
  assert.equal(rows.length,2);assert.deepEqual(filterSearchRecords(rows,"do an thiet ke").map(x=>x.id),["a"]);assert.deepEqual(filterSearchRecords(rows,"do an","Documents").map(x=>x.id),["b"]);
  assert.equal(normalizeSearchRecords(Array.from({length:10001},(_,i)=>({id:String(i)}))).length,10000);
});
test("managed documents preserve metadata on valid file tree entries",()=>{
  const items=[{id:"folder",kind:"folder",name:"Docs",pages:["ignore"]},{id:"a",kind:"file",name:"A",parentId:"folder",pages:["a.png","",null],notes:"# A"},{id:"orphan",kind:"file",name:"Missing",parentId:"missing"}];
  const rows=normalizeManagedDocuments(items);assert.deepEqual(rows.map(x=>x.id),["folder","a"]);assert.deepEqual(rows[0].pages,[]);assert.deepEqual(rows[1].pages,["a.png"]);assert.equal(rows[1].notes,"# A");rows[1].pages.push("new.png");assert.equal(items[1].pages.length,3);
});
test("productivity workspace tools reuse existing modules and expose exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["DashboardViewer","dashboard-viewer",["dashboard-designer","dashboard-shell","chart-container","search-box"]],["ProjectWorkspace","project-workspace",["gantt-chart","scheduler","workflow-editor","tabs"]],["SearchWorkspace","search-workspace",["search-box","select","virtual-list","split-view"]],["DocumentManager","document-manager",["file-manager","document-workspace","split-view"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.ok(html.includes("<cu-"+tag));assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
