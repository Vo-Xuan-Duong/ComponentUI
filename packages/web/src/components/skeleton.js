
import { BrowserElement, mount, define } from "./_shared.js";
const css = [
  ":host{display:block;width:100%;height:16px;box-sizing:border-box;",
  "--cu-skeleton-base:var(--cu-border,#e5e5e5);",
  "--cu-skeleton-highlight:var(--cu-surface-elevated,#fff);}",
  ":host([hidden]){display:none!important;}",
  ":host([shape=circle]){width:40px;height:40px;aspect-ratio:1;}",
  ":host([shape=rect]){height:80px;}",
  ".placeholder{width:100%;height:100%;box-sizing:border-box;border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-skeleton-base);overflow:hidden;position:relative;}",
  ":host([shape=circle]) .placeholder{border-radius:50%;}",
  ":host([shape=pill]) .placeholder{border-radius:999px;}",
  ".placeholder::after{content:'';position:absolute;inset:0;",
  "background:linear-gradient(90deg,transparent 0%,",
  "color-mix(in srgb,var(--cu-skeleton-highlight) 70%,transparent) 50%,transparent 100%);",
  "transform:translateX(-100%);animation:cu-skeleton-wave 1.7s ease-in-out infinite;}",
  ":host([animated=false]) .placeholder::after{display:none;}",
  "@keyframes cu-skeleton-wave{to{transform:translateX(100%);}}",
  "@media(prefers-reduced-motion:reduce){.placeholder::after{animation:none;display:none;}}",
  "@media(forced-colors:active){.placeholder{outline:1px solid CanvasText;background:Canvas;}",
  ".placeholder::after{display:none;}}"
].join("");
const dimension = x => {
  if (x == null || x === "") return null;
  if (/^\d+(?:\.\d+)?$/.test(x)) return Number(x)>0 ? x+"px" : null;
  return /^(?:\d+(?:\.\d+)?)(?:px|rem|em|%|vw|vh)$/.test(x) ? x : null;
};
export class CuSkeleton extends BrowserElement {
  static get observedAttributes() { return ["width","height","shape","animated"]; }
  constructor() {
    super();
    mount(this,css,'<div part="placeholder" class="placeholder"></div>');
  }
  connectedCallback() {
    this.setAttribute("aria-hidden","true");
    this._sync();
  }
  attributeChangedCallback() { this._sync(); }
  _sync() {
    for (const key of ["width","height"]) {
      const value=dimension(this.getAttribute(key));
      if (value) this.style.setProperty(key,value);
      else this.style.removeProperty(key);
    }
  }
}
define("cu-skeleton",CuSkeleton);
