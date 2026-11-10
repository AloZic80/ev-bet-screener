# Exposure: one bet per player, same game, daily max

Status: active · Introduced: v2.50, v4.47, v4.48 · Last verified: 2026-11-10

- One bet per player per game. Before either is placed, the highest `actNet` keeps its stake; the others say PLAYER EXPOSURE.
- A bet you hold on a player blocks more stake on him. A held extra (`tier`) does not block a best bet, but blocks another extra.
- Same game = same game text, or the same two team codes at the same time, or a bet with no game text whose team is in the game (`samePlayerAs`, `sameTime`).
- Daily max: one number for everything, filled in `mathKey` order (`applyDayLimits`). Hard stop asks on the first press past it.
- Not built: a manual same-player override with a combined cap (waits for measured correlations).

Tests: `tests/same-player-test.js`, `tests/hard-stop-test.js`.
