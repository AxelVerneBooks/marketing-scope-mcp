/**
 * End-to-end tests — launch the built CLI (dist/index.js) as a child process
 * and drive it over stdio and Streamable HTTP, exactly as an MCP client would.
 * Run: npm test
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { once } from "node:events";

import { tempDir, withTactics, STRONG_OFFER } from "./helpers.mjs";

const ENTRY = join(process.cwd(), "dist", "index.js");
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

/** Minimal MCP stdio client for the test: JSON-RPC line responses per request id. */
class StdioMcpClient {
  #child;
  #buf = "";
  #pending = new Map();
  #nextId = 1;
  constructor(child) {
    this.#child = child;
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      this.#buf += chunk;
      let idx;
      while ((idx = this.#buf.indexOf("\n")) >= 0) {
        const line = this.#buf.slice(0, idx).trim();
        this.#buf = this.#buf.slice(idx + 1);
        if (!line) continue;
        const msg = JSON.parse(line); // stdout must carry nothing but protocol messages
        if (msg.id !== undefined && this.#pending.has(msg.id)) {
          this.#pending.get(msg.id)(msg);
          this.#pending.delete(msg.id);
        }
      }
    });
  }
  static spawn(dataDir) {
    const child = spawn(process.execPath, [ENTRY], {
      env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir },
      stdio: ["pipe", "pipe", "inherit"],
    });
    return new this(child);
  }
  request(method, params, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = this.#nextId++;
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`timeout waiting for ${method}`));
      }, timeoutMs);
      this.#pending.set(id, (msg) => {
        clearTimeout(timer);
        if (msg.error) reject(new Error(`${method} error: ${JSON.stringify(msg.error)}`));
        else resolve(msg.result);
      });
      this.#child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
  }
  notify(method, params) {
    this.#child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
  async initialize() {
    const init = await this.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test-client", version: "0.0.1" } });
    this.notify("notifications/initialized", {});
    return init;
  }
  call(name, args) {
    return this.request("tools/call", { name, arguments: args });
  }
  async close() {
    this.#child.stdin.end();
    this.#child.kill();
    await once(this.#child, "exit").catch(() => {});
  }
}

const textOf = (result) => {
  assert.ok(result?.content?.[0]?.text, `no text content in ${JSON.stringify(result)}`);
  return result.content[0].text;
};

/** Start the HTTP transport on a free port and wait for its listening line. */
async function startHttp(dataDir, extraArgs = []) {
  const child = spawn(process.execPath, [ENTRY, "--http", "--port", "0", ...extraArgs], {
    env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  const address = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`HTTP server never started: ${stderr}`)), 10000);
    child.stderr.on("data", (d) => {
      stderr += d;
      const m = stderr.match(/on (http:\/\/\S+)\/mcp/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    child.on("exit", (code) => reject(new Error(`exited ${code}: ${stderr}`)));
  });
  return {
    base: address,
    stop: async () => {
      child.kill();
      await once(child, "exit").catch(() => {});
    },
  };
}

const ACCEPT = { "content-type": "application/json", accept: "application/json, text/event-stream" };
async function rpc(base, payload) {
  const res = await fetch(`${base}/mcp`, { method: "POST", headers: ACCEPT, body: JSON.stringify(payload) });
  const t = await res.text();
  const dataLine = t.split("\n").find((l) => l.startsWith("data:"));
  return { status: res.status, body: JSON.parse(dataLine ? dataLine.slice(5).trim() : t) };
}

describe("CLI", () => {
  test("--version prints the package version", () => {
    const r = spawnSync(process.execPath, [ENTRY, "--version"], { encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.equal(r.stdout.trim(), pkg.version);
  });
  test("--help prints usage", () => {
    const r = spawnSync(process.execPath, [ENTRY, "--help"], { encoding: "utf8" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /Usage:[\s\S]*--http[\s\S]*--host/);
  });
  test("an invalid --port exits with status 2", () => {
    const r = spawnSync(process.execPath, [ENTRY, "--http", "--port", "nope"], { encoding: "utf8", timeout: 5000 });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /Invalid port/);
  });
  test("the bin entry exists and has a node shebang", () => {
    assert.equal(pkg.bin["marketing-scope-mcp"], "dist/index.js");
    assert.match(readFileSync(ENTRY, "utf8"), /^#!\/usr\/bin\/env node\n/);
  });
});

describe("stdio transport", () => {
  let tmp;
  before(() => {
    tmp = tempDir();
  });
  after(() => tmp.cleanup());

  test("initialize + tools/list exposes the four workflow tools", async () => {
    const client = StdioMcpClient.spawn(tmp.dir);
    try {
      const init = await client.initialize();
      assert.equal(init.serverInfo.name, "marketing-scope-mcp");
      assert.equal(init.serverInfo.version, pkg.version);
      const tools = await client.request("tools/list", {});
      assert.deepEqual(tools.tools.map((t) => t.name).sort(), ["build_plan", "check_plan", "plan_campaign", "score_offer"]);
    } finally {
      await client.close();
    }
  });

  test("full workflow: plan → score_offer → build → edit → check (gating enforced)", async () => {
    const client = StdioMcpClient.spawn(tmp.dir);
    try {
      await client.initialize();
      const plan = JSON.parse(textOf(await client.call("plan_campaign", { objective: "sell 30 copies of the build manual in 30 days" })));
      assert.ok(plan.killCriteria.length >= 1);

      const scored = JSON.parse(textOf(await client.call("score_offer", { offer: STRONG_OFFER })));
      assert.equal(scored.grade, "A");

      const refused = await client.call("build_plan", { goal: "Bad", offers: ["An offer that was never scored at all"] });
      assert.equal(refused.isError, true);

      const built = textOf(await client.call("build_plan", { goal: "E2E plan", offers: [STRONG_OFFER] }));
      const [, id, path] = built.match(/Campaign shell (\S+) saved to (\S+\.md)/);
      assert.ok(path.startsWith(tmp.dir));

      const fresh = JSON.parse(textOf(await client.call("check_plan", { plan_id: id })));
      assert.equal(fresh.pass, false);

      writeFileSync(path, withTactics(readFileSync(path, "utf8"), ["- Email the list a launch note introducing [O1]; success metric: 3% click-through"]));
      const checked = JSON.parse(textOf(await client.call("check_plan", { plan_id: id })));
      assert.equal(checked.pass, true, JSON.stringify(checked));
    } finally {
      await client.close();
    }
  });
});

describe("Streamable HTTP transport", () => {
  let tmp;
  let srv;
  before(async () => {
    tmp = tempDir();
    srv = await startHttp(tmp.dir);
  });
  after(async () => {
    await srv.stop();
    tmp.cleanup();
  });

  test("binds to loopback by default", () => {
    assert.match(srv.base, /^http:\/\/127\.0\.0\.1:\d+$/);
  });

  test("stateless: requests after initialize work with no session (regression: transport-per-request)", async () => {
    const init = await rpc(srv.base, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "http-test", version: "0" } } });
    assert.equal(init.body.result?.serverInfo?.name, "marketing-scope-mcp");
    const listed = await rpc(srv.base, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.result?.tools?.length, 4, JSON.stringify(listed.body));
    const call = await rpc(srv.base, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "plan_campaign", arguments: { objective: "http regression probe" } } });
    const plan = JSON.parse(call.body.result.content[0].text);
    assert.ok(plan.killCriteria.length >= 1);
  });

  test("check_plan cannot read files outside the data dir over HTTP", async () => {
    const call = await rpc(srv.base, { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "check_plan", arguments: { plan_path: "/etc/passwd" } } });
    assert.equal(call.body.result.isError, true);
    assert.match(call.body.result.content[0].text, /inside the server data directory/);
  });

  test("/healthz reports status; unknown paths 404", async () => {
    const health = await fetch(`${srv.base}/healthz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok", name: "marketing-scope-mcp", version: pkg.version });
    assert.equal((await fetch(`${srv.base}/nope`)).status, 404);
  });

  test("--host overrides the bind address", async () => {
    const other = await startHttp(tmp.dir, ["--host", "0.0.0.0"]);
    try {
      assert.match(other.base, /^http:\/\/0\.0\.0\.0:\d+$/);
    } finally {
      await other.stop();
    }
  });
});
