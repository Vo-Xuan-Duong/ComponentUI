
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CuCard, CuDivider, CuSkeleton, CuSpinner, CuAlert,
  CuBreadcrumb, CuBreadcrumbItem, safeBreadcrumbHref
} from "../packages/web/src/components/index.js";
import { REACT_TAGS } from "../packages/react/src/index.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");

test("new display and feedback elements import without DOM globals",()=>{
  for(const Component of [CuCard,CuDivider,CuSkeleton,CuSpinner,CuAlert,CuBreadcrumb,CuBreadcrumbItem])
    assert.equal(typeof Component,"function");
  for(const Component of [CuDivider,CuSkeleton,CuSpinner,CuAlert,CuBreadcrumb])
    assert.ok(Array.isArray(Component.observedAttributes));
  assert.ok(CuAlert.observedAttributes.includes("dismissible"));
});

test("Breadcrumb rejects unsafe URLs without a browser URL parser",()=>{
  assert.equal(safeBreadcrumbHref("javascript:alert(1)"),null);
  assert.equal(safeBreadcrumbHref("data:text/html,<svg>"),null);
  assert.equal(safeBreadcrumbHref("//evil.example"),null);
  assert.equal(safeBreadcrumbHref("  //evil.example  "),null);
  assert.equal(safeBreadcrumbHref("///evil.example"),null);
  assert.equal(safeBreadcrumbHref("mailto:help@example.org"),"mailto:help@example.org");
  assert.equal(safeBreadcrumbHref("https://example.org/docs"),"https://example.org/docs");
  assert.equal(safeBreadcrumbHref("#components"),"#components");
  assert.equal(safeBreadcrumbHref("./docs/index.html"),"./docs/index.html");
  assert.equal(safeBreadcrumbHref("../overview"),"../overview");
  assert.equal(safeBreadcrumbHref("docs/start"),"docs/start");
  assert.equal(safeBreadcrumbHref(null),null);
});

test("component source handles reduced motion and semantic feedback",async()=>{
  const card=await read("../packages/web/src/components/card.js");
  const divider=await read("../packages/web/src/components/divider.js");
  const skeleton=await read("../packages/web/src/components/skeleton.js");
  const spinner=await read("../packages/web/src/components/spinner.js");
  const alert=await read("../packages/web/src/components/alert.js");
  const breadcrumb=await read("../packages/web/src/components/breadcrumb.js");
  assert.match(card,/slot name="header"/);
  assert.match(card,/slot name="footer"/);
  assert.match(card,/slotchange/);
  assert.match(divider,/aria-orientation/);
  assert.match(divider,/role","separator"/);
  assert.match(skeleton,/aria-hidden/);
  assert.match(skeleton,/prefers-reduced-motion/);
  assert.match(spinner,/role","status"/);
  assert.match(spinner,/prefers-reduced-motion/);
  assert.match(alert,/role",tone==="danger"\?"alert":"status"/);
  assert.match(alert,/notify\(this,"cu-dismiss"/);
  assert.match(breadcrumb,/aria-current","page"/);
  assert.match(breadcrumb,/safeBreadcrumbHref/);
  assert.match(breadcrumb,/MutationObserver/);
  for(const s of [card,divider,skeleton,spinner,alert,breadcrumb]){
    assert.doesNotMatch(s,/border-left:\s*3px solid var\(--cu-accent/);
  }
});

test("Web Component package and React adapter expose new tags",async()=>{
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const id of ["card","divider","skeleton","spinner","alert","breadcrumb"]){
    assert.equal(pkg.exports["./components/"+id].default,"./dist/components/"+id+".js");
    assert.equal(pkg.exports["./components/"+id].types,"./dist/components/index.d.ts");
  }
  assert.equal(REACT_TAGS.Card,"cu-card");
  assert.equal(REACT_TAGS.Breadcrumb,"cu-breadcrumb");
  assert.equal(REACT_TAGS.BreadcrumbItem,"cu-breadcrumb-item");
  assert.equal(Object.keys(REACT_TAGS).length,84);
});

test("Playground contains six component previews and functional controls",async()=>{
  const html=await read("../apps/playground-web/index.html");
  const js=await read("../apps/playground-web/main.js");
  for(const tag of ["cu-card","cu-divider","cu-skeleton","cu-spinner","cu-alert",
    "cu-breadcrumb","cu-breadcrumb-item"]) assert.ok(html.includes("<"+tag),tag);
  for(const id of ["wc-card-action","wc-toggle-loading","wc-loading-preview",
    "wc-loaded-preview","wc-alert-dismissible","wc-alert-restore","wc-breadcrumb-toggle"])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(js,/loadingButton\.addEventListener\("cu-press"/);
  assert.match(js,/dismissibleAlert\.addEventListener\("cu-dismiss"/);
  assert.match(js,/breadcrumbs\.querySelector/);
});

test("six catalog entries move to preview without claiming production readiness",async()=>{
  const data=JSON.parse(await read("../design-system/components/catalog.json"));
  const records=data.groups.flatMap(g=>g.components);
  const statuses=new Map(records.map(c=>[c.name,c.status]));
  for(const name of ["Card","Divider","Skeleton","Spinner","Alert","Breadcrumb"])
    assert.equal(statuses.get(name),"preview");
  assert.equal(records.length,130);
  assert.equal(records.filter(c=>c.status==="preview").length,71);
  assert.equal(records.filter(c=>c.status==="planned").length,59);
  assert.equal(records.filter(c=>c.status==="ready").length,0);
});
