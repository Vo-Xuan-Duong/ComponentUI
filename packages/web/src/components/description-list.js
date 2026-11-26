import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
export function normalizeDescriptionItems(value){return (Array.isArray(value)?value:[]).filter(x=>x&&typeof x.label==="string"&&x.label.trim()).map(x=>({label:x.label.trim(),value:String(x.value??"")}));}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}dl{margin:0;display:grid;gap:0;}.pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:12px;padding:10px 0;border-bottom:1px solid var(--cu-border,#e5e5e5);}.pair:last-child{border-bottom:0;}dt{color:var(--cu-text-muted,#616161);overflow-wrap:anywhere;}dd{margin:0;font-weight:550;overflow-wrap:anywhere;}:host([orientation=vertical]) .pair{grid-template-columns:1fr;gap:4px;}";
export class CuDescriptionList extends BrowserElement{
 constructor(){super();this._items=[];this._list=mount(this,css,'<dl part="list"></dl>').querySelector("dl");}
 get items(){return this._items.map(x=>({...x}));}set items(v){this._items=normalizeDescriptionItems(v);this._render();}
 connectedCallback(){this._render();}
 _render(){if(!this._list)return;const doc=this.ownerDocument;this._list.replaceChildren(...this._items.map(item=>{const row=doc.createElement("div");row.className="pair";const dt=doc.createElement("dt"),dd=doc.createElement("dd");dt.textContent=item.label;dd.textContent=item.value;row.append(dt,dd);return row;}));}
}
define("cu-description-list",CuDescriptionList);
