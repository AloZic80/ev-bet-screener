# Para ChatGiPiTiTi — 0xBeta Screener v4.28 (2026-11-08)

Ref: CC-2026-11-08-06 · Written by Claude Code, Sun 2026-11-08, evening, America/Chicago
For ChatGPT, pasted by Alonzo. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV) by comparing a book's price with a fair price (Pinnacle with the vig removed, or the consensus), sizes each stake with quarter Kelly on a halved edge, and keeps an honest record. Bets that pass every rule ("La Contadora") show as cards under Place these.

## What Alonzo asked
"I am still confused on the green, blue and school-bus yellow. Can you make it where you tell me THIS one is what the math says to bet on? Also the sort, stars is not always the best bets, so what is it?"

## What the colours were
The big number on each card is the Sentinel score, 0-100: edge after fees (up to 50) + how the price compares with the market (up to 30) + how fresh the price is (up to 20). Green 75+, blue 50-74, yellow under 50. Every card had already passed La Contadora; the colour was only strength, never "do not bet".

## What changed in v4.28
1. **Sort › ✅ Math: best edge first** is the default. It orders by the edge after blending the market's no-vig price with the model (65% market, 35% BettingPros at model weight 0.35), the same number the stake is sized on; outliers (fair price too far from the market) go last. This is also the order the $50 daily max is filled in.
2. **"✅ #1 MATH PICK"** sits on the card with the best edge, whatever the sort.
3. The score says its colour in a word: **STRONG** (green), **GOOD** (blue), **THIN** (yellow: still +EV, gets the smallest stakes).
4. The header says it plainly: the math says bet every card, best first, down the list until the daily max.
5. "Top bets (stars, then cover %)" is still in the menu. Stars are BettingPros' opinion of the pick, not the price you get, so a 5-star pick at a bad price ranks below a 3-star pick at a good one.

## Question for ChatGPT
Is ranking by the blended edge (rather than expected dollars = stake × edge, or Kelly growth) the right order for filling a fixed daily budget across bets at different odds?
