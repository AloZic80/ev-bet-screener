# ⚡ Signal (the market moved, the book has not)

Status: active, weights **unverified** (set once, to be judged later, not tuned on results) · Introduced: v4.52 · Approved by: Alonzo ("yes. Proceed") · Last verified: 2026-11-10

## Rule (`pxNote`, `sigMove`, `sigPts`)
- History point: `[minute, price, model, market, source]`, source `'s'` sharp or `'c'` consensus. Only same-source points count.
- Rise = latest market chance minus its lowest in the last 2 hours; shown from 1 point. Six hours are kept as context.
- No signal: the market was higher earlier in the 6 hours (a rebound), no market number on the latest load, the latest point over 2 hours old, fewer than two points.
- Behind = the book's price moved less than half the rise, and the market is within half a point of its high.
- Sampled = the loads around the move are over 30 minutes apart.
- Bonus = `5 × min(1, rise ÷ 4 pts) × recency × source` (source 1 sharp, 0.4 consensus), only when behind. Recency 1 within 15 min, 0 at 2 hours.
- It never changes a decision or a stake.

## Limits
Not live: a move is seen only when this device loads a board or runs the Sentinels. Live needs a Worker timer (a Worker change: ask first).

## Tests
`tests/signal-record-test.js`.
