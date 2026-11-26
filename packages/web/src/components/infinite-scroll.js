import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

/** IntersectionObserver-free threshold helper used by the scroll fallback. */
export function shouldLoadMore(scrollTop,clientHeight,scrollHeight,threshold=180){
  const top=Math.max(0,Number(scrollTop)||0);
  const view=Math.max(0,Number(clientHeight)||0);
  const height=Math.max(0,Number(scrollHeight)||0);
  const distance=Math.max(0,Number(threshold)||0);
  return view>0&&top+view+distance>=height;
}

const css=[
  ":host{display:block;box-sizing:border-box;min-width:0;min-height:80px;height:320px;",
  "color:var(--cu-text,#242424);font:13px/1.5 var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".viewport{box-sizing:border-box;width:100%;height:100%;overflow:auto;",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);",
  "background:var(--cu-surface,#fff);overscroll-behavior:contain;}",
  ".footer{display:flex;align-items:center;justify-content:center;gap:10px;",
  "min-height:44px;padding:8px;color:var(--cu-text-muted,#616161);}",
  "button{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;",
  "min-height:32px;padding:5px 12px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);background:transparent;color:var(--cu-text,#242424);",
  "cursor:pointer;font:600 13px var(--cu-font-body,system-ui);}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 10%,transparent);}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "button[hidden],.status[hidden]{display:none!important;}",
  ".status{font-size:12px;}",
  ".footer{flex-wrap:wrap;}",
  ":host([error]) .status{color:var(--cu-danger,#c42b1c);}",
  "@media(forced-colors:active){.viewport,button{border-color:CanvasText;}",
  "button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuInfiniteScroll extends BrowserElement {
  static get observedAttributes(){
    return ["has-more","loading","threshold","label","aria-label","end-text","error"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="viewport" part="viewport" role="region" aria-label="Scrollable records">' +
      '<slot></slot><div class="sentinel" aria-hidden="true"></div>' +
      '<div class="footer" part="footer"><button class="load" type="button">' +
      '<cu-icon name="chevron-down" size="16" aria-hidden="true"></cu-icon>' +
      '<span class="load-label">Load more</span></button><span class="status" role="status" aria-live="polite"></span></div></div>');
    this._viewport=root.querySelector(".viewport");
    this._sentinel=root.querySelector(".sentinel");
    this._button=root.querySelector(".load");
    this._buttonLabel=root.querySelector(".load-label");
    this._status=root.querySelector(".status");
    this._observer=null;
    this._requesting=false;
    this._page=0;
    this._button.addEventListener("click",()=>this.requestMore("button"));
    this._viewport.addEventListener("scroll",()=>{
      // Do not run a duplicate manual fallback if IntersectionObserver is active.
      if(!this._observer&&this._nearBottom())this.requestMore("scroll");
    });
  }
  connectedCallback(){
    this._sync();this._setupObserver();
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(name){
    this._sync();
    if(name==="loading"&&!this.loading)this._requesting=false;
    if(name==="threshold"&&this.isConnected)this._setupObserver();
  }
  get hasMore(){return this.hasAttribute("has-more");}
  set hasMore(v){this.toggleAttribute("has-more",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}
  set loading(v){this.toggleAttribute("loading",Boolean(v));}
  get threshold(){
    const n=Number(this.getAttribute("threshold"));
    return this.hasAttribute("threshold")&&Number.isFinite(n)?
      Math.max(0,Math.min(2000,n)):180;
  }
  set threshold(value){this.setAttribute("threshold",String(value));}
  get page(){return this._page;}
  get error(){return this.getAttribute("error")||"";}
  set error(v){if(v)this.setAttribute("error",String(v));else this.removeAttribute("error");}
  requestMore(reason="manual"){
    if(!this.hasMore||this.loading||this._requesting)return false;
    if(this.error){
      if(reason==="intersection"||reason==="scroll")return false;
      this.error="";
    }
    this._requesting=true;
    this.loading=true;
    this._page++;
    notify(this,"cu-load-more",{page:this._page,reason});
    return true;
  }
  complete({hasMore}={}){
    if(typeof hasMore==="boolean")this.hasMore=hasMore;
    if(this.error)this.error="";
    this._requesting=false;
    this.loading=false;
    this._sync();
  }
  fail(message="Unable to load records."){
    if(!this._requesting)return false;
    this._page=Math.max(0,this._page-1);
    this.error=String(message||"Unable to load records.");
    this._requesting=false;this.loading=false;this._sync();
    return true;
  }
  reset(){
    if(this.error)this.error="";
    this._page=0;this._requesting=false;this.loading=false;
    this._viewport.scrollTop=0;
    this._sync();
  }
  _nearBottom(){
    return shouldLoadMore(this._viewport.scrollTop,this._viewport.clientHeight,
      this._viewport.scrollHeight,this.threshold);
  }
  _setupObserver(){
    this._observer?.disconnect();this._observer=null;
    if(!globalThis.IntersectionObserver)return;
    this._observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting))this.requestMore("intersection");
    },{root:this._viewport,rootMargin:"0px 0px "+this.threshold+"px 0px"});
    this._observer.observe(this._sentinel);
  }
  _sync(){
    if(!this._viewport)return;
    this._viewport.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Scrollable records");
    this._viewport.setAttribute("aria-busy",String(this.loading));
    this._button.hidden=!this.hasMore||this.loading;
    this._button.disabled=this.loading;
    const error=this.error;
    if(this._buttonLabel)this._buttonLabel.textContent=error?"Retry":"Load more";
    this._status.textContent=this.loading?"Loading more records…":error||
      (this.hasMore?"":(this.getAttribute("end-text")||"All records loaded"));
    this._status.hidden=Boolean(this.hasMore&&!this.loading&&!error);
  }
}
define("cu-infinite-scroll",CuInfiniteScroll);
