import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuOTPInput,CuToast,CuStepper,CuRadio,CuTab,CuMenuItem,CuMenuButton,normalizeSteps,canVisitStep} from "../packages/web/src/components/index.js";
import {assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
if(!globalThis.CustomEvent)globalThis.CustomEvent=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};

test("linear steps skip disabled stages without skipping enabled stages",()=>{
 const steps=normalizeSteps([{value:"a"},{value:"b",disabled:true},{value:"c"},{value:"d"}]);
 assert.equal(canVisitStep(steps,1,0,true),false);
 assert.equal(canVisitStep(steps,2,0,true),true);
 assert.equal(canVisitStep(steps,3,0,true),false);
 const el=Object.create(CuStepper.prototype),attrs=new Map([["linear",""]]);el._steps=steps;el._focusIndex=0;
 el.getAttribute=k=>attrs.get(k)??null;el.hasAttribute=k=>attrs.has(k);el.setAttribute=(k,v)=>attrs.set(k,v);el.dispatchEvent=()=>true;
 assert.equal(el.next(),true);assert.equal(el.value,"c");assert.equal(el.previous(),true);assert.equal(el.value,"a");
 attrs.set("value","b");assert.equal(el.value,"a");
});
test("OTP normalizes duplicate input notifications and commits once",()=>{
 const el=Object.create(CuOTPInput.prototype),events=[];el.getAttribute=()=>null;el._input={value:"001234",selectionStart:6,setSelectionRange(){}};
 el._syncForm=()=>{};el._paint=()=>{};el._lastInput="";el._lastCommitted="";el.dispatchEvent=e=>{events.push([e.type,e.detail.value]);return true;};
 el._edited();el._edited();el._commit();el._commit();
 assert.deepEqual(events,[["cu-input","001234"],["cu-change","001234"]]);
});
test("Toast shrinking capacity preserves FIFO entries and remounts them",()=>{
 const el=Object.create(CuToast.prototype);let limit=1;const removed=[];
 Object.defineProperty(el,"isConnected",{value:true});el._stack={};el._limit=()=>limit;
 el._entries=["a","b","c"].map(id=>({data:{id,duration:0},remaining:0,timer:null,paused:new Set(),node:{remove(){removed.push(id);}}}));
 el._mountToast=entry=>{entry.node={remove(){removed.push(entry.data.id);}};};
 el._drain();assert.deepEqual(removed,["b","c"]);
 assert.deepEqual(el._entries.filter(x=>x.node).map(x=>x.data.id),["a"]);
 limit=3;el._drain();assert.deepEqual(el._entries.filter(x=>x.node).map(x=>x.data.id),["a","b","c"]);
});
test("React child state reflects boolean attributes",()=>{
 for(const [Ctor,tag,props] of [[CuRadio,"cu-radio",{checked:true,disabled:true}],[CuTab,"cu-tab",{disabled:true}],[CuMenuItem,"cu-menu-item",{disabled:true}]]){
  const el=Object.create(Ctor.prototype),attrs=new Set();el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assignCuProperties(el,tag,props);for(const k of Object.keys(props))assert.equal(el[k],true);
 }
});
test("MenuButton provides native fallback focus target",()=>{
 const el=Object.create(CuMenuButton.prototype),button={};el._defaultTrigger=button;el._trigger={assignedElements:()=>[]};
 assert.deepEqual(el._triggerElements(),[button]);const external={};el._trigger.assignedElements=()=>[external];assert.deepEqual(el._triggerElements(),[external]);
});
test("package verifier checks every mapped component and standalone identity",async()=>{
 const source=await read("../scripts/verify-packages.mjs");
 assert.ok(source.includes("Object.entries(react.REACT_TAGS)"));
 assert.ok(source.includes("Standalone class mismatch"));
 assert.ok(source.includes("Missing DOM type"));
});
test("tabs avoid observing unrelated descendant state",async()=>{
 const source=await read("../packages/web/src/components/tabs.js");
 assert.ok(source.includes('r.type === "childList" && r.target === this'));
 assert.ok(source.includes('r.target.parentElement === this'));
 assert.ok(source.includes('direction === "rtl"'));
});
