import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";

export function formatFileSize(bytes){
  if(!Number.isFinite(bytes)||bytes<0)return "0 B";
  if(bytes<1024)return Math.round(bytes)+" B";
  const unit=bytes<1048576?"KB":bytes<1073741824?"MB":"GB";
  const divisor=unit==="KB"?1024:unit==="MB"?1048576:1073741824;
  return (bytes/divisor).toFixed(bytes/divisor<10?1:0)+" "+unit;
}

export function matchesFileAccept(file,accept=""){
  const types=String(accept).split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!types.length)return true;
  const filename=String(file?.name??"").toLowerCase();
  const mime=String(file?.type??"").toLowerCase();
  return types.some(type=>{
    if(type.startsWith("."))return filename.endsWith(type);
    if(type.endsWith("/*"))return mime.startsWith(type.slice(0,-1));
    return mime===type;
  });
}

export function validateFileSelection(files,{accept="",multiple=false,required=false,maxSize=0}={}){
  const selected=Array.from(files??[]);
  if(required&&!selected.length)return "Choose a file.";
  if(!multiple&&selected.length>1)return "Choose only one file.";
  if(selected.some(file=>!matchesFileAccept(file,accept)))
    return "One or more files do not match the accepted types.";
  if(Number(maxSize)>0&&selected.some(file=>file.size>Number(maxSize)))
    return "A file exceeds the "+formatFileSize(Number(maxSize))+" limit.";
  return "";
}

const css=[
  ":host{display:block;min-width:0;font-family:var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".field{display:grid;gap:7px;}",
  ".label{font-size:13px;font-weight:650;}",
  ".label:empty,.hint:empty,.error:empty{display:none!important;}",
  ".drop{box-sizing:border-box;display:flex;align-items:center;gap:12px;min-width:0;",
  "padding:14px;border:1px dashed var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);",
  "transition:background var(--cu-motion-fast,100ms),border-color var(--cu-motion-fast,100ms);}",
  ".drop:hover:not([data-disabled=true]),.drop[data-dragging=true]{",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 8%,var(--cu-surface,#fff));",
  "border-color:var(--cu-accent,#0067c0);}",
  ".drop:focus-within{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".drop[data-disabled=true]{opacity:.52;}",
  ".drop[data-invalid=true]{border-color:var(--cu-danger,#c42b1c);}",
  ".symbol{flex:none;color:var(--cu-accent,#0067c0);}",
  ".file-info{display:grid;gap:3px;min-width:0;flex:1;}",
  ".file-info strong{font-size:13px;font-weight:650;overflow-wrap:anywhere;}",
  ".file-info small{font-size:12px;color:var(--cu-text-muted,#616161);",
  "overflow-wrap:anywhere;}",
  "button{display:inline-flex;align-items:center;justify-content:center;gap:6px;",
  "flex:none;min-height:var(--cu-control-sm,28px);padding:5px 10px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface-alt,#fafafa);",
  "color:var(--cu-text,#242424);font:600 12px var(--cu-font-body,system-ui);cursor:pointer;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-text,#242424) 8%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "button:disabled{opacity:.5;cursor:not-allowed;}",
  ".clear[hidden]{display:none!important;}",
  "input{display:none!important;}",
  ".hint,.error{font:400 12px/1.45 var(--cu-font-body,system-ui);}",
  ".hint{color:var(--cu-text-muted,#616161);}",
  ".error{color:var(--cu-danger,#c42b1c);}",
  "@media(max-width:460px){.drop{flex-wrap:wrap;}.file-info{flex-basis:calc(100% - 42px);}}",
  "@media(prefers-reduced-motion:reduce){.drop{transition:none;}}",
  "@media(forced-colors:active){.drop{border-color:CanvasText;}}",
  focusStyle
].join("");

let uid=0;
export class CuFilePicker extends BrowserElement{
  static formAssociated=true;
  static get observedAttributes(){
    return ["label","name","hint","error","accept","multiple","required","disabled","max-size"];
  }
  constructor(){
    super();
    this._internals=this.attachInternals?.()??null;
    const root=mount(this,css,
      '<div class="field"><span class="label" part="label"></span>' +
      '<div class="drop" part="drop"><cu-icon class="symbol" name="upload" size="22"></cu-icon>' +
      '<div class="file-info"><strong part="filename"></strong><small part="details"></small></div>' +
      '<button class="browse" part="browse" type="button">Browse</button>' +
      '<button class="clear" part="clear" type="button" aria-label="Clear files" hidden>' +
      '<cu-icon name="x" size="16"></cu-icon></button>' +
      '<input type="file" tabindex="-1" aria-hidden="true"></div>' +
      '<span class="hint" part="hint"></span><span class="error" part="error"></span></div>');
    this._input=root.querySelector("input");
    this._drop=root.querySelector(".drop");
    this._browse=root.querySelector(".browse");
    this._clear=root.querySelector(".clear");
    this._filename=root.querySelector(".file-info strong");
    this._details=root.querySelector(".file-info small");
    this._label=root.querySelector(".label");
    this._hint=root.querySelector(".hint");
    this._error=root.querySelector(".error");
    const id="cu-filepicker-"+ ++uid;
    this._hint.id=id+"-hint";
    this._error.id=id+"-error";
    this._files=[];
    this._selectionError="";
    this._input.addEventListener("change",()=>{
      this._select(this._input.files);
      this._input.value=""; // Allow choosing the same file again; host owns the selection.
    });
    this._browse.addEventListener("click",()=>{if(!this.disabled&&!this._formDisabled)this._input.click();});
    const reveal=()=>{this._validationRevealed=true;this._syncForm();};
    this._browse.addEventListener("blur",reveal);
    this.addEventListener("invalid",reveal);
    this._clear.addEventListener("click",()=>{
      this.clear();this._browse.focus();
    });
    this._drop.addEventListener("dragenter",event=>{
      if(!Array.from(event.dataTransfer?.types??[]).includes("Files"))return;
      event.preventDefault();
      if(this.disabled||this._formDisabled)return;
      this._drop.dataset.dragging="true";
    });
    this._drop.addEventListener("dragover",event=>{
      if(!Array.from(event.dataTransfer?.types??[]).includes("Files"))return;
      event.preventDefault();
      if(event.dataTransfer)event.dataTransfer.dropEffect=this.disabled||this._formDisabled?"none":"copy";
    });
    this._drop.addEventListener("dragleave",event=>{
      if(!this._drop.contains(event.relatedTarget))delete this._drop.dataset.dragging;
    });
    this._drop.addEventListener("drop",event=>{
      if(!event.dataTransfer?.files?.length)return;
      event.preventDefault();delete this._drop.dataset.dragging;
      if(this.disabled||this._formDisabled)return;
      this._select(event.dataTransfer.files);
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  formDisabledCallback(disabled){this._formDisabled=disabled;this._sync();}
  formResetCallback(){this._validationRevealed=false;this.clear(false);}
  formStateRestoreCallback(){this._validationRevealed=false;this.clear(false);}
  get files(){return [...this._files];}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get required(){return this.hasAttribute("required");}
  set required(value){this.toggleAttribute("required",Boolean(value));}
  get multiple(){return this.hasAttribute("multiple");}
  set multiple(value){this.toggleAttribute("multiple",Boolean(value));}
  get maxSize(){return Number(this.getAttribute("max-size"))||0;}
  set maxSize(value){
    if(value===null||value===undefined||Number(value)<=0)this.removeAttribute("max-size");
    else this.setAttribute("max-size",String(value));
  }
  focus(options){this._browse.focus(options);}
  checkValidity(){return this._internals?.checkValidity()??!this._invalid();}
  reportValidity(){if(this._internals)return this._internals.reportValidity();if(this._invalid())this.focus();return !this._invalid();}
  clear(emit=true){
    if(emit&&(this.disabled||this._formDisabled))return;
    if(emit)this._validationRevealed=true;
    const hadFiles=this._files.length>0;
    this._files=[];this._input.value="";this._selectionError="";
    this._syncForm();
    if(emit&&hadFiles)notify(this,"cu-change",{files:[],count:0});
  }
  _select(files){
    if(this.disabled||this._formDisabled)return;
    this._validationRevealed=true;
    this._files=Array.from(files??[]);
    this._selectionError="";
    this._syncForm();
    notify(this,"cu-change",{files:[...this._files],count:this._files.length,
      valid:!this._invalid()});
  }
  _invalid(){
    if(this.disabled||this._formDisabled)return "";
    return this.getAttribute("error")||this._selectionError||
      validateFileSelection(this._files,{accept:this.getAttribute("accept")||"",
        multiple:this.multiple,required:this.hasAttribute("required"),
        maxSize:Number(this.getAttribute("max-size"))||0});
  }
  _sync(){
    if(!this._input)return;
    const disabled=this.disabled||Boolean(this._formDisabled);
    this._input.disabled=disabled;
    this._input.accept=this.getAttribute("accept")??"";
    this._input.multiple=this.multiple;
    this._browse.disabled=disabled;
    this._label.textContent=this.getAttribute("label")??"";
    this._hint.textContent=this.getAttribute("hint")??"";
    this._browse.setAttribute("aria-label",
      "Choose "+(this.multiple?"files":"file")+(this._label.textContent?" for "+this._label.textContent:""));
    const described=[];
    if(this._hint.textContent)described.push(this._hint.id);
    if(this._error.textContent)described.push(this._error.id);
    if(described.length)this._browse.setAttribute("aria-describedby",described.join(" "));
    else this._browse.removeAttribute("aria-describedby");
    this._drop.dataset.disabled=String(disabled);
    if(disabled)delete this._drop.dataset.dragging;
    this._syncForm();
  }
  _syncForm(){
    if(!this._input)return;
    const count=this._files.length;
    const invalid=this._invalid();
    this._filename.textContent=count===0?"Drop files here or browse":
      count===1?this._files[0].name:count+" files selected";
    this._details.textContent=count===0?"No files selected":
      count===1?formatFileSize(this._files[0].size):
      this._files.map(x=>x.name).join(", ");
    this._clear.hidden=!count||this.disabled||Boolean(this._formDisabled);
    this._clear.disabled=this.disabled||Boolean(this._formDisabled);
    const visibleError=invalid&&(this._validationRevealed||this.getAttribute("error")||count>0)?invalid:"";
    this._drop.dataset.invalid=String(Boolean(visibleError));
    this._browse.setAttribute("aria-invalid",String(Boolean(visibleError)));
    this._error.textContent=String(visibleError);
    // Keep the native Browse button's description in sync as errors change.
    const described=[];
    if(this._hint.textContent)described.push(this._hint.id);
    if(this._error.textContent)described.push(this._error.id);
    if(described.length)this._browse.setAttribute("aria-describedby",described.join(" "));
    else this._browse.removeAttribute("aria-describedby");
    if(invalid)this._internals?.setValidity({customError:true},String(invalid),this._browse);
    else this._internals?.setValidity({});
    const name=this.getAttribute("name");
    if(this.disabled||this._formDisabled||!count||!name){
      this._internals?.setFormValue(null);return;
    }
    if(this.multiple){
      const data=new FormData();
      for(const file of this._files)data.append(name,file,file.name);
      this._internals?.setFormValue(data);
    }else this._internals?.setFormValue(this._files[0]);
  }
}
define("cu-file-picker",CuFilePicker);
