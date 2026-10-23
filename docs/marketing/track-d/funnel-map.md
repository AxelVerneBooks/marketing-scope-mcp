# The tunnel funnel — every free door, one hub · built 2026-10-23 (Fri)

Goal unchanged: first **real** Starter sales → the $100 + 1-payout gate →
Track D's 4-email workflow unlocks. This doc is the *omnichannel* layer on
top of `drip-campaign.md` (the schedule) and the MCP SOCIAL KIT (the
conventions). Same guardrails, one new spine: **all roads lead to /buy/**.

## 0. The Google AdSense mixup — read before spending any hope on it

The videos-idea is real but the tool is misremembered:

- **Google AdSense** = a program where *you* display other people's ads on
  **your videos/pages** and Google pays **you**. It puts ads ON a thing you
  already have traffic to. It sends **nobody anywhere** — it cannot get your
  videos more views. It's a revenue tap, not a funnel.
- **Google Ads (incl. the YouTube "Promote"/"Boost" buttons)** = the opposite
  direction: *you pay Google to show your content to strangers*. There is no
  free tier, and no "settings" that make ordinary videos rank/serve more via
  ad machinery. Promotional "free ad credit" offers (e.g. new-account coupons)
  are still paid spend under a coupon — the campaign's $0-spend discipline
  says no, and it's also the product's literal story ("we pre-flight even the
  free version"), so running ads inside this campaign would undercut it.
- **What actually IS free on Google's side** (used / usable now):
  - **IndexNow pinging** — the site already ships a key (`.indexnow-key` +
    `39217110f97b4a24bd507fda66021ea8.txt` in the repo root). Ping after
    every meaningful page change. Done this pass for `/buy/` (see deploy log).
  - **Search Console** — submit/inspect the free pages; the compounding side
    is SEO pages answering queries the audience already types
    ("what is model context protocol", "mcp server examples" — already in the
    Month-2 bets list as the SEO-guides bet).
  - **YouTube Shorts** = an *organic* channel: reposting the TikTok video as
    a Short costs nothing and YouTube's algorithm feeds Shorts to non-followers
    the same way TikTok does. No "Boost" button, no Ads account. (Video 1
    lands 10-27; crosspost it same day — it's a fresh channel, so no 72h
    conflict.)
  - **Things that LOOK free but aren't**: TikTok Promote (paid), YouTube Ads
    (paid), "AdSense for your own site" on axelverne.com (possible later,
    but it monetizes the Books traffic we want, and ads on the author's
    practical-AI site would read as exactly the noise this brand distinguishes
    itself from — parked, not scheduled).

## 1. The spine: one hub, every door

The tunnel concept in one line: **each social is an entrance, the hub is the
destination** — never make a social post carry the whole funnel.

```
Hook (any social, free value, persona-appropriate)
   →  HUB: axelverne.com/buy/            ← the tunnel: everything on one page
        → free: the one-page offer-scoring checklist ($0+, $5 tip suggested)   [LIVE]
        → $9: Campaign Pre-Flight Starter Kit (built server + worked run)     [LIVE]
        → free paths: MCP books sample chapters, prompt-library, the repo
        → paid shelf: the books (students of the free servers)
   →  checklist receipt page w/ Starter pointer                                [LIVE]
   →  gate: $100 earnings + 1 payout → email leg 3 exists → re-plan
```

Why /buy/ and not the homepage: it already is the master page
(`MCP-SOCIAL-KIT.md` §0 designates `https://axelverne.com/buy/` with
`utm_medium=profile-or-bio&utm_campaign=evergreen`), it lists **every**
product, and — as of this pass (2026-10-23) — it now leads with an MCP Tools
zone: free checklist card → Starter card → the free-servers shelf, above the
books. Before that upgrade, a stranger arriving at /buy/ saw only books and
the funnel entry was a homepage anchor — a long click-ahead for a cold visitor.

Every profile/bio/link-in-bio points at the hub with the evergreen scheme:

```
https://axelverne.com/buy/?utm_source={channel}&utm_medium=profile-or-bio&utm_campaign=evergreen
```

In-post links (when the post's rules allow a link) stay Track-D-wise:
`utm_campaign=starter-launch` with a per-slot `utm_content` — per the
drip's UTM table. Bios are evergreen on purpose: they outlive any one launch.

## 2. Every free channel — the door inventory

State: what exists today. Doors marked ⚙ are settings/logistics changes, not
posts. All times/spacings inherit `drip-campaign.md` (72h same-channel rule,
48h reply windows, disclosure, ACTIVITY-LOG).

| # | Door | State | Where it sends people | UTM shape |
|---|------|-------|----------------------|-----------|
| D1 ⚙ | **TikTok bio → /buy/** | set BEFORE recording video 1 (S5 pre-check) | hub | `source=tiktok&medium=profile-or-bio&campaign=evergreen`(supersedes drip's homepage-anchor bio; /buy/ now carries the funnel) |
| D2 ⚙ | **X profile bio/pinned → /buy/** | unchanged evergreen | hub | `source=x&medium=profile-or-bio&campaign=evergreen` |
| D3 ⚙ | **LinkedIn profile sites/greeting → /buy/** | one-time set | hub | `source=linkedin&medium=profile-or-bio&campaign=evergreen` |
| D4 ⚙ | **Gumroad profile header link → /buy/** (storefront parity) | one-time set | hub | `source=gumroad&medium=profile-or-bio&campaign=evergreen` |
| D5 ⚙ | **GitHub book-repo README** (mcp-for-homelab-companion) | E3 — already planned in kit | book page (kit §0) | `source=github&medium=readme&campaign=companion-repo` |
| D6 | **Quora A1–A3** | pre-approved, ≤3/wk (kit) | book pages, sample chapters | per-question `q3/q4/q5` campaigns |
| D7 | **Reddit r/selfhosted** (one-time MCP-homelab value comment) | approved once (kit §2) | no link in-body; bio carries hub | none in comment; bio UTM does the work |
| D8 | **X posts** — A2 thread (S1) + A3 standalone (S7) | drafted, scheduled | checklist/Starter | `campaign=starter-launch`, `utm_content=x-p4` / `x-standalone` |
| D9 | **LinkedIn post** (S3) | drafted | Starter via first comment | `content=li-dev` |
| D10 | **TikTok video 1** (S5) | drafted; beat sheet ready | bio → hub (D1) | none in caption (caption stays link-free) |
| D11 | **YouTube Shorts crosspost** of TikTok video 1 | NEW — free organic reach | channel bio → hub | `source=youtube&medium=shorts-bio&campaign=evergreen` |
| D12 ⚙ | **IndexNow ping** (/buy/ + free pages) | working; ping after each meaningful change | search bots, not humans | n/a |
| D13 | **Free checklist PDF** (Gumroad, $0+, $5 suggested) | LIVE 10-21 | Starter pointer on receipt | `source=gumroad-receipt&campaign=starter-launch` |
| D14 ⚙ | **Checklist→Starter checkout upsell** | **still open** (lever audit #2) — one click on Gumroad, highest-conversion spot of all | Starter card-out customers | n/a (on-platform) |
| D15 | **axelverne.com free band (#mcp-tools)** | LIVE 10-21 with strip | Starter/checklist | `content=launch-strip` / `checklist-fallback` |

Deliberately NOT open under this campaign (standing exclusions, restated):
Whop cross-post (storefront parity exists; not measured), r/LocalLLaMA +
r/msp (no permission), paid anything (Ads/TikTok Promote/Boost/Product
Hunt's paid tier), and — the registry guardrail — no directory-submitting until
Nov 22 or a maintainer reply. Month-2 bets (Product Hunt launch, SEO guide
pages, newsletter outreach) stay behind their own approval gate.

## 3. What "one tunnel" changes in practice

1. **Post rules do not move**: links-in-post only where a channel's culture
   allows (X final post, LinkedIn first comment); Instagram-style channels
   (TikTok bio, Shorts bio) always carry the hub instead of a naked link —
   precisely why the hub had to lead with free+cheap tools, not just books.
2. **Attribution stays clean**: profile/bios are `campaign=evergreen`,
   in-post links are `campaign=starter-launch`; a sale through the bio can
   be told apart from a sale through a launch post by source color alone.
3. **The 30-day mix rule governs volume** (CONTENT-CALENDAR): 60%
   educational / 25% community / 15% promo-adjacent. The tunnel adds doors —
   it does not add posts.
4. **Two bio conventions collide; this doc resolves it**: drip S5's bio
   line (homepage anchor, `campaign=starter-launch`) is superseded for the
   bio itself by the /buy/ evergreen bio (this doc). Drip in-post UTMs keep
   `starter-launch`. If a future post means "link to my things — now",
   the post may also carry the evergreen hub link (e.g. X profile replies).

## 4. Same-day deploy record (2026-10-23)

- `buy/index.html` upgraded: MCP Tools zone added above the books (free
  checklist card at $0+, Starter card at $9, free-servers shelf), meta
  description + og:description now say "tools and books", JSON-LD ItemList
  carries the two new entries (checklist, Starter) before the book entries.
- Deployed via `tools/deploy.js buy/index.html` (schema gate → backup →
  FTPS upload → byte-verify). Live checks + IndexNow ping logged in the
  verification appendix of the session memory.
- Landing links inside the hub keep their own UTMs
  (`utm_medium=buy-page&utm_campaign=starter-launch`,
  `utm_content=checklist-card` / `starter-card`), so the hub is itself
  measurable as a funnel stop.

## 5. The "every free way" catalog — beyond doors, in priority order

Operative rule: a door is free if setting it up costs $0 and no paid reach.
Ranked by expected marginal value per hour, given 0 sales so far
(traffic diagnosis beats price tinkering until someone actually visits the checklist):

1. Make the hub carry the funnel (done — D0), because every other door
   improves when the destination is stronger.
2. **D14 checkout upsell** — already designed, one setting, highest
   conversion adjacency (the visitor already has a card out — walk them one step to the $9).
   Still awaiting a go in the lever-audit step 2.
3. Cross-post video 1 as a YouTube Short (D11) — free parallel reach; nudge
   "print the rubric" free-first tone from the beat sheet §3.
4. Keep every drafted social slot as scheduled (S1–S10) — the tunnel's
   spokes are already loaded; nothing new is queued on top.
5. IndexNow/SEO compounding: the two planned SEO guide pages stay a
   Month-2 bet (needs new page build, not content wiring).
6. GitHub README Track-D pointer: the marketing-scope-mcp repo README could
   carry a 1-line + disclosure pointer to the Starter zip's worked run
   (and the free checklist). Cost: zero. Needs one go (public repo edit).
7. Gumroad storefront detail: show sales count once ≥5 real sales exist
   (lever audit "non-lever until then").
8. The planned email leg (Track D's 4-email workflow) remains gated on the
   payout gate — the tunnel's last door deliberately locked.

## 6. Honest limits of this doc

- No channel here has click-attribution data yet (2 posts pending) — expected
  value is stability, not a performance claim.
- The hub upgrade can only improve *quality of the destination*; it cannot
  create traffic by itself. The escalation ladder (`drip-campaign.md` §
  Escalation) stays the tiebreaker: 0sales by S7 → traffic diagnosis, not
  a new doc.
- "Free AdSense money on the site" gets re-examined at the Month-1 review if
  books traffic alone justifies it; parked until then to protect the brand's
  no-ads story.
