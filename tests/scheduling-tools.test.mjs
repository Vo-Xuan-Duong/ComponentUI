import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuScheduler,normalizeScheduleEvents,scheduleDayEvents} from "../packages/web/src/components/scheduler.js";
import {CuGanttChart,normalizeGanttTasks,ganttRange,ganttTaskSpan} from "../packages/web/src/components/gantt-chart.js";
import {validScheduleDate,scheduleDayDistance,validScheduleTime} from "../packages/web/src/components/_schedule.js";
import {CuDataTable} from "../packages/web/src/components/data-table.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("shared schedule dates are strict and day distance ignores DST",()=>{
  assert.equal(validScheduleDate("2024-02-29"),true);
  assert.equal(validScheduleDate("2025-02-29"),false);
  assert.equal(validScheduleDate("2026-04-31"),false);
  assert.equal(scheduleDayDistance("2026-03-07","2026-03-09"),2);
  assert.equal(validScheduleTime("23:59"),true);
  assert.equal(validScheduleTime("24:00"),false);
});
test("scheduler normalizes entries and sorts daily events",()=>{
  const event=(id,start,end,date="2026-11-28")=>({id,title:id,date,start,end});
  const entries=[event("b","11:00","12:00"),event("a","09:00","10:00"),event("a","12:00","13:00"),event("bad","12:00","11:00"),event("other","10:00","11:00","2026-11-29")];
  assert.equal(normalizeScheduleEvents(entries).length,3);
  assert.deepEqual(scheduleDayEvents(entries,"2026-11-28").map(e=>e.id),["a","b"]);
  assert.equal(typeof CuScheduler,"function");
});
test("gantt range and task spans are inclusive, clipped and bounded",()=>{
  const tasks=normalizeGanttTasks([{id:"a",title:"A",start:"2026-11-28",end:"2026-11-30",progress:120,dependencies:["a","b","b"]},{id:"b",title:"B",start:"2026-12-01",end:"2026-12-02"}]);
  assert.equal(tasks[0].progress,100);
  assert.deepEqual(tasks[0].dependencies,["b"]);
  assert.deepEqual(ganttRange(tasks),{start:"2026-11-28",end:"2026-12-02",days:5,truncated:false});
  assert.deepEqual(ganttTaskSpan(tasks[0],ganttRange(tasks)),{offset:0,width:60,clipped:false});
  const clipped=ganttTaskSpan(tasks[0],ganttRange(tasks,"2026-11-29","2026-12-02"));
  assert.deepEqual(clipped,{offset:0,width:50,clipped:true});
  assert.equal(ganttTaskSpan(tasks[0],ganttRange(tasks,"2026-12-01","2026-12-02")),null);
  assert.equal(ganttRange([],"2024-01-01","2026-01-01").days,366);
  assert.equal(Object.getPrototypeOf(CuGanttChart.prototype),CuDataTable.prototype);
});
test("scheduling tools reuse existing components and package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["Scheduler","scheduler",["calendar","date-picker","time-picker","text-field","button","timeline","empty-state","_schedule"]],["GanttChart","gantt-chart",["data-table","progress-bar","_schedule"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
