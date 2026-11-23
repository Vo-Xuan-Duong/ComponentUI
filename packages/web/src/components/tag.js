
import { BrowserElement, mount, define } from "./_shared.js";

const css=[
  ":host{--tag-fg:var(--cu-text-muted,#616161);--tag-bg:var(--cu-surface-alt,#fafafa);",
  "--tag-border:var(--cu-border-strong,#d1d1d1);display:inline-flex;max-width:100%;",
  "vertical-align:middle;color:var(--tag-fg);font:600 12px/1.4 var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=accent]){--tag-fg:var(--cu-accent,#0067c0);",
  "--tag-bg:color-mix(in srgb,var(--cu-accent,#0067c0) 10%,var(--cu-surface,#fff));",
  "--tag-border:color-mix(in srgb,var(--cu-accent,#0067c0) 35%,transparent);}",
  ":host([tone=success]){--tag-fg:var(--cu-success,#107c41);",
  "--tag-bg:var(--cu-success-surface,#dff6dd);--tag-border:var(--tag-fg);}",
  ":host([tone=warning]){--tag-fg:var(--cu-warning,#9a6700);",
  "--tag-bg:var(--cu-warning-surface,#fff4ce);--tag-border:var(--tag-fg);}",
  ":host([tone=danger]){--tag-fg:var(--cu-danger,#c42b1c);",
  "--tag-bg:var(--cu-danger-surface,#fde7e9);--tag-border:var(--tag-fg);}",
  ".tag{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;",
  "max-width:100%;min-height:25px;padding:3px 9px;border:1px solid transparent;",
  "border-radius:var(--cu-radius-md,6px);background:var(--tag-bg);color:var(--tag-fg);}",
  ":host([variant=outline]) .tag{border-color:var(--tag-border);background:transparent;}",
  ":host([variant=solid]) .tag{border-color:var(--tag-border);}",
  ":host([tone=neutral][variant=solid]) .tag{border-color:var(--cu-border-strong,#d1d1d1);}",
  ":host([size=sm]) .tag{min-height:21px;padding:2px 7px;font-size:11px;}",
  ":host([size=lg]) .tag{min-height:30px;padding:5px 11px;font-size:13px;}",
  ".dot{display:none;flex:none;width:7px;height:7px;border-radius:50%;background:currentColor;}",
  ":host([dot]) .dot{display:inline-block;}",
  "slot{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  "@media(forced-colors:active){.tag{border-color:CanvasText;}}"
].join("");

export class CuTag extends BrowserElement {
  constructor(){
    super();
    mount(this,css,
      '<span class="tag" part="tag"><span class="dot" part="dot" aria-hidden="true"></span>' +
      '<slot></slot></span>');
  }
}
define("cu-tag",CuTag);
