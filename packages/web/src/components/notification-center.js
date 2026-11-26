import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
export function normalizeNotifications(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.id!=="string"||!item.id||seen.has(item.id))return [];
    seen.add(item.id);
    return [{id:item.id,title:String(item.title??""),message:String(item.message??""),tone:["info","success","warning","danger"].includes(item.tone)?item.tone:"info",read:Boolean(item.read),action:String(item.action??"")}];
  });
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);overflow:hidden;}",
  ".header{padding:13px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}.title{font-weight:650;font-size:15px;}.count{font-size:12px;color:var(--cu-text-muted,#616161);}",
  ".toolbar{display:flex;align-items:center;gap:5px;padding:0 10px 10px;flex-wrap:wrap;}.toolbar button{white-space:nowrap;}.spacer{flex:1;}",
  "button{border:1px solid transparent;border-radius:var(--cu-radius-md,6px);background:transparent;color:inherit;font:inherit;padding:6px 8px;cursor:pointer;}",
  "button:hover:not(:disabled){background:var(--cu-state-hover);}button:disabled{opacity:.45;cursor:default;}button[aria-pressed=true]{background:var(--cu-state-selected);color:var(--cu-accent,#0067c0);font-weight:600;}",
  ".list{max-height:var(--cu-notification-height,380px);overflow:auto;overscroll-behavior:contain;}.item{display:flex;align-items:flex-start;gap:9px;padding:12px;border-top:1px solid var(--cu-border,#e5e5e5);}",
  ".item[data-unread=true]{background:var(--cu-state-hover);}.item:hover{background:var(--cu-state-selected);}.mark{color:var(--cu-accent,#0067c0);flex:none;}.item[data-tone=success] .mark{color:var(--cu-success,#107c41);}.item[data-tone=warning] .mark{color:var(--cu-warning,#9a6700);}.item[data-tone=danger] .mark{color:var(--cu-danger,#c42b1c);}",
  ".copy{flex:1;min-width:0;overflow-wrap:anywhere;display:grid;gap:4px;}.name{font-weight:600;}.message{color:var(--cu-text-muted,#616161);line-height:1.45;}.message:empty{display:none;}.actions{display:flex;flex-wrap:wrap;gap:3px;}.action{color:var(--cu-accent,#0067c0);font-weight:600;}.close{display:grid;place-items:center;padding:4px;flex:none;}",
  ".empty{padding:28px;text-align:center;color:var(--cu-text-muted,#616161);}.empty cu-icon{margin-bottom:8px;}.empty p{margin:0;}",
  "@media(forced-colors:active){.item[data-unread=true]{border-inline-start:3px solid Highlight;}}",focusStyle
].join("");
export class CuNotificationCenter extends BrowserElement{
  static get observedAttributes(){return ["label"];}
  constructor(){
    super();this._items=[];this._filter="all";
    const root=mount(this,css,'<section class="frame" aria-labelledby="nc-title"><div class="header"><span id="nc-title" class="title"></span><span class="count" role="status" aria-live="polite"></span></div><div class="toolbar"><button class="all" type="button" aria-pressed="true">All</button><button class="unread" type="button" aria-pressed="false">Unread</button><span class="spacer"></span><button class="mark-all" type="button">Mark all read</button></div><div class="list" role="list" aria-label="Notifications"></div></section>');
    for(const [k,q] of Object.entries({title:".title",count:".count",all:".all",unread:".unread",markAll:".mark-all",list:".list"}))this["_"+k]=root.querySelector(q);
    this._all.addEventListener("click",()=>{this._filter="all";this._render();});
    this._unread.addEventListener("click",()=>{this._filter="unread";this._render();});
    this._markAll.addEventListener("click",()=>{this.markAllRead();if(this._markAll.disabled)this._all.focus();});
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeNotifications(v);this._render();}
  get unreadCount(){return this._items.filter(x=>!x.read).length;}
  _changed(reason,id){
    this._render();notify(this,"cu-change",{id,reason,unreadCount:this.unreadCount,notifications:this.items});
  }
  add(item){
    const next=normalizeNotifications([item])[0];if(!next||this._items.some(x=>x.id===next.id))return false;
    this._items=[next,...this._items];this._changed("add",next.id);return true;
  }
  markRead(id,read=true){
    const item=this._items.find(x=>x.id===id);if(!item||item.read===Boolean(read))return false;
    this._items=this._items.map(x=>x.id===id?{...x,read:Boolean(read)}:x);this._changed(read?"read":"unread",id);return true;
  }
  markAllRead(){if(!this.unreadCount)return;this._items=this._items.map(x=>({...x,read:true}));this._changed("read-all");}
  dismiss(id){
    if(!this._items.some(x=>x.id===id))return false;
    this._items=this._items.filter(x=>x.id!==id);this._changed("dismiss",id);notify(this,"cu-dismiss",{id,reason:"manual"});return true;
  }
  clear(){if(!this._items.length)return;this._items=[];this._changed("clear");}
  _render(){
    if(!this._list)return;
    const doc=this.ownerDocument,active=this.shadowRoot.activeElement;
    const focusId=active?.dataset?.notificationId,focusAction=active?.dataset?.notificationAction;
    this._title.textContent=this.getAttribute("label")||"Notifications";
    const unread=this.unreadCount;const count=unread+" unread";if(this._count.textContent!==count)this._count.textContent=count;
    this._all.setAttribute("aria-pressed",String(this._filter==="all"));this._unread.setAttribute("aria-pressed",String(this._filter==="unread"));this._markAll.disabled=!unread;
    const items=this._filter==="unread"?this._items.filter(x=>!x.read):this._items;
    const nodes=items.map(item=>{
      const row=doc.createElement("div");row.className="item";row.setAttribute("role","listitem");row.dataset.unread=String(!item.read);row.dataset.tone=item.tone;
      const icon=doc.createElement("cu-icon");icon.className="mark";icon.setAttribute("name",({info:"info",success:"circle-check",warning:"shield-check",danger:"x"})[item.tone]);icon.setAttribute("size","20");
      const copy=doc.createElement("div");copy.className="copy";
      const name=doc.createElement("span");name.className="name";name.textContent=item.title;
      const message=doc.createElement("span");message.className="message";message.textContent=item.message;
      const actions=doc.createElement("div");actions.className="actions";
      const button=(key,text,callback)=>{const b=doc.createElement("button");b.type="button";b.dataset.notificationId=item.id;b.dataset.notificationAction=key;b.textContent=text;b.addEventListener("click",callback);return b;};
      const read=button("read",item.read?"Mark unread":"Mark read",()=>this.markRead(item.id,!item.read));actions.append(read);
      if(item.action){const action=button("action",item.action,()=>notify(this,"cu-action",{id:item.id,action:item.action}));action.className="action";actions.append(action);}
      copy.append(name,message,actions);
      const close=button("dismiss","",()=>this.dismiss(item.id));close.className="close";close.setAttribute("aria-label","Dismiss "+(item.title||"notification"));
      const x=doc.createElement("cu-icon");x.setAttribute("name","x");x.setAttribute("size","16");close.append(x);
      row.append(icon,copy,close);return row;
    });
    if(!nodes.length){const empty=doc.createElement("div");empty.className="empty";const icon=doc.createElement("cu-icon");icon.setAttribute("name","bell");icon.setAttribute("size","28");const text=doc.createElement("p");text.textContent=this._filter==="unread"?"You're all caught up.":"No notifications.";empty.append(icon,text);nodes.push(empty);}
    this._list.replaceChildren(...nodes);
    if(focusId){const target=[...this._list.querySelectorAll("button")].find(b=>b.dataset.notificationId===focusId&&b.dataset.notificationAction===focusAction);(target??this._all).focus({preventScroll:true});}
  }
}
define("cu-notification-center",CuNotificationCenter);
