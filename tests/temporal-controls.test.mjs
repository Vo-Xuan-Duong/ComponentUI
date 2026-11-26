import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuTimePicker,CuDateRangePicker,splitDateRange,dateRangeValidity} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("temporal elements import in Node and expose form contracts",()=>{
  assert.equal(CuTimePicker.formAssociated,true);
  assert.equal(CuDateRangePicker.formAssociated,true);
  assert.ok(CuTimePicker.observedAttributes.includes("step"));
  for(const Type of [CuTimePicker,CuDateRangePicker]){
    assert.ok(Type.observedAttributes.includes("readonly"));
    assert.equal(typeof Type.prototype.formResetCallback,"function");
    assert.equal(typeof Type.prototype.formStateRestoreCallback,"function");
  }
});
test("ISO range parser rejects invalid days and preserves partial values",()=>{
  assert.deepEqual(splitDateRange("2024-02-29/2024-03-01"),{start:"2024-02-29",end:"2024-03-01"});
  assert.deepEqual(splitDateRange("1900-02-29/2000-02-29"),{start:"",end:"2000-02-29"});
  assert.deepEqual(splitDateRange("2026-04-31/"),{start:"",end:""});
  assert.deepEqual(splitDateRange("bad"),{start:"",end:""});
});
test("date range constraints accept optional emptiness and inclusive boundaries",()=>{
  assert.deepEqual(dateRangeValidity("","").flags,{});
  assert.deepEqual(dateRangeValidity("","",{required:true}).flags,{valueMissing:true});
  assert.equal(dateRangeValidity("2026-11-26","").field,"end");
  assert.deepEqual(dateRangeValidity("2026-11-26","2026-11-26",{min:"2026-11-26",max:"2026-11-26"}).flags,{});
  assert.deepEqual(dateRangeValidity("2026-11-27","2026-11-26").flags,{customError:true});
  assert.deepEqual(dateRangeValidity("2026-11-26","2026-12-01",{max:"2026-11-30"}).flags,{rangeOverflow:true});
  assert.deepEqual(dateRangeValidity("2026-11-26","2026-12-01",{min:"2026-11-27"}).flags,{rangeUnderflow:true});
  assert.deepEqual(dateRangeValidity("2026-02-30","2026-03-01").flags,{badInput:true});
});
test("DateRangePicker controlled value, reset and restore use an ISO interval",()=>{
  const field=Object.create(CuDateRangePicker.prototype);
  field._start={value:""};field._end={value:""};field._syncForm=()=>{};
  field._defaultValue="2026-01-01/2026-01-02";
  assignCuProperties(field,"cu-date-range-picker",{value:"2026-11-26/2026-12-01"});
  assert.equal(field.start,"2026-11-26");assert.equal(field.end,"2026-12-01");
  field.formResetCallback();assert.equal(field.value,field._defaultValue);
  field.formStateRestoreCallback("2026-03-01/2026-03-02");
  assert.equal(field.value,"2026-03-01/2026-03-02");
});
test("temporal components are registered, exported and demonstrated",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["TimePicker","time-picker"],["DateRangePicker","date-range-picker"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    const contract=JSON.parse(await read("../design-system/components/"+tag+".contract.json"));
    assert.equal(contract.status,"preview");
    assert.equal(contract.accessibility.formAssociated,true);
  }
});
