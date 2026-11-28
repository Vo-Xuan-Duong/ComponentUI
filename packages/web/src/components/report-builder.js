import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeInspectorRows,inspectorFields} from "./data-inspector.js";
import {normalizeChartConfig} from "./chart-editor.js";
import {PIVOT_AGGREGATES} from "./pivot-table.js";
import "./chart-container.js";
import "./query-builder.js";
import "./button.js";
import "./select.js";
export function reportChartItems(result){
  return (Array.isArray(result?.rows)?result.rows:[]).filter(r=>typeof r?.total==="number"&&Number.isFinite(r.total)&&Math.abs(r.total)<=1e100).slice(0,100).map(r=>({label:String(r.label??"Group"),value:r.total}));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:12px;}.toolbar{display:flex;align-items:end;gap:8px;flex-wrap:wrap;}.toolbar cu-select{min-width:140px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuReportBuilder extends BrowserElement{
  static get observedAttributes(){return ["chart-type","label"];}
  constructor(){
    super();this._rows=[];this._fields=[];this._query={logic:"and",conditions:[]};this._config={rowField:"",columnField:"",valueField:"",aggregate:"count"};
    const root=mount(this,css,'<section class="panel" aria-label="Report builder"><cu-query-builder></cu-query-builder><cu-pivot-table></cu-pivot-table><div class="toolbar"><cu-select label="Chart type"><option value="bar">Bar</option><option value="line">Line</option></cu-select><cu-button variant="outline">Export report</cu-button></div><cu-chart-container></cu-chart-container><div class="status" role="status"></div></section>');
    this._builder=root.querySelector("cu-query-builder");this._pivot=root.querySelector("cu-pivot-table");this._chart=root.querySelector("cu-chart-container");this._type=root.querySelector(".toolbar cu-select");this._export=root.querySelector("cu-button");this._status=root.querySelector(".status");
    for(const type of ["cu-input","cu-change"])this._builder.addEventListener(type,e=>{if(e.target!==this._builder)return;e.stopPropagation();this._query=this._builder.value;this._pivot.query=this._query;this._renderChart();notify(this,type,{section:"query",query:this.query,config:this.config});});
    this._pivot.addEventListener("cu-change",e=>{if(e.target!==this._pivot)return;e.stopPropagation();if(!e.detail.result)return;this._config=this._pivot.config;this._renderChart();notify(this,"cu-change",{section:"pivot",config:this.config,query:this.query});});
    this._type.addEventListener("cu-input",e=>e.stopPropagation());this._type.addEventListener("cu-change",e=>{e.stopPropagation();this.chartType=e.detail.value;notify(this,"cu-change",{section:"chart",chartType:this.chartType});});
    this._export.addEventListener("cu-press",e=>{e.stopPropagation();if(!this.result.error&&this.result.count)notify(this,"cu-action",{action:"export",report:this.report});});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._renderChart();}
  get rows(){return normalizeInspectorRows(this._rows);}set rows(v){this._rows=normalizeInspectorRows(v);this._fields=inspectorFields(this._rows);this._sync();}
  get query(){return this._builder.value;}
  set query(v){this._query={logic:v?.logic==="or"?"or":"and",conditions:Array.isArray(v?.conditions)?v.conditions.filter(x=>x&&typeof x.field==="string").map(x=>({...x})):[]};this._sync();}
  get config(){return this._pivot.config;}set config(v){this._config={rowField:String(v?.rowField??""),columnField:String(v?.columnField??""),valueField:String(v?.valueField??""),aggregate:PIVOT_AGGREGATES.includes(v?.aggregate)?v.aggregate:"count"};this._syncPivotConfig();this._renderChart();}
  get chartType(){return normalizeChartConfig({type:this.getAttribute("chart-type")}).type;}set chartType(v){this.setAttribute("chart-type",v==="line"?"line":"bar");}
  get result(){return this._pivot.result;}get report(){return {config:this.config,query:this._builder.value,chartType:this.chartType,result:this.result};}
  _sync(){if(!this._pivot)return;this._builder.fields=this._fields;this._builder.value=this._query;this._pivot.fields=this._fields;this._syncPivotConfig();this._pivot.query=this._builder.value;this._pivot.rows=this._rows;this._renderChart();}
  _syncPivotConfig(){for(const key of ["rowField","columnField","valueField","aggregate"])if(this._pivot[key]!==this._config[key])this._pivot[key]=this._config[key];}
  _renderChart(){if(!this._chart)return;const result=this.result;if(this._type.getAttribute("value")!==this.chartType)this._type.setAttribute("value",this.chartType);if(this._type.value!==this.chartType)this._type.value=this.chartType;for(const [k,v] of Object.entries({title:this.getAttribute("label")||"Report totals","chart-type":this.chartType,description:"Totals by row group"}))if(this._chart.getAttribute(k)!==v)this._chart.setAttribute(k,v);this._chart.items=reportChartItems(result);this._export.disabled=Boolean(result.error)||!result.count;this._status.textContent=result.error||result.count+" records · Grand total: "+(result.total??"—");}
}
define("cu-report-builder",CuReportBuilder);
