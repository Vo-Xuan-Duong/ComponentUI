import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./search-box.js";
import "./select.js";
import "./button.js";
import "./virtual-list.js";
import "./empty-state.js";
import "./icon.js";

export const LOG_LEVELS=Object.freeze(["debug","info","warn","error"]);
export function normalizeLogEntries(value){
  const seen=new Set(),out=[];
  for(const item of Array.isArray(value)?value:[]){
    if(!item||typeof item.id!=="string"||!item.id||seen.has(item.id)||typeof item.message!=="string")continue;
    seen.add(item.id);
    out.push({id:item.id,message:item.message,level:LOG_LEVELS.includes(item.level)?item.level:"info",
      timestamp:String(item.timestamp??""),source:String(item.source??"")});
  }
  return out;
}
const fold=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function filterLogEntries(items,query="",level="all"){
  const terms=fold(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(item=>(level==="all"||item.level===level)&&
    terms.every(term=>fold([item.timestamp,item.level,item.source,item.message].join(" ")).includes(term)));
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".panel{display:grid;gap:var(--cu-space-3,12px);min-width:0;}",
  ".toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:var(--cu-space-2,8px);}",
  "cu-search-box{flex:1 1 180px;min-width:0;}cu-select{flex:0 1 140px;min-width:100px;}cu-button{flex:none;}",
  "cu-virtual-list{height:var(--cu-log-height,320px);}",
  "cu-virtual-list::part(items){font-family:var(--cu-font-mono,monospace);}",
  ".count{font-size:12px;color:var(--cu-text-muted,#616161);}",
  ".detail{min-width:0;padding:var(--cu-space-3,12px);border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);background:var(--cu-surface-alt,#fafafa);}",
  ".detail strong{display:block;margin-bottom:6px;}.detail pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 var(--cu-font-mono,monospace);}",
  ".detail[hidden]{display:none;}@media(forced-colors:active){.detail{border-color:CanvasText;}}"
].join("");

export class CuLogViewer extends BrowserElement{
  static get observedAttributes(){return ["query","level","label"];}
  constructor(){
    super();this._items=[];this._visible=[];this._selectedId=null;
    const root=mount(this,css,
      '<section class="panel" part="panel"><div class="toolbar" part="toolbar">'+
      '<cu-search-box aria-label="Search logs" placeholder="Search logs"></cu-search-box>'+
      '<cu-select aria-label="Log level" value="all"><option value="all">All levels</option><option value="debug">Debug</option><option value="info">Info</option><option value="warn">Warning</option><option value="error">Error</option></cu-select>'+
      '<cu-button variant="outline" aria-label="Reset log filters"><cu-icon name="x" size="16"></cu-icon>Reset</cu-button></div>'+
      '<div class="count" role="status"></div><cu-virtual-list label="Log entries" item-height="36" exportparts="viewport:list"></cu-virtual-list>'+
      '<cu-empty-state size="sm" title="No matching logs" description="Change the filters or add log entries." hidden></cu-empty-state>'+
      '<div class="detail" part="detail" hidden><strong>Selected entry</strong><pre></pre></div></section>');
    this._panel=root.querySelector(".panel");this._search=root.querySelector("cu-search-box");
    this._level=root.querySelector("cu-select");this._reset=root.querySelector("cu-button");
    this._list=root.querySelector("cu-virtual-list");this._empty=root.querySelector("cu-empty-state");
    this._count=root.querySelector(".count");this._detail=root.querySelector(".detail");this._text=root.querySelector("pre");
    this._search.addEventListener("cu-input",event=>{event.stopPropagation();this.query=event.detail.value;this._emitFilter();});
    for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,event=>event.stopPropagation());
    this._level.addEventListener("cu-change",event=>{event.stopPropagation();this.level=event.detail.value;this._emitFilter();});
    this._reset.addEventListener("cu-press",event=>{event.stopPropagation();this.resetFilters();});
    this._list.addEventListener("cu-change",event=>{
      event.stopPropagation();const item=this._visible[event.detail.index];if(!item)return;
      this._selectedId=item.id;this._syncDetail(item);notify(this,"cu-select",{id:item.id,value:item.id,item:{...item}});
    });
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(item=>({...item}));}
  set items(value){this._items=normalizeLogEntries(value);this._render();}
  get query(){return this.getAttribute("query")||"";}
  set query(value){this.setAttribute("query",String(value??""));}
  get level(){const level=this.getAttribute("level");return LOG_LEVELS.includes(level)?level:"all";}
  set level(value){this.setAttribute("level",LOG_LEVELS.includes(value)?value:"all");}
  get visibleItems(){return this._visible.map(item=>({...item}));}
  resetFilters(){if(!this.query&&this.level==="all")return false;this.query="";this.level="all";this._emitFilter();return true;}
  _emitFilter(){notify(this,"cu-filter",{query:this.query,level:this.level,visible:this._visible.length,total:this._items.length});}
  _syncDetail(item){
    this._detail.hidden=!item;
    this._text.textContent=item?[item.timestamp,item.level.toUpperCase(),item.source,item.message].filter(Boolean).join(" · "):"";
  }
  _render(){
    if(!this._list)return;
    this._panel.setAttribute("aria-label",this.getAttribute("label")||"Log viewer");
    if(this._search.value!==this.query)this._search.value=this.query;
    if(this._level.value!==this.level)this._level.value=this.level;
    this._reset.disabled=!this.query&&this.level==="all";
    this._visible=filterLogEntries(this._items,this.query,this.level);
    const selected=this._visible.findIndex(item=>item.id===this._selectedId);
    this._list.items=this._visible.map(item=>({id:item.id,label:[item.timestamp,item.level.toUpperCase(),item.source,item.message.replace(/\s+/g," ")].filter(Boolean).join(" · ")}));
    this._list.selectedIndex=selected;
    this._list.hidden=!this._visible.length;this._empty.hidden=Boolean(this._visible.length);
    this._count.textContent=this._visible.length+" of "+this._items.length+" entries";
    if(selected<0)this._selectedId=null;
    this._syncDetail(this._visible[selected]);
  }
}
define("cu-log-viewer",CuLogViewer);
