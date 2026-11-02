/**
 * Unit tests for the `doctor` health check (pass / warn / fail branches),
 * plus CLI tests for the exit code. Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  checkNodeVersion,
  checkEnvVars,
  checkDataDir,
  checkHttpPort,
  runChecks,
  formatReport,
  exitCodeFor,
  MIN_NODE_MAJOR,
} from "../dist/doctor.js";

const tmp = () => mkdtempSync(join(tmpdir(), "msmcp-doctor-"));

/* --- Node version ------------------------------------------------- */

test("node version: passes at and above the minimum", () => {
  assert.equal(checkNodeVersion(`${MIN_NODE_MAJOR}.0.0`).status, "pass");
  assert.equal(checkNodeVersion("v22.11.0").status, "pass");
});

test("node version: fails below the minimum with an install hint", () => {
  const r = checkNodeVersion("18.19.1");
  assert.equal(r.status, "fail");
  assert.match(r.detail, /18\.19\.1/);
  assert.match(r.fix, /nvm install 20/);
});

test("node version: fails on garbage input instead of passing", () => {
  assert.equal(checkNodeVersion("not-a-version").status, "fail");
});

/* --- env vars ----------------------------------------------------- */

test("env vars: none required, so an empty env passes", () => {
  const r = checkEnvVars({});
  assert.equal(r.status, "pass");
  assert.equal(r.fix, undefined);
});

test("env vars: valid optional values pass and are listed", () => {
  const r = checkEnvVars({ PORT: "8080", MARKETING_SCOPE_DATA_DIR: "/tmp/x" });
  assert.equal(r.status, "pass");
  assert.match(r.detail, /PORT, MARKETING_SCOPE_DATA_DIR/);
});

test("env vars: invalid PORT fails with a fix", () => {
  for (const bad of ["abc", "0", "70000", "3.5"]) {
    const r = checkEnvVars({ PORT: bad });
    assert.equal(r.status, "fail", `PORT=${bad} should fail`);
    assert.match(r.fix, /defaults to 3002/);
  }
});

test("env vars: empty MARKETING_SCOPE_DATA_DIR fails", () => {
  const r = checkEnvVars({ MARKETING_SCOPE_DATA_DIR: "  " });
  assert.equal(r.status, "fail");
  assert.match(r.detail, /MARKETING_SCOPE_DATA_DIR/);
});

/* --- data dir ----------------------------------------------------- */

test("data dir: writable (and auto-created) dir passes", () => {
  const dir = tmp();
  try {
    assert.equal(checkDataDir(join(dir, "nested", "data")).status, "pass");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("data dir: unwritable path fails with MARKETING_SCOPE_DATA_DIR hint", () => {
  const dir = tmp();
  try {
    const file = join(dir, "a-file");
    writeFileSync(file, "x");
    const r = checkDataDir(join(file, "data")); // parent is a file → ENOTDIR/EEXIST
    assert.equal(r.status, "fail");
    assert.match(r.fix, /MARKETING_SCOPE_DATA_DIR/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* --- network / HTTP port ------------------------------------------ */

async function freePort() {
  const srv = createServer();
  await new Promise((r) => srv.listen(0, "0.0.0.0", r));
  const { port } = srv.address();
  await new Promise((r) => srv.close(r));
  return port;
}

test("network: free port passes and states no outbound APIs are called", async () => {
  const r = await checkHttpPort(await freePort());
  assert.equal(r.status, "pass");
  assert.match(r.detail, /no outbound APIs/);
});

test("network: busy port warns (not fails) with a next step", async () => {
  const srv = createServer();
  await new Promise((r) => srv.listen(0, "0.0.0.0", r));
  try {
    const r = await checkHttpPort(srv.address().port);
    assert.equal(r.status, "warn");
    assert.match(r.fix, /--port/);
  } finally {
    await new Promise((r) => srv.close(r));
  }
});

/* --- aggregation -------------------------------------------------- */

test("report + exit code: warnings alone exit 0, any failure exits 1", () => {
  const pass = { name: "A", status: "pass", detail: "ok" };
  const warn = { name: "B", status: "warn", detail: "meh", fix: "do X" };
  const fail = { name: "C", status: "fail", detail: "bad", fix: "do Y" };

  assert.equal(exitCodeFor([pass, warn]), 0);
  assert.match(formatReport([pass, warn]), /All required checks passed \(1 warning/);

  assert.equal(exitCodeFor([pass, fail]), 1);
  const report = formatReport([pass, fail]);
  assert.match(report, /\[FAIL\] C: bad/);
  assert.match(report, /→ do Y/);
  assert.match(report, /1 check\(s\) failed/);
});

test("runChecks: healthy environment has no failures", async () => {
  const dir = tmp();
  try {
    const results = await runChecks({ env: { MARKETING_SCOPE_DATA_DIR: dir }, port: await freePort(), nodeVersion: "22.0.0" });
    assert.deepEqual(results.map((r) => r.name), ["Node.js version", "Environment variables", "Data directory", "Network"]);
    assert.equal(exitCodeFor(results), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/* --- CLI ---------------------------------------------------------- */

function runCli(env, extraArgs = []) {
  return spawnSync(process.execPath, [join(process.cwd(), "dist", "index.js"), "doctor", ...extraArgs], {
    env: { ...process.env, PORT: "", ...env },
    encoding: "utf8",
    timeout: 15000,
  });
}

test("CLI: `doctor` exits 0 on a healthy environment", async () => {
  const dir = tmp();
  try {
    const res = runCli({ MARKETING_SCOPE_DATA_DIR: dir }, ["--port", String(await freePort())]);
    assert.equal(res.status, 0, res.stdout + res.stderr);
    assert.match(res.stdout, /marketing-scope-mcp .* — doctor/);
    assert.match(res.stdout, /ready to run/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI: `doctor` exits 1 and prints next steps when a check fails", async () => {
  const dir = tmp();
  try {
    const file = join(dir, "a-file");
    writeFileSync(file, "x");
    const res = runCli({ MARKETING_SCOPE_DATA_DIR: join(file, "data") }, ["--port", String(await freePort())]);
    assert.equal(res.status, 1, res.stdout + res.stderr);
    assert.match(res.stdout, /\[FAIL\] Data directory/);
    assert.match(res.stdout, /→ Point MARKETING_SCOPE_DATA_DIR/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
