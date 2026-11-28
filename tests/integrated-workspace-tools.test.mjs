import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeDatabaseTables} from "../packages/web/src/components/database-explorer.js";
import {normalizeApplicationSections} from "../packages/web/src/components/application-shell.js";
import {reportChartItems} from "../packages/web/src/components/report-builder.js";
import {analyzeAutomationGraph} from "../packages/web/src/components/automation-designer.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("database table descriptors preserve snapshots and unique IDs",()=>{
  const source=[{id:"users",schema:"public",rows:[{name:"A",nested:{x:1}},null]},{id:"users",rows:[]},{id:"orders",rows:[]}];
  const tables=normalizeDatabaseTables(source);
  assert.equal(tables.length,2);assert.equal(tables[0].rows.length,1);assert.equal(tables[1].schema,"Default");
  tables[0].rows[0].nested.x=9;assert.equal(source[0].rows[0].nested.x,1);
  assert.equal(normalizeDatabaseTables(Array.from({length:101},(_,i)=>({id:String(i)}))).length,100);
});
test("application sections reject duplicate IDs and preserve disabled state",()=>{
  assert.deepEqual(normalizeApplicationSections([{id:"a"},{id:"a"},{id:"b",label:"Settings",disabled:true},null]),[{id:"a",label:"a",disabled:false},{id:"b",label:"Settings",disabled:true}]);
});
test("report charts derive finite values from group totals",()=>{
  assert.deepEqual(reportChartItems({rows:[{label:"North",total:120},{label:"South",total:0},{label:"Invalid",total:null},{label:"Overflow",total:Infinity}]}),[{label:"North",value:120},{label:"South",value:0}]);
});
test("automation analysis detects directed cycles and orders dependencies",()=>{
  const nodes=[{id:"a"},{id:"b"},{id:"c"}];
  assert.deepEqual(analyzeAutomationGraph({nodes,edges:[{from:"a",to:"b"},{from:"b",to:"c"}]}),{valid:true,cyclic:false,order:["a","b","c"],nodeCount:3,edgeCount:2});
  const cyclic=analyzeAutomationGraph({nodes,edges:[{from:"a",to:"b"},{from:"b",to:"a"}]});
  assert.equal(cyclic.valid,false);assert.equal(cyclic.cyclic,true);assert.deepEqual(cyclic.order,[]);
  assert.equal(analyzeAutomationGraph({nodes:[],edges:[]}).valid,false);
});
test("workspace tools reuse modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["DatabaseExplorer","database-explorer",["data-inspector","tree-view","split-view"]],["ApplicationShell","application-shell",["app-shell","sidebar","menu-bar","command-palette"]],["ReportBuilder","report-builder",["query-builder","pivot-table","chart-container"]],["AutomationDesigner","automation-designer",["node-editor","workflow-editor","tabs"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.ok(html.includes("<cu-"+tag));assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
