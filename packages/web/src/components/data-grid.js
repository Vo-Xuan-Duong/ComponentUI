import {CuDataTable} from "./data-table.js";
import {coercePropertyValue} from "./property-grid.js";
import {define,notify} from "./_shared.js";

export function coerceGridValue(column,value,previous=""){
  return coercePropertyValue({...column,type:column.type||"text",options:Array.isArray(column.options)?column.options.filter(x=>x&&typeof x.value==="string"):[],value:previous},value);
}
const css=[
  "td[data-editable=true]{cursor:cell;}td[data-editable=true]:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  "td[data-editing=true]{padding:4px 7px;min-width:110px;}td[data-editing=true] input:not([type=checkbox]),td[data-editing=true] select{box-sizing:border-box;width:100%;min-width:75px;min-height:32px;padding:4px 7px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);color:var(--cu-text,#242424);font:inherit;}",
  "td[data-editing=true] input[type=checkbox]{accent-color:var(--cu-accent,#0067c0);}td[data-editing=true] [aria-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.grid-error{display:block;color:var(--cu-danger,#c42b1c);font-size:11px;white-space:normal;}.grid-error:empty{display:none;}"
].join("");
export class CuDataGrid extends CuDataTable{
  static get observedAttributes(){return [...super.observedAttributes,"readonly"];}
  constructor(){
    super();
    const style=this.ownerDocument.createElement("style");style.textContent=css;this.shadowRoot.append(style);
    this.addEventListener("cu-row-action",event=>{
      if(event.target!==this||event.detail.action!=="edit-cell")return;
      const {id}=event.detail,columns=this._columns.filter(c=>c.editable&&this.visibleColumnKeys.includes(c.key));
      const target=this._targetCell?.id===id?columns.find(c=>c.key===this._targetCell.key):null;
      const column=target||columns[0];if(column){this._menu.hide();this.editCell(id,column.key);}
    });
  }
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _canEdit(column,row){
    if(this.readonly||this.loading||this.error||column?.editable!==true||row?.id==null)return false;
    if(this._countedRows!==this._rows){
      this._countedRows=this._rows;this._idCounts=new Map();
      for(const r of this._rows)if(r?.id!=null){const id=String(r.id);this._idCounts.set(id,(this._idCounts.get(id)||0)+1);}
    }
    return this._idCounts.get(String(row.id))===1;
  }
  _actionsFor(row){
    const actions=super._actionsFor(row).filter(action=>action.value!=="edit-cell");
    if(this._columns.some(c=>this.visibleColumnKeys.includes(c.key)&&this._canEdit(c,row)))actions.unshift({value:"edit-cell",label:"Edit cell",disabled:false});
    return actions;
  }
  _cellDisplayValue(row,column){return row?.[column.key];}
  _renderDataCell(row,column,id){
    const cell=super._renderDataCell(row,column,id);
    cell.textContent=String(this._cellDisplayValue(row,column)??"");
    cell.dataset.rowId=id;cell.dataset.columnKey=column.key;
    cell.addEventListener("contextmenu",()=>{this._targetCell={id,key:column.key};});
    if(!this._canEdit(column,row))return cell;
    cell.dataset.editable="true";cell.tabIndex=0;cell.setAttribute("aria-keyshortcuts","F2 Enter");
    cell.addEventListener("focus",()=>{this._targetCell={id,key:column.key};});
    cell.addEventListener("dblclick",()=>this.editCell(id,column.key));
    cell.addEventListener("keydown",event=>{
      if(event.target!==cell)return;
      if(event.key==="F2"||event.key==="Enter"){event.preventDefault();this.editCell(id,column.key);}
    });
    return cell;
  }
  _cell(id,key){return [...this.shadowRoot.querySelectorAll("td[data-row-id]")].find(el=>el.dataset.rowId===String(id)&&el.dataset.columnKey===key);}
  editCell(id,key){
    const row=this._rows.find(r=>r?.id!=null&&String(r.id)===String(id)),column=this._columns.find(c=>c.key===key),cell=this._cell(id,key);
    if(!cell||!this._canEdit(column,row))return false;
    if(cell.dataset.editing==="true")return true;
    const existing=this.shadowRoot.querySelector('td[data-editing="true"]');
    if(existing){existing._gridCancel?.(false);}
    const doc=this.ownerDocument,control=doc.createElement(column.type==="select"?"select":"input"),error=doc.createElement("span");
    if(column.type==="select"){
      for(const option of Array.isArray(column.options)?column.options:[]){if(typeof option?.value!=="string")continue;const o=doc.createElement("option");o.value=option.value;o.textContent=String(option.label??option.value);o.disabled=Boolean(option.disabled);control.append(o);}
      control.value=String(row[key]??"");
    }else{
      control.type=column.type==="boolean"?"checkbox":column.type==="number"?"number":column.type==="color"?"color":"text";
      if(column.type==="boolean")control.checked=row[key]===true;else control.value=String(row[key]??"");
      if(column.type==="number"){control.step=Number.isFinite(column.step)&&column.step>0?String(column.step):"any";if(Number.isFinite(column.min))control.min=String(column.min);if(Number.isFinite(column.max))control.max=String(column.max);}
    }
    control.setAttribute("aria-label","Edit "+String(column.label??key));error.className="grid-error";error.setAttribute("role","status");
    const cancel=(restore=true)=>{cell.dataset.editing="false";cell.textContent=String(this._cellDisplayValue(row,column)??"");delete cell._gridCancel;if(restore)cell.focus({preventScroll:true});};
    const commit=(restore=true,target=null)=>{
      if(cell.dataset.editing!=="true"||!cell.isConnected)return false;
      const parsed=coerceGridValue(column,column.type==="boolean"?control.checked:control.value,row[key]);
      if(!parsed.valid){control.setAttribute("aria-invalid","true");error.textContent=parsed.message;return false;}
      cell.dataset.editing="false";delete cell._gridCancel;
      if(!this._applyCellValue(id,key,parsed.value,target??(restore?{id,key}:null))){cancel(restore);return false;}
      return true;
    };
    cell._gridCancel=cancel;cell.dataset.editing="true";cell.replaceChildren(control,error);
    control.addEventListener("keydown",event=>{
      if(event.isComposing)return;
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();cancel();}
      else if(event.key==="Enter"){event.preventDefault();event.stopPropagation();commit();}
      else if(event.key==="Tab"){const cells=[...this.shadowRoot.querySelectorAll("td[data-editable=true]")],index=cells.indexOf(cell),next=cells[index+(event.shiftKey?-1:1)];if(!next)return;event.preventDefault();event.stopPropagation();const target={id:next.dataset.rowId,key:next.dataset.columnKey};commit(false,target);}
      else if(event.key==="ContextMenu"||(event.shiftKey&&event.key==="F10"))event.stopPropagation();
    });
    control.addEventListener("input",()=>{control.removeAttribute("aria-invalid");error.textContent="";});
    if(column.type==="select"||column.type==="boolean"||column.type==="color")control.addEventListener("change",()=>commit());
    // Text/number edits commit explicitly with Enter or internal Tab. Leaving
    // the editor otherwise cancels, avoiding a render that steals click focus.
    control.addEventListener("blur",()=>{if(cell.isConnected&&cell.dataset.editing==="true")cancel(false);});
    control.addEventListener("contextmenu",event=>event.stopPropagation());
    control.focus({preventScroll:true});if(control.type==="text")control.select();return true;
  }
  setCellValue(id,key,value){return this._applyCellValue(id,key,value);}
  _applyCellValue(id,key,value,focusTarget=null){
    const row=this._rows.find(r=>r?.id!=null&&String(r.id)===String(id)),column=this._columns.find(c=>c.key===key);
    if(!this._canEdit(column,row))return false;
    const parsed=coerceGridValue(column,value,row[key]);if(!parsed.valid)return false;
    const previousCellValue=row[key],next={...row,[key]:parsed.value};
    if(previousCellValue!==parsed.value){
      this._rows=this._rows.map(r=>r===row?next:r);
      this._rowIndex=new WeakMap();this._rows.forEach((r,i)=>{if(r&&typeof r==="object")this._rowIndex.set(r,i);});
      this._invalidateView();
    }
    this._render();
    if(focusTarget)this._cell(focusTarget.id,focusTarget.key)?.focus({preventScroll:true});
    if(previousCellValue!==parsed.value)notify(this,"cu-cell-change",{id:String(id),key,cellValue:parsed.value,previousCellValue,row:next});
    return true;
  }
}
define("cu-data-grid",CuDataGrid);
