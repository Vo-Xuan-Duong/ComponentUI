
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

const css=[
  ":host{--chip-accent:var(--cu-accent,#0067c0);--chip-bg:var(--cu-surface-alt,#fafafa);",
  "--chip-fg:var(--cu-text,#242424);display:inline-flex;max-width:100%;vertical-align:middle;",
  "color:var(--chip-fg);font:500 13px/1.3 var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=success]){--chip-accent:var(--cu-success,#107c41);}",
  ":host([tone=warning]){--chip-accent:var(--cu-warning,#9a6700);}",
  ":host([tone=danger]){--chip-accent:var(--cu-danger,#c42b1c);}",
  ".chip{display:inline-flex;align-items:center;gap:2px;min-width:0;max-width:100%;",
  "box-sizing:border-box;min-height:32px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:999px;background:var(--chip-bg);overflow:hidden;}",
  ":host([selected]) .chip{border-color:var(--chip-accent);",
  "background:color-mix(in srgb,var(--chip-accent) 12%,var(--cu-surface,#fff));}",
  ".body{display:inline-flex;align-items:center;gap:6px;min-width:0;",
  "box-sizing:border-box;padding:6px 12px;border-radius:999px;outline:none;}",
  ".body[role=button]{cursor:pointer;}",
  ".body[role=button]:hover{background:color-mix(in srgb,var(--chip-accent) 10%,transparent);}",
  ".body[role=button]:active{background:color-mix(in srgb,var(--chip-accent) 16%,transparent);}",
  ".body[role=button]:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  ".check{display:none;color:var(--chip-accent);flex:none;}",
  ":host([selected][selectable]) .check{display:inline-flex;}",
  "slot{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
  ".remove{display:none;place-items:center;flex:none;min-width:27px;min-height:27px;",
  "margin:2px 3px 2px 0;padding:0;border:0;border-radius:50%;",
  "color:var(--cu-text-muted,#616161);background:transparent;cursor:pointer;}",
  ":host([removable]) .remove{display:grid;}",
  ".remove:hover{background:color-mix(in srgb,var(--chip-accent) 14%,transparent);color:var(--cu-text,#242424);}",
  ".remove:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:0;}",
  ":host([disabled]){opacity:.5;}",
  ":host([disabled]) .body,:host([disabled]) .remove{cursor:not-allowed;}",
  ":host([disabled]) .body:hover,:host([disabled]) .remove:hover{background:transparent;}",
  ":host([size=sm]) .chip{min-height:26px;}",
  ":host([size=sm]) .body{padding:4px 9px;font-size:12px;}",
  ":host([size=sm]) .remove{min-width:22px;min-height:22px;}",
  ":host([size=lg]) .chip{min-height:40px;}",
  ":host([size=lg]) .body{padding:10px 14px;font-size:14px;}",
  ":host([size=lg]) .remove{min-width:32px;min-height:32px;}",
  "@media(forced-colors:active){:host([selected]) .chip{border-color:Highlight;}",
  ".body:focus-visible,.remove:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuChip extends BrowserElement {
  static get observedAttributes(){
    return ["selected","selectable","removable","disabled","label","value","aria-label"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<span class="chip" part="chip"><span class="body" part="body">' +
      '<cu-icon class="check" name="check" size="14" aria-hidden="true"></cu-icon>' +
      '<slot><span class="fallback"></span></slot></span>' +
      '<button class="remove" type="button" part="remove" aria-label="Remove chip">' +
      '<cu-icon name="x" size="14" aria-hidden="true"></cu-icon></button></span>');
    this._body=root.querySelector(".body");
    this._remove=root.querySelector(".remove");
    this._fallback=root.querySelector(".fallback");
    this._body.addEventListener("click",()=>this.toggle());
    this._body.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      if(!this.selectable||this.disabled)return;
      event.preventDefault();this.toggle();
    });
    this._remove.addEventListener("click",event=>{
      event.stopPropagation();this.removeChip();
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get value(){return this.getAttribute("value")??"";}
  set value(next){this.setAttribute("value",String(next??""));}
  get selected(){return this.hasAttribute("selected");}
  set selected(next){this.toggleAttribute("selected",Boolean(next));}
  get selectable(){return this.hasAttribute("selectable");}
  set selectable(next){this.toggleAttribute("selectable",Boolean(next));}
  get disabled(){return this.hasAttribute("disabled");}
  set disabled(next){this.toggleAttribute("disabled",Boolean(next));}
  get removable(){return this.hasAttribute("removable");}
  set removable(next){this.toggleAttribute("removable",Boolean(next));}
  toggle(){
    if(!this.selectable||this.disabled)return;
    this.selected=!this.selected;
    notify(this,"cu-change",{selected:this.selected,value:this.value});
  }
  removeChip(){
    if(!this.removable||this.disabled||this.hidden)return;
    const event=new CustomEvent("cu-remove",{
      bubbles:true,composed:true,cancelable:true,
      detail:{value:this.value}
    });
    if(this.dispatchEvent(event))this.hidden=true;
  }
  _sync(){
    if(!this._body)return;
    const interactive=this.selectable&&!this.disabled;
    if(this.selectable){
      this._body.setAttribute("role","button");
      this._body.setAttribute("aria-pressed",String(this.selected));
      this._body.setAttribute("aria-disabled",String(this.disabled));
      this._body.tabIndex=interactive?0:-1;
    }else{
      this._body.removeAttribute("role");
      this._body.removeAttribute("aria-pressed");
      this._body.removeAttribute("aria-disabled");
      this._body.removeAttribute("tabindex");
    }
    const accessible=this.getAttribute("aria-label");
    if(accessible)this._body.setAttribute("aria-label",accessible);
    else this._body.removeAttribute("aria-label");
    this._fallback.textContent=this.getAttribute("label")??"";
    this._remove.disabled=this.disabled;
    const text=this.getAttribute("label")||this.textContent.trim()||this.value||"item";
    this._remove.setAttribute("aria-label","Remove "+text);
  }
}
define("cu-chip",CuChip);
