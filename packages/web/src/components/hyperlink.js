import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {safeBreadcrumbHref} from "./breadcrumb.js";
const css=":host{display:inline;min-width:0;font:inherit;}a{color:var(--cu-accent,#0067c0);text-decoration:underline;text-underline-offset:2px;border-radius:3px;cursor:pointer;}a:hover{color:var(--cu-accent-hover,#005a9e);}a[aria-disabled=true]{color:var(--cu-text-muted,#616161);text-decoration:none;cursor:default;}"+focusStyle;
export class CuHyperlink extends BrowserElement{
 static get observedAttributes(){return ["href","target","disabled","aria-label"];}
 constructor(){super();this._link=mount(this,css,'<a part="link"><slot></slot></a>').querySelector("a");this._link.addEventListener("click",e=>{if(this.disabled||!this._link.hasAttribute("href")){e.preventDefault();return;}notify(this,"cu-press",{type:"link",value:this.href});});}
 connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
 get href(){return this.getAttribute("href")||"";}set href(v){this.setAttribute("href",String(v??""));}
 get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
 focus(options){this._link.focus(options);}
 _sync(){if(!this._link)return;const href=safeBreadcrumbHref(this.href),target=this.getAttribute("target"),disabled=this.disabled||!href;this._link.setAttribute("aria-disabled",String(disabled));if(disabled){this._link.removeAttribute("href");this._link.setAttribute("role","link");this._link.tabIndex=-1;}else{this._link.href=href;this._link.removeAttribute("role");this._link.removeAttribute("tabindex");}if(["_self","_blank","_parent","_top"].includes(target))this._link.target=target;else this._link.removeAttribute("target");if(target==="_blank")this._link.rel="noopener noreferrer";else this._link.removeAttribute("rel");const label=this.getAttribute("aria-label");if(label)this._link.setAttribute("aria-label",label);else this._link.removeAttribute("aria-label");}
}
define("cu-hyperlink",CuHyperlink);
