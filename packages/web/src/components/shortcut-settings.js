import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeShortcutItems} from "./keyboard-shortcut-editor.js";
import "./settings-page.js";
import "./button.js";
export function resetShortcutItems(items,defaults){
  const current=normalizeShortcutItems(items),byId=new Map(normalizeShortcutItems(defaults).map(x=>[x.id,x.shortcut]));
  const proposed=current.map(x=>({...x,shortcut:!x.disabled&&byId.has(x.id)?byId.get(x.id):x.shortcut}));
  const used=new Set();
  for(const x of proposed){if(x.shortcut&&used.has(x.shortcut))return null;if(x.shortcut)used.add(x.shortcut);}
  return proposed;
}
const css=":host{display:block;min-width:0;}.status{font:12px var(--cu-font-body,system-ui);color:var(--cu-text-muted,#616161);padding:8px;}";
export class CuShortcutSettings extends BrowserElement{
  static get observedAttributes(){return ["disabled"];}
  constructor(){
    super();this._defaults=[];
    const root=mount(this,css,'<cu-settings-page label="Keyboard shortcuts" description="Customize command shortcuts"><cu-button slot="actions" variant="outline">Reset defaults</cu-button><cu-settings-group label="Assignments"><cu-settings-item label="Shortcut configuration"><cu-keyboard-shortcut-editor slot="control"></cu-keyboard-shortcut-editor></cu-settings-item></cu-settings-group></cu-settings-page><div class="status" role="status"></div>');
    this._editor=root.querySelector("cu-keyboard-shortcut-editor");this._reset=root.querySelector("cu-button");this._status=root.querySelector(".status");
    this._editor.addEventListener("cu-change",e=>{e.stopPropagation();this._status.textContent="";notify(this,"cu-change",{action:"update",...e.detail});});
    this._reset.addEventListener("cu-press",e=>{e.stopPropagation();this.resetDefaults();});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get items(){return this._editor.items;}set items(v){this._editor.items=v;this._sync();}
  get defaults(){return this._defaults.map(x=>({...x}));}set defaults(v){this._defaults=normalizeShortcutItems(v);this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  resetDefaults(){if(this.disabled||!this._defaults.length)return false;const next=resetShortcutItems(this.items,this._defaults);if(!next){this._status.textContent="Defaults conflict with an existing shortcut.";return false;}this.items=next;this._status.textContent="Default shortcuts restored.";notify(this,"cu-change",{action:"reset",items:this.items});return true;}
  _sync(){if(!this._editor)return;this._editor.disabled=this.disabled;this._reset.disabled=this.disabled||!this._defaults.length;}
}
define("cu-shortcut-settings",CuShortcutSettings);
