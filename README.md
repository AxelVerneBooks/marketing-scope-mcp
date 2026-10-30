# marketing-scope-mcp

**Campaign pre-flight for AI agents.** Plan the campaign, score the offers
explainably, build a registry-backed plan, then verify every tactic cites a
scored offer **and** names a success metric — *before* any money is spent.

The sibling of [`research-scope-mcp`](https://github.com/AxelVerneBooks/research-scope-mcp)
(sources → citations) applied to marketing: tactics → scored offers.

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
   proof & risk reversal 20 / call to action 16. Grades: A ≥ 80, B ≥ 65,
   C ≥ 45, D < 45. Every dimension returns **with its evidence**, so the
   number is auditable, not a vibe.
3. **`build_plan(goal, offers[])`** — writes a campaign-plan shell (strategy,
   channel briefs, numbered offer registry, scoring appendix) and **rejects
   any offer that was never scored**, naming them.
4. **`check_plan(plan_id | plan_path)`** — every tactic must cite a registry
   offer (`[O1]`-style) and name a success metric. Violations come back as an
   error list — never a silent pass.

## Quickstart

One command, Node ≥ 20 (no clone, no build):

```bash
npx -y marketing-scope-mcp                       # stdio — what MCP clients launch
npx -y marketing-scope-mcp --http --port 3002    # Streamable HTTP at http://127.0.0.1:3002/mcp
```

This is a Node package, so `npx` is the single-command path. There is no
Python package, so `uvx` does not apply.

Then register it with your client:

```bash
claude mcp add marketing-scope -- npx -y marketing-scope-mcp      # Claude Code
```

Cursor (`.cursor/mcp.json`) or Claude Desktop (`claude_desktop_config.json`):

```json
{ "mcpServers": { "marketing-scope": { "command": "npx", "args": ["-y", "marketing-scope-mcp"] } } }
```

### See the whole workflow run

[`examples/quickstart.mjs`](examples/quickstart.mjs) drives the full
plan → score → build → check loop against a real server and prints each
step (CI runs it on every push, so the output below can't drift):

```bash
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp && npm install && npm run build
node examples/quickstart.mjs                                  # against your local build
node examples/quickstart.mjs -- npx -y marketing-scope-mcp    # against the published package
```

## Other ways to install

```bash
npm install -g marketing-scope-mcp     # puts `marketing-scope-mcp` on your PATH
claude mcp add marketing-scope -- marketing-scope-mcp
```

From source (after the clone + build above), point clients at the built
entry point by absolute path:

```bash
claude mcp add marketing-scope -- node "$PWD/dist/index.js"
node dist/index.js --http --port 3002        # serves MCP at http://127.0.0.1:3002/mcp
```

### Docker

```bash
docker build -t marketing-scope-mcp -f docker/Dockerfile .
docker run -d --name marketing-scope -p 3002:3002 marketing-scope-mcp
# MCP at http://127.0.0.1:3002/mcp; plans persist in the /app/data volume
```

Data dir (plans on disk) defaults to `./data` under the server's working
directory; override with `MARKETING_SCOPE_DATA_DIR`.

## Example session

Real output from `node examples/quickstart.mjs`, trimmed:

```text
> plan_campaign(objective: "sell 30 copies of the build manual in 30 days")
  → 2 offer targets, 3 channel targets, 3 kill criteria, incl.
    "Every scored offer below 45/100 -> STOP; rework the offer before spending anything on traffic"

> score_offer(offer: "The Working Farm Ledger for small-hold farmers who sell at
   markets: 12 print-ready ledgers (letter + A4 PDFs), only $19. Unlike generic
   ledgers, you log a season in 40 records because it was built by a market
   grower. 30-day money-back guarantee. Start today.")
  → 82/100 (A)
    offer clarity          20/20  price or explicit 'free' present
    audience specificity   24/24  named segment found in offer/audience
    differentiation        16/20  16/20 from uniqueness/mechanism/contrast markers
    proof & risk reversal  12/20  guarantee or social-proof evidence found
    call to action         10/16  imperative CTA present

> build_plan(goal, offers: ["an offer nobody ever scored"])  → error: never scored
> build_plan(goal, offers: [that exact offer text])          → campaign-<id>.md shell
> check_plan(plan_path)   → FAIL — no tactics written yet
  # add "- Send a 3-email launch sequence ... introducing [O1]; success metric: 3% click-through"
  # plus one uncited tactic
> check_plan(plan_path)   → FAIL — fix orphan/unmeasured tactics above before spending money
  # remove the uncited tactic
> check_plan(plan_path)   → PASS — every tactic cites a scored offer and names a metric
```

## License

MIT — see [LICENSE](LICENSE).

By [Axel Verne](https://axelverne.com), author of *MCP for Business*.

---

Prefer it prebuilt? [Campaign Pre-Flight Starter Kit](https://alohahilo.gumroad.com/l/marketing-scope-starter?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-pointer) —
the built server plus one worked campaign run and the 4-step setup, $9,
MIT, free lifetime updates. The [one-page scoring rubric](https://alohahilo.gumroad.com/l/offer-scoring-checklist?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-checklist-fallback)
it enforces is free, no email wall. (Disclosure: I built and sell both;
these are my links.)
