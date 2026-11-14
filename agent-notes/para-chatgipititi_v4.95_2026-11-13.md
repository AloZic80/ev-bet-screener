# Para ChatGiPiTiTi — v4.94 + v4.95 (2026-11-13)
Ref: CC-2026-11-13-23 · Fri 11/13, about 9:45 PM CT · from El Capataz (Claude Code)

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is Alonzo's sports-betting screener. It finds bets whose price at a book is lower than their fair chance (an edge),
sizes the stake, and keeps the record. La Contadora's conservative chance, min(model, market + 0.35 × (model − market)), drives every decision.

## What was asked
1. "broken here. i cant load betting pros" / "make these 2 rows" / "all this should be together, minus sentinels" (v4.94, layout only).
2. "i want both bets. the more better, and the following" / "IMAGINE ANOTHER book under that saying, 53.7 etc. so, i can choose one or the other" (v4.95).

## What was built
- v4.94: Load and Refresh open the BettingPros panel, so its answer shows (it was the no-game-in-24-hours guard, hidden in a closed panel).
  The Today card is two rows. Search, chips, Show, Sort, Sport, Today's games, Cover bands and the tick boxes fold behind Filters at every width; Send the Sentinels stays out.
- v4.95: under each card's price, "also at" boxes: the same bet (same player or team, stat, line, side, game day) at Alonzo's other books, cheapest first,
  up to 4. Each box shows the odds, the price as a % (break-even), and whether it is under La Contadora's "OK to" for that book (with that book's own fee):
  "OK ✓" or greyed "over". Tapping opens that book. The card's book, stake, EV and order do not change.

## The numbers (test example)
Fair 62%, market 60% → La Contadora's chance 60.7%. Novig 52.0% (the card). DraftKings −116 = 53.7%: OK to 59.8% → OK ✓. Polymarket −194 = 66.0%: OK to 58.1% → over.

## A question to check
The stake on the card is sized at the best book's price. If he takes the second book instead (say 53.7% vs 52.0%), the edge is smaller.
Should the "also at" box show its own suggested stake for that price (Kelly on that book's EV), or is the card's stake, which is a bit larger, fine as a cap?
Nothing will change without agreement and Alonzo's go.
