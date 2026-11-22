
import { BrowserElement, mount, define } from "./_shared.js";

const css = [
  ":host{display:block;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".head{display:flex;justify-content:space-between;gap:10px;font-size:13px;",
  "font-weight:600;margin-bottom:8px;}",
  ".head:has(.label:empty){margin-bottom:6px;}",
  ".label:empty,.pct:empty{display:none;}",
  "progress{display:block;appearance:none;-webkit-appearance:none;width:100%;height:7px;",
  "border:0;border-radius:999px;overflow:hidden;background:var(--cu-border,#e5e5e5);}",
  "progress::-webkit-progress-bar{background:var(--cu-border,#e5e5e5);border-radius:999px;}",
  "progress::-webkit-progress-value{background:var(--cu-accent,#0067c0);border-radius:999px;}",
  "progress::-moz-progress-bar{background:var(--cu-accent,#0067c0);border-radius:999px;}",
  ":host([tone=success]) progress::-webkit-progress-value{background:var(--cu-success,#107c41);}",
  ":host([tone=success]) progress::-moz-progress-bar{background:var(--cu-success,#107c41);}",
  ":host([tone=danger]) progress::-webkit-progress-value{background:var(--cu-danger,#c42b1c);}",
  ":host([tone=danger]) progress::-moz-progress-bar{background:var(--cu-danger,#c42b1c);}"
].join("");

export class CuProgressBar extends BrowserElement {
  static get observedAttributes() { return ["value","max","label","tone"]; }
  constructor() {
    super();
    const root = mount(this,css,
      '<div class="head"><span class="label" part="label"></span><span class="pct" part="percentage"></span></div>' +
      '<progress part="progress" max="100"></progress>');
    this._progress = root.querySelector("progress");
    this._label = root.querySelector(".label");
    this._percentage = root.querySelector(".pct");
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  get value() { return this.hasAttribute("value") ? this._progress.value : null; }
  set value(next) {
    if (next === null || next === undefined || next === "") this.removeAttribute("value");
    else this.setAttribute("value",String(next));
  }
  get max() { return this._progress.max; }
  set max(next) { this.setAttribute("max",String(next)); }
  _sync() {
    if (!this._progress) return;
    const max = Number(this.getAttribute("max") ?? 100);
    this._progress.max = Number.isFinite(max) && max > 0 ? max : 100;
    const value = Number(this.getAttribute("value"));
    if (this.hasAttribute("value") && Number.isFinite(value) && value >= 0) {
      this._progress.value = Math.min(value,this._progress.max);
      this._percentage.textContent =
        Math.round(100 * this._progress.value / this._progress.max) + "%";
    } else {
      this._progress.removeAttribute("value");
      this._percentage.textContent = "";
    }
    this._label.textContent = this.getAttribute("label") || "";
    this._progress.setAttribute("aria-label",
      this.getAttribute("aria-label") || this._label.textContent || "Progress");
  }
}
define("cu-progress-bar",CuProgressBar);
