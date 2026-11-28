import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./virtual-list.js";
import "./text-field.js";
import "./button.js";
export function normalizeTerminalLines(lines,max=1000){
  const limit=Math.max(1,Math.min(10000,Math.floor(Number(max)||1000)));
  return (Array.isArray(lines)?lines:[]).flatMap(x=>{
    const line=typeof x==="string"?{text:x}:x;
    if(!line||typeof line.text!=="string")return [];
    const kind=["command","output","error"].includes(line.kind)?line.kind:"output";
    return line.text.replace(/\r\n?/g,"\n").split("\n").map(text=>({kind,text}));
  }).slice(-limit);
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}.toolbar,.entry{display:flex;align-items:end;gap:8px;}.toolbar{justify-content:space-between;align-items:center;}.entry cu-text-field{flex:1;min-width:0;}cu-virtual-list{height:var(--cu-terminal-height,280px);font-family:var(--cu-font-mono,monospace);}cu-text-field::part(input){font-family:var(--cu-font-mono,monospace);}.status{color:var(--cu-text-muted,#616161);font-size:12px;}.detail{white-space:pre-wrap;overflow-wrap:anywhere;font:12px var(--cu-font-mono,monospace);margin:0;}.detail[hidden]{display:none;}";
export class CuTerminal extends BrowserElement{
  static get observedAttributes(){return ["max-lines","prompt","disabled"];}
  constructor(){
    super();this._lines=[];this._history=[];this._historyIndex=0;this._draft="";
    const root=mount(this,css,'<section class="panel" aria-label="Command console"><div class="toolbar"><span class="status" role="status"></span><cu-button variant="outline" size="sm" class="clear">Clear output</cu-button></div><cu-virtual-list label="Console output" item-height="28" empty-text="No output"></cu-virtual-list><pre class="detail" part="detail" hidden></pre><div class="entry"><cu-text-field aria-label="Command" placeholder="Enter command"></cu-text-field><cu-button variant="accent" class="run">Run</cu-button></div></section>');
    this._list=root.querySelector("cu-virtual-list");this._field=root.querySelector("cu-text-field");this._run=root.querySelector(".run");this._clear=root.querySelector(".clear");this._status=root.querySelector(".status");this._detail=root.querySelector(".detail");
    for(const type of ["cu-input","cu-change"])this._field.addEventListener(type,e=>{e.stopPropagation();this._syncControls();});
    this._field.addEventListener("keydown",e=>{if(e.isComposing||this.disabled)return;if(e.key==="Enter"){e.preventDefault();e.stopPropagation();this.submit(this._field.value);}else if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();this._navigateHistory(e.key==="ArrowUp"?-1:1);}});
    this._run.addEventListener("cu-press",e=>{e.stopPropagation();this.submit(this._field.value);});
    this._clear.addEventListener("cu-press",e=>{e.stopPropagation();this.clear();});
    this._list.addEventListener("cu-change",e=>{e.stopPropagation();const line=this._lines[e.detail.index];this._detail.hidden=!line;this._detail.textContent=line?.text??"";});
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(){if(this._list){this._lines=normalizeTerminalLines(this._lines,this.maxLines);this._render();}}
  get maxLines(){return Math.max(1,Math.min(10000,Math.floor(Number(this.getAttribute("max-lines"))||1000)));}
  get prompt(){return this.getAttribute("prompt")||"$";}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  get lines(){return this._lines.map(x=>({...x}));}set lines(v){this._lines=normalizeTerminalLines(v,this.maxLines);this._render();}
  append(text,kind="output"){this._lines=normalizeTerminalLines([...this._lines,{text:String(text??""),kind}],this.maxLines);this._render();}
  clear(){if(this.disabled)return false;this._lines=[];this._render();notify(this,"cu-action",{action:"clear"});return true;}
  submit(command){
    const value=String(command??"").trim();if(this.disabled||!value)return false;
    this._history=[...this._history,value].slice(-100);this._historyIndex=this._history.length;this._draft="";
    this._field.value="";this.append(this.prompt+" "+value,"command");this._field.focus();
    notify(this,"cu-action",{action:"submit",value});return true;
  }
  _navigateHistory(direction){
    if(!this._history.length)return;
    if(this._historyIndex===this._history.length)this._draft=this._field.value;
    this._historyIndex=Math.min(this._history.length,Math.max(0,this._historyIndex+direction));
    this._field.value=this._history[this._historyIndex]??this._draft;this._syncControls();
  }
  _syncControls(){if(!this._field)return;this._field.disabled=this.disabled;this._run.disabled=this.disabled||!this._field.value.trim();this._clear.disabled=this.disabled||!this._lines.length;}
  _render(){
    if(!this._list)return;
    this._list.items=this._lines.map((line,i)=>({id:String(i),label:line.kind==="error"?"[error] "+line.text:line.text||" "}));
    this._list.selectedIndex=-1;
    if(this._lines.length)this._list.scrollToIndex(this._lines.length-1,"end");
    this._detail.hidden=true;this._detail.textContent="";this._status.textContent=this._lines.length+" lines";this._syncControls();
  }
}
define("cu-terminal",CuTerminal);
