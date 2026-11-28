import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./property-grid.js";
import "./split-view.js";
import "./select.js";
import "./button.js";
import "./context-menu.js";
export function normalizeNodeGraph(value={}){
  const ids=new Set(),nodes=[];
  for(const n of Array.isArray(value?.nodes)?value.nodes:[]){if(!n||typeof n.id!=="string"||!n.id||ids.has(n.id)||nodes.length>=50)continue;ids.add(n.id);nodes.push({id:n.id,label:String(n.label??n.id)});}
  const edges=[],seen=new Map();
  for(const e of Array.isArray(value?.edges)?value.edges:[]){if(!e||!ids.has(e.from)||!ids.has(e.to)||e.from===e.to||edges.length>=200)continue;if(!seen.has(e.from))seen.set(e.from,new Set());if(seen.get(e.from).has(e.to))continue;seen.get(e.from).add(e.to);edges.push({from:e.from,to:e.to});}
  return {nodes,edges};
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.panel{display:grid;gap:8px;}.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:end;}.tools cu-select{flex:1 1 120px;}.graph{display:grid;gap:8px;padding:10px;}.nodes{display:flex;gap:8px;flex-wrap:wrap;}.edges{display:grid;gap:4px;}.edge{display:flex;gap:8px;align-items:center;}.edge span{flex:1;overflow-wrap:anywhere;}.inspector{padding:8px;}cu-split-view{height:var(--cu-node-editor-height,340px);}";
export class CuNodeEditor extends BrowserElement{
  static get observedAttributes(){return ["readonly"];}
  constructor(){
    super();this._value=normalizeNodeGraph();this._selected="";this._next=1;
    const root=mount(this,css,'<section class="panel" aria-label="Node editor"><div class="tools"><cu-button class="add" variant="accent">Add node</cu-button><cu-select class="from" label="From"></cu-select><cu-select class="to" label="To"></cu-select><cu-button class="connect" variant="outline">Connect</cu-button></div><cu-split-view position="65" min="30" max="75" label="Graph and properties"><div class="graph" slot="sidebar"><strong>Nodes</strong><div class="nodes"></div><strong>Connections</strong><div class="edges"></div></div><div class="inspector" slot="content"><cu-property-grid label="Selected node"></cu-property-grid></div></cu-split-view><cu-context-menu aria-label="Node actions"></cu-context-menu></section>');
    this._nodes=root.querySelector(".nodes");this._edges=root.querySelector(".edges");this._grid=root.querySelector("cu-property-grid");this._from=root.querySelector(".from");this._to=root.querySelector(".to");this._add=root.querySelector(".add");this._connect=root.querySelector(".connect");this._menu=root.querySelector("cu-context-menu");
    this._add.addEventListener("cu-press",e=>{e.stopPropagation();this.addNode();});this._connect.addEventListener("cu-press",e=>{e.stopPropagation();this.connectNodes(this._from.value,this._to.value);});
    this._grid.addEventListener("cu-change",e=>{e.stopPropagation();const n=this._value.nodes.find(x=>x.id===this._selected);if(!this.readonly&&n&&e.detail.key==="label"){n.label=String(e.detail.value);this._render();this._emit("update");}});
    for(const control of [this._from,this._to])for(const type of ["cu-input","cu-change"])control.addEventListener(type,e=>{e.stopPropagation();this._syncConnect();});
    this._menu.addEventListener("cu-select",e=>{e.stopPropagation();if(e.detail.value==="remove")this.removeNode(this._selected);});for(const type of ["cu-open","cu-close"])this._menu.addEventListener(type,e=>e.stopPropagation());
  }
  connectedCallback(){this._render();}attributeChangedCallback(){this._render();}disconnectedCallback(){this._menu.hide();}
  get value(){return normalizeNodeGraph(this._value);}set value(v){this._value=normalizeNodeGraph(v);this._render();}
  get readonly(){return this.hasAttribute("readonly");}set readonly(v){this.toggleAttribute("readonly",Boolean(v));}
  addNode(){if(this.readonly||this._value.nodes.length>=50)return false;let id;do{id="node-"+this._next++;}while(this._value.nodes.some(x=>x.id===id));this._value.nodes.push({id,label:"Node "+id.slice(5)});this._selected=id;this._render();this._emit("add");return true;}
  removeNode(id){if(this.readonly||!this._value.nodes.some(n=>n.id===id))return false;this._value=normalizeNodeGraph({nodes:this._value.nodes.filter(n=>n.id!==id),edges:this._value.edges});this._render();this._emit("remove");return true;}
  connectNodes(from,to){if(this.readonly)return false;const v=normalizeNodeGraph({...this._value,edges:[...this._value.edges,{from,to}]});if(v.edges.length===this._value.edges.length)return false;this._value=v;this._render();this._emit("connect");return true;}
  disconnectNodes(from,to){if(this.readonly)return false;const edges=this._value.edges.filter(e=>e.from!==from||e.to!==to);if(edges.length===this._value.edges.length)return false;this._value.edges=edges;this._render();this._emit("disconnect");return true;}
  _emit(action){notify(this,"cu-change",{action,value:this.value});}
  _syncConnect(){if(!this._connect)return;const from=this._from.value,to=this._to.value;this._connect.disabled=this.readonly||!from||!to||from===to||this._value.edges.length>=200||this._value.edges.some(e=>e.from===from&&e.to===to);}
  _render(){if(!this._nodes)return;this._menu.hide();const doc=this.ownerDocument,nodes=this._value.nodes,labels=new Map(nodes.map(n=>[n.id,n.label]));if(!labels.has(this._selected))this._selected=nodes[0]?.id??"";
    this._nodes.replaceChildren(...nodes.map(n=>{const b=doc.createElement("cu-button");b.setAttribute("variant",n.id===this._selected?"accent":"outline");b.textContent=n.label;b.addEventListener("cu-press",e=>{e.stopPropagation();this._selected=n.id;this._render();notify(this,"cu-select",{value:n.id});});b.addEventListener("contextmenu",e=>{e.preventDefault();this._selected=n.id;this._grid.items=[{key:"label",label:"Label",value:n.label}];this._menu.items=[{value:"remove",label:"Remove node",disabled:this.readonly}];this._menu.showAt(e.clientX,e.clientY,b);});return b;}));
    this._edges.replaceChildren(...this._value.edges.map(e=>{const row=doc.createElement("div");row.className="edge";const text=doc.createElement("span");text.textContent=labels.get(e.from)+" → "+labels.get(e.to);const b=doc.createElement("cu-button");b.setAttribute("size","sm");b.setAttribute("variant","outline");b.textContent="Remove";b.disabled=this.readonly;b.addEventListener("cu-press",event=>{event.stopPropagation();this.disconnectNodes(e.from,e.to);});row.append(text,b);return row;}));
    for(const c of [this._from,this._to]){const value=labels.has(c.value)?c.value:nodes[c===this._from?0:1]?.id??nodes[0]?.id??"";c.replaceChildren(...nodes.map(n=>{const o=doc.createElement("option");o.value=n.id;o.textContent=n.label;o.selected=n.id===value;return o;}));c.setAttribute("value",value);c.disabled=this.readonly||!nodes.length;queueMicrotask(()=>{if(this.isConnected){c.value=value;this._syncConnect();}});}
    this._grid.readonly=this.readonly;this._grid.items=this._selected?[{key:"label",label:"Label",value:labels.get(this._selected)}]:[];this._add.disabled=this.readonly||nodes.length>=50;this._syncConnect();
  }
}
define("cu-node-editor",CuNodeEditor);
