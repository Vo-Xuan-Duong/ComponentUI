import {CuFileExplorer,normalizeFileEntries} from "./file-explorer.js";
import {define,notify} from "./_shared.js";
import "./command-bar.js";
export const FILE_MANAGER_ACTIONS=Object.freeze(["open","rename","delete","download","new-folder","upload","refresh"]);
export function fileManagerCommands(entry){
  return [{value:"new-folder",label:"New folder",icon:"folder"},{value:"upload",label:"Upload",icon:"upload"},{value:"rename",label:"Rename",disabled:!entry},{value:"delete",label:"Delete",disabled:!entry},{value:"download",label:"Download",disabled:entry?.kind!=="file"},{value:"refresh",label:"Refresh"}];
}
export class CuFileManager extends CuFileExplorer{
  constructor(){
    super();const bar=this.ownerDocument.createElement("cu-command-bar");bar.setAttribute("label","File commands");bar.maxVisible=6;this.shadowRoot.querySelector(".frame").prepend(bar);this._commands=bar;
    this.actions=[{value:"rename",label:"Rename"},{value:"delete",label:"Delete"},{value:"download",label:"Download"}];
    bar.addEventListener("cu-action",e=>{e.stopPropagation();this.requestAction(e.detail.value);});
    this.addEventListener("cu-select",()=>this._syncCommands());
    this.addEventListener("cu-change",()=>this._syncCommands());
    this._syncCommands();
  }
  get selectedEntry(){const entry=this._items.find(x=>x.id===this._selected&&(x.parentId||"")===this.folderId);return entry?{...entry}:null;}
  requestAction(action){
    const entry=this.selectedEntry;
    if(action==="open"){if(!entry)return false;this._open(entry);return true;}
    const command=fileManagerCommands(entry).find(c=>c.value===action);if(!command||command.disabled)return false;
    notify(this,"cu-action",{action,id:entry?.id??"",entry,folderId:this.folderId});return true;
  }
  _syncCommands(){if(this._commands)this._commands.commands=fileManagerCommands(this.selectedEntry);}
  _render(){super._render();this._syncCommands();}
}
define("cu-file-manager",CuFileManager);
