import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./search-box.js";
import "./select.js";
import "./virtual-list.js";
import "./empty-state.js";
import "./button.js";
import "./split-view.js";
const fold=v=>String(v??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function normalizeSearchRecords(items){
  const seen=new Set(),out=[];
  for(const x of Array.isArray(items)?items:[]){if(!x||typeof x.id!=="string"||!x.id||seen.has(x.id)||out.length>=10000)continue;seen.add(x.id);out.push({id:x.id,title:String(x.title??x.id),description:String(x.description??""),category:String(x.category??""),keywords:(Array.isArray(x.keywords)?x.keywords:[]).filter(k=>typeof k==="string").slice(0,50)});}
  return out;
}
export function filterSearchRecords(items,query="",category=""){
  const terms=fold(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(x=>(!category||x.category===category)&&terms.every(t=>fold([x.title,x.description,x.category,...x.keywords].join(" ")).includes(t)));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}.tools{display:flex;gap:8px;align-items:end;flex-wrap:wrap;}.tools cu-search-box{flex:1 1 200px;}cu-split-view{height:var(--cu-search-workspace-height,360px);}.side{padding:8px;min-width:0;display:grid;gap:8px;align-content:start;}cu-virtual-list{height:300px;}.description{white-space:pre-wrap;overflow-wrap:anywhere;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuSearchWorkspace extends BrowserElement{
  static get observedAttributes(){return ["query","category"];}
  constructor(){
    super();this._items=[];this._visible=[];this._selected="";
    const root=mount(this,css,'<section class="panel" aria-label="Search workspace"><div class="tools"><cu-search-box aria-label="Search records" placeholder="Search records"></cu-search-box><cu-select label="Category"></cu-select></div><span class="status" role="status"></span><cu-split-view position="45" min="25" max="75" label="Results and detail"><div class="side" slot="sidebar"><cu-virtual-list label="Search results" item-height="36" empty-text="No matching records"></cu-virtual-list></div><div class="side" slot="content"><cu-empty-state title="Select a result" size="sm"></cu-empty-state><div class="detail" hidden><strong></strong><p class="description"></p><cu-button variant="accent">Open result</cu-button></div></div></cu-split-view></section>');
    this._search=root.querySelector("cu-search-box");this._category=root.querySelector("cu-select");this._list=root.querySelector("cu-virtual-list");this._detail=root.querySelector(".detail");this._title=this._detail.querySelector("strong");this._description=root.querySelector(".description");this._empty=root.querySelector("cu-empty-state");this._status=root.querySelector(".status");this._open=root.querySelector("cu-button");
    this._search.addEventListener("cu-input",e=>{e.stopPropagation();this.query=e.detail.value;this._emitFilter();});for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,e=>e.stopPropagation());
    this._category.addEventListener("cu-input",e=>e.stopPropagation());this._category.addEventListener("cu-change",e=>{e.stopPropagation();this.category=e.detail.value;this._emitFilter();});
    this._list.addEventListener("cu-change",e=>{e.stopPropagation();this.selectResult(e.detail.item?.id);});
    this._open.addEventListener("cu-press",e=>{e.stopPropagation();const item=this.selectedItem;if(item)notify(this,"cu-action",{action:"open",item});});
    const split=root.querySelector("cu-split-view");for(const type of ["cu-input","cu-change"])split.addEventListener(type,e=>{if(e.target===split)e.stopPropagation();});
  }
  connectedCallback(){this._options();this._render();}attributeChangedCallback(){this._render();}
  get items(){return normalizeSearchRecords(this._items);}set items(v){this._items=normalizeSearchRecords(v);this._options();this._render();}
  get query(){return this.getAttribute("query")??"";}set query(v){this.setAttribute("query",String(v??""));}
  get category(){const c=this.getAttribute("category")??"";return this._items.some(x=>x.category===c)?c:"";}set category(v){this.setAttribute("category",String(v??""));}
  get visibleItems(){return normalizeSearchRecords(this._visible);}
  get selectedItem(){const x=this._visible.find(x=>x.id===this._selected);return x?{...x,keywords:[...x.keywords]}:null;}
  selectResult(id){if(!this._visible.some(x=>x.id===id))return false;const changed=this._selected!==id;this._selected=id;this._list.selectedIndex=this._visible.findIndex(x=>x.id===id);this._syncDetail();if(changed)notify(this,"cu-select",{value:id,item:this.selectedItem});return true;}
  _emitFilter(){notify(this,"cu-filter",{query:this.query,category:this.category,count:this._visible.length});}
  _options(){if(!this._category)return;const doc=this.ownerDocument;this._category.replaceChildren(...["",...new Set(this._items.map(x=>x.category).filter(Boolean))].map(c=>{const o=doc.createElement("option");o.value=c;o.textContent=c||"All categories";return o;}));queueMicrotask(()=>{if(this.isConnected)this._category.value=this.category;});}
  _syncDetail(){const x=this.selectedItem;this._detail.hidden=!x;this._empty.hidden=Boolean(x);this._title.textContent=x?.title??"";this._description.textContent=x?.description??"";}
  _render(){if(!this._list)return;if(this._search.value!==this.query)this._search.value=this.query;if(this._category.value!==this.category)this._category.value=this.category;this._visible=filterSearchRecords(this._items,this.query,this.category);if(!this._visible.some(x=>x.id===this._selected))this._selected="";this._list.items=this._visible.map(x=>({id:x.id,label:x.title+(x.category?" · "+x.category:"")}));this._list.selectedIndex=this._visible.findIndex(x=>x.id===this._selected);this._status.textContent=this._visible.length+" of "+this._items.length+" results";this._syncDetail();}
}
define("cu-search-workspace",CuSearchWorkspace);
