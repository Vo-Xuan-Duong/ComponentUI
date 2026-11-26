import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";

export function normalizeCarouselItems(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.id!=="string"||!item.id.trim()||seen.has(item.id))return [];
    seen.add(item.id);
    return [{id:item.id,title:String(item.title??""),description:String(item.description??""),src:typeof item.src==="string"?item.src:"",alt:String(item.alt??"")}];
  });
}
export function carouselIndex(index,count,loop=false){
  if(!Number.isInteger(count)||count<=0)return -1;
  const n=typeof index==="number"&&Number.isFinite(index)?Math.trunc(index):0;
  return loop?((n%count)+count)%count:Math.max(0,Math.min(count-1,n));
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{display:grid;gap:12px;min-width:0;}.viewport{position:relative;min-width:0;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);overflow:hidden;background:var(--cu-surface-alt,#fafafa);touch-action:pan-y;}",
  ".slide{min-width:0;min-height:var(--cu-carousel-min-height,140px);display:grid;align-content:center;}.image{display:block;width:100%;height:auto;max-block-size:var(--cu-carousel-image-height,320px);object-fit:cover;}.image[hidden],.content[hidden],.slide[hidden],.empty[hidden]{display:none!important;}",
  ".content{display:grid;gap:6px;padding:18px;overflow-wrap:anywhere;}.title{font-weight:650;font-size:17px;line-height:1.4;}.description{font-size:13px;color:var(--cu-text-muted,#616161);line-height:1.5;}.title:empty,.description:empty{display:none;}",
  ".footer{display:flex;align-items:center;justify-content:space-between;gap:10px;}.indicators{display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:center;}.indicators[hidden],.footer[hidden]{display:none!important;}",
  "button{display:grid;place-items:center;background:var(--cu-surface,#fff);color:var(--cu-text,#242424);font:inherit;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);cursor:pointer;min-width:36px;min-height:36px;padding:4px;}",
  "button:hover:not(:disabled){background:var(--cu-state-hover);border-color:var(--cu-accent,#0067c0);}button:disabled{opacity:.45;cursor:not-allowed;}.dot{border:0;min-width:24px;min-height:28px;padding:0;background:transparent;}.dot:before{content:'';width:7px;height:7px;border-radius:99px;background:var(--cu-text-muted,#616161);opacity:.65;transition:width var(--cu-motion-normal,160ms) ease;}.dot[aria-current=true]:before{width:18px;background:var(--cu-accent,#0067c0);opacity:1;}",
  ".count{font-size:12px;font-variant-numeric:tabular-nums;color:var(--cu-text-muted,#616161);white-space:nowrap;}.empty{padding:30px;text-align:center;color:var(--cu-text-muted,#616161);}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}",
  "@media(forced-colors:active){.dot[aria-current=true]{outline:1px solid Highlight;}.dot:before{background:CanvasText;}}",focusStyle
].join("");
export class CuCarousel extends BrowserElement{
  static get observedAttributes(){return ["active","loop","label","aria-label","empty-text","hide-indicators"];}
  constructor(){
    super();this._items=[];this._requested=0;
    const root=mount(this,css,'<section class="frame" aria-roledescription="carousel" role="region"><div class="viewport" part="viewport"><div class="slide" role="group" aria-roledescription="slide" part="slide"><slot name="slide"><img class="image" hidden><div class="content"><div class="title"></div><div class="description"></div></div></slot></div><div class="empty" hidden></div></div><div class="footer"><button class="prev" type="button" aria-label="Previous slide"><cu-icon name="chevron-right" size="18" style="transform:rotate(180deg)"></cu-icon></button><div class="indicators" role="group" aria-label="Choose slide"></div><span class="count" aria-hidden="true"></span><button class="next" type="button" aria-label="Next slide"><cu-icon name="chevron-right" size="18"></cu-icon></button></div><span class="sr" role="status" aria-live="polite"></span></section>');
    for(const [k,q] of Object.entries({frame:".frame",viewport:".viewport",slide:".slide",slot:"slot",image:".image",content:".content",title:".title",description:".description",empty:".empty",footer:".footer",prev:".prev",next:".next",indicators:".indicators",count:".count",status:".sr"}))this["_"+k]=root.querySelector(q);
    this._prev.addEventListener("click",()=>this.previous());this._next.addEventListener("click",()=>this.next());
    this._frame.addEventListener("keydown",e=>{
      if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||!e.target.matches?.("button"))return;
      const rtl=this.ownerDocument.defaultView?.getComputedStyle(this).direction==="rtl";
      if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();(e.key==="ArrowRight")!==rtl?this.next():this.previous();}
      else if(e.key==="Home"||e.key==="End"){e.preventDefault();this.goTo(e.key==="Home"?0:this._items.length-1);}
    });
    this._viewport.addEventListener("pointerdown",e=>{
      if(e.pointerType!=="touch"||e.isPrimary===false||e.composedPath().some(n=>n.matches?.("button,a,input,select,textarea,[contenteditable=true]")))return;
      this._gesture={id:e.pointerId,x:e.clientX,y:e.clientY};
    });
    this._viewport.addEventListener("pointercancel",()=>{this._gesture=null;});
    this._viewport.addEventListener("pointerup",e=>{
      const g=this._gesture;this._gesture=null;if(!g||g.id!==e.pointerId)return;
      const dx=e.clientX-g.x,dy=e.clientY-g.y;
      if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.3)return;
      const rtl=this.ownerDocument.defaultView?.getComputedStyle(this).direction==="rtl";
      (dx<0)!==rtl?this.next():this.previous();
    });
    this._image.addEventListener("error",()=>{this._image.hidden=true;});
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(name){if(name==="active"){const raw=this.getAttribute("active");this._requested=raw===null?0:Number(raw);}this._sync();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeCarouselItems(v);this._renderIndicators();this._sync();}
  get active(){return carouselIndex(this._requested,this._items.length,this.loop);}
  set active(v){this._requested=Number(v);this._sync();}
  get loop(){return this.hasAttribute("loop");}set loop(v){this.toggleAttribute("loop",Boolean(v));}
  next(){return this.goTo(this.active+1);}
  previous(){return this.goTo(this.active-1);}
  goTo(index){
    const previousIndex=this.active,next=carouselIndex(index,this._items.length,this.loop);
    if(next<0||next===previousIndex)return false;
    this._requested=next;this._sync();notify(this,"cu-change",{index:next,previousIndex,value:this._items[next].id,item:{...this._items[next]}});return true;
  }
  _renderIndicators(){
    if(!this._indicators)return;
    const focused=this.shadowRoot.activeElement?.dataset?.index;
    this._indicators.replaceChildren(...this._items.map((item,i)=>{
      const b=this.ownerDocument.createElement("button");b.type="button";b.className="dot";b.dataset.index=String(i);b.setAttribute("aria-label","Go to slide "+(i+1)+(item.title?": "+item.title:""));b.addEventListener("click",()=>this.goTo(i));return b;
    }));
    if(focused!==undefined)[...this._indicators.children].find(b=>b.dataset.index===focused)?.focus({preventScroll:true});
  }
  _sync(){
    if(!this._frame)return;
    const i=this.active,item=this._items[i],count=this._items.length;
    this._frame.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Carousel");
    this._slide.hidden=!item;this._empty.hidden=Boolean(item);this._empty.textContent=this.getAttribute("empty-text")||"No slides available.";
    this._footer.hidden=count<2;this._indicators.hidden=this.hasAttribute("hide-indicators");
    this._prev.disabled=count<2||(!this.loop&&i<=0);this._next.disabled=count<2||(!this.loop&&i>=count-1);
    this._count.textContent=item?(i+1)+" / "+count:"";
    for(const [n,b] of [...this._indicators.children].entries())b.setAttribute("aria-current",String(n===i));
    if(!item){this._image.removeAttribute("src");this._image.hidden=true;this._slot.name="slide-empty";this._status.textContent="";return;}
    this._slot.name="slide-"+item.id;
    this._slide.setAttribute("aria-label",(i+1)+" of "+count+(item.title?": "+item.title:""));
    this._title.textContent=item.title;this._description.textContent=item.description;this._content.hidden=!item.title&&!item.description;
    this._image.alt=item.alt;
    if(!item.src){this._image.removeAttribute("src");this._image.hidden=true;}
    else if(this._image.getAttribute("src")!==item.src){this._image.hidden=false;this._image.src=item.src;}
    this._status.textContent="Slide "+(i+1)+" of "+count+(item.title?": "+item.title:"");
  }
}
define("cu-carousel",CuCarousel);
