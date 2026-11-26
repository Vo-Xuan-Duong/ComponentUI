import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.field{display:grid;gap:6px;min-width:0;}.label{font-weight:600;}.label:empty,.hint:empty,.error:empty{display:none;}.hint,.error{font-size:12px;line-height:1.5;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}";
export class CuFormField extends BrowserElement{
 static get observedAttributes(){return ["label","hint","error","required"];}
 constructor(){super();const root=mount(this,css,'<div class="field" role="group"><div class="label" id="field-label"></div><slot></slot><div class="hint" id="field-hint"></div><div class="error" id="field-error" role="status"></div></div>');this._field=root.querySelector(".field");this._label=root.querySelector(".label");this._hint=root.querySelector(".hint");this._error=root.querySelector(".error");}
 connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
 _sync(){if(!this._field)return;const label=this.getAttribute("label")||"",hint=this.getAttribute("hint")||"",error=this.getAttribute("error")||"";this._label.textContent=label+(label&&this.hasAttribute("required")?" *":"");this._hint.textContent=hint;this._error.textContent=error;if(label)this._field.setAttribute("aria-labelledby","field-label");else this._field.removeAttribute("aria-labelledby");const description=[hint?"field-hint":"",error?"field-error":""].filter(Boolean).join(" ");if(description)this._field.setAttribute("aria-describedby",description);else this._field.removeAttribute("aria-describedby");}
}
define("cu-form-field",CuFormField);
