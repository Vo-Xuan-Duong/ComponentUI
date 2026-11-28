import {CuDataTable} from "./data-table.js";
import {moveCalendarDate} from "./calendar.js";
import {validScheduleDate,scheduleToday,scheduleDayDistance} from "./_schedule.js";
import "./progress-bar.js";
export function normalizeGanttTasks(tasks){
  const seen=new Set(),out=[];
  for(const t of Array.isArray(tasks)?tasks:[]){
    if(!t||typeof t.id!=="string"||!t.id||seen.has(t.id)||typeof t.title!=="string"||!t.title.trim()||!validScheduleDate(t.start)||!validScheduleDate(t.end)||t.end<t.start)continue;
    seen.add(t.id);const p=Number(t.progress);
    out.push({id:t.id,title:t.title.trim(),start:t.start,end:t.end,progress:Number.isFinite(p)?Math.max(0,Math.min(100,p)):0,dependencies:[...new Set((Array.isArray(t.dependencies)?t.dependencies:[]).filter(x=>typeof x==="string"&&x!==t.id))]});
  }
  return out;
}
export function ganttRange(tasks,start="",end="",fallback=scheduleToday()){
  const items=normalizeGanttTasks(tasks);
  const first=items.reduce((v,t)=>!v||t.start<v?t.start:v,"");
  const last=items.reduce((v,t)=>!v||t.end>v?t.end:v,"");
  const a=validScheduleDate(start)?start:first||fallback;
  const b=validScheduleDate(end)&&end>=a?end:last&&last>=a?last:a;
  const days=scheduleDayDistance(a,b)+1;
  const truncated=days>366;
  return {start:a,end:truncated?moveCalendarDate(a,365):b,days:Math.min(days,366),truncated};
}
export function ganttTaskSpan(task,range){
  if(!task||!range||!Number.isFinite(range.days)||range.days<1||!validScheduleDate(task.start)||!validScheduleDate(task.end)||task.end<task.start)return null;
  const start=Math.max(0,scheduleDayDistance(range.start,task.start)),end=Math.min(range.days-1,scheduleDayDistance(range.start,task.end));
  if(!Number.isFinite(start)||!Number.isFinite(end)||start>end||start>=range.days||end<0)return null;
  return {offset:start/range.days*100,width:(end-start+1)/range.days*100,clipped:task.start<range.start||task.end>range.end};
}
const css=".gantt-track{position:relative;box-sizing:border-box;min-width:240px;height:34px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);background:repeating-linear-gradient(to right,transparent 0,transparent calc(var(--tick,10%) - 1px),var(--cu-border,#e5e5e5) calc(var(--tick,10%) - 1px),var(--cu-border,#e5e5e5) var(--tick,10%));}.gantt-bar{position:absolute;top:6px;height:20px;min-width:2px;box-sizing:border-box;border:1px solid var(--cu-accent,#0067c0);border-radius:var(--cu-radius-sm,4px);background:color-mix(in srgb,var(--cu-accent,#0067c0) 18%,var(--cu-surface,#fff));display:flex;align-items:center;padding:2px;}.gantt-bar cu-progress-bar{width:100%;min-width:0;}.gantt-bar cu-progress-bar::part(header){display:none;}.gantt-bar cu-progress-bar::part(progress){height:10px;}.gantt-outside{color:var(--cu-text-muted,#616161);font-size:12px;line-height:32px;padding-inline:8px;}@media(forced-colors:active){.gantt-track,.gantt-bar{border-color:CanvasText;}}";
export class CuGanttChart extends CuDataTable{
  static get observedAttributes(){return [...super.observedAttributes,"range-start","range-end"];}
  constructor(){
    super();this._tasks=[];this._range=ganttRange([]);
    const style=this.ownerDocument.createElement("style");style.textContent=css;this.shadowRoot.append(style);
  }
  connectedCallback(){this._syncRange();super.connectedCallback();}
  attributeChangedCallback(name){if(name==="range-start"||name==="range-end")this._syncRange();else super.attributeChangedCallback(name);}
  get tasks(){return this._tasks.map(t=>({...t,dependencies:[...t.dependencies]}));}
  set tasks(v){this._tasks=normalizeGanttTasks(v);this._syncRange();this.rows=this._tasks.map(t=>({...t,dependencyText:t.dependencies.join(", "),timeline:t.start+" – "+t.end}));}
  get rangeStart(){return this.getAttribute("range-start")||"";}set rangeStart(v){this.setAttribute("range-start",String(v??""));}
  get rangeEnd(){return this.getAttribute("range-end")||"";}set rangeEnd(v){this.setAttribute("range-end",String(v??""));}
  get range(){return {...this._range};}
  _syncRange(){
    if(!this._tasks)return;
    this._range=ganttRange(this._tasks,this.rangeStart,this.rangeEnd);
    const r=this._range;
    this.columns=[{key:"title",label:"Task"},{key:"start",label:"Start"},{key:"end",label:"End"},{key:"progress",label:"Progress (%)"},{key:"dependencyText",label:"Depends on"},{key:"timeline",label:r.start+" – "+r.end+(r.truncated?" (first 366 days)":""),sortable:false,filterable:false}];
  }
  _renderDataCell(row,column,id){
    if(column.key!=="timeline")return super._renderDataCell(row,column,id);
    const cell=this._makeCell(""),doc=this.ownerDocument,track=doc.createElement("div");track.className="gantt-track";
    const r=this._range,span=ganttTaskSpan(row,r);
    if(r?.days)track.style.setProperty("--tick",Math.min(100,100*(r.days>31?7:1)/r.days)+"%");
    if(!span){const text=doc.createElement("span");text.className="gantt-outside";text.textContent="Outside range";track.append(text);}
    else{
      const bar=doc.createElement("div");bar.className="gantt-bar";bar.style.left=span.offset+"%";bar.style.width=span.width+"%";
      const progress=doc.createElement("cu-progress-bar");progress.value=row.progress;progress.setAttribute("aria-label",row.title+": "+row.start+" to "+row.end+", "+row.progress+"% complete"+(span.clipped?", partially outside range":""));if(row.progress===100)progress.setAttribute("tone","success");bar.append(progress);track.append(bar);
    }
    cell.append(track);return cell;
  }
}
define("cu-gantt-chart",CuGanttChart);
