import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
import "./context-menu.js";
export function normalizeTreeTableItems(value){
 const seen=new Set();const visit=(nodes,depth)=>{if(depth>50||!Array.isArray(nodes))return [];return nodes.flatMap(n=>{if(!n||typeof n.id!=="string"||!n.id.trim()||seen.has(n.id))return [];seen.add(n.id);return [{id:n.id,label:String(n.label??n.id),values:n.values&&typeof n.values==="object"?Object.fromEntries(Object.entries(n.values).map(([k,v])=>[k,String(v??"")])):{},expanded:Boolean(n.expanded),children:visit(n.children,depth+1)}];});};return visit(value,0);
}
export function visibleTreeTableRows(items,expanded){const open=new Set(expanded),out=[];const visit=(nodes,depth)=>{for(const item of nodes){out.push({item,depth});if(open.has(item.id))visit(item.children||[],depth+1);}};visit(items,0);return out;}

// Search prunes unrelated branches, preserving matching ancestors.
const fold=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function filterTreeTableItems(items,query=""){
 const terms=fold(query).trim().split(/\s+/).filter(Boolean);
 if(!terms.length)return items;
 const visit=nodes=>nodes.flatMap(item=>{
   const children=visit(item.children||[]);
   const matches=terms.every(term=>fold([item.label,...Object.values(item.values||{})].join(" ")).includes(term));
   return matches||children.length?[{...item,children}]:[];
 });
 return visit(items);
}
export function sortTreeTableItems(items,key,direction="asc"){
 if(key==null)return items;
 const factor=direction==="desc"?-1:1,collator=new Intl.Collator(undefined,{numeric:true,sensitivity:"base"});
 const value=item=>key===""?item.label:item.values?.[key];
 const visit=nodes=>[...nodes].sort((a,b)=>{
   const av=value(a),bv=value(b);
   if(av==null||av==="")return bv==null||bv===""?0:1;
   if(bv==null||bv==="")return -1;
   return factor*collator.compare(String(av),String(bv));
 }).map(item=>({...item,children:visit(item.children||[])}));
 return visit(items);
}
const css=[
 ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
 ".frame{overflow:auto;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);max-height:var(--cu-tree-table-height,440px);}",
 "table{width:100%;border-collapse:collapse;text-align:start;}th,td{padding:9px 12px;border-bottom:1px solid var(--cu-border,#e5e5e5);text-align:start;white-space:nowrap;}thead th{background:var(--cu-surface-alt,#fafafa);position:sticky;top:0;z-index:1;font-weight:650;}",
 "tbody tr:hover{background:var(--cu-state-hover);}tbody tr[data-context=true]{background:var(--cu-state-active);}tbody tr:last-child td{border-bottom:0;}.node{display:flex;align-items:center;gap:5px;padding-inline-start:calc(var(--depth)*18px);}",
 "button,.space{width:24px;height:24px;display:grid;place-items:center;flex:none;}button{border:0;border-radius:5px;background:transparent;color:inherit;cursor:pointer;}button:hover:not(:disabled){background:var(--cu-state-hover);}button:disabled{cursor:default;opacity:.6;}",
 ".sort{width:auto;display:inline-flex;gap:5px;align-items:center;font:inherit;padding:0 4px;}tr:focus-visible{outline-offset:-2px;}.empty{text-align:center;padding:20px;color:var(--cu-text-muted,#616161);}.menu{position:fixed;width:0;height:0;}.summary{font-size:12px;padding:8px 12px;color:var(--cu-text-muted,#616161);}.more{width:auto;padding:4px 12px;margin:0 12px 8px;border:1px solid var(--cu-border,#e5e5e5);min-height:32px;font:inherit;}.more[hidden]{display:none!important;}",
 focusStyle
].join("");
const walk=(nodes,fn)=>{for(const n of nodes){fn(n);walk(n.children||[],fn);}};
export class CuTreeTable extends BrowserElement{
 static get observedAttributes(){return ["label","aria-label","empty-text","query","render-batch"];}
 constructor(){
  super();this._items=[];this._columns=[];this._expanded=new Set();this._sortKey=null;this._direction="asc";this._rowActions=[];this._limit=this.renderBatch;
  const root=mount(this,css,'<div class="frame"><table part="table"><thead></thead><tbody></tbody></table></div><div class="summary" role="status" tabindex="-1"></div><button class="more" type="button" hidden>Show more rows</button><cu-context-menu class="menu" aria-label="Tree table actions"></cu-context-menu>');
  this._table=root.querySelector("table");this._head=root.querySelector("thead");this._body=root.querySelector("tbody");this._summary=root.querySelector(".summary");this._menu=root.querySelector("cu-context-menu");this._more=root.querySelector(".more");
  this._more.addEventListener("click",()=>{this._limit+=this.renderBatch;this._render();if(this._more.hidden)this._summary.focus({preventScroll:true});});
  this._menu.addEventListener("cu-close",()=>this._clearContext());
  this._menu.addEventListener("cu-select",event=>{
   event.stopPropagation();const context=this._context,action=event.detail.value;if(!context)return;
   if(context.kind==="header"){if(action==="clear-sort")this.clearSort();else this.sortBy(context.key,action==="sort-desc"?"desc":"asc");}
   else{const item=normalizeTreeTableItems([context.item])[0];notify(this,"cu-row-action",{id:item.id,row:item,action,label:event.detail.label});}
  });
 }
 connectedCallback(){this._render();}attributeChangedCallback(name){if(name==="query"||name==="render-batch")this._limit=this.renderBatch;this._render();}
 get renderBatch(){const n=Number(this.getAttribute("render-batch"));return Number.isFinite(n)&&n>0?Math.max(25,Math.min(1000,Math.floor(n))):200;}
 get items(){return normalizeTreeTableItems(this._items);}
 set items(v){this._limit=this.renderBatch;const oldIds=new Set();walk(this._items,n=>oldIds.add(n.id));this._items=normalizeTreeTableItems(v);const next=new Set();walk(this._items,n=>{if(n.children.length&&(this._expanded.has(n.id)||(!oldIds.has(n.id)&&n.expanded)))next.add(n.id);});this._expanded=next;this._render();}
 get columns(){return this._columns.map(x=>({...x}));}
 set columns(v){const seen=new Set();this._columns=(Array.isArray(v)?v:[]).filter(x=>x&&typeof x.key==="string"&&x.key&&!seen.has(x.key)&&seen.add(x.key)).map(x=>({key:x.key,label:String(x.label??x.key),sortable:x.sortable!==false}));if(this._sortKey&& !this._columns.some(c=>c.key===this._sortKey&&c.sortable))this._sortKey=null;this._render();}
 get query(){return this.getAttribute("query")||"";}set query(v){this.setAttribute("query",String(v??""));}
 get rowActions(){return [...this._rowActions];}set rowActions(v){this._rowActions=Array.isArray(v)?v.filter(x=>x&&typeof x.value==="string"&&x.value).map(x=>({...x})):[];this._render();}
 get expandedValues(){return [...this._expanded];}
 set expandedValues(v){const requested=new Set(Array.isArray(v)?v:[]),next=new Set();walk(this._items,n=>{if(n.children.length&&requested.has(n.id))next.add(n.id);});this._expanded=next;this._render();}
 get sortKey(){return this._sortKey;}get sortDirection(){return this._direction;}
 sortBy(key,direction="asc"){if(!["asc","desc"].includes(direction)||key!==""&&!this._columns.some(c=>c.key===key&&c.sortable))return false;if(this._sortKey===key&&this._direction===direction)return false;this._sortKey=key;this._direction=direction;this._render();notify(this,"cu-sort",{key,direction});return true;}
 clearSort(){if(this._sortKey===null)return;this._sortKey=null;this._direction="asc";this._render();notify(this,"cu-sort",{key:null,direction:"asc"});}
 expandAll(){const next=new Set();walk(this._items,n=>{if(n.children.length)next.add(n.id);});this._expanded=next;this._render();notify(this,"cu-toggle",{expanded:true,values:this.expandedValues});}
 collapseAll(){this._expanded.clear();this._render();notify(this,"cu-toggle",{expanded:false,values:this.expandedValues});}
 toggle(id){if(this.query.trim())return false;const row=visibleTreeTableRows(this._items,this._expanded).find(r=>r.item.id===id);if(!row?.item.children.length)return false;const open=!this._expanded.has(id);if(open)this._expanded.add(id);else this._expanded.delete(id);this._render(id);notify(this,"cu-toggle",{id,expanded:open,values:this.expandedValues});return true;}
 _clearContext(){if(this._context?.element)delete this._context.element.dataset.context;this._context=null;}
 _bindMenu(element,context,actions,focusTarget=element){
  if(!actions.length)return;
  element.setAttribute("aria-haspopup","menu");element.setAttribute("aria-keyshortcuts","Shift+F10");
  const open=(x,y)=>{this._menu.hide();this._clearContext();this._context={...context,element};element.dataset.context="true";this._menu.items=actions;this._menu.showAt(x,y,focusTarget);};
  element.addEventListener("contextmenu",e=>{e.preventDefault();open(e.clientX,e.clientY);});
  element.addEventListener("keydown",e=>{if(e.defaultPrevented||e.key!=="ContextMenu"&&!(e.shiftKey&&e.key==="F10"))return;e.preventDefault();const r=element.getBoundingClientRect();open(r.left+12,r.bottom);});
 }
 _render(focusId){
  if(!this._table)return;
  const doc=this.ownerDocument,active=this.shadowRoot.activeElement,focusedRow=active?.closest("tr[data-id]")?.dataset.id,focusedHeader=active?.closest("th[data-key]")?.dataset.key,focusedToggle=active?.dataset?.id;
  this._menu.hide();this._clearContext();this._table.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Tree table");
  const head=doc.createElement("tr");
  for(const col of [{key:"",label:this.getAttribute("label")||"Name",sortable:true},...this._columns]){
   const th=doc.createElement("th");th.scope="col";th.dataset.key=col.key;
   if(col.sortable){const b=doc.createElement("button");b.className="sort";b.type="button";b.textContent=col.label;if(this._sortKey===col.key){th.setAttribute("aria-sort",this._direction==="asc"?"ascending":"descending");const icon=doc.createElement("cu-icon");icon.setAttribute("name","chevron-down");icon.setAttribute("size","14");if(this._direction==="asc")icon.style.transform="rotate(180deg)";b.append(icon);}b.addEventListener("click",()=>this.sortBy(col.key,this._sortKey===col.key&&this._direction==="asc"?"desc":"asc"));th.append(b);this._bindMenu(th,{kind:"header",key:col.key},[{value:"sort-asc",label:"Sort ascending"},{value:"sort-desc",label:"Sort descending"},{value:"clear-sort",label:"Clear sorting",disabled:this._sortKey===null}],b);}
   else th.textContent=col.label;
   head.append(th);
  }this._head.replaceChildren(head);
  const searching=Boolean(this.query.trim()),filtered=filterTreeTableItems(this._items,this.query),ordered=sortTreeTableItems(filtered,this._sortKey,this._direction),expanded=new Set(this._expanded);
  if(searching)walk(ordered,n=>{if(n.children.length)expanded.add(n.id);});
  const rows=visibleTreeTableRows(ordered,expanded),originals=new Map();walk(this._items,item=>originals.set(item.id,item));
  const shown=rows.slice(0,this._limit),fragment=doc.createDocumentFragment();for(const {item,depth} of shown){
   const tr=doc.createElement("tr"),cell=doc.createElement("td"),node=doc.createElement("div");tr.dataset.id=item.id;node.className="node";node.style.setProperty("--depth",String(depth));
   if(item.children.length){const b=doc.createElement("button");b.type="button";b.dataset.id=item.id;b.disabled=searching;b.setAttribute("aria-expanded",String(expanded.has(item.id)));b.setAttribute("aria-label",(expanded.has(item.id)?"Collapse ":"Expand ")+item.label);const icon=doc.createElement("cu-icon");icon.setAttribute("name",expanded.has(item.id)?"chevron-down":"chevron-right");icon.setAttribute("size","14");b.append(icon);b.addEventListener("click",()=>this.toggle(item.id));node.append(b);}
   else{const gap=doc.createElement("span");gap.className="space";node.append(gap);}
   const text=doc.createElement("span");text.textContent=item.label;node.append(text);cell.append(node);tr.append(cell);
   for(const col of this._columns){const td=doc.createElement("td");td.textContent=String(item.values[col.key]??"");tr.append(td);}
   const original=originals.get(item.id)??item;
   const actions=this._rowActions.map(a=>({value:a.value,label:String(a.label??a.value),disabled:typeof a.disabled==="function"?Boolean(a.disabled(normalizeTreeTableItems([original])[0])):Boolean(a.disabled)}));
   if(actions.length){tr.tabIndex=0;this._bindMenu(tr,{kind:"row",item:original},actions);}
   fragment.append(tr);
  }this._body.replaceChildren(fragment);
  if(!rows.length){const tr=doc.createElement("tr"),td=doc.createElement("td");td.colSpan=this._columns.length+1;td.className="empty";td.textContent=searching?"No matching rows":this.getAttribute("empty-text")||"No rows";tr.append(td);this._body.append(tr);}
  this._summary.textContent=shown.length+" of "+rows.length+" visible row"+(rows.length===1?"":"s")+(searching?" · filtered":"");
  this._more.hidden=shown.length>=rows.length;this._more.textContent="Show more ("+(rows.length-shown.length)+" remaining)";
  const target=focusId??focusedToggle;
  if(target)[...this._body.querySelectorAll("button:not(:disabled)")].find(b=>b.dataset.id===target)?.focus({preventScroll:true});
  else if(focusedRow)[...this._body.querySelectorAll("tr[tabindex]")].find(r=>r.dataset.id===focusedRow)?.focus({preventScroll:true});
  else if(focusedHeader!==undefined)[...this._head.querySelectorAll("th[data-key]")].find(h=>h.dataset.key===focusedHeader)?.querySelector("button")?.focus({preventScroll:true});
 }
}
define("cu-tree-table",CuTreeTable);
