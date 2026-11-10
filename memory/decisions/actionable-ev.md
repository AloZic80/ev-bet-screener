# Actionable EV: the conservative chance

Status: active · Introduced: v4.41 (OK up to), v4.43 (floor) · Approved by: Alonzo ("Fix and build", "build") · Last verified: 2026-11-10 (v4.52)

## Rule
`actProb = min(model, market + mWeight × (model − market))`; the model alone when there is no market price (`okProb`, `okProbR`). `mWeight` is 0.35 by default.
`actNet` = EV at `actProb` after the book's fee.

| Decision | Uses | Where |
|---|---|---|
| EV floor (pass / Watch) | `actNet` (the model's `net` must clear it too) | `auditCore` |
| OK up to, Kalshi limit price | `actProb` | `maxPriceFor` callers |
| Sweet spot, ◎ ring, 🎟 leg, extras | `actProb` / `actNet` | `isSweet`, `ringOf`, `ringAssign`, `extrasAssign` |
| **Stake** | `blendNet` (the blend, not the min) | `auditCore` sizing, the bet editor's suggested stake, `abStake` |
| **Math order, daily-max fill** | `blendNet` | `mathKey`, `applyDayLimits` |
| **Sentinel score Edge, card's green EV** | the model's `net` | `sentScore`, `placeCardHtml` |

## Known gap (open, ChatGPT 2026-11-10)
The last three rows differ from `actNet` only when the model is **below** the market (then blend > model, and `actProb` = model). In that case stake and order use a higher chance than the floor does. Also: after Kalshi's whole-contract fee rounding, the floor is re-checked on `net`, not `actNet`.
Proposed for the next math build (needs the owner's go, it lowers some stakes): one helper for every actionable number, `actNet` re-checked after Kalshi rounding, the card's green number labelled "Model EV".

## Tests
`tests/blend-limit-test.js`, `tests/floor-watch-test.js`, `tests/math-audit-test.js`.
Missing: an invariant test that a staked bet has `actNet` ≥ floor after Kalshi rounding, and a worked case with the model below the market.

## Supersedes
v4.40 and earlier: the floor and OK up to used the model's chance.
