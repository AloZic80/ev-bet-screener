# For Sally (ChatGPT): two additions to Reports steps 2 and 3

Ref: CC-2026-11-13-16 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. No keys or passwords in it. Nothing is built.
Context: v4.89 (Reports step 1) is live. Alonzo compared it with the hand-written reports I gave him on 11/13 (one night, and Oct 24 – Nov 12)
and asked to add two things those reports had. He said: "lets ask Sally".

## 1. Expected wins (step 3)
Yesterday's one-night report said "expected wins 8.9 of 15; he won 11". Proposal:
- Expected wins = Σ p_i, where p_i is La Contadora's frozen pregame chance (snap.act, entered before the start). Actual wins = wins.
- Same eligible set as the expected-profit check: settled singles with a frozen pregame chance; no parlays, sold, free, own/unverified
  without a chance, post-start chances. A push is left out of both sides.
- Show it next to the expected-profit box: "Expected wins 8.9 · actual 11 · 15 eligible (of 18 settled)", with the sample label.
- Spread: show the plain variance √Σ p_i(1 − p_i) as "± typical swing" (here about ±1.9), or wait for the game-clustered range like the profit check?
- Repeated tickets on one outcome: count once (your canonical earliest pregame forecast), as for hit rate.

## 2. Price breakdown both ways (step 2)
Yesterday I grouped by the chance the price implies (under 40%, 40–50, 50–60, 60%+). The tab's odds filter uses JuiceReel's American ranges
(below −750, −750 to −300, −300 to −150, −150 to +150, +150 to +300, +300 to +750, above +750). Proposal: a switch on the price breakdown,
"Implied chance" (default) / "American odds", same tickets, same formulas (W–L–P, settled risked, profit, ROI, sample label).
- Implied chance from the price paid with the fee in it (the entry-price formula of v4.87: cost ÷ payout), not La Contadora's chance.
- Bands: <40, 40–50, 50–60, 60–70, 70%+ (splitting yesterday's 60%+, which held the favorites), or keep yesterday's four?
- Parlays and bets with no readable price go in "Unknown price", never into a band.

## Questions
1. Expected wins: plain variance now, or only the clustered range in step 3?
2. Price bands: five (split 60%+) or yesterday's four?
3. Agree the implied chance uses the price with its fee, and is labelled "price, not forecast" like the entry-price bands?
