import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeMenuGroups} from "./menu-bar.js";
import {normalizePaletteCommands} from "./command-palette.js";
import "./app-shell.js";
import "./sidebar.js";
import "./button.js";
export function normalizeApplicationSections(items){
  const seen=new Set();return (Array.isArray(items)?items:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id||seen.has(x.id))return [];
    seen.add(x.id);return [{id:x.id,label:String(x.label??x.id),disabled:Boolean(x.disabled)}];
  });
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.header{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.title{font-weight:650;}.header cu-menu-bar{flex:1;min-width:0;}.content{min-width:0;}.content ::slotted([hidden]){display:none!important;}";
export class CuApplicationShell extends BrowserElement{
  static get observedAttributes(){return ["active","label"];}
  constructor(){
    super();this._sections=[];
    const root=mount(this,css,'<cu-app-shell><div class="header" slot="header"><span class="title"></span><cu-menu-bar></cu-menu-bar><cu-button variant="outline" size="sm">Commands</cu-button></div><cu-sidebar slot="navigation" variant="plain" label="Sections"></cu-sidebar><div class="content"><slot></slot></div></cu-app-shell><cu-command-palette title="Application commands"></cu-command-palette>');
    this._shell=root.querySelector("cu-app-shell");this._sidebar=root.querySelector("cu-sidebar");this._menu=root.querySelector("cu-menu-bar");this._palette=root.querySelector("cu-command-palette");this._button=root.querySelector("cu-button");this._title=root.querySelector(".title");this._slot=root.querySelector("slot");
    this._sidebar.addEventListener("cu-change",e=>{e.stopPropagation();this.selectSection(e.detail.value);this._shell.closeNavigation(true);});
    this._menu.addEventListener("cu-action",e=>{e.stopPropagation();notify(this,"cu-action",{source:"menu",...e.detail});});
    this._palette.addEventListener("cu-select",e=>{e.stopPropagation();notify(this,"cu-action",{source:"palette",...e.detail});});
    for(const type of ["cu-open","cu-close"])this._palette.addEventListener(type,e=>e.stopPropagation());
    this._button.addEventListener("cu-press",e=>{e.stopPropagation();this.showCommands();});
    this._slot.addEventListener("slotchange",()=>this._sync());
    this.addEventListener("keydown",e=>{if(!e.defaultPrevented&&!e.isComposing&&!e.repeat&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="k"&&this._palette.commands.some(c=>!c.disabled)){e.preventDefault();if(this._palette.open)this._palette.close("shortcut");else this.showCommands();}});
  }
  connectedCallback(){this._renderSections();this._sync();}attributeChangedCallback(){this._sync();}
  get sections(){return this._sections.map(x=>({...x}));}set sections(v){this._sections=normalizeApplicationSections(v);this._renderSections();this._sync();}
  get groups(){return this._menu.groups;}set groups(v){this._menu.groups=normalizeMenuGroups(v);}
  get commands(){return this._palette.commands;}set commands(v){this._palette.commands=normalizePaletteCommands(v);this._sync();}
  get active(){const id=this.getAttribute("active");return this._sections.find(x=>x.id===id&&!x.disabled)?.id??this._sections.find(x=>!x.disabled)?.id??"";}set active(v){this.setAttribute("active",String(v??""));}
  selectSection(id){if(!this._sections.some(x=>x.id===id&&!x.disabled))return false;if(this.active!==id){this.active=id;notify(this,"cu-change",{value:id});}return true;}
  showCommands(){return this._palette.commands.some(c=>!c.disabled)&&this._palette.show();}
  _renderSections(){if(!this._sidebar)return;const doc=this.ownerDocument;this._sidebar.replaceChildren(...this._sections.map(x=>{const b=doc.createElement("button");b.type="button";b.dataset.value=x.id;b.textContent=x.label;b.disabled=x.disabled;return b;}));this._sidebar.value=this.active;}
  _sync(){if(!this._sidebar)return;this._sidebar.value=this.active;this._shell.withoutNavigation=!this._sections.length;this._title.textContent=this.getAttribute("label")||"Application";this._button.disabled=!this._palette.commands.some(c=>!c.disabled);for(const panel of this._slot.assignedElements())if(panel.hasAttribute("data-section"))panel.hidden=panel.getAttribute("data-section")!==this.active;}
}
define("cu-application-shell",CuApplicationShell);
