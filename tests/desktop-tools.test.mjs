import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeMenuGroups} from "../packages/web/src/components/menu-bar.js";
import {normalizeRibbonTabs} from "../packages/web/src/components/ribbon.js";
import {normalizeTerminalLines} from "../packages/web/src/components/terminal.js";
import {resolveWindowId} from "../packages/web/src/components/window-manager.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("menu groups use shared command normalization",()=>{
  const groups=normalizeMenuGroups([{id:"file",items:[{value:"open"},{value:"open"},{value:"save",disabled:true}]},{id:"file",items:[]},null]);
  assert.equal(groups.length,1);
  assert.deepEqual(groups[0].items.map(i=>i.value),["open","save"]);
  assert.equal(groups[0].items[1].disabled,true);
});
test("ribbon normalizes tab and group IDs",()=>{
  const tabs=normalizeRibbonTabs([{id:"home",groups:[{id:"edit",commands:[{value:"copy"},{value:"copy"}]},{id:"edit"}]},{id:"home"},{id:"view",disabled:true}]);
  assert.equal(tabs.length,2);assert.equal(tabs[0].groups.length,1);
  assert.equal(tabs[0].groups[0].commands.length,1);assert.equal(tabs[1].disabled,true);
});
test("terminal normalizes multiline records and caps retained output",()=>{
  assert.deepEqual(normalizeTerminalLines(["old",{text:"a\r\nb",kind:"error"}],2),[{kind:"error",text:"a"},{kind:"error",text:"b"}]);
  assert.deepEqual(normalizeTerminalLines([{text:"x",kind:"invalid"},null]),[{kind:"output",text:"x"}]);
});
test("window selection falls back to an open pane",()=>{
  const windows=[{id:"a",closed:true},{id:"b"},{id:"c"}];
  assert.equal(resolveWindowId(windows,"a"),"b");
  assert.equal(resolveWindowId(windows,"c"),"c");
  assert.equal(resolveWindowId([{id:"a",closed:true}],"a"),"");
});
test("desktop tools reuse components and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["MenuBar","menu-bar",["menu-button","command-bar"]],["Ribbon","ribbon",["tabs","command-bar"]],["Terminal","terminal",["virtual-list","text-field","button"]],["WindowManager","window-manager",["window-pane","dock-layout","button","empty-state"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});

test("workspace lifecycle and file explorer shared search contracts",async()=>{
 const read=n=>readFile(new URL("../packages/web/src/components/"+n+".js",import.meta.url),"utf8");
 const manager=await read("window-manager"),explorer=await read("file-explorer");
 assert.match(manager,/if\(wasActive\)this\.active=this\.active/);
 assert.match(manager,/pane\.inert=hidden/);
 assert.match(manager,/this\._observer=null/);
 assert.match(explorer,/<cu-search-box class="search"/);
 assert.match(explorer,/this\._search\.addEventListener\("cu-input"/);
 assert.match(explorer,/e\.preventDefault\(\);e\.stopPropagation\(\);this\._showMenu/);
});

test("composed workspaces guard internal navigation and reuse close actions",async()=>{
 const read=n=>readFile(new URL("../packages/web/src/components/"+n+".js",import.meta.url),"utf8");
 const pane=await read("window-pane"),manager=await read("window-manager"),document=await read("document-workspace"),dev=await read("developer-tools"),shell=await read("application-shell");
 assert.match(pane,/<cu-icon-button class="close"/);
 assert.match(pane,/this\._content\.inert=this\.collapsed/);
 assert.match(manager,/if\(e\.target===this\._dock\)e\.stopPropagation\(\)/);
 assert.match(document,/\["document","notes"\]\.includes\(e\.detail\?\.value\)/);
 assert.match(dev,/if\(e\.target!==control\)return/);
 assert.match(shell,/if\(this\.selectSection\(e\.detail\.value\)\)/);
 assert.match(shell,/panel\.matches\(":focus-within"\)/);
});
