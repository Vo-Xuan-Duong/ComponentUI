
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

export function normalizeSteps(value){
  const seen=new Set();
  if(!Array.isArray(value))return [];
  return value.filter(step=>step&&typeof step.value==="string"&&step.value.length>0)
    .filter(step=>{if(seen.has(step.value))return false;seen.add(step.value);return true;})
    .map(step=>({
      value:step.value,label:String(step.label??step.value),
      description:String(step.description??""),
      disabled:Boolean(step.disabled),optional:Boolean(step.optional)
    }));
}
export function canVisitStep(steps,index,currentIndex,linear=false){
  if(!Number.isInteger(index)||index<0||index>=steps.length||steps[index].disabled)return false;
  return !linear||index<=currentIndex+1;
}

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);",
  "font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "ol{display:flex;align-items:stretch;gap:0;list-style:none;margin:0;padding:0;min-width:0;}",
  "li{position:relative;display:flex;align-items:stretch;min-width:0;flex:1;}",
  "li:not(:last-child):after{content:'';height:1px;background:var(--cu-border-strong,#d1d1d1);",
  "flex:1;align-self:center;min-width:12px;margin:0 8px;}",
  "button{display:flex;align-items:center;gap:10px;min-width:0;max-width:100%;",
  "padding:7px 5px;border:0;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;}",
  "button:hover:not(:disabled){background:color-mix(in srgb,var(--cu-accent,#0067c0) 9%,transparent);}",
  "button:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "button:disabled{cursor:not-allowed;opacity:.48;}",
  ".circle{display:grid;place-items:center;box-sizing:border-box;width:26px;height:26px;",
  "border-radius:50%;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "background:var(--cu-surface,#fff);font-weight:650;flex:none;}",
  "li[data-current=true] .circle{background:var(--cu-accent,#0067c0);",
  "color:var(--cu-accent-text,#fff);border-color:var(--cu-accent,#0067c0);}",
  "li[data-completed=true] .circle{background:var(--cu-success-surface,#dff6dd);",
  "color:var(--cu-success,#107c41);border-color:transparent;}",
  "li[data-completed=true]:after{background:var(--cu-success,#107c41);}",
  ".copy{display:flex;flex-direction:column;gap:2px;min-width:0;}",
  ".label{font-weight:600;line-height:1.4;}",
  ".description{font-size:11px;color:var(--cu-text-muted,#616161);line-height:1.4;}",
  ".description:empty{display:none;}",
  ":host([orientation=vertical]) ol{flex-direction:column;}",
  ":host([orientation=vertical]) li{flex-direction:column;flex:auto;}",
  ":host([orientation=vertical]) li:not(:last-child):after{",
  "width:1px;height:18px;min-width:0;min-height:18px;align-self:flex-start;margin:4px 0 4px 18px;}",
  "@media(max-width:520px){:host(:not([orientation=vertical])) ol{overflow-x:auto;}",
  ":host(:not([orientation=vertical])) li{flex:none;}",
  ":host(:not([orientation=vertical])) button{max-width:200px;}}",
  "@media(forced-colors:active){li[data-current=true] .circle{background:Highlight;",
  "color:HighlightText;border-color:Highlight;}",
  "li[data-completed=true] .circle{border-color:Highlight;}",
  "button:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuStepper extends BrowserElement {
  static get observedAttributes(){return ["value","linear","orientation","aria-label"];}
  constructor(){
    super();
    const root=mount(this,css,'<ol part="steps" role="list"></ol>');
    this._list=root.querySelector("ol");
    this._steps=[];
    this._focusIndex=0;
    this._list.addEventListener("click",event=>{
      const button=event.target.closest("button[data-step]");
      if(!button)return;
      const index=Number(button.dataset.index);
      if(this.goTo(index))this._focusStep(index);
    });
    this._list.addEventListener("keydown",event=>{
      const key=event.key;
      const forward=key==="ArrowRight"||key==="ArrowDown";
      const backward=key==="ArrowLeft"||key==="ArrowUp";
      if(!forward&&!backward&&key!=="Home"&&key!=="End")return;
      event.preventDefault();
      const current=this._focusIndex;
      const choices=this._steps.map((_,i)=>i).filter(i=>this._canVisit(i));
      if(!choices.length)return;
      let target=choices.indexOf(current);
      if(key==="Home")target=0;
      else if(key==="End")target=choices.length-1;
      else target=(target+(forward?1:-1)+choices.length)%choices.length;
      this._focusStep(choices[target]);
    });
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){this._render();}
  get steps(){return this._steps.map(step=>({...step}));}
  set steps(value){
    this._steps=normalizeSteps(value);
    this._focusIndex=Math.max(0,Math.min(this._focusIndex,this._steps.length-1));
    this._render();
  }
  get value(){return this.getAttribute("value")||this._steps[0]?.value||"";}
  set value(next){this.setAttribute("value",String(next??""));}
  get currentIndex(){return this._steps.findIndex(step=>step.value===this.value);}
  get linear(){return this.hasAttribute("linear");}
  set linear(next){this.toggleAttribute("linear",Boolean(next));}
  _canVisit(index){return canVisitStep(this._steps,index,Math.max(0,this.currentIndex),this.linear);}
  goTo(input){
    const index=typeof input==="number"?input:this._steps.findIndex(step=>step.value===input);
    if(!this._canVisit(index))return false;
    const current=this.currentIndex;
    if(current===index)return false;
    const previousValue=this.value;
    this.value=this._steps[index].value;
    this._focusIndex=index;
    notify(this,"cu-change",{value:this.value,index,previousValue});
    return true;
  }
  next(){return this.goTo(this.currentIndex+1);}
  previous(){return this.goTo(this.currentIndex-1);}
  _focusStep(index){
    this._focusIndex=index;
    const buttons=[...this._list.querySelectorAll("button[data-step]")];
    for(const button of buttons)button.tabIndex=Number(button.dataset.index)===index?0:-1;
    buttons[index]?.focus();
  }
  _render(){
    if(!this._list)return;
    const index=Math.max(0,this.currentIndex);
    this._list.replaceChildren();
    this._list.setAttribute("aria-label",this.getAttribute("aria-label")||"Steps");
    for(const [i,step] of this._steps.entries()){
      const item=document.createElement("li");
      item.dataset.current=String(i===index);
      item.dataset.completed=String(i<index);
      item.setAttribute("role","listitem");
      const button=document.createElement("button");
      button.type="button";button.dataset.step=step.value;button.dataset.index=String(i);
      button.disabled=!this._canVisit(i);
      if(i===index)button.setAttribute("aria-current","step");
      if(step.optional)button.setAttribute("aria-description","Optional");
      button.tabIndex=this._focusIndex===i&&!button.disabled?0:-1;
      const circle=document.createElement("span");circle.className="circle";
      circle.setAttribute("aria-hidden","true");
      if(i<index){const icon=document.createElement("cu-icon");icon.name="check";icon.setAttribute("size","15");circle.append(icon);}
      else circle.textContent=String(i+1);
      const copy=document.createElement("span");copy.className="copy";
      const label=document.createElement("span");label.className="label";label.textContent=step.label;
      const description=document.createElement("span");description.className="description";
      description.textContent=step.description;
      copy.append(label,description);button.append(circle,copy);item.append(button);
      this._list.append(item);
    }
  }
}
define("cu-stepper",CuStepper);
