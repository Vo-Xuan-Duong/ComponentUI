import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuAutoComplete,CuNotificationCenter,normalizeSuggestions,filterSuggestions,normalizeNotifications} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("suggestions normalize unique values and search label, value and description",()=>{
  const items=normalizeSuggestions([{value:"react",label:"React",description:"UI library"},{value:"react"},{value:"vue",label:"Vue",disabled:true},null,{value:42}]);
  assert.equal(items.length,2);
  assert.equal(items[1].disabled,true);
  assert.deepEqual(filterSuggestions(items," UI ").map(x=>x.value),["react"]);
  assert.deepEqual(filterSuggestions(items,"VUE").map(x=>x.value),["vue"]);
  assert.deepEqual(filterSuggestions(items,"",1).map(x=>x.value),["react"]);
  assert.deepEqual(filterSuggestions(items,"",0),[]);
});
test("autocomplete preserves free text and restores form state",()=>{
  const field=Object.create(CuAutoComplete.prototype);
  field._input={value:""};field._items=[];field._sync=()=>{};field._render=()=>{};field.hide=()=>{};
  field._default="React";
  assignCuProperties(field,"cu-autocomplete",{items:[{value:"react"}],value:"Custom input"});
  assert.equal(field.value,"Custom input");
  assert.equal(field.items[0].value,"react");
  field.formResetCallback();assert.equal(field.value,"React");
  field.formStateRestoreCallback("Vue");assert.equal(field.value,"Vue");
  assert.equal(CuAutoComplete.formAssociated,true);
});
test("notification normalization rejects duplicates and normalizes tone and read",()=>{
  const items=normalizeNotifications([{id:"a",title:"A"},{id:"a",title:"Duplicate"},{id:"b",tone:"unknown",read:true},null,{id:""}]);
  assert.equal(items.length,2);assert.equal(items[0].read,false);
  assert.equal(items[1].tone,"info");assert.equal(items[1].read,true);
});
test("notification center maintains read state and deduplicates additions",()=>{
  const center=Object.create(CuNotificationCenter.prototype);
  center._items=[];center._render=()=>{};center.dispatchEvent=()=>true;
  const changes=[];center._changed=(reason,id)=>changes.push([reason,id,center.unreadCount]);
  assert.equal(center.add({id:"a",title:"A"}),true);
  assert.equal(center.add({id:"a"}),false);
  center.add({id:"b",title:"B"});
  assert.equal(center.items[0].id,"b");assert.equal(center.unreadCount,2);
  const snapshot=center.items;snapshot[0].read=true;assert.equal(center.unreadCount,2);
  center.markRead("b");assert.equal(center.unreadCount,1);
  center.markRead("b",false);assert.equal(center.unreadCount,2);
  center.markAllRead();assert.equal(center.unreadCount,0);
  center.dismiss("a");assert.equal(center.items.length,1);
  center.clear();assert.equal(center.items.length,0);
  assert.deepEqual(changes.map(x=>x[0]),["add","add","read","unread","read-all","dismiss","clear"]);
});
test("new preview components expose typed package entrypoints and live demos",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["AutoComplete","autocomplete"],["NotificationCenter","notification-center"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  const source=await read("../apps/playground-web/main.js");
  assert.ok(source.includes("wcAutocomplete.items="));assert.ok(source.includes("wcNotificationCenter.items="));
});
test("MultiSelect watches only relevant attributes and Toast preserves disconnect timing",async()=>{
  const multi=await read("../packages/web/src/components/multi-select.js");
  const toast=await read("../packages/web/src/components/toast.js");
  assert.ok(multi.includes('attributeFilter:["value","label","selected","disabled"]'));
  assert.ok(toast.includes('this._pause(entry,"disconnect")'));
});
