import { BrowserElement, mount, notify, define } from "./_shared.js";
import { applyFilterBar } from "./filter-utils.js";
export { applyFilterBar } from "./filter-utils.js";
import "./data-filter.js";
import "./icon.js";
import "./search-box.js";
import "./button.js";


const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".bar{display:flex;flex-wrap:wrap;align-items:center;gap:9px;",
  "padding:10px;border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ".search{min-width:min(100%,170px);max-width:320px;flex:1 1 170px;}",
  ".conditions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:2 1 300px;min-width:0;}",
  "cu-button{flex:none;}",
  "@media(forced-colors:active){.bar{border-color:CanvasText;}}"
].join("");

export class CuFilterBar extends BrowserElement {
  static get observedAttributes(){return ["query","placeholder","label","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="bar" part="bar" role="search">' +
      '<cu-search-box class="search" exportparts="input:search" placeholder="Search records"></cu-search-box>' +
      '<div class="conditions" part="conditions"><slot></slot></div>' +
      '<cu-button exportparts="button:clear" variant="outline" aria-label="Clear all filters">' +
      '<cu-icon name="x" size="14" aria-hidden="true"></cu-icon>Clear</cu-button></div>');
    this._bar=root.querySelector(".bar");
    this._search=root.querySelector("cu-search-box");
    this._clear=root.querySelector("cu-button");
    this._slot=root.querySelector("slot");
    this._observer=null;
    this._search.addEventListener("cu-input",event=>{
      event.stopPropagation();
      this.query=this._search.value;
      this._emit("cu-filter-change");
    });
    for(const type of ["cu-change","cu-search"])
      this._search.addEventListener(type,event=>event.stopPropagation());
    this._onFilterChange=event=>{
      if(!this._filters().includes(event.target))return;
      event.stopPropagation();
      this._emit("cu-filter-change");
    };
    this._clear.addEventListener("cu-press",event=>{event.stopPropagation();this.clear();});
    this._slot.addEventListener("slotchange",()=>this._sync());
  }
  connectedCallback(){
    this.addEventListener("cu-change",this._onFilterChange);
    this.addEventListener("cu-input",this._onFilterChange);
    this._sync();
    this._lastFilterState=JSON.stringify({query:this.query,conditions:this.conditions});
    if(globalThis.MutationObserver){
      this._observer?.disconnect();
      this._observer=new MutationObserver(records=>{
        if(records.some(record=>record.type==="childList"||
          ["field","operator","value","disabled"].includes(record.attributeName)))
          this._refreshFromMutation();
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
  _refreshFromMutation(){
    this._sync();
    const state=JSON.stringify({query:this.query,conditions:this.conditions});
    if(state!==this._lastFilterState)this._emit("cu-filter-change");
  }
  clear(){
    if(!this.activeCount)return false;
    this.query="";
    for(const child of this._filters())child.clear(false);
    this._sync();
    this._emit("cu-filter-change");
    return true;
  }
  _emit(type){
    const detail={query:this.query,conditions:this.conditions,activeCount:this.activeCount};
    this._lastFilterState=JSON.stringify({query:detail.query,conditions:detail.conditions});
    notify(this,type,detail);
    this._sync();
  }
  _sync(){
    if(!this._search)return;
    this._bar?.setAttribute("aria-label",this.getAttribute("label")||"Record filters");
    if(this._search.value!==this.query)this._search.value=this.query;
    this._search.setAttribute("placeholder",this.getAttribute("placeholder")||"Search records");
    this._search.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Search records");
    this._clear.disabled=this.activeCount===0;
  }
}
define("cu-filter-bar",CuFilterBar);
