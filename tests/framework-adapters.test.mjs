import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  REACT_TAGS, REACT_EVENT_PROPS, subscribeCuEvents,
  assignCuProperties, createReactComponent, createReactComponents
} from "../packages/react/src/index.js";
import {
  isComponentUIElement, extractCuValue, normalizeCuModel,
  updateCuModel, unbindCuModel, vCuModel, ComponentUIVuePlugin
} from "../packages/vue/src/index.js";

const load = path => readFile(new URL(path, import.meta.url), "utf8");

test("React adapter maps all reusable custom elements and event props", () => {
  assert.equal(Object.keys(REACT_TAGS).length,45);
  assert.equal(REACT_TAGS.Select,"cu-select");
  assert.equal(REACT_TAGS.Icon,"cu-icon");
  assert.equal(REACT_TAGS.MenuItem,"cu-menu-item");
  assert.equal(REACT_EVENT_PROPS.onCuChange,"cu-change");
  assert.equal(REACT_EVENT_PROPS.onCuPress,"cu-press");
});

test("React event subscriptions dispatch detail and cleanly unsubscribe", () => {
  const target = new EventTarget();
  const details = [];
  const cleanup = subscribeCuEvents(target,{
    onCuChange:event => details.push(event.detail.value),
    onCuPress:event => details.push(event.detail.type)
  });
  const changed = new Event("cu-change");
  changed.detail = {value:"vue"};
  target.dispatchEvent(changed);
  const pressed = new Event("cu-press");
  pressed.detail = {type:"button"};
  target.dispatchEvent(pressed);
  cleanup();
  target.dispatchEvent(changed);
  assert.deepEqual(details,["vue","button"]);
});

test("React controlled properties use setters and safe boolean attributes", () => {
  const attrs = new Map();
  const element = {
    value:"", checked:false,
    setAttribute:(key,value) => attrs.set(key,value),
    removeAttribute:key => attrs.delete(key),
    toggleAttribute:(key,enable) => enable?attrs.set(key,""):attrs.delete(key)
  };
  assignCuProperties(element,"cu-checkbox",{value:"yes",checked:true,disabled:true});
  assert.equal(element.value,"yes");
  assert.equal(element.checked,true);
  assert.equal(attrs.has("disabled"),true);
  assignCuProperties(element,"cu-checkbox",{disabled:false});
  assert.equal(attrs.has("disabled"),false);
  const dialog = {
    open:false, showModal() {this.open=true;},
    close() {this.open=false;}
  };
  assignCuProperties(dialog,"cu-dialog",{open:true});
  assert.equal(dialog.open,true);
  assignCuProperties(dialog,"cu-dialog",{open:false});
  assert.equal(dialog.open,false);
});

test("React DataTable preserves referentially stable condition filter props",()=>{
  const element={};
  let assigned=0;
  let applied={};
  Object.defineProperty(element,"columnFilters",{
    configurable:true,
    get(){return {...applied};},
    set(value){assigned++;applied={...value};}
  });
  const filters={status:["Active"],amount:{operator:"between",value:10,value2:100}};
  assignCuProperties(element,"cu-data-table",{columnFilters:filters});
  assignCuProperties(element,"cu-data-table",{columnFilters:filters});
  assert.equal(assigned,1);
  assert.deepEqual(applied,filters);
  assignCuProperties(element,"cu-data-table",{
    columnFilters:{status:{operator:"contains",value:"Act"}}
  });
  assert.equal(assigned,2);
  assert.deepEqual(applied.status,{operator:"contains",value:"Act"});
  assert.equal(REACT_EVENT_PROPS.onCuFilterChange,"cu-filter-change");
});

test("React factory uses dependency injection and strips custom event props", () => {
  const hooks = {
    forwardRef: render => ({render}),
    useRef: value => ({current:value}),
    useEffect: () => {},
    useImperativeHandle: () => {},
    createElement: (tag,props) => ({tag,props})
  };
  const Select = createReactComponent(hooks,"cu-select");
  const rendered = Select.render({
    value:"react",name:"framework",onCuChange:() => {},children:"content"
  }, null);
  assert.equal(rendered.tag,"cu-select");
  assert.equal(rendered.props.name,"framework");
  assert.equal(rendered.props.value,undefined);
  assert.equal(rendered.props.onCuChange,undefined);
  assert.equal(typeof rendered.props.ref,"function");
  assert.equal(Object.keys(createReactComponents(hooks)).length,45);
  assert.throws(() => createReactComponent(hooks,"unknown-tag"),RangeError);
});

test("Vue custom element recognition and model normalization are deterministic", () => {
  assert.equal(isComponentUIElement("cu-text-field"),true);
  assert.equal(isComponentUIElement("cu-icon"),true);
  assert.equal(isComponentUIElement("CuButton"),false);
  assert.equal(isComponentUIElement("my-element"),false);
  const normal = normalizeCuModel({value:"abc",onUpdate:() => {}});
  assert.equal(normal.property,"value");
  assert.equal(normal.event,"cu-input");
  const checked = normalizeCuModel({value:{value:true,property:"checked"},modifiers:{}});
  assert.equal(checked.event,"cu-change");
  const objectValue = normalizeCuModel({value:{data:2},onUpdate:() => {}});
  assert.deepEqual(objectValue.value,{data:2});
  assert.throws(() => normalizeCuModel({onUpdate:() => {}}),TypeError);
  assert.throws(() => normalizeCuModel({value:"x",event:"click"}),RangeError);
});

test("Vue model directive syncs properties and removes listeners when unmounted", () => {
  const el = new EventTarget();
  el.value = "";
  let observed = [];
  updateCuModel(el,{value:{value:"first",onUpdate:next => observed.push(next)},
    instance:{},modifiers:{}});
  assert.equal(el.value,"first");
  const changed = new Event("cu-input");
  changed.detail = {value:"second"};
  el.dispatchEvent(changed);
  assert.deepEqual(observed,["second"]);
  updateCuModel(el,{value:{value:"second",onUpdate:next => observed.push("updated:"+next)},
    instance:{},modifiers:{}});
  el.dispatchEvent(changed);
  assert.deepEqual(observed,["second","updated:second"]);
  unbindCuModel(el);
  el.dispatchEvent(changed);
  assert.deepEqual(observed,["second","updated:second"]);
  assert.equal(vCuModel.mounted,updateCuModel);
  assert.equal(vCuModel.beforeUnmount,unbindCuModel);
  assert.equal(extractCuValue(changed),"second");
});

test("Vue plugin registers cu-model without importing Vue at runtime", () => {
  const directives = new Map();
  ComponentUIVuePlugin.install({
    directive:(name,definition) => directives.set(name,definition)
  });
  assert.equal(directives.get("cu-model"),vCuModel);
  assert.throws(() => ComponentUIVuePlugin.install({}),TypeError);
});

test("packages and source examples document both framework consumers", async () => {
  const react = JSON.parse(await load("../packages/react/package.json"));
  const vue = JSON.parse(await load("../packages/vue/package.json"));
  for (const [pkg,peer] of [[react,"react"],[vue,"vue"]]) {
    assert.equal(pkg.private,true);
    assert.equal(pkg.type,"module");
    assert.ok(pkg.peerDependencies[peer]);
    assert.ok(pkg.exports["."].types.endsWith("index.d.ts"));
  }
  const rx=await load("../examples/react-example.tsx");
  const vx=await load("../examples/vue/App.vue");
  const vite=await load("../examples/vue/vite.config.ts");
  assert.match(rx,/createReactComponents/);
  assert.match(rx,/onCuInput/);
  assert.match(rx,/onCuChange/);
  assert.match(vx,/v-cu-model/);
  assert.match(vite,/isCustomElement: isComponentUIElement/);
  const docs=await load("../docs/FRAMEWORK_ADAPTERS.md");
  assert.match(docs,/React 18/);
  assert.match(docs,/Vue 3/);
});
