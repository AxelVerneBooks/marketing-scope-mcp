# Track D drip campaign — Campaign Pre-Flight Starter Kit · built 2026-10-21 (Wed)

Goal: first **real** Starter sales → unlock the Gumroad workflow gate
($100 earnings + 1 payout). Plan-of-record: ~15 sales at $7.04 net; the
$5 suggested amount (live since 10-21) shortens that if checklist buyers tip.

Assets inventory (what exists now):
| # | Asset | Where it lives | Status |
|---|---|---|---|
| A1 | `#mcp-tools` launch strip (Starter $9 + checklist fallback, `starter-launch` UTMs) | axelverne.com homepage | **LIVE 10-21** (deploy byte-verified) |
| A2 | X thread — 4 posts, links only on final post + disclosure | `launch-push-drafts.md` §2 | drafted, unposted |
| A3 | X standalone one-shot | `launch-push-drafts.md` §2 | drafted, unposted |
| A4 | TikTok beat sheet (30–35s) + caption | `launch-push-drafts.md` §3 | drafted, unrecorded |
| A5 | LinkedIn developer post | `launch-push-drafts.md` §4 | drafted, unposted |
| A6 | Earnings poller (stdin mode) | `~/Desktop/newproject/tools/gumroad-earnings-poll.py` | working (2 rows) |
| A7 | Baseline ledger row | track-d/earnings-ledger.csv | row 2 @ 2026-10-21 20:06Z ($0 / $100 distance) |
| A8 | Shorts crosspost kit (title/desc/pinned comment + D11 channel strings) | `launch-push-drafts.md` §3b | drafted 10-23, post-ready 10-27 |

Funnel rule that governs the drip (from the drafts): the **free one-page
checklist is the hook** everywhere hard selling is unwelcome; the **$9
Starter is the ask** where commerce is expected. Never flip that order.

---

## Schedule — when & where (all times HST; adjust a slot ±1 day, but never cluster self-promo)

| Slot | Day (date) | Channel | Post | Asset | Link + UTM | Pre-post checks |
|---|---|---|---|---|---|---|
| S0 ✅ | Wed **10-21** | axelverne.com | Launch strip live | A1 | `utm_campaign=starter-launch`, `utm_content=launch-strip` / `checklist-fallback` | done (deploy + live verify) |
| S0.5 ✅ | Wed 10-21 | Gumroad | $5 suggested amount + receipt pointer live | — | `utm_source=gumroad-receipt` | done |
| S0.9 ✅ | Wed 10-21 | Poller | Baseline row 2 | A6 | — | done |
| S1 | Thu **10-22 · ~6:00 a.m. HST** (= Thu noon ET — the classic US dev-audience window) | X | **A2 thread** — links ONLY on post 4, disclosure line | A2 | final post: `utm_source=x&utm_medium=thread&utm_campaign=starter-launch&utm_content=x-p4` (Starter) + `utm_content=x-p4-checklist` (fallback link) | rerun drafts-verification 1–4 (listings 200 w/ prices $9/$0; PDF sha `45e783b0`); X: confirm "replies for 48h" window free |
| S2 | Sat **10-24 · morning HST** | Poller + site | Copy-line check: poll 3, log row; check strip clicks via CF analytics if visible | A6/A1 | — | — |
| S3 | Mon **10-26 · ~6:30 a.m. HST** (= Mon 12:30 p.m. ET — LI midday peak) | LinkedIn | **A5 developer post** (ends in a question, no hard CTA) | A5 | link in comment, not body: `utm_source=linkedin&utm_medium=comment&utm_campaign=starter-launch&utm_content=li-dev` (links-in-comment keeps LI reach; disclosure in post body) | resume-visibility sanity: post from personal profile, not a page |
| S4 | Mon 10-26 · evening | X | engage replies on A2 (<48h), value-only, no new links | — | — | — |
| S5 | Tue **10-27 · ~2:00 p.m. HST** (= Tue 8:00 p.m. ET — US TikTok evening peak; slot is a convention, adjust from observed engagement) | TikTok + YouTube Shorts crosspost | **A4 video 1** ("the referee, not another copywriter") + caption | A4 + A8 | **caption has no link** — bio must carry it (hub): use funnel-map §7 D1 evergreen bio (79/80 chars, supersedes the homepage-anchor line below) BEFORE recording | bio updated first; caption drafts say "links in bio 🧰" — match the live bio or reword; Shorts copy + D11 channel-link setup pre-uploaded via launch-push §3b (fresh channel ⇒ no 72h conflict, same window) |
| S6 | Wed **10-28** | Poller | poll 4 | A6 | — | — |
| S7 | Fri **10-30 · ~9:30 a.m. HST** | X | **A3 standalone** (fresh hook, not a thread rerun) | A3 | both links in one post: `utm_content=x-standalone` (Starter) + `utm_content=x-standalone-checklist` (fallback); disclosure line | re-verify listings 200 (prices can drift) |
| S8 | Sat 10-31 | Poller | poll 5 + **first-sales retrospective**: net/sale from fee line-items vs $7.04 plan | A6 | — | — |
| S9 | Mon **11-02** | TikTok | video 2 ONLY IF video 1 showed real reach (make the call from TikTok analytics at post time); second angle = "print the rubric" (free-first). Record from beat sheet §3 20–28s | A4 | same bio route, `utm_content=tiktok-bio` | — |
| S10 | Wed **11-04** | Poller | poll 6 | A6 | — | — |

Hard rule between slots: **no two promotional posts on the same channel inside
72h**; replies/engagement between slots are encouraged and don't count.

---

## Standing conventions per the MCP SOCIAL KIT (applies to every slot)

1. Persona per post; disclosure on anything linking my own paid product
   ("I built it; links are mine").
2. UTMs pasted exactly as above — no naked links, ever (except TikTok caption,
   which links nothing itself).
3. Replies window ~48h after each post, value-first; the free checklist URL is
   the only thing handed out "after a genuine exchange".
4. Log each post in ACTIVITY-LOG.md (channel · campaign · URL · datetime).
5. Registry guardrail untouched: no Cline/mcp.so/Glama comments until Nov 22
   or a maintainer reply (separate from this drip).

## Measurement loop

- Daily-ish poller: `--snippet` → dashboard tab → JSON → poll (row 2 baseline
  logged 10-21). Each poll reports gate_progress + distance.
- After ANY first real sale: rerun the poller immediately; capture the fee
  line-item to confirm/correct the $7.04 net (never re-verified from public
  docs). Update the ledger note column with fee details.
- **Gate unlocked ($100 + 1 payout):** publish the Track D 4-email workflow
  (the funnel's third leg exists only from that moment) — then republish this
  doc's schedule with email metrics replacing the social slots.

## Escalation / stop rules (from the campaign ethos, not invented mid-flight)

- If by S7 (10-30) there are still 0 real sales: keep slots (traffic is the
  bottleneck, not price), but re-run the revenue-lever audit checklist for
  NEW state (e.g. did anyone visit the checklist page at all? — that's a
  traffic diagnosis, not a price change).
- If a channel shows 0 visit-attribution after two posts: swap the next slot
  of that channel for a repeat in the best-attributing channel instead.
- No engagement-bait, no "as rated…", no numbers you can't show.

## What this drip deliberately does NOT include

- Whop community cross-post (storefront parity exists but Whop buyers differ;
  not measured, so not scheduled — revisit after first Gumroad sale).
- r/selfhosted / r/LocalLLaMA / r/msp: subs are not permission-cleared for
  Track D (kit permits r/selfhosted for MCP-homelab content only, one-time).
  Do not post there under this campaign without a new go-ahead.
- Paid anything — the whole campaign is $0-spend discipline, which is the
  product's own story.
