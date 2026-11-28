import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeGanttTasks} from "./gantt-chart.js";
import {normalizeScheduleEvents} from "./scheduler.js";
import {DEFAULT_WORKFLOW_LANES} from "./workflow-editor.js";
import {normalizeKanbanLanes,normalizeKanbanItems} from "./kanban-board.js";
import "./tabs.js";
export function normalizeProjectWorkspace(value={}){
  const lanes=normalizeKanbanLanes(value?.lanes??DEFAULT_WORKFLOW_LANES);
  return {tasks:normalizeGanttTasks(value?.tasks),events:normalizeScheduleEvents(value?.events),lanes,workItems:normalizeKanbanItems(value?.workItems,lanes)};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:8px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}cu-tab{padding:8px 0;}";
export class CuProjectWorkspace extends BrowserElement{
  static get observedAttributes(){return ["readonly","date"];}
  constructor(){
    super();const root=mount(this,css,'<section class="panel" aria-label="Project workspace"><div class="status" role="status"></div><cu-tabs aria-label="Project views"><cu-tab label="Timeline"><cu-gantt-chart></cu-gantt-chart></cu-tab><cu-tab label="Schedule"><cu-scheduler></cu-scheduler></cu-tab><cu-tab label="Tasks"><cu-workflow-editor></cu-workflow-editor></cu-tab></cu-tabs></section>');
    this._gantt=root.querySelector("cu-gantt-chart");this._scheduler=root.querySelector("cu-scheduler");this._workflow=root.querySelector("cu-workflow-editor");this._tabs=root.querySelector("cu-tabs");this._status=root.querySelector(".status");
    this._scheduler.addEventListener("cu-change",e=>{e.stopPropagation();if(e.detail.date){this.date=e.detail.date;notify(this,"cu-navigate",{section:"schedule",date:this.date});}});
    this._scheduler.addEventListener("cu-action",e=>{e.stopPropagation();this._sync();notify(this,"cu-change",{section:"schedule",action:e.detail.action,value:this.value});});
    this._workflow.addEventListener("cu-change",e=>{e.stopPropagation();if(!e.detail.items)return;this._sync();notify(this,"cu-change",{section:"tasks",action:e.detail.action,id:e.detail.id,value:this.value});});
    this._tabs.addEventListener("cu-change",e=>{if(e.target===this._tabs){e.stopPropagation();notify(this,"cu-navigate",{section:["timeline","schedule","tasks"][e.detail.index]});}});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get value(){return {tasks:this._gantt.tasks,events:this._scheduler.events,lanes:this._workflow.lanes,workItems:this._workflow.items};}
  set value(v){const c=normalizeProjectWorkspace(v);this._gantt.tasks=c.tasks;this._scheduler.events=c.events;this._workflow.lanes=c.lanes;this._workflow.items=c.workItems;this._sync();}
  get date(){return this._scheduler.date;}set date(v){this._scheduler.date=v;}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _sync(){if(!this._status)return;this._scheduler.readonly=this._workflow.readonly=this.readonly;const date=this.getAttribute("date");if(date&&date!==this._scheduler.date)this._scheduler.date=date;const v=this.value;this._status.textContent=v.tasks.length+" timeline tasks · "+v.events.length+" events · "+v.workItems.length+" work items";}
}
define("cu-project-workspace",CuProjectWorkspace);
