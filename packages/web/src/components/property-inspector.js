import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizePropertyItems} from "./property-grid.js";
import "./tree-view.js";
import "./split-view.js";
import "./empty-state.js";
export function normalizeInspectorObjects(objects){
  const seen=new Set();return (Array.isArray(objects)?objects:[]).flatMap(o=>{
    if(!o||typeof o.id!=="string"||!o.id||seen.has(o.id))return [];
    seen.add(o.id);return [{id:o.id,label:String(o.label??o.id),properties:normalizePropertyItems(o.properties)}];
  });
}
export function resolveInspectorObject(objects,selected){return objects.find(o=>o.id===selected)?.id??objects[0]?.id??"";}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:8px;}cu-split-view{height:var(--cu-inspector-height,400px);}.objects,.properties{padding:8px;min-width:0;}.heading{font-weight:650;margin-bottom:8px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuPropertyInspector extends BrowserElement{
  static get observedAttributes(){return ["selected","readonly"];}
  constructor(){
    super();this._objects=[];
    const root=mount(this,css,'<section class="panel" aria-label="Property inspector"><cu-split-view position="30" min="20" max="60" label="Objects and properties"><div class="objects" slot="sidebar"><div class="heading">Objects</div><cu-tree-view label="Inspectable objects"></cu-tree-view></div><div class="properties" slot="content"><div class="heading current"></div><cu-property-grid searchable label="Properties"></cu-property-grid><cu-empty-state size="sm" title="No object selected" hidden></cu-empty-state></div></cu-split-view><span class="status" role="status"></span></section>');
    this._tree=root.querySelector("cu-tree-view");this._grid=root.querySelector("cu-property-grid");this._split=root.querySelector("cu-split-view");this._current=root.querySelector(".current");this._empty=root.querySelector("cu-empty-state");this._status=root.querySelector(".status");
    this._tree.addEventListener("cu-change",e=>{e.stopPropagation();this.selectObject(e.detail.value);});
    this._grid.addEventListener("cu-change",e=>{
      e.stopPropagation();const object=this._objects.find(o=>o.id===this.selected);if(!object||this.readonly)return;
      object.properties=this._grid.items;notify(this,"cu-change",{objectId:object.id,key:e.detail.key,value:e.detail.value,previousPropertyValue:e.detail.previousPropertyValue});
    });
    for(const type of ["cu-input","cu-change"])this._split.addEventListener(type,e=>{if(e.target===this._split)e.stopPropagation();});
    this._tree.addEventListener("cu-toggle",e=>e.stopPropagation());this._grid.addEventListener("cu-search",e=>e.stopPropagation());
  }
  connectedCallback(){this._renderTree();this._sync();}attributeChangedCallback(){this._sync();}
  get objects(){return normalizeInspectorObjects(this._objects);}set objects(v){this._objects=normalizeInspectorObjects(v);this._renderTree();this._sync();}
  get selected(){return resolveInspectorObject(this._objects,this.getAttribute("selected"));}
  set selected(v){this.setAttribute("selected",String(v??""));}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  selectObject(id){if(!this._objects.some(o=>o.id===id))return false;if(id===this.selected)return true;this.selected=id;notify(this,"cu-select",{value:id,objectId:id});return true;}
  _renderTree(){
    if(!this._tree)return;
    this._tree.replaceChildren(...this._objects.map(o=>{const item=this.ownerDocument.createElement("cu-tree-item");item.setAttribute("value",o.id);item.setAttribute("label",o.label);return item;}));
    this._tree.value=this.selected;queueMicrotask(()=>{if(this.isConnected)this._tree.value=this.selected;});
  }
  _sync(){
    if(!this._grid)return;const object=this._objects.find(o=>o.id===this.selected);
    if(this._tree.value!==this.selected)this._tree.value=this.selected;
    this._grid.readonly=this.readonly;this._grid.items=object?.properties??[];this._grid.hidden=!object;this._empty.hidden=Boolean(object);this._current.textContent=object?.label??"Properties";this._status.textContent=object?object.properties.length+" properties":"No objects";
  }
}
define("cu-property-inspector",CuPropertyInspector);
