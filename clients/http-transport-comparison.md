# Connecting clients to the local HTTP transport — recommended config, side by side

Target server: `marketing-scope-mcp` on **streamable HTTP** at `http://localhost:3002/mcp`
(no auth, no OAuth, loopback only — see `clients/llms-install.md` for the stdio alternative).
Verified formats against client docs as of 2026-10 (sources at bottom).
All snippets below parse as valid JSON (asserted programmatically before commit).

## Recommendation (pick one)

**Claude Code, project scope — one CLI command, zero hand-editing:**

```bash
cd <repo root>
claude mcp add --transport http --scope project marketing-scope http://localhost:3002/mcp
```

Why it wins for this server specifically: first-class `--transport http`, both global
(`--scope user`) and repo-committable (`--scope project` → `.mcp.json`) placements, and the
same `marketing-scope` tool names as the stdio path, so nothing downstream changes. If a
collaborator wants the server without the repo file, `--scope user` does it once per machine.

Runner-up, equally short for GUI users: **Cursor** (`url` only, no `type` needed).

## Side-by-side

| Client | Config file | Exact shape for loopback HTTP | Local HTTP out of the box | Notes / pitfalls |
|---|---|---|---|---|
| **Claude Code** ✅ recommended | project `.mcp.json` or `~/.claude.json` | `claude mcp add --transport http --scope project marketing-scope http://localhost:3002/mcp` or `"marketing-scope": { "type": "http", "url": "http://localhost:3002/mcp" }` | Yes | `"streamable-http"` accepted as an alias for `"http"`. |
| **Cursor** | `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project) | `"marketing-scope": { "url": "http://localhost:3002/mcp" }` | Yes | URL-shape covers streamable HTTP; no `type` field in the documented example. |
| **VS Code (Chat Tools)** | `mcp.json` in the user profile, or `.vscode/mcp.json` | Note the key is **`servers`**, not `mcpServers`: `{ "servers": { "marketing-scope": { "type": "http", "url": "http://localhost:3002/mcp" } } }` | Yes | Uses its own `servers` root key; `.mcp.json` portable format is different (`mcpServers`). |
| **Cline** (VS Code ext) | `cline_mcp_settings.json` (`~/.cline/data/settings/`, override with `CLINE_MCP_SETTINGS_PATH`) | `"marketing-scope": { "type": "streamableHttp", "url": "http://localhost:3002/mcp", "disabled": false, "autoApprove": [] }` | Yes | **Pitfall:** omitting `type` defaults Cline to legacy SSE. Set `streamableHttp` explicitly. |
| **Gemini CLI** | `~/.gemini/settings.json` (user) or `.gemini/settings.json` (project) | `"marketing-scope": { "httpUrl": "http://localhost:3002/mcp" }` | Yes | **Different key:** `httpUrl` is streamable HTTP; plain `url` means MALFORMED-legacy-SSE in this client. |
| **Claude Desktop** | — | ❌ no config for loopback HTTP | No | Custom connectors run from Anthropic's cloud, so `localhost` is unreachable by design; local servers there are stdio-launched, not URL-attached. Closed as "not planned" upstream. Use its stdio route instead of fighting it. |

Copy-paste JSON per client (drop-in bodies for the config files):

```json
// Claude Code — .mcp.json (project) or mcpServers in ~/.claude.json (user)
{ "mcpServers": { "marketing-scope": { "type": "http", "url": "http://localhost:3002/mcp" } } }

// Cursor — ~/.cursor/mcp.json or .cursor/mcp.json
{ "mcpServers": { "marketing-scope": { "url": "http://localhost:3002/mcp" } } }

// VS Code — .vscode/mcp.json or user-profile mcp.json
{ "servers": { "marketing-scope": { "type": "http", "url": "http://localhost:3002/mcp" } } }

// Cline — cline_mcp_settings.json
{ "mcpServers": { "marketing-scope": { "type": "streamableHttp", "url": "http://localhost:3002/mcp", "disabled": false, "autoApprove": [] } } }

// Gemini CLI — ~/.gemini/settings.json
{ "mcpServers": { "marketing-scope": { "httpUrl": "http://localhost:3002/mcp" } } }
```

## Loopback and standing notes

- **`localhost` is the client's runtime, not always your desktop.** A remote
  workspace/container resolves `localhost` to itself; connect from the same machine the
  container runs on, or tunnel instead.
- The server exposes no auth layer on this transport — loopback by design (`llms-install.md`);
  don't publish past localhost without fronting it with auth.
- Both install modes now exist end to end: stdio (`clients/claude-code.json`, launch per
  session) and HTTP (`docker run -d --name marketing-scope -p 3002:3002`, one long-lived
  container). HTTP is the right choice when several clients/tools share one server; stdio is
  the right choice for single-client sandboxing.
- Smoke test after wiring any client: call `plan_campaign` with objective `"verify install"`;
  a healthy response contains `offerTargets`, `channelTargets`, `killCriteria`.

## Sources (checked 2026-10-23)

- Claude Code MCP reference — https://code.claude.com/docs/en/mcp and
  https://code.claude.com/docs/en/mcp-quickstart
- Cursor MCP docs — https://cursor.com/docs/mcp
- VS Code MCP configuration reference — https://code.visualstudio.com/docs/agents/reference/mcp-configuration
- Cline MCP overview + settings location — https://docs.cline.bot/mcp/mcp-overview and https://docs.cline.bot/getting-started/config
- Claude Desktop local servers / custom connectors + closed localhost gap —
  https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop,
  https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp,
  https://github.com/anthropics/claude-ai-mcp/issues/9
- Gemini CLI MCP docs — https://geminicli.com/docs/tools/mcp-server/ and https://geminicli.com/docs/reference/configuration/
