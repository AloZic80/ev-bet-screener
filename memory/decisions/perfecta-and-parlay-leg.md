# ◎ PERFECTA and 🎟 parlay leg

Status: active, thresholds **frozen** since v4.50 (2026-11-10) · Approved by: Alonzo · Last verified: v4.52

## ◎ PERFECTA: six checks on a best bet (`RING`, `ringOf`)
1. Zone: `actProb` 50% to under 75%.
2. Edge: `actNet` +4% to +12%.
3. Room: `actProb` 2.5 points or more above the price after its fee.
4. Lined up: model ≥ market, and the market alone beats the price.
5. Fresh: price read in the last 10 minutes. "Read" means the price the card shows (`rowSeenAt`, v4.61, owner: "You can decide if you think it's the best
   thing to do", "Ok fix it and build"): a board answer the Worker had saved counts from when it was fetched (`r.priceAt`; no time = unknown, not fresh),
   and a Sentinels press makes a price new only when it read the book the card shows (reading Novig does not make a Bovada price new). The 10 minutes did not change.
6. Clean: no warning, injury, bad weather, outlier, capped stake, or price up a point in the hour.

6 of 6: gold card, BET NOW. 5 of 6: a ring naming the miss. A label only: it never changes a stake.

**Do not retune these on the bets used to judge them.** A change needs the owner's go and starts a new policy version; the record comparison (`tierCmp`) then starts again.

## 🎟 Parlay leg (`ringAssign`)
A player prop with `blendProb` ≥ 70%, `actNet` ≥ your floor (`cfg.eMin`), no outlier, a market price, not bet, game not started.
The 56.2% a pick (4-pick PrizePicks Power) assumes independent picks.

## Tests
`tests/modes-perfecta-test.js`.

## Supersedes
v4.50: 70% alone. v4.51: `actNet` ≥ 0.
