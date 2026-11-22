
import { BrowserElement, mount, define } from "./_shared.js";
import "./icon.js";

/** Data-only declarative child for cu-breadcrumb. */
export class CuBreadcrumbItem extends BrowserElement {
  static get observedAttributes() { return ["href","current","label"]; }
}
define("cu-breadcrumb-item",CuBreadcrumbItem);

const css = [
  ":host{display:block;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  "nav{min-width:0;}",
  "ol{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:0;margin:0;",
  "list-style:none;min-width:0;}",
  "li{display:inline-flex;align-items:center;min-width:0;gap:6px;font-size:13px;}",
  "a{color:var(--cu-text-muted,#616161);text-decoration:none;padding:5px 7px;",
  "border-radius:var(--cu-radius-sm,4px);}",
  "a:hover{background:color-mix(in srgb,var(--cu-accent,#0067c0) 10%,var(--cu-surface,#fff));",
  "color:var(--cu-text,#242424);text-decoration:underline;}",
  "a:focus-visible{outline:2px solid var(--cu-focus,#0067c0);outline-offset:1px;}",
  ".current{font-weight:650;color:var(--cu-text,#242424);padding:5px 7px;}",
  ".separator{flex:none;color:var(--cu-text-muted,#616161);}",
  "slot{display:none!important;}",
  "@media(forced-colors:active){a:hover{outline:1px solid Highlight;}}"
].join("");

export function safeBreadcrumbHref(href) {
  if (typeof href !== "string") return null;
  const value=href.trim();
  if (!value || /[\u0000-\u001f\u007f]/u.test(value)) return null;
  if (/^(?:https?:\/\/|mailto:)/i.test(value)) return value;
  if (/^(?:\.{1,2}\/|\/|#)/.test(value) && !/^\/\//.test(value)) return value;
  // Plain document-relative URLs must not contain a protocol-like prefix.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("\\"))
    return value;
  return null;
}

export class CuBreadcrumb extends BrowserElement {
  static get observedAttributes() { return ["label"]; }
  constructor() {
    super();
    const root=mount(this,css,
      '<nav part="nav" aria-label="Breadcrumb"><ol part="list"></ol></nav><slot></slot>');
    this._nav=root.querySelector("nav");
    this._list=root.querySelector("ol");
    this._observer=null;
  }
  connectedCallback() {
    this._render();
    if (globalThis.MutationObserver) {
      this._observer?.disconnect();
      this._observer=new MutationObserver(records => {
        if (records.some(r=>r.type==="childList"||r.type==="characterData"||
          ["href","current","label"].includes(r.attributeName))) this._render();
      });
      this._observer.observe(this,{
        childList:true,subtree:true,characterData:true,attributes:true,
        attributeFilter:["href","current","label"]
      });
    }
  }
  disconnectedCallback() { this._observer?.disconnect();this._observer=null; }
  attributeChangedCallback() { this._render(); }
  _render() {
    if (!this._list) return;
    this._nav.setAttribute("aria-label",this.getAttribute("label") || "Breadcrumb");
    const items=[...this.children].filter(x=>x.localName==="cu-breadcrumb-item");
    this._list.replaceChildren();
    const currentIndex=items.findIndex(item=>item.hasAttribute("current"));
    const active=currentIndex>=0 ? currentIndex : items.length-1;
    items.forEach((item,index)=>{
      const li=document.createElement("li");
      const label=item.getAttribute("label") || item.textContent.trim() || "Untitled";
      const href=safeBreadcrumbHref(item.getAttribute("href"));
      const isCurrent=index===active;
      if (!isCurrent && href) {
        const link=document.createElement("a");
        link.href=href;
        link.textContent=label;
        li.append(link);
      } else {
        const text=document.createElement("span");
        text.className=isCurrent?"current":"label";
        text.textContent=label;
        if (isCurrent) text.setAttribute("aria-current","page");
        li.append(text);
      }
      if (index<items.length-1) {
        const separator=document.createElement("cu-icon");
        separator.name="chevron-right";
        separator.setAttribute("size","14");
        separator.className="separator";
        separator.setAttribute("aria-hidden","true");
        li.append(separator);
      }
      this._list.append(li);
    });
  }
}
define("cu-breadcrumb",CuBreadcrumb);
