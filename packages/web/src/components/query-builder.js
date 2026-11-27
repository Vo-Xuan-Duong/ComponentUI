import {BrowserElement,mount,define,notify} from "./_shared.js";
import {buildFilterCondition,DATA_FILTER_OPERATORS} from "./data-filter.js";
import {matchTableFilterCondition} from "./filter-utils.js";
import "./select.js";
import "./button.js";
import "./icon-button.js";
import "./empty-state.js";
export function normalizeQueryFields(fields){
  const seen=new Set();
  return (Array.isArray(fields)?fields:[]).flatMap(f=>{
    if(!f||typeof f.value!=="string"||!f.value||seen.has(f.value))return [];
    seen.add(f.value);return [{value:f.value,label:String(f.label??f.value)}];
  });
}
export function filterQueryRows(rows,query){
  const conditions=(Array.isArray(query?.conditions)?query.conditions:[]).filter(c=>c&&typeof c.field==="string"&&buildFilterCondition(c.field,c.operator,c.value));
  return (Array.isArray(rows)?rows:[]).filter(row=>!conditions.length||(query?.logic==="or"?conditions.some(c=>matchTableFilterCondition(Object.hasOwn(row??{},c.field)?row[c.field]:undefined,c)):conditions.every(c=>matchTableFilterCondition(Object.hasOwn(row??{},c.field)?row[c.field]:undefined,c))));
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}.toolbar cu-select{min-width:120px;}.rows{display:grid;gap:8px;}.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);}.row>cu-select{flex:1 1 110px;min-width:0;}.row cu-data-filter{flex:2 1 220px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}@media(forced-colors:active){.row{border-color:CanvasText;}}";
export class CuQueryBuilder extends BrowserElement{
  static get observedAttributes(){return ["disabled"];}
  constructor(){
    super();this._fields=[];this._rules=[];this._logic="and";
    const root=mount(this,css,'<section class="panel" aria-label="Query builder"><div class="toolbar"><cu-select aria-label="Match conditions" value="and"><option value="and">Match all (AND)</option><option value="or">Match any (OR)</option></cu-select><cu-button variant="outline">Add condition</cu-button></div><div class="rows" part="rows"></div><cu-empty-state size="sm" title="No conditions" description="Add a condition to filter records."></cu-empty-state><span class="status" role="status"></span></section>');
    this._mode=root.querySelector("cu-select");this._add=root.querySelector("cu-button");this._rows=root.querySelector(".rows");this._empty=root.querySelector("cu-empty-state");this._status=root.querySelector(".status");
    this._mode.addEventListener("cu-input",e=>e.stopPropagation());
    this._mode.addEventListener("cu-change",e=>{e.stopPropagation();if(this.disabled)return;this._logic=e.detail.value==="or"?"or":"and";this._emit("cu-change");});
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();this.addCondition();});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get fields(){return this._fields.map(f=>({...f}));}
  set fields(v){this._fields=normalizeQueryFields(v);this._rules=this._rules.filter(r=>this._fields.some(f=>f.value===r.field));this._render();}
  get value(){return {logic:this._logic,conditions:this._rules.map(r=>buildFilterCondition(r.field,r.operator,r.value)).filter(Boolean)};}
  set value(v){this._logic=v?.logic==="or"?"or":"and";this._rules=(Array.isArray(v?.conditions)?v.conditions:[]).filter(r=>r&&typeof r.field==="string"&&this._fields.some(f=>f.value===r.field)).map(r=>({field:r.field,operator:DATA_FILTER_OPERATORS.includes(r.operator)?r.operator:"contains",value:String(r.value??"")})).slice(0,50);this._render();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  addCondition(){if(this.disabled||!this._fields.length||this._rules.length>=50)return false;this._rules.push({field:this._fields[0].value,operator:"contains",value:""});this._render();this._emit("cu-change");return true;}
  removeCondition(index){if(this.disabled||!Number.isInteger(index)||index<0||index>=this._rules.length)return false;this._rules.splice(index,1);this._render();this._emit("cu-change");return true;}
  _emit(type){this._updateStatus();notify(this,type,{value:this.value});}
  _updateStatus(){if(this._status)this._status.textContent=this.value.conditions.length+" active of "+this._rules.length+" conditions";}
  _render(){
    if(!this._rows)return;
    const doc=this.ownerDocument;this._mode.value=this._logic;this._mode.disabled=this.disabled;this._add.disabled=this.disabled||!this._fields.length||this._rules.length>=50;this._empty.hidden=Boolean(this._rules.length);
    const nodes=this._rules.map((rule,i)=>{
      const row=doc.createElement("div");row.className="row";
      const select=doc.createElement("cu-select");select.setAttribute("aria-label","Field "+(i+1));
      for(const f of this._fields){const option=doc.createElement("option");option.value=f.value;option.textContent=f.label;select.append(option);}
      select.setAttribute("value",rule.field);select.disabled=this.disabled;
      const filter=doc.createElement("cu-data-filter");filter.field=rule.field;filter.operator=rule.operator;filter.value=rule.value;filter.disabled=this.disabled;filter.setAttribute("label","Condition "+(i+1));
      const remove=doc.createElement("cu-icon-button");remove.setAttribute("name","x");remove.setAttribute("aria-label","Remove condition "+(i+1));remove.disabled=this.disabled;
      select.addEventListener("cu-input",e=>e.stopPropagation());select.addEventListener("cu-change",e=>{e.stopPropagation();if(this.disabled)return;rule.field=e.detail.value;filter.field=rule.field;this._emit("cu-change");});
      for(const type of ["cu-input","cu-change"])filter.addEventListener(type,e=>{e.stopPropagation();if(this.disabled)return;rule.operator=e.detail.operator;rule.value=e.detail.value;this._emit(type);});
      remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeCondition(i);});row.append(select,filter,remove);return row;
    });this._rows.replaceChildren(...nodes);this._updateStatus();
  }
}
define("cu-query-builder",CuQueryBuilder);
