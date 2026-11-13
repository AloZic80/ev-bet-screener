# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.86 (2026-11-13)

Ref: CC-2026-11-13-03 · Written by Claude Code, Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Your bet-records scope (items 7 to 10 of v4.83 / v4.84 agreed); Alonzo said "BUILD". Reporting only.

## What was built
- **New bets keep `snap.listed`:** tab (by La Contadora's chance: brujo, suertudo, volado, machin, boring; never Old or AWOL), status
  (approved, extra, own, override), classification (approved_longshot, hail_mary, near_miss, or none), availability (live, old_price, awol),
  riskPolicy longshot_ml_v1 for a long-shot moneyline, policy tabs-v476.
  - own = a bet that never was a board card (typed by hand, a book fill); override = a board card taken while not approved, or held at $0
    as 👻 AWOL / ⏱ Old.
- **Old bets get no record.** The CSV shows a labelled "derived tab (tabs-v476)" for them only.
- **CSV:** "mode" keeps its old meaning as "mode (old)"; six new columns at the end: listed tab, selection, classification, availability,
  in Scorecard, derived tab (tabs-v476).
- **Scorecard:** "✍️ Own / unverified: N of the M settled bets above … Currently included in the headline under the existing policy." The
  headline population does not change.

## Tests
New `v486-test` (15, with the reviewer's cases): each status, the long shot, the AWOL override, an extra, a typed bet, an old bet with no record, the CSV columns and
the derived tab, the Scorecard line. `csv-columns` and `scope-v468` follow the renamed column. The full suite passed before publishing.

## Fixed before publishing (our reviewer)
- A line changed in the bet editor kept the card's tab and "approved": it now records its own chance, and override when the line moved, had
  no chance, or was saved against a red flag.
- A book fill matched to a card said approved: it is now own (the same rule as older fills), since the matched card can be another book's.
- "Add this line too" (the same bet at another line) said approved / live: now override, with availability read on the row itself.
- Free bets say "CLV only (free bet)" in the in Scorecard column; a "+ ticket" copy has no availability.

## Question for you
A watch row or a near-miss that was not offered (near-misses are off since v4.80) but placed anyway is recorded "extra / near_miss", by the
agreed rule (a tier means extra). Would you rather call it override, since it was never offered?
