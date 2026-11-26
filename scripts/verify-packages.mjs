/**
 * Offline distributable integrity checks. Run after "npm run build:packages".
 * This validates that every declared export and relative ESM import resides
 * within the package's dist directory and that Web/React no longer require
 * monorepo-only icon imports.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const expectedVersion=JSON.parse(await readFile(join(ROOT,"package.json"),"utf8")).version;
const names=["icons","theme","web","react","vue","svelte"];
const failures=[];
async function exists(path) {
  try {return (await stat(path)).isFile();}
  catch{return false;}
}
async function walk(folder) {
  const files=[];
  for(const entry of await readdir(folder,{withFileTypes:true})){
    const absolute=join(folder,entry.name);
    if(entry.isDirectory())files.push(...await walk(absolute));
    else if(entry.isFile())files.push(absolute);
  }
  return files;
}
for(const name of names){
  const directory=join(ROOT,"packages",name);
  const manifest=JSON.parse(await readFile(join(directory,"package.json"),"utf8"));
  const dist=join(directory,"dist");
  if(manifest.private!==true)failures.push(name+": do not publish experimental packages");
  if(manifest.version!==expectedVersion)failures.push(name+": version drift");
  if(JSON.stringify(manifest.files)!==JSON.stringify(["dist"]))
    failures.push(name+": pack files must be limited to dist");
  for(const [subpath,ex] of Object.entries(manifest.exports)){
    for(const candidate of typeof ex==="string"?[ex]:Object.values(ex)){
      if(typeof candidate!=="string"||!candidate.startsWith("./dist/")){
        failures.push(name+" "+subpath+": export must point inside dist");continue;
      }
      if(!await exists(join(directory,candidate)))
        failures.push(name+" "+subpath+": missing "+candidate);
    }
  }
  let files=[];
  try {files=await walk(dist);}
  catch {failures.push(name+": dist is missing; run npm run build:packages");continue;}
  for(const file of files.filter(p=>p.endsWith(".js")||p.endsWith(".d.ts"))){
    const content=await readFile(file,"utf8");
    const imports=content.matchAll(/(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)(["'])([^"']+)\1/g);
    for(const match of imports){
      const ref=match[2];
      if(ref.startsWith("@componentui/"))
        failures.push(name+": bundled output still imports another workspace package: "+ref);
      // Ignore example imports in comments such as ".../components/button.js".
      if(!ref.startsWith("./") && !ref.startsWith("../"))continue;
      const destination=resolve(dirname(file),ref);
      const inside=relative(dist,destination);
      const declarationTarget = file.endsWith(".d.ts") && ref.endsWith(".js")
        ? destination.slice(0,-3)+".d.ts" : null;
      if(isAbsolute(inside)||inside===".."||inside.startsWith("../")||
         inside.startsWith("..\\")||
         (!await exists(destination) && !(declarationTarget && await exists(declarationTarget))))
        failures.push(name+": broken relative import "+ref+" in "+relative(dist,file));
    }
  }
  console.log(name+": checked "+files.length+" distributable files");
}
if(failures.length){
  for(const message of failures)console.error("FAIL "+message);
  process.exitCode=1;
}else{
  // Native Custom Elements and framework helper entry points must be safe to
  // import in a Node SSR context. DOM interaction is still browser-only.
  const web=await import(pathToFileURL(join(ROOT,"packages/web/dist/components/index.js")).href);
  const react=await import(pathToFileURL(join(ROOT,"packages/react/dist/index.js")).href);
  const vue=await import(pathToFileURL(join(ROOT,"packages/vue/dist/index.js")).href);
  const svelte=await import(pathToFileURL(join(ROOT,"packages/svelte/dist/index.js")).href);
  if(typeof web.CuButton!=="function"||typeof react.createReactComponents!=="function"||
     typeof vue.isComponentUIElement!=="function"||typeof svelte.cuModel!=="function")
    throw new Error("One or more ESM entry points could not be imported");
  // Ensure each public React tag has a native class, a DOM declaration,
  // and an importable standalone subpath in the built Web package.
  const webManifest=JSON.parse(await readFile(join(ROOT,"packages/web/package.json"),"utf8"));
  const domTypes=await readFile(join(ROOT,"packages/web/dist/components/index.d.ts"),"utf8");
  const wrapperTypes=await readFile(join(ROOT,"packages/react/dist/components.d.ts"),"utf8");
  const tags=Object.entries(react.REACT_TAGS);
  for(const [name,tag] of tags){
    if(typeof web["Cu"+name]!=="function")throw new Error("Missing native class: "+name);
    if(!domTypes.includes('"'+tag+'":'))throw new Error("Missing DOM type: "+tag);
    if(!wrapperTypes.includes("const "+name+":"))throw new Error("Missing React wrapper type: "+name);
    const entry=webManifest.exports["./components/"+tag.slice(3)];
    if(!entry?.default)throw new Error("Missing component export: "+tag);
    const module=await import(pathToFileURL(join(ROOT,"packages/web",entry.default)).href);
    if(module["Cu"+name]!==web["Cu"+name])throw new Error("Standalone class mismatch: "+tag);
  }
  console.log("Verified "+tags.length+" native component exports and TypeScript mappings.");
  console.log("Independent dist checks and Node ESM import smoke checks passed.");
}
