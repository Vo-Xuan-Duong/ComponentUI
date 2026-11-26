import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { syncFieldValidity, wireFieldValidation } from "./_field.js";

const css = [
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".field{display:grid;gap:7px;min-width:0;}",
  "label{font-size:13px;font-weight:600;}",
  "label:empty,.hint:empty,.error:empty{display:none!important;}",
  "textarea{box-sizing:border-box;width:100%;min-width:0;min-height:88px;resize:vertical;",
  "padding:10px 12px;background:var(--cu-surface,#fff);color:var(--cu-text,#242424);",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);font:400 14px/1.55 var(--cu-font-body,system-ui);",
  "transition:border-color var(--cu-motion-fast,100ms),background var(--cu-motion-fast,100ms);}",
  "textarea:hover:not(:disabled):not(:read-only){background:var(--cu-surface-alt,#fafafa);}",
  "textarea::placeholder{color:var(--cu-text-muted,#616161);}",
  "textarea:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);}",
  "textarea:disabled{opacity:.5;cursor:not-allowed;}",
  "textarea[aria-invalid=true]{border-bottom-color:var(--cu-danger,#c42b1c);}",
  ".meta{display:flex;justify-content:space-between;gap:12px;align-items:start;",
  "font:400 12px/1.45 var(--cu-font-body,system-ui);}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  ".counter{margin-inline-start:auto;color:var(--cu-text-muted,#616161);white-space:nowrap;}",
  ".counter[hidden]{display:none!important;}",
  "@media(prefers-reduced-motion:reduce){textarea{transition:none;}}",
  "@media(forced-colors:active){textarea{border-color:CanvasText;}}",
  focusStyle
].join("");

export class CuTextArea extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes(){
    return ["label","hint","error","name","value","placeholder","disabled","readonly",
      "required","minlength","maxlength","rows","aria-label","show-count","auto-resize"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="field"><label part="label"></label><textarea part="control"></textarea>' +
      '<div class="meta"><span class="hint" part="hint"></span><span class="error" part="error"></span>' +
      '<output class="counter" part="counter" hidden></output></div></div>');
    this._control=root.querySelector("textarea");
    this._label=root.querySelector("label");
    this._hint=root.querySelector(".hint");
    this._error=root.querySelector(".error");
    this._counter=root.querySelector(".counter");
    this._initialized=false;
    this._control.addEventListener("input",()=>{
      this._update();
      notify(this,"cu-input",{value:this.value});
    });
    this._control.addEventListener("change",()=>{
      this._update();
      notify(this,"cu-change",{value:this.value});
    });
    wireFieldValidation(this,this._control,()=>this._update());
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      if(!this._valueAssigned)this._control.value=this._defaultValue;
      this._initialized=true;
    }
    this._sync();
  }
  attributeChangedCallback(name){
    if(!this._control)return;
    if(name==="value"&&this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this.value=this._defaultValue;
    }else this._sync();
  }
  formDisabledCallback(value){this._formDisabled=value;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.value=this._defaultValue??"";}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._control.value;}
  set value(value){this._valueAssigned=true;this._control.value=String(value??"");this._update();}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  focus(options){this._control.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._control.checkValidity();}
  reportValidity(){return this._internals?.reportValidity()??this._control.reportValidity();}
  _sync(){
    if(!this._control)return;
    const input=this._control;
    input.disabled=this.disabled||Boolean(this._formDisabled);
    input.readOnly=this.hasAttribute("readonly");
    input.required=this.required;
    input.placeholder=this.getAttribute("placeholder")??"";
    const rows=Number(this.getAttribute("rows"));
    input.rows=Number.isInteger(rows)&&rows>=2&&rows<=30?rows:4;
    for(const attribute of ["minlength","maxlength"]){
      if(this.hasAttribute(attribute))input.setAttribute(attribute,this.getAttribute(attribute));
      else input.removeAttribute(attribute);
    }
    this._label.textContent=this.getAttribute("label")??"";
    this._hint.textContent=this.getAttribute("hint")??"";
    this._error.textContent=this.getAttribute("error")??"";
    input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Text area");
    this._label.id=this._label.id||"cu-textarea-label-"+(++CuTextArea._labelId);
    this._control.id=this._control.id||this._label.id+"-input";
    this._label.htmlFor=this._control.id;
    input.setAttribute("aria-labelledby",this._label.id);
    if(!this._label.textContent||this.getAttribute("aria-label"))input.removeAttribute("aria-labelledby");
    this._update();
  }
  _update(){
    if(!this._control)return;
    const value=this.value,max=Number(this.getAttribute("maxlength"));
    const hasMax=this.hasAttribute("maxlength")&&Number.isInteger(max)&&max>=0;
    this._counter.hidden=!this.hasAttribute("show-count")&&!hasMax;
    this._counter.textContent=hasMax?`${value.length} / ${max}`:`${value.length} characters`;
    if(this.hasAttribute("auto-resize")){
      this._control.style.height="auto";
      this._control.style.height=Math.max(this._control.scrollHeight,88)+"px";
    }else this._control.style.removeProperty("height");
    syncFieldValidity(this,this._control);
  }
}
CuTextArea._labelId=0;
define("cu-textarea",CuTextArea);
