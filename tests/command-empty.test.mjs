import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuCommandPalette,CuEmptyState,normalizePaletteCommands,searchPaletteCommands} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("palette normalizes unique commands and preserves metadata",()=>{
  const items=normalizePaletteCommands([{value:"a",label:"Alpha",keywords:["one"],disabled:true},{value:"a"},{value:"b"},null,{value:""}]);
  assert.equal(items.length,2);assert.equal(items[0].disabled,true);
  assert.deepEqual(items[0].keywords,["one"]);assert.equal(items[1].label,"b");
});
test("palette search matches Vietnamese diacritics and ranks prefixes",()=>{
  const commands=normalizePaletteCommands([{value:"1",label:"Mở cài đặt"},{value:"2",label:"Cài đặt giao diện"},{value:"3",label:"Đổi màu",keywords:["theme"]}]);
  assert.deepEqual(searchPaletteCommands(commands,"cai dat").map(x=>x.value),["2","1"]);
  assert.deepEqual(searchPaletteCommands(commands,"doi theme").map(x=>x.value),["3"]);
  assert.equal(searchPaletteCommands(commands,"missing").length,0);
});
test("palette controlled commands return defensive copies",()=>{
  const palette=Object.create(CuCommandPalette.prototype);palette._commands=[];palette._render=()=>{};
  assignCuProperties(palette,"cu-command-palette",{commands:[{value:"save",keywords:["write"]}]});
  const commands=palette.commands;commands[0].keywords.push("extra");
  assert.deepEqual(palette.commands[0].keywords,["write"]);
});
test("palette selection ignores disabled commands",()=>{
  const palette=Object.create(CuCommandPalette.prototype);
  palette._visible=[{value:"disabled",disabled:true}];
  palette.close=()=>assert.fail("disabled command closed the dialog");
  palette._commit(0);palette._commit(-1);
});
test("empty state exposes slots and layout variants",async()=>{
  assert.ok(CuEmptyState.observedAttributes.includes("description"));
  const source=await read("../packages/web/src/components/empty-state.js");
  for(const marker of ['slot name="illustration"','slot name="title"','slot name="actions"','[align=start]','[size=sm]'])assert.ok(source.includes(marker),marker);
});
test("new native implementations have package exports and live Playground wiring",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  const main=await read("../apps/playground-web/main.js");
  for(const [name,tag] of [["CommandPalette","command-palette"],["EmptyState","empty-state"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.ok(main.includes("commandPalette.commands = paletteActions"));
  assert.ok(main.includes('commandPalette.addEventListener("cu-select"'));
  assert.ok(!main.includes("enhanceCommandPalette("));
});
