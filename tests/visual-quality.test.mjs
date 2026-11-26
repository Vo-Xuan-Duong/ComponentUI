import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {checkQuality,QUALITY_CHECKS} from "../scripts/check-quality.mjs";
import {withStateFallbacks,mount} from "../packages/web/src/components/_shared.js";
const read=p=>readFile(new URL(p,import.meta.url),"utf8");

function luminance(hex){
  const channels=hex.replace("#","").match(/.{2}/g).map(x=>parseInt(x,16)/255);
  const values=channels.map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
}
function ratio(foreground,background){
  const a=luminance(foreground),b=luminance(background);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
function token(css,name){
  const match=new RegExp("--cu-"+name+":\\s*(#[0-9a-fA-F]{6})\\s*;").exec(css);
  assert.ok(match,"Missing token "+name);
  return match[1];
}

test("Quality source gate covers library styles, custom select, form controls and Playground",async()=>{
  const result=await checkQuality();
  assert.deepEqual(result.missing,[]);
  assert.ok(result.checkedFiles>=9);
  assert.ok(result.checkedMarkers>=70);
  assert.equal(new Set(QUALITY_CHECKS.map(item=>item.path)).size,QUALITY_CHECKS.length);
});

test("Light and Dark token text contrasts exceed WCAG AA for normal text",async()=>{
  const css=await read("../packages/theme/src/tokens.css");
  const light=css.match(/:root, :root\[data-cu-theme="light"\]\s*\{([^}]+)\}/);
  const dark=css.match(/:root\[data-cu-theme="dark"\]\s*\{([^}]+)\}/);
  assert.ok(light);assert.ok(dark);
  for(const section of [light[1],dark[1]]){
    assert.ok(ratio(token(section,"text"),token(section,"surface"))>=4.5,
      "Main text should meet AA contrast on surface");
    assert.ok(ratio(token(section,"text-muted"),token(section,"surface"))>=4.5,
      "Muted text should meet AA contrast on surface");
    assert.ok(ratio(token(section,"accent-text"),token(section,"accent"))>=4.5,
      "Accent button labels should meet AA contrast on accent");
  }
});

test("Select preserves distinct active, selected and disabled treatment",async()=>{
  const select=await read("../packages/web/src/components/select.js");
  assert.match(select,/\.option:hover:not\(\[aria-disabled=true\]\)/);
  assert.match(select,/\.option\[data-active=true\]:not\(\[aria-disabled=true\]\)/);
  assert.match(select,/\.option\[data-selected=true\]:not\(\[data-active=true\]\)/);
  assert.match(select,/\.option\[data-selected=true\]\s+\.check/);
  assert.match(select,/node\.dataset\.selected/);
  assert.match(select,/node\.dataset\.active/);
  assert.match(select,/aria-activedescendant/);
  assert.match(select,/\.control:focus-visible/);
  assert.match(select,/cu-select-enter/);
  assert.match(select,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(select,/@media\(forced-colors:active\)/);
});

test("Shadow and global controls share state palette and keyboard focus ring",async()=>{
  const shared=await read("../packages/web/src/components/_shared.js");
  const css=await read("../packages/theme/src/components.css");
  for(const state of ["hover","pressed","selected"]){
    assert.ok(shared.includes("--cu-state-"+state));
    assert.ok(css.includes("--cu-state-"+state));
  }
  assert.match(shared,/button:focus-visible/);
  assert.match(shared,/input:focus-visible/);
  assert.match(shared,/button:active\{transform:none!important/);
  assert.match(css,/\.cu-btn:focus-visible/);
  assert.match(css,/\.cu-input:focus-visible/);
  assert.match(css,/\.cu-btn:active:not\(:disabled\)/);
});

test("Playground uses horizontal top navigation and real component state matrix",async()=>{
  const [html,css,js]=await Promise.all([
    read("../apps/playground-web/index.html"),
    read("../apps/playground-web/styles.css"),
    read("../apps/playground-web/main.js")
  ]);
  assert.match(html,/<header class="sidebar" aria-label="ComponentUI site navigation">/);
  assert.doesNotMatch(html,/<aside class="sidebar"/);
  assert.match(html,/id="quality-lab"/);
  assert.match(html,/href="#quality-lab"/);
  for(const tag of ["cu-button","cu-text-field","cu-select","cu-checkbox","cu-switch"])
    assert.ok(html.includes("<"+tag),"Missing native "+tag);
  for(const id of ["quality-primary","quality-loading","quality-disabled",
    "quality-invalid","quality-select","quality-result"]){
    assert.ok(html.includes('id="'+id+'"'),"Missing state example "+id);
  }
  assert.match(css,/\.app-layout\s*\{\s*display:\s*block/);
  assert.match(css,/\.app-layout > \.sidebar/);
  assert.match(css,/\.quality-lab-grid/);
  assert.match(css,/@media\(max-width: 700px\)/);
  assert.match(js,/getElementById\("quality-select"\)\.addEventListener\("cu-change"/);
  assert.match(js,/getElementById\("quality-field"\)\.addEventListener\("cu-input"/);
});

test("Action states and feedback colors meet AA token contrast in both modes",async()=>{
  const css=await read("../packages/theme/src/tokens.css");
  for(const mode of ["light","dark"]){
    const section=css.match(new RegExp(':root\\[data-cu-theme="'+mode+'"\\]\\s*\\{([^}]+)\\}'))[1];
    for(const pair of [["accent-text","accent"],["accent-text","accent-hover"],["accent-text","accent-pressed"],
      ["danger-action-text","danger-action-bg"],["danger-action-text","danger-action-hover"],["danger-action-text","danger-action-pressed"],
      ["success","success-surface"],["warning","warning-surface"],["danger","danger-surface"]]){
      assert.ok(ratio(token(section,pair[0]),token(section,pair[1]))>=4.5,mode+" "+pair.join(" / "));
    }
    for(const surface of ["surface","surface-alt","surface-elevated"]){
      assert.ok(ratio(token(section,"control-border"),token(section,surface))>=3,mode+" control boundary "+surface);
    }
  }
});

test("Purple and green accent action states preserve text contrast",async()=>{
  const css=await read("../packages/theme/src/components.css");
  for(const accent of ["purple","green"])for(const mode of ["light","dark"]){
    const selector=mode==="dark"?':root[data-cu-theme="dark"][data-cu-accent="'+accent+'"]':':root[data-cu-accent="'+accent+'"]';
    const section=css.slice(css.indexOf(selector)+selector.length).split("}")[0];
    for(const state of ["accent","accent-hover","accent-pressed"])
      assert.ok(ratio(mode==="dark"?"#202020":"#FFFFFF",token(section,state))>=4.5,mode+" "+accent+" "+state);
  }
});

test("Shadow state fallbacks preserve public scoped variables and explicit fallbacks",()=>{
  const input=".option:hover{background:var(--cu-state-active);color:var(--cu-text)}";
  const output=withStateFallbacks(input);
  assert.ok(output.includes("var(--cu-state-active,color-mix("));
  assert.ok(output.includes("color:var(--cu-text)"));
  assert.equal(withStateFallbacks("var(--cu-state-hover,red)"),"var(--cu-state-hover,red)");
  const root={innerHTML:""};
  mount({attachShadow:()=>root},input,"<slot></slot>");
  assert.ok(root.innerHTML.includes(output));
  assert.doesNotMatch(root.innerHTML,/:host\{--cu-state-/);
});

test("Native and HTML state previews share active option and scoped overrides",async()=>{
  const html=await read("../apps/playground-web/index.html");
  assert.ok(html.includes('id="quality-semantic-states"'));
  assert.ok(html.includes("--cu-state-hover:var(--cu-state-active)"));
  for(const name of ["select","autocomplete","multi-select","command-palette"]){
    const source=await read("../packages/web/src/components/"+name+".js");
    assert.ok(source.includes("--cu-state-active"),name);
  }
});
