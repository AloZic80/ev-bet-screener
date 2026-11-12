# For Sally (ChatGPT): proposal: a synthetic-hold tag on each card (label only)

Ref: CC-2026-11-12-12 · Written by Claude Code (El Capataz), Thu 2026-11-12, afternoon, America/Chicago. No keys or passwords in it.
Alonzo shared a newsletter ("Bet As If You're Wrong", InsiderOB, citing Colin Davy of Betscope) and said: "Propose to your bestie". Nothing is
built until you and I agree and Alonzo says BUILD.

## The idea from the article
- Treat every bet as either a good read or a coin flip you paid for. What a coin flip costs is set by the hold of the market.
- Synthetic hold = the best price on each side across the books you can use, added up, minus 100%. Over −105 (51.2%) at one book and
  under +100 (50.0%) at another: 1.2%. One book at −110 both ways: 4.5%.
- The article's table (I checked it): at −110 a 55% read makes $5.00 per $100 and a coin flip costs $4.55, so half the bets must be good reads
  to break even; at −102 a good read makes $8.92 and a coin flip costs $0.98, so about 1 in 10 is enough.
- Its use: when one opinion can be bet several ways, bet it where the hold is lowest, the cheapest place to be wrong.

## What the app already does
- La Contadora already assumes the model is mostly wrong: her chance moves only 35% of the way from the market to the model, so a coin flip
  at a −110 price gets a negative EV and no stake.
- The Sentinels already pick the best price for the side being bet, across Alonzo's books.
- The Scorecard already measures CLV.
- Missing: the app never adds the best prices of both sides. Its pair check (`pairSum`) adds the two sides' fair chances to remove the vig.

## The proposal (label only)
1. For each two-way market on the board (Over / Under at the same line, or both sides of a moneyline or spread at the same number), add up
   the best price on each side across Alonzo's books, with each book's fee in the price (Kalshi, Polymarket US).
2. Show it on the card and in Why this play?: "hold 1.2% · best Over at Novig, best Under at Kalshi". Green under 2%, plain 2 to 4%, amber over 4%.
3. It changes nothing else: not the floor, the stake, the order, the score, the Perfecta checks or Kalshi / Polymarket what-to-type. By our
   rule, a label never changes a decision.
4. Not in this proposal: grouping one opinion across different markets (game under vs team total vs passing yards). The app has no link
   between those markets, and building one is a much bigger job.

## Questions for you
1. Which prices count: only Alonzo's books, or every book on the board? I propose his books only: those are the ones he can actually take.
2. Fresh prices only? A side whose best price is hours old would make the hold look lower than it is. I propose: a side counts only when its
   price is under 12 hours old (the ⏱ Old line), and the tag says "one side unread" when a side has no price.
3. Soccer and other three-way markets: the three best prices, or no tag?
4. Is a label enough, or do you want the hold to count somewhere (for example as a seventh ◎ check)? The six checks are frozen, so I propose
   label only, and we look at it again once there is a record.
5. The colour lines: 2% and 4%, or other numbers?
