import { BrowserElement, mount, notify, define, fieldStyle } from "./_shared.js";
import { fieldValidity, wireFieldValidation } from "./_field.js";

function isISODate(value){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!match)return false;
  const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
  const leap=y%4===0&&(y%100!==0||y%400===0);
  return y>0&&m>=1&&m<=12&&d>=1&&d<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
}
export function splitDateRange(value){
  const parts=String(value??"").split("/");
  if(parts.length!==2)return {start:"",end:""};
  return {start:isISODate(parts[0])?parts[0]:"",end:isISODate(parts[1])?parts[1]:""};
}
export function dateRangeValidity(start,end,{required=false,min="",max=""}={}){
  const result=(flag,message,field)=>({flags:flag?{[flag]:true}:{},message,field});
  if(!start&&!end&&!required)return result("","","start");
  if(!start||!end)return result("valueMissing","Choose both start and end dates.",start?"end":"start");
  for(const [field,value] of [["start",start],["end",end]]){
    if(!isISODate(value))return result("badInput","Enter a valid date.",field);
    if(isISODate(min)&&value<min)return result("rangeUnderflow","Date must be on or after "+min+".",field);
    if(isISODate(max)&&value>max)return result("rangeOverflow","Date must be on or before "+max+".",field);
  }
  if(end<start)return result("customError","End date must be on or after start date.","end");
  return result("","","start");
}

const css=fieldStyle+
  "fieldset{border:0;margin:0;padding:0;min-inline-size:0;display:grid;gap:7px;}"+
  "legend{padding:0;margin-bottom:7px;font-size:13px;font-weight:600;}"+
  ".range{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:10px;}"+
  ".range label{font-weight:400;color:var(--cu-text-muted,#616161);min-width:0;}"+
  ".range input{color:var(--cu-text,#242424);}";

export class CuDateRangePicker extends BrowserElement {
  static formAssociated=true;
  static get observedAttributes(){return ["label","hint","error","name","value","min","max",
    "required","disabled","readonly","aria-label","start-label","end-label"];}
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<fieldset><legend part="label"></legend><div class="range">'+
      '<label><span class="start-label"></span><input type="date" part="start"></label>'+
      '<label><span class="end-label"></span><input type="date" part="end"></label></div>'+
      '<span class="hint" id="range-hint" part="hint"></span>'+
      '<span class="error" id="range-error" part="error" role="alert"></span></fieldset>');
    this._group=root.querySelector("fieldset");
    this._label=root.querySelector("legend");
    this._startLabel=root.querySelector(".start-label");
    this._endLabel=root.querySelector(".end-label");
    this._start=root.querySelector('[part="start"]');
    this._end=root.querySelector('[part="end"]');
    this._hint=root.querySelector(".hint");
    this._error=root.querySelector(".error");
    for(const input of [this._start,this._end]){
      for(const type of ["input","change"])input.addEventListener(type,()=>{
        this._syncForm();
        notify(this,"cu-"+type,{value:this.value,start:this.start,end:this.end});
      });
      wireFieldValidation(this,input,()=>this._syncForm());
    }
  }
  connectedCallback(){
    if(!this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      if(!this._valueAssigned)this.value=this._defaultValue;
      this._initialized=true;
    }
    this._sync();
  }
  attributeChangedCallback(name){
    if(!this._start)return;
    if(name==="value"&&this._initialized){
      this._defaultValue=this.getAttribute("value")??"";
      this.value=this._defaultValue;
    }
    this._sync();
  }
  get start(){return this._start.value;}
  set start(value){this._valueAssigned=true;this._start.value=String(value??"");this._syncForm();}
  get end(){return this._end.value;}
  set end(value){this._valueAssigned=true;this._end.value=String(value??"");this._syncForm();}
  get value(){return this.start||this.end?this.start+"/"+this.end:"";}
  set value(value){
    const {start,end}=splitDateRange(value);
    this._valueAssigned=true;this._start.value=start;this._end.value=end;this._syncForm();
  }
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  formDisabledCallback(disabled){this._formDisabled=disabled;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.value=this._defaultValue??"";}
  formStateRestoreCallback(value){this.value=String(value??"");}
  focus(options){this._start.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._stateValid;}
  reportValidity(){
    this._validationRevealed=true;this._syncForm();
    if(this._internals)return this._internals.reportValidity();
    if(!this._stateValid)this._invalidInput?.focus();
    return this._stateValid;
  }
  _sync(){
    if(!this._start)return;
    this._label.textContent=this.getAttribute("label")||"Date range";
    this._group.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent);
    this._startLabel.textContent=this.getAttribute("start-label")||"Start date";
    this._endLabel.textContent=this.getAttribute("end-label")||"End date";
    this._hint.textContent=this.getAttribute("hint")||"";
    for(const input of [this._start,this._end]){
      input.min=this.getAttribute("min")||"";input.max=this.getAttribute("max")||"";
      input.required=this.required;input.disabled=this.disabled||Boolean(this._formDisabled);
      input.readOnly=this.hasAttribute("readonly");
    }
    this._syncForm();
  }
  _syncForm(){
    const barred=this.disabled||this._formDisabled||this.hasAttribute("readonly");
    const error=this.getAttribute("error")||"";
    let state={flags:{},message:"",field:"start"};
    if(!barred){
      state=dateRangeValidity(this.start,this.end,{required:this.required,
        min:this.getAttribute("min")||"",max:this.getAttribute("max")||""});
      for(const [field,input] of [["start",this._start],["end",this._end]]){
        const native=fieldValidity(input);
        if(native.invalid){state={flags:native.flags,message:native.message,field};break;}
      }
      if(error)state={flags:{customError:true},message:error,field:"start"};
    }
    this._stateValid=Object.keys(state.flags).length===0;
    this._invalidInput=state.field==="end"?this._end:this._start;
    const revealed=!this._stateValid&&Boolean(error||this._validationRevealed);
    const message=revealed?state.message:"";
    if(this._error.textContent!==message)this._error.textContent=message;
    for(const input of [this._start,this._end]){
      const invalid=revealed&&input===this._invalidInput;
      input.setAttribute("aria-invalid",String(invalid));
      const ids=[this._hint.textContent?"range-hint":"",invalid?"range-error":""].filter(Boolean);
      if(ids.length)input.setAttribute("aria-describedby",ids.join(" "));
      else input.removeAttribute("aria-describedby");
    }
    this._internals?.setFormValue(this.disabled||this._formDisabled?null:this.value);
    if(this._stateValid)this._internals?.setValidity({});
    else this._internals?.setValidity(state.flags,state.message,this._invalidInput);
  }
}
define("cu-date-range-picker",CuDateRangePicker);
