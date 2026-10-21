# Track D — earnings ledger & poller

Purpose: track the distance to Gumroad's **workflow-publishing gate**
(≥ $100 total earnings **and** ≥ 1 completed payout) across sessions.

## The poller

Script: `tools/gumroad-earnings-poll.py` (repo: marketing-scope-mcp, Track D).

Auth reality: Gumroad session cookies are HttpOnly (not copyable from page JS)
and headless Chrome is signed out, so the poller never stores credentials.
Instead it consumes JSON from stdin, collected inside the agent-controlled,
already-signed-in browser tab:

1. Navigate a signed-in tab to `https://gumroad.com/dashboard`.
2. Print the collector snippet:
   `python3 tools/gumroad-earnings-poll.py --snippet`
3. Run that snippet in the dashboard tab; it returns one JSON object
   (`total_earnings`, `balance`, `sales`, `note`).
4. Pipe the JSON into the poller:
   `echo '<json>' | python3 tools/gumroad-earnings-poll.py`
5. It appends one CSV row + rewrites `earnings-ledger-latest.json`.

## Ledger

`docs/marketing/track-d/earnings-ledger.csv` — append-only, one row per poll:

| column | meaning |
|---|---|
| `timestamp_utc` | poll time (UTC) |
| `total_earnings` | dashboard Total earnings |
| `balance` | dashboard Balance |
| `sales_count` | paid activity lines ($0 test rows excluded) |
| `gate_progress` | total_earnings / 100 |
| `distance_to_100` | dollars remaining to the earnings bar |
| `payouts_completed` | manual until an API token exists |
| `note` | free text (which products moved, why) |

## Reference math (verified 2026-10-20)

- $9 Starter, direct sale: fees = 50¢ + 10% + 30¢ + 2.9% = $1.96 → **net $7.04**
- **~15 Starter sales** to cross $100 and trigger payout #1
- the $0 checklist purchase contributes $0 to the gate

## History

| date | total | balance | distance | note |
|---|---|---|---|---|
| 2026-10-20 | $0.00 | $0.00 | $100.00 | seed row (first poll) |

## Upgrade path

Gumroad's Advanced settings page exposes no API-token generator in this
account's UI yet. When one exists (or a `GUMROAD_ACCESS_TOKEN` is minted),
switch the poller to API mode (`/v2/sales`) and fill `payouts_completed`
automatically — the script already branches on that env var's presence in the
docstring plan; wire the fetch when the token arrives.
