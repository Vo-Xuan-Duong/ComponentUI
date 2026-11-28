import {BrowserElement,mount,define,notify} from "./_shared.js";
import {parseColor,formatColor} from "./color-picker.js";
import "./button.js";
export function normalizePaletteColors(colors){
  const seen=new Set();return (Array.isArray(colors)?colors:[]).flatMap(c=>{
    const raw=typeof c==="string"?{value:c}:c,parsed=parseColor(raw?.value);
    if(!parsed)return [];
    const value=formatColor(parsed,"hex",parsed.a!==1);if(seen.has(value))return [];
    seen.add(value);return [{value,label:String(raw.label??value)}];
  });
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:12px;}.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;}.swatch::part(button){width:100%;justify-content:flex-start;white-space:normal;}.sample{width:22px;height:22px;flex:none;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:4px;}.actions{display:flex;gap:8px;flex-wrap:wrap;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuColorPalette extends BrowserElement{
  static get observedAttributes(){return ["disabled","value"];}
  constructor(){
    super();this._colors=[];
    const root=mount(this,css,'<section class="panel" aria-label="Color palette"><div class="swatches"></div><cu-color-picker label="Custom color" alpha></cu-color-picker><div class="actions"><cu-button class="add" variant="outline">Add color</cu-button><cu-button class="remove" variant="outline">Remove selected</cu-button></div><span class="status" role="status"></span></section>');
    this._swatches=root.querySelector(".swatches");this._picker=root.querySelector("cu-color-picker");this._add=root.querySelector(".add");this._remove=root.querySelector(".remove");this._status=root.querySelector(".status");
    this._picker.addEventListener("cu-input",e=>{e.stopPropagation();this._syncButtons();});
    this._picker.addEventListener("cu-change",e=>{e.stopPropagation();if(e.detail.value)this._select(e.detail.value);});
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();if(this.disabled)return;const [color]=normalizePaletteColors([this._picker.value]);if(!color||this._colors.some(c=>c.value===color.value))return;this._colors.push(color);this.value=color.value;notify(this,"cu-action",{action:"add",value:color.value,colors:this.colors});});
    this._remove.addEventListener("cu-press",e=>{e.stopPropagation();if(this.disabled||!this._colors.some(c=>c.value===this.value))return;const value=this.value;this._colors=this._colors.filter(c=>c.value!==value);this.value="";notify(this,"cu-action",{action:"remove",value,colors:this.colors});});
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}
  get colors(){return this._colors.map(c=>({...c}));}set colors(v){this._colors=normalizePaletteColors(v);this._render();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get value(){return normalizePaletteColors([this.getAttribute("value")])[0]?.value??"";}set value(v){this.setAttribute("value",normalizePaletteColors([v])[0]?.value??"");}
  _select(v){if(this.disabled)return;const value=normalizePaletteColors([v])[0]?.value;if(value&&value!==this.value){this.value=value;notify(this,"cu-change",{value});}}
  _syncButtons(){if(!this._picker)return;const value=normalizePaletteColors([this._picker.value])[0]?.value;this._add.disabled=this.disabled||!value||this._colors.some(c=>c.value===value);this._remove.disabled=this.disabled||!this._colors.some(c=>c.value===this.value);}
  _render(){
    if(!this._swatches)return;const doc=this.ownerDocument;
    this._swatches.replaceChildren(...this._colors.map(c=>{const b=doc.createElement("cu-button");b.className="swatch";b.setAttribute("variant",c.value===this.value?"accent":"outline");b.setAttribute("aria-label",c.label+" "+c.value+(c.value===this.value?", selected":""));b.disabled=this.disabled;const sample=doc.createElement("span");sample.className="sample";sample.style.backgroundColor=c.value;b.append(sample,doc.createTextNode(c.label));b.addEventListener("cu-press",e=>{e.stopPropagation();this._select(c.value);});return b;}));
    this._picker.disabled=this.disabled;
    if(normalizePaletteColors([this._picker.value])[0]?.value!==this.value)this._picker.value=this.value;
    this._status.textContent=this._colors.length+" colors"+(this.value?" · "+this.value:"");this._syncButtons();
  }
}
define("cu-color-palette",CuColorPalette);
