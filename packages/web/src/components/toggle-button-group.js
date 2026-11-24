import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

export function normalizeToggleOptions(items){
  if(!Array.isArray(items))return [];
  const used=new Set();
  return items.filter(item=>item&&typeof item.value==="string"&&item.value.length)
    .filter(item=>{if(used.has(item.value))return false;used.add(item.value);return true;})
    .map(item=>({value:item.value,label:String(item.label??item.value),
      icon:typeof item.icon==="string"?item.icon:"",
      disabled:Boolean(item.disabled)}));
}
export function toggleGroupValues(current,value,multiple=false){
  if(multiple){
    const next=new Set(Array.isArray(current)?current:current?[String(current)]:[]);
    if(next.has(value))next.delete(value);else next.add(value);
    return [...next];
  }
  return String(value);
}

const css=[
  ":host{display:inline-flex;max-width:100%;vertical-align:middle;font:600 13px var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".group{display:flex;align-items:stretch;max-width:100%;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);overflow-x:auto;background:var(--cu-surface,#fff);}",
  "button{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:none;min-height:var(--cu-control-height,40px);",
  "padding:0 13px;border:0;border-right:1px solid var(--cu-border,#e5e5e5);",
  "background:transparent;color:inherit;cursor:pointer;font:inherit;white-space:nowrap;}",
  "button:last-child{border-right:0;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 10%,var(--cu-surface,#fff));}",
  "button[aria-pressed=true]{color:var(--cu-accent,#0067c0);",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;z-index:1;}",
  "button:disabled{opacity:.42;cursor:not-allowed;}",
  ":host([size=sm]) button{min-height:var(--cu-control-sm,28px);padding:0 9px;font-size:12px;}",
  ":host([size=lg]) button{min-height:var(--cu-control-lg,40px);padding:0 16px;font-size:14px;}",
  ":host([orientation=vertical]) .group{flex-direction:column;}",
  ":host([orientation=vertical]) button{justify-content:flex-start;border-right:0;",
  "border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  ":host([orientation=vertical]) button:last-child{border-bottom:0;}",
  "@media(forced-colors:active){button[aria-pressed=true]{outline:1px solid Highlight;outline-offset:-1px;}",
  "button:focus-visible{outline:2px solid Highlight;}}"
].join("");

export class CuToggleButtonGroup extends BrowserElement {
  static get observedAttributes(){return ["value","multiple","disabled","label","aria-label","orientation"];}
  constructor(){
    super();
    const root=mount(this,css,'<div class="group" part="group" role="group"></div>');
    this._group=root.querySelector(".group");
    this._items=[];
    this._selected=[];
    this._focusIndex=0;
    this._group.addEventListener("click",event=>{
      const button=event.target.closest('button[data-index]');
      if(!button||button.disabled)return;
      const index=Number(button.dataset.index);
      this._focusIndex=index;
      this.select(this._items[index].value);
      this._focusAt(index);
    });
    this._group.addEventListener("keydown",event=>{
      const key=event.key;
      if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(key))return;
      event.preventDefault();
      const enabled=this._enabled();
      if(!enabled.length)return;
      const current=enabled.indexOf(this._focusIndex);
      const forward=key==="ArrowRight"||key==="ArrowDown";
      const target=key==="Home"?enabled[0]:key==="End"?enabled.at(-1):
        enabled[(Math.max(0,current)+(forward?1:enabled.length-1))%enabled.length];
      this._focusAt(target);
    });
  }
  connectedCallback(){
    if(this.hasAttribute("value"))this._selected=[this.getAttribute("value")];
    this._render();
  }
  attributeChangedCallback(name){
    if(name==="value"){
      if(this.hasAttribute("value"))this._selected=[this.getAttribute("value")];
      else if(!this.multiple)this._selected=[];
      this._syncPressed();
    }else if(name==="multiple"){
      if(!this.multiple&&this._selected.length>1)this._selected=this._selected.slice(0,1);
      this._syncPressed();
    }else this._render();
  }
  get items(){return this._items.map(item=>({...item}));}
  set items(value){
    this._items=normalizeToggleOptions(value);
    this._selected=this._selected.filter(v=>this._items.some(item=>item.value===v));
    this._render();
  }
  get value(){return this.multiple?[...this._selected]:(this._selected[0]??"");}
  set value(input){
    const values=Array.isArray(input)?input:[input];
    const normalized=[...new Set(values.filter(v=>typeof v==="string"&&v.length))];
    this._selected=this._items.length?normalized.filter(v=>this._items.some(item=>item.value===v&&!item.disabled)):normalized;
    if(!this.multiple)this._selected=this._selected.slice(0,1);
    this._syncPressed();
  }
  get multiple(){return this.hasAttribute("multiple");}
  set multiple(v){this.toggleAttribute("multiple",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  select(value){
    const index=this._items.findIndex(item=>item.value===value&&!item.disabled);
    if(this.disabled||index<0)return false;
    const next=toggleGroupValues(this.value,value,this.multiple);
    const selected=this.multiple?next:[next];
    if(JSON.stringify(selected)===JSON.stringify(this._selected))return false;
    this._selected=selected;
    this._syncPressed();
    notify(this,"cu-change",{value:this.value,values:[...this._selected]});
    return true;
  }
  focus(options){this._group.querySelector('button[tabindex="0"]')?.focus(options);}
  _enabled(){return this._items.map((item,i)=>i).filter(i=>!this.disabled&&!this._items[i].disabled);}
  _focusAt(index){
    if(!this._enabled().includes(index))return;
    this._focusIndex=index;
    for(const button of this._group.querySelectorAll("button[data-index]"))
      button.tabIndex=Number(button.dataset.index)===index?0:-1;
    this._group.querySelector('button[data-index="'+index+'"]')?.focus();
  }
  _syncPressed(){
    if(!this._group)return;
    for(const button of this._group.querySelectorAll("button[data-index]"))
      button.setAttribute("aria-pressed",String(this._selected.includes(this._items[Number(button.dataset.index)]?.value)));
  }
  _render(){
    if(!this._group)return;
    this._group.replaceChildren();
    this._group.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Options");
    this._group.setAttribute("aria-orientation",this.getAttribute("orientation")==="vertical"?"vertical":"horizontal");
    const enabled=this._enabled();
    if(!enabled.includes(this._focusIndex))this._focusIndex=enabled[0]??-1;
    for(const [index,item] of this._items.entries()){
      const button=document.createElement("button");
      button.type="button";button.dataset.index=String(index);
      button.disabled=this.disabled||item.disabled;
      button.tabIndex=index===this._focusIndex&&!button.disabled?0:-1;
      button.setAttribute("aria-pressed",String(this._selected.includes(item.value)));
      if(item.icon){const icon=document.createElement("cu-icon");icon.name=item.icon;icon.setAttribute("size","16");icon.setAttribute("aria-hidden","true");button.append(icon);}
      const label=document.createElement("span");label.textContent=item.label;button.append(label);
      this._group.append(button);
    }
  }
}
define("cu-toggle-button-group",CuToggleButtonGroup);
