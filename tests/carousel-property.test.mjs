import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuCarousel,CuPropertyGrid,normalizeCarouselItems,carouselIndex,normalizePropertyItems,coercePropertyValue,filterPropertyItems} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("carousel normalizes unique IDs and clamps or wraps indices",()=>{
  assert.deepEqual(normalizeCarouselItems([{id:"a",title:"A"},{id:"a"},{id:"b"},{id:""}]).map(x=>x.id),["a","b"]);
  assert.equal(carouselIndex(5,3),2);assert.equal(carouselIndex(-1,3),0);
  assert.equal(carouselIndex(-1,3,true),2);assert.equal(carouselIndex(3,3,true),0);
  assert.equal(carouselIndex(0,0),-1);
});
test("carousel items are defensive and active index follows controlled updates",()=>{
  const el=Object.create(CuCarousel.prototype);el._items=[];el._requested=0;el._renderIndicators=()=>{};el._sync=()=>{};el.hasAttribute=()=>false;
  assignCuProperties(el,"cu-carousel",{items:[{id:"a"},{id:"b"}],active:1});
  assert.equal(el.active,1);el.items[0].id="changed";assert.equal(el.items[0].id,"a");
  el.active=9;assert.equal(el.active,1);
});
test("property grid normalizes types, unique keys and defaults",()=>{
  const items=normalizePropertyItems([{key:"enabled",type:"boolean",value:true},{key:"enabled"},{key:"width",type:"number",min:200,max:600,step:10,value:321},{key:"mode",type:"select",options:[{value:"a",disabled:true},{value:"b"}]}]);
  assert.equal(items.length,3);assert.equal(items[0].value,true);assert.equal(items[1].value,200);assert.equal(items[2].value,"b");
});
test("property coercion validates each editor type",()=>{
  const [n,t,b,s,c]=normalizePropertyItems([{key:"n",type:"number",min:0,max:100,step:5,value:20},{key:"t",required:true,value:"abc"},{key:"b",type:"boolean"},{key:"s",type:"select",options:[{value:"a"},{value:"b",disabled:true}]},{key:"c",type:"color"}]);
  assert.deepEqual(coercePropertyValue(n,"25"),{valid:true,value:25,message:""});
  for(const v of ["", "26","101","NaN"])assert.equal(coercePropertyValue(n,v).valid,false);
  assert.equal(coercePropertyValue(t," ").valid,false);assert.equal(coercePropertyValue(b,"true").valid,false);
  assert.equal(coercePropertyValue(s,"b").valid,false);assert.equal(coercePropertyValue(c,"#AABBCC").value,"#aabbcc");
});
test("property grid search is accent-insensitive and programmatic edits validate",()=>{
  const items=normalizePropertyItems([{key:"width",label:"Độ rộng",type:"number",min:100,value:200},{key:"theme",value:"dark"}]);
  assert.deepEqual(filterPropertyItems(items,"do rong").map(x=>x.key),["width"]);
  const el=Object.create(CuPropertyGrid.prototype);el._items=[];el._render=()=>{};
  assignCuProperties(el,"cu-property-grid",{items});
  assert.equal(el.setValue("width",99),false);assert.equal(el.setValue("width",300),true);assert.equal(el.values.width,300);
  el.values.width=500;assert.equal(el.values.width,300);
});
test("components have exports, contracts and live playground examples",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["Carousel","carousel"],["PropertyGrid","property-grid"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  const carousel=await read("../packages/web/src/components/carousel.js");assert.ok(carousel.includes('aria-roledescription="carousel"'));assert.ok(carousel.includes("pointerup"));
  const grid=await read("../packages/web/src/components/property-grid.js");assert.ok(grid.includes("coercePropertyValue(item"));assert.ok(grid.includes('control.setAttribute("error",parsed.message)'));
});

test("property grid composes shared controls and contains their events",async()=>{
  const source=await read("../packages/web/src/components/property-grid.js");
  for(const [type,tag] of [["text","text-field"],["number","number-field"],["boolean","checkbox"],["select","select"],["color","color-picker"]]){
    assert.ok(source.includes('import "./'+tag+'.js";'));
    assert.ok(source.includes(type+':"cu-'+tag+'"'));
  }
  assert.ok(source.includes('<cu-search-box'));
  assert.ok(source.includes('doc.createElement(editorTags[item.type])'));
  assert.ok(!source.includes('doc.createElement("input")'));
  assert.ok(!source.includes('?"select":"input"'));
  assert.ok(source.includes('control.setAttribute("value",String(item.value))'));
  assert.ok(source.includes('control.addEventListener("cu-change",e=>{e.stopPropagation();this._commit'));
});
test("property grid rejects invalid and locked editor commits",()=>{
  const [item]=normalizePropertyItems([{key:"width",type:"number",min:0,max:100,step:5,value:20}]);
  const el=Object.create(CuPropertyGrid.prototype);
  el.hasAttribute=()=>false;
  const attrs=new Map(),control={value:"26",setAttribute:(k,v)=>attrs.set(k,v)},error={textContent:""};
  el._commit(item,control,error);
  assert.equal(item.value,20);
  assert.match(attrs.get("error"),/increments/);
  control.value="25";item.readonly=true;
  el._commit(item,control,error);
  assert.equal(item.value,20);
  item.readonly=false;control.value="20";
  el._commit(item,control,error);
  assert.equal(attrs.get("error"),"");
  assert.equal(item.value,20);
});
