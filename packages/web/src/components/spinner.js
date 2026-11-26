
import { BrowserElement, mount, define } from "./_shared.js";
const css = [
  ":host{display:inline-flex;align-items:center;vertical-align:middle;gap:9px;",
  "color:var(--cu-accent,#0067c0);font-family:var(--cu-font-body,system-ui);",
  "--cu-spinner-size:20px;}",
  ":host([hidden]){display:none!important;}",
  ":host([size=sm]){--cu-spinner-size:14px;}",
  ":host([size=lg]){--cu-spinner-size:28px;}",
  ":host([size=xl]){--cu-spinner-size:40px;}",
  ".wheel{width:var(--cu-spinner-size);height:var(--cu-spinner-size);",
  "box-sizing:border-box;border:2px solid color-mix(in srgb,currentColor 22%,transparent);",
  "border-top-color:currentColor;border-radius:50%;animation:cu-spin .8s linear infinite;}",
  ".label{font:500 13px var(--cu-font-body,system-ui);",
  "color:var(--cu-text-muted,#616161);}",
  ".label:empty{display:none;}",
  ".sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}",
  "@keyframes cu-spin{to{transform:rotate(360deg);}}",
  "@media(prefers-reduced-motion:reduce){.wheel{animation:none;",
  "border-top-color:currentColor;border-right-color:currentColor;}}",
  "@media(forced-colors:active){.wheel{border-color:GrayText;border-top-color:CanvasText;}}"
].join("");
export class CuSpinner extends BrowserElement {
  static get observedAttributes() { return ["label","size","aria-label"]; }
  constructor() {
    super();
    const root=mount(this,css,'<span class="wheel" aria-hidden="true" part="spinner"></span>' +
      '<span class="label" part="label"></span>');
    this._label=root.querySelector(".label");
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  _sync() {
    if (!this._label) return;
    const label=this.getAttribute("label") || "Loading";
    this._label.textContent=this.hasAttribute("label")?label:"";
    this.setAttribute("role","status");
    // A status node must not stay aria-busy: that can suppress its own announcement.
    this._label.setAttribute("aria-hidden",String(Boolean(this.getAttribute("aria-label"))));
    if(!this._label.textContent){this._label.textContent=this.getAttribute("aria-label")||"Loading";this._label.classList.add("sr-only");}
    else this._label.classList.remove("sr-only");
  }
}
define("cu-spinner",CuSpinner);
