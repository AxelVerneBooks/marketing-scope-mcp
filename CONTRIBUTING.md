# Contributing to marketing-scope-mcp

marketing-scope-mcp is by Axel Verne, author of *MCP for Business* —
[axelverne.com](https://axelverne.com). Issues and pull requests are welcome.

The project has one rule that shapes every change: **nothing passes
silently.** Scores come back with their evidence, unscored offers are
rejected by name, and plan violations come back as an error list. Changes
that make a gate quieter or a score less explainable will be pushed back on.

## Setup

Requirements: Node ≥ 20 (CI uses Node 22) and npm.

```bash
git clone https://github.com/AxelVerneBooks/marketing-scope-mcp
cd marketing-scope-mcp
npm ci
npm run build          # tsc → dist/
```

Run the server locally:

```bash
npm start              # stdio
npm run start:http     # Streamable HTTP at http://127.0.0.1:3002/mcp
```

Plans are written to `./data` by default; point `MARKETING_SCOPE_DATA_DIR`
somewhere disposable while developing.

To try it from an MCP client, register `node /absolute/path/to/dist/index.js`
(see the README for Claude Code, Cursor, and HTTP configs).

## Running tests

```bash
npm test
```

This builds the project and runs `test/server.test.mjs` with Node's built-in
test runner. The test launches the built stdio server and drives the full
workflow (`plan_campaign` → `score_offer` → `build_plan` → `check_plan`), plus
the HTTP transport regression check (a fresh transport per stateless request).
It uses a temporary data directory, so it won't touch `./data`.

Before opening a PR, also confirm the package still packs cleanly:

```bash
npm pack --dry-run
```

## Coding style

There's no linter or formatter configured; match the surrounding code.

- **TypeScript, strict mode, ESM.** Source lives in `src/`; relative imports
  use the `.js` extension (`./scoring/offer.js`) as Node16 module resolution
  requires.
- **Formatting:** 2-space indent, double quotes, semicolons, trailing commas
  in multi-line literals, lines kept to roughly 120 characters.
- **Comments:** each file opens with a `/** … */` header explaining its
  purpose. Comment *why*, not *what* — short inline notes for non-obvious
  rules (e.g. why a heading is skipped).
- **Explainability is a feature.** A new scoring dimension or check must
  return its evidence (or the absence of it), not just a number or boolean.
- **Fail loudly.** Tool errors name the offending input; never swallow a
  violation to return a cleaner result.
- **Dependencies:** runtime dependencies are deliberately limited to the MCP
  SDK and `zod`. Discuss before adding another.
- **Tests:** new or changed tool behavior needs a test in
  `test/server.test.mjs` that exercises it through the server, not just the
  helper.

## Making a change

1. Branch from `main`.
2. Make the change, with tests.
3. Add a line under **Unreleased** in `CHANGELOG.md` describing the
   user-visible effect.
4. Run `npm test` and `npm pack --dry-run`.
5. Open a PR and fill in the template.

Don't edit version numbers by hand — the release workflow does that.

## Releases (maintainers)

Releases are cut with the **Release** workflow (Actions → Release → Run
workflow), choosing `patch`, `minor`, `major`, or an explicit `X.Y.Z`. It:

1. runs `scripts/bump-version.mjs`, which updates `package.json`,
   `package-lock.json`, `server.json`, `src/version.ts`, and file header
   banners, and turns the CHANGELOG's **Unreleased** section into
   `## X.Y.Z — YYYY-MM-DD`;
2. builds and runs the tests;
3. runs `npm pack --dry-run` and uploads the file list and tarball as a
   workflow artifact;
4. optionally pushes a `release/vX.Y.Z` branch and opens a PR with the bump.

The workflow **never publishes**. After the release PR is merged, publish to
npm and the MCP registry by hand following [PUBLISH.md](PUBLISH.md).

You can run the same bump locally to preview it:

```bash
node scripts/bump-version.mjs patch && git diff
git checkout -- .      # discard the preview
```

## License

By contributing you agree that your contributions are licensed under the
[MIT License](LICENSE).
