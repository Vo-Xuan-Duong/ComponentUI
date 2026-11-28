import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizePaletteColors} from "./color-palette.js";
import {normalizeFontFamilies,DEFAULT_FONT_FAMILIES} from "./font-picker.js";
import "./property-grid.js";
import "./button.js";
import "./card.js";
export const DEFAULT_THEME_CONFIG=Object.freeze({accent:"#0067c0",font:"system-ui",radius:6});
export function normalizeThemeConfig(v={}){
  const color=normalizePaletteColors([v?.accent])[0]?.value;
  const font=normalizeFontFamilies([v?.font])[0],radius=v?.radius;
  return {accent:color?color.slice(0,7):DEFAULT_THEME_CONFIG.accent,font:font||DEFAULT_THEME_CONFIG.font,radius:typeof radius==="number"&&Number.isFinite(radius)?Math.max(0,Math.min(24,Math.round(radius))):6};
}
export function themeTokenValues(v){
  const c=normalizeThemeConfig(v),font=["system-ui","sans-serif","serif","monospace"].includes(c.font)?c.font:JSON.stringify(c.font)+", sans-serif";
  return {"--cu-accent":c.accent,"--cu-font-body":font,"--cu-radius-md":c.radius+"px","--cu-radius-lg":(c.radius+2)+"px"};
}
const css=":host{display:block;min-width:0;}.layout{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px;align-items:start;}.controls{display:grid;gap:12px;}.preview{padding:16px;border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.sample{display:grid;gap:12px;}";
export class CuThemeEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._value=normalizeThemeConfig();
    const root=mount(this,css,'<section class="layout" aria-label="Theme editor"><div class="controls"><cu-color-palette></cu-color-palette><cu-font-picker></cu-font-picker><cu-property-grid label="Shape"></cu-property-grid><cu-button class="reset" variant="outline">Reset theme</cu-button></div><div class="preview" part="preview"><cu-card><strong slot="header">Theme preview</strong><div class="sample"><span>ComponentUI — typography and accent</span><cu-button variant="accent">Primary action</cu-button><cu-button variant="outline">Secondary action</cu-button></div></cu-card></div></section>');
    this._palette=root.querySelector("cu-color-palette");this._font=root.querySelector("cu-font-picker");this._grid=root.querySelector("cu-property-grid");this._preview=root.querySelector(".preview");this._reset=root.querySelector(".reset");
    this._palette.colors=["#0067c0","#107c41","#744da9","#c42b1c"];
    this._palette.addEventListener("cu-change",e=>{e.stopPropagation();this._commit("accent",e.detail.value);});
    this._palette.addEventListener("cu-action",e=>{e.stopPropagation();if(e.detail.action==="add")this._commit("accent",e.detail.value);else this._sync();});
    this._font.addEventListener("cu-change",e=>{e.stopPropagation();this._commit("font",e.detail.value);});
    this._grid.addEventListener("cu-change",e=>{e.stopPropagation();this._commit("radius",e.detail.value);});
    this._preview.addEventListener("cu-press",e=>e.stopPropagation());
    this._reset.addEventListener("cu-press",e=>{e.stopPropagation();if(this.readonly)return;this.value=DEFAULT_THEME_CONFIG;notify(this,"cu-change",{key:"reset",value:this.value,tokens:this.tokens});});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  get value(){return {...this._value};}set value(v){this._value=normalizeThemeConfig(v);this._sync();}
  get tokens(){return themeTokenValues(this._value);}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  _commit(key,value){if(this.readonly)return;this.value={...this._value,[key]:value};notify(this,"cu-change",{key,value:this.value,tokens:this.tokens});}
  _sync(){if(!this._preview)return;const c=this._value;if(this._palette.value!==c.accent)this._palette.value=c.accent;if(!this._font.fonts.includes(c.font))this._font.fonts=[...DEFAULT_FONT_FAMILIES,c.font];if(this._font.value!==c.font)this._font.value=c.font;this._palette.disabled=this._font.disabled=this._reset.disabled=this.readonly;this._grid.readonly=this.readonly;this._grid.items=[{key:"radius",label:"Corner radius (px)",type:"number",value:c.radius,min:0,max:24,step:1}];for(const [k,v] of Object.entries(this.tokens))this._preview.style.setProperty(k,v);}
}
define("cu-theme-editor",CuThemeEditor);
