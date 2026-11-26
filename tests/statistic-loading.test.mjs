import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuStatistic,CuLoadingOverlay,formatStatistic,statisticTrend,sparklinePoints} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("statistic formats locale, currency, percent and missing values",()=>{
  assert.equal(formatStatistic(48250,{locale:"en-US",format:"currency",currency:"USD",precision:0}),"$48,250");
  assert.equal(formatStatistic(0.25,{locale:"en-US",format:"percent",precision:1}),"25.0%");
  assert.equal(formatStatistic(null),"—");
  assert.equal(formatStatistic(Infinity),"—");
  assert.equal(formatStatistic(0,{locale:"en-US"}),"0");
});
test("statistic trend handles positive, negative and zero baselines",()=>{
  assert.deepEqual(statisticTrend(120,100),{delta:20,percent:20,direction:"up"});
  assert.deepEqual(statisticTrend(-80,-100),{delta:20,percent:20,direction:"up"});
  assert.deepEqual(statisticTrend(0,0),{delta:0,percent:null,direction:"flat"});
  assert.deepEqual(statisticTrend(10,null),{delta:null,percent:null,direction:"none"});
  assert.equal(statisticTrend(80,100).direction,"down");
});
test("sparkline points support flat and increasing series without invalid coordinates",()=>{
  assert.equal(sparklinePoints([10,20],120,36),"2,34 118,2");
  assert.equal(sparklinePoints([5,5],120,36),"2,18 118,18");
  assert.equal(sparklinePoints([1,NaN]),"");
  assert.equal(sparklinePoints([1]),"");
});
test("statistic series property is defensive and React controlled",()=>{
  const stat=Object.create(CuStatistic.prototype);stat._series=[];stat._sync=()=>{};
  const series=[1,2,3];assignCuProperties(stat,"cu-statistic",{series});
  series.push(4);assert.deepEqual(stat.series,[1,2,3]);
  stat.series.push(9);assert.deepEqual(stat.series,[1,2,3]);
});
test("loading overlay reflects loading state through methods",()=>{
  const overlay=Object.create(CuLoadingOverlay.prototype);
  const attrs=new Set();overlay.hasAttribute=k=>attrs.has(k);
  overlay.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assignCuProperties(overlay,"cu-loading-overlay",{fullscreen:true,loading:true});
  assert.equal(overlay.loading,true);assert.equal(overlay.fullscreen,true);
  overlay.hide();assert.equal(overlay.loading,false);
  overlay.show();assert.equal(overlay.loading,true);
});
test("loading overlay blocks busy content and has standalone package exports",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  const source=await read("../packages/web/src/components/loading-overlay.js");
  assert.ok(source.includes("this._region.inert=true"));
  assert.ok(source.includes('setAttribute("aria-busy","true")'));
  assert.ok(source.includes("this._dialog.showModal()"));
  for(const [name,tag] of [["Statistic","statistic"],["LoadingOverlay","loading-overlay"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
});
