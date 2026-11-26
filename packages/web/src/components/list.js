import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const css=":host{display:block;min-width:0;}.list{display:grid;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);overflow:hidden;background:var(--cu-surface,#fff);}:host([variant=plain]) .list{border:0;background:transparent;}.list ::slotted(cu-list-item:not(:last-child)){border-bottom:1px solid var(--cu-border,#e5e5e5);}:host([no-divider]) .list ::slotted(cu-list-item){border-bottom:0;}";
export class CuList extends BrowserElement{
 static get observedAttributes(){return ["label","aria-label"];}
 constructor(){super();this._list=mount(this,css,'<div class="list" role="list" part="list"><slot></slot></div>').querySelector(".list");}
 connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
 _sync(){this._list?.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"List");}
}
define("cu-list",CuList);
