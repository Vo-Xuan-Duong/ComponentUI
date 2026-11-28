import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./image-viewer.js";
import "./button.js";
import "./empty-state.js";
import "./spinner.js";
export function clampPdfPage(page,count){
  const n=Number(page),total=Number.isFinite(Number(count))?Math.max(0,Math.floor(Number(count))):0;
  return total?Math.min(total,Math.max(1,Number.isFinite(n)?Math.trunc(n):1)):0;
}
const css=":host([hidden]){display:none!important;}:host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:var(--cu-space-3,12px);}.nav{display:flex;align-items:center;flex-wrap:wrap;gap:8px;}.status{flex:1;text-align:center;min-width:100px;font-weight:600;}.loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:24px;}.loading[hidden],.retry[hidden]{display:none!important;}.retry{justify-self:center;}cu-image-viewer{--cu-viewer-base-size:420px;--cu-image-viewer-height:var(--cu-pdf-height,520px);}";
export class CuPdfViewer extends BrowserElement{
  static get observedAttributes(){return ["page"];}
  constructor(){
    super();this._pages=[];this._document=null;this._revision=0;this._loadedPage=0;
    const root=mount(this,css,'<section class="panel" aria-label="PDF viewer"><div class="nav"><cu-button variant="outline" size="sm" data-nav="first">First</cu-button><cu-button variant="outline" size="sm" data-nav="prev">Previous</cu-button><span class="status" role="status"></span><cu-button variant="outline" size="sm" data-nav="next">Next</cu-button><cu-button variant="outline" size="sm" data-nav="last">Last</cu-button></div><div class="loading" hidden><cu-spinner></cu-spinner>Rendering page…</div><cu-image-viewer hidden></cu-image-viewer><cu-empty-state title="No document" size="sm"></cu-empty-state><cu-button class="retry" variant="outline" size="sm" hidden>Retry page</cu-button></section>');
    this._viewer=root.querySelector("cu-image-viewer");this._status=root.querySelector(".status");this._loading=root.querySelector(".loading");this._empty=root.querySelector("cu-empty-state");this._nav=root.querySelector(".nav");this._retry=root.querySelector(".retry");
    this._retry.addEventListener("cu-press",e=>{e.stopPropagation();this._invalidate();});
    this._nav.addEventListener("cu-press",e=>{e.stopPropagation();const action=e.target.dataset.nav;const next={first:1,prev:this.page-1,next:this.page+1,last:this.pageCount}[action];if(next!==undefined)this.goToPage(next);});
    for(const type of ["cu-input","cu-change","cu-action"])this._viewer.addEventListener(type,e=>{e.stopPropagation();notify(this,type==="cu-action"?"cu-action":"cu-transform",{page:this.page,...e.detail});});
  }
  connectedCallback(){this._render();}
  disconnectedCallback(){this._revision++;this._loadedPage=0;}
  attributeChangedCallback(){this._render();}
  get pages(){return [...this._pages];}
  set pages(v){this._pages=(Array.isArray(v)?v:[]).filter(x=>typeof x==="string"&&x.trim());this._document=null;this._invalidate();}
  get document(){return this._document;}
  set document(v){this._document=v&&Number.isSafeInteger(v.pageCount)&&v.pageCount>0&&typeof v.renderPage==="function"?v:null;this._pages=[];this._invalidate();}
  get pageCount(){return this._document?.pageCount??this._pages.length;}
  get page(){return clampPdfPage(this.getAttribute("page")??1,this.pageCount);}
  set page(v){const n=Number(v);this.setAttribute("page",String(Number.isFinite(n)?Math.max(1,Math.trunc(n)):1));}
  goToPage(v){const page=clampPdfPage(v,this.pageCount);if(!page||page===this.page)return false;this.page=page;notify(this,"cu-change",{value:page,page,pageCount:this.pageCount});return true;}
  _invalidate(){this._revision++;this._loadedPage=0;this._render();}
  _render(){
    if(!this._viewer||!this.isConnected)return;
    const page=this.page,total=this.pageCount;
    this._status.textContent=total?"Page "+page+" of "+total:"No pages";
    for(const b of this._nav.querySelectorAll("cu-button"))b.disabled=!total||(["first","prev"].includes(b.dataset.nav)?page<=1:page>=total);
    if(page===this._loadedPage&&page)return;
    const revision=++this._revision;this._loadedPage=page;this._viewer.hidden=true;this._loading.hidden=true;this._retry.hidden=true;this._empty.hidden=Boolean(page);
    this._empty.setAttribute("title","No document");this._viewer.src="";
    if(!page)return;
    this._loading.hidden=false;
    const document=this._document,src=this._pages[page-1];
    Promise.resolve().then(()=>{if(revision!==this._revision||!this.isConnected)return null;return document?document.renderPage(page):src;}).then(src=>{
      if(revision!==this._revision||!this.isConnected)return;
      if(typeof src!=="string"||!src.trim())throw Error("No page image returned.");
      this._viewer.setAttribute("alt","PDF page "+page);this._viewer.src=src;this._viewer.hidden=false;this._loading.hidden=true;
    }).catch(()=>{
      if(revision!==this._revision||!this.isConnected)return;
      this._loading.hidden=true;this._empty.hidden=false;this._retry.hidden=false;this._empty.setAttribute("title","Unable to render page");notify(this,"cu-action",{action:"render-error",page});
    });
  }
}
define("cu-pdf-viewer",CuPdfViewer);
