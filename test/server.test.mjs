/**
 * Integration test — launches the built stdio server and drives the full workflow:
 * plan_campaign → score_offer → build_plan → check_plan.
 * Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";

const DATA_DIR = mkdtempSync(join(tmpdir(), "msmcp-test-"));

/** Minimal MCP stdio client for the test: JSON-RPC line responses per request id. */
class StdioMcpClient {
  #child;
  #buf = "";
  #pending = new Map();
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
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue; // tolerate interleaved non-JSON lines (banner noise)
        }
        if (msg.id !== undefined && this.#pending.has(msg.id)) {
          this.#pending.get(msg.id)(msg);
          this.#pending.delete(msg.id);
        }
      }
    });
  }
  static spawn() {
    const child = spawn(process.execPath, [join(process.cwd(), "dist", "index.js")], {
      cwd: process.cwd(),
      env: { ...process.env, MARKETING_SCOPE_DATA_DIR: DATA_DIR },
      stdio: ["pipe", "pipe", "inherit"],
    });
    return new this(child);
  }
  request(method, params, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1e9);
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
  async close() {
    this.#child.stdin.end();
    this.#child.kill();
    await once(this.#child, "exit").catch(() => {});
  }
}

/** Pull the first JSON text payload out of an MCP tool result. */
function textPayload(result) {
  assert.ok(result?.content?.[0]?.text, `no text content in ${JSON.stringify(result)}`);
  return result.content[0].text;
}

test("initialize + tools/list exposes the four workflow tools", async () => {
  const client = StdioMcpClient.spawn();
  try {
    const init = await client.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test-client", version: "0.0.1" },
    });
    assert.equal(init.serverInfo.name, "marketing-scope-mcp");
    client.notify("notifications/initialized", {});
    const tools = await client.request("tools/list", {});
    const names = tools.tools.map((t) => t.name).sort();
    assert.deepEqual(names, ["build_plan", "check_plan", "plan_campaign", "score_offer"]);
  } finally {
    await client.close();
  }
});

test("stateless HTTP transport: second request works with no session (regression: transport-per-request)", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "msmcp-http-test-"));
  const port = 42000 + Math.floor(Math.random() * 5000);
  const child = spawn(
    process.execPath,
    [join(process.cwd(), "dist", "index.js"), "--http", "--port", String(port)],
    { cwd: process.cwd(), env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir }, stdio: ["ignore", "ignore", "inherit"] }
  );
  try {
    const base = `http://127.0.0.1:${port}/mcp`;
    let up = false;
    for (let i = 0; i < 40 && !up; i++) {
      try {
        await fetch(base, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 0, method: "ping", params: {} }) });
        up = true;
      } catch {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    assert.ok(up, `HTTP server on ${port} never opened`);

    const post = async (payload) =>
      fetch(base, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify(payload),
      });
    const parse = async (res) => {
      const t = await res.text();
      const dataLine = t.split("\n").find((l) => l.startsWith("data:"));
      return JSON.parse(dataLine ? dataLine.slice(5).trim() : t);
    };

    const init = await parse(await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "http-test", version: "0" } } }));
    assert.equal(init.result?.serverInfo?.name, "marketing-scope-mcp");

    // THE regression: further requests must NOT 500, even without any session
    const listed = await parse(await post({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }));
    assert.equal(listed.result?.tools?.length, 4, `tools/list broke: ${JSON.stringify(listed)}`);
    const call = await parse(await post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "plan_campaign", arguments: { objective: "http regression probe" } } }));
    const plan = JSON.parse(call.result.content[0].text);
    assert.ok(plan.killCriteria.length >= 1);
    assert.ok(plan.offerTargets.length >= 1);
  } finally {
    child.kill();
    await once(child, "exit").catch(() => {});
    rmSync(dataDir, { recursive: true, force: true });
  }
});

test("invalid arguments come back as readable isError results for every tool (not raw exceptions)", async () => {
  const client = StdioMcpClient.spawn();
  try {
    await client.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test-client", version: "0.0.1" },
    });
    client.notify("notifications/initialized", {});
    const call = (name, args) => client.request("tools/call", { name, arguments: args });
    const expectError = async (name, args, pattern) => {
      const res = await call(name, args);
      assert.equal(res.isError, true, `${name}(${JSON.stringify(args)}) should be an error: ${JSON.stringify(res)}`);
      const text = textPayload(res);
      assert.match(text, pattern);
      assert.doesNotMatch(text, /MCP error -32602|"code":|invalid_type|at Object\.|\n\s+at /, `raw error leaked: ${text}`);
      return text;
    };

    // tools/list advertises the strict schemas
    const tools = await client.request("tools/list", {});
    for (const t of tools.tools) {
      assert.equal(t.inputSchema.additionalProperties, false, `${t.name} schema should be strict`);
    }

    // missing required fields
    await expectError("plan_campaign", {}, /^Invalid arguments for plan_campaign:\n- "objective" is required/);
    await expectError("score_offer", {}, /"offer" is required/);
    await expectError("build_plan", {}, /"goal" is required[\s\S]*"offers" is required/);
    await expectError("check_plan", {}, /check_plan needs a plan to check/);

    // malformed input
    await expectError("plan_campaign", { objective: "ok objective", audience_hints: "r/sysadmin" }, /"audience_hints" must be an array of strings/);
    await expectError("score_offer", { offer: "too short" }, /"offer" is too short/);
    await expectError("score_offer", { offr: "typo in the parameter name here" }, /does not accept parameter\(s\) "offr"/);
    await expectError("build_plan", { goal: "Launch", offers: "one offer not in an array" }, /A single offer still goes inside an array/);
    await expectError("check_plan", { plan_id: 42 }, /"plan_id" must be a string/);

    // handler-level problems are explained too
    await expectError("check_plan", { plan_id: "deadbeef" }, /No plan with id "deadbeef"/);
    await expectError("check_plan", { plan_path: join(DATA_DIR, "does-not-exist.md") }, /Plan file not found/);
    await expectError("check_plan", { plan_path: DATA_DIR }, /is a directory/);

    // and valid input still works
    const ok = await call("plan_campaign", { objective: "sell 30 copies of the build manual in 30 days" });
    assert.notEqual(ok.isError, true);
  } finally {
    await client.close();
  }
});

test("full workflow: plan → score_offer → build → check (gating enforced)", async () => {
  const client = StdioMcpClient.spawn();
  try {
    await client.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test-client", version: "0.0.1" },
    });
    client.notify("notifications/initialized", {});

    // 1. plan
    const plan = JSON.parse(textPayload(await client.request("tools/call", { name: "plan_campaign", arguments: { objective: "sell 30 copies of the build manual in 30 days" } })));
    assert.ok(plan.offerTargets.length >= 1);
    assert.ok(plan.killCriteria.length >= 1);

    // 2. score_offer — a strong, specific offer should grade high; a vague one low
    const strongOffer = "The Working Farm Ledger: 12 print-ready farm ledgers (letter + A4 PDFs) only $19, includes wall chart — unlike generic ledgers it strips to 40 records a season. Start today.";
    const scored = JSON.parse(textPayload(await client.request("tools/call", { name: "score_offer", arguments: { offer: strongOffer, audience: "for small-hold farmers who sell at markets" } })));
    assert.ok(typeof scored.score === "number" && scored.score > 0, `expected positive score, got ${JSON.stringify(scored)}`);
    assert.ok(Array.isArray(scored.flags));
    assert.ok(scored.breakdown.length === 5);

    const vague = JSON.parse(textPayload(await client.request("tools/call", { name: "score_offer", arguments: { offer: "World-class revolutionary solutions for everyone" } })));
    assert.ok(vague.score < 60, `vague offer should score low, got ${vague.score}`);
    assert.ok(vague.flags.includes("no-price"));

    // 3. build_plan with the scored offer (registry is dual-indexed on exact text)
    const built = textPayload(await client.request("tools/call", {
      name: "build_plan",
      arguments: { goal: "Farm ledger pre-launch", offers: [strongOffer] },
    }));
    assert.match(built, /Offer registry/);
    assert.match(built, /campaign-.*\.md/);

    // unscored offers must be refused
    const refused = await client.request("tools/call", {
      name: "build_plan",
      arguments: { goal: "Bad", offers: ["never scored by score_offer ever"] },
    });
    assert.equal(refused.isError, true);
    assert.match(textPayload(refused), /never scored/);

    // 4. check_plan on the fresh shell — zero tactics yet → FAIL with instructions
    const m = built.match(/saved to (\S+\.md)/);
    assert.ok(m, "built output should name the plan path");
    const check = JSON.parse(textPayload(await client.request("tools/call", { name: "check_plan", arguments: { plan_path: m[1] } })));
    assert.equal(check.pass, false);
    assert.match(check.verdict, /no tactics/i);

    // 5. hand-write a tactic with [O1] + metric → PASS; an unsourced tactic → FAIL
    let markdown = await import("node:fs").then((fs) => fs.readFileSync(m[1], "utf8"));
    markdown = markdown.replace("- <!-- Example: - Send 3-email welcome sequence", "- Send 3-email welcome sequence to list introducing [O1]; success metric: 35% open rate\n- <!-- Example: - Send 3-email welcome sequence");
    await import("node:fs").then((fs) => fs.writeFileSync(m[1], markdown, "utf8"));
    const check2 = JSON.parse(textPayload(await client.request("tools/call", { name: "check_plan", arguments: { plan_path: m[1] } })));
    assert.equal(check2.pass, true, `expected PASS, got ${JSON.stringify(check2)}`);

    const uncited = "- Blast a retargeting campaign at everyone on the internet repeatedly";
    // insert INSIDE the channel briefs section (before ## Offer registry) so it is scored
    const insertAt = markdown.indexOf("## Offer registry");
    assert.ok(insertAt > 0, "shell must contain ## Offer registry");
    markdown = markdown.slice(0, insertAt) + uncited + "\n\n" + markdown.slice(insertAt);
    await import("node:fs").then((fs) => fs.writeFileSync(m[1], markdown, "utf8"));
    const check3 = JSON.parse(textPayload(await client.request("tools/call", { name: "check_plan", arguments: { plan_path: m[1] } })));
    assert.equal(check3.pass, false);
    assert.ok(Array.isArray(check3.orphanTactics) && check3.orphanTactics.length >= 1);
    void uncited;
  } finally {
    await client.close();
  }
  rmSync(DATA_DIR, { recursive: true, force: true });
});
