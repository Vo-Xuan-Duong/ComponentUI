import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuSegmentedControl,CuTimeline,normalizeSegmentOptions,resolveSegmentValue,normalizeTimelineItems} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("segment options reject duplicate values and disabled selections",()=>{
  const items=normalizeSegmentOptions([{value:"a"},{value:"a",label:"duplicate"},{value:"b",disabled:true},null,{value:""}]);
  assert.equal(items.length,2);assert.equal(items[0].label,"a");
  assert.equal(resolveSegmentValue("a",items),"a");
  assert.equal(resolveSegmentValue("b",items),"");
  assert.equal(resolveSegmentValue("missing",items),"");
});
test("segmented control preserves requested value until options arrive",()=>{
  const el=Object.create(CuSegmentedControl.prototype);
  el._items=[];el._sync=()=>{};el._render=()=>{};
  el.value="list";assert.equal(el.value,"");
  assignCuProperties(el,"cu-segmented-control",{items:[{value:"grid"},{value:"list"}]});
  assert.equal(el.value,"list");
  el._default="grid";el.formResetCallback();assert.equal(el.value,"grid");
  el.formStateRestoreCallback("list");assert.equal(el.value,"list");
});
test("segmented control prevents disabled selection",()=>{
  const el=Object.create(CuSegmentedControl.prototype);
  el._items=normalizeSegmentOptions([{value:"a"},{value:"b",disabled:true}]);
  el._requested="a";el._locked=()=>false;el._sync=()=>{};
  assert.equal(el.select("b"),false);assert.equal(el.value,"a");
  assert.equal(el.select("a"),false);
});
test("timeline normalizes statuses and preserves supplied order",()=>{
  const items=normalizeTimelineItems([{id:"1",title:" Created ",status:"success"},{id:"1",title:"duplicate"},{id:"2",title:"Review",status:"unknown",action:"View"},{id:"3",title:" "}]);
  assert.deepEqual(items.map(x=>x.id),["1","2"]);
  assert.equal(items[0].title,"Created");assert.equal(items[1].status,"neutral");assert.equal(items[1].action,"View");
});
test("timeline exposes defensive item snapshots and controlled React items",()=>{
  const el=Object.create(CuTimeline.prototype);el._items=[];el._render=()=>{};
  const items=[{id:"1",title:"Activity"}];assignCuProperties(el,"cu-timeline",{items});
  items[0].title="changed";el.items[0].title="also changed";assert.equal(el.items[0].title,"Activity");
});
test("segment and timeline are registered, exported and demonstrated",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["SegmentedControl","segmented-control"],["Timeline","timeline"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(CuSegmentedControl.formAssociated,true);
  const segment=await read("../packages/web/src/components/segmented-control.js");
  assert.ok(segment.includes('role="radiogroup"'));assert.ok(segment.includes('input.type="radio"'));
  const timeline=await read("../packages/web/src/components/timeline.js");
  assert.ok(timeline.includes('createElement("time")'));assert.ok(timeline.includes('"cu-action"'));
});
