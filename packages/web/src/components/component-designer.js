import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./property-inspector.js";
import "./dock-layout.js";
import "./button.js";
import "./card.js";
import "./text-field.js";
import "./select.js";
export const DESIGN_COMPONENT_TYPES=Object.freeze(["button","card","text-field"]);
export function normalizeDesignComponents(items){
  const seen=new Set();return (Array.isArray(items)?items:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id||seen.has(x.id)||!DESIGN_COMPONENT_TYPES.includes(x.type))return [];
    seen.add(x.id);return [{id:x.id,type:x.type,label:String(x.label??x.type),value:String(x.value??""),disabled:Boolean(x.disabled),variant:["accent","outline","subtle"].includes(x.variant)?x.variant:"outline"}];
  }).slice(0,100);
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{padding:8px;display:grid;gap:8px;}cu-dock-layout{height:var(--cu-designer-height,440px);}.canvas{display:grid;gap:12px;padding:12px;align-content:start;}.preview{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);padding:10px;}.preview[data-selected=true]{outline:2px solid var(--cu-accent,#0067c0);outline-offset:-1px;}.preview-content{display:grid;gap:6px;}.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end;}";
export class CuComponentDesigner extends BrowserElement{
  static get observedAttributes(){return ["readonly","selected"];}
  constructor(){
    super();this._items=[];this._next=1;
    const root=mount(this,css,'<cu-dock-layout label="Component designer"><div class="panel" slot="start"><strong>Components</strong><cu-select label="Component type"><option value="button">Button</option><option value="card">Card</option><option value="text-field">Text field</option></cu-select><cu-button class="add" variant="accent">Add component</cu-button><cu-button class="remove" variant="outline">Remove selected</cu-button></div><div class="canvas" aria-label="Design preview"></div><div class="panel" slot="end"><cu-property-inspector></cu-property-inspector></div></cu-dock-layout>');
    this._dock=root.querySelector("cu-dock-layout");this._canvas=root.querySelector(".canvas");this._inspector=root.querySelector("cu-property-inspector");this._type=root.querySelector("cu-select");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();this.addComponent(this._type.value);});
    this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeComponent(this.selected);});
    this._inspector.addEventListener("cu-select",e=>{e.stopPropagation();this.selected=e.detail.objectId;notify(this,"cu-select",{value:this.selected});});
    this._inspector.addEventListener("cu-change",e=>{e.stopPropagation();if(this.readonly)return;const {objectId,key,value}=e.detail;const i=this._items.findIndex(x=>x.id===objectId);if(i<0||!["label","value","disabled","variant"].includes(key))return;this._items[i]=normalizeDesignComponents([{...this._items[i],[key]:value}])[0];this._preview();this._emit("update",objectId);});
    this._canvas.addEventListener("cu-press",e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._canvas.addEventListener(type,e=>e.stopPropagation());
  }
  connectedCallback(){this._render();}attributeChangedCallback(name){if(name==="selected"){if(this._inspector)this._inspector.selected=this.selected;this._preview();if(this._remove)this._remove.disabled=this.readonly||!this.selected;}else this._render();}
  get items(){return this._items.map(x=>({...x}));}set items(v){this._items=normalizeDesignComponents(v);this._render();}
  get selected(){const id=this.getAttribute("selected");return this._items.find(x=>x.id===id)?.id??this._items[0]?.id??"";}set selected(v){this.setAttribute("selected",String(v??""));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addComponent(type){if(this.readonly||!DESIGN_COMPONENT_TYPES.includes(type)||this._items.length>=100)return false;let id;do{id="component-"+this._next++;}while(this._items.some(x=>x.id===id));this._items.push(normalizeDesignComponents([{id,type,label:type==="button"?"Button":type==="card"?"Card":"Text field"}])[0]);this.selected=id;this._render();this._emit("add",id);return true;}
  removeComponent(id){if(this.readonly||!this._items.some(x=>x.id===id))return false;this._items=this._items.filter(x=>x.id!==id);this._render();this._emit("remove",id);return true;}
  _emit(action,id){notify(this,"cu-change",{action,id,items:this.items});}
  _render(){if(!this._inspector)return;this._inspector.readonly=this.readonly;this._inspector.objects=this._items.map(x=>({id:x.id,label:x.type+" · "+x.id,properties:[{key:"label",label:"Label",value:x.label},...(x.type==="button"?[{key:"variant",label:"Variant",type:"select",value:x.variant,options:["accent","outline","subtle"].map(value=>({value}))}]:[]),...(x.type!=="button"?[{key:"value",label:"Content",value:x.value}]:[]),...(x.type!=="card"?[{key:"disabled",label:"Disabled",type:"boolean",value:x.disabled}]:[])]}));this._inspector.selected=this.selected;this._add.disabled=this.readonly||this._items.length>=100;this._remove.disabled=this.readonly||!this.selected;this._type.disabled=this.readonly;this._preview();}
  _preview(){if(!this._canvas)return;const doc=this.ownerDocument;this._canvas.replaceChildren(...this._items.map(x=>{const wrap=doc.createElement("div");wrap.className="preview";wrap.dataset.selected=String(x.id===this.selected);const select=doc.createElement("cu-button");select.setAttribute("variant","subtle");select.setAttribute("size","sm");select.textContent=x.id;select.addEventListener("cu-press",()=>{this.selected=x.id;notify(this,"cu-select",{value:x.id});});const el=doc.createElement("cu-"+x.type);if(x.type==="button"){el.textContent=x.label;el.setAttribute("variant",x.variant);el.disabled=x.disabled;}else if(x.type==="card"){const header=doc.createElement("strong");header.slot="header";header.textContent=x.label;el.append(header,doc.createTextNode(x.value));}else{el.setAttribute("label",x.label);el.value=x.value;el.disabled=x.disabled;}const content=doc.createElement("div");content.className="preview-content";content.inert=true;content.append(el);wrap.append(select,content);return wrap;}));}
}
define("cu-component-designer",CuComponentDesigner);
