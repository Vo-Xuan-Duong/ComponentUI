import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./search-box.js";
import "./select.js";
export const DEFAULT_FONT_FAMILIES=Object.freeze(["system-ui","Arial","Verdana","Georgia","Times New Roman","Courier New","monospace","sans-serif","serif"]);
export function normalizeFontFamilies(fonts){
  return [...new Set((Array.isArray(fonts)?fonts:[]).filter(f=>typeof f==="string").map(f=>f.trim()).filter(f=>f&&f.length<=100&&!/[\x00-\x1f\x7f;{}]/.test(f)))];
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}.sample{padding:16px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);font-size:24px;overflow-wrap:anywhere;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuFontPicker extends BrowserElement{
  static get observedAttributes(){return ["value","sample","disabled"];}
  constructor(){
    super();this._fonts=[...DEFAULT_FONT_FAMILIES];this._query="";
    const root=mount(this,css,'<section class="panel" aria-label="Font picker"><cu-search-box aria-label="Search fonts" placeholder="Search font families"></cu-search-box><cu-select label="Font family"></cu-select><div class="sample" part="sample"></div><span class="status" role="status"></span></section>');
    this._search=root.querySelector("cu-search-box");this._select=root.querySelector("cu-select");this._sample=root.querySelector(".sample");this._status=root.querySelector(".status");
    this._search.addEventListener("cu-input",e=>{e.stopPropagation();this._query=e.detail.value;this._options();});
    for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,e=>e.stopPropagation());
    this._select.addEventListener("cu-input",e=>e.stopPropagation());this._select.addEventListener("cu-change",e=>{e.stopPropagation();if(this.disabled||!this._fonts.includes(e.detail.value))return;this.value=e.detail.value;notify(this,"cu-change",{value:this.value});});
  }
  connectedCallback(){this._options();this._sync();}attributeChangedCallback(){this._sync();}
  get fonts(){return [...this._fonts];}set fonts(v){this._fonts=normalizeFontFamilies(v);this._options();this._sync();}
  get value(){const v=this.getAttribute("value");return this._fonts.includes(v)?v:this._fonts[0]??"";}set value(v){this.setAttribute("value",String(v??""));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _options(){
    if(!this._select)return;
    const q=this._query.trim().toLowerCase(),fonts=this._fonts.filter(f=>f.toLowerCase().includes(q));
    if(this.value&&!fonts.includes(this.value))fonts.unshift(this.value);
    this._select.replaceChildren(...fonts.map(f=>{const o=this.ownerDocument.createElement("option");o.value=f;o.textContent=f;return o;}));
    this._select.setAttribute("value",this.value);queueMicrotask(()=>{if(this.isConnected)this._select.value=this.value;});this._status.textContent=this._fonts.filter(f=>f.toLowerCase().includes(q)).length+" matching families";
  }
  _sync(){
    if(!this._sample)return;this._search.disabled=this.disabled;this._select.disabled=this.disabled||!this._fonts.length;
    if(this._select.value!==this.value){this._options();this._select.value=this.value;}
    this._sample.textContent=this.getAttribute("sample")||"The quick brown fox jumps over the lazy dog. 0123456789";
    const generic=["system-ui","sans-serif","serif","monospace"].includes(this.value);this._sample.style.fontFamily=generic?this.value:JSON.stringify(this.value)+", sans-serif";
  }
}
define("cu-font-picker",CuFontPicker);
