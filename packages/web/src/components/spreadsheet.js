import {CuDataGrid} from "./data-grid.js";
import {evaluateFormula} from "./formula-input.js";
import {define} from "./_shared.js";
export function normalizeSheet(cells){
  const source=Array.isArray(cells)?cells.slice(0,100):[];
  const width=Math.min(26,Math.max(1,...source.map(row=>Array.isArray(row)?row.length:0)));
  return source.map(row=>Array.from({length:width},(_,i)=>String(Array.isArray(row)?row[i]??"":"")));
}
export function parseCellAddress(address){
  const match=/^([A-Z])([1-9][0-9]*)$/i.exec(String(address??"").trim());
  if(!match)return null;
  const row=Number(match[2])-1,column=match[1].toUpperCase().charCodeAt(0)-65;
  return row>=0&&row<100?{row,column}:null;
}
export function calculateSheet(cells){
  const source=normalizeSheet(cells),cache=new Map(),visiting=new Set();
  function read(row,col){
    if(row<0||col<0||row>=source.length||col>=source[row].length)return {value:"#REF!",error:"#REF!"};
    const key=row+":"+col;
    if(cache.has(key))return cache.get(key);
    if(visiting.has(key))return {value:"#CYCLE!",error:"#CYCLE!"};
    if(visiting.size>=64)return {value:"#LIMIT!",error:"#LIMIT!"};
    const raw=source[row][col];let result;
    if(!raw.trimStart().startsWith("="))result={value:raw,error:""};
    else{
      visiting.add(key);
      const evaluation=evaluateFormula(raw,ref=>{
        const pos=parseCellAddress(ref);if(!pos)throw Error("#REF!");
        const item=read(pos.row,pos.column);if(item.error)throw Error(item.error);
        if(item.value==="")return 0;
        const n=Number(item.value);if(!Number.isFinite(n)||String(item.value).trim()==="")throw Error("#VALUE!");return n;
      });
      visiting.delete(key);
      const error=evaluation.valid?"":/^#[A-Z0-9/]+!$/.test(evaluation.error)?evaluation.error:evaluation.error==="Division by zero."?"#DIV/0!":"#ERROR!";
      result={value:evaluation.valid?evaluation.result:error,error};
    }
    cache.set(key,result);return result;
  }
  return source.map((row,r)=>row.map((_,c)=>read(r,c).value));
}
export class CuSpreadsheet extends CuDataGrid{
  connectedCallback(){
    if(!this._sheetAssigned)this.cells=Array.from({length:8},()=>Array(5).fill(""));
    super.connectedCallback();
  }
  get cells(){
    const columns=(this._columns??[]).filter(c=>/^[A-Z]$/.test(c.key));
    return (this._rows??[]).map(row=>columns.map(c=>String(row[c.key]??"")));
  }
  set cells(value){
    const cells=normalizeSheet(value);this._sheetAssigned=true;
    const width=cells[0]?.length??1;
    this.columns=[{key:"rowLabel",label:"#",editable:false,sortable:false,filterable:false},...Array.from({length:width},(_,i)=>{const key=String.fromCharCode(65+i);return {key,label:key,editable:true,type:"text",sortable:false,filterable:false};})];
    this.rows=cells.map((row,i)=>({id:String(i+1),rowLabel:i+1,...Object.fromEntries(row.map((v,c)=>[String.fromCharCode(65+c),v]))}));
  }
  get computedCells(){return calculateSheet(this.cells);}
  getCell(address){const pos=parseCellAddress(address);return pos?this.cells[pos.row]?.[pos.column]??null:null;}
  getComputedCell(address){const pos=parseCellAddress(address);return pos?this.computedCells[pos.row]?.[pos.column]??null:null;}
  setCell(address,value){const pos=parseCellAddress(address);if(!pos||this.getCell(address)===null)return false;return this.setCellValue(String(pos.row+1),String.fromCharCode(65+pos.column),String(value??""));}
  _editorTag(column,row){return /^[A-Z]$/.test(column.key)?"cu-formula-input":super._editorTag(column,row);}
  _configureEditor(control,column,row){
    super._configureEditor(control,column,row);
    if(!/^[A-Z]$/.test(column.key))return;
    control.setAttribute("allow-text","");
    control.setAttribute("aria-label","Edit cell "+column.key+row.id);
    control.draftEvaluator=value=>{
      if(!String(value).trimStart().startsWith("="))return {valid:true,result:null,error:""};
      const cells=this.cells,r=Number(row.id)-1,c=column.key.charCodeAt(0)-65;
      if(!cells[r]||c>=cells[r].length)return {valid:false,result:null,error:"#REF!"};
      cells[r][c]=String(value);
      const result=calculateSheet(cells)[r][c];
      return typeof result==="number"?{valid:true,result,error:""}:{valid:false,result:null,error:String(result)};
    };
    // Refresh after installing the sheet-aware evaluator.
    control.value=String(row[column.key]??"");
  }
  _cellDisplayValue(row,column){
    if(!/^[A-Z]$/.test(column.key))return super._cellDisplayValue(row,column);
    if(this._sheetCacheRows!==this._rows||this._sheetCacheColumns!==this._columns){this._sheetCacheRows=this._rows;this._sheetCacheColumns=this._columns;this._sheetCache=calculateSheet(this.cells);}
    return this._sheetCache?.[Number(row?.id)-1]?.[column.key.charCodeAt(0)-65]??super._cellDisplayValue(row,column);
  }
}
define("cu-spreadsheet",CuSpreadsheet);
