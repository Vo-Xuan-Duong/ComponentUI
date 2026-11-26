import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  overlayGeometry,placeAnchoredOverlay,registerOverlay,unregisterOverlay,isTopOverlay,
  deepActiveElement,restoreOverlayFocus
} from "../packages/web/src/components/_overlay.js";
import { CuSelect } from "../packages/web/src/components/select.js";
import { CuCombobox } from "../packages/web/src/components/combobox.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("nested overlay stack retains only the current topmost owner",()=>{
  const parent={},child={};
  registerOverlay(parent);
  assert.equal(isTopOverlay(parent),true);
  registerOverlay(child);
  assert.equal(isTopOverlay(child),true);
  assert.equal(isTopOverlay(parent),false);
  // Registering an existing owner must not duplicate it in the stack.
  registerOverlay(child);
  unregisterOverlay(child);
  assert.equal(isTopOverlay(parent),true);
  unregisterOverlay(parent);
  assert.equal(isTopOverlay(parent),false);
});

test("overlay geometry flips above when the bottom cannot fit content",()=>{
  const anchor={left:540,right:620,top:338,bottom:378,width:80,height:40};
  const size={width:250,height:190};
  const viewport={left:0,top:0,width:640,height:400};
  const result=overlayGeometry(anchor,size,viewport,{gap:6,margin:8,maxHeight:220});
  assert.equal(result.placement,"top");
  assert.equal(result.maxHeight,190);
  assert.equal(result.width,250);
  assert.ok(anchor.left+result.left>=8);
  assert.ok(anchor.left+result.left+result.width<=632);
  const bottom=overlayGeometry({left:5,right:105,top:10,bottom:46,width:100},
    {width:200,height:80},viewport,{gap:6,margin:8});
  assert.equal(bottom.placement,"bottom");
  assert.equal(bottom.left,3);
});

test("viewport positioning constrains width and supports right-aligned floating menu",()=>{
  const result=overlayGeometry({left:280,right:370,top:20,bottom:55,width:90},
    {width:420,height:140},{left:0,top:0,width:320,height:230},
    {align:"end",maxHeight:160,margin:8,gap:8});
  assert.equal(result.width,304);
  assert.equal(result.left,8-280);
  assert.equal(result.placement,"bottom");
  assert.ok(result.maxHeight<=160);
  const matched=overlayGeometry({left:100,right:280,top:10,bottom:50,width:180},
    {width:50,height:90},{left:0,top:0,width:300,height:220},{matchWidth:true});
  assert.equal(matched.width,180);
});

test("anchored popup applies collision-aware styles and placement metadata",()=>{
  const view={
    innerWidth:600,innerHeight:400,
    getComputedStyle:()=>({borderTopWidth:"1px",borderBottomWidth:"1px"}),
    visualViewport:null
  };
  const anchor={
    ownerDocument:{defaultView:view},
    getBoundingClientRect:()=>({left:510,right:590,top:350,bottom:390,width:80,height:40})
  };
  const panel={
    hidden:false,style:{},dataset:{},scrollHeight:160,
    getBoundingClientRect:()=>({width:230,height:160})
  };
  const result=placeAnchoredOverlay(anchor,panel,{gap:5,maxHeight:240});
  assert.equal(result.placement,"top");
  assert.equal(panel.dataset.placement,"top");
  assert.equal(panel.style.top,"auto");
  assert.equal(panel.style.bottom,"calc(100% + 5px)");
  assert.equal(panel.style.width,"230px");
  assert.ok(Number.parseFloat(panel.style.left)<0);
  assert.equal(placeAnchoredOverlay(anchor,{hidden:true},{}),null);
});

test("focus helpers cross Shadow DOM and avoid disconnected or disabled targets",()=>{
  const deepest={id:"deep"};
  const nested={shadowRoot:{activeElement:deepest}};
  const outer={activeElement:{shadowRoot:{activeElement:nested}}};
  assert.equal(deepActiveElement(outer),deepest);
  let count=0,options=null;
  const node={isConnected:true,disabled:false,
    focus(arg){count++;options=arg;}};
  assert.equal(restoreOverlayFocus(node),true);
  assert.equal(count,1);
  assert.deepEqual(options,{preventScroll:true});
  node.disabled=true;
  assert.equal(restoreOverlayFocus(node),false);
  node.disabled=false;node.isConnected=false;
  assert.equal(restoreOverlayFocus(node),false);
});

function keyboard(key){
  let prevented=false,stopped=false;
  return {key,ctrlKey:false,altKey:false,metaKey:false,
    preventDefault(){prevented=true;},stopPropagation(){stopped=true;},
    get prevented(){return prevented;},get stopped(){return stopped;}};
}

test("Combobox keyboard navigation starts at the first/last item and supports Home/End",()=>{
  const combo=Object.create(CuCombobox.prototype);
  combo._disabled=()=>false;
  combo._open=true;
  combo._visible=[{label:"A"},{label:"B"},{label:"C"}];
  combo._active=-1;
  combo._markActive=()=>{};
  const down=keyboard("ArrowDown");
  combo._key(down);
  assert.equal(combo._active,0);
  assert.equal(down.prevented,true);
  combo._active=-1;
  combo._key(keyboard("ArrowUp"));
  assert.equal(combo._active,2);
  combo._key(keyboard("Home"));
  assert.equal(combo._active,0);
  combo._key(keyboard("End"));
  assert.equal(combo._active,2);
  combo._key(keyboard("ArrowDown"));
  assert.equal(combo._active,0);
  combo._key(keyboard("ArrowUp"));
  assert.equal(combo._active,2);
});

test("Escape closes only topmost ComboBox and Select, without stealing ancestor escape",()=>{
  const combo=Object.create(CuCombobox.prototype);
  combo._open=true;combo._disabled=()=>false;
  let comboCloses=0,selectCloses=0;
  combo.hide=()=>{comboCloses++;};
  const select=Object.create(CuSelect.prototype);
  select._open=true;select._isDisabled=()=>false;
  select._enabledIndices=()=>[];
  select.hide=()=>{selectCloses++;};
  registerOverlay(select);
  registerOverlay(combo);
  try{
    const insideSelect=keyboard("Escape");
    select._onKeydown(insideSelect);
    assert.equal(insideSelect.prevented,false);
    assert.equal(selectCloses,0);
    const insideCombo=keyboard("Escape");
    combo._key(insideCombo);
    assert.equal(insideCombo.prevented,true);
    assert.equal(insideCombo.stopped,true);
    assert.equal(comboCloses,1);
    unregisterOverlay(combo);
    const next=keyboard("Escape");
    select._onKeydown(next);
    assert.equal(next.prevented,true);
    assert.equal(next.stopped,true);
    assert.equal(selectCloses,1);
  }finally{
    unregisterOverlay(combo);unregisterOverlay(select);
  }
});

test("ComboBox preserves native Tab behavior and never commits stale selection",()=>{
  const combo=Object.create(CuCombobox.prototype);
  combo._open=true;combo._disabled=()=>false;
  let restore=null;
  combo.hide=value=>{restore=value;};
  const event=keyboard("Tab");
  combo._key(event);
  assert.equal(event.prevented,false);
  assert.equal(restore,true);
});

test("Menu and Popover expose stable trigger-to-popup associations and motion preferences",async()=>{
  const [menu,popover,combo,select]=await Promise.all([
    read("../packages/web/src/components/menu.js"),
    read("../packages/web/src/components/popover.js"),
    read("../packages/web/src/components/combobox.js"),
    read("../packages/web/src/components/select.js")
  ]);
  for(const source of [menu,popover]){
    assert.match(source,/aria-controls/);
    assert.match(source,/instanceId|InstanceId/);
    assert.match(source,/isTopOverlay/);
    assert.match(source,/registerOverlay/);
    assert.match(source,/watchOverlayViewport/);
    assert.match(source,/restoreOverlayFocus/);
  }
  for(const source of [combo,select]){
    assert.match(source,/isTopOverlay\(this\)/);
    assert.match(source,/aria-activedescendant/);
    assert.match(source,/prefers-reduced-motion\s*:\s*reduce/);
    assert.match(source,/forced-colors:active/);
  }
  assert.match(combo,/e\.key==="Home"/);
  assert.match(combo,/e\.key==="End"/);
  assert.match(menu,/role="menu"/);
  assert.match(popover,/role="dialog"/);
});

test("Native Dialog and Drawer preserve focus and native modal semantics",async()=>{
  const dialog=await read("../packages/web/src/components/dialog.js");
  const drawer=await read("../packages/web/src/components/drawer.js");
  for(const source of [dialog,drawer]){
    assert.match(source,/showModal\(\)/);
    assert.match(source,/deepActiveElement/);
    assert.match(source,/restoreOverlayFocus/);
    assert.match(source,/returnValue/);
    assert.match(source,/prefers-reduced-motion:reduce/);
    assert.match(source,/forced-colors:active/);
  }
  assert.match(drawer,/event\.preventDefault\(\)/);
  assert.match(drawer,/dismissible/);
});
