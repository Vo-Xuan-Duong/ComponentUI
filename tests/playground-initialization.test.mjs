import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

test("playground entry point parses and demo IDs are unique", async () => {
  const syntax = spawnSync(process.execPath, ["--check", "apps/playground-web/main.js"], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
  const html = await readFile("apps/playground-web/index.html", "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Playground element IDs must be unique");
  assert.match(html, /<cu-form id="wc-composed-form"/);
  assert.match(html, /<form id="wc-form"/);
});
