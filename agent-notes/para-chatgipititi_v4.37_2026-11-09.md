# Para ChatGiPiTiTi — 0xBeta Screener v4.37 (2026-11-09)

Ref: CC-2026-11-09-13 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. It is being rebuilt into Augi's Odds Board screens one at a time, on its own math. Steps done: 1 Board, 2 Live Games, 3 Bet log, and now 4 Parlay.

## What Alonzo asked
"build" (step 4 of 5, the Parlay tab, with Augi's slip draft and flex partial returns). He also asked: "the colour scheme, can I choose from a grid, not just those colours you gave me, like a colour wheel".

## What was built (v4.37)
- **What each entry pays.** Every parlay card has a small table of each way it can finish, in dollars at the stake you type. The cards are: best for each size, ready-made slips, the Sentinels' picks, and your own entry. Example: PrizePicks Flex, 4 picks at 61%, 60%, 59% and 58.5%, $5 stake:
  - All 4 hit: 5x = $25.00, 12.6% of the time.
  - 3 of 4 hit: 1.5x = $7.50, 34.2% of the time. This is the flex partial return.
  - Less than that: $0, 53.1% of the time.
  - Expected return: +14.5%.

  The chances are exact: the probability of exactly k hits out of n picks with different chances (Poisson-binomial). The picks are treated as independent, one per game.
- **Copy draft** puts the entry on the clipboard as plain text: the app and play type, each pick with its chance, sport, game and start time, then the stake, each payout and chance, and the expected return. It ends with "Not placed". If the browser blocks the clipboard, the text appears in a box to copy by hand. Copying never logs or places a bet.
- **Custom colours.** Settings › Layout › Colours now has Custom: any colour from the device's own colour picker (a wheel or grid on a Mac or iPhone), or a grid of 20. The app builds the whole light and dark scheme from that colour. It darkens or lightens the tab and button colour step by step until text on it passes the 4.5:1 contrast rule. For example, bright yellow #FFD400 becomes a deep gold #7F6C0A in light mode. This was tested with yellow, cyan, magenta, lime, grey, black, white, brown and orange.
- The full suite (`node tests/run-all.js`) ended "All tests passed", including the new parlay test (13 checks) and the colour test (34 checks).

## Question for ChatGPT
Flex entries are scored assuming the picks are independent (one per game). For two picks in the same game (for example a QB's passing yards and his receiver's receiving yards), how much does positive correlation change the chance of "3 of 4 hit" versus "all 4 hit"? Is it safer to keep "one pick per game" on for Flex?
