import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeTimelineItems} from "./timeline.js";
import {validScheduleDate,scheduleToday} from "./_schedule.js";
import "./date-picker.js";
import "./text-field.js";
import "./select.js";
import "./button.js";
export function normalizeTimelineEntries(items){
  return normalizeTimelineItems(items).filter(i=>validScheduleDate(i.datetime)).map(i=>({...i,time:i.datetime,action:""})).sort((a,b)=>a.datetime.localeCompare(b.datetime));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:var(--cu-space-3,12px);}.editor{display:grid;gap:8px;padding:12px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);}.fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;}.actions{display:flex;flex-wrap:wrap;gap:8px;}.error{font-size:12px;color:var(--cu-danger,#c42b1c);}.error:empty,.editor[hidden]{display:none;}";
export class CuTimelineEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._items=[];this._editing="";this._next=1;
    const root=mount(this,css,'<section class="panel" aria-label="Timeline editor"><cu-timeline label="Milestones"></cu-timeline><div class="editor"><div class="fields"><cu-text-field class="title" label="Title" required></cu-text-field><cu-date-picker label="Date" required></cu-date-picker><cu-select label="Status" value="neutral"><option value="neutral">Planned</option><option value="active">In progress</option><option value="success">Completed</option><option value="warning">Warning</option><option value="danger">Failed</option></cu-select></div><cu-text-field class="description" label="Description"></cu-text-field><div class="actions"><cu-button class="save" variant="accent">Add milestone</cu-button><cu-button class="cancel" variant="outline" hidden>Cancel</cu-button><cu-button class="remove" variant="outline" hidden>Remove</cu-button></div><span class="error" role="alert"></span></div></section>');
    this._timeline=root.querySelector("cu-timeline");this._editor=root.querySelector(".editor");this._title=root.querySelector(".title");this._date=root.querySelector("cu-date-picker");this._status=root.querySelector("cu-select");this._description=root.querySelector(".description");this._save=root.querySelector(".save");this._cancel=root.querySelector(".cancel");this._remove=root.querySelector(".remove");this._error=root.querySelector(".error");
    for(const control of [this._title,this._date,this._status,this._description])for(const type of ["cu-input","cu-change"])control.addEventListener(type,e=>{e.stopPropagation();this._error.textContent="";});
    this._timeline.addEventListener("cu-action",e=>{e.stopPropagation();this.edit(e.detail.id);});
    this._save.addEventListener("cu-press",e=>{e.stopPropagation();this._saveDraft();});
    this._cancel.addEventListener("cu-press",e=>{e.stopPropagation();this._reset();});
    this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.remove(this._editing);});
  }
  connectedCallback(){if(!this._date.value)this._date.value=scheduleToday();this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(i=>({...i}));}set items(v){this._items=normalizeTimelineEntries(v);if(this._editing&&!this._items.some(i=>i.id===this._editing))this._reset();this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  edit(id){
    const item=this._items.find(i=>i.id===id);if(this.readonly||!item)return false;
    this._editing=id;this._title.value=item.title;this._date.value=item.datetime;this._status.value=item.status;this._description.value=item.description;this._error.textContent="";this._render();this._title.focus();return true;
  }
  remove(id){if(this.readonly||!this._items.some(i=>i.id===id))return false;this._items=this._items.filter(i=>i.id!==id);if(this._editing===id)this._reset();this._render();notify(this,"cu-change",{action:"remove",id,items:this.items});return true;}
  _reset(){this._editing="";this._title.value="";this._date.value=scheduleToday();this._status.value="neutral";this._description.value="";this._error.textContent="";this._render();}
  _saveDraft(){
    if(this.readonly)return;
    if(!this._title.value.trim()||!this._title.reportValidity()||!validScheduleDate(this._date.value)){this._error.textContent="Enter a title and a valid date.";return;}
    const action=this._editing?"update":"add";let id=this._editing;
    if(!id){do{id="milestone-"+this._next++;}while(this._items.some(i=>i.id===id));}
    const previous=this._items.find(i=>i.id===id);
    this._items=normalizeTimelineEntries([...this._items.filter(i=>i.id!==id),{...previous,id,title:this._title.value,datetime:this._date.value,status:this._status.value,description:this._description.value}]);
    this._reset();this._title.focus();notify(this,"cu-change",{action,id,items:this.items});
  }
  _render(){
    if(!this._timeline)return;
    this._timeline.items=this._items.map(i=>({...i,action:this.readonly?"":"Edit"}));this._editor.hidden=this.readonly;
    this._save.textContent=this._editing?"Save changes":"Add milestone";this._cancel.hidden=this._remove.hidden=!this._editing;
  }
}
define("cu-timeline-editor",CuTimelineEditor);
