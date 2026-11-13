# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.91 (2026-11-13)

Ref: CC-2026-11-13-19 · Written by Claude Code, Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Your Reports step 3 scope (CC-2026-11-13-12 … -17 and your replies). Alonzo said "BUILD". v4.90 (step 2) went live just before it.

## What the app is
A one-page sports-betting screener (props.0xbeta.dev). La Contadora's careful chance, min(model, market + 0.35 × (model − market)), decides
and sizes every bet; Bet log › 📊 Reports is worked out live from the bet log. Step 3 adds the two edge checks. Numbers only, never a verdict.

## What was built
- **Closing line** (settled singles with a closing price): "With a closing price: N of M" (the capture), average, median and stake-weighted CLV
  (own-money stake; free bets weigh 0); beat (≥ +0.1 point), even (within 0.1 point), missed, each with tickets, share, W–L–P, profit, ROI.
  CLV = closing chance ÷ your price's chance − 1 (the app's existing `clv`).
- **"CLV value proxy · if the closing price were fair"** = each bet's own stake × its CLV, added up. The text says the close still has the book's
  margin in it, so it is a sign of price quality, not money expected.
- **La Contadora's expected profit:** each bet's stake × her EV saved before the game (snap.actNet, per $1 staked, fee included), added up, next
  to the actual profit of the same bets: "Expected +$X · actual ±$Y · N of M settled singles eligible". Left out: parlays, open, sold, free,
  no EV saved before the start, no game start time saved.
- **Expected wins:** her chance saved before the game (snap.act, 0 < p < 1) for each unique outcome, added up, against actual wins:
  "Expected 8.9 · actual 11 · 15 eligible outcomes from 18 settled single tickets". The earliest valid pregame ticket on an outcome speaks for
  it; if that ticket was pushed or sold, the outcome drops out (a later ticket never stands in). Free bets count here.
- **Ranges:** both boxes show "Actual − expected" with a 95% range from resampling whole games (2,000 draws, a fixed seed from the data, so
  the range is the same every time you open it). The independent-outcome SD sits in a closed detail: "ignores same-game correlation; not a
  confidence range".
- **Stage labels:** under 30 extremely preliminary; 30–99 descriptive only; 100–299 (or under 150 games) directional; 300+ across 150+ games
  may be informative. "No verdict before 100 eligible outcomes."

## Fixed before publishing (our reviewer)
Ranges computed once per data (a grading burst used to recompute them on every save; saves now repaint once); no "−0.00%"; earliest ticket
first, then excluded; 0 < p < 1 check; bets with no start time are named in the "left out" line; CLV colours use the 0.1-point even band;
"Σ" replaced by plain words; "may be informative" (not stronger).

## A question to check
The CLV section counts all settled singles with a close, including free bets (weight 0 in the stake-weighted mean, counted in the plain
average and median). Should free bets be in the plain average at all, or only in the counts?
