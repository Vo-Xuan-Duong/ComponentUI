import { BrowserElement, mount, define } from "./_shared.js";

export function nextToolbarIndex(items,current,direction){
  const enabled=items.map((item,i)=>({item,i})).filter(({item})=>!item.disabled).map(({i})=>i);
  if(!enabled.length)return -1;
  if(direction==="Home")return enabled[0];
  if(direction==="End")return enabled.at(-1);
  const position=enabled.indexOf(current);
  const step=direction==="previous"?-1:1;
  return enabled[((position<0?0:position)+step+enabled.length)%enabled.length];
}

const css=[
  ":host{display:flex;max-width:100%;min-width:0;vertical-align:middle;",
  "color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".toolbar{box-sizing:border-box;display:flex;align-items:center;gap:5px;",
  "width:100%;max-width:100%;min-width:0;padding:5px;",
  "border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);",
  "overflow-x:auto;overscroll-behavior-inline:contain;}",
  ":host([variant=flat]) .toolbar{border:0;padding:0;background:transparent;}",
  ":host([orientation=vertical]) .toolbar{flex-direction:column;align-items:stretch;overflow-y:auto;overflow-x:hidden;}",
  "::slotted(:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  "::slotted([data-separator]){align-self:stretch;border-left:1px solid var(--cu-border-strong,#d1d1d1);margin:3px 4px;}",
  ":host([orientation=vertical]) ::slotted([data-separator]){border-left:0;border-top:1px solid var(--cu-border-strong,#d1d1d1);}",
  "@media(forced-colors:active){.toolbar{border-color:CanvasText;}}"
].join("");

export class CuToolbar extends BrowserElement {
  static get observedAttributes(){return ["label","aria-label","orientation","variant"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="toolbar" role="toolbar" part="toolbar"><slot></slot></div>');
    this._toolbar=root.querySelector(".toolbar");
    this._slot=root.querySelector("slot");
    this._focusIndex=0;
    this._slot.addEventListener("slotchange",()=>this.refresh());
    this._toolbar.addEventListener("focusin",event=>{
      const path=event.composedPath();
      const index=this._controls().findIndex(el=>path.includes(el));
      if(index>=0)this._focusIndex=index;
    });
    this._toolbar.addEventListener("keydown",event=>{
      const key=event.key,vertical=this.getAttribute("orientation")==="vertical";
      const next=vertical?"ArrowDown":"ArrowRight";
      const prev=vertical?"ArrowUp":"ArrowLeft";
      if(![next,prev,"Home","End"].includes(key))return;
      const controls=this._controls();
      const target=nextToolbarIndex(controls.map(el=>({disabled:this._disabled(el)})),
        this._focusIndex,key===next?"next":key===prev?"previous":key);
      if(target<0)return;
      event.preventDefault();this._focusIndex=target;
      this.refresh();
      controls[target]?.focus();
    });
  }
  connectedCallback(){this.refresh();}
  attributeChangedCallback(){this.refresh();}
  _controls(){
    if(!this._slot)return [];
    return this._slot.assignedElements({flatten:true}).filter(el=>
      el.matches?.("button,cu-button,cu-icon-button,cu-split-button,cu-select,cu-toggle-button-group,[data-toolbar-control]"));
  }
  _disabled(element){
    return element.hasAttribute("disabled")||Boolean(element.disabled)||
      element.getAttribute("aria-disabled")==="true"||element.hidden;
  }
  refresh(){
    if(!this._toolbar)return;
    this._toolbar.setAttribute("aria-label",this.getAttribute("aria-label")||
      this.getAttribute("label")||"Toolbar");
    this._toolbar.setAttribute("aria-orientation",this.getAttribute("orientation")==="vertical"?"vertical":"horizontal");
    const controls=this._controls();
    const available=controls.map((el,i)=>!this._disabled(el)?i:-1).filter(i=>i>=0);
    if(!available.includes(this._focusIndex))this._focusIndex=available[0]??-1;
    for(const [i,el] of controls.entries())el.tabIndex=i===this._focusIndex?0:-1;
  }
  focus(options){
    const controls=this._controls();
    controls[this._focusIndex]?.focus(options);
  }
}
define("cu-toolbar",CuToolbar);
