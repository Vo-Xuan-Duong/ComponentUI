import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

let nextDisclosureId=0;
const css=[
  ":host{display:block;min-width:0;font:13px/1.5 var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".root{border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);overflow:hidden;",
  "background:var(--cu-surface,#fff);}",
  "button{box-sizing:border-box;display:flex;align-items:center;gap:9px;width:100%;",
  "min-height:var(--cu-control-height,40px);padding:11px 14px;border:0;",
  "background:transparent;color:inherit;text-align:left;cursor:pointer;",
  "font:600 13px var(--cu-font-body,system-ui);}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 8%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  "button:disabled{opacity:.48;cursor:not-allowed;}",
  ".title{flex:1;min-width:0;}",
  ".chevron{flex:none;transition:transform var(--cu-motion-normal,160ms);}",
  ":host([open]) .chevron{transform:rotate(180deg);}",
  ".panel{padding:0 14px 14px;line-height:1.6;}",
  ".panel[hidden]{display:none!important;}",
  ":host([variant=borderless]) .root{border:0;border-radius:0;}",
  "@media(prefers-reduced-motion:reduce){.chevron{transition:none!important;}}",
  "@media(forced-colors:active){.root{border-color:CanvasText;}",
  "button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuDisclosure extends BrowserElement {
  static get observedAttributes(){return ["open","disabled","label","value"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="root" part="root"><button type="button" part="trigger" ' +
      'aria-expanded="false"><span class="title" part="title"></span>' +
      '<cu-icon class="chevron" name="chevron-down" size="17" aria-hidden="true"></cu-icon>' +
      '</button><div class="panel" part="panel" hidden><slot></slot></div></div>');
    this._button=root.querySelector("button");
    this._title=root.querySelector(".title");
    this._panel=root.querySelector(".panel");
    this._panel.id="cu-disclosure-panel-"+(++nextDisclosureId);
    this._button.setAttribute("aria-controls",this._panel.id);
    this._button.addEventListener("click",()=>this.toggle());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get open(){return this.hasAttribute("open");}
  set open(v){this.toggleAttribute("open",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get value(){return this.getAttribute("value")||"";}
  set value(v){this.setAttribute("value",String(v??""));}
  show(){if(this.disabled)return false;this.open=true;return true;}
  hide(){this.open=false;}
  toggle(){
    if(this.disabled)return false;
    this.open=!this.open;
    notify(this,"cu-toggle",{open:this.open,value:this.value});
    return true;
  }
  focus(options){this._button.focus(options);}
  _sync(){
    if(!this._button)return;
    this._button.disabled=this.disabled;
    this._button.setAttribute("aria-expanded",String(this.open));
    this._title.textContent=this.getAttribute("label")||this.value||"Details";
    this._panel.hidden=!this.open;
  }
}
export class CuAccordionItem extends CuDisclosure {}
define("cu-disclosure",CuDisclosure);
define("cu-accordion-item",CuAccordionItem);
