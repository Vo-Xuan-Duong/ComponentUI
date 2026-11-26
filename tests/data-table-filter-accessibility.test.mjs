import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuDataTable} from "../packages/web/src/components/data-table.js";

test("filter validation focuses the invalid operand and clears stale error state",()=>{
  const table=Object.create(CuDataTable.prototype);
  const field=()=>{
    const attrs=new Map();
    return {attrs,focused:false,setAttribute:(k,v)=>attrs.set(k,v),
      removeAttribute:k=>attrs.delete(k),focus(){this.focused=true;}};
  };
  const first=field(),second=field();
  table._filterConditionValue=first;
  table._filterConditionValue2=second;
  table._filterConditionError={textContent:""};
  table._showFilterConditionError(second,"Enter valid numeric values.");
  assert.equal(first.attrs.has("aria-invalid"),false);
  assert.equal(second.attrs.get("aria-invalid"),"true");
  assert.equal(second.focused,true);
  assert.equal(table._filterConditionError.textContent,"Enter valid numeric values.");
  table._clearFilterConditionError();
  assert.equal(second.attrs.has("aria-invalid"),false);
  assert.equal(table._filterConditionError.textContent,"");
});

test("filter tabs, error message and accent text use accessible associations",async()=>{
  const source=await readFile(new URL("../packages/web/src/components/data-table.js",import.meta.url),"utf8");
  assert.ok(source.includes('aria-labelledby="cu-filter-values-tab"'));
  assert.ok(source.includes('aria-labelledby="cu-filter-conditions-tab"'));
  assert.equal(source.split('aria-describedby="cu-filter-condition-error"').length-1,2);
  assert.ok(source.includes('id="cu-filter-condition-error" role="alert"'));
  assert.ok(source.includes('color:var(--cu-accent-text,#fff)'));
});
