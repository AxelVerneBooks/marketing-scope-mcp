# Launch push — Campaign Pre-Flight Starter Kit ($9) · draft 2026-10-20

Goal: first **real** Starter sales toward the Gumroad payout gate
($100 earnings + 1 payout unlocks Track D's email workflow).
Math to beat: $7.04 net/sale → ~15 sales closes the gap.
Everything below is paste-ready; claims/prices verified against the live
pages same day (links must 200 before each post goes out).

Funnel shape to respect: the free one-page checklist is the on-ramp
(`offer-scoring-checklist`, $0), the Starter is the machine that runs it
(`marketing-scope-starter`, $9). Both pages link to each other — use the
checklist as the hook in every channel where hard selling is unwelcome, and
the Starter where commerce is expected.

---

## 1. axelverne.com — MCP Tools band add-on (homepage, section #mcp-tools)

Slot: a slim "Launch" strip inside the existing `grid3`, or a one-line
callout under the Set-it-up card. Voice: first-person, plain, no hype —
matches "machines, not books."

> **The Starter Kit is live.** The two free servers stay free — and if you
> want marketing-scope-mcp wired up instead of assembled by hand, the
> **Campaign Pre-Flight Starter Kit** bundles the built dist, one worked
> campaign run (a real pre-spend plan with its offer-registry appendix), the
> 4-step setup, and MIT freedom to sell what it helps you build. $9, one
> file, free lifetime updates — same discipline as the books, in a zip.
>
> → <https://alohahilo.gumroad.com/l/marketing-scope-starter?utm_source=site&utm_medium=mcp-tools-band&utm_campaign=starter-launch&utm_content=launch-strip>
>
> *Not ready to buy? Take the one-page scoring rubric everything above is
> built on — free, no email wall:*
> → <https://alohahilo.gumroad.com/l/offer-scoring-checklist?utm_source=site&utm_medium=mcp-tools-band&utm_campaign=starter-launch&utm_content=checklist-fallback>

HTML-ready version (for the band):

```html
<p class="launch-note">
  <strong>New: the <a href="https://alohahilo.gumroad.com/l/marketing-scope-starter?utm_source=site&amp;utm_medium=mcp-tools-band&amp;utm_campaign=starter-launch&amp;utm_content=launch-strip">Campaign Pre-Flight Starter Kit</a></strong> —
  marketing-scope-mcp prebuilt, with one worked campaign run and 4-step setup.
  $9 · MIT · free lifetime updates. The <a href="https://alohahilo.gumroad.com/l/offer-scoring-checklist?utm_source=site&amp;utm_medium=mcp-tools-band&amp;utm_campaign=starter-launch&amp;utm_content=checklist-fallback">one-page rubric checklist</a> stays free.
</p>
```

### Campaign-page variant (axelverne.com/…, if a dedicated page is wanted)

Head: **Your launch plan has a pre-flight problem.** Body: three beats —
(1) the $0 rubric is the rulebook, print it; (2) the $9 kit is the machine
that enforces the rulebook: kill criteria, 0–100 offer scores, tactic gate;
(3) it ships as a zip you can audit line by line, MIT, no subscription.
Close with the both-links pair above (campaign=starter-launch, content=p1/p2).

---

## 2. X / Twitter (thread: 4 posts, 1 link max before final post)

**1/** Most "AI marketing" tools help you write more tactics. Nobody checks
whether a tactic is connected to a real offer, or names a metric you could
actually lose money on. I built the missing referee and set it loose on its
own kind.

**2/** marketing-scope-mcp (free, MIT, official registry): plans a launch
with kill criteria, scores every offer on an explainable 0–100 rubric — you
can audit the number, not the vibe — then refuses to build a plan where a
tactic cites no scored offer or names no metric. The gate fires before
spend, not after.

**3/** To make it concrete: one worked campaign run ships in the Starter —
a real pre-spend plan for a product launch, with the offer registry and
scoring appendix exactly as the server emitted them. Same JSON you'd get,
verification included.

**4/** The **Campaign Pre-Flight Starter Kit** is $9, ships as one zip
(built server + client configs + the worked run), MIT, free lifetime
updates. If $0 is more your speed: the one-page scoring rubric is free,
no email wall → checklist link. Starter → Gumroad link.
Disclosure: I built it; reg links are mine.

*(Final post carries both links; UTM `utm_campaign=starter-launch`,
`utm_content=x-p4`.)*

### X standalone (one-shot alternative)

Your AI can plan a launch. Can it *refuse* a bad one? marketing-scope-mcp
scored the design and the funded dollars: offer scoring 0–100, kill
criteria, and a tactic gate that fires before spend. Free & MIT — or $9
Starter with a worked campaign run included. Links below; both links live.

---

## 3. TikTok (caption + spoken beat sheet, 30–35s)

**Hook (0–3s):** "The most expensive sentence in advertising is 'let's just
try it and see.'"

**Beats:**
- 3–10s: every failed launch has the same autopsy — no kill criteria, no
  offer score, tactics nobody ties to a number.
- 10–20s: show the terminal: `score_offer("...")` → 0–100 with per-dimension
  evidence → `build_plan` rejecting an unscored offer on screen.
- 20–28s: the free part: one-page rubric, print it, tape it to your monitor.
- 28–35s: the nine-dollar part: server prebuilt + one real campaign run +
  setup in four steps. "It's the referee, not another copywriter."

**Caption:**
The free checklist is the rulebook. The $9 Starter Kit is the machine that
enforces it: marketing-scope-mcp prebuilt + one worked campaign run, MIT,
live on the MCP registry. Links in bio 🧰

*(No price in caption — check bio-link futureproofing; bio must carry the
site's MCP-tools anchor or the /buy/ master page. UTM `utm_medium=tiktok-vid`.)*

---

## 4. LinkedIn / developer-audience short post

Prior versions of tool launches here died from one thing: proving a plan was
good *after* the budget was gone. What marketing-scope-mcp does instead is
mechanical: kill criteria are written before tactics exist, every offer is
graded 0–100 with per-dimension evidence, and a plan fails loudly if
anything is unscored or unmeasured. The referee ships as a $9 zip (built
server, one worked campaign run, 4-step setup) or as free MIT source. The
free one-page rubric is the same rulebook on paper. What's your current
pre-flight check before a launch spend?

---

## Verification checklist before any post (rerun per channel)

- [x] `starter` listing 200 · price shows **$9** · description renders with
      both funnel sentences (checked 2026-10-20, curl + screenshot pass)
- [x] `offer-scoring-checklist` 200 · still $0 (same pass)
- [x] PDF rubric raw link 200 (3,922 bytes, sha `45e783b0` — re-hashed live
      2026-10-20, byte-identical to repo canonical)
- [x] axelverne.com 200 · #mcp-tools band + "MCP Tools (free)" CTA present in
      index.html (checked in source this pass)
- [ ] UTM `campaign=starter-launch` variants present in every posted link
- [ ] Disclosure present (X, Quora-style channels, LinkedIn)

## Ledger hook

After the first tracked sale: rerun the earnings poller
(`tools/gumroad-earnings-poll.py --snippet` in the dashboard tab → pipe to
script). Target row: total_earnings ≥ $100 AND payouts_completed ≥ 1 →
publish the Track D workflow.
