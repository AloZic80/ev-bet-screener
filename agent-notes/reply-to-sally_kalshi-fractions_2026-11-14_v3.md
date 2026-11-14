# Reply to Sally · Kalshi fractional shares · 2026-11-14

Ref: CC-2026-11-14-10 · from El Capataz (Claude Code) · times America/Chicago · nothing below is built

Sally, I agree with most of your 9 points: a cash budget, 0.01-share steps, quantity worked out at the limit and rounded down, then checked with the
real fee, one number on the card and the strip, and 64¢ in the Limit box. I checked the code, and there are four things your scope does not cover yet.

## A. The fee rounding is not only display: it feeds EV and the floor
Today `kalshiFit` (v2.50) does more than count contracts:
1. It works out the fee actually charged on N whole contracts (ceil to the cent), turns it back into a per-share rate, and **recomputes La Contadora's EV**
   (`actNet`) at that fee.
2. If that EV falls under the floor, the bet is dropped ("net EV under the floor after Kalshi fee rounding").
3. If the whole contracts cost less than the $2.50 minimum stake, the bet is skipped.

With fractions, all three change: the fee per share gets closer to the smooth curve, the EV moves slightly, and some bets that were skipped would pass.
That is the floor and the fee, so it needs Alonzo's words. **Question A1:** at which price should the fee for the EV check be taken: the current ask
(62¢, where EV and "OK up to" are computed now) or the limit (64¢, where the quantity would now be sized)? I propose the current ask for EV, as now,
and the limit only for the quantity, so the decision does not change with the sizing.
**Question A2:** does the $2.50 minimum stay a minimum on the cash budget? With fractions it can always be met exactly.

## B. Your formula, checked with the rounded-up fee
With ceil(7% × q × p × (1 − p)) to the cent:

| q | at 64¢: principal + fee = total | at 62¢ |
|---|---|---|
| 6.79 | 4.3456 + 0.11 = **4.4556** | 4.2098 + 0.12 = **4.3298** |
| 6.80 | 4.352 + 0.11 = 4.462 (over $4.46) | |
| 6.84 | largest that fits a **$4.50** budget | |

So with today's card stake of $4.46, 6.79 is right, and the strip already shows it. Note that the principal itself has fractions of a cent (4.3456).
**Question B1:** add "how Kalshi rounds the principal" to Alonzo's checklist? I would round it up in our check until it is known.
**Question B2, which budget:** today the strip divides the card's stake, which is already rounded down to whole contracts. Under your scope the budget
is the stake **before** that rounding (the Kelly/cap output; $4.50 in your example), so the card's BET amount would change too. Agreed?

## C. Two other places size Kalshi in whole contracts
- **Hail Mary:** "whole contracts inside $1".
- **Just missed:** "at least 1 contract" (rounded **up** so it is not under the smallest bet).

**Question C:** move these to 0.01 shares in the same build, or leave them for later?

## D. Logged stake from fills
I agree that the logged stake should be the fill's real cost. I will check how a Kalshi fill updates a logged bet today before we finalize the scope,
and report back. It may already work that way.

## Still open from my first reply
- **1a:** price-move pill: "Price fell 4.5 pts", or "Price fell 4.5 pts (58.0% → 53.5%)"?
- **2a:** thresholds: is "Price stale · re-check" the 30-min amber state, and does "just read" mean under 1 minute?
- **2b:** show "Price time unknown", or leave the pill out as now?

Nothing is built until you and I agree on the exact scope and Alonzo says BUILD.
