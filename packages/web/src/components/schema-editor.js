import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./property-inspector.js";
import "./json-viewer.js";
import "./text-field.js";
import "./select.js";
import "./button.js";
import "./split-view.js";
export const SCHEMA_FIELD_TYPES=Object.freeze(["string","number","integer","boolean","array","object","null"]);
export function normalizeObjectSchema(value={}){
  const source=value?.properties,properties=Object.create(null);
  if(source&&typeof source==="object"&&!Array.isArray(source))for(const key of Object.keys(source).slice(0,100)){
    const x=source[key];if(!key||!x||!SCHEMA_FIELD_TYPES.includes(x.type))continue;
    properties[key]={type:x.type,...(typeof x.description==="string"?{description:x.description}:{})};
  }
  return {type:"object",properties,required:[...new Set((Array.isArray(value?.required)?value.required:[]).filter(x=>typeof x==="string"&&Object.hasOwn(properties,x)))]};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:12px;}.toolbar{display:flex;gap:8px;align-items:end;flex-wrap:wrap;}.toolbar cu-text-field{flex:1 1 120px;}.side{padding:8px;min-width:0;}cu-split-view{height:var(--cu-schema-editor-height,520px);}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuSchemaEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._value=normalizeObjectSchema();
    const root=mount(this,css,'<section class="panel" aria-label="Schema editor"><div class="toolbar"><cu-text-field label="Property name"></cu-text-field><cu-select label="Property type"><option value="string">String</option><option value="number">Number</option><option value="integer">Integer</option><option value="boolean">Boolean</option><option value="array">Array</option><option value="object">Object</option><option value="null">Null</option></cu-select><cu-button class="add" variant="accent">Add property</cu-button><cu-button class="remove" variant="outline">Remove selected</cu-button></div><div class="status" role="status"></div><cu-split-view position="45" min="25" max="70" label="Schema properties and JSON"><div class="side" slot="sidebar"><cu-property-inspector></cu-property-inspector></div><div class="side" slot="content"><cu-json-viewer></cu-json-viewer></div></cu-split-view></section>');
    this._inspector=root.querySelector("cu-property-inspector");this._json=root.querySelector("cu-json-viewer");this._name=root.querySelector("cu-text-field");this._type=root.querySelector("cu-select");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");this._status=root.querySelector(".status");
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();if(this.addProperty(this._name.value,this._type.value))this._name.value="";else this._status.textContent="Enter a unique property name.";});
    this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeProperty(this._inspector.selected);});
    this._inspector.addEventListener("cu-select",e=>{e.stopPropagation();this._syncButtons();notify(this,"cu-select",{value:e.detail.objectId});});
    this._inspector.addEventListener("cu-change",e=>{e.stopPropagation();if(this.readonly)return;const {objectId,key,value}=e.detail,prop=this._value.properties[objectId];if(!prop)return;if(key==="required"){this._value.required=this._value.required.filter(x=>x!==objectId);if(value===true)this._value.required.push(objectId);}else if(key==="type"&&SCHEMA_FIELD_TYPES.includes(value))prop.type=value;else if(key==="description")prop.description=String(value);else return;this._renderJson();this._emit("update",objectId);});
    for(const c of [this._name,this._type])for(const type of ["cu-input","cu-change"])c.addEventListener(type,e=>e.stopPropagation());
    this._json.addEventListener("cu-select",e=>e.stopPropagation());
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get value(){return normalizeObjectSchema(this._value);}set value(v){this._value=normalizeObjectSchema(v);this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addProperty(name,type){name=String(name??"").trim();if(this.readonly||!name||Object.hasOwn(this._value.properties,name)||!SCHEMA_FIELD_TYPES.includes(type)||Object.keys(this._value.properties).length>=100)return false;this._value.properties[name]={type};this._render();this._inspector.selected=name;this._syncButtons();this._emit("add",name);return true;}
  removeProperty(name){if(this.readonly||!Object.hasOwn(this._value.properties,name))return false;delete this._value.properties[name];this._value.required=this._value.required.filter(x=>x!==name);this._render();this._emit("remove",name);return true;}
  _emit(action,name){notify(this,"cu-change",{action,name,value:this.value});}
  _syncButtons(){this._name.disabled=this._type.disabled=this.readonly;this._add.disabled=this.readonly||Object.keys(this._value.properties).length>=100;this._remove.disabled=this.readonly||!this._inspector.selected;}
  _renderJson(){this._json.value=JSON.stringify(this._value,null,2);this._status.textContent=Object.keys(this._value.properties).length+" properties";}
  _render(){if(!this._inspector)return;this._inspector.readonly=this.readonly;this._inspector.objects=Object.entries(this._value.properties).map(([id,x])=>({id,label:id,properties:[{key:"type",label:"Type",type:"select",value:x.type,options:SCHEMA_FIELD_TYPES.map(value=>({value}))},{key:"description",label:"Description",value:x.description??""},{key:"required",label:"Required",type:"boolean",value:this._value.required.includes(id)}]}));this._renderJson();this._syncButtons();}
}
define("cu-schema-editor",CuSchemaEditor);
