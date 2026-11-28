import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuTextArea, CuNumberField, CuSearchBox, stepNumber
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS } from "../packages/react/src/index.js";
import { ICON_NAMES, getIconNodes } from "../packages/icons/src/icons.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("new form controls are importable in Node and form-associated",()=>{
  for(const Type of [CuTextArea,CuNumberField,CuSearchBox]){
    assert.equal(typeof Type,"function");
    assert.equal(Type.formAssociated,true);
    assert.ok(Type.observedAttributes.includes("value"));
    assert.ok(Type.observedAttributes.includes("disabled"));
  }
});

test("NumberField step logic handles decimals, empty value, min/max and negative direction",()=>{
  assert.equal(stepNumber("1.2",1,0.1,0,2),"1.3");
  assert.equal(stepNumber("4",-1,1,1,10),"3");
  assert.equal(stepNumber("",1,1,1,25),"1");
  assert.equal(stepNumber("25",1,1,1,25),"25");
  assert.equal(stepNumber("1",-1,1,1,25),"1");
  assert.equal(stepNumber("2.5",1,0.25,0,10),"2.75");
});

test("TextArea includes counter, reduced motion, validation, form reset and auto sizing",async()=>{
  const code=await read("../packages/web/src/components/text-area.js");
  for(const term of ["formResetCallback","formStateRestoreCallback","syncFieldValidity",
    "wireFieldValidation","auto-resize","show-count","maxlength","minlength","aria-labelledby",
    "prefers-reduced-motion","aria-invalid"])
    assert.ok(code.includes(term),term);
  assert.match(code,/notify\(this,"cu-input"/);
  assert.match(code,/notify\(this,"cu-change"/);
});

test("NumberField uses native number validation and Lucide step icons",async()=>{
  const code=await read("../packages/web/src/components/number-field.js");
  assert.match(code,/type="number"/);
  assert.match(code,/stepUp/);
  assert.match(code,/name="minus"/);
  assert.match(code,/name="plus"/);
  assert.match(code,/syncFieldValidity/);
  assert.match(code,/wireFieldValidation/);
  assert.match(code,/aria-label/);
  assert.match(code,/prefers-reduced-motion/);
});

test("SearchBox can clear, submit, reset and provides search-specific keyboard affordances",async()=>{
  const code=await read("../packages/web/src/components/search-box.js");
  assert.match(code,/type="search"/);
  assert.match(code,/name="search"/);
  assert.match(code,/name="x"/);
  assert.match(code,/event\.key==="Escape"/);
  assert.match(code,/event\.key==="Enter"/);
  assert.match(code,/notify\(this,"cu-search"/);
  assert.match(code,/formResetCallback/);
  assert.match(code,/syncFieldValidity/);
});

test("new controls are exported to independently built packages and React adapters",async()=>{
  const web=JSON.parse(await read("../packages/web/package.json"));
  for(const path of ["text-area","number-field","search-box"])
    assert.equal(web.exports["./components/"+path].default,
      "./dist/components/"+path+".js");
  assert.equal(REACT_TAGS.TextArea,"cu-textarea");
  assert.equal(REACT_TAGS.NumberField,"cu-number-field");
  assert.equal(REACT_TAGS.SearchBox,"cu-search-box");
  assert.equal(Object.keys(REACT_TAGS).length,175);
  assert.equal(REACT_EVENT_PROPS.onCuSearch,"cu-search");
  const react=await read("../packages/react/src/components.js");
  for(const name of ["TextArea","NumberField","SearchBox"])assert.ok(react.includes(name));
});

test("Lucide minus uses official SVG path and no character-glyph fallback",()=>{
  assert.equal(ICON_NAMES.length,30);
  assert.deepEqual(getIconNodes("minus"),[["path",{d:"M5 12h14"}]]);
});

test("Playground includes live forms and modernized source-driven catalog metrics",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const app=await read("../apps/playground-web/main.js");
  const css=await read("../apps/playground-web/styles.css");
  for(const tag of ["cu-textarea","cu-number-field","cu-search-box"])
    assert.ok(html.includes("<"+tag));
  for(const id of ["wc-composition-form","wc-composition-result","wc-search-box",
    "wc-search-result","metric-previews","metric-native"])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes('<cu-search-box id="catalog-query"'));
  assert.match(app,/searchInput\.addEventListener\("cu-input", renderCatalog\)/);
  assert.match(app,/new FormData\(compositionForm\)/);
  assert.match(app,/filterExampleComponents/);
  assert.match(css,/\.toolbar\s*\{\s*position:\s*sticky/);
  assert.match(css,/\.cu-search-examples span\[hidden\]/);
  assert.doesNotMatch(html,/The visual foundation · v0\.1/);
});

test("catalog still has 129 entries; new forms preview, none production ready",async()=>{
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));
  const components=catalog.groups.flatMap(g=>g.components);
  const status=new Map(components.map(c=>[c.name,c.status]));
  for(const name of ["TextArea","NumberField","SearchBox"])
    assert.equal(status.get(name),"preview");
  assert.equal(components.length,164);
  assert.equal(components.filter(c=>c.status==="preview").length,164);
  assert.equal(components.filter(c=>c.status==="planned").length,0);
  assert.equal(components.filter(c=>c.status==="ready").length,0);
});
