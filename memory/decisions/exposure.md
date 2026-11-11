# Exposure: one bet per player, same game, daily max

Status: active · Introduced: v2.50, v4.47, v4.48 · Last verified: 2026-11-10

- One bet per player per game. Before either is placed, the highest `actNet` keeps its stake; the others say PLAYER EXPOSURE.
- A bet you hold on a player blocks more stake on him. A held extra (`tier`) does not block a best bet, but blocks another extra.
- Same game = same game text, or the same two team codes at the same time, or a bet with no game text whose team is in the game (`samePlayerAs`, `sameTime`).
- Daily max: one number for everything, filled in `mathKey` order (`applyDayLimits`). Hard stop asks on the first press past it.
- Not built: a manual same-player override with a combined cap (waits for measured correlations).

Tests: `tests/same-player-test.js`, `tests/hard-stop-test.js`.

## Long-shot moneylines and moneyline gaps (v4.68, agreed with ChatGPT, owner "BUILD" 2026-11-11)
- Why: his week of Nov 4–10 lost $43.63 on 34 long shots (4–30), almost all underdog moneylines; props were +11%.
- A moneyline where La Contadora's chance is under 45%: needs a market price, the smallest bet, at most 3 a game day and 1 a game, in every mode (🍀 and 🔮 use the same 3). Logged bets and matched waiting orders count.
- A moneyline where the model is more than 8 points above the market: research only (👀 Watch, no stake, kept out of the scorecard if logged). Spreads and totals are not affected.
- Test: `tests/scope-v468-test.js`.
- v4.69: which logged moneyline counts toward the 3: La Contadora's chance saved with the bet; else the board's reading of that exact bet from before you placed it and before kickoff; else the model's fair chance or the price you paid under 45% (+123 or longer). A 45%+ answer from the first two stops there. The source is saved on the bet (`lsmlCls`). Test: `tests/lsml-class-test.js`.
