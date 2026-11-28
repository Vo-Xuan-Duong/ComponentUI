import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeNodeGraph} from "./node-editor.js";
import {DEFAULT_WORKFLOW_LANES} from "./workflow-editor.js";
import {normalizeKanbanLanes,normalizeKanbanItems} from "./kanban-board.js";
import "./tabs.js";
import "./button.js";
export function analyzeAutomationGraph(value){
  const graph=normalizeNodeGraph(value),degree=new Map(graph.nodes.map(n=>[n.id,0])),next=new Map(graph.nodes.map(n=>[n.id,[]]));
  for(const e of graph.edges){degree.set(e.to,degree.get(e.to)+1);next.get(e.from).push(e.to);}
  const queue=graph.nodes.filter(n=>degree.get(n.id)===0).map(n=>n.id),order=[];
  for(let i=0;i<queue.length;i++){const id=queue[i];order.push(id);for(const to of next.get(id)){degree.set(to,degree.get(to)-1);if(degree.get(to)===0)queue.push(to);}}
  const cyclic=order.length!==graph.nodes.length;
  return {valid:graph.nodes.length>0&&!cyclic,cyclic,order:cyclic?[]:order,nodeCount:graph.nodes.length,edgeCount:graph.edges.length};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:12px;}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}.status{flex:1;font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuAutomationDesigner extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();const root=mount(this,css,'<section class="panel" aria-label="Automation designer"><div class="toolbar"><span class="status" role="status"></span><cu-button variant="accent">Request run</cu-button></div><cu-tabs aria-label="Automation workspace"><cu-tab label="Dependency graph"><cu-node-editor></cu-node-editor></cu-tab><cu-tab label="Implementation tasks"><cu-workflow-editor></cu-workflow-editor></cu-tab></cu-tabs></section>');
    this._graph=root.querySelector("cu-node-editor");this._workflow=root.querySelector("cu-workflow-editor");this._run=root.querySelector("cu-button");this._status=root.querySelector(".status");
    this._graph.addEventListener("cu-change",e=>{e.stopPropagation();this._sync();notify(this,"cu-change",{section:"graph",action:e.detail.action,value:this.value});});
    this._workflow.addEventListener("cu-change",e=>{e.stopPropagation();this._sync();notify(this,"cu-change",{section:"tasks",action:e.detail.action,value:this.value});});
    root.querySelector("cu-tabs").addEventListener("cu-change",e=>{if(e.target.localName==="cu-tabs")e.stopPropagation();});
    this._run.addEventListener("cu-press",e=>{e.stopPropagation();this.requestRun();});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get value(){return {graph:this._graph.value,lanes:this._workflow.lanes,tasks:this._workflow.items};}
  set value(v){this._graph.value=normalizeNodeGraph(v?.graph);const lanes=normalizeKanbanLanes(v?.lanes??DEFAULT_WORKFLOW_LANES);this._workflow.lanes=lanes;this._workflow.items=normalizeKanbanItems(v?.tasks,lanes);this._sync();}
  get analysis(){return analyzeAutomationGraph(this._graph.value);}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  requestRun(){const analysis=this.analysis;if(this.readonly||!analysis.valid)return false;notify(this,"cu-action",{action:"run-request",value:this.value,order:analysis.order});return true;}
  _sync(){if(!this._graph)return;this._graph.readonly=this._workflow.readonly=this.readonly;const a=this.analysis;this._run.disabled=this.readonly||!a.valid;this._status.textContent=a.cyclic?"Dependency cycle detected.":!a.nodeCount?"Add nodes to create an automation.":a.nodeCount+" nodes · "+a.edgeCount+" connections · Valid dependency order";}
}
define("cu-automation-designer",CuAutomationDesigner);
