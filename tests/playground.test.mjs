import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { startServer } from "../scripts/serve.mjs";
import { applyPreferences, readPreferences } from "../packages/theme/src/theme.js";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("theme controller supports system, light/dark, density and accent", () => {
  const attrs = new Map();
  const root = {
    setAttribute: (key, value) => attrs.set(key, value),
    getAttribute: key => attrs.get(key) ?? null,
    removeAttribute: key => attrs.delete(key)
  };
  assert.deepEqual(applyPreferences(root, {theme:"dark", density:"touch", accent:"green"}),
    {theme:"dark", density:"touch", accent:"green"});
  assert.deepEqual(readPreferences(root), {theme:"dark", density:"touch", accent:"green"});
  applyPreferences(root, {theme:"system", density:"compact", accent:"purple"});
  assert.equal(root.getAttribute("data-cu-theme"), null);
  assert.equal(root.getAttribute("data-cu-density"), "compact");
  assert.throws(() => applyPreferences(root, {theme:"unsupported"}), RangeError);
});

test("playground imports shared tokens and exposes core preview sections", async () => {
  const html = await source("../apps/playground-web/index.html");
  const css = await source("../packages/theme/src/components.css");
  const app = await source("../apps/playground-web/main.js");
  for (const section of ["overview","controls","icons","forms","navigation","data","feedback","catalog"])
    assert.match(html, new RegExp(`id="${section}"`));
  for (const feature of ["theme-select","density-select","sample-dialog","catalog-results"])
    assert.ok(html.includes(`id="${feature}"`));
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors/);
  assert.match(app, /textContent = component\.name/);
  assert.match(html, /packages\/theme\/src\/tokens\.css/);
});

test("local preview serves HTML, CSS and catalog without any action runner", async (t) => {
  const server = startServer({port:0});
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, "listening");
  const port = server.address().port;
  const root = `http://127.0.0.1:${port}`;
  const start = await fetch(root + "/", {redirect:"manual"});
  assert.equal(start.status, 302);
  assert.equal(start.headers.get("location"), "/apps/playground-web/");
  const page = await fetch(root + "/apps/playground-web/");
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type"), /text\/html/);
  assert.match(await page.text(), /ComponentUI/);
  const theme = await fetch(root + "/packages/theme/src/tokens.css");
  assert.equal(theme.status, 200);
  assert.match(await theme.text(), /--cu-accent/);
  const catalog = await fetch(root + "/design-system/components/catalog.json");
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).groups.length, 8);
  const notFound = await fetch(root + "/missing.css");
  assert.equal(notFound.status, 404);
  const post = await fetch(root + "/apps/playground-web/", {method:"POST"});
  assert.equal(post.status, 405);
});
