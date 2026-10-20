### GitHub Repository URL

https://github.com/AxelVerneBooks/marketing-scope-mcp

### Logo Image

![marketing-scope-mcp logo](https://github.com/AxelVerneBooks/marketing-scope-mcp/raw/main/docs/logo/logo-400.png)

### Installation Testing

- [x] I have tested that Cline can successfully set up this server using only the README.md and/or llms-install.md file
- [x] The server is stable and ready for public use

### Additional Information

marketing-scope-mcp — a marketing pre-flight workflow server: `plan_campaign(objective)` produces a pre-spend plan with offer targets, channel targets, anti-targets and kill criteria; `score_offer(offer, audience?)` grades ONE offer statement on an explainable 0–100 scale (clarity 20 / audience specificity 24 / differentiation 20 / proof & risk reversal 20 / call to action 16; grades A ≥ 80, B ≥ 65, C ≥ 45, D < 45) with per-dimension evidence; `build_plan(goal, offers)` writes a campaign-plan shell and REJECTS any offer that was never scored; `check_plan(plan_id | plan_path)` verifies every tactic cites a scored offer ([O1]-style registry refs) AND names a success metric — violations return as an error list, never a pass, by design.

Setup requirements:
- Node.js ≥ 20. Install (pre-publication route, verified via fresh clone on 2026-10-20): clone the repo, `npm ci && npm run build`, then the one-block mcpServers config in the README. npm package `marketing-scope-mcp` is in progress — NOT live at submission time; the repo-clone route is the verified install path.
- Two transports: stdio (default; no ports) or stateless Streamable HTTP (`--http --port 3002`).
- No API keys, no network calls, no telemetry. Plans written under `MARKETING_SCOPE_DATA_DIR` (default ./data/campaigns). The HTTP listener is unauthenticated — keep it loopback or auth-proxy it.

Special notes for Marketplace users:
- Shortest verification: call `plan_campaign("verify install")` and expect JSON containing `offerTargets` + `killCriteria`.
- The 0.1.0 server.json is already **published and active** on the official MCP registry (`io.github.AxelVerneBooks/marketing-scope-mcp`, published 2026-10-20, 2025-12-11 schema).
- License: MIT. No telemetry. Local-only by default.
