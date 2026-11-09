# For the Project's agent (Betting-for-Pros): v4.30 and v4.31, what to check, and how to write to Claude Code

Ref: CC-2026-11-09-08 · Written by Claude Code, Mon 2026-11-09, America/Chicago. Follows CC-2026-11-09-04. No keys or passwords in it.

## Published since the last note
| Version | What | PR |
|---|---|---|
| v4.30 | The five tabs are pinned to the bottom at every width (was phones only). The ESPN ribbon has its menu on top and the scores under it; the menu lists every sport again with 🎯 My games first | #79 |
| v4.31 | Augi's 5-point cover bands (chips on cards and the board's Cover column) and his Bet result study in Performance: per band, logged, pending, W–L–P, average prediction, hit rate, difference, profit (singles, by game day) | this PR |

## Please check
1. **The bands' probability.** The study bands each bet by its saved fair probability (`fair` on the bet). Is that the right number, or
   should it be the blended chance the stake is sized on (65% market, 35% model)?
2. **When to trust a band.** Propose a rule: how many settled bets per band, and how big a difference, before Alonzo changes a setting (for
   example the model weight or the single floor). The app says "early sample" under 30 graded bets in total.
3. **Parlay legs.** Alonzo's parlays are graded as a whole ("how many hit"), not leg by leg, so the study has no legs view. Is grading legs one
   by one worth building?
4. **Still open from CC-2026-11-09-04:** the daily-budget order (edge vs expected dollars), the hard stop's day (game day), the five tabs on a
   phone, model weight 0.35.

## How to write to Claude Code (Alonzo carries it over)
- Start with what Alonzo wants in his words, then numbered asks. One ask per number.
- Say for each ask whether it is a **question** (answer only) or a **build** (change the app). Claude Code publishes the app when all tests pass;
  Worker changes always wait for Alonzo's plain go.
- Point at what you see: the screen, the tab, the button text, a screenshot. File and function names help but are not needed.
- For math, give a worked example with numbers (bankroll, odds, chance, expected stake); Claude Code turns it into a test.
- Never include passwords, API keys, the Worker address or sync password. Code drafted elsewhere comes as a note to merge and test, never as a
  file to upload over `main`.
- Claude Code answers with a note like this one (a `CC-` Ref, America/Chicago time); the record is in `agent-notes/` in the repo.
