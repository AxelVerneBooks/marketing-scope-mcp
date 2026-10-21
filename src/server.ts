/**
 * marketing-scope-mcp — MCP server factory and HTTP handler.
 *
 * Marketing campaign workflow: plan a campaign with kill criteria, score
 * candidate offers explainably (0–100), assemble a campaign-plan shell with an
 * offer registry, then verify every tactic cites a scored offer AND names a
 * success metric before any money gets spent.
 *
 * Tools:
 *   plan_campaign(objective)              -> channel/offer plan with kill criteria
 *   score_offer(offer, audience?)         -> explainable 0–100 offer-strength score
 *   build_plan(goal, offers[])            -> campaign-plan shell (markdown); unscored offers rejected
 *   check_plan(plan_id|plan_path)         -> every tactic must cite [On] + a success metric
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { resolve as pathResolve, relative as pathRelative, isAbsolute } from "node:path";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse, type Server as HttpServer } from "node:http";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import { scoreOffer, type OfferScore } from "./scoring/offer.js";
import { checkPlanMarkdown, renderPlanShell, type RegistryEntry } from "./plan.js";
import { version } from "./version.js";

/* ------------------------------------------------------------------ */
/* state                                                               */
/* ------------------------------------------------------------------ */

export interface ServerState {
  dataDir: string;
  /** When true, check_plan only reads files inside dataDir (set for network transports). */
  restrictPathsToDataDir: boolean;
  /** Scores keyed by exact (trimmed) offer text and by offerId */
  scores: Map<string, OfferScore>;
  /** plan id -> path of the saved markdown */
  plans: Map<string, string>;
}

export function defaultDataDir(): string {
  return pathResolve(process.env.MARKETING_SCOPE_DATA_DIR ?? pathResolve(process.cwd(), "data"));
}

export function createState(options: Partial<Pick<ServerState, "dataDir" | "restrictPathsToDataDir">> = {}): ServerState {
  return {
    dataDir: pathResolve(options.dataDir ?? defaultDataDir()),
    restrictPathsToDataDir: options.restrictPathsToDataDir ?? false,
    scores: new Map(),
    plans: new Map(),
  };
}

/** Stable id for an offer text, so re-scoring the same offer keeps its id. */
export function offerIdFor(offer: string): string {
  return `o-${createHash("sha256").update(offer.trim()).digest("hex").slice(0, 8)}`;
}

function isInside(dir: string, p: string): boolean {
  const rel = pathRelative(dir, p);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

const textResult = (text: string) => ({ content: [{ type: "text" as const, text }] });
const errorResult = (text: string) => ({ isError: true, content: [{ type: "text" as const, text }] });

/* ------------------------------------------------------------------ */
/* server                                                              */
/* ------------------------------------------------------------------ */

// Factory (not a singleton): the Streamable HTTP transport is stateless and
// requires a fresh server + transport pair per request. The shared state
// (scores, plans) is passed in, so every instance sees the same registries.
export function buildServer(state: ServerState = createState()): McpServer {
  const server: McpServer = new McpServer(
    { name: "marketing-scope-mcp", version },
    {
      instructions:
        "Marketing campaign workflow. Use plan_campaign first, then score_offer for each candidate offer, then build_plan, then check_plan BEFORE spending money. Never send traffic at an unscored offer.",
    }
  );

  /* --- tool 1: plan_campaign ---------------------------------------- */

  server.registerTool(
    "plan_campaign",
    {
      title: "Plan a campaign",
      description:
        "Turn a campaign objective into a pre-spend plan: offer targets, channel targets, anti-targets (budget black holes), and kill criteria. Purpose: decompose a marketing goal into scoreable tactics BEFORE any spend. Use this before score_offer on any new product/launch; re-plan only when kill criteria trigger. Sibling distinction: score_offer grades ONE offer statement; this plans the whole campaign strategy.",
      inputSchema: {
        objective: z.string().min(3).describe("What the campaign must accomplish, e.g. 'sell 30 copies of the build manual in 30 days'"),
        audience_hints: z.array(z.string()).optional().describe("Where the audience already gathers, e.g. ['r/sysadmin', 'EMT Facebook groups', 'existing email list']"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ objective, audience_hints }) => {
      const hints = audience_hints?.length ? audience_hints : ["existing email list", "relevant subreddit/forum", "niche Facebook/LinkedIn groups"];
      const plan = {
        objective,
        generatedAt: new Date().toISOString(),
        offerTargets: [
          { what: "One primary offer statement (the exact sentence a prospect would see)", why: "everything downstream cites it; vague offers cannot be scored honestly" },
          { what: "One fallback offer or angle (bundle, guarantee framing, starter tier)", why: "lets A/B reality check without re-planning the whole campaign" },
        ],
        channelTargets: [
          { what: hints[0], why: "warmest channel; lowest cost per impression in the scorer's eyes" },
          { what: hints[1] ?? "one named community where the audience already asks for this", why: "proof-of-demand before paid spend" },
          { what: "one SEO/content page answering a query the audience already types", why: "compounding; survives a failed paid push" },
          ...hints.slice(2).map((h) => ({ what: h, why: "additional audience hint supplied by the caller" })),
        ],
        antiTargets: [
          "broad/top-of-funnel ads before the offer scores >= B",
          "buying reach for an unmeasured tactic (no metric = no channel)",
          "rebranding or redesigning mid-launch",
        ],
        killCriteria: [
          "Every scored offer below 45/100 -> STOP; rework the offer before spending anything on traffic",
          "One-week no-traction on all channels with an A/B offer live -> re-plan rather than raise spend",
          "Cost per acquisition exceeds 1/3 of first-order profit for 7+ days -> kill the channel",
        ],
      };
      return textResult(JSON.stringify(plan, null, 2));
    }
  );

  /* --- tool 2: score_offer ------------------------------------------ */

  server.registerTool(
    "score_offer",
    {
      title: "Score an offer",
      description:
        "Score one offer statement (the exact sentence a prospect would read) on an explainable 0–100 offer-strength scale: clarity 20 / audience specificity 24 / differentiation 20 / proof & risk reversal 20 / call to action 16. Grades: A >= 80, B >= 65, C >= 45, D < 45. Every dimension comes back WITH its evidence, so the number is auditable rather than a vibe. Side effect: the score is cached in an in-memory registry keyed by the exact offer text and by its stable offerId (lost on restart; re-score before finalizing a plan). Do NOT use it as a general copy critique — it grades offer statements, not landing pages. Sibling distinction: plan_campaign plans the strategy; this grades one sentence; build_plan consumes the scores.",
      inputSchema: {
        offer: z.string().min(12).describe("The offer statement exactly as a prospect would read it"),
        audience: z.string().optional().describe("Optional explicit audience statement, folded into audience-specificity scoring"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ offer, audience }) => {
      const scored = scoreOffer({ offer, audience });
      scored.offerId = offerIdFor(offer);
      state.scores.set(offer.trim(), scored);
      state.scores.set(scored.offerId, scored);
      return textResult(JSON.stringify(scored, null, 2));
    }
  );

  /* --- tool 3: build_plan ------------------------------------------- */

  server.registerTool(
    "build_plan",
    {
      title: "Build campaign-plan shell",
      description:
        "Build a campaign-plan shell from already-scored offers: strategy stubs, channel briefs, numbered offer registry, scoring appendix. Writes a markdown file under data/campaigns/ and returns the plan id plus the shell text. Do NOT call it before each offer has a score_offer — unscored offers are rejected with an error naming them. Sibling distinction: this creates the shell; check_plan later validates everything written against it.",
      inputSchema: {
        goal: z.string().min(3).describe("Campaign goal / title"),
        offers: z.array(z.string().min(1)).min(1).describe("Offers previously scored with score_offer: the exact offer text, or the offerId it returned"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ goal, offers }) => {
      const entries: RegistryEntry[] = [];
      const missing: string[] = [];
      const seen = new Set<string>();
      for (const offer of offers) {
        const s = state.scores.get(offer.trim());
        if (!s) {
          missing.push(offer);
          continue;
        }
        if (seen.has(s.offerId)) continue; // same offer listed twice (by text and/or id)
        seen.add(s.offerId);
        entries.push({ offerId: s.offerId, offer: s.offer, score: s.score, grade: s.grade, flags: s.flags, scoredAt: s.scoredAt });
      }
      if (missing.length) {
        return errorResult(`These offers were never scored — run score_offer on them first:\n${missing.join("\n")}`);
      }
      const campaignsDir = pathResolve(state.dataDir, "campaigns");
      if (!existsSync(campaignsDir)) mkdirSync(campaignsDir, { recursive: true });
      const id = randomUUID().slice(0, 8);
      const markdown = renderPlanShell(goal, entries);
      const planPath = pathResolve(campaignsDir, `campaign-${id}.md`);
      writeFileSync(planPath, markdown, "utf8");
      state.plans.set(id, planPath);
      const registryLines = entries.map((e, i) => `[O${i + 1}] ${e.offer} (${e.score}/100, ${e.grade})`).join("\n");
      return textResult(
        `Campaign shell ${id} saved to ${planPath}\n\n---\n${markdown}\n---\n\nOffer registry:\n${registryLines}\nCite these [On] numbers from every tactic and give each a success metric, then run check_plan.`
      );
    }
  );

  /* --- tool 4: check_plan ------------------------------------------- */

  server.registerTool(
    "check_plan",
    {
      title: "Check plan tactic coverage",
      description:
        "Verify every substantive campaign tactic (a) cites at least one offer from the plan's registry and (b) names a success metric. Violations — including citations to [On] ids missing from the registry — are returned as an error list, never a silent pass. Read-only tool: inspects the plan file on disk and writes nothing, so edits are always picked up. Use it after every build_plan and again after any manual edit; do NOT use it on arbitrary markdown that never went through build_plan. Sibling distinction: build_plan creates the registry-backed shell; check_plan validates whatever is on disk against that registry.",
      inputSchema: {
        plan_id: z.string().optional().describe("Plan id returned by build_plan"),
        plan_path: z.string().optional().describe("Path to a campaign markdown file (overrides plan_id)"),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ plan_id, plan_path }) => {
      let p: string;
      if (plan_path) {
        p = pathResolve(plan_path);
        if (state.restrictPathsToDataDir && !isInside(state.dataDir, p)) {
          return errorResult(`plan_path must be inside the server data directory (${state.dataDir}) on this transport.`);
        }
      } else if (plan_id) {
        const known = state.plans.get(plan_id) ?? pathResolve(state.dataDir, "campaigns", `campaign-${plan_id}.md`);
        if (!/^[\w-]+$/.test(plan_id) || !existsSync(known)) {
          return errorResult(`Unknown plan_id "${plan_id}" — use the id returned by build_plan, or pass plan_path.`);
        }
        p = known;
      } else {
        return errorResult("Provide either plan_id (from build_plan) or plan_path.");
      }
      if (!existsSync(p)) return errorResult(`Plan file not found: ${p}`);

      const r = checkPlanMarkdown(readFileSync(p, "utf8"));
      return textResult(
        JSON.stringify(
          {
            plan: plan_path ? p : plan_id,
            pass: r.pass,
            tacticsFound: r.tacticsFound,
            tacticsCited: r.tacticsCited,
            tacticsMeasured: r.tacticsMeasured,
            orphanTactics: r.orphanTactics.length ? r.orphanTactics : "none",
            unmeasuredTactics: r.unmeasuredTactics.length ? r.unmeasuredTactics : "none",
            unknownOfferRefs: r.unknownOfferRefs.length ? r.unknownOfferRefs : "none",
            verdict: r.verdict,
          },
          null,
          2
        )
      );
    }
  );

  return server;
}

/* ------------------------------------------------------------------ */
/* Streamable HTTP                                                     */
/* ------------------------------------------------------------------ */

export function createHttpHandler(state: ServerState): (req: IncomingMessage, res: ServerResponse) => void {
  // Stateless Streamable HTTP: the SDK requires a fresh transport per request
  // (a reused stateless transport throws "cannot be reused across requests"
  // from the second request on, which surfaced as silent 500s in the sibling
  // project). Mirror the SDK's official stateless example: new server + new
  // transport per request, both closed when the response ends. The shared
  // state keeps registries.
  return (req, res) => {
    const path = (req.url ?? "/").split("?")[0];
    if (path === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ status: "ok", name: "marketing-scope-mcp", version }));
      return;
    }
    if (path !== "/mcp") {
      res.writeHead(404, { "content-type": "application/json" }).end(JSON.stringify({ error: "not found; the MCP endpoint is /mcp" }));
      return;
    }
    void (async () => {
      try {
        const requestServer = buildServer(state);
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        res.on("close", () => {
          void transport.close();
          void requestServer.close();
        });
        await requestServer.connect(transport);
        await transport.handleRequest(req, res);
        // Note: closing the pair here (after a completed request) would race
        // clients that keep SSE streams open; the "close" listener owns teardown.
      } catch (err) {
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
        }
        const payload = JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: (err as Error).message }, id: null });
        if (!res.writableEnded) res.end(payload);
        else res.destroy();
      }
    })();
  };
}

export function startHttpServer(port: number, host: string, state: ServerState): HttpServer {
  const httpServer = createHttpServer(createHttpHandler(state));
  httpServer.listen(port, host, () => {
    const addr = httpServer.address();
    const bound = typeof addr === "object" && addr ? `${addr.address.includes(":") ? `[${addr.address}]` : addr.address}:${addr.port}` : String(port);
    console.error(`marketing-scope-mcp ${version} listening (Streamable HTTP) on http://${bound}/mcp`);
  });
  return httpServer;
}
