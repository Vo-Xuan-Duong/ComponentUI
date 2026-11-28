import { BrowserElement, mount, notify, define, frameTask, reconcileVirtualWindow, reconcileElementChildren } from "./_shared.js";

export function virtualListRange(scrollTop,viewportHeight,count,itemHeight=40,overscan=4){
  const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
  const total=Math.max(0,Math.floor(finite(count)));
  const height=Math.max(1,Math.floor(finite(itemHeight,40)||40));
  const viewport=Math.max(0,finite(viewportHeight));
  const extra=Math.max(0,Math.min(50,Math.floor(finite(overscan))));
  const offset=Math.min(Math.max(0,total*height-viewport),Math.max(0,finite(scrollTop)));
  const start=Math.min(total,Math.max(0,Math.floor(offset/height)-extra));
  const end=Math.min(total,Math.ceil((offset+viewport)/height)+extra);
  return {start,end,top:start*height,bottom:(total-end)*height,totalHeight:total*height};
}
export function virtualListLabel(item,index,labelKey="label"){
  if(item===null||item===undefined)return "Item "+(index+1);
  if(typeof item==="string"||typeof item==="number")return String(item);
  if(typeof item==="object"){
    const value=item[labelKey]??item.label??item.name??item.id;
    if(value!==undefined&&value!==null)return String(value);
  }
  return "Item "+(index+1);
}

const css=[
  ":host{display:block;box-sizing:border-box;height:320px;min-height:60px;",
  "min-width:0;max-width:100%;font:13px var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".viewport{box-sizing:border-box;height:100%;width:100%;overflow:auto;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-surface,#fff);outline:0;overscroll-behavior:contain;}",
  ".viewport:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".item{box-sizing:border-box;display:flex;align-items:center;min-width:0;",
  "padding:0 12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
  "border-bottom:1px solid var(--cu-border,#e5e5e5);cursor:pointer;}",
  ".item:hover:not([aria-disabled=true]){background:var(--cu-state-hover);}",
  ".item[aria-selected=true]{color:var(--cu-accent,#0067c0);",
  "background:var(--cu-state-selected);}",
  ".item[aria-disabled=true]{opacity:.45;cursor:not-allowed;}",
  ".empty{padding:18px 14px;color:var(--cu-text-muted,#616161);}",
  ".empty[hidden]{display:none!important;}",
  "@media(forced-colors:active){.viewport{border-color:CanvasText;}",
  ".viewport:focus-visible{outline-color:Highlight;}",
  ".item[aria-selected=true]{outline:1px solid Highlight;outline-offset:-1px;}}"
].join("");

let virtualListId=0;
export class CuVirtualList extends BrowserElement {
  static get observedAttributes(){
    return ["item-height","overscan","label-key","label","aria-label","empty-text"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="viewport" part="viewport" role="listbox" tabindex="0" ' +
      'aria-label="Virtual list"><div class="top"></div>' +
      '<div class="items" part="items"></div><div class="bottom"></div>' +
      '<div class="empty" part="empty" hidden>No items</div></div>');
    this._viewport=root.querySelector(".viewport");
    this._itemsRoot=root.querySelector(".items");
    this._top=root.querySelector(".top");
    this._bottom=root.querySelector(".bottom");
    this._empty=root.querySelector(".empty");
    this._items=[];
    this._selected=-1;
    this._lastRange=null;
    this._observer=null;
    this._idBase="cu-virtual-"+(++virtualListId);
    this._frame=frameTask(this,()=>this._render());
    this._viewport.addEventListener("scroll",()=>this._frame.request(),{passive:true});
    this._itemsRoot.addEventListener("click",event=>{
      const option=event.target.closest('[role="option"]');
      if(!option)return;
      const index=Number(option.dataset.index);
      if(this._items[index]?.disabled)return;
      this.select(index);
      this._viewport.focus({preventScroll:true});
    });
    this._viewport.addEventListener("keydown",event=>{
      const len=this._items.length;
      if(!len)return;
      const key=event.key;
      const step=Math.max(1,Math.floor((this._viewport.clientHeight||320)/this.itemHeight));
      const moves={ArrowDown:1,ArrowUp:-1,PageDown:step,PageUp:-step};
      if(!Object.hasOwn(moves,key)&&!["Home","End","Enter"," "].includes(key))return;
      event.preventDefault();
      if(key==="Enter"||key===" "){if(this._selected>=0)this.select(this._selected,{emit:true,force:true});return;}
      const baseline=this._selected<0?
        (moves[key]>0?-1:len):this._selected;
      let candidate=key==="Home"?0:key==="End"?len-1:
        Math.max(0,Math.min(len-1,baseline+moves[key]));
      const direction=key==="End"||key==="ArrowUp"||key==="PageUp"?-1:1;
      if(this._items[candidate]?.disabled){
        while(candidate>=0&&candidate<len&&this._items[candidate]?.disabled)candidate+=direction;
        if(candidate<0||candidate>=len)return;
      }
      this.select(candidate);
    });
  }
  connectedCallback(){
    this._sync();this._render();
    const Observer=this.ownerDocument?.defaultView?.ResizeObserver??globalThis.ResizeObserver;
    this._observer?.disconnect();
    if(Observer){
      this._observer=new Observer(()=>this._frame.request());
      this._observer.observe(this._viewport);
    }
  }
  disconnectedCallback(){this._frame.cancel();this._observer?.disconnect();this._observer=null;this._window=null;this._lastRange=null;}
  attributeChangedCallback(){this._sync();this._lastRange=null;this._render();}
  get items(){return this._items;}
  set items(value){
    if(value===this._items)return;
    this._items=Array.isArray(value)?value:[];this._window=null;
    if(this._selected>=this._items.length||this._items[this._selected]?.disabled)this._selected=-1;
    this._viewport.scrollTop=0;this._lastRange=null;this._render();
  }
  get itemHeight(){const n=Number(this.getAttribute("item-height"));return n>0&&Number.isFinite(n)?Math.max(16,Math.floor(n)):40;}
  set itemHeight(v){this.setAttribute("item-height",String(v));}
  get overscan(){const n=Number(this.getAttribute("overscan"));return this.hasAttribute("overscan")&&Number.isFinite(n)?Math.max(0,Math.min(50,Math.floor(n))):4;}
  set overscan(v){this.setAttribute("overscan",String(v));}
  get labelKey(){return this.getAttribute("label-key")||"label";}
  set labelKey(v){this.setAttribute("label-key",String(v??"label"));}
  get selectedIndex(){return this._selected;}
  set selectedIndex(value){
    const index=Number(value);
    this._selected=Number.isInteger(index)&&index>=0&&index<this._items.length&&!this._items[index]?.disabled?index:-1;
    if(this._selected>=0)this.scrollToIndex(this._selected);
    else this._render();
  }
  scrollToIndex(index,align="auto"){
    const i=Math.floor(Number(index));
    if(!Number.isFinite(i)||i<0||i>=this._items.length)return false;
    const top=i*this.itemHeight;
    const bottom=top+this.itemHeight;
    const viewHeight=this._viewport.clientHeight||320;
    const current=this._viewport.scrollTop;
    if(align==="start"||top<current)this._viewport.scrollTop=top;
    else if(align==="end"||bottom>current+viewHeight)
      this._viewport.scrollTop=Math.max(0,bottom-viewHeight);
    this._render();
    return true;
  }
  select(index,{emit=true,force=false}={}){
    const next=Number(index);
    if(!Number.isInteger(next)||next<0||next>=this._items.length||
      this._items[next]?.disabled)return false;
    if(next===this._selected&&!force)return false;
    const previousIndex=this._selected;
    this._selected=next;
    this.scrollToIndex(next);
    if(emit)notify(this,"cu-change",{
      index:next,previousIndex,item:this._items[next],
      value:virtualListLabel(this._items[next],next,this.labelKey)
    });
    return true;
  }
  focus(options){this._viewport.focus(options);}
  _sync(){
    if(!this._viewport)return;
    this._viewport.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Virtual list");
    this._empty.textContent=this.getAttribute("empty-text")||"No items";
  }
  _render(){
    if(!this._itemsRoot)return;
    const len=this._items.length;
    const range=virtualListRange(this._viewport.scrollTop,this._viewport.clientHeight||320,
      len,this.itemHeight,this.overscan);
    const signature=[range.start,range.end,this.itemHeight,this.labelKey,this._selected,len].join(":");
    if(signature===this._lastRange)return;
    this._lastRange=signature;
    this._top.style.height=range.top+"px";
    this._bottom.style.height=range.bottom+"px";
    const doc=this.ownerDocument??globalThis.document;
    const revision=[this.itemHeight,this.labelKey,len].join(":");
    this._window=reconcileVirtualWindow(this._window,range.start,range.end,revision,i=>{
      const item=this._items[i];
      const option=doc.createElement("div");
      option.className="item";
      option.dataset.index=String(i);
      option.id=this._idBase+"-"+i;
      option.setAttribute("role","option");
      option.setAttribute("aria-posinset",String(i+1));
      option.setAttribute("aria-setsize",String(len));
      if(item?.disabled)option.setAttribute("aria-disabled","true");
      option.style.height=this.itemHeight+"px";
      option.textContent=virtualListLabel(item,i,this.labelKey);
      return option;
    });
    for(const [i,option] of this._window.nodes){const selected=String(i===this._selected);if(option.getAttribute("aria-selected")!==selected)option.setAttribute("aria-selected",selected);}
    reconcileElementChildren(this._itemsRoot,[...this._window.nodes.values()]);
    if(this._selected>=range.start&&this._selected<range.end)
      this._viewport.setAttribute("aria-activedescendant",this._idBase+"-"+this._selected);
    else this._viewport.removeAttribute("aria-activedescendant");
    this._empty.hidden=len!==0;
  }
}
define("cu-virtual-list",CuVirtualList);
