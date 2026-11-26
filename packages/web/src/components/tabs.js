
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

/**
 * Data-only slotted panels:
 * <cu-tabs><cu-tab label="Overview">Content</cu-tab>...</cu-tabs>
 */
export class CuTab extends BrowserElement {
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
}
define("cu-tab", CuTab);

const css = [
  ":host{display:block;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".tabs{display:flex;gap:4px;border-bottom:1px solid var(--cu-border,#e5e5e5);overflow-x:auto;}",
  ":host([orientation=vertical]) .wrapper{display:grid;grid-template-columns:minmax(130px,200px) minmax(0,1fr);gap:12px;}",
  ":host([orientation=vertical]) .tabs{flex-direction:column;border-bottom:0;border-right:1px solid var(--cu-border,#e5e5e5);}",
  "button{flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:var(--cu-control-height,40px);",
  "padding:0 14px;background:transparent;color:var(--cu-text-muted,#616161);font:600 13px var(--cu-font-body,system-ui);",
  "border:0;border-bottom:3px solid transparent;cursor:pointer;}",
  ":host([orientation=vertical]) button{justify-content:start;border-bottom:0;",
  "border-radius:var(--cu-radius-md,6px);}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-text,#242424) 5%,transparent);}",
  "button[aria-selected=true]{color:var(--cu-text,#242424);border-bottom-color:var(--cu-accent,#0067c0);}",
  ":host([orientation=vertical]) button[aria-selected=true]{border-bottom-color:transparent;",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 15%,var(--cu-surface,#fff));font-weight:700;}",
  "button:disabled{opacity:.45;cursor:not-allowed;}",
  "section{padding:15px 0;outline-offset:2px;}",
  "section[hidden],slot[data-default]{display:none!important;}",
  focusStyle
].join("");

export class CuTabs extends BrowserElement {
  static get observedAttributes() { return ["active","orientation","aria-label"]; }
  constructor() {
    super();
    const root = mount(this, css, '<div class="wrapper"><div class="tabs" role="tablist"></div>' +
      '<div class="panels"></div></div><slot data-default></slot>');
    this._tablist = root.querySelector(".tabs");
    this._panels = root.querySelector(".panels");
    this._observer = null;
    this._active = 0;
    this._tablist.addEventListener("keydown", event => {
      const tabs = [...this._tablist.querySelectorAll('[role="tab"]:not(:disabled)')];
      const current = tabs.indexOf(event.target);
      if (current < 0 || !tabs.length) return;
      const vertical = this.getAttribute("orientation") === "vertical";
      const rtl = !vertical && this.ownerDocument.defaultView?.getComputedStyle(this).direction === "rtl";
      const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
      const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
      let target;
      if (event.key === next) target = tabs[(current + 1) % tabs.length];
      if (event.key === previous) target = tabs[(current - 1 + tabs.length) % tabs.length];
      if (event.key === "Home") target = tabs[0];
      if (event.key === "End") target = tabs[tabs.length-1];
      if (target) {
        event.preventDefault();
        this._activate(Number(target.dataset.index), {focus:true, emit:true});
      }
    });
    this._tablist.addEventListener("click", event => {
      const button = event.target.closest('[role="tab"]');
      if (button && !button.disabled) this._activate(Number(button.dataset.index), {emit:true});
    });
  }

  connectedCallback() {
    this._render();
    this._observer = new MutationObserver(records => {
      if (records.some(r => (r.type === "childList" && r.target === this) ||
          (r.type === "attributes" && r.target.parentElement === this &&
            r.target.localName === "cu-tab"))) this._render();
    });
    this._observer.observe(this, {childList:true,subtree:true,attributes:true,
      attributeFilter:["label","disabled"]});
  }
  disconnectedCallback() { this._observer?.disconnect(); this._observer = null; }
  attributeChangedCallback(name) {
    if (!this._tablist) return;
    if (name === "active") this._activate(Number(this.getAttribute("active") || 0));
    else this._sync();
  }

  get active() { return this._active; }
  set active(value) { const next=Number(value);if(!this._tablist.children.length){this._active=Number.isFinite(next)?Math.trunc(next):0;this.setAttribute("active",String(this._active));return;}this._activate(next); }

  _render() {
    const items = [...this.children].filter(child => child.localName === "cu-tab");
    const focused=this.shadowRoot.activeElement;
    const restoreTabFocus=this._tablist.contains(focused);
    this._tablist.replaceChildren();
    this._panels.replaceChildren();
    const base = this._id ?? (this._id = "cu-tabs-" + ++CuTabs._nextId);
    items.forEach((item, index) => {
      const button = this.ownerDocument.createElement("button");
      button.type = "button";
      button.dataset.index = String(index);
      button.id = base + "-tab-" + index;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", base + "-panel-" + index);
      button.disabled = item.hasAttribute("disabled");
      button.textContent = item.getAttribute("label") || "Tab " + (index + 1);
      const panel = this.ownerDocument.createElement("section");
      panel.id = base + "-panel-" + index;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.tabIndex = 0;
      const slot = this.ownerDocument.createElement("slot");
      const slotName = base + "-content-" + index;
      slot.name = slotName;
      // Do not watch slot mutations: this is internal distribution metadata.
      if (item.slot !== slotName) item.slot = slotName;
      panel.append(slot);
      this._tablist.append(button);
      this._panels.append(panel);
    });
    this._activate(Number(this.getAttribute("active") ?? this._active),{focus:restoreTabFocus});
  }

  _activate(requested, {focus=false,emit=false} = {}) {
    const buttons = [...this._tablist.querySelectorAll('[role="tab"]')];
    const enabled = buttons.map((button,i) => !button.disabled ? i : -1).filter(i => i !== -1);
    if (!enabled.length) { this._active = -1; this._sync(); return; }
    const safe = Number.isFinite(requested) ? Math.trunc(requested) : enabled[0];
    const next = enabled.includes(safe) ? safe : enabled[0];
    const changed = next !== this._active;
    this._active = next;
    // Reflect active selection for declarative and framework consumers.
    if (this.getAttribute("active") !== String(next)) this.setAttribute("active", String(next));
    this._sync();
    if (focus) buttons[next].focus();
    if (changed && emit) notify(this,"cu-change", {
      index:next,label:buttons[next].textContent
    });
  }
  _sync() {
    const buttons = [...this._tablist.querySelectorAll('[role="tab"]')];
    const panels = [...this._panels.children];
    const vertical = this.getAttribute("orientation") === "vertical";
    this._tablist.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
    this._tablist.setAttribute("aria-label", this.getAttribute("aria-label") || "Tabs");
    buttons.forEach((button,index) => {
      const active = index === this._active;
      button.setAttribute("aria-selected",String(active));
      button.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
  }
}
CuTabs._nextId = 0;
define("cu-tabs", CuTabs);
