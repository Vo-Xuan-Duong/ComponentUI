import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
import "./icon.js";
import "./search-box.js";
import "./select.js";
import "./text-field.js";
import "./number-field.js";
import "./checkbox.js";
import "./color-picker.js";
const editorTags={text:"cu-text-field",number:"cu-number-field",boolean:"cu-checkbox",select:"cu-select",color:"cu-color-picker"};
const types=["text","number","boolean","select","color"];
const finite=v=>typeof v==="number"&&Number.isFinite(v);
const optionItems=items=>{
  const seen=new Set();return (Array.isArray(items)?items:[]).flatMap(x=>{
    if(!x||typeof x.value!=="string"||seen.has(x.value))return [];
    seen.add(x.value);return [{value:x.value,label:String(x.label??x.value),disabled:Boolean(x.disabled)}];
  });
};
export function coercePropertyValue(item,input){
  const invalid=message=>({valid:false,value:item.value??"",message});
  const valid=value=>({valid:true,value,message:""});
  switch(item.type){
    case "boolean":return typeof input==="boolean"?valid(input):invalid("Choose true or false.");
    case "number":{
      if((typeof input!=="string"&&typeof input!=="number")||String(input).trim()==="")return invalid("Enter a number.");
      const value=Number(input);if(!Number.isFinite(value))return invalid("Enter a finite number.");
      if(finite(item.min)&&value<item.min)return invalid("Minimum: "+item.min);
      if(finite(item.max)&&value>item.max)return invalid("Maximum: "+item.max);
      if(finite(item.step)&&item.step>0){const ticks=(value-(finite(item.min)?item.min:0))/item.step;if(Math.abs(ticks-Math.round(ticks))>1e-7)return invalid("Use increments of "+item.step+".");}
      return valid(value);
    }
    case "select":return typeof input==="string"&&item.options?.some(x=>x.value===input&&!x.disabled)?valid(input):invalid("Choose an available option.");
    case "color":return typeof input==="string"&&/^#[0-9a-f]{6}$/i.test(input)?valid(input.toLowerCase()):invalid("Choose a HEX color.");
    default:{if(typeof input!=="string")return invalid("Enter text.");if(item.required&&!input.trim())return invalid("This property is required.");return valid(input);}
  }
}
export function normalizePropertyItems(items){
  const seen=new Set(),out=[];
  for(const raw of Array.isArray(items)?items:[]){
    if(!raw||typeof raw.key!=="string"||!raw.key.trim()||seen.has(raw.key))continue;
    seen.add(raw.key);
    const type=types.includes(raw.type)?raw.type:"text";
    const item={key:raw.key,label:String(raw.label??raw.key),group:String(raw.group??"General"),description:String(raw.description??""),type,readonly:Boolean(raw.readonly),disabled:Boolean(raw.disabled),required:Boolean(raw.required),options:optionItems(raw.options)};
    if(finite(raw.min))item.min=raw.min;if(finite(raw.max)&&(!finite(item.min)||raw.max>=item.min))item.max=raw.max;
    if(finite(raw.step)&&raw.step>0)item.step=raw.step;
    const fallback=type==="boolean"?false:type==="number"?(item.min??Math.min(item.max??0,0)):type==="color"?"#000000":type==="select"?(item.options.find(x=>!x.disabled)?.value??""):"";
    item.value=fallback;const parsed=coercePropertyValue(item,raw.value??fallback);if(parsed.valid)item.value=parsed.value;
    out.push(item);
  }return out;
}
const fold=v=>String(v??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/đ/g,"d");
export function filterPropertyItems(items,query){
  const terms=fold(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(item=>{const text=fold([item.key,item.label,item.group,item.description,String(item.value)].join(" "));return terms.every(term=>text.includes(term));});
}
const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ".frame{border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}.toolbar{display:flex;align-items:center;gap:8px;padding:9px;border-bottom:1px solid var(--cu-border,#e5e5e5);}.toolbar[hidden]{display:none!important;}.toolbar cu-search-box{flex:1;min-width:0;}",
  ".editor>cu-text-field,.editor>cu-number-field,.editor>cu-select,.editor>cu-color-picker{min-width:0;--cu-control-height:32px;}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}",
  ".group-header{width:100%;display:flex;align-items:center;gap:7px;text-align:start;padding:10px 12px;border:0;border-bottom:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface-alt,#fafafa);color:inherit;font:650 12px var(--cu-font-body,system-ui);cursor:pointer;}.group-header:hover{background:var(--cu-state-hover);}.group-header[aria-expanded=true] cu-icon{transform:rotate(90deg);}.rows[hidden]{display:none!important;}",
  ".row{display:grid;grid-template-columns:minmax(0,var(--cu-property-label-width,42%)) minmax(0,1fr);gap:12px;align-items:start;padding:8px 12px;border-bottom:1px solid var(--cu-border,#e5e5e5);}.row:last-child{border-bottom:0;}.row:hover{background:var(--cu-state-hover);}.label{padding-top:7px;overflow-wrap:anywhere;font-weight:550;}.editor{min-width:0;display:grid;gap:4px;align-items:center;min-height:32px;}.description,.error,.empty{font-size:12px;color:var(--cu-text-muted,#616161);line-height:1.5;}.description{font-weight:400;}.error{color:var(--cu-danger,#c42b1c);}.error:empty{display:none;}.editor [aria-invalid=true]{border-color:var(--cu-danger,#c42b1c);}.editor :disabled{opacity:.55;cursor:not-allowed;}.empty{padding:20px;text-align:center;}.empty[hidden]{display:none!important;}.color-value{font:12px ui-monospace,monospace;}",
  "@media(max-width:360px){.row{grid-template-columns:1fr;gap:4px;}.label{padding-top:0;}}",focusStyle
].join("");
export class CuPropertyGrid extends BrowserElement{
  static get observedAttributes(){return ["query","searchable","disabled","readonly","label","aria-label","empty-text"];}
  constructor(){
    super();this._items=[];this._collapsed=new Set();
    const root=mount(this,css,'<section class="frame" role="region" part="frame"><div class="toolbar"><cu-search-box class="search" aria-label="Filter properties" placeholder="Filter properties…"></cu-search-box></div><div class="groups"></div><div class="empty" hidden></div></section>');
    for(const [k,q] of Object.entries({frame:".frame",toolbar:".toolbar",search:".search",groups:".groups",empty:".empty"}))this["_"+k]=root.querySelector(q);
    this._search.addEventListener("cu-input",event=>{event.stopPropagation();this.query=event.detail.value;notify(this,"cu-search",{query:this.query});});
    for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,event=>event.stopPropagation());
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get items(){return this._items.map(item=>({...item,options:item.options.map(x=>({...x}))}));}
  set items(v){this._items=normalizePropertyItems(v);this._render();}
  get values(){return Object.fromEntries(this._items.map(x=>[x.key,x.value]));}
  get query(){return this.getAttribute("query")||"";}set query(v){if(v)this.setAttribute("query",String(v));else this.removeAttribute("query");}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  setValue(key,value){
    const item=this._items.find(x=>x.key===key);if(!item)return false;
    const parsed=coercePropertyValue(item,value);if(!parsed.valid)return false;
    item.value=parsed.value;this._render();return true;
  }
  _commit(item,control,error){
    if(this.disabled||this.readonly||item.readonly||item.disabled)return;
    const parsed=coercePropertyValue(item,item.type==="boolean"?control.checked:control.value);
    if(item.type!=="boolean")control.setAttribute("error",parsed.message);
    error.textContent=item.type==="boolean"?parsed.message:"";
    if(!parsed.valid)return;
    const previousValue=item.value;item.value=parsed.value;
    if(previousValue!==item.value)notify(this,"cu-change",{property:item.key,key:item.key,value:item.value,propertyValue:item.value,previousPropertyValue:previousValue,item:{...item,options:item.options.map(x=>({...x}))}});
  }
  _render(){
    if(!this._groups)return;
    const focused=this.shadowRoot.activeElement?.dataset?.property,groupFocus=this.shadowRoot.activeElement?.dataset?.group,doc=this.ownerDocument;
    this._frame.setAttribute("aria-label",this.getAttribute("aria-label")||this.getAttribute("label")||"Property grid");
    this._toolbar.hidden=!this.hasAttribute("searchable");if(this._search.value!==this.query)this._search.value=this.query;
    const items=filterPropertyItems(this._items,this.query),groups=new Map();
    for(const item of items){if(!groups.has(item.group))groups.set(item.group,[]);groups.get(item.group).push(item);}
    this._empty.hidden=Boolean(items.length);this._empty.textContent=this.getAttribute("empty-text")||"No matching properties.";
    let index=0,groupIndex=0;
    this._groups.replaceChildren(...[...groups].map(([group,rows])=>{
      const section=doc.createElement("section"),header=doc.createElement("button"),body=doc.createElement("div");
      header.type="button";header.className="group-header";header.dataset.group=group;
      const expanded=Boolean(this.query)||!this._collapsed.has(group);header.setAttribute("aria-expanded",String(expanded));body.className="rows";body.id="property-group-"+groupIndex++;header.setAttribute("aria-controls",body.id);body.hidden=!expanded;
      const icon=doc.createElement("cu-icon");icon.setAttribute("name","chevron-right");icon.setAttribute("size","14");header.append(icon,doc.createTextNode(group));
      header.addEventListener("click",()=>{if(this.query)return;if(this._collapsed.has(group))this._collapsed.delete(group);else this._collapsed.add(group);this._render();});
      for(const item of rows){
        const row=doc.createElement("div");row.className="row";
        const label=doc.createElement("div");label.className="label";label.textContent=item.label;
        const editor=doc.createElement("div");editor.className="editor";
        const control=doc.createElement(editorTags[item.type]);control.id="property-"+index++;control.dataset.property=item.key;
        const locked=this.disabled||item.disabled||this.readonly||item.readonly;
        control.disabled=this.disabled||item.disabled||((this.readonly||item.readonly)&&["boolean","select"].includes(item.type));
        if(["text","number","color"].includes(item.type))control.toggleAttribute("readonly",locked);
        control.setAttribute("aria-label",item.label);
        if(item.type==="boolean"){
          // Checkbox uses its slotted label as the accessible name.
          const accessible=doc.createElement("span");accessible.className="sr-only";accessible.textContent=item.label+(item.description?" — "+item.description:"");control.append(accessible);
          control.checked=Boolean(item.value);
          if(item.description){const d=doc.createElement("div");d.className="description";d.textContent=item.description;label.append(d);}
        }else{
          if(item.type==="select"){
            for(const option of item.options){const o=doc.createElement("option");o.value=option.value;o.textContent=option.label;o.disabled=option.disabled;control.append(o);}
            // Select resolves its options on connection; setting value before that loses it.
            control.setAttribute("value",String(item.value));
          }else control.value=String(item.value);
          if(item.type==="number"){
            if(finite(item.min))control.setAttribute("min",String(item.min));
            if(finite(item.max))control.setAttribute("max",String(item.max));
            control.setAttribute("step",finite(item.step)?String(item.step):"any");
          }
          if(item.type==="color"){control.setAttribute("compact","");control.setAttribute("required","");}
          else if(item.required)control.setAttribute("required","");
          if(item.description)control.setAttribute("hint",item.description);
        }
        label.addEventListener("click",()=>{if(!control.disabled)control.focus();});
        editor.append(control);
        const error=doc.createElement("span");error.className="error";error.id=control.id+"-error";error.setAttribute("role","status");editor.append(error);
        control.addEventListener("cu-input",e=>{
          e.stopPropagation();
          if(control.getAttribute("error"))control.removeAttribute("error");
        });
        control.addEventListener("cu-change",e=>{e.stopPropagation();this._commit(item,control,error);});
        control.addEventListener("keydown",e=>{
          if(item.type==="select"||e.key!=="Escape"||e.isComposing||locked)return;
          e.preventDefault();e.stopPropagation();
          if(item.type==="boolean")control.checked=Boolean(item.value);else control.value=String(item.value);
          control.removeAttribute("error");error.textContent="";
        });
        row.append(label,editor);body.append(row);
      }
      section.append(header,body);return section;
    }));
    if(focused!==undefined)[...this._groups.querySelectorAll("[data-property]")].find(e=>e.dataset.property===focused)?.focus({preventScroll:true});
    else if(groupFocus!==undefined)[...this._groups.querySelectorAll("[data-group]")].find(e=>e.dataset.group===groupFocus)?.focus({preventScroll:true});
  }
}
define("cu-property-grid",CuPropertyGrid);
