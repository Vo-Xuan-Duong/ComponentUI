
import { BrowserElement, mount, notify, define, fieldStyle } from "./_shared.js";
import { syncFieldValidity, wireFieldValidation } from "./_field.js";

/** Browser-native calendar input, with localized UI provided by the browser. */
export class CuDatePicker extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label","hint","error","name","value","min","max","required","disabled","readonly","aria-label"];
  }
  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, fieldStyle,
      '<label><span class="label" part="label"></span><input type="date" part="input">' +
      '<span class="hint" part="hint"></span><span class="error" part="error"></span></label>');
    this._input = root.querySelector("input");
    this._label = root.querySelector(".label");
    this._hint = root.querySelector(".hint");
    this._error = root.querySelector(".error");
    this._initialized = false;
    this._input.addEventListener("input", () => {
      this._syncForm();
      notify(this, "cu-input", {value:this.value});
    });
    this._input.addEventListener("change", () => {
      this._syncForm();
      notify(this, "cu-change", {value:this.value});
    });
    wireFieldValidation(this,this._input,()=>this._syncForm());
  }
  connectedCallback() {
    if (!this._initialized) {
      this._defaultValue = this.getAttribute("value") ?? "";
      if(!this._valueAssigned)this._input.value = this._defaultValue;
      this._initialized = true;
    }
    this._sync();
  }
  attributeChangedCallback(name) {
    if (!this._input) return;
    if (name === "value" && this._initialized) {
      this._defaultValue=this.getAttribute("value")??"";
      this.value=this._defaultValue;
    }
    this._sync();
  }
  formDisabledCallback(disabled) { this._formDisabled = disabled; this._sync(); }
  formResetCallback() { this._validationRevealed=false;this.value = this._defaultValue ?? ""; }
  formStateRestoreCallback(value) { this.value = String(value ?? ""); }
  get value() { return this._input.value; }
  set value(value) { this._valueAssigned=true;this._input.value = String(value ?? ""); this._syncForm(); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled",Boolean(value)); }
  get required() { return this.hasAttribute("required"); }
  set required(value) { this.toggleAttribute("required",Boolean(value)); }
  focus(options) { this._input.focus(options); }
  checkValidity() { return this._internals?.checkValidity() ?? this._input.checkValidity(); }
  reportValidity() { return this._internals?.reportValidity() ?? this._input.reportValidity(); }
  _sync() {
    if (!this._input) return;
    this._label.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    this._error.textContent = this.getAttribute("error") || "";
    this._input.min = this.getAttribute("min") || "";
    this._input.max = this.getAttribute("max") || "";
    this._input.required = this.required;
    this._input.disabled = this.disabled || Boolean(this._formDisabled);
    this._input.readOnly = this.hasAttribute("readonly");
    this._input.name = ""; // ElementInternals submits the host, not the shadow input.
    const accessibleName = this.getAttribute("aria-label");
    if (accessibleName) this._input.setAttribute("aria-label", accessibleName);
    else if(this._label.textContent)this._input.setAttribute("aria-label",this._label.textContent);
    else this._input.removeAttribute("aria-label");
    this._syncForm();
  }
  _syncForm() {
    syncFieldValidity(this,this._input);
  }
}
define("cu-date-picker",CuDatePicker);
