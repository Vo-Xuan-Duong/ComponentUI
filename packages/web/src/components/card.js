
import { BrowserElement, mount, define } from "./_shared.js";

const css = [
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "article{box-sizing:border-box;overflow:hidden;min-width:0;",
  "border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-xl,12px);",
  "background:var(--cu-surface,#fff);",
  "box-shadow:var(--cu-shadow-card,0 1px 2px rgb(0 0 0/.04));}",
  ":host([variant=flat]) article{box-shadow:none;background:var(--cu-surface-alt,#f8f8f8);}",
  ":host([variant=outline]) article{box-shadow:none;background:transparent;}",
  ":host([variant=elevated]) article{background:var(--cu-surface-elevated,#fff);",
  "box-shadow:var(--cu-shadow-flyout,0 8px 20px rgb(0 0 0/.10));}",
  ".header,.body,.footer{box-sizing:border-box;min-width:0;padding:16px 18px;}",
  ".header{font-weight:600;font-size:14px;border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  ".body{font-size:13px;line-height:1.55;}",
  ".footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;",
  "border-top:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface-alt,#f8f8f8);}",
  ".header[hidden],.footer[hidden]{display:none!important;}",
  "::slotted([slot=header]){margin:0;}",
  "@media(forced-colors:active){article{border:1px solid CanvasText;}}"
].join("");

export class CuCard extends BrowserElement {
  static get observedAttributes() { return ["variant"]; }
  constructor() {
    super();
    const root = mount(this, css,
      '<article part="card"><div class="header" part="header" hidden>' +
      '<slot name="header"></slot></div><div class="body" part="body">' +
      '<slot></slot></div><div class="footer" part="footer" hidden>' +
      '<slot name="footer"></slot></div></article>');
    for (const section of ["header","footer"]) {
      const slot = root.querySelector('slot[name="'+section+'"]');
      const container = root.querySelector("."+section);
      slot.addEventListener("slotchange", () => {
        container.hidden = slot.assignedNodes({flatten:true})
          .every(node => node.nodeType === 3 && !node.textContent.trim());
      });
    }
  }
}
define("cu-card",CuCard);
