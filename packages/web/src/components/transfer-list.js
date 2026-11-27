import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./listbox.js";
import "./search-box.js";
import "./button.js";
export function normalizeTransferItems(items){
  const seen=new Set(),result=[];
  for(const x of Array.isArray(items)?items:[]){
    if(!x||typeof x.value!=="string"||!x.value||seen.has(x.value))continue;
    seen.add(x.value);result.push({value:x.value,label:String(x.label??x.value),disabled:Boolean(x.disabled)});
  }
  return result;
}
export function transferValues(items,values,move,direction){
  const selected=new Set(values),allowed=new Set(items.filter(x=>!x.disabled).map(x=>x.value));
  for(const value of move)if(allowed.has(value)){if(direction==="add")selected.add(value);else if(direction==="remove")selected.delete(value);}
  return items.filter(x=>selected.has(x.value)).map(x=>x.value);
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.layout{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:var(--cu-space-3,12px);align-items:center;}.column{display:grid;gap:8px;min-width:0;}.actions{display:grid;gap:6px;}cu-listbox{min-width:0;}cu-listbox::part(list){min-height:160px;}.count{color:var(--cu-text-muted,#616161);font-size:12px;}@media(max-width:540px){.layout{grid-template-columns:1fr;}.actions{display:flex;flex-wrap:wrap;}}";
export class CuTransferList extends BrowserElement{
  static get observedAttributes(){return ["disabled"];}
  constructor(){
    super();this._items=[];this._value=[];this._query={available:"",chosen:""};this._selection={available:"",chosen:""};
    const root=mount(this,css,'<section class="layout" aria-label="Transfer list"><div class="column"><cu-search-box data-side="available" aria-label="Search available items" placeholder="Search available"></cu-search-box><cu-listbox data-side="available" label="Available"></cu-listbox><span class="count" data-count="available"></span></div><div class="actions"><cu-button size="sm" variant="outline" data-action="add">Add →</cu-button><cu-button size="sm" variant="outline" data-action="remove">← Remove</cu-button><cu-button size="sm" variant="subtle" data-action="add-all">Add filtered</cu-button><cu-button size="sm" variant="subtle" data-action="remove-all">Remove filtered</cu-button></div><div class="column"><cu-search-box data-side="chosen" aria-label="Search selected items" placeholder="Search selected"></cu-search-box><cu-listbox data-side="chosen" label="Selected"></cu-listbox><span class="count" data-count="chosen"></span></div></section>');
    this._root=root;
    for(const side of ["available","chosen"]){
      const search=root.querySelector('cu-search-box[data-side="'+side+'"]'),list=root.querySelector('cu-listbox[data-side="'+side+'"]');
      search.addEventListener("cu-input",e=>{e.stopPropagation();this._query[side]=e.detail.value;this._selection[side]="";this._render();});
      for(const type of ["cu-change","cu-search"])search.addEventListener(type,e=>e.stopPropagation());
      list.addEventListener("cu-input",e=>e.stopPropagation());
      list.addEventListener("cu-change",e=>{e.stopPropagation();this._selection[side]=e.detail.value;this._syncActions();});
    }
    root.querySelector(".actions").addEventListener("cu-press",e=>{e.stopPropagation();const action=e.target.dataset.action;if(action)this.move(action);});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get items(){return this._items.map(x=>({...x}));}set items(v){this._items=normalizeTransferItems(v);this._render();}
  get value(){return [...this._value];}set value(v){this._value=[...new Set((Array.isArray(v)?v:[]).filter(x=>typeof x==="string"))];this._render();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _side(side){const selected=new Set(this._value),query=this._query[side].trim().toLowerCase();return this._items.filter(x=>selected.has(x.value)===(side==="chosen")&&x.label.toLowerCase().includes(query));}
  move(action){
    if(this.disabled||!["add","remove","add-all","remove-all"].includes(action))return false;
    const adding=action.startsWith("add"),side=adding?"available":"chosen";
    const move=this._side(side).filter(x=>!x.disabled&&(action.endsWith("-all")||x.value===this._selection[side])).map(x=>x.value);
    if(!move.length)return false;
    this._value=transferValues(this._items,this._value,move,adding?"add":"remove");
    this._selection={available:"",chosen:""};this._render();notify(this,"cu-change",{value:this.value});return true;
  }
  _syncActions(){
    if(!this._root)return;
    for(const button of this._root.querySelectorAll("cu-button")){
      const a=button.dataset.action,side=a.startsWith("add")?"available":"chosen";
      button.disabled=this.disabled||!this._side(side).some(x=>!x.disabled&&(a.endsWith("-all")||x.value===this._selection[side]));
    }
  }
  _render(){
    if(!this._root)return;
    for(const side of ["available","chosen"]){
      const search=this._root.querySelector('cu-search-box[data-side="'+side+'"]'),list=this._root.querySelector('cu-listbox[data-side="'+side+'"]'),rows=this._side(side);
      if(!rows.some(x=>x.value===this._selection[side]&&!x.disabled))this._selection[side]="";
      list.disabled=search.disabled=this.disabled;
      list.replaceChildren(...rows.map(x=>{const el=this.ownerDocument.createElement("cu-list-option");el.setAttribute("value",x.value);el.setAttribute("label",x.label);el.toggleAttribute("disabled",x.disabled);return el;}));
      if(!this._selection[side])list.value="";
      this._root.querySelector('[data-count="'+side+'"]').textContent=rows.length+" item"+(rows.length===1?"":"s");
    }
    this._syncActions();
  }
}
define("cu-transfer-list",CuTransferList);
