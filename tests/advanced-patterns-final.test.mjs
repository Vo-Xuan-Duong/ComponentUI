import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuCommandSurface,CuCommandBar,CuDashboardShell,CuAppShell,normalizeTreeTableItems,visibleTreeTableRows,normalizeTasks,normalizeMessages,normalizeSearchResults,filterSearchResults,normalizeUploadItems} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("tree table rejects duplicate and cyclic ids and expands hierarchy",()=>{
  const root={id:"a",label:"A",children:[{id:"b",label:"B",values:{count:4}}]};root.children.push(root);
  const items=normalizeTreeTableItems([root,{id:"a",label:"Duplicate"}]);
  assert.equal(items.length,1);assert.equal(items[0].children.length,1);assert.equal(items[0].children[0].values.count,"4");
  assert.deepEqual(visibleTreeTableRows(items,[]).map(x=>x.item.id),["a"]);
  assert.deepEqual(visibleTreeTableRows(items,["a"]).map(x=>x.depth),[0,1]);
});
test("task and message normalization ignores duplicates and invalid values",()=>{
  assert.deepEqual(normalizeTasks([{id:"a",label:"A",completed:true},{id:"a",label:"Duplicate"}]),[{id:"a",label:"A",completed:true,disabled:false}]);
  assert.equal(normalizeMessages([{id:"a",text:"<b>literal</b>"},{id:"a",text:"duplicate"}])[0].text,"<b>literal</b>");
});
test("search results filter Vietnamese diacritics and all terms",()=>{
  const items=normalizeSearchResults([{id:"a",title:"Độ rộng",description:"Panel layout"},{id:"b",title:"Layout"}]);
  assert.deepEqual(filterSearchResults(items,"do rong layout").map(x=>x.id),["a"]);
});
test("upload items clamp progress and normalize states",()=>{
  const items=normalizeUploadItems([{id:"a",name:"a.txt",progress:150,status:"uploading"},{id:"b",name:"b.txt",status:"complete"},{id:"c",name:"c.txt",progress:-1,status:"unknown"}]);
  assert.equal(items[0].progress,100);assert.equal(items[1].progress,100);assert.equal(items[2].progress,0);assert.equal(items[2].status,"queued");
});
test("advanced aliases reuse shared command and shell behavior",()=>{
  assert.ok(CuCommandSurface.prototype instanceof CuCommandBar);assert.ok(CuDashboardShell.prototype instanceof CuAppShell);
});
test("advanced component exports, demos and event mappings",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["TreeTable","tree-table"],["Masonry","masonry"],["TaskPanel","task-panel"],["CommandSurface","command-surface"],["WindowPane","window-pane"],["ChatComposer","chat-composer"],["MessageList","message-list"],["SearchResults","search-results"],["MediaPlayer","media-player"],["UploadManager","upload-manager"],["Wizard","wizard"],["DashboardShell","dashboard-shell"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuSend,"cu-send");assert.equal(REACT_EVENT_PROPS.onCuFinish,"cu-finish");
});
test("all catalog entries have preview coverage without claiming ready",async()=>{
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));
  const items=catalog.groups.flatMap(g=>g.components);assert.equal(items.length,176);assert.equal(items.every(x=>x.status==="preview"),true);
  for(const item of items)assert.ok(REACT_TAGS[item.name],item.name);
});
