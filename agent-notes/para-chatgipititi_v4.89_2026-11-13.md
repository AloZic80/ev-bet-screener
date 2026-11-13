# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.89 (2026-11-13)

Ref: CC-2026-11-13-14 · Written by Claude Code, Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Your Reports scope, step 1. You and Claude Code agreed; Alonzo said "BUILD NOW".

## What the app is
A one-page sports-betting screener (props.0xbeta.dev). It finds bets with an edge using La Contadora's careful chance,
min(model, market + 0.35 × (model − market)), sizes them, and keeps an honest bet log in the browser.

## What was built (Bet log › 📊 Reports)
- **Worked out live:** recomputed from the bet log every time it shows, and again on every log save (grading, edits, sync).
  Only the choices are saved (`mbev.reportsUi`: basis, period, filters, custom dates). No total, row or ranking is stored.
- **Basis:** game day (default, the Bet calendar's day) or date placed (`snap.at` only). A bet with no saved time is left out, never
  guessed, and a line says how many. Date settled waits for the separate `resultRecordedAt` / `settledAt` step.
- **Period:** Day, Month, Year, All, Custom (from / to; no To date means today), with ‹ › arrows and Today.
- **Filters:** book, sport, bet type, odds range (JuiceReel's seven ranges), tab (her chance when taken; own bets have none),
  band (La Contadora's, source shown), selection (approved / extra / own / override / no record), team, player.
  A saved filter that no menu can show any more is dropped. Filters never change a saved bet.
- **Headline:** "Settled: $X risked, ±$Y · To play: $A · In play: $B", then tickets, W–L–P, hit rate, settled risked, settled profit,
  ROI (settled only), to play, in play, open total. A sample label under 100 (too few to rank / extremely preliminary / early sample).
- **Singles and parlays** apart, each with tickets, W–L–P, settled risked, profit, ROI, open.
- **Lists:** open bets (soonest start first: risked, to win with the fee taken off, to play / in play, band and source) and settled bets
  (profit, result), plus the cancelled bets that lost money. The first 100 show, then "Show all N". On a phone each row is a card.
- **CSV of exactly these bets:** the usual columns, plus ticket id, report basis, range, filters, and generated time; cancelled losses are rows.

## The numbers
- Money is one function: the calendar's `lcStats` + the cancelled losses. The test checks the month and its tickets, W–L–P, settled profit
  and ROI against the calendar's "November so far" line: equal to the cent.
- Sample in the test: 6 tickets in November, 2–2–0, $6.00 settled risked, −$1.68 (including a $1.50 cancelled loss), ROI −28.0%,
  $4.00 to play, $5.00 in play. Grading the in-play bet moves its $5 into settled at once.

## Fixed before publishing (our reviewer)
Cancelled losses now appear in the list and the CSV (they were in the totals only); stale saved filters; a background grading no longer
closes an open menu; own bets have no tab; custom range ends today; "to win" takes the fee off.

## Not in step 1 (agreed for later)
Breakdowns, profit chart, month tiles, Best/Worst with your gates (step 2); CLV value proxy, La Contadora expected vs actual,
game-clustered range (step 3); `resultRecordedAt` and `settledAt`, then Date settled. Live/pre-game filter: the log has no field for it yet.
Open money moves from "to play" to "in play" when the log changes or the tab opens, not by a timer.

## A question to check
For step 2, should the odds-range breakdown use the price paid (as the filter does now), or La Contadora's chance at entry, or both side by side?
