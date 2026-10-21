#!/usr/bin/env node
/**
 * marketing-scope-mcp — CLI entry point.
 *
 * Transports:
 *   - stdio (default):  `marketing-scope-mcp`
 *   - Streamable HTTP:  `marketing-scope-mcp --http [--port 3002] [--host 127.0.0.1]`
 *     Binds to loopback by default; pass `--host 0.0.0.0` (as the Docker image
 *     does) to expose it. There is no built-in auth, so put a reverse proxy
 *     with authentication in front of any non-local deployment.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { buildServer, createState, startHttpServer } from "./server.js";
import { version } from "./version.js";

const USAGE = `marketing-scope-mcp ${version}

Usage:
  marketing-scope-mcp                      run over stdio (default)
  marketing-scope-mcp --http [options]     run over Streamable HTTP at /mcp

Options:
  --port <n>     HTTP port (default: $PORT or 3002)
  --host <addr>  HTTP bind address (default: $MARKETING_SCOPE_HOST or 127.0.0.1)
  -v, --version  print the version
  -h, --help     print this help

Environment:
  MARKETING_SCOPE_DATA_DIR  where campaign-plan shells are written (default: ./data)
`;

interface CliOptions {
  http: boolean;
  port: number;
  host: string;
}

function argValue(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx >= 0 ? args[idx + 1] : undefined;
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 65535) throw new Error(`Invalid port: ${raw}`);
  return n;
}

function parseCli(args: string[], env: NodeJS.ProcessEnv = process.env): CliOptions {
  return {
    http: args.includes("--http"),
    port: parsePort(argValue(args, "--port") ?? env.PORT, 3002),
    host: argValue(args, "--host") ?? env.MARKETING_SCOPE_HOST ?? "127.0.0.1",
  };
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  process.stdout.write(USAGE);
} else if (args.includes("-v") || args.includes("--version")) {
  process.stdout.write(`${version}\n`);
} else {
  let options: CliOptions;
  try {
    options = parseCli(args);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(2);
  }
  if (options.http) {
    startHttpServer(options.port, options.host, createState({ restrictPathsToDataDir: true })).on("error", (err) => {
      console.error("HTTP transport failed:", err.message);
      process.exit(1);
    });
  } else {
    // stdio keeps one long-lived server for the process lifetime
    buildServer(createState())
      .connect(new StdioServerTransport())
      .catch((err) => {
        console.error("stdio transport failed:", err);
        process.exit(1);
      });
  }
}
