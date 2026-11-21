# Findings noticed while mapping (report only; none changed)  ·  Sat 2026-11-21 ~2 AM CT

1. GRADING (money): player props that land exactly on a whole-number line are graded as a LOSS, not a push.
   `gradeBet` (index.html:6445) and `gradeRow` (6457) return {won}, never {push}; callers at 7759, 8696 read `r.push` (always undefined for props) and at 11124 map `g.won?'win':'loss'`. Game lines are right (`gradeGameLine`, line ~6191 returns {push:true}).
   Effect: a push returns the stake; graded as a loss it understates profit by the stake. Whole-number prop lines exist in the owner's log (e.g. Podziemski O 25).
   Fix needs: grading change + test + a decision on past results (CLAUDE.md: never clear saved results to force a regrade; grade first, replace only when the new grade exists). Use the grading-and-matching skill. Ask the owner.
2. WORDS (money display): on a Polymarket card the God money line can say "back $12.25" while the Type this ticket says 12 shares, pays $12.00 (the card's money line uses the stake, the ticket uses whole shares). Easy must use polyHow/kalshiHow numbers.
3. PRICE ROUNDING: "OK up to" is rounded to the nearest American price, so it can sit just past La Contadora's exact most (8 of 15 sportsbook rows on the practice board). Example: exact most -252.7, shown -253; the safe price is -252. Easy shows the safe side (round toward the stricter price).
4. Draw rows: `betLabel` says "LAL Moneyline" for a Draw (team set to the home team). Easy must not show Draw rows.
5. Markets with no plain-words mapping yet: Total Bases, "Threes Made", every WNBA prop (marketFamilyOf returns unmapped). Easy shows only mapped families.
6. `totalUnit` (7290) says "Points" for tennis, MMA and boxing; hockey "Points" means goals plus assists.

## From map-board.md (board map, 2 AM)
7. The "can be placed now" predicate already exists: `scApproved(r)` (index.html:12542). Easy = scApproved + not a pasted row + live state open + actProb >= 0.60. Proven on the practice board: God cards = header count (0 mismatching tabs); Easy = 5 in every run, in the God board's own order (Doncic, Adebayo, Pacheco, Charbonnet, Lakers).
8. Never test `stake>0` alone: an order that is waiting keeps its stake.
9. The God board does not redraw at kickoff. Easy needs its own 30-60 s tick and a visibility recheck. `r.idx` changes on every audit: key picks on `pxKey` (5220).
10. A moved price makes a row WATCH and it vanishes from the board; "not worth it now" needs Easy to REMEMBER the picks it showed.
11. Brief sample errors: the Lakers card prints 61.3% and +2.2% (brief said 61.4%, +2.3%). "19 placeable" is 18 (the 19th is the already-bet Josh Allen row).
12. OPEN QUESTION for the owner: with a $200 bank no sample pick gets a stake (the app's own stake rounds to $0). Customers with small money would see an empty Today. Needs a minimum-stake decision (his own words): e.g. a floor of $1 or $2 per bet, or "set aside at least $X".
13. OPEN QUESTION: freshness. The app has no short freshness limit for a placeable card (only 12 h = Old). Should Easy require a price read in the last N minutes (suggest 30) and say so? Owner's words needed.

## From map-log.md (bet log map, ~2:45 AM)
14. "I placed it" should call the EXISTING editor: openBetEditor on a hidden card host, then click its Save (`placedItSave`, proposed in easy/placed-it-candidate.js). Tested in two fresh contexts: the saved record is IDENTICAL to the real "I bet this" tap for DraftKings, FanDuel and Novig rows (79-84 fields). Calling addToLog directly is NOT identical (stake rounding, +100 vs -100, said.check, lsmlCls) - do not do that.
15. Exchange picks: Save always saves the LIVE price, not the card's price (5812); placedItSave waits for the live read and opens the full form if it differs from the card or the book is thin. OPEN QUESTION: save in one tap, or always show the full form for exchange picks?
16. The editor blocks only when EV <= 0; no duplicate guard of its own (placedItSave must check r.prior / r.waitOrder and require "Worth it").
17. My bets read model: `myBetsModel` over betProfit 7097, betLocked 7118, gameDayOf 7074, removedBets; practice log = 3 open ($32 in play), 8 won, 5 lost, +$35.32 (matches lcStats and dayStats exactly). OPEN QUESTION: singles only (parlays excluded)?
18. snap.mode and snap.listed.tab record the God tab in use; Easy has no tabs -> record the tab its chance belongs to (tabOfChance), not the open view.
19. Brief sample: the Lakers win is +$5.63 (not +$5.62) at the saved $8.44 stake.
20. `saveRemoved`, `saveParlays`, `saveLogDays` swallow storage errors (the bet log itself does not). Report, do not fix.
