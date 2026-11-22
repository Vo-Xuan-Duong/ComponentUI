import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { cuModel, cuEvents, normalizeCuBinding } from "../packages/svelte/src/index.js";

const load = path => readFile(new URL(path,import.meta.url),"utf8");
const packages=["theme","icons","web","react","vue","svelte"];

test("six packages expose private, locally packable 0.9.0 ESM entrypoints",async()=>{
  for(const name of packages){
    const manifest=JSON.parse(await load("../packages/"+name+"/package.json"));
    assert.equal(manifest.name,"@componentui/"+name);
    assert.equal(manifest.version,"0.9.0");
    assert.equal(manifest.private,true);
    assert.equal(manifest.type,"module");
    assert.deepEqual(manifest.files,["dist"]);
    assert.equal(manifest.scripts.build,
      "node ../../scripts/build-packages.mjs "+name);
    for(const entry of Object.values(manifest.exports)){
      const paths=typeof entry==="string"?[entry]:Object.values(entry);
      for(const p of paths)assert.ok(p.startsWith("./dist/"),name+": "+p);
    }
  }
});

test("Web package has typed exports for all component modules and source boundaries",async()=>{
  const web=JSON.parse(await load("../packages/web/package.json"));
  const icon=JSON.parse(await load("../packages/icons/package.json"));
  const theme=JSON.parse(await load("../packages/theme/package.json"));
  assert.ok(web.exports["./components"]);
  for(const name of ["select","icon","listbox","combobox","data-table","context-menu"])
    assert.equal(web.exports["./components/"+name].default,"./dist/components/"+name+".js");
  assert.equal(web.exports["./components"].types,"./dist/components/index.d.ts");
  assert.equal(web.exports["./interactions"].types,"./dist/interactions.d.ts");
  assert.equal(icon.exports["."].default,"./dist/icons.js");
  assert.equal(theme.exports["./tokens.css"],"./dist/tokens.css");
  assert.equal(theme.exports["./components.css"],"./dist/components.css");
  assert.equal(theme.exports["./theme.js"].types,"./dist/theme.d.ts");
});

test("build script vendors licensed Lucide dependencies into Web distributable",async()=>{
  const src=await load("../scripts/build-packages.mjs");
  assert.match(src,/internal\/icons\.js/);
  assert.match(src,/internal\/icons\.d\.ts/);
  assert.match(src,/THIRD_PARTY_LUCIDE_LICENSE\.txt/);
  assert.match(src,/icons\/src\/icons\.js|src\/icons\.js/); // see path composition
  assert.match(src,/replaceRequired/);
  const verify=await load("../scripts/verify-packages.mjs");
  assert.match(verify,/dist is missing/);
  assert.match(verify,/broken relative import/);
  assert.match(verify,/web\/dist\/components\/index\.js/);
  const pack=await load("../scripts/pack-packages.mjs");
  assert.match(pack,/--pack-destination/);
  assert.doesNotMatch(pack,/npm publish|git push/);
});

test("Svelte cuModel writes properties, supports updates and cleans listeners",()=>{
  const element=new EventTarget();
  element.value="";
  const updates=[];
  const action=cuModel(element,{
    value:"react",event:"cu-change",onUpdate:v=>updates.push(v)
  });
  assert.equal(element.value,"react");
  const event=new Event("cu-change");
  event.detail={value:"vue"};
  element.dispatchEvent(event);
  assert.deepEqual(updates,["vue"]);
  action.update({value:"svelte",event:"cu-change",
    onUpdate:v=>updates.push("updated:"+v)});
  assert.equal(element.value,"svelte");
  element.dispatchEvent(event);
  assert.deepEqual(updates,["vue","updated:vue"]);
  action.destroy();
  element.dispatchEvent(event);
  assert.equal(updates.length,2);
  assert.throws(()=>normalizeCuBinding({value:"x",event:"click"}),RangeError);
});

test("Svelte cuEvents handles native cu-* handlers and removes them",()=>{
  const element=new EventTarget();
  const observed=[];
  const action=cuEvents(element,{"cu-select":()=>observed.push("selected")});
  element.dispatchEvent(new Event("cu-select"));
  action.update({"cu-change":()=>observed.push("changed")});
  element.dispatchEvent(new Event("cu-select"));
  element.dispatchEvent(new Event("cu-change"));
  action.destroy();
  element.dispatchEvent(new Event("cu-change"));
  assert.deepEqual(observed,["selected","changed"]);
  assert.throws(()=>cuEvents(element,{click:()=>{}}),TypeError);
});

test("React factory-free exports and Svelte/Vue/desktop examples are documented",async()=>{
  const react=JSON.parse(await load("../packages/react/package.json"));
  const svelte=JSON.parse(await load("../packages/svelte/package.json"));
  assert.equal(react.exports["./components"].default,"./dist/components.js");
  assert.equal(svelte.peerDependencies.svelte,">=5.0.0 <7");
  const named=await load("../packages/react/src/components.js");
  assert.match(named,/createReactComponents\(React\)/);
  const svelteExample=await load("../examples/svelte/App.svelte");
  assert.match(svelteExample,/use:cuModel/);
  const electron=await load("../examples/electron/renderer.js");
  const tauri=await load("../examples/tauri/renderer.js");
  for(const source of [electron,tauri]){
    assert.match(source,/@componentui\/web\/components/);
    assert.match(source,/@componentui\/theme\/tokens\.css/);
  }
  const docs=await load("../docs/PACKAGING.md");
  assert.match(docs,/npm run pack:local/);
  assert.match(docs,/Electron/);
  assert.match(docs,/Tauri/);
});
