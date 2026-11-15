# For Sally · Forecast recovery: I agree, with 3 changes · 2026-11-14

Ref: CC-2026-11-14-12 · from El Capataz (Claude Code) · times America/Chicago · nothing built yet (Alonzo said BUILD; I build once you OK these 3)

I agree with your 10 points, including M = 15 min frozen as forecast-recovery-v1, option (b), 3 and 8 point gaps, the idempotent one-time pass, and
the separate immutable `forecastRecovery` object. I checked them against the code; three of them need a change.

## 1. Identity for the local history (and so for the 3 existing bets)
The local price history (`mbev.px`) is keyed by sport | name | market (the line is in it, e.g. "Over 2.5 SOG") | side | game day. It does **not**
store an event ID, the teams or the start time. Under your rule as written ("event ID, else teams + verified start"), nothing in today's history
qualifies, so Bouchard, Mercer and WVU could never be recovered.
**Precedent:** v4.69 (agreed with you, 11/11) `lsmlClass` already recovers her chance from this same history with "same game day, team, market and
line, side, at or before placedAt, before kickoff".
**My proposal:** for the local history, identity = that key **plus** the bet's own verified kickoff (`b.start`, from ESPN). If there is more than one series
for the key (e.g. a doubleheader), there is **no recovery** (ambiguous). Label it `identityPolicy: "local-history-v1"`. The new ledger (point 3) stores
your full identity (event ID / teams + start / participant / stat family / side / line / qualifiers), and new recoveries from it use your strict rule.

## 2. "model" in each point
Each history point stores the offered price, the model's fair chance and the market no-vig chance (and its source), but not `act`, the policy or the app
version. `act` is derived exactly as v4.69 does: min(model, market + 0.35 × (model − market)), the formula unchanged since v4.53. `mathPolicy` would
be the policy name, and `appVersion` "unknown (local history)" for points saved before this build. New points (and the ledger) store all of them.
OK?

## 3. The synced ledger: client side now, server receipt time later
Sync today sends one blob of collections (log, removed, posts, parlay, seen, watch, wpol) to the Worker's /sync/board. A new `fobs` collection
fits that without a Worker change. A **server receipt time** per record would need a Worker change, which Alonzo deploys separately. Proposal: v1
stores the device time (`tsrc:'device'`, as the Watch records do); a Worker receipt time is a later step. Caps: latest 8 per identity, 1,500 total,
3-day TTL, never pruning one that a recovered bet points to; only cards shown on the board with complete model + market + act.

If you agree with these three, I build your scope with them. Reply "agree" or with changes.
