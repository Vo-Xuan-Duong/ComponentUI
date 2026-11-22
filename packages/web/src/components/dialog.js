
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

const css = [
  ":host{display:contents;font-family:var(--cu-font-body,system-ui);}",
  "dialog{box-sizing:border-box;max-width:min(480px,calc(100vw - 32px));width:100%;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-xl,12px);",
  "background:var(--cu-surface-elevated,#fff);color:var(--cu-text,#242424);",
  "padding:0;box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  "dialog::backdrop{background:rgb(0 0 0/.42);backdrop-filter:blur(3px);}",
  "header{display:flex;align-items:start;justify-content:space-between;gap:16px;",
  "padding:22px 24px 0;}",
  "h2{margin:0;font-size:20px;line-height:1.4;}",
  "button{border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:6px;",
  "background:var(--cu-surface-alt,#fafafa);color:var(--cu-text,#242424);",
  "padding:4px 9px;font:600 18px system-ui;cursor:pointer;}",
  "main{padding:16px 24px 24px;line-height:1.6;font-size:14px;}",
  "footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;",
  "background:var(--cu-surface-alt,#fafafa);border-top:1px solid var(--cu-border,#e5e5e5);}",
  "::slotted([slot=actions]){margin-left:auto;}",
  focusStyle
].join("");

export class CuDialog extends BrowserElement {
  static get observedAttributes() { return ["title", "open"]; }

  constructor() {
    super();
    const root = mount(this, css,
      '<dialog part="dialog" aria-labelledby="title">' +
      '<header><h2 id="title" part="title"></h2>' +
      '<button type="button" part="close" aria-label="Close dialog">×</button></header>' +
      '<main part="content"><slot></slot></main><footer part="footer"><slot name="actions"></slot></footer></dialog>');
    this._dialog = root.querySelector("dialog");
    this._title = root.querySelector("h2");
    root.querySelector("button").addEventListener("click", () => this.close());
    this._dialog.addEventListener("close", () => {
      this.removeAttribute("open");
      notify(this, "cu-close", {returnValue:this.returnValue});
    });
    this._dialog.addEventListener("cancel", event => {
      notify(this, "cu-cancel", {originalEvent:event});
    });
  }

  connectedCallback() { this._sync(); }
  attributeChangedCallback(name) {
    if (name === "title") this._syncTitle();
    if (name === "open" && this.isConnected) {
      if (this.hasAttribute("open") && !this._dialog.open) this.showModal();
      else if (!this.hasAttribute("open") && this._dialog.open) this.close();
    }
  }
  get open() { return this._dialog.open; }
  get returnValue() { return this._dialog.returnValue; }
  showModal() {
    this._syncTitle();
    if (this._dialog.open) return;
    this._dialog.showModal();
    this.setAttribute("open", "");
    notify(this, "cu-open", {});
  }
  close(returnValue = "") {
    if (this._dialog.open) this._dialog.close(returnValue);
  }
  _syncTitle() { if (this._title) this._title.textContent = this.getAttribute("title") || "Dialog"; }
  _sync() {
    this._syncTitle();
    if (this.hasAttribute("open") && !this._dialog.open) this.showModal();
  }
}

define("cu-dialog", CuDialog);
