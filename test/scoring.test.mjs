/** Unit tests for the offer-strength scorer (src/scoring/offer.ts). */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { scoreOffer } from "../dist/scoring/offer.js";
import { STRONG_OFFER, WEAK_OFFER } from "./helpers.mjs";

const dim = (s, name) => s.breakdown.find((b) => b.dimension === name);
const score = (offer, audience) => scoreOffer({ offer, audience });

describe("scoreOffer", () => {
  test("a specific, proven, priced offer with a CTA grades A", () => {
    const s = score(STRONG_OFFER);
    assert.equal(s.grade, "A");
    assert.ok(s.score >= 80, String(s.score));
    assert.deepEqual(s.flags, []);
  });

  test("vague buzzword copy grades D with the expected flags", () => {
    const s = score(WEAK_OFFER);
    assert.equal(s.grade, "D");
    for (const f of ["no-price", "no-concrete-deliverable", "unclear-audience", "no-uniqueness-marker", "no-proof", "no-cta", "too-thin"]) {
      assert.ok(s.flags.includes(f), f);
    }
    assert.match(dim(s, "offer clarity").notes, /vague words: revolutionary, world-class, solutions/);
  });

  test("breakdown points sum to the score and never exceed their max", () => {
    for (const offer of [STRONG_OFFER, WEAK_OFFER, "Get the free checklist today", "A guide for nurses who work nights, $9 — buy now"]) {
      const s = score(offer);
      assert.equal(s.breakdown.reduce((a, b) => a + b.points, 0), s.score);
      for (const b of s.breakdown) assert.ok(b.points <= b.max && b.points >= 0, `${b.dimension} ${b.points}/${b.max}`);
      assert.deepEqual(s.breakdown.map((b) => b.max), [20, 24, 20, 20, 16]);
    }
  });

  test("grade thresholds", () => {
    for (const offer of [STRONG_OFFER, WEAK_OFFER, "Join the course for nurses who work nights, $29, only one with case studies"]) {
      const s = score(offer);
      assert.equal(s.grade, s.score >= 80 ? "A" : s.score >= 65 ? "B" : s.score >= 45 ? "C" : "D");
    }
  });

  describe("clarity", () => {
    test("price tokens: $, USD, % off, free, pwyw", () => {
      for (const o of ["Only $19 today", "Costs USD 40 total", "Save 30% off the bundle", "Grab the free sample", "It is pwyw this month"]) {
        assert.ok(!score(o).flags.includes("no-price"), o);
      }
      assert.ok(score("A thing that does stuff").flags.includes("no-price"));
    });
    test("deliverables match whole words only (regression: 'app' in 'happy', 'book' in 'facebook')", () => {
      for (const o of ["Be happy with our facebook friends", "Apply your planet-scale skit energy"]) {
        assert.ok(score(o).flags.includes("no-concrete-deliverable"), o);
      }
      for (const o of ["A checklist for launches", "Two templates and a spreadsheet", "Our new app for you", "Three ebooks bundled"]) {
        assert.ok(!score(o).flags.includes("no-concrete-deliverable"), o);
      }
    });
    test("deliverable named only in the audience statement still counts", () => {
      assert.ok(!score("Something useful arriving soon", "people who want a workbook").flags.includes("no-concrete-deliverable"));
    });
  });

  describe("audience specificity", () => {
    test("an explicit audience statement counts as a named segment (regression)", () => {
      const without = score("A ledger, only $19. Start today.");
      const withAudience = score("A ledger, only $19. Start today.", "small-hold market farmers");
      assert.ok(without.flags.includes("unclear-audience"));
      assert.ok(!withAudience.flags.includes("unclear-audience"));
      assert.equal(dim(withAudience, "audience specificity").points - dim(without, "audience specificity").points, 12);
    });
    test("'for <segment>' counts, including with an article", () => {
      for (const o of ["A guide for nurses who work nights", "Built for the busy founder", "A kit for an indie developer"]) {
        assert.ok(!score(o).flags.includes("unclear-audience"), o);
      }
    });
    test("'for free', 'for everyone', 'for a limited time' are not audiences", () => {
      for (const o of ["Get the guide for free", "Solutions for everyone today", "Available for a limited time", "Made for you and only you"]) {
        assert.ok(score(o).flags.includes("unclear-audience"), o);
      }
    });
    test("second person and specificity markers add points", () => {
      assert.equal(dim(score("Your next kit"), "audience specificity").points, 6);
      assert.equal(dim(score("A kit (letter + A4)"), "audience specificity").points, 6);
    });
  });

  describe("call to action", () => {
    test("urgency matches 'ends' as a word only (regression: 'friends', 'trends', 'spends')", () => {
      assert.equal(dim(score("Join our friends who follow trends and spends"), "call to action").points, 10);
      assert.equal(dim(score("Join now, the launch price ends Friday"), "call to action").points, 16);
    });
    test("missing CTA is flagged", () => {
      assert.ok(score("A ledger for farmers at $19").flags.includes("no-cta"));
    });
  });

  test("proof and track record", () => {
    assert.equal(dim(score("Money-back guarantee, featured in Modern Farmer"), "proof & risk reversal").points, 20);
    assert.ok(score("A plain ledger, nothing else").flags.includes("no-proof"));
  });

  test("length flags", () => {
    assert.ok(score("Short offer").flags.includes("too-thin"));
    assert.ok(score(Array(130).fill("word").join(" ")).flags.includes("unfocused-length"));
  });

  test("trims the offer and honors scoredAt", () => {
    const s = scoreOffer({ offer: "  padded offer text here  ", scoredAt: "2026-01-01T00:00:00.000Z" });
    assert.equal(s.offer, "padded offer text here");
    assert.equal(s.scoredAt, "2026-01-01T00:00:00.000Z");
  });
});
