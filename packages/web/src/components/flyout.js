import {CuPopover} from "./popover.js";
import {define} from "./_shared.js";
export class CuFlyout extends CuPopover{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".panel{min-width:min(320px,calc(100vw - 30px));max-width:min(460px,calc(100vw - 30px));padding:var(--cu-flyout-padding,18px);}";this.shadowRoot.append(style);}
 _sync(){super._sync();if(this._panel)this._panel.setAttribute("aria-label",this.getAttribute("title")||"Flyout");}
}
define("cu-flyout",CuFlyout);
