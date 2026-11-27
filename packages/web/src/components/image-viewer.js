import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./image.js";
import "./slider.js";
import "./button.js";
import "./scroll-area.js";
import "./icon.js";
export function normalizeImageTransform(zoom=100,rotation=0){
  const z=Number(zoom),r=Number(rotation);
  return {zoom:Number.isFinite(z)?Math.min(300,Math.max(25,Math.round(z))):100,rotation:Number.isFinite(r)?((Math.round(r/90)*90%360)+360)%360:0};
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}.tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px;}cu-slider{flex:1 1 160px;}cu-scroll-area{--cu-scroll-max-height:var(--cu-image-viewer-height,420px);border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-alt,#fafafa);}.stage{display:grid;place-items:center;min-width:100%;width:max-content;min-height:220px;}.canvas{width:calc(var(--cu-viewer-base-size,260px) * var(--zoom,1));height:calc(var(--cu-viewer-base-size,260px) * var(--zoom,1));display:grid;place-items:center;}.canvas cu-image{width:100%;height:100%;transform:rotate(var(--rotation,0deg));--cu-image-max-height:none;--cu-image-min-height:0;}.canvas cu-image::part(frame){height:100%;background:transparent;}.canvas cu-image::part(image){object-fit:contain;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}@media(forced-colors:active){cu-scroll-area{border-color:CanvasText;}}";
export class CuImageViewer extends BrowserElement{
  static get observedAttributes(){return ["src","alt","zoom","rotation"];}
  constructor(){
    super();
    const root=mount(this,css,'<section class="panel" aria-label="Image viewer"><div class="tools"><cu-slider label="Zoom (%)" min="25" max="300" step="1" value="100"></cu-slider><cu-button size="sm" variant="outline" data-action="out" aria-label="Zoom out"><cu-icon name="minus" size="16"></cu-icon></cu-button><cu-button size="sm" variant="outline" data-action="in" aria-label="Zoom in"><cu-icon name="plus" size="16"></cu-icon></cu-button><cu-button size="sm" variant="outline" data-action="rotate">Rotate 90°</cu-button><cu-button size="sm" variant="outline" data-action="reset">Reset</cu-button></div><cu-scroll-area axis="both" label="Image canvas" scrollbar="thin"><div class="stage"><div class="canvas" part="canvas"><cu-image loading="eager"></cu-image></div></div></cu-scroll-area><div class="status" role="status"></div></section>');
    this._slider=root.querySelector("cu-slider");this._image=root.querySelector("cu-image");this._canvas=root.querySelector(".canvas");this._status=root.querySelector(".status");
    this._slider.addEventListener("cu-input",e=>{e.stopPropagation();this.zoom=e.detail.value;notify(this,"cu-input",this.transform);});
    this._slider.addEventListener("cu-change",e=>{e.stopPropagation();this.zoom=e.detail.value;notify(this,"cu-change",this.transform);});
    root.querySelector(".tools").addEventListener("cu-press",e=>{e.stopPropagation();const action=e.target.dataset.action;if(action==="in")this.zoom+=25;else if(action==="out")this.zoom-=25;else if(action==="rotate")this.rotation+=90;else if(action==="reset"){this.zoom=100;this.rotation=0;}else return;notify(this,"cu-change",this.transform);});
    this._image.addEventListener("cu-change",e=>{e.stopPropagation();notify(this,"cu-action",{action:"image-load",...e.detail});});
    root.querySelector("cu-scroll-area").addEventListener("cu-scroll",e=>e.stopPropagation());
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get src(){return this.getAttribute("src")||"";}set src(v){this.setAttribute("src",String(v??""));}
  get zoom(){return normalizeImageTransform(this.getAttribute("zoom")??100).zoom;}set zoom(v){this.setAttribute("zoom",String(normalizeImageTransform(v).zoom));}
  get rotation(){return normalizeImageTransform(100,this.getAttribute("rotation")??0).rotation;}set rotation(v){this.setAttribute("rotation",String(normalizeImageTransform(100,v).rotation));}
  get transform(){return {zoom:this.zoom,rotation:this.rotation};}
  _sync(){if(!this._image)return;for(const k of ["src","alt"]){const v=this.getAttribute(k)||"";if(this._image.getAttribute(k)!==v)this._image.setAttribute(k,v);}if(this._slider.value!==this.zoom)this._slider.value=this.zoom;this._canvas.style.setProperty("--zoom",String(this.zoom/100));this._canvas.style.setProperty("--rotation",this.rotation+"deg");this._status.textContent=this.zoom+"% · "+this.rotation+"°";}
}
define("cu-image-viewer",CuImageViewer);
