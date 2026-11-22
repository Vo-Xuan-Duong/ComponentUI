
import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";

/**
 * Fluent Calm select-only combobox.
 * Declarative <option> and <optgroup> children are data, rendered into an
 * accessible Shadow DOM listbox. No native OS dropdown popup is used.
 * Accessible combobox semantics: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */
const css = [
  ":host{display:block;min-width:0;position:relative;font-family:var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ":host([open]){z-index:80;}",
  ".field{display:grid;gap:7px;min-width:0;}",
  ".label{font-size:13px;font-weight:600;color:var(--cu-text,#242424);cursor:default;}",
  ".label:empty,.hint:empty,.error:empty{display:none;}",
  ".anchor{position:relative;min-width:0;}",
  ".control{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;",
  "gap:12px;width:100%;min-height:var(--cu-control-height,40px);padding:0 12px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-surface,#fff);color:var(--cu-text,#242424);",
  "font:400 14px var(--cu-font-body,system-ui);cursor:pointer;outline:none;",
  "transition:border-color var(--cu-motion-fast,100ms),background var(--cu-motion-fast,100ms);}",
  ".control:hover:not([aria-disabled=true]){background:var(--cu-surface-alt,#fafafa);}",
  ".control:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);}",
  ":host([open]) .control{border-bottom-color:var(--cu-accent,#0067c0);",
  "background:var(--cu-surface-alt,#fafafa);}",
  ".control[aria-disabled=true]{opacity:.5;cursor:not-allowed;}",
  ".control[aria-invalid=true]{border-bottom-color:var(--cu-danger,#c42b1c);}",
  ".value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  ".value.is-placeholder{color:var(--cu-text-muted,#616161);}",
  ".chevron{width:16px;height:16px;flex:none;color:var(--cu-text-muted,#616161);",
  "transition:transform var(--cu-motion-normal,160ms);}",
  ":host([open]) .chevron{transform:rotate(180deg);color:var(--cu-accent,#0067c0);}",
  ".popup{position:absolute;top:calc(100% + 5px);left:0;right:0;z-index:1;",
  "box-sizing:border-box;max-height:264px;overflow:auto;overscroll-behavior:contain;",
  "padding:5px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);",
  "color:var(--cu-text,#242424);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0 / .16));}",
  ".popup[hidden]{display:none!important;}",
  ".anchor[data-placement=top] .popup{top:auto;bottom:calc(100% + 5px);}",
  ".group+.group,.group+.option,.option+.group{margin-top:4px;}",
  ".group{padding:4px 0;}",
  ".group-title{padding:7px 10px 6px;color:var(--cu-text-muted,#616161);",
  "font:650 11px/1.3 var(--cu-font-body,system-ui);letter-spacing:.035em;}",
  ".group[aria-disabled=true]{opacity:.55;}",
  ".option{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;",
  "gap:10px;min-height:35px;padding:8px 10px;",
  "border-radius:var(--cu-radius-md,6px);",
  "font:400 13px/1.35 var(--cu-font-body,system-ui);cursor:pointer;",
  "transition:background var(--cu-motion-fast,100ms),box-shadow var(--cu-motion-fast,100ms);}",
  ".option[aria-disabled=true]{opacity:.42;cursor:not-allowed;}",
  // Pointer hover and keyboard-active option share a single visual treatment.
  // 20% accent tint plus a 3px inset accent indicator stays legible in Dark/Light.
  ".option:hover:not([aria-disabled=true]),",
  ".option[data-active=true]:not([aria-disabled=true]){",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 20%,var(--cu-surface-elevated,#fff));",
  "font-weight:600;}",
  ".option[data-selected=true]:not([aria-disabled=true]){font-weight:600;}",
  ".check{width:16px;height:16px;flex:none;opacity:0;color:var(--cu-accent,#0067c0);}",
  ".option[data-selected=true] .check{opacity:1;}",
  ".hint,.error{font-size:12px;line-height:1.4;}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  "slot{display:none!important;}",
  "@media(max-width:420px){.popup{max-height:220px;}}",
  "@media(prefers-reduced-motion:reduce){.chevron,.control,.option{transition:none;}}",
  "@media(forced-colors:active){",
  ".control:focus-visible{outline:2px solid Highlight;}",
  ".option:hover:not([aria-disabled=true]),",
  ".option[data-active=true]:not([aria-disabled=true]){outline:2px solid Highlight;outline-offset:-2px;}",
  ".option[data-selected=true] .check{color:Highlight;}}",
  focusStyle
].join("");

let selectId = 0;
const isOption = node => node.localName === "option";
const isGroup = node => node.localName === "optgroup";

// Pure helper so option normalization can be tested without browser globals.
export function normalizeSelectOptions(entries) {
  const results = [];
  for (const item of entries) {
    if (item.tag === "option") {
      results.push({
        value:String(item.value ?? item.label ?? ""),
        label:String(item.label ?? ""),
        disabled:Boolean(item.disabled),
        group:item.group ?? null,
        selected:Boolean(item.selected)
      });
    }
  }
  return results;
}

function collectOptions(host) {
  const entries = [];
  const walk = (parent, group = null, groupDisabled = false) => {
    for (const node of parent.children) {
      if (isOption(node)) {
        entries.push({
          tag:"option",
          value:node.getAttribute("value") ?? node.textContent.trim(),
          label:node.getAttribute("label") ?? node.textContent.trim(),
          selected:node.hasAttribute("selected"),
          disabled:groupDisabled || node.hasAttribute("disabled"),
          group
        });
      } else if (isGroup(node)) {
        const name = node.getAttribute("label") ?? "";
        walk(node, name, groupDisabled || node.hasAttribute("disabled"));
      }
    }
  };
  walk(host);
  return normalizeSelectOptions(entries);
}

export class CuSelect extends BrowserElement {
  static formAssociated = true;
  static get observedAttributes() {
    return ["label","hint","error","name","required","disabled","value","aria-label","placeholder"];
  }

  constructor() {
    super();
    this._internals = this.attachInternals?.() ?? null;
    const root = mount(this,css,
      '<div class="field"><div class="label" part="label"></div><div class="anchor">' +
      '<div class="control" part="control" role="combobox" tabindex="0"' +
      ' aria-haspopup="listbox" aria-expanded="false"><span class="value" part="value"></span>' +
      '<cu-icon name="chevron-down" size="16" class="chevron" part="chevron"></cu-icon></div>' +
      '<div class="popup" part="popup" role="listbox" hidden></div></div>' +
      '<div class="hint" part="hint"></div><div class="error" part="error"></div></div><slot></slot>');
    this._control = root.querySelector(".control");
    this._anchor = root.querySelector(".anchor");
    this._popup = root.querySelector(".popup");
    this._valueText = root.querySelector(".value");
    this._label = root.querySelector(".label");
    this._hint = root.querySelector(".hint");
    this._error = root.querySelector(".error");
    this._options = [];
    this._optionNodes = [];
    this._value = "";
    this._active = -1;
    this._open = false;
    this._initialized = false;
    this._observer = null;
    this._typeahead = "";
    this._lastTypeahead = 0;
    this._uid = "cu-select-" + ++selectId;
    this._control.setAttribute("aria-controls",this._uid + "-listbox");
    this._popup.id = this._uid + "-listbox";
    this._label.id = this._uid + "-label";
    this._hint.id = this._uid + "-hint";
    this._error.id = this._uid + "-error";

    this._label.addEventListener("click",() => this.focus());
    this._control.addEventListener("click",() => {
      if (this._isDisabled()) return;
      this._open ? this.hide() : this.show();
    });
    this._control.addEventListener("keydown",event => this._onKeydown(event));
    this._popup.addEventListener("pointerdown",event => {
      // Keep DOM focus on the combobox; keyboard and screen reader focus agree.
      if (event.target.closest('[role="option"]')) event.preventDefault();
    });
    this._popup.addEventListener("click",event => {
      const option = event.target.closest('[role="option"]');
      if (!option || option.getAttribute("aria-disabled") === "true") return;
      this._commit(Number(option.dataset.index));
    });
    // Mouse/pen hover updates the same active option used by Arrow keys.
    // Keep focus on the combobox and avoid scrollIntoView on pointer hover.
    this._popup.addEventListener("pointerover",event => {
      if (!this._open || event.pointerType === "touch") return;
      const option = event.target.closest('[role="option"]');
      if (!option || option.getAttribute("aria-disabled") === "true") return;
      const index = Number(option.dataset.index);
      if (!Number.isSafeInteger(index) || index < 0 || index >= this._options.length ||
          index === this._active) return;
      this._active = index;
      this._syncActive({scroll:false});
    });
    this._onDocumentPointer = event => {
      if (this._open && !event.composedPath().includes(this)) this.hide();
    };
    this._onViewportChange = () => { if (this._open) this._placePopup(); };
    this._onBlur = event => {
      if (this._open && !this.contains(event.relatedTarget) &&
          !this.shadowRoot.contains(event.relatedTarget)) this.hide();
    };
  }

  connectedCallback() {
    this._renderOptions();
    this._sync();
    if (globalThis.MutationObserver) {
      this._observer?.disconnect();
      this._observer = new MutationObserver(records => {
        const changed = records.some(record => record.target !== this &&
          (record.type === "childList" || record.type === "characterData" ||
           ["value","label","selected","disabled"].includes(record.attributeName)));
        if (changed) this._renderOptions();
      });
      this._observer.observe(this,{
        childList:true,subtree:true,characterData:true,attributes:true,
        attributeFilter:["value","label","selected","disabled"]
      });
    }
    document.addEventListener("pointerdown",this._onDocumentPointer);
    window.addEventListener("resize",this._onViewportChange);
    window.addEventListener("scroll",this._onViewportChange,true);
    this._control.addEventListener("blur",this._onBlur);
  }
  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
    document.removeEventListener("pointerdown",this._onDocumentPointer);
    window.removeEventListener("resize",this._onViewportChange);
    window.removeEventListener("scroll",this._onViewportChange,true);
    this._control.removeEventListener("blur",this._onBlur);
  }
  attributeChangedCallback(name) {
    if (!this._control) return;
    if (name === "value" && this._initialized)
      this._setValue(this.getAttribute("value") ?? "");
    if (name === "disabled" && this._isDisabled()) this.hide();
    this._sync();
  }
  formDisabledCallback(disabled) {
    this._formDisabled = disabled;
    if (disabled) this.hide();
    this._sync();
  }
  formResetCallback() { this._setValue(this._defaultValue ?? ""); this.hide(); }
  formStateRestoreCallback(value) { this.value = String(value ?? ""); }
  get value() { return this._value; }
  set value(next) { this._setValue(String(next ?? "")); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(next) { this.toggleAttribute("disabled",Boolean(next)); }
  get required() { return this.hasAttribute("required"); }
  set required(next) { this.toggleAttribute("required",Boolean(next)); }
  get open() { return this._open; }
  focus(options) { this._control.focus(options); }
  checkValidity() { return this._internals?.checkValidity() ?? this._valid(); }
  reportValidity() {
    if (this._internals) return this._internals.reportValidity();
    const valid = this._valid();
    if (!valid) this.focus();
    return valid;
  }

  show() {
    if (this._isDisabled() || !this._options.length || this._open) return;
    this._open = true;
    this.toggleAttribute("open",true);
    this._popup.hidden = false;
    this._control.setAttribute("aria-expanded","true");
    this._active = this._options.findIndex(o => o.value === this._value && !o.disabled);
    if (this._active < 0) this._active = this._enabledIndices()[0] ?? -1;
    this._syncActive();
    this._placePopup();
    this.focus();
  }
  hide() {
    if (!this._open) return;
    this._open = false;
    this.toggleAttribute("open",false);
    this._popup.hidden = true;
    this._control.setAttribute("aria-expanded","false");
    this._control.removeAttribute("aria-activedescendant");
  }
  toggle() { this._open ? this.hide() : this.show(); }

  _isDisabled() { return this.disabled || Boolean(this._formDisabled); }
  _enabledIndices() {
    return this._options.flatMap((option,index) => option.disabled ? [] : [index]);
  }
  _valid() {
    return this._isDisabled() || !this.required ||
      (this._value !== "" && this._options.some(o => o.value === this._value && !o.disabled));
  }
  _setValue(next) {
    const validOption = this._options.find(o => o.value === next && !o.disabled);
    this._value = validOption ? validOption.value : "";
    this._syncValue();
  }
  _renderOptions() {
    const options = collectOptions(this);
    const previous = this._value;
    this._options = options;
    this._optionNodes = [];
    this._popup.replaceChildren();
    let currentGroup = null;
    let target = this._popup;
    options.forEach((option,index) => {
      if (option.group !== currentGroup) {
        currentGroup = option.group;
        if (currentGroup !== null) {
          const group = document.createElement("div");
          group.className = "group";
          group.setAttribute("role","group");
          group.setAttribute("aria-label",currentGroup || "Group");
          const title = document.createElement("div");
          title.className = "group-title";
          title.textContent = currentGroup;
          group.append(title);
          this._popup.append(group);
          target = group;
        } else target = this._popup;
      }
      const item = document.createElement("div");
      item.className = "option";
      item.id = this._uid + "-option-" + index;
      item.dataset.index = String(index);
      item.setAttribute("role","option");
      item.setAttribute("aria-disabled",String(option.disabled));
      item.setAttribute("aria-selected","false");
      const text = document.createElement("span");
      text.textContent = option.label;
      const check = document.createElement("span");
      check.className = "check";
      check.setAttribute("aria-hidden","true");
      check.textContent = "✓";
      item.append(text,check);
      target.append(item);
      this._optionNodes.push(item);
    });
    if (!this._initialized) {
      const explicit = this.getAttribute("value");
      const marked = options.find(o => o.selected && !o.disabled);
      const fallback = options.find(o => !o.disabled);
      this._defaultValue = explicit ?? marked?.value ?? fallback?.value ?? "";
      this._initialized = true;
      this._setValue(this._defaultValue);
    } else this._setValue(previous);
    if (this._open) {
      this._active = this._options.findIndex(o => o.value === this._value && !o.disabled);
      if (this._active < 0) this._active = this._enabledIndices()[0] ?? -1;
      this._syncActive();
    }
  }
  _sync() {
    if (!this._control) return;
    this._label.textContent = this.getAttribute("label") || "";
    this._hint.textContent = this.getAttribute("hint") || "";
    this._error.textContent = this.getAttribute("error") || "";
    const label = this.getAttribute("aria-label");
    if (label) {
      this._control.setAttribute("aria-label",label);
      this._control.removeAttribute("aria-labelledby");
    } else if (this._label.textContent) {
      this._control.setAttribute("aria-labelledby",this._label.id);
      this._control.removeAttribute("aria-label");
    } else {
      this._control.setAttribute("aria-label","Select an option");
      this._control.removeAttribute("aria-labelledby");
    }
    const descriptions = [this._hint.textContent && this._hint.id,
      this._error.textContent && this._error.id].filter(Boolean);
    if (descriptions.length) this._control.setAttribute("aria-describedby",descriptions.join(" "));
    else this._control.removeAttribute("aria-describedby");
    this._control.setAttribute("aria-required",String(this.required));
    this._control.setAttribute("aria-disabled",String(this._isDisabled()));
    this._control.setAttribute("aria-invalid",String(Boolean(this._error.textContent) || !this._valid()));
    this._control.tabIndex = this._isDisabled() ? -1 : 0;
    this._syncValue();
  }
  _syncValue() {
    if (!this._valueText) return;
    const selected = this._options.find(o => o.value === this._value && !o.disabled);
    this._valueText.textContent = selected?.label || this.getAttribute("placeholder") || "Select an option…";
    this._valueText.classList.toggle("is-placeholder",!this._value);
    this._optionNodes.forEach((node,index) => {
      const selected = this._value !== "" &&
        this._options[index].value === this._value && !this._options[index].disabled;
      node.dataset.selected = String(selected);
      // aria-selected reflects the committed value, not the hovered option.
      node.setAttribute("aria-selected",String(selected));
    });
    this._syncForm();
  }
  _syncForm() {
    if (!this._control) return;
    this._internals?.setFormValue(this._isDisabled() ? null : this._value);
    if (this._internals) {
      const error = this.getAttribute("error");
      if (this._isDisabled()) this._internals.setValidity({});
      else if (error) this._internals.setValidity({customError:true},error,this._control);
      else if (!this._valid()) this._internals.setValidity(
        {valueMissing:true},"Please select an option.",this._control);
      else this._internals.setValidity({});
    }
    this._control.setAttribute("aria-invalid",
      String(Boolean(this.getAttribute("error")) || !this._valid()));
  }
  _syncActive({scroll=true} = {}) {
    this._optionNodes.forEach((node,index) => {
      const active = this._open && index === this._active;
      node.dataset.active = String(active);
    });
    const node = this._optionNodes[this._active];
    if (this._open && node) {
      this._control.setAttribute("aria-activedescendant",node.id);
      if (scroll) node.scrollIntoView({block:"nearest"});
    } else this._control.removeAttribute("aria-activedescendant");
  }
  _move(direction) {
    const enabled = this._enabledIndices();
    if (!enabled.length) return;
    let index = enabled.indexOf(this._active);
    if (index === -1) index = direction < 0 ? 0 : -1;
    this._active = enabled[(index+direction+enabled.length)%enabled.length];
    this._syncActive();
  }
  _commit(index) {
    const option = this._options[index];
    if (!option || option.disabled) return;
    const previous = this._value;
    this._setValue(option.value);
    this.hide();
    this.focus();
    if (this._value !== previous) {
      notify(this,"cu-input",{value:this.value});
      notify(this,"cu-change",{value:this.value});
    }
  }
  _onKeydown(event) {
    if (this._isDisabled()) return;
    const enabled = this._enabledIndices();
    if (!enabled.length) return;
    const key = event.key;
    if (key === "Escape" && this._open) {event.preventDefault();this.hide();return;}
    if (key === "Tab") {this.hide();return;}
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (this._open) this._commit(this._active);
      else this.show();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!this._open) { this.show(); return; }
      this._move(key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (key === "Home" || key === "End") {
      event.preventDefault();
      if (!this._open) this.show();
      this._active = key === "Home" ? enabled[0] : enabled[enabled.length-1];
      this._syncActive();
      return;
    }
    if (!event.ctrlKey && !event.altKey && !event.metaKey && key.length === 1 &&
        !/\s/u.test(key)) {
      const now = Date.now();
      this._typeahead = now-this._lastTypeahead > 650 ? key : this._typeahead+key;
      this._lastTypeahead = now;
      const search = this._typeahead.toLocaleLowerCase();
      const starting = enabled.indexOf(this._active);
      const rotated = enabled.slice(starting+1).concat(enabled.slice(0,starting+1));
      const match = rotated.find(index =>
        this._options[index].label.toLocaleLowerCase().startsWith(search));
      if (match !== undefined) {
        event.preventDefault();
        if (!this._open) this.show();
        this._active = match;
        this._syncActive();
      }
    }
  }
  _placePopup() {
    if (!this._open) return;
    const rect = this._control.getBoundingClientRect();
    const availableBelow = window.innerHeight-rect.bottom-12;
    const availableAbove = rect.top-12;
    const needed = Math.min(this._popup.scrollHeight+12,264);
    const above = availableBelow < Math.min(needed,160) && availableAbove > availableBelow;
    this._anchor.dataset.placement = above ? "top" : "bottom";
    this._popup.style.maxHeight = Math.max(100,
      Math.min(264,above ? availableAbove-8 : availableBelow-8))+"px";
  }
}

define("cu-select",CuSelect);
