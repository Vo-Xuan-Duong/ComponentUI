import {CuToast} from "./toast.js";
import {define} from "./_shared.js";
export class CuSnackbar extends CuToast{
 constructor(){super();const style=this.ownerDocument.createElement("style");style.textContent=":host{inset:auto auto 16px 50%;transform:translateX(-50%);width:min(480px,calc(100vw - 32px));}.toast{align-items:center;}";this.shadowRoot.append(style);}
 _limit(){return this.hasAttribute("max-visible")?super._limit():1;}
}
define("cu-snackbar",CuSnackbar);
