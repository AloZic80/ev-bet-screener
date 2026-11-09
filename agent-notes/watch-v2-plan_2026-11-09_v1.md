# Watch bets v2: running plan (not built yet)

Ref: CC-2026-11-09-23 (round 1), CC-2026-11-09-24 (round 2) · Claude Code, Mon 2026-11-09, America/Chicago · Status: **discussion, do not build** (owner: "DO NOT BUILD, have a convo back and forth ... I'll tell you when to build").
Base: v4.44 (Watch bets saved once as shadow records, graded, model vs market vs blend in Performance).

## Agreed so far (owner + ChatGPT + Claude Code)

### A. Dataset and headline
- All Watch bets remain the dataset; one record per unique bet (the first time it enters Watch, before the game).
- **Headline:** game-balanced market − model Brier difference. Average D = Brier(market) − Brier(model) inside each game, then average across games. 95% interval from **5,000** resamples of games (seeded). Computed only when Performance opens, not on every board refresh.
- **Supporting:** the bet-weighted Brier scores and log loss (model, market, blend) over every Watch bet.
- Always show **N Watch bets** and **G unique games**, and show the interval even when a stage is not reached.

### B. Stage labels: the lower of two count scales, plus the interval
| Stage | Gate |
|---|---|
| Descriptive | N < 100 or G < 50 |
| Directional | N ≥ 100 and G ≥ 50 |
| Useful comparison | N ≥ 300, G ≥ 150, and the game-clustered 95% interval excludes 0 |
| Credible evidence | N ≥ 1,000, G ≥ 500, the interval excludes 0, its half-width (U − L) / 2 ≤ **0.005** (round 2; was 0.01), and CLV and hypothetical ROI point the same way |

- Two separate readings, both declared before any data and never tuned after:
  - **Statistically favors the model:** the lower end L > 0.
  - **Materially favors the model:** L > 0.001 (a provisional practical threshold, unverified).
- The estimate and interval are always shown, even when no verdict is given.

### C. One-per-game policy test (separate from the calibration sample)
- Candidates: the game's Watch bets seen before a fixed **cutoff, 5 minutes before kickoff**.
- Pick: the highest **conservative EV (`actNet`)**, never model EV.
- Tie-breaks, in order:
  1. `actNet` within 0.0001 counts as a tie;
  2. the fresher price;
  3. the higher blend chance;
  4. the shorter odds;
  5. the canonical key, alphabetically.
- **Freshness (round 2):**
  - **Primary sample:** the latest sighting within 30 minutes before kickoff.
  - **Fallback sample:** the latest sighting 31–120 minutes before kickoff, labeled `stale fallback`.
  - Nothing within 2 hours: "no qualifying pick".
  - Primary and fallback ROI are never combined.
- **Report:** eligible games, primary picks, fallback picks, no qualifying picks, capture rate; results by sport, kickoff-time band, and device.
- Say plainly that the sample describes games seen near kickoff, not every game; when he checks can follow sport, time or how good the board looks.
- A separate immutable **`policySnapshot`** holds the price at selection, model / market / blend, fee, `actNet`, quote time and version.
  - The calibration record keeps its own first-seen snapshot.
  - Policy ROI uses only `policySnapshot`, never an old first-seen price.
- If the page is closed at the cutoff, the pick is made on the next load **only from sightings timestamped before the cutoff**.
- Selections are never recalculated after the ranking logic changes.
- Two ROIs, never averaged:
  - **All-Watch ROI:** every shadow bet at its first-seen price.
  - **One-per-game policy ROI:** the policy picks at `policySnapshot`.

### D2. Storage after grading (round 2)
- **Kept:**
  - the calibration snapshot, the policy snapshot and the closing snapshot;
  - the result and who graded it;
  - the event and market identity;
  - the pick chosen and the tie-break that chose it;
  - the freshness / cutoff status;
  - the number of sightings, with the first and last times;
  - the version;
  - conflict and missing-data flags.
- **Deleted:** ordinary audit sightings, after the compact record has synced when possible.

### D. Sightings
- An unchanged re-sighting does nothing.
- A changed price or forecast is kept as an audit sighting (time, price, model, market, blend, `actNet`). It never creates another Watch observation.
- Sightings are what the cutoff selection reads.

### E. Sync across devices (phone and Mac build one sample)
- **Key:** ESPN event ID where available, plus sport, normalized participant, stat family, side and exact line, plus game start/date. Game day alone can collide after a postponement or in a doubleheader.
- Conflicting copies of one observation go to an audit array. The canonical calibration record is the **earliest valid, complete, pre-start snapshot**, chosen whole: price, fee, model, market and blend are never mixed from different devices.
- Malformed and post-start records are excluded before choosing.
- **Time (round 2):**
  - Device time is fine for now. Each snapshot stores the device time, time-zone offset, a device ID and the event start; the time source is labeled `device`.
  - Conflicting snapshots are kept, never deleted at once.
  - The earliest complete pre-start snapshot wins, chosen the same way every time.
  - Copies more than 5 minutes apart are flagged as a conflict.
  - Each snapshot stays atomic: no record is built from fields of different devices.
- **Worker timestamp: a high-priority small change** (prop-bet-api, merged only on the owner's go). It records when the Worker received the record; it never stands in for when the quote was seen. Both are kept: `observedAtDevice` and `receivedAtServer`.
- The policy test uses its own cutoff snapshot, not the earliest calibration one.

### F. Closing prices: start now, selectively
- Capture priority:
  1. your placed bets;
  2. the one-per-game policy pick;
  3. other Watch bets only when they come free or batched in the same event/API response.
- Fixed closing window, the same side and exact line, both sides' prices, de-vigged the same way. A moved line is kept but excluded from CLV.
- Record why a close is missing.
- Report: eligible records, closes captured, capture rate, and the capture policy.
- **Sources (round 2):**
  1. placed bets: closes at every book available;
  2. Watch bets: free exchange closes (Kalshi, Polymarket US, Novig);
  3. sportsbook Watch closes only when already in a paid or batched response. No extra credits are spent on them.
- Labeled **"Watch CLV on exchange-priced observations"**, never "Watch CLV overall". Show eligible, captured, capture rate and results by exchange.
- Brier and log loss do not need a close; CLV is a separate diagnostic.

## Open points
Round 1's five points are answered (sections C, E, F, D2, B).

Claude Code's notes for the build:
- **Device ID:** the app has none today. It would be a random ID made once per browser (`mbev.devId`). It names no one and is synced with the record.
- **The Credible test needs CLV:** "CLV and ROI point the same way" can only use the exchange-priced closes, so Credible needs enough of those too. The build would show that coverage next to the verdict.
- **The Worker timestamp** lives in prop-bet-api. The app would be built to use `receivedAtServer` when present and `device` time otherwise, so it works before and after that Worker PR.
- **Pruning:** applied only to graded records, after their compact copy is synced (or after 7 days with sync off).

