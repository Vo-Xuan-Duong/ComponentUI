import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { syncFieldValidity, wireFieldValidation } from "./_field.js";
import "./icon.js";

export function stepNumber(value,direction=1,step=1,min=null,max=null){
  const size=Number(step)>0&&Number.isFinite(Number(step))?Number(step):1;
  const low=min===null||min===""?null:Number(min);
  const high=max===null||max===""?null:Number(max);
  const lower=Number.isFinite(low)?low:null,upper=Number.isFinite(high)?high:null;
  const current=value===""||value===null||!Number.isFinite(Number(value))
    ? (direction>0&&lower!==null?lower-size:direction<0&&upper!==null?upper+size:0)
    : Number(value);
  const precision=Math.min(10,Math.max(...[size,current,lower,upper].filter(x=>x!==null)
    .map(x=>(String(x).split(".")[1]||"").length),0));
  let next=Number((current+(direction>0?1:-1)*size).toFixed(precision));
  if(lower!==null)next=Math.max(lower,next);
  if(upper!==null)next=Math.min(upper,next);
  return String(next);
}

const css=[
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".field{display:grid;gap:7px;}",
  ".label{font-size:13px;font-weight:600;}",
  ".label:empty,.hint:empty,.error:empty{display:none!important;}",
  ".control{display:flex;min-width:0;min-height:var(--cu-control-height,40px);align-items:stretch;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);",
  "transition:border-color var(--cu-motion-fast,100ms),background var(--cu-motion-fast,100ms);}",
  ".control:hover:not([data-disabled=true]){background:var(--cu-surface-alt,#fafafa);border-color:var(--cu-accent,#0067c0);}",
  ".control:focus-within{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);}",
  ".control[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}",
  "input{min-width:0;width:100%;flex:1;background:transparent;border:0;padding:0 12px;",
  "color:inherit;outline:0;font:400 14px var(--cu-font-body,system-ui);}",
  "input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}",
  "input[type=number]{appearance:textfield;-moz-appearance:textfield;}",
  "input:focus-visible{outline:none;}",
  ".steppers{display:flex;border-inline-start:1px solid var(--cu-border,#e5e5e5);}",
  ".steppers button{display:grid;place-items:center;min-width:32px;padding:0 7px;",
  "color:var(--cu-text-muted,#616161);background:transparent;border:0;font:inherit;cursor:pointer;}",
  ".steppers button+button{border-inline-start:1px solid var(--cu-border,#e5e5e5);}",
  ".steppers button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,transparent);",
  "color:var(--cu-text,#242424);}",
  ".steppers button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-3px;}",
  ".steppers button:disabled{opacity:.35;cursor:not-allowed;}",
  ".control[data-disabled=true]{opacity:.5;}",
  ".hint,.error{font-size:12px;line-height:1.4;}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  "@media(prefers-reduced-motion:reduce){.control{transition:none;}}",
  "@media(forced-colors:active){.control{border-color:CanvasText;}}",
  focusStyle
].join("");

export class CuNumberField extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){
    return ["name","label","hint","error","value","min","max","step",
      "placeholder","disabled","readonly","required","aria-label"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="field"><label class="label" part="label"></label>' +
      '<div class="control" part="control"><input part="input" type="number">' +
      '<div class="steppers"><button type="button" class="decrease" aria-label="Decrease">' +
      '<cu-icon name="minus" size="16"></cu-icon></button>' +
      '<button type="button" class="increase" aria-label="Increase">' +
      '<cu-icon name="plus" size="16"></cu-icon></button></div></div>' +
      '<span class="hint" part="hint"></span><span class="error" part="error"></span></div>');
    this._input=root.querySelector("input");
    this._input.id="cu-number-field-"+(++CuNumberField._id);
    this._wrapper=root.querySelector(".control");
    this._minus=root.querySelector(".decrease");
    this._plus=root.querySelector(".increase");
    this._label=root.querySelector(".label");
    this._hint=root.querySelector(".hint");
    this._error=root.querySelector(".error");
    this._initialized=false;
    this._input.addEventListener("input",()=>this._announce("cu-input"));
    this._input.addEventListener("change",()=>this._announce("cu-change"));
    this._minus.addEventListener("click",()=>this._step(-1));
    this._plus.addEventListener("click",()=>this._step(1));
    wireFieldValidation(this,this._input,()=>this._update());
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this._initialized=true;
      if(!this._valueAssigned)this._input.value=this._defaultValue;
    }
    this._sync();
  }
  attributeChangedCallback(name){
    if(!this._input)return;
    if(name==="value"&&this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this.value=this._defaultValue;
    }else this._sync();
  }
  formDisabledCallback(value){this._formDisabled=value;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.value=this._defaultValue??"";}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._input.value;}
  set value(value){this._valueAssigned=true;this._input.value=String(value??"");this._update();}
  get valueAsNumber(){return this._input.valueAsNumber;}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._input.checkValidity();}
  reportValidity(){return this._internals?.reportValidity()??this._input.reportValidity();}
  _step(direction){
    if(this._input.disabled||this._input.readOnly)return;
    const previous=this.value;
    // Use browser-native stepping for correct step base and constraint behavior.
    try{
      this._input.stepUp(direction>0?1:-1);
    }catch{
      this._input.value=stepNumber(this.value,direction,
        this.getAttribute("step")==="any"?1:this.getAttribute("step")??1,
        this.getAttribute("min"),this.getAttribute("max"));
    }
    if(this.value!==previous){this._announce("cu-input");this._announce("cu-change");}
    this._input.focus();
  }
  _announce(type){this._update();notify(this,type,{value:this.value,valueAsNumber:this.valueAsNumber});}
  _sync(){
    if(!this._input)return;
    const input=this._input;
    for(const name of ["min","max","step"]){
      if(this.hasAttribute(name))input.setAttribute(name,this.getAttribute(name));
      else input.removeAttribute(name);
    }
    input.placeholder=this.getAttribute("placeholder")??"";
    input.required=this.hasAttribute("required");
    input.disabled=this.disabled||Boolean(this._formDisabled);
    input.readOnly=this.hasAttribute("readonly");
    this._label.textContent=this.getAttribute("label")??"";
    this._label.htmlFor=this._input.id;
    this._hint.textContent=this.getAttribute("hint")??"";
    this._error.textContent=this.getAttribute("error")??"";
    input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Number");
    this._wrapper.dataset.disabled=String(input.disabled);
    this._minus.disabled=this._plus.disabled=input.disabled||input.readOnly;
    this._minus.setAttribute("aria-label","Decrease "+(this._label.textContent||"value"));
    this._plus.setAttribute("aria-label","Increase "+(this._label.textContent||"value"));
    this._update();
  }
  _update(){
    if(!this._input)return;
    syncFieldValidity(this,this._input,{wrapper:this._wrapper});
    const value=this.valueAsNumber;
    const min=this.getAttribute("min"),max=this.getAttribute("max");
    this._minus.disabled=this._input.disabled||this._input.readOnly||
      (min!==null&&Number.isFinite(value)&&value<=Number(min));
    this._plus.disabled=this._input.disabled||this._input.readOnly||
      (max!==null&&Number.isFinite(value)&&value>=Number(max));
  }
}
CuNumberField._id=0;
define("cu-number-field",CuNumberField);
