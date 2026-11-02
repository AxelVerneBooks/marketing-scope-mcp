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

```bash
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp && npm install && npm run build
npm run doctor                     # or: node dist/index.js doctor
claude mcp add marketing-scope -- node "$PWD/dist/index.js"
```

`doctor` checks your environment and prints a fix for anything wrong:

| Check | Fails / warns when | What it tells you to do |
|---|---|---|
| Node.js version | Node < 20 | install Node ≥ 20, rebuild |
| Environment variables | `PORT` isn't 1–65535, or `MARKETING_SCOPE_DATA_DIR` is set but empty | fix or unset — **none are required** |
| Data directory | `./data` (or `MARKETING_SCOPE_DATA_DIR`) can't be created/written | point the env var at a writable dir / mount a volume |
| Network | *(warning only)* the `--http` port is taken | free the port or pass `--port` — stdio mode is unaffected |

There are no API keys and no outbound network calls: scoring and plan checks
run entirely locally, so the network check only covers the local HTTP port
(`node dist/index.js doctor --port 8080` to check a non-default one). Exit
code is `1` if any check fails, `0` otherwise — usable in CI or a Docker
`HEALTHCHECK`-style preflight.

```text
marketing-scope-mcp 0.1.0 — doctor

✔ [PASS] Node.js version: v22.11.0 (need >= 20)
✔ [PASS] Environment variables: none required (optional: PORT, MARKETING_SCOPE_DATA_DIR)
✖ [FAIL] Data directory: /srv/data is not writable (EACCES)
    → Point MARKETING_SCOPE_DATA_DIR at a directory you can write to (e.g. `export MARKETING_SCOPE_DATA_DIR="$HOME/.marketing-scope"`), ...
✔ [PASS] Network: no outbound APIs called; HTTP port 3002 is free for `--http` mode

1 check(s) failed. Fix the items marked → above and re-run `npm run doctor`.
```

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

---

Prefer it prebuilt? [Campaign Pre-Flight Starter Kit](https://alohahilo.gumroad.com/l/marketing-scope-starter?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-pointer) —
the built server plus one worked campaign run and the 4-step setup, $9,
MIT, free lifetime updates. The [one-page scoring rubric](https://alohahilo.gumroad.com/l/offer-scoring-checklist?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-checklist-fallback)
it enforces is free, no email wall. (Disclosure: I built and sell both;
these are my links.)
