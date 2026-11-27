import {CuNumberField} from "./number-field.js";
import {define} from "./_shared.js";
export function formatCurrencyValue(value,currency="USD",locale="en-US"){
  if(value===""||value===null||value===undefined||!Number.isFinite(Number(value)))return "";
  try{return new Intl.NumberFormat(locale,{style:"currency",currency}).format(Number(value));}
  catch{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value));}
}
export class CuCurrencyInput extends CuNumberField{
  static get observedAttributes(){return [...super.observedAttributes,"currency","locale"];}
  get currency(){return this.getAttribute("currency")||"USD";}set currency(v){this.setAttribute("currency",String(v??"USD").toUpperCase());}
  get locale(){return this.getAttribute("locale")||"en-US";}set locale(v){this.setAttribute("locale",String(v??"en-US"));}
  get formattedValue(){return formatCurrencyValue(this.value,this.currency,this.locale);}
  _update(){
    if(!this._input)return;
    const hint=this.getAttribute("hint")||"",formatted=this.formattedValue;
    this._hint.textContent=[hint,formatted].filter(Boolean).join(" · ");
    super._update();
  }
}
define("cu-currency-input",CuCurrencyInput);
