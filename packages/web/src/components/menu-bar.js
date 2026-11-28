import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeCommands} from "./command-bar.js";
import "./menu-button.js";
export function normalizeMenuGroups(groups){
  const seen=new Set();
  return (Array.isArray(groups)?groups:[]).flatMap(g=>{
    if(!g||typeof g.id!=="string"||!g.id||seen.has(g.id))return [];
    seen.add(g.id);return [{id:g.id,label:String(g.label??g.id),disabled:Boolean(g.disabled),items:normalizeCommands(g.items)}];
  });
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.bar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:4px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);}";
export class CuMenuBar extends BrowserElement{
  static get observedAttributes(){return ["disabled","label"];}
  constructor(){
    super();this._groups=[];
    const root=mount(this,css,'<div class="bar" role="group" aria-label="Application menu"></div>');
    this._bar=root.querySelector(".bar");
    this._bar.addEventListener("cu-open",e=>{e.stopPropagation();for(const menu of this._bar.children)if(menu!==e.target&&menu.open)menu.hide();});
    this._bar.addEventListener("cu-close",e=>e.stopPropagation());
    this._bar.addEventListener("cu-select",e=>{e.stopPropagation();if(this.disabled)return;const group=this._groups.find(g=>g.id===e.target.dataset.group);const item=group?.items.find(x=>x.value===e.detail.value);if(group&&!group.disabled&&item&&!item.disabled)notify(this,"cu-action",{group:group.id,value:item.value,label:item.label});});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get groups(){return this._groups.map(g=>({...g,items:g.items.map(i=>({...i}))}));}
  set groups(v){this._groups=normalizeMenuGroups(v);this._render();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _render(){
    if(!this._bar)return;
    this._bar.setAttribute("aria-label",this.getAttribute("label")||"Application menu");
    const doc=this.ownerDocument;
    this._bar.replaceChildren(...this._groups.map(g=>{
      const menu=doc.createElement("cu-menu-button");menu.dataset.group=g.id;menu.setAttribute("label",g.label);menu.setAttribute("aria-label",g.label);menu.disabled=this.disabled||g.disabled||!g.items.some(i=>!i.disabled);
      for(const item of g.items){const el=doc.createElement("cu-menu-item");el.setAttribute("value",item.value);el.setAttribute("label",item.label);el.toggleAttribute("disabled",item.disabled);menu.append(el);}
      return menu;
    }));
  }
}
define("cu-menu-bar",CuMenuBar);
