import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeMediaEntries} from "../packages/web/src/components/media-library.js";
import {normalizeDashboardWidgets} from "../packages/web/src/components/dashboard-designer.js";
import {normalizeFormFields} from "../packages/web/src/components/form-designer.js";
import {normalizeObjectSchema} from "../packages/web/src/components/schema-editor.js";
import {REACT_TAGS} from "../packages/react/src/index.js";

test("media library uses file hierarchy normalization and limits media metadata",()=>{
  const rows=normalizeMediaEntries([{id:"folder",name:"Images",kind:"folder",mediaType:"image",src:"x"},{id:"image",name:"Photo",kind:"file",parentId:"folder",mediaType:"image",src:" photo.png "},{id:"orphan",name:"Missing",kind:"file",parentId:"missing",mediaType:"audio",src:"audio.mp3"},{id:"text",name:"Text",kind:"file",mediaType:"unsupported",src:"x"}]);
  assert.deepEqual(rows.map(x=>x.id),["folder","image","text"]);assert.equal(rows[0].src,"");assert.equal(rows[1].src,"photo.png");assert.equal(rows[2].mediaType,"");
});
test("dashboard widgets reuse chart normalization and have bounded unique IDs",()=>{
  const rows=normalizeDashboardWidgets([{id:"a",config:{type:"pie"},items:[{label:"A",value:1},{label:"B",value:Infinity}]},{id:"a"}]);
  assert.equal(rows.length,1);assert.equal(rows[0].config.type,"bar");assert.equal(rows[0].items.length,1);
  assert.equal(normalizeDashboardWidgets(Array.from({length:30},(_,i)=>({id:String(i)}))).length,24);
});
test("form fields reject duplicate and reserved names",()=>{
  const fields=normalizeFormFields([{id:"a",name:"email",type:"email",required:true},{id:"b",name:"email",type:"text"},{id:"c",name:"requestSubmit",type:"text"},{id:"d",name:"agree",type:"checkbox",value:true},{id:"e",name:"x",type:"unsupported"}]);
  assert.deepEqual(fields.map(x=>x.id),["a","d"]);assert.equal(fields[0].required,true);assert.equal(fields[1].value,true);
  assert.equal(normalizeFormFields([{id:"a",name:"name",type:"text"}]).length,1);
});
test("flat schema removes invalid fields and handles special property names",()=>{
  const input=JSON.parse('{"properties":{"__proto__":{"type":"string"},"name":{"type":"string","description":"Name","minLength":2},"bad":{"type":"invalid"}},"required":["name","name","bad","__proto__"]}');
  const value=normalizeObjectSchema(input);
  assert.equal(Object.getPrototypeOf(value.properties),null);assert.deepEqual(Object.keys(value.properties),["__proto__","name"]);assert.deepEqual(value.required,["name","__proto__"]);assert.equal(value.properties.name.minLength,undefined);
});
test("designer workspace components reuse modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["MediaLibrary","media-library",["file-manager","image-gallery","media-player","split-view"]],["DashboardDesigner","dashboard-designer",["dashboard-shell","chart-editor","chart-container"]],["FormDesigner","form-designer",["form","property-inspector","text-field","text-area","number-field","checkbox"]],["SchemaEditor","schema-editor",["property-inspector","json-viewer","split-view"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.ok(html.includes("<cu-"+tag));assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
