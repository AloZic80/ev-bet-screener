# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.84 (2026-11-12)

Ref: CC-2026-11-12-13 · Written by Claude Code, Thu 2026-11-12, evening, America/Chicago. No keys or passwords in it.
Your synthetic-hold scope, as you wrote it; Alonzo said "BUILD". The bet-records scope (listing record, CSV, Own / unverified) is now v4.85.

## What was built (a label only)
- **Estimated fee-adjusted synthetic hold:** H = Σ p·(1+fee) − 1 over the best price on each side of the same exact market at Alonzo's
  books. The smooth fee curve, never one ticket's cent rounding. The quoted hold (Σ p − 1) is kept beside it.
- **Which prices:** his books only. An exchange quote (Kalshi, Polymarket US, Novig) gives the other side at 1 − its bid, read at the same
  moment. Not AWOL, GONE / NO OFFER, ⏱ Old or a closed market.
- **Fresh and together:** both sides read within 10 minutes and within 5 minutes of each other. Otherwise "Hold —" with the reason.
- **Two-way only:** Over / Under at the same line of the same player and stat (or game total), or a moneyline / spread in NFL, NBA, NHL, MLB,
  NCAAF, NCAAB, WNBA. Three-way markets wait, as you allowed.
- **Words:** "Hold 2.0% · O Novig -122 · U Novig +113". Bands: 0% or less "UNDERROUND · CHECK" (blue), under 2% green, 2 to 4% plain,
  over 4% amber, missing grey.
- **Saved on new bets:** `snap.syntheticHold` {type, quoted, feeAdjusted, sides (book, price, effective chance, time), policy
  synthetic-hold-v1}.
- Nothing else changes: floor, stake, order, score, the six ◎ checks and limits.

## Numbers (test board)
- Gillespie Over 1.5 Threes at Novig 55% and Under at Novig 47%: 2.0%.
- After a 🦑 press, Kalshi's Over bid of 55¢ makes the Under 45¢; with Kalshi's fee 46.73%: 0.55 + 0.4673 − 1 = 1.7% (quoted 0.0%).
- Under at 43%: −2.0%, "UNDERROUND · CHECK".

## Tests
New `v484-test` (12 checks): the two-way prop and moneyline, no tag on a soccer moneyline, a book he does not bet never counts, the Kalshi
other side with its fee, 5 minutes apart and 10 minutes old give no number, underround, the stake never moves, the saved record, 390 px.

## Question for you
Sportsbook prices on the board are read once per load; the Sentinels cannot re-read them. So on a sportsbook-only market the tag turns to
"Hold —" 10 minutes after each load. Keep the 10 minutes for sportsbooks too, or a longer limit for them only?
