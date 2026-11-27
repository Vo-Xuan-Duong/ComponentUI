import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuPivotTable,buildPivotTable} from "../packages/web/src/components/pivot-table.js";
import {CuSpreadsheet,normalizeSheet,parseCellAddress,calculateSheet} from "../packages/web/src/components/spreadsheet.js";
import {CuDataGrid} from "../packages/web/src/components/data-grid.js";
import {evaluateFormula} from "../packages/web/src/components/formula-input.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("pivot aggregates original records and handles missing numeric values",()=>{
  const rows=[{team:"A",period:"Q1",n:2},{team:"A",period:"Q1",n:4},{team:"A",period:"Q2",n:9},{team:"B",period:"Q1",n:""}];
  const config={rowField:"team",columnField:"period",valueField:"n",aggregate:"average"};
  const r=buildPivotTable(rows,config);
  assert.equal(r.rows[0].group0,3);assert.equal(r.rows[0].group1,9);assert.equal(r.rows[0].total,5);
  assert.equal(r.rows[1].total,null);assert.equal(r.total,5);
  assert.equal(buildPivotTable(rows,{...config,aggregate:"count"}).total,4);
  assert.equal(buildPivotTable(rows,{...config,aggregate:"sum"}).total,15);
  assert.ok(buildPivotTable(Array.from({length:101},(_,i)=>({team:i})),{rowField:"team"}).error);
  assert.equal(typeof CuPivotTable,"function");
});
test("spreadsheet evaluates references and rejects invalid or circular dependencies",()=>{
  const cells=[["2","3","=A1*B1"],["=C1+1","=A2/0","=Z1"],["=B3","=A3","=A3"],["text","=A4+1","=B2"]];
  const result=calculateSheet(cells);
  assert.deepEqual(result[0],["2","3",6]);assert.deepEqual(result[1],[7,"#DIV/0!","#REF!"]);
  assert.deepEqual(result[2],["#CYCLE!","#CYCLE!","#CYCLE!"]);assert.deepEqual(result[3],["text","#VALUE!","#DIV/0!"]);
  assert.deepEqual(parseCellAddress("b2"),{row:1,column:1});
  assert.equal(parseCellAddress("AA1"),null);
  assert.deepEqual(normalizeSheet([[1],[2,3]]),[["1",""],["2","3"]]);
  assert.equal(Object.getPrototypeOf(CuSpreadsheet.prototype),CuDataGrid.prototype);
});
test("formula reference hook is optional and existing numeric formulas still work",()=>{
  assert.equal(evaluateFormula("=2+3*4").result,14);
  assert.equal(evaluateFormula("=A1+2").valid,false);
  assert.equal(evaluateFormula("=A1+2",key=>key==="A1"?5:NaN).result,7);
  assert.equal(evaluateFormula("=Math.PI",()=>1).valid,false);
});
test("data tools expose package exports, demo and shared dependencies",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["PivotTable","pivot-table",["data-table","select","query-builder","filter-utils","empty-state"]],["Spreadsheet","spreadsheet",["data-grid","formula-input"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
