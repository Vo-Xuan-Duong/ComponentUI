import {CuTabs} from "./tabs.js";
import {define} from "./_shared.js";
export class CuVerticalTabs extends CuTabs{
 connectedCallback(){this.setAttribute("orientation","vertical");super.connectedCallback();}
}
define("cu-vertical-tabs",CuVerticalTabs);
