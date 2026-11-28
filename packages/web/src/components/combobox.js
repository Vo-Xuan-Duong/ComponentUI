
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { placeAnchoredOverlay,closeOverlayTopLayer, watchOverlayViewport, registerOverlay, unregisterOverlay, isTopOverlay } from "./_overlay.js";

export class CuComboOption extends BrowserElement {
  static get observedAttributes(){return ["value","label","disabled","selected"];}
}
define("cu-combo-option",CuComboOption);

export function filterComboOptions(options,query){
  const normalized=String(query??"").trim().toLocaleLowerCase();
  return options.filter(o=>!o.disabled && String(o.label??"")
    .toLocaleLowerCase().includes(normalized));
}
const css=[
  ":host{display:block;position:relative;min-width:0;font:13px var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ":host([open]){z-index:90;}",
  ".label{display:block;margin-bottom:7px;font-weight:650;}",
  ".label:empty{display:none;}",
  ".anchor{position:relative;min-width:0;}",
  "input{box-sizing:border-box;width:100%;height:var(--cu-control-height,40px);",
  "padding:0 12px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-surface,#fff);color:var(--cu-text,#242424);",
  "font:400 14px var(--cu-font-body,system-ui);}",
  "input:hover:not(:disabled):not(:focus){background:var(--cu-surface-alt,#fafafa);",
  "border-color:var(--cu-accent,#0067c0);}",
  "input:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);",
  "box-shadow:0 0 0 4px color-mix(in srgb,var(--cu-focus,#0067c0) 14%,transparent);}",
  "input:disabled{opacity:.55;cursor:not-allowed;}",
  "input[aria-invalid=true]{border-bottom-color:var(--cu-danger,#c42b1c);}",
  ".popup{position:absolute;top:calc(100% + 5px);left:0;right:0;z-index:2;",
  "box-sizing:border-box;padding:5px;max-height:235px;overflow:auto;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);",
  "background:var(--cu-surface-elevated,#fff);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  ".popup[hidden]{display:none!important;}",
  ".popup:not([hidden]){animation:cu-combo-enter var(--cu-motion-normal,160ms) var(--cu-motion-ease,ease) both;}",
  "@keyframes cu-combo-enter{from{opacity:.5}to{opacity:1}}",
  ".option[aria-selected=true]:not([data-active=true]):not(:hover){background:var(--cu-state-selected);}",
  ".option{padding:9px 11px;min-height:34px;box-sizing:border-box;",
  "border-radius:var(--cu-radius-md,6px);cursor:pointer;}",
  ".option:hover,.option[data-active=true]{",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 19%,var(--cu-surface,#fff));}",
  ".empty{padding:12px;color:var(--cu-text-muted,#616161);font-size:12px;}",
  "slot{display:none!important;}",
  "@media(prefers-reduced-motion:reduce){.popup:not([hidden]){animation:none;}}",
  "@media(forced-colors:active){.option[data-active=true]{outline:2px solid Highlight;}",
  "input:focus-visible{outline-color:Highlight;box-shadow:none;}}",
  focusStyle
].join("");
let idCounter=0;
export class CuCombobox extends BrowserElement {
  static formAssociated=true;
  static get observedAttributes(){
    return ["name","label","value","placeholder","required","disabled","aria-label"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<label class="label" part="label"></label><div class="anchor"><input part="input" role="combobox" '+
      'autocomplete="off" aria-autocomplete="list" aria-expanded="false" '+
      'aria-haspopup="listbox"><div class="popup" part="popup" role="listbox" hidden></div></div><slot></slot>');
    this._label=root.querySelector(".label");
    this._input=root.querySelector("input");
    this._popup=root.querySelector(".popup");
    this._anchor=root.querySelector(".anchor");
    this._popup.id="cu-combo-"+ ++idCounter;
    this._label.id=this._popup.id+"-label";
    this._input.id=this._popup.id+"-input";this._label.htmlFor=this._input.id;
    this._input.setAttribute("aria-controls",this._popup.id);
    this._options=[];this._visible=[];
    this._value="";this._query="";this._active=-1;this._open=false;
    this._initial="";this._initialized=false;this._observer=null;
    this._input.addEventListener("focus",()=>{if(!this.disabled)this.show();});
    this._input.addEventListener("input",()=>{
      if(this._disabled())return;
      this._query=this._input.value;
      // Edited text is not a committed option; never submit stale selection.
      this._value="";this._syncForm();
      this._renderOptions();this.show();
      notify(this,"cu-input",{query:this._query,value:""});
    });
    this._input.addEventListener("keydown",e=>this._key(e));
    this._popup.addEventListener("pointerdown",event=>{
      if(event.target.closest('[role="option"]'))event.preventDefault();
    });
    this._popup.addEventListener("pointerover",event=>{
      if(event.pointerType==="touch")return;
      const el=event.target.closest('[role="option"]');
      if(!el)return;this._active=Number(el.dataset.index);this._markActive(false);
    });
    this._popup.addEventListener("click",event=>{
      const el=event.target.closest('[role="option"]');
      if(el)this._commit(Number(el.dataset.index));
    });
    this._onOutside=event=>{if(this._open&&!event.composedPath().includes(this))this.hide(true);};
    this._onBlur=()=>{
      // A pointer selection calls preventDefault above to retain input focus.
      queueMicrotask(()=>{if(this._open&&!this.matches(":focus-within"))this.hide(true);});
    };
  }
  connectedCallback(){
    this._readChildren();this._sync();
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==="childList"||r.type==="characterData"||
          ["value","label","disabled","selected"].includes(r.attributeName)))this._readChildren();
      });
      this._observer.observe(this,{subtree:true,childList:true,characterData:true,attributes:true,
        attributeFilter:["value","label","disabled","selected"]});
    }
    document.addEventListener("pointerdown",this._onOutside);
    this._input.addEventListener("blur",this._onBlur);
    this._stopViewport=watchOverlayViewport(this,()=>this._placePopup());
  }
  disconnectedCallback(){
    this._observer?.disconnect();this._observer=null;
    document.removeEventListener("pointerdown",this._onOutside);
    this._input.removeEventListener("blur",this._onBlur);
    this._stopViewport?.();this._stopViewport=null;this.hide(true);unregisterOverlay(this);
  }
  attributeChangedCallback(name){
    if(!this._input)return;
    if(name==="value"&&this._initialized)this.value=this.getAttribute("value")??"";
    this._sync();
  }
  formDisabledCallback(value){this._formDisabled=value;if(value)this.hide(true);this._sync();}
  formResetCallback(){this.value=this._initial;this.hide(true);}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._value;}
  set value(value){
    const found=this._options.find(o=>o.value===String(value)&&!o.disabled);
    this._value=found?.value??"";
    this._query=found?.label??"";
    this._input.value=this._query;
    this._syncForm();this._renderOptions();
  }
  get query(){return this._query;}
  get open(){return this._open;}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid();}
  reportValidity(){return this._internals?.reportValidity()??this._valid();}
  _disabled(){return this.disabled||Boolean(this._formDisabled);}
  _valid(){return this._disabled()||!this.hasAttribute("required")||this._value!=="";}
  _readChildren(){
    this._options=[...this.children].filter(x=>x.localName==="cu-combo-option").map((x,index)=>({
      value:x.getAttribute("value")??String(index),
      label:x.getAttribute("label")??x.textContent.trim(),
      disabled:x.hasAttribute("disabled"),selected:x.hasAttribute("selected")
    }));
    if(!this._initialized){
      this._initial=this.getAttribute("value")??this._options.find(o=>o.selected&&!o.disabled)?.value??"";
      this._initialized=true;this.value=this._initial;
    }else if(this._open&&!this._value){this._renderOptions();this._syncForm();}
    else this.value=this._value;
  }
  _sync(){
    if(!this._input)return;
    this._label.textContent=this.getAttribute("label")||"";
    this._input.placeholder=this.getAttribute("placeholder")||"Search options…";
    this._input.disabled=this._disabled();this._input.required=this.hasAttribute("required");
    if(this._disabled()&&this._open)this.hide(true);
    this._input.setAttribute("aria-required",String(this.hasAttribute("required")));
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||
      this._label.textContent||"Search options");
    this._syncForm();
  }
  _syncForm(){
    this._internals?.setFormValue(this._disabled()?null:this._value);
    if(this._internals){
      if(!this._valid())this._internals.setValidity({valueMissing:true},"Choose an option.",this._input);
      else this._internals.setValidity({});
    }
    this._input.setAttribute("aria-invalid",String(!this._valid()));
  }
  _renderOptions(){
    if(!this._popup)return;
    this._visible=filterComboOptions(this._options,this._query);
    this._popup.replaceChildren();
    this._visible.forEach((opt,i)=>{
      const node=document.createElement("div");
      node.className="option";
      node.setAttribute("role","option");node.dataset.index=String(i);
      node.id=this._popup.id+"-option-"+i;node.textContent=opt.label;
      node.setAttribute("aria-selected",String(opt.value===this._value&&this._value!==""));
      this._popup.append(node);
    });
    if(!this._visible.length){
      const empty=document.createElement("div");empty.className="empty";empty.textContent="No matching options";
      this._popup.append(empty);
    }
    this._active=this._visible.length?0:-1;
    this._markActive(false);
    this._placePopup();
  }
  _markActive(scroll=true){
    const items=[...this._popup.querySelectorAll('[role="option"]')];
    items.forEach((item,i)=>{item.dataset.active=String(i===this._active);});
    const active=items[this._active];
    if(active&&this._open){
      this._input.setAttribute("aria-activedescendant",active.id);
      if(scroll)active.scrollIntoView({block:"nearest"});
    }else this._input.removeAttribute("aria-activedescendant");
  }
  show(){
    if(this._disabled()||this._open)return;
    this._open=true;registerOverlay(this);this.toggleAttribute("open",true);
    // Display all options when opening from a committed selection. Filtering
    // starts only after the user edits the input; do not trap them in one row.
    if(this._value && this._query===this._input.value)this._query="";
    this._renderOptions();this._popup.hidden=false;
    this._input.setAttribute("aria-expanded","true");
    this._placePopup();
  }
  hide(restore=false){
    if(this._open){this._open=false;unregisterOverlay(this);this.toggleAttribute("open",false);
      closeOverlayTopLayer(this._popup);this._popup.hidden=true;this._input.setAttribute("aria-expanded","false");}
    this._input.removeAttribute("aria-activedescendant");
    if(restore){
      const selected=this._options.find(o=>o.value===this._value);
      this._query=selected?.label??"";this._input.value=this._query;
    }
  }
  _commit(i){
    const item=this._visible[i];if(!item||this._disabled())return;
    const old=this._value;
    this._value=item.value;this._query=item.label;this._input.value=item.label;
    this._syncForm();this.hide();
    if(old!==this._value)notify(this,"cu-change",{value:this._value,label:item.label});
  }
  _placePopup(){
    if(this._open)placeAnchoredOverlay(this._anchor,this._popup,{matchWidth:true,maxHeight:235,gap:5,topLayer:true});
  }
  _key(e){
    if(this._disabled())return;
    if(e.key==="Escape"&&this._open&&isTopOverlay(this)){
      e.preventDefault();e.stopPropagation();this.hide(true);return;
    }
    if(e.key==="Tab"){this.hide(true);return;}
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      e.preventDefault();
      if(!this._open){this.show();return;}
      const count=this._visible.length;
      if(!count)return;
      const direction=e.key==="ArrowDown"?1:-1;
      this._active=this._active<0?(direction>0?0:count-1):
        (this._active+direction+count)%count;
      this._markActive();return;
    }
    if((e.key==="Home"||e.key==="End")&&this._open){
      e.preventDefault();
      if(!this._visible.length)return;
      this._active=e.key==="Home"?0:this._visible.length-1;
      this._markActive();return;
    }
    if(e.key==="Enter"&&this._open){
      e.preventDefault();this._commit(this._active);
    }
  }
}
define("cu-combobox",CuCombobox);
