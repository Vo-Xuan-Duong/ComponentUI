import {CuTabs} from "./tabs.js";
import {define} from "./_shared.js";
export class CuTabView extends CuTabs{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=":host([variant=pill]) .tabs{background:var(--cu-surface-alt,#fafafa);border:1px solid var(--cu-border,#e5e5e5);border-radius:var(--cu-radius-lg,8px);padding:4px;}:host([variant=pill]) button{border:0;border-radius:var(--cu-radius-md,6px);}:host([variant=pill]) button[aria-selected=true]{background:var(--cu-state-selected);color:var(--cu-accent,#0067c0);}";this.shadowRoot.append(style);}

}
define("cu-tab-view",CuTabView);
