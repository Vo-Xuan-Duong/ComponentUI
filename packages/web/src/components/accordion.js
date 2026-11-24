import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./disclosure.js";

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".items{display:grid;gap:8px;min-width:0;}",
  ":host([variant=flush]) .items{gap:0;}",
  ":host([variant=flush]) ::slotted(cu-accordion-item){border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "@media(forced-colors:active){:host([variant=flush]) ::slotted(cu-accordion-item){border-color:CanvasText;}}"
].join("");

export function accordionValues(items,multiple=false){
  if(!Array.isArray(items))return [];
  const opened=items.filter(item=>item&&item.open&&!item.disabled).map(item=>item.value);
  return multiple?opened:opened.slice(0,1);
}

export class CuAccordion extends BrowserElement {
  static get observedAttributes(){return ["multiple","label","aria-label","variant"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="items" part="items" role="group"><slot></slot></div>');
    this._itemsRoot=root.querySelector(".items");
    this._slot=root.querySelector("slot");
    this._slot.addEventListener("slotchange",()=>this._sync());
    this._onToggle=event=>{
      const item=event.target;
      if(!this._items().includes(item))return;
      event.stopPropagation();
      if(item.open&&!this.multiple){
        for(const other of this._items())if(other!==item)other.open=false;
      }
      const values=this.values;
      notify(this,"cu-change",{
        value:values[0]??"",values,changedValue:item.value,open:item.open
      });
    };
    this._observer=null;
  }
  connectedCallback(){
    this.addEventListener("cu-toggle",this._onToggle);
    this._sync();
    if(globalThis.MutationObserver){
      this._observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==="childList"||
          ["disabled","open","value"].includes(r.attributeName)))this._sync();
      });
      this._observer.observe(this,{childList:true,subtree:true,attributes:true,
        attributeFilter:["disabled","open","value"]});
    }
  }
  disconnectedCallback(){
    this.removeEventListener("cu-toggle",this._onToggle);
    this._observer?.disconnect();this._observer=null;
  }
  attributeChangedCallback(){this._sync();}
  get multiple(){return this.hasAttribute("multiple");}
  set multiple(v){this.toggleAttribute("multiple",Boolean(v));}
  get value(){return this.values[0]??"";}
  set value(v){this.values=v==null||v===""?[]:[String(v)];}
  get values(){return accordionValues(this._items(),this.multiple);}
  set values(v){
    const allowed=new Set(Array.isArray(v)?v.filter(x=>typeof x==="string"):[String(v??"")]);
    let opened=false;
    for(const item of this._items()){
      const next=!item.disabled&&allowed.has(item.value)&&(this.multiple||!opened);
      item.open=next;
      if(next)opened=true;
    }
  }
  _items(){
    return [...this.children].filter(el=>el.localName==="cu-accordion-item");
  }
  _sync(){
    if(!this._itemsRoot)return;
    this._itemsRoot.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Accordion");
    if(!this.multiple){
      let opened=false;
      for(const item of this._items()){
        if(!item.open)continue;
        if(opened||item.disabled)item.open=false;
        else opened=true;
      }
    }
  }
}
define("cu-accordion",CuAccordion);
