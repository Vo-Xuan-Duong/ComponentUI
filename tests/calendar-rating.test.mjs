import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuCalendar,CuRating,calendarDays,moveCalendarDate,normalizeRating} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
import {getIconNodes} from "../packages/icons/src/icons.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("calendar grid has 42 days and respects Sunday or Monday starts",()=>{
  const sunday=calendarDays("2026-11",0);
  assert.equal(sunday.length,42);
  assert.deepEqual(sunday[0],{value:"2026-11-01",day:1,inMonth:true});
  const monday=calendarDays("2026-11",1);
  assert.equal(monday[0].value,"2026-10-26");
  assert.equal(monday.filter(day=>day.inMonth).length,30);
  assert.equal(calendarDays("2024-02",1).filter(day=>day.inMonth).length,29);
  assert.equal(calendarDays("1900-02",1).filter(day=>day.inMonth).length,28);
  assert.deepEqual(calendarDays("2026-13"),[]);
});
test("calendar date movement clamps month and year, handles leap day and bounds",()=>{
  assert.equal(moveCalendarDate("2024-01-31",1,"month"),"2024-02-29");
  assert.equal(moveCalendarDate("2024-02-29",1,"year"),"2025-02-28");
  assert.equal(moveCalendarDate("2026-12-31",1),"2027-01-01");
  assert.equal(moveCalendarDate("2026-01-01",-1),"2025-12-31");
  assert.equal(moveCalendarDate("0001-01-01",-1),"");
  assert.equal(moveCalendarDate("9999-12-31",1),"");
  assert.equal(moveCalendarDate("2026-02-30",1),"");
});
test("rating normalization bounds, rounds and supplies defaults",()=>{
  assert.deepEqual(normalizeRating(3.6),{value:4,max:5});
  assert.deepEqual(normalizeRating(-2,5),{value:0,max:5});
  assert.deepEqual(normalizeRating(99,20),{value:10,max:10});
  assert.deepEqual(normalizeRating("invalid",null),{value:0,max:5});
  assert.deepEqual(normalizeRating(3,0),{value:1,max:1});
});
test("calendar and rating expose form lifecycle and controlled values",()=>{
  for(const Type of [CuCalendar,CuRating]){
    assert.equal(Type.formAssociated,true);
    assert.ok(Type.observedAttributes.includes("required"));
    assert.ok(Type.observedAttributes.includes("readonly"));
    assert.equal(typeof Type.prototype.formResetCallback,"function");
    assert.equal(typeof Type.prototype.formStateRestoreCallback,"function");
  }
  const calendar=Object.create(CuCalendar.prototype);
  calendar._render=()=>{};calendar._defaultValue="2026-01-01";
  assignCuProperties(calendar,"cu-calendar",{value:"2026-11-26"});
  assert.equal(calendar.value,"2026-11-26");
  calendar.formResetCallback();assert.equal(calendar.value,"2026-01-01");
  calendar.formStateRestoreCallback("2024-02-29");
  assert.equal(calendar.value,"2024-02-29");
  const rating=Object.create(CuRating.prototype);
  rating._sync=()=>{};rating.getAttribute=()=>null;rating._defaultValue=2;
  assignCuProperties(rating,"cu-rating",{value:4});
  assert.equal(rating.value,4);
  rating.formResetCallback();assert.equal(rating.value,2);
  rating.formStateRestoreCallback("5");assert.equal(rating.value,5);
});
test("calendar bounds and readonly guard user selection",()=>{
  const calendar=Object.create(CuCalendar.prototype);
  const attrs=new Map([["min","2026-11-01"],["max","2026-11-30"]]);
  calendar.getAttribute=k=>attrs.get(k)??null;calendar.hasAttribute=k=>attrs.has(k);
  assert.equal(calendar._allowed("2026-11-01"),true);
  assert.equal(calendar._allowed("2026-12-01"),false);
  assert.equal(calendar._clamp("2026-12-01"),"2026-11-30");
  calendar._value="2026-11-01";attrs.set("readonly","");
  calendar._select("2026-11-02");assert.equal(calendar.value,"2026-11-01");
});
test("component exports, contracts, demos, keyboard and bundled star are wired",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["Calendar","calendar"],["Rating","rating"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    const contract=JSON.parse(await read("../design-system/components/"+tag+".contract.json"));
    assert.equal(contract.status,"preview");assert.equal(contract.accessibility.formAssociated,true);
  }
  const calendar=await read("../packages/web/src/components/calendar.js");
  for(const key of ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown"])
    assert.ok(calendar.includes('case "'+key+'"'));
  assert.ok(calendar.includes('role","gridcell'));
  assert.ok(getIconNodes("star"));
});
