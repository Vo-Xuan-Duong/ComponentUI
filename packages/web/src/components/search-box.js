import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";

const css=[
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".field{display:grid;gap:7px;min-width:0;}",
  ".label{font-size:13px;font-weight:600;}",
  ".label:empty,.hint:empty{display:none!important;}",
  ".control{display:flex;align-items:center;gap:8px;box-sizing:border-box;",
  "height:var(--cu-control-height,40px);padding:0 8px 0 12px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);",
  "transition:background var(--cu-motion-fast,100ms),border-color var(--cu-motion-fast,100ms);}",
  ".control:hover:not([data-disabled=true]){background:var(--cu-surface-alt,#fafafa);}",
  ".control:focus-within{border-bottom-color:var(--cu-accent,#0067c0);",
  "outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".control[data-disabled=true]{opacity:.5;}",
  ".symbol{flex:none;color:var(--cu-text-muted,#616161);}",
  "input{flex:1;min-width:0;width:100%;border:0;background:transparent;color:inherit;",
  "font:400 14px var(--cu-font-body,system-ui);outline:none;padding:0;}",
  "input::-webkit-search-cancel-button{-webkit-appearance:none;}",
  "input::placeholder{color:var(--cu-text-muted,#616161);}",
  "input:focus-visible{outline:none;}",
  ".clear{display:grid;place-items:center;border:0;background:transparent;",
  "width:28px;height:28px;border-radius:var(--cu-radius-md,6px);",
  "color:var(--cu-text-muted,#616161);cursor:pointer;}",
  ".clear:hover{background:color-mix(in srgb,var(--cu-text,#242424) 8%,transparent);}",
  ".clear:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  ".clear[hidden]{display:none!important;}",
  ".hint{font-size:12px;color:var(--cu-text-muted,#616161);}",
  "@media(prefers-reduced-motion:reduce){.control{transition:none;}}",
  "@media(forced-colors:active){.control{border-color:CanvasText;}}",
  focusStyle
].join("");

export class CuSearchBox extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){
    return ["label","hint","name","value","placeholder","disabled","readonly",
      "required","aria-label","autocomplete"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="field"><label class="label" part="label"></label>' +
      '<div class="control" part="control"><cu-icon class="symbol" name="search" size="18"></cu-icon>' +
      '<input type="search" part="input" enterkeyhint="search">' +
      '<button class="clear" part="clear" type="button" aria-label="Clear search" hidden>' +
      '<cu-icon name="x" size="16"></cu-icon></button></div>' +
      '<span class="hint" part="hint"></span></div>');
    this._input=root.querySelector("input");
    this._input.id="cu-search-box-"+(++CuSearchBox._id);
    this._wrapper=root.querySelector(".control");
    this._clear=root.querySelector(".clear");
    this._label=root.querySelector(".label");
    this._hint=root.querySelector(".hint");
    this._initialized=false;
    this._input.addEventListener("input",()=>{
      this._update();notify(this,"cu-input",{value:this.value});
    });
    this._input.addEventListener("change",()=>{
      this._update();notify(this,"cu-change",{value:this.value});
    });
    this._input.addEventListener("keydown",event=>{
      if(event.key==="Enter")notify(this,"cu-search",{value:this.value});
      if(event.key==="Escape"&&this.value){event.preventDefault();this.clear();}
    });
    this._clear.addEventListener("click",()=>{this.clear();this._input.focus();});
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this._input.value=this._defaultValue;
      this._initialized=true;
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
  formResetCallback(){this.value=this._defaultValue??"";}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._input.value;}
  set value(value){this._input.value=String(value??"");this._update();}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  focus(options){this._input.focus(options);}
  clear(){
    if(this._input.disabled||this._input.readOnly||!this.value)return;
    this.value="";
    notify(this,"cu-input",{value:""});
    notify(this,"cu-change",{value:""});
    notify(this,"cu-search",{value:""});
  }
  checkValidity(){return this._internals?.checkValidity()??this._input.checkValidity();}
  reportValidity(){return this._internals?.reportValidity()??this._input.reportValidity();}
  _sync(){
    if(!this._input)return;
    this._input.disabled=this.disabled||Boolean(this._formDisabled);
    this._input.readOnly=this.hasAttribute("readonly");
    this._input.required=this.hasAttribute("required");
    this._input.placeholder=this.getAttribute("placeholder")??"Search…";
    this._input.autocomplete=this.getAttribute("autocomplete")??"off";
    this._label.textContent=this.getAttribute("label")??"";
    this._label.htmlFor=this._input.id;
    this._hint.textContent=this.getAttribute("hint")??"";
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||
      this._label.textContent||"Search");
    this._wrapper.dataset.disabled=String(this._input.disabled);
    this._update();
  }
  _update(){
    if(!this._input)return;
    this._clear.hidden=!this.value||this._input.disabled||this._input.readOnly;
    this._internals?.setFormValue(this._input.disabled?null:this.value);
    if(this._internals){
      if(!this._input.checkValidity())
        this._internals.setValidity(this._input.validity,this._input.validationMessage,this._input);
      else this._internals.setValidity({});
    }
  }
}
CuSearchBox._id=0;
define("cu-search-box",CuSearchBox);
