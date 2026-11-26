import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuDescriptionList,normalizeDescriptionItems,CuScrollArea,CuScrollView,CuDisclosure,CuCollapsible,CuFilePicker,CuFileUpload,CuForm,CuCodeBlock} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("description list normalizes values and protects snapshots",()=>{
  assert.deepEqual(normalizeDescriptionItems([{label:" Name ",value:12},{label:"",value:3},null]),[{label:"Name",value:"12"}]);
  const el=Object.create(CuDescriptionList.prototype);el._items=[];el._render=()=>{};
  const items=[{label:"A",value:"B"}];assignCuProperties(el,"cu-description-list",{items});items[0].value="C";assert.equal(el.items[0].value,"B");
});
test("composed components inherit shared native implementations",()=>{
  assert.ok(CuScrollView.prototype instanceof CuScrollArea);
  assert.ok(CuCollapsible.prototype instanceof CuDisclosure);
  assert.ok(CuFileUpload.prototype instanceof CuFilePicker);
  assert.equal(CuFileUpload.formAssociated,true);
});
test("FilePicker required is reflected via property",()=>{
  const el=Object.create(CuFilePicker.prototype),attrs=new Set();el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assignCuProperties(el,"cu-file-picker",{required:true});assert.equal(el.required,true);
});
test("upload does not request transfer when loading or empty",()=>{
  const el=Object.create(CuFileUpload.prototype);el.hasAttribute=k=>k==="loading";el._files=[];assert.equal(el.requestUpload(),false);
  el.hasAttribute=()=>false;assert.equal(el.requestUpload(),false);
});
test("form methods use actual light DOM form",()=>{
  const el=Object.create(CuForm.prototype);const calls=[];const form={localName:"form",checkValidity:()=>true,reportValidity:()=>true,requestSubmit:()=>calls.push("submit"),reset:()=>calls.push("reset")};
  el._slot={assignedElements:()=>[form]};assert.equal(el.form,form);assert.equal(el.checkValidity(),true);el.requestSubmit();el.reset();assert.deepEqual(calls,["submit","reset"]);
});
test("code block stores text as data",()=>{
  const el=Object.create(CuCodeBlock.prototype);el._sync=()=>{};el.value="<script>alert(1)</script>";assert.equal(el.value,"<script>alert(1)</script>");
});
test("utility exports, catalog and demos are connected",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["List","list"],["ListItem","list-item"],["DescriptionList","description-list"],["Kbd","kbd"],["CodeBlock","code-block"],["Image","image"],["ScrollView","scroll-view"],["Collapsible","collapsible"],["FileUpload","file-upload"],["FormField","form-field"],["Form","form"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuUpload,"cu-upload");assert.equal(REACT_EVENT_PROPS.onCuSubmit,"cu-submit");assert.equal(REACT_EVENT_PROPS.onCuReset,"cu-reset");
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));for(const name of ["Radio","MenuItem"])assert.equal(catalog.groups.flatMap(g=>g.components).find(c=>c.name===name).status,"preview");
});
