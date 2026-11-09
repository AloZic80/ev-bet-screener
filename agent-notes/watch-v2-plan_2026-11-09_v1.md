# Watch bets v2: running plan (not built yet)

Ref: CC-2026-11-09-23 · Claude Code, Mon 2026-11-09, America/Chicago · Status: **discussion, do not build** (owner: "DO NOT BUILD, have a convo back and forth ... I'll tell you when to build").
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
| Credible evidence | N ≥ 1,000, G ≥ 500, the interval excludes 0, and its half-width ≤ 0.01 Brier points (a policy choice, unverified) |

### C. One-per-game policy test (separate from the calibration sample)
- Candidates: the game's Watch bets seen before a fixed **cutoff, 5 minutes before kickoff**.
- Pick: the highest **conservative EV (`actNet`)**, never model EV.
- Tie-breaks, in order:
  1. `actNet` within 0.0001 counts as a tie;
  2. the fresher price;
  3. the higher blend chance;
  4. the shorter odds;
  5. the canonical key, alphabetically.
- **Freshness:** the pick's price must have been seen within 30 minutes of the cutoff; otherwise the game is "no qualifying policy pick".
- A separate immutable **`policySnapshot`** holds the price at selection, model / market / blend, fee, `actNet`, quote time and version.
  - The calibration record keeps its own first-seen snapshot.
  - Policy ROI uses only `policySnapshot`, never an old first-seen price.
- If the page is closed at the cutoff, the pick is made on the next load **only from sightings timestamped before the cutoff**.
- Selections are never recalculated after the ranking logic changes.
- Two ROIs, never averaged:
  - **All-Watch ROI:** every shadow bet at its first-seen price.
  - **One-per-game policy ROI:** the policy picks at `policySnapshot`.

### D. Sightings
- An unchanged re-sighting does nothing.
- A changed price or forecast is kept as an audit sighting (time, price, model, market, blend, `actNet`). It never creates another Watch observation.
- Sightings are what the cutoff selection reads.

### E. Sync across devices (phone and Mac build one sample)
- **Key:** ESPN event ID where available, plus sport, normalized participant, stat family, side and exact line, plus game start/date. Game day alone can collide after a postponement or in a doubleheader.
- Conflicting copies of one observation go to an audit array. The canonical calibration record is the **earliest valid, complete, pre-start snapshot**, chosen whole: price, fee, model, market and blend are never mixed from different devices.
- Prefer server time over device clocks. Malformed and post-start records are excluded before choosing.
- The policy test uses its own cutoff snapshot, not the earliest calibration one.

### F. Closing prices: start now, selectively
- Capture priority:
  1. your placed bets;
  2. the one-per-game policy pick;
  3. other Watch bets only when they come free or batched in the same event/API response.
- Fixed closing window, the same side and exact line, both sides' prices, de-vigged the same way. A moved line is kept but excluded from CLV.
- Record why a close is missing.
- Report: eligible records, closes captured, capture rate, and the capture policy.

## Open points (Claude Code's notes for the next round)
1. **The page has to be open.** The cutoff pick, its 30-minute freshness and closing prices all need the app open near kickoff, or a sighting from shortly before. On days Alonzo does not open the app near game time, many games will be "no qualifying policy pick" and many closes missing. The policy sample will lean toward times he checks the board. That is honest if reported, but it is a selection effect.
2. **Server time.** Today's sync stores your saved data as one blob; the Worker does not stamp records. True server time needs a small Worker change (owner's go to merge). Until then, device time it is, with "earliest" chosen among device times.
3. **Where closes come from.**
   - Kalshi, Polymarket US and Novig: the Worker's `/live` (no provider credits, but Worker calls).
   - Sportsbooks: The Odds API, which costs credits.
   - Watch closes would come only from the exchanges (free) unless Alonzo approves credits.
4. **Storage.** Sightings plus audit copies grow fast on busy days. Caps are needed (e.g. keep sightings only until the game is graded, then only the snapshots used). localStorage is about 5 MB per site.
5. **The 0.01 half-width gate.** Typical model − market Brier differences are a few thousandths. A ±0.01 half-width is loose, so "excludes zero" will usually be the binding test. Fine as written, but worth knowing.

## Next
Owner keeps going back and forth with ChatGPT; Claude Code adds each round here. Build only on the owner's "build".
