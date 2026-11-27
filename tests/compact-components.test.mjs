
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuChip, CuTag, CuProgressRing, normalizeRingProgress
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS, assignCuProperties } from "../packages/react/src/index.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("Chip, Tag and ProgressRing import without browser DOM globals",()=>{
  for(const Component of [CuChip,CuTag,CuProgressRing])
    assert.equal(typeof Component,"function");
  assert.ok(CuChip.observedAttributes.includes("selected"));
  assert.ok(CuChip.observedAttributes.includes("disabled"));
  assert.ok(CuProgressRing.observedAttributes.includes("value"));
  assert.ok(CuProgressRing.observedAttributes.includes("show-value"));
});

test("ProgressRing value helper clamps invalid and boundary values",()=>{
  assert.deepEqual(normalizeRingProgress(null),{value:null,max:100,percent:null});
  assert.deepEqual(normalizeRingProgress(""),{value:null,max:100,percent:null});
  assert.deepEqual(normalizeRingProgress("bad"),{value:null,max:100,percent:null});
  assert.deepEqual(normalizeRingProgress("Infinity"),{value:null,max:100,percent:null});
  assert.deepEqual(normalizeRingProgress(-30,100),{value:0,max:100,percent:0});
  assert.deepEqual(normalizeRingProgress(80,200),{value:80,max:200,percent:40});
  assert.deepEqual(normalizeRingProgress(1000,200),{value:200,max:200,percent:100});
  assert.deepEqual(normalizeRingProgress(10,0),{value:10,max:100,percent:10});
  assert.equal(normalizeRingProgress(0.5,1).percent,50);
});

test("Chip selection respects selectable and disabled state",()=>{
  const chip=Object.create(CuChip.prototype);
  const attributes=new Map([["value","frontend"],["selectable",""]]);
  const events=[];
  chip.hasAttribute=name=>attributes.has(name);
  chip.getAttribute=name=>attributes.get(name)??null;
  chip.toggleAttribute=(name,enabled)=>{
    if(enabled)attributes.set(name,"");else attributes.delete(name);
  };
  chip.dispatchEvent=event=>{events.push(event);return true;};
  chip.toggle();
  assert.equal(chip.selected,true);
  assert.equal(events.length,1);
  assert.equal(events[0].type,"cu-change");
  assert.deepEqual(events[0].detail,{selected:true,value:"frontend"});
  chip.toggle();
  assert.equal(chip.selected,false);
  attributes.set("disabled","");
  chip.toggle();
  assert.equal(events.length,2);
  assert.equal(chip.selected,false);
  attributes.delete("disabled");
  attributes.delete("selectable");
  chip.toggle();
  assert.equal(events.length,2);
});

test("Chip removal can be canceled and does not remove disabled chips",()=>{
  const chip=Object.create(CuChip.prototype);
  const attributes=new Map([["removable",""],["value","ux"]]);
  let last;
  chip.hasAttribute=name=>attributes.has(name);
  chip.getAttribute=name=>attributes.get(name)??null;
  chip.dispatchEvent=event=>{last=event;return false;};
  chip.removeChip();
  assert.equal(last.type,"cu-remove");
  assert.equal(last.cancelable,true);
  assert.equal(last.detail.value,"ux");
  assert.notEqual(chip.hidden,true);
  chip.dispatchEvent=event=>{last=event;return true;};
  attributes.set("disabled","");
  chip.removeChip();
  assert.notEqual(chip.hidden,true);
  attributes.delete("disabled");
  chip.removeChip();
  assert.equal(chip.hidden,true);
});

test("new components include keyboard, semantic color and reduced-motion support",async()=>{
  const [chip,tag,ring]=await Promise.all(["chip","tag","progress-ring"]
    .map(id=>read("../packages/web/src/components/"+id+".js")));
  assert.match(chip,/aria-pressed/);
  assert.match(chip,/event\.key!=="Enter"/);
  assert.match(chip,/event\.key!==" "/);
  assert.match(chip,/cancelable:true/);
  assert.match(chip,/aria-label","Remove "/);
  assert.match(tag,/slot/);
  assert.doesNotMatch(tag,/role="button"|role="status"|tabIndex/);
  assert.match(ring,/role="progressbar"/);
  assert.match(ring,/aria-valuemin="0"/);
  assert.match(ring,/aria-valuenow/);
  assert.match(ring,/prefers-reduced-motion:reduce/);
  assert.match(ring,/forced-colors:active/);
  assert.match(ring,/svg viewBox=/);
  for(const source of [chip,tag,ring])
    assert.doesNotMatch(source,/innerHTML\s*=\s*.*(?:label|value)/);
});

test("package exports and React wrappers expose all three elements",async()=>{
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const id of ["chip","tag","progress-ring"]){
    assert.equal(pkg.exports["./components/"+id].default,
      "./dist/components/"+id+".js");
    assert.equal(pkg.exports["./components/"+id].types,
      "./dist/components/index.d.ts");
  }
  assert.equal(REACT_TAGS.Chip,"cu-chip");
  assert.equal(REACT_TAGS.Tag,"cu-tag");
  assert.equal(REACT_TAGS.ProgressRing,"cu-progress-ring");
  assert.equal(Object.keys(REACT_TAGS).length,144);
  assert.equal(REACT_EVENT_PROPS.onCuRemove,"cu-remove");
  const chip={value:"",selected:false,removable:false,selectable:false,disabled:false};
  assignCuProperties(chip,"cu-chip",
    {value:"a",selected:true,removable:true,selectable:true,disabled:false});
  assert.equal(chip.value,"a");
  assert.equal(chip.selected,true);
  assert.equal(chip.removable,true);
  assert.equal(chip.selectable,true);
});

test("Playground has interactive previews and catalog has 43 experimental components",async()=>{
  const [html,script,types,react]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),
    read("../packages/web/src/components/index.d.ts"),
    read("../packages/react/src/components.js")
  ]);
  for(const tag of ["cu-chip","cu-tag","cu-progress-ring"])
    assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-ring","wc-ring-step","wc-ring-reset","wc-chip-select",
    "wc-chip-removable","wc-chip-restore"])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(script,/chipSelect\.addEventListener\("cu-change"/);
  assert.match(script,/chipRemovable\.addEventListener\("cu-remove"/);
  assert.match(script,/wcRing\.value/);
  assert.match(types,/class CuChip extends HTMLElement/);
  assert.match(types,/class CuTag extends HTMLElement/);
  assert.match(types,/class CuProgressRing extends HTMLElement/);
  assert.match(react,/ProgressRing, Badge, Chip, Tag/);
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));
  const entries=catalog.groups.flatMap(group=>group.components);
  for(const name of ["Chip","Tag","ProgressRing"])
    assert.equal(entries.find(item=>item.name===name)?.status,"preview");
  assert.equal(entries.length,133);
  assert.equal(entries.filter(item=>item.status==="preview").length,133);
  assert.equal(entries.filter(item=>item.status==="planned").length,0);
  assert.equal(entries.filter(item=>item.status==="ready").length,0);
});
