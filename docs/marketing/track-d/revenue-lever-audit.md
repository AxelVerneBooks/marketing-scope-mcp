# Gumroad revenue-lever audit — Track D payout gate · 2026-10-20

Question: which Gumroad settings raise **net revenue per visitor** toward the
$100-earnings + 1-payout gate (workflow publishing unlock)?

Gate state (verified 2026-10-20): total earnings $0.00 · balance $0.00 ·
payouts 0 — the gate is 100% about real revenue from here.

## Settings read live from the product editors (same day)

| Setting | Checklist (`njykj`, $0+) | Starter (`aatzot`, $9) |
|---|---|---|
| PWYW | forced ON (free product) | OFF |
| Suggested amount | **EMPTY** ← lever A | n/a |
| Minimum amount | $0 | n/a |
| Installments | off (incompatible w/ PWYW) | off |
| Auto discount code | none | none |
| Show sales count | off | off |
| Quantity | off | off |
| VAT e-pub flag | off | off |

Note: no Discover opt-in/opt-out toggle exists in either product editor, and
`settings/discover` / `discover/sell` are 404 in this account — Discover
placement is managed by Gumroad, not a per-product checkbox (researcher could
not verify an official toggle either).

## Fee economics (verified from Gumroad's live pages)

- **Direct/profile sale:** 10% + 50¢ platform + 2.9% + 30¢ processing →
  $9 Starter nets **$7.04**
- **Discover sale:** flat **30%** incl. processing → $9 nets **$6.30**
- Blended impact if some sales arrive via Discover: 20% share = $6.89 net
  (≈15 sales to gate), 50% share = $6.67 net (≈15 sales). **Discover is
  approximately fee-neutral toward the gate** — its real value is incremental
  strangers, not margin.

## Lever A (primary): set a PWYW suggested amount on the checklist

Current state: suggestion box empty → Gumroad shows "0$" and most buyers
type $0. Setting a suggestion monetizes goodwill from people who intended to
tip. Recommended: **$5** (same price-arc as the Starter; doesn't shame
$0-takers).

- At 20% suggested-price adoption: +$1.00/buyer average
- At 35%: +$1.75/buyer
- At 50%: +$2.50/buyer

Risk: near-zero (PWYW stays on; $0 still allowed). Don't set a minimum —
the checklist's job is reach, not margin.

## Lever B (secondary): minimum $1 on the checklist

Frames the product as at-least-a-dollar and converts accidental $0 default.
Trade-off: adds friction on a top-of-funnel asset; only after Lever A proves
behavior (a few weeks of suggested-price data).

## Lever C: buy-button text / receipt upsell / upsells at checkout

- **Upsell at checkout:** Gumroad supports post-cart "suggest another
  product" — pair cheecklist → Starter ($9) as the one upsell. Highest-leverage
  feature for the gate: the visitor already has a card out.
- **Custom receipt text:** add one line to the checklist's receipt page
  pointing to the Starter (copy already drafted in launch-push-drafts.md §1).
- **CTA wording:** checklist already uses "I want this!" — test "Get the kit"
  later; low priority.

## Non-levers (checked, do nothing)

- Installments: unavailable with PWYW; irrelevant at $9.
- Quantity: single-unit digital; no effect.
- VAT flag: e-publication flag affects EU VAT handling, not net revenue here.
- Sales-count visibility: social proof lever for conversions, not net/visitor —
  turn on once ≥ 5 real sales exist.

## Recommended immediate actions (this week)

1. ~~Set **suggested amount $5** on the checklist (5 min, reversible).~~
   **APPLIED 2026-10-21:** set in the product editor, reload-persistent,
   buyer-facing `$5+` placeholder verified on the live checkout (listing price
   still reads $0+, $0 still allowed).
2. Enable the **checklist → Starter checkout upsell** (10 min). — still open.
3. ~~Add the one-line Starter pointer to the checklist's receipt text.~~
   **APPLIED 2026-10-21:** custom receipt message (379/500 chars) saved on the
   product's Receipt tab — "Score an offer before you spend…" + the Starter
   URL with `utm_source=gumroad-receipt&utm_campaign=starter-launch`.
   Reload-persistent and visible in the Receipt tab's rendered preview inside
   the buyer email (above "View content").
4. Re-run the earnings poller after the first real visitor day; compare
   average order value before/after Lever A.

## Verification log (what was actually checked)

- Checklist edit page: PWYW on, suggested EMPTY, minimum $0, installments
  off (read from the editor DOM, today). **Update 2026-10-21: suggested now
  = $5 (see Applied above) — the empty-field reading earlier in this bullet is historical.**
- Starter edit page: PWYW off; no Discover toggle on either product.
- `settings/discover` and `discover/sell`: 404 in this account.
- Discover fee 30% / direct 10% + 50¢: confirmed from Gumroad's live pricing
  page + fees help article (researcher-web, same day). Per the researcher,
  the exact direct-sale processing split (2.9% + 30¢) could not be
  re-verified from public text this pass — it matches what Gumroad charged
  on Track C's direct sales, but treat the $7.04 net as approximate until a
  first real sale line item confirms it.
