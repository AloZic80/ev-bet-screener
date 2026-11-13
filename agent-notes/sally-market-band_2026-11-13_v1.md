# For Sally (ChatGPT): proposal: a band for book fills that matched no board card

Ref: CC-2026-11-13-04 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Alonzo (screenshot of four Novig fills marked "no band"): "Why don't these have bands? What do you need from me or from Novig?" then "Ok.
Put the minions to work". Two agents checked the code (one mapped what exists, one looked for how it could mislead). Nothing is built.

## Why they have no band
- The band is the cover band of the fair chance saved with a bet (`b.fair`), or a chance he types (`b.cover`).
- A fill that matches a board card takes that card's chance. These four (Dahlin SOG, Diabate blocks, Holloway SOG) matched no card: that sport,
  market or line was not on his loaded board. So no chance was saved.
- The fill itself carries only the price paid, the market and outcome ids and the title: no other side, no bid.

## What exists today
- The app reads live exchange prices for open logged bets every 1 to 5 minutes, but keeps only the ask on the bet (`closeLive`), never the bid,
  so no no-vig chance is ever stored.
- A Novig prop fill has no team codes, so the app probably cannot even ask the Worker for its live price (the request needs them). Novig game
  lines are fine.
- No other source (Pinnacle, SportsGameOdds) covers a bet that is not on the board.

## The pitfalls (our skeptic)
1. Writing a market chance into `b.fair` would score it as the model's forecast: calibration, Brier and hit rate would look nearly perfect by
   construction (the market chance is about the price paid without the vig), and it would weaken "the market beats the model".
2. Timing: a fill is read when the app polls (open app only), sometimes hours later, maybe after kickoff.
3. His own fill moves a thin Novig book, or his own resting order is the top of the book.
4. A missing or 1–2¢ bid leaves the vig in.
5. Alternate lines: the quote must be the exact line.
6. Never into the entry price, CLV, EV or the edge test.

## Proposal, in two steps
**Step 1, app only, today's data: a "price band".** The band of the price he paid (−113 = 53.1%: On the Line), labelled "price band · no
model". It says what kind of bet it was, never whether it had an edge. Kept in its own place: not in calibration, Brier, hit-rate by model
band, EV buckets, the Scorecard edge test, CLV or the Fair column. Its own row in Performance › Bet result study.

**Step 2, needs a Worker change (Alonzo's go): a "market band · no model".** Right after such a fill is logged, one /live read of that exact
market by its Novig market and outcome ids; save once, in a new field (never `snap`, `fair`, `mkt` or `cover`):
`mktBand {p = ask/(ask + 1 − bid), ask, bid, bidSize, src, quoteAt, fillAt, line, usable, why}`.
Usable only when the bid is real (size > 0, not 1–2¢), the line is exact, the quote is within 2 minutes of the fill and before kickoff, and
the top of the book is not his own order. Otherwise the reason, no number. The same exclusions as step 1.

## Questions for you
1. Is step 1 worth having, or does a price band say too little to show?
2. Step 2: is a quote 1–2 minutes after the fill acceptable, knowing his own fill may have moved the book?
3. Should a usable market band count anywhere in the record later (for example a separate "market vs result" check), or stay a label only?
