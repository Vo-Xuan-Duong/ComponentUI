import {BrowserElement,mount,define,focusStyle} from "./_shared.js";
import "./icon.js";
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{box-sizing:border-box;display:grid;justify-items:center;align-content:center;gap:9px;padding:clamp(20px,5vw,40px) 16px;min-height:180px;text-align:center;}",
  ":host([variant=outlined]) .frame{border:1px dashed var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);}",
  ":host([size=sm]) .frame{min-height:110px;padding:16px 12px;gap:6px;}",
  ":host([align=start]) .frame{justify-items:start;text-align:start;}",
  ".visual{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--cu-radius-xl,12px);background:var(--cu-state-hover);color:var(--cu-accent,#0067c0);margin-bottom:4px;}",
  ":host([size=sm]) .visual{width:40px;height:40px;}h3{margin:0;font-size:16px;font-weight:650;line-height:1.4;overflow-wrap:anywhere;}",
  ".description{max-width:42ch;margin:0;color:var(--cu-text-muted,#616161);line-height:1.55;overflow-wrap:anywhere;}.description:empty{display:none;}",
  ".actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:5px;}:host([align=start]) .actions{justify-content:start;}.actions[hidden],.visual[hidden]{display:none!important;}",
  focusStyle
].join("");
export class CuEmptyState extends BrowserElement{
  static get observedAttributes(){return ["title","description","icon","no-icon"];}
  constructor(){
    super();const root=mount(this,css,'<div class="frame" part="frame"><div class="visual" part="visual"><slot name="illustration"><cu-icon size="28" name="folder-open"></cu-icon></slot></div><h3 part="title"><slot name="title"><span class="title"></span></slot></h3><div class="description" part="description"><slot><span class="copy"></span></slot></div><div class="actions" part="actions" hidden><slot name="actions"></slot></div></div>');
    for(const [k,q] of Object.entries({visual:".visual",icon:"cu-icon",title:".title",copy:".copy",actions:".actions",actionSlot:'slot[name="actions"]',illustration:'slot[name="illustration"]'}))this["_"+k]=root.querySelector(q);
    this._actionSlot.addEventListener("slotchange",()=>this._sync());this._illustration.addEventListener("slotchange",()=>this._sync());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  _sync(){if(!this._title)return;this._title.textContent=this.getAttribute("title")||"Nothing here yet";this._copy.textContent=this.getAttribute("description")||"";this._icon.setAttribute("name",this.getAttribute("icon")||"folder-open");this._visual.hidden=this.hasAttribute("no-icon")&&!this._illustration.assignedElements().length;this._actions.hidden=!this._actionSlot.assignedElements({flatten:true}).length;}
}
define("cu-empty-state",CuEmptyState);
