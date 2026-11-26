import {BrowserElement,mount,define,notify,buttonStyle} from "./_shared.js";
const css=buttonStyle+":host([pressed]) button{background:var(--cu-state-selected);border-color:var(--cu-accent,#0067c0);color:var(--cu-accent,#0067c0);}:host([pressed][variant=accent]) button{background:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);}";
export class CuToggleButton extends BrowserElement{
  static get observedAttributes(){return ["pressed","disabled","loading","label","aria-label"];}
  constructor(){super();const root=mount(this,css,'<button type="button" part="button" aria-pressed="false"><span class="spinner" aria-hidden="true" hidden></span><slot></slot></button>');this._button=root.querySelector("button");this._spinner=root.querySelector(".spinner");this._button.addEventListener("click",()=>{if(this.disabled||this.loading)return;this.pressed=!this.pressed;notify(this,"cu-change",{pressed:this.pressed,value:this.pressed});notify(this,"cu-press",{type:"button",pressed:this.pressed});});}
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get pressed(){return this.hasAttribute("pressed");}set pressed(v){this.toggleAttribute("pressed",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
  focus(options){this._button.focus(options);}click(){this._button.click();}
  _sync(){if(!this._button)return;this._button.disabled=this.disabled||this.loading;this._spinner.hidden=!this.loading;this._button.setAttribute("aria-pressed",String(this.pressed));this._button.setAttribute("aria-busy",String(this.loading));const label=this.getAttribute("aria-label")||this.getAttribute("label");if(label)this._button.setAttribute("aria-label",label);else this._button.removeAttribute("aria-label");}
}
define("cu-toggle-button",CuToggleButton);
