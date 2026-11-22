
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

/**
 * Native select inside Shadow DOM. Declarative light-DOM <option> elements
 * are safely cloned; only option/optgroup nodes are accepted.
 */
const css = [
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "label{display:grid;gap:7px;font-size:13px;font-weight:600;}",
  ".label:empty,.hint:empty,.error:empty{display:none;}",
  "select{box-sizing:border-box;width:100%;min-width:0;min-height:var(--cu-control-height,40px);",
  "padding:0 12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);",
  "color:var(--cu-text,#242424);font:400 14px var(--cu-font-body,system-ui);}",
  "select:focus-visible{border-bottom-color:var(--cu-accent,#0067c0);}",
  "select:disabled{opacity:.55;cursor:not-allowed;}",
  ".hint,.error{font-size:12px;font-weight:400;}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  "select[aria-invalid=true]{border-bottom-color:var(--cu-danger,#c42b1c);}",
  "slot{display:none!important;}",
  focusStyle
].join("");

function copyOptions(source, target) {
  for (const item of source.children) {
    const tag = item.localName;
    if (tag === "option") {
      const option = document.createElement("option");
      option.textContent = item.textContent;
      option.value = item.getAttribute("value") ?? item.textContent.trim();
      option.disabled = item.hasAttribute("disabled");
      option.selected = item.hasAttribute("selected");
      target.append(option);
    } else if (tag === "optgroup") {
      const group = document.createElement("optgroup");
      group.label = item.getAttribute("label") || "";
      group.disabled = item.hasAttribute("disabled");
      copyOptions(item, group);
      target.append(group);
    }
  }
}

export class CuSelect extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label","hint","error","name","required","disabled","value","aria-label"];
  }
  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, css,
      '<label><span class="label" part="label"></span><select part="select"></select>' +
      '<span class="hint" part="hint"></span><span class="error" part="error"></span></label><slot></slot>');
    this._select = root.querySelector("select");
    this._label = root.querySelector(".label");
    this._hint = root.querySelector(".hint");
    this._error = root.querySelector(".error");
    this._observer = null;
    this._initialized = false;
    this._select.addEventListener("change", () => {
      this._syncForm();
      notify(this, "cu-change", { value: this.value });
    });
  }
  connectedCallback() {
    this._renderOptions();
    this._sync();
    this._observer = new MutationObserver(records => {
      if (records.some(r => r.type === "childList" ||
          ["value","selected","disabled","label"].includes(r.attributeName))) {
        this._renderOptions();
      }
    });
    this._observer.observe(this, {
      childList:true, subtree:true, attributes:true,
      attributeFilter:["value","selected","disabled","label"]
    });
  }
  disconnectedCallback() { this._observer?.disconnect(); this._observer = null; }
  attributeChangedCallback(name) {
    if (!this._select) return;
    // Mutating a child option does not call host attributeChangedCallback.
    if (name === "value" && this._initialized) this._select.value = this.getAttribute("value") ?? "";
    this._sync();
  }
  formDisabledCallback(value) { this._formDisabled = value; this._sync(); }
  formResetCallback() {
    this._select.value = this._defaultValue ?? "";
    this._syncForm();
  }
  formStateRestoreCallback(value) { this.value = String(value ?? ""); }

  get value() { return this._select.value; }
  set value(next) { this._select.value = String(next ?? ""); this._syncForm(); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(next) { this.toggleAttribute("disabled", Boolean(next)); }
  get required() { return this.hasAttribute("required"); }
  set required(next) { this.toggleAttribute("required", Boolean(next)); }
  focus(options) { this._select.focus(options); }
  checkValidity() { return this._internals?.checkValidity() ?? this._select.checkValidity(); }
  reportValidity() { return this._internals?.reportValidity() ?? this._select.reportValidity(); }

  _renderOptions() {
    if (!this._select) return;
    const previous = this._initialized ? this._select.value : null;
    this._select.replaceChildren();
    copyOptions(this, this._select);
    if (!this._initialized) {
      this._select.value = this.getAttribute("value") ?? this._select.value;
      this._defaultValue = this._select.value;
      this._initialized = true;
    } else {
      this._select.value = previous;
    }
    this._syncForm();
  }
  _sync() {
    if (!this._select) return;
    this._label.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    this._error.textContent = this.getAttribute("error") || "";
    this._select.required = this.required;
    this._select.disabled = this.disabled || Boolean(this._formDisabled);
    // The shadow select must not be counted as an additional submitted control.
    this._select.name = "";
    const label = this.getAttribute("aria-label");
    if (label) this._select.setAttribute("aria-label", label);
    else this._select.removeAttribute("aria-label");
    this._select.setAttribute("aria-invalid", String(Boolean(this.getAttribute("error"))));
    this._syncForm();
  }
  _syncForm() {
    if (!this._select) return;
    this._internals?.setFormValue(this.disabled || this._formDisabled ? null : this.value);
    if (!this._internals) return;
    const customError = this.getAttribute("error");
    if (customError) this._internals.setValidity({customError:true}, customError, this._select);
    else if (!this._select.checkValidity()) {
      this._internals.setValidity(this._select.validity, this._select.validationMessage, this._select);
    } else this._internals.setValidity({});
  }
}
define("cu-select", CuSelect);
