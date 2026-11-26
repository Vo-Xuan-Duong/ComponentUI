import {CuInfoBar} from "./info-bar.js";
import {define} from "./_shared.js";
export class CuBanner extends CuInfoBar{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".bar{border-radius:0;border-inline:0;background:color-mix(in srgb,var(--info-tone) 9%,var(--cu-surface,#fff));padding:12px 16px;}";this.shadowRoot.append(style);}
 _sync(){super._sync();if(this._title)this.setAttribute("role",this.getAttribute("tone")==="danger"?"alert":"status");}
}
define("cu-banner",CuBanner);
