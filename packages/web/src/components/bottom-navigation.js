import {CuNavigationView} from "./navigation-view.js";
import {define} from "./_shared.js";
export class CuBottomNavigation extends CuNavigationView{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".navigation{border-top:1px solid var(--cu-border,#e5e5e5);padding:6px;background:var(--cu-surface,#fff);}.heading{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);}.items{display:flex;justify-content:space-around;gap:4px;overflow:auto;}::slotted(a),::slotted(button){flex:1 0 auto;min-width:56px;width:auto;justify-content:center;flex-direction:column;gap:4px;text-align:center;font-size:12px;}";this.shadowRoot.append(style);}

}
define("cu-bottom-navigation",CuBottomNavigation);
