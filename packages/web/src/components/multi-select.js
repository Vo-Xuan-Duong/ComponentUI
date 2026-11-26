import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {placeAnchoredOverlay,watchOverlayViewport,registerOverlay,unregisterOverlay,isTopOverlay} from "./_overlay.js";
import "./icon.js";

export function normalizeMultiOptions(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.value!=="string"||!item.value||seen.has(item.value))return [];
    seen.add(item.value);
    return [{value:item.value,label:String(item.label??item.value),disabled:Boolean(item.disabled)}];
  });
}
export function normalizeMultiValue(value,items,max=Infinity){
  const allowed=new Set(items.filter(item=>!item.disabled).map(item=>item.value));
  const limit=Number.isFinite(max)?Math.max(0,Math.floor(max)):Infinity;
  return [...new Set(Array.isArray(value)?value:[])].filter(v=>allowed.has(v)).slice(0,limit);
}
const css=[
  ":host{display:block;position:relative;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([open]){z-index:80;}.field{display:grid;gap:7px;}.label{font-weight:600;}.anchor{position:relative;min-width:0;}",
  ".control{box-sizing:border-box;display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-height:var(--cu-control-height,40px);padding:5px 8px;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);}",
  ".control:hover:not([data-disabled=true]),.control:focus-within{border-color:var(--cu-accent,#0067c0);}",
  ".control[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.control[data-disabled=true]{opacity:.55;}",
  ".chips{display:contents;}.chip{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:3px 5px 3px 9px;border-radius:var(--cu-radius-pill,999px);background:var(--cu-state-selected);}",
  ".chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.chip button,.toggle{display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:inherit;padding:3px;cursor:pointer;flex:none;}",
  ".chip button:hover:not(:disabled),.toggle:hover:not(:disabled){background:var(--cu-state-pressed);}.chip button:disabled,.toggle:disabled{cursor:default;}",
  "input{flex:1;min-width:70px;width:80px;height:28px;border:0;background:transparent;color:inherit;font:inherit;padding:0 3px;outline:none;}input::placeholder{color:var(--cu-text-muted,#616161);}",
  "input:focus-visible{outline:none;}.control:has(input:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".popup{position:absolute;top:calc(100% + 5px);left:0;z-index:1;box-sizing:border-box;width:100%;max-height:250px;overflow:auto;overscroll-behavior:contain;padding:5px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  ".popup[hidden]{display:none!important;}.option{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px;border-radius:var(--cu-radius-md,6px);cursor:pointer;}",
  ".option[aria-selected=true]{background:var(--cu-state-selected);font-weight:600;}.option:hover:not([aria-disabled=true]),.option[data-active=true]:not([aria-disabled=true]){background:var(--cu-state-pressed);}",
  ".option[aria-disabled=true]{opacity:.45;cursor:not-allowed;}.empty,.hint,.error{font-size:12px;color:var(--cu-text-muted,#616161);}.empty{padding:10px;}.error{color:var(--cu-danger,#c42b1c);}.hint:empty,.error:empty{display:none;}",
  "slot{display:none!important;}@media(forced-colors:active){.option[data-active=true]{outline:2px solid Highlight;}.option[aria-selected=true]{border:1px solid Highlight;}}",
  focusStyle
].join("");

export class CuMultiSelect extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["label","hint","error","name","value","placeholder","disabled","readonly","required","max-selected","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._items=[];this._value=[];this._active=-1;
    const root=mount(this,css,'<div class="field"><label class="label" for="multi-input"></label><div class="anchor"><div class="control" part="control"><div class="chips"></div><input id="multi-input" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="multi-options"><button class="toggle" type="button" tabindex="-1" aria-label="Toggle options"><cu-icon name="chevron-down" size="16"></cu-icon></button></div><div class="popup" id="multi-options" role="listbox" aria-multiselectable="true" hidden></div></div><div class="hint" id="multi-hint"></div><div class="error" id="multi-error" role="alert"></div></div><slot></slot>');
    for(const [k,q] of Object.entries({label:".label",anchor:".anchor",control:".control",chips:".chips",input:"input",toggle:".toggle",popup:".popup",hint:".hint",error:".error"}))this["_"+k]=root.querySelector(q);
    this._input.addEventListener("input",()=>{if(!this._open)this.show();else{this._active=-1;this._renderOptions();}});
    this._input.addEventListener("keydown",e=>this._key(e));
    this._input.addEventListener("click",()=>this.show());
    this._toggle.addEventListener("click",()=>{if(this._open)this.hide();else this.show();this.focus();});
    root.addEventListener("focusout",e=>{if(!e.relatedTarget||!root.contains(e.relatedTarget))this.hide();});
    this._outside=e=>{if(!e.composedPath().includes(this))this.hide();};
    this.addEventListener("invalid",()=>{this._reveal=true;this._syncForm();});
  }
  connectedCallback(){
    this._loadOptions();
    if(!this._initialized){
      this._defaultValue=this._readDefault();
      if(!this._assigned)this._value=normalizeMultiValue(this._defaultValue,this._items,this._max());
      this._initialized=true;
    }
    this._sync();
    this._observer=new MutationObserver(()=>{this._loadOptions();this._sync();});
    this._observer.observe(this,{childList:true,subtree:true,attributes:true,characterData:true});
    this._doc=this.ownerDocument;this._doc.addEventListener("pointerdown",this._outside);
    this._stopViewport=watchOverlayViewport(this,()=>this._place());
  }
  disconnectedCallback(){this.hide();this._observer?.disconnect();this._doc?.removeEventListener("pointerdown",this._outside);this._stopViewport?.();}
  attributeChangedCallback(name){
    if(!this._input)return;
    if(name==="value"&&this._initialized){this._defaultValue=this._readDefault();this.value=this._defaultValue;return;}
    this._sync();
  }
  _readDefault(){
    const raw=this.getAttribute("value");
    if(raw!==null){try{const v=JSON.parse(raw);return Array.isArray(v)?v:[];}catch{return [];}}
    return [...this.querySelectorAll("option[selected]")].map(n=>n.value);
  }
  _loadOptions(){
    if(this._propertyItems)return;
    this._items=normalizeMultiOptions([...this.querySelectorAll("option")].map(n=>({value:n.value,label:n.label||n.textContent.trim(),disabled:n.disabled||Boolean(n.closest("optgroup")?.disabled)})));
    this._value=normalizeMultiValue(this._value,this._items,this._max());
  }
  get items(){return this._items.map(x=>({...x}));}
  set items(items){this._propertyItems=true;this._items=normalizeMultiOptions(items);this._sync();}
  get value(){return [...this._value];}
  set value(value){this._assigned=true;this._value=Array.isArray(value)?[...value]:[];if(this._initialized||this._items.length)this._value=normalizeMultiValue(this._value,this._items,this._max());this._sync();}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get required(){return this.hasAttribute("required");}
  set required(v){this.toggleAttribute("required",Boolean(v));}
  _locked(){return this.disabled||this._formDisabled||this.hasAttribute("readonly");}
  _max(){const raw=this.getAttribute("max-selected");return raw!==null&&raw.trim()!==""&&Number.isFinite(Number(raw))?Math.max(0,Math.floor(Number(raw))):Infinity;}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._defaultValue??[];}
  formStateRestoreCallback(state){try{this.value=JSON.parse(state);}catch{this.value=[];}}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._syncForm();return this._internals?.reportValidity()??this._valid;}
  show(){if(this._locked()||this._open)return;this._open=true;registerOverlay(this);this.toggleAttribute("open",true);this._popup.hidden=false;this._input.setAttribute("aria-expanded","true");this._active=-1;this._renderOptions();}
  hide(){if(!this._open)return;this._open=false;unregisterOverlay(this);this.toggleAttribute("open",false);this._popup.hidden=true;this._input.setAttribute("aria-expanded","false");this._input.removeAttribute("aria-activedescendant");this._input.value="";this._active=-1;}
  _place(){if(this._open)placeAnchoredOverlay(this._anchor,this._popup,{matchWidth:true,maxHeight:250,gap:5});}
  _toggleValue(value){
    if(this._locked())return;
    const item=this._items.find(x=>x.value===value&&!x.disabled);if(!item)return;
    if(this._value.includes(value))this._value=this._value.filter(v=>v!==value);
    else if(this._value.length<this._max())this._value=[...this._value,value];
    else return;
    this._sync();const detail={value:this.value,values:this.value};notify(this,"cu-input",detail);notify(this,"cu-change",detail);
  }
  _key(e){
    if(this._locked()||e.isComposing)return;
    if(e.key==="Escape"&&this._open&&isTopOverlay(this)){e.preventDefault();e.stopPropagation();this.hide();return;}
    if(e.key==="Tab"){this.hide();return;}
    if(e.key==="Backspace"&&!this._input.value&&this._value.length){e.preventDefault();this._toggleValue(this._value.at(-1));return;}
    if(["ArrowDown","ArrowUp"].includes(e.key)){
      e.preventDefault();if(!this._open)this.show();
      const enabled=this._visible.map((item,i)=>this._unavailable(item)?-1:i).filter(i=>i>=0);
      if(!enabled.length)return;
      const index=enabled.indexOf(this._active);
      this._active=enabled[index<0?(e.key==="ArrowDown"?0:enabled.length-1):(index+(e.key==="ArrowDown"?1:-1)+enabled.length)%enabled.length];
      this._markActive(true);
    }else if(e.key==="Enter"&&this._open&&this._active>=0){e.preventDefault();this._toggleValue(this._visible[this._active].value);}
  }
  _unavailable(item){return item.disabled||(!this._value.includes(item.value)&&this._value.length>=this._max());}
  _renderOptions(){
    if(!this._open)return;
    const query=this._input.value.trim().toLocaleLowerCase();
    this._visible=this._items.filter(x=>x.label.toLocaleLowerCase().includes(query)||x.value.toLocaleLowerCase().includes(query));
    const doc=this.ownerDocument;this._nodes=this._visible.map((item,i)=>{
      const row=doc.createElement("div");row.className="option";row.id="multi-option-"+i;row.setAttribute("role","option");row.setAttribute("aria-selected",String(this._value.includes(item.value)));row.setAttribute("aria-disabled",String(this._unavailable(item)));
      const label=doc.createElement("span");label.textContent=item.label;row.append(label);
      if(this._value.includes(item.value)){const icon=doc.createElement("cu-icon");icon.setAttribute("name","check");icon.setAttribute("size","16");row.append(icon);}
      row.addEventListener("pointerdown",e=>e.preventDefault());row.addEventListener("click",()=>{if(!this._unavailable(item)){this._toggleValue(item.value);this.focus();}});
      return row;
    });
    this._popup.replaceChildren(...this._nodes);
    if(!this._nodes.length){const empty=doc.createElement("div");empty.className="empty";empty.setAttribute("role","presentation");empty.textContent="No matching options";this._popup.append(empty);}
    if(!this._visible[this._active]||this._unavailable(this._visible[this._active]))this._active=-1;
    this._markActive();this._place();
  }
  _markActive(scroll=false){
    this._nodes?.forEach((node,i)=>node.dataset.active=String(i===this._active));
    const active=this._nodes?.[this._active];
    if(active){this._input.setAttribute("aria-activedescendant",active.id);if(scroll)active.scrollIntoView({block:"nearest"});}
    else this._input.removeAttribute("aria-activedescendant");
  }
  _sync(){
    if(!this._input)return;
    if(this._initialized||this._items.length)this._value=normalizeMultiValue(this._value,this._items,this._max());
    const locked=this._locked();if(locked)this.hide();
    this._label.textContent=this.getAttribute("label")||"";
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Select options");
    this._input.placeholder=this._value.length?"Search…":this.getAttribute("placeholder")||"Select options…";
    this._input.disabled=this.disabled||Boolean(this._formDisabled);this._input.readOnly=this.hasAttribute("readonly");this._toggle.disabled=Boolean(locked);
    this._control.dataset.disabled=String(this._input.disabled);
    this._hint.textContent=this.getAttribute("hint")||"";
    const doc=this.ownerDocument;
    this._chips.replaceChildren(...this._value.map(v=>{
      const chip=doc.createElement("span");chip.className="chip";const label=doc.createElement("span");label.textContent=this._items.find(x=>x.value===v)?.label??v;chip.append(label);
      if(!locked){const b=doc.createElement("button");b.type="button";b.setAttribute("aria-label","Remove "+label.textContent);const icon=doc.createElement("cu-icon");icon.setAttribute("name","x");icon.setAttribute("size","14");b.append(icon);b.addEventListener("click",()=>{this._toggleValue(v);this.focus();});chip.append(b);}
      return chip;
    }));
    this._syncForm();this._renderOptions();
  }
  _syncForm(){
    const disabled=this.disabled||Boolean(this._formDisabled),readonly=this.hasAttribute("readonly");
    const error=this.getAttribute("error")||"";
    const invalid=!disabled&&!readonly&&(Boolean(error)||(this.required&&!this._value.length));
    this._valid=!invalid;
    const message=error||"Select at least one option.";
    const revealed=invalid&&(Boolean(error)||this._reveal);
    this._error.textContent=revealed?message:"";this._control.dataset.invalid=String(Boolean(revealed));
    this._input.setAttribute("aria-invalid",String(Boolean(revealed)));this._input.setAttribute("aria-required",String(this.required));
    const desc=[this._hint.textContent?"multi-hint":"",revealed?"multi-error":""].filter(Boolean).join(" ");
    if(desc)this._input.setAttribute("aria-describedby",desc);else this._input.removeAttribute("aria-describedby");
    const data=new FormData(),name=this.getAttribute("name");
    if(name)for(const v of this._value)data.append(name,v);
    this._internals?.setFormValue(disabled?null:data,JSON.stringify(this._value));
    if(invalid)this._internals?.setValidity(error?{customError:true}:{valueMissing:true},message,this._input);else this._internals?.setValidity({});
  }
}
define("cu-multi-select",CuMultiSelect);
