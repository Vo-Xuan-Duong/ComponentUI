import { BrowserElement, mount, define, focusStyle } from "./_shared.js";

/** One labeled row of settings; app supplies interactive control in control slot. */
const css=[
  ":host{display:block;min-width:0;container-type:inline-size;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]),:host([data-cu-filter-hidden]){display:none!important;}",
  ".row{display:flex;align-items:center;justify-content:space-between;gap:20px;",
  "min-height:64px;padding:14px 20px;box-sizing:border-box;}",
  ".copy{display:grid;gap:5px;min-width:0;flex:1;}",
  ".label{font:600 13px var(--cu-font-body,system-ui);}",
  ".description{font:400 12px/1.5 var(--cu-font-body,system-ui);",
  "color:var(--cu-text-muted,#616161);}",
  ".description:empty{display:none;}",
  ".control{display:flex;justify-content:flex-end;align-items:center;flex:none;min-width:0;}",
  "::slotted(*){max-width:100%;}",
  "@container(max-width:420px){.row{flex-wrap:wrap;gap:12px;}",
  ".control{width:100%;justify-content:flex-start;}}",
  "@media(max-width:560px){.row{padding:13px 15px;}}",
  focusStyle
].join("");

export class CuSettingsItem extends BrowserElement {
  static get observedAttributes(){return ["label","description"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="row" part="row"><div class="copy" part="copy">' +
      '<span class="label" part="label"></span><span class="description" part="description"></span>' +
      '</div><div class="control" part="control"><slot name="control"></slot></div></div>');
    this._label=root.querySelector(".label");
    this._description=root.querySelector(".description");
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  _sync(){
    if(!this._label)return;
    this._label.textContent=this.getAttribute("label")??"";
    this._description.textContent=this.getAttribute("description")??"";
  }
}
define("cu-settings-item",CuSettingsItem);
