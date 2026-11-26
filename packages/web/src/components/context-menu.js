
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./menu.js";
import { registerOverlay, unregisterOverlay, isTopOverlay, restoreOverlayFocus } from "./_overlay.js";
const css=[
  ":host{display:inline-block;max-width:100%;font:13px var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".menu{position:fixed;z-index:9999;box-sizing:border-box;width:max-content;",
  "min-width:200px;max-width:min(320px,calc(100vw - 16px));max-height:65vh;overflow-y:auto;",
  "padding:6px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));}",
  ".menu[hidden],slot:not([name]){display:none!important;}",
  "button[role=menuitem]{display:block;width:100%;box-sizing:border-box;min-height:35px;",
  "text-align:left;padding:8px 11px;border:0;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:inherit;cursor:pointer;font:inherit;}",
  "button[role=menuitem]:hover:not(:disabled),button[role=menuitem]:focus-visible{",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 17%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  "button:disabled{opacity:.42;cursor:not-allowed;}",
  "@media(forced-colors:active){.menu{border-color:CanvasText;}}"
].join("");
export function clampMenuPosition(x,y,menuWidth,menuHeight,viewportWidth,viewportHeight){
  const margin=8;
  return {
    x:Math.max(margin,Math.min(Number(x)||0,Math.max(margin,viewportWidth-menuWidth-margin))),
    y:Math.max(margin,Math.min(Number(y)||0,Math.max(margin,viewportHeight-menuHeight-margin)))
  };
}
export class CuContextMenu extends BrowserElement {
  static get observedAttributes(){return ["aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<slot name="target"></slot><div class="menu" part="menu" role="menu" hidden></div><slot></slot>');
    this._target=root.querySelector('slot[name="target"]');
    this._menu=root.querySelector(".menu");
    this._observer=null;
    this._open=false;
    this._restoreFocus=null;
    this._items=null;
    this._target.addEventListener("slotchange",()=>this._syncTargets());
    this._target.addEventListener("contextmenu",event=>{
      if(event.defaultPrevented)return;
      event.preventDefault();this.showAt(event.clientX,event.clientY);
    });
    this._target.addEventListener("keydown",event=>{
      if(event.key==="ContextMenu"||(event.shiftKey&&event.key==="F10")){
        event.preventDefault();const trigger=this._target.assignedElements({flatten:true})[0];
        const rect=trigger?.getBoundingClientRect();
        this.showAt(rect?.left??0,rect?.bottom??0);
      }
    });
    this._menu.addEventListener("click",event=>{
      const button=event.target.closest('[role="menuitem"]');
      if(!button||button.disabled)return;
      const detail={value:button.dataset.value,label:button.textContent};
      // Restore before dispatch so a consumer can move focus into a new editor/dialog.
      const session=this._session;
      restoreOverlayFocus(this._restoreFocus);
      notify(this,"cu-select",detail);
      if(this._session===session)this.hide(false);
    });
    this._menu.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&isTopOverlay(this)){event.preventDefault();event.stopPropagation();this.hide(true);return;}
      if(event.key==="Tab"){this.hide(true);return;}
      const items=this._enabled();
      if(!items.length)return;
      const index=items.indexOf(event.target);
      let next;
      if(event.key==="ArrowDown")next=items[(index+1)%items.length];
      if(event.key==="ArrowUp")next=items[(index<=0?items.length:index)-1];
      if(event.key==="Home")next=items[0];
      if(event.key==="End")next=items[items.length-1];
      if(next){event.preventDefault();next.focus();}
    });
    this._outside=event=>{
      if(this._open&&!event.composedPath().includes(this))this.hide();
    };
    this._globalKey=event=>{
      if(this._open&&event.key==="Escape"&&!event.defaultPrevented&&isTopOverlay(this)){
        event.preventDefault();this.hide(true);
      }
    };
    this._scroll=event=>{if(this._open&&!event?.composedPath?.().includes(this._menu))this.hide();};
  }
  connectedCallback(){
    this._render();
    this._syncTargets();
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==="childList"||r.type==="characterData"||
          ["value","disabled","label"].includes(r.attributeName)))this._render();
      });
      this._observer.observe(this,{childList:true,subtree:true,characterData:true,attributes:true,
        attributeFilter:["value","disabled","label"]});
    }
    document.addEventListener("pointerdown",this._outside);
    document.addEventListener("keydown",this._globalKey);
    window.addEventListener("resize",this._scroll);
    window.addEventListener("scroll",this._scroll,true);
  }
  disconnectedCallback(){
    this.hide();
    this._observer?.disconnect();this._observer=null;
    document.removeEventListener("pointerdown",this._outside);
    document.removeEventListener("keydown",this._globalKey);
    window.removeEventListener("resize",this._scroll);
    window.removeEventListener("scroll",this._scroll,true);
  }
  attributeChangedCallback(){
    if(this._menu)this._menu.setAttribute("aria-label",this.getAttribute("aria-label")||"Context actions");
  }
  get open(){return this._open;}
  get items(){return this._items;}
  set items(value){
    this._items=Array.isArray(value)?value:null;
    this._render();
  }
  _enabled(){return [...this._menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];}
  _syncTargets(){
    for(const element of this._target.assignedElements({flatten:true})){
      element.setAttribute("aria-haspopup","menu");
      element.setAttribute("aria-expanded",String(this._open));
    }
  }
  _render(){
    if(!this._menu)return;
    this._menu.setAttribute("aria-label",this.getAttribute("aria-label")||"Context actions");
    this._menu.replaceChildren();
    const items=this._items??[...this.children].filter(item=>item.localName==="cu-menu-item")
      .map(item=>({
        value:item.getAttribute("value")??item.textContent.trim(),
        label:item.getAttribute("label")??item.textContent.trim(),
        disabled:item.hasAttribute("disabled")
      }));
    for(const item of items){
      if(!item)continue;
      const button=document.createElement("button");
      button.type="button";button.setAttribute("role","menuitem");button.tabIndex=-1;
      button.disabled=Boolean(item.disabled);
      button.dataset.value=String(item.value??"");
      button.textContent=String(item.label??item.value??"");
      this._menu.append(button);
    }
  }
  showAt(x,y,focusTarget=null){
    if(!this.isConnected)return;
    this._render();
    this._restoreFocus=focusTarget??this._target.assignedElements({flatten:true})[0]??null;
    this._session={};this._menu.hidden=false;this._open=true;registerOverlay(this);this._syncTargets();
    const bounds=this._menu.getBoundingClientRect();
    const pos=clampMenuPosition(x,y,bounds.width,bounds.height,window.innerWidth,window.innerHeight);
    this._menu.style.left=pos.x+"px";
    this._menu.style.top=pos.y+"px";
    this._enabled()[0]?.focus();
    notify(this,"cu-open",{x:pos.x,y:pos.y});
  }
  hide(restoreFocus=false){
    if(!this._open)return;
    this._menu.hidden=true;this._open=false;unregisterOverlay(this);this._syncTargets();
    if(restoreFocus)restoreOverlayFocus(this._restoreFocus);
    this._restoreFocus=null;
    notify(this,"cu-close",{});
  }
}
define("cu-context-menu",CuContextMenu);
