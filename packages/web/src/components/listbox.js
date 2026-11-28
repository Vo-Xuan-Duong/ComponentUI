
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";
export class CuListOption extends BrowserElement {
  static get observedAttributes(){return ["value","disabled","selected","label"];}
}
define("cu-list-option",CuListOption);
export function readListOptions(entries){
  return entries.filter(x=>x && x.tag==="cu-list-option").map((item,index)=>({
    value:String(item.value??index),label:String(item.label??""),
    disabled:Boolean(item.disabled),selected:Boolean(item.selected)
  }));
}
const css=[
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".label{font-size:13px;font-weight:650;margin-bottom:8px;}",
  ".label:empty{display:none;}",
  ".list{box-sizing:border-box;width:100%;max-height:240px;overflow-y:auto;outline:0;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);",
  "padding:5px;background:var(--cu-surface,#fff);}",
  ".list:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".list[aria-disabled=true]{opacity:.55;}",
  ".option{padding:9px 12px;min-height:35px;display:flex;align-items:center;justify-content:space-between;",
  "gap:12px;box-sizing:border-box;border-radius:var(--cu-radius-md,6px);",
  "font:400 13px var(--cu-font-body,system-ui);cursor:pointer;}",
  ".option:hover:not([aria-disabled=true]),.option[data-active=true]:not([aria-disabled=true]){",
  "background:var(--cu-state-hover);}",
  ".option[data-active=true]:not([aria-disabled=true]){background:var(--cu-state-active);font-weight:600;}",
  ".option[aria-disabled=true]{opacity:.4;cursor:not-allowed;}",
  ".option[data-selected=true]{background:var(--cu-state-selected);font-weight:650;}",
  ".option[data-selected=true]:hover:not([aria-disabled=true]),.option[data-selected=true][data-active=true]{background:var(--cu-state-active);}",
  ".check{color:var(--cu-accent,#0067c0);opacity:0;}",
  ".option[data-selected=true] .check{opacity:1;}",
  "slot{display:none!important;}",
  "@media(forced-colors:active){.option[data-active=true]{outline:2px solid Highlight;}}",
  focusStyle
].join("");
let instanceId=0;
export class CuListBox extends BrowserElement {
  static formAssociated=true;
  static get observedAttributes(){return ["name","label","value","disabled","required","aria-label"];}
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="label" part="label"></div><div class="list" part="list" role="listbox" tabindex="0"></div><slot></slot>');
    this._label=root.querySelector(".label");
    this._list=root.querySelector(".list");
    this._list.id="cu-listbox-"+ ++instanceId;
    this._options=[];
    this._active=-1;this._value="";this._initialized=false;
    this._observer=null;
    this._list.addEventListener("click",event=>{
      const option=event.target.closest('[role="option"]');
      if(option)this._commit(Number(option.dataset.index));
    });
    this._list.addEventListener("pointerover",event=>{
      if(this._disabled()||event.pointerType==="touch")return;
      const node=event.target.closest('[role="option"]');
      if(!node||node.getAttribute("aria-disabled")==="true")return;
      const next=Number(node.dataset.index);if(next===this._active)return;this._active=next;this._refresh(false);
    });
    this._list.addEventListener("keydown",event=>this._key(event));
  }
  connectedCallback(){
    this._render();this._sync();
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==="childList"||r.type==="characterData"||
          ["value","selected","disabled","label"].includes(r.attributeName)))this._render();
      });
      this._observer.observe(this,{subtree:true,childList:true,characterData:true,attributes:true,
        attributeFilter:["value","selected","disabled","label"]});
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(name){
    if(!this._list)return;
    if(name==="value"&&this._initialized)this._setValue(this.getAttribute("value")??"");
    this._sync();
  }
  formDisabledCallback(value){this._formDisabled=value;this._sync();}
  formResetCallback(){this._setValue(this._initial??"");}
  formStateRestoreCallback(value){this.value=String(value??"");}
  get value(){return this._value;}
  set value(next){this._setValue(String(next??""));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  focus(options){this._list.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid();}
  reportValidity(){return this._internals?.reportValidity()??this._valid();}
  _disabled(){return this.disabled||Boolean(this._formDisabled);}
  _valid(){return this._disabled()||!this.required||
    (this._value!==""&&this._options.some(o=>o.value===this._value&&!o.disabled));}
  _render(){
    if(!this._list)return;
    const oldValue=this._value;
    this._options=readListOptions([...this.children].filter(e=>e.localName==="cu-list-option")
      .map(e=>({tag:e.localName,value:e.getAttribute("value"),label:e.getAttribute("label")??e.textContent.trim(),
        disabled:e.hasAttribute("disabled"),selected:e.hasAttribute("selected")})));
    this._list.replaceChildren();
    this._options.forEach((opt,i)=>{
      const el=this.ownerDocument.createElement("div");el.setAttribute("role","option");
      el.id=this._list.id+"-opt-"+i;el.dataset.index=String(i);
      el.setAttribute("aria-disabled",String(opt.disabled));
      const label=this.ownerDocument.createElement("span");label.textContent=opt.label;
      const check=this.ownerDocument.createElement("cu-icon");check.className="check";
      check.setAttribute("name","check");check.setAttribute("size","16");
      check.setAttribute("aria-hidden","true");el.append(label,check);this._list.append(el);
    });
    if(!this._initialized){
      this._initial=this.getAttribute("value")??this._options.find(o=>o.selected&&!o.disabled)?.value??"";
      this._initialized=true;this._setValue(this._initial);
    }else this._setValue(oldValue);
    this._active=this._options.findIndex(o=>o.value===this._value&&!o.disabled);
    if(this._active<0)this._active=this._options.findIndex(o=>!o.disabled);
    this._refresh(false);
  }
  _setValue(value){
    const candidate=this._options.find(o=>o.value===value&&!o.disabled);
    this._value=candidate?.value??"";
    const index=this._options.findIndex(o=>o.value===this._value&&!o.disabled);
    if(index>=0)this._active=index;
    this._refresh(false);
  }
  _refresh(scroll=true){
    if(!this._list)return;
    for(const node of this._list.querySelectorAll('[role="option"]')){
      const i=Number(node.dataset.index),option=this._options[i];
      const selected=this._value!==""&&option.value===this._value&&!option.disabled;
      const active=i===this._active&&!option.disabled;
      node.dataset.selected=String(selected);node.dataset.active=String(active);
      node.setAttribute("aria-selected",String(selected));
    }
    const current=this._list.querySelector('[data-active="true"]');
    if(current){
      this._list.setAttribute("aria-activedescendant",current.id);
      if(scroll)current.scrollIntoView({block:"nearest"});
    }else this._list.removeAttribute("aria-activedescendant");
    this._internals?.setFormValue(this._disabled()?null:this._value);
    if(this._internals){
      if(!this._valid())this._internals.setValidity({valueMissing:true},"Choose an item.",this._list);
      else this._internals.setValidity({});
    }
    this._list.setAttribute("aria-invalid",String(!this._valid()));
  }
  _sync(){
    if(!this._list)return;
    this._label.textContent=this.getAttribute("label")??"";
    this._list.setAttribute("aria-label",this.getAttribute("aria-label")||
      this._label.textContent||"Choose an item");
    this._list.setAttribute("aria-disabled",String(this._disabled()));
    this._list.setAttribute("aria-required",String(this.required));
    this._list.tabIndex=this._disabled()?-1:0;
    this._refresh(false);
  }
  _commit(i){
    if(this._disabled()||!this._options[i]||this._options[i].disabled)return;
    const old=this._value;this._active=i;this._setValue(this._options[i].value);
    if(old!==this._value){
      notify(this,"cu-input",{value:this.value});
      notify(this,"cu-change",{value:this.value});
    }
  }
  _key(event){
    if(this._disabled())return;
    const enabled=this._options.map((o,i)=>!o.disabled?i:-1).filter(x=>x>=0);
    if(!enabled.length)return;
    const position=enabled.indexOf(this._active);
    let next=null;
    if(event.key==="ArrowDown")next=enabled[(Math.max(position,-1)+1)%enabled.length];
    if(event.key==="ArrowUp")next=enabled[(position<=0?enabled.length:position)-1];
    if(event.key==="Home")next=enabled[0];
    if(event.key==="End")next=enabled[enabled.length-1];
    if(next!==null){event.preventDefault();this._active=next;this._refresh();return;}
    if(event.key==="Enter"||event.key===" "){
      event.preventDefault();this._commit(this._active);
    }
  }
}
define("cu-listbox",CuListBox);
