import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ICON_NAMES, ICON_NODES, getIconNodes } from "../packages/icons/src/icons.js";
import { CuIcon } from "../packages/web/src/components/icon.js";

const load = path => readFile(new URL(path, import.meta.url), "utf8");
const allowedElements = new Set(["path","circle","rect","line","polyline","polygon","ellipse"]);
const allowedAttributes = new Set(["d","cx","cy","r","rx","ry","x","y","width","height",
  "x1","x2","y1","y2","points","transform"]);

test("curated Lucide library is importable without a browser and has stable icon names", () => {
  assert.equal(ICON_NAMES.length,24);
  assert.equal(new Set(ICON_NAMES).size,ICON_NAMES.length);
  for (const name of ["plus","pencil","ellipsis","check","sparkles","palette","settings","search","x"]) {
    assert.ok(ICON_NAMES.includes(name), "missing icon " + name);
    assert.ok(getIconNodes(name)?.length > 0);
  }
  assert.equal(getIconNodes("__proto__"),null);
  assert.equal(getIconNodes("<script>"),null);
});

test("bundled SVG data uses only supported safe primitives and attributes", () => {
  for (const [name,nodes] of Object.entries(ICON_NODES)) {
    assert.ok(nodes.length > 0, name);
    for (const [tag,attributes] of nodes) {
      assert.ok(allowedElements.has(tag), name + " unexpected SVG element " + tag);
      for (const [attribute,value] of Object.entries(attributes)) {
        assert.ok(allowedAttributes.has(attribute), name + " unexpected SVG attribute " + attribute);
        assert.equal(typeof value,"string");
      }
    }
  }
});

test("cu-icon exports a decorative-by-default, currentColor SVG custom element", async () => {
  assert.equal(typeof CuIcon,"function");
  assert.ok(CuIcon.observedAttributes.includes("name"));
  assert.ok(CuIcon.observedAttributes.includes("size"));
  const source = await load("../packages/web/src/components/icon.js");
  assert.match(source, /createElementNS/);
  assert.match(source, /stroke:currentColor/);
  assert.match(source, /aria-hidden/);
  assert.match(source, /aria-label/);
  assert.match(source, /getIconNodes/);
  assert.doesNotMatch(source, /fetch\(/);
  const pkg = JSON.parse(await load("../packages/web/package.json"));
  assert.equal(pkg.exports["./components/icon"].default,"./src/components/icon.js");
});

test("Quick actions and other Playground glyphs now use one SVG component", async () => {
  const html = await load("../apps/playground-web/index.html");
  const js = await load("../apps/playground-web/main.js");
  const css = await load("../packages/theme/src/components.css");
  assert.ok(html.includes('id="icons"'), "Iconography gallery section missing");
  for (const [title,name] of [
    ["Add item","plus"],["Edit item","pencil"],
    ["More options","ellipsis"],["Confirmed","check"]
  ]) {
    assert.ok(html.includes('data-toast="' + title + '"><cu-icon name="' + name + '"'),
      "Quick action should use Lucide " + name);
  }
  for (const name of ["palette","panel-left","settings","chevron-right","x"]) {
    assert.ok(html.includes('<cu-icon name="' + name + '"'));
  }
  assert.ok(js.includes('document.createElement("cu-icon")'));
  assert.match(css,/\.cu-icon-btn cu-icon/);
  assert.ok(!html.includes('class="side-icon"'), "Sidebar remains text-only");
});

test("Lucide copyright and Feather-derived MIT terms are included locally", async () => {
  const license = await load("../packages/icons/LICENSE");
  assert.match(license,/ISC License/);
  assert.match(license,/Lucide Icons and Contributors/);
  assert.match(license,/The MIT License/);
  assert.match(license,/Cole Bemis/);
  const pkg = JSON.parse(await load("../packages/icons/package.json"));
  assert.equal(pkg.private,true);
  assert.equal(pkg.name,"@componentui/icons");
});
