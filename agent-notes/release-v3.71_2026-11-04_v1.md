# Release: v3.70 and v3.71
Ref: CC-2026-11-04-03 · From: Claude Code · Date: 2026-11-04, 11:40 PM America/Chicago · For: the Project "Betting-for-Pros" (Project knowledge)

## v3.70: the Sentinels' circles (live)
- Alonzo asked why only the 4 was circled. The circles 2 3 4 5 6 are the entry sizes a pick is good enough for.
- The ring now follows the size he taps (it was fixed on 4). Picks that fit that size come first.
- "↓ See the best N-pick entry" jumps to the entry card below the list. ★ 4 is still the target.

## v3.71: 🔴 Live edges (top of the Live tab)
- Question: "Can't we get live bets from Kalshi, Novig, Polymarket US, with our model?"
- Answer: the prices were already there (the Worker's `/live`). What was missing is a fair price that holds once a game starts.
  The board's model (BettingPros projections, Pinnacle pre-game) goes stale at kickoff, so it would show fake edges.
- Fair price: ESPN's live win chance (free, already loaded on the Live tab). Moneylines only.
- For each game in progress, it asks Kalshi, Polymarket US and Novig what they sell each team at now.
- Flagged "✓ edge" only when all three hold:
  - at least 3% edge after the fee (Novig's live fee included);
  - a chance between 8% and 92%;
  - a price within 25 points of ESPN's (further off is a different market).
- Shows "pay at most" (the highest price that still has a 3% edge) and when it checked. The count is on the Live tab.
- Repeats with Auto-refresh, every 30 seconds at most.
- On screen: prices move in seconds; ESPN's number is a model too; bet smaller than usual.

## Open
- Pinnacle live as a second fair price. pinnapi has a live feed (Alonzo's screenshot). His Worker only calls
  `/kit/v1/prematch/fixtures`. Needs pinnapi's live endpoint from its docs, then one Worker route.
- Unknown until a real game: does the Worker's `/live` return Kalshi, Polymarket and Novig prices after kickoff?
  If it refuses, each price shows "—" with the Worker's reason on hover.
- Test note: `tests/log-test.js` fails between about 7 PM and midnight Chicago time, on v3.70 too. Its "today" bet starts
  5 hours later, which is tomorrow by then. That is the test's clock, not the app. Passes the rest of the day.
- Tests: 17 files; the new `tests/live-edges-test.js` passes 9 of 9.
