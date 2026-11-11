# Actionable EV: one number for every decision

Status: active · Introduced: v4.41 (OK up to), v4.43 (floor), **v4.53 (stake, order, score, shown EV)**, **v4.54 (Make caps, best book, no-market score)**, **v4.55 (Parlay picks, model-only caps)** · Approved by: Alonzo (v4.41 "Fix and build", v4.43 "build"; v4.53: he pasted ChatGPT's "Yes—build it" in answer to "say build") · Last verified: 2026-11-10 (v4.53)

## Rule
`actProb = min(model, market + mWeight × (model − market))`; the model alone when there is no market price (`okProb`, `okProbR`). `mWeight` is 0.35 by default.
`actNet` = EV at `actProb` after the book's fee (`actNetOf(model, market, price, fee)`).
Stake = `kellyFor(cfg, actNet, price)` = bankroll × Kelly × (actNet × haircut) ÷ (1 ÷ price − 1), capped at the largest bet.

| Decision | Uses | Where |
|---|---|---|
| EV floor (pass / Watch) | `actNet` (the model's `net` must clear it too) | `auditCore` |
| OK up to, Kalshi limit price | `actProb` | `maxPriceFor` callers |
| Stake | `actNet` | `auditCore`, the editor's `recStake`, `abStake` (+ Add a bet, and the size of a Make) |
| After Kalshi's whole-contract fee rounding | `actNet` and `net` re-checked against the floor, also after a daily-max trim and in + Add a bet / the editor | `auditCore`, `applyDayLimits` `take()`, `abStake`, `recStake` |
| Highest Make price | `actProb` with the maker fee (v4.54) | `abMakeLadder`, the Parole ladder |
| Which book the Sentinels pick | `actNet` after each book's fee (v4.54) | `shopExchanges`, `swapHunt` |
| Math order, daily-max fill | `actNet` | `mathKey`, `applyDayLimits` |
| Which bet of a game or a player keeps its stake | `actNet` | the one-side-per-game and same-player blocks |
| Sentinel score's Edge | `actNet`; halved with no market price (`POLICY.sent` = `v3-actNet-nomkt`, v4.54: at most 53, GOOD) | `sentScore` (`e`; `e1` / `total1` = the model-EV way, kept for comparison) |
| Math order | `actNet`, model-only bets after the market-checked ones (v4.54) | `mathKey` |
| EV shown (card pill, table +EV, Live Games, Copy board, Sort › +EV) | `actNet`; the model's `net` is labelled Model EV | `placeCardHtml`, `renderCore`, `colVal` |
| Sweet spot, ◎ ring, 🎟 leg (70% on `actProb` since v4.53's review), extras | `actProb` / `actNet` | `isSweet`, `ringOf`, `ringAssign`, `extrasAssign` |
| + Add a bet with no market price | held to the smallest bet, like the board (v4.53) | `abStake` (`noMkt`) |
| A Parlay pick's chance (filters, `pkDist`, EV, Kelly, ranking) | `actProb` (v4.55, saved with `pk.policy` = `actProb-v2`) | `pkProbOf`, `pkLegs`, `pkLegsPriced` |
| Model-only bets (no market price) | smallest bet, at most 5 a game day and 1 a game, best `actNet` first (v4.55, `snap.modelOnly`) | `MODEL_ONLY`, `auditCore` |
| Outlier Make | must also beat the market's breakeven (kept, v4.55 test) | Parole ladder |
| Switching book | `bookPick` (v4.57): the book SHOWN is the one to beat. Fresh (exchange read in this scan; sportsbook loaded within the limit): another fresh price needs 0.3 points of `actNet`. Exchange unreadable: the best fresh price that clears `cfg.eMin` takes its place (`exchange_unreadable`); fresh prices but none clears it: nothing moves (`exchange_unreadable_no_actionable_quote`). Sportsbook price stale: the best fresh exchange price that clears `cfg.eMin` replaces it (`sportsbook_stale_unrefreshable`); none: nothing moves, "No current best book confirmed". Nothing readable = no winner. Saved in `snap.shop.chk`. v4.61: the same rule for book-swap cards; a sportsbook price's time is `priceAt` (a cached answer) else `loadedAt`; a move to Kalshi that fails the floor after the fee rounding is redone without Kalshi; a failed request decides nothing for the bets it did not ask | `bookPick`, `shopExchanges`, `shopSnap`, `swapBooks` |
| A best-book claim or a book-swap card | holds 3 min, 90 s within 5 min of kickoff (`shopLim`); then says so, no automatic re-read (v4.56; swap cards v4.57, `r.swap.at`) | `shopStale` |
| Pick'em entries | model-only legs never in a recommended entry; unchecked lines make it provisional (confirm before logging); settlement note (v4.56) | `pkBest`, `pkProvisional`, `PK_SETTLE`, `pkLog` |
| Model-only open orders | measured only (`orderDiag`), not counted against the limit (v4.56; review after about 30 days) | Settings › API credits & usage |

New bets save `snap.act`, `snap.actNet`, `snap.policy` (`POLICY.math` = `act-v2`) and `snap.sent`. Old snapshots are never rewritten.

## Deliberately different (open questions, not bugs)
- **The outlier test** (gap and gross EV) stays on the model's numbers: it asks whether the model is far from the market, not what to bet.
- **The score's cut-offs** (75 / 50) were not moved. Review them only on bets taken under one policy (300+ settled bets, 150+ games, clustered by game); never mix `v1` / `v2` / `v3` band records.
- `actNet` already contains the market, and the score's Market part scores the market again: the two parts are correlated. A future score review, not this one.

## Tests
`tests/invariants-test.js` (fails on v4.52), `tests/blend-limit-test.js`, `tests/floor-watch-test.js`, `tests/math-audit-test.js`.

## Supersedes
- v4.43 to v4.52: the stake, the Math order and the game-line choice used the blend (`blendNet`) or the model, higher than `actNet` when the model is below the market; Kalshi re-checked only the model's EV after rounding; the card showed the model's EV.
- v4.40 and earlier: the floor and OK up to used the model's chance.
