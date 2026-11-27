import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeLogEntries,filterLogEntries,CuLogViewer} from "../packages/web/src/components/log-viewer.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";

test("logs normalize IDs, levels and copies",()=>{
  const original=[{id:"a",message:"Ứng dụng đã mở",level:"info"},{id:"b",message:"Network failed",level:"error",source:"Network"},{id:"a",message:"duplicate"},{id:"c",message:"Other",level:"invalid"},null,{id:"d"}];
  const logs=normalizeLogEntries(original);
  assert.deepEqual(logs.map(x=>x.id),["a","b","c"]);
  assert.equal(logs[2].level,"info");
  original[0].message="changed";
  assert.equal(logs[0].message,"Ứng dụng đã mở");
  assert.deepEqual(filterLogEntries(logs,"ung dung da").map(x=>x.id),["a"]);
  assert.deepEqual(filterLogEntries(logs,"network failed","error").map(x=>x.id),["b"]);
  assert.deepEqual(filterLogEntries(logs,"network","info"),[]);
});
test("LogViewer exposes filters and defensive copies",()=>{
  const viewer=Object.create(CuLogViewer.prototype),attrs=new Map();
  viewer.getAttribute=k=>attrs.get(k)??null;
  viewer.setAttribute=(k,v)=>attrs.set(k,String(v));
  viewer._render=()=>{};
  viewer.items=[{id:"a",message:"Ready"}];
  viewer.items[0].message="changed";
  assert.equal(viewer.items[0].message,"Ready");
  viewer.level="bad";assert.equal(viewer.level,"all");
  viewer.query="ready";assert.equal(viewer.query,"ready");
  assert.equal(REACT_TAGS.LogViewer,"cu-log-viewer");
  assignCuProperties(viewer,"cu-log-viewer",{items:[{id:"b",message:"test"}],query:"test",level:"error"});
  assert.equal(viewer.items[0].id,"b");assert.equal(viewer.level,"error");
});
test("LogViewer composes existing primitives and is exported",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const source=await read("../packages/web/src/components/log-viewer.js");
  for(const name of ["search-box","select","button","virtual-list","empty-state","icon"]){
    assert.ok(source.includes('import "./'+name+'.js"'));
    assert.ok(source.includes("<cu-"+name));
  }
  assert.ok(source.includes("event.stopPropagation()"));
  assert.ok(source.includes("this._text.textContent"));
  assert.match(await read("../apps/playground-web/index.html"),/<cu-log-viewer id="wc-log-viewer"/);
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  assert.equal(pkg.exports["./components/log-viewer"].default,"./dist/components/log-viewer.js");
});
