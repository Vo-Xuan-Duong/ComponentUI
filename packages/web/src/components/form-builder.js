import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeFormFields} from "./form-designer.js";
import {normalizeObjectSchema} from "./schema-editor.js";
import "./tabs.js";
import "./button.js";
export function buildFormSchema(fields){
  const properties=Object.create(null),required=[];
  for(const field of normalizeFormFields(fields)){
    properties[field.name]={type:field.type==="checkbox"?"boolean":field.type==="number"?"number":"string",description:field.label};
    if(field.required)required.push(field.name);
  }
  return normalizeObjectSchema({type:"object",properties,required});
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:8px;}.toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.status{flex:1;color:var(--cu-text-muted,#616161);font-size:12px;}cu-tab{padding:8px 0;}";
export class CuFormBuilder extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();const root=mount(this,css,'<section class="panel" aria-label="Form builder"><div class="toolbar"><span class="status" role="status"></span><cu-button variant="outline">Export configuration</cu-button></div><cu-tabs aria-label="Form configuration"><cu-tab label="Design"><cu-form-designer></cu-form-designer></cu-tab><cu-tab label="Generated schema"><cu-schema-editor readonly></cu-schema-editor></cu-tab></cu-tabs></section>');
    this._designer=root.querySelector("cu-form-designer");this._schema=root.querySelector("cu-schema-editor");this._status=root.querySelector(".status");this._export=root.querySelector("cu-button");this._tabs=root.querySelector("cu-tabs");
    this._designer.addEventListener("cu-change",e=>{e.stopPropagation();if(!e.detail.fields)return;this._syncSchema();notify(this,"cu-change",{action:e.detail.action,id:e.detail.id,fields:this.fields,schema:this.schema});});
    this._designer.addEventListener("cu-submit",e=>{e.stopPropagation();notify(this,"cu-submit",{data:e.detail.data,schema:this.schema});});
    this._designer.addEventListener("cu-select",e=>{e.stopPropagation();notify(this,"cu-select",e.detail);});
    this._schema.addEventListener("cu-select",e=>e.stopPropagation());
    this._tabs.addEventListener("cu-change",e=>{if(e.target===this._tabs)e.stopPropagation();});
    this._export.addEventListener("cu-press",e=>{e.stopPropagation();if(this.fields.length)notify(this,"cu-action",{action:"export",fields:this.fields,schema:this.schema});});
  }
  connectedCallback(){this._sync();this._syncSchema();}attributeChangedCallback(){this._sync();}
  get fields(){return this._designer.fields;}set fields(v){this._designer.fields=v;this._syncSchema();}
  get schema(){return buildFormSchema(this.fields);}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _sync(){if(this._designer)this._designer.readonly=this.readonly;}
  _syncSchema(){if(!this._schema)return;this._schema.value=this.schema;this._status.textContent=this.fields.length+" fields · Generated structural schema";this._export.disabled=!this.fields.length;}
}
define("cu-form-builder",CuFormBuilder);
