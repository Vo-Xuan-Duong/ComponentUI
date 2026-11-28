import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./resizable-panel.js";

export function clampSplitPosition(position,min=10,max=90){
  const low=Number.isFinite(Number(min))?Math.max(0,Math.min(100,Number(min))):10;
  const high=Number.isFinite(Number(max))?Math.max(low,Math.min(100,Number(max))):90;
  const n=position==null||position===""?50:Number(position);
  return Math.max(low,Math.min(high,Number.isFinite(n)?n:50));
}
export function splitPositionFromPointer(x,y,rect,orientation="horizontal",min=10,max=90){
  const vertical=orientation==="vertical";
  const start=vertical?rect.top:rect.left;
  const length=vertical?rect.height:rect.width;
  if(!Number.isFinite(length)||length<=0)return clampSplitPosition(50,min,max);
  return clampSplitPosition(((vertical?y:x)-start)*100/length,min,max);
}

const css=[
  ":host{display:block;box-sizing:border-box;min-width:0;min-height:0;",
  "height:240px;color:var(--cu-text,#242424);",
  "--cu-split-position:50%;--cu-splitter-thickness:8px;--cu-splitter-half:4px;}",
  ":host([hidden]){display:none!important;}",
  ".layout{display:flex;align-items:stretch;width:100%;height:100%;min-width:0;min-height:0;}",
  ".handle{display:grid;place-items:center;flex:none;box-sizing:border-box;",
  "width:var(--cu-splitter-thickness);cursor:col-resize;touch-action:none;",
  "outline:0;position:relative;background:transparent;border:0;",
  "color:var(--cu-text-muted,#616161);}",
  ".handle:before{content:'';width:2px;height:34px;max-height:75%;",
  "background:var(--cu-border-strong,#c9c9c9);border-radius:999px;}",
  ".handle:hover:before,.handle:focus-visible:before,:host([dragging]) .handle:before{",
  "background:var(--cu-accent,#0067c0);width:3px;}",
  ".handle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-1px;",
  "border-radius:var(--cu-radius-sm,4px);}",
  ".layout ::slotted([slot=start]){box-sizing:border-box;flex:0 0 calc(var(--cu-split-position) - var(--cu-splitter-half));",
  "min-width:0;min-height:0;overflow:auto;}",
  ".layout ::slotted([slot=end]){box-sizing:border-box;flex:1 1 0;min-width:0;min-height:0;overflow:auto;}",
  ":host([orientation=vertical]) .layout{flex-direction:column;}",
  ":host([orientation=vertical]) .handle{height:var(--cu-splitter-thickness);width:100%;cursor:row-resize;}",
  ":host([orientation=vertical]) .handle:before{height:2px;width:34px;max-width:75%;}",
  ":host([orientation=vertical]) .handle:hover:before,",
  ":host([orientation=vertical]) .handle:focus-visible:before,",
  ":host([orientation=vertical][dragging]) .handle:before{height:3px;width:34px;}",
  ":host([disabled]) .handle{cursor:not-allowed;opacity:.4;}",
  ":host([disabled]) .handle:hover:before{background:var(--cu-border-strong,#c9c9c9);}",
  "@media(prefers-reduced-motion:reduce){.handle{transition:none;}}",
  "@media(forced-colors:active){.handle:before{background:CanvasText;}",
  ".handle:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuSplitter extends BrowserElement {
  static get observedAttributes(){
    return ["position","min","max","orientation","disabled","label","aria-label"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="layout" part="layout">' +
      '<slot name="start"></slot><div class="handle" part="handle" role="separator" ' +
      'tabindex="0" aria-orientation="vertical" aria-valuemin="10" aria-valuemax="90" ' +
      'aria-valuenow="50" aria-label="Resize panels"></div><slot name="end"></slot></div>');
    this._layout=root.querySelector(".layout");
    this._handle=root.querySelector(".handle");
    this._pointer=null;
    this._handle.addEventListener("pointerdown",event=>{
      if(this.disabled||this._pointer||event.button!==0||event.isPrimary===false)return;
      event.preventDefault();
      this._handle.focus({preventScroll:true});
      this._pointer={id:event.pointerId,initial:this.position,moved:false};
      this._handle.setPointerCapture(event.pointerId);
      this.setAttribute("dragging","");
    });
    this._handle.addEventListener("pointermove",event=>{
      if(!this._pointer||event.pointerId!==this._pointer.id)return;
      const r=this._layout.getBoundingClientRect();
      const x=this._rtl()?r.right-(event.clientX-r.left):event.clientX;
      const next=splitPositionFromPointer(x,event.clientY,r,
        this.orientation,this.min,this.max);
      if(this._updatePosition(next,"cu-input"))this._pointer.moved=true;
    });
    this._handle.addEventListener("pointerup",event=>{
      if(!this._pointer||event.pointerId!==this._pointer.id)return;
      const moved=this.position!==this._pointer.initial;
      this._finishDrag();
      if(moved)notify(this,"cu-change",{position:this.position});
    });
    this._handle.addEventListener("pointercancel",event=>{
      if(!this._pointer||event.pointerId!==this._pointer.id)return;
      this._cancelDrag();
    });
    this._handle.addEventListener("lostpointercapture",event=>{if(this._pointer?.id===event.pointerId)this._cancelDrag();});
    this._handle.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&this._pointer){event.preventDefault();event.stopPropagation();this._cancelDrag();return;}
      if(this.disabled)return;
      const vertical=this.orientation==="vertical";
      const forward=vertical?"ArrowDown":"ArrowRight";
      const backward=vertical?"ArrowUp":"ArrowLeft";
      if(![forward,backward,"Home","End"].includes(event.key))return;
      event.preventDefault();
      const step=event.shiftKey?10:5;
      const target=event.key==="Home"?this.min:event.key==="End"?this.max:
        this.position+(event.key===forward?step:-step)*(this._rtl()?-1:1);
      this._updatePosition(target,"cu-change");
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  disconnectedCallback(){this._finishDrag();}
  get orientation(){return this.getAttribute("orientation")==="vertical"?"vertical":"horizontal";}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get min(){const n=Number(this.getAttribute("min"));return this.hasAttribute("min")&&Number.isFinite(n)?Math.max(0,Math.min(100,n)):10;}
  set min(v){this.setAttribute("min",String(v));}
  get max(){const n=Number(this.getAttribute("max"));return this.hasAttribute("max")&&Number.isFinite(n)?Math.max(this.min,Math.min(100,n)):90;}
  set max(v){this.setAttribute("max",String(v));}
  get position(){return clampSplitPosition(this.getAttribute("position"),this.min,this.max);}
  set position(v){this.setAttribute("position",String(clampSplitPosition(v,this.min,this.max)));}
  _rtl(){return this.orientation==="horizontal"&&this.ownerDocument?.defaultView?.getComputedStyle(this).direction==="rtl";}
  _cancelDrag(){if(!this._pointer)return;const previous=this._pointer.initial;this._finishDrag();this._updatePosition(previous,"cu-input");}
  _finishDrag(){
    if(!this._pointer)return;
    const id=this._pointer.id;
    this._pointer=null;
    if(this._handle?.hasPointerCapture?.(id))this._handle.releasePointerCapture(id);
    this.removeAttribute("dragging");
  }
  _updatePosition(next,eventName){
    const clamped=clampSplitPosition(next,this.min,this.max);
    if(clamped===this.position)return false;
    this.position=clamped;
    notify(this,eventName,{position:clamped});
    return true;
  }
  _sync(){
    if(!this._handle)return;
    const value=this.position;
    this.style.setProperty("--cu-split-position",value+"%");
    this._handle.tabIndex=this.disabled?-1:0;
    this._handle.setAttribute("aria-disabled",String(this.disabled));
    this._handle.setAttribute("aria-orientation",this.orientation==="vertical"?"horizontal":"vertical");
    this._handle.setAttribute("aria-valuemin",String(this.min));
    this._handle.setAttribute("aria-valuemax",String(this.max));
    this._handle.setAttribute("aria-valuenow",String(value));
    this._handle.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Resize panels");
    if(this.disabled&&this._pointer)this._finishDrag();
  }
}
define("cu-splitter",CuSplitter);
