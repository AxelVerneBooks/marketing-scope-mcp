/**
 * Strict input validation for every marketing-scope-mcp tool.
 *
 * Each tool's parameters are described by a strict zod object schema (unknown
 * keys are rejected) whose issues carry plain-language, actionable messages:
 * what is wrong, what was expected, and an example of a valid value. The same
 * schemas are handed to the MCP SDK as `inputSchema`, so clients see the JSON
 * Schema in tools/list and get these messages (not raw zod dumps) when a call
 * is rejected. `validateToolArgs` exposes the same checks — plus cross-field
 * rules a JSON Schema object cannot express — for handlers and unit tests.
 */

import { z } from "zod";

export const LIMITS = {
  objectiveMin: 3,
  objectiveMax: 500,
  audienceHintMax: 200,
  audienceHintsMax: 20,
  offerMin: 12,
  offerMax: 1000,
  audienceMax: 500,
  goalMin: 3,
  goalMax: 200,
  planOfferMin: 8,
  planOffersMax: 50,
  planIdMax: 64,
  planPathMax: 4096,
} as const;

/** Human name for the JSON type of a received value. */
function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  if (typeof value === "string") return "a string";
  if (typeof value === "number") return Number.isNaN(value) ? "NaN" : "a number";
  if (typeof value === "boolean") return "a boolean";
  if (typeof value === "object") return "an object";
  return typeof value;
}

function fieldLabel(path: ReadonlyArray<string | number>): string {
  if (!path.length) return "arguments";
  return path.reduce<string>((acc, part) => (typeof part === "number" ? `${acc}[${part}]` : acc ? `${acc}.${part}` : part), "");
}

/**
 * Error map for a tool's argument object. Field-level messages are attached in
 * the schemas below; this covers object-level problems (unknown keys, wrong
 * container type) and is the fallback for anything not given a custom message.
 */
function toolErrorMap(tool: string, allowed: readonly string[]): z.ZodErrorMap {
  return (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.unrecognized_keys) {
      const keys = issue.keys.map((k) => `"${k}"`).join(", ");
      return {
        message: `${tool} does not accept parameter(s) ${keys}. Allowed parameters: ${allowed.join(", ")}. Check for typos or remove the extra field(s).`,
      };
    }
    if (issue.code === z.ZodIssueCode.invalid_type && issue.path.length === 0) {
      return {
        message: `${tool} expects its arguments as a JSON object (e.g. {"${allowed[0]}": "..."}), but received ${describeType(ctx.data)}.`,
      };
    }
    return { message: ctx.defaultError };
  };
}

/** A required/optional string field with clear messages for every failure mode. */
function text(field: string, opts: { min: number; max: number; hint: string; example: string }) {
  return z
    .string({
      required_error: `"${field}" is required: ${opts.hint}. Example: ${JSON.stringify(opts.example)}.`,
      invalid_type_error: `"${field}" must be a string (${opts.hint}). Example: ${JSON.stringify(opts.example)}.`,
    })
    .trim()
    .min(opts.min, {
      message:
        opts.min <= 1
          ? `"${field}" must not be empty or whitespace: ${opts.hint}. Example: ${JSON.stringify(opts.example)}.`
          : `"${field}" is too short — it must be at least ${opts.min} characters after trimming whitespace: ${opts.hint}. Example: ${JSON.stringify(opts.example)}.`,
    })
    .max(opts.max, { message: `"${field}" is too long — keep it to ${opts.max} characters or fewer.` });
}

/* ------------------------------------------------------------------ */
/* plan_campaign                                                       */
/* ------------------------------------------------------------------ */

export const planCampaignShape = {
  objective: text("objective", {
    min: LIMITS.objectiveMin,
    max: LIMITS.objectiveMax,
    hint: "describe what the campaign must accomplish",
    example: "sell 30 copies of the build manual in 30 days",
  }).describe("What the campaign must accomplish, e.g. 'sell 30 copies of the build manual in 30 days'"),
  audience_hints: z
    .array(
      text("audience_hints[]", {
        min: 1,
        max: LIMITS.audienceHintMax,
        hint: "each entry names one place the audience already gathers",
        example: "r/sysadmin",
      }),
      {
        invalid_type_error: `"audience_hints" must be an array of strings, e.g. ["r/sysadmin", "existing email list"]. Omit it to use the defaults.`,
      }
    )
    .max(LIMITS.audienceHintsMax, { message: `"audience_hints" has too many entries — pass at most ${LIMITS.audienceHintsMax}.` })
    .optional()
    .describe("Where the audience already gathers, e.g. ['r/sysadmin', 'EMT Facebook groups', 'existing email list']"),
};
export const planCampaignInput = z
  .object(planCampaignShape, { errorMap: toolErrorMap("plan_campaign", Object.keys(planCampaignShape)) })
  .strict();
export type PlanCampaignInput = z.infer<typeof planCampaignInput>;

/* ------------------------------------------------------------------ */
/* score_offer                                                         */
/* ------------------------------------------------------------------ */

export const scoreOfferShape = {
  offer: text("offer", {
    min: LIMITS.offerMin,
    max: LIMITS.offerMax,
    hint: "pass the full offer sentence exactly as a prospect would read it",
    example: "12 print-ready farm ledgers for small-hold farmers, only $19 — start today",
  }).describe("The offer statement exactly as a prospect would read it"),
  audience: text("audience", {
    min: 1,
    max: LIMITS.audienceMax,
    hint: "describe who the offer is for, or omit the field",
    example: "for small-hold farmers who sell at markets",
  })
    .optional()
    .describe("Optional explicit audience statement, folded into audience-specificity scoring"),
};
export const scoreOfferInput = z
  .object(scoreOfferShape, { errorMap: toolErrorMap("score_offer", Object.keys(scoreOfferShape)) })
  .strict();
export type ScoreOfferInput = z.infer<typeof scoreOfferInput>;

/* ------------------------------------------------------------------ */
/* build_plan                                                          */
/* ------------------------------------------------------------------ */

export const buildPlanShape = {
  goal: text("goal", {
    min: LIMITS.goalMin,
    max: LIMITS.goalMax,
    hint: "give the campaign a goal / title",
    example: "Farm ledger pre-launch",
  }).describe("Campaign goal / title"),
  offers: z
    .array(
      text("offers[]", {
        min: LIMITS.planOfferMin,
        max: LIMITS.offerMax,
        hint: "each entry must be the exact offer text you previously passed to score_offer",
        example: "12 print-ready farm ledgers for small-hold farmers, only $19 — start today",
      }),
      {
        required_error: `"offers" is required: pass an array of offer texts you already scored with score_offer, e.g. ["<exact offer text>"].`,
        invalid_type_error: `"offers" must be an array of strings (exact offer texts scored with score_offer), e.g. ["<exact offer text>"]. A single offer still goes inside an array.`,
      }
    )
    .min(1, { message: `"offers" must contain at least one offer — run score_offer first, then pass its exact offer text here.` })
    .max(LIMITS.planOffersMax, { message: `"offers" has too many entries — a plan can register at most ${LIMITS.planOffersMax} offers.` })
    .describe("Offer texts previously scored with score_offer (exact text match)"),
};
export const buildPlanInput = z
  .object(buildPlanShape, { errorMap: toolErrorMap("build_plan", Object.keys(buildPlanShape)) })
  .strict();
export type BuildPlanInput = z.infer<typeof buildPlanInput>;

/* ------------------------------------------------------------------ */
/* check_plan                                                          */
/* ------------------------------------------------------------------ */

export const checkPlanShape = {
  plan_id: text("plan_id", {
    min: 1,
    max: LIMITS.planIdMax,
    hint: "use the id build_plan returned",
    example: "3f9a2c1b",
  })
    .optional()
    .describe("Plan id returned by build_plan"),
  plan_path: text("plan_path", {
    min: 1,
    max: LIMITS.planPathMax,
    hint: "point at a campaign markdown file written by build_plan",
    example: "data/campaigns/campaign-3f9a2c1b.md",
  })
    .optional()
    .describe("Path to a campaign markdown file (overrides plan_id)"),
};
export const checkPlanInput = z
  .object(checkPlanShape, { errorMap: toolErrorMap("check_plan", Object.keys(checkPlanShape)) })
  .strict();
export type CheckPlanInput = z.infer<typeof checkPlanInput>;

export const CHECK_PLAN_MISSING_TARGET =
  'check_plan needs a plan to check: pass "plan_id" (the id returned by build_plan, e.g. "3f9a2c1b") or "plan_path" (a campaign markdown file, e.g. "data/campaigns/campaign-3f9a2c1b.md").';

/* ------------------------------------------------------------------ */
/* shared entry point                                                  */
/* ------------------------------------------------------------------ */

export const toolInputSchemas = {
  plan_campaign: planCampaignInput,
  score_offer: scoreOfferInput,
  build_plan: buildPlanInput,
  check_plan: checkPlanInput,
} as const;

export type ToolName = keyof typeof toolInputSchemas;
export type ToolArgs = { [K in ToolName]: z.infer<(typeof toolInputSchemas)[K]> };

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string; issues: string[] };

/** Render zod issues as one actionable bullet per problem. */
export function formatIssues(tool: string, error: z.ZodError): { message: string; issues: string[] } {
  const issues = error.issues.map((i) => {
    // Messages already name their field; prefix the path only when it adds
    // information (array indices, or a fallback default message).
    const label = fieldLabel(i.path);
    // Element messages are written against "field[]"; name the actual index.
    const msg = typeof i.path[i.path.length - 1] === "number" ? i.message.replace(/"([A-Za-z_]+)\[\]"/, `"${label}"`) : i.message;
    return msg.includes(`"${label}"`) || i.path.length === 0 ? msg : `${label}: ${msg}`;
  });
  const message = `Invalid arguments for ${tool}:\n${issues.map((s) => `- ${s}`).join("\n")}`;
  return { message, issues };
}

/**
 * Validate raw tool arguments. Applies the strict schema plus cross-field
 * rules (e.g. check_plan needs plan_id or plan_path). Never throws.
 */
export function validateToolArgs<K extends ToolName>(tool: K, args: unknown): ValidationResult<ToolArgs[K]> {
  if (!(tool in toolInputSchemas)) {
    const message = `Unknown tool "${String(tool)}". Available tools: ${Object.keys(toolInputSchemas).join(", ")}.`;
    return { ok: false, message, issues: [message] };
  }
  const schema = toolInputSchemas[tool] as unknown as z.ZodType<ToolArgs[K]>;
  const parsed = schema.safeParse(args === undefined ? {} : args);
  if (!parsed.success) return { ok: false, ...formatIssues(tool, parsed.error) };

  if (tool === "check_plan") {
    const a = parsed.data as ToolArgs["check_plan"];
    if (!a.plan_id && !a.plan_path) {
      return { ok: false, message: `Invalid arguments for check_plan:\n- ${CHECK_PLAN_MISSING_TARGET}`, issues: [CHECK_PLAN_MISSING_TARGET] };
    }
  }
  return { ok: true, data: parsed.data };
}
