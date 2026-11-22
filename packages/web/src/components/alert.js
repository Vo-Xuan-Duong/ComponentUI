
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

const css = [
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);",
  "--alert-accent:var(--cu-accent,#0067c0);",
  "--alert-bg:color-mix(in srgb,var(--alert-accent) 7%,var(--cu-surface,#fff));",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=success]){--alert-accent:var(--cu-success,#107c41);}",
  ":host([tone=warning]){--alert-accent:var(--cu-warning,#9a6700);}",
  ":host([tone=danger]){--alert-accent:var(--cu-danger,#c42b1c);}",
  ".alert{display:flex;align-items:flex-start;gap:12px;box-sizing:border-box;",
  "padding:13px 14px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--alert-bg);}",
  ".symbol{color:var(--alert-accent);flex:none;margin-top:1px;}",
  ".content{flex:1;min-width:0;display:grid;gap:4px;font-size:13px;line-height:1.55;}",
  ".title{font-size:13px;font-weight:650;}",
  ".title:empty{display:none;}",
  ".dismiss{display:grid;place-items:center;flex:none;min-height:26px;min-width:26px;",
  "background:transparent;border:0;border-radius:var(--cu-radius-md,6px);",
  "color:var(--cu-text-muted,#616161);cursor:pointer;}",
  ".dismiss:hover{background:color-mix(in srgb,var(--cu-text,#242424) 8%,transparent);}",
  ".dismiss[hidden]{display:none!important;}",
  ".dismiss:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "@media(forced-colors:active){.alert{border-color:CanvasText;}}"
].join("");

export class CuAlert extends BrowserElement {
  static get observedAttributes() { return ["tone","title","dismissible"]; }
  constructor() {
    super();
    const root=mount(this,css,
      '<div class="alert" part="alert"><cu-icon class="symbol" name="info" size="19" ' +
      'part="icon"></cu-icon><div class="content" part="content">' +
      '<div class="title" part="title"></div><slot></slot></div>' +
      '<button class="dismiss" part="dismiss" type="button" aria-label="Dismiss alert" hidden>' +
      '<cu-icon name="x" size="17"></cu-icon></button></div>');
    this._title=root.querySelector(".title");
    this._symbol=root.querySelector(".symbol");
    this._dismiss=root.querySelector(".dismiss");
    this._dismiss.addEventListener("click",()=>this.dismiss());
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  dismiss() {
    if (this.hidden) return;
    this.hidden=true;
    notify(this,"cu-dismiss",{tone:this.getAttribute("tone")||"info"});
  }
  show() { this.hidden=false; }
  _sync() {
    if (!this._title) return;
    const tone=this.getAttribute("tone") || "info";
    const icons={info:"info",success:"circle-check",warning:"shield-check",danger:"x"};
    this._symbol.name=icons[tone] || "info";
    this._title.textContent=this.getAttribute("title") || "";
    this._dismiss.hidden=!this.hasAttribute("dismissible");
    this.setAttribute("role",tone==="danger"?"alert":"status");
  }
}
define("cu-alert",CuAlert);
