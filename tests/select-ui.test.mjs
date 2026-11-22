
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CuSelect, normalizeSelectOptions } from "../packages/web/src/components/select.js";

const read = path => readFile(new URL(path, import.meta.url),"utf8");

test("Select UI remains importable in Node without browser globals", () => {
  assert.equal(typeof CuSelect,"function");
  assert.equal(CuSelect.formAssociated,true);
  assert.ok(CuSelect.observedAttributes.includes("placeholder"));
});

test("declarative option normalization preserves optgroups, disabled and selection", () => {
  const entries = normalizeSelectOptions([
    {tag:"option",label:"Choose...",value:"",selected:true},
    {tag:"option",label:"React / Next.js",value:"react",group:"Web"},
    {tag:"option",label:"Vue / Nuxt",value:"vue",group:"Web",disabled:true},
    {tag:"option",label:"Svelte",value:"svelte",group:"Web"}
  ]);
  assert.deepEqual(entries.map(entry => entry.value),["","react","vue","svelte"]);
  assert.equal(entries[1].group,"Web");
  assert.equal(entries[0].selected,true);
  assert.equal(entries[2].disabled,true);
  assert.equal(entries[3].disabled,false);
});

test("Select shadow popup is custom Fluent Calm listbox, not an OS select popup", async () => {
  const src = await read("../packages/web/src/components/select.js");
  assert.match(src,/role="combobox"/);
  assert.match(src,/role="listbox"/);
  assert.match(src,/role","option"/);
  assert.match(src,/aria-activedescendant/);
  assert.match(src,/aria-selected/);
  assert.match(src,/var\(--cu-surface-elevated/);
  assert.match(src,/var\(--cu-accent/);
  assert.match(src,/data-placement=top/);
  assert.doesNotMatch(src,/<select(?:\s|>)/);
});

test("Select still supports keyboard, form validation, dynamic options and change events", async () => {
  const src = await read("../packages/web/src/components/select.js");
  for (const key of ["Escape","Tab","Enter","ArrowDown","ArrowUp","Home","End"]) {
    assert.ok(src.includes('"' + key + '"'),"Missing keyboard behavior " + key);
  }
  assert.match(src,/MutationObserver/);
  assert.match(src,/formResetCallback/);
  assert.match(src,/setFormValue/);
  assert.match(src,/setValidity/);
  assert.match(src,/notify\(this,"cu-change"/);
  assert.match(src,/event\.composedPath\(\)/);
});

test("Playground shows custom Select with framework options and grouped Web category", async () => {
  const html = await read("../apps/playground-web/index.html");
  assert.match(html,/<cu-select name="framework"/);
  assert.match(html,/<optgroup label="Web">/);
  assert.match(html,/Fluent Calm listbox/);
});

test("hover provides a visible Fluent Calm active row in Light and Dark themes", async () => {
  const src = await read("../packages/web/src/components/select.js");
  assert.match(src, /\.option:hover:not\(\[aria-disabled=true\]\)/);
  assert.doesNotMatch(src, /box-shadow:inset 3px 0 0 var\(--cu-accent/);
  assert.match(src, /font-weight:600/);
  assert.match(src, /color-mix\(in srgb,var\(--cu-accent,#0067c0\) 20%/);
  assert.match(src, /pointerover/);
  assert.match(src, /this\._active = index/);
  assert.match(src, /this\._syncActive\(\{scroll:false\}\)/);
  assert.match(src, /aria-activedescendant/);
  assert.match(src, /if \(scroll\) node\.scrollIntoView/);
});

test("highlighted hover option differs from selected option and disabled is excluded", async () => {
  const src = await read("../packages/web/src/components/select.js");
  assert.match(src, /node\.dataset\.selected = String\(selected\)/);
  assert.match(src, /node\.setAttribute\("aria-selected",String\(selected\)\)/);
  assert.match(src, /node\.dataset\.active = String\(active\)/);
  assert.match(src, /option\.getAttribute\("aria-disabled"\) === "true"/);
  assert.match(src, /@media\(forced-colors:active\)/);
  assert.match(src, /@media\(prefers-reduced-motion:reduce\)/);
});

test("Fluent Calm avoids decorative accent strips on selection and alerts", async () => {
  const select = await read("../packages/web/src/components/select.js");
  const tabs = await read("../packages/web/src/components/tabs.js");
  const css = await read("../packages/theme/src/components.css");
  assert.doesNotMatch(select, /box-shadow:inset 3px 0 0/);
  assert.match(select, /\.option:hover:not\(\[aria-disabled=true\]\)/);
  assert.match(select, /\.option\[data-active=true\]/);
  assert.doesNotMatch(tabs, /border-left-color:var\(--cu-accent/);
  assert.doesNotMatch(css, /border-left:\s*3px solid var\(--cu-accent\)/);
  assert.match(tabs, /:host\(\[orientation=vertical\]\) button\[aria-selected=true\]/);
});
