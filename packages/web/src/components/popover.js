
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { registerOverlay, unregisterOverlay, isTopOverlay, placeAnchoredOverlay,closeOverlayTopLayer, watchOverlayViewport, restoreOverlayFocus } from "./_overlay.js";

const css = [
  ":host{position:relative;display:inline-flex;vertical-align:middle;max-width:100%;}",
  ":host([hidden]){display:none!important;}",
  ".panel{box-sizing:border-box;position:absolute;top:calc(100% + 8px);left:0;z-index:50;",
  "min-width:240px;max-width:min(350px,calc(100vw - 30px));",
  "padding:16px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);",
  "color:var(--cu-text,#242424);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));",
  "font:400 13px/1.5 var(--cu-font-body,system-ui);}",
  ":host([open]){z-index:85;}",
  ".panel{overflow:auto;overscroll-behavior:contain;}",
  ".panel[hidden]{display:none!important;}",
  ".panel:not([hidden]){animation:cu-popover-enter var(--cu-motion-normal,160ms) ease both;}",
  "@keyframes cu-popover-enter{from{opacity:.5}to{opacity:1}}",
  "@media(prefers-reduced-motion:reduce){.panel:not([hidden]){animation:none;}}",
  ":host([placement=end]) .panel{left:auto;right:0;}",
  focusStyle
].join("");

let popoverInstanceId=0;
export class CuPopover extends BrowserElement {
  static get observedAttributes() { return ["open","title","placement"]; }
  constructor() {
    super();
    const root = mount(this, css,
      '<slot name="trigger"></slot><div class="panel" part="panel" role="dialog" aria-modal="false" tabindex="-1" hidden>' +
      '<slot name="content"></slot></div>');
    this._trigger = root.querySelector('slot[name="trigger"]');
    this._panel = root.querySelector(".panel");
    this._panel.id="cu-popover-"+(++popoverInstanceId);
    this._trigger.addEventListener("slotchange", () => this._syncTrigger());
    this._trigger.addEventListener("click", event => {
      if (event.defaultPrevented) return;
      if(this.open)this.hide();else{this.show();this._panel.focus({preventScroll:true});}
    });
    this._onDocumentPointer = event => {
      if (this.open && !event.composedPath().includes(this)) this.hide();
    };
    this._onDocumentKey = event => {
      if (this.open && event.key === "Escape" && !event.defaultPrevented && isTopOverlay(this)) {
        event.preventDefault();
        this.hide();
        restoreOverlayFocus(this._trigger.assignedElements({flatten:true})[0]);
      }
    };
  }
  connectedCallback() {
    document.addEventListener("pointerdown",this._onDocumentPointer);
    document.addEventListener("keydown",this._onDocumentKey);
    this._stopViewport=watchOverlayViewport(this,()=>this._placePanel());
    this._sync();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown",this._onDocumentPointer);
    document.removeEventListener("keydown",this._onDocumentKey);
    this._stopViewport?.();this._stopViewport=null;this.hide();unregisterOverlay(this);
  }
  attributeChangedCallback(name,oldValue,newValue) {
    if (!this._panel) return;
    this._sync();
    if (name === "open" && oldValue !== newValue && this.isConnected)
      notify(this,this.open ? "cu-open" : "cu-close",{});
  }
  get open() { return this.hasAttribute("open"); }
  set open(next) { this.toggleAttribute("open",Boolean(next)); }
  show() { this.open = true; }
  hide() { this.open = false; }
  toggle() { this.open = !this.open; }
  _syncTrigger() {
    for (const trigger of this._trigger.assignedElements({flatten:true})) {
      trigger.setAttribute("aria-expanded", String(this.open));
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls",this._panel.id);
    }
  }
  _placePanel(){if(this.open)placeAnchoredOverlay(this,this._panel,{maxHeight:360,gap:8,topLayer:true,allowOverflow:true,align:this.getAttribute("placement")==="end"?"end":"start"});}
  _sync() {
    if(!this.open)closeOverlayTopLayer(this._panel);
    this._panel.hidden = !this.open;
    if(this.open&&this.isConnected){if(!this._registered){registerOverlay(this);this._registered=true;}this._placePanel();}
    else{unregisterOverlay(this);this._registered=false;}
    this._panel.setAttribute("aria-label",this.getAttribute("title") || "Popover");
    this._syncTrigger();
  }
}
define("cu-popover", CuPopover);
