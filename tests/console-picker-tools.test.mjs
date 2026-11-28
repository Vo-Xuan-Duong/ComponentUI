import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuCommandConsole} from "../packages/web/src/components/command-console.js";
import {CuTerminal} from "../packages/web/src/components/terminal.js";
import {normalizeShortcut,shortcutFromEvent,normalizeShortcutItems} from "../packages/web/src/components/keyboard-shortcut-editor.js";
import {normalizePaletteColors} from "../packages/web/src/components/color-palette.js";
import {normalizeFontFamilies,DEFAULT_FONT_FAMILIES} from "../packages/web/src/components/font-picker.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("command console inherits terminal behavior",()=>{
  assert.equal(Object.getPrototypeOf(CuCommandConsole.prototype),CuTerminal.prototype);
  assert.equal(typeof CuCommandConsole.prototype.submit,"function");
  assert.equal(typeof CuCommandConsole.prototype.showCommands,"function");
});
test("shortcut normalization and event capture",()=>{
  assert.equal(normalizeShortcut("shift+control+k"),"Ctrl+Shift+K");
  assert.equal(normalizeShortcut("cmd+F12"),"Meta+F12");
  assert.equal(normalizeShortcut("Ctrl++K"),null);
  assert.equal(normalizeShortcut("Ctrl"),null);
  assert.equal(normalizeShortcut(""),"");
  assert.equal(shortcutFromEvent({key:"k",ctrlKey:true,shiftKey:true}),"Ctrl+Shift+K");
  assert.equal(shortcutFromEvent({key:"Dead"}),null);
  assert.equal(normalizeShortcutItems([{id:"a",shortcut:"ctrl+s"},{id:"a"}]).length,1);
});
test("palette shares color parser and canonicalizes equivalent colors",()=>{
  assert.deepEqual(normalizePaletteColors(["#fff","rgb(255,255,255)","rgba(0,0,0,0.5)","invalid"]),[{value:"#ffffff",label:"#ffffff"},{value:"#00000080",label:"#00000080"}]);
});
test("font families are bounded and deduplicated",()=>{
  assert.deepEqual(normalizeFontFamilies([" Arial ","Arial","",null,"bad;name","Georgia"]),["Arial","Georgia"]);
  assert.ok(DEFAULT_FONT_FAMILIES.includes("system-ui"));
});
test("new controls reuse existing modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["CommandConsole","command-console",["terminal","command-palette","kbd"]],["KeyboardShortcutEditor","keyboard-shortcut-editor",["kbd","text-field","button"]],["ColorPalette","color-palette",["color-picker","button"]],["FontPicker","font-picker",["search-box","select"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
