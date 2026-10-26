/**
 * Shared helper for the examples: connects the official MCP SDK client to the
 * built server (dist/index.js) over stdio — the same transport Claude Desktop,
 * Claude Code and Cursor use when you register the server with a `command`.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const SERVER_ENTRY = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js");

/** Fresh data dir per run so examples never touch ./data. */
export function freshDataDir() {
  return mkdtempSync(join(tmpdir(), "marketing-scope-example-"));
}

export async function connectStdio(dataDir = freshDataDir()) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_ENTRY],
    env: { ...process.env, MARKETING_SCOPE_DATA_DIR: dataDir },
    stderr: "inherit",
  });
  const client = new Client({ name: "marketing-scope-examples", version: "0.1.0" });
  await client.connect(transport);
  return { client, dataDir };
}

/** Call a tool and return { isError, text, json } — json is null for non-JSON replies. */
export async function call(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  const text = result.content?.[0]?.text ?? "";
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // build_plan and error replies are plain text
  }
  return { isError: result.isError === true, text, json };
}

export function heading(title) {
  console.log(`\n=== ${title} ${"=".repeat(Math.max(0, 70 - title.length))}`);
}

export function printScore(s) {
  console.log(`${s.score}/100 (${s.grade})  flags: ${s.flags.length ? s.flags.join(", ") : "none"}`);
  for (const b of s.breakdown) {
    console.log(`  ${b.dimension.padEnd(22)} ${String(b.points).padStart(2)}/${String(b.max).padEnd(2)}  ${b.notes}`);
  }
}
