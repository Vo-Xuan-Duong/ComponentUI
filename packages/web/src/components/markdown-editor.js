import {BrowserElement,mount,define,notify} from "./_shared.js";
import "./text-area.js";
import "./split-view.js";
import "./scroll-area.js";
import "./code-block.js";
export function parseMarkdownBlocks(value){
  const result=[];let fence=null,paragraph=[];
  const flush=()=>{if(paragraph.length){result.push({kind:"paragraph",text:paragraph.join(" ")});paragraph=[];}};
  for(const line of String(value??"").replace(/\r\n?/g,"\n").split("\n")){
    if(fence){if(/^ {0,3}\x60{3,}\s*$/.test(line)){result.push({kind:"code",text:fence.lines.join("\n"),language:fence.language});fence=null;}else fence.lines.push(line);continue;}
    const code=line.match(/^ {0,3}\x60{3,}\s*([\w+-]*)\s*$/);
    if(code){flush();fence={language:code[1]||"Code",lines:[]};continue;}
    const heading=line.match(/^(#{1,6})\s+(.+)$/),list=line.match(/^\s*[-*+]\s+(.+)$/),ordered=line.match(/^\s*\d+\.\s+(.+)$/),quote=line.match(/^>\s?(.*)$/);
    if(heading){flush();result.push({kind:"heading",level:heading[1].length,text:heading[2]});}
    else if(list||ordered){flush();result.push({kind:ordered?"ordered":"list",text:(list||ordered)[1]});}
    else if(quote){flush();result.push({kind:"quote",text:quote[1]});}
    else if(!line.trim())flush();else paragraph.push(line);
  }
  if(fence)result.push({kind:"code",text:fence.lines.join("\n"),language:fence.language});flush();return result;
}
const css=":host([hidden]){display:none!important;}:host{display:block;min-width:0;color:var(--cu-text,#242424);font:13px var(--cu-font-body,system-ui);}.panel{display:grid;gap:var(--cu-space-2,8px);}cu-split-view{height:var(--cu-markdown-height,440px);}cu-textarea::part(control){font-family:var(--cu-font-mono,monospace);}cu-scroll-area{--cu-scroll-max-height:400px;}.preview{padding:var(--cu-space-3,12px);overflow-wrap:anywhere;line-height:1.65;}.preview blockquote{margin:8px 0;border-inline-start:3px solid var(--cu-border-strong,#d1d1d1);padding-inline-start:12px;color:var(--cu-text-muted,#616161);}.status{font-size:12px;color:var(--cu-text-muted,#616161);}";
export class CuMarkdownEditor extends BrowserElement{
  static get observedAttributes(){return ["value","readonly","disabled"];}
  constructor(){
    super();this._value="";
    const root=mount(this,css,'<section class="panel" aria-label="Markdown editor"><cu-split-view position="50" min="25" max="75" label="Editor and preview"><cu-textarea slot="sidebar" rows="16" label="Markdown source" exportparts="control:editor"></cu-textarea><cu-scroll-area slot="content" label="Markdown preview" variant="outlined"><article class="preview" part="preview"></article></cu-scroll-area></cu-split-view><div class="status"></div></section>');
    this._split=root.querySelector("cu-split-view");this._editor=root.querySelector("cu-textarea");this._preview=root.querySelector(".preview");this._status=root.querySelector(".status");
    for(const type of ["cu-input","cu-change"]){
      this._editor.addEventListener(type,e=>{e.stopPropagation();this._value=e.detail.value;this._renderPreview();notify(this,type,{value:this.value});});
      this._split.addEventListener(type,e=>{if(e.target===this._split)e.stopPropagation();});
    }
    this._preview.addEventListener("cu-action",e=>e.stopPropagation());
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(name){if(name==="value")this._value=this.getAttribute("value")??"";this._sync();}
  get value(){return this._value;}set value(v){this._value=String(v??"");this._sync();}
  get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
  focus(options){this._editor.focus(options);}
  _sync(){if(!this._editor)return;if(this._editor.value!==this.value)this._editor.value=this.value;this._editor.disabled=this.disabled;this._editor.toggleAttribute("readonly",this.hasAttribute("readonly"));this._renderPreview();}
  _renderPreview(){
    if(this._renderedValue===this.value)return;
    const doc=this.ownerDocument,frag=doc.createDocumentFragment();let list=null,listKind=null;
    for(const block of parseMarkdownBlocks(this.value)){
      if(block.kind==="list"||block.kind==="ordered"){
        if(listKind!==block.kind){list=doc.createElement(block.kind==="list"?"ul":"ol");frag.append(list);listKind=block.kind;}
        const item=doc.createElement("li");item.textContent=block.text;list.append(item);continue;
      }
      list=null;listKind=null;
      if(block.kind==="code"){const code=doc.createElement("cu-code-block");code.setAttribute("language",block.language);code.setAttribute("copyable","");code.value=block.text;frag.append(code);continue;}
      const node=doc.createElement(block.kind==="heading"?"h"+block.level:block.kind==="quote"?"blockquote":"p");node.textContent=block.text;frag.append(node);
    }
    this._preview.replaceChildren(frag);this._renderedValue=this.value;this._status.textContent=this.value.length+" characters · basic Markdown preview";
  }
}
define("cu-markdown-editor",CuMarkdownEditor);
