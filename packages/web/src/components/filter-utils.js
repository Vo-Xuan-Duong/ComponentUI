/** Pure, browser-independent helpers shared by DataTable and FilterBar. */
// Canonical identity keeps numbers, booleans and text distinct; blank cells share one entry.
export function tableFilterValueKey(value) {
  if(value==null||value==="")return "blank";
  if(value instanceof Date)return "date:"+value.getTime();
  return typeof value+":"+String(value);
}
export function tableFilterValueLabel(value) {
  if(value==null||value==="")return "(Blanks)";
  if(value instanceof Date)return Number.isNaN(value.getTime())?"Invalid date":value.toISOString();
  return String(value);
}
export const TABLE_FILTER_OPERATORS=Object.freeze([
  "contains","not-contains","starts-with","ends-with","equals","not-equals",
  "greater-than","greater-or-equal","less-than","less-or-equal","between",
  "is-blank","is-not-blank"
]);
export const NUMERIC_FILTER_OPERATORS=new Set([
  "greater-than","greater-or-equal","less-than","less-or-equal","between"
]);
export function isTableFilterCondition(spec) {
  return Boolean(spec && typeof spec==="object" && !Array.isArray(spec) &&
    TABLE_FILTER_OPERATORS.includes(spec.operator));
}
export function matchTableFilterCondition(value,condition) {
  if(!isTableFilterCondition(condition))return false;
  const {operator}=condition;
  const blank=value==null||value==="";
  if(operator==="is-blank")return blank;
  if(operator==="is-not-blank")return !blank;
  if(blank)return false;
  if(NUMERIC_FILTER_OPERATORS.has(operator)){
    const parse=x=>x==null||String(x).trim()===""?NaN:Number(x);
    const actual=parse(value),expected=parse(condition.value),limit=parse(condition.value2);
    if(!Number.isFinite(actual)||!Number.isFinite(expected))return false;
    if(operator==="greater-than")return actual>expected;
    if(operator==="greater-or-equal")return actual>=expected;
    if(operator==="less-than")return actual<expected;
    if(operator==="less-or-equal")return actual<=expected;
    return Number.isFinite(limit)&&actual>=expected&&actual<=limit;
  }
  const actual=String(value).toLocaleLowerCase();
  const expected=String(condition.value??"").toLocaleLowerCase();
  if(operator==="contains")return actual.includes(expected);
  if(operator==="not-contains")return !actual.includes(expected);
  if(operator==="starts-with")return actual.startsWith(expected);
  if(operator==="ends-with")return actual.endsWith(expected);
  if(operator==="equals")return actual===expected;
  if(operator==="not-equals")return actual!==expected;
  return false;
}
export function normalizeTableFilterSpec(spec) {
  if(Array.isArray(spec))
    return [...new Map(spec.map(item=>[tableFilterValueKey(item),item])).values()];
  if(isTableFilterCondition(spec))
    return {operator:spec.operator,value:spec.value??"",value2:spec.value2??""};
  throw new TypeError("Column filter must be an array or valid condition object");
}
export function filterTableRows(rows,filters,omitKey=null) {
  const entries=filters instanceof Map?[...filters]:Object.entries(filters??{});
  const active=entries.filter(([key,spec])=>
    key!==omitKey&&(Array.isArray(spec)||isTableFilterCondition(spec)));
  if(!active.length)return [...rows];
  const prepared=active.map(([key,spec])=>[
    key,Array.isArray(spec)?new Set(spec.map(tableFilterValueKey)):spec
  ]);
  return rows.filter(row=>prepared.every(([key,spec])=>
    spec instanceof Set?spec.has(tableFilterValueKey(row?.[key])):
      matchTableFilterCondition(row?.[key],spec)));
}
export function uniqueTableFilterValues(rows,key) {
  const values=new Map();
  for(const row of rows) {
    const value=row?.[key],id=tableFilterValueKey(value);
    if(values.has(id)){values.get(id).count++;continue;}
    values.set(id,{key:id,value,label:tableFilterValueLabel(value),count:1});
  }
  return [...values.values()].sort((a,b)=>
    a.label.localeCompare(b.label,undefined,{numeric:true,sensitivity:"base"}));
}
// Keyword matching is kept with structured conditions to avoid importing
// DataTable, its menus and its other UI dependencies from FilterBar.
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
