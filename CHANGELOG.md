# Changelog

## Unreleased

### Fixed
- **`npx marketing-scope-mcp` now works**: `package.json` had no `bin` entry, so the
  documented `npx`/global-install commands could not start the server. Added `bin`
  and a node shebang.
- **`check_plan` passed tactics citing nonexistent offers**: a tactic citing `[O7]`
  in a one-offer plan counted as cited. Citations are now validated against the
  plan's own offer registry and reported as `unknownOfferRefs`.
- **`check_plan(plan_id)` checked the stale shell**: it read the in-memory markdown
  from `build_plan`, ignoring every edit made to the file (contradicting its own
  "validates whatever is on disk" description). It now reads the file on disk, and
  plan ids keep working after a server restart.
- **The `audience` argument of `score_offer` was effectively ignored**: it only
  counted as a named audience if it literally contained the word "audience". Any
  explicit audience statement now counts.
- **Substring false positives in offer scoring**: deliverable words matched inside
  other words ("app" in "happy", "book" in "facebook", "plan" in "planet") and the
  urgency marker `ends` matched "friends"/"trends"/"spends". Both now match whole
  words. "for free", "for everyone", "for a limited time" no longer count as a named
  audience, while "for a busy founder" now does.
- **`score_offer` was not idempotent despite `idempotentHint: true`**: every call
  minted a new random 4-hex-char `offerId`. Ids are now a stable hash of the offer
  text.
- `build_plan` accepted offerIds in principle but its schema rejected them
  (`min(8)` vs 6-char ids); offerIds now work, and duplicate offers are collapsed.
- `plan_campaign` silently dropped audience hints after the second one.
- Vague-word evidence is now reported under clarity (where it is scored) instead of
  differentiation.

### Security
- The HTTP transport now binds to `127.0.0.1` by default (`--host` /
  `MARKETING_SCOPE_HOST` to change; the Docker image passes `--host 0.0.0.0`).
  Previously it listened on all interfaces with no authentication.
- Over HTTP, `check_plan` only reads plan files inside the data directory
  (previously any readable file path could be passed, echoing its lines back).

### Added
- Automated test suite (53 tests): scorer and plan unit tests, in-process tool
  tests, and end-to-end stdio/HTTP CLI tests.
- GitHub Actions CI: lint + typecheck, tests on Node 20/22/24, Docker build with a
  health check.
- ESLint (typescript-eslint) with `npm run lint`; `npm run typecheck`.
- `--help`, `--version`, `--host`; `GET /healthz`; non-`/mcp` paths return 404.
- README: client setup for Claude Desktop, Claude Code and Cursor, example
  session with real outputs, scoring rubric, configuration reference, badges.

### Changed
- Source split into `server.ts` (tools + HTTP handler), `plan.ts` and a thin
  `index.ts` CLI entry.

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
