#!/usr/bin/env node
/**
 * Release helper — bumps the version everywhere it is pinned and rolls the
 * CHANGELOG "Unreleased" section into a dated release heading.
 *
 * Usage:
 *   node scripts/bump-version.mjs <patch|minor|major|X.Y.Z> [--date YYYY-MM-DD]
 *
 * Files touched (keep this list in sync with wherever the version lives):
 *   package.json, package-lock.json, server.json, src/version.ts,
 *   the "(vX.Y.Z)" banner in src/**\/*.ts headers, CHANGELOG.md
 *
 * Prints the new version on stdout (last line) so CI can capture it.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function fail(msg) {
  console.error(`bump-version: ${msg}`);
  process.exit(1);
}

const [bump, ...rest] = process.argv.slice(2);
if (!bump) fail("missing argument: patch | minor | major | X.Y.Z");
const dateIdx = rest.indexOf("--date");
const date = dateIdx >= 0 ? rest[dateIdx + 1] : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) fail(`bad --date: ${date}`);

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const write = (p, s) => writeFileSync(join(ROOT, p), s);

const pkg = JSON.parse(read("package.json"));
const current = pkg.version;
const m = SEMVER.exec(current);
if (!m) fail(`package.json version "${current}" is not plain X.Y.Z`);
const [maj, min, pat] = m.slice(1).map(Number);

let next;
if (bump === "major") next = `${maj + 1}.0.0`;
else if (bump === "minor") next = `${maj}.${min + 1}.0`;
else if (bump === "patch") next = `${maj}.${min}.${pat + 1}`;
else if (SEMVER.test(bump)) next = bump;
else fail(`unknown bump "${bump}"`);
if (next === current) fail(`version is already ${current}`);

/* package.json + package-lock.json (root entry only, not dependencies) */
pkg.version = next;
write("package.json", JSON.stringify(pkg, null, 2) + "\n");
const lock = JSON.parse(read("package-lock.json"));
lock.version = next;
if (lock.packages?.[""]) lock.packages[""].version = next;
write("package-lock.json", JSON.stringify(lock, null, 2) + "\n");

/* server.json (MCP registry manifest) */
const server = JSON.parse(read("server.json"));
server.version = next;
write("server.json", JSON.stringify(server, null, 2) + "\n");

/* src/version.ts + "(vX.Y.Z)" header banners */
write("src/version.ts", `export const version = "${next}";\n`);
function walk(dir) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = join(dir, name);
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
    else if (rel.endsWith(".ts")) {
      const src = read(rel);
      const out = src.replaceAll(`(v${current})`, `(v${next})`);
      if (out !== src) write(rel, out);
    }
  }
}
walk("src");

/* CHANGELOG.md — "## Unreleased" becomes "## X.Y.Z — date"; a fresh empty
   Unreleased section is left on top for the next round of changes. */
const changelog = read("CHANGELOG.md");
const unreleased = /^## Unreleased[^\n]*\n/m;
let updated;
if (unreleased.test(changelog)) {
  const body = changelog.split(unreleased)[1].split(/^## /m)[0];
  if (!body.trim()) fail("CHANGELOG.md has an empty Unreleased section — add entries before releasing");
  updated = changelog.replace(unreleased, `## Unreleased\n\n## ${next} — ${date}\n`);
} else {
  fail('CHANGELOG.md has no "## Unreleased" section — add one with this release\'s entries');
}
write("CHANGELOG.md", updated);

console.error(`bump-version: ${current} -> ${next}`);
console.log(next);
