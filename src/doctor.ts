/**
 * `marketing-scope-mcp doctor` — environment health check.
 *
 * Run: `node dist/index.js doctor [--port 3002]`  (or `npm run doctor`)
 *
 * Each check returns pass / warn / fail plus, on anything but pass, a concrete
 * next step. Exit code is 1 if any check fails, 0 otherwise (warnings don't
 * fail the run). Checks take their inputs as arguments so the pass/fail
 * branches are unit-testable without touching the real process.
 */

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve as pathResolve, join } from "node:path";
import { createServer } from "node:net";

import { version } from "./version.js";

export type CheckStatus = "pass" | "warn" | "fail";

export interface CheckResult {
  name: string;
  status: CheckStatus;
  detail: string;
  /** Actionable next step; present whenever status !== "pass". */
  fix?: string;
}

/** Keep in sync with package.json "engines.node". */
export const MIN_NODE_MAJOR = 20;
export const DEFAULT_HTTP_PORT = 3002;

/* ------------------------------------------------------------------ */
/* individual checks                                                   */
/* ------------------------------------------------------------------ */

export function checkNodeVersion(nodeVersion: string = process.versions.node): CheckResult {
  const major = Number.parseInt(nodeVersion.replace(/^v/, "").split(".")[0] ?? "", 10);
  if (Number.isFinite(major) && major >= MIN_NODE_MAJOR) {
    return { name: "Node.js version", status: "pass", detail: `v${nodeVersion.replace(/^v/, "")} (need >= ${MIN_NODE_MAJOR})` };
  }
  return {
    name: "Node.js version",
    status: "fail",
    detail: `found ${nodeVersion || "unknown"}, need >= ${MIN_NODE_MAJOR}`,
    fix: `Install Node.js ${MIN_NODE_MAJOR} or newer (https://nodejs.org, or \`nvm install ${MIN_NODE_MAJOR} && nvm use ${MIN_NODE_MAJOR}\`), then re-run \`npm run build\`.`,
  };
}

/**
 * Environment variables. The server has NO required env vars; both of these
 * are optional, so they're only validated when set.
 */
export function checkEnvVars(env: NodeJS.ProcessEnv = process.env): CheckResult {
  const problems: string[] = [];
  const port = env.PORT;
  if (port !== undefined && port !== "") {
    const n = Number(port);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      problems.push(`PORT="${port}" is not a valid port (1–65535)`);
    }
  }
  const dataDir = env.MARKETING_SCOPE_DATA_DIR;
  if (dataDir !== undefined && dataDir.trim() === "") {
    problems.push("MARKETING_SCOPE_DATA_DIR is set but empty");
  }
  if (problems.length) {
    return {
      name: "Environment variables",
      status: "fail",
      detail: problems.join("; "),
      fix: "Fix or unset the variable(s) above. Neither is required: PORT defaults to 3002 (HTTP mode only) and MARKETING_SCOPE_DATA_DIR defaults to ./data.",
    };
  }
  const set = ["PORT", "MARKETING_SCOPE_DATA_DIR"].filter((k) => env[k]);
  return {
    name: "Environment variables",
    status: "pass",
    detail: set.length ? `none required; optional set: ${set.join(", ")}` : "none required (optional: PORT, MARKETING_SCOPE_DATA_DIR)",
  };
}

/** The data dir must be creatable and writable — build_plan saves plans there. */
export function checkDataDir(dataDir: string): CheckResult {
  const probe = join(dataDir, `.doctor-${process.pid}-${Date.now()}`);
  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(probe, "ok", "utf8");
    rmSync(probe, { force: true });
    return { name: "Data directory", status: "pass", detail: `${dataDir} is writable` };
  } catch (err) {
    return {
      name: "Data directory",
      status: "fail",
      detail: `${dataDir} is not writable (${(err as NodeJS.ErrnoException).code ?? (err as Error).message})`,
      fix: `Point MARKETING_SCOPE_DATA_DIR at a directory you can write to (e.g. \`export MARKETING_SCOPE_DATA_DIR="$HOME/.marketing-scope"\`), or fix permissions on ${dataDir}. In Docker, mount a writable volume at /app/data.`,
    };
  }
}

/**
 * Network. marketing-scope-mcp makes no outbound API calls — scoring and
 * plan checks run fully locally — so there's nothing to reach. The only
 * network resource is the local port used by `--http` mode; a busy port is a
 * warning, not a failure, because the default stdio transport doesn't need it.
 */
export async function checkHttpPort(port: number, host = "0.0.0.0"): Promise<CheckResult> {
  const name = "Network";
  const prefix = "no outbound APIs called;";
  const free = await new Promise<NodeJS.ErrnoException | null>((resolve) => {
    const srv = createServer();
    srv.once("error", (err) => resolve(err as NodeJS.ErrnoException));
    srv.listen(port, host, () => srv.close(() => resolve(null)));
  });
  if (free === null) {
    return { name, status: "pass", detail: `${prefix} HTTP port ${port} is free for \`--http\` mode` };
  }
  return {
    name,
    status: "warn",
    detail: `${prefix} HTTP port ${port} unavailable (${free.code ?? free.message})`,
    fix:
      free.code === "EACCES"
        ? `Ports below 1024 need elevated privileges — use a higher one: \`node dist/index.js --http --port ${DEFAULT_HTTP_PORT}\`.`
        : `Something is already listening on ${port} (check with \`lsof -i :${port}\`). Stop it, or pick another: \`node dist/index.js --http --port ${port + 1}\`. stdio mode is unaffected.`,
  };
}

/* ------------------------------------------------------------------ */
/* runner + report                                                     */
/* ------------------------------------------------------------------ */

export interface DoctorOptions {
  nodeVersion?: string;
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  port?: number;
}

export async function runChecks(opts: DoctorOptions = {}): Promise<CheckResult[]> {
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const envResult = checkEnvVars(env);
  const envPort = Number(env.PORT);
  const port = opts.port ?? (Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535 ? envPort : DEFAULT_HTTP_PORT);
  const dataDirRaw = env.MARKETING_SCOPE_DATA_DIR?.trim() ? env.MARKETING_SCOPE_DATA_DIR : pathResolve(cwd, "data");
  return [
    checkNodeVersion(opts.nodeVersion ?? process.versions.node),
    envResult,
    checkDataDir(pathResolve(cwd, dataDirRaw!)),
    await checkHttpPort(port),
  ];
}

const ICON: Record<CheckStatus, string> = { pass: "✔", warn: "!", fail: "✖" };

export function formatReport(results: CheckResult[]): string {
  const lines = [`marketing-scope-mcp ${version} — doctor`, ""];
  for (const r of results) {
    lines.push(`${ICON[r.status]} [${r.status.toUpperCase()}] ${r.name}: ${r.detail}`);
    if (r.fix) lines.push(`    → ${r.fix}`);
  }
  const fails = results.filter((r) => r.status === "fail").length;
  const warns = results.filter((r) => r.status === "warn").length;
  lines.push("");
  lines.push(
    fails
      ? `${fails} check(s) failed${warns ? `, ${warns} warning(s)` : ""}. Fix the items marked → above and re-run \`npm run doctor\`.`
      : warns
        ? `All required checks passed (${warns} warning(s)). The server is ready to run.`
        : "All checks passed. The server is ready to run."
  );
  return lines.join("\n");
}

export function exitCodeFor(results: CheckResult[]): number {
  return results.some((r) => r.status === "fail") ? 1 : 0;
}

/** CLI entry: parses `--port N`, prints the report to stdout, returns the exit code. */
export async function doctor(argv: string[]): Promise<number> {
  const portIdx = argv.indexOf("--port");
  const port = portIdx >= 0 ? Number(argv[portIdx + 1]) : undefined;
  const results = await runChecks({ port: port && Number.isInteger(port) ? port : undefined });
  console.log(formatReport(results));
  return exitCodeFor(results);
}
