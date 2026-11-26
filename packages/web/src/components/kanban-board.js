import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
export function normalizeKanbanLanes(value){
  const seen=new Set();return (Array.isArray(value)?value:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id.trim()||seen.has(x.id))return [];
    seen.add(x.id);return [{id:x.id,label:String(x.label??x.id)}];
  });
}
export function normalizeKanbanItems(value,lanes){
  const ids=new Set(),allowed=new Set(lanes.map(x=>x.id));
  return (Array.isArray(value)?value:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id.trim()||ids.has(x.id)||!allowed.has(x.laneId)||typeof x.title!=="string"||!x.title.trim())return [];
    ids.add(x.id);return [{id:x.id,laneId:x.laneId,title:x.title.trim(),description:String(x.description??""),tag:String(x.tag??""),disabled:Boolean(x.disabled)}];
  });
}
export function moveKanbanItem(items,id,laneId,beforeId=null){
  const item=items.find(x=>x.id===id);
  if(!item||item.disabled||beforeId===id||typeof laneId!=="string"||!laneId)return items;
  if(beforeId!==null&&!items.some(x=>x.id===beforeId&&x.laneId===laneId))return items;
  const next=items.filter(x=>x.id!==id),moved={...item,laneId};
  const index=beforeId===null?next.reduce((last,x,i)=>x.laneId===laneId?i+1:last,0):next.findIndex(x=>x.id===beforeId);
  next.splice(beforeId===null&&index===0?next.length:index,0,moved);
  const oldLane=items.filter(x=>x.laneId===laneId).map(x=>x.id);
  const newLane=next.filter(x=>x.laneId===laneId).map(x=>x.id);
  return item.laneId===laneId&&oldLane.length===newLane.length&&oldLane.every((value,index)=>value===newLane[index])?items:next;
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".board{display:flex;gap:12px;overflow-x:auto;overscroll-behavior-inline:contain;padding:2px 2px 8px;align-items:stretch;}.lane{box-sizing:border-box;flex:1 0 var(--cu-kanban-lane-width,230px);min-width:0;display:flex;flex-direction:column;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface-alt,#fafafa);}.lane[data-drop=true]{outline:2px solid var(--cu-accent,#0067c0);outline-offset:-2px;}",
  ".heading{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;font-weight:650;overflow-wrap:anywhere;}.count{font-size:12px;color:var(--cu-text-muted,#616161);font-variant-numeric:tabular-nums;}.cards{display:grid;align-content:start;gap:8px;padding:0 8px 10px;min-height:80px;flex:1;}.card{display:grid;gap:7px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);padding:11px;background:var(--cu-surface,#fff);min-width:0;overflow-wrap:anywhere;}.card[draggable=true]{cursor:grab;}.card[data-dragging=true]{opacity:.5;}.card[data-before=true]{box-shadow:0 -3px var(--cu-accent,#0067c0);}.card-title{font-weight:650;}.description,.tag,.empty{font-size:12px;color:var(--cu-text-muted,#616161);line-height:1.5;}.tag{justify-self:start;padding:2px 6px;background:var(--cu-state-hover);border-radius:4px;}.empty{padding:8px;}",
  ".actions{display:flex;align-items:center;gap:4px;flex-wrap:wrap;}.actions button,.actions select{box-sizing:border-box;min-height:28px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:5px;color:inherit;background:var(--cu-surface,#fff);font:12px var(--cu-font-body,system-ui);}.actions button{display:grid;place-items:center;min-width:28px;cursor:pointer;}.actions select{flex:1;min-width:85px;padding:3px;}.actions button:hover:not(:disabled){background:var(--cu-state-hover);}.actions :disabled{opacity:.5;cursor:default;}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}",
  "@media(forced-colors:active){.card[data-before=true]{outline:2px solid Highlight;}}",focusStyle
].join("");
export class CuKanbanBoard extends BrowserElement{
  static get observedAttributes(){return ["readonly","label","aria-label","empty-text"];}
  constructor(){
    super();this._lanes=[];this._source=[];this._items=[];
    const root=mount(this,css,'<section role="region" part="frame"><div class="board" part="board"></div><span class="sr" role="status" aria-live="polite"></span></section>');
    this._frame=root.querySelector("section");this._board=root.querySelector(".board");this._status=root.querySelector(".sr");
    this._board.addEventListener("dragover",e=>{
      if(!this._dragId||this.readonly)return;
      const lane=e.target.closest(".lane");if(!lane)return;e.preventDefault();
      if(e.dataTransfer)e.dataTransfer.dropEffect="move";
      this._clearDrop();lane.dataset.drop="true";
      const card=e.target.closest(".card");if(card&&card.dataset.id!==this._dragId)card.dataset.before="true";
    });
    this._board.addEventListener("dragleave",e=>{if(!e.relatedTarget||!this._board.contains(e.relatedTarget))this._clearDrop();});
    this._board.addEventListener("drop",e=>{
      if(!this._dragId||this.readonly)return;
      const lane=e.target.closest(".lane");if(!lane)return;e.preventDefault();
      const card=e.target.closest(".card"),id=this._dragId;this._endDrag();
      this.moveItem(id,lane.dataset.lane,card?.dataset.id??null);
    });
  }
  connectedCallback(){this._render();}
  disconnectedCallback(){this._endDrag();}
  attributeChangedCallback(){if(this.readonly)this._endDrag();this._render();}
  get lanes(){return this._lanes.map(x=>({...x}));}
  set lanes(v){this._lanes=normalizeKanbanLanes(v);this._items=normalizeKanbanItems(this._source,this._lanes);this._render();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._source=Array.isArray(v)?v.map(x=>x&&typeof x==="object"?{...x}:x):[];this._items=normalizeKanbanItems(this._source,this._lanes);this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  moveItem(id,laneId,beforeId=null){
    if(this.readonly||!this._lanes.some(x=>x.id===laneId))return false;
    const item=this._items.find(x=>x.id===id),next=moveKanbanItem(this._items,id,laneId,beforeId);
    if(!item||next===this._items)return false;
    this._items=next;this._source=next.map(x=>({...x}));this._render();
    const moved=next.find(x=>x.id===id);this._status.textContent=moved.title+" moved to "+this._lanes.find(x=>x.id===laneId).label;
    notify(this,"cu-move",{id,laneId,previousLaneId:item.laneId,beforeId,item:{...moved}});return true;
  }
  _clearDrop(){for(const n of this._board?.querySelectorAll("[data-drop],[data-before]")??[]){delete n.dataset.drop;delete n.dataset.before;}}
  _endDrag(){this._dragId=null;this._clearDrop();for(const n of this._board?.querySelectorAll("[data-dragging]")??[])delete n.dataset.dragging;}
  _render(){
    if(!this._board)return;this._endDrag();
    const doc=this.ownerDocument,active=this.shadowRoot.activeElement,focusId=active?.closest(".card")?.dataset.id,focusKind=active?.dataset.control;
    this._frame.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Kanban board");
    this._board.replaceChildren(...this._lanes.map(lane=>{
      const section=doc.createElement("section");section.className="lane";section.dataset.lane=lane.id;section.setAttribute("aria-label",lane.label);
      const heading=doc.createElement("div");heading.className="heading";heading.textContent=lane.label;
      const items=this._items.filter(x=>x.laneId===lane.id),count=doc.createElement("span");count.className="count";count.textContent=String(items.length);heading.append(count);
      const list=doc.createElement("div");list.className="cards";list.setAttribute("role","list");
      if(!items.length){const empty=doc.createElement("div");empty.className="empty";empty.textContent=this.getAttribute("empty-text")||"No tasks";list.append(empty);}
      items.forEach((item,i)=>{
        const card=doc.createElement("article");card.className="card";card.dataset.id=item.id;card.setAttribute("role","listitem");card.draggable=!this.readonly&&!item.disabled;
        const title=doc.createElement("span");title.className="card-title";title.textContent=item.title;card.append(title);
        for(const [value,cls] of [[item.description,"description"],[item.tag,"tag"]])if(value){const n=doc.createElement("span");n.className=cls;n.textContent=value;card.append(n);}
        if(card.draggable){
          card.addEventListener("dragstart",e=>{this._dragId=item.id;card.dataset.dragging="true";if(e.dataTransfer){e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",item.id);}});
          card.addEventListener("dragend",()=>this._endDrag());
          const actions=doc.createElement("div");actions.className="actions";
          const select=doc.createElement("select");select.dataset.control="lane";select.draggable=false;select.setAttribute("aria-label","Move "+item.title+" to lane");
          for(const target of this._lanes){const o=doc.createElement("option");o.value=target.id;o.textContent=target.label;select.append(o);}select.value=lane.id;
          select.addEventListener("change",()=>this.moveItem(item.id,select.value));actions.append(select);
          for(const [kind,delta] of [["up",-1],["down",1]]){
            const button=doc.createElement("button");button.type="button";button.dataset.control=kind;button.disabled=i+delta<0||i+delta>=items.length;button.setAttribute("aria-label","Move "+item.title+" "+kind);
            const icon=doc.createElement("cu-icon");icon.setAttribute("name","chevron-down");icon.setAttribute("size","14");icon.setAttribute("aria-hidden","true");if(kind==="up")icon.style.transform="rotate(180deg)";button.append(icon);
            button.addEventListener("click",()=>this.moveItem(item.id,lane.id,delta<0?items[i-1].id:items[i+2]?.id??null));actions.append(button);
          }
          card.append(actions);
        }
        list.append(card);
      });section.append(heading,list);return section;
    }));
    if(focusId){const card=[...this._board.querySelectorAll(".card")].find(n=>n.dataset.id===focusId);const controls=[...card?.querySelectorAll("[data-control]:not(:disabled)")??[]];(controls.find(n=>n.dataset.control===focusKind)||controls[0])?.focus({preventScroll:true});}
  }
}
define("cu-kanban-board",CuKanbanBoard);
