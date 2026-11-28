import {BrowserElement,mount,define,notify} from "./_shared.js";
import {moveCalendarDate} from "./calendar.js";
import {validScheduleDate,validScheduleTime,scheduleToday} from "./_schedule.js";
import "./date-picker.js";
import "./time-picker.js";
import "./text-field.js";
import "./button.js";
import "./timeline.js";
import "./empty-state.js";
export function normalizeScheduleEvents(events){
  const seen=new Set(),out=[];
  for(const event of Array.isArray(events)?events:[]){
    if(!event||typeof event.id!=="string"||!event.id||seen.has(event.id)||typeof event.title!=="string"||!event.title.trim()||!validScheduleDate(event.date)||!validScheduleTime(event.start)||!validScheduleTime(event.end)||event.end<=event.start)continue;
    seen.add(event.id);out.push({id:event.id,title:event.title.trim(),date:event.date,start:event.start,end:event.end,description:String(event.description??"")});
  }
  return out;
}
export function scheduleDayEvents(events,date){
  return normalizeScheduleEvents(events).filter(e=>e.date===date).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}.layout{display:grid;grid-template-columns:minmax(220px,320px) minmax(0,1fr);gap:var(--cu-space-4,16px);align-items:start;}.agenda{display:grid;gap:12px;min-width:0;}.nav{display:flex;align-items:end;gap:6px;flex-wrap:wrap;}.nav cu-date-picker{flex:1 1 130px;}.heading{font-weight:650;}.editor{display:grid;gap:8px;padding:12px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);}.times{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);font-size:12px;}.error:empty{display:none;}.editor[hidden]{display:none;}@media(max-width:660px){.layout{grid-template-columns:1fr;}}@media(forced-colors:active){.editor{border-color:CanvasText;}}";
export class CuScheduler extends BrowserElement{
  static get observedAttributes(){return ["date","locale","readonly"];}
  constructor(){
    super();this._events=[];this._nextId=1;this._defaultDate=scheduleToday();
    const root=mount(this,css,'<section class="panel" aria-label="Scheduler"><div class="nav"><cu-button variant="outline" size="sm" data-nav="previous" aria-label="Previous day">Previous</cu-button><cu-button variant="outline" size="sm" data-nav="today">Today</cu-button><cu-button variant="outline" size="sm" data-nav="next" aria-label="Next day">Next</cu-button><cu-date-picker label="Selected date" required></cu-date-picker></div><div class="layout"><cu-calendar label="Schedule calendar"></cu-calendar><div class="agenda"><div class="heading" role="heading" aria-level="3"></div><div class="status" role="status"></div><cu-timeline label="Daily agenda"></cu-timeline><cu-empty-state size="sm" title="No events" description="There are no events on this date." hidden></cu-empty-state><div class="editor" part="editor"><cu-text-field label="Event title" required></cu-text-field><div class="times"><cu-time-picker label="Start" required value="09:00"></cu-time-picker><cu-time-picker label="End" required value="10:00"></cu-time-picker></div><cu-button class="add" variant="accent">Add event</cu-button><div class="error" role="alert"></div></div></div></div></section>');
    this._calendar=root.querySelector("cu-calendar");this._date=root.querySelector("cu-date-picker");this._timeline=root.querySelector("cu-timeline");this._empty=root.querySelector("cu-empty-state");this._heading=root.querySelector(".heading");this._status=root.querySelector(".status");this._editor=root.querySelector(".editor");this._title=root.querySelector("cu-text-field");[this._start,this._end]=root.querySelectorAll("cu-time-picker");this._error=root.querySelector(".error");
    for(const control of [this._calendar,this._date]){
      control.addEventListener("cu-input",e=>e.stopPropagation());
      control.addEventListener("cu-change",e=>{e.stopPropagation();this._selectDate(e.detail.value);});
    }
    root.querySelector(".nav").addEventListener("cu-press",e=>{e.stopPropagation();const action=e.target.dataset.nav;if(action)this._selectDate(action==="today"?scheduleToday():moveCalendarDate(this.date,action==="previous"?-1:1));});
    for(const control of [this._title,this._start,this._end])for(const type of ["cu-input","cu-change"])control.addEventListener(type,e=>{e.stopPropagation();this._error.textContent="";});
    root.querySelector(".add").addEventListener("cu-press",e=>{e.stopPropagation();this._addFromEditor();});
    this._timeline.addEventListener("cu-action",e=>{e.stopPropagation();const id=e.detail.id;if(!this.readonly)this.removeEvent(id);});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get date(){const v=this.getAttribute("date");return validScheduleDate(v)?v:this._defaultDate;}
  set date(v){if(validScheduleDate(v))this.setAttribute("date",v);}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get events(){return this._events.map(e=>({...e}));}set events(v){this._events=normalizeScheduleEvents(v);this._render();}
  get visibleEvents(){return scheduleDayEvents(this._events,this.date);}
  _selectDate(v){if(!validScheduleDate(v)||v===this.date){this._render();return;}this.date=v;notify(this,"cu-change",{value:this.date,date:this.date});}
  addEvent(event){
    if(this.readonly)return false;
    const [item]=normalizeScheduleEvents([event]);if(!item||this._events.some(e=>e.id===item.id))return false;
    this._events.push(item);this._render();notify(this,"cu-action",{action:"add",item:{...item},events:this.events});return true;
  }
  removeEvent(id){
    if(this.readonly)return false;
    const item=this._events.find(e=>e.id===id);if(!item)return false;
    this._events=this._events.filter(e=>e.id!==id);this._render();notify(this,"cu-action",{action:"remove",item:{...item},events:this.events});return true;
  }
  _addFromEditor(){
    if(this.readonly)return;
    if(!this._title.value.trim()||!this._title.reportValidity()||!this._start.reportValidity()||!this._end.reportValidity()||!validScheduleTime(this._start.value)||!validScheduleTime(this._end.value)||this._end.value<=this._start.value){this._error.textContent="Enter a title and an end time after the start time.";return;}
    let id;do{id="event-"+this._nextId++;}while(this._events.some(e=>e.id===id));
    if(this.addEvent({id,title:this._title.value,date:this.date,start:this._start.value,end:this._end.value})){this._title.value="";this._error.textContent="";this._title.focus();}
  }
  _render(){
    if(!this._calendar)return;
    const date=this.date,locale=this.getAttribute("locale")||"";
    if(this._calendar.getAttribute("locale")!==locale)this._calendar.setAttribute("locale",locale);
    if(this._calendar.value!==date)this._calendar.value=date;
    if(this._date.value!==date)this._date.value=date;
    this._heading.textContent=date;
    const events=this.visibleEvents;this._status.textContent=events.length+" event"+(events.length===1?"":"s");
    this._timeline.items=events.map(e=>({id:e.id,title:e.title,time:e.start+" – "+e.end,description:e.description,action:this.readonly?"":"Remove"}));
    this._timeline.hidden=!events.length;this._empty.hidden=Boolean(events.length);this._editor.hidden=this.readonly;
  }
}
define("cu-scheduler",CuScheduler);
