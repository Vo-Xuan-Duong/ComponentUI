import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";

const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const byte=v=>Math.round(clamp(v,0,255));
const decimal=v=>String(Number(v.toFixed(3)));
const numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
function channel(text,scale=255){
  const percent=text.endsWith("%"),raw=percent?text.slice(0,-1):text;
  if(!numeric.test(raw))return NaN;
  const n=Number(raw);
  return percent?clamp(n,0,100)*scale/100:clamp(n,0,scale);
}
function hslToRgb(h,s,l){
  h=((h%360)+360)%360/360;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h*12)%12;return byte(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};
  return {r:f(0),g:f(8),b:f(4)};
}
export function parseColor(value){
  const text=String(value??"").trim().toLowerCase();
  const hex=/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if(hex){
    let h=hex[1];if(h.length<=4)h=[...h].map(c=>c+c).join("");
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:h.length===8?parseInt(h.slice(6,8),16)/255:1};
  }
  const fn=/^(rgba?|hsla?)\(([^()]*)\)$/.exec(text);if(!fn)return null;
  const parts=fn[2].split(",").map(x=>x.trim());
  if(parts.length!==3&&parts.length!==4)return null;
  const a=parts.length===4?channel(parts[3],1):1;if(!Number.isFinite(a))return null;
  if(fn[1].startsWith("rgb")){
    const rgb=parts.slice(0,3).map(x=>channel(x));if(!rgb.every(Number.isFinite))return null;
    return {r:byte(rgb[0]),g:byte(rgb[1]),b:byte(rgb[2]),a};
  }
  const hue=parts[0].replace(/deg$/,"");
  if(!numeric.test(hue)||!parts[1].endsWith("%")||!parts[2].endsWith("%"))return null;
  const s=channel(parts[1],1),l=channel(parts[2],1);
  if(![Number(hue),s,l].every(Number.isFinite))return null;
  return {...hslToRgb(Number(hue),s,l),a};
}
export function formatColor(color,format="hex",alpha=false){
  const {r,g,b}=color,a=clamp(color.a,0,1);
  if(format==="rgb")return alpha?"rgba("+r+", "+g+", "+b+", "+decimal(a)+")":"rgb("+r+", "+g+", "+b+")";
  if(format==="hsl"){
    const [rr,gg,bb]=[r,g,b].map(v=>v/255),max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb),d=max-min,l=(max+min)/2;
    let h=0;if(d)h=(max===rr?(gg-bb)/d+(gg<bb?6:0):max===gg?(bb-rr)/d+2:(rr-gg)/d+4)*60;
    const s=d?d/(1-Math.abs(2*l-1)):0;
    const base=decimal(h)+", "+decimal(s*100)+"%, "+decimal(l*100)+"%";
    return alpha?"hsla("+base+", "+decimal(a)+")":"hsl("+base+")";
  }
  return "#"+[r,g,b,...(alpha?[byte(a*255)]:[])].map(v=>byte(v).toString(16).padStart(2,"0")).join("");
}
const palette=["#0067c0","#744da9","#107c41","#c42b1c","#ca8a04","#0891b2","#242424","#ffffff"];
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  "fieldset{border:0;margin:0;padding:0;min-inline-size:0;display:grid;gap:10px;}legend{font-weight:600;padding:0;margin-bottom:7px;}",
  ".row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}.preview{width:42px;height:40px;position:relative;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);overflow:hidden;background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 0/12px 12px;}",
  ".sample{position:absolute;inset:0;pointer-events:none;}.native{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;padding:0;border:0;}.preview:focus-within{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".text{flex:1;min-width:100px;box-sizing:border-box;}input,select,button{font:inherit;color:inherit;}input.text,select{min-height:var(--cu-control-height,40px);border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);padding:0 9px;background:var(--cu-surface,#fff);}",
  "input.text[aria-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.palette{display:flex;gap:7px;flex-wrap:wrap;}.swatch{width:29px;height:29px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:6px;cursor:pointer;}.swatch[aria-pressed=true]{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}.swatch:hover:not(:disabled){transform:scale(1.08);}",
  ".opacity{display:flex;align-items:center;gap:8px;}.opacity input{flex:1;min-width:0;accent-color:var(--cu-accent,#0067c0);}.opacity output{min-width:36px;text-align:end;font-variant-numeric:tabular-nums;}",
  ".hint,.error{font-size:12px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}.hint:empty,.error:empty,.opacity[hidden]{display:none!important;}fieldset:disabled{opacity:.55;}button:disabled,.native:disabled{cursor:default;}",focusStyle
].join("");
export class CuColorPicker extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","label","name","hint","error","required","disabled","readonly","alpha","format","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._color=null;this._format="hex";
    const root=mount(this,css,'<fieldset><legend></legend><div class="row"><div class="preview"><span class="sample"></span><input class="native" type="color" aria-label="Open system color picker"></div><input class="text" type="text" spellcheck="false" autocomplete="off" aria-label="Color value"><select aria-label="Color format"><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></div><div class="palette" role="group" aria-label="Color presets"></div><label class="opacity">Opacity <input type="range" min="0" max="100" value="100"><output></output></label><div class="hint" id="color-hint"></div><div class="error" id="color-error" role="alert"></div></fieldset>');
    for(const [k,q] of Object.entries({group:"fieldset",label:"legend",sample:".sample",native:".native",text:".text",select:"select",palette:".palette",opacity:".opacity",alpha:'input[type="range"]',output:"output",hint:".hint",error:".error"}))this["_"+k]=root.querySelector(q);
    this._text.addEventListener("input",()=>this._typed());
    this._text.addEventListener("change",()=>{this._reveal=true;this._typed(false);if(this._valid){this._sync();this._emit("cu-change");}});
    this._text.addEventListener("blur",()=>{this._reveal=true;this._syncForm();});
    this._select.addEventListener("change",()=>{this._format=this._select.value;if(!this._draftInvalid)this._sync();});
    for(const type of ["input","change"]){
      this._native.addEventListener(type,()=>{if(this._locked())return;this._color={...parseColor(this._native.value),a:this._color?.a??1};this._draftInvalid=false;this._sync();this._emit("cu-"+type);});
      this._alpha.addEventListener(type,()=>{if(this._locked())return;this._color={...(this._color??parseColor("#0067c0")),a:Number(this._alpha.value)/100};this._draftInvalid=false;this._sync();this._emit("cu-"+type);});
    }
    for(const value of palette){
      const b=this.ownerDocument.createElement("button");b.type="button";b.className="swatch";b.style.backgroundColor=value;b.dataset.color=value;b.setAttribute("aria-label",value);
      b.addEventListener("click",()=>{if(this._locked())return;this.value=value;this._emit("cu-input");this._emit("cu-change");});this._palette.append(b);
    }
    this.addEventListener("invalid",()=>{this._reveal=true;this._syncForm();});
  }
  connectedCallback(){if(!this._initialized){this._default=this.getAttribute("value")??"";if(!this._assigned)this.value=this._default;this._initialized=true;}this._sync();}
  attributeChangedCallback(name){
    if(!this._text)return;
    if(name==="value"&&this._initialized){this._default=this.getAttribute("value")??"";this.value=this._default;return;}
    if(name==="format")this._format=["hex","rgb","hsl"].includes(this.getAttribute("format"))?this.getAttribute("format"):"hex";
    this._sync();
  }
  get value(){return this._color&&!this._draftInvalid?formatColor(this._color,"hex",this.alpha):"";}
  set value(v){this._assigned=true;this._color=parseColor(v);this._draftInvalid=Boolean(String(v??"").trim()&&!this._color);this._text.value=this._draftInvalid?String(v):"";this._sync();}
  get alpha(){return this.hasAttribute("alpha");}set alpha(v){this.toggleAttribute("alpha",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  _locked(){return this.disabled||Boolean(this._formDisabled)||this.hasAttribute("readonly");}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._default??"";}
  formStateRestoreCallback(v){this.value=String(v??"");}
  focus(options){this._text.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._syncForm();return this._internals?.reportValidity()??this._valid;}
  _emit(type){notify(this,type,{value:this.value});}
  _typed(emit=true){
    if(this._locked())return;
    const raw=this._text.value.trim();this._color=parseColor(raw);this._draftInvalid=Boolean(raw&&!this._color);this._sync(false);if(emit)this._emit("cu-input");
  }
  _sync(updateText=true){
    if(!this._text)return;
    const locked=this._locked();this._group.disabled=this.disabled||Boolean(this._formDisabled);this._text.readOnly=this.hasAttribute("readonly");
    this._native.disabled=locked;this._alpha.disabled=locked;
    this._label.textContent=this.getAttribute("label")||this.getAttribute("aria-label")||"Color";
    this._text.setAttribute("aria-label",this._label.textContent+" value");this._text.setAttribute("aria-required",String(this.required));
    this._hint.textContent=this.getAttribute("hint")||"";
    this._select.value=this._format;this._opacity.hidden=!this.alpha;
    const color=this._color??parseColor("#0067c0");if(!this.alpha&&this._color)this._color={...this._color,a:1};
    if(updateText&&!this._draftInvalid)this._text.value=this._color?formatColor(this._color,this._format,this.alpha):"";
    this._sample.style.backgroundColor=this._color?formatColor(this._color,"rgb",this.alpha):"transparent";
    this._native.value=formatColor(color);this._alpha.value=String(Math.round(color.a*100));this._output.textContent=this._alpha.value+"%";
    for(const b of this._palette.children){b.disabled=locked;b.setAttribute("aria-pressed",String(Boolean(this._color&&formatColor(this._color)===b.dataset.color)));}
    this._syncForm();
  }
  _syncForm(){
    const error=this.getAttribute("error")||"",invalid=!this._locked()&&(Boolean(error)||this._draftInvalid||(this.required&&!this.value));
    this._valid=!invalid;
    const message=error||(this._draftInvalid?"Enter a valid HEX, RGB or HSL color.":"Choose a color.");
    const revealed=invalid&&(Boolean(error)||this._reveal);
    this._error.textContent=revealed?message:"";this._text.setAttribute("aria-invalid",String(Boolean(revealed)));
    const desc=[this._hint.textContent?"color-hint":"",revealed?"color-error":""].filter(Boolean).join(" ");
    if(desc)this._text.setAttribute("aria-describedby",desc);else this._text.removeAttribute("aria-describedby");
    this._internals?.setFormValue(this.disabled||this._formDisabled?null:this.value);
    if(invalid)this._internals?.setValidity(error||this._draftInvalid?{customError:true}:{valueMissing:true},message,this._text);else this._internals?.setValidity({});
  }
}
define("cu-color-picker",CuColorPicker);
