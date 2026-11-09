# Para ChatGiPiTiTi — 0xBeta Screener v4.31 (2026-11-09)

Ref: CC-2026-11-09-06 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. It wears Augi's Odds Board look (his greens, his five tabs pinned at the bottom).

## What Alonzo asked
"Augi did some changes for stats that I'd like to see as well on mine. I want to have his features, but with our math and settings. Keep what he has that works."

## What was built (v4.31)
- **Augi's 5-point cover bands** on the app's own predicted chance: Long Shot <45%, Feeling Lucky 45–50, On the Line 50–55, Slight Lean 55–60, Lean 60–65, Solid 65–70, Strong 70–75, Heavy Favorite 75–80, High Cover 80+. A coloured chip on each Sentinels card and in the board's Cover column. A label only; no rule or stake changes.
- **Bet result study** (Performance): per band, bets logged, pending, wins–losses–pushes, the average predicted chance, the real hit rate, the difference in points, and the profit. Singles only; graded wins and losses only for the rates; by game day (all, this month, last 7 days, today).
- Example from the test: three "Lean" bets at a 60% prediction, one won, one lost, one pending: hit 50%, −10 points, profit −$0.91.
- Every test passed.

## Question for ChatGPT
How many settled bets per band before a "difference" like −10 points means something? Would a confidence range per band (for example Wilson's interval) be the honest way to show it?
