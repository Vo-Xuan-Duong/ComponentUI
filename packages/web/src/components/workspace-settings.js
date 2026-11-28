import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeThemeConfig} from "./theme-editor.js";
import {normalizeShortcutItems} from "./keyboard-shortcut-editor.js";
import "./shortcut-settings.js";
import {normalizeNotificationSettings} from "./notification-settings.js";
import "./tabs.js";
export function normalizeWorkspaceSettings(v={}){
  return {theme:normalizeThemeConfig(v?.theme),shortcuts:normalizeShortcutItems(v?.shortcuts),notifications:normalizeNotificationSettings(v?.notifications)};
}
const css=":host{display:block;min-width:0;}cu-tab{padding:8px 0;}";
export class CuWorkspaceSettings extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();const root=mount(this,css,'<cu-tabs aria-label="Workspace settings"><cu-tab label="Appearance"><cu-theme-editor></cu-theme-editor></cu-tab><cu-tab label="Keyboard"><cu-shortcut-settings></cu-shortcut-settings></cu-tab><cu-tab label="Notifications"><cu-notification-settings></cu-notification-settings></cu-tab></cu-tabs>');
    this._theme=root.querySelector("cu-theme-editor");this._shortcuts=root.querySelector("cu-shortcut-settings");this._notifications=root.querySelector("cu-notification-settings");this._tabs=root.querySelector("cu-tabs");
    for(const [section,control] of [["theme",this._theme],["shortcuts",this._shortcuts],["notifications",this._notifications]])control.addEventListener("cu-change",e=>{e.stopPropagation();if(!this.readonly)notify(this,"cu-change",{section,value:this.value,detail:e.detail});});
    this._tabs.addEventListener("cu-change",e=>{if(e.target===this._tabs)e.stopPropagation();});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get value(){return {theme:this._theme.value,shortcuts:this._shortcuts.items,notifications:this._notifications.value};}
  set value(v){const c=normalizeWorkspaceSettings(v);this._theme.value=c.theme;this._shortcuts.items=c.shortcuts;this._notifications.value=c.notifications;}
  get shortcutDefaults(){return this._shortcuts.defaults;}set shortcutDefaults(v){this._shortcuts.defaults=v;}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _sync(){if(!this._theme)return;this._theme.readonly=this.readonly;this._shortcuts.disabled=this._notifications.disabled=this.readonly;}
}
define("cu-workspace-settings",CuWorkspaceSettings);
