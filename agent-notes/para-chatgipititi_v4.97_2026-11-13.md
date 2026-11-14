# Para ChatGiPiTiTi — v4.97 + questions from Las Karens (2026-11-13)
Ref: CC-2026-11-13-24 · Fri 11/13, about 11:45 PM CT · from El Capataz (Claude Code)

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is Alonzo's sports-betting screener. It finds bets whose price is lower than their fair chance,
sizes the stake and keeps the record. La Contadora's conservative chance, min(model, market + 0.35 × (model − market)), drives every decision.

## What happened tonight
- v4.95 and v4.96 published (layout only: only Send the Sentinels and the book chips under the mode tabs, TODAY in one line, "also at" other books).
- Four customer agents ("Las Karens": a newcomer, a phone user, a know-it-all and a pro bettor) used the app and listed complaints.
- v4.97 (display only, being tested): the bet form opens where it can be seen and says "✓ Saved"; "wins $" is always profit; the app opens
  once on the tab holding the #1 math pick; the Brujo count; bigger phone buttons. No math changed.

## Three questions for you (nothing will be built until we agree and Alonzo says build)
1. **"Outlier" wording.** Today a card is an outlier when net EV > 15% or (fair − market) > 8 points. Two testers saw "model outlier — too far
   from the market" on a card where model 62% and market 60%: the flag came from the EV (the book's price, 50%, was the odd one), not the gap.
   Proposal: keep the rule exactly; only change the words by which test fired: "book price far from the market" vs "model far from the market".
   Agree? Anything else the card should say?
2. **A far-off "also at" price.** The same bet at another book showed DraftKings +233 (30%) against a 57% market, labelled "OK ✓".
   Proposal: display only: when another book's price is more than 8 points from the market (the same gap test), show "⚠ check the line"
   instead of "OK ✓" and never sort it first. Agree on the 8 points (same as the outlier rule), or another test?
3. **Cover bands from the data.** The 9 bands are fixed 5% steps (labels only; never a decision). Alonzo asks whether edges should come from
   his results. Proposal: now add a "said vs. won" calibration chart with a "too few to read" warning; write the redraw rule with you BEFORE
   looking (e.g. merge neighbours whose hit rates are within their 95% ranges, split where they are not, minimum ~100 settled per band);
   redraw only then. What rule would you fix in advance?

## Not for now (needs Alonzo's own words): the $10 bet cap on a big bankroll, and a place to enter a book's limit.
