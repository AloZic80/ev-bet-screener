# Bugs that came back, and what stops each now

| Bug | Seen | Stops it |
|---|---|---|
| A `const` helper used at startup before its line ran ("Cannot access before initialization": half a page) | v4.15, v4.50 | Function declarations only for anything a render can call; `tests/startup-test.js` |
| An apostrophe inside a single-quoted string | several | Write "it is" or `’`; the script-parse check before every test run |
| A `//` comment in the middle of a long line cut the rest of the line | v3.64, v4.48 | Use `/* */` mid-line |
| A bet placed at a book still shown as bettable (wording differs) | v4.25, v4.39, v4.40, v4.47 | `propSame`, `glTeamSame`, `fillPriorFor`; `tests/prop-prior-test.js`, `tests/novig-plus-test.js`, `tests/fill-prior-test.js` |
| Clearing saved results to force a regrade lost them | v3.94 | Grade first, replace only when the new grade exists |
| A warning that moved the board | v4.46 | Fixed bars only; `tests/board-scroll-test.js`, `tests/editor-stays-test.js` |
| A test passed on a file being edited mid-run | v4.50 | Run the suite on a snapshot or stop editing |
| A random generator that repeated after 10,000 draws | v4.52 (caught in review) | mulberry32 in `tierCmp`; `watchStats` still uses the old one (open) |
| A count on screen that did not match the list ("Novig 53") | v4.50 | Count after every filter |
| A count on screen that did not match the list ("72 pass", tabs 6 + 1 + 27; then "🍀 2 just missed" counting a Coin Flip) | v4.76, v4.77 | "N in the tabs ▸" lists where every approved bet is and adds up; `tests/pass-where-test.js` |
| A 30-second check that asks for a redraw on every tick while an open editor holds the draw (a full audit each time) | v4.61 (best-book claims), v4.79 (⏱ Old, caught in review) | Save what was asked for before `refresh()` (`_shopStaleSig`, `r._old`); `tests/old-prices-test.js` (editor open, `clock.runFor`) |
| A what-to-type strip that said YES where the book's own answer is NO (a two-sided team market; a Draw row naming the home team) | v4.79 Polymarket (caught in review before publishing); Kalshi underdog spreads since v4.09 (fixed in v4.80) | Team bets name the side; YES / NO only from the quote or the spread's sign; no strip for a Draw; the Worker does not read a Draw (v3.44); `tests/poly-strip-test.js`, `tests/v480-test.js`, Worker `test/draw-test.mjs` |
| A final game graded from a box score read mid-game (Live Games settle) | v4.76 (caught in a test: Over 27.5 lost at 20, final 28) | Final games read `fetchBoxscore(…, true)` and settle only when `boxDone`; `tests/live-player-test.js` |
| A new hoisted `function` that reuses an existing name (the later declaration silently replaces the earlier one everywhere) | v5.01 Said vs won `calRows` broke Performance’s calibration tables (found by the v5.03 planners) | Grep the name before adding a function; tests/v503-test.js fails on any function declared twice |
| A grade taken from the wrong game: a later meeting of the same teams on today’s list (Check results), tonight’s final for tomorrow’s bet (Live Games), game 1 of a doubleheader, a same-name player | v5.24 audit (GRADING-1/2/4/5) | `ownGameOk`, `pickByStart`, strict stat to pick a game; `tests/v525-grading-test.js`; Check my history to find old ones |

## Owner-confirmed records: never flag them again
- **Tuli Tuipulotu Over 0.5 sacks, Bovada +135, 11/1: two tickets on purpose** (the second is b1793588, "ticket 2", made with "+ ticket"). Alonzo said so
  several times (CC-2026-11-11 report, and again 11/14 after the bet-log evaluation asked). Both count for money; one outcome for calibration.
- In general: a ticket with `dupOf` made with the "+ ticket" button is a second bet on purpose. Reports and data checks list it as such, never as a
  possible duplicate. Before asking the owner about a record, search `agent-notes/` and this file for its name.
- **Trent Walker Over 3.5 receptions, Bovada +100, $1.52, 11/13 (7ab6402c):** Alonzo's Bovada ticket PROPS-400252286 shows Stake $1.52, Odds 2.00,
  Winnings +$3.04. Bovada's "Winnings" in bet history is the **total return** (stake × decimal odds), not the profit. The typed To win $3.04 should be
  $1.52 (owner to fix in the Bet log). Rule for reports: on Bovada, To win = Winnings − Stake.
