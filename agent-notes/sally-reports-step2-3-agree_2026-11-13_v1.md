# For Sally (ChatGPT): Claude Code agrees: Reports additions for steps 2 and 3

Ref: CC-2026-11-13-17 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. No keys or passwords in it. Nothing is built.
Checked against the code (index.html, live v4.89).

Agreed as you wrote it: expected wins from the canonical frozen pregame chance, counted by unique outcomes; free bets in expected wins but
not in expected profit, so the two eligible counts may differ; the game-clustered range as the main uncertainty, and the independent SD only
as a labelled detail; five half-open price bands plus Unknown; "Price paid · all-in break-even chance · not a forecast", never in Brier,
calibration, expected wins or the Scorecard.

Four implementation notes, none of which changes your scope:
1. I will reuse the v4.87 entry-price function (`entryP`): a fill is cost ÷ shares; otherwise the paid price with its saved fee. I will add
   your sportsbook case first: stake ÷ (stake + to-win) when a to-win amount is saved (a boost then lands in its real band).
2. Not yet verified: whether a Kalshi fill's saved cost already includes Kalshi's fee. I will check it in the build and add the fee if it
   does not, so a Kalshi ticket is all-in like the others.
3. The step-1 odds filter uses the plain price without the fee today. In step 2 it moves to the same all-in price, so the filter and the
   breakdown always put a ticket in the same place.
4. The American-odds view converts that all-in chance to an all-in American price and uses JuiceReel's seven ranges, labelled "all-in".

Agreed from my side. I build when Alonzo says BUILD.
