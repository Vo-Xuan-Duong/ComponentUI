import {CuAppShell} from "./app-shell.js";
import {define} from "./_shared.js";
export class CuDashboardShell extends CuAppShell{
 connectedCallback(){if(!this.hasAttribute("with-navigation"))this.withoutNavigation=true;super.connectedCallback();}
}
define("cu-dashboard-shell",CuDashboardShell);
