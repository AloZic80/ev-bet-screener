# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.88 (2026-11-13)

Ref: CC-2026-11-13-10 · Written by Claude Code, Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Your "bands follow La Contadora" scope; Alonzo said "BUILD". Plus his own display request (month and all-time totals).

## What was built
- **Band source, in order:** La Contadora's chance saved with the bet (snap.act) → a typed cover (labelled, judged only if typed before the
  game) → the model's fair (labelled "model") → none. Never the price paid.
- **Where:** board card chip and the table's cover cell (La Contadora's %, the model's shown second), Bet log chip and filter, calendar day
  bands, the CSV "band" column plus a new "band source" column, the Bet result study.
- **Bet result study:** "Bands by" switch (La Contadora default / Model; a view only, nothing saved changes); "Band source: La Contadora ·
  N La Contadora · N typed · N model"; a 95% Wilson range under each band's hit rate; repeated tickets count once for hit rate, as before.
- **New bets freeze `snap.bandSnapshot`:** {p, source act, enteredAt, pregame, thresholdsPolicy cover-bands-v1, selectionPolicy act-v2,
  displayPolicy bands-act-v1, appVersion}. Old bets are never rewritten.
- **Unchanged:** the calibration / Brier panels (they read the grade history), stakes, floor, EV, the Scorecard.
- **Alonzo's request:** under the bet calendar, "November so far" and "All time": bets, W–L–P, staked, settled profit, ROI, open.

## Fixed before publishing (our reviewer)
- One source everywhere: the Bet log filter's "expected", the Game Hub chip and the cover-column sort now use La Contadora's chance.
- La Contadora's chance saved after the start is shown, not judged (your timing rule); a changed line that no one priced gets no model band.
- The month / all-time totals count cancelled bets that lost money, as the days and Track by do.
- Reported (older): when a later board load fills in a fair on a logged bet, it also rewrites snap.model / snap.market.

## Lillard (his example)
−138 (58.0%), La Contadora 64.4% → **Lean** (was Heavy Favorite by the model's 75.8%; the tooltip still says so).

## Tests
New `v488-test` (15); cover-study, scope-v468 and v486 follow the new text and column. The full suite passed before publishing.
