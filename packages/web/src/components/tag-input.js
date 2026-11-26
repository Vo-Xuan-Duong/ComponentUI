import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
export function normalizeTags(value,{max=Infinity,maxLength=Infinity,caseSensitive=false}={}){
  if(!Array.isArray(value))return [];
  const seen=new Set(),out=[];
  for(const item of value){
    if(out.length>=max)break;
    if(typeof item!=="string")continue;
    const tag=item.trim();if(!tag||tag.length>maxLength)continue;
    const key=caseSensitive?tag:tag.toLowerCase();if(seen.has(key))continue;
    seen.add(key);out.push(tag);
  }
  return out;
}
const css=[
  ":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ".field{display:grid;gap:7px;}.label{font-weight:600;}.label:empty,.hint:empty,.error:empty{display:none;}",
  ".control{box-sizing:border-box;display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-height:var(--cu-control-height,40px);padding:5px 8px;border:1px solid var(--cu-border-strong,#d1d1d1);border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);}",
  ".control:hover:not([data-disabled=true]),.control:focus-within{border-color:var(--cu-accent,#0067c0);}.control:has(input:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}.control[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.control[data-disabled=true]{opacity:.55;}",
  ".tags{display:contents;}.tag{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%;padding:3px 5px 3px 9px;border-radius:999px;background:var(--cu-state-selected);}.tag span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  "input{min-width:80px;flex:1;width:90px;height:30px;border:0;padding:0 3px;background:transparent;font:inherit;color:inherit;outline:none;}input:focus-visible{outline:none;}",
  "button{display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:inherit;cursor:pointer;padding:3px;flex:none;}button:hover:not(:disabled){background:var(--cu-state-pressed);}button:disabled{opacity:.5;cursor:default;}",
  ".hint,.error,.count{font-size:12px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}.meta{display:flex;justify-content:space-between;gap:8px;}.count:empty{display:none;}",
  ".status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}",focusStyle
].join("");
export class CuTagInput extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","label","hint","error","name","placeholder","max-tags","max-tag-length","case-sensitive","required","disabled","readonly","aria-label"];}
  constructor(){
    super();this._internals=this.attachInternals?.()??null;this._value=[];
    const root=mount(this,css,'<div class="field"><label class="label" for="tag-input"></label><div class="control" part="control"><div class="tags" role="group" aria-label="Tags"></div><input id="tag-input" autocomplete="off"><button class="add" type="button" aria-label="Add tag"><cu-icon name="plus" size="16"></cu-icon></button></div><div class="meta"><span class="hint" id="tag-hint"></span><span class="count"></span></div><div class="error" id="tag-error" role="alert"></div><span class="status" role="status"></span></div>');
    for(const [k,q] of Object.entries({label:".label",control:".control",tags:".tags",input:"input",add:".add",hint:".hint",count:".count",error:".error",status:".status"}))this["_"+k]=root.querySelector(q);
    this._input.addEventListener("input",()=>this._syncDraft());
    this._input.addEventListener("keydown",e=>{
      if(this._locked()||e.isComposing)return;
      if(e.key==="Enter"||e.key===","){if(!this._input.value.trim()&&e.key==="Enter")return;e.preventDefault();this._commitDraft();}
      else if(e.key==="Backspace"&&!this._input.value&&this._value.length){e.preventDefault();this.removeTag(this._value.at(-1));}
    });
    this._input.addEventListener("paste",e=>{
      if(this._locked()||!e.clipboardData)return;
      const text=e.clipboardData.getData("text");if(!/[,\r\n]/.test(text))return;
      e.preventDefault();const before=this._input.value.slice(0,this._input.selectionStart??0),after=this._input.value.slice(this._input.selectionEnd??this._input.value.length);
      const parts=(before+text+after).split(/[,\r\n]+/);const next=normalizeTags([...this._value,...parts],this._options());
      if(next.length!==this._value.length){this._value=next;this._input.value="";this._changed("Tags added");}
      else{this._status.textContent="No new tags added.";this._syncDraft();}
    });
    this._add.addEventListener("click",()=>{this._commitDraft();this.focus();});
    this.addEventListener("invalid",()=>{this._reveal=true;this._syncForm();});
  }
  connectedCallback(){if(!this._initialized){this._default=this._readDefault();if(!this._assigned)this._value=normalizeTags(this._default,this._options());this._initialized=true;}this._sync();}
  attributeChangedCallback(name){if(!this._input)return;if(name==="value"&&this._initialized){this._default=this._readDefault();this.value=this._default;return;}this._sync();}
  _readDefault(){try{const v=JSON.parse(this.getAttribute("value")??"[]");return Array.isArray(v)?v:[];}catch{return [];}}
  _limit(name){const raw=this.getAttribute(name);const n=raw==null||!raw.trim()?Infinity:Number(raw);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Infinity;}
  _options(){return {max:this._limit("max-tags"),maxLength:this._limit("max-tag-length"),caseSensitive:this.hasAttribute("case-sensitive")};}
  get value(){return [...this._value];}
  set value(v){this._assigned=true;this._value=normalizeTags(v,this._options());this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  _locked(){return this.disabled||Boolean(this._formDisabled)||this.hasAttribute("readonly");}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this._input.value="";this.value=this._default??[];}
  formStateRestoreCallback(v){try{this.value=JSON.parse(v);}catch{this.value=[];}}
  focus(options){this._input.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._syncForm();return this._internals?.reportValidity()??this._valid;}
  addTag(value){
    if(this._locked())return false;
    const next=normalizeTags([...this._value,value],this._options());if(next.length===this._value.length)return false;
    this._value=next;this._changed("Tag added");return true;
  }
  removeTag(value){
    if(this._locked()||!this._value.includes(value))return false;
    this._value=this._value.filter(v=>v!==value);this._changed("Tag removed");return true;
  }
  _commitDraft(){
    const draft=this._input.value.trim();if(!draft)return;
    if(this.addTag(draft)){this._input.value="";this._syncDraft();}else this._status.textContent="Tag is duplicate or exceeds a limit.";
  }
  _changed(message){this._sync();this._status.textContent=message;const detail={value:this.value,values:this.value};notify(this,"cu-input",detail);notify(this,"cu-change",detail);}
  _syncDraft(){this._add.disabled=Boolean(this._locked()||!this._input.value.trim()||this._value.length>=this._options().max);}
  _sync(){
    if(!this._input)return;
    this._value=normalizeTags(this._value,this._options());
    const locked=this._locked(),max=this._options().max;
    this._label.textContent=this.getAttribute("label")||"";
    this._input.setAttribute("aria-label",this.getAttribute("aria-label")||this._label.textContent||"Add tags");
    this._input.placeholder=this.getAttribute("placeholder")||"Add a tag…";
    this._input.disabled=this.disabled||Boolean(this._formDisabled);this._input.readOnly=this.hasAttribute("readonly");
    this._control.dataset.disabled=String(this._input.disabled);this._hint.textContent=this.getAttribute("hint")||"";
    this._count.textContent=Number.isFinite(max)?this._value.length+"/"+max:this._value.length+" tags";
    const doc=this.ownerDocument;
    this._tags.replaceChildren(...this._value.map(value=>{
      const tag=doc.createElement("span");tag.className="tag";const text=doc.createElement("span");text.textContent=value;tag.append(text);
      if(!locked){const b=doc.createElement("button");b.type="button";b.setAttribute("aria-label","Remove "+value);const icon=doc.createElement("cu-icon");icon.setAttribute("name","x");icon.setAttribute("size","14");b.append(icon);b.addEventListener("click",()=>{this.removeTag(value);this.focus();});tag.append(b);}return tag;
    }));
    this._syncDraft();this._syncForm();
  }
  _syncForm(){
    const error=this.getAttribute("error")||"",invalid=!this._locked()&&(Boolean(error)||(this.required&&!this._value.length));
    this._valid=!invalid;const message=error||"Add at least one tag.",revealed=invalid&&(Boolean(error)||this._reveal);
    this._error.textContent=revealed?message:"";this._control.dataset.invalid=String(Boolean(revealed));this._input.setAttribute("aria-invalid",String(Boolean(revealed)));this._input.setAttribute("aria-required",String(this.required));
    const desc=[this._hint.textContent?"tag-hint":"",revealed?"tag-error":""].filter(Boolean).join(" ");if(desc)this._input.setAttribute("aria-describedby",desc);else this._input.removeAttribute("aria-describedby");
    const data=new FormData(),name=this.getAttribute("name");if(name)for(const v of this._value)data.append(name,v);
    this._internals?.setFormValue(this.disabled||this._formDisabled?null:data,JSON.stringify(this._value));
    if(invalid)this._internals?.setValidity(error?{customError:true}:{valueMissing:true},message,this._input);else this._internals?.setValidity({});
  }
}
define("cu-tag-input",CuTagInput);
