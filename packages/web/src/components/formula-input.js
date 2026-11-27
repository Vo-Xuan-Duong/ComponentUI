import {CuTextField} from "./text-field.js";
import {define} from "./_shared.js";
import {syncFieldValidity} from "./_field.js";
// Numeric expressions only; no eval, identifiers, calls or property access.
export function evaluateFormula(value){
  const source=String(value??"").trim().replace(/^=\s*/,"");
  if(!source)return {valid:false,result:null,error:"Enter an expression."};
  if(source.length>512)return {valid:false,result:null,error:"Expression too long."};
  let pos=0,depth=0;
  const skip=()=>{while(/\s/.test(source[pos]??"")&&pos<source.length)pos++;};
  const take=c=>{skip();if(source[pos]===c){pos++;return true;}return false;};
  function primary(){
    if(++depth>64)throw Error("Expression too deeply nested.");
    try{
      if(take("+"))return primary();
      if(take("-"))return -primary();
      if(take("(")){const n=expression();if(!take(")"))throw Error("Missing closing parenthesis.");return n;}
      skip();const m=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(source.slice(pos));
      if(!m)throw Error("Expected a number.");pos+=m[0].length;return Number(m[0]);
    }finally{depth--;}
  }
  function product(){let n=primary();for(;;){if(take("*"))n*=primary();else if(take("/")){const d=primary();if(d===0)throw Error("Division by zero.");n/=d;}else return n;}}
  function expression(){let n=product();for(;;){if(take("+"))n+=product();else if(take("-"))n-=product();else return n;}}
  try{const result=expression();skip();if(pos!==source.length)throw Error("Unexpected token.");if(!Number.isFinite(result))throw Error("Result is not finite.");return {valid:true,result,error:""};}
  catch(error){return {valid:false,result:null,error:error.message};}
}
export class CuFormulaInput extends CuTextField{
  get result(){return evaluateFormula(this.value).result;}
  get evaluation(){return evaluateFormula(this.value);}
  _syncFormValue(){
    if(!this._input)return;
    const state=this.evaluation,hint=this.getAttribute("hint")||"";
    const preview=this.value.trim()&&state.valid?"Result: "+state.result:"";
    this._hint.textContent=[hint,preview].filter(Boolean).join(" · ");
    syncFieldValidity(this,this._input,{additionalError:this.value&&!state.valid?state.error:""});
  }
}
define("cu-formula-input",CuFormulaInput);
