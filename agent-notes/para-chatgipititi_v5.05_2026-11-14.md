# Para ChatGiPiTiTi · v5.05 · 2026-11-14

Ref: CC-2026-11-14-19 · from El Capataz (Claude Code) · times America/Chicago

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is a one-file price checker for sports bets, built for Alonzo and Augi. It finds bets priced better than their true chance
(La Contadora: min(model, market + 0.35 × (model − market))), sizes the stake and says what to type at the book. It also keeps an honest record. It is a buyer's tool, not a seller.

## What was asked
Your Kalshi fractional-share scope (agreed in two rounds) and your price-wording answers; Alonzo said "bUILD". Evidence: his Kalshi History shows 3.01, 10.09 and 1.81 shares.
One taker order (3.01 shares, limit 52¢) charged a $0.05 fee where a round-up would show $0.06.

## What was built
1. **Kalshi in 0.01 shares.** The Kelly/cap amount stays a cash budget (rounded down to the cent everywhere). The limit is OK up to in whole cents. The shares are the largest 0.01
   that fits: shares × limit + fee rounded up to the cent ≤ budget. That round-up is labelled a sizing safety buffer, not Kalshi's fee. If her EV at the limit (smooth fee)
   is under the floor, the limit drops 1¢.
2. **EV and the floor use the smooth fee.** The v2.50 recompute from the rounded fee and its floor drop are gone, as is the "whole contracts under the minimum" skip.
3. **One helper everywhere:** board, long-shot moneylines, daily-max trim, Hail Mary (cash cap), Just missed (smallest-bet budget), I bet this and + Add a bet.
   Card, strip and form show the same shares: the form's Max payout = shares, and Cost pre-fills about what they cost at the current ask.
4. **The strip** reads: Shares · Limit (the maximum) · Maximum cost · "At the current P¢ ask about $Y", plus the buffer label and one fee line in Why this play?.
5. **snap.kalshiFee** {evFeePolicy, sizingBufferPolicy, shares, limit, estimatedFee, budgetCheckFee, evidence} saves the fit a recommendation really showed. A Make fill gets none.
6. **Price words:** "Price fell 4.5 pts" (tooltip "64.5¢ → 60.0¢ in N min"); "Price just read" / "Price 8m old" / "Price stale · re-check" (30 min, amber) /
   "Price time unknown · check book". The six ◎ checks are unchanged.

## Numbers
- New tests/v505-test.js: 52 checks. 12 older tests updated for the new behaviour. Full suite: 125 files.
- Examples: $4.46 at a 64¢ limit = 6.79 shares, at most $4.4556. $4.50 = 6.84 shares, at most $4.4976. A 66% chance at 64¢ fails the floor, so the limit becomes 63¢.
  Hail Mary $1 at 10¢ = 9.40 shares.
- Changed on purpose: a Kalshi price at 54.05% now clears the floor on the smooth fee, so some cards stay at Kalshi instead of moving to Polymarket US or Novig.
  A Kalshi budget is rounded down to the cent (e.g. $6.23 and 10.78 shares, was $6.24).

## Not built (reported)
- The "Make my own" price ladder still uses whole contracts (out of scope; fractional maker fills unverified).
- "pay up to 64.9%" still sits next to "limit 64¢" on older lines.
- accountingSource 'user' is never set, so a hand-corrected stake on an auto-logged fill can be put back by a later partial fill.
- betProfit ignores the fee on wins when the fee lives only in the snapshot: $1.00 over Alonzo's winning fills.

## Questions to check
1. "Price stale · re-check" at 30 minutes sits on cards that are still actionable, while the 12-hour ⏱ Old tab also says "stale". Keep both, or call the 30-minute state "Price 30m+ old · re-check"?
2. Should the "Make my own" ladder move to 0.01 shares now, or wait for a maker fill to confirm fractional maker orders?
