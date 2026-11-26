import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuTitleBar,CuWindowControls,CuStatusBar,isTitleBarDragTarget,windowControlActions,normalizeStatusItems} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("window controls distinguish maximize and restore and disable individual capabilities",()=>{
  assert.deepEqual(windowControlActions().map(x=>x.action),["minimize","maximize","close"]);
  const actions=windowControlActions({maximized:true,minimizable:false,closable:false});
  assert.equal(actions[1].action,"restore");
  assert.equal(actions[0].disabled,true);assert.equal(actions[2].disabled,true);
});
test("drag target excludes interactive children and unrelated event paths",()=>{
  const region={},text={matches:()=>false},button={matches:()=>true};
  assert.equal(isTitleBarDragTarget([text,region],region),true);
  assert.equal(isTitleBarDragTarget([button,region],region),false);
  assert.equal(isTitleBarDragTarget([text],region),false);
});
test("window state properties and capabilities are reflected",()=>{
  const el=Object.create(CuWindowControls.prototype),attrs=new Set();
  el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assignCuProperties(el,"cu-window-controls",{maximized:true,minimizable:false});
  assert.equal(el.maximized,true);assert.equal(el.minimizable,false);assert.equal(el.closable,true);
  el.maximized=false;assert.equal(el.maximized,false);
});
test("title bar drag strategy is opt in and property bound",()=>{
  const el=Object.create(CuTitleBar.prototype),attrs=new Set();
  el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assert.equal(el.draggableRegion,false);
  assignCuProperties(el,"cu-title-bar",{draggableRegion:true,maximized:true});
  assert.equal(el.draggableRegion,true);assert.equal(el.maximized,true);
});
test("status items normalize alignment and tones and reject duplicate ids",()=>{
  const items=normalizeStatusItems([{id:"a",label:" Ready ",tone:"success"},{id:"a",label:"duplicate"},{id:"b",label:"Encoding",align:"end",tone:"unknown",value:8}]);
  assert.equal(items.length,2);assert.equal(items[0].label,"Ready");
  assert.equal(items[1].tone,"neutral");assert.equal(items[1].align,"end");assert.equal(items[1].value,"8");
});
test("status items are defensive snapshots",()=>{
  const el=Object.create(CuStatusBar.prototype);el._items=[];el._render=()=>{};
  const input=[{id:"a",label:"Ready"}];assignCuProperties(el,"cu-status-bar",{items:input});
  input[0].label="Changed";el.items[0].label="Changed";assert.equal(el.items[0].label,"Ready");
});
test("desktop components expose contracts, exports and events",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["TitleBar","title-bar"],["WindowControls","window-controls"],["StatusBar","status-bar"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuWindowAction,"cu-window-action");
  assert.equal(REACT_EVENT_PROPS.onCuWindowDrag,"cu-window-drag");
});
