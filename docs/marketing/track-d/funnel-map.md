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
| D1 ⚙ | **TikTok bio → /buy/** | strings ready (funnel-map §7) — set BEFORE recording video 1 (S5 pre-check) | hub | `source=tiktok&medium=profile-or-bio&campaign=evergreen`(supersedes drip's homepage-anchor bio; /buy/ now carries the funnel) |
| D2 ⚙ | **X profile bio/pinned → /buy/** | strings ready (funnel-map §7) | hub | `source=x&medium=profile-or-bio&campaign=evergreen` |
| D3 ⚙ | **LinkedIn profile sites/greeting → /buy/** | strings ready (funnel-map §7) — one-time set | hub | `source=linkedin&medium=profile-or-bio&campaign=evergreen` |
| D4 ⚙ | **Gumroad profile header link → /buy/** (storefront parity) | strings ready (funnel-map §7) — one set | hub | `source=gumroad&medium=profile-or-bio&campaign=evergreen` |
| D5 ⚙ | **GitHub book-repo README** (mcp-for-homelab-companion) | E3 — already planned in kit | book page (kit §0) | `source=github&medium=readme&campaign=companion-repo` |
| D6 | **Quora A1–A3** | pre-approved, ≤3/wk (kit) | book pages, sample chapters | per-question `q3/q4/q5` campaigns |
| D7 | **Reddit r/selfhosted** (one-time MCP-homelab value comment) | approved once (kit §2) | no link in-body; bio carries hub | none in comment; bio UTM does the work |
| D8 | **X posts** — A2 thread (S1) + A3 standalone (S7) | drafted, scheduled | checklist/Starter | `campaign=starter-launch`, `utm_content=x-p4` / `x-standalone` |
| D9 | **LinkedIn post** (S3) | drafted | Starter via first comment | `content=li-dev` |
| D10 | **TikTok video 1** (S5) | drafted; beat sheet ready | bio → hub (D1) | none in caption (caption stays link-free) |
| D11 | **YouTube Shorts crosspost** of TikTok video 1 | adapted + post-ready (launch-push-drafts §3b; URL string ready §7 below) — 10-27, same window as S5 | channel bio → hub | `source=youtube&medium=profile-or-bio&campaign=evergreen`(§7's `source=youtube` URL — one tag covers channel + Shorts; the earlier `shorts-bio` medium here is superseded) |
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

## 7. Bio strings (paste-ready) — doors D1–D4 + Shorts bonus · prepared 2026-10-23

Every destination is the evergreen hub URL. Counts below are exact (counted
programmatically the day they were written); re-count if you edit a word.

### D1 — TikTok (`@alphafuturesclipshi`, repurposed as Axel Verne)

Bio text field — **79 of 80 chars**, fits without a trim:


```text
Practical AI tools & agents · free scoring rubric + $9 kit · axelverne.com/buy
```


If the account is switched to Business (free) and the **Website** field
becomes available, use the full UTM URL there and a shorter 69-char bio:

```text
Practical AI tools & agents · free scoring rubric · axelverne.com/buy
```

```text
https://axelverne.com/buy/?utm_source=tiktok&utm_medium=profile-or-bio&utm_campaign=evergreen
```


Honest caveats: personal accounts without 1k followers don't get a clickable
website field (Business accounts get domain-linked sites; axelverne.com must
be verified in TikTok Business settings first). Either way the domain is
visible text even when it isn't a link. This bio is the S5 pre-check — set it
BEFORE recording video 1. Username lock on `@alphafuturesclipshi` expired
2026-10-22; `@axelverne.ai` was free at last check, but a rename would orphan
the account row in ACCOUNTS.md — if you rename, update that file.

### D2 — X (160-char bio)

**133 of 160 chars**:

```text
MCP books + free tools. The one-page offer-scoring rubric is free; the $9 starter kit runs it for you. Everything: axelverne.com/buy
```


Plain domain in the bio (it t.co-links automatically). The account itself
(own handle vs. existing Clipjitsu) is still Jason's call per the social kit
§3 gate — paste-ready either way. Optional pinned post after the account
decision: use X thread S1's final-post shape, evergreen timing.

### D3 — LinkedIn (Jason's profile, manual)

Headline (up to 220) — **138 chars**:

```text
Practical AI + MCP: books, the free offer-scoring rubric, and the $9 kit that automates it — tools & books on one page: axelverne.com/buy
```


Two placement notes: LinkedIn parses the URL automatically in headline AND
contact info; also add the hub under **Contact info → Website** (type Personal)
with the full UTM URL, and to the **Featured** section as a titled card:

```text
https://axelverne.com/buy/?utm_source=linkedin&utm_medium=profile-or-bio&utm_campaign=evergreen
```

Optional featured-card title: "Free scoring rubric + starter kits — one page".
LinkedIn posts (S3) keep their own `campaign=starter-launch` in-post UTMs —
the bio stays evergreen, per §4's rule (bios outlive launches, posts don't).

### D4 — Gumroad storefront (storefront parity, one-time)

Where it goes: gumroad.com/profile → **Bio** field (verified live 2026-10-23:
the profile settings offer Name + Bio only, no dedicated links field — the
URL rides as text at the end of the bio, appended below the existing
Hermes-perspective paragraph, which stays untouched):

```text
All tools, starter kits & books on one page: axelverne.com/buy
```

(Existing bio is 388 chars with no enforced maxlength on the field; + 62 =
450, still small enough that a platform-side cap (if one exists) won't bite.
Paste it AFTER the existing Hermes-perspective paragraph, a blank line
between — that paragraph stays untouched.) Honest caveat: whether Gumroad's
profile page linkifies URL text in the bio wasn't verified this pass; either
way buyers who Google the domain land on the hub. If the bio ever renders as
a live link, use the tagged URL so the traffic stays attributable:

```text
https://axelverne.com/buy/?utm_source=gumroad&utm_medium=profile-or-bio&utm_campaign=evergreen
```

The plain domain is fine when the bio stays plain text — the tagged version
only matters once links actually pass.

One misuse guard: never paste `axelverne.gumroad.com` — that subdomain is a
dead 404 (documented in ACCOUNTS.md); the store lives at
`alohahilo.gumroad.com`.

### D11 prep — YouTube channel bio (the Shorts-crosspost door)

```text
https://axelverne.com/buy/?utm_source=youtube&utm_medium=profile-or-bio&utm_campaign=evergreen
```

`source=youtube` covers both channel and Shorts crossposts (D11) — one tag,
however the Short was reached.

Paste order recommendation: D1 first (hard gate — video 1 records 10-27),
then D4, D2, D3. One-line disclosure reminder: TikTok/X/LinkedIn posts of
Launch-Kit content disclose authorship per campaign rules; a bio line listing
your own products is implicit authorship, no extra disclosure needed there.

