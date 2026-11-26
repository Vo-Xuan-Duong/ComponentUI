
/**
 * Shared implementation for browser-native ComponentUI custom elements.
 * All templates and styles are static module-owned strings, never interpolated
 * with unsanitized user input. User-supplied labels use textContent or slots.
 */
export const BrowserElement = globalThis.HTMLElement ?? class {};

export function mount(element, css, markup) {
  const root = element.attachShadow({mode: "open"});
  root.innerHTML = "<style>" + css + "</style>" + markup;
  return root;
}

export function notify(element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, {
    bubbles: true, composed: true, detail
  }));
}

export function reflectBool(element, name, value) {
  element.toggleAttribute(name, Boolean(value));
}

export function define(tagName, constructor) {
  if (globalThis.customElements && !customElements.get(tagName)) {
    customElements.define(tagName, constructor);
  }
}

export const focusStyle = [
  // Shared state tokens are inherited by every Shadow DOM control. These
  // fallbacks also work when a consumer imports only tokens.css.
  ":host{--cu-state-hover:color-mix(in srgb,var(--cu-accent,#0067c0) 9%,var(--cu-surface,#fff));",
  "--cu-state-pressed:color-mix(in srgb,var(--cu-accent,#0067c0) 16%,var(--cu-surface,#fff));",
  "--cu-state-selected:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,var(--cu-surface,#fff));",
  "--cu-motion-ease:cubic-bezier(.2,.8,.2,1);}",
  ":focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:3px;}",
  "@media(forced-colors:active){:focus-visible{outline:2px solid Highlight;}}",
  "@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;}",
  "button:active{transform:none!important;}}"
].join("");

export const buttonStyle = [
  ":host{display:inline-flex;vertical-align:middle;font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:8px;",
  "width:100%;min-height:var(--cu-control-height,40px);border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);padding:0 16px;background:var(--cu-surface-alt,#fafafa);",
  "color:var(--cu-text,#242424);font:600 13px var(--cu-font-body,system-ui);cursor:pointer;",
  "transition:background-color var(--cu-motion-normal,160ms) var(--cu-motion-ease,ease),",
  "border-color var(--cu-motion-normal,160ms) var(--cu-motion-ease,ease),",
  "box-shadow var(--cu-motion-fast,100ms) ease,transform var(--cu-motion-fast,100ms) ease;}",
  "button:hover:not(:disabled){background:var(--cu-state-hover);border-color:var(--cu-accent,#0067c0);}",
  "button:active:not(:disabled){transform:translateY(1px) scale(.985);}",
  "button:disabled{cursor:not-allowed;opacity:.52;transform:none;}",
  "button:focus-visible{box-shadow:0 0 0 4px color-mix(in srgb,var(--cu-focus,#0067c0) 16%,transparent);}",
  ":host([variant=accent]) button{background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);}",
  ":host([variant=accent]) button:hover:not(:disabled){background:var(--cu-accent-hover,#005a9e);",
  "border-color:var(--cu-accent-hover,#005a9e);}",
  ":host([variant=subtle]) button{background:transparent;border-color:transparent;}",
  ":host([variant=outline]) button{background:transparent;}",
  ":host([variant=danger]) button{background:var(--cu-danger,#c42b1c);border-color:var(--cu-danger,#c42b1c);color:white;}",
  ":host([size=sm]) button{min-height:var(--cu-control-sm,28px);padding:0 12px;}",
  ":host([size=lg]) button{min-height:var(--cu-control-lg,40px);}",
  ":host([size=xl]) button{min-height:var(--cu-control-xl,48px);padding:0 20px;}",
  ":host([loading]) button{cursor:wait;}",
  ".spinner{width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;",
  "border-radius:50%;animation:spin .75s linear infinite;}",
  ".spinner[hidden]{display:none;}",
  "@keyframes spin{to{transform:rotate(360deg);}}",
  focusStyle
].join("");

export const fieldStyle = [
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  "label{display:grid;gap:7px;font-size:13px;font-weight:600;}",
  "input{box-sizing:border-box;display:block;width:100%;height:var(--cu-control-height,40px);min-width:0;",
  "padding:0 12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);color:var(--cu-text,#242424);",
  "font:400 14px var(--cu-font-body,system-ui);",
  "transition:background-color var(--cu-motion-fast,100ms) ease,",
  "border-color var(--cu-motion-fast,100ms) ease,",
  "box-shadow var(--cu-motion-fast,100ms) ease;}",
  "input::placeholder{color:var(--cu-text-muted,#616161);}",
  "input:hover:not(:disabled):not(:focus):not([readonly]){border-color:var(--cu-accent,#0067c0);",
  "background:var(--cu-surface-alt,#fafafa);}",
  "input:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);",
  "box-shadow:0 0 0 4px color-mix(in srgb,var(--cu-focus,#0067c0) 14%,transparent);}",
  "input:disabled{opacity:.55;cursor:not-allowed;}",
  "input[aria-invalid=true]{border-color:var(--cu-danger,#c42b1c);}",
  "input[readonly]{background:var(--cu-surface-alt,#fafafa);}",
  ".hint{font-size:12px;color:var(--cu-text-muted,#616161);font-weight:400;}",
  ".error{font-size:12px;color:var(--cu-danger,#c42b1c);font-weight:400;}",
  ".error:empty,.hint:empty,.label:empty{display:none;}",
  focusStyle
].join("");

export const toggleStyle = [
  ":host{display:inline-flex;vertical-align:middle;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  "label{display:inline-flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;}",
  "input{appearance:none;-webkit-appearance:none;box-sizing:border-box;position:relative;flex:none;margin:0;",
  "cursor:pointer;border:1px solid var(--cu-border-strong,#d1d1d1);background:var(--cu-surface,#fff);}",
  "input:disabled{opacity:.5;cursor:not-allowed;}",
  "label:hover input:not(:disabled):not(:checked){border-color:var(--cu-accent,#0067c0);}",
  "input:focus-visible{box-shadow:0 0 0 4px color-mix(in srgb,var(--cu-focus,#0067c0) 14%,transparent);}",
  ":host([disabled]) label{cursor:not-allowed;opacity:.6;}",
  ":host([data-kind=checkbox]) input{width:18px;height:18px;border-radius:4px;}",
  ":host([data-kind=checkbox]) input:checked{background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);}",
  ":host([data-kind=checkbox]) input:checked::after{content:'';position:absolute;",
  "width:5px;height:10px;left:5px;top:1px;border-style:solid;",
  "border-color:var(--cu-accent-text,#fff);border-width:0 2px 2px 0;",
  "transform:rotate(45deg);}",
  ":host([data-kind=switch]) input{width:42px;height:24px;border-radius:999px;background:var(--cu-border-strong,#d1d1d1);}",
  ":host([data-kind=switch]) input::before{content:'';position:absolute;left:3px;top:3px;",
  "height:16px;width:16px;border-radius:50%;background:var(--cu-text,#242424);",
  "transition:transform var(--cu-motion-normal,160ms) var(--cu-motion-ease,ease),",
  "background-color var(--cu-motion-normal,160ms) ease;}",
  ":host([data-kind=switch]) input:checked{background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);}",
  ":host([data-kind=switch]) input:checked::before{transform:translateX(18px);background:var(--cu-accent-text,#fff);}",
  focusStyle
].join("");
