import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";
import "./icon.js";

const css=[
  ":host{display:block;min-width:0;container-type:inline-size;font-family:var(--cu-font-body,system-ui);",
  "color:var(--cu-text,#242424);}",
  ":host([hidden]){display:none!important;}",
  ".layout{position:relative;display:grid;min-width:0;min-height:var(--cu-appshell-min-height,360px);",
  "grid-template-columns:var(--cu-appshell-nav-width,232px) minmax(0,1fr) var(--cu-appshell-aside-width,250px);",
  "grid-template-rows:auto minmax(0,1fr) auto;grid-template-areas:",
  "'header header header' 'navigation content aside' 'footer footer footer';",
  "border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-xl,12px);",
  "overflow:hidden;background:var(--cu-canvas,#f3f3f3);}",
  ":host(:not([has-aside])) .layout{grid-template-columns:var(--cu-appshell-nav-width,232px) minmax(0,1fr);",
  "grid-template-areas:'header header' 'navigation content' 'footer footer';}",
  ".header{grid-area:header;display:flex;align-items:center;gap:12px;min-width:0;",
  "min-height:var(--cu-appshell-header-height,52px);padding:9px 16px;",
  "border-bottom:1px solid var(--cu-border,#e5e5e5);background:var(--cu-surface,#fff);}",
  ".heading{flex:1;min-width:0;}",
  ".navigation{grid-area:navigation;min-width:0;padding:12px;overflow:auto;",
  "border-inline-end:1px solid var(--cu-border,#e5e5e5);",
  "background:color-mix(in srgb,var(--cu-canvas,#f3f3f3) 74%,var(--cu-surface,#fff));}",
  ".content{grid-area:content;min-width:0;padding:var(--cu-appshell-content-padding,20px);overflow:auto;}",
  ".aside{grid-area:aside;min-width:0;padding:16px;overflow:auto;",
  "background:var(--cu-surface,#fff);border-inline-start:1px solid var(--cu-border,#e5e5e5);}",
  ":host(:not([has-aside])) .aside{display:none!important;}",
  ".footer{grid-area:footer;padding:9px 16px;background:var(--cu-surface,#fff);",
  "border-top:1px solid var(--cu-border,#e5e5e5);}",
  ":host(:not([has-footer])) .footer{display:none!important;}",
  "::slotted([slot=navigation]){display:block;min-width:0;}",
  ".toggle{display:none;align-items:center;justify-content:center;flex:none;width:34px;height:34px;",
  "border:0;border-radius:var(--cu-radius-md,6px);color:inherit;background:transparent;cursor:pointer;}",
  ".toggle:hover{background:color-mix(in srgb,var(--cu-text,#242424) 8%,transparent);}",
  ".toggle:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:2px;}",
  ".scrim{display:none;border:0;}",
  ":host([without-navigation]) .navigation{display:none!important;}",
  ":host([without-navigation]) .toggle{display:none!important;}",
  ":host([without-navigation]) .layout{grid-template-columns:minmax(0,1fr) var(--cu-appshell-aside-width,250px);",
  "grid-template-areas:'header header' 'content aside' 'footer footer';}",
  ":host([without-navigation]:not([has-aside])) .layout{grid-template-columns:minmax(0,1fr);",
  "grid-template-areas:'header' 'content' 'footer';}",
  "@container (max-width:720px){",
  ".layout{grid-template-columns:minmax(0,1fr)!important;",
  "grid-template-areas:'header' 'content' 'footer'!important;}",
  ".toggle{display:inline-flex;}",
  ".navigation{position:absolute;z-index:3;top:var(--cu-appshell-header-height,52px);bottom:0;left:0;",
  "width:min(260px,calc(100% - 48px));max-width:100%;box-sizing:border-box;",
  "background:var(--cu-surface,#fff);border:0;border-inline-end:1px solid var(--cu-border,#e5e5e5);",
  "box-shadow:var(--cu-shadow-flyout,0 12px 28px rgb(0 0 0 / .16));",
  "visibility:hidden;pointer-events:none;}",
  ":host([navigation-open]) .navigation{visibility:visible;pointer-events:auto;}",
  ".scrim{position:absolute;z-index:2;inset:var(--cu-appshell-header-height,52px) 0 0;",
  "width:100%;background:rgb(0 0 0 / .3);cursor:pointer;}",
  ":host([navigation-open]) .scrim{display:block;}",
  ".aside{display:none!important;}",
  ".content{padding:var(--cu-appshell-content-padding,16px);}",
  "}",
  "@media(forced-colors:active){.layout{border-color:CanvasText;}.navigation{border-color:CanvasText;}}",
  "@media(prefers-reduced-motion:reduce){.navigation{transition:none;}}",
  focusStyle
].join("");

let uid=0;
export class CuAppShell extends BrowserElement {
  static get observedAttributes(){return ["navigation-open","without-navigation"];}
  constructor(){
    super();
    const id="cu-appshell-"+ ++uid;
    const root=mount(this,css,
      '<div class="layout" part="layout">' +
      '<header class="header" part="header"><button type="button" class="toggle" part="toggle" ' +
      'aria-label="Open navigation" aria-expanded="false"><cu-icon name="menu" size="19"></cu-icon>' +
      '</button><div class="heading"><slot name="header"></slot></div></header>' +
      '<aside class="navigation" part="navigation" role="navigation" aria-label="Application navigation" id="'+id+'-nav">' +
      '<slot name="navigation"></slot></aside><button class="scrim" type="button" ' +
      'tabindex="-1" aria-label="Close navigation"></button>' +
      '<main class="content" part="content"><slot></slot></main>' +
      '<aside class="aside" part="aside"><slot name="aside"></slot></aside>' +
      '<footer class="footer" part="footer"><slot name="footer"></slot></footer></div>');
    this._toggle=root.querySelector(".toggle");
    this._nav=root.querySelector(".navigation");
    this._aside=root.querySelector(".aside");
    this._scrim=root.querySelector(".scrim");
    this._asideSlot=root.querySelector('slot[name="aside"]');
    this._footerSlot=root.querySelector('slot[name="footer"]');
    this._navSlot=root.querySelector('slot[name="navigation"]');
    this._toggle.setAttribute("aria-controls",id+"-nav");
    this._toggle.addEventListener("click",()=>this.toggleNavigation());
    this._scrim.addEventListener("click",()=>this.closeNavigation(true));
    this._asideSlot.addEventListener("slotchange",()=>this._syncSlots());
    this._footerSlot.addEventListener("slotchange",()=>this._syncSlots());
    this._navSlot.addEventListener("slotchange",()=>this._sync());
    this.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&this.navigationOpen){
        event.preventDefault();this.closeNavigation(true);
      }
    });
    this.addEventListener("click",event=>{
      const el=event.target;
      if(this.navigationOpen && el?.closest?.("a[href]") &&
        el.closest('[slot="navigation"]'))this.closeNavigation(false);
    });
  }
  connectedCallback(){this._syncSlots();this._sync();}
  attributeChangedCallback(){this._sync();}
  get withoutNavigation(){return this.hasAttribute("without-navigation");}
  set withoutNavigation(value){this.toggleAttribute("without-navigation",Boolean(value));}
  get navigationOpen(){return this.hasAttribute("navigation-open");}
  set navigationOpen(value){this.toggleAttribute("navigation-open",Boolean(value));}
  openNavigation(){
    if(this.hasAttribute("without-navigation")||this.navigationOpen)return;
    this.navigationOpen=true;
    notify(this,"cu-navigation-toggle",{open:true});
    // Focus slotted navigation content, if supplied, for keyboard users.
    const container=this._navSlot.assignedElements({flatten:true})[0];
    const first=container?.matches?.("a,button,[tabindex]")?container:
      container?.querySelector?.('a[href],button:not(:disabled),[tabindex="0"]');
    first?.focus?.();
  }
  closeNavigation(restoreFocus=false){
    if(!this.navigationOpen)return;
    this.navigationOpen=false;
    notify(this,"cu-navigation-toggle",{open:false});
    if(restoreFocus)this._toggle.focus();
  }
  toggleNavigation(){
    this.navigationOpen?this.closeNavigation(true):this.openNavigation();
  }
  _syncSlots(){
    this.toggleAttribute("has-aside",this._asideSlot.assignedElements({flatten:true}).length>0);
    this.toggleAttribute("has-footer",this._footerSlot.assignedElements({flatten:true}).length>0);
  }
  _sync(){
    if(!this._toggle)return;
    const hasNav=!this.hasAttribute("without-navigation");
    // A disabled navigation region cannot keep an invisible scrim open.
    if(!hasNav&&this.navigationOpen)this.navigationOpen=false;
    this._toggle.disabled=!hasNav;
    this._toggle.setAttribute("aria-expanded",String(this.navigationOpen));
    this._toggle.setAttribute("aria-label",this.navigationOpen?"Close navigation":"Open navigation");
  }
}
define("cu-app-shell",CuAppShell);
