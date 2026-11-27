import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./tree-view.js";
import "./search-box.js";
import "./code-block.js";
import "./split-view.js";
import "./empty-state.js";
export function buildJsonTree(value,{maxNodes=500,maxDepth=20}={}){
  let count=0,truncated=false;
  function visit(v,key,path,depth){
    if(count>=maxNodes){truncated=true;return null;}
    count++;
    const container=v!==null&&typeof v==="object";
    const node={path,value:v,label:key+": "+(container?(Array.isArray(v)?"Array ("+v.length+")":"Object"):String(JSON.stringify(v))),children:[]};
    if(container){
      if(depth>=maxDepth){truncated=true;return node;}
      for(const k of Object.keys(v)){
        if(count>=maxNodes){truncated=true;break;}
        const child=visit(v[k],k,path+"/"+k.replace(/~/g,"~0").replace(/\//g,"~1"),depth+1);
        if(child)node.children.push(child);
      }
    }
    return node;
  }
  return {root:visit(value,"$","$",0),count,truncated};
}
export function filterJsonTree(node,query){
  if(!node)return null;
  const q=String(query??"").trim().toLowerCase();
  if(!q)return node;
  const children=node.children.map(child=>filterJsonTree(child,q)).filter(Boolean);
  return node.label.toLowerCase().includes(q)||children.length?{...node,children}:null;
}
const css=":host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-3,12px);}cu-split-view{height:var(--cu-json-height,360px);}cu-tree-view::part(tree){max-height:320px;}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuJsonViewer extends BrowserElement{
  static get observedAttributes(){return ["value","query"];}
  constructor(){
    super();this._value="{}";this._nodes=new Map();
    const root=mount(this,css,'<section class="panel" aria-label="JSON viewer"><cu-search-box aria-label="Search JSON" placeholder="Search keys or values"></cu-search-box><div class="status" role="status"></div><cu-split-view position="45" min="20" max="80" label="JSON tree and detail"><cu-tree-view slot="sidebar" label="JSON structure"></cu-tree-view><cu-code-block slot="content" language="JSON" copyable></cu-code-block></cu-split-view><cu-empty-state size="sm" title="No matching JSON nodes" hidden></cu-empty-state></section>');
    this._search=root.querySelector("cu-search-box");this._tree=root.querySelector("cu-tree-view");this._code=root.querySelector("cu-code-block");this._split=root.querySelector("cu-split-view");this._status=root.querySelector(".status");this._empty=root.querySelector("cu-empty-state");
    this._search.addEventListener("cu-input",e=>{e.stopPropagation();this.query=e.detail.value;});
    for(const type of ["cu-change","cu-search"])this._search.addEventListener(type,e=>e.stopPropagation());
    this._tree.addEventListener("cu-change",e=>{e.stopPropagation();const node=this._nodes.get(e.detail.value);if(!node)return;this._code.value=JSON.stringify(node.value,null,2);notify(this,"cu-select",{value:node.path,path:node.path});});
    this._tree.addEventListener("cu-toggle",e=>e.stopPropagation());
    for(const type of ["cu-input","cu-change"])this._split.addEventListener(type,e=>{if(e.target===this._split)e.stopPropagation();});
    this._code.addEventListener("cu-action",e=>e.stopPropagation());
  }
  connectedCallback(){this._render();}
  attributeChangedCallback(name){if(name==="value")this._value=this.getAttribute("value")??"{}";this._render();}
  get value(){return this._value;}set value(v){this._value=String(v??"{}");this._render();}
  get query(){return this.getAttribute("query")||"";}set query(v){this.setAttribute("query",String(v??""));}
  _render(){
    if(!this._tree)return;
    if(this._search.value!==this.query)this._search.value=this.query;
    let parsed;
    try{parsed=JSON.parse(this.value);}catch{this._tree.replaceChildren();this._nodes.clear();this._code.value=this.value;this._status.textContent="Invalid JSON";this._split.hidden=false;this._empty.hidden=true;return;}
    const data=buildJsonTree(parsed),filtered=filterJsonTree(data.root,this.query);
    this._nodes.clear();
    const make=(node,depth)=>{this._nodes.set(node.path,node);const el=this.ownerDocument.createElement("cu-tree-item");el.setAttribute("value",node.path);el.setAttribute("label",node.label);if(depth===0||this.query.trim())el.setAttribute("expanded","");for(const child of node.children)el.append(make(child,depth+1));return el;};
    this._tree.replaceChildren(...(filtered?[make(filtered,0)]:[]));this._tree.value="";
    this._code.value=JSON.stringify(parsed,null,2);this._split.hidden=!filtered;this._empty.hidden=Boolean(filtered);
    this._status.textContent=(data.truncated?"Tree limited to 500 nodes / 20 levels. ":"")+this._nodes.size+" matching tree entries";
  }
}
define("cu-json-viewer",CuJsonViewer);
