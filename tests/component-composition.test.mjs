import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuButton} from "../packages/web/src/components/button.js";
import {CuFilterBar} from "../packages/web/src/components/filter-bar.js";
const read=name=>readFile(new URL("../packages/web/src/components/"+name+".js",import.meta.url),"utf8");

test("loading buttons compose the same Spinner, not independent animations",async()=>{
  for(const name of ["button","icon-button","split-button"]){
    const source=await read(name);
    assert.ok(source.includes('import "./spinner.js"'),name);
    assert.ok(source.includes('<cu-spinner class="spinner"'),name);
    assert.ok(source.includes("aria-hidden"),name);
    assert.doesNotMatch(source,/<span[^>]*class="spinner"/);
    assert.doesNotMatch(source,/@keyframes[^"]*spin/);
  }
});

test("Button keeps label, loading and disabled state on the native control",()=>{
  const button=Object.create(CuButton.prototype),attrs=new Map(),controlAttrs=new Map();
  button.hasAttribute=k=>attrs.has(k);
  button.getAttribute=k=>attrs.get(k)??null;
  button._control={disabled:false,setAttribute:(k,v)=>controlAttrs.set(k,v),removeAttribute:k=>controlAttrs.delete(k)};
  button._spinner={hidden:true};
  attrs.set("aria-label","Clear all filters");
  button._sync();
  assert.equal(controlAttrs.get("aria-label"),"Clear all filters");
  assert.equal(button._spinner.hidden,true);
  attrs.set("loading","");
  button._sync();
  assert.equal(button._control.disabled,true);
  assert.equal(button._spinner.hidden,false);
  assert.equal(controlAttrs.get("aria-busy"),"true");
  attrs.delete("loading");attrs.delete("aria-label");
  button._sync();
  assert.equal(button._control.disabled,false);
  assert.equal(controlAttrs.has("aria-label"),false);
  assert.equal(button._spinner.hidden,true);
});

test("FilterBar delegates controls and exposes only its semantic custom events",async()=>{
  const source=await read("filter-bar");
  assert.ok(source.includes('import "./search-box.js"'));
  assert.ok(source.includes('import "./button.js"'));
  assert.ok(source.includes('exportparts="input:search"'));
  assert.ok(source.includes('exportparts="button:clear"'));
  assert.ok(source.includes('this._search.addEventListener("cu-input"'));
  assert.ok(source.includes('this._clear.addEventListener("cu-press"'));
  assert.ok(source.includes('event.stopPropagation()'));
  assert.doesNotMatch(source,/<input[^>]*type="search"/);
  const bar=Object.create(CuFilterBar.prototype);
  const attrs=new Map([["query","workspace"],["placeholder","Find items"]]);
  bar.getAttribute=k=>attrs.get(k)??null;
  bar.children=[];
  bar._search={value:"",setAttribute(k,v){this[k]=v;}};
  bar._clear={disabled:true};
  bar._bar={setAttribute(){}};
  bar._sync();
  assert.equal(bar._search.value,"workspace");
  assert.equal(bar._search.placeholder,"Find items");
  assert.equal(bar._clear.disabled,false);
});

test("upload components reuse Button and ProgressBar and retain public events",async()=>{
  const [manager,upload,progress]=await Promise.all(["upload-manager","file-upload","progress-bar"].map(read));
  assert.ok(manager.includes('doc.createElement("cu-progress-bar")'));
  assert.ok(manager.includes('doc.createElement("cu-button")'));
  assert.ok(manager.includes('notify(this,"cu-action"'));
  assert.ok(progress.includes('part="header"'));
  assert.ok(upload.includes('doc.createElement("cu-button")'));
  assert.ok(upload.includes('this._uploadButton.loading=this.loading'));
  assert.ok(upload.includes('notify(this,"cu-upload"'));
  assert.doesNotMatch(manager,/createElement\("progress"\)/);
});


test("DataFilter and SearchBox reuse controls without leaking child custom events",async()=>{
  const [filter,search]=await Promise.all(["data-filter","search-box"].map(read));
  assert.ok(filter.includes('import "./text-field.js"'));
  assert.ok(filter.includes('exportparts="input:value"'));
  for(const source of [filter,search]){
    assert.ok(source.includes('import "./icon-button.js"'));
    assert.ok(source.includes('exportparts="button:clear"'));
    assert.ok(source.includes('this._clear.addEventListener("cu-press"'));
    assert.ok(source.includes('event.stopPropagation()'));
    assert.doesNotMatch(source,/<button[^>]*class="clear"/);
  }
  assert.ok(filter.includes('this._input.addEventListener("cu-input"'));
  assert.ok(filter.includes('this._input.addEventListener("cu-change"'));
  assert.ok(search.includes('this._input.focus()'));
});

test("CommandBar and CommandSurface reuse Button for visible actions",async()=>{
  const [bar,surface]=await Promise.all(["command-bar","command-surface"].map(read));
  assert.ok(bar.includes('this.ownerDocument.createElement("cu-button")'));
  assert.ok(bar.includes('this._actions.addEventListener("cu-press"'));
  assert.ok(bar.includes('event.stopPropagation()'));
  assert.ok(bar.includes('notify(this,"cu-action"'));
  assert.ok(surface.includes('extends CuCommandBar'));
});
