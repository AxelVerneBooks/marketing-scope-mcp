# mcp.so submission issue — ready to paste (repo: `chatmcp/mcpso`)

Built 2026-10-20, modeled on the research-scope-mcp packet. mcp.so's FAQ says
servers are submitted "by creating a new issue in our GitHub repository"; the
repo is **`chatmcp/mcpso`** (Track C filed issue #5484 there, same format
verified working). Plain issue, no template: **name, description, features,
connection information.**

**Open:** https://github.com/chatmcp/mcpso/issues/new

## Title

```
[Server Submission] marketing-scope-mcp — marketing pre-flight MCP server (plan / score / build / check)
```

## Body (paste everything between the rules)

```
# marketing-scope-mcp

**Repository:** https://github.com/AxelVerneBooks/marketing-scope-mcp
**License:** MIT · **Language:** TypeScript (Node ≥ 20) · **Registry manifest:** server.json, valid against the official MCP registry (2025-12-11 schema)
**Logo (400×400):** https://github.com/AxelVerneBooks/marketing-scope-mcp/raw/main/docs/logo/logo-400.png

## Description

marketing-scope-mcp is a marketing pre-flight workflow server: it enforces the
plan → score → build → check pipeline BEFORE any money is spent. Plan the
campaign with kill criteria ("every scored offer below 45 → STOP, rework before
spending"), grade each offer statement on an explainable 0-100 rubric with
per-dimension evidence, build a registry-backed campaign plan that REJECTS
unscored offers, and CHECK the plan — every tactic must cite a scored offer AND
name a success metric, with violations returned as an error list, never a
silent pass. Sister server to research-scope-mcp (sources → citations), applied
to marketing tactics → scored offers.

## Features (4 tools)

- `plan_campaign(objective, audience_hints?)` — offer targets, channel targets,
  anti-targets (budget black holes), kill criteria
- `score_offer(offer, audience?)` — explainable 0–100 offer-strength score:
  clarity 20 / audience specificity 24 / differentiation 20 / proof & risk
  reversal 20 / call to action 16; grades A ≥ 80, B ≥ 65, C ≥ 45, D < 45;
  every dimension returns WITH its evidence + flags (no-price, no-proof,
  unclear-audience, no-cta, ...)
- `build_plan(goal, offers)` — campaign shell (strategy, channel briefs, offer
  registry, scoring appendix); unscored offers rejected with an error naming them
- `check_plan(plan_id | plan_path)` — orphan tactics (no [On] citation) and
  metric-less tactics return as an error list; PASS requires both, by design

## Connection info

stdio (default, no ports, most clients):

    node dist/index.js          # after clone + npm ci && npm run build

Streamable HTTP (optional, loopback, stateless per-request transport):

    node dist/index.js --http --port 3002   →  http://localhost:3002/mcp

Client config (stdio-capable clients — Claude Code, Cursor, Cline):

    { "mcpServers": { "marketing-scope": { "command": "node", "args": ["/path/to/dist/index.js"] } } }

npm package `marketing-scope-mcp` in progress — the repo-clone route above is
the verified install path (fresh-clone build + HTTP probe verified 2026-10-20).
No API keys, no network calls, no telemetry; plans written under
`MARKETING_SCOPE_DATA_DIR` (default ./data/campaigns).

## Notes

- The registry manifest is **published and active** on the official MCP
  registry: `io.github.AxelVerneBooks/marketing-scope-mcp` v0.1.0 (verified
  2026-10-20 via /v0.1/servers?search= — status "active").
- Verify the install in one ask: call `plan_campaign("verify install")` and
  expect JSON containing `offerTargets` and `killCriteria`.
- Maintenance: issues at the repo; CHANGELOG.md is dated and version-pinned.
```

---

## Post-submission notes (do not paste)

- Filing needs any GitHub account; repo URL must be live (it is).
- When npm publishes, one follow-up comment replaces the "in progress" line
  (Track C precedent: mcp.so indexing pass followed the npm-live update).
- Track C's mcp.so issue #5484 used the same format; early-poke comment helped
  get the indexing pass noticed.
