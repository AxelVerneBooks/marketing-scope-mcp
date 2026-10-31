# Changelog

## Unreleased

- Strict input validation for all four tools (`src/validation.ts`): unknown
  parameters, wrong types, missing required fields and out-of-range lengths are
  rejected with a clear, actionable message per problem (field, expectation,
  example) instead of the SDK's raw validation text. String inputs are trimmed.
- `check_plan`: distinct messages for an unknown `plan_id`, a missing file, and a
  `plan_path` that is a directory; file read errors no longer surface as raw
  exceptions. `build_plan`: unwritable data dirs return a fix-it message.
- Unit tests (`test/validation.test.mjs`) covering valid, missing-required and
  malformed input for every tool, plus an end-to-end stdio error test.

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
