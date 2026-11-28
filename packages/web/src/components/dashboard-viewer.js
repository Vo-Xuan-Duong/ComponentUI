import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeDashboardWidgets} from "./dashboard-designer.js";
import "./dashboard-shell.js";
import "./chart-container.js";
import "./search-box.js";
import "./empty-state.js";
import "./button.js";
export function filterDashboardWidgets(widgets,query=""){
  const fold=v=>String(v??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
  const terms=fold(query).trim().split(/\s+/).filter(Boolean);
  return normalizeDashboardWidgets(widgets).filter(w=>terms.every(t=>fold([w.id,w.config.title,w.config.description].join(" ")).includes(t)));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}.toolbar strong{flex:1;min-width:100px;}.toolbar cu-search-box{flex:1 1 160px;}.widgets{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);margin-bottom:8px;}";
export class CuDashboardViewer extends BrowserElement{
  static get observedAttributes(){return ["label","query"];}
  constructor(){
    super();this._widgets=[];
    const root=mount(this,css,'<cu-dashboard-shell><div class="toolbar" slot="header"><strong></strong><cu-search-box aria-label="Find charts" placeholder="Find charts"></cu-search-box><cu-button variant="outline" size="sm">Refresh</cu-button></div><div class="status" role="status"></div><div class="widgets"></div><cu-empty-state title="No matching charts" size="sm"></cu-empty-state></cu-dashboard-shell>');
    this._title=root.querySelector("strong");this._search=root.querySelector("cu-search-box");this._grid=root.querySelector(".widgets");this._status=root.querySelector(".status");this._empty=root.querySelector("cu-empty-state");this._refresh=root.querySelector("cu-button");
    this._search.addEventListener("cu-input",e=>{e.stopPropagation();this.query=e.detail.value;notify(this,"cu-filter",{query:this.query,count:this.visibleWidgets.length});});
    for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,e=>e.stopPropagation());
    this._refresh.addEventListener("cu-press",e=>{e.stopPropagation();notify(this,"cu-action",{action:"refresh"});});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get widgets(){return normalizeDashboardWidgets(this._widgets);}set widgets(v){this._widgets=normalizeDashboardWidgets(v);this._render();}
  get query(){return this.getAttribute("query")??"";}set query(v){const q=String(v??"");if(q!==this.query)this.setAttribute("query",q);}
  get visibleWidgets(){return filterDashboardWidgets(this._widgets,this.query);}
  _render(){if(!this._grid)return;const doc=this.ownerDocument,items=this.visibleWidgets;this._title.textContent=this.getAttribute("label")||"Dashboard";if(this._search.value!==this.query)this._search.value=this.query;this._status.textContent=items.length+" of "+this._widgets.length+" charts";this._empty.hidden=Boolean(items.length);this._grid.replaceChildren(...items.map(w=>{const c=doc.createElement("cu-chart-container");c.setAttribute("title",w.config.title);c.setAttribute("description",w.config.description);c.setAttribute("chart-type",w.config.type);c.toggleAttribute("show-table",w.config.showTable);c.items=w.items;return c;}));}
}
define("cu-dashboard-viewer",CuDashboardViewer);
