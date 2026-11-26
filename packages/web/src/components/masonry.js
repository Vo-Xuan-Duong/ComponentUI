import {BrowserElement,mount,define,notify,focusStyle} from "./_shared.js";
const css=":host{display:block;min-width:0;}.columns{columns:var(--cu-masonry-column-width,240px);column-gap:var(--cu-masonry-gap,12px);}::slotted(*){display:block;break-inside:avoid;page-break-inside:avoid;margin-block-end:var(--cu-masonry-gap,12px);}"+Array.from({length:6},(_,i)=>':host([count="'+(i+1)+'"]) .columns{column-count:'+(i+1)+';}').join("");
export class CuMasonry extends BrowserElement{constructor(){super();mount(this,css,'<div class="columns" part="columns"><slot style="display:contents"></slot></div>');}}
define("cu-masonry",CuMasonry);
