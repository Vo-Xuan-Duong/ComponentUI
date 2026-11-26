import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {overlayGeometry,placeAnchoredOverlay,registerOverlay,unregisterOverlay,isTopOverlay,
  deepActiveElement,restoreOverlayFocus,watchOverlayViewport}
  from "../packages/web/src/components/_overlay.js";
import {CuCombobox} from "../packages/web/src/components/combobox.js";

const read=p=>readFile(new URL(p,import.meta.url),"utf8");
const viewport={width:800,height:600};
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});

test("Anchored popup opens below when there is sufficient space",()=>{
  assert.deepEqual(overlayGeometry(rect(100,50,200,40),{width:200,height:180},viewport),
    {placement:"bottom",left:0,width:200,maxHeight:320,gap:6});
});
test("Popup flips above near the viewport bottom",()=>{
  const p=overlayGeometry(rect(100,520,200,40),{width:200,height:200},viewport);
  assert.equal(p.placement,"top");assert.equal(p.maxHeight,320);
});
test("Popup shrinks to available space rather than imposing a minimum height",()=>{
  const p=overlayGeometry(rect(20,90,100,40),{width:200,height:400},
    {width:320,height:200});
  assert.equal(p.placement,"top");assert.equal(p.maxHeight,76);
});
test("Popup clamps horizontal alignment and width to the viewport",()=>{
  const p=overlayGeometry(rect(280,30,30,40),{width:280,height:100},{width:320,height:400});
  assert.equal(p.left,-248);assert.equal(p.width,280);
  const wide=overlayGeometry(rect(10,20,400,40),{width:400,height:150},
    {width:320,height:400},{matchWidth:true});
  assert.equal(wide.width,304);assert.equal(wide.left,-2);
});
test("End alignment and visual viewport offsets are respected",()=>{
  const p=overlayGeometry(rect(100,150,150,30),{width:100,height:100},
    {left:40,top:100,width:350,height:350},{align:"end"});
  assert.equal(p.left,50);assert.equal(p.placement,"bottom");
});
test("Top overlay stack handles nested Escape and cleanup idempotently",()=>{
  const outer={},inner={},other={};
  try{
    registerOverlay(outer);registerOverlay(inner);
    assert.equal(isTopOverlay(outer),false);
    assert.equal(isTopOverlay(inner),true);
    registerOverlay(inner);unregisterOverlay(inner);
    assert.equal(isTopOverlay(outer),true);
    registerOverlay(other);unregisterOverlay(outer);
    assert.equal(isTopOverlay(other),true);
  }finally{for(const host of [outer,inner,other])unregisterOverlay(host);}
});
test("Focus capture traverses open Shadow DOM and skips unavailable triggers",()=>{
  let focused=null;
  const control={isConnected:true,focus:options=>{focused=options;}};
  const root={activeElement:{shadowRoot:{activeElement:{shadowRoot:{activeElement:control}}}}};
  assert.equal(deepActiveElement(root),control);
  assert.equal(restoreOverlayFocus(control),true);
  assert.deepEqual(focused,{preventScroll:true});
  assert.equal(restoreOverlayFocus({isConnected:false,focus(){throw Error("disconnected");}}),false);
  assert.equal(restoreOverlayFocus({disabled:true,focus(){throw Error("disabled");}}),false);
  assert.equal(restoreOverlayFocus(null),false);
});
test("Placement applies scroll bounds, matches anchor width and permits fitting nested popovers",()=>{
  const view={innerWidth:400,innerHeight:300,
    visualViewport:{offsetLeft:0,offsetTop:0,width:400,height:300},
    getComputedStyle:()=>({borderTopWidth:"1px",borderBottomWidth:"1px"})};
  const anchor={ownerDocument:{defaultView:view},getBoundingClientRect:()=>rect(120,220,180,40)};
  const panel={hidden:false,style:{},dataset:{},scrollHeight:100,
    getBoundingClientRect:()=>rect(0,0,200,102)};
  const p=placeAnchoredOverlay(anchor,panel,{matchWidth:true,allowOverflow:true});
  assert.equal(p.placement,"top");
  assert.equal(panel.style.width,"180px");
  assert.equal(panel.style.bottom,"calc(100% + 6px)");
  assert.equal(panel.style.overflow,"visible");
  panel.scrollHeight=500;
  placeAnchoredOverlay(anchor,panel,{allowOverflow:true});
  assert.equal(panel.style.overflow,"auto");
  panel.hidden=true;assert.equal(placeAnchoredOverlay(anchor,panel),null);
});
test("Viewport watcher attaches and removes visual and layout listeners",()=>{
  const added=[],removed=[];
  const events=name=>({addEventListener:(...args)=>added.push([name,...args]),
    removeEventListener:(...args)=>removed.push([name,...args])});
  const view={...events("window"),visualViewport:events("visual")};
  const stop=watchOverlayViewport({ownerDocument:{defaultView:view}},()=>{});
  assert.equal(added.length,4);
  stop();assert.deepEqual(removed,added);
});
test("Combobox Escape closes only its own popup and consumes the event",()=>{
  const combo=Object.create(CuCombobox.prototype);
  combo._open=true;combo._disabled=()=>false;
  let hidden=false,prevented=false,stopped=false;
  combo.hide=restore=>{hidden=restore;};
  registerOverlay(combo);
  try{
    combo._key({key:"Escape",preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});
    assert.equal(hidden,true);assert.equal(prevented,true);assert.equal(stopped,true);
  }finally{unregisterOverlay(combo);}
});
test("All anchored components share geometry or stack helpers and lifecycle cleanup",async()=>{
  const names=["select","combobox","menu","popover","context-menu","dialog","drawer"];
  const sources=Object.fromEntries(await Promise.all(names.map(async name=>[name,
    await read("../packages/web/src/components/"+name+".js")])));
  for(const name of ["select","combobox","menu","popover"]){
    assert.match(sources[name],/placeAnchoredOverlay/);
    assert.match(sources[name],/watchOverlayViewport/);
    assert.match(sources[name],/unregisterOverlay\(this\)/);
  }
  for(const name of ["menu","popover","context-menu"]){
    assert.match(sources[name],/isTopOverlay\(this\)/);
    assert.match(sources[name],/!event.defaultPrevented/);
  }
  assert.match(sources.combobox,/node.className="option"/);
  assert.match(sources.combobox,/active&&this._open/);
  assert.match(sources.popover,/allowOverflow:true/);
  for(const name of ["dialog","drawer"]){
    assert.match(sources[name],/deepActiveElement\(this.ownerDocument\)/);
    assert.match(sources[name],/restoreOverlayFocus\(trigger\)/);
    assert.match(sources[name],/returnValue\s*=\s*""/);
    assert.match(sources[name],/animation:cu-/);
  }
});
