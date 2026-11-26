import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {syncFieldValidity,wireFieldValidation} from "./_field.js";

function otpLength(value){const n=value==null||String(value).trim()===""?6:Number(value);return Number.isFinite(n)?Math.max(1,Math.min(12,Math.floor(n))):6;}
export function normalizeOTP(value,length=6){return String(value??"").replace(/[^0-9]/g,"").slice(0,otpLength(length));}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".field{display:grid;gap:7px;}.label{font-weight:600;}.label:empty,.hint:empty,.error:empty{display:none;}",
  ".control{position:relative;max-width:440px;}.cells{display:grid;grid-template-columns:repeat(var(--length,6),minmax(0,1fr));gap:clamp(2px,1vw,8px);}",
  ".cell{box-sizing:border-box;display:grid;place-items:center;min-width:0;min-height:var(--cu-control-height,40px);aspect-ratio:1/1;max-height:56px;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);font:600 clamp(14px,3vw,20px)/1 ui-monospace,monospace;}",
  ".control:focus-within .cell[data-active=true]{border-color:var(--cu-accent,#0067c0);box-shadow:0 0 0 2px var(--cu-focus,#0067c0);}",
  ".control:focus-within .cell[data-selected=true]{background:var(--cu-state-selected);}.control[data-invalid=true] .cell{border-color:var(--cu-danger,#c42b1c);}.control[data-disabled=true]{opacity:.55;}",
  "input{position:absolute;inset:0;box-sizing:border-box;width:100%;height:100%;margin:0;opacity:0;cursor:text;font-size:16px;}input:disabled{cursor:not-allowed;}",
  ".hint,.error{font-size:12px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}",
  "@media(forced-colors:active){.control:focus-within .cell[data-active=true]{outline:2px solid Highlight;}.control:focus-within .cell[data-selected=true]{background:Highlight;color:HighlightText;}}",focusStyle
].join("");
export class CuOTPInput extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","length","label","hint","error","name","required","disabled","readonly","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,'<div class="field"><label for="otp-input" class="label"></label><div class="control" part="control"><div class="cells" aria-hidden="true"></div><input id="otp-input" part="input" type="text" inputmode="numeric" autocomplete="one-time-code" autocapitalize="off" spellcheck="false"></div><div class="hint"></div><div class="error" role="alert"></div></div>');
    for(const [k,q] of Object.entries({label:".label",control:".control",cells:".cells",input:"input",hint:".hint",error:".error"}))this["_"+k]=root.querySelector(q);
    this._input.addEventListener("input",e=>{if(!e.isComposing)this._edited();});
    this._input.addEventListener("compositionend",()=>this._edited());
    this._input.addEventListener("focus",()=>{this._lastCommitted=this.value;this._lastInput=this.value;});
    this._input.addEventListener("change",()=>this._commit());
    this._input.addEventListener("blur",()=>this._commit());
    this._input.addEventListener("paste",e=>{
      if(this._input.disabled||this._input.readOnly||!e.clipboardData)return;
      const text=e.clipboardData.getData("text");if(!text)return;e.preventDefault();
      const digits=normalizeOTP(text,this.length);if(!digits)return;
      const start=this._input.selectionStart??this.value.length,end=this._input.selectionEnd??start;
      this._input.value=digits.length===this.length?digits:this.value.slice(0,start)+digits+this.value.slice(end);
      const cursor=digits.length===this.length?this.length:Math.min(this.length,start+digits.length);
      this._input.setSelectionRange(cursor,cursor);this._edited();
    });
    for(const type of ["focus","select","keyup","pointerup","blur"])this._input.addEventListener(type,()=>this._paint());
    this._input.addEventListener("click",e=>{
      if(this._input.disabled)return;
      const cells=[...this._cells.children],at=cells.findIndex(cell=>e.clientX<=cell.getBoundingClientRect().right);
      const position=Math.min(this.value.length,at<0?this.length:at);
      this._input.setSelectionRange(position,position);this._paint();
    });
    wireFieldValidation(this,this._input,()=>this._syncForm());
  }
  connectedCallback(){
    if(!this._initialized){this._default=this.getAttribute("value")??"";if(!this._assigned)this._input.value=normalizeOTP(this._default,this.length);this._initialized=true;}
    this._sync();this._lastInput=this.value;this._lastCommitted=this.value;
  }
  attributeChangedCallback(name){
    if(!this._input)return;
    if(name==="value"&&this._initialized){this._default=this.getAttribute("value")??"";this.value=this._default;return;}
    this._sync();
  }
  get length(){return otpLength(this.getAttribute("length"));}set length(v){this.setAttribute("length",String(v));}
  get value(){return this._input.value;}
  set value(v){this._assigned=true;const next=normalizeOTP(v,this.length);if(next!==this.value){this._input.value=next;this._lastInput=next;this._lastCommitted=next;}this._sync();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.value=this._default??"";}
  formStateRestoreCallback(v){this.value=String(v??"");}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._input.checkValidity();}
  reportValidity(){this._validationRevealed=true;this._syncForm();return this._internals?.reportValidity()??this._input.reportValidity();}
  _edited(){
    const start=this._input.selectionStart??this.value.length;
    const cursor=normalizeOTP(this.value.slice(0,start),this.length).length;
    const next=normalizeOTP(this.value,this.length);
    if(next!==this.value){this._input.value=next;this._input.setSelectionRange(cursor,cursor);}
    this._syncForm();this._paint();
    if(this.value!==this._lastInput){this._lastInput=this.value;notify(this,"cu-input",{value:this.value,complete:this.value.length===this.length});}
  }
  _commit(){if(this.value===this._lastCommitted)return;this._lastCommitted=this.value;notify(this,"cu-change",{value:this.value,complete:this.value.length===this.length});}
  _paint(){
    const a=this._input.selectionStart??this.value.length,b=this._input.selectionEnd??a;
    const active=Math.min(a,this.length-1);
    [...this._cells.children].forEach((cell,i)=>{cell.textContent=this.value[i]??"";cell.dataset.active=String(i===active);cell.dataset.selected=String(i>=a&&i<b);});
  }
  _sync(){
    if(!this._input)return;
    this._label.textContent=this.getAttribute("label")||"Verification code";
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent);
    this._hint.textContent=this.getAttribute("hint")||"";
    this._input.required=this.required;this._input.disabled=this.disabled||Boolean(this._formDisabled);this._input.readOnly=this.hasAttribute("readonly");
    this._input.pattern="[0-9]{"+this.length+"}";
    const normalized=normalizeOTP(this.value,this.length);if(normalized!==this.value)this._input.value=normalized;
    this._control.dataset.disabled=String(this._input.disabled);this._cells.style.setProperty("--length",String(this.length));
    if(this._cells.children.length!==this.length)this._cells.replaceChildren(...Array.from({length:this.length},()=>{const cell=this.ownerDocument.createElement("span");cell.className="cell";return cell;}));
    this._syncForm();this._paint();
  }
  _syncForm(){syncFieldValidity(this,this._input,{wrapper:this._control});}
}
define("cu-otp-input",CuOTPInput);
