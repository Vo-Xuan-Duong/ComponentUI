
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

const css = [
  ":host{display:block;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".top{display:flex;justify-content:space-between;gap:12px;align-items:center;",
  "font-size:13px;font-weight:600;margin-bottom:7px;}",
  "output{font-variant-numeric:tabular-nums;color:var(--cu-text-muted,#616161);}",
  "input{display:block;width:100%;box-sizing:border-box;margin:0;min-height:24px;",
  "accent-color:var(--cu-accent,#0067c0);cursor:pointer;}",
  "input:disabled{opacity:.5;cursor:not-allowed;}",
  ".hint{font-size:12px;color:var(--cu-text-muted,#616161);margin-top:7px;}",
  ".hint:empty,.label:empty{display:none;}",
  focusStyle
].join("");

export class CuSlider extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label","hint","value","min","max","step","name","disabled","aria-label"];
  }
  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this,css,
      '<label><span class="top"><span class="label" part="label"></span>' +
      '<output part="value"></output></span><input part="input" type="range">' +
      '<span class="hint" part="hint"></span></label>');
    this._input = root.querySelector("input");
    this._label = root.querySelector(".label");
    this._output = root.querySelector("output");
    this._hint = root.querySelector(".hint");
    this._initialized = false;
    const changed = type => {
      this._syncValue();
      notify(this,type,{value:this.value});
    };
    this._input.addEventListener("input",()=>changed("cu-input"));
    this._input.addEventListener("change",()=>changed("cu-change"));
  }
  connectedCallback() {
    if (!this._initialized) {
      this._defaultValue = this.getAttribute("value");
      this._initialized = true;
    }
    this._sync();
  }
  attributeChangedCallback(name) {
    if (!this._input) return;
    if (name === "value" && this._initialized) this._input.value = this.getAttribute("value") ?? "50";
    this._sync();
  }
  formDisabledCallback(disabled) { this._formDisabled = disabled; this._sync(); }
  formResetCallback() {
    const min = Number(this._input.min || 0);
    const max = Number(this._input.max || 100);
    this._input.value = this._defaultValue ?? String((min + max) / 2);
    this._syncValue();
  }
  formStateRestoreCallback(value) { this.value = Number(value); }
  get value() { return this._input.valueAsNumber; }
  set value(next) {
    if (Number.isFinite(Number(next))) this._input.value = String(next);
    this._syncValue();
  }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  focus(options) { this._input.focus(options); }
  _sync() {
    if (!this._input) return;
    this._label.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    this._input.min = this.getAttribute("min") ?? "0";
    this._input.max = this.getAttribute("max") ?? "100";
    this._input.step = this.getAttribute("step") || "1";
    this._input.disabled = this.disabled || Boolean(this._formDisabled);
    const ariaLabel = this.getAttribute("aria-label");
    if (ariaLabel) this._input.setAttribute("aria-label",ariaLabel);
    else this._input.removeAttribute("aria-label");
    if (this._initialized && this._defaultValue !== undefined && !this._valueInitialized) {
      if (this._defaultValue !== null) this._input.value = this._defaultValue;
      this._valueInitialized = true;
    }
    this._syncValue();
  }
  _syncValue() {
    if (!this._input) return;
    this._output.textContent = String(this.value);
    this._internals?.setFormValue(this.disabled || this._formDisabled ? null : String(this.value));
  }
}
define("cu-slider",CuSlider);
