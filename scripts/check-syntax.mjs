import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["apps", "packages", "scripts", "tests"];
async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name !== "dist" && entry.name !== "node_modules") await checkDirectory(join(directory, entry.name));
    } else if (/\.(?:m?js)$/.test(entry.name)) {
      const file = join(directory, entry.name);
      const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
      if (result.status !== 0) {
        process.stderr.write(result.stderr || `Unable to check ${file}\n`);
        process.exitCode = 1;
      }
    }
  }
}
for (const root of roots) await checkDirectory(root);
if (!process.exitCode) console.log("JavaScript syntax checks passed.");
