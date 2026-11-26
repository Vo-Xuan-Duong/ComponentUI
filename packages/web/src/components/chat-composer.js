import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const css=":host{display:block;min-width:0;font:13px var(--cu-font-body,system-ui);color:var(--cu-text,#242424);}.frame{display:flex;align-items:flex-end;gap:10px;padding:9px;border:1px solid var(--cu-border-strong,#d1d1d1);border-radius:var(--cu-radius-lg,8px);background:var(--cu-surface,#fff);}.frame:focus-within{border-color:var(--cu-focus,#0067c0);}textarea{box-sizing:border-box;flex:1;min-width:0;min-height:56px;max-height:200px;resize:vertical;border:0;background:transparent;color:inherit;font:inherit;line-height:1.5;padding:6px;}button{min-height:34px;padding:0 14px;border:0;border-radius:6px;background:var(--cu-accent,#0067c0);color:var(--cu-accent-text,#fff);font:600 13px var(--cu-font-body,system-ui);cursor:pointer;}button:disabled{opacity:.5;cursor:default;}"+focusStyle;
export class CuChatComposer extends BrowserElement{
 static get observedAttributes(){return ["value","placeholder","disabled","label"];}
 constructor(){super();const root=mount(this,css,'<div class="frame"><textarea rows="2" aria-label="Message"></textarea><button type="button">Send</button></div>');this._input=root.querySelector("textarea");this._button=root.querySelector("button");this._input.addEventListener("input",()=>{this._syncButton();notify(this,"cu-input",{value:this.value});});this._input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing&&this.hasAttribute("send-on-enter")){e.preventDefault();this.send();}});this._button.addEventListener("click",()=>this.send());}
 connectedCallback(){this._sync();}attributeChangedCallback(name){if(name==="value"&&this._input)this._input.value=this.getAttribute("value")||"";this._sync();}
 get value(){return this._input.value;}set value(v){this._input.value=String(v??"");this._syncButton();}
 get disabled(){return this.hasAttribute("disabled");}set disabled(v){this.toggleAttribute("disabled",Boolean(v));}
 focus(options){this._input.focus(options);}
 send(){const value=this.value.trim();if(this.disabled||!value)return false;this.value="";notify(this,"cu-send",{value});notify(this,"cu-input",{value:""});this.focus();return true;}
 _syncButton(){if(this._button)this._button.disabled=this.disabled||!this.value.trim();}
 _sync(){if(!this._input)return;this._input.disabled=this.disabled;this._input.placeholder=this.getAttribute("placeholder")||"Write a message…";this._input.setAttribute("aria-label",this.getAttribute("label")||"Message");this._syncButton();}
}
define("cu-chat-composer",CuChatComposer);
