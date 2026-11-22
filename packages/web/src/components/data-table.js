
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";
import "./context-menu.js";

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
  ".row-menu{position:fixed;width:0;height:0;}",
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
      '</table></div><div class="footer" part="footer"><span class="summary"></span>' +
      '<div class="pages"><button type="button" class="prev" aria-label="Previous page"><cu-icon name="chevron-right" size="16"></cu-icon></button>' +
      '<span class="current"></span><button type="button" class="next" aria-label="Next page"><cu-icon name="chevron-right" size="16"></cu-icon></button>' +
      '</div></div></div><cu-context-menu class="row-menu" aria-label="Row actions"></cu-context-menu>');
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
    this._rows=[];
    this._columns=[];
    this._page=1;
    this._sortKey="";
    this._direction="asc";
    this._selected=new Set();
    this._rowActions=[];
    this._contextRow=null;
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
    this._prev.addEventListener("click",()=>this._setPage(this._page-1));
    this._next.addEventListener("click",()=>this._setPage(this._page+1));
  }
  connectedCallback(){this._render();}
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
  get page(){return this._page;}
  set page(value){this._setPage(value);}
  get sortKey(){return this._sortKey;}
  get sortDirection(){return this._direction;}
  get selectedIds(){return [...this._selected];}
  clearSelection(){this._selected.clear();this._render();this._notifySelection();}
  _rowId(row,index){return String(row?.id ?? this._rows.indexOf(row) ?? index);}
  _pageSize(){return Math.max(1,Math.min(100,Math.floor(Number(this.getAttribute("page-size"))||5)));}
  _setPage(value){
    const sorted=sortTableRows(this._rows,this._sortKey,this._direction);
    const next=paginateRows(sorted,value,this._pageSize()).page;
    if(next===this._page)return;
    this._page=next;this._render();
    notify(this,"cu-page-change",{page:this._page});
  }
  _sort(key){
    if(this._sortKey===key)this._direction=this._direction==="asc"?"desc":"asc";
    else{this._sortKey=key;this._direction="asc";}
    this._page=1;this._render();
    notify(this,"cu-sort",{key,direction:this._direction});
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
    this._clearContextRow();
    this._contextRow={row,id,element};
    element.dataset.context="true";
    this._menu.setAttribute("aria-label","Actions for row "+id);
    this._menu.items=actions;
    this._menu.showAt(x,y,element);
  }
  _makeCell(text,tag="td"){
    const cell=document.createElement(tag);
    cell.textContent=String(text??"");
    return cell;
  }
  _render(){
    if(!this._table)return;
    this._menu.hide();
    this._clearContextRow();
    this._caption.textContent=this.getAttribute("caption")||"";
    this._table.setAttribute("aria-label",this.getAttribute("aria-label")||
      this._caption.textContent||"Data table");
    const columns=this._columns;
    this._head.replaceChildren();
    const header=document.createElement("tr");
    if(this.hasAttribute("selectable")){
      const h=this._makeCell("","th");h.scope="col";
      h.textContent="Select";header.append(h);
    }
    for(const column of columns){
      const h=document.createElement("th");h.scope="col";
      if(column.sortable!==false){
        const b=document.createElement("button");b.type="button";
        b.textContent=String(column.label??column.key);
        b.addEventListener("click",()=>this._sort(column.key));
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
      header.append(h);
    }
    this._head.append(header);
    this._body.replaceChildren();
    const busy=this.hasAttribute("loading");
    this._table.setAttribute("aria-busy",String(busy));
    const sorted=sortTableRows(this._rows,this._sortKey,this._direction);
    const page=paginateRows(sorted,this._page,this._pageSize());
    this._page=page.page;
    if(busy || !columns.length || !page.rows.length){
      const tr=document.createElement("tr"),td=this._makeCell(
        busy?"Loading…":this.getAttribute("empty-text")||"No records","td");
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
    this._summary.textContent=busy?"Loading rows":page.total+" row"+(page.total===1?"":"s");
    this._current.textContent=page.page+" / "+page.totalPages;
    this._prev.disabled=busy||page.page<=1;
    this._next.disabled=busy||page.page>=page.totalPages;
    this._footer.hidden=busy||!this._rows.length;
  }
}
define("cu-data-table",CuDataTable);
