import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./api-explorer.js";
import {normalizeInspectorRows} from "./data-inspector.js";
import "./text-field.js";
import "./tabs.js";
export function extractResponseRecords(body,path=""){
  if(typeof body!=="string"||!body.trim())return {rows:[],error:"No response body."};
  if(body.length>2000000)return {rows:[],error:"Response exceeds 2,000,000 UTF-16 code units."};
  let value;try{value=JSON.parse(body);}catch{return {rows:[],error:"Response is not valid JSON."};}
  if(typeof path!=="string"||(path!==""&&(!path.startsWith("/")||/~(?:[^01]|$)/.test(path))))return {rows:[],error:"Use a JSON Pointer such as /items."};
  if(path)for(const token of path.slice(1).split("/")){
    const key=token.replace(/~1/g,"/").replace(/~0/g,"~");
    if(!value||typeof value!=="object"||!Object.hasOwn(value,key)||(Array.isArray(value)&&! /^(0|[1-9]\d*)$/.test(key)))return {rows:[],error:"Record path not found."};
    value=value[key];
  }
  if(!Array.isArray(value))return {rows:[],error:"Selected JSON value is not an array."};
  const rows=normalizeInspectorRows(value.slice(0,1000));
  return {rows,error:"",truncated:value.length>1000};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:8px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}.status[data-error=true]{color:var(--cu-danger,#c42b1c);}cu-tab{padding:8px 0;}";
export class CuDataSourceEditor extends BrowserElement{
  static get observedAttributes(){return ["record-path","disabled","loading"];}
  constructor(){
    super();this._rows=[];
    const root=mount(this,css,'<section class="panel" aria-label="Data source editor"><cu-text-field label="Record path (JSON Pointer)" hint="Empty for a root array; /items for a nested array"></cu-text-field><div class="status" role="status"></div><cu-tabs aria-label="Data source"><cu-tab label="Request and response"><cu-api-explorer></cu-api-explorer></cu-tab><cu-tab label="Records"><cu-data-inspector></cu-data-inspector></cu-tab></cu-tabs></section>');
    this._path=root.querySelector("cu-text-field");this._status=root.querySelector(".status");this._api=root.querySelector("cu-api-explorer");this._inspector=root.querySelector("cu-data-inspector");this._tabs=root.querySelector("cu-tabs");
    this._path.addEventListener("cu-input",e=>e.stopPropagation());this._path.addEventListener("cu-change",e=>{e.stopPropagation();if(this.disabled||this.loading)return;this.recordPath=this._path.value;notify(this,"cu-change",{section:"mapping",recordPath:this.recordPath,count:this._rows.length});});
    for(const type of ["cu-input","cu-change","cu-action"])this._api.addEventListener(type,e=>{if(e.target!==this._api)return;e.stopPropagation();notify(this,type,{...e.detail,section:"request"});});
    for(const type of ["cu-input","cu-change","cu-select"])this._inspector.addEventListener(type,e=>{if(e.target!==this._inspector)return;e.stopPropagation();notify(this,type,{...e.detail,section:"records"});});
    this._tabs.addEventListener("cu-change",e=>{if(e.target===this._tabs)e.stopPropagation();});
  }
  connectedCallback(){this._sync();this._extract();}attributeChangedCallback(name){this._sync();if(name==="record-path")this._extract();}
  get request(){return this._api.request;}set request(v){this._api.request=v;}
  get response(){return this._api.response;}set response(v){this._api.response=v;this._extract();}
  get recordPath(){return this.getAttribute("record-path")??"";}set recordPath(v){const path=String(v??"");if(this.recordPath!==path)this.setAttribute("record-path",path);}
  get rows(){return normalizeInspectorRows(this._rows);}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
  _sync(){if(!this._api)return;this._api.disabled=this.disabled;this._api.loading=this.loading;this._path.disabled=this.disabled||this.loading;if(this._path.value!==this.recordPath)this._path.value=this.recordPath;}
  _extract(){if(!this._inspector)return;const body=this.response?.body??"",path=this.recordPath;if(this._extractedBody===body&&this._extractedPath===path)return;const result=extractResponseRecords(body,path);this._extractedBody=body;this._extractedPath=path;this._rows=result.rows;this._inspector.rows=this._rows;if(result.error&&body)this._path.setAttribute("error",result.error);else this._path.removeAttribute("error");this._status.dataset.error=String(Boolean(result.error));this._status.textContent=result.error||this._rows.length+" records"+(result.truncated?" (first 1000 array entries)":"");}
}
define("cu-data-source-editor",CuDataSourceEditor);
