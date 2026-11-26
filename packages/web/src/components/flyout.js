import {CuPopover} from "./popover.js";
import {define} from "./_shared.js";
export class CuFlyout extends CuPopover{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".panel{min-width:min(320px,calc(100vw - 30px));max-width:min(460px,calc(100vw - 30px));padding:18px;}";this.shadowRoot.append(style);}

}
define("cu-flyout",CuFlyout);
