import {BrowserElement,mount,define,notify} from "./_shared.js";
import {tableFilterValueKey,tableFilterValueLabel} from "./filter-utils.js";
import {normalizeQueryFields,filterQueryRows} from "./query-builder.js";
import "./data-table.js";
import "./select.js";
import "./empty-state.js";
export const PIVOT_AGGREGATES=Object.freeze(["count","sum","average","min","max"]);
const own=(row,key)=>key&&Object.hasOwn(row??{},key)?row[key]:undefined;
const bucket=()=>({count:0,numericCount:0,sum:0,min:Infinity,max:-Infinity});
function add(b,value){
  b.count++;
  if(value===null||value===undefined||String(value).trim()===""||!["string","number"].includes(typeof value))return;
  const n=Number(value);if(!Number.isFinite(n))return;
  b.numericCount++;b.sum+=n;b.min=Math.min(b.min,n);b.max=Math.max(b.max,n);
}
function finish(b,aggregate){
  if(aggregate==="count")return b.count;
  if(!b.numericCount)return null;
  const value=aggregate==="sum"?b.sum:aggregate==="average"?b.sum/b.numericCount:aggregate==="min"?b.min:b.max;
  return Number.isFinite(value)?value:null;
}
export function buildPivotTable(rows,{rowField="",columnField="",valueField="",aggregate="count"}={}){
  if(!PIVOT_AGGREGATES.includes(aggregate))aggregate="count";
  const groups=new Map(),columns=new Map(),total=bucket();
  const source=Array.isArray(rows)?rows:[];
  for(const row of source){
    const rv=own(row,rowField),cv=own(row,columnField),rk=rowField?tableFilterValueKey(rv):"all",ck=columnField?tableFilterValueKey(cv):"all";
    if(!groups.has(rk)){
      if(groups.size>=100)return {rows:[],columns:[],total:null,count:source.length,error:"Too many row groups (maximum 100)."};
      groups.set(rk,{id:"group-"+groups.size,label:rowField?tableFilterValueLabel(rv):"All records",cells:new Map(),total:bucket()});
    }
    if(!columns.has(ck)){
      if(columns.size>=30)return {rows:[],columns:[],total:null,count:source.length,error:"Too many column groups (maximum 30)."};
      columns.set(ck,{key:"group"+columns.size,label:columnField?tableFilterValueLabel(cv):"Value"});
    }
    const group=groups.get(rk);
    if(!group.cells.has(ck))group.cells.set(ck,bucket());
    const value=own(row,valueField);
    add(group.cells.get(ck),value);add(group.total,value);add(total,value);
  }
  return {columns:[{key:"label",label:rowField||"Group"},...[...columns.values()].map(c=>({...c,filterable:false})),{key:"total",label:"Total",filterable:false}],
    rows:[...groups.values()].map(g=>({id:g.id,label:g.label,...Object.fromEntries([...columns].map(([key,col])=>[col.key,finish(g.cells.get(key)??bucket(),aggregate)])),total:finish(g.total,aggregate)})),
    total:finish(total,aggregate),count:source.length,error:""};
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}.controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--cu-space-2,8px);}.summary{color:var(--cu-text-muted,#616161);font-size:12px;}";
export class CuPivotTable extends BrowserElement{
  static get observedAttributes(){return ["row-field","column-field","value-field","aggregate"];}
  constructor(){
    super();this._rows=[];this._fields=[];this._query={logic:"and",conditions:[]};this._result=buildPivotTable([]);
    const root=mount(this,css,'<section class="panel" aria-label="Pivot table"><div class="controls"><cu-select data-key="row-field" label="Rows"></cu-select><cu-select data-key="column-field" label="Columns"></cu-select><cu-select data-key="value-field" label="Values"></cu-select><cu-select data-key="aggregate" label="Aggregate"><option value="count">Count</option><option value="sum">Sum</option><option value="average">Average</option><option value="min">Minimum</option><option value="max">Maximum</option></cu-select></div><div class="summary" role="status"></div><cu-data-table page-size="10" aria-label="Pivot results"></cu-data-table><cu-empty-state size="sm" title="No records to summarize" hidden></cu-empty-state></section>');
    this._controls=[...root.querySelectorAll("cu-select")];this._table=root.querySelector("cu-data-table");this._summary=root.querySelector(".summary");this._empty=root.querySelector("cu-empty-state");
    for(const control of this._controls){
      control.addEventListener("cu-input",e=>e.stopPropagation());
      control.addEventListener("cu-change",e=>{e.stopPropagation();this.setAttribute(control.dataset.key,e.detail.value);notify(this,"cu-change",{value:this.config,result:this.result});});
    }
  }
  connectedCallback(){this._syncOptions();this._render();}
  attributeChangedCallback(){this._render();}
  get rows(){return this._rows.map(row=>({...row}));}set rows(v){this._rows=Array.isArray(v)?v.filter(row=>row&&typeof row==="object").map(row=>({...row})):[];this._render();}
  get fields(){return this._fields.map(f=>({...f}));}set fields(v){this._fields=normalizeQueryFields(v);this._syncOptions();this._render();}
  get query(){return {logic:this._query.logic,conditions:this._query.conditions.map(c=>({...c}))};}set query(v){this._query={logic:v?.logic==="or"?"or":"and",conditions:Array.isArray(v?.conditions)?v.conditions.filter(c=>c&&typeof c==="object").map(c=>({...c})):[]};this._render();}
  get rowField(){return this.getAttribute("row-field")||"";}set rowField(v){this.setAttribute("row-field",String(v??""));}
  get columnField(){return this.getAttribute("column-field")||"";}set columnField(v){this.setAttribute("column-field",String(v??""));}
  get valueField(){return this.getAttribute("value-field")||"";}set valueField(v){this.setAttribute("value-field",String(v??""));}
  get aggregate(){const a=this.getAttribute("aggregate");return PIVOT_AGGREGATES.includes(a)?a:"count";}set aggregate(v){this.setAttribute("aggregate",PIVOT_AGGREGATES.includes(v)?v:"count");}
  get config(){const allowed=k=>this._fields.some(f=>f.value===k)?k:"";return {rowField:allowed(this.rowField),columnField:allowed(this.columnField),valueField:allowed(this.valueField),aggregate:this.aggregate};}
  get result(){return {...this._result,columns:this._result.columns.map(c=>({...c})),rows:this._result.rows.map(r=>({...r}))};}
  _syncOptions(){
    if(!this._controls)return;
    for(const control of this._controls.filter(c=>c.dataset.key!=="aggregate")){
      const options=[{value:"",label:"None"},...this._fields];
      const value=this.config[{"row-field":"rowField","column-field":"columnField","value-field":"valueField"}[control.dataset.key]];
      control.replaceChildren(...options.map(f=>{const el=this.ownerDocument.createElement("option");el.value=f.value;el.textContent=f.label;el.selected=f.value===value;return el;}));
      control.setAttribute("value",value);
      queueMicrotask(()=>{if(this.isConnected)control.value=this.config[{"row-field":"rowField","column-field":"columnField","value-field":"valueField"}[control.dataset.key]];});
    }
  }
  _render(){
    if(!this._table)return;
    const config=this.config,values={"row-field":config.rowField,"column-field":config.columnField,"value-field":config.valueField,aggregate:config.aggregate};
    for(const control of this._controls){const value=values[control.dataset.key];if(control.getAttribute("value")!==value)control.setAttribute("value",value);if(control.value!==value)control.value=value;control.disabled=control.dataset.key==="value-field"&&config.aggregate==="count";}
    const result=buildPivotTable(filterQueryRows(this._rows,this._query),config);this._result=result;
    this._table.error=result.error;this._table.columns=result.columns;this._table.rows=result.rows;
    this._table.hidden=!result.count&&!result.error;this._empty.hidden=Boolean(result.count||result.error);
    this._summary.textContent=result.error||result.count+" records · Grand total: "+(result.total??"—");
  }
}
define("cu-pivot-table",CuPivotTable);
