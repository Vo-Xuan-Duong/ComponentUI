import { CuDatePicker } from "./date-picker.js";
import { define } from "./_shared.js";

/** Native localized time input, with a timezone-free 24-hour value. */
export class CuTimePicker extends CuDatePicker {
  static get observedAttributes(){return [...super.observedAttributes,"step"];}
  constructor(){
    super();
    this._input.type="time";
  }
  _sync(){
    if(!this._input)return;
    const step=this.getAttribute("step");
    if(step===null)this._input.removeAttribute("step");
    else this._input.setAttribute("step",step);
    super._sync();
  }
}
define("cu-time-picker",CuTimePicker);
