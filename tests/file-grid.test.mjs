import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuFileExplorer,CuDataGrid,CuDataTable,normalizeFileEntries,fileExplorerPath,listFileEntries,coerceGridValue} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("file explorer excludes duplicate IDs, cycles, orphans and file parents",()=>{
  const items=normalizeFileEntries([{id:"a",name:"Root",kind:"folder"},{id:"a",name:"duplicate",kind:"file"},{id:"b",parentId:"a",name:"File",kind:"file"},{id:"c",parentId:"missing",name:"Orphan",kind:"file"},{id:"d",parentId:"e",name:"D",kind:"folder"},{id:"e",parentId:"d",name:"E",kind:"folder"},{id:"f",parentId:"b",name:"Child of file",kind:"file"}]);
  assert.deepEqual(items.map(x=>x.id),["a","b"]);
});
test("file explorer paths, folder ordering and accent-insensitive search",()=>{
  const items=normalizeFileEntries([{id:"root",name:"Root",kind:"folder"},{id:"sub",parentId:"root",name:"Sub",kind:"folder"},{id:"f10",parentId:"root",name:"Tệp 10",kind:"file"},{id:"f2",parentId:"root",name:"Tệp 2",kind:"file"}]);
  assert.deepEqual(fileExplorerPath(items,"sub").map(x=>x.id),["root","sub"]);
  assert.deepEqual(listFileEntries(items,"root").map(x=>x.id),["sub","f2","f10"]);
  assert.deepEqual(listFileEntries(items,"root","tep 2").map(x=>x.id),["f2"]);
  assert.deepEqual(fileExplorerPath(items,"missing"),[]);
});
test("file explorer uses defensive items and React property bindings",()=>{
  const el=Object.create(CuFileExplorer.prototype);el._items=[];el._selected="";el._render=()=>{};
  const source=[{id:"a",name:"Folder",kind:"folder"}];assignCuProperties(el,"cu-file-explorer",{items:source});
  source[0].name="Changed";el.items[0].name="Changed again";assert.equal(el.items[0].name,"Folder");
});
test("data grid inherits data table and validates typed edits",()=>{
  assert.ok(CuDataGrid.prototype instanceof CuDataTable);
  assert.equal(coerceGridValue({type:"number",min:0,step:1},"5",3).value,5);
  assert.equal(coerceGridValue({type:"number",min:0},"-1",3).valid,false);
  assert.equal(coerceGridValue({type:"boolean"},true,false).value,true);
  assert.equal(coerceGridValue({type:"select",options:[{value:"a"},{value:"b",disabled:true}]},"b","a").valid,false);
  assert.equal(coerceGridValue({required:true},"","a").valid,false);
});
test("data grid rejects readonly, duplicate IDs and non-editable cells",()=>{
  const el=Object.create(CuDataGrid.prototype);
  el._rows=[{id:"a"},{id:"a"},{id:"b"}];el.hasAttribute=()=>false;el.getAttribute=()=>null;
  assert.equal(el._canEdit({editable:true},el._rows[0]),false);
  assert.equal(el._canEdit({editable:false},el._rows[2]),false);
  assert.equal(el._canEdit({editable:true},el._rows[2]),true);
});
test("components are registered and grid preserves table extension hook",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["FileExplorer","file-explorer"],["DataGrid","data-grid"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuCellChange,"cu-cell-change");
  assert.ok((await read("../packages/web/src/components/data-table.js")).includes("this._renderDataCell(row,col,id)"));
  const grid=await read("../packages/web/src/components/data-grid.js");assert.ok(grid.includes("extends CuDataTable"));assert.ok(grid.includes("super._actionsFor(row)"));
});
