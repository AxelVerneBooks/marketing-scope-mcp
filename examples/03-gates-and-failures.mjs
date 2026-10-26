/**
 * Example 3 — what the gates refuse, and how to get past them honestly.
 *
 * Scenario: an agent tries to shortcut the workflow. It passes an offer it
 * never scored, then writes a plan with a tactic that cites no offer and one
 * that names no metric. Every shortcut comes back as an explicit error.
 *
 * Run: npm run build && node examples/03-gates-and-failures.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { connectStdio, call, heading } from "./_client.mjs";

const { client } = await connectStdio();

const scoredOffer =
  "Weekly meal-prep plans for nurses on 12-hour shifts, $9/month — unlike generic meal apps, every recipe reheats in a break-room microwave. " +
  "Rated 4.8 by 300+ members. Start your free week today.";
const neverScored = "Meal plans for busy people, sign up now.";

heading("1. build_plan with an offer that was never scored -> refused");
await call(client, "score_offer", { offer: scoredOffer });
const refused = await call(client, "build_plan", { goal: "Shift-nurse meal plans — 100 trials", offers: [scoredOffer, neverScored] });
console.log(`isError: ${refused.isError}`);
console.log(refused.text);

heading("2. build_plan with only scored offers -> shell written");
const built = await call(client, "build_plan", { goal: "Shift-nurse meal plans — 100 trials", offers: [scoredOffer] });
const planPath = built.text.match(/saved to (\S+\.md)/)[1];
console.log(built.text.split("\n")[0]);

heading("3. a plan with an orphan tactic and an unmeasured tactic -> FAIL");
const shell = readFileSync(planPath, "utf8");
const sloppy = shell
  .replace("### Paid\n", "### Paid\n- Run Instagram ads at a broad lookalike audience of everyone interested in food\n")
  .replace("### Social\n", "### Social\n- Post three TikToks a week showing a break-room reheat of [O1] recipes\n");
writeFileSync(planPath, sloppy, "utf8");
console.log((await call(client, "check_plan", { plan_path: planPath })).text);

heading("4. fix both tactics -> PASS");
const fixed = shell
  .replace(
    "### Paid\n",
    "### Paid\n- Run Instagram ads at nurses' union page followers promoting [O1]; success metric: cost per trial under $6, kill after 7 days above\n"
  )
  .replace(
    "### Social\n",
    "### Social\n- Post three TikToks a week showing a break-room reheat of [O1] recipes; success metric: 50 trial sign-ups from bio link\n"
  );
writeFileSync(planPath, fixed, "utf8");
console.log((await call(client, "check_plan", { plan_path: planPath })).text);

heading("5. note: check_plan(plan_id) checks the stored shell, not your edits");
const planId = built.text.match(/Campaign shell (\S+)/)[1];
const byId = await call(client, "check_plan", { plan_id: planId });
console.log(`check_plan(plan_id: "${planId}") -> pass: ${byId.json.pass}, tacticsFound: ${byId.json.tacticsFound}`);
console.log("Pass plan_path after editing the markdown file.");

await client.close();
