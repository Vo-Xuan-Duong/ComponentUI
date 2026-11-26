import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
export class CuForm extends BrowserElement{
 constructor(){super();const root=mount(this,":host{display:block;min-width:0;}::slotted(form){display:grid;gap:var(--cu-form-gap,14px);min-width:0;}","<slot></slot>");this._slot=root.querySelector("slot");this._slot.addEventListener("slotchange",()=>this._bind());this._submit=e=>{if(e.target!==this.form)return;if(this.hasAttribute("intercept-submit"))e.preventDefault();const detail={formData:new FormData(this.form,e.submitter??undefined),valid:true};notify(this,"cu-submit",detail);};this._reset=e=>{if(e.target===this.form)notify(this,"cu-reset",{});};}
 connectedCallback(){this._bind();}disconnectedCallback(){this._unbind();}
 get form(){return this._slot.assignedElements().find(node=>node.localName==="form")||null;}
 get data(){return this.form?new FormData(this.form):null;}
 checkValidity(){return this.form?.checkValidity()??false;}
 reportValidity(){return this.form?.reportValidity()??false;}
 requestSubmit(submitter){const form=this.form;if(!form)return false;if(submitter===undefined)form.requestSubmit();else form.requestSubmit(submitter);return true;}
 reset(){const form=this.form;if(!form)return false;form.reset();return true;}
 _unbind(){this._bound?.removeEventListener("submit",this._submit);this._bound?.removeEventListener("reset",this._reset);this._bound=null;}
 _bind(){const form=this.form;if(form===this._bound)return;this._unbind();this._bound=form;form?.addEventListener("submit",this._submit);form?.addEventListener("reset",this._reset);}
}
define("cu-form",CuForm);
