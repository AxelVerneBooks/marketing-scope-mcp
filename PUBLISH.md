# Publish runbook — marketing-scope-mcp

Carry-over lessons from research-scope-mcp publish day (see that project's memory file):

1. **Namespace is CASE-SENSITIVE.** `server.json` name MUST be
   `io.github.AxelVerneBooks/marketing-scope-mcp` (camelCase to match the
   OAuth login exactly) or the registry returns 403.
2. **No placeholder remotes.** Never publish a `remotes[]` entry like
   `https://YOUR_HOST`. Declared `packages[]` must already exist: publish the
   npm version (with matching `mcpName`) *before* `mcp-publisher publish`.
   Exact release commands live in the README's **Publishing** section.
3. **Device-code login is user-gated.** The user runs
   `~/bin/mcp-publisher login github`, says "code showing", types the code in
   the browser — the code never appears in chat or files.
4. **Stateless HTTP needs a fresh transport per request** (SDK throws
   "cannot be reused across requests" from request #2 otherwise). Guarded by
   the regression test in `test/server.test.mjs`.
5. **Smoke probe before publish (must keep working):**
   - stdio: `initialize` → `tools/list` → `tools/call plan_campaign` returns
     `killCriteria`.
   - HTTP: sessionless POST `/mcp` `initialize` → `tools/call` → 200 JSON.

## Order (sibling pipeline)

1. `npm test` green → git init & push to GitHub
   `AxelVerneBooks/marketing-scope-mcp` (public).
2. `mcp-publisher publish` (device code, user types it).
3. Verify via registry API: `GET /v0.1/servers?search=marketing-scope`
   (note the `/v0.1` prefix).
4. Directory packets: Cline marketplace issue, mcp.so issue, Glama
   "Add MCP Server → Runs from source" (expect a GitHub-OAuth retry or two).
5. Gumroad funnel: $0 checklist lead magnet → Starter pitch (mirror Track C).
