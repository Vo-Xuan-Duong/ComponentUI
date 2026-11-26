import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuRangeSlider,CuOTPInput,normalizeRange,normalizeOTP} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("range normalization clamps, orders and snaps to step",()=>{
  assert.deepEqual(normalizeRange([80,20],0,100,5).value,[20,80]);
  assert.deepEqual(normalizeRange([-8,150],0,100,10).value,[0,100]);
  assert.deepEqual(normalizeRange("[0.14,0.87]",0,1,0.1).value,[0.1,0.9]);
  assert.deepEqual(normalizeRange(null,0,10,3).value,[0,9]);
  assert.deepEqual(normalizeRange(null,10,0,-1).value,[10,10]);
});
test("range controlled value is defensive and reset restores original pair",()=>{
  const field=Object.create(CuRangeSlider.prototype);
  field._value=[0,100];field.getAttribute=()=>null;field._sync=()=>{};
  field._default="[10,90]";
  assignCuProperties(field,"cu-range-slider",{value:[20,70]});
  assert.deepEqual(field.value,[20,70]);
  field.value[0]=50;assert.deepEqual(field.value,[20,70]);
  field.formResetCallback();assert.deepEqual(field.value,[10,90]);
  field.formStateRestoreCallback("[25,75]");assert.deepEqual(field.value,[25,75]);
});
test("OTP preserves leading zeros and strips nonnumeric input",()=>{
  assert.equal(normalizeOTP("00 12-34"),"001234");
  assert.equal(normalizeOTP("abc123456789",4),"1234");
  assert.equal(normalizeOTP("123",null),"123");
  assert.equal(normalizeOTP("1234567890123",20),"123456789012");
  assert.equal(normalizeOTP(null),"");
});
test("OTP controlled value and state restoration retain a string",()=>{
  const field=Object.create(CuOTPInput.prototype);
  field._input={value:""};field.getAttribute=()=>null;field._sync=()=>{};
  field._default="001234";
  assignCuProperties(field,"cu-otp-input",{value:"005678"});
  assert.equal(field.value,"005678");
  field.formResetCallback();assert.equal(field.value,"001234");
  field.formStateRestoreCallback("000009");assert.equal(field.value,"000009");
});
test("new form controls are exported with contracts and demos",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag,Type] of [["RangeSlider","range-slider",CuRangeSlider],["OTPInput","otp-input",CuOTPInput]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(Type.formAssociated,true);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
});
test("OTP uses native autofill and one input; demo does not print the code",async()=>{
  const source=await read("../packages/web/src/components/otp-input.js");
  assert.ok(source.includes('autocomplete="one-time-code"'));
  assert.ok(source.includes('inputmode="numeric"'));
  assert.ok(source.includes('addEventListener("paste"'));
  const demo=await read("../apps/playground-web/main.js");
  assert.ok(demo.includes('codeComplete:String(data.get("code")??"").length===6'));
});
