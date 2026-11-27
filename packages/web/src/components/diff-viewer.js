import {BrowserElement,mount,define} from "./_shared.js";
import "./split-view.js";
import "./code-block.js";
import "./badge.js";
export function diffLines(before,after,limit=400){
  const lines=v=>String(v??"").replace(/\r\n?/g,"\n").split("\n");
  const a=lines(before),b=lines(after);
  if(a.length>limit||b.length>limit)return {limited:true,rows:[],added:0,removed:0};
  const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
  const rows=[];let i=0,j=0,added=0,removed=0;
  while(i<a.length||j<b.length){
    if(i<a.length&&j<b.length&&a[i]===b[j])rows.push({kind:"equal",before:a[i++],after:b[j++]});
    else if(i<a.length&&(j===b.length||dp[i+1][j]>=dp[i][j+1])){rows.push({kind:"remove",before:a[i++],after:null});removed++;}
    else{rows.push({kind:"add",before:null,after:b[j++]});added++;}
  }
  return {limited:false,rows,added,removed};
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}.summary{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}cu-split-view{height:var(--cu-diff-height,360px);}";
export class CuDiffViewer extends BrowserElement{
  static get observedAttributes(){return ["before","after"];}
  constructor(){
    super();this._before="";this._after="";
    const root=mount(this,css,'<section class="panel" aria-label="Text differences"><div class="summary"><cu-badge tone="success" class="added"></cu-badge><cu-badge tone="danger" class="removed"></cu-badge><span class="status" role="status"></span></div><cu-split-view position="50" min="20" max="80" label="Compare text"><cu-code-block slot="sidebar" language="Before"></cu-code-block><cu-code-block slot="content" language="After"></cu-code-block></cu-split-view></section>');
    this._split=root.querySelector("cu-split-view");this._left=root.querySelector('[slot="sidebar"]');this._right=root.querySelector('[slot="content"]');this._added=root.querySelector(".added");this._removed=root.querySelector(".removed");this._status=root.querySelector(".status");
    for(const type of ["cu-input","cu-change"])this._split.addEventListener(type,e=>{if(e.target===this._split)e.stopPropagation();});
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(name){if(name==="before")this._before=this.getAttribute("before")??"";else this._after=this.getAttribute("after")??"";this._render();}
  get before(){return this._before;}set before(v){this._before=String(v??"");this._render();}
  get after(){return this._after;}set after(v){this._after=String(v??"");this._render();}
  _render(){
    if(!this._left)return;
    const d=diffLines(this.before,this.after);
    this._added.hidden=d.limited;this._removed.hidden=d.limited;
    this._added.textContent="+"+d.added+" added";this._removed.textContent="−"+d.removed+" removed";
    this._status.textContent=d.limited?"Limit: 400 lines per side; showing original text.":d.added||d.removed?"Line comparison":"No changes";
    this._left.value=d.limited?this.before:d.rows.map(r=>r.before===null?"":(r.kind==="remove"?"- ":"  ")+r.before).join("\n");
    this._right.value=d.limited?this.after:d.rows.map(r=>r.after===null?"":(r.kind==="add"?"+ ":"  ")+r.after).join("\n");
  }
}
define("cu-diff-viewer",CuDiffViewer);
