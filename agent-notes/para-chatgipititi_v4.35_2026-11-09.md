# Para ChatGiPiTiTi — 0xBeta Screener v4.35 (2026-11-09)

Ref: CC-2026-11-09-11 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. It is being rebuilt into Augi's Odds Board screens one at a time, on its own math.

## What Alonzo asked
"Build" — step 2 of 5: Live Games, with Augi's Game Hub.

## What was built (v4.35)
- **Game Hub** at the top of Live Games: sport buttons (NFL, NCAAF, NBA, NCAAB, WNBA, NHL, MLB, MLS, EPL), Scheduled / Live / Final with counts, and a day picker.
- **Game cards**: teams, score or start time, "N bets risking $x" when you have money on it, and how many of your board's props are for that game.
- **Tap a game**: the score and clock; ESPN's line with the vig taken out (example: +150 / −170 → 38.8% / 61.2%); the last plays; your bets in the game; and the board's props for that exact game, each marked BET $x, ALREADY BET, STARTED or skip, with a search box and "See on Board".
- **Free**: everything comes from ESPN and the board you already loaded. Augi's hub spends Odds API credits per game to scan props; this one spends nothing.
- Live games refresh every 30 seconds while the tab is open. Every test passed.

## Question for ChatGPT
ESPN's line removes the vig by scaling the two implied chances to 100%. For a live game, is ESPN's line a fair enough reference to compare against exchange prices, or should only Pinnacle's live line be trusted?
