
import { BrowserElement, mount, define } from "./_shared.js";
import { normalizeProgress } from "./_progress.js";

// Match the native ProgressBar behavior: empty/invalid value is indeterminate.
export function normalizeRingProgress(value,max=100){return normalizeProgress(value,max);}

const RADIUS=18;
const CIRCUMFERENCE=2*Math.PI*RADIUS;
const css=[
  ":host{--ring-stroke:var(--cu-accent,#0067c0);display:inline-flex;vertical-align:middle;",
  "font:600 12px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=success]){--ring-stroke:var(--cu-success,#107c41);}",
  ":host([tone=warning]){--ring-stroke:var(--cu-warning,#9a6700);}",
  ":host([tone=danger]){--ring-stroke:var(--cu-danger,#c42b1c);}",
  ".ring{position:relative;display:grid;place-items:center;width:44px;height:44px;flex:none;}",
  ":host([size=sm]) .ring{width:24px;height:24px;}",
  ":host([size=lg]) .ring{width:64px;height:64px;}",
  ":host([size=xl]) .ring{width:88px;height:88px;}",
  "svg{display:block;width:100%;height:100%;overflow:visible;}",
  ".track,.indicator{fill:none;stroke-width:4;}",
  ".track{stroke:var(--cu-border,#e5e5e5);}",
  ".indicator{stroke:var(--ring-stroke);stroke-linecap:round;transform:rotate(-90deg);",
  "transform-origin:50% 50%;transition:stroke-dashoffset var(--cu-motion-normal,160ms);}",
  ":host([data-indeterminate=true]) .indicator{stroke-dasharray:28 86;",
  "animation:cu-ring-spin 1.3s linear infinite;}",
  ".pct{position:absolute;inset:0;display:grid;place-items:center;",
  "font-size:10px;font-weight:650;pointer-events:none;}",
  ".pct:empty{display:none;}",
  ":host([size=sm]) .pct{display:none;}",
  ":host([size=lg]) .pct{font-size:13px;}",
  ":host([size=xl]) .pct{font-size:17px;}",
  "@keyframes cu-ring-spin{to{transform:rotate(270deg);}}",
  "@media(prefers-reduced-motion:reduce){.indicator{animation:none!important;transition:none!important;}}",
  "@media(forced-colors:active){.track{stroke:GrayText;}.indicator{stroke:Highlight;}}"
].join("");

export class CuProgressRing extends BrowserElement {
  static get observedAttributes(){
    return ["value","max","label","aria-label","show-value"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="ring" part="ring" role="progressbar" aria-valuemin="0">' +
      '<svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">' +
      '<circle class="track" part="track" cx="22" cy="22" r="18"></circle>' +
      '<circle class="indicator" part="indicator" cx="22" cy="22" r="18"></circle>' +
      '</svg><span class="pct" part="percentage" aria-hidden="true"></span></div>');
    this._ring=root.querySelector(".ring");
    this._indicator=root.querySelector(".indicator");
    this._pct=root.querySelector(".pct");
    this._indicator.style.strokeDasharray=String(CIRCUMFERENCE);
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get value(){return normalizeRingProgress(this.getAttribute("value"),this.max).value;}
  set value(next){
    if(next===null||next===undefined||next==="")this.removeAttribute("value");
    else this.setAttribute("value",String(next));
  }
  get max(){return normalizeRingProgress(null,this.getAttribute("max")??100).max;}
  set max(next){this.setAttribute("max",String(next));}
  _sync(){
    if(!this._ring)return;
    const data=normalizeRingProgress(this.getAttribute("value"),this.getAttribute("max")??100);
    const indeterminate=data.value===null;
    this.dataset.indeterminate=String(indeterminate);
    this._ring.setAttribute("aria-valuemax",String(data.max));
    this._ring.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Progress");
    if(indeterminate)this._ring.removeAttribute("aria-valuenow");
    else this._ring.setAttribute("aria-valuenow",String(data.value));
    this._indicator.style.strokeDashoffset=String(
      indeterminate?0:CIRCUMFERENCE*(1-data.percent/100));
    this._indicator.style.strokeDasharray=indeterminate?"28 86":String(CIRCUMFERENCE);
    this._pct.textContent=!indeterminate&&this.hasAttribute("show-value")?
      Math.round(data.percent)+"%":"";
  }
}
define("cu-progress-ring",CuProgressRing);
