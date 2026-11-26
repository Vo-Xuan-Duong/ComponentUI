
import { BrowserElement, mount, notify, define, fieldStyle } from "./_shared.js";
import { syncFieldValidity, wireFieldValidation } from "./_field.js";

const TEXT_TYPES = new Set(["text", "email", "password", "search", "tel", "url"]);

export class CuTextField extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label", "hint", "error", "type", "value", "placeholder", "name",
      "required", "disabled", "readonly", "aria-label", "autocomplete", "minlength", "maxlength", "pattern", "inputmode"];
  }

  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, fieldStyle,
      '<label><span part="label" class="label"></span><input part="input"><span class="hint" part="hint"></span><span class="error" part="error"></span></label>');
    this._input = root.querySelector("input");
    this._label = root.querySelector(".label");
    this._hint = root.querySelector(".hint");
    this._error = root.querySelector(".error");
    this._input.addEventListener("input", () => {
      this._syncFormValue();
      notify(this, "cu-input", {value:this.value});
    });
    this._input.addEventListener("change", () => {
      this._syncFormValue();
      notify(this, "cu-change", {value:this.value});
    });
    wireFieldValidation(this,this._input,()=>this._syncFormValue());
  }

  connectedCallback() {
    if(!this._initialized){
      if(!this._valueAssigned)this._input.value=this.getAttribute("value")??"";
      this._initialized=true;
    }
    this._sync();
  }
  attributeChangedCallback(name) {
    if(name==="value"&&this._initialized)this.value=this.getAttribute("value")??"";
    this._sync();
  }
  formDisabledCallback(disabled) { this._formDisabled = disabled; this._sync(); }
  formResetCallback() { this._validationRevealed=false;this.value = this.getAttribute("value") ?? ""; }
  formStateRestoreCallback(value) { this.value = String(value ?? ""); }
  get value() { return this._input.value; }
  set value(value) {
    this._valueAssigned=true;
    this._input.value = String(value ?? "");
    this._syncFormValue();
  }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  get required() { return this.hasAttribute("required"); }
  set required(value) { this.toggleAttribute("required", Boolean(value)); }
  focus(options) { this._input.focus(options); }
  checkValidity() { return this._internals?.checkValidity() ?? this._input.checkValidity(); }
  reportValidity() { return this._internals?.reportValidity() ?? this._input.reportValidity(); }

  _sync() {
    if (!this._input) return;
    const type = this.getAttribute("type") || "text";
    this._input.type = TEXT_TYPES.has(type) ? type : "text";
    this._label.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    this._error.textContent = this.getAttribute("error") || "";
    this._input.placeholder = this.getAttribute("placeholder") || "";
    this._input.name = ""; // ElementInternals submits the host.
    this._input.required = this.required;
    this._input.disabled = this.disabled || Boolean(this._formDisabled);
    this._input.readOnly = this.hasAttribute("readonly");
    this._input.autocomplete = this.getAttribute("autocomplete") || "off";
    const ariaLabel = this.getAttribute("aria-label");
    if (ariaLabel) this._input.setAttribute("aria-label", ariaLabel);
    else if(this._label.textContent)this._input.setAttribute("aria-label",this._label.textContent);
    else this._input.removeAttribute("aria-label");
    for (const name of ["minlength", "maxlength", "pattern", "inputmode"]) {
      if (this.hasAttribute(name)) this._input.setAttribute(name, this.getAttribute(name));
      else this._input.removeAttribute(name);
    }
    this._input.defaultValue = this.getAttribute("value")??"";
    this._syncFormValue();
  }

  _syncFormValue() {
    syncFieldValidity(this,this._input);
  }
}

define("cu-text-field", CuTextField);
