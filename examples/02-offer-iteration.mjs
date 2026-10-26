/**
 * Example 2 — iterating an offer until it clears the kill criterion.
 *
 * Scenario: a consultant drafts an offer for a website audit. plan_campaign's
 * first kill criterion says any offer below 45/100 means STOP. Each draft
 * below fixes the flags the previous score reported, so you can see which
 * words move which dimension.
 *
 * Run: npm run build && node examples/02-offer-iteration.mjs
 */
import { connectStdio, call, heading, printScore } from "./_client.mjs";

const { client } = await connectStdio();

const drafts = [
  ["Draft 1 — the usual first draft", "World-class, cutting-edge website solutions that leverage synergy."],
  ["Draft 2 — say what it is and what it costs", "A website speed audit, $149, delivered as a written report."],
  [
    "Draft 3 — name who it is for and why it differs",
    "A website speed audit for Shopify store owners, $149 — unlike plugin scanners, a human tests your checkout on a real phone. Written report in 48 hours.",
  ],
  [
    "Draft 4 — add risk reversal and a call to action",
    "A website speed audit for Shopify store owners, $149 — unlike plugin scanners, a human tests your checkout on a real phone because that is where carts die. " +
      "Full refund if we find nothing you can fix. Book yours today; 5 slots left this week.",
  ],
];

const scores = [];
for (const [label, offer] of drafts) {
  heading(label);
  console.log(`offer: ${offer}`);
  const { json } = await call(client, "score_offer", { offer });
  printScore(json);
  scores.push([label, json.score, json.grade]);
}

heading("Summary vs. kill criterion (STOP below 45)");
for (const [label, score, grade] of scores) {
  console.log(`${label.padEnd(50)} ${String(score).padStart(3)}/100 ${grade}  ${score < 45 ? "STOP — rework" : "ok to plan"}`);
}

await client.close();
