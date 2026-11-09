# For Augi's agent: an outside math check of Alonzo's EV calculator, and what it means for the Odds Board

Ref: CC-2026-11-09-18 · Written by Claude Code, Mon 2026-11-09, America/Chicago
For: Augi's assistant (his personita), passed on by Alonzo. Read: AugiM13/screener `odds-board.html` (kitMath, screenRow).
No Worker address, password or key is in this note.

## What happened
Alonzo published a write-up of his screener's EV math (La Contadora). A second AI checked it. Its points were mostly about wording. One was a real flaw in the app, and it applies to any screener built like yours.

Your `kitMath` and Alonzo's engine are built the same way:

```
fair      = model chance (BettingPros projection, or devigged sharp price)
net EV    = ((fair ÷ price − 1) − fee) ÷ (1 + fee)            ← the screen floor checks this
blend     = market + modelWeight × (fair − market)           ← "sizing chance"
blendNet  = ((blend ÷ price − 1) − fee) ÷ (1 + fee)
stake     = bank × kelly × (blendNet × haircut) ÷ (1 ÷ price − 1)
```

So the **floor** is checked on the model, but the **stake** is sized on the blend. A pick can pass the floor on the model alone while the blend gives it about 0% edge and a $0 stake.

## What Alonzo's app changed (v4.41)

1. **"OK up to" / max price uses the blend now** (or the model when that is lower), because that is what the stake is sized on. Before, it used the model, and showed "OK to 54.6%" on a card whose blend limit was 52.8%. At 53.5% the card said OK while the stake was $0. The same limit now drives Kalshi's limit price.
   - **Your Odds Board has no "pay at most" yet.** If you add one, compute it from the blend, not from `fair`.
2. **Three chances, named apart:**
   - **Model chance:** the projection, or a devigged sharp price.
   - **Market chance:** the consensus, vig removed.
   - **Sizing chance:** the blend.

   The model and market are not independent confirmations; they often share information. Showing them with these names avoids that misreading.
3. **Rounding is called out.** The card shows "-125 / 55.5%", but the math uses about 55.46%. Hand-checks from the rounded figures give +7.0% EV and a $2.23 stake; the card shows +6.8% and $2.17. Both are right for their inputs. Your boards round the same way, so it is worth a one-line note wherever you explain EV.
4. **Parlays: an independence warning.** Pick'em value multiplies each leg's own chance, which assumes the legs are independent. Same-game or linked legs can overstate value a lot. Your Parlay draft already warns "treat same-game legs as correlated", which is good. Alonzo's app keeps "one pick per game" on by default, and on combo apps requires each leg to have its own value: a 75% leg is not automatically a good leg.
5. **Statistical wording:**
   - The thinnest picks "still clear the **estimated** EV floor" (not "still +EV").
   - The 1,000-bet test "gives evidence of an edge" (not proof). It checks that the 95% ranges for ROI and median closing-line value are both above zero; correlated and longshot-heavy bets weaken that evidence.
6. **FanDuel Predicts fee, written down:** "2% of the payout" becomes 2% ÷ price as a fraction of the stake, treated as paid on every slip. The rate is an estimate, so EVs at that book are marked approximate.

## Suggested checks for the Odds Board
- [ ] Wherever a price limit or "good up to" is shown, use the blend (or the model when lower).
- [ ] When a pick passes the net-EV floor but the blend sizes it at $0, say so on the row ("the model likes it, the market does not"), instead of showing a $0 stake with no reason.
- [ ] Label the model, market and blend chances by name where they are shown.
- [ ] Keep the correlated-legs warning, and consider defaulting to one leg per game.

The full write-up is `docs/EV-CALCULATOR.md` in Alonzo's repo (AloZic80/ev-bet-screener); Alonzo can share it.
