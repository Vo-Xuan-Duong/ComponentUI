import { BrowserElement, mount, define } from "./_shared.js";
import { getIconNodes } from "../../../icons/src/icons.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const ALLOWED_ELEMENTS = new Set(["path","circle","rect","line","polyline","polygon","ellipse"]);
const ALLOWED_ATTRIBUTES = new Set([
  "d","cx","cy","r","rx","ry","x","y","width","height",
  "x1","x2","y1","y2","points","transform"
]);

const css = [
  ":host{display:inline-flex;align-items:center;justify-content:center;",
  "box-sizing:border-box;flex:none;vertical-align:middle;line-height:0;",
  "width:var(--cu-icon-size,20px);height:var(--cu-icon-size,20px);color:inherit;}",
  ":host([hidden]){display:none!important;}",
  "svg{display:block;width:100%;height:100%;overflow:visible;",
  "fill:none;stroke:currentColor;stroke-width:var(--cu-icon-stroke,2);",
  "stroke-linecap:round;stroke-linejoin:round;pointer-events:none;}"
].join("");

/**
 * Standardized SVG icon powered by locally bundled Lucide nodes.
 * Decorative by default. Use label="..." for an icon that needs its own
 * accessible name; icon-only buttons should label the BUTTON instead.
 */
export class CuIcon extends BrowserElement {
  static get observedAttributes() { return ["name","size","stroke-width","label"]; }
  constructor() {
    super();
    const root = mount(this, css,
      '<svg part="svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"></svg>');
    this._svg = root.querySelector("svg");
    this._autoLabel = null;
  }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }
  get name() { return this.getAttribute("name") || ""; }
  set name(value) { this.setAttribute("name", String(value)); }

  _render() {
    if (!this._svg) return;
    const nodes = getIconNodes(this.name) || [];
    const fragment = document.createDocumentFragment();
    for (const [tag, attributes] of nodes) {
      if (!ALLOWED_ELEMENTS.has(tag)) continue;
      const element = document.createElementNS(SVG_NS, tag);
      for (const [name,value] of Object.entries(attributes)) {
        if (ALLOWED_ATTRIBUTES.has(name)) element.setAttribute(name,String(value));
      }
      fragment.append(element);
    }
    this._svg.replaceChildren(fragment);

    const size = Number(this.getAttribute("size"));
    if (this.hasAttribute("size") && Number.isFinite(size) && size >= 12 && size <= 64)
      this.style.setProperty("--cu-icon-size",size+"px");
    else this.style.removeProperty("--cu-icon-size");

    const stroke = Number(this.getAttribute("stroke-width"));
    if (this.hasAttribute("stroke-width") && Number.isFinite(stroke) && stroke >= 1 && stroke <= 3)
      this.style.setProperty("--cu-icon-stroke",String(stroke));
    else this.style.removeProperty("--cu-icon-stroke");

    const label = this.getAttribute("label")?.trim();
    if (label) {
      this.setAttribute("aria-label",label);
      this.setAttribute("role","img");
      this.removeAttribute("aria-hidden");
      this._autoLabel = label;
    } else {
      if (this._autoLabel && this.getAttribute("aria-label") === this._autoLabel)
        this.removeAttribute("aria-label");
      if (!this.hasAttribute("aria-label")) {
        this.setAttribute("aria-hidden","true");
        if (this.getAttribute("role") === "img") this.removeAttribute("role");
      }
      this._autoLabel = null;
    }
  }
}

define("cu-icon",CuIcon);
