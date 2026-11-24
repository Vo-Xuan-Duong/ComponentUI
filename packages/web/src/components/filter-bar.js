import { BrowserElement, mount, notify, define } from "./_shared.js";
import { filterTableRows } from "./data-table.js";
import "./data-filter.js";
import "./icon.js";

export function applyFilterBar(rows,query="",conditions={},searchKeys=null){
  const filtered=filterTableRows(Array.isArray(rows)?rows:[],conditions);
  const needle=String(query??"").trim().toLocaleLowerCase();
  if(!needle)return filtered;
  const keys=Array.isArray(searchKeys)?searchKeys:null;
  return filtered.filter(row=>{
    const values=keys?keys.map(key=>row?.[key]):Object.values(row??{});
    return values.some(value=>value!=null&&String(value).toLocaleLowerCase().includes(needle));
  });
}

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".bar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;",
  "padding:10px;border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ".search{position:relative;display:flex;align-items:center;gap:7px;",
  "min-width:170px;max-width:320px;flex:1 1 170px;}",
  ".search cu-icon{flex:none;color:var(--cu-text-muted,#616161);}",
  "input{box-sizing:border-box;min-width:0;width:100%;height:var(--cu-control-height,40px);",
  "padding:0 12px;background:var(--cu-surface,#fff);color:inherit;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);font:inherit;}",
  "input:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:1px;}",
  ".conditions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:2 1 300px;min-width:0;}",
  "button{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 10px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);background:transparent;color:inherit;",
  "font:600 12px var(--cu-font-body,system-ui);cursor:pointer;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 8%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "button:disabled{opacity:.4;cursor:not-allowed;}",
  "@media(forced-colors:active){.bar,input,button{border-color:CanvasText;}",
  "input:focus-visible,button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuFilterBar extends BrowserElement {
  static get observedAttributes(){return ["query","placeholder","label","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="bar" part="bar" role="search">' +
      '<div class="search"><cu-icon name="search" size="17" aria-hidden="true"></cu-icon>' +
      '<input part="search" type="search" autocomplete="off" placeholder="Search records"></div>' +
      '<div class="conditions" part="conditions"><slot></slot></div>' +
      '<button part="clear" type="button" aria-label="Clear all filters">' +
      '<cu-icon name="x" size="14" aria-hidden="true"></cu-icon>Clear</button></div>');
    this._bar=root.querySelector(".bar");
    this._search=root.querySelector("input");
    this._clear=root.querySelector("button");
    this._slot=root.querySelector("slot");
    this._observer=null;
    this._search.addEventListener("input",()=>{
      this.query=this._search.value;
      this._emit("cu-filter-change");
    });
    this._onFilterChange=event=>{
      if(!this._filters().includes(event.target))return;
      event.stopPropagation();
      this._emit("cu-filter-change");
    };
    this._clear.addEventListener("click",()=>this.clear());
    this._slot.addEventListener("slotchange",()=>this._sync());
  }
  connectedCallback(){
    this.addEventListener("cu-change",this._onFilterChange);
    this.addEventListener("cu-input",this._onFilterChange);
    this._sync();
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(record=>record.type==="childList"||
          ["field","operator","value","disabled"].includes(record.attributeName)))
          this.refresh();
      });
      this._observer.observe(this,{
        childList:true,subtree:true,attributes:true,
        attributeFilter:["field","operator","value","disabled"]
      });
    }
  }
  disconnectedCallback(){
    this.removeEventListener("cu-change",this._onFilterChange);
    this.removeEventListener("cu-input",this._onFilterChange);
    this._observer?.disconnect();this._observer=null;
  }
  attributeChangedCallback(){this._sync();}
  get query(){return this.getAttribute("query")||"";}
  set query(v){this.setAttribute("query",String(v??""));}
  get conditions(){
    const result=Object.create(null);
    for(const filter of this._filters()){
      const condition=filter.condition;
      if(condition)result[condition.field]={operator:condition.operator,value:condition.value};
    }
    return result;
  }
  get activeCount(){return Number(Boolean(this.query.trim()))+Object.keys(this.conditions).length;}
  _filters(){
    return [...this.children].filter(el=>el.localName==="cu-data-filter");
  }
  refresh(){this._sync();}
  clear(){
    if(!this.activeCount)return false;
    this.query="";
    for(const child of this._filters())child.clear(false);
    this._sync();
    this._emit("cu-filter-change");
    return true;
  }
  _emit(type){
    notify(this,type,{query:this.query,conditions:this.conditions,activeCount:this.activeCount});
    this._sync();
  }
  _sync(){
    if(!this._search)return;
    this._bar?.setAttribute("aria-label",this.getAttribute("label")||"Record filters");
    if(this._search.value!==this.query)this._search.value=this.query;
    this._search.placeholder=this.getAttribute("placeholder")||"Search records";
    this._search.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Search records");
    this._clear.disabled=this.activeCount===0;
  }
}
define("cu-filter-bar",CuFilterBar);
