import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuChartContainer} from "../packages/web/src/components/chart-container.js";
import {CuChartEditor} from "../packages/web/src/components/chart-editor.js";
import {CuThemeEditor,normalizeThemeConfig} from "../packages/web/src/components/theme-editor.js";
import {CuAutomationDesigner} from "../packages/web/src/components/automation-designer.js";
const read=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");
if(!globalThis.CustomEvent)globalThis.CustomEvent=class extends Event{constructor(type,options={}){super(type,options);this.detail=options.detail;}};
test("chart items skip equivalent normalized input but retain defensive copies",()=>{
 const chart=Object.create(CuChartContainer.prototype);chart._items=[];let renders=0;chart._render=()=>renders++;
 chart.items=[{label:"A",value:1}];chart.items=[{label:"A",value:1},{label:"invalid",value:Infinity}];
 assert.equal(renders,1);chart.items[0].value=10;assert.equal(chart.items[0].value,1);
 chart.items=[{label:"A",value:2}];assert.equal(renders,2);
});
test("chart editor controlled config and item updates skip identical values",()=>{
 const editor=Object.create(CuChartEditor.prototype);editor._items=[];editor._config={title:"Chart",description:"",type:"bar",showTable:false};let renders=0;editor._render=()=>renders++;
 editor.config={};editor.items=[];assert.equal(renders,0);
 editor.config={title:"New"};editor.config={title:"New"};editor.items=[{label:"A",value:1}];editor.items=[{label:"A",value:1}];assert.equal(renders,2);
});
test("theme editor emits only meaningful normalized changes",()=>{
 const editor=Object.create(CuThemeEditor.prototype),events=[];editor._value=normalizeThemeConfig();editor._sync=()=>{};editor.hasAttribute=()=>false;editor.dispatchEvent=e=>{events.push(e.detail);return true;};
 editor._commit("radius",6);editor._commit("radius",8);editor._commit("radius",8.1);
 assert.equal(events.length,1);assert.equal(events[0].tokens["--cu-radius-md"],"8px");
 assert.equal(editor._replaceTheme({}, "reset"),true);assert.equal(editor._replaceTheme({}, "reset"),false);
});
test("automation synchronization leaves unchanged readonly children alone",()=>{
 const el=Object.create(CuAutomationDesigner.prototype);el.hasAttribute=()=>false;let assignments=0;
 const graph={value:{nodes:[{id:"a"}],edges:[]},get readonly(){return false;},set readonly(v){assignments++;}};
 const workflow={get readonly(){return false;},set readonly(v){assignments++;}};
 el._graph=graph;el._workflow=workflow;el._run={};el._status={};el._sync();
 assert.equal(assignments,0);assert.equal(el._run.disabled,false);assert.match(el._status.textContent,/Valid dependency order/);
});
test("dashboard widgets preserve identity and node editor supports keyboard menus",async()=>{
 const designer=await read("dashboard-designer"),viewer=await read("dashboard-viewer"),node=await read("node-editor"),workflow=await read("workflow-editor");
 for(const code of [designer,viewer]){assert.match(code,/existing\.get\([xw]\.id\)/);assert.match(code,/insertBefore\(/);}
 assert.match(designer,/<cu-empty-state title="No chart widgets"/);
 assert.match(node,/aria-keyshortcuts","Shift\+F10"/);assert.match(node,/this\._render\(false\)/);
 assert.match(workflow,/this\._syncTaskOptions\(\);this\._emit\("move"/);
});
