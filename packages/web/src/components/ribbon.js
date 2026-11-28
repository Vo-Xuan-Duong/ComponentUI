import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeCommands} from "./command-bar.js";
import "./tabs.js";
import "./command-bar.js";
export function normalizeRibbonTabs(tabs){
  const seen=new Set();
  return (Array.isArray(tabs)?tabs:[]).flatMap(t=>{
    if(!t||typeof t.id!=="string"||!t.id||seen.has(t.id))return [];
    seen.add(t.id);const groups=new Set();
    return [{id:t.id,label:String(t.label??t.id),disabled:Boolean(t.disabled),groups:(Array.isArray(t.groups)?t.groups:[]).flatMap(g=>{
      if(!g||typeof g.id!=="string"||!g.id||groups.has(g.id))return [];
      groups.add(g.id);return [{id:g.id,label:String(g.label??g.id),commands:normalizeCommands(g.commands)}];
    })}];
  });
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.ribbon{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);padding:4px 8px;}.groups{display:flex;gap:12px;flex-wrap:wrap;align-items:stretch;}.group{flex:1 1 210px;min-width:0;display:grid;gap:5px;align-content:start;}.label{text-align:center;font-size:12px;color:var(--cu-text-muted,#616161);}.group cu-command-bar{min-width:0;}";
export class CuRibbon extends BrowserElement{
  static get observedAttributes(){return ["active","disabled"];}
  constructor(){
    super();this._tabs=[];
    const root=mount(this,css,'<section class="ribbon" aria-label="Ribbon"><cu-tabs aria-label="Ribbon tabs"></cu-tabs></section>');
    this._control=root.querySelector("cu-tabs");
    this._control.addEventListener("cu-change",e=>{if(e.target!==this._control)return;e.stopPropagation();const tab=this._tabs[e.detail.index];if(tab){this.active=tab.id;notify(this,"cu-change",{value:tab.id,index:e.detail.index});}});
    this._control.addEventListener("cu-action",e=>{e.stopPropagation();const bar=e.target;if(bar.localName!=="cu-command-bar"||this.disabled)return;notify(this,"cu-action",{tab:bar.dataset.tab,group:bar.dataset.group,value:e.detail.value,label:e.detail.label});});
  }
  connectedCallback(){this._render();}attributeChangedCallback(name){if(name==="active")this._syncActive();else this._render();}
  get tabs(){return this._tabs.map(t=>({...t,groups:t.groups.map(g=>({...g,commands:g.commands.map(c=>({...c}))}))}));}
  set tabs(v){this._tabs=normalizeRibbonTabs(v);this._render();}
  get active(){const id=this.getAttribute("active");return this._tabs.find(t=>t.id===id&&!t.disabled)?.id??this._tabs.find(t=>!t.disabled)?.id??"";}
  set active(v){this.setAttribute("active",String(v??""));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _syncActive(){
    if(!this._control)return;
    const index=this._tabs.findIndex(t=>t.id===this.active);if(index>=0&&this._control.active!==index){this._control.setAttribute("active",String(index));this._control.active=index;}
  }
  _render(){
    if(!this._control)return;
    const doc=this.ownerDocument;
    this._control.replaceChildren(...this._tabs.map(t=>{
      const tab=doc.createElement("cu-tab");tab.setAttribute("label",t.label);tab.disabled=t.disabled;
      const groups=doc.createElement("div");groups.className="groups";
      for(const g of t.groups){const section=doc.createElement("div");section.className="group";const bar=doc.createElement("cu-command-bar");bar.dataset.tab=t.id;bar.dataset.group=g.id;bar.setAttribute("label",g.label);bar.setAttribute("size","sm");bar.maxVisible=8;bar.disabled=this.disabled;bar.commands=g.commands;const label=doc.createElement("span");label.className="label";label.textContent=g.label;section.append(bar,label);groups.append(section);}
      tab.append(groups);return tab;
    }));
    const index=this._tabs.findIndex(t=>t.id===this.active);
    if(index>=0){this._control.setAttribute("active",String(index));queueMicrotask(()=>this._syncActive());}
  }
}
define("cu-ribbon",CuRibbon);
