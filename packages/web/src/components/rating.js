import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";

export function normalizeRating(value,max=5){
  const m=max==null||max===""?5:Number(max);
  const count=Number.isFinite(m)?Math.max(1,Math.min(10,Math.trunc(m))):5;
  const n=Number(value);
  return {max:count,value:Number.isFinite(n)?Math.max(0,Math.min(count,Math.round(n))):0};
}
const css=[
  ":host{display:block;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  "fieldset{border:0;margin:0;padding:0;min-inline-size:0;}legend{font-weight:600;margin-bottom:6px;padding:0;}",
  ".stars{display:flex;flex-wrap:wrap;gap:3px;align-items:center;}",
  "label{position:relative;display:grid;place-items:center;width:var(--cu-control-height,40px);height:var(--cu-control-height,40px);border-radius:var(--cu-radius-md,6px);cursor:pointer;}",
  "label input{position:absolute;inset:0;opacity:0;width:100%;height:100%;margin:0;cursor:inherit;}",
  "label cu-icon{pointer-events:none;color:var(--cu-text-muted,#616161);}",
  "label[data-filled=true] cu-icon{color:var(--cu-accent,#0067c0);}label[data-filled=true] cu-icon::part(svg){fill:currentColor;}",
  "label:hover:not([data-disabled=true]){background:var(--cu-state-hover);}",
  "label:has(input:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "label[data-disabled=true]{opacity:.55;cursor:default;}",
  ".footer{display:flex;align-items:center;gap:8px;margin-top:5px;}.summary,.hint,.error{font-size:12px;color:var(--cu-text-muted,#616161);}",
  ".clear{border:0;background:transparent;color:var(--cu-accent,#0067c0);font:inherit;padding:5px;cursor:pointer;}",
  ".clear[hidden],.hint:empty,.error:empty{display:none!important;}.error{color:var(--cu-danger,#c42b1c);}",
  "@media(forced-colors:active){label[data-filled=true] cu-icon{color:Highlight;}label:has(input:focus-visible){outline-color:Highlight;}}",
  focusStyle
].join("");
export class CuRating extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","max","label","hint","name","required","disabled","readonly","aria-label"];}
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;this._value=0;
    const root=mount(this,css,
      '<fieldset><legend part="label"></legend><div class="stars" part="stars"></div>'+
      '<div class="footer"><span class="summary" id="rating-summary" part="summary"></span>'+
      '<button class="clear" type="button">Clear</button></div>'+
      '<div class="hint" id="rating-hint" part="hint"></div>'+
      '<div class="error" id="rating-error" role="alert" part="error"></div></fieldset>');
    this._group=root.querySelector("fieldset");this._legend=root.querySelector("legend");
    this._stars=root.querySelector(".stars");this._summary=root.querySelector(".summary");
    this._clear=root.querySelector(".clear");this._hint=root.querySelector(".hint");this._error=root.querySelector(".error");
    this._clear.addEventListener("click",()=>{this._commit(0);this.focus();});
    this.addEventListener("invalid",()=>{this._reveal=true;this._sync();});
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??0;
      if(!this._assigned)this.value=this._defaultValue;
      this._initialized=true;
    }
    this._sync();
  }
  attributeChangedCallback(name){
    if(!this._stars)return;
    if(name==="value"&&this._initialized){this._defaultValue=this.getAttribute("value")??0;this.value=this._defaultValue;return;}
    this._value=normalizeRating(this._value,this.max).value;this._sync();
  }
  get max(){return normalizeRating(0,this.getAttribute("max")).max;}
  set max(value){this.setAttribute("max",String(value));}
  get value(){return this._value;}
  set value(value){this._assigned=true;this._value=normalizeRating(value,this.max).value;this._sync();}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  _disabled(){return this.disabled||Boolean(this._formDisabled);}
  _readonly(){return this.hasAttribute("readonly");}
  formDisabledCallback(value){this._formDisabled=value;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._defaultValue??0;}
  formStateRestoreCallback(value){this.value=Number(value??0);}
  focus(options){(this._stars.querySelector("input:checked:not(:disabled)")??this._stars.querySelector("input:not(:disabled)"))?.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._sync();return this._internals?.reportValidity()??this._valid;}
  _commit(value){
    if(this._disabled()||this._readonly()||this.value===value)return;
    this.value=value;notify(this,"cu-input",{value:this.value});notify(this,"cu-change",{value:this.value});
  }
  _sync(){
    if(!this._stars)return;
    const locked=this._disabled()||this._readonly();
    this._legend.textContent=this.getAttribute("label")||this.getAttribute("aria-label")||"Rating";
    this._group.setAttribute("aria-label",this.getAttribute("aria-label")||this._legend.textContent);
    this._hint.textContent=this.getAttribute("hint")||"";
    if(this._stars.children.length!==this.max){
      const nodes=[];
      for(let i=1;i<=this.max;i++){
        const label=this.ownerDocument.createElement("label");
        const input=this.ownerDocument.createElement("input");input.type="radio";input.name="rating";input.value=String(i);
        const star=this.ownerDocument.createElement("cu-icon");star.setAttribute("name","star");star.setAttribute("size","24");
        input.addEventListener("change",()=>{if(input.checked)this._commit(i);});
        label.append(input,star);nodes.push(label);
      }
      this._stars.replaceChildren(...nodes);
    }
    this._valid=locked||!this.required||this.value>0;
    this._error.textContent=this._reveal&&!this._valid?"Choose a rating.":"";
    const descriptions=["rating-summary",this._hint.textContent?"rating-hint":"",this._error.textContent?"rating-error":""].filter(Boolean).join(" ");
    for(const [i,label] of [...this._stars.children].entries()){
      const input=label.querySelector("input");const n=i+1;
      input.checked=n===this.value;input.disabled=locked;
      input.setAttribute("aria-label",n+" of "+this.max+" stars");
      input.setAttribute("aria-describedby",descriptions);input.setAttribute("aria-invalid",String(this._reveal&&!this._valid));
      label.dataset.filled=String(n<=this.value);label.dataset.disabled=String(locked);
    }
    this._summary.textContent=this.value+" / "+this.max;
    this._clear.hidden=locked||this.required||this.value===0;
    this._internals?.setFormValue(this._disabled()||this.value===0?null:String(this.value));
    if(this._valid)this._internals?.setValidity({});
    else this._internals?.setValidity({valueMissing:true},"Choose a rating.",this._stars.querySelector("input"));
  }
}
define("cu-rating",CuRating);
