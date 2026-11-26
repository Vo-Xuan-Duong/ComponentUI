import {CuButton} from "./button.js";
import {define} from "./_shared.js";
export class CuFloatingActionButton extends CuButton{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=":host{display:inline-flex;}button{min-width:52px;min-height:52px;border-radius:16px;padding:0 17px;background:var(--cu-accent,#0067c0);border-color:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);box-shadow:0 3px 10px rgb(0 0 0/.16);}button:hover:not(:disabled){background:var(--cu-accent-hover,#005a9e);}:host([size=sm]) button{min-height:44px;min-width:44px;}:host([variant=outline]) button{background:var(--cu-surface,#fff);color:var(--cu-accent,#0067c0);}";this.shadowRoot.append(style);}

}
define("cu-floating-action-button",CuFloatingActionButton);
