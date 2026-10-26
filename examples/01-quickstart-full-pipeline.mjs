/**
 * Example 1 — the whole discipline in one run.
 *
 * Scenario: a solo seller wants 40 sales of a $29 bookkeeping-template pack
 * in 30 days. Plan → score the offer → build the plan shell → write tactics →
 * check_plan gates the plan before any money is spent.
 *
 * Run: npm run build && node examples/01-quickstart-full-pipeline.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { connectStdio, call, heading, printScore } from "./_client.mjs";

const { client } = await connectStdio();

heading("1. plan_campaign");
const plan = await call(client, "plan_campaign", {
  objective: "sell 40 copies of the freelancer bookkeeping template pack in 30 days",
  audience_hints: ["existing newsletter (1,200 subscribers)", "r/freelance", "Indie Hackers"],
});
console.log(JSON.stringify(plan.json, null, 2));

heading("2. score_offer");
const offer =
  "The Freelancer Books Kit: 9 spreadsheet templates for freelancers who invoice in USD, only $29 — " +
  "unlike generic accounting software it closes your month in 20 minutes because every sheet is pre-linked. " +
  "30-day money-back guarantee. Download today.";
const scored = await call(client, "score_offer", { offer, audience: "for freelancers who do their own books" });
printScore(scored.json);

heading("3. build_plan");
const built = await call(client, "build_plan", { goal: "Freelancer Books Kit — 40 sales in 30 days", offers: [offer] });
const planPath = built.text.match(/saved to (\S+\.md)/)[1];
console.log(built.text);

heading("4. check_plan on the empty shell");
console.log((await call(client, "check_plan", { plan_path: planPath })).text);

heading("5. write tactics (what the agent or you would edit in), then check_plan again");
let md = readFileSync(planPath, "utf8");
md = md
  .replace(
    "### Email\n",
    "### Email\n- Send a 3-email launch sequence to the newsletter introducing [O1]; success metric: 40% open rate, 4% click-through, 15 sales\n"
  )
  .replace(
    "### Community\n",
    "### Community\n- Post a month-end-close walkthrough in r/freelance linking [O1]; success metric: 300 visits, 8 sales\n"
  )
  .replace(
    "### SEO / content\n",
    "### SEO / content\n- Publish a 'freelancer bookkeeping spreadsheet' guide page with [O1] as the CTA; target: 500 organic visits in 30 days\n"
  );
writeFileSync(planPath, md, "utf8");
console.log((await call(client, "check_plan", { plan_path: planPath })).text);

await client.close();
