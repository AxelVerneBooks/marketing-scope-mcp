/**
 * Unit tests — strict input validation for every tool (src/validation.ts).
 * For each tool: valid input, missing required fields, and malformed input
 * (wrong types, out-of-range lengths, unknown keys, non-object arguments).
 * Run: npm test
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { validateToolArgs, toolInputSchemas, LIMITS } from "../dist/validation.js";

const STRONG_OFFER = "12 print-ready farm ledgers for small-hold farmers, only $19 — start today";

/** Assert a rejection and return its message for further matching. */
function rejected(tool, args) {
  const r = validateToolArgs(tool, args);
  assert.equal(r.ok, false, `expected ${tool} to reject ${JSON.stringify(args)}`);
  assert.equal(typeof r.message, "string");
  assert.ok(r.message.startsWith(`Invalid arguments for ${tool}:`), `message should name the tool: ${r.message}`);
  assert.ok(Array.isArray(r.issues) && r.issues.length >= 1);
  // never a raw zod dump
  assert.doesNotMatch(r.message, /"code":|invalid_type|ZodError|\[\s*\{/);
  return r.message;
}

function accepted(tool, args) {
  const r = validateToolArgs(tool, args);
  assert.equal(r.ok, true, `expected ${tool} to accept ${JSON.stringify(args)}, got: ${r.message}`);
  return r.data;
}

describe("shared behaviour", () => {
  test("every tool has a strict schema", () => {
    assert.deepEqual(Object.keys(toolInputSchemas).sort(), ["build_plan", "check_plan", "plan_campaign", "score_offer"]);
  });

  for (const tool of Object.keys(toolInputSchemas)) {
    test(`${tool}: non-object arguments are rejected with a clear message`, () => {
      for (const bad of ["a string", 42, ["array"], null, true]) {
        const msg = rejected(tool, bad);
        assert.match(msg, /expects its arguments as a JSON object/);
      }
    });

    test(`${tool}: unknown parameters are rejected and allowed ones are listed`, () => {
      const msg = rejected(tool, { definitely_not_a_param: 1 });
      assert.match(msg, /does not accept parameter\(s\) "definitely_not_a_param"/);
      assert.match(msg, /Allowed parameters:/);
    });
  }

  test("unknown tool name is reported, not thrown", () => {
    const r = validateToolArgs("nope", {});
    assert.equal(r.ok, false);
    assert.match(r.message, /Unknown tool "nope"/);
  });

  test("validation never throws on hostile input", () => {
    const cyclic = {};
    cyclic.self = cyclic;
    for (const tool of Object.keys(toolInputSchemas)) {
      assert.doesNotThrow(() => validateToolArgs(tool, cyclic));
      assert.doesNotThrow(() => validateToolArgs(tool, undefined));
    }
  });
});

describe("plan_campaign", () => {
  test("valid: objective only", () => {
    const d = accepted("plan_campaign", { objective: "sell 30 copies of the build manual in 30 days" });
    assert.equal(d.objective, "sell 30 copies of the build manual in 30 days");
    assert.equal(d.audience_hints, undefined);
  });

  test("valid: objective + audience_hints, whitespace trimmed", () => {
    const d = accepted("plan_campaign", { objective: "  launch the kit  ", audience_hints: [" r/sysadmin ", "existing email list"] });
    assert.equal(d.objective, "launch the kit");
    assert.deepEqual(d.audience_hints, ["r/sysadmin", "existing email list"]);
  });

  test("missing required: objective", () => {
    const msg = rejected("plan_campaign", {});
    assert.match(msg, /"objective" is required/);
    assert.match(msg, /Example: "sell 30 copies/);
    const viaUndefined = rejected("plan_campaign", undefined);
    assert.match(viaUndefined, /"objective" is required/);
  });

  test("malformed: objective wrong type / too short / whitespace / too long", () => {
    assert.match(rejected("plan_campaign", { objective: 123 }), /"objective" must be a string/);
    assert.match(rejected("plan_campaign", { objective: "ab" }), /"objective" is too short — it must be at least 3 characters/);
    assert.match(rejected("plan_campaign", { objective: "      " }), /"objective" is too short/);
    assert.match(rejected("plan_campaign", { objective: "x".repeat(LIMITS.objectiveMax + 1) }), /"objective" is too long/);
  });

  test("malformed: audience_hints not an array / bad entries / too many", () => {
    assert.match(rejected("plan_campaign", { objective: "launch it", audience_hints: "r/sysadmin" }), /"audience_hints" must be an array of strings/);
    assert.match(rejected("plan_campaign", { objective: "launch it", audience_hints: ["ok", 7] }), /"audience_hints\[1\]" must be a string/);
    assert.match(rejected("plan_campaign", { objective: "launch it", audience_hints: ["ok", "  "] }), /"audience_hints\[1\]" must not be empty/);
    const many = Array.from({ length: LIMITS.audienceHintsMax + 1 }, (_, i) => `group ${i}`);
    assert.match(rejected("plan_campaign", { objective: "launch it", audience_hints: many }), /too many entries/);
  });

  test("multiple problems are all reported at once", () => {
    const r = validateToolArgs("plan_campaign", { objective: 1, audience_hints: 2, extra: 3 });
    assert.equal(r.ok, false);
    assert.equal(r.issues.length, 3);
  });
});

describe("score_offer", () => {
  test("valid: offer only", () => {
    accepted("score_offer", { offer: STRONG_OFFER });
  });

  test("valid: offer + audience", () => {
    const d = accepted("score_offer", { offer: STRONG_OFFER, audience: "for small-hold farmers who sell at markets" });
    assert.equal(d.audience, "for small-hold farmers who sell at markets");
  });

  test("missing required: offer", () => {
    const msg = rejected("score_offer", { audience: "farmers" });
    assert.match(msg, /"offer" is required: pass the full offer sentence/);
  });

  test("malformed: offer wrong type / too short / too long", () => {
    assert.match(rejected("score_offer", { offer: ["an", "array"] }), /"offer" must be a string/);
    assert.match(rejected("score_offer", { offer: "buy now" }), /"offer" is too short — it must be at least 12 characters/);
    assert.match(rejected("score_offer", { offer: "x".repeat(LIMITS.offerMax + 1) }), /"offer" is too long/);
  });

  test("malformed: audience wrong type / empty", () => {
    assert.match(rejected("score_offer", { offer: STRONG_OFFER, audience: 5 }), /"audience" must be a string/);
    assert.match(rejected("score_offer", { offer: STRONG_OFFER, audience: "   " }), /"audience" must not be empty/);
  });

  test("malformed: misspelled parameter suggests the allowed names", () => {
    const msg = rejected("score_offer", { offr: STRONG_OFFER });
    assert.match(msg, /"offer" is required/);
    assert.match(msg, /"offr"/);
    assert.match(msg, /Allowed parameters: offer, audience/);
  });
});

describe("build_plan", () => {
  test("valid", () => {
    const d = accepted("build_plan", { goal: "Farm ledger pre-launch", offers: [STRONG_OFFER] });
    assert.deepEqual(d.offers, [STRONG_OFFER]);
  });

  test("missing required: goal", () => {
    assert.match(rejected("build_plan", { offers: [STRONG_OFFER] }), /"goal" is required/);
  });

  test("missing required: offers", () => {
    assert.match(rejected("build_plan", { goal: "Farm ledger pre-launch" }), /"offers" is required: pass an array of offer texts/);
  });

  test("missing required: both fields reported together", () => {
    const r = validateToolArgs("build_plan", {});
    assert.equal(r.ok, false);
    assert.equal(r.issues.length, 2);
  });

  test("malformed: offers as a single string explains to wrap it in an array", () => {
    assert.match(rejected("build_plan", { goal: "Launch", offers: STRONG_OFFER }), /A single offer still goes inside an array/);
  });

  test("malformed: empty offers array / too many offers", () => {
    assert.match(rejected("build_plan", { goal: "Launch", offers: [] }), /at least one offer — run score_offer first/);
    const many = Array.from({ length: LIMITS.planOffersMax + 1 }, (_, i) => `${STRONG_OFFER} ${i}`);
    assert.match(rejected("build_plan", { goal: "Launch", offers: many }), /at most 50 offers/);
  });

  test("malformed: bad offer entries name their index", () => {
    const msg = rejected("build_plan", { goal: "Launch", offers: [STRONG_OFFER, 3, "short"] });
    assert.match(msg, /"offers\[1\]" must be a string/);
    assert.match(msg, /"offers\[2\]" is too short/);
  });

  test("malformed: goal wrong type / too short / too long", () => {
    assert.match(rejected("build_plan", { goal: { title: "x" }, offers: [STRONG_OFFER] }), /"goal" must be a string/);
    assert.match(rejected("build_plan", { goal: "ab", offers: [STRONG_OFFER] }), /"goal" is too short/);
    assert.match(rejected("build_plan", { goal: "g".repeat(LIMITS.goalMax + 1), offers: [STRONG_OFFER] }), /"goal" is too long/);
  });
});

describe("check_plan", () => {
  test("valid: plan_id", () => {
    assert.equal(accepted("check_plan", { plan_id: "3f9a2c1b" }).plan_id, "3f9a2c1b");
  });

  test("valid: plan_path", () => {
    accepted("check_plan", { plan_path: "data/campaigns/campaign-3f9a2c1b.md" });
  });

  test("missing required: neither plan_id nor plan_path", () => {
    const msg = rejected("check_plan", {});
    assert.match(msg, /check_plan needs a plan to check: pass "plan_id"/);
    assert.match(msg, /or "plan_path"/);
  });

  test("malformed: wrong types", () => {
    assert.match(rejected("check_plan", { plan_id: 12345678 }), /"plan_id" must be a string/);
    assert.match(rejected("check_plan", { plan_path: ["a.md"] }), /"plan_path" must be a string/);
  });

  test("malformed: empty strings do not count as a target", () => {
    assert.match(rejected("check_plan", { plan_id: "" }), /"plan_id" must not be empty/);
    assert.match(rejected("check_plan", { plan_path: "   " }), /"plan_path" must not be empty/);
  });

  test("malformed: overlong values", () => {
    assert.match(rejected("check_plan", { plan_id: "x".repeat(LIMITS.planIdMax + 1) }), /"plan_id" is too long/);
  });
});
