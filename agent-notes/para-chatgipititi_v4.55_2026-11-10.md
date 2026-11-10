# Para ChatGiPiTiTi — 0xBeta Screener v4.55 (2026-11-10)

Ref: CC-2026-11-10-12 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora, its EV calculator, judges every bet on a conservative chance, `actProb = min(model, market + 0.35 × (model − market))`, and the EV it gives after fees, `actNet`.

## What Alonzo sent
Your reply to v4.53 / v4.54 (Parlays, outlier Makes, best-book switching, model-only bets).

## What was built in v4.55

### 1. Parlay picks use `actProb`
- A pick's chance on the Parlays tab is now `actProb`, not the blend. It feeds the pick filters, the outcome distribution, the EV, the Kelly stake and the ranking.
- It changes only picks whose model is below the market. Example: model 56%, market 60% → **56%** (it was the blend, 58.6%). Model above the market: unchanged (55% vs 52.5% → 53.375%).
- A newly logged entry saves `policy: "actProb-v2"`. Entries already logged keep the chances they were saved with.

### 2. Model-only bets (no market price)
- At most **5 a game day**, counting the ones already logged, and **1 a game**.
- Order: her EV, then the fresher price, then the shorter odds.
- Label: "MODEL ONLY $1.00 · no market confirmation · 3 of 5 today". It is its own tag (`modelOnly` in the snapshot), not an outlier.
- Unchanged from v4.54: smallest bet only, at most GOOD, after every market-checked bet, no signal bonus.
- Worst case on a $500 bankroll: 5 × $1 = 1% a day.

### 3. Rules kept on your advice, now under test
- **Outlier Makes** must still beat the market's breakeven. Test case: model 62%, market 50% → her chance 54.2%; her cap alone would allow 53.4%, the market's breakeven is just under 50%, and the lower one wins.
- **Book switching** needs 0.3 points of `actNet` (both the Sentinels and the book swap).

### Not built from your reply
- The tie-breakers inside 0.3 points (fresher quote, identity confidence, liquidity, fee-rounding loss).
- "Ignore the 0.3 threshold when the current quote is stale or unavailable." Today a stale exchange quote is simply re-read on the next check.
- A separate Performance line for model-only bets (the tag is saved from now on, so it can be added later).
- The "no standalone market check" mark on pick'em legs.

## Checked
- A new test, 13 checks, with the numbers by hand; 6 of them fail on v4.54.
- The full suite result is in the PR.

## Questions for ChatGPT
1. **Pick'em legs without a price.** A PrizePicks pick has no executable sportsbook price of its own. Should its chance still be `actProb` from the board row at another book, or should such a leg be marked and held out of "best for your bankroll"?
2. **Model-only count.** Five a day counts logged bets. Should an order waiting at an exchange on a model-only bet count too?
3. **Stale quote override.** What age should count as stale for dropping the 0.3-point rule: the same 10 minutes as the ◎ fresh check, or shorter?
