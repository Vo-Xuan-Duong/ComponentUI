import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./window-manager.js";
import "./pdf-viewer.js";
import "./markdown-editor.js";
const css=":host{display:block;min-width:0;}cu-window-manager{--cu-window-manager-height:var(--cu-document-workspace-height,720px);--cu-window-pane-height:620px;}cu-markdown-editor{--cu-markdown-height:480px;}";
export class CuDocumentWorkspace extends BrowserElement{
  static get observedAttributes(){return ["readonly","active"];}
  constructor(){
    super();
    const root=mount(this,css,'<cu-window-manager active="document"><cu-window-pane data-window-id="document" title="Document"><cu-pdf-viewer></cu-pdf-viewer></cu-window-pane><cu-window-pane data-window-id="notes" title="Notes"><cu-markdown-editor></cu-markdown-editor></cu-window-pane></cu-window-manager>');
    this._manager=root.querySelector("cu-window-manager");this._pdf=root.querySelector("cu-pdf-viewer");this._notes=root.querySelector("cu-markdown-editor");
    for(const type of ["cu-input","cu-change"])this._notes.addEventListener(type,e=>{e.stopPropagation();notify(this,type,{section:"notes",value:this.notes});});
    for(const type of ["cu-change","cu-transform","cu-action"])this._pdf.addEventListener(type,e=>{e.stopPropagation();notify(this,type,{section:"document",...e.detail});});
    this._manager.addEventListener("cu-change",e=>{if(e.target!==this._manager)return;e.stopPropagation();this.active=e.detail.value;notify(this,"cu-change",{section:"workspace",value:this.active});});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get pages(){return this._pdf.pages;}set pages(v){this._pdf.pages=v;}
  get document(){return this._pdf.document;}set document(v){this._pdf.document=v;}
  get page(){return this._pdf.page;}set page(v){this._pdf.page=v;}
  get notes(){return this._notes.value;}set notes(v){this._notes.value=v;}
  get active(){return this.getAttribute("active")==="notes"?"notes":"document";}set active(v){this.setAttribute("active",v==="notes"?"notes":"document");}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _sync(){if(!this._manager)return;this._manager.active=this.active;this._notes.toggleAttribute("readonly",this.readonly);}
}
define("cu-document-workspace",CuDocumentWorkspace);
