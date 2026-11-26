import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { paginate, filterCommands, nextRovingIndex } from "../packages/web/src/interactions.js";

test("pagination clamps page range and handles empty data", () => {
  const items = Array.from({length: 11}, (_, n) => n + 1);
  assert.deepEqual(paginate(items, 4, 2), {
    items:[5,6,7,8], page:2, pageSize:4, totalItems:11, totalPages:3, start:5, end:8
  });
  assert.deepEqual(paginate(items, 4, 99).items, [9,10,11]);
  assert.equal(paginate(items, 4, -1).page, 1);
  assert.deepEqual(paginate([], 4), {items:[],page:1,pageSize:4,totalItems:0,totalPages:1,start:0,end:0});
  assert.throws(() => paginate(items, 0), RangeError);
  assert.throws(() => paginate("not-an-array", 4), TypeError);
});

test("command search matches labels, descriptions, multiple terms and keywords", () => {
  const commands = [
    {label:"Switch Dark Theme", description:"Change appearance", keywords:["night", "fluent"]},
    {label:"Open Forms", description:"Inputs and controls"},
    {label:"Browse Catalog", keywords:["components"]}
  ];
  assert.deepEqual(filterCommands(commands, "forms").map(c => c.label), ["Open Forms"]);
  assert.deepEqual(filterCommands(commands, "NIGHT appearance").map(c => c.label), ["Switch Dark Theme"]);
  assert.deepEqual(filterCommands(commands, "  ").map(c => c.label), commands.map(c => c.label));
  assert.equal(filterCommands(commands, "nothing").length, 0);
});

test("menu and combobox keyboard navigation cycles correctly", () => {
  assert.equal(nextRovingIndex(0, 3, "ArrowUp"), 2);
  assert.equal(nextRovingIndex(2, 3, "ArrowDown"), 0);
  assert.equal(nextRovingIndex(2, 3, "Home"), 0);
  assert.equal(nextRovingIndex(0, 3, "End"), 2);
  assert.equal(nextRovingIndex(1, 3, "Enter"), -1);
  assert.equal(nextRovingIndex(0, 0, "ArrowDown"), -1);
});

test("playground includes new native-first preview patterns without sidebar glyphs", async () => {
  const html = await readFile(new URL("../apps/playground-web/index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../apps/playground-web/styles.css", import.meta.url), "utf8");
  const theme = await readFile(new URL("../packages/theme/src/components.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../apps/playground-web/main.js", import.meta.url), "utf8");
  for(const id of ["patterns","sample-drawer","open-drawer","demo-menu","info-popover",
    "demo-pagination","command-palette","open-command","wc-empty-create","wc-empty-reset"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing preview id: ${id}`);
  }
  assert.doesNotMatch(html, /class="side-icon"/);
  assert.doesNotMatch(css, /border-left-color:\s*var\(--cu-accent\)/);
  for(const cls of [".cu-accordion",".cu-tooltip-wrap",".cu-popover-panel",".cu-menu-popup",
    ".cu-empty-state",".cu-page-button",".cu-drawer",".cu-command-dialog"]) {
    assert.ok(theme.includes(cls), `Missing visual CSS: ${cls}`);
  }
  assert.match(app, /commandPalette\.commands\s*=/);
  assert.match(html, /<cu-command-palette\b/);
  assert.match(html, /<cu-empty-state\b/);
  assert.match(app, /enhancePagination/);
  assert.match(app, /enhanceMenu/);
  assert.match(app, /enhancePopover/);
});
