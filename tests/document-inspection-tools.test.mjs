import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {clampPdfPage} from "../packages/web/src/components/pdf-viewer.js";
import {normalizeResources,normalizeResourceEvents} from "../packages/web/src/components/resource-calendar.js";
import {normalizeTimelineEntries} from "../packages/web/src/components/timeline-editor.js";
import {normalizeInspectorObjects,resolveInspectorObject} from "../packages/web/src/components/property-inspector.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("PDF page selection is bounded and handles empty documents",()=>{
  assert.equal(clampPdfPage(0,5),1);
  assert.equal(clampPdfPage(9,5),5);
  assert.equal(clampPdfPage(2.9,5),2);
  assert.equal(clampPdfPage(NaN,5),1);
  assert.equal(clampPdfPage(1,0),0);
  assert.equal(clampPdfPage(1,Infinity),0);
});
test("resource data reuses scheduler validation and unique IDs",()=>{
  assert.deepEqual(normalizeResources([{id:"a",label:"Room A"},{id:"a"},{id:"b"},null]),[{id:"a",label:"Room A"},{id:"b",label:"b"}]);
  const event={id:"e",title:"Meeting",date:"2026-11-28",start:"09:00",end:"10:00",resourceId:"a"};
  const events=normalizeResourceEvents([{...event,end:"08:00",resourceId:"bad"},event,{...event,resourceId:"b"},{...event,id:"missing",resourceId:""}]);
  assert.equal(events.length,1);assert.equal(events[0].resourceId,"a");
});
test("timeline entries reuse normalization and chronological sorting",()=>{
  const items=normalizeTimelineEntries([{id:"b",title:"B",datetime:"2026-12-01"},{id:"a",title:"A",datetime:"2026-11-28",status:"success"},{id:"c",title:"C",datetime:"2025-02-29"}]);
  assert.deepEqual(items.map(x=>x.id),["a","b"]);assert.equal(items[0].status,"success");assert.equal(items[0].time,"2026-11-28");
});
test("inspector uses typed property descriptors and resolves selection",()=>{
  const objects=normalizeInspectorObjects([{id:"a",properties:[{key:"n",type:"number",value:4}]},{id:"b",properties:[{key:"flag",type:"boolean",value:true}]},{id:"a"}]);
  assert.equal(objects.length,2);assert.equal(objects[0].properties[0].value,4);
  assert.equal(objects[1].properties[0].value,true);assert.equal(resolveInspectorObject(objects,"b"),"b");assert.equal(resolveInspectorObject(objects,"missing"),"a");assert.equal(resolveInspectorObject([],"a"),"");
});
test("document tools reuse existing components and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["PDFViewer","pdf-viewer",["image-viewer","button","spinner","empty-state"]],["ResourceCalendar","resource-calendar",["scheduler","select"]],["TimelineEditor","timeline-editor",["timeline","date-picker","text-field","select","button"]],["PropertyInspector","property-inspector",["tree-view","property-grid","split-view","empty-state"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
