/**
 * Example 4 — the Streamable HTTP transport.
 *
 * Scenario: you run one long-lived server (e.g. the Docker image) and point
 * HTTP-capable clients (Claude Code `--transport http`, Cursor `url`) at it.
 * The transport is stateless — a fresh MCP server per request — yet scores
 * from one request are visible to the next, because the registry lives in
 * the process, not the session. This script proves that over real HTTP.
 *
 * Run: npm run build && node examples/04-http-transport.mjs
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SERVER_ENTRY, freshDataDir, heading } from "./_client.mjs";

const PORT = 3102;
const url = new URL(`http://127.0.0.1:${PORT}/mcp`);
const server = spawn(process.execPath, [SERVER_ENTRY, "--http", "--port", String(PORT)], {
  env: { ...process.env, MARKETING_SCOPE_DATA_DIR: freshDataDir() },
  stdio: ["ignore", "ignore", "pipe"],
});
server.stderr.setEncoding("utf8");
server.stderr.on("data", (d) => process.stdout.write(`[server stderr] ${d}`));

/** One client = one connection; we open two to show state survives across them. */
async function connect(name) {
  for (let i = 0; i < 40; i++) {
    const client = new Client({ name, version: "0.1.0" });
    try {
      await client.connect(new StreamableHTTPClientTransport(url));
      return client;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error(`server never came up on ${url}`);
}

try {
  heading(`client A connects to ${url}`);
  const a = await connect("client-a");
  console.log("server:", JSON.stringify(a.getServerVersion()));
  const { tools } = await a.listTools();
  for (const t of tools) console.log(`- ${t.name}: ${t.title}`);

  const offer =
    "A 6-week Spanish course for travel nurses, $59 — unlike apps, every lesson is hospital vocabulary you will use on shift. " +
    "Money-back guarantee. Enroll today.";
  heading("client A: score_offer");
  const scored = JSON.parse((await a.callTool({ name: "score_offer", arguments: { offer } })).content[0].text);
  console.log(`${scored.score}/100 (${scored.grade}) offerId=${scored.offerId} flags=${scored.flags.join(", ") || "none"}`);
  await a.close();

  heading("client B (new connection): build_plan with client A's offer");
  const b = await connect("client-b");
  const built = await b.callTool({ name: "build_plan", arguments: { goal: "Spanish for travel nurses — 25 enrollments", offers: [offer] } });
  const text = built.content[0].text;
  console.log(`isError: ${built.isError === true}`);
  console.log(text.slice(text.indexOf("Offer registry:")));
  await b.close();
} finally {
  server.kill();
  await once(server, "exit").catch(() => {});
}
