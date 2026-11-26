import { readFile, writeFile } from "node:fs/promises";

function renderCss(data){
 const kebab=x=>x.replace(/[A-Z]/g,m=>"-"+m.toLowerCase());
 function resolve(token,trail=[]){
   const v=token?.$value;
   if(typeof v==="string" && /^\{[\w.-]+\}$/.test(v)){
     const path=v.slice(1,-1);
     if(trail.includes(path)) throw Error("cyclic token reference: "+path);
     const ref=path.split(".").reduce((a,k)=>a?.[k],data);
     if(!ref)throw Error("unknown token reference: "+path);
     return resolve(ref,[...trail,path]);
   }
   if(v?.colorSpace==="srgb")return v.hex;
   if(v && typeof v==="object" && "unit" in v)return `${v.value}${v.unit}`;
   if(Array.isArray(v))return v.map(x=>x.includes(" ")?`"${x}"`:x).join(", ");
   if(typeof v==="string" || typeof v==="number")return String(v);
   throw Error("unsupported token");
 }
 const root=[];
 function pushSet(prefix,obj){for(const [k,v] of Object.entries(obj))if(!k.startsWith("$"))root.push(`  --cu-${prefix}-${kebab(k)}: ${resolve(v)};`);}
 for(const [family,obj] of Object.entries(data.palette))if(!family.startsWith("$"))pushSet(`palette-${family}`,obj);
 pushSet("space",data.spacing);
 pushSet("radius",data.radius);
 pushSet("control",data.size.control);
 pushSet("font",data.typography.font);
 pushSet("text",data.typography.text);
 pushSet("motion",data.motion);
 function buildMode(mode,selector){
   const vars=[`  color-scheme: ${mode};`];
   for(const [name,t] of Object.entries(data.theme[mode]))if(!name.startsWith("$"))vars.push(`  --cu-${kebab(name)}: ${resolve(t)};`);
   return `${selector} {\n${vars.join("\n")}\n}`;
 }
 return `/* AUTO GENERATED from design-system/tokens/fluent-calm.tokens.json. Do not edit. */\n:root {\n${root.join("\n")}\n  --cu-shadow-soft: 0 2px 8px rgb(0 0 0 / .065);\n  --cu-shadow-flyout: 0 12px 28px rgb(0 0 0 / .16);\n  --cu-state-hover: color-mix(in srgb, var(--cu-accent) 9%, var(--cu-surface));\n  --cu-state-pressed: color-mix(in srgb, var(--cu-accent) 16%, var(--cu-surface));\n  --cu-state-selected: color-mix(in srgb, var(--cu-accent) 13%, var(--cu-surface));\n  --cu-state-active: color-mix(in srgb, var(--cu-accent) 20%, var(--cu-surface-elevated));\n  --cu-motion-ease: cubic-bezier(.2,.8,.2,1);\n  --cu-ring-width: 2px;\n  --cu-ring-offset: 3px;\n}\n\n${buildMode("light",':root, :root[data-cu-theme="light"]')}\n\n${buildMode("dark",':root[data-cu-theme="dark"]')}\n\n@media (prefers-color-scheme: dark) {\n${buildMode("dark",':root:not([data-cu-theme])')}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root { --cu-motion-fast: 0ms; --cu-motion-normal: 0ms; --cu-motion-slow: 0ms; }\n}\n`;
}

const source = new URL("../design-system/tokens/fluent-calm.tokens.json", import.meta.url);
const target = new URL("../packages/theme/src/tokens.css", import.meta.url);
const tokens = JSON.parse(await readFile(source, "utf8"));
const result = renderCss(tokens);
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8").catch(() => "")) !== result) {
    console.error("Generated CSS is stale. Run npm run tokens:build");
    process.exitCode = 1;
  } else console.log("Token CSS matches source.");
} else {
  await writeFile(target, result);
  console.log("Generated packages/theme/src/tokens.css");
}
