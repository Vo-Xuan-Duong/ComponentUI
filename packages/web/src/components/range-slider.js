import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";

const finite=(v,fallback)=>v==null||String(v).trim()===""||!Number.isFinite(Number(v))?fallback:Number(v);
const round=v=>Number(v.toPrecision(14));
export function normalizeRange(value,min=0,max=100,step=1){
  const lo=finite(min,0),hi=Math.max(lo,finite(max,100));
  const candidate=finite(step,1),increment=candidate>0?candidate:1;
  const ticks=Math.max(0,Math.floor((hi-lo)/increment+1e-9));
  const end=Math.min(hi,round(lo+ticks*increment));
  const snap=(v,fallback)=>Math.max(lo,Math.min(end,round(lo+Math.max(0,Math.min(ticks,Math.round((finite(v,fallback)-lo)/increment)))*increment)));
  let input=value;
  if(typeof input==="string"){try{input=JSON.parse(input);}catch{input=null;}}
  const a=snap(Array.isArray(input)?input[0]:null,lo),b=snap(Array.isArray(input)?input[1]:null,end);
  return {min:lo,max:hi,step:increment,value:[Math.min(a,b),Math.max(a,b)]};
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  "fieldset{border:0;padding:0;margin:0;min-inline-size:0;}legend{font-weight:600;padding:0;margin-bottom:6px;}",
  ".values{display:flex;justify-content:space-between;gap:8px;font-variant-numeric:tabular-nums;color:var(--cu-text-muted,#616161);}",
  ".track{--thumb:20px;position:relative;height:44px;touch-action:pan-y;direction:ltr;}",
  ".rail{position:absolute;inset-inline:calc(var(--thumb)/2);height:4px;top:20px;border-radius:99px;background:var(--cu-border-strong,#d1d1d1);cursor:pointer;}",
  ".fill{position:absolute;top:0;bottom:0;left:var(--low,0%);right:var(--high,0%);border-radius:inherit;background:var(--cu-accent,#0067c0);}",
  "input{appearance:none;-webkit-appearance:none;position:absolute;inset:0;margin:0;width:100%;height:44px;background:transparent;pointer-events:none;outline:none;}",
  "input::-webkit-slider-runnable-track{background:transparent;height:4px;}input::-moz-range-track{background:transparent;height:4px;}",
  "input::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;pointer-events:auto;cursor:grab;box-sizing:border-box;width:var(--thumb);height:var(--thumb);margin-top:-8px;border:2px solid var(--cu-accent,#0067c0);border-radius:50%;background:var(--cu-surface,#fff);}",
  "input::-moz-range-thumb{pointer-events:auto;cursor:grab;box-sizing:border-box;width:var(--thumb);height:var(--thumb);border:2px solid var(--cu-accent,#0067c0);border-radius:50%;background:var(--cu-surface,#fff);}",
  "input:focus-visible,input[data-front=true]:focus-visible{z-index:3;outline:2px solid var(--cu-focus,#0067c0);outline-offset:0;border-radius:8px;}",
  "input[data-front=true]{z-index:2;}input:disabled::-webkit-slider-thumb{pointer-events:none;cursor:default;}input:disabled::-moz-range-thumb{pointer-events:none;cursor:default;}",
  ".track[data-locked=true]{opacity:.55;}.track[data-locked=true] .rail{cursor:default;}",
  ".hint{font-size:12px;color:var(--cu-text-muted,#616161);}.hint:empty{display:none;}",
  "@media(forced-colors:active){.rail{background:CanvasText;}.fill{background:Highlight;}input::-webkit-slider-thumb{border-color:Highlight;}input::-moz-range-thumb{border-color:Highlight;}}",focusStyle
].join("");
export class CuRangeSlider extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","min","max","step","name","label","hint","disabled","readonly","lower-label","upper-label","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._value=[0,100];this._front="upper";
    const root=mount(this,css,'<fieldset><legend></legend><div class="values"><span class="low"></span><span class="high"></span></div><div class="track" part="track"><div class="rail"><div class="fill"></div></div><input class="lower" type="range"><input class="upper" type="range"></div><div class="hint" id="range-hint"></div></fieldset>');
    for(const [k,q] of Object.entries({group:"fieldset",label:"legend",low:".low",high:".high",track:".track",rail:".rail",lower:".lower",upper:".upper",hint:".hint"}))this["_"+k]=root.querySelector(q);
    for(const thumb of ["lower","upper"]){
      const input=this["_"+thumb];
      input.addEventListener("focus",()=>{this._front=thumb;this._syncFront();});
      input.addEventListener("pointerdown",()=>{this._front=thumb;this._syncFront();});
      input.addEventListener("input",()=>this._move(thumb,input.valueAsNumber,"cu-input"));
      input.addEventListener("change",()=>this._move(thumb,input.valueAsNumber,"cu-change"));
    }
    this._rail.addEventListener("pointerdown",e=>{
      if(this._locked()||e.button!==0)return;
      const r=this._rail.getBoundingClientRect();if(!r.width)return;
      const s=this._state(),v=s.min+(s.max-s.min)*Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
      const thumb=Math.abs(v-this._value[0])<Math.abs(v-this._value[1])?"lower":"upper";
      this._move(thumb,v,"cu-input");this._move(thumb,this["_"+thumb].valueAsNumber,"cu-change");this["_"+thumb].focus();
    });
  }
  connectedCallback(){
    if(!this._initialized){this._default=this.getAttribute("value");if(!this._assigned)this._value=this._state(this._default).value;this._initialized=true;}
    this._sync();
  }
  attributeChangedCallback(name){
    if(!this._lower)return;
    if(name==="value"&&this._initialized){this._default=this.getAttribute("value");this._value=this._state(this._default).value;}
    this._sync();
  }
  get value(){return [...this._value];}
  set value(v){this._assigned=true;this._value=this._state(v).value;this._sync();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get min(){return this._state().min;}set min(v){if(v==null)this.removeAttribute("min");else this.setAttribute("min",String(v));}
  get max(){return this._state().max;}set max(v){if(v==null)this.removeAttribute("max");else this.setAttribute("max",String(v));}
  get step(){return this._state().step;}set step(v){if(v==null)this.removeAttribute("step");else this.setAttribute("step",String(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _locked(){return this.disabled||Boolean(this._formDisabled)||this.hasAttribute("readonly");}
  _state(v=this._value){return normalizeRange(v,this.getAttribute("min"),this.getAttribute("max"),this.getAttribute("step"));}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._value=this._state(this._default??null).value;this._sync();}
  formStateRestoreCallback(v){this.value=v;}
  focus(options){this._lower.focus(options);}
  _move(thumb,v,type){
    if(this._locked())return;
    const s=this._state([v,v]),next=s.value[0];
    const old=this.value;
    this._value=thumb==="lower"?[Math.min(next,old[1]),old[1]]:[old[0],Math.max(next,old[0])];
    this._front=thumb;this._sync();
    if(type==="cu-change"||old[0]!==this._value[0]||old[1]!==this._value[1])notify(this,type,{value:this.value,thumb});
  }
  _syncFront(){this._lower.dataset.front=String(this._front==="lower");this._upper.dataset.front=String(this._front==="upper");}
  _sync(){
    if(!this._lower)return;
    const s=this._state();this._value=s.value;
    this._label.textContent=this.getAttribute("label")||this.getAttribute("aria-label")||"Range";
    this._hint.textContent=this.getAttribute("hint")||"";
    this._track.dataset.locked=String(this._locked());
    const [a,b]=this._value;
    for(const [thumb,value] of [["lower",a],["upper",b]]){
      const input=this["_"+thumb];
      input.min=String(s.min);input.max=String(s.max);input.step=String(s.step);input.value=String(value);input.disabled=this._locked();
      input.setAttribute("aria-label",this.getAttribute(thumb+"-label")||this._label.textContent+" "+thumb+" value");
      if(this._hint.textContent)input.setAttribute("aria-describedby","range-hint");else input.removeAttribute("aria-describedby");
    }
    this._low.textContent=String(a);this._high.textContent=String(b);
    const span=s.max-s.min;
    this._rail.style.setProperty("--low",(span?(a-s.min)/span*100:0)+"%");
    this._rail.style.setProperty("--high",(span?(s.max-b)/span*100:0)+"%");
    this._syncFront();
    const data=new FormData(),name=this.getAttribute("name");if(name)for(const v of this._value)data.append(name,String(v));
    this._internals?.setFormValue(this.disabled||this._formDisabled?null:data,JSON.stringify(this._value));
  }
}
define("cu-range-slider",CuRangeSlider);
