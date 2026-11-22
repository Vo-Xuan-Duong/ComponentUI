
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

/**
 * Declarative <cu-radio> entries are data-only option elements.
 * <cu-radio-group> mirrors them as native radios within its Shadow Root.
 */
export class CuRadio extends BrowserElement {
  static get observedAttributes() { return ["value","disabled","checked"]; }
}
define("cu-radio", CuRadio);

const css = [
  ":host{display:block;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  "fieldset{border:0;padding:0;margin:0;min-width:0;}",
  "legend{font-size:13px;font-weight:600;padding:0;margin:0 0 8px;}",
  ".options{display:flex;flex-direction:column;gap:12px;}",
  ":host([orientation=horizontal]) .options{flex-direction:row;flex-wrap:wrap;gap:16px;}",
  "label{display:inline-flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;}",
  "input{appearance:auto;accent-color:var(--cu-accent,#0067c0);width:17px;height:17px;margin:0;cursor:pointer;}",
  "input:disabled{cursor:not-allowed;opacity:.5;}",
  "label:has(input:disabled){opacity:.6;cursor:not-allowed;}",
  ".hint{font-size:12px;color:var(--cu-text-muted,#616161);margin-top:7px;}",
  ".hint:empty,legend:empty{display:none;}",
  "slot{display:none!important;}",
  focusStyle
].join("");

export class CuRadioGroup extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label","name","value","required","disabled","orientation","hint","aria-label"];
  }
  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this, css,
      '<fieldset part="fieldset"><legend part="legend"></legend>' +
      '<div class="options" part="options"></div><div class="hint" part="hint"></div></fieldset><slot></slot>');
    this._fieldset = root.querySelector("fieldset");
    this._legend = root.querySelector("legend");
    this._options = root.querySelector(".options");
    this._hint = root.querySelector(".hint");
    this._observer = null;
    this._initialized = false;
  }
  connectedCallback() {
    this._render();
    this._sync();
    this._observer = new MutationObserver(records => {
      if (records.some(r => r.type === "childList" ||
        ["value","disabled","checked"].includes(r.attributeName))) this._render();
    });
    this._observer.observe(this, {childList:true,subtree:true,attributes:true,
      attributeFilter:["value","disabled","checked"]});
  }
  disconnectedCallback() { this._observer?.disconnect(); this._observer = null; }
  attributeChangedCallback(name) {
    if (!this._options) return;
    if (name === "value" && this._initialized) this.value = this.getAttribute("value") || "";
    this._sync();
  }
  formDisabledCallback(value) { this._formDisabled = value; this._sync(); }
  formResetCallback() { this.value = this._defaultValue ?? ""; }
  formStateRestoreCallback(value) { this.value = String(value ?? ""); }
  get value() { return this._options.querySelector("input:checked")?.value ?? ""; }
  set value(next) {
    const target = String(next ?? "");
    for (const input of this._options.querySelectorAll("input")) input.checked = input.value === target;
    this._syncForm();
  }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  get required() { return this.hasAttribute("required"); }
  set required(value) { this.toggleAttribute("required", Boolean(value)); }
  focus(options) {
    const item = this._options.querySelector("input:checked:not(:disabled)") ??
      this._options.querySelector("input:not(:disabled)");
    item?.focus(options);
  }
  checkValidity() { return this._internals?.checkValidity() ?? Boolean(this.value || !this.required); }
  reportValidity() { return this._internals?.reportValidity() ?? this.checkValidity(); }

  _render() {
    if (!this._options) return;
    const previous = this._initialized ? this.value : null;
    const items = [...this.children].filter(node => node.localName === "cu-radio");
    this._options.replaceChildren();
    items.forEach((item, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "choice";
      input.value = item.getAttribute("value") ?? String(index);
      input.disabled = item.hasAttribute("disabled");
      const text = document.createElement("span");
      text.textContent = item.textContent.trim();
      label.append(input,text);
      input.addEventListener("change", () => {
        this._syncForm();
        notify(this, "cu-change", {value:this.value});
      });
      this._options.append(label);
    });
    if (!this._initialized) {
      const checkedIndex = items.findIndex(x => x.hasAttribute("checked"));
      const checkedValue = checkedIndex < 0 ? "" :
        (items[checkedIndex].getAttribute("value") ?? String(checkedIndex));
      const initial = this.getAttribute("value") ?? checkedValue;
      this.value = initial;
      this._defaultValue = this.value;
      this._initialized = true;
    } else this.value = previous;
    this._sync();
  }
  _sync() {
    if (!this._fieldset) return;
    this._legend.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    const ariaLabel = this.getAttribute("aria-label");
    if (ariaLabel) this._fieldset.setAttribute("aria-label", ariaLabel);
    else this._fieldset.removeAttribute("aria-label");
    this._fieldset.disabled = this.disabled || Boolean(this._formDisabled);
    this._syncForm();
  }
  _syncForm() {
    const selected = this.value;
    this._internals?.setFormValue(this.disabled || this._formDisabled || !selected ? null : selected);
    if (!this._internals) return;
    if (this.required && !selected && !this.disabled && !this._formDisabled) {
      this._internals.setValidity({valueMissing:true},
        "Select one option.", this._options.querySelector("input") || undefined);
    } else this._internals.setValidity({});
  }
}

define("cu-radio-group", CuRadioGroup);
