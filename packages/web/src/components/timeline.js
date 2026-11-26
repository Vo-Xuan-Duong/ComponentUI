import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
const statuses=["neutral","success","warning","danger","active"];
export function normalizeTimelineItems(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.id!=="string"||!item.id.trim()||typeof item.title!=="string"||!item.title.trim()||seen.has(item.id))return [];
    seen.add(item.id);
    return [{id:item.id,title:item.title.trim(),description:String(item.description??""),time:String(item.time??""),datetime:String(item.datetime??""),status:statuses.includes(item.status)?item.status:"neutral",icon:String(item.icon??""),action:String(item.action??"")}];
  });
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  "ol{list-style:none;display:grid;gap:0;padding:0;margin:0;min-width:0;}.event{position:relative;display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;min-width:0;--marker:var(--cu-text-muted,#616161);}",
  ".event:not(:last-child):before{content:'';position:absolute;inset-block:26px 0;inset-inline-start:13px;width:2px;background:var(--cu-border-strong,#d1d1d1);}",
  ".marker{z-index:1;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;box-sizing:border-box;color:var(--marker);border:1px solid color-mix(in srgb,var(--marker) 40%,var(--cu-border,#e5e5e5));background:color-mix(in srgb,var(--marker) 10%,var(--cu-surface,#fff));}",
  ".dot{width:8px;height:8px;border-radius:50%;background:currentColor;}.event[data-status=success]{--marker:var(--cu-success,#107c41);}.event[data-status=warning]{--marker:var(--cu-warning,#9a6700);}.event[data-status=danger]{--marker:var(--cu-danger,#c42b1c);}.event[data-status=active]{--marker:var(--cu-accent,#0067c0);}",
  ".copy{display:grid;gap:5px;padding:3px 0 19px;min-width:0;overflow-wrap:anywhere;}.event:last-child .copy{padding-bottom:3px;}.header{display:flex;gap:8px;align-items:baseline;justify-content:space-between;flex-wrap:wrap;}.title{font-weight:650;}.time,.description,.status{color:var(--cu-text-muted,#616161);font-size:12px;line-height:1.5;}.status{color:var(--marker);}.action{justify-self:start;font:600 12px var(--cu-font-body,system-ui);color:var(--cu-accent,#0067c0);background:transparent;border:0;border-radius:5px;padding:5px 7px;margin-inline-start:-7px;cursor:pointer;}.action:hover{background:var(--cu-state-hover);}",
  ":host([size=sm]) .event{gap:8px;}:host([size=sm]) .copy{padding-bottom:12px;}:host([orientation=horizontal]) ol{display:flex;overflow-x:auto;overscroll-behavior-inline:contain;padding-bottom:5px;}:host([orientation=horizontal]) .event{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:28px auto;flex:1 0 168px;min-width:168px;max-width:240px;gap:7px;}:host([orientation=horizontal]) .event:not(:last-child):before{inset-block:13px auto;inset-inline:26px 0;width:auto;height:2px;}:host([orientation=horizontal]) .copy{padding:0 16px 8px 0;}:host([orientation=horizontal]) .header{display:grid;gap:4px;}",
  ".empty{font-size:12px;color:var(--cu-text-muted,#616161);padding:12px;}.empty[hidden]{display:none!important;}",
  "@media(forced-colors:active){.marker{border-color:CanvasText;}.event:before{background:CanvasText;}}",focusStyle
].join("");
export class CuTimeline extends BrowserElement{
  static get observedAttributes(){return ["label","aria-label","reverse","empty-text"];}
  constructor(){
    super();this._items=[];
    const root=mount(this,css,'<ol part="list" role="list"></ol><div class="empty" part="empty" hidden></div>');
    this._list=root.querySelector("ol");this._empty=root.querySelector(".empty");
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(item=>({...item}));}
  set items(v){this._items=normalizeTimelineItems(v);this._render();}
  _render(){
    if(!this._list)return;
    const doc=this.ownerDocument,focused=this.shadowRoot.activeElement?.dataset?.id;
    const items=this.hasAttribute("reverse")?[...this._items].reverse():this._items;
    this._list.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Timeline");
    this._empty.hidden=Boolean(items.length);this._empty.textContent=this.getAttribute("empty-text")||"No activity yet.";
    this._list.replaceChildren(...items.map(item=>{
      const row=doc.createElement("li");row.className="event";row.dataset.status=item.status;
      const marker=doc.createElement("span");marker.className="marker";marker.setAttribute("aria-hidden","true");
      const iconName=item.icon||({success:"check",warning:"info",danger:"x",active:"arrow-up-right"})[item.status];
      if(iconName){const icon=doc.createElement("cu-icon");icon.setAttribute("name",iconName);icon.setAttribute("size","15");marker.append(icon);}
      else{const dot=doc.createElement("span");dot.className="dot";marker.append(dot);}
      const copy=doc.createElement("div");copy.className="copy";
      const header=doc.createElement("div");header.className="header";const title=doc.createElement("span");title.className="title";title.textContent=item.title;header.append(title);
      if(item.time||item.datetime){const time=doc.createElement("time");time.className="time";time.textContent=item.time||item.datetime;if(item.datetime)time.dateTime=item.datetime;header.append(time);}
      copy.append(header);
      if(item.description){const desc=doc.createElement("div");desc.className="description";desc.textContent=item.description;copy.append(desc);}
      if(item.status!=="neutral"){const status=doc.createElement("span");status.className="status";status.textContent=({success:"Completed",warning:"Warning",danger:"Failed",active:"In progress"})[item.status];copy.append(status);}
      if(item.action){const button=doc.createElement("button");button.className="action";button.type="button";button.dataset.id=item.id;button.textContent=item.action;button.setAttribute("aria-label",item.action+": "+item.title);button.addEventListener("click",()=>notify(this,"cu-action",{id:item.id,action:item.action,item:{...item}}));copy.append(button);}
      row.append(marker,copy);return row;
    }));
    if(focused)[...this._list.querySelectorAll("button")].find(b=>b.dataset.id===focused)?.focus({preventScroll:true});
  }
}
define("cu-timeline",CuTimeline);
