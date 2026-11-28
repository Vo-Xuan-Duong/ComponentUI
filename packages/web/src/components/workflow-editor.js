import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeKanbanItems,normalizeKanbanLanes} from "./kanban-board.js";
import "./text-field.js";
import "./select.js";
import "./button.js";
export const DEFAULT_WORKFLOW_LANES=Object.freeze([{id:"todo",label:"To do"},{id:"doing",label:"In progress"},{id:"done",label:"Done"}].map(Object.freeze));
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:12px;}.editor{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;align-items:end;}.editor[hidden]{display:none;}";
export class CuWorkflowEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._lanes=normalizeKanbanLanes(DEFAULT_WORKFLOW_LANES);this._items=[];this._source=[];this._next=1;
    const root=mount(this,css,'<section class="panel" aria-label="Workflow editor"><div class="editor"><cu-text-field label="Task title" required></cu-text-field><cu-select label="Stage"></cu-select><cu-button class="add" variant="accent">Add task</cu-button><cu-select class="task" label="Task to remove"></cu-select><cu-button class="remove" variant="outline">Remove task</cu-button></div><cu-kanban-board></cu-kanban-board></section>');
    this._board=root.querySelector("cu-kanban-board");this._editor=root.querySelector(".editor");this._title=root.querySelector("cu-text-field");[this._lane,this._task]=root.querySelectorAll("cu-select");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");
    this._board.addEventListener("cu-move",e=>{e.stopPropagation();this._items=this._board.items;this._source=this._items.map(x=>({...x}));this._emit("move",e.detail.id);});
    for(const type of ["cu-input","cu-change"])this._editor.addEventListener(type,e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._board.addEventListener(type,e=>e.stopPropagation());
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();if(!this._title.reportValidity())return;if(this.addTask(this._title.value,this._lane.value)){this._title.value="";this._title.focus();}});
    this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeTask(this._task.value);});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get lanes(){return this._lanes.map(x=>({...x}));}set lanes(v){this._lanes=normalizeKanbanLanes(v);this._items=normalizeKanbanItems(this._source,this._lanes);this._render();}
  get items(){return this._items.map(x=>({...x}));}set items(v){this._source=Array.isArray(v)?v.map(x=>x&&typeof x==="object"?{...x}:x):[];this._items=normalizeKanbanItems(this._source,this._lanes);this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addTask(title,laneId){if(this.readonly||typeof title!=="string"||!title.trim()||!this._lanes.some(x=>x.id===laneId))return false;let id;do{id="task-"+this._next++;}while(this._items.some(x=>x.id===id));this._items=normalizeKanbanItems([...this._items,{id,title,laneId}],this._lanes);this._source=this._items.map(x=>({...x}));this._render();this._emit("add",id);return true;}
  removeTask(id){if(this.readonly||!this._items.some(x=>x.id===id&&!x.disabled))return false;this._items=this._items.filter(x=>x.id!==id);this._source=this._items.map(x=>({...x}));this._render();this._emit("remove",id);return true;}
  _emit(action,id){notify(this,"cu-change",{action,id,items:this.items});}
  _options(control,items){const current=control.value,value=items.some(x=>x.id===current)?current:items[0]?.id??"";control.replaceChildren(...items.map(x=>{const o=this.ownerDocument.createElement("option");o.value=x.id;o.textContent=x.label;o.selected=x.id===value;return o;}));control.setAttribute("value",value);queueMicrotask(()=>{if(this.isConnected)control.value=value;});}
  _render(){if(!this._board)return;this._board.lanes=this._lanes;this._board.items=this._items;this._board.readonly=this.readonly;this._editor.hidden=this.readonly;this._options(this._lane,this._lanes);const tasks=this._items.filter(x=>!x.disabled).map(x=>({id:x.id,label:x.title}));this._options(this._task,tasks);this._add.disabled=!this._lanes.length;this._remove.disabled=!tasks.length;}
}
define("cu-workflow-editor",CuWorkflowEditor);
