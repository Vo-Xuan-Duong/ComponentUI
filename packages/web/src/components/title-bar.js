import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
import "./window-controls.js";

const interactive="button,a,input,select,textarea,summary,[contenteditable]:not([contenteditable=false]),[role=button],[role=link],[tabindex],[data-cu-no-drag],cu-window-controls,cu-button,cu-icon-button,cu-select,cu-text-field,cu-search-box,cu-menu,cu-checkbox,cu-switch,cu-combobox";
export function isTitleBarDragTarget(path,region){
  if(!Array.isArray(path)||!path.includes(region))return false;
  for(const node of path){if(node===region)return true;if(node?.matches?.(interactive))return false;}
  return false;
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".bar{display:flex;align-items:stretch;min-width:0;min-height:var(--cu-titlebar-height,36px);background:var(--cu-surface-alt,#fafafa);border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  ":host([inactive]) .bar{color:var(--cu-text-muted,#616161);}.drag{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding-inline-start:12px;user-select:none;}",
  ".brand{display:flex;align-items:center;gap:8px;min-width:0;flex:0 1 auto;}.brand cu-icon{flex:none;}.brand cu-icon[hidden]{display:none!important;}.title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}.subtitle{font-size:12px;color:var(--cu-text-muted,#616161);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.subtitle:empty{display:none;}",
  ".center{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;}.leading,.trailing,.controls{display:flex;align-items:center;gap:4px;min-width:0;flex:none;}.controls{align-items:stretch;}.controls[hidden]{display:none!important;}",
  ":host([native-drag]) .drag{-webkit-app-region:drag;app-region:drag;}:host([native-drag]) .leading,:host([native-drag]) .trailing,:host([native-drag]) .controls{-webkit-app-region:no-drag;app-region:no-drag;}:host([native-drag]) ::slotted(*){-webkit-app-region:no-drag;app-region:no-drag;}",
  ":host([size=sm]){--cu-titlebar-height:32px;--cu-window-control-width:38px;}",focusStyle
].join("");
export class CuTitleBar extends BrowserElement{
  static get observedAttributes(){return ["title","subtitle","icon","maximized","no-controls","no-maximize","no-minimize","no-close","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,'<header class="bar" part="bar"><div class="drag" part="drag"><div class="leading"><slot name="leading"></slot></div><div class="brand"><cu-icon size="17" hidden></cu-icon><div class="title" part="title"><slot name="title"><span class="title-text"></span></slot></div><span class="subtitle"></span></div><div class="center"><slot name="center"></slot></div></div><div class="trailing"><slot name="actions"></slot></div><div class="controls"><slot name="controls"><cu-window-controls></cu-window-controls></slot></div></header>');
    for(const [k,q] of Object.entries({bar:".bar",drag:".drag",title:".title-text",subtitle:".subtitle",icon:".brand cu-icon",controls:".controls",defaults:"cu-window-controls"}))this["_"+k]=root.querySelector(q);
    this._drag.addEventListener("pointerdown",event=>{
      if(!this.draggableRegion||this.hasAttribute("native-drag")||event.button!==0||event.isPrimary===false||!isTitleBarDragTarget(event.composedPath(),this._drag))return;
      notify(this,"cu-window-drag",{pointerEvent:event});
    });
    this._drag.addEventListener("dblclick",event=>{
      if(!this.draggableRegion||this.hasAttribute("native-drag")||this.hasAttribute("no-maximize")||!isTitleBarDragTarget(event.composedPath(),this._drag))return;
      notify(this,"cu-window-action",{action:this.maximized?"restore":"maximize",maximized:this.maximized});
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get maximized(){return this.hasAttribute("maximized");}set maximized(v){this.toggleAttribute("maximized",Boolean(v));}
  get draggableRegion(){return this.hasAttribute("draggable-region");}set draggableRegion(v){this.toggleAttribute("draggable-region",Boolean(v));}
  _sync(){
    if(!this._bar)return;
    this._title.textContent=this.getAttribute("title")||"Application";
    this._subtitle.textContent=this.getAttribute("subtitle")||"";
    const name=this.getAttribute("icon");this._icon.hidden=!name;if(name)this._icon.setAttribute("name",name);
    this._bar.setAttribute("aria-label",this.getAttribute("aria-label")||this._title.textContent);
    this._controls.hidden=this.hasAttribute("no-controls");
    this._defaults.maximized=this.maximized;this._defaults.minimizable=!this.hasAttribute("no-minimize");this._defaults.maximizable=!this.hasAttribute("no-maximize");this._defaults.closable=!this.hasAttribute("no-close");
  }
}
define("cu-title-bar",CuTitleBar);
