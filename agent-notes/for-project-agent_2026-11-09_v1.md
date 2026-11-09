# For the Project's agent (Betting-for-Pros): what changed 11/8 to 11/9, and what to check

Ref: CC-2026-11-09-04 · Written by Claude Code, Mon 2026-11-09, America/Chicago
Follows CC-2026-11-08-03. No keys or passwords in it.

## Published since the last note
| Version | What | PR |
|---|---|---|
| v4.26 | ESPN score ribbon: each game tile says "N bets risking $x"; menu lists 🎯 My games and only the sports with an open bet | #75 |
| v4.27 | Hard stop: past the daily max the first Save press stops and shows today's money; a second press saves | #76 |
| Worker v3.42 | A Novig fill carries its game's two teams from Novig's description | prop-bet-api #5 |
| v4.28 | Sort › ✅ Math (blended edge, outliers last) is the default; "✅ #1 MATH PICK" on the best card; the score colours say STRONG / GOOD / THIN | #77 |
| v4.29 | Augi's look (his greens, system font, panels) and his five tabs: Board, Live Games, Parlay, Bet log, Settings; the other screens in a row under Board and Bet log | #78 |

Also: a "Para ChatGiPiTiTi" note per build (`agent-notes/para-chatgipititi_<version>_<date>.md`), a backup note
(`agent-notes/backup_2026-11-08_v1.md` + .html), and a review of Augi's code (`agent-notes/review-for-augi_2026-11-09_v1.md`).

## Alonzo's settings, as agreed ($500 bankroll)
Kelly 0.25 · edge haircut 0.5 · smallest bet $1 · largest $10 · max per game 2% ($10) · daily max 10% ($50, the hard wall) · daily bet goal 16
(a goal only) · model weight 0.35 (stakes sized on 65% market, 35% BettingPros). Bankroll changed monthly from the Scorecard, never mid-day.

## Please check
1. **The order of the daily budget.** The daily max is filled by the blended edge (fraction), outliers last. Is edge the right order, or
   should it be expected dollars (stake × edge) or Kelly growth, when bets have different odds? Same question went to ChatGPT.
2. **The hard stop's day.** It counts the bet's game day, not the day it is placed. A Monday bet on a Tuesday game counts on Tuesday.
   Does that match how Alonzo thinks about "today"?
3. **The five tabs on a phone.** Is a bottom bar of five plus a second row under Board and Bet log easy to learn, or should + Add a bet
   be a main tab? Alonzo adds bets by hand often.
4. **Model weight 0.35.** Worth revisiting after a few hundred graded picks in "Is the model honest?" (Performance). Suggest the rule
   for raising or lowering it.
5. **Augi's review.** The six fixes listed for Augi (NHL shots column, logging after 20 minutes, caps counting parlays, matching,
   soccer draws, EV units): are any of them wrong, or is something missing?

## Open items
- Kalshi's college team codes vs ESPN's are still unverified (the build machine cannot reach kalshi.com).
- The Chrome-tab bet reader (`tools/read-books.mjs`) still waits for Alonzo's first `books-dump.json`.
- One old accessibility note: amber rating stars on pink already-bet rows are 3.2:1 (decoration next to the number).
