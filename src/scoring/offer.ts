/**
 * marketing-scope-mcp — offer-strength scoring (v0.1.0)
 *
 * Heuristic, explainable scoring. Every dimension is returned WITH the evidence
 * (or the absence of evidence) that produced it, so a `score >= 80` can be
 * audited by a human or an agent rather than treated as a vibe. This module has
 * no network access; the tools in index.ts hand it plain strings.
 */

export interface OfferInput {
  /** The offer statement to score — the thing you'd put in an ad, email, or listing. */
  offer: string;
  /** Optional explicit audience statement; folded into audience-specificity scoring. */
  audience?: string;
  /** Alternate timestamp; defaults to now. */
  scoredAt?: string;
}

export interface ScoreBreakdown {
  dimension: string;
  points: number; // 0..max
  max: number;
  notes: string;
}

export interface OfferScore {
  offerId: string; // short registry id assigned by index.ts (e.g. "o-a1b2")
  offer: string;
  score: number; // 0..100
  grade: "A" | "B" | "C" | "D";
  flags: string[]; // e.g. "no-price", "no-proof", "unclear-audience", "no-cta"
  breakdown: ScoreBreakdown[];
  scoredAt: string;
}

/* ------------------------------------------------------------------ */
/* evidence patterns                                                   */
/* ------------------------------------------------------------------ */

const PRICE_PATTERNS = [
  /\$\s?\d/, // $29, $ 29
  /\bUSD\s?\d/i,
  /\b\d+(?:\.\d+)?% ?(?:off|discount)/i,
  /\bfree\b/i,
  /\bpaid plan\b/i,
  /\bpw[ay]w\b/i,
];

const DELIVERABLE_WORDS = [
  "course",
  "guide",
  "template",
  "toolkit",
  "kit",
  "checklist",
  "access",
  "membership",
  "session",
  "audit",
  "service",
  "coaching",
  "book",
  "report",
  "database",
  "directory",
  "software",
  "app",
  "plan",
  "license",
  "ledger",
  "workbook",
  "ebook",
  "spreadsheet",
  "calculator",
  "preset",
  "pack",
];

const VAGUE_WORDS = [
  "revolutionary",
  "world-class",
  "best in class",
  "game-changer",
  "next-generation",
  "cutting-edge",
  "synergy",
  "solutions",
  "leverage",
];

const AUDIENCE_MARKERS = [
  /\bfor\s+[a-z][\w'-]+(?:\s+(?:who|and|&|with|without)\s+[\w'-]+){0,3}\b/i,
  /\b(?:business|person|is anyone)s?\b.*\bwho\b/i,
];

const SECOND_PERSON = /\byou(r|'re)?\b/i;

const SPECIFICITY_MARKERS = [/\[[^\]]+\]/, /\([^)]{3,}\)/, /\b\d[\d,]*\+/i, /\b\d[\d,]*\s?(?:marketers|founders|owners|creators|developers|fans|clients|customers|students|members|testers)\b/i];

const UNIQUENESS_MARKERS = [
  /\bonly\b/i,
  /\bunlike\b/i,
  /\bwithout\b/i,
  /\binstead of\b/i,
  /\bno one else\b/i,
  /\bfirst\b/i,
  /\bthe (?:really|actually) \w+\b/i,
];

const MECHANISM_MARKERS = [/\bhow (?:it works|we|you)\b/i, /\bbecause\b/i, /\bby (?:doing|using|building|removing|cutting)/i, /\b(?:built|written|tested) by\b/i];

const CONTRAST_MARKERS = [/\b(?:vs\.?|versus|competitor|alternative|compared to)\b/i];

const PROOF_MARKERS = [
  /\bguarantee(?:d)?\b/i,
  /\bmoney-?back\b/i,
  /\b(?:no-questions-asked|full refund)\b/i,
  /\b(?:testimonial|review|rating)\b/i,
  /\b(?:used|trusted) by\b/i,
  /\b\d[\d,.]*\+?\s?(?:customers|users|students|members|readers|sales|copies)\b/i,
];

const TRACK_RECORD_MARKERS = [/\b(?:years?|months?)\b.*(?:experience|in the (?:field|industry|game))/i, /\b(?:case stud(?:y|ies)|portfolio|track record)\b/i, /\b(?:published|featured in)\b/i];

const CTA_MARKERS = [
  /\b(?:start|try|join|get|download|book|buy|claim|subscribe|sign up|grab|enroll|register)\b/i,
  /\bclick (?:here|below)\b/i,
  /\blearn more\b/i,
];

const URGENCY_MARKERS = [/ends/i, /deadline/i, /\bby (?:friday|monday|tonight|midnight|tomorrow)\b/i, /\blimited\b/i, /\bseats?\s\w*\s?left\b/i, /\btoday only\b/i, /\bfinal notice\b/i];

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

export function scoreOffer(input: OfferInput): OfferScore {
  const flags: string[] = [];
  const offer = (input.offer ?? "").trim();
  const bundle = `${offer}\n${(input.audience ?? "").trim()}`;
  const words = offer.split(/\s+/).length;

  /* 1. offer clarity (20) -------------------------------------------- */
  let clarity = 0;
  const hasPrice = PRICE_PATTERNS.some((p) => p.test(offer));
  if (hasPrice) clarity += 10;
  else flags.push("no-price");
  const hasDeliverable = DELIVERABLE_WORDS.some((w) => bundle.toLowerCase().includes(w));
  if (hasDeliverable) clarity += 6;
  else flags.push("no-concrete-deliverable");
  const vaguenessHits = VAGUE_WORDS.filter((v) => offer.toLowerCase().includes(v));
  if (vaguenessHits.length) clarity += 0;
  else clarity += 4;
  if (words < 8) flags.push("too-thin");
  if (words > 120) flags.push("unfocused-length");

  /* 2. audience specificity (24) -------------------------------------- */
  let audiencePts = 0;
  const namedAudience = AUDIENCE_MARKERS.some((p) => p.test(bundle)) || /audience/i.test(input.audience ?? "");
  if (namedAudience) audiencePts += 12;
  else flags.push("unclear-audience");
  if (SECOND_PERSON.test(offer)) audiencePts += 6;
  if (SPECIFICITY_MARKERS.some((p) => p.test(offer))) audiencePts += 6;

  /* 3. differentiation (20) ------------------------------------------- */
  let differentiation = 0;
  if (UNIQUENESS_MARKERS.some((p) => p.test(offer))) differentiation += 10;
  else flags.push("no-uniqueness-marker");
  if (MECHANISM_MARKERS.some((p) => p.test(offer))) differentiation += 6;
  if (CONTRAST_MARKERS.some((p) => p.test(offer))) differentiation += 4;

  /* 4. proof & risk reversal (20) -------------------------------------- */
  let proof = 0;
  if (PROOF_MARKERS.some((p) => p.test(bundle))) proof += 12;
  else flags.push("no-proof");
  if (TRACK_RECORD_MARKERS.some((p) => p.test(bundle))) proof += 8;

  /* 5. call to action (16) --------------------------------------------- */
  let cta = 0;
  const hasCta = CTA_MARKERS.some((p) => p.test(offer));
  if (hasCta) cta += 10;
  else flags.push("no-cta");
  if (URGENCY_MARKERS.some((p) => p.test(offer))) cta += 6;

  const raw = clarity + audiencePts + differentiation + proof + cta;
  const score = Math.max(0, Math.min(100, raw));
  const grade: OfferScore["grade"] = score >= 80 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D";

  const breakdown: ScoreBreakdown[] = [
    {
      dimension: "offer clarity",
      points: clarity,
      max: 20,
      notes: hasPrice ? "price or explicit 'free' present" : "no price token found",
    },
    {
      dimension: "audience specificity",
      points: audiencePts,
      max: 24,
      notes: namedAudience ? "named segment found in offer/audience" : "no named segment; offer could be for anyone",
    },
    {
      dimension: "differentiation",
      points: differentiation,
      max: 20,
      notes: `${differentiation}/20 from uniqueness/mechanism/contrast markers` + (vaguenessHits.length ? ` (vague words: ${vaguenessHits.join(", ")})` : ""),
    },
    {
      dimension: "proof & risk reversal",
      points: proof,
      max: 20,
      notes: proof ? "guarantee or social-proof evidence found" : "no guarantee, testimonial, or countable proof found",
    },
    {
      dimension: "call to action",
      points: cta,
      max: 16,
      notes: hasCta ? "imperative CTA present" : "no actionable verb",
    },
  ];

  return {
    offerId: "",
    offer,
    score,
    grade,
    flags,
    breakdown,
    scoredAt: input.scoredAt ?? new Date().toISOString(),
  };
}
