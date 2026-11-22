import { BrowserElement, mount, notify, define, focusStyle } from "./_shared.js";

/**
 * NavigationView preserves native anchor/button semantics. Links route through
 * the consumer application; we only manage selected state and arrow movement.
 */
export function nextNavigationIndex(length,index,key) {
  if(length<1)return -1;
  if(key==="Home")return 0;
  if(key==="End")return length-1;
  if(key==="ArrowDown"||key==="ArrowRight")return (index+1+length)%length;
  if(key==="ArrowUp"||key==="ArrowLeft")return (index-1+length)%length;
  return index;
}

const css=[
  ":host{display:block;min-width:0;color:var(--cu-text,#242424);font-family:var(--cu-font-body,system-ui);}",
  ":host([hidden]){display:none!important;}",
  ".navigation{display:grid;gap:8px;min-width:0;}",
  ".heading{padding:6px 11px;color:var(--cu-text-muted,#616161);",
  "font-size:11px;font-weight:700;letter-spacing:.045em;text-transform:uppercase;}",
  ".heading:empty{display:none;}",
  ".items{display:grid;gap:3px;min-width:0;}",
  "::slotted(a),::slotted(button){box-sizing:border-box;display:flex;align-items:center;gap:10px;",
  "min-height:38px;min-width:0;width:100%;padding:8px 12px;border:0;",
  "border-radius:var(--cu-radius-md,6px);color:var(--cu-text,#242424);",
  "background:transparent;text-decoration:none;cursor:pointer;",
  "font:500 13px var(--cu-font-body,system-ui);text-align:start;}",
  "::slotted(a:hover),::slotted(button:hover){background:color-mix(in srgb,var(--cu-text,#242424) 8%,transparent);}",
  "::slotted([data-current=true]){background:color-mix(in srgb,var(--cu-accent,#0067c0) 14%,var(--cu-surface,#fff));",
  "font-weight:650;color:var(--cu-text,#242424);}",
  "::slotted([data-current=true]:hover){background:color-mix(in srgb,var(--cu-accent,#0067c0) 20%,var(--cu-surface,#fff));}",
  "::slotted(a:focus-visible),::slotted(button:focus-visible){outline:2px solid var(--cu-focus,#0067c0);outline-offset:-2px;}",
  "::slotted([aria-disabled=true]),::slotted([disabled]){opacity:.45;cursor:not-allowed;}",
  ".footer{padding-top:10px;border-top:1px solid var(--cu-border,#e5e5e5);}",
  ".footer[hidden]{display:none!important;}",
  "@media(forced-colors:active){::slotted([data-current=true]){outline:1px solid Highlight;}}",
  focusStyle
].join("");

export class CuNavigationView extends BrowserElement {
  static get observedAttributes(){return ["label","value"];}
  constructor(){
    super();
    const root=mount(this,css,
      '<nav class="navigation" part="navigation" aria-label="Application sections">' +
      '<div class="heading" part="heading"></div><div class="items" part="items">' +
      '<slot></slot></div><div class="footer" part="footer" hidden>' +
      '<slot name="footer"></slot></div></nav>');
    this._nav=root.querySelector("nav");
    this._heading=root.querySelector(".heading");
    this._slot=root.querySelector("slot:not([name])");
    this._footer=root.querySelector(".footer");
    this._footerSlot=root.querySelector('slot[name="footer"]');
    this._slot.addEventListener("slotchange",()=>this._sync());
    this._footerSlot.addEventListener("slotchange",()=>this._sync());
    this._slot.addEventListener("click",event=>{
      const target=event.target.closest?.("a,button");
      if(!target||!this._items().includes(target))return;
      if(this._isDisabled(target)){event.preventDefault();return;}
      this.select(this._itemValue(target),true);
    });
    this._slot.addEventListener("keydown",event=>{
      if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      const items=this._items().filter(item=>!this._isDisabled(item));
      if(!items.length)return;
      const active=items.indexOf(event.target);
      if(active<0)return;
      const target=items[nextNavigationIndex(items.length,active,event.key)];
      if(target){event.preventDefault();target.focus();}
    });
  }
  connectedCallback(){this._sync();}
  attributeChangedCallback(){this._sync();}
  get value(){return this.getAttribute("value")??"";}
  set value(value){this.setAttribute("value",String(value??""));}
  _items(){
    return this._slot.assignedElements({flatten:true}).filter(el=>el.matches?.("a,button"));
  }
  _isDisabled(item){return item.hasAttribute("disabled")||item.getAttribute("aria-disabled")==="true";}
  _itemValue(item){return item.dataset.value??item.getAttribute("href")??item.textContent.trim();}
  select(value,emit=false){
    const key=String(value??"");
    const item=this._items().find(el=>this._itemValue(el)===key&&!this._isDisabled(el));
    if(!item)return false;
    const changed=this.value!==key;
    this.value=key;
    if(changed&&emit)notify(this,"cu-change",{
      value:key,label:item.textContent.trim(),href:item.getAttribute("href")??null
    });
    return true;
  }
  _sync(){
    if(!this._nav)return;
    this._nav.setAttribute("aria-label",this.getAttribute("label")||"Application sections");
    this._heading.textContent=this.getAttribute("label")??"";
    this._footer.hidden=this._footerSlot.assignedElements({flatten:true}).length===0;
    const items=this._items(),value=this.value;
    for(const item of items){
      const current=Boolean(value)&&this._itemValue(item)===value&&!this._isDisabled(item);
      item.dataset.current=String(current);
      if(current)item.setAttribute("aria-current","page");
      else item.removeAttribute("aria-current");
    }
  }
}
define("cu-navigation-view",CuNavigationView);
