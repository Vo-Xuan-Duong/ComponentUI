
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";
import "./select.js";
import { clampMenuPosition } from "./context-menu.js";

export function sortTableRows(rows, key, direction = "asc") {
  if (!key || !["asc","desc"].includes(direction)) return [...rows];
  const factor = direction === "desc" ? -1 : 1;
  return rows.map((row,index)=>({row,index})).sort((a,b)=>{
    const av=a.row?.[key], bv=b.row?.[key];
    if (av == null && bv == null) return a.index-b.index;
    if (av == null) return 1;
    if (bv == null) return -1;
    const numeric=typeof av==="number" && typeof bv==="number";
    const compare=numeric ? av-bv :
      String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:"base"});
    return factor*compare || a.index-b.index;
  }).map(entry=>entry.row);
}
export function paginateRows(rows, page = 1, size = 5) {
  const length=rows.length;
  const safeSize=Math.max(1,Math.min(100,Math.floor(Number(size)||5)));
  const totalPages=Math.max(1,Math.ceil(length/safeSize));
  const current=Math.max(1,Math.min(totalPages,Math.floor(Number(page)||1)));
  return {page:current,totalPages,total:length,
    rows:rows.slice((current-1)*safeSize,current*safeSize)};
}

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
const NUMERIC_FILTER_OPERATORS=new Set([
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

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".frame{min-width:0;overflow:hidden;border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ".scroll{max-width:100%;overflow-x:auto;}",
  "table{border-collapse:collapse;width:100%;min-width:480px;text-align:left;}",
  "caption{text-align:left;padding:12px 14px;font-weight:650;}",
  "caption:empty{display:none;}",
  "th,td{padding:11px 14px;border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "th{font-size:12px;font-weight:650;color:var(--cu-text-muted,#616161);",
  "background:var(--cu-surface-alt,#fafafa);white-space:nowrap;}",
  "tbody tr:last-child td{border-bottom:0;}",
  "tbody tr:hover{background:color-mix(in srgb,var(--cu-accent,#0067c0) 7%,var(--cu-surface,#fff));}",
  "tbody tr[data-selected=true]{background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,var(--cu-surface,#fff));}",
  "tbody tr[data-context=true]{background:color-mix(in srgb,var(--cu-accent,#0067c0) 17%,var(--cu-surface,#fff));}",
  "tbody tr[data-actionable=true]{cursor:context-menu;}",
  "tbody tr:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  ".row-menu,.header-menu{position:fixed;width:0;height:0;}",
  "thead th[data-filtered=true]{color:var(--cu-accent,#0067c0);}",
  ".filter-trigger{margin-left:5px;min-width:27px;min-height:27px;padding:5px;vertical-align:middle;}",
  ".filter-trigger cu-icon{width:14px;height:14px;}",
  "thead th[data-filtered=true] .filter-trigger{color:var(--cu-accent,#0067c0);",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,transparent);}",
  ".filter-panel{position:fixed;z-index:10001;box-sizing:border-box;width:290px;",
  "max-width:calc(100vw - 16px);max-height:min(520px,calc(100vh - 16px));",
  "padding:12px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-elevated,#fff);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0/.16));",
  "display:flex;flex-direction:column;gap:9px;}",
  ".filter-panel[hidden]{display:none!important;}",
  ".filter-title{font-size:13px;font-weight:650;}",
  ".filter-modes{display:flex;gap:4px;padding:3px;border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-surface-alt,#fafafa);}",
  ".filter-modes button{flex:1;justify-content:center;min-height:32px;}",
  ".filter-modes button[aria-selected=true]{font-weight:650;background:var(--cu-surface-elevated,#fff);",
  "box-shadow:0 1px 3px rgb(0 0 0/.12);}",
  ".filter-values-view[hidden],.filter-conditions-view[hidden]{display:none!important;}",
  ".filter-values-view{display:flex;flex-direction:column;gap:7px;min-height:0;}",
  ".filter-conditions-view{display:flex;flex-direction:column;gap:9px;}",
  ".filter-conditions-view cu-select{width:100%;}",
  ".filter-conditions-view input{box-sizing:border-box;min-height:34px;width:100%;",
  "padding:7px 9px;background:var(--cu-surface,#fff);color:inherit;font:inherit;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);}",
  ".filter-conditions-view input[hidden]{display:none!important;}",
  ".filter-condition-error{color:var(--cu-danger,#c42b1c);font-size:12px;min-height:0;}",
  ".filter-condition-error:empty{display:none;}",
  ".filter-search{box-sizing:border-box;width:100%;min-height:34px;padding:7px 9px;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);",
  "color:var(--cu-text,#242424);font:inherit;}",
  ".filter-select-all{display:flex;align-items:center;gap:9px;padding:6px 8px;",
  "border-bottom:1px solid var(--cu-border,#e5e5e5);cursor:pointer;}",
  ".filter-options{max-height:min(230px,35vh);overflow:auto;min-height:40px;}",
  ".filter-options label{display:flex;align-items:center;gap:9px;padding:7px 8px;",
  "border-radius:var(--cu-radius-md,6px);cursor:pointer;}",
  ".filter-options label:hover,.filter-options label:focus-within{",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,var(--cu-surface,#fff));}",
  ".filter-options .filter-value{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  ".filter-options .filter-count,.filter-summary{color:var(--cu-text-muted,#616161);font-size:12px;}",
  ".filter-empty{padding:12px;color:var(--cu-text-muted,#616161);}",
  ".filter-footer{display:flex;gap:7px;justify-content:flex-end;align-items:center;",
  "border-top:1px solid var(--cu-border,#e5e5e5);padding-top:9px;}",
  ".filter-footer button{border:1px solid var(--cu-border,#e5e5e5);}",
  ".filter-footer .filter-apply{color:var(--cu-on-accent,#fff);",
  "background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);}",
  ".filter-footer .filter-apply:hover{background:var(--cu-accent-hover,#005ba1);}",
  ".filter-footer .filter-clear{margin-right:auto;}",
  "@media(forced-colors:active){.filter-panel{border-color:CanvasText;}}",
  "thead th[data-column-key]{cursor:context-menu;}",
  "thead th[data-context=true]{background:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,var(--cu-surface-alt,#fafafa));}",
  "thead th:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  "button{display:inline-flex;align-items:center;gap:7px;min-height:30px;padding:4px 7px;",
  "border:0;background:transparent;border-radius:var(--cu-radius-md,6px);",
  "color:inherit;font:inherit;cursor:pointer;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,transparent);}",
  "button:disabled{cursor:not-allowed;opacity:.4;}",
  "button:focus-visible,input:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "input[type=checkbox]{accent-color:var(--cu-accent,#0067c0);width:16px;height:16px;}",
  ".sort{font-size:11px;color:var(--cu-text-muted,#616161);}",
  ".empty{text-align:center;padding:24px 14px;color:var(--cu-text-muted,#616161);}",
  ".footer{display:flex;gap:10px;justify-content:space-between;align-items:center;",
  "flex-wrap:wrap;padding:9px 12px;border-top:1px solid var(--cu-border,#e5e5e5);",
  "color:var(--cu-text-muted,#616161);font-size:12px;}",
  ".pages{display:flex;align-items:center;gap:5px;}",
  ".pages button{border:1px solid var(--cu-border,#e5e5e5);}",
  ".pages .prev cu-icon{transform:rotate(180deg);}",
  ".sort cu-icon{width:13px;height:13px;}",
  "@media(forced-colors:active){.frame{border-color:CanvasText;}tr[data-selected=true]{outline:1px solid Highlight;}}"
].join("");

export class CuDataTable extends BrowserElement {
  static get observedAttributes(){
    return ["caption","page-size","selectable","row-action","loading","empty-text"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="frame" part="frame"><div class="scroll" part="scroll">' +
      '<table part="table"><caption part="caption"></caption><thead></thead><tbody></tbody>' +
      '</table></div><div class="footer" part="footer"><span class="summary" role="status" aria-live="polite"></span>' +
      '<div class="pages"><button type="button" class="prev" aria-label="Previous page"><cu-icon name="chevron-right" size="16"></cu-icon></button>' +
      '<span class="current"></span><button type="button" class="next" aria-label="Next page"><cu-icon name="chevron-right" size="16"></cu-icon></button>' +
      '</div></div></div><cu-context-menu class="row-menu" aria-label="Row actions"></cu-context-menu>' +
      '<cu-context-menu class="header-menu" aria-label="Column actions"></cu-context-menu>' +
      '<section class="filter-panel" part="filter-panel" role="dialog" aria-label="Column filter" hidden>' +
      '<div class="filter-title"></div>' +
      '<div class="filter-modes" role="tablist" aria-label="Filter type">' +
      '<button type="button" class="filter-mode-values" role="tab" aria-controls="cu-filter-values" aria-selected="true">Values</button>' +
      '<button type="button" class="filter-mode-conditions" role="tab" aria-controls="cu-filter-conditions" aria-selected="false" tabindex="-1">Conditions</button></div>' +
      '<div class="filter-values-view" id="cu-filter-values" role="tabpanel">' +
      '<input class="filter-search" type="search" placeholder="Search values..." aria-label="Search filter values">' +
      '<label class="filter-select-all"><input type="checkbox" class="filter-all"><span>Select all matching</span></label>' +
      '<div class="filter-options" role="group" aria-label="Available filter values"></div>' +
      '<div class="filter-summary" role="status"></div></div>' +
      '<div class="filter-conditions-view" id="cu-filter-conditions" role="tabpanel" hidden>' +
      '<cu-select class="filter-operator" aria-label="Filter condition">' +
      '<option value="contains">Contains</option><option value="not-contains">Does not contain</option>' +
      '<option value="starts-with">Starts with</option><option value="ends-with">Ends with</option>' +
      '<option value="equals">Equals</option><option value="not-equals">Does not equal</option>' +
      '<option value="greater-than">Greater than</option>' +
      '<option value="greater-or-equal">Greater than or equal</option>' +
      '<option value="less-than">Less than</option>' +
      '<option value="less-or-equal">Less than or equal</option>' +
      '<option value="between">Between (inclusive)</option>' +
      '<option value="is-blank">Is blank</option>' +
      '<option value="is-not-blank">Is not blank</option></cu-select>' +
      '<input class="filter-condition-value" aria-label="Condition value" placeholder="Enter a value">' +
      '<input class="filter-condition-value2" aria-label="Second condition value" placeholder="Upper bound" hidden>' +
      '<div class="filter-condition-error" role="alert"></div></div>' +
      '<div class="filter-footer"><button type="button" class="filter-clear">Clear</button>' +
      '<button type="button" class="filter-cancel">Cancel</button>' +
      '<button type="button" class="filter-apply">Apply</button></div></section>');
    this._table=root.querySelector("table");
    this._caption=root.querySelector("caption");
    this._head=root.querySelector("thead");
    this._body=root.querySelector("tbody");
    this._footer=root.querySelector(".footer");
    this._summary=root.querySelector(".summary");
    this._current=root.querySelector(".current");
    this._prev=root.querySelector(".prev");
    this._next=root.querySelector(".next");
    this._menu=root.querySelector(".row-menu");
    this._headerMenu=root.querySelector(".header-menu");
    this._filterPanel=root.querySelector(".filter-panel");
    this._filterTitle=root.querySelector(".filter-title");
    this._filterSearch=root.querySelector(".filter-search");
    this._filterAll=root.querySelector(".filter-all");
    this._filterOptions=root.querySelector(".filter-options");
    this._filterSummary=root.querySelector(".filter-summary");
    this._filterValuesView=root.querySelector(".filter-values-view");
    this._filterConditionsView=root.querySelector(".filter-conditions-view");
    this._filterModeValues=root.querySelector(".filter-mode-values");
    this._filterModeConditions=root.querySelector(".filter-mode-conditions");
    this._filterOperator=root.querySelector(".filter-operator");
    this._filterConditionValue=root.querySelector(".filter-condition-value");
    this._filterConditionValue2=root.querySelector(".filter-condition-value2");
    this._filterConditionError=root.querySelector(".filter-condition-error");
    this._rows=[];
    this._columns=[];
    this._page=1;
    this._sortKey="";
    this._direction="asc";
    this._selected=new Set();
    this._hiddenColumns=new Set();
    this._columnFilters=new Map();
    this._filterEditor=null;
    this._rowActions=[];
    this._headerActions=[];
    this._contextRow=null;
    this._contextHeader=null;
    this._menu.addEventListener("cu-select",event=>{
      event.stopPropagation();
      const context=this._contextRow;
      if(!context)return;
      const action=this._actionsFor(context.row)
        .find(item=>item.value===event.detail.value&&!item.disabled);
      if(!action)return;
      notify(this,"cu-row-action",{
        action:action.value,label:action.label,id:context.id,row:context.row
      });
      if(action.value==="activate" && !this._rowActions.length)
        notify(this,"cu-row-activate",{row:context.row,id:context.id});
    });
    this._menu.addEventListener("cu-close",()=>this._clearContextRow());
    this._headerMenu.addEventListener("cu-select",event=>{
      event.stopPropagation();
      const context=this._contextHeader;
      if(!context)return;
      const selected=this._headerActionsFor(context.column)
        .find(action=>action.value===event.detail.value&&!action.disabled);
      if(!selected)return;
      const key=context.column?.key??null;
      this._headerMenu.hide();
      this._clearContextHeader();
      switch(selected.value){
        case "sort-asc": this._setSort(key,"asc");break;
        case "sort-desc": this._setSort(key,"desc");break;
        case "clear-sort": this.clearSort();break;
        case "hide-column": this.hideColumn(key);break;
        case "show-all-columns": this.showAllColumns();break;
        case "filter-values":
          this._showFilterPanel(context.column,context.element);
          break;
        case "clear-filter": this.clearColumnFilter(key);break;
        case "clear-all-filters": this.clearAllFilters();break;
      }
      notify(this,"cu-header-action",{
        action:selected.value,label:selected.label,key,column:context.column
      });
      if(selected.value!=="filter-values")this._focusColumn(key);
    });
    this._headerMenu.addEventListener("cu-close",()=>this._clearContextHeader());
    this._filterSearch.addEventListener("input",()=>this._renderFilterOptions());
    this._filterModeValues.addEventListener("click",()=>this._setFilterMode("values",true));
    this._filterModeConditions.addEventListener("click",()=>this._setFilterMode("conditions",true));
    this._filterOperator.addEventListener("cu-change",()=>this._syncFilterConditionInputs());
    this._filterAll.addEventListener("change",()=>{
      const editor=this._filterEditor;
      if(!editor)return;
      for(const option of this._matchingFilterOptions()){
        if(this._filterAll.checked)editor.selected.add(option.key);
        else editor.selected.delete(option.key);
      }
      this._syncFilterCheckboxes();
    });
    this._filterOptions.addEventListener("change",event=>{
      const editor=this._filterEditor,input=event.target;
      if(!editor||input?.type!=="checkbox")return;
      if(input.checked)editor.selected.add(input.dataset.valueKey);
      else editor.selected.delete(input.dataset.valueKey);
      this._syncFilterCheckboxes();
    });
    root.querySelector(".filter-apply").addEventListener("click",()=>{
      const editor=this._filterEditor;
      if(!editor)return;
      const key=editor.column.key;
      let spec;
      if(editor.mode==="conditions"){
        const operator=this._filterOperator.value;
        const first=this._filterConditionValue.value.trim();
        const second=this._filterConditionValue2.value.trim();
        const noValue=operator==="is-blank"||operator==="is-not-blank";
        if(!noValue&&(!first||(operator==="between"&&!second))){
          this._filterConditionError.textContent="Enter the required value.";
          (first?this._filterConditionValue2:this._filterConditionValue).focus();
          return;
        }
        if(NUMERIC_FILTER_OPERATORS.has(operator) &&
          (!Number.isFinite(Number(first))||
            (operator==="between"&&!Number.isFinite(Number(second))))){
          this._filterConditionError.textContent="Enter valid numeric values.";
          this._filterConditionValue.focus();return;
        }
        spec={operator,value:noValue?"":first,value2:operator==="between"?second:""};
      }else{
        const all=editor.options.every(option=>editor.selected.has(option.key));
        spec=all?null:editor.options.filter(option=>
          editor.selected.has(option.key)).map(option=>option.value);
      }
      this._hideFilterPanel(false);
      this.setColumnFilter(key,spec);
      this._focusColumn(key);
    });
    root.querySelector(".filter-clear").addEventListener("click",()=>{
      const key=this._filterEditor?.column.key;
      if(!key)return;
      this._hideFilterPanel(false);
      this.clearColumnFilter(key);
      this._focusColumn(key);
    });
    root.querySelector(".filter-cancel").addEventListener("click",()=>
      this._hideFilterPanel(true));
    this._filterPanel.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();this._hideFilterPanel(true);return;}
      if((event.key==="ArrowLeft"||event.key==="ArrowRight")&&
        (event.target===this._filterModeValues||event.target===this._filterModeConditions)){
        event.preventDefault();
        const mode=event.target===this._filterModeValues?"conditions":"values";
        this._setFilterMode(mode);
        (mode==="values"?this._filterModeValues:this._filterModeConditions).focus();
      }
    });
    this._filterOutside=event=>{
      if(this._filterEditor&&!event.composedPath().includes(this._filterPanel))
        this._hideFilterPanel(false);
    };
    this._filterViewport=event=>{
      if(this._filterEditor&&!event.composedPath().includes(this._filterPanel))
        this._hideFilterPanel(false);
    };
    this._prev.addEventListener("click",()=>this._setPage(this._page-1));
    this._next.addEventListener("click",()=>this._setPage(this._page+1));
  }
  connectedCallback(){
    this._render();
    document.addEventListener("pointerdown",this._filterOutside);
    window.addEventListener("resize",this._filterViewport);
    window.addEventListener("scroll",this._filterViewport,true);
  }
  disconnectedCallback(){
    this._hideFilterPanel(false);
    document.removeEventListener("pointerdown",this._filterOutside);
    window.removeEventListener("resize",this._filterViewport);
    window.removeEventListener("scroll",this._filterViewport,true);
  }
  attributeChangedCallback(){this._render();}
  get rows(){return this._rows;}
  set rows(value){
    if(value===this._rows)return; // stable reference across React rerenders
    this._rows=Array.isArray(value)?value:[];
    this._page=1;this._selected.clear();this._render();
  }
  get columns(){return this._columnInput;}
  set columns(value){
    if(value===this._columnInput)return;
    this._columnInput=value;
    this._columns=Array.isArray(value)?value.filter(c=>c && typeof c.key==="string"
      && /^[a-zA-Z_$][\w$-]*$/.test(c.key)).map(c=>({...c})):[];
    this._hiddenColumns=new Set([...this._hiddenColumns].filter(key=>
      this._columns.some(column=>column.key===key)));
    if(this._columns.length && this._hiddenColumns.size>=this._columns.length)
      this._hiddenColumns.clear();
    this._columnFilters=new Map([...this._columnFilters].filter(([key])=>
      this._columns.some(column=>column.key===key&&column.filterable!==false)));
    this._sortKey="";this._page=1;this._render();
  }
  get rowActions(){return this._rowActions;}
  set rowActions(value){
    if(value===this._rowActions)return;
    this._rowActions=Array.isArray(value)?value:[];
    this._menu.hide();
    this._clearContextRow();
    this._render();
  }
  get headerActions(){return this._headerActions;}
  set headerActions(value){
    if(value===this._headerActions)return;
    this._headerActions=Array.isArray(value)?value:[];
    this._headerMenu.hide();
    this._render();
  }
  get columnFilters(){
    return Object.fromEntries([...this._columnFilters].map(([key,spec])=>[
      key,Array.isArray(spec)?[...spec]:{...spec}
    ]));
  }
  set columnFilters(value){
    const next=new Map();
    if(value && typeof value==="object")for(const [key,spec] of Object.entries(value)){
      if(!this._columns.some(col=>col.key===key&&col.filterable!==false))continue;
      if(Array.isArray(spec)||isTableFilterCondition(spec))
        next.set(key,normalizeTableFilterSpec(spec));
    }
    this._columnFilters=next;this._page=1;this._render();this._notifyFilterChange();
  }
  get filteredRows(){return filterTableRows(this._rows,this._columnFilters);}
  setColumnFilter(key,spec){
    if(!this._columns.some(col=>col.key===key&&col.filterable!==false))return;
    if(spec==null){this.clearColumnFilter(key);return;}
    this._columnFilters.set(key,normalizeTableFilterSpec(spec));
    this._page=1;this._render();this._notifyFilterChange();
  }
  setColumnCondition(key,operator,value="",value2=""){
    this.setColumnFilter(key,{operator,value,value2});
  }
  clearColumnFilter(key){
    if(!this._columnFilters.delete(key))return;
    this._page=1;this._render();this._notifyFilterChange();
  }
  clearAllFilters(){
    if(!this._columnFilters.size)return;
    this._columnFilters.clear();this._page=1;this._render();this._notifyFilterChange();
  }
  _notifyFilterChange(){
    notify(this,"cu-filter-change",{filters:this.columnFilters,
      filteredCount:this.filteredRows.length,totalCount:this._rows.length});
  }
  get hiddenColumnKeys(){return [...this._hiddenColumns];}
  get visibleColumnKeys(){return this._columns.filter(column=>
    !this._hiddenColumns.has(column.key)).map(column=>column.key);}
  get page(){return this._page;}
  set page(value){this._setPage(value);}
  get sortKey(){return this._sortKey;}
  get sortDirection(){return this._direction;}
  get selectedIds(){return [...this._selected];}
  clearSelection(){this._selected.clear();this._render();this._notifySelection();}
  _rowId(row,index){return String(row?.id ?? this._rows.indexOf(row) ?? index);}
  _pageSize(){return Math.max(1,Math.min(100,Math.floor(Number(this.getAttribute("page-size"))||5)));}
  _setPage(value){
    const sorted=sortTableRows(this.filteredRows,this._sortKey,this._direction);
    const next=paginateRows(sorted,value,this._pageSize()).page;
    if(next===this._page)return;
    this._page=next;this._render();
    notify(this,"cu-page-change",{page:this._page});
  }
  _sort(key){
    const direction=this._sortKey===key && this._direction==="asc"?"desc":"asc";
    this._setSort(key,direction);
  }
  _setSort(key,direction){
    if(key && !this._columns.some(col=>col.key===key&&col.sortable!==false))return;
    if(this._sortKey===key&&this._direction===direction)return;
    this._sortKey=key??"";
    this._direction=direction;
    this._page=1;this._render();
    notify(this,"cu-sort",{key:this._sortKey,direction:this._direction});
  }
  clearSort(){this._setSort("","asc");}
  hideColumn(key){
    if(!this.visibleColumnKeys.includes(key)||this.visibleColumnKeys.length<=1)return;
    this._hiddenColumns.add(key);
    if(this._sortKey===key){
      this._sortKey="";this._direction="asc";
      notify(this,"cu-sort",{key:"",direction:"asc"});
    }
    this._render();
    this._notifyColumnVisibility();
  }
  showAllColumns(){
    if(!this._hiddenColumns.size)return;
    this._hiddenColumns.clear();
    this._render();
    this._notifyColumnVisibility();
  }
  _notifyColumnVisibility(){
    notify(this,"cu-column-visibility-change",{
      hiddenKeys:this.hiddenColumnKeys,visibleKeys:this.visibleColumnKeys
    });
  }
  _notifySelection(){notify(this,"cu-selection-change",{selectedIds:this.selectedIds});}
  _actionsFor(row){
    const fallback=this.getAttribute("row-action");
    const source=this._rowActions.length?this._rowActions:
      fallback?[{value:"activate",label:fallback}]:[];
    return source.filter(item=>item&&typeof item.value==="string"&&item.value.length>0)
      .map(item=>({
        value:item.value,
        label:String(item.label??item.value),
        disabled:typeof item.disabled==="function"
          ?Boolean(item.disabled(row)):Boolean(item.disabled)
      }));
  }
  _clearContextRow(){
    if(this._contextRow?.element)this._contextRow.element.dataset.context="false";
    this._contextRow=null;
  }
  _showRowMenu(row,id,element,x,y){
    const actions=this._actionsFor(row);
    if(!actions.length)return;
    this._headerMenu.hide();
    this._hideFilterPanel(false);
    this._clearContextRow();
    this._contextRow={row,id,element};
    element.dataset.context="true";
    this._menu.setAttribute("aria-label","Actions for row "+id);
    this._menu.items=actions;
    this._menu.showAt(x,y,element);
  }
  _setFilterMode(mode,focus=false){
    if(!this._filterEditor)return;
    this._filterEditor.mode=mode;
    this._filterValuesView.hidden=mode!=="values";
    this._filterConditionsView.hidden=mode!=="conditions";
    this._filterModeValues.setAttribute("aria-selected",String(mode==="values"));
    this._filterModeConditions.setAttribute("aria-selected",String(mode==="conditions"));
    this._filterModeValues.tabIndex=mode==="values"?0:-1;
    this._filterModeConditions.tabIndex=mode==="conditions"?0:-1;
    if(focus){
      if(mode==="values")this._filterSearch.focus();
      else this._filterOperator.focus();
    }
  }
  _syncFilterConditionInputs(){
    const op=this._filterOperator.value;
    const blank=op==="is-blank"||op==="is-not-blank";
    this._filterConditionValue.hidden=blank;
    this._filterConditionValue2.hidden=op!=="between";
    this._filterConditionValue.placeholder=NUMERIC_FILTER_OPERATORS.has(op)?
      "Enter a number":"Enter text";
    this._filterConditionError.textContent="";
  }
  _matchingFilterOptions(){
    const editor=this._filterEditor;
    if(!editor)return [];
    const query=this._filterSearch.value.trim().toLocaleLowerCase();
    return editor.options.filter(option=>
      option.label.toLocaleLowerCase().includes(query));
  }
  _renderFilterOptions(){
    const editor=this._filterEditor;
    if(!editor)return;
    const matching=this._matchingFilterOptions();
    this._filterOptions.replaceChildren();
    for(const option of matching){
      const label=document.createElement("label");
      const input=document.createElement("input");
      input.type="checkbox";input.dataset.valueKey=option.key;
      input.checked=editor.selected.has(option.key);
      input.setAttribute("aria-label",option.label);
      const name=document.createElement("span");name.className="filter-value";
      name.textContent=option.label;name.title=option.label;
      const count=document.createElement("span");count.className="filter-count";
      count.textContent=String(option.count);
      label.append(input,name,count);this._filterOptions.append(label);
    }
    if(!matching.length){
      const empty=document.createElement("div");
      empty.className="filter-empty";empty.textContent="No matching values";
      this._filterOptions.append(empty);
    }
    this._syncFilterCheckboxes();
  }
  _syncFilterCheckboxes(){
    const editor=this._filterEditor;
    if(!editor)return;
    const matching=this._matchingFilterOptions();
    for(const input of this._filterOptions.querySelectorAll('input[type="checkbox"]'))
      input.checked=editor.selected.has(input.dataset.valueKey);
    const selected=matching.filter(option=>editor.selected.has(option.key)).length;
    this._filterAll.checked=matching.length>0&&selected===matching.length;
    this._filterAll.indeterminate=selected>0&&selected<matching.length;
    this._filterAll.disabled=!matching.length;
    this._filterSummary.textContent=editor.selected.size+" of "+
      editor.options.length+" selected";
  }
  _showFilterPanel(column,header,focusTarget=null){
    if(!column||column.filterable===false)return;
    this._menu.hide();this._headerMenu.hide();this._hideFilterPanel(false);
    const source=filterTableRows(this._rows,this._columnFilters,column.key);
    const options=uniqueTableFilterValues(source,column.key);
    const existing=this._columnFilters.get(column.key);
    const byKey=new Map(options.map(item=>[item.key,item]));
    for(const value of Array.isArray(existing)?existing:[]){
      const key=tableFilterValueKey(value);
      if(!byKey.has(key))byKey.set(key,{key,value,label:tableFilterValueLabel(value),count:0});
    }
    const all=[...byKey.values()].sort((a,b)=>
      a.label.localeCompare(b.label,undefined,{numeric:true,sensitivity:"base"}));
    const condition=isTableFilterCondition(existing)?existing:null;
    this._filterEditor={column,header,focusTarget:focusTarget??header.querySelector(".filter-trigger")??header.querySelector("button")??header,
      options:all,selected:new Set((Array.isArray(existing)?existing:
        all.map(item=>item.value)).map(tableFilterValueKey)),mode:"values"};
    this._filterOperator.value=condition?.operator??"contains";
    this._filterConditionValue.value=String(condition?.value??"");
    this._filterConditionValue2.value=String(condition?.value2??"");
    this._syncFilterConditionInputs();
    this._setFilterMode(condition?"conditions":"values");
    this._filterTitle.textContent="Filter: "+String(column.label??column.key);
    this._filterPanel.setAttribute("aria-label",this._filterTitle.textContent);
    this._filterSearch.value="";
    this._renderFilterOptions();
    this._filterPanel.hidden=false;
    if(this._filterEditor.focusTarget?.setAttribute)
      this._filterEditor.focusTarget.setAttribute("aria-expanded","true");
    const rect=header.getBoundingClientRect();
    const bounds=this._filterPanel.getBoundingClientRect();
    const pos=clampMenuPosition(rect.left,rect.bottom+4,bounds.width,bounds.height,
      window.innerWidth,window.innerHeight);
    this._filterPanel.style.left=pos.x+"px";
    this._filterPanel.style.top=pos.y+"px";
    (condition?this._filterOperator:this._filterSearch).focus();
  }
  _hideFilterPanel(restore=false){
    const editor=this._filterEditor;
    if(!editor)return;
    this._filterEditor=null;this._filterPanel.hidden=true;
    if(editor.focusTarget?.setAttribute)
      editor.focusTarget.setAttribute("aria-expanded","false");
    if(restore){
      if(editor.focusTarget?.isConnected)editor.focusTarget.focus();
      else this._focusColumn(editor.column.key);
    }
  }
  _headerActionsFor(column){
    const key=column?.key;
    const sortable=Boolean(key && column.sortable!==false);
    const builtins=[
      {value:"sort-asc",label:"Sort ascending",disabled:!sortable},
      {value:"sort-desc",label:"Sort descending",disabled:!sortable},
      {value:"clear-sort",label:"Clear sorting",disabled:!this._sortKey},
      {value:"filter-values",label:"Filter by values...",
        disabled:!key||column?.filterable===false},
      {value:"clear-filter",label:"Clear column filter",
        disabled:!key||!this._columnFilters.has(key)},
      {value:"clear-all-filters",label:"Clear all filters",
        disabled:!this._columnFilters.size},
      {value:"hide-column",label:"Hide column",
        disabled:!key||this.visibleColumnKeys.length<=1},
      {value:"show-all-columns",label:"Show all columns",
        disabled:this._hiddenColumns.size===0}
    ];
    const reserved=new Set(builtins.map(item=>item.value));
    const extra=this._headerActions.filter(action=>action &&
      typeof action.value==="string"&&action.value.length&&!reserved.has(action.value))
      .map(action=>({
        value:action.value,label:String(action.label??action.value),
        disabled:typeof action.disabled==="function"
          ?Boolean(action.disabled(column)):Boolean(action.disabled)
      }));
    return [...builtins,...extra];
  }
  _clearContextHeader(){
    if(this._contextHeader?.element)
      this._contextHeader.element.dataset.context="false";
    this._contextHeader=null;
  }
  _showHeaderMenu(column,element,x,y){
    this._hideFilterPanel(false);
    this._menu.hide();
    this._headerMenu.hide();
    this._clearContextHeader();
    this._contextHeader={column,element};
    element.dataset.context="true";
    this._headerMenu.setAttribute("aria-label",
      "Column actions: "+String(column?.label??column?.key??"Table"));
    this._headerMenu.items=this._headerActionsFor(column);
    this._headerMenu.showAt(x,y,element.querySelector("button")??element);
  }
  _focusColumn(key){
    const headers=[...this._head.querySelectorAll("th[data-column-key]")];
    const target=headers.find(header=>header.dataset.columnKey===key)??headers[0];
    const focus=target?.querySelector("button")??target;
    focus?.focus?.();
  }
  _bindHeaderMenu(header,column){
    header.dataset.columnKey=column.key;
    header.setAttribute("aria-haspopup","menu");
    header.setAttribute("aria-keyshortcuts","Shift+F10");
    if(column.sortable===false)header.tabIndex=0;
    header.addEventListener("contextmenu",event=>{
      event.preventDefault();
      this._showHeaderMenu(column,header,event.clientX,event.clientY);
    });
    header.addEventListener("keydown",event=>{
      if(event.key!=="ContextMenu"&&!(event.shiftKey&&event.key==="F10"))return;
      event.preventDefault();
      const rect=header.getBoundingClientRect();
      this._showHeaderMenu(column,header,rect.left+16,rect.bottom);
    });
  }
  _makeCell(text,tag="td"){
    const cell=document.createElement(tag);
    cell.textContent=String(text??"");
    return cell;
  }
  _render(){
    if(!this._table)return;
    this._menu.hide();
    this._headerMenu.hide();
    this._hideFilterPanel(false);
    this._clearContextRow();
    this._clearContextHeader();
    this._caption.textContent=this.getAttribute("caption")||"";
    this._table.setAttribute("aria-label",this.getAttribute("aria-label")||
      this._caption.textContent||"Data table");
    const columns=this._columns.filter(column=>!this._hiddenColumns.has(column.key));
    this._head.replaceChildren();
    const header=document.createElement("tr");
    if(this.hasAttribute("selectable")){
      const h=this._makeCell("","th");h.scope="col";
      h.textContent="Select";header.append(h);
    }
    for(const column of columns){
      const h=document.createElement("th");h.scope="col";
      this._bindHeaderMenu(h,column);
      h.dataset.filtered=String(this._columnFilters.has(column.key));
      if(column.sortable!==false){
        const b=document.createElement("button");b.type="button";
        b.textContent=String(column.label??column.key);
        b.addEventListener("click",()=>{
          this._sort(column.key);
          this._focusColumn(column.key);
        });
        if(this._sortKey===column.key){
          h.setAttribute("aria-sort",this._direction==="asc"?"ascending":"descending");
          const sort=document.createElement("span");sort.className="sort";
          const icon=document.createElement("cu-icon");icon.name="chevron-down";
          icon.setAttribute("size","13");
          if(this._direction==="asc")icon.style.transform="rotate(180deg)";
          sort.append(icon);sort.setAttribute("aria-hidden","true");b.append(sort);
        }
        h.append(b);
      }else h.textContent=String(column.label??column.key);
      if(column.filterable!==false){
        const trigger=document.createElement("button");
        trigger.type="button";trigger.className="filter-trigger";
        trigger.title="Filter "+String(column.label??column.key);
        trigger.setAttribute("aria-label",trigger.title);
        trigger.setAttribute("aria-haspopup","dialog");
        trigger.setAttribute("aria-expanded","false");
        const icon=document.createElement("cu-icon");
        icon.name="sliders-horizontal";icon.setAttribute("size","14");
        trigger.append(icon);
        trigger.addEventListener("click",event=>{
          event.stopPropagation();
          this._showFilterPanel(column,h,trigger);
        });
        h.append(trigger);
      }
      header.append(h);
    }
    this._head.append(header);
    this._body.replaceChildren();
    const busy=this.hasAttribute("loading");
    this._table.setAttribute("aria-busy",String(busy));
    const sorted=sortTableRows(this.filteredRows,this._sortKey,this._direction);
    const page=paginateRows(sorted,this._page,this._pageSize());
    this._page=page.page;
    if(busy || !columns.length || !page.rows.length){
      const tr=document.createElement("tr"),td=this._makeCell(
        busy?"Loading…":this._columnFilters.size?"No matching records":
        this.getAttribute("empty-text")||"No records","td");
      td.className="empty";td.colSpan=columns.length+(this.hasAttribute("selectable")?1:0)||1;
      tr.append(td);this._body.append(tr);
    }else{
      page.rows.forEach((row,localIndex)=>{
        const absolute=(page.page-1)*this._pageSize()+localIndex;
        const id=this._rowId(row,absolute);
        const tr=document.createElement("tr");
        tr.dataset.selected=String(this._selected.has(id));
        if(this._actionsFor(row).length){
          tr.tabIndex=0;
          tr.dataset.actionable="true";
          tr.setAttribute("aria-haspopup","menu");
          tr.setAttribute("aria-keyshortcuts","Shift+F10");
          tr.addEventListener("contextmenu",event=>{
            event.preventDefault();
            this._showRowMenu(row,id,tr,event.clientX,event.clientY);
          });
          tr.addEventListener("keydown",event=>{
            if(event.key!=="ContextMenu"&&!(event.shiftKey&&event.key==="F10"))return;
            event.preventDefault();
            const rect=tr.getBoundingClientRect();
            this._showRowMenu(row,id,tr,rect.left+16,rect.bottom);
          });
        }
        if(this.hasAttribute("selectable")){
          const td=document.createElement("td");
          const checkbox=document.createElement("input");
          checkbox.type="checkbox";checkbox.checked=this._selected.has(id);
          checkbox.setAttribute("aria-label","Select row "+id);
          checkbox.addEventListener("change",()=>{
            if(checkbox.checked)this._selected.add(id);else this._selected.delete(id);
            tr.dataset.selected=String(checkbox.checked);this._notifySelection();
          });
          td.append(checkbox);tr.append(td);
        }
        for(const col of columns)tr.append(this._makeCell(row?.[col.key]));
        this._body.append(tr);
      });
    }
    this._summary.textContent=busy?"Loading rows":this._columnFilters.size?
      page.total+" of "+this._rows.length+" rows":page.total+" row"+(page.total===1?"":"s");
    this._current.textContent=page.page+" / "+page.totalPages;
    this._prev.disabled=busy||page.page<=1;
    this._next.disabled=busy||page.page>=page.totalPages;
    this._footer.hidden=busy||!this._rows.length;
  }
}
define("cu-data-table",CuDataTable);
