import {BrowserElement,mount,define} from "./_shared.js";
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);}.surface{box-sizing:border-box;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);padding:var(--cu-surface-padding,16px);}:host([variant=flat]) .surface{border-color:transparent;}:host([variant=elevated]) .surface{background:var(--cu-surface-elevated,var(--cu-surface,#fff));box-shadow:var(--cu-shadow-flyout,0 8px 20px rgb(0 0 0/.12));}:host([size=sm]) .surface{padding:8px;}:host([size=lg]) .surface{padding:24px;}";
export class CuSurface extends BrowserElement{
  constructor(){super();mount(this,css,"<div class=\"surface\" part=\"surface\"><slot></slot></div>");}
}
define("cu-surface",CuSurface);
