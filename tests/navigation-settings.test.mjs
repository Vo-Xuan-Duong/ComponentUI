import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuNavigationView, nextNavigationIndex, CuSettingsPage,
  CuSettingsGroup, CuSettingsItem, matchesSettingsQuery
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS } from "../packages/react/src/index.js";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("v0.12 navigation and settings elements are Node import safe",()=>{
  for(const Class of [CuNavigationView,CuSettingsPage,CuSettingsGroup,CuSettingsItem])
    assert.equal(typeof Class,"function");
  assert.deepEqual(CuNavigationView.observedAttributes,["label","value"]);
  assert.ok(CuSettingsPage.observedAttributes.includes("searchable"));
});

test("NavigationView arrow and Home/End index logic wraps safely",()=>{
  assert.equal(nextNavigationIndex(4,0,"ArrowUp"),3);
  assert.equal(nextNavigationIndex(4,3,"ArrowDown"),0);
  assert.equal(nextNavigationIndex(4,2,"ArrowLeft"),1);
  assert.equal(nextNavigationIndex(4,2,"ArrowRight"),3);
  assert.equal(nextNavigationIndex(4,2,"Home"),0);
  assert.equal(nextNavigationIndex(4,2,"End"),3);
  assert.equal(nextNavigationIndex(0,0,"ArrowDown"),-1);
});

test("SettingsPage metadata search is case-insensitive and excludes control values",()=>{
  const record={label:"Theme",description:"Choose a color theme",keywords:"Dark Light"};
  assert.equal(matchesSettingsQuery(record,""),true);
  assert.equal(matchesSettingsQuery(record," dark "),true);
  assert.equal(matchesSettingsQuery(record,"COLOR"),true);
  assert.equal(matchesSettingsQuery(record,"password"),false);
  assert.equal(matchesSettingsQuery({label:"Privacy"},"PRIVACY"),true);
});

test("NavigationView uses native anchors/buttons, aria-current and no accent stripe",async()=>{
  const src=await read("../packages/web/src/components/navigation-view.js");
  for(const pattern of [
    /<nav class="navigation"/,/::slotted\(a\)/,
    /aria-current/,/this\.select\(/,/cu-change/,
    /aria-disabled/,/event\.preventDefault\(\)/,
    /ArrowUp/,/Home/,/End/,/focus-visible/
  ])assert.match(src,pattern);
  assert.doesNotMatch(src,/border-left:\s*3px solid/);
});

test("SettingsPage filters groups and individual rows without reading input values",async()=>{
  const page=await read("../packages/web/src/components/settings-page.js");
  const group=await read("../packages/web/src/components/settings-group.js");
  const item=await read("../packages/web/src/components/settings-item.js");
  assert.match(page,/input type="search"/);
  assert.match(page,/matchesSettingsQuery/);
  assert.match(page,/data-cu-filter-hidden/);
  assert.match(page,/cu-filter/);
  assert.match(page,/MutationObserver/);
  assert.match(page,/attributeFilter:\["label","description","keywords"\]/);
  assert.doesNotMatch(page,/\b(control|input)\.value\b.*(toLocaleLowerCase|includes)/);
  assert.match(group,/part="group"/);
  assert.match(item,/slot name="control"/);
  assert.match(item,/container-type:inline-size/);
});

test("Web package, TypeScript declarations and React wrappers expose four new tags",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const dts=await read("../packages/web/src/components/index.d.ts");
  const react=await read("../packages/react/src/components.js");
  for(const [name,tag] of [
    ["NavigationView","navigation-view"],["SettingsPage","settings-page"],
    ["SettingsGroup","settings-group"],["SettingsItem","settings-item"]
  ]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(react.includes(name));
    assert.ok(dts.includes("Cu"+name));
    assert.equal(manifest.exports["./components/"+tag].default,
      "./dist/components/"+tag+".js");
  }
  assert.equal(REACT_EVENT_PROPS.onCuFilter,"cu-filter");
  assert.equal(Object.keys(REACT_TAGS).length,175);
});

test("Playground composes AppShell and SettingsPage with real controls",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const script=await read("../apps/playground-web/main.js");
  for(const tag of ["cu-navigation-view","cu-settings-page","cu-settings-group","cu-settings-item"])
    assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-navigation-view","wc-settings-page","wc-settings-result","wc-app-shell"])
    assert.ok(html.includes('id="'+id+'"'));
  assert.match(script,/workspaceNavigation\.addEventListener\("cu-change"/);
  assert.match(script,/settingsPage\.addEventListener\("cu-filter"/);
  assert.doesNotMatch(html,/<select\b/i);
});

test("catalog, package versions and preview status remain synchronized",async()=>{
  const root=JSON.parse(await read("../package.json"));
  assert.equal(root.version,"0.12.0");
  for(const name of ["icons","theme","web","react","vue","svelte"]){
    const p=JSON.parse(await read("../packages/"+name+"/package.json"));
    assert.equal(p.version,root.version);
    assert.equal(p.private,true);
  }
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));
  const records=catalog.groups.flatMap(group=>group.components);
  for(const name of ["NavigationView","SettingsPage"])
    assert.equal(records.find(r=>r.name===name)?.status,"preview");
  assert.equal(records.length,164);
  assert.equal(records.filter(r=>r.status==="preview").length,164);
  assert.equal(records.filter(r=>r.status==="planned").length,0);
  assert.equal(records.filter(r=>r.status==="ready").length,0);
});
