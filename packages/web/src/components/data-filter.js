import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./select.js";
import "./icon.js";
import { TABLE_FILTER_OPERATORS } from "./filter-utils.js";

export const DATA_FILTER_OPERATORS=Object.freeze(TABLE_FILTER_OPERATORS.filter(operator=>operator!=="between"));
const NO_VALUE=new Set(["is-blank","is-not-blank"]);
export function buildFilterCondition(field,operator,value){
  if(typeof field!=="string"||!field.trim()||!DATA_FILTER_OPERATORS.includes(operator))
    return null;
  if(!NO_VALUE.has(operator)&&(value===null||value===undefined||String(value).trim()===""))
    return null;
  return {field,operator,value:NO_VALUE.has(operator)?"":String(value)};
}

const css=[
  ":host{display:inline-flex;min-width:180px;max-width:100%;",
  "font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".filter{display:flex;flex-wrap:wrap;align-items:center;gap:6px;",
  "padding:5px 7px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);background:var(--cu-surface,#fff);}",
  ".name{font-weight:650;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;}",
  ".operator{width:148px;min-width:120px;flex:none;}",
  "input{box-sizing:border-box;min-width:90px;max-width:180px;flex:1 1 90px;",
  "height:32px;padding:0 9px;background:var(--cu-surface,#fff);color:inherit;",
  "border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-md,6px);font:inherit;}",
  "input:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:1px;}",
  "input[hidden],.clear[hidden]{display:none!important;}",
  ".clear{display:grid;place-items:center;width:28px;height:28px;flex:none;",
  "border:0;border-radius:var(--cu-radius-md,6px);background:transparent;",
  "color:var(--cu-text-muted,#616161);cursor:pointer;}",
  ".clear:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 9%,transparent);}",
  ".clear:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ":host([disabled]) .filter{opacity:.55;}",
  "@media(forced-colors:active){.filter,input{border-color:CanvasText;}",
  "input:focus-visible,.clear:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuDataFilter extends BrowserElement {
  static get observedAttributes(){return ["field","label","operator","value","disabled"];}
  constructor(){
    super();
    const options=[
      ["contains","Contains"],["not-contains","Does not contain"],
      ["equals","Equals"],["not-equals","Does not equal"],
      ["starts-with","Starts with"],["ends-with","Ends with"],
      ["greater-than","Greater than"],["greater-or-equal","At least"],
      ["less-than","Less than"],["less-or-equal","At most"],
      ["is-blank","Is blank"],["is-not-blank","Is not blank"]
    ];
    const root=mount(this,css,
      '<div class="filter" part="filter"><span class="name" part="label"></span>' +
      '<cu-select class="operator" part="operator" aria-label="Filter comparison">' +
      options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join("")+
      '</cu-select><input part="value" type="text" autocomplete="off" aria-label="Filter value">' +
      '<button type="button" class="clear" part="clear" aria-label="Clear filter" hidden>' +
      '<cu-icon name="x" size="15" aria-hidden="true"></cu-icon></button></div>');
    this._label=root.querySelector(".name");
    this._select=root.querySelector("cu-select");
    this._input=root.querySelector("input");
    this._clear=root.querySelector(".clear");
    this._select.addEventListener("cu-change",event=>{
      event.stopPropagation();
      this.operator=event.detail.value;
      this._emit("cu-change");
    });
    this._input.addEventListener("input",()=>{
      this.value=this._input.value;
      this._emit("cu-input");
    });
    this._input.addEventListener("change",()=>this._emit("cu-change"));
    this._clear.addEventListener("click",()=>this.clear());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get field(){return this.getAttribute("field")||"";}
  set field(v){this.setAttribute("field",String(v??""));}
  get operator(){
    const name=this.getAttribute("operator")||"contains";
    return DATA_FILTER_OPERATORS.includes(name)?name:"contains";
  }
  set operator(v){this.setAttribute("operator",DATA_FILTER_OPERATORS.includes(v)?v:"contains");}
  get value(){return this.getAttribute("value")||"";}
  set value(v){this.setAttribute("value",String(v??""));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get condition(){return this.disabled?null:buildFilterCondition(this.field,this.operator,this.value);}
  get active(){return this.condition!==null;}
  clear(emit=true){
    const wasActive=this.active;
    this.value="";
    this.operator="contains";
    if(emit&&wasActive)this._emit("cu-change");
    return wasActive;
  }
  _emit(type){
    const condition=this.condition;
    notify(this,type,{field:this.field,operator:this.operator,value:this.value,
      active:condition!==null,condition});
  }
  _sync(){
    if(!this._input)return;
    const fieldLabel=this.getAttribute("label")||this.field||"Filter";
    this._label.textContent=fieldLabel;
    this._select.setAttribute("aria-label","Operator for "+fieldLabel);
    this._select.value=this.operator;
    this._select.disabled=this.disabled;
    this._input.disabled=this.disabled;
    this._input.hidden=NO_VALUE.has(this.operator);
    if(this._input.value!==this.value)this._input.value=this.value;
    this._input.setAttribute("aria-label","Filter "+(this.getAttribute("label")||this.field||"value"));
    this._clear.hidden=!this.active;
    this._clear.disabled=this.disabled;
  }
}
define("cu-data-filter",CuDataFilter);
