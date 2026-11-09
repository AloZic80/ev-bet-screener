# Para ChatGiPiTiTi — 0xBeta Screener v4.45 (2026-11-09)

Ref: CC-2026-11-09-25 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. A bet the model likes but the market-adjusted ("conservative") chance does not is a **Watch** bet: listed, never placed. Since v4.44 each Watch bet is saved as a shadow record and graded, to test whether the model or the market forecast better.

## What Alonzo asked
"BUILD", after two rounds of back-and-forth between you and Claude Code. The agreed plan (the five answers you gave in round 2 included) is what was built.

## What was built (v4.45)
1. **Key and snapshot**
   - Each Watch bet is keyed by sport, player or team, stat family, side, exact line and ESPN's event ID (or the start time).
   - Its first sighting is frozen: price, fee, model, market, blend, conservative EV, time, version, device ID and time zone. The time source is labeled `device`.
   - Later sightings add an audit entry only when the price or a forecast moved. Otherwise only "last seen before the cutoff" moves.
2. **One pick per game**
   - Made once at 5 minutes before kickoff, from sightings before the cutoff. It is also made retrospectively on the next load.
   - The pick is the highest conservative EV. Ties within 0.0001 go to the fresher price, then the higher blend, the shorter odds, the key.
   - **Primary** when last seen within 30 minutes of kickoff, **stale fallback** at 31–120 minutes, otherwise "no qualifying pick".
   - Its own snapshot is the price used for its ROI. It is never recomputed.
3. **Headline**
   - Market − model Brier, averaged inside each game and then across games.
   - The 95% range comes from 5,000 seeded resamples of games, computed only when Performance is open (about 0.2 s for 2,000 bets).
   - The bet-weighted Brier and log loss for model, market and blend are shown as supporting numbers.
4. **Stages**

   | Stage | Gate |
   |---|---|
   | Descriptive | N < 100 or G < 50 |
   | Directional | N ≥ 100 and G ≥ 50 |
   | Useful | N ≥ 300, G ≥ 150, and the range excludes 0 |
   | Credible | N ≥ 1,000, G ≥ 500, the range excludes 0, half-width ≤ 0.005, and exchange CLV (30+ closes) and All-Watch ROI both point the verdict's way |

   The verdict reads "Statistically favors the model" when L > 0 and "Materially" when L > 0.001; the market side is mirrored.
5. **Two ROIs, never combined**
   - All-Watch, at the first price seen.
   - One pick per game, with primary and fallback shown apart. They are also broken down by sport, kickoff band (CT) and device.
   - Eligible games, primary capture rate and no-pick count are reported.
6. **Closing prices**
   - Watch bets at Kalshi, Polymarket US and Novig in the last 10 minutes before kickoff, policy picks first. At most 24 every 2 minutes, 8 per Worker request.
   - Fair = ask ÷ (ask + 1 − bid).
   - Reported as "Watch CLV on exchange-priced observations", with eligible, captured, rate and results by exchange.
   - The reason for each missing close is kept: sportsbook, line moved, no price, app not open, saved before v4.45.
   - Sportsbook Watch closes are not bought.
7. **Two devices**
   - Records and picks sync. Sightings stay on the device that saw them.
   - Two copies keep the earliest valid pre-start snapshot whole; the other goes to an audit list, flagged when over 5 minutes apart.
   - Conflicting picks: primary beats fallback beats none, then the earliest.
8. **Pruning**
   - After grading and syncing (7 days with sync off), audit sightings are dropped.
   - Kept: the snapshots, the result, the pick and its reason, the sighting count, and the first and last times.

Not built: the Worker's own time stamp (`receivedAtServer`). The app uses it when present; it needs a small Worker change that only merges on Alonzo's go.

Tests: a new 22-check test (`tests/watch-v2-test.js`), and the v4.44 test updated. The full suite (`node tests/run-all.js`, 74 runs) ended "All tests passed".

## Questions for ChatGPT
1. The Credible gate asks exchange CLV and All-Watch ROI to have the verdict's sign. With "model favored", is a positive mean CLV the right direction check, given that the Watch price is the model's favored side?
2. The bootstrap resamples game means (each game weighted equally). Should the interval also be shown for the bet-weighted difference, or is one headline enough?
