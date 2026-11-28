import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeInspectorObjects,resolveInspectorObject,normalizeDesignComponents,normalizeFormFields,buildFormSchema} from "../packages/web/src/components/index.js";
const source=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");

test("inspector and designer preserve normalized controlled identities",()=>{
  const objects=normalizeInspectorObjects([{id:"a",properties:[{key:"visible",type:"boolean",value:true}]},{id:"a"},{id:"b"}]);
  assert.equal(objects.length,2);
  assert.equal(resolveInspectorObject(objects,"b"),"b");
  assert.equal(resolveInspectorObject(objects,"missing"),"a");
  assert.equal(objects[0].properties[0].value,true);
  assert.equal(normalizeDesignComponents([{id:"a",type:"button"},{id:"a",type:"card"},{id:"b",type:"unknown"}]).length,1);
});
test("form schema keeps field type and required declarations consistent",()=>{
  const fields=normalizeFormFields([{id:"a",name:"age",type:"number",required:true},{id:"b",name:"active",type:"checkbox"},{id:"c",name:"age",type:"text"},{id:"d",name:"submit",type:"text"}]);
  assert.equal(fields.length,2);
  const schema=buildFormSchema(fields);
  assert.equal(schema.properties.age.type,"number");
  assert.equal(schema.properties.active.type,"boolean");
  assert.deepEqual(schema.required,["age"]);
});
test("advanced composition uses shared search, fields, empty states and event boundaries",async()=>{
  const inspector=await source("property-inspector");
  assert.match(inspector,/<cu-search-box/);
  assert.match(inspector,/<cu-property-grid/);
  assert.match(inspector,/this\._shownObject!==object/);
  const designer=await source("component-designer");
  assert.match(designer,/cu-empty-state/);
  assert.match(designer,/this\._type\.addEventListener\(type,e=>e\.stopPropagation\(\)\)/);
  const form=await source("form-designer");
  assert.match(form,/<cu-empty-state/);
  assert.match(form,/this\._submit\.disabled=!this\._fields\.length/);
  const builder=await source("form-builder");
  assert.match(builder,/this\._schema\.addEventListener\(type,e=>e\.stopPropagation\(\)\)/);
});
