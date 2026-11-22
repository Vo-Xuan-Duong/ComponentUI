/**
 * Build self-contained, dependency-free ESM distributions.
 *
 * No bundler or network access is required. We copy the browser source graph
 * and vendor Lucide's curated node data INSIDE @componentui/web's dist so it
 * works when installed alone from a .tgz in a different repository.
 * The playground continues to reference the original source files.
 */
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pack = name => join(ROOT, "packages", name);
const supported = ["icons", "theme", "web", "react", "vue", "svelte"];
const target = process.argv[2] ?? "all";
if (target !== "all" && !supported.includes(target)) {
  throw new RangeError("Unknown package: " + target);
}

async function copyFile(source, destination) {
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}
async function copySourceTree(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const item of await readdir(source, { withFileTypes: true })) {
    if (item.isDirectory()) await copySourceTree(join(source, item.name), join(destination, item.name));
    else if (item.isFile()) await copyFile(join(source, item.name), join(destination, item.name));
  }
}
async function replaceRequired(file, oldString, nextString) {
  const content = await readFile(file, "utf8");
  if (!content.includes(oldString))
    throw new Error("Missing expected import in " + file + ": " + oldString);
  await writeFile(file, content.replace(oldString, nextString));
}
async function copyIconTypes(destination) {
  await copyFile(join(pack("icons"), "src/icons.d.ts"), destination);
}
async function build(name) {
  const directory = pack(name);
  const dist = join(directory, "dist");
  await rm(dist, { recursive: true, force: true });
  await copySourceTree(join(directory, "src"), dist);
  if (name === "web") {
    // Replace the only monorepo-relative cross-package runtime import.
    await replaceRequired(
      join(dist, "components/icon.js"),
      "../../../icons/src/icons.js",
      "../internal/icons.js"
    );
    // Same boundary for the emitted public TypeScript declarations.
    await replaceRequired(
      join(dist, "components/index.d.ts"),
      "../../../icons/src/icons.js",
      "../internal/icons.js"
    );
    await copyFile(join(pack("icons"), "src/icons.js"), join(dist, "internal/icons.js"));
    await copyIconTypes(join(dist, "internal/icons.d.ts"));
    await copySourceTree(
      join(pack("icons"), "src/data"),
      join(dist, "internal/data")
    );
    await copyFile(
      join(pack("icons"), "LICENSE"),
      join(dist, "THIRD_PARTY_LUCIDE_LICENSE.txt")
    );
  } else if (name === "react") {
    // Avoid requiring a separate icons package just to resolve type names.
    await replaceRequired(
      join(dist, "index.d.ts"),
      'from "@componentui/icons"',
      'from "./internal/icons.js"'
    );
    await copyIconTypes(join(dist, "internal/icons.d.ts"));
  }
  console.log("Built @componentui/" + name + " -> packages/" + name + "/dist");
}
for (const name of target === "all" ? supported : [target]) await build(name);
