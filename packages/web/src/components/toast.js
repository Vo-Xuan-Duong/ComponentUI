import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";

export function normalizeToast(options={}){
  const raw=options.duration==null?5000:Number(options.duration);
  return {id:String(options.id??""),title:String(options.title??""),message:String(options.message??""),
    tone:["info","success","warning","danger"].includes(options.tone)?options.tone:"info",
    duration:Number.isFinite(raw)?raw===0?0:Math.max(3000,Math.min(60000,raw)):5000,action:String(options.action??"")};
}
const css=[
  ":host{position:fixed;z-index:11000;inset:auto 16px 16px auto;width:min(360px,calc(100vw - 32px));pointer-events:none;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([placement=top-end]){inset:16px 16px auto auto;}:host([placement=bottom-start]){inset:auto auto 16px 16px;}",
  ".stack{display:grid;gap:8px;}.toast{--tone:var(--cu-accent,#0067c0);pointer-events:auto;display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));animation:enter var(--cu-motion-normal,160ms) ease-out;}",
  ".toast[data-tone=success]{--tone:var(--cu-success,#107c41);}.toast[data-tone=warning]{--tone:var(--cu-warning,#9a6700);}.toast[data-tone=danger]{--tone:var(--cu-danger,#c42b1c);}",
  ".mark{color:var(--tone);margin-top:2px;flex:none;}.copy{flex:1;min-width:0;overflow-wrap:anywhere;line-height:1.45;}.title{font-weight:650;}.message{color:var(--cu-text-muted,#616161);}.title:empty,.message:empty{display:none;}",
  "button{border:0;border-radius:var(--cu-radius-md,6px);background:transparent;color:inherit;font:inherit;padding:5px;cursor:pointer;}.close{display:grid;place-items:center;flex:none;}.action{color:var(--cu-accent,#0067c0);font-weight:600;margin-top:6px;}button:hover{background:var(--cu-state-hover);}",
  "@keyframes enter{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}",
  "@media(forced-colors:active){.toast{border-color:CanvasText;}}",focusStyle
].join("");
export class CuToast extends BrowserElement{
  static get observedAttributes(){return ["max-visible"];}
  constructor(){
    super();this._entries=[];this._sequence=0;
    this._stack=mount(this,css,'<div class="stack" part="stack" aria-label="Notifications"></div>').querySelector(".stack");
  }
  connectedCallback(){this._drain();}
  disconnectedCallback(){for(const entry of this._entries){this._pause(entry,"disconnect");entry.node?.remove();entry.node=null;entry.paused.clear();}}
  attributeChangedCallback(){this._drain();}
  _limit(){const raw=this.getAttribute("max-visible");const n=raw===null?3:Number(raw);return Number.isFinite(n)?Math.max(1,Math.min(10,Math.floor(n))):3;}
  show(options={}){
    const data=normalizeToast(options);if(!data.id){do{data.id="toast-"+(++this._sequence);}while(this._entries.some(e=>e.data.id===data.id));}
    if(this._entries.some(e=>e.data.id===data.id))return data.id;
    this._entries.push({data,node:null,timer:null,remaining:data.duration,started:0,paused:new Set()});this._drain();return data.id;
  }
  dismiss(id,reason="manual"){
    const i=this._entries.findIndex(e=>e.data.id===id);if(i<0)return false;
    const [entry]=this._entries.splice(i,1);clearTimeout(entry.timer);entry.node?.remove();
    notify(this,"cu-dismiss",{id,reason,tone:entry.data.tone});this._drain();return true;
  }
  clear(){
    const entries=this._entries.splice(0);
    for(const entry of entries){clearTimeout(entry.timer);entry.node?.remove();notify(this,"cu-dismiss",{id:entry.data.id,reason:"clear",tone:entry.data.tone});}
  }
  _drain(){
    if(!this._stack||!this.isConnected)return;
    const limit=this._limit();
    // Keep the FIFO order when the visible capacity shrinks. Paused entries
    // retain remaining time and are remounted only when capacity returns.
    const visibleEntries=this._entries.filter(e=>e.node);
    for(const entry of visibleEntries.slice(limit)){
      this._pause(entry,"capacity");
      entry.node.remove();entry.node=null;entry.paused.clear();
    }
    let visible=this._entries.filter(e=>e.node).length;
    for(const entry of this._entries){if(visible>=limit)break;if(entry.node)continue;this._mountToast(entry);visible++;}
  }
  _mountToast(entry){
    const doc=this.ownerDocument,data=entry.data,node=doc.createElement("div");
    node.className="toast";node.dataset.tone=data.tone;node.setAttribute("part","toast");
    const icon=doc.createElement("cu-icon");icon.className="mark";icon.setAttribute("name",({info:"info",success:"circle-check",warning:"shield-check",danger:"x"})[data.tone]);icon.setAttribute("size","20");
    const copy=doc.createElement("div");copy.className="copy";
    const announcement=doc.createElement("div");announcement.setAttribute("role",data.tone==="danger"?"alert":"status");announcement.setAttribute("aria-atomic","true");
    const title=doc.createElement("div");title.className="title";
    const message=doc.createElement("div");message.className="message";
    announcement.append(title,message);copy.append(announcement);
    if(data.action){const action=doc.createElement("button");action.type="button";action.className="action";action.textContent=data.action;action.addEventListener("click",()=>{notify(this,"cu-action",{id:data.id,action:data.action});this.dismiss(data.id,"action");});copy.append(action);}
    const close=doc.createElement("button");close.type="button";close.className="close";close.setAttribute("aria-label","Dismiss "+(data.title||"notification"));
    const x=doc.createElement("cu-icon");x.setAttribute("name","x");x.setAttribute("size","16");close.append(x);close.addEventListener("click",()=>this.dismiss(data.id));
    node.append(icon,copy,close);entry.node=node;this._stack.append(node);
    title.textContent=data.title;message.textContent=data.message;
    node.addEventListener("pointerenter",()=>this._pause(entry,"pointer"));
    node.addEventListener("pointerleave",()=>this._resume(entry,"pointer"));
    node.addEventListener("focusin",()=>this._pause(entry,"focus"));
    node.addEventListener("focusout",e=>{if(!node.contains(e.relatedTarget))this._resume(entry,"focus");});
    this._schedule(entry);
  }
  _schedule(entry){
    if(!entry.node||entry.data.duration===0||entry.paused.size||entry.timer!==null)return;
    entry.started=Date.now();
    entry.timer=setTimeout(()=>{entry.timer=null;this.dismiss(entry.data.id,"timeout");},entry.remaining);
  }
  _pause(entry,reason){
    entry.paused.add(reason);
    if(entry.timer!==null){clearTimeout(entry.timer);entry.timer=null;entry.remaining=Math.max(0,entry.remaining-(Date.now()-entry.started));}
  }
  _resume(entry,reason){entry.paused.delete(reason);this._schedule(entry);}
}
define("cu-toast",CuToast);
