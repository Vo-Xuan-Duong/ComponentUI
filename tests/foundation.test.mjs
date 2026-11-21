import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const json = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
test("Component catalog contains unique names and priorities", async () => {
  const data = await json("../design-system/components/catalog.json");
  const all = data.groups.flatMap(group => group.components.map(c => c.name));
  assert.ok(all.length >= 100);
  assert.equal(all.length, new Set(all).size, "Component names must be globally unique");
  for (const group of data.groups) for (const item of group.components) {
    assert.match(item.name, /^[A-Z][a-zA-Z0-9]+$/);
    assert.ok(["P0", "P1", "P2"].includes(item.priority));
    assert.ok(["planned", "preview", "ready"].includes(item.status));
  }
});
test("Token names and theme roles are consistent", async () => {
  const tokens = await json("../design-system/tokens/fluent-calm.tokens.json");
  const a = Object.keys(tokens.theme.light).filter(k=> !k.startsWith("$"));
  const b = Object.keys(tokens.theme.dark).filter(k=> !k.startsWith("$"));
  assert.deepEqual(a.sort(), b.sort());
  for (const mode of ["light","dark"]) for (const role of a) {
    const ref = tokens.theme[mode][role].$value;
    assert.match(ref, /^\{palette\.[\w.]+\}$/);
    assert.ok(ref.slice(1,-1).split(".").reduce((v,k)=>v?.[k],tokens));
  }
});
