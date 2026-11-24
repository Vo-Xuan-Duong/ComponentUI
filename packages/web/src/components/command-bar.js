import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";
import "./context-menu.js";

export function normalizeCommands(items){
  if(!Array.isArray(items))return [];
  const used=new Set();
  return items.filter(item=>item&&typeof item.value==="string"&&item.value.length)
    .filter(item=>{if(used.has(item.value))return false;used.add(item.value);return true;})
    .map(item=>({value:item.value,label:String(item.label??item.value),
      icon:typeof item.icon==="string"?item.icon:"",
      disabled:Boolean(item.disabled)}));
}
export function partitionCommands(items,maxVisible){
  const count=Number.isFinite(Number(maxVisible))?
    Math.max(0,Math.floor(Number(maxVisible))):items.length;
  if(items.length<=count)return {visible:[...items],overflow:[]};
  return {visible:items.slice(0,count),overflow:items.slice(count)};
}

const css=[
  ":host{display:block;max-width:100%;min-width:0;",
  "font:600 13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".bar{box-sizing:border-box;display:flex;align-items:center;gap:5px;",
  "max-width:100%;min-width:0;padding:5px;border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ".actions{display:flex;align-items:center;min-width:0;gap:4px;}",
  "button{display:inline-flex;align-items:center;justify-content:center;gap:7px;",
  "min-height:var(--cu-control-height,40px);padding:0 11px;",
  "border:1px solid transparent;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:inherit;font:inherit;cursor:pointer;white-space:nowrap;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 12%,var(--cu-surface,#fff));}",
  "button:active:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 18%,var(--cu-surface,#fff));}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:1px;}",
  "button:disabled{opacity:.42;cursor:not-allowed;}",
  ".more{margin-left:auto;flex:none;}",
  ".more[hidden]{display:none!important;}",
  "cu-context-menu{position:fixed;height:0;width:0;}",
  ":host([size=sm]) button{min-height:var(--cu-control-sm,28px);padding:0 8px;}",
  "@media(max-width:520px){button .label{display:none;}button{padding:0 9px;}}",
  "@media(forced-colors:active){.bar{border-color:CanvasText;}",
  "button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuCommandBar extends BrowserElement {
  static get observedAttributes(){return ["max-visible","label","aria-label","disabled","size"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="bar" part="bar" role="toolbar">' +
      '<div class="actions" part="actions"></div>' +
      '<button class="more" type="button" part="more" aria-label="More commands" ' +
      'aria-haspopup="menu" aria-expanded="false" hidden>' +
      '<cu-icon name="ellipsis" size="18" aria-hidden="true"></cu-icon></button></div>' +
      '<cu-context-menu class="overflow" aria-label="More commands"></cu-context-menu>');
    this._bar=root.querySelector(".bar");
    this._actions=root.querySelector(".actions");
    this._more=root.querySelector(".more");
    this._menu=root.querySelector(".overflow");
    this._commands=[];
    this._visible=[];
    this._overflow=[];
    this._observer=null;
    this._lastCapacity=null;
    this._actions.addEventListener("click",event=>{
      const button=event.target.closest('button[data-command]');
      if(!button||button.disabled)return;
      this.activate(button.dataset.command);
    });
    this._more.addEventListener("pointerdown",event=>{
      if(this._menu.open)event.stopPropagation();
    });
    this._more.addEventListener("click",()=>this._menu.open?this._menu.hide(true):this.showOverflow());
    this._more.addEventListener("keydown",event=>{
      if(event.key==="ArrowDown"||event.key==="ArrowUp"){
        event.preventDefault();this.showOverflow();
      }
    });
    this._menu.addEventListener("cu-select",event=>{
      event.stopPropagation();
      this.activate(event.detail.value);
    });
    this._menu.addEventListener("cu-open",()=>this._more.setAttribute("aria-expanded","true"));
    this._menu.addEventListener("cu-close",()=>this._more.setAttribute("aria-expanded","false"));
  }
  connectedCallback(){
    this._render();
    if(globalThis.ResizeObserver){
      this._observer=new ResizeObserver(()=>{
        if(this._capacity()!==this._lastCapacity)this._render();
      });
      this._observer.observe(this);
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;this._menu.hide();}
  attributeChangedCallback(){this._render();}
  get commands(){return this._commands.map(item=>({...item}));}
  set commands(items){
    this._commands=normalizeCommands(items);
    this._render();
  }
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(value){this.toggleAttribute("disabled",Boolean(value));}
  get maxVisible(){
    const value=Number(this.getAttribute("max-visible"));
    return this.hasAttribute("max-visible")&&Number.isFinite(value)?
      Math.max(0,Math.floor(value)):4;
  }
  set maxVisible(value){this.setAttribute("max-visible",String(value));}
  get visibleCommands(){return this._visible.map(item=>({...item}));}
  get overflowCommands(){return this._overflow.map(item=>({...item}));}
  activate(value){
    const action=this._commands.find(item=>item.value===value);
    if(this.disabled||!action||action.disabled)return false;
    notify(this,"cu-action",{value:action.value,label:action.label});
    return true;
  }
  showOverflow(){
    if(this.disabled||!this._overflow.some(item=>!item.disabled))return false;
    const rect=this._more.getBoundingClientRect();
    this._menu.showAt(rect.left,rect.bottom+4,this._more);
    return this._menu.open;
  }
  _capacity(){
    // max-visible is an upper bound; reduce visible commands for narrow hosts.
    const width=this.clientWidth;
    if(!width)return this.maxVisible;
    const fit=Math.max(0,Math.floor((width-74)/112));
    return Math.min(this.maxVisible,fit);
  }
  _render(){
    if(!this._actions)return;
    if(this._menu.open)this._menu.hide();
    this._bar.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Commands");
    this._lastCapacity=this._capacity();
    const {visible,overflow}=partitionCommands(this._commands,this._lastCapacity);
    this._visible=visible;this._overflow=overflow;
    this._actions.replaceChildren();
    for(const action of visible){
      const button=document.createElement("button");
      button.type="button";button.dataset.command=action.value;
      button.disabled=this.disabled||action.disabled;
      button.setAttribute("aria-label",action.label);
      button.title=action.label;
      if(action.icon){
        const icon=document.createElement("cu-icon");
        icon.name=action.icon;icon.setAttribute("size","17");
        icon.setAttribute("aria-hidden","true");button.append(icon);
      }
      const label=document.createElement("span");
      label.className="label";label.textContent=action.label;
      button.append(label);this._actions.append(button);
    }
    this._more.hidden=!overflow.length;
    this._more.disabled=this.disabled||!overflow.some(item=>!item.disabled);
    this._menu.items=overflow;
  }
}
define("cu-command-bar",CuCommandBar);
