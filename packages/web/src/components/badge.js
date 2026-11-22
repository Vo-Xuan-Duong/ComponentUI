
import { BrowserElement, mount, define } from "./_shared.js";

const css = [
  ":host{--badge-bg:var(--cu-surface-alt,#fafafa);--badge-fg:var(--cu-text,#242424);",
  "display:inline-flex;vertical-align:middle;max-width:100%;font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=accent]){--badge-bg:var(--cu-accent,#0067c0);--badge-fg:var(--cu-accent-text,#fff);}",
  ":host([tone=success]){--badge-bg:var(--cu-success-surface,#dff6dd);--badge-fg:var(--cu-success,#107c41);}",
  ":host([tone=warning]){--badge-bg:var(--cu-warning-surface,#fff4ce);--badge-fg:var(--cu-warning,#9a6700);}",
  ":host([tone=danger]){--badge-bg:var(--cu-danger-surface,#fde7e9);--badge-fg:var(--cu-danger,#c42b1c);}",
  ".badge{display:inline-flex;align-items:center;gap:6px;max-width:100%;box-sizing:border-box;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:999px;padding:3px 10px;",
  "background:var(--badge-bg);color:var(--badge-fg);",
  "font:600 12px/1.4 var(--cu-font-body,system-ui);}",
  ":host([tone=accent]) .badge,:host([tone=success]) .badge,",
  ":host([tone=warning]) .badge,:host([tone=danger]) .badge{border-color:transparent;}",
  ":host([size=sm]) .badge{padding:2px 7px;font-size:11px;}",
  ":host([size=lg]) .badge{padding:5px 12px;font-size:13px;}",
  ".dot{display:none;width:7px;height:7px;border-radius:50%;background:currentColor;flex:none;}",
  ":host([dot]) .dot{display:block;}",
  "slot{min-width:0;overflow:hidden;text-overflow:ellipsis;}"
].join("");

export class CuBadge extends BrowserElement {
  constructor() {
    super();
    mount(this,css,
      '<span class="badge" part="badge"><span class="dot" part="dot" aria-hidden="true"></span>' +
      '<slot></slot></span>');
  }
}
define("cu-badge",CuBadge);
