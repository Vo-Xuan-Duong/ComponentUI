import { BrowserElement, mount, notify, define } from "./_shared.js";
import { clampSplitPosition } from "./splitter.js";
import "./resizable-panel.js";
import "./icon.js";

const css=[
  ":host{display:block;box-sizing:border-box;height:320px;min-height:120px;min-width:0;",
  "color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".frame{display:flex;flex-direction:column;box-sizing:border-box;height:100%;min-height:0;min-width:0;}",
  ".toolbar{display:flex;align-items:center;gap:9px;min-height:38px;padding:0 8px;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);",
  "margin-bottom:6px;background:var(--cu-surface,#fff);}",
  ".toolbar[hidden]{display:none!important;}",
  ".toggle{display:inline-flex;align-items:center;justify-content:center;gap:6px;",
  "min-height:28px;padding:3px 8px;border:1px solid transparent;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:inherit;font:600 12px var(--cu-font-body,system-ui);cursor:pointer;}",
  ".toggle:hover{background:color-mix(in srgb,var(--cu-accent,#0067c0) 11%,transparent);}",
  ".toggle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "cu-splitter{height:auto;flex:1;min-height:0;--cu-splitter-thickness:8px;}",
  "cu-resizable-panel[slot=start],cu-resizable-panel[slot=end]{min-width:0;min-height:0;}",
  ":host([collapsed]) cu-splitter{--cu-splitter-thickness:0px;--cu-splitter-half:0px;}",
  ":host([collapsed]) cu-splitter::part(handle){display:none;}",
  ":host([collapsed]) cu-resizable-panel[slot=start]{visibility:hidden;pointer-events:none;}",
  "@media(forced-colors:active){.toolbar{border-color:CanvasText;}",
  ".toggle:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuSplitView extends BrowserElement {
  static get observedAttributes(){
    return ["position","min","max","orientation","collapsible","collapsed","disabled","label"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="frame" part="frame">' +
      '<div class="toolbar" part="toolbar" hidden><button class="toggle" part="toggle" ' +
      'type="button" aria-controls="cu-split-view-sidebar" aria-expanded="true">' +
      '<cu-icon name="panel-left" size="16" aria-hidden="true"></cu-icon>' +
      '<span class="toggle-label">Hide sidebar</span></button></div>' +
      '<cu-splitter part="splitter" position="32" min="15" max="85">' +
      '<cu-resizable-panel slot="start" id="cu-split-view-sidebar" label="Sidebar" variant="flat">' +
      '<slot name="sidebar"></slot></cu-resizable-panel>' +
      '<cu-resizable-panel slot="end" label="Content" variant="flat">' +
      '<slot name="content"></slot></cu-resizable-panel></cu-splitter></div>');
    this._splitter=root.querySelector("cu-splitter");
    this._sidebar=root.querySelector('cu-resizable-panel[slot="start"]');
    this._toolbar=root.querySelector(".toolbar");
    this._toggle=root.querySelector(".toggle");
    this._toggleLabel=root.querySelector(".toggle-label");
    this._expandedPosition=32;
    this._toggle.addEventListener("click",()=>this.toggle());
    for(const type of ["cu-input","cu-change"])
      this._splitter.addEventListener(type,event=>this._handleSplitEvent(event));
  }
  _handleSplitEvent(event){
    // Only handle Splitter events; nested slotted inputs may also emit cu-change.
    if(event.target!==this._splitter)return;
    event.stopPropagation();
    if(this.collapsed)return;
    const position=event.detail.position;
    if(this.getAttribute("position")!==String(position))
      this.setAttribute("position",String(position));
    notify(this,event.type,{position,collapsed:false});
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  _bounds(){
    return {
      min:this.hasAttribute("min")?Number(this.getAttribute("min")):15,
      max:this.hasAttribute("max")?Number(this.getAttribute("max")):85
    };
  }
  get position(){
    const {min,max}=this._bounds();
    const raw=this.getAttribute("position");
    return clampSplitPosition(raw===null||raw===""?32:raw,min,max);
  }
  set position(value){
    const {min,max}=this._bounds();
    this.setAttribute("position",String(clampSplitPosition(value,min,max)));
  }
  get collapsed(){return this.hasAttribute("collapsed");}
  set collapsed(value){this.toggleAttribute("collapsed",Boolean(value));}
  get collapsible(){return this.hasAttribute("collapsible");}
  set collapsible(value){this.toggleAttribute("collapsible",Boolean(value));}
  collapse(){
    if(this.collapsed)return false;
    this._expandedPosition=this.position;
    this.collapsed=true;
    notify(this,"cu-toggle",{collapsed:true,position:this.position});
    return true;
  }
  expand(){
    if(!this.collapsed)return false;
    this.collapsed=false;
    notify(this,"cu-toggle",{collapsed:false,position:this.position});
    return true;
  }
  toggle(){return this.collapsed?this.expand():this.collapse();}
  _sync(){
    if(!this._splitter)return;
    const collapsed=this.collapsed;
    const min=this.hasAttribute("min")?this.getAttribute("min"):"15";
    const max=this.hasAttribute("max")?this.getAttribute("max"):"85";
    this._splitter.min=collapsed?0:Number(min);
    this._splitter.max=Number(max);
    this._splitter.disabled=collapsed||this.hasAttribute("disabled");
    if(this.getAttribute("orientation")==="vertical")
      this._splitter.setAttribute("orientation","vertical");
    else this._splitter.removeAttribute("orientation");
    this._splitter.position=collapsed?0:this.position;
    this._sidebar.inert=collapsed;
    this._toolbar.hidden=!this.collapsible;
    this._toggle.setAttribute("aria-expanded",String(!collapsed));
    this._toggleLabel.textContent=collapsed?"Show sidebar":"Hide sidebar";
    this._toggle.disabled=this.hasAttribute("disabled");
    this._splitter.setAttribute("label",this.getAttribute("label")||"Split view");
  }
}
define("cu-split-view",CuSplitView);
