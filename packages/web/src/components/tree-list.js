import { BrowserElement, mount, notify, define } from "./_shared.js";
import { virtualListRange } from "./virtual-list.js";
import "./icon.js";

/** Flatten only expanded branches. Keys must be stable and unique within a tree. */
export function flattenTreeList(items,expanded=new Set()){
  if(!Array.isArray(items))return [];
  const open=expanded instanceof Set?expanded:new Set(expanded??[]);
  const output=[];
  const visit=(nodes,level,parent,path)=>{
    const length=nodes.length;
    for(let index=0;index<length;index++){
      const item=nodes[index];
      if(!item||typeof item!=="object")continue;
      const value=String(item.value??item.id??path.concat(index).join("."));
      const children=Array.isArray(item.children)?item.children:[];
      const hasChildren=children.length>0;
      const isOpen=hasChildren&&open.has(value);
      output.push({value,label:String(item.label??item.name??value),
        level,parent,posinset:index+1,setsize:length,disabled:Boolean(item.disabled),
        hasChildren,expanded:isOpen,item});
      if(isOpen)visit(children,level+1,value,path.concat(index));
    }
  };
  visit(items,1,null,[]);
  return output;
}
export function initialTreeExpansion(items){
  const expanded=new Set();
  const visit=nodes=>{
    for(const item of Array.isArray(nodes)?nodes:[]){
      if(!item||typeof item!=="object")continue;
      if(item.expanded&&item.value!=null)expanded.add(String(item.value));
      visit(item.children);
    }
  };
  visit(items);
  return expanded;
}

const css=[
  ":host{display:block;box-sizing:border-box;height:340px;min-height:80px;min-width:0;",
  "font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".viewport{box-sizing:border-box;width:100%;height:100%;overflow:auto;outline:0;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);",
  "background:var(--cu-surface,#fff);overscroll-behavior:contain;}",
  ".viewport:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".item{box-sizing:border-box;display:flex;align-items:center;gap:6px;min-width:0;",
  "padding-inline-start:calc(8px + (var(--level) - 1)*18px);padding-inline-end:10px;",
  "border-radius:var(--cu-radius-md,6px);cursor:pointer;white-space:nowrap;overflow:hidden;}",
  ".item:hover:not([aria-disabled=true]){background:color-mix(in srgb,var(--cu-accent,#0067c0) 9%,var(--cu-surface,#fff));}",
  ".item[aria-selected=true]{background:color-mix(in srgb,var(--cu-accent,#0067c0) 15%,var(--cu-surface,#fff));",
  "color:var(--cu-accent,#0067c0);}",
  ".item[aria-disabled=true]{opacity:.46;cursor:not-allowed;}",
  ".name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}",
  ".toggle,.placeholder{display:grid;place-items:center;width:24px;height:24px;flex:none;}",
  ".toggle{border:0;background:transparent;color:inherit;border-radius:var(--cu-radius-sm,4px);cursor:pointer;}",
  ".toggle:hover{background:color-mix(in srgb,var(--cu-accent,#0067c0) 11%,transparent);}",
  ".toggle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:1px;}",
  ".empty{padding:12px;color:var(--cu-text-muted,#616161);}",
  ".empty[hidden]{display:none!important;}",
  "@media(forced-colors:active){.viewport{border-color:CanvasText;}",
  ".viewport:focus-visible,.toggle:focus-visible{outline-color:Highlight;}",
  ".item[aria-selected=true]{outline:1px solid Highlight;outline-offset:-1px;}}"
].join("");

let treeListId=0;
export class CuTreeList extends BrowserElement {
  static get observedAttributes(){return ["label","aria-label","item-height","overscan","empty-text"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="viewport" part="viewport" role="tree" tabindex="0" aria-label="Tree list">' +
      '<div class="top"></div><div class="items" part="items"></div>' +
      '<div class="bottom"></div><div class="empty" part="empty" hidden>No items</div></div>');
    this._viewport=root.querySelector(".viewport");
    this._itemsRoot=root.querySelector(".items");
    this._top=root.querySelector(".top");
    this._bottom=root.querySelector(".bottom");
    this._empty=root.querySelector(".empty");
    this._items=[];
    this._expanded=new Set();
    this._visible=[];
    this._selected="";
    this._active=0;
    this._lastRange=null;
    this._observer=null;
    this._prefix="cu-tree-list-"+(++treeListId);
    this._viewport.addEventListener("scroll",()=>this._render());
    this._itemsRoot.addEventListener("click",event=>{
      const element=event.target.closest('[role="treeitem"]');
      if(!element)return;
      const row=this._visible[Number(element.dataset.index)];
      if(!row||row.disabled)return;
      if(event.target.closest(".toggle"))this.toggle(row.value);
      else this.select(row.value);
      this._viewport.focus({preventScroll:true});
    });
    this._viewport.addEventListener("keydown",event=>this._key(event));
  }
  connectedCallback(){
    this._sync();this._render();
    if(globalThis.ResizeObserver){
      this._observer=new ResizeObserver(()=>this._render());
      this._observer.observe(this._viewport);
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(){this._sync();this._lastRange=null;this._render();}
  get items(){return this._items;}
  set items(value){
    if(value===this._items)return;
    this._items=Array.isArray(value)?value:[];
    this._expanded=initialTreeExpansion(this._items);
    this._refresh();
  }
  get itemHeight(){
    const n=Number(this.getAttribute("item-height"));
    return Number.isFinite(n)&&n>0?Math.max(24,Math.floor(n)):38;
  }
  set itemHeight(n){this.setAttribute("item-height",String(n));}
  get overscan(){
    const n=Number(this.getAttribute("overscan"));
    return this.hasAttribute("overscan")&&Number.isFinite(n)?Math.max(0,Math.min(50,Math.floor(n))):4;
  }
  set overscan(n){this.setAttribute("overscan",String(n));}
  get value(){return this._selected;}
  set value(v){
    this._selected=String(v??"");
    this._active=Math.max(0,this._visible.findIndex(row=>row.value===this._selected&&!row.disabled));
    this._lastRange=null;this._render();
  }
  get expandedValues(){return [...this._expanded];}
  set expandedValues(values){
    this._expanded=new Set((Array.isArray(values)?values:[]).map(String));
    this._refresh();
  }
  get visibleCount(){return this._visible.length;}
  expand(value){return this._setExpanded(String(value),true);}
  collapse(value){return this._setExpanded(String(value),false);}
  toggle(value){const key=String(value);return this._setExpanded(key,!this._expanded.has(key));}
  _setExpanded(key,expanded){
    const row=this._visible.find(item=>item.value===key);
    if(!row||!row.hasChildren||row.disabled||row.expanded===expanded)return false;
    if(expanded)this._expanded.add(key);
    else this._expanded.delete(key);
    this._refresh();
    notify(this,"cu-toggle",{value:key,expanded});
    return true;
  }
  select(value){
    const key=String(value);
    const index=this._visible.findIndex(item=>item.value===key&&!item.disabled);
    if(index<0)return false;
    this._active=index;
    if(this._selected===key){this.scrollToIndex(index);return false;}
    this._selected=key;
    this.scrollToIndex(index);
    notify(this,"cu-change",{value:key,item:this._visible[index].item,index});
    return true;
  }
  scrollToIndex(index){
    if(!Number.isInteger(index)||index<0||index>=this._visible.length)return false;
    const top=index*this.itemHeight,bottom=top+this.itemHeight;
    const current=this._viewport.scrollTop,view=this._viewport.clientHeight||340;
    if(top<current)this._viewport.scrollTop=top;
    else if(bottom>current+view)this._viewport.scrollTop=Math.max(0,bottom-view);
    this._lastRange=null;this._render();
    return true;
  }
  focus(options){this._viewport.focus(options);}
  _refresh(){
    this._visible=flattenTreeList(this._items,this._expanded);
    const i=this._visible.findIndex(row=>row.value===this._selected&&!row.disabled);
    if(i>=0)this._active=i;
    else if(this._active>=this._visible.length)this._active=Math.max(0,this._visible.length-1);
    if(this._visible[this._active]?.disabled){
      this._active=Math.max(0,this._visible.findIndex(row=>!row.disabled));
    }
    this._lastRange=null;
    this._render();
  }
  _key(event){
    if(!this._visible.length)return;
    const key=event.key;
    if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End","Enter"," "].includes(key))return;
    event.preventDefault();
    let current=this._visible[this._active];
    if(!current)return;
    if(key==="ArrowRight"){
      if(current.hasChildren&&!current.expanded)this.expand(current.value);
      else if(current.hasChildren){
        const next=this._visible[this._active+1];
        if(next&&next.parent===current.value&&!next.disabled)this.select(next.value);
      }
      return;
    }
    if(key==="ArrowLeft"){
      if(current.hasChildren&&current.expanded)this.collapse(current.value);
      else if(current.parent!=null)this.select(current.parent);
      return;
    }
    if(key==="Enter"||key===" "){this.select(current.value);return;}
    const forward=key==="ArrowDown"||key==="Home";
    let index=key==="Home"?0:key==="End"?this._visible.length-1:
      this._active+(key==="ArrowDown"?1:-1);
    const step=key==="Home"?1:key==="End"?-1:forward?1:-1;
    while(index>=0&&index<this._visible.length&&this._visible[index].disabled)index+=step;
    if(index>=0&&index<this._visible.length)this.select(this._visible[index].value);
  }
  _sync(){
    if(!this._viewport)return;
    this._viewport.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Tree list");
    this._empty.textContent=this.getAttribute("empty-text")||"No items";
  }
  _render(){
    if(!this._itemsRoot)return;
    const count=this._visible.length;
    const range=virtualListRange(this._viewport.scrollTop,
      this._viewport.clientHeight||340,count,this.itemHeight,this.overscan);
    const signature=[range.start,range.end,this.itemHeight,this._selected,
      [...this._expanded].join(","),count].join(":");
    if(signature===this._lastRange)return;
    this._lastRange=signature;
    this._top.style.height=range.top+"px";
    this._bottom.style.height=range.bottom+"px";
    const fragment=document.createDocumentFragment();
    for(let index=range.start;index<range.end;index++){
      const item=this._visible[index];
      const row=document.createElement("div");
      row.id=this._prefix+"-"+index;
      row.className="item";
      row.dataset.index=String(index);
      row.style.height=this.itemHeight+"px";
      row.style.setProperty("--level",String(item.level));
      row.setAttribute("role","treeitem");
      row.setAttribute("aria-level",String(item.level));
      row.setAttribute("aria-posinset",String(item.posinset));
      row.setAttribute("aria-setsize",String(item.setsize));
      row.setAttribute("aria-selected",String(item.value===this._selected));
      if(item.disabled)row.setAttribute("aria-disabled","true");
      if(item.hasChildren)row.setAttribute("aria-expanded",String(item.expanded));
      const toggle=document.createElement(item.hasChildren?"button":"span");
      toggle.className=item.hasChildren?"toggle":"placeholder";
      if(item.hasChildren){
        toggle.type="button";toggle.tabIndex=-1;
        toggle.setAttribute("aria-label",(item.expanded?"Collapse ":"Expand ")+item.label);
        const icon=document.createElement("cu-icon");
        icon.setAttribute("name",item.expanded?"chevron-down":"chevron-right");
        icon.setAttribute("size","15");
        icon.setAttribute("aria-hidden","true");
        toggle.append(icon);
      }
      const label=document.createElement("span");
      label.className="name";label.textContent=item.label;
      row.append(toggle,label);
      fragment.append(row);
    }
    this._itemsRoot.replaceChildren(fragment);
    const active=this._visible[this._active];
    if(active&&this._active>=range.start&&this._active<range.end)
      this._viewport.setAttribute("aria-activedescendant",this._prefix+"-"+this._active);
    else this._viewport.removeAttribute("aria-activedescendant");
    this._empty.hidden=count!==0;
  }
}
define("cu-tree-list",CuTreeList);
