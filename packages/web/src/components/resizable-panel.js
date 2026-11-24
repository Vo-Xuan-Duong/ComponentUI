import { BrowserElement, mount, notify, define } from "./_shared.js";

const css=[
  ":host{display:block;box-sizing:border-box;min-width:0;min-height:0;",
  "color:var(--cu-text,#242424);font:13px/1.5 var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".panel{box-sizing:border-box;width:100%;height:100%;overflow:auto;",
  "min-width:0;min-height:0;padding:var(--cu-panel-padding,14px);",
  "background:var(--cu-surface,#fff);border:1px solid var(--cu-border,#e5e5e5);",
  "border-radius:var(--cu-radius-md,6px);}",
  ":host([variant=flat]) .panel{border:0;background:transparent;}",
  ":host([resizable]){resize:both;overflow:auto;min-width:80px;min-height:80px;}",
  ":host([resizable][direction=horizontal]){resize:horizontal;}",
  ":host([resizable][direction=vertical]){resize:vertical;}",
  ":host([slot][resizable]){resize:none;overflow:hidden;}",
  "@media(forced-colors:active){.panel{border-color:CanvasText;}}"
].join("");

export class CuResizablePanel extends BrowserElement {
  static get observedAttributes(){return ["label","aria-label","resizable","direction","variant"];}
  constructor(){
    super();
    const root=mount(this,css,'<section class="panel" part="panel"><slot></slot></section>');
    this._panel=root.querySelector(".panel");
    this._observer=null;
    this._previousSize=null;
  }
  connectedCallback(){
    this._sync();
    if(globalThis.ResizeObserver){
      this._observer=new ResizeObserver(entries=>{
        const box=entries[0]?.contentRect;
        if(!box)return;
        const size={width:box.width,height:box.height};
        if(this._previousSize&&
          (this._previousSize.width!==size.width||this._previousSize.height!==size.height)){
          notify(this,"cu-resize",size);
        }
        this._previousSize=size;
      });
      this._observer.observe(this);
    }
  }
  disconnectedCallback(){this._observer?.disconnect();this._observer=null;}
  attributeChangedCallback(){this._sync();}
  get resizable(){return this.hasAttribute("resizable");}
  set resizable(v){this.toggleAttribute("resizable",Boolean(v));}
  _sync(){
    if(!this._panel)return;
    const label=this.getAttribute("aria-label")||this.getAttribute("label");
    if(label){this._panel.setAttribute("role","region");this._panel.setAttribute("aria-label",label);}
    else {this._panel.removeAttribute("role");this._panel.removeAttribute("aria-label");}
  }
}
define("cu-resizable-panel",CuResizablePanel);
