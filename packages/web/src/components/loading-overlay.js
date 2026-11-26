import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {deepActiveElement,restoreOverlayFocus} from "./_overlay.js";
import "./spinner.js";
const css=[
  ":host{display:block;position:relative;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([loading]:not([fullscreen])){min-height:100px;}.region{min-width:0;}.overlay{position:absolute;inset:0;z-index:var(--cu-loading-z-index,20);display:grid;place-items:center;border-radius:inherit;background:color-mix(in srgb,var(--cu-surface,#fff) 76%,transparent);}",
  ".overlay[hidden]{display:none!important;}.panel{display:grid;justify-items:center;gap:10px;min-width:0;max-width:100%;padding:16px;text-align:center;outline:none;}.label{font-weight:600;overflow-wrap:anywhere;}.description{font-size:12px;color:var(--cu-text-muted,#616161);line-height:1.5;overflow-wrap:anywhere;}.description:empty{display:none;}",
  "dialog{box-sizing:border-box;width:min(330px,calc(100vw - 32px));max-height:calc(100dvh - 32px);padding:12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-xl,12px);color:var(--cu-text,#242424);background:var(--cu-surface-elevated,#fff);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}dialog::backdrop{background:rgb(0 0 0/.42);backdrop-filter:blur(2px);}",
  "@media(forced-colors:active){.overlay{background:Canvas;border:1px solid CanvasText;}dialog{border-color:CanvasText;}}",focusStyle
].join("");
const panel='<div class="panel" tabindex="-1"><cu-spinner size="lg" aria-hidden="true"></cu-spinner><div class="copy" role="status" aria-live="polite" aria-atomic="true"><div class="label"></div><div class="description"></div></div></div>';
export class CuLoadingOverlay extends BrowserElement{
  static get observedAttributes(){return ["loading","fullscreen","label","description","hidden"];}
  constructor(){
    super();this._activeMode=null;this._trigger=null;
    const root=mount(this,css,'<div class="region" part="region" aria-busy="false"><slot></slot></div><div class="overlay" part="overlay" hidden>'+panel+'</div><dialog part="dialog" aria-label="Loading">'+panel+'</dialog>');
    this._region=root.querySelector(".region");this._overlay=root.querySelector(".overlay");this._dialog=root.querySelector("dialog");
    this._dialog.addEventListener("cancel",e=>e.preventDefault());
    this._dialog.addEventListener("close",()=>{if(this._activeMode==="fullscreen"&&this.loading&&this.isConnected&&!this.hidden&&!this._dialog.open)this._dialog.showModal();});
  }
  connectedCallback(){this._sync();}
  disconnectedCallback(){this._deactivate(false);}
  attributeChangedCallback(){this._sync();}
  get loading(){return this.hasAttribute("loading");}
  set loading(v){this.toggleAttribute("loading",Boolean(v));}
  get fullscreen(){return this.hasAttribute("fullscreen");}
  set fullscreen(v){this.toggleAttribute("fullscreen",Boolean(v));}
  show(){this.loading=true;}
  hide(){this.loading=false;}
  _containsFocus(node){
    if(!node)return false;
    for(let n=node;n;n=n.parentNode||n.getRootNode?.().host){if(n===this)return true;}
    return false;
  }
  _deactivate(restore=true){
    const trigger=this._trigger,mode=this._activeMode,active=deepActiveElement(this.ownerDocument);
    const shouldRestore=mode==="fullscreen"||this._containsFocus(active);
    this._activeMode=null;this._trigger=null;
    this._overlay.hidden=true;this._region.inert=false;this._region.setAttribute("aria-busy","false");
    if(this._dialog.open)this._dialog.close();
    if(restore&&trigger&&shouldRestore)restoreOverlayFocus(trigger);
  }
  _sync(){
    if(!this._region)return;
    const label=this.getAttribute("label")||"Loading…",description=this.getAttribute("description")||"";
    for(const panel of [this._overlay,this._dialog]){
      const title=panel.querySelector(".label"),copy=panel.querySelector(".description");
      if(title.textContent!==label)title.textContent=label;if(copy.textContent!==description)copy.textContent=description;
    }
    this._dialog.setAttribute("aria-label",label);
    const next=this.isConnected&&this.loading&&!this.hidden?(this.fullscreen?"fullscreen":"region"):null;
    if(next===this._activeMode)return;
    const wasActive=Boolean(this._activeMode);
    if(wasActive)this._deactivate();
    if(next){
      const active=deepActiveElement(this.ownerDocument);
      this._trigger=next==="fullscreen"||this._containsFocus(active)?active:null;
      this._activeMode=next;this._region.setAttribute("aria-busy","true");
      if(next==="fullscreen"){
        this._region.inert=true;this._dialog.showModal();this._dialog.querySelector(".panel").focus({preventScroll:true});
      }else{
        this._overlay.hidden=false;
        if(this._trigger)this._overlay.querySelector(".panel").focus({preventScroll:true});
        this._region.inert=true;
      }
    }
    if(wasActive!==Boolean(next))notify(this,"cu-change",{loading:Boolean(next)});
  }
}
define("cu-loading-overlay",CuLoadingOverlay);
