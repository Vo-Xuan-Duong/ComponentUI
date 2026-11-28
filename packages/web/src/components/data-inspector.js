import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeQueryFields,filterQueryRows} from "./query-builder.js";
import "./data-table.js";
import "./json-viewer.js";
import "./empty-state.js";
export function normalizeInspectorRows(rows){
  return (Array.isArray(rows)?rows:[]).flatMap(row=>{
    if(!row||typeof row!=="object"||Array.isArray(row))return [];
    try{const copy=JSON.parse(JSON.stringify(row));return copy&&typeof copy==="object"&&!Array.isArray(copy)?[copy]:[];}catch{return [];}
  });
}
export function inspectorFields(rows){
  const keys=new Set();for(const row of rows)for(const key of Object.keys(row)){if(keys.size>=50)break;if(key)keys.add(key);}
  return normalizeQueryFields([...keys].map(value=>({value,label:value})));
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:12px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuDataInspector extends BrowserElement{
  constructor(){
    super();this._rows=[];this._fields=[];this._query={logic:"and",conditions:[]};this._requestedQuery=this._query;this._visible=new Map();
    const root=mount(this,css,'<section class="panel" aria-label="Data inspector"><cu-query-builder></cu-query-builder><span class="status" role="status"></span><cu-data-table caption="Records" page-size="10"></cu-data-table><cu-empty-state size="sm" title="Select Inspect record in the row context menu to view JSON"></cu-empty-state><cu-json-viewer hidden></cu-json-viewer></section>');
    this._builder=root.querySelector("cu-query-builder");this._table=root.querySelector("cu-data-table");this._json=root.querySelector("cu-json-viewer");this._empty=root.querySelector("cu-empty-state");this._status=root.querySelector(".status");
    this._table.rowActions=[{value:"inspect",label:"Inspect record"}];
    for(const type of ["cu-input","cu-change"])this._builder.addEventListener(type,e=>{e.stopPropagation();this._query=this._builder.value;this._requestedQuery=this._query;this._renderRows();notify(this,type,{query:this.query,count:this._visible.size});});
    this._table.addEventListener("cu-row-action",e=>{e.stopPropagation();if(e.detail.action==="inspect")this.inspectRecord(e.detail.id);});
    this._json.addEventListener("cu-select",e=>e.stopPropagation());
    this._table.addEventListener("cu-filter-change",()=>{if(this._selected&&!this._table.filteredRows.some(r=>r.id===this._selected)){this._selected="";this._json.hidden=true;this._empty.hidden=false;}});
  }
  connectedCallback(){this._sync();}
  get rows(){return normalizeInspectorRows(this._rows);}set rows(v){this._rows=normalizeInspectorRows(v);this._fields=inspectorFields(this._rows);this._sync();}
  get query(){return {logic:this._query.logic,conditions:this._query.conditions.map(x=>({...x}))};}
  set query(v){this._requestedQuery={logic:v?.logic==="or"?"or":"and",conditions:Array.isArray(v?.conditions)?v.conditions.filter(x=>x&&typeof x.field==="string").map(x=>({...x})):[]};this._sync();}
  get visibleRows(){return normalizeInspectorRows([...this._visible.values()]);}
  inspectRecord(id){const row=this._visible.get(String(id));if(!row||!this._table.filteredRows.some(r=>r.id===String(id)))return false;this._selected=String(id);this._json.value=JSON.stringify(row,null,2);this._json.hidden=false;this._empty.hidden=true;notify(this,"cu-select",{id:this._selected,row:normalizeInspectorRows([row])[0]});return true;}
  _sync(){if(!this._builder)return;this._builder.fields=this._fields;this._builder.value=this._requestedQuery;this._query=this._builder.value;this._table.columns=this._fields.map((f,i)=>({key:"field"+i,label:f.label}));this._selected="";this._renderRows();}
  _renderRows(){
    const matched=new Set(filterQueryRows(this._rows,this._query));this._visible=new Map();
    const display=[];this._rows.forEach((row,i)=>{if(!matched.has(row))return;const id=String(i+1);this._visible.set(id,row);display.push({id,...Object.fromEntries(this._fields.map((f,j)=>{const v=Object.hasOwn(row,f.value)?row[f.value]:null;return ["field"+j,v&&typeof v==="object"?JSON.stringify(v):v];}))});});
    this._table.rows=display;this._status.textContent=display.length+" of "+this._rows.length+" records";
    this._selected="";this._json.hidden=true;this._empty.hidden=false;
  }
}
define("cu-data-inspector",CuDataInspector);
