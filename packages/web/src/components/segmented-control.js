import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
export function normalizeSegmentOptions(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.value!=="string"||!item.value||seen.has(item.value))return [];
    seen.add(item.value);
    return [{value:item.value,label:String(item.label??item.value),icon:typeof item.icon==="string"?item.icon:"",disabled:Boolean(item.disabled)}];
  });
}
export function resolveSegmentValue(value,items){
  return typeof value==="string"&&items.some(item=>item.value===value&&!item.disabled)?value:"";
}
const css=[
  ":host{display:inline-block;max-width:100%;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}:host([fullwidth]){display:block;}",
  ".field{display:grid;gap:7px;min-width:0;}.label{font-weight:600;}.label:empty,.hint:empty,.error:empty{display:none;}",
  ".group{display:flex;align-items:stretch;gap:3px;padding:3px;border-radius:var(--cu-radius-lg,8px);border:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface-alt,#fafafa);overflow-x:auto;min-width:0;}",
  ".segment{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;flex:1 0 auto;min-height:calc(var(--cu-control-height,40px) - 8px);padding:0 12px;border:1px solid transparent;border-radius:var(--cu-radius-md,6px);font-weight:550;white-space:nowrap;cursor:pointer;box-sizing:border-box;}",
  ".segment:has(input:checked){background:var(--cu-surface,#fff);border-color:var(--cu-border,#e5e5e5);box-shadow:0 1px 3px rgb(0 0 0/.10);color:var(--cu-text,#242424);font-weight:650;}",
  ".segment:hover:not(:has(input:disabled)):not(:has(input:checked)){background:var(--cu-state-hover);}.segment:has(input:disabled){opacity:.5;cursor:not-allowed;}.segment:has(input:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  ".segment input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit;}",
  ":host([size=sm]) .segment{min-height:26px;padding:0 9px;font-size:12px;}:host([size=lg]) .segment{min-height:38px;padding:0 16px;font-size:14px;}",
  ":host([orientation=vertical]) .group{flex-direction:column;}:host([orientation=vertical]) .segment{justify-content:flex-start;}",
  ":host([variant=accent]) .segment:has(input:checked){background:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);border-color:transparent;}",
  ".hint,.error{font-size:12px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}.group[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}",
  "@media(forced-colors:active){.segment:has(input:checked){border:1px solid Highlight;color:Highlight;}.segment:has(input:focus-visible){outline:2px solid Highlight;}}",focusStyle
].join("");
export class CuSegmentedControl extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","name","label","hint","error","disabled","readonly","required","orientation","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._items=[];this._requested="";
    const root=mount(this,css,'<div class="field"><span class="label"></span><div class="group" role="radiogroup" part="group"></div><div class="hint" id="segment-hint"></div><div class="error" id="segment-error" role="alert"></div></div>');
    for(const [k,q] of Object.entries({label:".label",group:".group",hint:".hint",error:".error"}))this["_"+k]=root.querySelector(q);
    this._group.addEventListener("change",e=>{if(e.target.matches("input[type=radio]"))this.select(e.target.value);});
    this._group.addEventListener("keydown",e=>{
      if(this._locked()||e.isComposing)return;
      if(e.key!=="Home"&&e.key!=="End")return;
      const nodes=[...this._group.querySelectorAll("input:not(:disabled)")];const node=e.key==="Home"?nodes[0]:nodes.at(-1);
      if(node){e.preventDefault();this.select(node.value);node.focus();}
    });
    this.addEventListener("invalid",()=>{this._reveal=true;this._sync();});
  }
  connectedCallback(){
    if(!this._initialized){this._default=this.getAttribute("value")??"";if(!this._assigned)this._requested=this._default;this._initialized=true;}
    this._render();
  }
  attributeChangedCallback(name){if(!this._group)return;if(name==="value"){this._default=this.getAttribute("value")??"";this._requested=this._default;}this._sync();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeSegmentOptions(v);this._render();}
  get value(){return resolveSegmentValue(this._requested,this._items);}
  set value(v){this._assigned=true;this._requested=String(v??"");this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  _locked(){return this.disabled||this.readonly||Boolean(this._formDisabled);}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._default??"";}
  formStateRestoreCallback(v){this.value=String(v??"");}
  focus(options){(this._group.querySelector("input:checked:not(:disabled)")||this._group.querySelector("input:not(:disabled)"))?.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._sync();return this._internals?.reportValidity()??this._valid;}
  select(value){
    const next=resolveSegmentValue(value,this._items);
    if(this._locked()||!next||next===this.value){this._sync();return false;}
    this._requested=next;this._sync();
    const item=this._items.find(x=>x.value===next);const detail={value:next,label:item.label};
    notify(this,"cu-input",detail);notify(this,"cu-change",detail);return true;
  }
  _render(){
    if(!this._group)return;
    const focused=this.shadowRoot.activeElement?.value,doc=this.ownerDocument;
    this._group.replaceChildren(...this._items.map(item=>{
      const label=doc.createElement("label");label.className="segment";
      const input=doc.createElement("input");input.type="radio";input.name="segment";input.value=item.value;label.append(input);
      if(item.icon){const icon=doc.createElement("cu-icon");icon.setAttribute("name",item.icon);icon.setAttribute("size","16");icon.setAttribute("aria-hidden","true");label.append(icon);}
      const copy=doc.createElement("span");copy.textContent=item.label;label.append(copy);return label;
    }));
    this._sync();if(focused){const target=[...this._group.querySelectorAll("input:not(:disabled)")].find(x=>x.value===focused);if(target)target.focus({preventScroll:true});else this.focus({preventScroll:true});}
  }
  _sync(){
    if(!this._group)return;
    const value=this.value,locked=this._locked(),error=this.getAttribute("error")||"";
    this._label.textContent=this.getAttribute("label")||"";
    this._hint.textContent=this.getAttribute("hint")||"";
    this._group.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Options");
    this._group.setAttribute("aria-required",String(this.required));this._group.setAttribute("aria-disabled",String(locked));this._group.setAttribute("aria-orientation",this.getAttribute("orientation")==="vertical"?"vertical":"horizontal");
    const nodes=[...this._group.querySelectorAll("input")];
    nodes.forEach((node,i)=>{node.checked=node.value===value;node.disabled=locked||this._items[i].disabled;});
    const invalid=!locked&&(Boolean(error)||(this.required&&!value)),message=error||"Choose an option.";
    this._valid=!invalid;const revealed=invalid&&(Boolean(error)||this._reveal);
    this._error.textContent=revealed?message:"";this._group.dataset.invalid=String(Boolean(revealed));this._group.setAttribute("aria-invalid",String(Boolean(revealed)));
    const desc=[this._hint.textContent?"segment-hint":"",revealed?"segment-error":""].filter(Boolean).join(" ");if(desc)this._group.setAttribute("aria-describedby",desc);else this._group.removeAttribute("aria-describedby");
    this._internals?.setFormValue(this.disabled||this._formDisabled||!value?null:value);
    if(invalid){const flags=error?{customError:true}:{valueMissing:true},anchor=nodes.find(x=>!x.disabled);if(anchor)this._internals?.setValidity(flags,message,anchor);else this._internals?.setValidity(flags,message);}
    else this._internals?.setValidity({});
  }
}
define("cu-segmented-control",CuSegmentedControl);
