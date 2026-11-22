
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

export class CuTreeItem extends BrowserElement {
  static get observedAttributes(){return ["value","label","expanded","disabled"];}
}
define("cu-tree-item",CuTreeItem);

// Pure utility: create the visible, flattened tree from nested data definitions.
export function flattenVisibleTree(items, level=1, parent=null) {
  const visible=[];
  for (const item of items) {
    if(!item)continue;
    const children=Array.isArray(item.children)?item.children:[];
    const record={...item,level,parent,hasChildren:children.length>0};
    visible.push(record);
    if(children.length && item.expanded)
      visible.push(...flattenVisibleTree(children,level+1,record.value));
  }
  return visible;
}
const css=[
  ":host{display:block;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".tree{box-sizing:border-box;min-height:48px;max-height:360px;overflow:auto;padding:5px;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);",
  "background:var(--cu-surface,#fff);outline:0;}",
  ".tree:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".item{display:flex;align-items:center;gap:7px;min-height:35px;padding:5px 10px;",
  "padding-inline-start:calc(8px + (var(--level) - 1)*18px);",
  "box-sizing:border-box;border-radius:var(--cu-radius-md,6px);cursor:pointer;}",
  ".item:hover:not([aria-disabled=true]),.item[data-active=true]:not([aria-disabled=true]){",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 15%,var(--cu-surface,#fff));}",
  ".item[aria-selected=true]{font-weight:650;}",
  ".item[aria-disabled=true]{opacity:.42;cursor:not-allowed;}",
  ".toggle{flex:none;width:20px;height:24px;border:0;border-radius:4px;background:transparent;",
  "display:inline-grid;place-items:center;cursor:pointer;color:var(--cu-text-muted,#616161);}",
  ".toggle:hover{background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,transparent);}",
  ".toggle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);}",
  ".leaf{display:inline-block;width:20px;flex:none;}",
  "cu-icon{pointer-events:none;}",
  ".text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  "slot{display:none!important;}",
  "@media(forced-colors:active){.item[data-active=true]{outline:1px solid Highlight;}}"
].join("");
let treeCount=0;
export class CuTreeView extends BrowserElement {
  static get observedAttributes(){return ["label","value"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="tree" part="tree" role="tree" tabindex="0"></div><slot></slot>');
    this._tree=root.querySelector(".tree");
    this._tree.id="cu-tree-"+ ++treeCount;
    this._value="";
    this._active=0;
    this._visible=[];
    this._observer=null;
    this._tree.addEventListener("click",event=>{
      const toggle=event.target.closest(".toggle");
      const node=event.target.closest('[role="treeitem"]');
      if(!node)return;
      const index=Number(node.dataset.index);
      const item=this._visible[index];
      if(!item || item.disabled)return;
      this._active=index;
      if(toggle)this._toggle(item);
      else this._select(index);
      this._tree.focus();
    });
    this._tree.addEventListener("keydown",event=>this._key(event));
  }
  connectedCallback(){
    this._render();
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==="childList"||r.type==="characterData"||
          ["value","label","disabled","expanded"].includes(r.attributeName)))this._render();
      });
      this._observer.observe(this,{childList:true,subtree:true,characterData:true,attributes:true,
        attributeFilter:["value","label","disabled","expanded"]});
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(name){
    if(!this._tree)return;
    if(name==="value")this.value=this.getAttribute("value")??"";
    else this._render();
  }
  get value(){return this._value;}
  set value(next){
    this._value=String(next??"");
    const i=this._visible.findIndex(x=>x.value===this._value&&!x.disabled);
    if(i>=0)this._active=i;
    this._refresh(false);
  }
  focus(options){this._tree.focus(options);}
  _nodes(parent) {
    return [...parent.children].filter(x=>x.localName==="cu-tree-item");
  }
  _read(items,parentKey=""){
    return items.map((item,index)=>{
      const id=parentKey ? parentKey+"/"+index : String(index);
      return {
        value:item.getAttribute("value")??id,
        label:item.getAttribute("label")||"Item "+(index+1),
        expanded:item.hasAttribute("expanded"),disabled:item.hasAttribute("disabled"),
        element:item,children:this._read(this._nodes(item),id)
      };
    });
  }
  _render(){
    if(!this._tree)return;
    this._tree.setAttribute("aria-label",this.getAttribute("label")||"Tree view");
    const previous=this._visible[this._active]?.value;
    this._visible=flattenVisibleTree(this._read(this._nodes(this)));
    this._tree.replaceChildren();
    this._visible.forEach((item,index)=>{
      const row=document.createElement("div");row.className="item";
      row.setAttribute("role","treeitem");row.id=this._tree.id+"-item-"+index;
      row.dataset.index=String(index);row.style.setProperty("--level",String(item.level));
      row.setAttribute("aria-level",String(item.level));
      row.setAttribute("aria-disabled",String(item.disabled));
      if(item.hasChildren)row.setAttribute("aria-expanded",String(item.expanded));
      const siblings=this._visible.filter(x=>x.level===item.level&&x.parent===item.parent);
      row.setAttribute("aria-setsize",String(siblings.length));
      row.setAttribute("aria-posinset",String(siblings.findIndex(x=>x.element===item.element)+1));
      if(item.hasChildren){
        const b=document.createElement("button");b.type="button";b.className="toggle";
        b.tabIndex=-1;b.setAttribute("aria-label",(item.expanded?"Collapse ":"Expand ")+item.label);
        const icon=document.createElement("cu-icon");icon.name=item.expanded?"chevron-down":"chevron-right";
        icon.setAttribute("size","16");b.append(icon);row.append(b);
      }else{
        const space=document.createElement("span");space.className="leaf";row.append(space);
      }
      const label=document.createElement("span");label.className="text";
      label.textContent=item.label;row.append(label);
      this._tree.append(row);
    });
    const same=this._visible.findIndex(x=>x.value===previous&&!x.disabled);
    const selected=this._visible.findIndex(x=>x.value===this._value&&!x.disabled);
    this._active=selected>=0?selected:same>=0?same:
      this._visible.findIndex(x=>!x.disabled);
    this._refresh(false);
  }
  _refresh(scroll=true){
    if(!this._tree)return;
    const rows=[...this._tree.querySelectorAll('[role="treeitem"]')];
    rows.forEach((row,i)=>{
      row.dataset.active=String(i===this._active);
      row.setAttribute("aria-selected",String(this._value!==""&&this._visible[i].value===this._value));
    });
    const active=rows[this._active];
    if(active){
      this._tree.setAttribute("aria-activedescendant",active.id);
      if(scroll)active.scrollIntoView({block:"nearest"});
    }else this._tree.removeAttribute("aria-activedescendant");
  }
  _select(i){
    const item=this._visible[i];
    if(!item||item.disabled)return;
    const previous=this._value;
    this._active=i;this._value=item.value;this._refresh();
    if(previous!==this._value)notify(this,"cu-change",{value:this._value,label:item.label});
  }
  _toggle(item){
    if(!item.hasChildren||item.disabled)return;
    item.element.toggleAttribute("expanded",!item.expanded);
    this._render();
    notify(this,"cu-toggle",{value:item.value,expanded:item.element.hasAttribute("expanded")});
  }
  _key(event){
    const visible=this._visible;
    const enabled=visible.map((item,i)=>item.disabled?-1:i).filter(i=>i>=0);
    if(!enabled.length)return;
    const position=enabled.indexOf(this._active);
    const item=visible[this._active];
    let next=null;
    if(event.key==="ArrowDown")next=enabled[(position+1)%enabled.length];
    if(event.key==="ArrowUp")next=enabled[(position<=0?enabled.length:position)-1];
    if(event.key==="Home")next=enabled[0];
    if(event.key==="End")next=enabled[enabled.length-1];
    if(next!==null){
      event.preventDefault();this._active=next;this._refresh();return;
    }
    if(!item||item.disabled)return;
    if(event.key==="ArrowRight"){
      event.preventDefault();
      if(item.hasChildren&&!item.expanded)this._toggle(item);
      else if(item.hasChildren){
        const first=visible.findIndex((x,i)=>i>this._active&&x.parent===item.value&&!x.disabled);
        if(first>=0){this._active=first;this._refresh();}
      }
    }else if(event.key==="ArrowLeft"){
      event.preventDefault();
      if(item.hasChildren&&item.expanded)this._toggle(item);
      else if(item.parent!==null){
        const p=visible.findIndex(x=>x.value===item.parent);
        if(p>=0){this._active=p;this._refresh();}
      }
    }else if(event.key==="Enter"||event.key===" "){
      event.preventDefault();this._select(this._active);
    }
  }
}
define("cu-tree-view",CuTreeView);
