import {CuAutoComplete,filterSuggestions} from "./autocomplete.js";
import {define,notify} from "./_shared.js";
export function activeMention(value,caret=String(value??"").length){
  const text=String(value??""),end=Math.max(0,Math.min(text.length,Number.isFinite(caret)?Math.floor(caret):text.length));
  const match=/(?:^|\s)@([\p{L}\p{N}_.-]*)$/u.exec(text.slice(0,end));
  if(!match)return null;
  const start=end-match[1].length-1;
  const suffix=/^[\p{L}\p{N}_.-]*/u.exec(text.slice(end))[0];
  return {start,end:end+suffix.length,query:match[1]};
}
export function insertMention(value,range,handle){
  const text=String(value??""),name=String(handle??"").replace(/^@/,"");
  if(!range||!name||!/^[\p{L}\p{N}_.-]+$/u.test(name))return null;
  const suffix=text.slice(range.end),space=!suffix||!/\s/.test(suffix[0])?" ":"";
  const replacement="@"+name+space;
  return {value:text.slice(0,range.start)+replacement+suffix,caret:range.start+replacement.length};
}
export class CuMentionInput extends CuAutoComplete{
  constructor(){
    super();
    this._input.addEventListener("click",()=>{if(this._eligible())this.show();else this.hide();});
    this._input.addEventListener("keyup",e=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)&&!e.isComposing){if(this._eligible())this.show();else this.hide();}});
  }
  _range(){return activeMention(this.value,this._input.selectionStart??this.value.length);}
  _eligible(){const range=this._range();return !this._locked()&&Boolean(range&&range.query.length>=this._number("min-chars",0,100));}
  _suggestions(limit){
    const range=this._range();
    if(!range)return [];
    const items=this._items.filter(x=>/^[\p{L}\p{N}_.-]+$/u.test(x.value));
    return this.hasAttribute("manual-filter")?items.slice(0,limit):filterSuggestions(items,range.query,limit);
  }
  _commit(item){
    if(!item||item.disabled||this._locked())return;
    const result=insertMention(this.value,this._range(),item.value);
    if(!result)return;
    this.value=result.value;this.hide();this.focus();this._input.setSelectionRange(result.caret,result.caret);this.hide();
    notify(this,"cu-select",{value:this.value,mention:item.value,label:item.label});
    notify(this,"cu-input",{value:this.value});notify(this,"cu-change",{value:this.value});
  }
}
define("cu-mention-input",CuMentionInput);
