import {CuMenu} from "./menu.js";
import {define} from "./_shared.js";
import "./icon.js";
export class CuMenuButton extends CuMenu{
 static get observedAttributes(){return [...super.observedAttributes,"label","disabled"];}
 constructor(){super();const doc=this.ownerDocument;const button=doc.createElement("button");button.type="button";button.className="menu-trigger";this._label=doc.createElement("span");const icon=doc.createElement("cu-icon");icon.setAttribute("name","chevron-down");icon.setAttribute("size","14");icon.setAttribute("aria-hidden","true");button.append(this._label,icon);this._defaultTrigger=button;this._trigger.append(button);const style=doc.createElement("style");style.textContent=".menu-trigger{display:inline-flex;align-items:center;gap:8px;min-height:var(--cu-control-height,40px);padding:0 12px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-md,6px);color:var(--cu-text,#242424);background:var(--cu-surface,#fff);font:600 13px var(--cu-font-body,system-ui);cursor:pointer;}.menu-trigger:hover:not(:disabled){background:var(--cu-state-hover);}.menu-trigger:disabled{opacity:.5;cursor:default;}";this.shadowRoot.append(style);}
 get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
 _triggerElements(){const triggers=super._triggerElements();return triggers.length?triggers:[this._defaultTrigger].filter(Boolean);}
 show(focus){if(!this.disabled)super.show(focus);}
 _sync(){super._sync();if(!this._defaultTrigger)return;this._defaultTrigger.disabled=this.disabled;this._label.textContent=this.getAttribute("label")||"Actions";if(this.disabled&&this.open)this.hide();}
}
define("cu-menu-button",CuMenuButton);
