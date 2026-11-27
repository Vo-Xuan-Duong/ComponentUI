import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuImageViewer,normalizeImageTransform} from "../packages/web/src/components/image-viewer.js";
import {CuTransferList,normalizeTransferItems,transferValues} from "../packages/web/src/components/transfer-list.js";
import {CuCurrencyInput,formatCurrencyValue} from "../packages/web/src/components/currency-input.js";
import {CuMaskedInput,applyInputMask,inputMaskPattern} from "../packages/web/src/components/masked-input.js";
import {CuNumberField} from "../packages/web/src/components/number-field.js";
import {CuTextField} from "../packages/web/src/components/text-field.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("image transform normalization and bounds",()=>{
  assert.deepEqual(normalizeImageTransform(400,-90),{zoom:300,rotation:270});
  assert.deepEqual(normalizeImageTransform(0,450),{zoom:25,rotation:90});
  assert.deepEqual(normalizeImageTransform(NaN,NaN),{zoom:100,rotation:0});
  assert.equal(typeof CuImageViewer,"function");
});
test("transfer values preserve order, reject unknown IDs and protect locked items",()=>{
  const items=normalizeTransferItems([{value:"a"},{value:"b",disabled:true},{value:"c"},{value:"a"},null]);
  assert.equal(items.length,3);
  assert.deepEqual(transferValues(items,["b"],["a","c","missing"],"add"),["a","b","c"]);
  assert.deepEqual(transferValues(items,["a","b","c"],["a","b"],"remove"),["b","c"]);
  assert.deepEqual(transferValues(items,[],["b"],"add"),[]);
  assert.equal(typeof CuTransferList,"function");
});
test("currency input inherits native number behavior and formats without conversion",()=>{
  assert.equal(Object.getPrototypeOf(CuCurrencyInput.prototype),CuNumberField.prototype);
  assert.equal(CuCurrencyInput.formAssociated,true);
  assert.equal(formatCurrencyValue(129.99,"USD","en-US"),"$129.99");
  assert.equal(formatCurrencyValue("", "USD"),"");
  assert.equal(formatCurrencyValue(12,"INVALID"),"");
});
test("mask handles raw and formatted input, partial values and validation patterns",()=>{
  assert.equal(Object.getPrototypeOf(CuMaskedInput.prototype),CuTextField.prototype);
  assert.equal(CuMaskedInput.formAssociated,true);
  assert.deepEqual(applyInputMask("5551234567","(###) ###-####"),{value:"(555) 123-4567",rawValue:"5551234567",complete:true});
  assert.deepEqual(applyInputMask("AB-1234","AA-####"),{value:"AB-1234",rawValue:"AB1234",complete:true});
  assert.equal(applyInputMask("123","###-##").complete,false);
  assert.equal(new RegExp("^(?:"+inputMaskPattern("AA-####")+")$","u").test("AB-1234"),true);
});
test("new controls are exported and composed from existing modules",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["ImageViewer","image-viewer",["image","slider","scroll-area","button"]],["TransferList","transfer-list",["listbox","search-box","button"]],["CurrencyInput","currency-input",["number-field"]],["MaskedInput","masked-input",["text-field"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
