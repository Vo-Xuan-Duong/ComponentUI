import {CuAlert} from "./alert.js";
import {define} from "./_shared.js";
export class CuCallout extends CuAlert{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".alert{border-inline-start:4px solid var(--alert-accent);border-radius:var(--cu-radius-md,6px);padding:14px 16px;}";this.shadowRoot.append(style);}

}
define("cu-callout",CuCallout);
