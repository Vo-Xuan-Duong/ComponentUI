import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";

export function windowControlActions({maximized=false,minimizable=true,maximizable=true,closable=true}={}){
  return [
    {action:"minimize",label:"Minimize window",disabled:!minimizable},
    {action:maximized?"restore":"maximize",label:maximized?"Restore window":"Maximize window",disabled:!maximizable},
    {action:"close",label:"Close window",disabled:!closable}
  ];
}
// Fixed, local SVG geometry for window chrome rather than external image assets.
const glyphs={
  minimize:'<path d="M5 12h14"/>',
  maximize:'<rect x="5" y="5" width="14" height="14" rx="1"/>',
  restore:'<rect x="4" y="8" width="12" height="12" rx="1"/><path d="M8 8V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon=action=>'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+glyphs[action]+'</svg>';
const css=[
  ":host{display:inline-flex;align-self:stretch;flex:none;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);-webkit-app-region:no-drag;app-region:no-drag;}",
  ".controls{display:flex;align-items:stretch;direction:ltr;}.control{display:grid;place-items:center;min-width:var(--cu-window-control-width,44px);min-height:var(--cu-titlebar-height,36px);padding:0;border:0;border-radius:0;background:transparent;color:inherit;cursor:pointer;}",
  ".control:hover:not(:disabled){background:var(--cu-state-hover);}.control:active:not(:disabled){background:var(--cu-state-pressed);}.control[data-action=close]:hover:not(:disabled){background:var(--cu-danger-action-bg,#c42b1c);color:var(--cu-danger-action-text,#fff);}.control:disabled{opacity:.4;cursor:default;}.control:focus-visible{outline-offset:-3px;}",
  "@media(forced-colors:active){.control:hover:not(:disabled){background:Highlight;color:HighlightText;}}",focusStyle
].join("");
export class CuWindowControls extends BrowserElement{
  static get observedAttributes(){return ["maximized","disabled","no-minimize","no-maximize","no-close","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,'<div class="controls" part="controls" role="group"><button class="control" type="button" part="minimize"></button><button class="control" type="button" part="maximize"></button><button class="control" type="button" part="close"></button></div>');
    this._group=root.querySelector(".controls");this._buttons=[...this._group.querySelectorAll("button")];
    this._group.addEventListener("click",event=>{
      const b=event.target.closest("button");if(!b||b.disabled)return;
      notify(this,"cu-window-action",{action:b.dataset.action,maximized:this.maximized});
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get maximized(){return this.hasAttribute("maximized");}set maximized(v){this.toggleAttribute("maximized",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get minimizable(){return !this.hasAttribute("no-minimize");}set minimizable(v){this.toggleAttribute("no-minimize",!v);}
  get maximizable(){return !this.hasAttribute("no-maximize");}set maximizable(v){this.toggleAttribute("no-maximize",!v);}
  get closable(){return !this.hasAttribute("no-close");}set closable(v){this.toggleAttribute("no-close",!v);}
  _sync(){
    if(!this._buttons)return;
    this._group.setAttribute("aria-label",this.getAttribute("aria-label")||"Window controls");
    windowControlActions(this).forEach((item,i)=>{
      const b=this._buttons[i];if(b.dataset.action!==item.action){b.dataset.action=item.action;b.innerHTML=icon(item.action);}
      b.disabled=this.disabled||item.disabled;b.title=item.label;b.setAttribute("aria-label",item.label);
    });
  }
}
define("cu-window-controls",CuWindowControls);
