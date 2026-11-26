import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {mount,buttonStyle} from "../packages/web/src/components/_shared.js";
import {CuCheckbox} from "../packages/web/src/components/checkbox.js";
import {CuSwitch} from "../packages/web/src/components/switch.js";
import {watchOverlayViewport} from "../packages/web/src/components/_overlay.js";

test("shared mount enforces hidden on explicitly displayed custom elements",()=>{
  const root={innerHTML:""};
  assert.equal(mount({attachShadow:()=>root},":host{display:grid;}","<slot></slot>"),root);
  assert.match(root.innerHTML,/:host\(\[hidden\]\)\{display:none!important;\}/);
});

test("destructive action colors are independent from theme danger foreground",async()=>{
  const css=await readFile(new URL("../packages/theme/src/components.css",import.meta.url),"utf8");
  for(const name of ["bg","text","hover","pressed"]){
    assert.ok(buttonStyle.includes("--cu-danger-action-"+name));
    assert.ok(css.includes("--cu-danger-action-"+name));
  }
  assert.ok(buttonStyle.includes("var(--cu-danger-action-text,#fff)"));
  assert.ok(css.includes("var(--cu-danger-action-text,#fff)"));
});

test("disabled checkbox and switch omit form value and clear required validity",()=>{
  for(const Type of [CuCheckbox,CuSwitch]){
    const control=Object.create(Type.prototype);
    let submitted,validity;
    control.getAttribute=()=>null;
    control._input={checked:true,disabled:true,required:true};
    control._internals={setFormValue:v=>{submitted=v;},setValidity:v=>{validity=v;}};
    control._syncFormValue();
    assert.equal(submitted,null);assert.deepEqual(validity,{});
    control._input.checked=false;control._syncFormValue();
    assert.equal(submitted,null);assert.deepEqual(validity,{});
    control._input.disabled=false;control._syncFormValue();
    assert.deepEqual(validity,{valueMissing:true});
    control._input.checked=true;control._syncFormValue();
    assert.equal(submitted,"on");assert.deepEqual(validity,{});
  }
});

test("overlay viewport watcher responds to host resize and releases listeners",()=>{
  const listeners=new Set();
  let observer,observed,disconnected=false,calls=0;
  const view={
    addEventListener:(type,cb)=>listeners.add(type),
    removeEventListener:(type,cb)=>listeners.delete(type),
    ResizeObserver:class{
      constructor(cb){this.cb=cb;observer=this;}
      observe(host){observed=host;}
      disconnect(){disconnected=true;}
    }
  };
  const host={ownerDocument:{defaultView:view}};
  const cleanup=watchOverlayViewport(host,()=>calls++);
  assert.equal(observed,host);observer.cb();assert.equal(calls,1);
  cleanup();assert.equal(disconnected,true);assert.equal(listeners.size,0);
});
