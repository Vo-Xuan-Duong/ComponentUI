import {CuPopover} from "./popover.js";
import {define} from "./_shared.js";
import {restoreOverlayFocus} from "./_overlay.js";
export class CuTeachingTip extends CuPopover{
 constructor(){super();const doc=this.ownerDocument;this._heading=doc.createElement("div");this._heading.className="tip-heading";const dismiss=doc.createElement("button");dismiss.type="button";dismiss.textContent="Got it";dismiss.className="tip-dismiss";this._panel.prepend(this._heading);this._panel.append(dismiss);dismiss.addEventListener("click",()=>{this.hide();restoreOverlayFocus(this._trigger.assignedElements({flatten:true})[0]);});const style=doc.createElement("style");style.textContent=".panel{border-top:3px solid var(--cu-accent,#0067c0);}.tip-heading{font-weight:650;margin-bottom:6px;}.tip-dismiss{display:block;margin:12px 0 0 auto;padding:6px 12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:6px;background:var(--cu-surface,#fff);color:inherit;font:600 12px var(--cu-font-body,system-ui);cursor:pointer;}.tip-dismiss:hover{background:var(--cu-state-hover);}";this.shadowRoot.append(style);}
 _sync(){super._sync();if(this._heading)this._heading.textContent=this.getAttribute("title")||"Tip";}
}
define("cu-teaching-tip",CuTeachingTip);
