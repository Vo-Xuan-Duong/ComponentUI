import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeInspectorRows} from "./data-inspector.js";
import "./tree-view.js";
import "./split-view.js";
import "./empty-state.js";
import "./search-box.js";
export function normalizeDatabaseTables(tables){
  const ids=new Set(),out=[];
  for(const t of Array.isArray(tables)?tables:[]){
    if(!t||typeof t.id!=="string"||!t.id.trim()||ids.has(t.id)||out.length>=100)continue;
    ids.add(t.id);out.push({id:t.id,label:String(t.label??t.id),schema:String(t.schema??"Default"),rows:normalizeInspectorRows(t.rows)});
  }return out;
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}cu-split-view{height:var(--cu-database-explorer-height,620px);}.side,.content{padding:8px;min-width:0;display:grid;gap:8px;align-content:start;}.heading{font-weight:650;overflow-wrap:anywhere;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuDatabaseExplorer extends BrowserElement{
  static get observedAttributes(){return ["selected"];}
  constructor(){
    super();this._tables=[];this._queries=new Map();this._pendingQuery=null;this._nodes=new Map();this._activeId="";this._tableQuery="";
    const root=mount(this,css,'<cu-split-view position="28" min="20" max="60" label="Database explorer"><div class="side" slot="sidebar"><strong>Tables</strong><cu-search-box aria-label="Find tables" placeholder="Find tables…"></cu-search-box><cu-tree-view label="Database schemas and tables"></cu-tree-view></div><div class="content" slot="content"><div class="heading"></div><div class="status" role="status"></div><cu-data-inspector hidden></cu-data-inspector><cu-empty-state title="No tables available" size="sm"></cu-empty-state></div></cu-split-view>');
    this._tree=root.querySelector("cu-tree-view");this._inspector=root.querySelector("cu-data-inspector");this._heading=root.querySelector(".heading");this._status=root.querySelector(".status");this._empty=root.querySelector("cu-empty-state");this._search=root.querySelector("cu-search-box");
    this._search.addEventListener("cu-input",e=>{e.stopPropagation();this._tableQuery=e.detail.value;this._renderTree();});for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,e=>e.stopPropagation());
    this._tree.addEventListener("cu-change",e=>{e.stopPropagation();const id=this._nodes.get(e.detail.value);if(id!==undefined)this.selectTable(id);else this._syncSelection();});
    this._tree.addEventListener("cu-toggle",e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._inspector.addEventListener(type,e=>{e.stopPropagation();if(!e.detail.query)return;this._queries.set(this.selected,this._inspector.query);this._status.textContent=this._inspector.visibleRows.length+" matching records";notify(this,type,{tableId:this.selected,...e.detail});});
    this._inspector.addEventListener("cu-select",e=>{e.stopPropagation();notify(this,"cu-select",{tableId:this.selected,recordId:e.detail.id,row:e.detail.row});});
    const split=root.querySelector("cu-split-view");for(const type of ["cu-input","cu-change"])split.addEventListener(type,e=>{if(e.target===split)e.stopPropagation();});
  }
  connectedCallback(){this._renderTree();this._sync(true);}attributeChangedCallback(){this._sync();}
  get tables(){return normalizeDatabaseTables(this._tables);}set tables(v){this._tables=normalizeDatabaseTables(v);for(const id of this._queries.keys())if(!this._tables.some(t=>t.id===id))this._queries.delete(id);this._renderTree();this._sync(true);}
  get selected(){const id=this.getAttribute("selected");return this._tables.find(t=>t.id===id)?.id??this._tables[0]?.id??"";}set selected(v){this.setAttribute("selected",String(v??""));}
  get query(){return this._inspector.query;}set query(v){if(!this.selected){this._pendingQuery=v;return;}this._inspector.query=v;this._queries.set(this.selected,this._inspector.query);this._status.textContent=this._inspector.visibleRows.length+" matching records";}
  selectTable(id){if(!this._tables.some(t=>t.id===id))return false;if(id!==this.selected){this.selected=id;notify(this,"cu-select",{tableId:id,value:id});}return true;}
  _syncSelection(){const key=[...this._nodes].find(([,id])=>id===this.selected)?.[0]??"";if(this._tree.value!==key)this._tree.value=key;}
  _renderTree(){
    if(!this._tree)return;const doc=this.ownerDocument,groups=new Map();this._nodes.clear();
    const query=this._tableQuery.trim().toLocaleLowerCase();for(const t of this._tables){if(query&&![t.id,t.label,t.schema].some(v=>v.toLocaleLowerCase().includes(query)))continue;if(!groups.has(t.schema))groups.set(t.schema,[]);groups.get(t.schema).push(t);}
    const roots=[...groups].map(([schema,tables])=>{const root=doc.createElement("cu-tree-item");root.setAttribute("value","schema:"+schema);root.setAttribute("label",schema||"Default");root.setAttribute("expanded","");for(const t of tables){const child=doc.createElement("cu-tree-item"),key="table:"+t.id;this._nodes.set(key,t.id);child.setAttribute("value",key);child.setAttribute("label",t.label);root.append(child);}return root;});this._tree.replaceChildren(...roots);this._syncSelection();queueMicrotask(()=>{if(this.isConnected)this._syncSelection();});
  }
  _sync(force=false){
    if(!this._inspector)return;const table=this._tables.find(t=>t.id===this.selected);this._syncSelection();this._heading.textContent=table?table.schema+" / "+table.label:"Database";this._inspector.hidden=!table;this._empty.hidden=Boolean(table);
    if(force||this._activeId!==this.selected){this._activeId=this.selected;this._inspector.rows=table?.rows??[];this._inspector.query=this._pendingQuery??this._queries.get(this.selected)??{logic:"and",conditions:[]};if(table){this._queries.set(table.id,this._inspector.query);this._pendingQuery=null;}}
    this._status.textContent=table?this._inspector.visibleRows.length+" matching records":"No tables";
  }
}
define("cu-database-explorer",CuDatabaseExplorer);
