import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
import "./context-menu.js";
const fold=v=>String(v??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function normalizeFileEntries(items){
  const map=new Map();
  for(const item of Array.isArray(items)?items:[]){
    if(!item||typeof item.id!=="string"||!item.id.trim()||map.has(item.id)||typeof item.name!=="string"||!item.name.trim()||!["file","folder"].includes(item.kind))continue;
    const entry={id:item.id,parentId:typeof item.parentId==="string"&&item.parentId?item.parentId:null,name:item.name.trim(),kind:item.kind};
    if(typeof item.size==="number"&&Number.isFinite(item.size)&&item.size>=0)entry.size=item.size;
    if(typeof item.modified==="string")entry.modified=item.modified;
    map.set(entry.id,entry);
  }
  // Reject cycles and orphaned entries rather than rendering broken hierarchies.
  const valid=new Map();
  for(const entry of map.values()){
    const path=[],seen=new Set();let current=entry,ok=true;
    while(current){
      if(valid.has(current.id)){ok=valid.get(current.id);break;}
      if(seen.has(current.id)){ok=false;break;}
      seen.add(current.id);path.push(current.id);
      if(!current.parentId)break;
      const parent=map.get(current.parentId);if(!parent||parent.kind!=="folder"){ok=false;break;}current=parent;
    }
    for(const id of path)valid.set(id,ok);
  }
  return [...map.values()].filter(entry=>valid.get(entry.id));
}
export function fileExplorerPath(items,folderId){
  const map=new Map(items.map(x=>[x.id,x])),path=[],seen=new Set();
  let id=folderId;
  while(id){const entry=map.get(id);if(!entry||entry.kind!=="folder"||seen.has(id))return [];seen.add(id);path.unshift(entry);id=entry.parentId;}
  return path;
}
export function listFileEntries(items,folderId,query=""){
  const terms=fold(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(x=>(x.parentId||"")===(folderId||"")&&terms.every(t=>fold(x.name).includes(t))).sort((a,b)=>a.kind!==b.kind?(a.kind==="folder"?-1:1):a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:"base"}));
}
const sizeLabel=n=>{
  if(typeof n!=="number")return "—";if(n<1024)return n+" B";
  const units=["KB","MB","GB","TB"],i=Math.min(3,Math.floor(Math.log(n)/Math.log(1024))-1);
  return new Intl.NumberFormat(undefined,{maximumFractionDigits:1}).format(n/1024**(i+1))+" "+units[i];
};
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);overflow:hidden;}.toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px;border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "button{font:inherit;color:inherit;cursor:pointer;background:transparent;border:1px solid transparent;border-radius:var(--cu-radius-md,6px);padding:6px;min-height:30px;}button:hover:not(:disabled){background:var(--cu-state-hover);border-color:var(--cu-border,#e5e5e5);}button:disabled{opacity:.45;cursor:not-allowed;}.breadcrumbs{display:flex;align-items:center;flex:1;min-width:100px;gap:3px;overflow:auto;}.breadcrumbs button{white-space:nowrap;}.breadcrumbs button[aria-current=page]{font-weight:650;}",
  ".search{display:flex;align-items:center;gap:6px;padding:0 8px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:6px;min-width:100px;}.search input{box-sizing:border-box;min-width:0;width:150px;max-width:100%;border:0;padding:8px 0;background:transparent;color:inherit;font:inherit;}.search:focus-within{border-color:var(--cu-accent,#0067c0);}",
  ".scroll{overflow:auto;max-block-size:var(--cu-file-explorer-height,320px);}table{width:100%;border-collapse:collapse;min-width:390px;text-align:start;}th,td{text-align:start;padding:8px 12px;border-bottom:1px solid var(--cu-border,#e5e5e5);}th{position:sticky;top:0;background:var(--cu-surface-alt,#fafafa);color:var(--cu-text-muted,#616161);font-size:12px;z-index:1;}tbody tr:hover{background:var(--cu-state-hover);}tbody tr[data-selected=true]{background:var(--cu-state-selected);}tbody tr[data-context=true]{background:var(--cu-state-pressed);}.entry{display:flex;align-items:center;gap:9px;min-width:0;text-align:start;max-width:100%;}.entry span{overflow-wrap:anywhere;}.entry cu-icon{flex:none;color:var(--cu-text-muted,#616161);}.entry[data-kind=folder] cu-icon{color:var(--cu-accent,#0067c0);}.meta{white-space:nowrap;color:var(--cu-text-muted,#616161);font-size:12px;}.empty{text-align:center;padding:28px;color:var(--cu-text-muted,#616161);}.footer{padding:9px 12px;border-top:1px solid var(--cu-border,#e5e5e5);color:var(--cu-text-muted,#616161);font-size:12px;}.menu{position:fixed;width:0;height:0;}",focusStyle
].join("");
export class CuFileExplorer extends BrowserElement{
  static get observedAttributes(){return ["folder-id","query","label","aria-label","empty-text"];}
  constructor(){
    super();this._items=[];this._actions=[];this._selected="";
    const root=mount(this,css,'<section class="frame" role="region"><div class="toolbar"><button class="up" type="button" aria-label="Parent folder"><cu-icon name="arrow-up-right" size="16"></cu-icon></button><nav class="breadcrumbs" aria-label="Folder path"></nav><label class="search"><cu-icon name="search" size="16"></cu-icon><input type="search" aria-label="Search current folder" placeholder="Search files…"></label></div><div class="scroll"><table><thead><tr><th scope="col">Name</th><th scope="col">Size</th><th scope="col">Modified</th></tr></thead><tbody></tbody></table></div><div class="footer" role="status"></div></section><cu-context-menu class="menu" aria-label="File actions"></cu-context-menu>');
    for(const [k,q] of Object.entries({frame:".frame",up:".up",crumbs:".breadcrumbs",search:"input",body:"tbody",footer:".footer",menu:".menu"}))this["_"+k]=root.querySelector(q);
    this._up.addEventListener("click",()=>{const path=fileExplorerPath(this._items,this.folderId);this.navigate(path.at(-1)?.parentId||"");});
    this._search.addEventListener("input",()=>{this.query=this._search.value;notify(this,"cu-search",{query:this.query,folderId:this.folderId});});
    this._menu.addEventListener("cu-select",event=>{
      event.stopPropagation();const entry=this._context?.entry;if(!entry)return;
      const action=event.detail.value;this._menu.hide(true);this._context=null;
      if(action==="open")this._open(entry);else notify(this,"cu-action",{action,id:entry.id,entry:{...entry}});
    });
    this._menu.addEventListener("cu-open",event=>event.stopPropagation());
    this._menu.addEventListener("cu-close",event=>{event.stopPropagation();if(this._context?.row)this._context.row.dataset.context="false";this._context=null;});
  }
  connectedCallback(){this._render();}
  disconnectedCallback(){this._menu.hide();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeFileEntries(v);if(this._selected&&!this._items.some(x=>x.id===this._selected))this._selected="";this._render();}
  get folderId(){const id=this.getAttribute("folder-id")||"";return this._items.some(x=>x.id===id&&x.kind==="folder")?id:"";}
  set folderId(v){if(v)this.setAttribute("folder-id",String(v));else this.removeAttribute("folder-id");}
  get query(){return this.getAttribute("query")||"";}set query(v){if(v)this.setAttribute("query",String(v));else this.removeAttribute("query");}
  get actions(){return this._actions.map(x=>({...x}));}
  set actions(v){const seen=new Set(["open"]);this._actions=(Array.isArray(v)?v:[]).flatMap(x=>{if(!x||typeof x.value!=="string"||!x.value||seen.has(x.value))return [];seen.add(x.value);return [{value:x.value,label:String(x.label??x.value),disabled:Boolean(x.disabled)}];});}
  navigate(id){
    id=String(id??"");if(id&&!this._items.some(x=>x.id===id&&x.kind==="folder"))return false;
    if(id===this.folderId)return false;
    this._selected="";this.query="";this.folderId=id;
    this._crumbs.querySelector('[aria-current="page"]')?.focus({preventScroll:true});
    notify(this,"cu-change",{folderId:id,value:id});return true;
  }
  _open(entry){if(entry.kind==="folder")this.navigate(entry.id);else notify(this,"cu-open",{id:entry.id,entry:{...entry}});}
  _select(entry){if(this._selected===entry.id)return;this._selected=entry.id;for(const row of this._body.querySelectorAll("tr[data-id]"))row.dataset.selected=String(row.dataset.id===entry.id);notify(this,"cu-select",{id:entry.id,value:entry.id,entry:{...entry}});}
  _showMenu(entry,row,button,x,y){
    this._menu.hide();this._select(entry);this._context={entry,row};row.dataset.context="true";
    this._menu.items=[{value:"open",label:"Open"},...this._actions];this._menu.showAt(x,y,button);
  }
  _render(){
    if(!this._body)return;
    this._menu.hide();this._context=null;
    const doc=this.ownerDocument,focused=this.shadowRoot.activeElement?.dataset?.id;
    this._frame.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"File explorer");
    if(this._search.value!==this.query)this._search.value=this.query;
    const path=fileExplorerPath(this._items,this.folderId);this._up.disabled=!path.length;
    this._crumbs.replaceChildren(...[{id:"",name:"Files"},...path].map((entry,i,all)=>{
      const button=doc.createElement("button");button.type="button";button.textContent=entry.name;
      if(i===all.length-1)button.setAttribute("aria-current","page");
      button.addEventListener("click",()=>this.navigate(entry.id));return button;
    }));
    const items=listFileEntries(this._items,this.folderId,this.query);
    this._body.replaceChildren(...items.map(entry=>{
      const row=doc.createElement("tr");row.dataset.id=entry.id;row.dataset.selected=String(entry.id===this._selected);
      const td=doc.createElement("td"),button=doc.createElement("button"),icon=doc.createElement("cu-icon"),label=doc.createElement("span");
      button.type="button";button.className="entry";button.dataset.id=entry.id;button.dataset.kind=entry.kind;button.setAttribute("aria-haspopup","menu");button.setAttribute("aria-keyshortcuts","Shift+F10");button.setAttribute("aria-label","Open "+entry.kind+" "+entry.name);
      icon.setAttribute("name",entry.kind==="folder"?"folder":"file");icon.setAttribute("size","18");label.textContent=entry.name;button.append(icon,label);td.append(button);row.append(td);
      for(const text of [entry.kind==="folder"?"—":sizeLabel(entry.size),entry.modified||"—"]){const cell=doc.createElement("td");cell.className="meta";cell.textContent=text;row.append(cell);}
      row.addEventListener("click",()=>this._select(entry));
      button.addEventListener("click",event=>{event.stopPropagation();this._select(entry);this._open(entry);});
      row.addEventListener("contextmenu",e=>{e.preventDefault();this._showMenu(entry,row,button,e.clientX,e.clientY);});
      button.addEventListener("keydown",e=>{if(e.key==="ContextMenu"||(e.shiftKey&&e.key==="F10")){e.preventDefault();const r=button.getBoundingClientRect();this._showMenu(entry,row,button,r.left,r.bottom);}});
      return row;
    }));
    if(!items.length){const row=doc.createElement("tr"),cell=doc.createElement("td");cell.colSpan=3;cell.className="empty";cell.textContent=this.query?"No matching files.":this.getAttribute("empty-text")||"This folder is empty.";row.append(cell);this._body.append(row);}
    this._footer.textContent=items.length+" item"+(items.length===1?"":"s");
    if(focused)[...this._body.querySelectorAll("button")].find(b=>b.dataset.id===focused)?.focus({preventScroll:true});
  }
}
define("cu-file-explorer",CuFileExplorer);
