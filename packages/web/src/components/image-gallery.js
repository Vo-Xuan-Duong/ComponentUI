import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeCarouselItems,carouselIndex} from "./carousel.js";
import "./image-viewer.js";
import "./select.js";
export function normalizeGalleryItems(items){return normalizeCarouselItems(items).filter(x=>x.src.trim());}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}cu-select{max-width:340px;}cu-image-viewer{padding:8px;}";
export class CuImageGallery extends BrowserElement{
  static get observedAttributes(){return ["active","loop"];}
  constructor(){
    super();this._items=[];
    const root=mount(this,css,'<section class="panel" aria-label="Image gallery"><cu-select label="Choose image"></cu-select><cu-carousel label="Gallery navigation" hide-indicators></cu-carousel></section>');
    this._select=root.querySelector("cu-select");this._carousel=root.querySelector("cu-carousel");this._viewer=this.ownerDocument.createElement("cu-image-viewer");this._carousel.append(this._viewer);
    this._carousel.addEventListener("cu-change",e=>{e.stopPropagation();if(e.target===this._carousel)this.goTo(e.detail.index);});
    this._select.addEventListener("cu-input",e=>e.stopPropagation());this._select.addEventListener("cu-change",e=>{e.stopPropagation();this.goTo(this._items.findIndex(x=>x.id===e.detail.value));});
    for(const type of ["cu-input","cu-change","cu-action"])this._viewer.addEventListener(type,e=>{e.stopPropagation();notify(this,type==="cu-action"?"cu-action":"cu-transform",{id:this._items[this.active]?.id,...e.detail});});
  }
  connectedCallback(){this._options();this._sync();}attributeChangedCallback(){this._sync();}
  get items(){return this._items.map(x=>({...x}));}set items(v){this._items=normalizeGalleryItems(v);this._options();this._sync();}
  get active(){return carouselIndex(Number(this.getAttribute("active")??0),this._items.length,this.loop);}set active(v){this.setAttribute("active",String(Number(v)||0));}
  get loop(){return this.hasAttribute("loop");}set loop(v){this.toggleAttribute("loop",Boolean(v));}
  goTo(index){if(!Number.isInteger(index)||index<0||index>=this._items.length||index===this.active)return false;this.active=index;notify(this,"cu-change",{index,value:this._items[index].id,item:{...this._items[index]}});return true;}
  _options(){if(!this._select)return;this._carousel.items=this._items.map(x=>({...x,src:""}));this._select.replaceChildren(...this._items.map(x=>{const o=this.ownerDocument.createElement("option");o.value=x.id;o.textContent=x.title||x.id;return o;}));queueMicrotask(()=>{if(this.isConnected)this._select.value=this._items[this.active]?.id??"";});}
  _sync(){if(!this._carousel)return;const item=this._items[this.active];this._carousel.loop=this.loop;this._carousel.active=this.active;this._select.disabled=!item;this._select.value=item?.id??"";if(!item){this._viewer.hidden=true;this._viewer.src="";return;}this._viewer.hidden=false;this._viewer.slot="slide-"+item.id;if(this._viewer.src!==item.src){this._viewer.zoom=100;this._viewer.rotation=0;this._viewer.src=item.src;}this._viewer.setAttribute("alt",item.alt||item.title);}
}
define("cu-image-gallery",CuImageGallery);
