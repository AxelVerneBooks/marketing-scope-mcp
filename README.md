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

Node ≥ 20. No install step needed — run it straight from npm:

```bash
npx -y marketing-scope-mcp                       # stdio (what MCP clients launch)
npx -y marketing-scope-mcp --http --port 3002    # Streamable HTTP at http://127.0.0.1:3002/mcp
```

This is a Node package, so `npx` is the one-command path (there is no Python
package, hence no `uvx`). To install globally or build from source instead:

```bash
npm install -g marketing-scope-mcp               # then run: marketing-scope-mcp
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp && npm install && npm run build   # then: node dist/index.js
```

### Claude Code

```bash
claude mcp add marketing-scope -- npx -y marketing-scope-mcp
```

### Claude Desktop / Cursor / any `mcpServers` client

```json
{ "mcpServers": { "marketing-scope": { "command": "npx", "args": ["-y", "marketing-scope-mcp"] } } }
```

### Docker

```bash
docker build -t marketing-scope-mcp .
docker run -d --name marketing-scope -p 3002:3002 marketing-scope-mcp
# MCP at http://127.0.0.1:3002/mcp; plans persist in the /app/data volume.
# The HTTP port follows $PORT (default 3002). For stdio instead:
docker run -i --rm --entrypoint node marketing-scope-mcp dist/index.js
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

## Publishing

Maintainer checklist for a release. Nothing here runs automatically; run the
commands yourself, in order. Example values are for **0.1.1** — the version
must match in `package.json`, `src/version.ts`, and both `version` fields in
`server.json` (registry versions are immutable, so every publish needs a bump).

### 1. Verify locally

```bash
npm ci
npm test                                   # builds + runs the stdio workflow test
npm pack --dry-run                         # tarball must list dist/index.js, server.json, README.md
node -e "const p=require('./package.json'),s=require('./server.json');if(p.version!==s.version||s.packages[0].version!==p.version||p.mcpName!==s.name)throw new Error('version/name mismatch');console.log('ok',p.version)"
docker build -t marketing-scope-mcp .      # optional: confirm the image builds
```

### 2. Publish to npm (enables `npx -y marketing-scope-mcp`)

```bash
npm login                                  # once per machine
npm publish --access public                # prepack runs the build
npx -y marketing-scope-mcp@0.1.1 --http --port 3002   # smoke test from the registry; Ctrl-C to stop
```

### 3. Publish to the official MCP Registry

The registry checks that the npm package's `mcpName` equals `server.json`'s
`name`, so step 2 must be done first. The namespace is case-sensitive:
`io.github.AxelVerneBooks/...` must match the GitHub login exactly.

```bash
# install the publisher once (Linux/macOS; see github.com/modelcontextprotocol/registry for others)
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher

./mcp-publisher login github               # device-code flow: open the URL, enter the code
./mcp-publisher publish                    # reads ./server.json
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.AxelVerneBooks/marketing-scope-mcp"
```

### 4. Publish to Smithery

`smithery.yaml` builds the root `Dockerfile` and serves Streamable HTTP at
`/mcp` on `$PORT`. Deployment is done from the Smithery dashboard:

1. Sign in at <https://smithery.ai> with GitHub and choose **Publish server**
   (grant the Smithery GitHub app access to `AxelVerneBooks/marketing-scope-mcp`).
2. Select the repository and the `main` branch, then **Deploy**. Later pushes
   to `main` redeploy automatically.

### 5. Tag the release

```bash
git tag v0.1.1 && git push origin v0.1.1
```

## License

MIT — see [LICENSE](LICENSE).
