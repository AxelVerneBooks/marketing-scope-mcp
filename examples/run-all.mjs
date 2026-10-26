/**
 * Runs every example against the built server and saves its real output to
 * examples/output/<name>.txt. Run: npm run examples
 */
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const scripts = readdirSync(here).filter((f) => /^\d\d-.*\.mjs$/.test(f)).sort();
for (const script of scripts) {
  const out = execFileSync(process.execPath, [join(here, script)], { encoding: "utf8" });
  const target = join(here, "output", script.replace(/\.mjs$/, ".txt"));
  writeFileSync(target, `$ node examples/${script}\n${out}`, "utf8");
  console.log(`${script} -> output/${script.replace(/\.mjs$/, ".txt")}`);
}
