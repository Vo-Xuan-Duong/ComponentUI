
import { CuCheckbox } from "./checkbox.js";
import { define } from "./_shared.js";

export class CuSwitch extends CuCheckbox {
  static kind = "switch";
}

define("cu-switch", CuSwitch);
