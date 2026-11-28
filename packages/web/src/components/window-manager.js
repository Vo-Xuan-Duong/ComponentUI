import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./window-pane.js";
import "./dock-layout.js";
import "./button.js";
import "./empty-state.js";

export function resolveWindowId(windows,requested){
  const open=(Array.isArray(windows)?windows:[]).filter(w=>w&&typeof w.id==="string"&&w.id&&!w.closed);
  return open.find(w=>w.id===requested)?.id??open[0]?.id??"";
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}cu-dock-layout{height:var(--cu-window-manager-height,380px);}.navigator,.buttons{display:grid;gap:6px;}.navigator{padding:8px;}.navigator cu-button::part(button){width:100%;justify-content:flex-start;white-space:normal;}.workspace{padding:8px;min-width:0;}::slotted(cu-window-pane[hidden]){display:none!important;}.label{font-weight:650;padding:4px 2px;}.empty[hidden]{display:none;}";
export class CuWindowManager extends BrowserElement{
  static get observedAttributes(){return ["active"];}
  constructor(){
    super();this._closed=new Set();this._panes=[];
    const root=mount(this,css,'<cu-dock-layout label="Window workspace"><div class="navigator" slot="start" role="group" aria-label="Open windows"><span class="label">Windows</span><div class="buttons"></div></div><div class="workspace"><slot></slot><cu-empty-state class="empty" size="sm" title="No open windows" tabindex="-1" hidden></cu-empty-state></div></cu-dock-layout>');
    this._dock=root.querySelector("cu-dock-layout");this._slot=root.querySelector("slot");this._buttons=root.querySelector(".buttons");this._empty=root.querySelector(".empty");
    this._slot.addEventListener("slotchange",()=>this._collect());
    for(const type of ["cu-input","cu-change","cu-resize"])this._dock.addEventListener(type,e=>{if(e.target===this._dock)e.stopPropagation();});
    this._buttons.addEventListener("cu-press",e=>{e.stopPropagation();this.activateWindow(e.target.dataset.window);});
    this.addEventListener("cu-close",e=>{const pane=e.target;if(!this._panes.includes(pane))return;e.stopPropagation();this.closeWindow(pane.dataset.windowId);});
  }
  connectedCallback(){this._collect();const Observer=this.ownerDocument.defaultView?.MutationObserver;if(Observer){this._observer=new Observer(records=>{if(records.some(r=>r.type==="childList"?r.target===this:r.target.parentNode===this&&r.target.localName==="cu-window-pane"))this._collect();});this._observer.observe(this,{childList:true,subtree:true,attributes:true,attributeFilter:["title","data-window-id"]});}}
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(){this._sync();}
  get active(){return resolveWindowId(this.windows,this.getAttribute("active"));}
  set active(v){this.setAttribute("active",String(v??""));}
  get windows(){return this._panes.map(p=>({id:p.dataset.windowId,title:p.getAttribute("title")||p.dataset.windowId,closed:this._closed.has(p.dataset.windowId)}));}
  get layout(){return this._dock.layout;}set layout(v){this._dock.layout=v;}
  activateWindow(id){if(!this.windows.some(w=>w.id===id&&!w.closed))return false;if(this.active===id)return true;this.active=id;notify(this,"cu-change",{value:id});return true;}
  closeWindow(id){
    if(!this.windows.some(w=>w.id===id&&!w.closed))return false;
    const pane=this._panes.find(p=>p.dataset.windowId===id),wasActive=this.active===id,hadFocus=Boolean(pane?.matches(":focus-within"));
    this._closed.add(id);
    if(wasActive)this.active=this.active;else this._sync();
    if(hadFocus){const target=[...this._buttons.children].find(b=>b.dataset.window===this.active);if(target)target.focus({preventScroll:true});else this._empty.focus({preventScroll:true});}
    notify(this,"cu-action",{action:"close",id,active:this.active});return true;
  }
  reopenWindow(id){
    if(!this._panes.some(p=>p.dataset.windowId===id)||!this._closed.delete(id))return false;
    this.active=id;this._sync();notify(this,"cu-action",{action:"reopen",id,active:this.active});return true;
  }
  _collect(){
    if(!this._slot)return;
    const seen=new Set(),panes=this._slot.assignedElements().filter(p=>p.localName==="cu-window-pane");this._panes=panes.filter(p=>p.dataset.windowId&&!seen.has(p.dataset.windowId)&&seen.add(p.dataset.windowId));
    for(const pane of panes)if(!this._panes.includes(pane)){pane.hidden=true;pane.inert=true;}
    for(const id of this._closed)if(!seen.has(id))this._closed.delete(id);
    this._sync();
  }
  _sync(){
    if(!this._buttons)return;
    const active=this.active,doc=this.ownerDocument;
    for(const pane of this._panes){const hidden=pane.dataset.windowId!==active;pane.hidden=hidden;pane.inert=hidden;}
    const focused=this.shadowRoot.activeElement?.dataset?.window;
    this._buttons.replaceChildren(...this.windows.filter(w=>!w.closed).map(w=>{const button=doc.createElement("cu-button");button.dataset.window=w.id;button.setAttribute("variant",w.id===active?"accent":"subtle");button.setAttribute("size","sm");button.setAttribute("aria-label",w.title+(w.id===active?", active":""));button.textContent=w.title;return button;}));
    this._empty.hidden=Boolean(active);
    if(focused){const target=[...this._buttons.children].find(b=>b.dataset.window===focused)||[...this._buttons.children].find(b=>b.dataset.window===active);target?.focus?.();}
  }
}
define("cu-window-manager",CuWindowManager);
