import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {placeAnchoredOverlay,watchOverlayViewport,registerOverlay,unregisterOverlay,isTopOverlay} from "./_overlay.js";
import "./icon.js";

export function normalizeSuggestions(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.value!=="string"||!item.value||seen.has(item.value))return [];
    seen.add(item.value);
    return [{value:item.value,label:String(item.label??item.value),description:String(item.description??""),disabled:Boolean(item.disabled)}];
  });
}
export function filterSuggestions(items,query,max=10){
  const q=String(query??"").trim().toLocaleLowerCase();
  return items.filter(x=>[x.value,x.label,x.description].some(v=>String(v??"").toLocaleLowerCase().includes(q))).slice(0,Math.max(0,max));
}
const css=[
  ":host{display:block;position:relative;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}:host([open]){z-index:90;}",
  ".field{display:grid;gap:7px;}.label{font-weight:600;}.label:empty,.hint:empty,.error:empty{display:none;}.anchor{position:relative;min-width:0;}",
  ".control{display:flex;align-items:center;gap:6px;padding:0 9px;box-sizing:border-box;min-height:var(--cu-control-height,40px);background:var(--cu-surface,#fff);border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);}",
  ".control:focus-within,.control:hover:not([data-disabled=true]){border-color:var(--cu-accent,#0067c0);}.control[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.control[data-disabled=true]{opacity:.55;}",
  "input{min-width:0;flex:1;height:36px;color:inherit;font:inherit;border:0;background:transparent;outline:none;}input:focus-visible{outline:none;}.control:has(input:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".clear{border:0;border-radius:5px;display:grid;place-items:center;background:transparent;color:inherit;padding:4px;cursor:pointer;}.clear:hover{background:var(--cu-state-hover);}.clear[hidden],.popup[hidden]{display:none!important;}",
  ".popup{position:absolute;top:calc(100% + 5px);left:0;width:100%;z-index:2;box-sizing:border-box;max-height:260px;overflow:auto;overscroll-behavior:contain;background:var(--cu-surface-elevated,#fff);border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);padding:5px;box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  ".option{display:grid;gap:3px;padding:9px 10px;border-radius:var(--cu-radius-md,6px);cursor:pointer;}.option[data-active=true]:not([aria-disabled=true]),.option:hover:not([aria-disabled=true]){background:var(--cu-state-pressed);}.option[aria-disabled=true]{opacity:.5;cursor:not-allowed;}",
  ".description,.hint,.empty,.error{font-size:12px;color:var(--cu-text-muted,#616161);}.empty{padding:10px;}.error{color:var(--cu-danger,#c42b1c);}",
  "@media(forced-colors:active){.option[data-active=true]{outline:2px solid Highlight;}}",focusStyle
].join("");
export class CuAutoComplete extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","label","name","hint","error","placeholder","disabled","readonly","required","loading","min-chars","max-results","manual-filter","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._items=[];this._active=-1;this._visible=[];
    const root=mount(this,css,'<div class="field"><label for="ac-input" class="label"></label><div class="anchor"><div class="control" part="control"><cu-icon name="search" size="16"></cu-icon><input id="ac-input" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ac-list"><button class="clear" type="button" aria-label="Clear search" hidden><cu-icon name="x" size="16"></cu-icon></button></div><div class="popup" id="ac-list" role="listbox" hidden></div></div><div class="hint" id="ac-hint"></div><div class="error" id="ac-error" role="alert"></div><span class="status" role="status" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);"></span></div>');
    for(const [k,q] of Object.entries({label:".label",anchor:".anchor",control:".control",input:"input",clear:".clear",popup:".popup",hint:".hint",error:".error",status:".status"}))this["_"+k]=root.querySelector(q);
    this._input.addEventListener("input",e=>{if(!e.isComposing)this._edited();});
    this._input.addEventListener("compositionend",()=>this._edited());
    this._input.addEventListener("change",()=>notify(this,"cu-change",{value:this.value}));
    this._input.addEventListener("focus",()=>this.show());
    this._input.addEventListener("keydown",e=>this._key(e));
    this._clear.addEventListener("click",()=>{this.value="";this.focus();this._edited();notify(this,"cu-change",{value:this.value});});
    root.addEventListener("focusout",e=>{if(!e.relatedTarget||!root.contains(e.relatedTarget))this.hide();});
    this._outside=e=>{if(!e.composedPath().includes(this))this.hide();};
    this.addEventListener("invalid",()=>{this._reveal=true;this._syncForm();});
  }
  connectedCallback(){
    if(!this._initialized){this._default=this.getAttribute("value")??"";if(!this._assigned)this._input.value=this._default;this._initialized=true;}
    this._sync();this._doc=this.ownerDocument;this._doc.addEventListener("pointerdown",this._outside);
    this._stopViewport=watchOverlayViewport(this,()=>this._place());
  }
  disconnectedCallback(){this.hide();this._doc?.removeEventListener("pointerdown",this._outside);this._stopViewport?.();}
  attributeChangedCallback(name){if(!this._input)return;if(name==="value"&&this._initialized){this._default=this.getAttribute("value")??"";this.value=this._default;return;}this._sync();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeSuggestions(v);this._active=-1;this._render();}
  get value(){return this._input.value;}
  set value(v){this._assigned=true;this._input.value=String(v??"");this._active=-1;this._sync();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
  _locked(){return this.disabled||Boolean(this._formDisabled)||this.hasAttribute("readonly");}
  _number(name,fallback,max){const raw=this.getAttribute(name);const n=raw===null?fallback:Number(raw);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):fallback;}
  _eligible(){return !this._locked()&&this.value.trim().length>=this._number("min-chars",1,100);}
  focus(options){this._input.focus(options);}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._default??"";this.hide();}
  formStateRestoreCallback(v){this.value=String(v??"");}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._syncForm();return this._internals?.reportValidity()??this._valid;}
  _edited(){
    this._active=-1;this._sync();
    if(this._eligible())this.show();else this.hide();
    notify(this,"cu-input",{value:this.value,query:this.value});
    notify(this,"cu-search",{value:this.value,query:this.value});
  }
  show(){
    if(!this._eligible())return;
    if(!this._open){this._open=true;registerOverlay(this);this.toggleAttribute("open",true);this._popup.hidden=false;this._input.setAttribute("aria-expanded","true");}
    this._render();
  }
  hide(){if(!this._open)return;this._open=false;unregisterOverlay(this);this.toggleAttribute("open",false);this._popup.hidden=true;this._input.setAttribute("aria-expanded","false");this._input.removeAttribute("aria-activedescendant");this._active=-1;}
  _place(){if(this._open)placeAnchoredOverlay(this._anchor,this._popup,{matchWidth:true,maxHeight:260,gap:5});}
  _commit(item){
    if(!item||item.disabled||this._locked())return;
    this.value=item.value;this.hide();this.focus();
    notify(this,"cu-select",{value:item.value,label:item.label});notify(this,"cu-input",{value:item.value,query:item.value});notify(this,"cu-change",{value:item.value,label:item.label});
  }
  _key(e){
    if(this._locked()||e.isComposing)return;
    if(e.key==="Escape"&&this._open&&isTopOverlay(this)){e.preventDefault();e.stopPropagation();this.hide();return;}
    if(e.key==="Tab"){this.hide();return;}
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      if(!this._eligible())return;e.preventDefault();this.show();
      const enabled=this._visible.map((x,i)=>x.disabled?-1:i).filter(i=>i>=0);if(!enabled.length)return;
      const i=enabled.indexOf(this._active),dir=e.key==="ArrowDown"?1:-1;
      this._active=enabled[i<0?(dir===1?0:enabled.length-1):(i+dir+enabled.length)%enabled.length];this._mark(true);
    }else if(e.key==="Enter"&&this._open&&this._active>=0){e.preventDefault();this._commit(this._visible[this._active]);}
  }
  _mark(scroll=false){
    this._nodes?.forEach((node,i)=>{node.dataset.active=String(i===this._active);});
    const node=this._nodes?.[this._active];
    if(node){this._input.setAttribute("aria-activedescendant",node.id);if(scroll)node.scrollIntoView({block:"nearest"});}
    else this._input.removeAttribute("aria-activedescendant");
  }
  _render(){
    if(!this._open)return;
    const limit=this._number("max-results",10,100);
    this._visible=this.loading?[]:this.hasAttribute("manual-filter")?this._items.slice(0,limit):filterSuggestions(this._items,this.value,limit);
    const doc=this.ownerDocument;
    this._nodes=this._visible.map((item,i)=>{
      const el=doc.createElement("div");el.className="option";el.id="ac-option-"+i;el.setAttribute("role","option");el.setAttribute("aria-selected","false");el.setAttribute("aria-disabled",String(item.disabled));
      const title=doc.createElement("span");title.textContent=item.label;el.append(title);
      if(item.description){const description=doc.createElement("span");description.className="description";description.textContent=item.description;el.append(description);}
      el.addEventListener("pointerdown",e=>e.preventDefault());el.addEventListener("click",()=>this._commit(item));return el;
    });
    this._popup.replaceChildren(...this._nodes);
    const status=this.loading?"Loading suggestions":this._nodes.length?this._nodes.length+" suggestions":"No suggestions";
    if(!this._nodes.length){const empty=doc.createElement("div");empty.className="empty";empty.setAttribute("role","presentation");empty.textContent=status;this._popup.append(empty);}
    this._status.textContent=status;this._popup.setAttribute("aria-busy",String(this.loading));
    if(!this._visible[this._active]||this._visible[this._active].disabled)this._active=-1;
    this._mark();this._place();
  }
  _sync(){
    if(!this._input)return;
    this._label.textContent=this.getAttribute("label")||"";
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Search");
    this._input.placeholder=this.getAttribute("placeholder")||"Search…";
    this._input.disabled=this.disabled||Boolean(this._formDisabled);this._input.readOnly=this.hasAttribute("readonly");
    this._control.dataset.disabled=String(this._input.disabled);this._clear.hidden=this._locked()||!this.value;
    this._hint.textContent=this.getAttribute("hint")||"";
    if(!this._eligible())this.hide();this._syncForm();this._render();
  }
  _syncForm(){
    const error=this.getAttribute("error")||"";
    const invalid=!this._locked()&&(Boolean(error)||(this.required&&!this.value.trim()));
    this._valid=!invalid;const message=error||"Enter a value.";const revealed=invalid&&(Boolean(error)||this._reveal);
    this._error.textContent=revealed?message:"";this._control.dataset.invalid=String(Boolean(revealed));
    this._input.setAttribute("aria-invalid",String(Boolean(revealed)));this._input.setAttribute("aria-required",String(this.required));
    const desc=[this._hint.textContent?"ac-hint":"",revealed?"ac-error":""].filter(Boolean).join(" ");if(desc)this._input.setAttribute("aria-describedby",desc);else this._input.removeAttribute("aria-describedby");
    this._internals?.setFormValue(this.disabled||this._formDisabled?null:this.value);
    if(invalid)this._internals?.setValidity(error?{customError:true}:{valueMissing:true},message,this._input);else this._internals?.setValidity({});
  }
}
define("cu-autocomplete",CuAutoComplete);
