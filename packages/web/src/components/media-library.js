import {BrowserElement,mount,define,notify} from "./_shared.js";
import {normalizeFileEntries} from "./file-explorer.js";
import "./file-manager.js";
import "./image-gallery.js";
import "./media-player.js";
import "./empty-state.js";
import "./split-view.js";
export function normalizeMediaEntries(items){
  const source=Array.isArray(items)?items:[],entries=normalizeFileEntries(source),meta=new Map();
  for(const item of source)if(item&&typeof item.id==="string"&&!meta.has(item.id)&&typeof item.name==="string"&&item.name.trim()&&["file","folder"].includes(item.kind))meta.set(item.id,item);
  return entries.map(entry=>{
    const item=meta.get(entry.id),mediaType=entry.kind==="file"&&["image","audio","video"].includes(item?.mediaType)?item.mediaType:"";
    return {...entry,mediaType,src:mediaType&&typeof item?.src==="string"?item.src.trim():"",poster:mediaType==="video"&&typeof item?.poster==="string"?item.poster:""};
  });
}
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}cu-split-view{height:var(--cu-media-library-height,540px);}.panel{padding:8px;display:grid;gap:8px;min-width:0;}.heading{font-weight:650;overflow-wrap:anywhere;}";
export class CuMediaLibrary extends BrowserElement{
  static get observedAttributes(){return ["selected"];}
  constructor(){
    super();this._items=[];
    const root=mount(this,css,'<cu-split-view position="42" min="25" max="70" label="Media library"><div class="panel" slot="sidebar"><cu-file-manager label="Media files"></cu-file-manager></div><div class="panel" slot="content"><div class="heading" role="status"></div><cu-image-gallery hidden></cu-image-gallery><cu-media-player hidden></cu-media-player><cu-empty-state title="Select a media file" size="sm"></cu-empty-state></div></cu-split-view>');
    this._files=root.querySelector("cu-file-manager");this._gallery=root.querySelector("cu-image-gallery");this._player=root.querySelector("cu-media-player");this._empty=root.querySelector("cu-empty-state");this._heading=root.querySelector(".heading");
    for(const type of ["cu-select","cu-open"])this._files.addEventListener(type,e=>{e.stopPropagation();if(e.detail.entry?.kind==="file")this.selectMedia(e.detail.id);});
    this._files.addEventListener("cu-action",e=>{e.stopPropagation();notify(this,"cu-action",{...e.detail,section:"files"});});
    this._files.addEventListener("cu-change",e=>{e.stopPropagation();notify(this,"cu-navigate",{folderId:e.detail.folderId});});
    this._gallery.addEventListener("cu-change",e=>{e.stopPropagation();this.selectMedia(e.detail.value);});
    this._gallery.addEventListener("cu-transform",e=>{e.stopPropagation();notify(this,"cu-transform",e.detail);});
    this._gallery.addEventListener("cu-action",e=>{e.stopPropagation();notify(this,"cu-action",{...e.detail,section:"image"});});
    this._player.addEventListener("cu-change",e=>{e.stopPropagation();notify(this,"cu-media",{id:this.selected,...e.detail});});
    const split=root.querySelector("cu-split-view");for(const type of ["cu-input","cu-change"])split.addEventListener(type,e=>{if(e.target===split)e.stopPropagation();});
  }
  connectedCallback(){this._sync();}attributeChangedCallback(){this._sync();}
  disconnectedCallback(){this._player.pause();}
  get items(){return this._items.map(x=>({...x}));}
  set items(v){this._items=normalizeMediaEntries(v);this._files.items=this._items;this._gallery.items=this._items.filter(x=>x.mediaType==="image"&&x.src).map(x=>({id:x.id,title:x.name,alt:x.name,src:x.src}));this._sync();}
  get selected(){const id=this.getAttribute("selected");return this._items.some(x=>x.id===id&&x.kind==="file")?id:"";}
  set selected(v){this.setAttribute("selected",String(v??""));}
  selectMedia(id){const item=this._items.find(x=>x.id===id&&x.kind==="file");if(!item)return false;if(this.selected!==id){this.selected=id;notify(this,"cu-select",{value:id,item:{...item}});}return true;}
  _sync(){
    if(!this._files)return;const item=this._items.find(x=>x.id===this.selected),kind=item?.src?item.mediaType:"";
    this._heading.textContent=item?.name??"Media preview";this._gallery.hidden=kind!=="image";this._player.hidden=!["audio","video"].includes(kind);this._empty.hidden=Boolean(kind);
    if(kind==="image"){const index=this._gallery.items.findIndex(x=>x.id===item.id);if(index>=0)this._gallery.active=index;}
    if(["audio","video"].includes(kind)){const changed=this._player.getAttribute("src")!==item.src||this._player.getAttribute("media-type")!==kind;if(changed){this._player.pause();this._player.removeAttribute("src");this._player.setAttribute("media-type",kind);this._player.setAttribute("src",item.src);}this._player.setAttribute("label",item.name);if(item.poster)this._player.setAttribute("poster",item.poster);else this._player.removeAttribute("poster");}
    else{this._player.pause();this._player.removeAttribute("src");}
    this._empty.setAttribute("title",item?"No supported preview":"Select a media file");
  }
}
define("cu-media-library",CuMediaLibrary);
