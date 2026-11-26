import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import {deepActiveElement,restoreOverlayFocus} from "./_overlay.js";
import "./icon.js";
export function normalizePaletteCommands(items){
  const seen=new Set();
  return (Array.isArray(items)?items:[]).flatMap(item=>{
    if(!item||typeof item.value!=="string"||!item.value||seen.has(item.value))return [];
    seen.add(item.value);return [{value:item.value,label:String(item.label??item.value),description:String(item.description??""),group:String(item.group??""),icon:String(item.icon??""),shortcut:String(item.shortcut??""),keywords:Array.isArray(item.keywords)?item.keywords.map(String):[],disabled:Boolean(item.disabled)}];
  });
}
const folded=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function searchPaletteCommands(items,query){
  const terms=folded(query).trim().split(/\s+/).filter(Boolean);
  return items.map((item,index)=>{
    const label=folded(item.label??item.value),text=folded([item.value,item.label,item.description,item.group,...(item.keywords??[])].join(" "));
    return {item,index,match:terms.every(t=>text.includes(t)),score:terms.reduce((n,t)=>n+(label.startsWith(t)?3:label.includes(t)?2:0),0)};
  }).filter(x=>x.match).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.item);
}
const css=[
  ":host{display:contents;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  "dialog{box-sizing:border-box;width:min(580px,calc(100vw - 24px));max-height:calc(100dvh - 32px);padding:0;margin: min(12vh,96px) auto auto;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-xl,12px);background:var(--cu-surface-elevated,#fff);color:var(--cu-text,#242424);box-shadow:var(--cu-shadow-flyout,0 16px 44px rgb(0 0 0/.2));overflow:auto;}",
  "dialog::backdrop{background:rgb(0 0 0/.40);backdrop-filter:blur(3px);}dialog[open]{animation:enter var(--cu-motion-normal,160ms) ease-out;}@keyframes enter{from{opacity:.6;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}",
  ".heading{display:flex;align-items:center;justify-content:space-between;padding:12px 15px 5px;gap:8px;}h2{font-size:14px;font-weight:650;margin:0;}.search{display:flex;align-items:center;gap:10px;padding:10px 15px;border-bottom:1px solid var(--cu-border,#e5e5e5);}",
  "input{flex:1;width:100%;min-width:0;border:0;background:transparent;color:inherit;font:400 16px var(--cu-font-body,system-ui);padding:8px 2px;outline:none;}input:focus-visible{outline:none;}.search:focus-within{box-shadow:inset 0 -2px var(--cu-accent,#0067c0);}",
  "button{background:transparent;color:inherit;border:0;border-radius:6px;padding:5px;cursor:pointer;}button:hover{background:var(--cu-state-hover);}",
  ".list{padding:6px;max-height:min(360px,50dvh);overflow:auto;overscroll-behavior:contain;}.option{display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--cu-radius-md,6px);cursor:pointer;min-width:0;}.option[aria-disabled=true]{opacity:.45;cursor:not-allowed;}",
  ".option[data-active=true]:not([aria-disabled=true]),.option:hover:not([aria-disabled=true]){background:var(--cu-state-active);}.copy{min-width:0;flex:1;display:grid;gap:3px;overflow-wrap:anywhere;}.name{font-weight:600;}.description,.group,.empty,.footer{color:var(--cu-text-muted,#616161);font-size:12px;}.group{font-weight:650;padding:9px 10px 5px;}.empty{text-align:center;padding:25px;}",
  "kbd{font:11px var(--cu-font-body,system-ui);border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:4px;padding:2px 5px;white-space:nowrap;}.footer{display:flex;gap:12px;flex-wrap:wrap;padding:10px 15px;border-top:1px solid var(--cu-border,#e5e5e5);}.status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}",
  "@media(forced-colors:active){.option[data-active=true]{outline:2px solid Highlight;}}",focusStyle
].join("");
export class CuCommandPalette extends BrowserElement{
  static get observedAttributes(){return ["open","title","placeholder","empty-text","shortcut","hidden"];}
  constructor(){
    super();this._commands=[];this._visible=[];this._active=-1;
    const root=mount(this,css,'<dialog aria-labelledby="palette-title" part="dialog"><div class="heading"><h2 id="palette-title"></h2><button class="close" type="button" aria-label="Close command palette"><cu-icon name="x" size="18"></cu-icon></button></div><div class="search"><cu-icon name="search" size="20"></cu-icon><input role="combobox" aria-label="Search commands" aria-controls="palette-list" aria-expanded="true" aria-autocomplete="list" autocomplete="off" autofocus></div><div class="list" role="listbox" id="palette-list" aria-label="Commands"></div><div class="footer"><span><kbd>↑ ↓</kbd> Navigate</span><span><kbd>Enter</kbd> Select</span><span><kbd>Esc</kbd> Close</span></div><span class="status" role="status"></span></dialog>');
    for(const [k,q] of Object.entries({dialog:"dialog",title:"h2",input:"input",list:".list",close:".close",status:".status"}))this["_"+k]=root.querySelector(q);
    this._input.addEventListener("input",e=>{if(!e.isComposing)this._render();});this._input.addEventListener("compositionend",()=>this._render());
    this._input.addEventListener("keydown",e=>this._key(e));
    this._close.addEventListener("click",()=>this.close());
    this._dialog.addEventListener("cancel",e=>{e.preventDefault();this.close("escape");});
    this._dialog.addEventListener("close",()=>{if(this._dialog.open)return;this.removeAttribute("open");const trigger=this._trigger;this._trigger=null;restoreOverlayFocus(trigger);notify(this,"cu-close",{reason:this._dialog.returnValue||"close"});});
    this._shortcut=e=>{if(this.hidden||e.defaultPrevented||e.isComposing||e.repeat||e.altKey||e.shiftKey)return;if(this.getAttribute("shortcut")==="mod+k"&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();if(this.open)this.close("shortcut");else this.show();}};
  }
  connectedCallback(){this._doc=this.ownerDocument;this._doc.addEventListener("keydown",this._shortcut);this._sync();if(this.hasAttribute("open")&&!this.hidden)this.show();}
  disconnectedCallback(){this._doc?.removeEventListener("keydown",this._shortcut);this._trigger=null;if(this._dialog.open)this._dialog.close("disconnect");}
  attributeChangedCallback(name){if(!this._dialog)return;if(this.isConnected){if(name==="open"){if(this.hasAttribute("open")&&!this.open)this.show();else if(!this.hasAttribute("open")&&this.open)this.close();}if(name==="hidden"&&this.hidden)this.close("hidden");}this._sync();}
  get commands(){return this._commands.map(x=>({...x,keywords:[...x.keywords]}));}
  set commands(v){this._commands=normalizePaletteCommands(v);this._render();}
  get open(){return this._dialog?.open??false;}
  set open(v){if(v){if(this.isConnected)this.show();else this.setAttribute("open","");}else{if(this.open)this.close();else this.removeAttribute("open");}}
  show(){
    if(this.open||!this.isConnected||this.hidden)return false;
    this._trigger=deepActiveElement(this.ownerDocument);this._input.value="";this._sync();this._dialog.returnValue="";this._dialog.showModal();this.setAttribute("open","");this._input.focus();notify(this,"cu-open",{});return true;
  }
  close(reason="close"){if(this.open)this._dialog.close(reason);}
  _sync(){if(!this._input)return;this._title.textContent=this.getAttribute("title")||"Command palette";this._input.placeholder=this.getAttribute("placeholder")||"Search commands…";this._render();}
  _render(){
    if(!this._list)return;
    this._visible=searchPaletteCommands(this._commands,this._input.value);this._active=this._visible.findIndex(x=>!x.disabled);
    const doc=this.ownerDocument,nodes=[];let group=null;this._rows=[];
    this._visible.forEach((item,i)=>{
      if(item.group!==group){group=item.group;if(group){const heading=doc.createElement("div");heading.className="group";heading.setAttribute("role","presentation");heading.textContent=group;nodes.push(heading);}}
      const el=doc.createElement("div");el.className="option";el.id="palette-option-"+i;el.setAttribute("role","option");el.setAttribute("aria-disabled",String(item.disabled));
      if(item.icon){const icon=doc.createElement("cu-icon");icon.setAttribute("name",item.icon);icon.setAttribute("size","18");el.append(icon);}
      const copy=doc.createElement("span");copy.className="copy";const label=doc.createElement("span");label.className="name";label.textContent=item.label;copy.append(label);
      if(item.description){const desc=doc.createElement("span");desc.className="description";desc.textContent=item.description;copy.append(desc);}el.append(copy);
      if(item.shortcut){const key=doc.createElement("kbd");key.textContent=item.shortcut;el.append(key);}
      el.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")e.preventDefault();});el.addEventListener("pointermove",e=>{if(e.pointerType!=="touch"&&!item.disabled&&this._active!==i){this._active=i;this._mark();}});el.addEventListener("click",()=>this._commit(i));
      this._rows.push(el);nodes.push(el);
    });
    if(!nodes.length){const empty=doc.createElement("div");empty.className="empty";empty.setAttribute("role","presentation");empty.textContent=this.getAttribute("empty-text")||"No matching commands";nodes.push(empty);}
    this._list.replaceChildren(...nodes);this._status.textContent=this._visible.length+" commands";this._mark();
  }
  _mark(scroll=false){
    this._rows?.forEach((el,i)=>{el.dataset.active=String(i===this._active);el.setAttribute("aria-selected",String(i===this._active));});
    const el=this._rows?.[this._active];if(el){this._input.setAttribute("aria-activedescendant",el.id);if(scroll)el.scrollIntoView({block:"nearest"});}else this._input.removeAttribute("aria-activedescendant");
  }
  _key(e){
    if(e.isComposing)return;
    if(e.key==="Enter"){e.preventDefault();this._commit(this._active);return;}
    if(!["ArrowDown","ArrowUp","PageUp","PageDown"].includes(e.key))return;
    e.preventDefault();const enabled=this._visible.flatMap((x,i)=>x.disabled?[]:[i]);if(!enabled.length)return;
    const at=enabled.indexOf(this._active),dir=e.key==="ArrowDown"||e.key==="PageDown"?1:-1;
    const next=e.key.startsWith("Page")?Math.max(0,Math.min(enabled.length-1,at+dir*5)):(at+dir+enabled.length)%enabled.length;
    this._active=enabled[next];this._mark(true);
  }
  _commit(i){const item=this._visible[i];if(!item||item.disabled||!this.open)return;this.close("select");notify(this,"cu-select",{value:item.value,label:item.label});}
}
define("cu-command-palette",CuCommandPalette);
