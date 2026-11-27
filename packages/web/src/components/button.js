
import { BrowserElement, mount, notify, define, buttonStyle } from "./_shared.js";
import "./spinner.js";

export class CuButton extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["disabled", "loading", "variant", "size", "type", "aria-label"];
  }

  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, buttonStyle,
      '<button part="button" type="button"><cu-spinner class="spinner" exportparts="spinner" hidden aria-hidden="true"></cu-spinner><slot></slot></button>');
    this._control = root.querySelector("button");
    this._spinner = root.querySelector(".spinner");
    this._control.addEventListener("click", event => {
      if (this.disabled || this.loading) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const type = this.type;
      if (type === "submit") {
        const form = this._internals?.form ?? this.closest("form");
        if (form) form.requestSubmit();
      } else if (type === "reset") {
        const form = this._internals?.form ?? this.closest("form");
        if (form) form.reset();
      }
      notify(this, "cu-press", {type});
    });
  }

  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  formDisabledCallback(disabled) { this._formDisabled = disabled; this._sync(); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  get loading() { return this.hasAttribute("loading"); }
  set loading(value) { this.toggleAttribute("loading", Boolean(value)); }
  get type() {
    const type = this.getAttribute("type") || "button";
    return ["button", "submit", "reset"].includes(type) ? type : "button";
  }
  set type(value) { this.setAttribute("type", String(value)); }
  focus(options) { this._control.focus(options); }
  click() { this._control.click(); }

  _sync() {
    if (!this._control) return;
    this._control.disabled = this.disabled || this.loading || Boolean(this._formDisabled);
    this._control.setAttribute("aria-busy", String(this.loading));
    const label = this.getAttribute("aria-label");
    if (label) this._control.setAttribute("aria-label", label);
    else this._control.removeAttribute("aria-label");
    this._spinner.hidden = !this.loading;
  }
}

define("cu-button", CuButton);
