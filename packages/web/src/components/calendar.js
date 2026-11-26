import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";

function utcDate(y,m,d){
  const date=new Date(0);
  date.setUTCFullYear(y,m,d);
  return date;
}
function iso(date){
  const y=date.getUTCFullYear();
  if(!Number.isFinite(y)||y<1||y>9999)return "";
  return String(y).padStart(4,"0")+"-"+String(date.getUTCMonth()+1).padStart(2,"0")+"-"+String(date.getUTCDate()).padStart(2,"0");
}
function parse(value){
  if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const [y,m,d]=value.split("-").map(Number);
  const date=utcDate(y,m-1,d);
  return iso(date)===value?date:null;
}
function weekOffset(value){
  const n=Number(value);
  return Number.isFinite(n)?((Math.trunc(n)%7)+7)%7:0;
}
function today(){
  const d=new Date();
  return iso(utcDate(d.getFullYear(),d.getMonth(),d.getDate()));
}
function monthOf(value){return value.slice(0,7)+"-01";}
export function moveCalendarDate(value,amount,unit="day"){
  const d=parse(value);
  if(!d||!Number.isFinite(Number(amount)))return "";
  const n=Math.trunc(Number(amount));
  if(unit==="day")d.setUTCDate(d.getUTCDate()+n);
  else if(unit==="month"||unit==="year"){
    const day=d.getUTCDate();
    const month=utcDate(d.getUTCFullYear(),d.getUTCMonth()+(unit==="year"?12*n:n),1);
    const last=utcDate(month.getUTCFullYear(),month.getUTCMonth()+1,0).getUTCDate();
    month.setUTCDate(Math.min(day,last));
    return iso(month);
  }else return "";
  return iso(d);
}
export function calendarDays(month,weekStart=0){
  const first=parse(monthOf(String(month??"")));
  if(!first)return [];
  const start=utcDate(first.getUTCFullYear(),first.getUTCMonth(),1-
    (first.getUTCDay()-weekOffset(weekStart)+7)%7);
  return Array.from({length:42},(_,i)=>{
    const d=utcDate(start.getUTCFullYear(),start.getUTCMonth(),start.getUTCDate()+i);
    return {value:iso(d),day:d.getUTCDate(),inMonth:d.getUTCMonth()===first.getUTCMonth()};
  });
}
function formatter(locale,options){
  try{return new Intl.DateTimeFormat(locale||undefined,{...options,timeZone:"UTC",calendar:"gregory"});}
  catch{return new Intl.DateTimeFormat(undefined,{...options,timeZone:"UTC",calendar:"gregory"});}
}
const css=[
  ":host{display:block;max-width:340px;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{box-sizing:border-box;padding:12px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ".label{font-weight:600;margin-bottom:8px;}.heading{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px;}",
  ".month{font-weight:650;text-align:center;}.row{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;}",
  ".weekday{text-align:center;padding:7px 0;color:var(--cu-text-muted,#616161);font-size:11px;}",
  "button{box-sizing:border-box;background:transparent;color:inherit;border:1px solid transparent;border-radius:var(--cu-radius-md,6px);font:inherit;cursor:pointer;min-height:34px;}",
  ".nav{display:grid;place-items:center;min-width:34px;}.prev cu-icon{transform:rotate(180deg);}",
  ".day{width:100%;min-width:0;padding:0;aspect-ratio:1;min-height:28px;max-height:40px;}",
  "button:hover:not(:disabled):not([aria-disabled=true]){background:var(--cu-state-hover);}",
  ".day[data-outside=true]{color:var(--cu-text-muted,#616161);}",
  ".day[aria-current=date]{border-color:var(--cu-accent,#0067c0);font-weight:700;}",
  "[aria-selected=true] .day{background:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);font-weight:650;}",
  "[aria-selected=true] .day:hover:not(:disabled):not([aria-disabled=true]){background:var(--cu-accent-hover,#005a9e);}",
  "button:disabled,.day[aria-disabled=true]{opacity:.45;cursor:not-allowed;}",
  ".hint,.error{font-size:12px;margin-top:8px;}.hint{color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}",
  ".hint:empty,.error:empty{display:none;}",
  "@media(forced-colors:active){[aria-selected=true] .day{border:2px solid Highlight;}.day[aria-current=date]{outline:1px solid CanvasText;}}",
  focusStyle
].join("");

export class CuCalendar extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","min","max","label","hint","name","required","disabled","readonly","locale","week-start","aria-label"];}
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    this._value="";this._active=today();this._month=monthOf(this._active);
    const root=mount(this,css,
      '<div class="frame" part="frame"><div class="label" id="calendar-label"></div>'+
      '<div class="heading"><button type="button" class="nav prev" aria-label="Previous month"><cu-icon name="chevron-right" size="18"></cu-icon></button>'+
      '<span class="month" id="calendar-month" aria-live="polite"></span>'+
      '<button type="button" class="nav next" aria-label="Next month"><cu-icon name="chevron-right" size="18"></cu-icon></button></div>'+
      '<div role="grid" aria-labelledby="calendar-label calendar-month" class="grid"></div>'+
      '<div id="calendar-hint" class="hint" part="hint"></div><div id="calendar-error" class="error" part="error" role="alert"></div></div>');
    this._label=root.querySelector(".label");this._heading=root.querySelector(".month");
    this._grid=root.querySelector(".grid");this._prev=root.querySelector(".prev");this._next=root.querySelector(".next");
    this._hint=root.querySelector(".hint");this._error=root.querySelector(".error");
    this._prev.addEventListener("click",()=>this._navigate(-1));
    this._next.addEventListener("click",()=>this._navigate(1));
    this._grid.addEventListener("keydown",e=>this._key(e));
    this.addEventListener("invalid",()=>{this._reveal=true;this._syncForm();});
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      if(!this._assigned)this.value=this._defaultValue;
      this._initialized=true;
    }
    this._render();
  }
  attributeChangedCallback(name){
    if(!this._grid)return;
    if(name==="value"&&this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this.value=this._defaultValue;return;
    }
    this._render();
  }
  get value(){return this._value;}
  set value(value){
    this._assigned=true;this._value=parse(value)?value:"";
    if(this._value){this._active=this._value;this._month=monthOf(this._active);}
    this._render();
  }
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  _disabled(){return this.disabled||Boolean(this._formDisabled);}
  _readonly(){return this.hasAttribute("readonly");}
  _min(){const v=this.getAttribute("min");return parse(v)?v:"0001-01-01";}
  _max(){const v=this.getAttribute("max");return parse(v)?v:"9999-12-31";}
  _allowed(value){return Boolean(parse(value)&&value>=this._min()&&value<=this._max());}
  _clamp(value){
    if(this._min()>this._max())return value;
    return value<this._min()?this._min():value>this._max()?this._max():value;
  }
  formDisabledCallback(value){this._formDisabled=value;this._render();}
  formResetCallback(){this._reveal=false;this.value=this._defaultValue??"";}
  formStateRestoreCallback(value){this.value=String(value??"");}
  focus(options){this._grid.querySelector('button[tabindex="0"]')?.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._syncForm();return this._internals?.reportValidity()??this._valid;}
  _navigate(amount){
    if(this._disabled())return;
    const next=moveCalendarDate(this._active,amount,"month");
    if(!next)return;
    const old=this.shadowRoot.activeElement;
    this._active=this._clamp(next);this._month=monthOf(this._active);this._render();
    if(old?.disabled)this.focus();
  }
  _select(value){
    if(this._disabled()||this._readonly()||!this._allowed(value))return;
    const changed=value!==this._value;
    this.value=value;this.focus();
    if(changed){notify(this,"cu-input",{value});notify(this,"cu-change",{value});}
  }
  _key(event){
    if(this._disabled()||!event.target?.dataset?.date)return;
    const active=event.target.dataset.date;
    const d=parse(active);if(!d)return;
    let next="";
    switch(event.key){
      case "ArrowLeft":next=moveCalendarDate(active,-1);break;
      case "ArrowRight":next=moveCalendarDate(active,1);break;
      case "ArrowUp":next=moveCalendarDate(active,-7);break;
      case "ArrowDown":next=moveCalendarDate(active,7);break;
      case "Home":next=moveCalendarDate(active,-((d.getUTCDay()-weekOffset(this.getAttribute("week-start"))+7)%7));break;
      case "End":next=moveCalendarDate(active,6-((d.getUTCDay()-weekOffset(this.getAttribute("week-start"))+7)%7));break;
      case "PageUp":next=moveCalendarDate(active,-1,event.shiftKey?"year":"month");break;
      case "PageDown":next=moveCalendarDate(active,1,event.shiftKey?"year":"month");break;
      default:return;
    }
    event.preventDefault();
    if(!next)return;
    this._active=this._clamp(next);this._month=monthOf(this._active);this._render();this.focus();
  }
  _syncForm(){
    let flags={},message="";
    if(!this._disabled()&&!this._readonly()){
      if(this.required&&!this.value){flags={valueMissing:true};message="Choose a date.";}
      else if(this.value&&!this._allowed(this.value)){flags={customError:true};message="Choose a date within the allowed range.";}
    }
    this._valid=Object.keys(flags).length===0;
    this._error.textContent=this._reveal?message:"";
    this._grid.setAttribute("aria-invalid",String(this._reveal&&!this._valid));
    const descriptions=[this._hint.textContent?"calendar-hint":"",this._error.textContent?"calendar-error":""].filter(Boolean);
    if(descriptions.length)this._grid.setAttribute("aria-describedby",descriptions.join(" "));
    else this._grid.removeAttribute("aria-describedby");
    this._internals?.setFormValue(this._disabled()||!this.value?null:this.value);
    if(this._valid)this._internals?.setValidity({});
    else this._internals?.setValidity(flags,message,this._grid.querySelector('button[tabindex="0"]')??undefined);
  }
  _render(){
    if(!this._grid)return;
    const doc=this.ownerDocument;
    const locale=this.getAttribute("locale")||undefined;
    const disabled=this._disabled();
    this._active=this._clamp(this._active);this._month=monthOf(this._active);
    this._label.textContent=this.getAttribute("label")||this.getAttribute("aria-label")||"Calendar";
    this._hint.textContent=this.getAttribute("hint")||"";
    this._heading.textContent=formatter(locale,{month:"long",year:"numeric"}).format(parse(this._month));
    this._grid.setAttribute("aria-disabled",String(disabled));
    this._grid.setAttribute("aria-readonly",String(this._readonly()));
    this._grid.setAttribute("aria-required",String(this.required));
    this._prev.disabled=disabled||this._month<=monthOf(this._min());
    this._next.disabled=disabled||this._month>=monthOf(this._max());
    const weekStart=weekOffset(this.getAttribute("week-start"));
    const weekday=formatter(locale,{weekday:"short"}),fullWeekday=formatter(locale,{weekday:"long"});
    const fullDate=formatter(locale,{dateStyle:"full"});
    const row=()=>{const el=doc.createElement("div");el.className="row";el.setAttribute("role","row");return el;};
    const headings=row();
    for(let i=0;i<7;i++){
      const cell=doc.createElement("div"),d=utcDate(2024,0,7+(weekStart+i)%7);
      cell.className="weekday";cell.setAttribute("role","columnheader");
      cell.setAttribute("aria-label",fullWeekday.format(d));cell.textContent=weekday.format(d);headings.append(cell);
    }
    const rows=[headings],days=calendarDays(this._month,weekStart),current=today();
    for(let i=0;i<42;i+=7){
      const r=row();
      for(const day of days.slice(i,i+7)){
        const cell=doc.createElement("div");cell.setAttribute("role","gridcell");
        if(day.value){
          const b=doc.createElement("button");b.type="button";b.className="day";b.dataset.date=day.value;
          b.dataset.outside=String(!day.inMonth);b.textContent=String(day.day);
          b.setAttribute("aria-label",fullDate.format(parse(day.value)));
          b.setAttribute("aria-disabled",String(!this._allowed(day.value)||this._readonly()));
          b.disabled=disabled;b.tabIndex=day.value===this._active&&!disabled?0:-1;
          if(day.value===current)b.setAttribute("aria-current","date");
          cell.setAttribute("aria-selected",String(day.value===this.value));
          b.addEventListener("click",()=>this._select(day.value));cell.append(b);
        }
        r.append(cell);
      }
      rows.push(r);
    }
    this._grid.replaceChildren(...rows);this._syncForm();
  }
}
define("cu-calendar",CuCalendar);
