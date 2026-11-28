
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuDatePicker, CuSlider, CuProgressBar, CuBadge,
  CuAvatar, CuMenu, CuMenuItem, initialsFromName
} from "../packages/web/src/components/index.js";

const read = path => readFile(new URL(path, import.meta.url), "utf8");

test("third-wave Custom Elements import in Node without a DOM", () => {
  for (const ctor of [CuDatePicker,CuSlider,CuProgressBar,CuBadge,CuAvatar,CuMenu,CuMenuItem]) {
    assert.equal(typeof ctor,"function");
  }
  for (const ctor of [CuDatePicker,CuSlider,CuProgressBar,CuAvatar,CuMenu]) {
    assert.ok(Array.isArray(ctor.observedAttributes));
  }
  assert.equal(CuDatePicker.formAssociated,true);
  assert.equal(CuSlider.formAssociated,true);
  assert.ok(CuMenu.observedAttributes.includes("open"));
});

test("avatar initials are Unicode-aware and use a deterministic fallback", () => {
  assert.equal(initialsFromName("Võ Xuân Dương"),"VD");
  assert.equal(initialsFromName("Lan"),"L");
  assert.equal(initialsFromName(""),"?");
  assert.equal(initialsFromName("  Alex    Nguyen  "),"AN");
});

test("new components expose individual package entry points", async () => {
  const manifest = JSON.parse(await read("../packages/web/package.json"));
  for (const name of ["date-picker","slider","progress-bar","badge","avatar","menu"]) {
    assert.equal(manifest.exports["./components/" + name].default,
      "./dist/components/" + name + ".js");
    assert.equal(manifest.exports["./components/" + name].types,
      "./dist/components/index.d.ts");
  }
  assert.equal(manifest.private,true);
});

test("new components use native controls, semantic tokens and safe text rendering", async () => {
  const date = await read("../packages/web/src/components/date-picker.js");
  const slider = await read("../packages/web/src/components/slider.js");
  const progress = await read("../packages/web/src/components/progress-bar.js");
  const badge = await read("../packages/web/src/components/badge.js");
  const avatar = await read("../packages/web/src/components/avatar.js");
  const menu = await read("../packages/web/src/components/menu.js");
  for (const file of [date,slider]) {
    assert.match(file,/attachInternals/);
    assert.match(file,file===date?/syncFieldValidity/:/setFormValue/);
    assert.match(file,/formResetCallback/);
  }
  assert.match(date,/type="date"/);
  assert.match(slider,/type="range"/);
  assert.match(progress,/<progress/);
  assert.match(badge,/var\(--cu-accent/);
  assert.match(avatar,/addEventListener\("error"/);
  assert.match(avatar,/textContent = initialsFromName/);
  assert.match(menu,/setAttribute\("role",\s*"menuitem"\)/);
  assert.match(menu,/event\.key === "Escape"/);
  assert.match(menu,/notify\(this,"cu-select"/);
});

test("Playground contains working Web Components wave-three previews", async () => {
  const html = await read("../apps/playground-web/index.html");
  const js = await read("../apps/playground-web/main.js");
  for (const tag of ["cu-date-picker","cu-slider","cu-progress-bar","cu-badge",
    "cu-avatar","cu-menu","cu-menu-item"]) assert.ok(html.includes("<" + tag));
  for (const id of ["wc-utility-form","wc-utility-result","wc-progress",
    "wc-progress-step","wc-menu","wc-menu-result"]) assert.ok(html.includes('id="' + id + '"'));
  assert.match(js,/new FormData\(wcUtilityForm\)/);
  assert.match(js,/wcProgress\.value/);
  assert.match(js,/addEventListener\("cu-select"/);
});

test("third-wave catalog remains preview-only", async () => {
  const catalog = JSON.parse(await read("../design-system/components/catalog.json"));
  const components = catalog.groups.flatMap(g => g.components);
  const byName = new Map(components.map(item => [item.name,item.status]));
  for (const name of ["DatePicker","Slider","ProgressBar","Badge","Avatar","Menu"])
    assert.equal(byName.get(name),"preview");
  assert.equal(components.length,184);
  assert.equal(components.filter(item => item.status === "preview").length,184);
  assert.equal(components.filter(item => item.status === "ready").length,0);
});
