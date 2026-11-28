import {CuTerminal} from "./terminal.js";
import {normalizePaletteCommands} from "./command-palette.js";
import {define} from "./_shared.js";
import "./kbd.js";
export class CuCommandConsole extends CuTerminal{
  constructor(){
    super();this._commands=[];
    const doc=this.ownerDocument,button=doc.createElement("cu-button"),palette=doc.createElement("cu-command-palette"),key=doc.createElement("cu-kbd");
    button.setAttribute("variant","outline");button.setAttribute("size","sm");button.textContent="Commands ";key.textContent="Ctrl/⌘ K";button.append(key);
    palette.setAttribute("title","Console commands");
    this.shadowRoot.querySelector(".toolbar").append(button);this.shadowRoot.append(palette);this._palette=palette;this._paletteButton=button;
    button.addEventListener("cu-press",e=>{e.stopPropagation();this.showCommands();});
    palette.addEventListener("cu-select",e=>{e.stopPropagation();this.submit(e.detail.value);});
    for(const type of ["cu-open","cu-close"])palette.addEventListener(type,e=>e.stopPropagation());
    this.addEventListener("keydown",e=>{if(!e.defaultPrevented&&!e.isComposing&&!e.repeat&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="k"&&!this.disabled){e.preventDefault();this.showCommands();}});
  }
  get commands(){return normalizePaletteCommands(this._commands);}
  set commands(v){this._commands=normalizePaletteCommands(v);this._palette.commands=this._commands;this._syncControls();}
  showCommands(){return !this.disabled&&this._commands.some(c=>!c.disabled)&&this._palette.show();}
  _syncControls(){super._syncControls();if(this._paletteButton){this._paletteButton.disabled=this.disabled||!this._commands.some(c=>!c.disabled);if(this.disabled)this._palette.close("disabled");}}
}
define("cu-command-console",CuCommandConsole);
