# marketing-scope-mcp

[![CI](https://github.com/AxelVerneBooks/marketing-scope-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/AxelVerneBooks/marketing-scope-mcp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/marketing-scope-mcp.svg)](https://www.npmjs.com/package/marketing-scope-mcp)
[![npm downloads](https://img.shields.io/npm/dm/marketing-scope-mcp.svg)](https://www.npmjs.com/package/marketing-scope-mcp)
[![Node.js](https://img.shields.io/node/v/marketing-scope-mcp.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-server-6b4fbb.svg)](https://modelcontextprotocol.io)

**Campaign pre-flight for AI agents.** Plan the campaign, score the offers
explainably, build a registry-backed plan, then verify every tactic cites a
scored offer **and** names a success metric — *before* any money is spent.

The sibling of [`research-scope-mcp`](https://github.com/AxelVerneBooks/research-scope-mcp)
(sources → citations) applied to marketing: tactics → scored offers.

> Built by **[Axel Verne](https://axelverne.com)**, author of ***MCP for Business***.
> More servers, guides and the book at **[axelverne.com](https://axelverne.com)**.

---

## Contents

- [The discipline](#the-discipline)
- [Install](#install)
- [Configure your client](#configure-your-client) — [Claude Desktop](#claude-desktop) · [Claude Code](#claude-code) · [Cursor](#cursor) · [Others](#other-clients)
- [Example session](#example-session)
- [Tools](#tools)
- [Scoring rubric](#scoring-rubric)
- [Running over HTTP / Docker](#running-over-http--docker)
- [Configuration reference](#configuration-reference)
- [Development](#development)

## The discipline

```
plan_campaign  →  score_offer  →  build_plan  →  check_plan
   (strategy)      (0–100)         (shell)        (gate)
```

1. **`plan_campaign(objective)`** — decompose a marketing goal into offer
   targets, channel targets, anti-targets (budget black holes), and kill
   criteria. Kill criteria are hard stops, not suggestions.
2. **`score_offer(offer)`** — one offer statement graded on an explainable
   0–100 scale: clarity 20 / audience specificity 24 / differentiation 20 /
   proof & risk reversal 20 / call to action 16. Every dimension returns
   **with its evidence**, so the number is auditable, not a vibe.
3. **`build_plan(goal, offers[])`** — writes a campaign-plan shell (strategy,
   channel briefs, numbered offer registry, scoring appendix) and **rejects
   any offer that was never scored**, naming them.
4. **`check_plan(plan_id | plan_path)`** — every tactic must cite an offer from
   the plan's registry (`[O1]`-style) and name a success metric. Violations come
   back as an error list — never a silent pass.

## Install

Requires **Node.js 20+**. No API keys, no accounts, no network access needed.

```bash
# run on demand (what the client configs below do)
npx -y marketing-scope-mcp

# or install globally
npm install -g marketing-scope-mcp
marketing-scope-mcp --help
```

From source:

```bash
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp
npm ci && npm run build
node dist/index.js --help
```

## Configure your client

Every client runs the server over **stdio**. Plan shells are written to
`./data/campaigns/` relative to the server's working directory unless you set
[`MARKETING_SCOPE_DATA_DIR`](#configuration-reference) — an absolute path is
recommended so you always know where plans land.

### Claude Desktop

Open **Settings → Developer → Edit Config**, or edit the file directly:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "marketing-scope": {
      "command": "npx",
      "args": ["-y", "marketing-scope-mcp"],
      "env": {
        "MARKETING_SCOPE_DATA_DIR": "/Users/you/marketing-scope"
      }
    }
  }
}
```

Restart Claude Desktop; the four tools appear under the tools (hammer) menu.

### Claude Code

```bash
claude mcp add marketing-scope -- npx -y marketing-scope-mcp

# share it with your team via a checked-in .mcp.json
claude mcp add marketing-scope --scope project -- npx -y marketing-scope-mcp

# with an explicit data directory
claude mcp add marketing-scope -e MARKETING_SCOPE_DATA_DIR="$HOME/marketing-scope" -- npx -y marketing-scope-mcp
```

Check it with `claude mcp list` or `/mcp` inside a session.

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "marketing-scope": {
      "command": "npx",
      "args": ["-y", "marketing-scope-mcp"]
    }
  }
}
```

Then enable it under **Cursor Settings → MCP**.

### Other clients

Any MCP client that can launch a stdio server (Cline, Windsurf, Zed, …) works
with `npx -y marketing-scope-mcp`. Remote clients can use the
[Streamable HTTP transport](#running-over-http--docker).

## Example session

Ask your assistant something like:

> *"I'm launching a $19 printable farm ledger next month. Use marketing-scope to
> plan the launch and check the plan before I spend anything on ads."*

```text
> plan_campaign(objective: "sell 30 copies of the farm ledger in 30 days",
                audience_hints: ["farm newsletter", "r/homestead"])
  → offer targets, channel targets (farm newsletter, r/homestead, one SEO page),
    anti-targets, and kill criteria incl.
    "Every scored offer below 45/100 -> STOP; rework the offer before spending anything on traffic"

> score_offer(offer: "World-class revolutionary solutions for everyone")
  → 0/100 (D) — no-price, no-concrete-deliverable, unclear-audience, no-proof, no-cta …

> score_offer(offer: "The Working Farm Ledger: 12 print-ready ledgers for small-hold
   farmers who sell at markets, only $19. Unlike generic ledgers, it is built by a
   working farmer and trims bookkeeping to 40 records a season. 30-day money-back
   guarantee, used by 1,200+ farmers. Download yours today — launch price ends Friday.")
```

```json
{
  "offerId": "o-c104c393",
  "score": 82,
  "grade": "A",
  "flags": [],
  "breakdown": [
    { "dimension": "offer clarity", "points": 20, "max": 20, "notes": "price or explicit 'free' present; concrete deliverable named" },
    { "dimension": "audience specificity", "points": 18, "max": 24, "notes": "named segment found in offer/audience" },
    { "dimension": "differentiation", "points": 16, "max": 20, "notes": "16/20 from uniqueness/mechanism/contrast markers" },
    { "dimension": "proof & risk reversal", "points": 12, "max": 20, "notes": "guarantee or social-proof evidence found" },
    { "dimension": "call to action", "points": 16, "max": 16, "notes": "imperative CTA present" }
  ]
}
```

```text
> build_plan(goal: "Farm ledger launch", offers: ["o-c104c393"])   # offer text or offerId; unscored → hard error
  → "Campaign shell 7d2e91c4 saved to /Users/you/marketing-scope/campaigns/campaign-7d2e91c4.md"

  (the assistant writes one tactic per bullet under "## Channel briefs", e.g.
   "- Email the farm newsletter a launch note introducing [O1]; success metric: 3% click-through")

> check_plan(plan_id: "7d2e91c4")
```

```json
{
  "plan": "7d2e91c4",
  "pass": false,
  "tacticsFound": 3,
  "tacticsCited": 2,
  "tacticsMeasured": 2,
  "orphanTactics": [{ "tactic": "Post in r/homestead about the launch; metric: 20 upvotes", "tacticId": "T2", "offerRefs": [], "hasMetric": true }],
  "unmeasuredTactics": [{ "tactic": "Run retargeting ads pointing at all month long", "tacticId": "T3", "offerRefs": ["O1"], "hasMetric": false }],
  "unknownOfferRefs": "none",
  "verdict": "FAIL — fix orphan/unmeasured tactics and citations to offers missing from the registry before spending money"
}
```

The assistant fixes or drops the flagged tactics and re-runs `check_plan` until
it passes — only then does the plan go to spend.

## Tools

| Tool | Input | Output |
|---|---|---|
| `plan_campaign` | `objective`, optional `audience_hints[]` | offer/channel targets, anti-targets, kill criteria |
| `score_offer` | `offer`, optional `audience` | 0–100 score + grade + flags + per-dimension evidence, stable `offerId` |
| `build_plan` | `goal`, `offers[]` (scored offer texts or offerIds) | plan shell saved under `<data dir>/campaigns/`, `[On]` numbering |
| `check_plan` | `plan_id` or `plan_path` | pass/fail + orphan, unmeasured and unknown-offer tactic lists |

Behavior worth knowing:

- Scores live **in memory** for the life of the server process: restart the
  server and you must re-run `score_offer` before `build_plan`.
- `check_plan` always reads the plan **file on disk**, so your edits are what get
  checked, and plan ids keep working after a restart.
- A tactic is a bullet (`-`, `*` or `+`) of 30+ characters under
  `## Channel briefs`. It counts as measured when it mentions a `metric`, `KPI`,
  `target:` or `measured by`.

## Scoring rubric

| Dimension | Max | Evidence it looks for |
|---|---|---|
| Offer clarity | 20 | a price token (`$`, `USD`, `% off`, `free`, `pwyw`), a concrete deliverable (guide, template, course, app, …), no buzzwords |
| Audience specificity | 24 | a named segment ("for nurses who work nights", or the `audience` argument), second person, specific counts/details |
| Differentiation | 20 | uniqueness ("only", "unlike", "instead of"), a mechanism ("built by", "because"), a contrast ("vs", "alternative") |
| Proof & risk reversal | 20 | guarantee / refund, testimonials or countable social proof, track record |
| Call to action | 16 | an imperative verb (get, join, download, buy, …), urgency ("ends Friday", "limited") |

Grades: A ≥ 80, B ≥ 65, C ≥ 45, D < 45. The breakdown always sums to the
score. The rubric lives in [src/scoring/offer.ts](src/scoring/offer.ts).

## Running over HTTP / Docker

```bash
npx marketing-scope-mcp --http --port 3002
# MCP endpoint: http://127.0.0.1:3002/mcp   health check: http://127.0.0.1:3002/healthz
```

The HTTP transport is **stateless** Streamable HTTP and binds to `127.0.0.1` by
default. Pass `--host 0.0.0.0` to expose it on your network. It has **no built-in
authentication** — put it behind a reverse proxy that authenticates before exposing
it beyond your machine. Over HTTP, `check_plan` only reads files inside the data
directory.

```bash
docker build -t marketing-scope-mcp -f docker/Dockerfile .
docker run -d --name marketing-scope -p 3002:3002 -v "$PWD/data:/app/data" marketing-scope-mcp
```

The image listens on `0.0.0.0:3002` inside the container, stores plans in the
`/app/data` volume and ships a `HEALTHCHECK` against `/healthz`.

## Configuration reference

| Flag / variable | Default | Meaning |
|---|---|---|
| `--http` | off (stdio) | serve Streamable HTTP at `/mcp` instead of stdio |
| `--port <n>` / `PORT` | `3002` | HTTP port |
| `--host <addr>` / `MARKETING_SCOPE_HOST` | `127.0.0.1` | HTTP bind address |
| `MARKETING_SCOPE_DATA_DIR` | `./data` | where campaign-plan shells are written |
| `--version`, `--help` | | print version / usage |

## Development

```bash
npm ci
npm run lint        # ESLint (typescript-eslint)
npm run typecheck   # tsc --noEmit
npm test            # build + unit, tool-level and end-to-end tests
```

Tools are exercised in-process through the MCP SDK client, and the built CLI is
driven over real stdio and HTTP. CI runs lint, typecheck and tests on Node 20, 22
and 24, plus a Docker build and health check.

## Author

Created and maintained by **Axel Verne**, author of ***MCP for Business*** — a
practical guide to putting Model Context Protocol servers to work.
Books, guides and more MCP servers: **[axelverne.com](https://axelverne.com)**.

## License

MIT — see [LICENSE](LICENSE).
