import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeScheduleEvents} from "./scheduler.js";
import {validScheduleDate,scheduleToday} from "./_schedule.js";
import "./select.js";
import "./empty-state.js";
export function normalizeResources(resources){
  const seen=new Set();return (Array.isArray(resources)?resources:[]).flatMap(r=>{
    if(!r||typeof r.id!=="string"||!r.id||seen.has(r.id))return [];
    seen.add(r.id);return [{id:r.id,label:String(r.label??r.id)}];
  });
}
export function normalizeResourceEvents(events){
  const source=(Array.isArray(events)?events:[]).filter(e=>e&&typeof e.resourceId==="string"&&e.resourceId);
  const ids=new Map();for(const e of source)if(!ids.has(e.id)&&normalizeScheduleEvents([e]).length)ids.set(e.id,e.resourceId);
  return normalizeScheduleEvents(source).map(e=>({...e,resourceId:ids.get(e.id)}));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:var(--cu-space-3,12px);}.filter{max-width:360px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuResourceCalendar extends BrowserElement{
  static get observedAttributes(){return ["date","resource-id","locale"];}
  constructor(){
    super();this._resources=[];this._events=[];this._defaultDate=scheduleToday();
    const root=mount(this,css,'<section class="panel" aria-label="Resource calendar"><cu-select class="filter" label="Resource"></cu-select><span class="status" role="status"></span><cu-scheduler readonly></cu-scheduler></section>');
    this._select=root.querySelector("cu-select");this._scheduler=root.querySelector("cu-scheduler");this._status=root.querySelector(".status");
    this._select.addEventListener("cu-input",e=>e.stopPropagation());
    this._select.addEventListener("cu-change",e=>{e.stopPropagation();this.resourceId=e.detail.value==="all"?"":this._resources[Number(e.detail.value)]?.id??"";notify(this,"cu-change",{date:this.date,resourceId:this.resourceId});});
    this._scheduler.addEventListener("cu-change",e=>{e.stopPropagation();this.date=e.detail.date;notify(this,"cu-change",{date:this.date,resourceId:this.resourceId});});
  }
  connectedCallback(){this._options();this._sync();}attributeChangedCallback(){this._sync();}
  get resources(){return this._resources.map(r=>({...r}));}set resources(v){this._resources=normalizeResources(v);this._options();this._sync();}
  get events(){return this._events.map(e=>({...e}));}set events(v){this._events=normalizeResourceEvents(v);this._sync();}
  get date(){const v=this.getAttribute("date");return validScheduleDate(v)?v:this._defaultDate;}set date(v){if(validScheduleDate(v))this.setAttribute("date",v);}
  get resourceId(){const id=this.getAttribute("resource-id");return this._resources.some(r=>r.id===id)?id:"";}set resourceId(v){this.setAttribute("resource-id",String(v??""));}
  _selection(){const i=this._resources.findIndex(r=>r.id===this.resourceId);return i<0?"all":String(i);}
  _options(){
    if(!this._select)return;
    const doc=this.ownerDocument,values=[{value:"all",label:"All resources"},...this._resources.map((r,i)=>({value:String(i),label:r.label}))];
    this._select.replaceChildren(...values.map(r=>{const o=doc.createElement("option");o.value=r.value;o.textContent=r.label;return o;}));
    this._select.setAttribute("value",this._selection());queueMicrotask(()=>{if(this.isConnected)this._select.value=this._selection();});
  }
  _sync(){
    if(!this._scheduler)return;
    const selection=this._selection();if(this._select.value!==selection)this._select.value=selection;
    if(this._scheduler.date!==this.date)this._scheduler.date=this.date;
    const locale=this.getAttribute("locale")||"";if(this._scheduler.getAttribute("locale")!==locale)this._scheduler.setAttribute("locale",locale);
    const names=new Map(this._resources.map(r=>[r.id,r.label]));
    const events=this._events.filter(e=>names.has(e.resourceId)&&(!this.resourceId||e.resourceId===this.resourceId));
    this._scheduler.events=events.map(e=>({...e,description:[names.get(e.resourceId),e.description].filter(Boolean).join(" · ")}));
    this._status.textContent=events.filter(e=>e.date===this.date).length+" scheduled events";
  }
}
define("cu-resource-calendar",CuResourceCalendar);
