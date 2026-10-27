# Changelog

All notable changes to this project are documented here. Add entries under
**Unreleased** as part of your PR; the release workflow turns that section into
a versioned heading.

## Unreleased

- Contributor infrastructure: `CONTRIBUTING.md`, issue and PR templates, and a
  manual release workflow (version bump + CHANGELOG roll + `npm pack` dry-run;
  never publishes)
- `scripts/bump-version.mjs` keeps `package.json`, `package-lock.json`,
  `server.json`, and `src/version.ts` in lockstep

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
