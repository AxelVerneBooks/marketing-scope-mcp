/** Shared test helpers: in-process MCP client and temp dirs. */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { buildServer, createState } from "../dist/server.js";

export function tempDir(prefix = "msmcp-test-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** Connect an SDK client to a fresh in-process server sharing `state`. */
export async function connectInProcess(state = createState({ dataDir: tempDir().dir })) {
  const server = buildServer(state);
  const client = new Client({ name: "test-client", version: "0.0.1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    state,
    call: (name, args) => client.callTool({ name, arguments: args }),
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

/** First text payload of a tool result. */
export function text(result) {
  assert.ok(result?.content?.[0]?.text, `no text content in ${JSON.stringify(result)}`);
  return result.content[0].text;
}

export const json = (result) => JSON.parse(text(result));

export const STRONG_OFFER =
  "The Working Farm Ledger: 12 print-ready ledgers for small-hold farmers who sell at markets, only $19. Unlike generic ledgers, it is built by a working farmer and trims bookkeeping to 40 records a season. 30-day money-back guarantee, used by 1,200+ farmers. Download yours today — launch price ends Friday.";
export const WEAK_OFFER = "World-class revolutionary solutions for everyone";

/** Insert tactic bullets into a plan's Email channel brief. */
export const withTactics = (md, tactics) => md.replace("### Paid", `${tactics.join("\n")}\n\n### Paid`);
