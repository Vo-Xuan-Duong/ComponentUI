import {CuDialog} from "./dialog.js";
import {define,notify} from "./_shared.js";
export class CuConfirmDialog extends CuDialog{
 static get observedAttributes(){return [...super.observedAttributes,"confirm-label","cancel-label","danger-confirm"];}
 constructor(){super();const doc=this.ownerDocument;this._cancel=doc.createElement("button");this._confirm=doc.createElement("button");for(const b of [this._cancel,this._confirm]){b.type="button";b.className="confirmation";this._footer.append(b);}this._confirm.classList.add("primary");this._cancel.addEventListener("click",()=>this.close("cancel"));this._confirm.addEventListener("click",()=>{this.close("confirm");notify(this,"cu-action",{action:"confirm",value:"confirm"});});const style=doc.createElement("style");style.textContent=".confirmation{min-height:36px;padding:6px 14px;font:600 13px var(--cu-font-body,system-ui);}.primary{background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);}.primary:hover{background:var(--cu-accent-hover,#005a9e);}:host([danger-confirm]) .primary{background:var(--cu-danger-action-bg,#c42b1c);border-color:var(--cu-danger-action-bg,#c42b1c);color:#fff;}";this.shadowRoot.append(style);}
 connectedCallback(){super.connectedCallback();this._syncConfirmation();}
 attributeChangedCallback(name){super.attributeChangedCallback(name);this._syncConfirmation();}
 _syncFooter(){if(this._footer)this._footer.hidden=false;}
 _syncConfirmation(){if(!this._confirm)return;this._cancel.textContent=this.getAttribute("cancel-label")||"Cancel";this._confirm.textContent=this.getAttribute("confirm-label")||"Confirm";}
 showModal(){super.showModal();if(this.open)this._cancel?.focus({preventScroll:true});}
}
define("cu-confirm-dialog",CuConfirmDialog);
