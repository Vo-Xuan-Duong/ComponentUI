import {CuDialog} from "./dialog.js";
import {define,notify} from "./_shared.js";
import "./button.js";
export class CuConfirmDialog extends CuDialog{
 static get observedAttributes(){return [...super.observedAttributes,"confirm-label","cancel-label","danger-confirm"];}
 constructor(){super();const doc=this.ownerDocument;this._cancel=doc.createElement("cu-button");this._confirm=doc.createElement("cu-button");for(const b of [this._cancel,this._confirm]){b.setAttribute("size","md");b.className="confirmation";this._footer.append(b);}this._cancel.setAttribute("variant","outline");this._confirm.setAttribute("variant","accent");this._cancel.addEventListener("cu-press",e=>{e.stopPropagation();if(this.open)this.close("cancel");});this._confirm.addEventListener("cu-press",e=>{e.stopPropagation();if(!this.open)return;this.close("confirm");notify(this,"cu-action",{action:"confirm",value:"confirm"});});}
 connectedCallback(){super.connectedCallback();this._syncConfirmation();}
 attributeChangedCallback(name){super.attributeChangedCallback(name);this._syncConfirmation();}
 _syncFooter(){if(this._footer)this._footer.hidden=false;}
 _syncConfirmation(){if(!this._confirm)return;this._cancel.textContent=this.getAttribute("cancel-label")||"Cancel";this._confirm.textContent=this.getAttribute("confirm-label")||"Confirm";this._confirm.setAttribute("variant",this.hasAttribute("danger-confirm")?"danger":"accent");}
 showModal(){const wasOpen=this.open;super.showModal();if(!wasOpen&&this.open)this._cancel?.focus({preventScroll:true});}
}
define("cu-confirm-dialog",CuConfirmDialog);
