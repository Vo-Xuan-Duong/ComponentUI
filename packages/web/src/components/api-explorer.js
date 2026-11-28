import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./text-field.js";
import "./text-area.js";
import "./select.js";
import "./button.js";
import "./tabs.js";
import "./code-block.js";
import "./json-viewer.js";
export const API_METHODS=Object.freeze(["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"]);
export function normalizeApiRequest(value={}){
  const method=String(value?.method??"GET").toUpperCase();
  return {method:API_METHODS.includes(method)?method:"GET",url:String(value?.url??"").trim(),body:String(value?.body??"")};
}
export function validateApiRequest(value){
  const request=normalizeApiRequest(value);
  try{const url=new URL(request.url);if(!["http:","https:"].includes(url.protocol)||url.username||url.password)return {valid:false,error:"Use an HTTP(S) URL without embedded credentials."};}catch{return {valid:false,error:"Enter an absolute HTTP(S) URL."};}
  if(["GET","HEAD"].includes(request.method)&&request.body.trim())return {valid:false,error:"GET and HEAD requests cannot contain a body."};
  return {valid:true,error:""};
}
export function normalizeApiResponse(value){
  if(!value||typeof value!=="object")return null;
  const status=Number(value.status);return {status:Number.isInteger(status)&&status>=100&&status<=599?status:0,body:String(value.body??""),contentType:String(value.contentType??"")};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:12px;}.request{display:flex;gap:8px;align-items:end;flex-wrap:wrap;}.request cu-select{flex:0 1 120px;}.request cu-text-field{flex:1 1 240px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}.error{font-size:12px;color:var(--cu-danger,#c42b1c);}.error:empty{display:none;}";
export class CuAPIExplorer extends BrowserElement{
  static get observedAttributes(){return ["disabled","loading"];}
  constructor(){
    super();this._response=null;
    const root=mount(this,css,'<section class="panel" aria-label="API explorer"><div class="request"><cu-select label="Method"><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option><option value="HEAD">HEAD</option><option value="OPTIONS">OPTIONS</option></cu-select><cu-text-field label="Request URL" placeholder="https://api.example.com/items"></cu-text-field><cu-button variant="accent">Send request</cu-button></div><cu-textarea label="Request body" rows="4"></cu-textarea><span class="error" role="alert"></span><span class="status" role="status">No response</span><cu-tabs aria-label="Response"><cu-tab label="Raw"><cu-code-block language="Response" copyable></cu-code-block></cu-tab><cu-tab label="JSON"><cu-json-viewer hidden></cu-json-viewer><div class="json-status" role="status">No JSON response</div></cu-tab></cu-tabs></section>');
    this._method=root.querySelector("cu-select");this._url=root.querySelector("cu-text-field");this._body=root.querySelector("cu-textarea");this._send=root.querySelector("cu-button");this._status=root.querySelector(".status");this._error=root.querySelector(".error");this._raw=root.querySelector("cu-code-block");this._json=root.querySelector("cu-json-viewer");this._jsonStatus=root.querySelector(".json-status");
    for(const c of [this._method,this._url,this._body])for(const type of ["cu-input","cu-change"])c.addEventListener(type,e=>{e.stopPropagation();this._error.textContent="";notify(this,type,{request:this.request});});
    this._send.addEventListener("cu-press",e=>{e.stopPropagation();this.submit();});
    root.querySelector("cu-tabs").addEventListener("cu-change",e=>{if(e.target.localName==="cu-tabs")e.stopPropagation();});
    this._json.addEventListener("cu-select",e=>e.stopPropagation());
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get request(){return normalizeApiRequest({method:this._method.value,url:this._url.value,body:this._body.value});}
  set request(v){const r=normalizeApiRequest(v);this._method.setAttribute("value",r.method);this._method.value=r.method;this._url.value=r.url;this._body.value=r.body;this._error.textContent="";}
  get response(){return this._response?{...this._response}:null;}set response(v){this._response=normalizeApiResponse(v);this._renderResponse();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
  submit(){if(this.disabled||this.loading)return false;const result=validateApiRequest(this.request);this._error.textContent=result.error;if(!result.valid)return false;notify(this,"cu-action",{action:"request",request:this.request});return true;}
  _sync(){if(!this._send)return;this._send.disabled=this.disabled||this.loading;this._send.loading=this.loading;this._method.disabled=this._url.disabled=this._body.disabled=this.disabled||this.loading;this._renderResponse();}
  _renderResponse(){if(!this._raw)return;const r=this._response;this._status.textContent=this.loading?"Waiting for response…":r?"HTTP "+(r.status||"unknown")+(r.contentType?" · "+r.contentType:""):"No response";this._raw.value=r?.body??"";let json=false;if(r?.body){try{JSON.parse(r.body);json=true;}catch{}}this._json.hidden=!json;this._jsonStatus.hidden=json;if(json&&this._json.value!==r.body)this._json.value=r.body;}
}
define("cu-api-explorer",CuAPIExplorer);
