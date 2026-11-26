/** Shared form-associated field validation; no browser globals at import time. */
const FLAGS=["badInput","customError","patternMismatch","rangeOverflow","rangeUnderflow",
  "stepMismatch","tooLong","tooShort","typeMismatch","valueMissing"];

export function fieldValidity(input,error=""){
  const barred=Boolean(input.disabled||input.readOnly||input.willValidate===false);
  const custom=String(error??"");
  if(barred)return {invalid:false,message:"",flags:{}};
  if(custom)return {invalid:true,message:custom,flags:{customError:true}};
  const flags={};
  for(const flag of FLAGS)if(input.validity?.[flag])flags[flag]=true;
  const invalid=Object.keys(flags).length>0;
  return {invalid,message:invalid?String(input.validationMessage||"Invalid value."):"",flags};
}

export function syncFieldDescriptions(input,hint,error){
  const descriptions=[];
  if(hint?.textContent){hint.id=hint.id||"cu-field-hint";descriptions.push(hint.id);}
  if(error?.textContent){error.id=error.id||"cu-field-error";descriptions.push(error.id);}
  if(descriptions.length)input.setAttribute("aria-describedby",descriptions.join(" "));
  else input.removeAttribute("aria-describedby");
}

/** Show native errors after blur or an explicit validity check, not on first paint.
 * Explicit consumer-provided errors are shown immediately.
 * Native validity remains authoritative even before the message is revealed.
 */
export function syncFieldValidity(host,input,{wrapper=null,hint=host._hint,errorNode=host._error}={}){
  const error=host.getAttribute("error")||"";
  input.setCustomValidity?.(input.disabled||input.readOnly?"":error);
  const state=fieldValidity(input,error);
  const revealed=state.invalid&&Boolean(error||host._validationRevealed);
  input.setAttribute("aria-invalid",String(revealed));
  if(wrapper)wrapper.dataset.invalid=String(revealed);
  if(errorNode){const message=revealed?state.message:"";if(errorNode.textContent!==message)errorNode.textContent=message;}
  syncFieldDescriptions(input,hint,errorNode);
  host._internals?.setFormValue(input.disabled?null:input.value);
  if(state.invalid)host._internals?.setValidity(state.flags,state.message,input);
  else host._internals?.setValidity({});
  return state;
}

export function wireFieldValidation(host,input,update){
  const reveal=()=>{
    if(host._validationRevealed)return;
    host._validationRevealed=true;
    update();
  };
  input.addEventListener("blur",reveal);
  input.addEventListener("invalid",reveal);
  host.addEventListener("invalid",reveal);
}
