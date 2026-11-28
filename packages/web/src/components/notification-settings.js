import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./settings-page.js";
import "./switch.js";
import "./button.js";
import "./select.js";
export const DEFAULT_NOTIFICATION_SETTINGS=Object.freeze({enabled:true,desktop:true,sound:false,email:false,digest:"daily"});
export function normalizeNotificationSettings(v={}){
  const result={...DEFAULT_NOTIFICATION_SETTINGS};
  for(const k of ["enabled","desktop","sound","email"])if(typeof v?.[k]==="boolean")result[k]=v[k];
  if(["off","daily","weekly"].includes(v?.digest))result.digest=v.digest;
  return result;
}
const css=":host{display:block;min-width:0;}cu-select{min-width:130px;}";
export class CuNotificationSettings extends BrowserElement{
  static get observedAttributes(){return ["disabled"];}
  constructor(){
    super();this._value=normalizeNotificationSettings();
    const root=mount(this,css,'<cu-settings-page label="Notifications" description="Manage notification preferences" searchable><cu-button slot="actions" variant="outline">Reset defaults</cu-button><cu-settings-group label="General"><cu-settings-item label="Notifications" description="Enable notification preferences"><cu-switch slot="control" data-key="enabled">Enabled</cu-switch></cu-settings-item><cu-settings-item label="Desktop alerts"><cu-switch slot="control" data-key="desktop">Desktop alerts</cu-switch></cu-settings-item><cu-settings-item label="Sound"><cu-switch slot="control" data-key="sound">Sound</cu-switch></cu-settings-item></cu-settings-group><cu-settings-group label="Email"><cu-settings-item label="Email notifications"><cu-switch slot="control" data-key="email">Email notifications</cu-switch></cu-settings-item><cu-settings-item label="Digest frequency"><cu-select slot="control" data-key="digest" aria-label="Digest frequency"><option value="off">Off</option><option value="daily">Daily</option><option value="weekly">Weekly</option></cu-select></cu-settings-item></cu-settings-group></cu-settings-page>');
    this._controls=[...root.querySelectorAll("[data-key]")];this._reset=root.querySelector("cu-button");
    for(const c of this._controls){c.addEventListener("cu-input",e=>e.stopPropagation());c.addEventListener("cu-change",e=>{e.stopPropagation();if(c.disabled)return;const key=c.dataset.key;this._value=normalizeNotificationSettings({...this._value,[key]:key==="digest"?e.detail.value:e.detail.checked});this._sync();notify(this,"cu-change",{key,value:this.value});});}
    this._reset.addEventListener("cu-press",e=>{e.stopPropagation();if(this.disabled)return;this.value=DEFAULT_NOTIFICATION_SETTINGS;notify(this,"cu-change",{key:"reset",value:this.value});});
  }
  connectedCallback(){this._sync();queueMicrotask(()=>{if(this.isConnected)this._sync();});}attributeChangedCallback(){this._sync();}
  get value(){return {...this._value};}set value(v){this._value=normalizeNotificationSettings(v);this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  _sync(){if(!this._controls)return;for(const c of this._controls){const k=c.dataset.key;c.disabled=this.disabled||(k!=="enabled"&&!this._value.enabled)||(k==="digest"&&!this._value.email);if(k==="digest"){if(c.value!==this._value.digest)c.value=this._value.digest;}else c.checked=this._value[k];}this._reset.disabled=this.disabled;}
}
define("cu-notification-settings",CuNotificationSettings);
