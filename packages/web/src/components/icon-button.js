import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";
import "./spinner.js";

const css=[
  ":host{display:inline-flex;vertical-align:middle;color:var(--cu-text,#242424);font:600 13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "button{position:relative;box-sizing:border-box;display:grid;place-items:center;width:var(--cu-control-height,40px);",
  "height:var(--cu-control-height,40px);border:1px solid transparent;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:inherit;cursor:pointer;",
  "transition:background var(--cu-motion-fast,100ms),border-color var(--cu-motion-fast,100ms);}",
  "button:hover:not(:disabled){background:var(--cu-state-hover);}",
  "button:active:not(:disabled){background:var(--cu-state-pressed);}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "button:disabled{opacity:.45;cursor:not-allowed;}",
  ":host([variant=outline]) button{border-color:var(--cu-control-border,var(--cu-border-strong,#898989));}",
  ":host([variant=filled]) button{background:var(--cu-surface-alt,#fafafa);border-color:var(--cu-border,#e5e5e5);}",
  ":host([variant=accent]) button{background:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);}",
  ":host([variant=accent]) button:hover:not(:disabled){background:var(--cu-accent-hover,#005a9e);}",
  ":host([variant=accent]) button:active:not(:disabled){background:var(--cu-accent-pressed,#004578);}",
  ":host([variant=filled]) button:hover:not(:disabled),:host([variant=outline]) button:hover:not(:disabled){background:var(--cu-state-hover);}",
  ":host([variant=filled]) button:active:not(:disabled),:host([variant=outline]) button:active:not(:disabled){background:var(--cu-state-pressed);}",
  ":host([pressed]) button{color:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);",
  "background:var(--cu-state-selected);}",
  ":host([size=sm]) button{width:var(--cu-control-sm,28px);height:var(--cu-control-sm,28px);}",
  ":host([size=lg]) button{width:var(--cu-control-lg,40px);height:var(--cu-control-lg,40px);}",
  ":host([size=xl]) button{width:var(--cu-control-xl,48px);height:var(--cu-control-xl,48px);}",
  "cu-spinner.spinner{position:absolute;--cu-spinner-size:14px;color:inherit;}",
  ".spinner[hidden],cu-icon[hidden]{display:none!important;}",
  "@media(prefers-reduced-motion:reduce){button{transition:none;}}",
  "@media(forced-colors:active){button:focus-visible{outline-color:Highlight;}",
  ":host([pressed]) button{border-color:Highlight;color:Highlight;outline:1px solid Highlight;outline-offset:-3px;}}"
].join("");

export class CuIconButton extends BrowserElement {
  static get observedAttributes(){return ["name","label","aria-label","disabled","loading","pressed","toggle","size","variant"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<button part="button" type="button"><cu-icon part="icon" name="ellipsis" size="18"></cu-icon>' +
      '<cu-spinner class="spinner" exportparts="spinner" hidden aria-hidden="true"></cu-spinner></button>');
    this._button=root.querySelector("button");
    this._icon=root.querySelector("cu-icon");
    this._spinner=root.querySelector(".spinner");
    this._button.addEventListener("click",()=>this.press());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get name(){return this.getAttribute("name")||"";}
  set name(value){this.setAttribute("name",String(value??""));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get loading(){return this.hasAttribute("loading");}
  set loading(value){this.toggleAttribute("loading",Boolean(value));}
  get pressed(){return this.hasAttribute("pressed");}
  set pressed(value){this.toggleAttribute("pressed",Boolean(value));}
  get toggle(){return this.hasAttribute("toggle");}
  set toggle(value){this.toggleAttribute("toggle",Boolean(value));}
  press(){
    if(this.disabled||this.loading)return false;
    if(this.toggle){
      this.pressed=!this.pressed;
      notify(this,"cu-change",{value:this.name,pressed:this.pressed});
    }
    notify(this,"cu-press",{type:"button",name:this.name});
    return true;
  }
  focus(options){this._button.focus(options);}
  click(){this._button.click();}
  _sync(){
    if(!this._button)return;
    this._button.disabled=this.disabled||this.loading;
    this._button.setAttribute("aria-busy",String(this.loading));
    const label=this.getAttribute("aria-label")||this.getAttribute("label")||this.name||"Action";
    this._button.setAttribute("aria-label",label);
    this._button.title=label;
    if(this.toggle)this._button.setAttribute("aria-pressed",String(this.pressed));
    else this._button.removeAttribute("aria-pressed");
    this._icon.name=this.name||"ellipsis";
    this._icon.hidden=this.loading;
    this._spinner.hidden=!this.loading;
  }
}
define("cu-icon-button",CuIconButton);
