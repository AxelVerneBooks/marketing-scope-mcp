/**
 * Integration tests — error paths, end to end.
 *
 * Each test launches the built server (stdio or Streamable HTTP) as a child
 * process with test/fixtures/no-network.mjs preloaded, so any outbound
 * non-loopback connection fails. "External" inputs are mocked: plan files come
 * from test/fixtures/, and broken data dirs are staged in a temp dir.
 * The README's "Error Handling" section documents what these tests pin down.
 * Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";

const ENTRY = join(process.cwd(), "dist", "index.js");
const FIXTURES = join(process.cwd(), "test", "fixtures");
const NO_NETWORK = join(FIXTURES, "no-network.mjs");
const OFFER = "Ledger kit for farmers only $19, unlike generic ledgers. Start today.";

function tempDir(t) {
  const dir = mkdtempSync(join(tmpdir(), "msmcp-int-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** stdio MCP client over a child process; initialized and ready on return. */
async function startStdio(t, dataDir) {
  const child = spawn(process.execPath, ["--import", NO_NETWORK, ENTRY], {
    env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir },
    stdio: ["pipe", "pipe", "inherit"],
  });
  t.after(async () => {
    child.kill();
    await once(child, "exit").catch(() => {});
  });
  let buf = "";
  let nextId = 0;
  const pending = new Map();
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buf += chunk;
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      pending.get(msg.id)?.(msg);
      pending.delete(msg.id);
    }
  });
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 15000);
      pending.set(id, (msg) => {
        clearTimeout(timer);
        msg.error ? reject(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : resolve(msg.result);
      });
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "int-test", version: "0" } });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  return { call: (name, args) => request("tools/call", { name, arguments: args }) };
}

const text = (result) => result.content[0].text;

function assertToolError(result, pattern) {
  assert.equal(result.isError, true, `expected isError, got ${JSON.stringify(result)}`);
  assert.match(text(result), pattern);
}

test("no-network preload refuses non-loopback fetches (guards the other tests)", () => {
  const out = execFileSync(
    process.execPath,
    ["--import", NO_NETWORK, "-e", "fetch('https://example.com').then(() => console.log('reached'), (e) => console.log(e.message))"],
    { encoding: "utf8" }
  );
  assert.match(out, /network disabled in tests/);
});

test("schema violations come back as isError tool results with code -32602", async (t) => {
  const client = await startStdio(t, tempDir(t));
  assertToolError(await client.call("score_offer", { offer: "too short" }), /-32602.*at least 12 character/);
  assertToolError(await client.call("plan_campaign", {}), /-32602.*Required at objective/);
  assertToolError(await client.call("build_plan", { goal: "launch", offers: [] }), /-32602.*at least 1 element/);
  assertToolError(await client.call("no_such_tool", {}), /-32602.*Tool no_such_tool not found/);
});

test("build_plan matches scored offers exactly (trimmed, case-sensitive) and is all-or-nothing", async (t) => {
  const dataDir = tempDir(t);
  const client = await startStdio(t, dataDir);
  await client.call("score_offer", { offer: OFFER });

  assertToolError(await client.call("build_plan", { goal: "launch", offers: [OFFER.toUpperCase()] }), /never scored/);

  // one scored + one unscored offer: the whole call is refused and nothing is written
  const mixed = await client.call("build_plan", { goal: "launch", offers: [OFFER, "an offer nobody scored"] });
  assertToolError(mixed, /never scored[\s\S]*an offer nobody scored/);
  assert.doesNotMatch(text(mixed), new RegExp(OFFER.slice(0, 20).replace(/\$/g, "\\$")));
  assert.equal(existsSync(join(dataDir, "campaigns")), false);

  // surrounding whitespace is ignored
  const built = await client.call("build_plan", { goal: "launch", offers: [`  ${OFFER}  `] });
  assert.equal(built.isError, undefined);
  assert.equal(readdirSync(join(dataDir, "campaigns")).length, 1);
});

test("build_plan surfaces the raw filesystem error when the data dir is unusable", async (t) => {
  const dir = tempDir(t);
  const notADir = join(dir, "data-is-a-file");
  writeFileSync(notADir, "not a directory");
  const client = await startStdio(t, notADir);
  await client.call("score_offer", { offer: OFFER });
  assertToolError(await client.call("build_plan", { goal: "launch", offers: [OFFER] }), /ENOTDIR/);
});

test("check_plan error cases: missing input, unknown id, missing file, directory", async (t) => {
  const dir = tempDir(t);
  const client = await startStdio(t, dir);
  const neither = /Provide either plan_id \(from build_plan\) or plan_path/;
  assertToolError(await client.call("check_plan", {}), neither);
  // an unknown plan_id gets the same message as passing nothing at all
  assertToolError(await client.call("check_plan", { plan_id: "deadbeef" }), neither);
  assertToolError(await client.call("check_plan", { plan_path: join(dir, "missing.md") }), /Plan file not found: .*missing\.md/);
  mkdirSync(join(dir, "a-directory"));
  assertToolError(await client.call("check_plan", { plan_path: join(dir, "a-directory") }), /EISDIR/);
});

test("check_plan on hand-written plan files (fixtures)", async (t) => {
  const client = await startStdio(t, tempDir(t));
  const check = async (fixture) => JSON.parse(text(await client.call("check_plan", { plan_path: join(FIXTURES, fixture) })));

  // no "## Channel briefs" heading → tactics are not found at all
  const noSections = await check("plan-no-sections.md");
  assert.equal(noSections.pass, false);
  assert.equal(noSections.tacticsFound, 0);
  assert.match(noSections.verdict, /no tactics/);

  // bullets under 30 characters are skipped, not flagged
  const short = await check("plan-short-bullets.md");
  assert.equal(short.pass, false);
  assert.equal(short.tacticsFound, 0);

  // known limitation: [On] is not checked against the registry, so a phantom offer still passes
  const phantom = await check("plan-phantom-ref.md");
  assert.equal(phantom.pass, true);
  assert.deepEqual(phantom.orphanTactics, "none");
});

test("restart drops scores and plan ids; plan files on disk survive", async (t) => {
  const dataDir = tempDir(t);
  const first = await startStdio(t, dataDir);
  await first.call("score_offer", { offer: OFFER });
  const built = text(await first.call("build_plan", { goal: "launch", offers: [OFFER] }));
  const [, planId, planPath] = built.match(/Campaign shell (\S+) saved to (\S+\.md)/);
  assert.equal(JSON.parse(text(await first.call("check_plan", { plan_id: planId }))).plan, planId);

  const second = await startStdio(t, dataDir);
  assertToolError(await second.call("build_plan", { goal: "launch", offers: [OFFER] }), /never scored/);
  assertToolError(await second.call("check_plan", { plan_id: planId }), /Provide either plan_id/);
  assert.equal(JSON.parse(text(await second.call("check_plan", { plan_path: planPath }))).plan, planPath);
});

test("HTTP transport rejects malformed JSON (400) and a missing Accept header (406)", async (t) => {
  const port = 47000 + Math.floor(Math.random() * 2000);
  const child = spawn(process.execPath, ["--import", NO_NETWORK, ENTRY, "--http", "--port", String(port)], {
    env: { ...process.env, MARKETING_SCOPE_DATA_DIR: tempDir(t) },
    stdio: ["ignore", "ignore", "pipe"],
  });
  t.after(async () => {
    child.kill();
    await once(child, "exit").catch(() => {});
  });
  // the server logs its listening line to stderr once bound
  await new Promise((resolve) => child.stderr.on("data", (d) => /listening/.test(String(d)) && resolve()));

  const url = `http://127.0.0.1:${port}/mcp`;
  const both = "application/json, text/event-stream";
  const bad = await fetch(url, { method: "POST", headers: { "content-type": "application/json", accept: both }, body: "{not json" });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, -32700);

  const list = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
  const noAccept = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: list });
  assert.equal(noAccept.status, 406);
  assert.match((await noAccept.json()).error.message, /Not Acceptable/);
});
