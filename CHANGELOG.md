# Changelog

## 0.1.1 — unreleased

- **Fix: `npx -y marketing-scope-mcp` now works.** 0.1.0 shipped without a
  `bin` entry, so npx failed with "could not determine executable to run".
  Added `bin` + shebang; `npm install -g` now puts `marketing-scope-mcp` on PATH.
- README: one-command Quickstart (npx; `uvx` doesn't apply because this is a Node package), client
  configs use npx, and the from-source path uses `$PWD/dist/index.js` instead of `/path/to/dist`.
- README example session: replaced an incorrect "88/100 (A)" (that offer
  actually scored 40/100, D) with real output from `examples/quickstart.mjs`.
- New `examples/quickstart.mjs` and `install-smoke` CI workflow: pack →
  clean install → npx/global-bin/HTTP/Docker smoke, plus the README's
  from-source commands, on every push and PR.

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
