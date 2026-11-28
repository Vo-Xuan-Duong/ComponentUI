import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeChartItems} from "./chart-container.js";
import "./property-grid.js";
import "./split-view.js";
export function normalizeChartConfig(value={}){
  return {title:String(value?.title??"Chart"),description:String(value?.description??""),type:value?.type==="line"?"line":"bar",showTable:Boolean(value?.showTable)};
}
const css=":host([hidden]){display:none!important;}:host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}cu-split-view{height:var(--cu-chart-editor-height,420px);}.panel{padding:8px;min-width:0;}";
export class CuChartEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._items=[];this._config=normalizeChartConfig();
    const root=mount(this,css,'<cu-split-view position="35" min="25" max="65" label="Chart editor"><div class="panel" slot="sidebar"><cu-property-grid searchable label="Chart properties"></cu-property-grid></div><div class="panel" slot="content"><cu-chart-container></cu-chart-container></div></cu-split-view>');
    this._grid=root.querySelector("cu-property-grid");this._chart=root.querySelector("cu-chart-container");this._split=root.querySelector("cu-split-view");
    this._grid.addEventListener("cu-change",e=>{
      e.stopPropagation();if(this.readonly)return;const {key,value}=e.detail;
      if(key.startsWith("data:")){const index=Number(key.slice(5));if(!this._items[index]||typeof value!=="number"||!Number.isFinite(value)||Math.abs(value)>1e100)return;this._items[index]={...this._items[index],value};}
      else if(Object.hasOwn(this._config,key))this._config=normalizeChartConfig({...this._config,[key]:value});
      else return;
      this._preview();notify(this,"cu-change",{key,value,config:this.config,items:this.items});
    });
    this._grid.addEventListener("cu-search",e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._split.addEventListener(type,e=>{if(e.target===this._split)e.stopPropagation();});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get items(){return this._items.map(x=>({...x}));}set items(v){const next=normalizeChartItems(v);if(JSON.stringify(next)===JSON.stringify(this._items))return;this._items=next;this._render();}
  get config(){return {...this._config};}set config(v){const next=normalizeChartConfig(v);if(JSON.stringify(next)===JSON.stringify(this._config))return;this._config=next;this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _preview(){if(!this._chart)return;const c=this._config;for(const [k,v] of Object.entries({title:c.title,description:c.description,"chart-type":c.type}))if(this._chart.getAttribute(k)!==v)this._chart.setAttribute(k,v);this._chart.toggleAttribute("show-table",c.showTable);this._chart.items=this._items;}
  _render(){if(!this._grid)return;const c=this._config;this._grid.readonly=this.readonly;this._grid.items=[{key:"title",label:"Title",value:c.title},{key:"description",label:"Description",value:c.description},{key:"type",label:"Chart type",type:"select",value:c.type,options:[{value:"bar",label:"Bar"},{value:"line",label:"Line"}]},{key:"showTable",label:"Show data table",type:"boolean",value:c.showTable},...this._items.map((x,i)=>({key:"data:"+i,label:x.label,group:"Data",type:"number",value:x.value,min:-1e100,max:1e100}))];this._preview();}
}
define("cu-chart-editor",CuChartEditor);
