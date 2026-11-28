
import { BrowserElement, mount, define, focusStyle } from "./_shared.js";
import {openOverlayTopLayer,closeOverlayTopLayer,watchOverlayViewport} from "./_overlay.js";

const css = [
  ":host{display:inline-flex;position:relative;vertical-align:middle;max-width:100%;}",
  ":host([hidden]){display:none!important;}",
  ".tip{position:absolute;z-index:40;bottom:calc(100% + 9px);left:50%;transform:translateX(-50%);",
  "visibility:hidden;opacity:0;pointer-events:none;white-space:normal;",
  "width:max-content;min-width:0;max-width:min(250px,80vw);overflow-wrap:anywhere;box-sizing:border-box;",
  "padding:7px 10px;border-radius:var(--cu-radius-sm,4px);",
  "border:1px solid var(--cu-border-strong,#d1d1d1);background:var(--cu-surface-elevated,#fff);",
  "color:var(--cu-text,#242424);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));",
  "font:400 12px/1.4 var(--cu-font-body,system-ui);transition:opacity var(--cu-motion-fast,100ms);}",
  ".tip[data-visible=true]{visibility:visible;opacity:1;}.tip[data-cu-top-layer=true]{transform:none;position:fixed;margin:0;inset:auto;}",
  ":host([placement=bottom]) .tip{bottom:auto;top:calc(100% + 9px);}",
  ":host([placement=left]) .tip{bottom:auto;top:50%;left:auto;right:calc(100% + 9px);transform:translateY(-50%);}",
  ":host([placement=right]) .tip{bottom:auto;top:50%;left:calc(100% + 9px);transform:translateY(-50%);}",
  ".tip[hidden]{display:none!important;}",
  focusStyle
].join("");

export class CuTooltip extends BrowserElement {
  static get observedAttributes() { return ["text","placement"]; }
  constructor() {
    super();
    const root = mount(this,css,
      '<slot name="anchor"></slot><span class="tip" part="tooltip" role="tooltip" hidden></span>');
    this._slot = root.querySelector("slot");
    this._tip = root.querySelector(".tip");
    this._slot.addEventListener("slotchange", () => this._sync());
  }
  connectedCallback() {
    this._hovered=false;this._focused=this.matches(":focus-within");this._dismissed=false;
    this._onEnter=()=>{this._hovered=true;this._dismissed=false;this._updateVisibility();};
    this._onLeave=()=>{this._hovered=false;this._updateVisibility();};
    this._onFocus=()=>{this._focused=true;this._dismissed=false;this._updateVisibility();};
    this._onBlur=event=>{if(!event.relatedTarget||(!this.contains(event.relatedTarget)&&!this.shadowRoot.contains(event.relatedTarget))){this._focused=false;this._updateVisibility();}};
    this._onEscape=event=>{if(event.key==="Escape"&&this._tip.dataset.visible==="true"){this._dismissed=true;this._updateVisibility();}};
    this.addEventListener("pointerenter",this._onEnter);
    this.addEventListener("pointerleave",this._onLeave);
    this.addEventListener("focusin",this._onFocus);
    this.addEventListener("focusout",this._onBlur);
    this.ownerDocument.addEventListener("keydown",this._onEscape);
    this._stopViewport=watchOverlayViewport(this,()=>this._placeTip());
    this._sync();
  }
  disconnectedCallback(){
    this.removeEventListener("pointerenter",this._onEnter);
    this.removeEventListener("pointerleave",this._onLeave);
    this.removeEventListener("focusin",this._onFocus);
    this.removeEventListener("focusout",this._onBlur);
    this.ownerDocument.removeEventListener("keydown",this._onEscape);
    this._stopViewport?.();this._stopViewport=null;
    closeOverlayTopLayer(this._tip);this._tip.style.transform="";this._tip.style.maxWidth="";this._tip.dataset.visible="false";this._tip.hidden=true;
  }
  attributeChangedCallback() { this._sync(); }
  _updateVisibility(){
    if(!this._tip)return;
    const visible=Boolean(this.isConnected&&this.getAttribute("text")&&!this._dismissed&&(this._hovered||this._focused));
    this._tip.dataset.visible=String(visible);
    if(!visible){closeOverlayTopLayer(this._tip);this._tip.style.transform="";this._tip.style.maxWidth="";this._tip.hidden=true;return;}
    this._tip.hidden=false;
    this._placeTip();
  }
  _placeTip(){
    if(this._tip.dataset.visible!=="true"||!openOverlayTopLayer(this._tip))return;
    const view=this.ownerDocument.defaultView,v=view.visualViewport,r=this.getBoundingClientRect();
    const left=v?.offsetLeft??0,top=v?.offsetTop??0,w=v?.width??view.innerWidth,h=v?.height??view.innerHeight;
    Object.assign(this._tip.style,{position:"fixed",margin:"0",inset:"auto",left:"0px",top:"0px",right:"auto",bottom:"auto",transform:"none",maxWidth:Math.max(0,Math.min(250,w-16))+"px"});
    const b=this._tip.getBoundingClientRect(),gap=9,p=this.getAttribute("placement")||"top";
    let x=r.left+(r.width-b.width)/2,y=r.top-b.height-gap;
    if(p==="bottom")y=r.bottom+gap;
    if(p==="left"){x=r.left-b.width-gap;y=r.top+(r.height-b.height)/2;}
    if(p==="right"){x=r.right+gap;y=r.top+(r.height-b.height)/2;}
    if(p==="top"&&y<top+8&&r.bottom+gap+b.height<=top+h-8)y=r.bottom+gap;
    if(p==="bottom"&&y+b.height>top+h-8&&r.top-b.height-gap>=top+8)y=r.top-b.height-gap;
    if(p==="left"&&x<left+8&&r.right+gap+b.width<=left+w-8)x=r.right+gap;
    if(p==="right"&&x+b.width>left+w-8&&r.left-b.width-gap>=left+8)x=r.left-b.width-gap;
    this._tip.style.left=Math.max(left+8,Math.min(x,left+w-b.width-8))+"px";
    this._tip.style.top=Math.max(top+8,Math.min(y,top+h-b.height-8))+"px";
  }
  _sync() {
    if (!this._tip) return;
    const message = this.getAttribute("text") || "";
    this._tip.textContent = message;
    this._updateVisibility();
    for (const anchor of this._slot.assignedElements({flatten:true})) {
      // Do not overwrite author-provided descriptions.
      const owned = anchor.dataset.cuTooltipDescription === "true";
      if (owned) {
        if (message) anchor.setAttribute("aria-description", message);
        else {
          anchor.removeAttribute("aria-description");
          delete anchor.dataset.cuTooltipDescription;
        }
      } else if (message && !anchor.hasAttribute("aria-description") &&
          !anchor.hasAttribute("aria-describedby")) {
        anchor.setAttribute("aria-description", message);
        anchor.dataset.cuTooltipDescription = "true";
      }
    }
  }
}
define("cu-tooltip", CuTooltip);
