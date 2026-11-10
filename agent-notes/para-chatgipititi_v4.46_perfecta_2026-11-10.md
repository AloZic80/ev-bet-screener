# Para ChatGiPiTiTi — the "perfect bet" (proposal, not built) · v4.46 · 2026-11-10

Ref: CC-2026-11-10-02 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV). Its EV calculator, La Contadora, uses a conservative chance (`okProb`) for the EV floor, "OK up to" and the stake:

`min(model, market + 0.35 × (model − market))`

Every bet also gets one of Augi's 5-point cover bands on its chance:

| Band | Chance |
|---|---|
| Long Shot | < 45% |
| Feeling Lucky | 45–50% |
| On the Line | 50–55% |
| Slight Lean | 55–60% |
| Lean | 60–65% |
| Solid | 65–70% |
| Strong | 70–75% |
| Heavy Favorite | 75–80% |
| High Cover | 80%+ |

The board only lists odds from −300 to +500.

## What Alonzo asked
"What is the 'perfect' bet: a certain % but with what EV, or odds? Long shots aren't so good, and heavy favorites aren't always paid well. I want a circle around the bet, highlighted, that tells me it is an excellent bet because it passes everything (almost) perfectly, within a certain range."

## The numbers (computed, no fees)

**What each band needs to be "perfect"** (room for error ≥ 2.5 points AND EV ≥ +4%), at the middle of the band:

| Band | Chance | Odds needed (or better) | EV there | One loss costs | 5 losses in a row |
|---|---|---|---|---|---|
| Long Shot | 40% | +167 | 6.7% | 0.6 wins | 7.8% |
| Feeling Lucky | 47.5% | +122 | 5.6% | 0.8 wins | 4.0% |
| On the Line | 52.5% | −100 | 5.0% | 1.0 win | 2.4% |
| Slight Lean | 57.5% | −122 | 4.5% | 1.2 wins | 1.4% |
| Lean | 62.5% | −150 | 4.2% | 1.5 wins | 0.7% |
| Solid | 67.5% | −185 | 4.0% | 1.9 wins | 0.4% |
| Strong | 72.5% | −230 | 4.0% | 2.3 wins | 0.2% |
| Heavy Favorite | 77.5% | −292 | 4.0% | 2.9 wins | 0.1% |
| High Cover | 85% | −447 | 4.0% | 4.5 wins | 0.0% |

**At the same +5% EV, the room for error grows with the chance:**

| Band | Room for error | EV if the model is 2 points too high |
|---|---|---|
| Long Shot | 1.9 points | −0.2% (already a loser) |
| On the Line | 2.5 points | +1.0% |
| Strong | 3.5 points | +2.1% |
| High Cover | 4.0 points | +2.5% |

Reading:
- Long shots get a big EV% from thin points. They are the most fragile to a small model error, and they sit where models and markets are least reliable (the tails, the favourite–longshot bias).
- Heavy favorites are steady on paper. But each loss costs about 3 wins, they need near −300 or shorter, and a big model-over-market gap at the extremes is usually overconfidence. High Cover with a real edge is past the board's −300 limit.

## Proposal: "PERFECTA" ring (name to be chosen by Alonzo)
A gold ring around the card (and the board row) when all six checks pass:
1. **Zone:** La Contadora's chance is 50–75% (On the Line, Slight Lean, Lean, Solid, Strong). The bet wins more often than it loses, and one loss costs at most about 2.3 wins. The heart is 55–65%.
2. **Edge:** EV after fees on that chance is +4% to +12%. The floor is 1.5%; above about 12% it is usually a stale price or a wrong match.
3. **Room for error:** that chance is at least 2.5 points above the price after fees. Odds then land between about −230 and +100.
4. **Everything lines up:** Model ≥ Market > Price. The market's own no-vig chance already beats the price, so it is +EV without the model.
5. **Fresh:** the price was seen in the last 10 minutes.
6. **Clean:**
   - no injury or weather flag;
   - not an outlier;
   - the line has not moved against it, and nothing is logged on the other side;
   - the stake is not capped at the smallest bet.

Details:
- **Five of six** gets a thin silver ring that names the missing check (e.g. "price 14 min old: re-check").
- **"Why this play?"** shows the six checks with ✓/✗.
- **Show › ◎ Perfectas** lists only them.
- **The ring is a label:** stakes stay La Contadora's.
- **Logged bets keep the ring,** so Performance can show Perfectas vs the rest (W–L, ROI, CLV). Only results will tell if the ring means anything.
- **Sweet spot:** this replaces or sits next to the older Settings sweet spot (3★, model EV 2–10%, odds −150 to +150, beats the market, no outliers).

## Questions for ChatGPT
1. Are these thresholds sensible for player props and game lines: zone 50–75%, conservative EV +4% to +12%, room ≥ 2.5 points, Model ≥ Market > Price, price ≤ 10 min old? Would you change the zone or use room-for-error in points as the main test?
2. Should the zone later be set from his own results (Performance › Bet result study: hit rate vs predicted per band), for example keeping only bands where the model has been calibrated over 100+ settled bets?
