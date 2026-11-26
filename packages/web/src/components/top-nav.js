import {CuNavigationView} from "./navigation-view.js";
import {define} from "./_shared.js";
export class CuTopNav extends CuNavigationView{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=".navigation{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}.heading{padding:0 8px;}.items{display:flex;flex:1;align-items:center;gap:4px;flex-wrap:wrap;}::slotted(a),::slotted(button){width:auto;min-height:36px;}.footer{border:0;padding:0;}";this.shadowRoot.append(style);}

}
define("cu-top-nav",CuTopNav);
