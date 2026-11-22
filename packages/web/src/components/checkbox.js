
import { BrowserElement, mount, notify, define, toggleStyle } from "./_shared.js";

/** Native checkbox input powers both checkbox and switch custom elements. */
export class CuCheckbox extends BrowserElement {
  static formAssociated = true;
  static kind = "checkbox";
  static get observedAttributes() { return ["checked","disabled","name","value","required"]; }

  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, toggleStyle,
      '<label><input part="control" type="checkbox"><span part="label"><slot></slot></span></label>');
    this._input = root.querySelector("input");
    this._input.addEventListener("change", () => {
      // Reflect current state so CSS, framework bindings and assistive APIs
      // can observe it; reset restores the captured initial default.
      this.toggleAttribute("checked", this._input.checked);
      this._syncFormValue();
      notify(this, "cu-change", {checked:this.checked, value:this.value});
    });
  }

  connectedCallback() {
    this.setAttribute("data-kind", this.constructor.kind);
    if (this._defaultChecked === undefined) this._defaultChecked = this.hasAttribute("checked");
    this._input.setAttribute("role", this.constructor.kind === "switch" ? "switch" : "checkbox");
    this._sync();
  }
  attributeChangedCallback() { this._sync(); }
  formDisabledCallback(disabled) { this._formDisabled = disabled; this._sync(); }
  formResetCallback() { this.checked = Boolean(this._defaultChecked); }
  formStateRestoreCallback(value) { this.checked = value !== null && value !== "false"; }
  get checked() { return this._input.checked; }
  set checked(value) {
    this.toggleAttribute("checked", Boolean(value));
    this._input.checked = Boolean(value);
    this._syncFormValue();
  }
  get value() { return this.getAttribute("value") ?? "on"; }
  set value(value) { this.setAttribute("value", String(value)); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  focus(options) { this._input.focus(options); }

  _sync() {
    if (!this._input) return;
    this._input.checked = this.hasAttribute("checked");
    this._input.disabled = this.disabled || Boolean(this._formDisabled);
    this._input.required = this.hasAttribute("required");
    this._input.name = this.getAttribute("name") || "";
    this._input.value = this.value;
    this._syncFormValue();
  }
  _syncFormValue() {
    this._internals?.setFormValue(this.checked ? this.value : null);
    if (!this._internals) return;
    if (this._input.required && !this.checked) {
      this._internals.setValidity({valueMissing:true}, "Please select this option.", this._input);
    } else this._internals.setValidity({});
  }
}

define("cu-checkbox", CuCheckbox);
