# Glama submission packet — marketing-scope-mcp

Built 2026-10-20, modeled on the research-scope-mcp packet (same directory,
same badge scan). Glama grades the REPO, not a form: license / quality /
maintenance badges. Submission needs the **AxelVerneBooks** GitHub session
("Add MCP Server" → authorize → point at the repo) — a signed-in browser step.

## Why the repo grades well already (badge map)

| Glama badge | What it checks | Our evidence |
|---|---|---|
| license | recognizable LICENSE | MIT LICENSE at root |
| quality | reproducible build + tests | `npm run build` (strict TS) + 3/3 integration tests; fresh-clone verified 2026-10-20 |
| maintenance | recent commits + CHANGELOG | dated CHANGELOG.md; 3 commits 2026-10-20 |

Design note carried from Track C: a failing reproducible build blocks
discoverability — keep every dependency bump gated on a green local
build+test. (No Dockerfile yet; Track C needed one for Glama's Dockerfile
follow-up step — add `docker/Dockerfile` mirroring the sibling's if Glama
asks at approval time.)

## Submission steps (needs signed-in browser, ~10 minutes)

1. Sign in to glama.ai with GitHub under **AxelVerneBooks**.
2. Directory → **"Add MCP Server"** → authorize → point it at
   `AxelVerneBooks/marketing-scope-mcp`. The indexer runs the scan itself.
3. Wait for the first index pass; check the listing for the three badges.
   Fix order if one is missing: license → quality → maintenance.
4. Edit the auto-generated listing text to the value prop below rather than
   leaving the README-scrape fallback.

⚠️ Track C lesson: their GitHub OAuth authorize button failed 3× with a
generic "Something went wrong" before succeeding on attempt 4 (anti-clickjack
disabled state enables after ~20s). Retry patiently; don't abandon the flow.

## Metadata (paste when the form asks)

**One-sentence value prop:**

```
marketing-scope-mcp enforces a marketing pre-flight: plan the campaign with
kill criteria, score each offer on an explainable 0-100 rubric, and require
every tactic to cite a scored offer plus a success metric before any spend.
```

**Tool list (one-line each — matches src/index.ts exactly):**

- `plan_campaign(objective, audience_hints?)` — offer/channel targets,
  anti-targets, kill criteria; stops thin-offer launches before spend.
- `score_offer(offer, audience?)` — explainable 0–100 offer-strength score
  (clarity 20 / audience specificity 24 / differentiation 20 / proof & risk
  reversal 20 / CTA 16) with per-dimension evidence and flags.
- `build_plan(goal, offers)` — registry-backed campaign shell; unscored
  offers are rejected with an error naming them.
- `check_plan(plan_id | plan_path)` — every tactic must cite a scored offer
  and name a success metric; violations return as an error list, never a pass.

**Supported transport:** stdio (default; no ports) + stateless Streamable HTTP
(`--http --port 3002`, loopback — keep private or auth-proxy). Auth: none by
default (no env secrets; `MARKETING_SCOPE_DATA_DIR` optional).

**Install/config example:**

```json
{ "mcpServers": { "marketing-scope": { "command": "node", "args": ["/path/to/dist/index.js"] } } }
```

**Logo:** 400×400 PNG at `docs/logo/logo-400.png` (raw URL:
https://github.com/AxelVerneBooks/marketing-scope-mcp/raw/main/docs/logo/logo-400.png — verified same day).
**License:** MIT. **Maintenance contact:** via GitHub issues.

## Post-add verification

- Listing shows: badge trio, four tool descriptions (not truncated stubs),
  working install one-liner.
- If the auto-blurb scraped thin, the edit field is on the listing page itself.
- Registry status already active (verified 2026-10-20) — expect Glama's
  "registry-listed" signal on the next index pass like Track C's.
