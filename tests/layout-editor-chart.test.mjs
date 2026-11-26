import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuChartContainer,CuRichTextEditor,normalizeChartItems,chartDomain,CuRangeSlider,CuOTPInput,CuColorPicker,CuTagInput,CuMultiSelect,CuAutoComplete} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("chart normalizes finite values and preserves input order",()=>{
  assert.deepEqual(normalizeChartItems([{label:"B",value:2},{label:"A",value:-4},{label:"X",value:NaN},{label:"",value:9}]),[{label:"B",value:2},{label:"A",value:-4}]);
  assert.equal(normalizeChartItems(Array.from({length:105},(_,i)=>({label:String(i),value:i}))).length,100);
});
test("chart domain includes zero and handles flat series",()=>{
  assert.deepEqual(chartDomain([{value:-4},{value:8}]),{min:-4,max:8});
  assert.deepEqual(chartDomain([{value:2}]),{min:0,max:2});
  assert.deepEqual(chartDomain([{value:-2}]),{min:-2,max:0});
  assert.deepEqual(chartDomain([]),{min:0,max:1});
});
test("chart items are defensive and React property bound",()=>{
  const el=Object.create(CuChartContainer.prototype);el._items=[];el._render=()=>{};
  const items=[{label:"A",value:5}];assignCuProperties(el,"cu-chart-container",{items});items[0].value=8;el.items[0].value=9;assert.equal(el.items[0].value,5);
});
test("readonly props reflect for previous form controls",()=>{
  for(const [Ctor,tag] of [[CuRangeSlider,"range-slider"],[CuOTPInput,"otp-input"],[CuColorPicker,"color-picker"],[CuTagInput,"tag-input"],[CuMultiSelect,"multi-select"],[CuAutoComplete,"autocomplete"]]){
    const el=Object.create(Ctor.prototype),attrs=new Set();el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
    assignCuProperties(el,"cu-"+tag,{readonly:true});assert.equal(el.readonly,true);el.readonly=false;assert.equal(el.readonly,false);
  }
});
test("RangeSlider bounds reflect through properties",()=>{
  const el=Object.create(CuRangeSlider.prototype),attrs=new Map();el._value=[0,100];el.getAttribute=k=>attrs.get(k)??null;el.setAttribute=(k,v)=>attrs.set(k,v);el.removeAttribute=k=>attrs.delete(k);
  assignCuProperties(el,"cu-range-slider",{min:10,max:50,step:5});
  assert.equal(el.min,10);assert.equal(el.max,50);assert.equal(el.step,5);
});
test("editor form association and sanitization source contract",async()=>{
  assert.equal(CuRichTextEditor.formAssociated,true);
  const source=await read("../packages/web/src/components/rich-text-editor.js");
  assert.ok(source.includes('doc.createElement("template")'));assert.ok(source.includes("discard.has(node.tagName)"));
  assert.ok(source.includes("setFormValue"));assert.ok(source.includes('getData("text/plain")'));
});
test("eight modules have standalone exports, wrappers, demos and contracts",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["Container","container"],["Stack","stack"],["Grid","grid"],["Flex","flex"],["Surface","surface"],["PageHeader","page-header"],["RichTextEditor","rich-text-editor"],["ChartContainer","chart-container"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
});
