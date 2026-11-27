import {CuFilePicker,formatFileSize} from "./file-picker.js";
import {define,notify} from "./_shared.js";
import "./button.js";
const css=".upload-list{display:grid;gap:6px;margin:9px 0;padding:0;list-style:none;}.upload-list:empty{display:none;}.upload-list li{display:flex;justify-content:space-between;gap:8px;overflow-wrap:anywhere;font-size:12px;padding:6px 9px;border:1px solid var(--cu-border,#e5e5e5);border-radius:5px;}.upload-list small{white-space:nowrap;color:var(--cu-text-muted,#616161);}.upload-button{margin-top:6px;}";
export class CuFileUpload extends CuFilePicker{
 static get observedAttributes(){return [...super.observedAttributes,"loading","upload-label"];}
 constructor(){super();const doc=this.ownerDocument,style=doc.createElement("style");style.textContent=css;this.shadowRoot.append(style);this._uploadList=doc.createElement("ul");this._uploadList.className="upload-list";this._uploadList.setAttribute("aria-label","Selected files");this._uploadButton=doc.createElement("cu-button");this._uploadButton.setAttribute("variant","accent");this._uploadButton.className="upload-button";this._uploadButton.addEventListener("cu-press",event=>{event.stopPropagation();this.requestUpload();});this.shadowRoot.querySelector(".field").append(this._uploadList,this._uploadButton);}
 get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
 requestUpload(){if(this.loading||this.disabled||this._formDisabled||!this.files.length||!this.reportValidity())return false;notify(this,"cu-upload",{files:this.files,count:this.files.length,valid:true});return true;}
 _syncForm(){super._syncForm();if(!this._uploadList)return;const doc=this.ownerDocument;this._uploadList.replaceChildren(...this.files.map(file=>{const li=doc.createElement("li"),name=doc.createElement("span"),size=doc.createElement("small");name.textContent=file.name;size.textContent=formatFileSize(file.size);li.append(name,size);return li;}));this._uploadButton.disabled=this.disabled||Boolean(this._formDisabled)||!this.files.length||Boolean(this._invalid());this._uploadButton.loading=this.loading;this._uploadButton.textContent=this.loading?"Uploading…":this.getAttribute("upload-label")||"Upload files";}
}
define("cu-file-upload",CuFileUpload);
