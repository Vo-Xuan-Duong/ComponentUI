
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";
import "./context-menu.js";

const css=[
  ":host{display:inline-flex;vertical-align:middle;max-width:100%;",
  "font:600 13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".split{display:inline-flex;align-items:stretch;max-width:100%;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);overflow:hidden;",
  "background:var(--cu-surface-alt,#fafafa);}",
  "button{display:inline-flex;align-items:center;justify-content:center;gap:8px;",
  "box-sizing:border-box;min-height:var(--cu-control-height,40px);",
  "border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;}",
  ".primary{min-width:0;padding:0 15px;}",
  ".arrow{flex:none;width:35px;border-left:1px solid var(--cu-border-strong,#d1d1d1);}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-text,#242424) 7%,transparent);}",
  "button:active:not(:disabled){background:color-mix(in srgb,var(--cu-text,#242424) 12%,transparent);}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;z-index:1;}",
  "button:disabled{cursor:not-allowed;opacity:.5;}",
  ":host([variant=accent]) .split{background:var(--cu-accent,#0067c0);",
  "color:var(--cu-accent-text,#fff);border-color:var(--cu-accent,#0067c0);}",
  ":host([variant=accent]) .arrow{border-color:color-mix(in srgb,currentColor 28%,transparent);}",
  ":host([variant=accent]) button:hover:not(:disabled){background:rgb(0 0 0/.1);}",
  ":host([variant=outline]) .split{background:var(--cu-surface,#fff);}",
  ":host([variant=subtle]) .split{background:transparent;border-color:transparent;}",
  ":host([size=sm]) button{min-height:var(--cu-control-sm,28px);}",
  ":host([size=sm]) .primary{padding:0 10px;}",
  ":host([size=sm]) .arrow{width:28px;}",
  ":host([size=lg]) button{min-height:var(--cu-control-lg,40px);}",
  ":host([size=lg]) .primary{padding:0 18px;}",
  ":host([size=lg]) .arrow{width:42px;}",
  ".spinner{width:12px;height:12px;border:2px solid currentColor;",
  "border-right-color:transparent;border-radius:50%;",
  "animation:cu-split-spin .75s linear infinite;}",
  ".spinner[hidden]{display:none!important;}",
  "@keyframes cu-split-spin{to{transform:rotate(360deg);}}",
  ":host([loading]) .split{cursor:wait;}",
  ":host([disabled]) .split{opacity:.58;}",
  "cu-context-menu{position:fixed;width:0;height:0;}",
  "@media(prefers-reduced-motion:reduce){.spinner{animation:none;}}",
  "@media(forced-colors:active){.split{border-color:ButtonText;}",
  ".arrow{border-color:ButtonText;}button:focus-visible{outline-color:Highlight;}}"
].join("");

export function normalizeSplitActions(actions){
  if(!Array.isArray(actions))return [];
  const seen=new Set();
  return actions.filter(item=>item&&typeof item.value==="string"&&item.value.length>0)
    .filter(item=>{if(seen.has(item.value))return false;seen.add(item.value);return true;})
    .map(item=>({value:item.value,label:String(item.label??item.value),
      disabled:Boolean(item.disabled)}));
}

export class CuSplitButton extends BrowserElement {
  static get observedAttributes(){return ["disabled","loading","variant","size","label","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<span class="split" part="split"><button type="button" class="primary" part="primary">' +
      '<span class="spinner" hidden aria-hidden="true"></span>' +
      '<slot><span class="fallback"></span></slot></button>' +
      '<button type="button" class="arrow" part="toggle" aria-label="More actions" ' +
      'aria-haspopup="menu" aria-expanded="false">' +
      '<cu-icon name="chevron-down" size="16" aria-hidden="true"></cu-icon></button></span>' +
      '<cu-context-menu class="actions-menu" aria-label="Additional actions"></cu-context-menu>');
    this._primary=root.querySelector(".primary");
    this._arrow=root.querySelector(".arrow");
    this._menu=root.querySelector(".actions-menu");
    this._spinner=root.querySelector(".spinner");
    this._fallback=root.querySelector(".fallback");
    this._actions=[];
    this._primary.addEventListener("click",()=>this.press());
    // ContextMenu listens for outside pointerdown on document. Keep a click
    // on our toggle from closing-then-immediately-reopening the flyout.
    this._arrow.addEventListener("pointerdown",event=>{
      if(this._menu.open)event.stopPropagation();
    });
    this._arrow.addEventListener("click",()=>this._menu.open?this.hideMenu():this.showMenu());
    this._arrow.addEventListener("keydown",event=>{
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){
        event.preventDefault();this.showMenu();
      }
    });
    this._menu.addEventListener("cu-select",event=>{
      event.stopPropagation();
      const action=this._actions.find(item=>item.value===event.detail.value&&!item.disabled);
      if(!action)return;
      notify(this,"cu-action",{value:action.value,label:action.label});
    });
    this._menu.addEventListener("cu-open",()=>this._arrow.setAttribute("aria-expanded","true"));
    this._menu.addEventListener("cu-close",()=>{
      this._arrow.setAttribute("aria-expanded","false");
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get actions(){return this._actions.map(item=>({...item}));}
  set actions(value){
    this._actions=normalizeSplitActions(value);
    if(this._menu?.open)this._menu.hide();
    if(this._menu)this._menu.items=this._actions;
    this._sync();
  }
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get loading(){return this.hasAttribute("loading");}
  set loading(value){this.toggleAttribute("loading",Boolean(value));}
  get open(){return this._menu?.open??false;}
  press(){
    if(this.disabled||this.loading)return false;
    notify(this,"cu-press",{type:"button"});
    return true;
  }
  showMenu(){
    if(this.disabled||this.loading||!this._actions.some(action=>!action.disabled))return false;
    const rect=this._arrow.getBoundingClientRect();
    this._menu.showAt(rect.left,rect.bottom+4,this._arrow);
    return this._menu.open;
  }
  hideMenu(restoreFocus=true){this._menu.hide(restoreFocus);}
  focus(options){this._primary.focus(options);}
  _sync(){
    if(!this._primary)return;
    const unavailable=this.disabled||this.loading;
    this._primary.disabled=unavailable;
    this._arrow.disabled=unavailable||!this._actions.some(action=>!action.disabled);
    this._primary.setAttribute("aria-busy",String(this.loading));
    this._spinner.hidden=!this.loading;
    this._fallback.textContent=this.getAttribute("label")||"";
    this._arrow.setAttribute("aria-label",this.getAttribute("aria-label")||
      "More actions");
    if((unavailable||this._arrow.disabled)&&this._menu.open)this._menu.hide();
  }
}
define("cu-split-button",CuSplitButton);
