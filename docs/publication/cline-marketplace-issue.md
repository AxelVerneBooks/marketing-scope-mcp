# Cline Marketplace submission — ready to paste (repo: `cline/mcp-marketplace`)

Built 2026-10-20, modeled on the research-scope-mcp packet against the official
template [`.github/ISSUE_TEMPLATE/mcp-server-submission.yml`](https://github.com/cline/mcp-marketplace/blob/main/.github/ISSUE_TEMPLATE/mcp-server-submission.yml)
(5 fields: repo URL · logo · installation-testing checkboxes · additional info).
**Issue title** uses the template's prefix: `[Server Submission]: marketing-scope-mcp`.

**Pre-paste checklist (already done 2026-10-20):**
1. Repo public: `gh repo view` → PUBLIC, description match, server.json resolves.
2. Logo pushed: `docs/logo/logo-400.png` (400×400 PNG verified; regenerate via
   `docs/logo/build_logo.py`).
3. **Fresh-clone install verified this day:** clone → `npm ci` → `npm run build`
   (exit 0) → sessionless HTTP `initialize` + `tools/call plan_campaign` →
   serverInfo `marketing-scope-mcp`, `killCriteria` in response.
4. Registry: v0.1.0 **published and active** on the official MCP registry
   (verified same day via `/v0.1/servers?search=`).

---

## FIELD 1 · GitHub Repository URL

```
https://github.com/AxelVerneBooks/marketing-scope-mcp
```

## FIELD 2 · Logo Image

Drag-and-drop `docs/logo/logo-400.png` from this repo — verified 400×400 PNG
(cream field, ink border, five-bar offer-score gauge + green check gate).
Direct repo link, if you prefer a URL over drag-and-drop:

```
https://github.com/AxelVerneBooks/marketing-scope-mcp/raw/main/docs/logo/logo-400.png
```

## FIELD 3+4 · Installation Testing (both checkboxes — honest status in []:)

- [x] I have tested that Cline can successfully set up this server using only the
      README.md and/or llms-install.md file
- [x] The server is stable and ready for public use

> Honesty note: verified via the fresh-clone path above (README install section:
> Node ≥ 20, clone + `npm ci && npm run build`, one-block mcpServers config,
> verify ask = `plan_campaign("verify install")` returns JSON with
> `offerTargets` + `killCriteria`). The npm package `marketing-scope-mcp` is NOT
> yet published — say so explicitly in Additional Information so the
> marketplace team install-tests via the repo-clone route, which is what we
> verified.

## FIELD 5 · Additional Information

```
marketing-scope-mcp — a marketing pre-flight workflow server: plan_campaign(objective)
produces a pre-spend plan with offer targets, channel targets, anti-targets and kill
criteria; score_offer(offer, audience?) grades ONE offer statement on an explainable
0–100 scale (clarity 20 / audience specificity 24 / differentiation 20 / proof & risk
reversal 20 / call to action 16; grades A ≥ 80, B ≥ 65, C ≥ 45, D < 45) with
per-dimension evidence; build_plan(goal, offers) writes a campaign-plan shell and
REJECTS any offer that was never scored; check_plan(plan_id | plan_path) verifies
every tactic cites a scored offer ([O1]-style registry refs) AND names a success
metric — violations return as an error list, never a pass, by design.

Setup requirements:
- Node.js ≥ 20. Install (pre-publication route, verified): clone the repo,
  `npm ci && npm run build`, then the one-block mcpServers config in the README.
  npm package `marketing-scope-mcp` is in progress — not live at submission time.
- Two transports: stdio (default; no ports) or stateless Streamable HTTP
  (`--http --port 3002`),
- No API keys, no network calls, no telemetry. Offer/plan data stays local:
  plans written under MARKETING_SCOPE_DATA_DIR (default ./data/campaigns).
  The HTTP listener is unauthenticated — keep it loopback or auth-proxy it.

Special notes for Marketplace users:
- Shortest verification: call plan_campaign("verify install") and expect JSON
  containing offerTargets + killCriteria.
- The 0.1.0 server.json is already **published and active** on the official MCP
  registry (`io.github.AxelVerneBooks/marketing-scope-mcp`, published 2026-10-20,
  2025-12-11 schema).
- License: MIT. No telemetry. Local-only by default.
```

---

## Post-submission notes (do not paste)

- Watch for the maintainer's scan; it runs against the README's installability.
- When the npm package publishes, add ONE follow-up comment updating the
  "npm in progress" line (per Track C precedent, directory listings that
  install-and-run on the first try get preserved).
- Per the Track C guardrail learned on issue #3028: after posting, next touch is
  a maintainer reply or ~1 month, whichever first.
