import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";
import "./settings-group.js";
import "./settings-item.js";

/** Only declarative metadata is searched; never search users' control values. */
export function matchesSettingsQuery(record,query){
  const term=String(query??"").trim().toLocaleLowerCase();
  if(!term)return true;
  return ["label","description","keywords"].some(key=>
    String(record?.[key]??"").toLocaleLowerCase().includes(term));
}

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".page{display:grid;gap:20px;min-width:0;}",
  ".top{display:flex;align-items:start;justify-content:space-between;gap:20px;}",
  ".heading{display:grid;gap:7px;min-width:0;}",
  "h2{margin:0;font:700 clamp(22px,3vw,28px)/1.22 var(--cu-font-body,system-ui);letter-spacing:-.025em;}",
  ".description{margin:0;color:var(--cu-text-muted,#616161);font:400 13px/1.6 var(--cu-font-body,system-ui);}",
  ".description:empty{display:none;}",
  ".actions{flex:none;}",
  ".search{display:flex;align-items:center;gap:9px;min-height:var(--cu-control-height,40px);",
  "padding:0 12px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-bottom-width:2px;border-radius:var(--cu-radius-md,6px);",
  "background:var(--cu-surface,#fff);color:var(--cu-text-muted,#616161);}",
  ".search:focus-within{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;",
  "border-bottom-color:var(--cu-accent,#0067c0);}",
  ".search[hidden]{display:none!important;}",
  ".search input{flex:1;min-width:0;outline:0;border:0;background:transparent;color:var(--cu-text,#242424);",
  "font:400 13px var(--cu-font-body,system-ui);}",
  ".search input::placeholder{color:var(--cu-text-muted,#616161);}",
  ".groups{display:grid;gap:16px;min-width:0;}",
  ".empty{padding:24px;text-align:center;color:var(--cu-text-muted,#616161);",
  "border:1px dashed var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);",
  "font:400 13px/1.5 var(--cu-font-body,system-ui);}",
  ".empty[hidden]{display:none!important;}",
  "@media(max-width:560px){.top{flex-wrap:wrap;}.actions{width:100%;}}",
  "@media(forced-colors:active){.search{border-color:CanvasText;}}",
  focusStyle
].join("");

export class CuSettingsPage extends BrowserElement{
  static get observedAttributes(){return ["label","description","searchable","placeholder"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<section class="page" part="page" aria-label="Settings">' +
      '<div class="top" part="header"><div class="heading">' +
      '<h2 part="title"></h2><p class="description" part="description"></p></div>' +
      '<div class="actions" part="actions"><slot name="actions"></slot></div></div>' +
      '<label class="search" part="search"><cu-icon name="search" size="18"></cu-icon>' +
      '<input type="search" placeholder="Find settings" aria-label="Search settings"></label>' +
      '<div class="groups" part="groups"><slot></slot></div>' +
      '<div class="empty" part="empty" role="status" hidden>No matching settings.</div></section>');
    this._page=root.querySelector(".page");
    this._title=root.querySelector("h2");
    this._description=root.querySelector(".description");
    this._searchBox=root.querySelector(".search");
    this._search=root.querySelector("input");
    this._groupsSlot=root.querySelector(".groups slot");
    this._empty=root.querySelector(".empty");
    this._observer=null;
    this._search.addEventListener("input",()=>this._filter(true));
    this._search.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&this._search.value){
        event.preventDefault();this.query="";this._search.focus();
      }
    });
    this._groupsSlot.addEventListener("slotchange",()=>this._filter());
  }
  connectedCallback(){
    this._sync();
    if(typeof MutationObserver!=="undefined"&&!this._observer){
      this._observer=new MutationObserver(records=>{
        if(records.some(record=>record.type==="childList"||
          ["label","description","keywords"].includes(record.attributeName)))
          this._filter();
      });
      this._observer.observe(this,{subtree:true,childList:true,attributes:true,
        attributeFilter:["label","description","keywords"]});
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(){this._sync();}
  get query(){return this._search.value;}
  set query(value){this._search.value=String(value??"");this._filter(true);}
  get searchable(){return this.hasAttribute("searchable");}
  set searchable(value){this.toggleAttribute("searchable",Boolean(value));}
  clearSearch(){this.query="";}
  _groups(){return this._groupsSlot.assignedElements({flatten:true})
    .filter(el=>el.localName==="cu-settings-group");}
  _filter(emit=false){
    if(!this._search)return;
    const groups=this._groups();
    const term=this.searchable?this.query.trim():"";
    let visible=0,total=0,visibleGroups=0;
    for(const group of groups){
      const headingMatches=matchesSettingsQuery({
        label:group.getAttribute("label"),description:group.getAttribute("description"),
        keywords:group.getAttribute("keywords")
      },term);
      const items=[...group.children].filter(el=>el.localName==="cu-settings-item");
      let inGroup=0;
      for(const item of items){
        total++;
        const show=!term||headingMatches||matchesSettingsQuery({
          label:item.getAttribute("label"),description:item.getAttribute("description"),
          keywords:item.getAttribute("keywords")
        },term);
        item.toggleAttribute("data-cu-filter-hidden",!show);
        if(show){visible++;inGroup++;}
      }
      const showGroup=!term||headingMatches||inGroup>0;
      group.toggleAttribute("data-cu-filter-hidden",!showGroup);
      if(showGroup)visibleGroups++;
    }
    this._empty.hidden=!term||visibleGroups>0;
    if(emit)notify(this,"cu-filter",{query:this.query,visible,total,groups:visibleGroups});
  }
  _sync(){
    if(!this._page)return;
    this._title.textContent=this.getAttribute("label")??"Settings";
    this._description.textContent=this.getAttribute("description")??"";
    this._page.setAttribute("aria-label",this._title.textContent);
    this._searchBox.hidden=!this.searchable;
    this._search.placeholder=this.getAttribute("placeholder")??"Find settings";
    this._filter();
  }
}
define("cu-settings-page",CuSettingsPage);
