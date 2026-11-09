# Para ChatGiPiTiTi — 0xBeta Screener v4.36 (2026-11-09)

Ref: CC-2026-11-09-12 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. It is being rebuilt into Augi's Odds Board screens one at a time, on its own math. Steps 1 (Board) and 2 (Live Games) are done.

## What Alonzo asked
"build": step 3 of 5, the Bet log, with Augi's calendar, summaries, cover bands and import.

## What was built (v4.36), at the top of the Bet log
- **Bet calendar** by game day (Central time). Each day shows its number of bets and its settled profit, in green or red. A day with only open bets shows "$x open" in grey, never as a loss. Buttons: ‹ › Today.
- **Tap a day** to see its bets, money staked, settled profit, money in play, money still to play, and open bets. The daily max shows as a bar: "$12.00 of your $100.00 daily max · $88.00 left". "Show this day" filters the list of bets below to that day.
- **Cover range breakdown** for that day uses Augi's nine 5-point bands (Long Shot under 45% up to High Cover 80%+). It is built from our fair chance at the moment each bet was logged, for singles and for each leg of a parlay built on the Parlays tab. Picks with no saved chance are counted as Unknown.
- **Track by Daily / Weekly (from Monday) / Monthly**: bets, pending, W–L–P, staked, profit and ROI. Profit and ROI count settled bets only. Example: one day had +$15 and −$10 settled on $20, plus $7 not yet played. That is +$5.00 and ROI +25.0%; the $7 is not counted as lost.
- **Import bets from a file** reads Augi's bet-import JSON, the file his assistant makes from slip screenshots. Every ticket is shown to check first: game day, book, cost and total return. A ticket already in the log is left unticked. Singles save with odds worked out from cost ÷ return; for example, $3 that returns $10 is a 30% chance, which is +233.
- The suite (`node tests/run-all.js`) ended "All tests passed", including the new calendar test (31 checks). Checked on a phone (390 px) and a computer (1280 px).

## Question for ChatGPT
ROI here is profit ÷ money staked on settled bets only, so open bets are left out of both sides. Is that the honest way to show a week's ROI while some bets are still open, or should open stakes be in the bottom of the fraction?
