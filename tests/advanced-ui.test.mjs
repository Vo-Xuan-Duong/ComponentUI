import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuPasswordField, CuFilePicker, CuAppShell, formatFileSize,
  matchesFileAccept, validateFileSelection
} from "../packages/web/src/components/index.js";
import { REACT_TAGS, REACT_EVENT_PROPS } from "../packages/react/src/index.js";
import { getIconNodes, ICON_NAMES } from "../packages/icons/src/icons.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("PasswordField and FilePicker are native form-associated controls; AppShell is composable",()=>{
  assert.equal(CuPasswordField.formAssociated,true);
  assert.equal(CuFilePicker.formAssociated,true);
  assert.equal(typeof CuAppShell,"function");
  assert.equal(CuAppShell.observedAttributes.includes("navigation-open"),true);
  assert.equal(CuPasswordField.observedAttributes.includes("value"),false,
    "Passwords must not be reflected to HTML attributes");
});

test("FilePicker pure validation supports MIME, wildcard, extensions and max bytes",()=>{
  const jpg={name:"photo.JPG",type:"image/jpeg",size:1024};
  const pdf={name:"report.pdf",type:"application/pdf",size:2048};
  const executable={name:"script.exe",type:"application/octet-stream",size:100};
  assert.equal(matchesFileAccept(jpg,"image/*,.pdf"),true);
  assert.equal(matchesFileAccept(pdf,"image/*,.PDF"),true);
  assert.equal(matchesFileAccept(executable,"image/*,.pdf"),false);
  assert.equal(validateFileSelection([jpg],{accept:"image/*",required:true}),"");
  assert.equal(validateFileSelection([],{required:true}),"Choose a file.");
  assert.equal(validateFileSelection([jpg,pdf],{multiple:false}),"Choose only one file.");
  assert.match(validateFileSelection([executable],{accept:".pdf"}),/accepted types/);
  assert.match(validateFileSelection([pdf],{maxSize:1024}),/limit/);
  assert.equal(formatFileSize(0),"0 B");
  assert.equal(formatFileSize(1536),"1.5 KB");
});

test("PasswordField uses native input and accessible Lucide visibility toggle",async()=>{
  const source=await read("../packages/web/src/components/password-field.js");
  for(const pattern of [
    /type="password"/,/autocomplete="current-password"/,/aria-pressed/,
    /aria-describedby/,/this\._input\.type=/,/name="eye"/,
    /"eye-off"/,/formResetCallback/,/setFormValue/,/setValidity/,
    /cu-visibility-change/,/minlength/,/maxlength/,/pattern/
  ])assert.match(source,pattern);
  assert.doesNotMatch(source,/setAttribute\("value"/);
  assert.doesNotMatch(source,/console\.(log|info|debug)/);
});

test("FilePicker exposes native chooser and accessible drag/drop selection without uploads",async()=>{
  const source=await read("../packages/web/src/components/file-picker.js");
  for(const pattern of [
    /type="file"/,/dataTransfer\?\.files/,/dragover/,/drop/,
    /aria-label="Clear files"/,/aria-invalid/,/formResetCallback/,
    /setFormValue\(data\)/,/data\.append\(name,file,file\.name\)/,
    /max-size/,/accept/,/files:\[\.\.\.this\._files\]/
  ])assert.match(source,pattern);
  assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("AppShell provides responsive navigation, semantic slots, keyboard close and focus return",async()=>{
  const source=await read("../packages/web/src/components/app-shell.js");
  for(const slot of ["header","navigation","aside","footer"])
    assert.ok(source.includes('name="'+slot+'"'),slot);
  for(const pattern of [
    /<main class="content"/,/role="navigation"/,/aria-expanded/,
    /@container \(max-width:720px\)/,/has-aside/,/has-footer/,
    /event\.key==="Escape"/,/this\._toggle\.focus\(\)/,
    /cu-navigation-toggle/,/navigation-open/
  ])assert.match(source,pattern);
});

test("new components and icons are exported by the distribution manifests",async()=>{
  const web=JSON.parse(await read("../packages/web/package.json"));
  for(const p of ["password-field","file-picker","app-shell"])
    assert.equal(web.exports["./components/"+p].default,
      "./dist/components/"+p+".js");
  for(const n of ["eye","eye-off","upload","file"])
    assert.ok(getIconNodes(n)?.length, n);
  assert.equal(ICON_NAMES.length,29);
  assert.equal(REACT_TAGS.PasswordField,"cu-password-field");
  assert.equal(REACT_TAGS.FilePicker,"cu-file-picker");
  assert.equal(REACT_TAGS.AppShell,"cu-app-shell");
  assert.equal(REACT_EVENT_PROPS.onCuVisibilityChange,"cu-visibility-change");
  assert.equal(REACT_EVENT_PROPS.onCuNavigationToggle,"cu-navigation-toggle");
  assert.equal(Object.keys(REACT_TAGS).length,68);
});

test("all package versions remain aligned and privately packable",async()=>{
  for(const name of ["theme","icons","web","react","vue","svelte"]){
    const m=JSON.parse(await read("../packages/"+name+"/package.json"));
    assert.equal(m.version,"0.12.0");
    assert.equal(m.private,true);
    assert.deepEqual(m.files,["dist"]);
  }
  const root=JSON.parse(await read("../package.json"));
  assert.equal(root.version,"0.12.0");
  for(const name of ["password-field","file-picker","app-shell"])
    assert.ok(root.scripts["syntax:check"].includes(name+".js"));
});

test("Playground has live previews that never display password contents",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const script=await read("../apps/playground-web/main.js");
  const css=await read("../apps/playground-web/styles.css");
  for(const tag of ["cu-password-field","cu-file-picker","cu-app-shell"])
    assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-advanced-form","wc-advanced-result","wc-app-shell",
    "wc-app-view","wc-app-shell-result"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(script,/new FormData\(advancedForm\)/);
  assert.match(script,/passwordProvided:Boolean\(form\.get\("password"\)\)/);
  assert.doesNotMatch(script,/advancedResult\.textContent\s*=\s*form\.get\("password"\)/);
  assert.match(script,/appShell\.addEventListener\("cu-navigation-toggle"/);
  assert.match(css,/\.cu-app-nav button\[aria-pressed=true\]/);
});

test("new catalog entries are previews but none are certified production-ready",async()=>{
  const catalog=JSON.parse(await read("../design-system/components/catalog.json"));
  const components=catalog.groups.flatMap(g=>g.components);
  const lookup=new Map(components.map(c=>[c.name,c.status]));
  for(const name of ["PasswordField","FilePicker","AppShell"])
    assert.equal(lookup.get(name),"preview");
  assert.equal(components.length,129);
  assert.equal(components.filter(c=>c.status==="preview").length,57);
  assert.equal(components.filter(c=>c.status==="planned").length,72);
  assert.equal(components.filter(c=>c.status==="ready").length,0);
});
