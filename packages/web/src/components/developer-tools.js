import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./command-console.js";
import "./log-viewer.js";
import "./api-explorer.js";
import "./tabs.js";
const css=":host{display:block;min-width:0;}cu-tab{padding:8px 0;}";
export class CuDeveloperTools extends BrowserElement{
  static get observedAttributes(){return ["disabled","loading"];}
  constructor(){
    super();const root=mount(this,css,'<cu-tabs aria-label="Developer tools"><cu-tab label="Console"><cu-command-console></cu-command-console></cu-tab><cu-tab label="Logs"><cu-log-viewer></cu-log-viewer></cu-tab><cu-tab label="API"><cu-api-explorer></cu-api-explorer></cu-tab></cu-tabs>');
    this._console=root.querySelector("cu-command-console");this._logs=root.querySelector("cu-log-viewer");this._api=root.querySelector("cu-api-explorer");this._tabs=root.querySelector("cu-tabs");
    for(const [section,control,types] of [["console",this._console,["cu-action"]],["logs",this._logs,["cu-select","cu-filter"]],["api",this._api,["cu-input","cu-change","cu-action"]]])for(const type of types)control.addEventListener(type,e=>{e.stopPropagation();notify(this,type,{...e.detail,section});});
    this._tabs.addEventListener("cu-change",e=>{if(e.target===this._tabs){e.stopPropagation();notify(this,"cu-navigate",{section:["console","logs","api"][e.detail.index]});}});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get lines(){return this._console.lines;}set lines(v){this._console.lines=v;}
  get commands(){return this._console.commands;}set commands(v){this._console.commands=v;}
  get logs(){return this._logs.items;}set logs(v){this._logs.items=v;}
  get request(){return this._api.request;}set request(v){this._api.request=v;}
  get response(){return this._api.response;}set response(v){this._api.response=v;}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get loading(){return this.hasAttribute("loading");}set loading(v){this.toggleAttribute("loading",Boolean(v));}
  append(text,kind="output"){this._console.append(text,kind);}
  _sync(){if(!this._console)return;this._console.disabled=this._api.disabled=this.disabled;this._api.loading=this.loading;}
}
define("cu-developer-tools",CuDeveloperTools);
