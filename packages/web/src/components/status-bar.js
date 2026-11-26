import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
const tones=["neutral","success","warning","danger","info"];
export function normalizeStatusItems(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.id!=="string"||!item.id.trim()||seen.has(item.id)||typeof item.label!=="string"||!item.label.trim())return [];
    seen.add(item.id);
    return [{id:item.id,label:item.label.trim(),value:String(item.value??""),icon:String(item.icon??""),tone:tones.includes(item.tone)?item.tone:"neutral",align:item.align==="end"?"end":"start",action:String(item.action??""),disabled:Boolean(item.disabled)}];
  });
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text-muted,#616161);font:12px var(--cu-font-body,system-ui);}",
  ".bar{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:var(--cu-statusbar-height,30px);padding:3px 10px;box-sizing:border-box;border-top:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface-alt,#fafafa);flex-wrap:wrap;}.start,.end{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0;}.end{margin-inline-start:auto;justify-content:flex-end;}",
  ".item{display:inline-flex;align-items:center;gap:5px;min-height:23px;padding:2px 6px;box-sizing:border-box;border-radius:4px;white-space:normal;overflow-wrap:anywhere;min-width:0;color:inherit;font:inherit;}.item[data-tone=success]{color:var(--cu-success,#107c41);}.item[data-tone=warning]{color:var(--cu-warning,#9a6700);}.item[data-tone=danger]{color:var(--cu-danger,#c42b1c);}.item[data-tone=info]{color:var(--cu-accent,#0067c0);}",
  "button.item{background:transparent;border:1px solid transparent;cursor:pointer;}.item:hover:not(:disabled):is(button){background:var(--cu-state-hover);border-color:var(--cu-border,#e5e5e5);}.item:disabled{opacity:.5;cursor:not-allowed;}.value{font-variant-numeric:tabular-nums;font-weight:600;color:var(--cu-text,#242424);}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}",
  ":host([size=sm]){--cu-statusbar-height:26px;}.start:empty,.end:empty{display:none;}@media(forced-colors:active){.item{color:CanvasText;}.item:disabled{color:GrayText;}}",focusStyle
].join("");
export class CuStatusBar extends BrowserElement{
  static get observedAttributes(){return ["label","aria-label","announcement"];}
  constructor(){
    super();this._items=[];
    const root=mount(this,css,'<footer class="bar" part="bar" role="group"><div class="start" part="start"><slot name="start"></slot><span class="start-items" style="display:contents"></span></div><div class="end" part="end"><span class="end-items" style="display:contents"></span><slot name="end"></slot></div><span class="sr" role="status" aria-live="polite" aria-atomic="true"></span></footer>');
    for(const [k,q] of Object.entries({bar:".bar",start:".start-items",end:".end-items",live:".sr"}))this["_"+k]=root.querySelector(q);
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(item=>({...item}));}
  set items(v){this._items=normalizeStatusItems(v);this._render();}
  _render(){
    if(!this._bar)return;
    this._bar.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Application status");
    const announcement=this.getAttribute("announcement")||"";if(this._live.textContent!==announcement)this._live.textContent=announcement;
    const doc=this.ownerDocument,focused=this.shadowRoot.activeElement?.dataset?.id;
    const make=item=>{
      const node=doc.createElement(item.action?"button":"span");node.className="item";node.dataset.id=item.id;node.dataset.tone=item.tone;
      if(item.action){node.type="button";node.disabled=item.disabled;node.addEventListener("click",()=>notify(this,"cu-action",{id:item.id,action:item.action,item:{...item}}));}
      if(item.icon){const icon=doc.createElement("cu-icon");icon.setAttribute("name",item.icon);icon.setAttribute("size","14");icon.setAttribute("aria-hidden","true");node.append(icon);}
      const label=doc.createElement("span");label.textContent=item.label;node.append(label);
      if(item.value){const value=doc.createElement("span");value.className="value";value.textContent=item.value;node.append(value);}
      return node;
    };
    this._start.replaceChildren(...this._items.filter(x=>x.align==="start").map(make));
    this._end.replaceChildren(...this._items.filter(x=>x.align==="end").map(make));
    if(focused!==undefined)[...this.shadowRoot.querySelectorAll("button[data-id]")].find(b=>b.dataset.id===focused)?.focus({preventScroll:true});
  }
}
define("cu-status-bar",CuStatusBar);
