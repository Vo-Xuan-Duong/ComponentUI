import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeChartConfig} from "../packages/web/src/components/chart-editor.js";
import {normalizeNotificationSettings,DEFAULT_NOTIFICATION_SETTINGS} from "../packages/web/src/components/notification-settings.js";
import {normalizeGalleryItems} from "../packages/web/src/components/image-gallery.js";
import {CuFileManager,fileManagerCommands} from "../packages/web/src/components/file-manager.js";
import {CuFileExplorer} from "../packages/web/src/components/file-explorer.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("chart configuration supports existing chart types",()=>{
  assert.deepEqual(normalizeChartConfig(),{title:"Chart",description:"",type:"bar",showTable:false});
  assert.equal(normalizeChartConfig({type:"line",showTable:true}).type,"line");
  assert.equal(normalizeChartConfig({type:"pie"}).type,"bar");
});
test("notification settings preserve valid booleans and reject invalid frequency",()=>{
  assert.deepEqual(normalizeNotificationSettings(null),DEFAULT_NOTIFICATION_SETTINGS);
  assert.deepEqual(normalizeNotificationSettings({enabled:false,email:true,digest:"weekly",sound:"yes"}),{enabled:false,desktop:true,sound:false,email:true,digest:"weekly"});
  assert.equal(normalizeNotificationSettings({digest:"invalid"}).digest,"daily");
});
test("gallery normalization shares carousel identity and requires images",()=>{
  assert.deepEqual(normalizeGalleryItems([{id:"a",src:"a.png"},{id:"a",src:"b.png"},{id:"b",src:""},{id:"c",src:"c.png"}]).map(x=>x.id),["a","c"]);
});
test("file manager extends explorer and gates commands by selection",()=>{
  assert.equal(Object.getPrototypeOf(CuFileManager.prototype),CuFileExplorer.prototype);
  const disabled=(entry,key)=>Boolean(fileManagerCommands(entry).find(x=>x.value===key).disabled);
  assert.equal(disabled(null,"rename"),true);
  assert.equal(disabled(null,"upload"),false);
  assert.equal(disabled({kind:"folder"},"download"),true);
  assert.equal(disabled({kind:"file"},"download"),false);
});
test("workspace tools reuse existing modules and expose package exports",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html"),pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["ChartEditor","chart-editor",["chart-container","property-grid","split-view"]],["NotificationSettings","notification-settings",["settings-page","switch","select","button"]],["ImageGallery","image-gallery",["carousel","image-viewer","select"]],["FileManager","file-manager",["file-explorer","command-bar"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('"./'+dep+'.js"'));
  }
});
