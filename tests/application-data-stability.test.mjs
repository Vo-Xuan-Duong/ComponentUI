import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuAPIExplorer} from "../packages/web/src/components/api-explorer.js";
import {CuDataSourceEditor} from "../packages/web/src/components/data-source-editor.js";
import {CuReportBuilder} from "../packages/web/src/components/report-builder.js";
const read=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");
if(!globalThis.CustomEvent)globalThis.CustomEvent=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};
const field=value=>({value,attributes:new Map(),focused:false,setAttribute(k,v){this.attributes.set(k,v);},removeAttribute(k){this.attributes.delete(k);},focus(){this.focused=true;}});
test("API validation attaches errors to the correct shared field and only emits valid requests",()=>{
 const api=Object.create(CuAPIExplorer.prototype),events=[];
 api._method=field("GET");api._url=field("invalid");api._body=field("hello");api._error={};api.hasAttribute=()=>false;api.dispatchEvent=e=>{events.push(e.detail);return true;};
 assert.equal(api.submit(),false);assert.equal(api._url.focused,true);assert.ok(api._url.attributes.get("error"));
 api._url.value="https://example.com/items";assert.equal(api.submit(),false);assert.ok(api._body.attributes.get("error"));assert.equal(api._url.attributes.has("error"),false);
 api._method.value="POST";assert.equal(api.submit(),true);assert.equal(api._body.attributes.has("error"),false);assert.equal(events.length,1);assert.equal(events[0].request.method,"POST");
});
test("data source skips identical extraction but responds to a different pointer",()=>{
 const editor=Object.create(CuDataSourceEditor.prototype);let writes=0,path="/items";
 editor._api={response:{body:'{"items":[{"id":1}],"other":[{"id":2}]}'}};editor._path=field(path);editor._status={dataset:{}};editor._inspector={set rows(v){writes++;}};
 editor.getAttribute=k=>k==="record-path"?path:null;
 editor._extract();editor._extract();assert.equal(writes,1);assert.equal(editor.rows[0].id,1);
 path="/other";editor._extract();assert.equal(writes,2);assert.equal(editor.rows[0].id,2);
 path="/missing";editor._extract();assert.equal(editor.rows.length,0);assert.ok(editor._path.attributes.get("error"));
});
test("report configuration updates pivot without rewriting query builder",()=>{
 const report=Object.create(CuReportBuilder.prototype);
 report._pivot={rowField:"",columnField:"",valueField:"",aggregate:"count"};
 report._builder={set value(v){assert.fail("query draft must not be rewritten");}};
 let renders=0;report._renderChart=()=>renders++;
 report.config={rowField:"region",aggregate:"sum",valueField:"amount"};
 assert.equal(report._pivot.rowField,"region");assert.equal(report._pivot.aggregate,"sum");assert.equal(report._pivot.valueField,"amount");assert.equal(renders,1);
});
test("schema database and record inspectors preserve shared controls and stable identities",async()=>{
 const schema=await read("schema-editor"),database=await read("database-explorer"),data=await read("data-inspector");
 assert.match(schema,/<cu-text-field label="Property name" required>/);
 assert.match(schema,/this\._name\.setAttribute\("error"/);
 assert.match(database,/<cu-search-box aria-label="Find tables"/);
 assert.match(database,/key="table:"\+t\.id/);
 assert.match(data,/this\._fieldSignature!==signature/);
 assert.match(data,/this\._visible\.get\(this\._selected\)/);
});
