import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fieldValidity,syncFieldDescriptions,syncFieldValidity,wireFieldValidation}
  from "../packages/web/src/components/_field.js";
import {normalizeProgress} from "../packages/web/src/components/_progress.js";
import {CuProgressBar} from "../packages/web/src/components/progress-bar.js";
import {normalizeRingProgress} from "../packages/web/src/components/progress-ring.js";
import {CuInfiniteScroll} from "../packages/web/src/components/infinite-scroll.js";
import {CuDataTable} from "../packages/web/src/components/data-table.js";
import {REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

function fakeInput(){
  const attrs=new Map(),listeners=new Map();
  return {value:"",disabled:false,readOnly:false,willValidate:true,
    validity:{valueMissing:true},validationMessage:"Enter a value.",
    setAttribute:(name,value)=>attrs.set(name,String(value)),
    removeAttribute:name=>attrs.delete(name),
    getAttribute:name=>attrs.get(name)??null,
    setCustomValidity(message){this.custom=message;},
    addEventListener:(type,handler)=>listeners.set(type,handler),
    fire:type=>listeners.get(type)?.()
  };
}
function fakeField(){
  const attrs=new Map(),events=new Map(),values=[],validities=[];
  return {attrs,values,validities,_hint:{textContent:"A hint"},
    _error:{textContent:""},_internals:{
      setFormValue:v=>values.push(v),
      setValidity:(...args)=>validities.push(args)
    },
    getAttribute:name=>attrs.get(name)??null,
    addEventListener:(name,fn)=>events.set(name,fn),fire:name=>events.get(name)?.()
  };
}
test("Field validation copies real native flags without dispatching invalid events",()=>{
  const input=fakeInput();
  input.validity={valueMissing:true,typeMismatch:true};
  input.checkValidity=()=>{throw Error("must not dispatch invalid during sync");};
  assert.deepEqual(fieldValidity(input),{
    invalid:true,message:"Enter a value.",flags:{typeMismatch:true,valueMissing:true}
  });
  assert.deepEqual(fieldValidity(input,"Server rejected value"),{
    invalid:true,message:"Server rejected value",flags:{customError:true}
  });
  input.disabled=true;
  assert.deepEqual(fieldValidity(input,"Hidden error"),{invalid:false,message:"",flags:{}});
  input.disabled=false;input.readOnly=true;
  assert.equal(fieldValidity(input,"Hidden error").invalid,false);
});
test("Initial render keeps native constraint but delays error until interaction",()=>{
  const host=fakeField(),input=fakeInput(),wrapper={dataset:{}};
  const update=()=>syncFieldValidity(host,input,{wrapper});
  wireFieldValidation(host,input,update);
  update();
  assert.deepEqual(host.validities.at(-1)[0],{valueMissing:true});
  assert.equal(host._error.textContent,"");
  assert.equal(input.getAttribute("aria-invalid"),"false");
  assert.equal(input.getAttribute("aria-describedby"),"cu-field-hint");
  input.fire("blur");
  assert.equal(host._error.textContent,"Enter a value.");
  assert.equal(wrapper.dataset.invalid,"true");
  assert.equal(input.getAttribute("aria-describedby"),"cu-field-hint cu-field-error");
  input.value="correct";
  input.validity={valid:true};
  update();
  assert.equal(host._error.textContent,"");
  assert.equal(wrapper.dataset.invalid,"false");
  assert.deepEqual(host.validities.at(-1),[{}]);
  assert.equal(host.values.at(-1),"correct");
});
test("Explicit errors surface immediately; clearing and disabled state remove custom validity",()=>{
  const host=fakeField(),input=fakeInput(),wrapper={dataset:{}};
  input.validity={valid:true};input.value="abc";
  host.attrs.set("error","Name already exists.");
  syncFieldValidity(host,input,{wrapper});
  assert.equal(input.custom,"Name already exists.");
  assert.equal(host._error.textContent,"Name already exists.");
  assert.equal(input.getAttribute("aria-invalid"),"true");
  host.attrs.delete("error");
  syncFieldValidity(host,input,{wrapper});
  assert.equal(input.custom,"");
  assert.equal(host._error.textContent,"");
  assert.equal(input.getAttribute("aria-describedby"),"cu-field-hint");
  host.attrs.set("error","Name already exists.");
  input.disabled=true;
  syncFieldValidity(host,input,{wrapper});
  assert.equal(host.values.at(-1),null);
  assert.equal(input.custom,"");
  assert.deepEqual(host.validities.at(-1),[{}]);
  assert.equal(wrapper.dataset.invalid,"false");
});
test("Readonly field retains submitted value but does not validate",()=>{
  const host=fakeField(),input=fakeInput();
  input.readOnly=true;input.value="readonly";
  host.attrs.set("error","Ignore while readonly");
  assert.equal(syncFieldValidity(host,input).invalid,false);
  assert.equal(host.values.at(-1),"readonly");
  assert.equal(input.getAttribute("aria-invalid"),"false");
});
test("Explicit form invalid event reveals native error and reset clears reveal state",()=>{
  const host=fakeField(),input=fakeInput();
  wireFieldValidation(host,input,()=>syncFieldValidity(host,input));
  syncFieldValidity(host,input);
  host.fire("invalid");
  assert.equal(host._validationRevealed,true);
  assert.equal(host._error.textContent,"Enter a value.");
  host._validationRevealed=false;
  syncFieldValidity(host,input);
  assert.equal(host._error.textContent,"");
});
test("Descriptions remove obsolete references and reuse existing IDs",()=>{
  const input=fakeInput(),hint={textContent:"",id:"hint"},error={textContent:"",id:"err"};
  syncFieldDescriptions(input,hint,error);
  assert.equal(input.getAttribute("aria-describedby"),null);
  hint.textContent="Hint";error.textContent="Error";
  syncFieldDescriptions(input,hint,error);
  assert.equal(input.getAttribute("aria-describedby"),"hint err");
  error.textContent="";
  syncFieldDescriptions(input,hint,error);
  assert.equal(input.getAttribute("aria-describedby"),"hint");
});
test("InfiniteScroll fails once, suppresses automatic retries and retries the same page",()=>{
  const scroll=Object.create(CuInfiniteScroll.prototype),attrs=new Map([["has-more",""]]),events=[];
  scroll.getAttribute=k=>attrs.get(k)??null;
  scroll.hasAttribute=k=>attrs.has(k);
  scroll.setAttribute=(k,v)=>{attrs.set(k,String(v));scroll.attributeChangedCallback(k);};
  scroll.removeAttribute=k=>{attrs.delete(k);scroll.attributeChangedCallback(k);};
  scroll.toggleAttribute=(k,on)=>on?scroll.setAttribute(k,""):scroll.removeAttribute(k);
  scroll.dispatchEvent=event=>{events.push(event);return true;};
  scroll._viewport={scrollTop:0,setAttribute(){}};
  scroll._button={};scroll._buttonLabel={};scroll._status={};
  scroll._requesting=false;scroll._page=0;
  assert.equal(scroll.requestMore("intersection"),true);
  assert.equal(scroll.page,1);
  assert.equal(scroll.fail("Network unavailable"),true);
  assert.equal(scroll.page,0);
  assert.equal(scroll.loading,false);
  assert.equal(scroll._status.textContent,"Network unavailable");
  assert.equal(scroll._buttonLabel.textContent,"Retry");
  assert.equal(scroll.fail("Duplicate"),false);
  assert.equal(scroll.requestMore("intersection"),false);
  assert.equal(scroll.requestMore("scroll"),false);
  assert.equal(scroll.requestMore("button"),true);
  assert.equal(scroll.page,1);
  assert.equal(scroll.error,"");
  assert.deepEqual(events.map(e=>e.detail.page),[1,1]);
  scroll.complete({hasMore:false});
  assert.equal(scroll._status.textContent,"All records loaded");
});
test("DataTable exposes controlled loading and error props and React retry event",()=>{
  const table=Object.create(CuDataTable.prototype),attrs=new Map();
  table.hasAttribute=k=>attrs.has(k);table.getAttribute=k=>attrs.get(k)??null;
  table.setAttribute=(k,v)=>attrs.set(k,String(v));
  table.removeAttribute=k=>attrs.delete(k);
  table.toggleAttribute=(k,v)=>v?attrs.set(k,""):attrs.delete(k);
  assignCuProperties(table,"cu-data-table",{loading:true,error:"Failed"});
  assert.equal(table.loading,true);assert.equal(table.error,"Failed");
  assignCuProperties(table,"cu-data-table",{loading:false,error:""});
  assert.equal(table.loading,false);assert.equal(table.error,"");
  assert.equal(REACT_EVENT_PROPS.onCuRetry,"cu-retry");
});
test("All six native input fields share validation and reset visibility",async()=>{
  for(const name of ["text-field","text-area","password-field","number-field","date-picker","search-box"]){
    const source=await read("../packages/web/src/components/"+name+".js");
    assert.match(source,/from ".\/_field\.js"/);
    assert.match(source,/syncFieldValidity\(this,/);
    assert.match(source,/wireFieldValidation\(this,/);
    assert.match(source,/formResetCallback\(\)\s*\{\s*this\._validationRevealed=false/);
    assert.doesNotMatch(source,/this\._input\.checkValidity\(\).*setValidity/);
  }
});
test("FilePicker respects effective form disable and validates native chooser selections",async()=>{
  const source=await read("../packages/web/src/components/file-picker.js");
  assert.match(source,/this\.disabled\|\|this\._formDisabled/);
  assert.match(source,/dropEffect=this\.disabled\|\|this\._formDisabled\?"none":"copy"/);
  assert.match(source,/this\._input\.value=""; \/\/ Allow choosing the same file again/);
  assert.match(source,/visibleError/);
  assert.match(source,/if\(invalid\)this\._internals\?\.setValidity/);
});
test("DataTable and Playground provide visible and accessible state matrix",async()=>{
  const [table,html,js,types]=await Promise.all([
    read("../packages/web/src/components/data-table.js"),read("../apps/playground-web/index.html"),
    read("../apps/playground-web/main.js"),read("../packages/web/src/components/index.d.ts")]);
  assert.match(table,/cu-spinner/);
  assert.match(table,/No matching records/);
  assert.match(table,/this\._externalQuery/);
  assert.match(table,/notify\(this,"cu-retry"/);
  assert.match(table,/this\._footer\.hidden=false/);
  assert.match(table,/message\.textContent=/);
  assert.match(html,/id="quality-form"/);
  assert.match(html,/id="quality-data-table"/);
  assert.match(js,/qualityForm\.addEventListener\("invalid"/);
  assert.match(js,/qualityTable\.addEventListener\("cu-retry"/);
  assert.match(types,/fail\(message\?:string\):boolean/);
});

test("Linear and circular progress share clamping and indeterminate semantics",()=>{
  for(const [value,max,expected] of [
    [null,100,{value:null,max:100,percent:null}],
    ["  ",100,{value:null,max:100,percent:null}],
    ["invalid",50,{value:null,max:50,percent:null}],
    [-5,50,{value:0,max:50,percent:0}],
    [25,50,{value:25,max:50,percent:50}],
    [80,50,{value:50,max:50,percent:100}],
    [10,0,{value:10,max:100,percent:10}]
  ]){
    assert.deepEqual(normalizeProgress(value,max),expected);
    assert.deepEqual(normalizeRingProgress(value,max),expected);
  }
  const bar=Object.create(CuProgressBar.prototype),attrs=new Map([["value","invalid"],["max","50"]]);
  bar._progress={max:50};
  bar.getAttribute=k=>attrs.get(k)??null;
  assert.equal(bar.value,null);
  attrs.set("value","-5");
  assert.equal(bar.value,0);
});
test("Feedback components keep motion preference and loading status accessible",async()=>{
  const [bar,ring,spinner]=await Promise.all(["progress-bar","progress-ring","spinner"].map(
    name=>read("../packages/web/src/components/"+name+".js")));
  assert.match(bar,/from ".\/_progress\.js"/);
  assert.match(ring,/from ".\/_progress\.js"/);
  assert.match(bar,/<progress part="progress"/);
  assert.match(bar,/data-indeterminate=true/);
  for(const source of [bar,ring,spinner])assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(spinner,/setAttribute\("role","status"\)/);
  assert.doesNotMatch(spinner,/setAttribute\("aria-busy","true"\)/);
});
