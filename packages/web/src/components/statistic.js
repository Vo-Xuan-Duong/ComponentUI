import {BrowserElement,mount,define,focusStyle} from "./_shared.js";
import "./icon.js";
const number=v=>v==null||typeof v==="boolean"||String(v).trim()===""?null:Number.isFinite(Number(v))?Number(v):null;
export function formatStatistic(value,options={}){
  const n=number(value);if(n===null)return "—";
  const style=["decimal","currency","percent"].includes(options.format)?options.format:"decimal";
  const precision=number(options.precision);
  const config={style,...(style==="currency"?{currency:options.currency||"USD"}:{}),...(options.compact?{notation:"compact"}:{})};
  if(precision!==null)config.minimumFractionDigits=config.maximumFractionDigits=Math.max(0,Math.min(6,Math.floor(precision)));
  try{return new Intl.NumberFormat(options.locale||undefined,config).format(n);}
  catch{return new Intl.NumberFormat("en",{style:"decimal",maximumFractionDigits:6}).format(n);}
}
export function statisticTrend(value,previous){
  const a=number(value),b=number(previous);
  if(a===null||b===null)return {delta:null,percent:null,direction:"none"};
  const delta=a-b;
  if(!Number.isFinite(delta))return {delta:null,percent:null,direction:"none"};
  const percent=b===0?null:delta/Math.abs(b)*100;
  return {delta,percent:Number.isFinite(percent)?percent:null,direction:delta>0?"up":delta<0?"down":"flat"};
}
export function sparklinePoints(values,width=120,height=36){
  if(!Array.isArray(values)||values.length<2||values.length>500||values.some(v=>typeof v!=="number"||!Number.isFinite(v))||!Number.isFinite(width)||!Number.isFinite(height)||width<=4||height<=4)return "";
  const min=Math.min(...values),max=Math.max(...values),span=max-min;
  if(!Number.isFinite(span))return "";
  return values.map((v,i)=>[2+i*(width-4)/(values.length-1),span?height-2-(v-min)/span*(height-4):height/2].map(x=>Number(x.toFixed(2))).join(",")).join(" ");
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{display:grid;gap:9px;min-width:0;padding:16px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);box-sizing:border-box;}",
  ":host([variant=plain]) .frame{padding:0;border:0;background:transparent;}:host([size=sm]) .frame{padding:11px;gap:6px;}",
  ".header{display:flex;align-items:center;justify-content:space-between;gap:8px;}.label{font-weight:550;color:var(--cu-text-muted,#616161);overflow-wrap:anywhere;}.icon{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:8px;background:var(--cu-state-hover);color:var(--cu-accent,#0067c0);}.icon[hidden]{display:none!important;}",
  ".main{display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap;}.value{font-size:clamp(23px,4vw,32px);font-weight:650;line-height:1.15;letter-spacing:-.025em;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;min-width:0;}",
  ":host([size=sm]) .value{font-size:22px;}.chart{width:108px;height:34px;flex:none;color:var(--cu-accent,#0067c0);}.chart[hidden]{display:none!important;}",
  ".footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.trend{font-size:12px;display:inline-flex;align-items:center;gap:3px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--cu-text-muted,#616161);}.trend[data-tone=positive]{color:var(--cu-success,#107c41);}.trend[data-tone=negative]{color:var(--cu-danger,#c42b1c);}.trend[hidden],.footer[hidden]{display:none!important;}.description{font-size:12px;color:var(--cu-text-muted,#616161);overflow-wrap:anywhere;}",focusStyle
].join("");
export class CuStatistic extends BrowserElement{
  static get observedAttributes(){return ["value","previous","label","description","locale","format","currency","precision","compact","prefix","suffix","icon","trend-tone"];}
  constructor(){
    super();this._series=[];
    const root=mount(this,css,'<div class="frame" part="frame"><div class="header"><span class="label" part="label"></span><span class="icon" hidden><cu-icon size="18"></cu-icon></span></div><div class="main"><span class="value" part="value"></span><svg class="chart" viewBox="0 0 120 36" aria-hidden="true" hidden><polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></div><div class="footer"><span class="trend" part="trend"></span><span class="description"></span></div></div>');
    for(const [k,q] of Object.entries({label:".label",icon:".icon",value:".value",chart:".chart",line:"polyline",footer:".footer",trend:".trend",description:".description"}))this["_"+k]=root.querySelector(q);
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get value(){return number(this.getAttribute("value"));}
  set value(v){const n=number(v);if(n===null)this.removeAttribute("value");else this.setAttribute("value",String(n));}
  get previous(){return number(this.getAttribute("previous"));}
  set previous(v){const n=number(v);if(n===null)this.removeAttribute("previous");else this.setAttribute("previous",String(n));}
  get series(){return [...this._series];}
  set series(v){this._series=Array.isArray(v)&&v.length<=500&&v.every(x=>typeof x==="number"&&Number.isFinite(x))?[...v]:[];this._sync();}
  _sync(){
    if(!this._value)return;
    const options={locale:this.getAttribute("locale")||undefined,format:this.getAttribute("format"),currency:this.getAttribute("currency"),precision:this.getAttribute("precision"),compact:this.hasAttribute("compact")};
    const val=this.value;
    this._label.textContent=this.getAttribute("label")||"Statistic";
    this._value.textContent=val===null?"—":(this.getAttribute("prefix")||"")+formatStatistic(val,options)+(this.getAttribute("suffix")||"");
    const name=this.getAttribute("icon");this._icon.hidden=!name;this._icon.firstElementChild.setAttribute("name",name||"info");
    const trend=statisticTrend(val,this.previous);
    this._trend.hidden=trend.direction==="none";
    const polarity=this.getAttribute("trend-tone")||"auto";
    this._trend.dataset.tone=polarity==="neutral"||trend.direction==="flat"||trend.direction==="none"?"neutral":(trend.direction==="up")!==(polarity==="inverse")?"positive":"negative";
    const delta=trend.percent===null?formatStatistic(trend.delta,{...options,compact:false}):formatStatistic(trend.percent/100,{locale:options.locale,format:"percent",precision:1});
    this._trend.textContent=trend.direction==="none"?"":(trend.direction==="up"?"↑ +":trend.direction==="down"?"↓ ":"")+delta;
    this._trend.setAttribute("aria-label",trend.direction==="none"?"":trend.direction==="up"?"Increase "+delta:trend.direction==="down"?"Decrease "+delta:"No change "+delta);
    this._description.textContent=this.getAttribute("description")||"";
    this._footer.hidden=this._trend.hidden&&!this._description.textContent;
    const points=sparklinePoints(this._series);this._chart.toggleAttribute("hidden",!points);this._line.setAttribute("points",points);
  }
}
define("cu-statistic",CuStatistic);
