import {CuNavigationView} from "./navigation-view.js";
import {define} from "./_shared.js";
export class CuSidebar extends CuNavigationView{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=":host{background:var(--cu-surface-alt,#fafafa);border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);padding:10px;box-sizing:border-box;}:host([variant=plain]){border:0;background:transparent;padding:0;}";this.shadowRoot.append(style);}

}
define("cu-sidebar",CuSidebar);
