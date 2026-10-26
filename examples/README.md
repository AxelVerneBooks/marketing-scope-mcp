# Examples

Four end-to-end scripts that drive the real server through the official MCP
SDK client, plus drop-in configs for Claude Desktop, Claude Code and Cursor.

Every file in [`output/`](output/) is the unedited stdout of `npm run examples`
against this repo's build. Dates, plan ids and temp paths differ on every run;
the scores and verdicts don't, because scoring is deterministic.

```bash
npm install
npm run examples                              # build, run all four, rewrite output/*.txt
node examples/02-offer-iteration.mjs          # or run one by itself (after npm run build)
```

| Script | Scenario | What it shows | Output |
|---|---|---|---|
| [`01-quickstart-full-pipeline.mjs`](01-quickstart-full-pipeline.mjs) | $29 bookkeeping-template pack, 40 sales in 30 days | All four tools in order: `plan_campaign` → `score_offer` → `build_plan` → write tactics → `check_plan` goes from FAIL (empty shell) to PASS | [txt](output/01-quickstart-full-pipeline.txt) |
| [`02-offer-iteration.mjs`](02-offer-iteration.mjs) | $149 website speed audit | Four drafts of one offer, 0 → 20 → 48 → 76, with the flags and per-dimension evidence that drove each rewrite, checked against the "STOP below 45" kill criterion | [txt](output/02-offer-iteration.txt) |
| [`03-gates-and-failures.mjs`](03-gates-and-failures.mjs) | $9/month meal plans for shift nurses | The gates: `build_plan` refuses an unscored offer, `check_plan` lists an orphan tactic and an unmeasured one, then passes once both are fixed | [txt](output/03-gates-and-failures.txt) |
| [`04-http-transport.mjs`](04-http-transport.mjs) | $59 Spanish course for travel nurses | Streamable HTTP: one client scores an offer, a second, separate connection builds a plan from it (the score registry is per process, not per session) | [txt](output/04-http-transport.txt) |

[`_client.mjs`](_client.mjs) holds the shared stdio connection helper. Each
run uses a fresh temp data dir, so the examples never write to `./data`.

## Things the outputs show that are easy to miss

- **`check_plan` on a fresh shell fails.** Zero tactics is a FAIL, not a pass
  (example 1, step 4).
- **Edit the file, then check by `plan_path`.** `check_plan(plan_id)` reads the
  shell as `build_plan` stored it in memory, so it doesn't see your edits.
  Example 3, step 5 shows the same plan failing by id after passing by path.
- **Metrics are matched by keyword.** A tactic counts as measured when it
  contains `metric`, `measured by` or `target:`, so write
  `success metric: …` or `target: …` on every tactic.
- **Scores are lost on restart.** The registry is in memory. Re-run
  `score_offer` before `build_plan` in a new server process.

## Using it from Claude Desktop, Claude Code and Cursor

Build first (`npm install && npm run build`), then point your client at the
absolute path of `dist/index.js`. Set `MARKETING_SCOPE_DATA_DIR` so plan files
land somewhere you can find them. The client launches the server over stdio,
the same transport `_client.mjs` uses.

### Claude Desktop

Merge [`clients/claude_desktop_config.json`](clients/claude_desktop_config.json)
into `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`),
replace both `/ABSOLUTE/PATH/TO/...` values, and restart Claude Desktop.
Claude Desktop can't attach to a `localhost` HTTP URL; use stdio as shown.

### Claude Code

One command, user-wide:

```bash
claude mcp add marketing-scope -e MARKETING_SCOPE_DATA_DIR=$HOME/marketing-scope-data \
  -- node /ABSOLUTE/PATH/TO/marketing-scope-mcp/dist/index.js
```

Or commit [`clients/claude-code.mcp.json`](clients/claude-code.mcp.json) to your
project root as `.mcp.json`. To attach to a running HTTP server (example 4 or
the Docker image) instead:
`claude mcp add --transport http marketing-scope http://localhost:3002/mcp`.

### Cursor

Copy [`clients/cursor.mcp.json`](clients/cursor.mcp.json) to `.cursor/mcp.json`
(project) or `~/.cursor/mcp.json` (global) and replace the paths. For HTTP,
use `{ "mcpServers": { "marketing-scope": { "url": "http://localhost:3002/mcp" } } }`.

More HTTP client shapes (VS Code, Cline, Gemini CLI):
[`../clients/http-transport-comparison.md`](../clients/http-transport-comparison.md).

### A prompt to try

Paste this into any of the three clients once the server shows up as connected.
It asks the model to make the same tool calls as example 1:

```text
Use the marketing-scope tools. Objective: sell 40 copies of my $29 freelancer
bookkeeping template pack in 30 days; my audience is my 1,200-subscriber
newsletter and r/freelance. Run plan_campaign, then score_offer on this offer:
"The Freelancer Books Kit: 9 spreadsheet templates for freelancers who invoice
in USD, only $29 — unlike generic accounting software it closes your month in
20 minutes because every sheet is pre-linked. 30-day money-back guarantee.
Download today." If it scores below 45, stop and tell me what to fix.
Otherwise build_plan, write one tactic per channel that cites [O1] and names a
success metric into the plan file, and run check_plan with the plan_path until
it passes.
```

The model's wording will vary. The tool results won't: the same offer text
scores 76/100 (B) with no flags, as in
[`output/01-quickstart-full-pipeline.txt`](output/01-quickstart-full-pipeline.txt).
