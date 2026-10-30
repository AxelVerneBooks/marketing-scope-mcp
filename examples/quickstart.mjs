/**
 * Quickstart — drives the README "Example session" end to end against a real
 * marketing-scope-mcp server over stdio and fails loudly if any documented
 * behaviour has drifted:
 *   plan_campaign → score_offer → build_plan (unscored rejected) → check_plan (FAIL → PASS)
 *
 * Run (from a clone, after `npm install && npm run build`):
 *   node examples/quickstart.mjs                               # launches node dist/index.js
 *   node examples/quickstart.mjs -- npx -y marketing-scope-mcp # launches the published package
 *
 * Plans are written to a throwaway temp dir (MARKETING_SCOPE_DATA_DIR).
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const sep = process.argv.indexOf("--");
const [command, ...args] =
  sep >= 0 ? process.argv.slice(sep + 1) : [process.execPath, join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js")];

// The same offer text the README shows; it must keep scoring an A.
const OFFER =
  "The Working Farm Ledger for small-hold farmers who sell at markets: 12 print-ready ledgers (letter + A4 PDFs), only $19. Unlike generic ledgers, you log a season in 40 records because it was built by a market grower. 30-day money-back guarantee. Start today.";

const dataDir = mkdtempSync(join(tmpdir(), "marketing-scope-quickstart-"));
const transport = new StdioClientTransport({
  command,
  args,
  env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir },
  stderr: "inherit",
});
const client = new Client({ name: "marketing-scope-quickstart", version: "0.0.0" });

/** Call a tool and return its text payload (JSON-parsed when possible). */
async function call(name, args) {
  const res = await client.callTool({ name, arguments: args });
  const text = res.content?.[0]?.text ?? "";
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {}
  return { isError: res.isError === true, text, body };
}

try {
  console.log(`> launching: ${[command, ...args].join(" ")}`);
  await client.connect(transport);
  const { name, version } = client.getServerVersion();
  console.log(`connected to ${name} ${version}`);

  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(tools, ["build_plan", "check_plan", "plan_campaign", "score_offer"]);
  console.log(`tools: ${tools.join(", ")}`);

  const plan = await call("plan_campaign", { objective: "sell 30 copies of the build manual in 30 days" });
  assert.ok(plan.body.killCriteria.some((k) => k.includes("below 45/100")), "kill criteria missing the 45/100 stop");
  console.log(`\nplan_campaign → ${plan.body.offerTargets.length} offer targets, ${plan.body.channelTargets.length} channel targets, ${plan.body.killCriteria.length} kill criteria`);
  console.log(`  kill: ${plan.body.killCriteria[0]}`);

  const scored = await call("score_offer", { offer: OFFER });
  console.log(`\nscore_offer → ${scored.body.score}/100 (${scored.body.grade})`);
  for (const d of scored.body.breakdown) console.log(`  ${d.dimension.padEnd(22)} ${String(d.points).padStart(2)}/${d.max}  ${d.notes}`);
  assert.equal(scored.body.grade, "A", `README offer should grade A, got ${scored.body.score} (${scored.body.grade})`);

  const refused = await call("build_plan", { goal: "Farm ledger launch", offers: ["an offer nobody ever scored"] });
  assert.ok(refused.isError && /never scored/.test(refused.text), "unscored offer was not rejected");
  console.log("\nbuild_plan(unscored offer) → rejected: offer was never scored");

  const built = await call("build_plan", { goal: "Farm ledger launch", offers: [OFFER] });
  assert.ok(!built.isError, built.text);
  const planPath = built.text.match(/saved to (\S+\.md)/)?.[1];
  assert.ok(planPath, "build_plan did not report the plan path");
  console.log(`build_plan → ${planPath}`);

  const empty = await call("check_plan", { plan_path: planPath });
  assert.equal(empty.body.pass, false);
  console.log(`\ncheck_plan(empty shell) → ${empty.body.verdict}`);

  // Write one cited, measured tactic and one orphan tactic into the channel briefs.
  let md = readFileSync(planPath, "utf8");
  md = md.replace(
    "### Email\n",
    "### Email\n- Send a 3-email launch sequence to the market-grower list introducing [O1]; success metric: 3% click-through\n- Boost a generic awareness post to everyone in the region every weekend\n"
  );
  writeFileSync(planPath, md);
  const mixed = await call("check_plan", { plan_path: planPath });
  assert.equal(mixed.body.pass, false);
  assert.equal(mixed.body.orphanTactics.length, 1);
  console.log(`check_plan(1 orphan tactic) → ${mixed.body.verdict}`);

  writeFileSync(planPath, md.replace(/- Boost a generic awareness post.*\n/, ""));
  const ok = await call("check_plan", { plan_path: planPath });
  assert.equal(ok.body.pass, true, JSON.stringify(ok.body));
  console.log(`check_plan(fixed) → ${ok.body.verdict}`);

  console.log("\nQuickstart OK");
} finally {
  await client.close().catch(() => {});
  rmSync(dataDir, { recursive: true, force: true });
}
