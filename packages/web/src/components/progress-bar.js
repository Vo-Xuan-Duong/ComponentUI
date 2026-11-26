
import { BrowserElement, mount, define } from "./_shared.js";
import { normalizeProgress } from "./_progress.js";

const css = [
  ":host{display:block;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".head{display:flex;justify-content:space-between;gap:10px;font-size:13px;",
  "font-weight:600;margin-bottom:8px;}",
  ".head:has(.label:empty){margin-bottom:6px;}",
  ".head:has(.label:empty):has(.pct:empty){display:none;}",
  ".label:empty,.pct:empty{display:none;}",
  "progress{display:block;appearance:none;-webkit-appearance:none;width:100%;height:7px;",
  "border:0;border-radius:999px;overflow:hidden;background:var(--cu-border,#e5e5e5);}",
  "progress::-webkit-progress-bar{background:var(--cu-border,#e5e5e5);border-radius:999px;}",
  "progress::-webkit-progress-value{background:var(--cu-accent,#0067c0);border-radius:999px;}",
  "progress::-moz-progress-bar{background:var(--cu-accent,#0067c0);border-radius:999px;}",
  ":host([tone=success]) progress::-webkit-progress-value{background:var(--cu-success,#107c41);}",
  ":host([tone=success]) progress::-moz-progress-bar{background:var(--cu-success,#107c41);}",
  ":host([tone=danger]) progress::-webkit-progress-value{background:var(--cu-danger,#c42b1c);}",
  ":host([tone=danger]) progress::-moz-progress-bar{background:var(--cu-danger,#c42b1c);}",
  ".track{position:relative;border-radius:999px;overflow:hidden;background:var(--cu-border,#e5e5e5);}",
  ".indeterminate{display:none;position:absolute;inset-block:0;inline-size:34%;border-radius:999px;",
  "background:var(--cu-accent,#0067c0);animation:cu-progress-slide 1.6s ease-in-out infinite;}",
  ":host([data-indeterminate=true]) progress{opacity:0;}",
  ":host([data-indeterminate=true]) .indeterminate{display:block;}",
  ":host([tone=success]) .indeterminate{background:var(--cu-success,#107c41);}",
  ":host([tone=danger]) .indeterminate{background:var(--cu-danger,#c42b1c);}",
  "@keyframes cu-progress-slide{from{transform:translateX(-105%)}to{transform:translateX(300%)}}",
  "@media(prefers-reduced-motion:reduce){.indeterminate{animation:none;inset-inline-start:33%;}}",
  "@media(forced-colors:active){.track{outline:1px solid CanvasText;}.indeterminate{background:Highlight;forced-color-adjust:none;}}"
].join("");

export class CuProgressBar extends BrowserElement {
  static get observedAttributes() { return ["value","max","label","aria-label","tone"]; }
  constructor() {
    super();
    const root = mount(this,css,
      '<div class="head"><span class="label" part="label"></span><span class="pct" part="percentage"></span></div>' +
      '<div class="track"><progress part="progress" max="100"></progress><span class="indeterminate" aria-hidden="true"></span></div>');
    this._progress = root.querySelector("progress");
    this._label = root.querySelector(".label");
    this._percentage = root.querySelector(".pct");
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  get value() { return normalizeProgress(this.getAttribute("value"),this.max).value; }
  set value(next) {
    if (next === null || next === undefined || next === "") this.removeAttribute("value");
    else this.setAttribute("value",String(next));
  }
  get max() { return this._progress.max; }
  set max(next) { this.setAttribute("max",String(next)); }
  _sync() {
    if (!this._progress) return;
    const data=normalizeProgress(this.getAttribute("value"),this.getAttribute("max")??100);
    this._progress.max=data.max;
    this.dataset.indeterminate=String(data.value===null);
    if(data.value===null){
      this._progress.removeAttribute("value");
      this._percentage.textContent="";
    }else{
      this._progress.value=data.value;
      this._percentage.textContent=Math.round(data.percent)+"%";
    }
    this._label.textContent = this.getAttribute("label") || "";
    this._progress.setAttribute("aria-label",
      this.getAttribute("aria-label") || this._label.textContent || "Progress");
  }
}
define("cu-progress-bar",CuProgressBar);
