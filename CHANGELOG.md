# Changelog

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
