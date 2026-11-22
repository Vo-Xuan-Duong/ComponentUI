import { BrowserElement, mount, define, focusStyle } from "./_shared.js";

/** A section inside cu-settings-page. Controls remain native slotted content. */
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]),:host([data-cu-filter-hidden]){display:none!important;}",
  "section{min-width:0;border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-xl,12px);background:var(--cu-surface,#fff);",
  "overflow:hidden;}",
  ".heading{display:grid;gap:5px;padding:17px 20px;",
  "border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "h3{margin:0;font:650 15px var(--cu-font-body,system-ui);}",
  "p{margin:0;color:var(--cu-text-muted,#616161);font:400 12px/1.5 var(--cu-font-body,system-ui);}",
  "p:empty{display:none;}",
  "slot{display:block;}",
  "::slotted(cu-settings-item:not(:first-child)){border-top:1px solid var(--cu-border,#e5e5e5);}",
  "@media(max-width:560px){.heading{padding:14px 15px;}}",
  focusStyle
].join("");

export class CuSettingsGroup extends BrowserElement {
  static get observedAttributes(){return ["label","description"];}
  constructor(){
    super();
    const root=mount(this,css,'<section part="group" aria-label="Settings group">' +
      '<div class="heading" part="heading"><h3 part="label"></h3>' +
      '<p part="description"></p></div><slot></slot></section>');
    this._section=root.querySelector("section");
    this._label=root.querySelector("h3");
    this._description=root.querySelector("p");
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  _sync(){
    if(!this._section)return;
    this._label.textContent=this.getAttribute("label")??"";
    this._description.textContent=this.getAttribute("description")??"";
    this._section.setAttribute("aria-label",this._label.textContent||"Settings group");
  }
}
define("cu-settings-group",CuSettingsGroup);
