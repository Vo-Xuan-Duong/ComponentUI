import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(path, import.meta.url),"utf8");

test("all five real Playground Select controls use cu-select, never native select",async()=>{
  const html=await read("../apps/playground-web/index.html");
  assert.doesNotMatch(html,/<select(?:\s|>)/i,
    "No standalone OS-native <select> menus should remain in Playground");
  assert.doesNotMatch(html,/<\/select\s*>/i);
  for(const id of ["theme-select","density-select","catalog-category","catalog-priority"]){
    assert.match(html,new RegExp('<cu-select[^>]*\\bid="'+id+'"'));
  }
  assert.match(html,/<cu-select name="project" label="Project type"/);
  assert.match(html,/<option value="Web application">Web application<\/option>/);
  assert.match(html,/<option value="Desktop application">Desktop application<\/option>/);
  assert.match(html,/<option value="Mobile application">Mobile application<\/option>/);
});

test("toolbar updates use cu-change and preserve persisted theme and density values",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const app=await read("../apps/playground-web/main.js");
  const css=await read("../apps/playground-web/styles.css");
  assert.match(html,/id="theme-select" aria-label="Theme" value="system"/);
  assert.match(html,/id="density-select" aria-label="Control density" value="comfortable"/);
  assert.match(app,/themeControl\.addEventListener\("cu-change"/);
  assert.match(app,/densityControl\.addEventListener\("cu-change"/);
  assert.match(app,/themeControl\.value = state\.theme/);
  assert.match(app,/densityControl\.value = state\.density/);
  assert.doesNotMatch(app,/themeControl\.addEventListener\("change"/);
  assert.match(css,/cu-select\.toolbar-select::part\(control\)/);
  assert.match(css,/cu-select\.toolbar-select::part\(popup\)/);
});

test("dynamic category options continue to render and filter via cu-change",async()=>{
  const app=await read("../apps/playground-web/main.js");
  const select=await read("../packages/web/src/components/select.js");
  const html=await read("../apps/playground-web/index.html");
  assert.match(html,/id="catalog-category"[^>]*><option value="">All categories<\/option>/);
  assert.match(app,/categorySelect\.append\(option\)/);
  assert.match(app,/categorySelect\.addEventListener\("cu-change", renderCatalog\)/);
  assert.match(app,/prioritySelect\.addEventListener\("cu-change", renderCatalog\)/);
  assert.match(app,/searchInput\.addEventListener\("cu-input", renderCatalog\)/);
  assert.match(select,/record\.type === "childList"/);
  // A host childList mutation must NOT be filtered out, because append(option)
  // changes the cu-select light-DOM host itself.
  assert.doesNotMatch(select,/records\.some\(record => record\.target !== this &&/);
  assert.match(select,/this\._renderOptions\(\)/);
});

test("project Select participates in FormData and restores initial value on form reset",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const select=await read("../packages/web/src/components/select.js");
  assert.match(html,/<form id="sample-form"/);
  assert.match(html,/<cu-select name="project" label="Project type" value="Web application"/);
  assert.match(select,/static formAssociated = true/);
  assert.match(select,/setFormValue/);
  assert.match(select,/formResetCallback/);
  assert.match(select,/notify\(this,"cu-change"/);
  assert.match(select,/document\.createElement\("cu-icon"\)/);
});

test("remaining native selection CSS cannot accidentally style a custom Select host",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const css=await read("../apps/playground-web/styles.css");
  const source=await read("../packages/web/src/components/select.js");
  assert.doesNotMatch(html,/class="cu-select"/);
  assert.match(css,/catalog-tools cu-select\.catalog-select/);
  assert.match(source,/\.option:hover:not\(\[aria-disabled=true\]\)/);
  assert.doesNotMatch(source,/box-shadow:inset 3px 0 0/);
});
