import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CuScrollArea,CuAvatarGroup,scrollAreaMetrics,normalizeAvatarMembers,splitAvatarMembers} from "../packages/web/src/components/index.js";
import {REACT_TAGS,REACT_EVENT_PROPS,assignCuProperties} from "../packages/react/src/index.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

test("scroll metrics clamp overscroll and detect edges with tolerance",()=>{
  const m=scrollAreaMetrics({scrollTop:299.5,scrollHeight:500,clientHeight:200,scrollLeft:200,scrollWidth:250,clientWidth:150});
  assert.equal(m.maxScrollTop,300);assert.equal(m.atBottom,true);
  assert.equal(m.scrollLeft,100);assert.equal(m.atEnd,true);
  assert.equal(m.atTop,false);assert.equal(m.canScrollX,true);
});
test("scroll metrics support RTL and empty regions",()=>{
  const m=scrollAreaMetrics({rtl:true,scrollLeft:-90,scrollWidth:200,clientWidth:100});
  assert.equal(m.scrollLeft,-90);assert.equal(m.atStart,false);assert.equal(m.atEnd,false);
  const end=scrollAreaMetrics({rtl:true,scrollLeft:-130,scrollWidth:200,clientWidth:100});
  assert.equal(end.scrollLeft,-100);assert.equal(end.atEnd,true);
  const empty=scrollAreaMetrics();assert.equal(empty.canScrollY,false);assert.equal(empty.atTop,true);assert.equal(empty.atBottom,true);
});
test("scroll methods delegate to native viewport",()=>{
  const el=Object.create(CuScrollArea.prototype),calls=[];
  el._viewport={scrollTo:(...args)=>calls.push(["to",...args]),scrollBy:(...args)=>calls.push(["by",...args]),focus:options=>calls.push(["focus",options])};
  el.scrollTo({top:50});el.scrollBy(0,30);el.focus({preventScroll:true});
  assert.deepEqual(calls,[["to",{top:50}],["by",0,30],["focus",{preventScroll:true}]]);
});
test("avatar normalization trims names and ignores duplicate explicit IDs",()=>{
  assert.deepEqual(normalizeAvatarMembers([{id:" a ",name:" Alex "},{id:"a",name:"duplicate"},{name:"Alex"},{name:" "},{name:"Mai",src:" image.png ",alt:"Portrait"}]),[{id:"a",name:"Alex"},{name:"Alex"},{name:"Mai",src:"image.png",alt:"Portrait"}]);
  const items=[{name:"a"},{name:"b"},{name:"c"}];
  assert.deepEqual(splitAvatarMembers(items,2),{visible:items.slice(0,2),overflow:items.slice(2)});
  assert.deepEqual(splitAvatarMembers(items,0),{visible:[],overflow:items});
});
test("AvatarGroup items are defensive copies and React controlled",()=>{
  const el=Object.create(CuAvatarGroup.prototype);el._items=[];el._render=()=>{};
  const items=[{name:"Alex"}];assignCuProperties(el,"cu-avatar-group",{items});
  items[0].name="Changed";el.items[0].name="Changed too";
  assert.deepEqual(el.items,[{name:"Alex"}]);
});
test("new components have package exports, contracts, native accessibility and demos",async()=>{
  const manifest=JSON.parse(await read("../packages/web/package.json"));
  const html=await read("../apps/playground-web/index.html");
  for(const [name,tag] of [["ScrollArea","scroll-area"],["AvatarGroup","avatar-group"]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.equal(manifest.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(JSON.parse(await read("../design-system/components/"+tag+".contract.json")).status,"preview");
  }
  assert.equal(REACT_EVENT_PROPS.onCuScroll,"cu-scroll");
  const scroll=await read("../packages/web/src/components/scroll-area.js");
  const avatar=await read("../packages/web/src/components/avatar-group.js");
  assert.ok(scroll.includes('role="region" tabindex="0"'));
  assert.ok(scroll.includes("ResizeObserver"));
  assert.ok(avatar.includes('aria-controls="avatar-overflow"'));
  assert.ok(avatar.includes('createElement("cu-avatar")'));
});
