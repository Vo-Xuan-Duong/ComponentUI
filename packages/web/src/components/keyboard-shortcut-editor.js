import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./kbd.js";
import "./button.js";
import "./text-field.js";
const modifiers=["Ctrl","Alt","Shift","Meta"];
const aliases={control:"Ctrl",ctrl:"Ctrl",alt:"Alt",shift:"Shift",meta:"Meta",cmd:"Meta",command:"Meta"};
export function normalizeShortcut(value){
  const raw=String(value??"").trim();if(!raw)return "";
  const parts=raw.split("+").map(x=>x.trim());
  if(parts.some(p=>!p))return null;
  const key=parts.pop(),mods=new Set();
  for(const p of parts){const m=aliases[p.toLowerCase()];if(!m)return null;mods.add(m);}
  const named=["Enter","Escape","Tab","Space","Backspace","Delete","Insert","Home","End","PageUp","PageDown","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"];
  const normalized=/^[a-z0-9]$/i.test(key)?key.toUpperCase():/^f(?:[1-9]|1[0-9]|2[0-4])$/i.test(key)?key.toUpperCase():named.find(k=>k.toLowerCase()===key.toLowerCase());
  if(!normalized)return null;
  return [...modifiers.filter(m=>mods.has(m)),normalized].join("+");
}
export function shortcutFromEvent(e){
  if(!e||e.isComposing||e.repeat||e.key==="Dead"||e.key==="Process")return null;
  const key=e.key===" "?"Space":e.key;
  return normalizeShortcut([...(e.ctrlKey?["Ctrl"]:[]),...(e.altKey?["Alt"]:[]),...(e.shiftKey?["Shift"]:[]),...(e.metaKey?["Meta"]:[]),key].join("+"));
}
export function normalizeShortcutItems(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(i=>{
    if(!i||typeof i.id!=="string"||!i.id||seen.has(i.id))return [];
    seen.add(i.id);return [{id:i.id,label:String(i.label??i.id),shortcut:normalizeShortcut(i.shortcut)??"",disabled:Boolean(i.disabled)}];
  });
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}.rows{display:grid;gap:6px;}.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);}.label{flex:1;min-width:100px;}.keys{display:flex;gap:4px;align-items:center;}.editor{display:grid;gap:8px;padding:10px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-md,6px);}.editor[hidden]{display:none;}.actions{display:flex;gap:8px;}.status{color:var(--cu-text-muted,#616161);font-size:12px;}";
export class CuKeyboardShortcutEditor extends BrowserElement{
  static get observedAttributes(){return ["disabled"];}
  constructor(){
    super();this._items=[];this._editing="";
    const root=mount(this,css,'<section class="panel" aria-label="Keyboard shortcuts"><div class="rows"></div><div class="editor" hidden><cu-text-field label="Shortcut" hint="Type Ctrl+Shift+K or press a key combination"></cu-text-field><div class="actions"><cu-button class="save" variant="accent">Save</cu-button><cu-button class="cancel" variant="outline">Cancel</cu-button><cu-button class="clear" variant="outline">Clear</cu-button></div><span class="status" role="status"></span></div></section>');
    this._rows=root.querySelector(".rows");this._editor=root.querySelector(".editor");this._field=root.querySelector("cu-text-field");this._status=root.querySelector(".status");
    this._field.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();this._cancel();return;}if(e.key==="Tab")return;if(e.ctrlKey||e.altKey||e.metaKey||/^F\d+$/.test(e.key)){const value=shortcutFromEvent(e);if(value){e.preventDefault();e.stopPropagation();this._field.value=value;}}});
    for(const type of ["cu-input","cu-change"])this._field.addEventListener(type,e=>{e.stopPropagation();this._status.textContent="";});
    root.querySelector(".save").addEventListener("cu-press",e=>{e.stopPropagation();this.setShortcut(this._editing,this._field.value);});
    root.querySelector(".cancel").addEventListener("cu-press",e=>{e.stopPropagation();this._cancel();});
    root.querySelector(".clear").addEventListener("cu-press",e=>{e.stopPropagation();this.setShortcut(this._editing,"");});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){if(this.disabled)this._editing="";this._render();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get items(){return this._items.map(i=>({...i}));}set items(v){this._items=normalizeShortcutItems(v);this._editing="";this._render();}
  edit(id){const i=this._items.find(x=>x.id===id);if(this.disabled||!i||i.disabled)return false;this._editing=id;this._field.value=i.shortcut;this._status.textContent="";this._render();this._field.focus();return true;}
  setShortcut(id,value){
    const item=this._items.find(x=>x.id===id);if(this.disabled||!item||item.disabled)return false;
    const shortcut=normalizeShortcut(value);
    if(shortcut===null){this._status.textContent="Invalid shortcut.";return false;}
    const conflict=this._items.find(x=>x.id!==id&&shortcut&&x.shortcut===shortcut);
    if(conflict){this._status.textContent="Already assigned to "+conflict.label+".";return false;}
    const previous=item.shortcut;item.shortcut=shortcut;this._cancel();if(previous!==shortcut)notify(this,"cu-change",{id,value:shortcut,previous,items:this.items});return true;
  }
  _cancel(){const id=this._editing;this._editing="";this._render();[...this._rows.querySelectorAll("cu-button")].find(b=>b.dataset.id===id)?.focus();}
  _render(){
    if(!this._rows)return;const doc=this.ownerDocument;
    this._rows.replaceChildren(...this._items.map(i=>{
      const row=doc.createElement("div");row.className="row";const label=doc.createElement("span");label.className="label";label.textContent=i.label;
      const keys=doc.createElement("span");keys.className="keys";if(i.shortcut)for(const k of i.shortcut.split("+")){const el=doc.createElement("cu-kbd");el.textContent=k;keys.append(el);}else keys.textContent="Unassigned";
      const button=doc.createElement("cu-button");button.dataset.id=i.id;button.setAttribute("variant","outline");button.setAttribute("size","sm");button.setAttribute("aria-label","Edit "+i.label);button.textContent="Edit";button.disabled=this.disabled||i.disabled;button.addEventListener("cu-press",e=>{e.stopPropagation();this.edit(i.id);});row.append(label,keys,button);return row;
    }));this._editor.hidden=!this._editing||this.disabled;
  }
}
define("cu-keyboard-shortcut-editor",CuKeyboardShortcutEditor);
