import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuMentionInput,activeMention,insertMention} from "../packages/web/src/components/mention-input.js";
import {CuAutoComplete} from "../packages/web/src/components/autocomplete.js";
import {CuPhoneInput,normalizePhoneNumber,isInternationalPhone} from "../packages/web/src/components/phone-input.js";
import {CuQueryBuilder,normalizeQueryFields,filterQueryRows} from "../packages/web/src/components/query-builder.js";
import {CuFormulaInput,evaluateFormula} from "../packages/web/src/components/formula-input.js";
import {CuTextField} from "../packages/web/src/components/text-field.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("mention range and insertion preserve surrounding content",()=>{
  assert.deepEqual(activeMention("Hi @al",6),{start:3,end:6,query:"al"});
  assert.deepEqual(activeMention("Hi @alex there",6),{start:3,end:8,query:"al"});
  assert.deepEqual(insertMention("Hi @alex there",activeMention("Hi @alex there",6),"sam"),{value:"Hi @sam there",caret:7});
  assert.equal(activeMention("mail@example.com"),null);
  assert.equal(insertMention("@a",activeMention("@a"),"bad handle"),null);
  assert.equal(Object.getPrototypeOf(CuMentionInput.prototype),CuAutoComplete.prototype);
});
test("phone normalization and format checking reuse TextField",()=>{
  assert.equal(normalizePhoneNumber("+84 (912) 345-678"),"+84912345678");
  assert.equal(normalizePhoneNumber("123abc"),"");
  assert.equal(isInternationalPhone("+84 912 345 678"),true);
  assert.equal(isInternationalPhone("0912345678"),false);
  assert.equal(Object.getPrototypeOf(CuPhoneInput.prototype),CuTextField.prototype);
  assert.equal(CuPhoneInput.formAssociated,true);
});
test("query filters reuse comparison semantics and support AND/OR",()=>{
  const fields=normalizeQueryFields([{value:"score"},{value:"score"},{value:"name"}]);
  assert.equal(fields.length,2);
  const rows=[{name:"Alpha",score:80},{name:"Beta",score:30},{name:"Gamma",score:95}];
  const conditions=[{field:"score",operator:"greater-than",value:"70"},{field:"name",operator:"equals",value:"alpha"}];
  assert.deepEqual(filterQueryRows(rows,{logic:"and",conditions}).map(x=>x.name),["Alpha"]);
  assert.deepEqual(filterQueryRows(rows,{logic:"or",conditions}).map(x=>x.name),["Alpha","Gamma"]);
  assert.deepEqual(filterQueryRows(rows,{logic:"and",conditions:[]}),rows);
  assert.equal(typeof CuQueryBuilder,"function");
});
test("formula parser respects precedence and rejects invalid code",()=>{
  assert.equal(evaluateFormula("=(12 + 8) * 2.5").result,50);
  assert.equal(evaluateFormula("2+3*4").result,14);
  assert.equal(evaluateFormula("-(2+3)/2").result,-2.5);
  for(const x of ["1/0","1+","alert(1)","Math.PI","2**3","1e999","1".repeat(513)])assert.equal(evaluateFormula(x).valid,false,x);
  assert.equal(Object.getPrototypeOf(CuFormulaInput.prototype),CuTextField.prototype);
  assert.equal(CuFormulaInput.formAssociated,true);
});
test("four advanced inputs are exported and reuse existing components",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["MentionInput","mention-input",["autocomplete"]],["PhoneInput","phone-input",["text-field","_field"]],["QueryBuilder","query-builder",["data-filter","filter-utils","select","button","icon-button","empty-state"]],["FormulaInput","formula-input",["text-field","_field"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
