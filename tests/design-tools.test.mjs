import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeThemeConfig,themeTokenValues} from "../packages/web/src/components/theme-editor.js";
import {normalizeDesignComponents} from "../packages/web/src/components/component-designer.js";
import {DEFAULT_WORKFLOW_LANES} from "../packages/web/src/components/workflow-editor.js";
import {normalizeNodeGraph} from "../packages/web/src/components/node-editor.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("theme configuration uses shared colors and bounded radii",()=>{
  assert.deepEqual(normalizeThemeConfig({accent:"#abc8",font:"Arial",radius:30}),{accent:"#aabbcc",font:"Arial",radius:24});
  assert.equal(normalizeThemeConfig({accent:"invalid",radius:-5}).accent,"#0067c0");
  assert.equal(normalizeThemeConfig({radius:-5}).radius,0);
  assert.equal(themeTokenValues({font:"Georgia",radius:8})["--cu-radius-lg"],"10px");
});
test("designer only accepts allowlisted component descriptors",()=>{
  const items=normalizeDesignComponents([{id:"a",type:"button",variant:"bad"},{id:"a",type:"card"},{id:"b",type:"script"},{id:"c",type:"text-field",value:4}]);
  assert.deepEqual(items.map(x=>x.id),["a","c"]);
  assert.equal(items[0].variant,"outline");assert.equal(items[1].value,"4");
});
test("workflow defaults match Kanban lane schema",()=>{
  assert.deepEqual(DEFAULT_WORKFLOW_LANES.map(x=>x.id),["todo","doing","done"]);
  assert.ok(Object.isFrozen(DEFAULT_WORKFLOW_LANES));
});
test("node graph rejects duplicate, invalid and self-loop edges",()=>{
  const nodes=[{id:"a"},{id:"b"},{id:"a"}];
  const edges=[{from:"a",to:"b"},{from:"a",to:"b"},{from:"a",to:"a"},{from:"a",to:"missing"},{from:"b",to:"a"}];
  assert.deepEqual(normalizeNodeGraph({nodes,edges}),{nodes:[{id:"a",label:"a"},{id:"b",label:"b"}],edges:[{from:"a",to:"b"},{from:"b",to:"a"}]});
  assert.equal(normalizeNodeGraph({nodes:Array.from({length:60},(_,i)=>({id:String(i)}))}).nodes.length,50);
});
test("design tools reuse existing modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["ThemeEditor","theme-editor",["color-palette","font-picker","property-grid","button","card"]],["ComponentDesigner","component-designer",["property-inspector","dock-layout","select","button","card","text-field"]],["WorkflowEditor","workflow-editor",["kanban-board","text-field","select","button"]],["NodeEditor","node-editor",["property-grid","split-view","context-menu","select","button"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
