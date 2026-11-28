import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resetShortcutItems} from "../packages/web/src/components/shortcut-settings.js";
import {normalizeInspectorRows,inspectorFields} from "../packages/web/src/components/data-inspector.js";
import {normalizeApiRequest,validateApiRequest,normalizeApiResponse} from "../packages/web/src/components/api-explorer.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("shortcut reset is atomic and retains locked assignments",()=>{
  const items=[{id:"save",shortcut:"Ctrl+Shift+S"},{id:"locked",shortcut:"Escape",disabled:true}];
  assert.equal(resetShortcutItems(items,[{id:"save",shortcut:"Escape"}]),null);
  const next=resetShortcutItems(items,[{id:"save",shortcut:"Ctrl+S"},{id:"locked",shortcut:"F12"}]);
  assert.deepEqual(next.map(x=>x.shortcut),["Ctrl+S","Escape"]);
  assert.equal(items[0].shortcut,"Ctrl+Shift+S");
});
test("data inspector clones JSON records and bounds distinct fields",()=>{
  const cycle={};cycle.self=cycle;
  const input=[{id:"a",nested:{value:4}},null,[],cycle,{other:true}];
  const rows=normalizeInspectorRows(input);
  assert.equal(rows.length,2);rows[0].nested.value=9;assert.equal(input[0].nested.value,4);
  assert.deepEqual(inspectorFields(rows).map(x=>x.value),["id","nested","other"]);
  assert.equal(inspectorFields([Object.fromEntries(Array.from({length:60},(_,i)=>["key"+i,i]))]).length,50);
});
test("API request validation accepts absolute HTTP URLs and rejects invalid combinations",()=>{
  assert.deepEqual(normalizeApiRequest({method:"post",url:" https://example.com/items ",body:"{}"}),{method:"POST",url:"https://example.com/items",body:"{}"});
  assert.equal(validateApiRequest({url:"https://example.com/items"}).valid,true);
  assert.equal(validateApiRequest({url:"file:///etc/passwd"}).valid,false);
  assert.equal(validateApiRequest({url:"https://user:pass@example.com/"}).valid,false);
  assert.equal(validateApiRequest({url:"/items"}).valid,false);
  assert.equal(validateApiRequest({method:"GET",url:"https://example.com",body:"{}"}).valid,false);
  assert.equal(validateApiRequest({method:"POST",url:"https://example.com",body:"{}"}).valid,true);
});
test("API response normalization preserves raw content",()=>{
  assert.deepEqual(normalizeApiResponse({status:200,body:"{}",contentType:"application/json"}),{status:200,body:"{}",contentType:"application/json"});
  assert.equal(normalizeApiResponse({status:999}).status,0);
  assert.equal(normalizeApiResponse(null),null);
});
test("application workspace tools reuse existing modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["ShortcutSettings","shortcut-settings",["keyboard-shortcut-editor","settings-page","button"]],["DocumentWorkspace","document-workspace",["window-manager","pdf-viewer","markdown-editor"]],["DataInspector","data-inspector",["query-builder","data-table","json-viewer","empty-state"]],["APIExplorer","api-explorer",["text-field","text-area","select","button","tabs","code-block","json-viewer"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
