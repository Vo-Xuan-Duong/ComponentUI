import {CuPopover} from "./popover.js";
import {define} from "./_shared.js";
import "./button.js";
import {restoreOverlayFocus} from "./_overlay.js";
export class CuTeachingTip extends CuPopover{
 constructor(){super();const doc=this.ownerDocument;this._heading=doc.createElement("div");this._heading.className="tip-heading";const dismiss=doc.createElement("cu-button");dismiss.setAttribute("variant","accent");dismiss.setAttribute("size","sm");dismiss.textContent="Got it";dismiss.className="tip-dismiss";this._panel.prepend(this._heading);this._panel.append(dismiss);dismiss.addEventListener("cu-press",event=>{event.stopPropagation();this.hide();restoreOverlayFocus(this._trigger.assignedElements({flatten:true})[0]);});const style=doc.createElement("style");style.textContent=".panel{border-top:3px solid var(--cu-accent,#0067c0);}.tip-heading{font-weight:650;margin-bottom:6px;}.tip-dismiss{display:flex;width:max-content;margin:12px 0 0 auto;}";this.shadowRoot.append(style);}
 _sync(){super._sync();if(this._heading)this._heading.textContent=this.getAttribute("title")||"Tip";}
}
define("cu-teaching-tip",CuTeachingTip);
