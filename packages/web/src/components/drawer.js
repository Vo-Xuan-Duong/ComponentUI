import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon-button.js";
import { deepActiveElement, restoreOverlayFocus, registerOverlay, unregisterOverlay, isTopOverlay, dismissDescendantOverlays } from "./_overlay.js";

const css=[
  ":host{display:contents;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  "dialog{position:fixed;box-sizing:border-box;margin:0;padding:0;width:min(var(--cu-drawer-width,380px),100vw);",
  "height:100dvh;max-height:100dvh;max-width:100vw;inset-block:0;",
  "border:0;background:var(--cu-surface-elevated,#fff);color:var(--cu-text,#242424);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.2));}",
  ":host(:not([placement=left])) dialog{inset-inline:auto 0;border-left:1px solid var(--cu-border,#e5e5e5);}",
  ":host([placement=left]) dialog{inset-inline:0 auto;border-right:1px solid var(--cu-border,#e5e5e5);}",
  ":host([size=sm]){--cu-drawer-width:300px;}",
  ":host([size=lg]){--cu-drawer-width:560px;}",
  "dialog::backdrop{background:rgb(0 0 0/.42);backdrop-filter:blur(3px);}",
  ".layout{display:flex;flex-direction:column;min-height:0;height:100%;}",
  "header{display:flex;align-items:center;justify-content:space-between;gap:12px;",
  "padding:16px 20px;border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "h2{font:650 17px/1.4 var(--cu-font-body,system-ui);margin:0;min-width:0;}",
  ".close{flex:none;}",
  ".close[hidden]{display:none!important;}",
  "main{flex:1;overflow-y:auto;padding:18px 20px;min-height:0;}",
  "footer{padding:14px 20px;border-top:1px solid var(--cu-border,#e5e5e5);}",
  "footer[hidden]{display:none!important;}",
  "@media(max-width:420px){dialog{width:100vw;}}",
  "dialog[open]{animation:cu-drawer-enter var(--cu-motion-normal,160ms) ease both;}",
  "@keyframes cu-drawer-enter{from{opacity:.55}to{opacity:1}}",
  "@media(prefers-reduced-motion:reduce){dialog{scroll-behavior:auto;animation:none;}}",
  "@media(forced-colors:active){dialog{border:1px solid CanvasText;}",
  ".close:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuDrawer extends BrowserElement {
  static get observedAttributes(){return ["open","title","placement","size","dismissible"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<dialog part="dialog" aria-modal="true" aria-labelledby="cu-drawer-title">' +
      '<div class="layout"><header part="header"><h2 id="cu-drawer-title" part="title"></h2>' +
      '<cu-icon-button class="close" name="x" size="sm" part="close" aria-label="Close drawer"></cu-icon-button></header>' +
      '<main part="content"><slot></slot></main>' +
      '<footer part="footer" hidden><slot name="actions"></slot></footer></div></dialog>');
    this._dialog=root.querySelector("dialog");
    this._title=root.querySelector("h2");
    this._close=root.querySelector(".close");
    this._footer=root.querySelector("footer");
    this._actions=root.querySelector('slot[name="actions"]');
    this._actions.addEventListener("slotchange",()=>this._syncFooter());
    this._trigger=null;
    this._dialog.addEventListener("close",()=>{
      if(this._dialog.open)return;
      dismissDescendantOverlays(this);const wasTop=isTopOverlay(this);unregisterOverlay(this);
      if(this.hasAttribute("open"))this.removeAttribute("open");
      const trigger=this._trigger;this._trigger=null;
      if(!this.isConnected)return;if(wasTop)restoreOverlayFocus(trigger);
      notify(this,"cu-close",{returnValue:this._dialog.returnValue});
    });
    this._dialog.addEventListener("cancel",event=>{
      if(!this.dismissible||!isTopOverlay(this))event.preventDefault();
    });
    this._close.addEventListener("cu-press",event=>{event.stopPropagation();this.close();});
    this._dialog.addEventListener("click",event=>{
      if(event.target!==this._dialog||!this.hasAttribute("dismissible"))return;
      const r=this._dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||
        event.clientY<r.top||event.clientY>r.bottom)this.close();
    });
  }
  connectedCallback(){this._sync();}
  disconnectedCallback(){dismissDescendantOverlays(this);unregisterOverlay(this);this._trigger=null;if(this._dialog.open)this._dialog.close();this.removeAttribute("open");}
  attributeChangedCallback(){this._sync();}
  get open(){return this.hasAttribute("open");}
  set open(v){this.toggleAttribute("open",Boolean(v));}
  get dismissible(){return this.hasAttribute("dismissible");}
  set dismissible(v){this.toggleAttribute("dismissible",Boolean(v));}
  show(){this.open=true;}
  close(returnValue=""){
    if(this._dialog.open){dismissDescendantOverlays(this);this._dialog.close(returnValue);}
    else this.open=false;
  }
  _syncFooter(){
    this._footer.hidden=this._actions.assignedElements({flatten:true}).length===0;
  }
  _sync(){
    if(!this._dialog)return;
    this._syncFooter();
    this._title.textContent=this.getAttribute("title")||"Details";
    this._close.hidden=!this.dismissible;
    if(!this.isConnected)return;
    if(this.open&&!this._dialog.open){
      this._trigger??=deepActiveElement(this.ownerDocument);
      this._dialog.returnValue="";
      this._dialog.showModal();registerOverlay(this);
      notify(this,"cu-open",{});
    }else if(!this.open&&this._dialog.open){
      dismissDescendantOverlays(this);this._dialog.close();
    }
  }
}
define("cu-drawer",CuDrawer);
