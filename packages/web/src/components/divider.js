
import { BrowserElement, mount, define } from "./_shared.js";
const css = [
  ":host{display:block;box-sizing:border-box;width:100%;height:1px;",
  "color:var(--cu-border,#e5e5e5);}",
  ":host([hidden]){display:none!important;}",
  ".line{display:block;box-sizing:border-box;width:100%;height:100%;background:currentColor;}",
  ":host([orientation=vertical]){display:inline-block;align-self:stretch;width:1px;",
  "min-height:20px;height:auto;}",
  ":host([tone=strong]){color:var(--cu-border-strong,#d1d1d1);}",
  "@media(forced-colors:active){:host{color:CanvasText;}}"
].join("");
export class CuDivider extends BrowserElement {
  static get observedAttributes() { return ["orientation","decorative"]; }
  constructor() {
    super();
    mount(this,css,'<span class="line" part="line" aria-hidden="true"></span>');
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  _sync() {
    const decorative = this.hasAttribute("decorative");
    if (decorative) {
      this.setAttribute("role","presentation");
      this.setAttribute("aria-hidden","true");
      this.removeAttribute("aria-orientation");
    } else {
      this.setAttribute("role","separator");
      this.removeAttribute("aria-hidden");
      this.setAttribute("aria-orientation",this.getAttribute("orientation")==="vertical"?"vertical":"horizontal");
    }
  }
}
define("cu-divider",CuDivider);
