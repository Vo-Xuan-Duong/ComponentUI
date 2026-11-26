import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./avatar.js";
export function normalizeAvatarMembers(items){
  const ids=new Set(),out=[];
  for(const item of Array.isArray(items)?items:[]){
    if(!item||typeof item.name!=="string"||!item.name.trim())continue;
    const name=item.name.trim(),id=typeof item.id==="string"&&item.id.trim()?item.id.trim():undefined;
    if(id&&ids.has(id))continue;if(id)ids.add(id);
    const member={name};
    if(id)member.id=id;if(typeof item.src==="string"&&item.src.trim())member.src=item.src.trim();
    if(typeof item.alt==="string"&&item.alt.trim())member.alt=item.alt.trim();
    out.push(member);
  }return out;
}
const maxCount=value=>value==null||String(value).trim()===""?4:Number.isFinite(Number(value))?Math.max(0,Math.min(100,Math.floor(Number(value)))):4;
export function splitAvatarMembers(items,max=4){
  const members=Array.isArray(items)?items:[],limit=maxCount(max);
  return {visible:members.slice(0,limit),overflow:members.slice(limit)};
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);--cu-avatar-group-size:36px;--cu-avatar-overlap:10px;}",
  ":host([size=sm]){--cu-avatar-group-size:28px;--cu-avatar-overlap:8px;}:host([size=lg]){--cu-avatar-group-size:48px;--cu-avatar-overlap:12px;}:host([size=xl]){--cu-avatar-group-size:64px;--cu-avatar-overlap:15px;}",
  ".stack{display:flex;align-items:center;flex-wrap:wrap;min-width:0;row-gap:5px;padding-inline-end:2px;}.member{position:relative;display:flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:var(--cu-avatar-group-size);height:var(--cu-avatar-group-size);border-radius:50%;box-shadow:0 0 0 2px var(--cu-surface,#fff);}",
  ".member:not(:first-child){margin-inline-start:calc(-1 * var(--cu-avatar-overlap));}.member:hover{z-index:2;}:host([variant=spaced]) .member{margin-inline-start:0;}:host([variant=spaced]) .stack{gap:6px;}",
  ":host([shape=square]) .member{border-radius:var(--cu-radius-lg,8px);}",
  ".overflow{display:flex;align-items:center;justify-content:center;position:relative;z-index:3;min-width:var(--cu-avatar-group-size);height:var(--cu-avatar-group-size);box-sizing:border-box;border-radius:50%;border:1px solid var(--cu-border,#e5e5e5);box-shadow:0 0 0 2px var(--cu-surface,#fff);background:var(--cu-surface-alt,#fafafa);color:var(--cu-text,#242424);font:650 12px var(--cu-font-body,system-ui);cursor:pointer;padding:0 7px;}",
  ".overflow:hover,.overflow[aria-expanded=true]{background:var(--cu-state-hover);border-color:var(--cu-accent,#0067c0);}.overflow[hidden],.details[hidden]{display:none!important;}",
  ".details{margin-top:10px;border:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface,#fff);border-radius:var(--cu-radius-lg,8px);padding:5px;max-block-size:220px;overflow:auto;}.row{display:flex;align-items:center;gap:8px;padding:6px;}.name{min-width:0;overflow-wrap:anywhere;}.empty{color:var(--cu-text-muted,#616161);font-size:12px;}.empty[hidden]{display:none!important;}",
  "@media(forced-colors:active){.member,.overflow{box-shadow:none;outline:1px solid CanvasText;}}",focusStyle
].join("");
export class CuAvatarGroup extends BrowserElement{
  static get observedAttributes(){return ["max-visible","size","shape","expanded","label","aria-label"];}
  constructor(){
    super();this._items=[];
    const root=mount(this,css,'<div class="stack" part="stack" role="group"><button class="overflow" part="overflow" type="button" aria-controls="avatar-overflow" aria-expanded="false" hidden></button><span class="empty" hidden>No members</span></div><div class="details" part="details" id="avatar-overflow" role="list" aria-label="Additional members" hidden></div>');
    this._stack=root.querySelector(".stack");this._overflow=root.querySelector(".overflow");this._details=root.querySelector(".details");this._empty=root.querySelector(".empty");
    this._overflow.addEventListener("click",()=>{this.expanded=!this.expanded;notify(this,"cu-toggle",{expanded:this.expanded,count:splitAvatarMembers(this._items,this.maxVisible).overflow.length,total:this._items.length});});
    root.addEventListener("keydown",e=>{if(e.key==="Escape"&&this.expanded){e.preventDefault();e.stopPropagation();this.expanded=false;if(!this._overflow.hidden)this._overflow.focus();notify(this,"cu-toggle",{expanded:false,count:splitAvatarMembers(this._items,this.maxVisible).overflow.length,total:this._items.length});}});
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(item=>({...item}));}
  set items(value){this._items=normalizeAvatarMembers(value);this._render();}
  get maxVisible(){return maxCount(this.getAttribute("max-visible"));}
  set maxVisible(v){this.setAttribute("max-visible",String(maxCount(v)));}
  get expanded(){return this.hasAttribute("expanded")&&this._items.length>this.maxVisible;}
  set expanded(v){this.toggleAttribute("expanded",Boolean(v));}
  _avatar(item,size){
    const avatar=this.ownerDocument.createElement("cu-avatar");avatar.setAttribute("name",item.name);
    if(item.src)avatar.setAttribute("src",item.src);if(item.alt)avatar.setAttribute("alt",item.alt);
    if(size)avatar.setAttribute("size",size);
    if(this.getAttribute("shape")==="square")avatar.setAttribute("shape","square");return avatar;
  }
  _render(){
    if(!this._stack)return;
    const {visible,overflow}=splitAvatarMembers(this._items,this.maxVisible);
    const doc=this.ownerDocument,size=this.getAttribute("size")||"md";
    this._stack.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Team members");
    for(const node of this._stack.querySelectorAll(".member"))node.remove();
    for(const item of visible){const wrap=doc.createElement("span");wrap.className="member";wrap.title=item.name;wrap.append(this._avatar(item,size));this._stack.insertBefore(wrap,this._overflow);}
    this._empty.hidden=Boolean(this._items.length);
    this._overflow.hidden=!overflow.length;this._overflow.textContent="+"+overflow.length;
    this._overflow.setAttribute("aria-expanded",String(this.expanded));this._overflow.setAttribute("aria-label",(this.expanded?"Hide ":"Show ")+overflow.length+" additional members");
    this._details.hidden=!this.expanded;
    this._details.replaceChildren(...(this.expanded?overflow.map(item=>{
      const row=doc.createElement("div");row.className="row";row.setAttribute("role","listitem");
      const avatar=this._avatar(item,"sm");avatar.setAttribute("aria-hidden","true");
      const label=doc.createElement("span");label.className="name";label.textContent=item.name;row.append(avatar,label);return row;
    }):[]));
  }
}
define("cu-avatar-group",CuAvatarGroup);
