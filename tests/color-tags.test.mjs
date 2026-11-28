import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuColorPicker,CuTagInput,parseColor,formatColor,normalizeTags} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("color parsing supports hex shorthand, alpha, RGB and HSL",()=>{
  assert.deepEqual(parseColor("#abc"),{r:170,g:187,b:204,a:1});
  assert.equal(formatColor(parseColor("#1238"),"hex",true),"#11223388");
  assert.equal(formatColor(parseColor("rgb(100%, 0%, 50%)")),"#ff0080");
  assert.equal(formatColor(parseColor("hsl(120, 100%, 50%)")),"#00ff00");
  assert.equal(formatColor(parseColor("rgba(0, 0, 255, 50%)"),"hex",true),"#0000ff80");
});
test("invalid color syntax is rejected and conversions round-trip",()=>{
  for(const invalid of ["red","#12","rgb(x,0,0)","hsl(20,30,40)","rgb(1,2)","url(x)"])assert.equal(parseColor(invalid),null);
  const c=parseColor("#0067c0");
  assert.equal(formatColor(parseColor(formatColor(c,"hsl"))),"#0067c0");
  assert.equal(formatColor(parseColor(formatColor(c,"rgb"))),"#0067c0");
});
test("color state serializes as canonical hex and clears invalid drafts",()=>{
  const picker=Object.create(CuColorPicker.prototype);
  picker._text={value:""};picker.hasAttribute=k=>k==="alpha";picker._sync=()=>{};
  picker.value="rgba(255,0,0,0.5)";
  assert.equal(picker.value,"#ff000080");
  picker.value="invalid";assert.equal(picker.value,"");
  picker._default="#123456";picker.formResetCallback();assert.equal(picker.value,"#123456ff");
});
test("tags trim, deduplicate, preserve order and enforce limits",()=>{
  assert.deepEqual(normalizeTags([" UI ","ui","",null,"Web","React"]),["UI","Web","React"]);
  assert.deepEqual(normalizeTags(["a","A","bb","ccc"],{caseSensitive:true,max:3,maxLength:2}),["a","A","bb"]);
  assert.deepEqual(normalizeTags(["a"],{max:0}),[]);
});
test("TagInput controlled arrays and reset use defensive copies",()=>{
  const field=Object.create(CuTagInput.prototype);
  field._value=[];field._input={value:""};field.getAttribute=()=>null;field.hasAttribute=()=>false;field._sync=()=>{};
  field._default=["Design"];
  assignCuProperties(field,"cu-tag-input",{value:["Web","web","UI"]});
  assert.deepEqual(field.value,["Web","UI"]);
  field.value.push("Extra");assert.deepEqual(field.value,["Web","UI"]);
  field.formResetCallback();assert.deepEqual(field.value,["Design"]);
  field.formStateRestoreCallback('["React"]');assert.deepEqual(field.value,["React"]);
});
test("new components have exports, contracts and form demos",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag,Type] of [["ColorPicker","color-picker",CuColorPicker],["TagInput","tag-input",CuTagInput]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(Type.formAssociated,true);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  const demo=await read("../apps/playground-web/main.js");
  assert.ok(demo.includes('data.getAll("tags")'));
});


test("color picker supports compact mode and shared format selector",async()=>{
  assert.ok(CuColorPicker.observedAttributes.includes("compact"));
  const attrs=new Set(),picker=Object.create(CuColorPicker.prototype);
  picker.hasAttribute=key=>attrs.has(key);
  picker.toggleAttribute=(key,value)=>{if(value)attrs.add(key);else attrs.delete(key);};
  picker.compact=true;assert.equal(picker.compact,true);
  picker.compact=false;assert.equal(picker.compact,false);
  const source=await read("../packages/web/src/components/color-picker.js");
  assert.ok(source.includes('import "./select.js"'));
  assert.ok(source.includes('<cu-select aria-label="Color format"'));
  assert.ok(source.includes('this.compact?"hex":this._format'));
  assert.ok(source.includes('event.stopPropagation();this._format=event.detail.value'));
  const grid=await read("../packages/web/src/components/property-grid.js");
  assert.ok(grid.includes('control.setAttribute("compact","")'));
  const contract=JSON.parse(await read("../design-system/components/color-picker.contract.json"));
  assert.equal(contract.attributes.compact,"boolean");
});
