import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const regions=["start","end","bottom"];
const clamp=(value,fallback,min,max)=>typeof value==="number"&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function normalizeDockLayout(value={}){
  value=value&&typeof value==="object"?value:{};
  return {start:clamp(value.start,24,10,40),end:clamp(value.end,24,10,40),bottom:clamp(value.bottom,28,10,70),
    startOpen:value.startOpen!==false,endOpen:value.endOpen!==false,bottomOpen:value.bottomOpen!==false};
}
const css=[
  ":host([hidden]){display:none!important;}:host{display:block;min-width:0;min-height:120px;height:360px;box-sizing:border-box;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{height:100%;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,var(--dock-start,0%)) var(--dock-start-handle,0px) minmax(0,1fr) var(--dock-end-handle,0px) minmax(0,var(--dock-end,0%));grid-template-rows:minmax(0,1fr) var(--dock-bottom-handle,0px) minmax(0,var(--dock-bottom,0%));border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-canvas,#f3f3f3);overflow:hidden;}",
  ".panel{min-width:0;min-height:0;overflow:auto;background:var(--cu-surface,#fff);}.panel[hidden],.handle[hidden]{display:none!important;}.start{grid-area:1/1/2/2;}.center{grid-area:1/3/2/4;}.end{grid-area:1/5/2/6;}.bottom{grid-area:3/1/4/6;}",
  ".handle{display:grid;place-items:center;min-width:0;min-height:0;touch-action:none;cursor:col-resize;background:transparent;}.handle[data-region=start]{grid-area:1/2/2/3;}.handle[data-region=end]{grid-area:1/4/2/5;}.handle[data-region=bottom]{grid-area:2/1/3/6;cursor:row-resize;}.handle:before{content:'';width:2px;height:30px;max-height:70%;border-radius:8px;background:var(--cu-border-strong,#d1d1d1);}.handle[data-region=bottom]:before{width:30px;height:2px;}.handle:hover:before,.handle:focus-visible:before,.handle[data-dragging=true]:before{background:var(--cu-accent,#0067c0);}.handle:focus-visible{outline-offset:-2px;}.handle[aria-disabled=true]{cursor:default;opacity:.5;}",
  "@media(forced-colors:active){.frame{border-color:CanvasText;}.handle:before{background:CanvasText;}}",focusStyle
].join("");
export class CuDockLayout extends BrowserElement{
  static get observedAttributes(){return ["disabled","label","aria-label"];}
  constructor(){
    super();this._layout=normalizeDockLayout();
    const root=mount(this,css,'<section class="frame" part="frame" role="region"><div class="panel start" id="dock-start" part="start" hidden><slot name="start"></slot></div><div class="handle" data-region="start" role="separator" tabindex="0" aria-controls="dock-start" hidden></div><div class="panel center" part="center"><slot></slot></div><div class="handle" data-region="end" role="separator" tabindex="0" aria-controls="dock-end" hidden></div><div class="panel end" id="dock-end" part="end" hidden><slot name="end"></slot></div><div class="handle" data-region="bottom" role="separator" tabindex="0" aria-controls="dock-bottom" hidden></div><div class="panel bottom" id="dock-bottom" part="bottom" hidden><slot name="bottom"></slot></div></section>');
    this._frame=root.querySelector(".frame");
    this._panels=Object.fromEntries(regions.map(r=>[r,root.querySelector("."+r)]));
    this._handles=Object.fromEntries(regions.map(r=>[r,root.querySelector('[data-region="'+r+'"]')]));
    for(const region of regions){
      this._panels[region].querySelector("slot").addEventListener("slotchange",()=>{if(this._drag?.region===region&&!this._hasSlot(region))this._finish(false);this._sync();});
      const h=this._handles[region];
      h.addEventListener("keydown",e=>this._key(region,e));
      h.addEventListener("pointerdown",e=>this._begin(region,e));
      h.addEventListener("pointermove",e=>this._move(e));
      h.addEventListener("pointerup",e=>{if(this._drag?.id===e.pointerId)this._finish(true);});
      h.addEventListener("pointercancel",e=>{if(this._drag?.id===e.pointerId)this._finish(false);});
      h.addEventListener("lostpointercapture",e=>{if(this._drag?.id===e.pointerId)this._finish(false);});
    }
  }
  connectedCallback(){this._sync();}
  disconnectedCallback(){this._finish(false);}
  attributeChangedCallback(){if(this.disabled)this._finish(false);this._sync();}
  get layout(){return {...this._layout};}
  set layout(v){this._finish(false);this._layout=normalizeDockLayout(v);this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  toggleRegion(region){
    if(this.disabled||!regions.includes(region)||!this._hasSlot(region))return false;
    this._finish(false);const key=region+"Open";this._layout={...this._layout,[key]:!this._layout[key]};this._sync();
    notify(this,"cu-change",{region,layout:this.layout});return true;
  }
  resizeRegion(region,size){
    if(this.disabled||!regions.includes(region)||!this._visible(region))return false;
    this._finish(false);if(!this._resize(region,size))return false;
    notify(this,"cu-resize",{region,layout:this.layout});return true;
  }
  _hasSlot(region){return Boolean(this._panels[region]?.querySelector("slot").assignedNodes().some(n=>n.nodeType===1||(n.nodeType===3&&n.textContent.trim())));}
  _visible(region){return this._layout[region+"Open"]&&this._hasSlot(region);}
  _resize(region,size){const next=normalizeDockLayout({...this._layout,[region]:size});if(next[region]===this._layout[region])return false;this._layout=next;this._sync();return true;}
  _rtl(){return this.ownerDocument.defaultView?.getComputedStyle(this).direction==="rtl";}
  _key(region,e){
    if(e.key==="Escape"&&this._drag?.region===region){e.preventDefault();e.stopPropagation();this._finish(false);return;}
    if(this.disabled||!this._visible(region))return;
    const vertical=region==="bottom",forward=vertical?"ArrowDown":"ArrowRight",back=vertical?"ArrowUp":"ArrowLeft";
    if(![forward,back,"Home","End"].includes(e.key))return;e.preventDefault();
    const sign=vertical?-1:(region==="start"?1:-1)*(this._rtl()?-1:1);
    const size=e.key==="Home"?10:e.key==="End"?(vertical?70:40):this._layout[region]+(e.key===forward?1:-1)*sign*(e.shiftKey?10:2);
    this.resizeRegion(region,size);
  }
  _begin(region,e){
    if(this.disabled||this._drag||e.button!==0||e.isPrimary===false||!this._visible(region))return;
    const rect=this._frame.getBoundingClientRect(),vertical=region==="bottom",length=vertical?rect.height:rect.width;if(length<=0)return;
    const h=this._handles[region];e.preventDefault();h.focus({preventScroll:true});h.setPointerCapture(e.pointerId);
    this._drag={region,id:e.pointerId,start:vertical?e.clientY:e.clientX,length,initial:this.layout,sign:vertical?-1:(region==="start"?1:-1)*(this._rtl()?-1:1)};
    h.dataset.dragging="true";
  }
  _move(e){
    const d=this._drag;if(!d||e.pointerId!==d.id)return;
    const coordinate=d.region==="bottom"?e.clientY:e.clientX;
    if(this._resize(d.region,d.initial[d.region]+(coordinate-d.start)*100/d.length*d.sign))notify(this,"cu-input",{region:d.region,layout:this.layout});
  }
  _finish(commit){
    const d=this._drag;if(!d)return;
    this._drag=null;const h=this._handles[d.region];delete h.dataset.dragging;
    if(h.hasPointerCapture(d.id))h.releasePointerCapture(d.id);
    if(!commit){const changed=this._layout[d.region]!==d.initial[d.region];this._layout=d.initial;this._sync();if(changed&&this.isConnected)notify(this,"cu-input",{region:d.region,layout:this.layout});}
    else if(this._layout[d.region]!==d.initial[d.region])notify(this,"cu-resize",{region:d.region,layout:this.layout});
  }
  _sync(){
    if(!this._frame)return;
    this._frame.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Workspace layout");
    for(const r of regions){
      const visible=this._visible(r),panel=this._panels[r],h=this._handles[r];
      panel.hidden=!visible;panel.inert=!visible;h.hidden=!visible;h.tabIndex=visible&&!this.disabled?0:-1;
      h.setAttribute("aria-disabled",String(this.disabled));h.setAttribute("aria-orientation",r==="bottom"?"horizontal":"vertical");
      h.setAttribute("aria-label","Resize "+r+" panel");h.setAttribute("aria-valuemin","10");h.setAttribute("aria-valuemax",r==="bottom"?"70":"40");h.setAttribute("aria-valuenow",String(Math.round(this._layout[r])));
      this._frame.style.setProperty("--dock-"+r,visible?this._layout[r]+"%":"0%");this._frame.style.setProperty("--dock-"+r+"-handle",visible?"8px":"0px");
    }
  }
}
define("cu-dock-layout",CuDockLayout);
