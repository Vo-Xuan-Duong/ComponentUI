import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuMultiSelect,CuToast,normalizeMultiOptions,normalizeMultiValue,normalizeToast} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("MultiSelect normalizes unique options and enabled selected values",()=>{
  const items=normalizeMultiOptions([{value:"a",label:"Alpha"},{value:"a"},{value:"b",disabled:true},{value:"c"},null,{value:3}]);
  assert.deepEqual(items,[{value:"a",label:"Alpha",disabled:false},{value:"b",label:"b",disabled:true},{value:"c",label:"c",disabled:false}]);
  assert.deepEqual(normalizeMultiValue(["c","b","a","a","missing"],items),["c","a"]);
  assert.deepEqual(normalizeMultiValue(["c","a"],items,1),["c"]);
  assert.deepEqual(normalizeMultiValue(["a"],items,0),[]);
});
test("MultiSelect controlled properties and form state restoration preserve arrays",()=>{
  const field=Object.create(CuMultiSelect.prototype);
  field._items=[];field._value=[];field._sync=()=>{};field.getAttribute=()=>null;
  assignCuProperties(field,"cu-multi-select",{items:[{value:"a"},{value:"b"}],value:["a","b"]});
  assert.deepEqual(field.value,["a","b"]);
  field.value.push("c");assert.deepEqual(field.value,["a","b"]);
  field._defaultValue=["a"];field.formResetCallback();assert.deepEqual(field.value,["a"]);
  field.formStateRestoreCallback('["b"]');assert.deepEqual(field.value,["b"]);
  assert.equal(CuMultiSelect.formAssociated,true);
});
test("Toast normalizes tone, duration and persistent notifications",()=>{
  assert.equal(normalizeToast({}).duration,5000);
  assert.equal(normalizeToast({duration:0}).duration,0);
  assert.equal(normalizeToast({duration:100}).duration,3000);
  assert.equal(normalizeToast({duration:999999}).duration,60000);
  assert.equal(normalizeToast({tone:"invalid"}).tone,"info");
  assert.equal(normalizeToast({tone:"danger"}).tone,"danger");
});
test("Toast deduplicates ids and maintains FIFO queue without a DOM",()=>{
  const toast=Object.create(CuToast.prototype);
  toast._entries=[];toast._sequence=0;toast._drain=()=>{};
  toast.dispatchEvent=()=>true;
  assert.equal(toast.show({id:"first",duration:0}),"first");
  assert.equal(toast.show({id:"first",duration:0}),"first");
  const second=toast.show({duration:0});
  assert.equal(toast._entries.length,2);
  assert.equal(toast._entries[1].data.id,second);
  assert.equal(toast.dismiss("first"),true);
  assert.equal(toast.dismiss("first"),false);
  toast.clear();assert.equal(toast._entries.length,0);
});
test("Toast timer pauses until all active pause reasons are released",()=>{
  const toast=Object.create(CuToast.prototype);
  const entry={paused:new Set(),timer:null,data:{duration:0},remaining:5000};
  toast._pause(entry,"pointer");toast._pause(entry,"focus");
  toast._resume(entry,"pointer");assert.equal(entry.paused.has("focus"),true);
  toast._resume(entry,"focus");assert.equal(entry.paused.size,0);
  assert.equal(entry.timer,null);
});
test("MultiSelect and Toast are exported with contracts and live Playground integration",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["MultiSelect","multi-select"],["Toast","toast"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  const source=await read("../apps/playground-web/main.js");
  assert.ok(source.includes('toastContainer.show('));
  assert.ok(source.includes('getAll("framework")'));
});

test("toast pause invalidates the scheduled timeout token",()=>{
 const toast=Object.create(CuToast.prototype);
 const entry={paused:new Set(),timer:null,timerToken:{},remaining:5000,started:0};
 toast._pause(entry,"document");assert.equal(entry.timerToken,null);assert.equal(entry.paused.has("document"),true);assert.equal(entry.remaining,5000);
});
test("toast visibility listener and stale callback guards are lifecycle scoped",async()=>{
 const source=await read("../packages/web/src/components/toast.js");
 assert.match(source,/addEventListener\("visibilitychange",this\._visibility\)/);
 assert.match(source,/removeEventListener\("visibilitychange",this\._visibility\)/);
 assert.match(source,/entry\.timerToken!==token/);
 assert.match(source,/this\._entries\.includes\(entry\)/);
});
