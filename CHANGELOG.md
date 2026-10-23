# Changelog

## 0.1.1 — unreleased

Distribution packaging; no tool behaviour changes.

- `npx -y marketing-scope-mcp` now runs the stdio server directly (`bin`
  entry + shebang)
- `mcpName` in package.json and an npm `packages[]` entry in `server.json`
  so the official MCP Registry can verify the package
- `smithery.yaml` (container runtime, Streamable HTTP)
- Dockerfile moved to the repo root; HTTP port now follows `$PORT`
  (default 3002); image carries the `io.modelcontextprotocol.server.name` label

## 0.1.0 — 2026-10-20

Initial public release.

- `plan_campaign` — offer/channel targets, anti-targets, kill criteria
- `score_offer` — explainable 0–100 offer-strength score (clarity 20 /
  audience specificity 24 / differentiation 20 / proof & risk reversal 20 /
  call to action 16), grades A ≥ 80 / B ≥ 65 / C ≥ 45 / D < 45
- `build_plan` — registry-backed campaign shell; unscored offers rejected
- `check_plan` — every tactic must cite a scored offer and name a success metric
- Dual transport: stdio + stateless Streamable HTTP (per-request transport,
  fresh-transport regression test inherited from research-scope-mcp publish day)
