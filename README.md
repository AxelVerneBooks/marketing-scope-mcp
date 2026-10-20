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

## Install

Node ≥ 20.

```bash
npm install -g marketing-scope-mcp
# or run from source:
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp && npm install && npm run build
```

### Claude Code

```bash
claude mcp add marketing-scope -- node /path/to/dist/index.js
```

### Cursor (`.cursor/mcp.json`)

```json
{ "mcpServers": { "marketing-scope": { "command": "node", "args": ["/path/to/dist/index.js"] } } }
```

### Streamable HTTP

```bash
node dist/index.js --http --port 3002        # serves MCP at http://127.0.0.1:3002/mcp
```

### Docker

```bash
docker build -t marketing-scope-mcp -f docker/Dockerfile .
docker run -d --name marketing-scope -p 3002:3002 marketing-scope-mcp
# MCP at http://127.0.0.1:3002/mcp; plans persist in the /app/data volume
```

Data dir (plans on disk) defaults to `./data`; override with
`MARKETING_SCOPE_DATA_DIR`.

## Example session

```text
> plan_campaign(objective: "sell 30 copies of the build manual in 30 days")
  → offer targets, channel targets, kill criteria incl.
    "Every scored offer below 45/100 → STOP; rework before spending"

> score_offer(offer: "...12 print-ready farm ledgers only $19, includes
   wall chart — unlike generic ledgers it strips to 40 records a season.
   Start today.")
  → 88/100 (A), breakdown with per-dimension evidence

> build_plan(goal: ..., offers: [that exact text])   # unscored → hard error
> check_plan(...)   # orphan tactics → error list; metric-less → flagged
```

## License

MIT — see [LICENSE](LICENSE).
