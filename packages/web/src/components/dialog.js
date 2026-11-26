
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";
import { deepActiveElement, restoreOverlayFocus } from "./_overlay.js";

const css = [
  ":host{display:contents;font-family:var(--cu-font-body,system-ui);}",
  "dialog{box-sizing:border-box;max-width:min(480px,calc(100vw - 32px));width:100%;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-xl,12px);",
  "background:var(--cu-surface-elevated,#fff);color:var(--cu-text,#242424);",
  "padding:0;box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  "dialog{max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;}",
  "dialog[open]{animation:cu-dialog-enter var(--cu-motion-normal,160ms) ease both;}",
  "@media(prefers-reduced-motion:reduce){dialog[open]{animation:none;}}",
  "@keyframes cu-dialog-enter{from{opacity:.6;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}",
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
  "footer[hidden]{display:none!important;}",
  "footer{flex-wrap:wrap;}",
  "button:hover{background:var(--cu-state-hover);}",
  "@media(max-width:480px){header,main,footer{padding-inline:16px;}}",
  "@media(forced-colors:active){dialog{border-color:CanvasText;}}",
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
      '<button type="button" part="close" aria-label="Close dialog"><cu-icon name="x" size="18"></cu-icon></button></header>' +
      '<main part="content"><slot></slot></main><footer part="footer" hidden><slot name="actions"></slot></footer></dialog>');
    this._dialog = root.querySelector("dialog");
    this._title = root.querySelector("h2");
    this._footer=root.querySelector("footer");
    this._actions=root.querySelector('slot[name="actions"]');
    this._actions.addEventListener("slotchange",()=>this._syncFooter());
    this._trigger=null;
    root.querySelector("button").addEventListener("click", () => this.close());
    this._dialog.addEventListener("close", () => {
      if(this._dialog.open)return; // Ignore a queued close after a rapid reopen.
      this.removeAttribute("open");
      const trigger=this._trigger;this._trigger=null;
      restoreOverlayFocus(trigger);
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
    this._trigger=deepActiveElement(this.ownerDocument);
    this._dialog.returnValue="";
    this._dialog.showModal();
    this.setAttribute("open", "");
    notify(this, "cu-open", {});
  }
  close(returnValue = "") {
    if (this._dialog.open) this._dialog.close(returnValue);
  }
  _syncTitle() { if (this._title) this._title.textContent = this.getAttribute("title") || "Dialog"; }
  _syncFooter(){if(this._footer)this._footer.hidden=!this._actions.assignedElements({flatten:true}).length;}
  _sync() {
    this._syncTitle();this._syncFooter();
    if (this.hasAttribute("open") && !this._dialog.open) this.showModal();
  }
}

define("cu-dialog", CuDialog);
