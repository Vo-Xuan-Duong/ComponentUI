import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
export class CuKbd extends BrowserElement{
 constructor(){super();mount(this,":host{display:inline-flex;vertical-align:middle;}kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;min-height:20px;padding:1px 5px;box-sizing:border-box;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;border-radius:4px;background:var(--cu-surface-alt,#fafafa);color:var(--cu-text,#242424);font:600 11px ui-monospace,monospace;white-space:nowrap;}","<kbd part=\"key\"><slot></slot></kbd>");}
}
define("cu-kbd",CuKbd);
