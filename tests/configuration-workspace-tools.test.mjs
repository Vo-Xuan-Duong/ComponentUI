import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeWorkspaceSettings} from "../packages/web/src/components/workspace-settings.js";
import {CuDeveloperTools} from "../packages/web/src/components/developer-tools.js";
import {buildFormSchema} from "../packages/web/src/components/form-builder.js";
import {extractResponseRecords} from "../packages/web/src/components/data-source-editor.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("workspace settings normalize independent preference sections",()=>{
  const result=normalizeWorkspaceSettings({theme:{accent:"#abc",radius:100},shortcuts:[{id:"save",shortcut:"ctrl+s"},{id:"save"}],notifications:{email:true,digest:"bad"}});
  assert.equal(result.theme.accent,"#aabbcc");assert.equal(result.theme.radius,24);assert.equal(result.shortcuts.length,1);assert.equal(result.shortcuts[0].shortcut,"Ctrl+S");assert.equal(result.notifications.email,true);assert.equal(result.notifications.digest,"daily");
});
test("developer tools expose console output append",()=>{
  assert.equal(typeof CuDeveloperTools.prototype.append,"function");
});
test("form schema derives supported structural types and required names",()=>{
  const schema=buildFormSchema([{id:"a",name:"email",type:"email",label:"Email",required:true},{id:"b",name:"age",type:"number"},{id:"c",name:"agree",type:"checkbox",required:true},{id:"d",name:"email",type:"text"}]);
  assert.equal(schema.type,"object");assert.deepEqual(Object.keys(schema.properties),["email","age","agree"]);assert.equal(schema.properties.email.type,"string");assert.equal(schema.properties.age.type,"number");assert.equal(schema.properties.agree.type,"boolean");assert.deepEqual(schema.required,["email","agree"]);
});
test("record extraction handles pointers, escaping, invalid JSON and limits",()=>{
  assert.deepEqual(extractResponseRecords('[{"id":1},null,4]').rows,[{id:1}]);
  assert.deepEqual(extractResponseRecords('{"a/b":{"~key":[{"id":2}]}}',"/a~1b/~0key").rows,[{id:2}]);
  for(const path of ["items","/bad~2","/missing","/constructor","/items/01"])assert.ok(extractResponseRecords('{"items":[{}]}',path).error);
  assert.ok(extractResponseRecords("not JSON").error);assert.ok(extractResponseRecords("{}").error);assert.ok(extractResponseRecords(" ".repeat(2000001)+"[]").error);
  const result=extractResponseRecords(JSON.stringify(Array.from({length:1001},(_,i)=>({id:i}))));
  assert.equal(result.rows.length,1000);assert.equal(result.truncated,true);
});
test("configuration workspace tools reuse modules and expose exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["WorkspaceSettings","workspace-settings",["theme-editor","shortcut-settings","notification-settings","tabs"]],["DeveloperTools","developer-tools",["command-console","log-viewer","api-explorer"]],["FormBuilder","form-builder",["form-designer","schema-editor","tabs"]],["DataSourceEditor","data-source-editor",["api-explorer","data-inspector","text-field"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.ok(html.includes("<cu-"+tag));assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
