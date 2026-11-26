
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuButton, CuTextField, CuCheckbox, CuSwitch, CuDialog
} from "../packages/web/src/components/index.js";

const read = name => readFile(new URL(name, import.meta.url), "utf8");

test("Web Components modules import in non-DOM build tools", () => {
  // Import should be safe in SSR/build environments: DOM is accessed only
  // on element construction and lifecycle methods in the browser.
  for (const ctor of [CuButton, CuTextField, CuCheckbox, CuSwitch, CuDialog]) {
    assert.equal(typeof ctor, "function");
    assert.ok(Array.isArray(ctor.observedAttributes));
  }
  for (const ctor of [CuButton, CuTextField, CuCheckbox, CuSwitch]) {
    assert.equal(ctor.formAssociated, true);
  }
  assert.ok(CuTextField.observedAttributes.includes("required"));
  assert.ok(CuDialog.observedAttributes.includes("title"));
  assert.equal(CuSwitch.kind, "switch");
});

test("ESM exports contain five concrete browser components", async () => {
  const pkg = JSON.parse(await read("../packages/web/package.json"));
  const components = pkg.exports["./components"];
  assert.equal(components.default, "./dist/components/index.js");
  assert.equal(components.types, "./dist/components/index.d.ts");
  for (const name of ["button", "text-field", "checkbox", "switch", "dialog"]) {
    assert.ok(pkg.exports["./components/" + name]);
  }
  assert.equal(pkg.private, true, "Keep experimental package unpublished");
});

test("The Playground exercises the actual Custom Element tags and form data", async () => {
  const html = await read("../apps/playground-web/index.html");
  const main = await read("../apps/playground-web/main.js");
  for (const tag of ["cu-button", "cu-text-field", "cu-checkbox", "cu-switch", "cu-dialog"]) {
    assert.match(html, new RegExp("<" + tag + "(\\s|>)"));
  }
  for (const id of ["web-components", "wc-form", "wc-dialog", "wc-result"]) {
    assert.ok(html.includes('id="' + id + '"'), "missing element " + id);
  }
  assert.match(main, /components\/index\.js/);
  assert.match(main, /new FormData\(wcForm\)/);
  assert.match(main, /addEventListener\("cu-press"/);
  assert.match(main, /addEventListener\("cu-close"/);
});

test("Implementation uses native form internals and modal keyboard primitives", async () => {
  const field = await read("../packages/web/src/components/text-field.js");
  const check = await read("../packages/web/src/components/checkbox.js");
  const dialog = await read("../packages/web/src/components/dialog.js");
  assert.match(field, /attachInternals/);
  assert.match(field, /syncFieldValidity/);
  const sharedField=await read("../packages/web/src/components/_field.js");
  assert.match(sharedField,/setFormValue/);
  assert.match(sharedField,/setValidity/);
  assert.match(check, /role.*switch/);
  assert.match(check, /setFormValue/);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /cu-close/);
});

test("Preview status is separate from production readiness", async () => {
  const catalog = JSON.parse(await read("../design-system/components/catalog.json"));
  const list = catalog.groups.flatMap(group => group.components);
  const status = new Map(list.map(item => [item.name, item.status]));
  for (const name of ["Button", "TextField", "Checkbox", "Switch", "Dialog"]) {
    assert.equal(status.get(name), "preview");
  }
  assert.equal(list.length, 131);
  assert.equal(list.filter(item => item.status === "preview").length, 82);
  assert.equal(list.filter(item => item.status === "ready").length, 0);
});
