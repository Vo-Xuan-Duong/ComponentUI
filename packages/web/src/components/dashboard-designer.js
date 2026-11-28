import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeChartConfig} from "./chart-editor.js";
import {normalizeChartItems} from "./chart-container.js";
import "./dashboard-shell.js";
import "./select.js";
import "./button.js";
import "./empty-state.js";
export function normalizeDashboardWidgets(items){
  const seen=new Set();return (Array.isArray(items)?items:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id||seen.has(x.id))return [];
    seen.add(x.id);return [{id:x.id,config:normalizeChartConfig(x.config),items:normalizeChartItems(x.items)}];
  }).slice(0,24);
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:end;}.toolbar cu-select{flex:1 1 140px;}.layout{display:grid;gap:12px;}.widgets{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px;}.widget{display:grid;gap:4px;min-width:0;}.widget[data-selected=true]{outline:2px solid var(--cu-accent,#0067c0);outline-offset:2px;border-radius:var(--cu-radius-lg,8px);}.editor[hidden],cu-empty-state[hidden]{display:none!important;}";
export class CuDashboardDesigner extends BrowserElement{
  static get observedAttributes(){return ["readonly","selected"];}
  constructor(){
    super();this._widgets=[];this._next=1;
    const root=mount(this,css,'<cu-dashboard-shell><div class="toolbar" slot="header"><cu-select label="Chart widget"></cu-select><cu-button class="add" variant="accent">Add chart</cu-button><cu-button class="remove" variant="outline">Remove chart</cu-button></div><div class="layout"><div class="widgets" aria-label="Dashboard preview"></div><cu-empty-state title="No chart widgets" description="Add a chart to start designing." size="sm"></cu-empty-state><cu-chart-editor class="editor" hidden></cu-chart-editor></div></cu-dashboard-shell>');
    this._select=root.querySelector("cu-select");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");this._preview=root.querySelector(".widgets");this._editor=root.querySelector("cu-chart-editor");this._empty=root.querySelector("cu-empty-state");
    this._select.addEventListener("cu-input",e=>e.stopPropagation());this._select.addEventListener("cu-change",e=>{e.stopPropagation();this.selected=e.detail.value;notify(this,"cu-select",{value:this.selected});});
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();this.addWidget();});this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeWidget(this.selected);});
    this._editor.addEventListener("cu-change",e=>{e.stopPropagation();const widget=this._widgets.find(x=>x.id===this.selected);if(!widget||this.readonly)return;widget.config=normalizeChartConfig(e.detail.config);widget.items=normalizeChartItems(e.detail.items);this._options();this._renderPreview();this._emit("update",widget.id);});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get widgets(){return normalizeDashboardWidgets(this._widgets);}set widgets(v){this._widgets=normalizeDashboardWidgets(v);this._render();}
  get selected(){const id=this.getAttribute("selected");return this._widgets.find(x=>x.id===id)?.id??this._widgets[0]?.id??"";}set selected(v){this.setAttribute("selected",String(v??""));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addWidget(){if(this.readonly||this._widgets.length>=24)return false;let id;do{id="chart-"+this._next++;}while(this._widgets.some(x=>x.id===id));this._widgets.push({id,config:normalizeChartConfig({title:"New chart"}),items:[{label:"A",value:10},{label:"B",value:20}]});this.selected=id;this._emit("add",id);return true;}
  removeWidget(id){if(this.readonly||!this._widgets.some(x=>x.id===id))return false;this._widgets=this._widgets.filter(x=>x.id!==id);this._render();this._emit("remove",id);return true;}
  _emit(action,id){notify(this,"cu-change",{action,id,widgets:this.widgets});}
  _options(){const doc=this.ownerDocument,signature=JSON.stringify(this._widgets.map(x=>[x.id,x.config.title]));if(this._optionSignature!==signature){this._optionSignature=signature;this._select.replaceChildren(...this._widgets.map(x=>{const o=doc.createElement("option");o.value=x.id;o.textContent=x.config.title||x.id;o.selected=x.id===this.selected;return o;}));}if(this._select.getAttribute("value")!==this.selected)this._select.setAttribute("value",this.selected);queueMicrotask(()=>{if(this.isConnected)this._select.value=this.selected;});this._select.disabled=!this._widgets.length;}
  _renderPreview(){const doc=this.ownerDocument,existing=new Map([...this._preview.children].map(el=>[el.dataset.widgetId,el]));const desired=this._widgets.map(x=>{const wrap=existing.get(x.id)||doc.createElement("div"),chart=wrap.firstElementChild||doc.createElement("cu-chart-container");wrap.className="widget";wrap.dataset.widgetId=x.id;wrap.dataset.selected=String(x.id===this.selected);for(const [k,v] of Object.entries({title:x.config.title,description:x.config.description,"chart-type":x.config.type}))if(chart.getAttribute(k)!==v)chart.setAttribute(k,v);chart.toggleAttribute("show-table",x.config.showTable);chart.items=x.items;if(!chart.parentNode)wrap.append(chart);return wrap;});const keep=new Set(desired);for(const el of [...this._preview.children])if(!keep.has(el))el.remove();desired.forEach((el,i)=>{if(this._preview.children[i]!==el)this._preview.insertBefore(el,this._preview.children[i]||null);});}
  _render(){if(!this._editor)return;this._options();this._renderPreview();const x=this._widgets.find(w=>w.id===this.selected);this._empty.hidden=Boolean(this._widgets.length);this._editor.hidden=!x;this._editor.readonly=this.readonly;if(x){this._editor.config=x.config;this._editor.items=x.items;}this._add.disabled=this.readonly||this._widgets.length>=24;this._remove.disabled=this.readonly||!x;}
}
define("cu-dashboard-designer",CuDashboardDesigner);
