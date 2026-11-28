import {BrowserElement,mount,define,notify,focusStyle,frameTask} from "./_shared.js";
const finite=v=>typeof v==="number"&&Number.isFinite(v)?v:0;
export function scrollAreaMetrics({scrollTop=0,scrollLeft=0,scrollHeight=0,scrollWidth=0,clientHeight=0,clientWidth=0,rtl=false}={}){
  const maxScrollTop=Math.max(0,finite(scrollHeight)-finite(clientHeight));
  const maxScrollLeft=Math.max(0,finite(scrollWidth)-finite(clientWidth));
  const top=Math.max(0,Math.min(maxScrollTop,finite(scrollTop)));
  const logicalX=Math.max(0,Math.min(maxScrollLeft,(rtl?-1:1)*finite(scrollLeft)));
  return {scrollTop:top,scrollLeft:rtl&&logicalX?-logicalX:logicalX,maxScrollTop,maxScrollLeft,
    atTop:top<=1,atBottom:maxScrollTop-top<=1,atStart:logicalX<=1,atEnd:maxScrollLeft-logicalX<=1,
    canScrollX:maxScrollLeft>1,canScrollY:maxScrollTop>1};
}
const css=[
  ":host{display:grid;grid-template-rows:minmax(0,1fr);min-width:0;min-height:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".viewport{box-sizing:border-box;min-width:0;min-height:0;max-block-size:var(--cu-scroll-max-height,240px);overflow:auto;overscroll-behavior:contain;scrollbar-width:auto;scrollbar-color:var(--cu-scroll-thumb,var(--cu-border-strong,#aaa)) transparent;border-radius:inherit;}",
  ":host([axis=vertical]) .viewport,:host(:not([axis])) .viewport{overflow-x:hidden;}:host([axis=horizontal]) .viewport{overflow-y:hidden;max-block-size:none;}",
  ":host([scrollbar=thin]) .viewport{scrollbar-width:thin;}:host([scrollbar=hidden]) .viewport{scrollbar-width:none;}",
  ":host([scrollbar=hidden]) .viewport::-webkit-scrollbar{display:none;}:host([scrollbar=thin]) .viewport::-webkit-scrollbar{width:7px;height:7px;}",
  ".viewport::-webkit-scrollbar-thumb{background:var(--cu-scroll-thumb,var(--cu-border-strong,#aaa));border:2px solid transparent;background-clip:padding-box;border-radius:99px;}.viewport::-webkit-scrollbar-thumb:hover{background:var(--cu-text-muted,#616161);background-clip:padding-box;}",
  ".viewport:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}.content{min-width:0;min-height:0;}",
  ":host([axis=horizontal]) .content{width:max-content;min-width:100%;}:host([axis=both]) .content{min-width:100%;}",
  ":host([variant=outlined]) .viewport{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);}",
  "@media(forced-colors:active){.viewport{scrollbar-color:auto;}}",focusStyle
].join("");
export class CuScrollArea extends BrowserElement{
  static get observedAttributes(){return ["axis","scrollbar","label","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,'<div class="viewport" part="viewport" role="region" tabindex="0"><div class="content" part="content"><slot></slot></div></div>');
    this._viewport=root.querySelector(".viewport");this._content=root.querySelector(".content");this._slot=root.querySelector("slot");
    this._frame=frameTask(this,()=>{const metrics=this.metrics;this._refresh(metrics);if(this._scrollPending){this._scrollPending=false;notify(this,"cu-scroll",metrics);}});
    this._viewport.addEventListener("scroll",()=>{this._scrollPending=true;this._frame.request();},{passive:true});
    this._slot.addEventListener("slotchange",()=>this._frame.request());
  }
  connectedCallback(){
    this._sync();
    const Observer=this.ownerDocument.defaultView?.ResizeObserver;
    this._observer?.disconnect();
    if(Observer){const observer=new Observer(()=>{if(this._observer===observer&&this.isConnected)this._frame.request();});this._observer=observer;observer.observe(this._viewport);observer.observe(this._content);}else this._observer=null;
  }
  disconnectedCallback(){this._frame.cancel();this._scrollPending=false;this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(){this._sync();}
  get metrics(){
    const v=this._viewport;if(!v)return scrollAreaMetrics();
    const rtl=this.ownerDocument?.defaultView?.getComputedStyle(v).direction==="rtl";
    const m=scrollAreaMetrics({scrollTop:v.scrollTop,scrollLeft:v.scrollLeft,scrollHeight:v.scrollHeight,scrollWidth:v.scrollWidth,clientHeight:v.clientHeight,clientWidth:v.clientWidth,rtl});
    const axis=this.getAttribute("axis")||"vertical";
    if(axis==="vertical"){m.scrollLeft=0;m.maxScrollLeft=0;m.atStart=m.atEnd=true;m.canScrollX=false;}
    if(axis==="horizontal"){m.scrollTop=0;m.maxScrollTop=0;m.atTop=m.atBottom=true;m.canScrollY=false;}
    return m;
  }
  scrollTo(...args){this._viewport.scrollTo(...args);}
  scrollBy(...args){this._viewport.scrollBy(...args);}
  focus(options){this._viewport.focus(options);}
  _sync(){if(!this._viewport)return;this._viewport.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Scrollable content");this._refresh();}
  _refresh(m=this.metrics){
    if(!this._viewport)return;
    for(const [key,value] of Object.entries({atTop:m.atTop,atBottom:m.atBottom,atStart:m.atStart,atEnd:m.atEnd,canScrollX:m.canScrollX,canScrollY:m.canScrollY})){
      const attr=key.replace(/[A-Z]/g,c=>"-"+c.toLowerCase());if(this._viewport.hasAttribute("data-"+attr)!==value)this._viewport.toggleAttribute("data-"+attr,value);
    }
  }
}
define("cu-scroll-area",CuScrollArea);
