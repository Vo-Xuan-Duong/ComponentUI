
import { BrowserElement, mount, define } from "./_shared.js";

const css = [
  ":host{display:inline-flex;vertical-align:middle;flex:none;width:36px;height:36px;",
  "font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ":host([size=sm]){width:28px;height:28px;}",
  ":host([size=lg]){width:48px;height:48px;}",
  ":host([size=xl]){width:64px;height:64px;}",
  ".avatar{box-sizing:border-box;position:relative;display:grid;place-items:center;",
  "width:100%;height:100%;overflow:hidden;border-radius:50%;",
  "border:1px solid var(--cu-border,#e5e5e5);",
  "background:color-mix(in srgb,var(--cu-accent,#0067c0) 13%,var(--cu-surface,#fff));",
  "color:var(--cu-accent,#0067c0);font:700 13px var(--cu-font-body,system-ui);}",
  ":host([shape=square]) .avatar{border-radius:var(--cu-radius-lg,8px);}",
  ":host([size=lg]) .avatar{font-size:16px;}",
  ":host([size=xl]) .avatar{font-size:21px;}",
  "img{width:100%;height:100%;object-fit:cover;display:block;}",
  "img[hidden]{display:none!important;}",
  ".fallback[hidden]{display:none!important;}"
].join("");

export function initialsFromName(name) {
  const parts = String(name ?? "").trim().split(/\s+/u).filter(Boolean);
  if (!parts.length) return "?";
  const chars = [parts[0],...(parts.length > 1 ? [parts[parts.length - 1]] : [])]
    .map(part => Array.from(part)[0]).join("");
  return chars.toLocaleUpperCase();
}
export class CuAvatar extends BrowserElement {
  static get observedAttributes() { return ["name","src","alt","size","shape"]; }
  constructor() {
    super();
    const root = mount(this,css,
      '<span class="avatar" part="avatar"><img part="image" alt="" hidden>' +
      '<span class="fallback" part="fallback" aria-hidden="true">?</span></span>');
    this._img = root.querySelector("img");
    this._fallback = root.querySelector(".fallback");
    this._img.addEventListener("load",() => this._showImage(true));
    this._img.addEventListener("error",() => this._showImage(false));
  }
  connectedCallback() { this._sync(); }
  attributeChangedCallback() { this._sync(); }
  _showImage(valid) {
    this._img.hidden = !valid;
    this._fallback.hidden = valid;
  }
  _sync() {
    if (!this._img) return;
    const name = this.getAttribute("name") ?? "";
    this._fallback.textContent = initialsFromName(name);
    if (!this.hasAttribute("role")) this.setAttribute("role","img");
    const autoLabel = this.getAttribute("alt") || name || "Avatar";
    if (!this.hasAttribute("aria-label") || this.getAttribute("aria-label") === this._autoLabel) {
      this.setAttribute("aria-label",autoLabel);
      this._autoLabel = autoLabel;
    }
    const src = this.getAttribute("src");
    if (!src) {
      this._img.removeAttribute("src");
      this._showImage(false);
    } else if (this._img.getAttribute("src") !== src) {
      this._showImage(false);
      this._img.src = src;
    }
  }
}
define("cu-avatar",CuAvatar);
