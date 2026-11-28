
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import { registerOverlay, unregisterOverlay, isTopOverlay, placeAnchoredOverlay,closeOverlayTopLayer, watchOverlayViewport, restoreOverlayFocus } from "./_overlay.js";

/** Declarative option only: used as a child of <cu-menu>. */
export class CuMenuItem extends BrowserElement {
  static get observedAttributes() { return ["value","disabled","label"]; }
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
}
define("cu-menu-item",CuMenuItem);

const css = [
  ":host{display:inline-flex;position:relative;vertical-align:middle;max-width:100%;",
  "color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".menu{box-sizing:border-box;position:absolute;top:calc(100% + 8px);left:0;z-index:60;",
  "min-width:190px;max-width:min(330px,calc(100vw - 28px));padding:6px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);",
  "background:var(--cu-surface-elevated,#fff);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  ":host([open]){z-index:85;}",
  ".menu{overflow-y:auto;overscroll-behavior:contain;}",
  ".menu[hidden],slot:not([name]){display:none!important;}",
  ".menu:not([hidden]){animation:cu-menu-enter var(--cu-motion-normal,160ms) ease both;}",
  "@keyframes cu-menu-enter{from{opacity:.5}to{opacity:1}}",
  "button[role=menuitem]{display:block;box-sizing:border-box;width:100%;text-align:left;",
  "border:0;border-radius:var(--cu-radius-sm,4px);padding:9px 11px;background:transparent;",
  "color:var(--cu-text,#242424);font:400 13px var(--cu-font-body,system-ui);cursor:pointer;}",
  "button[role=menuitem]:hover:not(:disabled),button[role=menuitem]:focus-visible{",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,var(--cu-surface,#fff));}",
  "button[role=menuitem]:disabled{opacity:.5;cursor:not-allowed;}",
  "@media(forced-colors:active){.menu{border-color:CanvasText;}}",
  focusStyle
].join("");

let menuInstanceId=0;
export class CuMenu extends BrowserElement {
  static get observedAttributes() { return ["open","aria-label"]; }
  constructor() {
    super();
    const root = mount(this,css,
      '<slot name="trigger"></slot><div part="menu" class="menu" role="menu" hidden></div><slot></slot>');
    this._trigger = root.querySelector('slot[name="trigger"]');
    this._menu = root.querySelector('[role="menu"]');
    this._menu.id="cu-menu-"+(++menuInstanceId);
    this._trigger.addEventListener("slotchange",() => this._syncTrigger());
    this._trigger.addEventListener("click",event => {
      if (!event.defaultPrevented) this.open ? this.hide() : this.show();
    });
    this._trigger.addEventListener("keydown",event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        this.show(event.key === "ArrowUp" ? "last" : "first");
      }
    });
    this._menu.addEventListener("keydown",event => {
      if (event.key === "Escape" && isTopOverlay(this)) {
        event.preventDefault();event.stopPropagation();
        this.hide(true);
      } else if (event.key === "Tab") this.hide(true);
      else {
        const items = this._enabledItems();
        const index = items.indexOf(event.target);
        if (index < 0 || !items.length) return;
        let next = null;
        if (event.key === "ArrowDown") next = items[(index+1)%items.length];
        if (event.key === "ArrowUp") next = items[(index-1+items.length)%items.length];
        if (event.key === "Home") next = items[0];
        if (event.key === "End") next = items[items.length-1];
        if (next) {event.preventDefault();next.focus();}
      }
    });
    this._menu.addEventListener("click",event => {
      const button = event.target.closest('[role="menuitem"]');
      if (!button || button.disabled) return;
      const detail={value:button.dataset.value,label:button.textContent};
      this.hide(true);
      notify(this,"cu-select",detail);
    });
    this._outside = event => {
      if (this.open && !event.composedPath().includes(this)) this.hide();
    };
    this._escape = event => {
      if (this.open && event.key === "Escape" && !event.defaultPrevented && isTopOverlay(this)) {
        event.preventDefault();
        this.hide(true);
      }
    };
    this._observer = null;
  }
  connectedCallback() {
    this._render();
    document.addEventListener("pointerdown",this._outside);
    document.addEventListener("keydown",this._escape);
    this._stopViewport=watchOverlayViewport(this,()=>this._placeMenu());
    this._observer = new MutationObserver(records => {
      if (records.some(r => r.type === "childList" ||
        ["value","disabled","label"].includes(r.attributeName))) this._render();
    });
    this._observer.observe(this,{childList:true,subtree:true,attributes:true,
      attributeFilter:["value","disabled","label"]});
    this._sync();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown",this._outside);
    document.removeEventListener("keydown",this._escape);
    this._stopViewport?.();this._stopViewport=null;this.hide();unregisterOverlay(this);
    this._observer?.disconnect();
    this._observer = null;
  }
  attributeChangedCallback(name,oldValue,newValue) {
    this._sync();
    if (name === "open" && this.isConnected && oldValue !== newValue)
      notify(this,this.open?"cu-open":"cu-close",{});
  }
  get open() { return this.hasAttribute("open"); }
  set open(value) { this.toggleAttribute("open",Boolean(value)); }
  _enabledItems() { return [...this._menu.querySelectorAll('[role="menuitem"]:not(:disabled)')]; }
  _triggerElements(){return this._trigger.assignedElements({flatten:true});}
  _syncTrigger() {
    for (const trigger of this._triggerElements()) {
      trigger.setAttribute("aria-haspopup","menu");
      trigger.setAttribute("aria-controls",this._menu.id);
      trigger.setAttribute("aria-expanded",String(this.open));
    }
  }
  _render() {
    if (!this._menu) return;
    const previous=this.shadowRoot?.activeElement;
    const wasFocused=this._menu.contains(previous);
    const previousValue=wasFocused?previous.dataset.value:null;
    this._menu.replaceChildren();
    for (const item of this.children) {
      if (item.localName !== "cu-menu-item") continue;
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role","menuitem");
      button.tabIndex = -1;
      button.disabled = item.hasAttribute("disabled");
      button.dataset.value = item.getAttribute("value") ?? item.textContent.trim();
      button.textContent = item.getAttribute("label") ?? item.textContent.trim();
      this._menu.append(button);
    }
    this._sync();
    if(wasFocused&&this.open){const items=this._enabledItems();
      (items.find(item=>item.dataset.value===previousValue)??items[0])?.focus();}
  }
  _sync() {
    if (!this._menu) return;
    if(!this.open)closeOverlayTopLayer(this._menu);
    this._menu.hidden = !this.open;
    if(this.open&&this.isConnected){if(!this._registered){registerOverlay(this);this._registered=true;}this._placeMenu();}
    else{unregisterOverlay(this);this._registered=false;}
    this._menu.setAttribute("aria-label",this.getAttribute("aria-label") || "Actions");
    this._syncTrigger();
  }
  _placeMenu(){if(this.open)placeAnchoredOverlay(this,this._menu,{maxHeight:320,gap:8,topLayer:true});}
  show(focus="first") {
    if (!this.open) this.open = true;
    const items = this._enabledItems();
    const item = focus === "last" ? items[items.length-1] : items[0];
    item?.focus();
  }
  hide(restoreFocus=false) {
    if (this.open) this.open = false;
    if (restoreFocus) restoreOverlayFocus(this._triggerElements()[0]);
  }
  toggle() { this.open ? this.hide() : this.show(); }
}
define("cu-menu",CuMenu);
