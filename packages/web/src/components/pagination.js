import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

function nonNegativeInt(value,fallback){
  if(value===null||value===undefined||value==="")return fallback;
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,Math.floor(n)):fallback;
}

export function normalizePagination(page,total,pageSize=10){
  const count=nonNegativeInt(total,0);
  const size=Math.max(1,nonNegativeInt(pageSize,10));
  const pageCount=Math.max(1,Math.ceil(count/size));
  const current=Math.max(1,Math.min(pageCount,nonNegativeInt(page,1)||1));
  return {page:current,pageCount,total:count,pageSize:size,
    start:count?(current-1)*size+1:0,end:Math.min(count,current*size)};
}

export function paginationItems(page,pageCount,siblings=1){
  const total=Math.max(1,nonNegativeInt(pageCount,1));
  const current=Math.max(1,Math.min(total,nonNegativeInt(page,1)||1));
  const visible=new Set([1,total]);
  const span=Math.min(3,nonNegativeInt(siblings,1));
  for(let i=Math.max(1,current-span);i<=Math.min(total,current+span);i++)visible.add(i);
  // Avoid isolated ellipses in place of just one missing page.
  const sorted=[...visible].sort((a,b)=>a-b);
  for(let i=1;i<sorted.length;i++){
    if(sorted[i]-sorted[i-1]===2)visible.add(sorted[i]-1);
  }
  const indices=[...visible].sort((a,b)=>a-b);
  const output=[];
  for(let i=0;i<indices.length;i++){
    if(i>0&&indices[i]-indices[i-1]>1)output.push("ellipsis");
    output.push(indices[i]);
  }
  return output;
}

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0;}",
  ".pages{display:flex;align-items:center;gap:3px;min-width:0;}",
  "button{box-sizing:border-box;display:inline-grid;place-items:center;min-width:34px;",
  "min-height:34px;padding:4px 9px;border:1px solid transparent;",
  "border-radius:var(--cu-radius-md,6px);background:transparent;color:inherit;",
  "cursor:pointer;font:600 13px var(--cu-font-body,system-ui);}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 9%,var(--cu-surface,#fff));}",
  "button[aria-current=page]{background:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,var(--cu-surface,#fff));",
  "color:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);}",
  "button:disabled{opacity:.38;cursor:not-allowed;}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".ellipsis{display:grid;place-items:center;min-width:20px;color:var(--cu-text-muted,#616161);}",
  ".summary{margin-inline-start:auto;font-size:12px;color:var(--cu-text-muted,#616161);white-space:nowrap;}",
  ":host([size=sm]) button{min-width:28px;min-height:28px;padding:3px 6px;}",
  "@media(max-width:480px){.nav{gap:4px;}.pages{gap:1px;}.summary{width:100%;margin:0;}}",
  "@media(forced-colors:active){button[aria-current=page]{border-color:Highlight;color:Highlight;}",
  "button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuPagination extends BrowserElement {
  static get observedAttributes(){return ["page","page-size","total","siblings","label","aria-label","size"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<nav class="nav" part="nav" aria-label="Pagination">' +
      '<button type="button" class="previous" part="previous" aria-label="Previous page">' +
      '<cu-icon name="chevron-left" size="16" aria-hidden="true"></cu-icon></button>' +
      '<span class="pages" part="pages"></span>' +
      '<button type="button" class="next" part="next" aria-label="Next page">' +
      '<cu-icon name="chevron-right" size="16" aria-hidden="true"></cu-icon></button>' +
      '<span class="summary" part="summary"></span></nav>');
    this._nav=root.querySelector("nav");
    this._previous=root.querySelector(".previous");
    this._next=root.querySelector(".next");
    this._pages=root.querySelector(".pages");
    this._summary=root.querySelector(".summary");
    this._previous.addEventListener("click",()=>this.previous());
    this._next.addEventListener("click",()=>this.next());
    this._pages.addEventListener("click",event=>{
      const button=event.target.closest("button[data-page]");
      if(button){
        const target=Number(button.dataset.page);
        if(this.goTo(target))this._pages.querySelector(`button[data-page="${target}"]`)?.focus();
      }
    });
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get total(){return this._state().total;}
  set total(v){this.setAttribute("total",String(v));}
  get pageSize(){return this._state().pageSize;}
  set pageSize(v){this.setAttribute("page-size",String(v));}
  get page(){return this._state().page;}
  set page(v){this.setAttribute("page",String(v));}
  get pageCount(){return this._state().pageCount;}
  _state(){return normalizePagination(this.getAttribute("page"),
    this.getAttribute("total"),this.getAttribute("page-size"));}
  goTo(input){
    const state=this._state(),target=Number(input);
    if(!Number.isInteger(target)||target<1||target>state.pageCount||
      target===state.page||state.total===0)return false;
    this.page=target;
    notify(this,"cu-page-change",this._state());
    return true;
  }
  next(){return this.goTo(this.page+1);}
  previous(){return this.goTo(this.page-1);}
  _render(){
    if(!this._pages)return;
    const state=this._state();
    this._nav.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Pagination");
    this._previous.disabled=state.total===0||state.page<=1;
    this._next.disabled=state.total===0||state.page>=state.pageCount;
    this._pages.replaceChildren();
    const items=paginationItems(state.page,state.pageCount,this.getAttribute("siblings"));
    for(const item of items){
      if(item==="ellipsis"){
        const span=document.createElement("span");
        span.className="ellipsis";span.textContent="…";
        span.setAttribute("aria-hidden","true");this._pages.append(span);
        continue;
      }
      const button=document.createElement("button");
      button.type="button";button.dataset.page=String(item);
      button.textContent=String(item);
      button.disabled=state.total===0;
      button.setAttribute("aria-label","Page "+item);
      if(item===state.page)button.setAttribute("aria-current","page");
      this._pages.append(button);
    }
    this._summary.textContent=state.start+"–"+state.end+" of "+state.total;
  }
}
define("cu-pagination",CuPagination);
