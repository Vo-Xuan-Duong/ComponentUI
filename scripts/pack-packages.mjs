/**
 * Build and pack local .tgz files for testing in sibling repositories.
 * No publish, no GitHub Actions, no network-dependent tooling.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
function run(cmd,args){
 const r=spawnSync(cmd,args,{cwd:ROOT,stdio:"inherit",shell:process.platform==="win32"});
 if(r.error)throw r.error;
 if(r.status!==0)throw new Error(cmd+" exited with "+r.status);
}
run(process.execPath,["scripts/build-packages.mjs"]);
run(process.execPath,["scripts/verify-packages.mjs"]);
const output=join(ROOT,"artifacts");
await mkdir(output,{recursive:true});
for(const name of ["icons","theme","web","react","vue","svelte"]){
 run("npm",["pack",join(ROOT,"packages",name),"--pack-destination",output,"--ignore-scripts","--offline"]);
}
console.log("Created local tarballs under artifacts/. Nothing was published.");
