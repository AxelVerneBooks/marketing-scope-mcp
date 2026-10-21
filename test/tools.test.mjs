/** Tool-level tests: an in-process MCP client drives the real server over the SDK's in-memory transport. */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { createState, offerIdFor } from "../dist/server.js";
import { connectInProcess, json, text, tempDir, withTactics, STRONG_OFFER, WEAK_OFFER } from "./helpers.mjs";

const TACTIC = "- Send a 3-email launch sequence to the list introducing [O1]; success metric: 3% click-through";

let tmp;
let mcp;
before(async () => {
  tmp = tempDir();
  mcp = await connectInProcess(createState({ dataDir: tmp.dir }));
});
after(async () => {
  await mcp.close();
  tmp.cleanup();
});

const buildPlan = async (offers, goal = "Farm ledger pre-launch") => {
  const built = text(await mcp.call("build_plan", { goal, offers }));
  const [, id, path] = built.match(/Campaign shell (\S+) saved to (\S+\.md)/);
  return { built, id, path };
};

test("tools/list exposes the four workflow tools with schemas and annotations", async () => {
  const { tools } = await mcp.client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["build_plan", "check_plan", "plan_campaign", "score_offer"]);
  for (const t of tools) {
    assert.equal(t.inputSchema.type, "object");
    assert.ok(t.annotations);
  }
});

test("server reports its name and version", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.deepEqual(mcp.client.getServerVersion(), { name: "marketing-scope-mcp", version: pkg.version });
});

describe("plan_campaign", () => {
  test("returns targets and kill criteria", async () => {
    const plan = json(await mcp.call("plan_campaign", { objective: "sell 30 copies in 30 days" }));
    assert.equal(plan.objective, "sell 30 copies in 30 days");
    assert.ok(plan.offerTargets.length >= 2);
    assert.ok(plan.killCriteria.length >= 3);
  });
  test("uses every audience hint, not just the first two", async () => {
    const plan = json(await mcp.call("plan_campaign", { objective: "launch", audience_hints: ["r/homestead", "farm newsletter", "market Facebook group"] }));
    const whats = plan.channelTargets.map((c) => c.what);
    for (const h of ["r/homestead", "farm newsletter", "market Facebook group"]) assert.ok(whats.includes(h), h);
  });
  test("rejects a too-short objective", async () => {
    assert.equal((await mcp.call("plan_campaign", { objective: "x" })).isError, true);
  });
});

describe("score_offer", () => {
  test("grades strong vs vague offers", async () => {
    const strong = json(await mcp.call("score_offer", { offer: STRONG_OFFER }));
    assert.equal(strong.grade, "A");
    assert.equal(strong.breakdown.length, 5);
    const vague = json(await mcp.call("score_offer", { offer: WEAK_OFFER }));
    assert.ok(vague.score < 45);
  });
  test("offer ids are stable per offer text (idempotent re-scoring)", async () => {
    const a = json(await mcp.call("score_offer", { offer: STRONG_OFFER }));
    const b = json(await mcp.call("score_offer", { offer: `  ${STRONG_OFFER}  ` }));
    assert.equal(a.offerId, b.offerId);
    assert.equal(a.offerId, offerIdFor(STRONG_OFFER));
    assert.match(a.offerId, /^o-[0-9a-f]{8}$/);
  });
  test("the explicit audience is folded into scoring", async () => {
    const s = json(await mcp.call("score_offer", { offer: "A ledger, only $19. Start today.", audience: "small-hold market farmers" }));
    assert.ok(!s.flags.includes("unclear-audience"));
  });
  test("rejects too-short offers", async () => {
    assert.equal((await mcp.call("score_offer", { offer: "short" })).isError, true);
  });
});

describe("build_plan + check_plan", () => {
  test("refuses unscored offers and names them", async () => {
    const r = await mcp.call("build_plan", { goal: "Bad", offers: ["An offer nobody ever scored, $5"] });
    assert.equal(r.isError, true);
    assert.match(text(r), /never scored[\s\S]*nobody ever scored/);
  });

  test("accepts offer text or offerId and de-duplicates", async () => {
    const { offerId } = json(await mcp.call("score_offer", { offer: STRONG_OFFER }));
    const { path } = await buildPlan([STRONG_OFFER, offerId, ` ${STRONG_OFFER}`]);
    assert.ok(path.startsWith(join(tmp.dir, "campaigns")));
    const md = readFileSync(path, "utf8");
    assert.match(md, /\[O1\] The Working Farm Ledger/);
    assert.doesNotMatch(md, /^\[O2\]/m);
  });

  test("check_plan by id reads the edited file on disk, not the stale shell (regression)", async () => {
    await mcp.call("score_offer", { offer: STRONG_OFFER });
    const { id, path } = await buildPlan([STRONG_OFFER]);
    const fresh = json(await mcp.call("check_plan", { plan_id: id }));
    assert.equal(fresh.pass, false);
    assert.match(fresh.verdict, /no tactics/);

    writeFileSync(path, withTactics(readFileSync(path, "utf8"), [TACTIC]));
    const edited = json(await mcp.call("check_plan", { plan_id: id }));
    assert.equal(edited.pass, true, JSON.stringify(edited));
    assert.equal(json(await mcp.call("check_plan", { plan_path: path })).plan, path);
  });

  test("check_plan reports orphan, unmeasured and unknown-offer tactics", async () => {
    await mcp.call("score_offer", { offer: STRONG_OFFER });
    const { path } = await buildPlan([STRONG_OFFER]);
    writeFileSync(
      path,
      withTactics(readFileSync(path, "utf8"), [
        TACTIC,
        "- Post in r/homestead about the launch; metric: 20 upvotes",
        "- Run retargeting ads pointing at [O1] all month long",
        "- Cross-promote with a partner newsletter using [O3]; metric: 40 signups",
      ])
    );
    const r = json(await mcp.call("check_plan", { plan_path: path }));
    assert.equal(r.pass, false);
    assert.equal(r.tacticsFound, 4);
    assert.equal(r.orphanTactics.length, 1);
    assert.equal(r.unmeasuredTactics.length, 1);
    assert.deepEqual(r.unknownOfferRefs.map((t) => t.unknown), [["O3"]]);
  });

  test("check_plan argument errors", async () => {
    assert.equal((await mcp.call("check_plan", {})).isError, true);
    const unknown = await mcp.call("check_plan", { plan_id: "nope1234" });
    assert.equal(unknown.isError, true);
    assert.match(text(unknown), /Unknown plan_id/);
    assert.equal((await mcp.call("check_plan", { plan_id: "../../etc/passwd" })).isError, true);
    const missing = await mcp.call("check_plan", { plan_path: join(tmp.dir, "missing.md") });
    assert.match(text(missing), /not found/);
  });

  test("plan ids survive a restart: a new state finds the saved plan on disk", async () => {
    await mcp.call("score_offer", { offer: STRONG_OFFER });
    const { id } = await buildPlan([STRONG_OFFER]);
    const other = await connectInProcess(createState({ dataDir: tmp.dir }));
    try {
      const r = await other.call("check_plan", { plan_id: id });
      assert.notEqual(r.isError, true, text(r));
    } finally {
      await other.close();
    }
  });

  test("restricted state refuses plan paths outside the data dir", async () => {
    const outside = tempDir();
    const restricted = await connectInProcess(createState({ dataDir: tmp.dir, restrictPathsToDataDir: true }));
    try {
      const file = join(outside.dir, "p.md");
      writeFileSync(file, "# x");
      const r = await restricted.call("check_plan", { plan_path: file });
      assert.equal(r.isError, true);
      assert.match(text(r), /inside the server data directory/);
    } finally {
      await restricted.close();
      outside.cleanup();
    }
  });
});
