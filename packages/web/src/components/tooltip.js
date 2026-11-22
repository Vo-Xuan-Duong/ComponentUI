
import { BrowserElement, mount, define, focusStyle } from "./_shared.js";

const css = [
  ":host{display:inline-flex;position:relative;vertical-align:middle;max-width:100%;}",
  ":host([hidden]){display:none!important;}",
  ".tip{position:absolute;z-index:40;bottom:calc(100% + 9px);left:50%;transform:translateX(-50%);",
  "visibility:hidden;opacity:0;pointer-events:none;white-space:normal;",
  "min-width:max-content;max-width:min(250px,80vw);box-sizing:border-box;",
  "padding:7px 10px;border-radius:var(--cu-radius-sm,4px);",
  "border:1px solid var(--cu-border-strong,#d1d1d1);background:var(--cu-surface-elevated,#fff);",
  "color:var(--cu-text,#242424);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));",
  "font:400 12px/1.4 var(--cu-font-body,system-ui);transition:opacity var(--cu-motion-fast,100ms);}",
  ":host(:hover) .tip,:host(:focus-within) .tip{visibility:visible;opacity:1;}",
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
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  _sync() {
    if (!this._tip) return;
    const message = this.getAttribute("text") || "";
    this._tip.textContent = message;
    this._tip.hidden = !message;
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
