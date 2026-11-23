# Exposure: one bet per player, same game, daily max

Status: active · Introduced: v2.50, v4.47, v4.48 · Last verified: 2026-11-10

- One bet per player per game. Before either is placed, the highest `actNet` keeps its stake; the others say PLAYER EXPOSURE.
- A bet you hold on a player blocks more stake on him. A held extra (`tier`) does not block a best bet, but blocks another extra.
- Same game = same game text, or the same two team codes at the same time, or a bet with no game text whose team is in the game (`samePlayerAs`, `sameTime`).
- Daily max: one number for everything, filled in `mathKey` order (`applyDayLimits`). Hard stop asks on the first press past it.
- Game cap (v5.26, Build B, owner "BUILD ALL" 2026-11-22; size unchanged, 2% of the bankroll): it holds with nothing logged on the game, and over the board's own rows of one game (`applyGameCaps`, before the daily max, in `mathKey` order): room = cap − the logged money on the game (same team and side 1.5×, opposite 0.75×) − what the better rows of that game already took (weighted the same way); trimmed if it stays at or above the smallest bet, else $0 with "game cap reached". A game is its ESPN event, else its game text and start hour. Off when the cap is 0. Under $500 set aside it lowers single stakes to 2% of the bank (it was let through). Before v5.26 the cap was checked row by row against logged money only, so a busy game could list 2.5× the cap.
- A free bet (🎁) counts $0 toward the daily max and the game cap when stakes are sized (v5.26: `applyDayLimits`, the game cap's logged sum, `abStake`, `easyBankNeed`), as on every screen.
- + Add a bet sizes like the board (v5.26, `abStake` with the bet's kind, player or team and game day; `abRules`): the room of the bet's own game day; a player you hold in that game gets $0 (PLAYER EXPOSURE); long-shot moneylines and the moneyline gap rule as below; the 6th bet with no market check that game day, or a second one in the same game, gets $0; its game cap finds the game as the board does (team codes in either order, its game day) with same team and side 1.5× (round 2).
- The bet form's "recommended at this price" (v5.26, `recStake`): $0 with the board's own words on a card the board gave $0 for a limit (daily max, game cap, a player you hold, one side a game, long shots, model-only, gap research, outliers), whatever price is typed; at the card's own price and book any $0 of the board stands; no market check or a long-shot moneyline: the smallest bet.
- Not built: a manual same-player override with a combined cap (waits for measured correlations).

Tests: `tests/same-player-test.js`, `tests/hard-stop-test.js`, `tests/v526-limits-test.js` (v5.26).

## Long-shot moneylines and moneyline gaps (v4.68, agreed with ChatGPT, owner "BUILD" 2026-11-11)
- Why: his week of Nov 4–10 lost $43.63 on 34 long shots (4–30), almost all underdog moneylines; props were +11%.
- A moneyline where La Contadora's chance is under 45%: needs a market price, the smallest bet, at most 3 a game day and 1 a game, in every mode (🍀 and 🔮 use the same 3). Logged bets and matched waiting orders count.
- A moneyline where the model is more than 8 points above the market: research only (👀 Watch, no stake, kept out of the scorecard if logged). Spreads and totals are not affected.
- Test: `tests/scope-v468-test.js`.
- v4.69: which logged moneyline counts toward the 3: La Contadora's chance saved with the bet; else the board's reading of that exact bet from before you placed it and before kickoff; else the model's fair chance or the price you paid under 45% (+123 or longer). A 45%+ answer from the first two stops there. The source is saved on the bet (`lsmlCls`). Test: `tests/lsml-class-test.js`.
