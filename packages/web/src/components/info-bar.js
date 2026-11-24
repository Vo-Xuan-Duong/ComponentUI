
import { BrowserElement, mount, notify, define } from "./_shared.js";
import "./icon.js";

const css=[
  ":host{--info-tone:var(--cu-accent,#0067c0);display:block;min-width:0;",
  "font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ":host([tone=success]){--info-tone:var(--cu-success,#107c41);}",
  ":host([tone=warning]){--info-tone:var(--cu-warning,#9a6700);}",
  ":host([tone=danger]){--info-tone:var(--cu-danger,#c42b1c);}",
  ".bar{display:flex;align-items:flex-start;gap:11px;box-sizing:border-box;",
  "padding:11px 13px;border:1px solid var(--cu-border-strong,#d1d1d1);",
  "border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}",
  ":host([variant=tinted]) .bar{background:color-mix(in srgb,var(--info-tone) 7%,var(--cu-surface,#fff));}",
  ".icon{flex:none;color:var(--info-tone);margin-top:1px;}",
  ".body{flex:1;min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;}",
  ".copy{flex:1;min-width:160px;display:grid;gap:3px;line-height:1.5;}",
  ".title{font-weight:650;}",
  ".title:empty,.message:empty{display:none;}",
  ".message{color:var(--cu-text-muted,#616161);}",
  ".actions{display:flex;align-items:center;flex-wrap:wrap;min-width:0;}",
  ".actions:has(slot:empty){display:none;}",
  ".close{display:grid;place-items:center;flex:none;min-width:28px;min-height:28px;",
  "border:0;border-radius:var(--cu-radius-md,6px);",
  "background:transparent;color:var(--cu-text-muted,#616161);cursor:pointer;}",
  ".close:hover{background:color-mix(in srgb,var(--cu-text,#242424) 9%,transparent);}",
  ".close:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".close[hidden]{display:none!important;}",
  "@media(forced-colors:active){.bar{border-color:CanvasText;}",
  ".icon{color:Highlight;}.close:focus-visible{outline-color:Highlight;}}"
].join("");

export class CuInfoBar extends BrowserElement {
  static get observedAttributes(){
    return ["title","message","tone","variant","dismissible"];
  }
  constructor(){
    super();
    const root=mount(this,css,
      '<div class="bar" part="bar">' +
      '<cu-icon class="icon" name="info" size="19" part="icon" aria-hidden="true"></cu-icon>' +
      '<div class="body"><div class="copy">' +
      '<span class="title" part="title"></span>' +
      '<span class="message" part="message"></span><slot></slot></div>' +
      '<div class="actions" part="actions"><slot name="action"></slot></div></div>' +
      '<button class="close" type="button" part="close" aria-label="Dismiss information" hidden>' +
      '<cu-icon name="x" size="16" aria-hidden="true"></cu-icon></button></div>');
    this._title=root.querySelector(".title");
    this._message=root.querySelector(".message");
    this._icon=root.querySelector(".icon");
    this._close=root.querySelector(".close");
    this._actions=root.querySelector(".actions");
    this._actionSlot=root.querySelector('slot[name="action"]');
    this._close.addEventListener("click",()=>this.dismiss());
    this._actionSlot.addEventListener("slotchange",()=>this._syncActions());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  dismiss(){
    if(this.hidden||!this.hasAttribute("dismissible"))return false;
    this.hidden=true;
    notify(this,"cu-dismiss",{tone:this.getAttribute("tone")||"info"});
    return true;
  }
  show(){this.hidden=false;}
  _syncActions(){this._actions.hidden=this._actionSlot.assignedElements({flatten:true}).length===0;}
  _sync(){
    if(!this._title)return;
    const tone=this.getAttribute("tone")||"info";
    const icons={info:"info",success:"circle-check",warning:"shield-check",danger:"x"};
    this._icon.name=icons[tone]||"info";
    this._title.textContent=this.getAttribute("title")||"";
    this._message.textContent=this.getAttribute("message")||"";
    this._close.hidden=!this.hasAttribute("dismissible");
    this.setAttribute("role",tone==="danger"?"alert":"status");
    this._syncActions();
  }
}
define("cu-info-bar",CuInfoBar);
