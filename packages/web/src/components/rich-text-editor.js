import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const allowed=new Set(["P","DIV","BR","B","STRONG","I","EM","U","S","UL","OL","LI","BLOCKQUOTE","PRE","CODE"]);
const discard=new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","SVG","MATH","TEMPLATE","NOSCRIPT","VIDEO","AUDIO","IMG","LINK","META"]);
export function sanitizeRichText(value,doc=globalThis.document){
  if(!doc)return "";
  const input=doc.createElement("template"),out=doc.createElement("div");input.innerHTML=String(value??"");
  const visit=(node,target,depth)=>{if(depth>60)return;if(node.nodeType===3){target.append(doc.createTextNode(node.data));return;}if(node.nodeType!==1||discard.has(node.tagName))return;let dest=target;if(allowed.has(node.tagName)){dest=doc.createElement(node.tagName.toLowerCase());target.append(dest);}for(const child of node.childNodes)visit(child,dest,depth+1);};
  for(const child of input.content.childNodes)visit(child,out,0);return out.innerHTML;
}
const css=":host([hidden]){display:none!important;}:host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.label{font-weight:600;margin-bottom:6px;}.label:empty,.hint:empty,.error:empty{display:none;}.frame{border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);overflow:hidden;}.toolbar{display:flex;gap:4px;padding:6px;flex-wrap:wrap;border-bottom:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface-alt,#fafafa);}.toolbar button{min-width:32px;min-height:30px;background:transparent;color:inherit;border:1px solid transparent;border-radius:var(--cu-radius-md,6px);cursor:pointer;font:600 13px var(--cu-font-body,system-ui);}.toolbar button:hover:not(:disabled){background:var(--cu-state-hover);}.toolbar button:disabled{opacity:.45;cursor:default;}.editor{box-sizing:border-box;min-height:var(--cu-editor-min-height,140px);padding:12px;line-height:1.6;overflow-wrap:anywhere;outline:none;}.editor:focus-visible{outline-offset:-2px;}.editor:empty:before{content:attr(data-placeholder);color:var(--cu-text-muted,#616161);pointer-events:none;}.frame[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.hint,.error{font-size:12px;margin-top:5px;color:var(--cu-text-muted,#616161);}.error{color:var(--cu-danger,#c42b1c);}.editor[data-disabled=true]{opacity:.55;}"+focusStyle;
export class CuRichTextEditor extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){return ["value","label","placeholder","hint","name","disabled","readonly","required"];}
  constructor(){super();this._internals=this.attachInternals?.()??null;const root=mount(this,css,'<div class="label"></div><div class="frame"><div class="toolbar" role="group" aria-label="Text formatting"><button type="button" data-command="bold" aria-label="Bold">B</button><button type="button" data-command="italic" aria-label="Italic"><i>I</i></button><button type="button" data-command="underline" aria-label="Underline"><u>U</u></button><button type="button" data-command="insertUnorderedList" aria-label="Bulleted list">• List</button><button type="button" data-command="insertOrderedList" aria-label="Numbered list">1. List</button><button type="button" data-command="removeFormat" aria-label="Clear formatting">Clear</button></div><div class="editor" part="editor" role="textbox" aria-multiline="true" tabindex="0"></div></div><div class="hint" id="editor-hint"></div><div class="error" id="editor-error" role="status"></div>');
    for(const [k,q] of Object.entries({label:".label",frame:".frame",toolbar:".toolbar",editor:".editor",hint:".hint",error:".error"}))this["_"+k]=root.querySelector(q);
    this._toolbar.addEventListener("mousedown",e=>{if(e.target.closest("button"))e.preventDefault();});
    this._toolbar.addEventListener("click",e=>{const button=e.target.closest("button");if(!button||this._locked())return;this._editor.focus();try{this.ownerDocument.execCommand("styleWithCSS",false,false);this.ownerDocument.execCommand(button.dataset.command,false,null);}catch{}this._edited();});
    this._editor.addEventListener("input",()=>this._edited());
    this._editor.addEventListener("focus",()=>{this._focusValue=this.value;});
    this._editor.addEventListener("blur",()=>{this._reveal=true;this._sync();if(this._focusValue!==this.value){this._focusValue=this.value;notify(this,"cu-change",{value:this.value});}});
    this._editor.addEventListener("paste",e=>{e.preventDefault();if(this._locked())return;const text=e.clipboardData?.getData("text/plain")||"";try{this.ownerDocument.execCommand("insertText",false,text);}catch{}this._edited();});
    this._editor.addEventListener("drop",e=>e.preventDefault());
    this.addEventListener("invalid",()=>{this._reveal=true;this._sync();});
  }
  connectedCallback(){if(!this._initialized){this._default=this.getAttribute("value")||"";if(!this._assigned)this._editor.innerHTML=sanitizeRichText(this._default,this.ownerDocument);this._initialized=true;}this._sync();}
  attributeChangedCallback(name){if(!this._editor)return;if(name==="value"){this._default=this.getAttribute("value")||"";this._editor.innerHTML=sanitizeRichText(this._default,this.ownerDocument);this._lastInput=this.value;this._focusValue=this.value;}this._sync();}
  get value(){return sanitizeRichText(this._editor.innerHTML,this.ownerDocument);}
  set value(v){this._assigned=true;const next=sanitizeRichText(v,this.ownerDocument);if(this.value!==next)this._editor.innerHTML=next;this._lastInput=next;this._focusValue=next;this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get required(){return this.hasAttribute("required");}set required(v){this.toggleAttribute("required",Boolean(v));}
  _locked(){return this.disabled||this.readonly||Boolean(this._formDisabled);}
  formDisabledCallback(v){this._formDisabled=v;this._sync();}
  formResetCallback(){this._reveal=false;this.value=this._default||"";this._focusValue=this.value;}
  formStateRestoreCallback(v){this.value=v;}
  focus(options){this._editor.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??this._valid;}
  reportValidity(){this._reveal=true;this._sync();return this._internals?.reportValidity()??this._valid;}
  _edited(){if(this._locked())return;this._sync();const value=this.value;if(value!==this._lastInput){this._lastInput=value;notify(this,"cu-input",{value});}}
  _sync(){if(!this._editor)return;const disabled=this.disabled||Boolean(this._formDisabled),locked=this._locked(),empty=!this._editor.textContent.trim(),invalid=!locked&&this.required&&empty;this._valid=!invalid;this._label.textContent=this.getAttribute("label")||"";this._hint.textContent=this.getAttribute("hint")||"";this._editor.contentEditable=String(!locked);this._editor.tabIndex=disabled?-1:0;this._editor.dataset.disabled=String(disabled);this._editor.dataset.placeholder=this.getAttribute("placeholder")||"Write something…";this._editor.setAttribute("aria-label",this._label.textContent||"Rich text editor");this._editor.setAttribute("aria-readonly",String(this.readonly));this._editor.setAttribute("aria-disabled",String(disabled));this._editor.setAttribute("aria-required",String(this.required));this._editor.setAttribute("aria-describedby","editor-hint editor-error");this._editor.setAttribute("aria-invalid",String(invalid&&this._reveal));this._frame.dataset.invalid=String(invalid&&this._reveal);this._error.textContent=invalid&&this._reveal?"Enter text.":"";for(const b of this._toolbar.querySelectorAll("button"))b.disabled=locked;this._internals?.setFormValue(disabled?null:empty?"":this.value);if(invalid)this._internals?.setValidity({valueMissing:true},"Enter text.",this._editor);else this._internals?.setValidity({});}
}
define("cu-rich-text-editor",CuRichTextEditor);
