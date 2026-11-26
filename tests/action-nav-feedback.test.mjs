import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuToggleButton,CuHyperlink,CuMenuButton,CuMenu,CuButton,CuFloatingActionButton,CuNavigationView,CuSidebar,CuTopNav,CuBottomNavigation,CuTabs,CuVerticalTabs,CuTabView,CuToast,CuSnackbar,CuDialog,CuConfirmDialog,CuPopover,CuFlyout,CuTeachingTip,CuAlert,CuCallout,CuInfoBar,CuBanner} from "../packages/web/src/components/index.js";
import {REACT_TAGS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");
test("toggle state reflects through React properties",()=>{
  const el=Object.create(CuToggleButton.prototype),attrs=new Set();el.hasAttribute=k=>attrs.has(k);el.toggleAttribute=(k,v)=>v?attrs.add(k):attrs.delete(k);
  assignCuProperties(el,"cu-toggle-button",{pressed:true,disabled:true});assert.equal(el.pressed,true);assert.equal(el.disabled,true);
});
test("navigation, actions and feedback reuse shared implementations",()=>{
  for(const [child,parent] of [[CuMenuButton,CuMenu],[CuFloatingActionButton,CuButton],[CuSidebar,CuNavigationView],[CuTopNav,CuNavigationView],[CuBottomNavigation,CuNavigationView],[CuVerticalTabs,CuTabs],[CuTabView,CuTabs],[CuSnackbar,CuToast],[CuConfirmDialog,CuDialog],[CuFlyout,CuPopover],[CuTeachingTip,CuPopover],[CuCallout,CuAlert],[CuBanner,CuInfoBar]])assert.ok(child.prototype instanceof parent);
});
test("snackbar defaults to a single visible toast",()=>{
  const el=Object.create(CuSnackbar.prototype);el.hasAttribute=()=>false;assert.equal(el._limit(),1);
});
test("confirm dialog React open uses native dialog methods",()=>{
  const el={open:false,showModal(){this.open=true;},close(){this.open=false;}};
  assignCuProperties(el,"cu-confirm-dialog",{open:true});assert.equal(el.open,true);
  assignCuProperties(el,"cu-confirm-dialog",{open:false});assert.equal(el.open,false);
});
test("hyperlink source uses safe URLs and protects blank targets",async()=>{
  const source=await read("../packages/web/src/components/hyperlink.js");assert.ok(source.includes("safeBreadcrumbHref"));assert.ok(source.includes("noopener noreferrer"));
});
test("fifteen action, navigation and feedback modules have contracts and demos",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json")),html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["ToggleButton","toggle-button"],["Hyperlink","hyperlink"],["MenuButton","menu-button"],["FloatingActionButton","floating-action-button"],["Sidebar","sidebar"],["TopNav","top-nav"],["VerticalTabs","vertical-tabs"],["BottomNavigation","bottom-navigation"],["TabView","tab-view"],["Snackbar","snackbar"],["ConfirmDialog","confirm-dialog"],["Flyout","flyout"],["TeachingTip","teaching-tip"],["Callout","callout"],["Banner","banner"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");assert.ok(html.includes("<cu-"+tag));assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
});
