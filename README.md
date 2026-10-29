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

## Error Handling

Every failure below comes back as a normal MCP tool result with
`isError: true` and a text message — the JSON-RPC call itself succeeds, so
check `isError`, not just for a protocol error. Each case is pinned by
[`test/integration.test.mjs`](test/integration.test.mjs), which runs the built
server with outbound network blocked (the server makes no network calls).

| Case | What you get |
| --- | --- |
| Argument fails the schema (offer under 12 chars, goal under 3, empty `offers`, missing `objective`) | `MCP error -32602: Input validation error: ...` naming the field |
| Unknown tool name | `MCP error -32602: Tool <name> not found` |
| `build_plan` with any offer not scored by `score_offer` | `These offers were never scored — run score_offer on them first:` plus the offending texts. The whole call is refused; nothing is written. |
| `build_plan` offer text differs in case or wording from what was scored | Treated as unscored. Matching is exact after trimming surrounding whitespace. |
| `build_plan` when the data dir can't be created or written (e.g. `MARKETING_SCOPE_DATA_DIR` points at a file) | The raw Node error, e.g. `ENOTDIR: not a directory, mkdir ...` |
| `check_plan` with neither `plan_id` nor `plan_path` | `Provide either plan_id (from build_plan) or plan_path.` |
| `check_plan` with an unknown or expired `plan_id` | The **same** message as above — it does not say the id is unknown. |
| `check_plan` with a `plan_path` that doesn't exist | `Plan file not found: <absolute path>` |
| `check_plan` with a `plan_path` that is a directory | The raw Node error `EISDIR: illegal operation on a directory, read` |
| HTTP: body is not valid JSON | HTTP 400, JSON-RPC error `-32700` (`Parse error: Invalid JSON`) |
| HTTP: `Accept` header lacks `application/json, text/event-stream` | HTTP 406, `Not Acceptable: ...` |

Cases that are **not** errors but often look like one:

- **Restarts lose state.** Scores and plan ids live in memory. After a
  restart, `build_plan` reports previously scored offers as never scored, and
  `check_plan(plan_id)` fails as above. Plan files on disk still check fine by
  `plan_path`.
- **No tactics found → `pass: false`, not an error.** `check_plan` only reads
  bullets under a `## Channel briefs` heading (up to `## Offer registry`), and
  skips bullets shorter than 30 characters. A hand-written file without that
  heading, or with only short bullets, reports `tacticsFound: 0`.
- **Citations aren't checked against the registry.** A tactic citing `[O99]`
  in a plan with one offer still counts as cited and can pass. Verify the
  numbers yourself until this is tightened.

## License

MIT — see [LICENSE](LICENSE).

---

Prefer it prebuilt? [Campaign Pre-Flight Starter Kit](https://alohahilo.gumroad.com/l/marketing-scope-starter?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-pointer) —
the built server plus one worked campaign run and the 4-step setup, $9,
MIT, free lifetime updates. The [one-page scoring rubric](https://alohahilo.gumroad.com/l/offer-scoring-checklist?utm_source=github&utm_medium=readme&utm_campaign=starter-launch&utm_content=readme-checklist-fallback)
it enforces is free, no email wall. (Disclosure: I built and sell both;
these are my links.)
