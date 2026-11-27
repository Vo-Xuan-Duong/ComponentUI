import {CuTextField} from "./text-field.js";
import {define} from "./_shared.js";
import {syncFieldValidity} from "./_field.js";
// Accept common separators; do not guess a country's dialing plan.
export function normalizePhoneNumber(value){
  const text=String(value??"").trim();
  if(!/^\+?[0-9().\s-]*$/.test(text))return "";
  const digits=text.replace(/\D/g,"");
  return digits?(text.startsWith("+")?"+":"")+digits:"";
}
export function isInternationalPhone(value){return /^\+[1-9][0-9]{7,14}$/.test(normalizePhoneNumber(value));}
export class CuPhoneInput extends CuTextField{
  static get observedAttributes(){return [...super.observedAttributes,"international"];}
  get normalizedValue(){return normalizePhoneNumber(this.value);}
  _sync(){
    if(!this._input)return;
    super._sync();
    this._input.type="tel";this._input.inputMode="tel";
    this._input.autocomplete=this.getAttribute("autocomplete")||"tel";
    this._syncFormValue();
  }
  _syncFormValue(){
    if(!this._input)return;
    const raw=this.value.trim(),normalized=this.normalizedValue,locked=this._input.disabled||this._input.readOnly;
    const valid=!raw||(this.hasAttribute("international")?isInternationalPhone(raw):/^\+?[0-9]{3,15}$/.test(normalized));
    syncFieldValidity(this,this._input,{additionalError:!valid&&!locked?"Enter a valid phone number.":""});
  }
}
define("cu-phone-input",CuPhoneInput);
