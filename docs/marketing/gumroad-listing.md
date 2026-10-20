# Gumroad lead-magnet listing — "Campaign Pre-Flight: the one-page offer scoring checklist"

Built 2026-10-20 · the $0+ free listing (PWYW minimum $0, per Track C's verified
mechanics — free products carry a lower file-size limit; the one-page PDF under
10 KB respects it with room to spare). This file is the paste-copy for the
dashboard; the PDF it sells is
[lead-magnet-offer-scoring-checklist.pdf](lead-magnet-offer-scoring-checklist.pdf).

## Product settings checklist (dashboard, do-not-copy)

- [ ] Price: **Pay What You Want, minimum $0** (free listing, forced-PWYW like Track C)
- [ ] File: the one-page PDF only — nothing bundled; keep it tiny
- [ ] Related products: the $9 Starter kit (set after that listing exists — Track C pattern)
- [ ] Workflow: attach the 4-email sequence below to the free-purchase event
- [ ] Rating reviews on; short support note instead of an email address
- [ ] Content page: paste the "What's inside" copy below; thumbnail = the
      400×400 logo (`docs/logo/logo-400.png`) cropped square (Track C used a
      600×600 dark-terminal square — reuse that recipe from trackC §9)

## Listing title

**Campaign Pre-Flight: the one-page offer scoring checklist**

## Listing description (paste text)

> Score any offer 0–100 in under a minute — with the rubric an actual MCP server
> runs mechanically.
>
> A vague ad, a flat "buy my book", a launch that burns $200 of ads in a weekend —
> the difference between a campaign that compounds and one that dies is *how the
> offer was scored before the money moved*. This one page is the scoring rule the
> **marketing-scope-mcp** server applies to every offer it grades — the five
> dimensions with their exact weights, the grade bands, the flags that hand your
> weak spots back to you on a plate, and the kill rules that tell you when to
> stop spending and rework the offer instead.
>
> Inside:
> - the five scoring dimensions with their exact weights (offer clarity 20 /
>   audience specificity 24 / differentiation 20 / proof & risk reversal 20 /
>   call to action 16 — rubric v1, matching server 0.1.0)
> - the grade bands (A ≥ 80 down to D) and the kill rules ("every scored offer
>   below 45 → stop, rework before spending anything on traffic")
> - the campaign-plan shell — one strategy section, numbered channel briefs
>   (offer registry [O1], [O2]…), and the tactic gate: every tactic must cite a
>   scored offer AND name a success metric before it runs
> - the 4-step tool loop (plan → score → build → check) the server automates
>
> Free. Print it, tape it beside your launch-planning desk. When you want the
> machine that runs it, the $9 Starter kit is one click away in the recommended
> products.

## The 4-email workflow (Gumroad Workflow, attach to free purchase)

**Email 1 — immediately on free purchase. Subject: "Your offer scoring checklist —
and the 15-second version"**
> The checklist is attached (or one click away). Fastest possible start: take the
> last offer you ran — or the one you're about to run — and score it in the
> margins. Five dimensions? One number? Grade band?
>
> If that took 90 seconds to hand-score, hold that thought — the server runs this
> mechanically on every offer you feed it, and it refuses to build a campaign
> around an offer that never got scored — the gate fires before the money moves,
> not after. (Tomorrow: the one failure we see constantly, and the 30-second fix.)

**Email 2 — +1 day. Subject: "The failure mode: the campaign that ships with a
metric-less tactic"**
> True story from our runs: every tactic in the plan cites an offer, everything
> looks launched — and half the tactics name no success metric. Six weeks later
> nobody can say what worked, so the next budget decision is a guess with a
> budget attached.
>
> The 30-second fix (it's now a printed rule on the checklist): a tactic that
> cites [O1] but names no metric FAILS the plan check — "orphan tactics return
> as an error list, never a pass." Run check_plan the morning you finalize, same
> spirit as re-fetching sources before you publish a report: an unmeasured
> tactic is a dead link to your own decision-making.
>
> Full gating behavior is in the repo's integration tests if you want the receipts.

**Email 3 — +3 days. Subject: "When you're ready to stop hand-scoring" (the $9
starter pitch, stated plainly)**
> Three things you get the moment you want this done by machine:
>
> 1. The server itself — plan_campaign, score_offer, build_plan, check_plan;
>    stdio for Claude Code/Cursor/Cline, stateless Streamable HTTP if you host it.
> 2. The one-block client configs from the README — clone, build, first run in
>    four steps.
> 3. The scoring appendix on every plan — per-dimension evidence flags
>    (no-price, no-proof, unclear-audience, no-cta) you can audit, not a vibe.
>
> $9 Starter gets the server + one worked campaign + install support. $19 Kit
> adds the launch field guide + both worked runs + version-pinned updates. No
> bundle pressure; if the checklist already changed how you plan launches, the
> Starter is the natural next step — that's the whole pitch.
> → [Starter kit link goes here — build the $9 Starter listing first if possible]

**Email 4 — +7 days (and reusable as a customer broadcast). Subject: "Offer rubric
v1.1 — what we're watching"**
> Heads-up from behind the curtain: the rubric is versioned like the server
> because registry metadata is immutable; you'll see v1 → v1.1 in CHANGELOG
> entries, never as silent swaps. What we're watching before the next bump: how
> the proof dimension should treat borrowed social proof (a competitor's
> testimonial in your ad), since right now it scores like your own.
>
> Nothing needs action here — this is what the updates list is for. The
> checklist PDF you took is yours; the history of rubric versions stays
> explained in the kit's CHANGELOG, which the Starter tier includes first.

## Placement wiring (mirror of Track C)

- The paid Starter page's related-products row: lead magnet (visible as
  "FREE — start here"), Field tier ($49) above Starter.
- Kit product page may embed a second lead magnet later — one capture asset
  per product family maximum, per the plan's subscriber-segmentation rule
  (this list is marketers/operators; the books audience stays segregated).
