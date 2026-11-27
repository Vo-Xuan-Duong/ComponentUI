import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {buildJsonTree,filterJsonTree} from "../packages/web/src/components/json-viewer.js";
import {diffLines} from "../packages/web/src/components/diff-viewer.js";
import {parseMarkdownBlocks} from "../packages/web/src/components/markdown-editor.js";
import {REACT_TAGS} from "../packages/react/src/index.js";
test("JSON paths, matching and bounds",()=>{
  const result=buildJsonTree({"a/b":{"~x":42},other:false});
  assert.equal(result.root.children[0].children[0].path,"$/a~1b/~0x");
  assert.equal(filterJsonTree(result.root,"42").children.length,1);
  assert.equal(filterJsonTree(result.root,"missing"),null);
  assert.equal(buildJsonTree([1,2,3],{maxNodes:2}).truncated,true);
});
test("line diff alignment, additions, removals and limits",()=>{
  const d=diffLines("a\nb","a\nc");
  assert.equal(d.added,1);assert.equal(d.removed,1);
  assert.deepEqual(d.rows.map(r=>r.kind),["equal","remove","add"]);
  assert.equal(diffLines("a\nb","a\nb").added,0);
  assert.equal(diffLines("a\nb","a",1).limited,true);
});
test("Markdown block parsing treats HTML as text",()=>{
  const blocks=parseMarkdownBlocks("# Title\n\n- item\n\n<script>alert(1)</script>\n\n\x60\x60\x60js\nlet x=1;\n\x60\x60\x60");
  assert.deepEqual(blocks.map(b=>b.kind),["heading","list","paragraph","code"]);
  assert.equal(blocks[2].text,"<script>alert(1)</script>");
  assert.equal(blocks[3].language,"js");
});
test("new modules are integrated and compose shared controls",async()=>{
  const read=p=>readFile(new URL(p,import.meta.url),"utf8");
  const html=await read("../apps/playground-web/index.html");
  const pkg=JSON.parse(await read("../packages/web/package.json"));
  for(const [name,tag,deps] of [["JsonViewer","json-viewer",["tree-view","search-box","code-block"]],["DiffViewer","diff-viewer",["split-view","code-block","badge"]],["MarkdownEditor","markdown-editor",["text-area","split-view","scroll-area"]]]){
    assert.equal(REACT_TAGS[name],"cu-"+tag);
    assert.ok(html.includes("<cu-"+tag));
    assert.equal(pkg.exports["./components/"+tag].default,"./dist/components/"+tag+".js");
    const source=await read("../packages/web/src/components/"+tag+".js");
    for(const dep of deps)assert.ok(source.includes('import "./'+dep+'.js"'));
  }
});
