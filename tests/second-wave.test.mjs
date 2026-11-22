
import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
  CuSelect, CuRadio, CuRadioGroup, CuTab, CuTabs, CuTooltip, CuPopover
} from "../packages/web/src/components/index.js";

const file = path => readFile(new URL(path, import.meta.url), "utf8");

test("five new controls and data-only tags import without document", () => {
  for (const control of [CuSelect, CuRadioGroup, CuTabs, CuTooltip, CuPopover]) {
    assert.equal(typeof control, "function");
    assert.ok(Array.isArray(control.observedAttributes));
  }
  for (const definition of [CuRadio,CuTab]) assert.equal(typeof definition, "function");
  assert.equal(CuSelect.formAssociated, true);
  assert.equal(CuRadioGroup.formAssociated, true);
  assert.ok(CuTabs.observedAttributes.includes("active"));
  assert.ok(CuPopover.observedAttributes.includes("open"));
});

test("package exposes independently importable ESM entry points", async () => {
  const pkg = JSON.parse(await file("../packages/web/package.json"));
  for (const component of ["select","radio-group","tabs","tooltip","popover"]) {
    const entry = pkg.exports["./components/" + component];
    assert.equal(entry.default, "./src/components/" + component + ".js");
    assert.equal(entry.types, "./src/components/index.d.ts");
  }
  const index = await file("../packages/web/src/components/index.js");
  for (const name of ["CuSelect","CuRadioGroup","CuTabs","CuTooltip","CuPopover"]) {
    assert.ok(index.includes(name));
  }
  assert.equal(pkg.private, true);
});

test("new control implementations use form internals and native accessibility patterns", async () => {
  const select = await file("../packages/web/src/components/select.js");
  const radio = await file("../packages/web/src/components/radio-group.js");
  const tabs = await file("../packages/web/src/components/tabs.js");
  const tooltip = await file("../packages/web/src/components/tooltip.js");
  const popover = await file("../packages/web/src/components/popover.js");
  for (const script of [select,radio]) {
    assert.match(script, /attachInternals/);
    assert.match(script, /setFormValue/);
    assert.match(script, /setValidity/);
  }
  assert.match(select, /copyOptions/);
  assert.match(select, /MutationObserver/);
  assert.match(radio, /fieldset/);
  assert.match(tabs, /aria-selected/);
  assert.match(tabs, /aria-controls/);
  assert.match(tabs, /aria-labelledby/);
  assert.match(tooltip, /aria-description/);
  assert.match(tooltip, /focus-within/);
  assert.match(popover, /aria-expanded/);
  assert.match(popover, /Escape/);
});

test("playground demonstrates live Select/RadioGroup, Tabs, Tooltip and Popover", async () => {
  const html = await file("../apps/playground-web/index.html");
  const js = await file("../apps/playground-web/main.js");
  for (const tag of ["cu-select","cu-radio-group","cu-radio","cu-tabs","cu-tab","cu-tooltip","cu-popover"]) {
    assert.ok(html.includes("<" + tag), "missing " + tag);
  }
  for (const id of ["wc-choice-form","wc-choice-result","wc-tabs","wc-popover","wc-popover-close"]) {
    assert.ok(html.includes('id="' + id + '"'));
  }
  assert.match(js, /FormData\(wcChoiceForm\)/);
  assert.match(js, /wcTabs\.addEventListener\("cu-change"/);
  assert.match(js, /wcPopover\.addEventListener\("cu-close"/);
});

test("catalog has 32 previews and none promoted prematurely", async () => {
  const catalog = JSON.parse(await file("../design-system/components/catalog.json"));
  const components = catalog.groups.flatMap(group => group.components);
  const status = new Map(components.map(c => [c.name,c.status]));
  for (const name of ["Select","RadioGroup","Tabs","Tooltip","Popover"]) {
    assert.equal(status.get(name), "preview");
  }
  assert.equal(components.length,129);
  assert.equal(components.filter(c => c.status === "preview").length,32);
  assert.equal(components.filter(c => c.status === "ready").length,0);
});
