import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { syncFieldValidity, wireFieldValidation } from "./_field.js";
import "./icon.js";

const css=[
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".field{display:grid;gap:7px;min-width:0;}",
  ".label{font-size:13px;font-weight:650;}",
  ".label:empty,.hint:empty,.error:empty{display:none!important;}",
  ".control{display:flex;align-items:center;min-width:0;min-height:var(--cu-control-height,40px);",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);",
  "transition:background var(--cu-motion-fast,100ms),border-color var(--cu-motion-fast,100ms);}",
  ".control:hover:not([data-disabled=true]){background:var(--cu-surface-alt,#fafafa);border-color:var(--cu-accent,#0067c0);}",
  ".control:focus-within{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);}",
  ".control[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}",
  ".control[data-disabled=true]{opacity:.52;}",
  "input{flex:1;min-width:0;width:100%;height:100%;min-height:calc(var(--cu-control-height,40px) - 2px);",
  "padding:0 12px;background:transparent;border:0;outline:0;color:inherit;",
  "font:400 14px var(--cu-font-body,system-ui);}",
  "input::placeholder{color:var(--cu-text-muted,#616161);}",
  "input:focus-visible{outline:0;}",
  ".toggle{display:grid;place-items:center;flex:none;width:32px;height:30px;margin-inline-end:4px;",
  "padding:0;border:0;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:var(--cu-text-muted,#616161);cursor:pointer;}",
  ".toggle:hover:not(:disabled){background:color-mix(in srgb,var(--cu-text,#242424) 8%,transparent);",
  "color:var(--cu-text,#242424);}",
  ".toggle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  ".toggle:disabled{opacity:.5;cursor:not-allowed;}",
  ".hint,.error{font:400 12px/1.45 var(--cu-font-body,system-ui);}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  "@media(prefers-reduced-motion:reduce){.control{transition:none;}}",
  "@media(forced-colors:active){.control{border-color:CanvasText;}}",
  focusStyle
].join("");

let uid=0;
export class CuPasswordField extends BrowserElement {
  static formAssociated=true;
  static get observedAttributes(){
    return ["name","label","hint","error","placeholder","required","disabled","readonly",
      "minlength","maxlength","pattern","autocomplete","aria-label"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="field"><label class="label" part="label"></label><div class="control" part="control">' +
      '<input type="password" part="input" spellcheck="false" autocapitalize="off" autocomplete="current-password">' +
      '<button type="button" class="toggle" part="toggle" aria-label="Show password" aria-pressed="false">' +
      '<cu-icon name="eye" size="18"></cu-icon></button></div>' +
      '<span class="hint" part="hint"></span><span class="error" part="error"></span></div>');
    this._input=root.querySelector("input");
    this._label=root.querySelector(".label");
    this._hint=root.querySelector(".hint");
    this._error=root.querySelector(".error");
    this._control=root.querySelector(".control");
    this._toggle=root.querySelector(".toggle");
    this._icon=this._toggle.querySelector("cu-icon");
    this._visible=false;
    const id="cu-password-"+ ++uid;
    this._input.id=id;
    this._label.htmlFor=id;
    this._hint.id=id+"-hint";
    this._error.id=id+"-error";
    this._input.addEventListener("input",()=>{
      this._update();
      notify(this,"cu-input",{value:this.value});
    });
    this._input.addEventListener("change",()=>{
      this._update();
      notify(this,"cu-change",{value:this.value});
    });
    this._toggle.addEventListener("click",()=>this.toggleVisibility());
    wireFieldValidation(this,this._input,()=>this._update());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  formDisabledCallback(disabled){this._formDisabled=disabled;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.value="";this._setVisible(false);}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._input.value;}
  set value(next){this._input.value=String(next??"");this._update();}
  get visible(){return this._visible;}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._input.checkValidity();}
  reportValidity(){return this._internals?.reportValidity()??this._input.reportValidity();}
  toggleVisibility(){
    if(this._input.disabled)return;
    this._setVisible(!this._visible);
    notify(this,"cu-visibility-change",{visible:this._visible});
  }
  _setVisible(value){
    this._visible=Boolean(value);
    this._input.type=this._visible?"text":"password";
    this._toggle.setAttribute("aria-pressed",String(this._visible));
    this._toggle.setAttribute("aria-label",this._visible?"Hide password":"Show password");
    this._icon.setAttribute("name",this._visible?"eye-off":"eye");
  }
  _sync(){
    if(!this._input)return;
    const input=this._input;
    input.disabled=this.disabled||Boolean(this._formDisabled);
    input.readOnly=this.hasAttribute("readonly");
    input.required=this.required;
    input.placeholder=this.getAttribute("placeholder")??"";
    input.autocomplete=this.getAttribute("autocomplete")||"current-password";
    for(const attr of ["minlength","maxlength","pattern"]){
      if(this.hasAttribute(attr))input.setAttribute(attr,this.getAttribute(attr));
      else input.removeAttribute(attr);
    }
    this._label.textContent=this.getAttribute("label")??"";
    this._hint.textContent=this.getAttribute("hint")??"";
    this._error.textContent=this.getAttribute("error")??"";
    const label=this.getAttribute("aria-label");
    if(label)input.setAttribute("aria-label",label);
    else input.removeAttribute("aria-label");
    const descriptions=[];
    if(this._hint.textContent)descriptions.push(this._hint.id);
    if(this._error.textContent)descriptions.push(this._error.id);
    if(descriptions.length)input.setAttribute("aria-describedby",descriptions.join(" "));
    else input.removeAttribute("aria-describedby");
    this._toggle.disabled=input.disabled;
    if(input.disabled&&this._visible)this._setVisible(false);
    this._control.dataset.disabled=String(input.disabled);
    this._update();
  }
  _update(){
    if(!this._input)return;
    syncFieldValidity(this,this._input,{wrapper:this._control});
  }
}
define("cu-password-field",CuPasswordField);
