# Watch bets and reading the record

Status: active · Introduced: v4.44, v4.45, v4.52 · Last verified: 2026-11-10

- A Watch bet is saved once as a shadow record (`mbev.watchObs`); the first sighting is frozen. Never in money views.
- One policy pick per game, made 5 minutes before kickoff (`watchPolicyRun`); primary if seen within 30 minutes.
- Stages by bets and games: 100/50 directional, 300/150 useful if the range excludes zero, 1,000/500 credible.
- Perfecta minus other best bets (`tierCmp`): ROI and CLV differences, 5,000 seeded resamples of whole games inside three kinds of game.
- Just missed: two reports kept apart. Chosen ones (a user-selected subset) and every one seen (first price, and the cutoff pick's price).
- No threshold is changed because of these numbers without the owner's go.

Tests: `tests/watch-shadow-test.js`, `tests/watch-v2-test.js`, `tests/signal-record-test.js`. Plan: `agent-notes/watch-v2-plan_2026-11-09_v1.md`.
