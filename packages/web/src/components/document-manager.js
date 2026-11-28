import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeFileEntries} from "./file-explorer.js";
import "./file-manager.js";
import "./document-workspace.js";
import "./split-view.js";
import "./empty-state.js";
export function normalizeManagedDocuments(items){
  const source=Array.isArray(items)?items:[],meta=new Map();
  for(const x of source)if(x&&typeof x.id==="string"&&x.id.trim()&&!meta.has(x.id)&&typeof x.name==="string"&&x.name.trim()&&["file","folder"].includes(x.kind))meta.set(x.id,x);
  return normalizeFileEntries(source).map(x=>{const m=meta.get(x.id);return {...x,pages:x.kind==="file"?(Array.isArray(m?.pages)?m.pages:[]).filter(p=>typeof p==="string"&&p.trim()):[],notes:x.kind==="file"?String(m?.notes??""):""};});
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{padding:8px;min-width:0;display:grid;gap:8px;align-content:start;}cu-split-view{height:var(--cu-document-manager-height,760px);}strong{overflow-wrap:anywhere;}cu-document-workspace{--cu-document-workspace-height:650px;}";
export class CuDocumentManager extends BrowserElement{
  static get observedAttributes(){return ["selected","readonly"];}
  constructor(){
    super();this._items=[];this._positions=new Map();this._activeId="";
    const root=mount(this,css,'<cu-split-view position="32" min="20" max="60" label="Document manager"><div class="panel" slot="sidebar"><cu-file-manager label="Documents"></cu-file-manager></div><div class="panel" slot="content"><strong role="status"></strong><cu-document-workspace hidden></cu-document-workspace><cu-empty-state title="Select a document" size="sm"></cu-empty-state></div></cu-split-view>');
    this._files=root.querySelector("cu-file-manager");this._workspace=root.querySelector("cu-document-workspace");this._heading=root.querySelector("strong");this._empty=root.querySelector("cu-empty-state");
    for(const type of ["cu-select","cu-open"])this._files.addEventListener(type,e=>{e.stopPropagation();if(e.detail.entry?.kind==="file")this.selectDocument(e.detail.id);});
    this._files.addEventListener("cu-change",e=>{e.stopPropagation();notify(this,"cu-navigate",{folderId:e.detail.folderId});});
    this._files.addEventListener("cu-action",e=>{e.stopPropagation();notify(this,"cu-action",{...e.detail,section:"files"});});
    for(const type of ["cu-input","cu-change","cu-transform","cu-action"])this._workspace.addEventListener(type,e=>{e.stopPropagation();const item=this._items.find(x=>x.id===this.selected);if(!item)return;if(e.detail.section==="notes"&&!this.readonly)item.notes=this._workspace.notes;if(e.detail.section==="document"&&type==="cu-change")this._positions.set(item.id,this._workspace.page);notify(this,type,{...e.detail,documentId:item.id});});
    const split=root.querySelector("cu-split-view");for(const type of ["cu-input","cu-change"])split.addEventListener(type,e=>{if(e.target===split)e.stopPropagation();});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get items(){return normalizeManagedDocuments(this._items);}set items(v){this._items=normalizeManagedDocuments(v);for(const id of this._positions.keys())if(!this._items.some(x=>x.id===id))this._positions.delete(id);this._files.items=this._items;this._sync(true);}
  get selected(){const id=this.getAttribute("selected");return this._items.some(x=>x.id===id&&x.kind==="file")?id:"";}set selected(v){this.setAttribute("selected",String(v??""));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  selectDocument(id){if(!this._items.some(x=>x.id===id&&x.kind==="file"))return false;if(this.selected!==id){this.selected=id;notify(this,"cu-select",{value:id,documentId:id});}return true;}
  _sync(force=false){if(!this._workspace)return;const x=this._items.find(x=>x.id===this.selected);this._workspace.readonly=this.readonly;this._workspace.hidden=!x;this._empty.hidden=Boolean(x);this._heading.textContent=x?.name??"Documents";if(force||this._activeId!==this.selected){this._activeId=this.selected;this._workspace.page=this._positions.get(this.selected)??1;this._workspace.pages=x?.pages??[];this._workspace.notes=x?.notes??"";this._workspace.active=x?.pages.length?"document":"notes";}}
}
define("cu-document-manager",CuDocumentManager);
