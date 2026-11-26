import {BrowserElement,mount,define} from "./_shared.js";
const css=":host{display:block;box-sizing:border-box;width:100%;min-width:0;}.layout{box-sizing:border-box;margin-inline:auto;width:100%;max-width:var(--cu-container-max-width,1200px);padding-inline:var(--cu-container-padding,16px);}:host([size=sm]) .layout{max-width:640px;}:host([size=md]) .layout{max-width:900px;}:host([size=lg]) .layout{max-width:1200px;}:host([size=full]) .layout{max-width:none;}";
export class CuContainer extends BrowserElement{
  constructor(){super();mount(this,css,"<div class=\"layout\" part=\"container\"><slot></slot></div>");}
}
define("cu-container",CuContainer);
