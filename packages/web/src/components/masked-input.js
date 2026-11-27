import {CuTextField} from "./text-field.js";
import {define} from "./_shared.js";
const tokens={"#":/[0-9]/,"A":/[A-Za-z]/,"*":/[A-Za-z0-9]/};
export function applyInputMask(value,mask){
  const chars=Array.from(String(value??"")),pattern=Array.from(String(mask??""));
  if(!pattern.length)return {value:chars.join(""),rawValue:chars.join(""),complete:true};
  let pos=0,out="",raw="",pending="",slots=0;
  for(const part of pattern){
    const rule=tokens[part];
    if(!rule){if(chars[pos]===part)pos++;pending+=part;continue;}
    slots++;
    while(pos<chars.length&&!rule.test(chars[pos]))pos++;
    if(pos>=chars.length)continue;
    out+=pending+chars[pos];pending="";raw+=chars[pos++];
  }
  const complete=raw.length===slots;
  if(complete&&raw.length)out+=pending;
  return {value:out,rawValue:raw,complete};
}
export function inputMaskPattern(mask){
  return Array.from(String(mask??"")).map(c=>c==="#"?"[0-9]":c==="A"?"[A-Za-z]":c==="*"?"[A-Za-z0-9]":"\\u{"+c.codePointAt(0).toString(16)+"}").join("");
}
export class CuMaskedInput extends CuTextField{
  static get observedAttributes(){return [...super.observedAttributes,"mask"];}
  constructor(){
    super();
    this._input.addEventListener("input",event=>{
      if(!this.mask||event.isComposing)return;
      const input=this._input,previous=input.value,caret=input.selectionStart??previous.length;
      const result=applyInputMask(previous,this.mask);
      if(result.value!==previous){
        const before=applyInputMask(previous.slice(0,caret),this.mask).value.length;
        input.value=result.value;
        input.setSelectionRange(Math.min(before,input.value.length),Math.min(before,input.value.length));
      }
    },true);
  }
  get mask(){return this.getAttribute("mask")||"";}set mask(v){this.setAttribute("mask",String(v??""));}
  get rawValue(){return applyInputMask(this.value,this.mask).rawValue;}
  get value(){return super.value;}set value(v){super.value=applyInputMask(v,this.mask).value;}
  _sync(){
    if(!this._input)return;
    super._sync();
    if(this.mask){
      this._input.type="text";
      this._input.setAttribute("pattern",inputMaskPattern(this.mask));
      const formatted=applyInputMask(this._input.value,this.mask).value;
      if(formatted!==this._input.value)this._input.value=formatted;
      super._syncFormValue();
    }
  }
}
define("cu-masked-input",CuMaskedInput);
