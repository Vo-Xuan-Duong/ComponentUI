import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./form.js";
import "./property-inspector.js";
import "./split-view.js";
import "./text-field.js";
import "./text-area.js";
import "./number-field.js";
import "./checkbox.js";
import "./select.js";
import "./button.js";
export const FORM_FIELD_TYPES=Object.freeze(["text","email","number","textarea","checkbox"]);
export function normalizeFormFields(items){
  const ids=new Set(),names=new Set();return (Array.isArray(items)?items:[]).flatMap(x=>{
    if(!x||typeof x.id!=="string"||!x.id||ids.has(x.id)||typeof x.name!=="string"||!x.name.trim()||names.has(x.name.trim())||!FORM_FIELD_TYPES.includes(x.type))return [];
    ids.add(x.id);const name=x.name.trim();names.add(name);return [{id:x.id,name,type:x.type,label:String(x.label??name),required:Boolean(x.required),value:x.type==="checkbox"?x.value===true:String(x.value??"")}];
  }).slice(0,50);
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.toolbar{display:flex;align-items:end;gap:8px;flex-wrap:wrap;}.panel{display:grid;gap:12px;}.side{padding:8px;}.preview{padding:12px;display:grid;gap:8px;}cu-split-view{height:var(--cu-form-designer-height,500px);}.status{font-size:12px;color:var(--cu-text-muted,#616161);overflow-wrap:anywhere;}";
export class CuFormDesigner extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._fields=[];this._next=1;
    const root=mount(this,css,'<section class="panel" aria-label="Form designer"><div class="toolbar"><cu-select label="Field type"><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="textarea">Textarea</option><option value="checkbox">Checkbox</option></cu-select><cu-button class="add" variant="accent">Add field</cu-button><cu-button class="remove" variant="outline">Remove selected</cu-button></div><cu-split-view position="45" min="25" max="70" label="Field properties and form"><div class="side" slot="sidebar"><cu-property-inspector></cu-property-inspector></div><div class="preview" slot="content"><strong>Form preview</strong><cu-form intercept-submit><form></form></cu-form><cu-button class="submit" variant="accent">Test submit</cu-button><div class="status" role="status"></div></div></cu-split-view></section>');
    this._inspector=root.querySelector("cu-property-inspector");this._form=root.querySelector("cu-form");this._native=root.querySelector("form");this._type=root.querySelector("cu-select");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");this._submit=root.querySelector(".submit");this._status=root.querySelector(".status");
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();this.addField(this._type.value);});this._remove.addEventListener("cu-press",e=>{e.stopPropagation();this.removeField(this._inspector.selected);});
    this._inspector.addEventListener("cu-select",e=>{e.stopPropagation();this._syncButtons();notify(this,"cu-select",{value:e.detail.objectId});});
    this._inspector.addEventListener("cu-change",e=>{e.stopPropagation();if(this.readonly)return;const {objectId,key,value}=e.detail,i=this._fields.findIndex(x=>x.id===objectId);if(i<0||!["name","label","required","value"].includes(key))return;const next=normalizeFormFields(this._fields.map((x,j)=>i===j?{...x,[key]:value}:x));if(next.length!==this._fields.length){this._status.textContent="Field names must be unique and nonempty.";this._renderInspector();return;}this._fields=next;this._renderPreview();this._emit("update",objectId);});
    this._submit.addEventListener("cu-press",e=>{e.stopPropagation();if(this._form.reportValidity())this._form.requestSubmit();});
    this._form.addEventListener("cu-submit",e=>{e.stopPropagation();const data=Object.fromEntries(e.detail.formData);this._status.textContent="Valid preview submission";notify(this,"cu-submit",{data});});
    for(const type of ["cu-input","cu-change"])this._form.addEventListener(type,e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._type.addEventListener(type,e=>e.stopPropagation());
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get fields(){return this._fields.map(x=>({...x}));}set fields(v){this._fields=normalizeFormFields(v);this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addField(type){if(this.readonly||!FORM_FIELD_TYPES.includes(type)||this._fields.length>=50)return false;let id;do{id="field-"+this._next++;}while(this._fields.some(x=>x.id===id||x.name===id));this._fields.push(normalizeFormFields([{id,name:id,type,label:"New "+type}])[0]);this._render();this._inspector.selected=id;this._emit("add",id);return true;}
  removeField(id){if(this.readonly||!this._fields.some(x=>x.id===id))return false;this._fields=this._fields.filter(x=>x.id!==id);this._render();this._emit("remove",id);return true;}
  _emit(action,id){notify(this,"cu-change",{action,id,fields:this.fields});}
  _syncButtons(){this._add.disabled=this.readonly||this._fields.length>=50;this._remove.disabled=this.readonly||!this._inspector.selected;this._type.disabled=this.readonly;}
  _renderInspector(){this._inspector.readonly=this.readonly;this._inspector.objects=this._fields.map(x=>({id:x.id,label:x.label,properties:[{key:"name",label:"Field name",value:x.name},{key:"label",label:"Label",value:x.label},{key:"required",label:"Required",type:"boolean",value:x.required},{key:"value",label:"Default value",type:x.type==="checkbox"?"boolean":"text",value:x.value}]}));}
  _renderPreview(){const doc=this.ownerDocument;this._native.replaceChildren(...this._fields.map(x=>{const tag=x.type==="checkbox"?"cu-checkbox":x.type==="textarea"?"cu-textarea":x.type==="number"?"cu-number-field":"cu-text-field",el=doc.createElement(tag);el.setAttribute("name",x.name);el.toggleAttribute("required",x.required);if(x.type==="checkbox"){el.textContent=x.label;el.checked=x.value;}else{el.setAttribute("label",x.label);if(x.type==="email")el.setAttribute("type","email");el.value=x.value;}return el;}));this._status.textContent="";}
  _render(){if(!this._inspector)return;this._renderInspector();this._renderPreview();this._syncButtons();}
}
define("cu-form-designer",CuFormDesigner);
