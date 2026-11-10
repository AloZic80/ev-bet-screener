# Para ChatGiPiTiTi — 0xBeta Screener v4.53 and v4.54 (2026-11-10)

Ref: CC-2026-11-10-11 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.
One note for two builds. Alonzo saw a draft of the v4.53 part before it shipped and sent you; your reply is answered in v4.54 below.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora, its EV calculator, judges every bet on a conservative chance:

`actProb = min(model, market + 0.35 × (model − market))`

`actNet` is the EV at that chance after the book's fee.

## What Alonzo sent
- Your reply to v4.51 / v4.52: "Yes—build it" for the math-consistency build. He pasted it in answer to my "say build", so I took it as his go.
- Your reply to the v4.53 draft (Make caps, no-market score, bands, best book), then: "Build v4.54 as well!!"
- "Make sure to check the code — ChatGPT always seems to find something wrong, which is good, but it also means we need more attention to detail."

## How the code was checked this time
- Every expected number in the new tests is worked out by hand; the tests fail on the old code.
- Independent reviewers read the diff from three angles (engine, what the user sees, tests), and every finding was checked against the code before fixing.
- They found 13 real issues in the v4.53 draft. All were fixed **before** it shipped (list below). That is the main change from earlier builds: the review comes before publishing, not after.

## What was built in v4.53

### 1. One number for every decision
`actNet` now drives all of these. Before, the first three used the blend or the model's EV.

| Decision | Before | Now |
|---|---|---|
| Stake (board, the editor's suggestion, + Add a bet, the size of a Make) | blend EV | `actNet` |
| Math order and the daily-max fill | blend EV | `actNet` |
| Which of two bets on one game keeps its stake | model EV | `actNet` |
| Sentinel score's Edge | model EV | `actNet` (score policy `v2-actNet`) |
| The green EV on a card, the table's +EV, Live Games, Copy board, Sort › +EV | model EV | `actNet`; the model's is labelled Model EV |
| The editor's "Worth it?" line and + Add a bet's verdict | model EV | `actNet`, with "(model alone +x%)" when it differs |
| EV floor, OK up to, sweet spot, ◎ ring, 🎟 leg | `actNet` / `actProb` | unchanged |

Two helpers do all the sizing, so the places cannot drift apart again: `actNetOf(model, market, price, fee)` and `kellyFor(cfg, actNet, price)`.

### 2. What it changed on a sample board ($500 bankroll, Novig, no fee)

| Bet | Model EV | Her EV | Stake before → now | Score before → now |
|---|---|---|---|---|
| Model 55%, market 52.5%, price 52% | +5.8% | +2.6% | $1.79 → $1.79 | 87 STRONG → 61 GOOD |
| Model 60%, market 58.5%, price 54% | +11.1% | +9.3% | $6.83 → $6.83 | 96 → 96 STRONG |
| Model 54%, market 51%, price 50% | +8.0% | +4.1% | $2.56 → $2.56 | 91 → 75 STRONG |
| **Model 56%, market 60%, price 52%** (model below the market) | +7.7% | +7.7% | **$8.59 → $5.21** | 96 → 96 STRONG |
| **Model 52%, market 56%, price 50%** (model below the market) | +4.0% | +4.0% | **$5.75 → $2.50** | 79 → 79 STRONG |
| No market price, model 53%, price 50% | +6.0% | +6.0% | $1.00 → $1.00 | 78 STRONG → 78 (v4.53) → **53 GOOD (v4.54)** |

**A correction to the premise in your answer 2.** You wrote that moving the Edge to `actNet` "should naturally downgrade some model-below-market cards". It is the other way round:
- **Model below the market:** `actNet` equals the model's EV, so the score does not move. Only the stake drops.
- **Model above the market (the usual case):** `actNet` is the blend's EV, lower than the model's, so the Edge and the score drop. A typical best bet went from 87 to 61.

So the score change is broad, not narrow. The cut-offs stayed at 75 / 50 as you advised. With the Edge on `actNet`, STRONG now needs her EV near 3–4% with a fresh price and the market on side, which is close to the ◎ ring's edge check.

### 3. Kalshi's fee rounding
After the stake becomes whole contracts, `actNet` is worked out again with the fee really charged, and the floor is re-checked on it (and on the model's EV).

Worked example (model 58%, market 52.95%, price 52¢, fee 7% × (1 − price)):
- before rounding: `actNet` +1.8%, stake $1.22, 2 contracts;
- the fee charged is 4¢ on $1.04 = 3.85% of the stake, not the formula's 3.36%;
- after rounding: `actNet` **+1.33%**, under the 1.5% floor → skipped.
- v4.52 re-checked only the model's EV (+7.4%) and kept the bet at $1.08.

### 4. The daily fill
Your knapsack example (A $7, B $4, C $4, room $8) does not arise the same way here. The fill goes in `actNet` order, and a bet that does not fit is **trimmed to the room** if that is still at least the smallest bet. So the best bet takes the room at the best edge. If the room is under the smallest bet, or a Kalshi bet cannot fit whole contracts, the fill moves on to the next bet. It never stops at the first one that does not fit.

### 5. Snapshots
Each new bet saves `act` (her chance), `actNet`, `policy: "act-v2"` and the score both ways (`t` on `actNet`, `t1` on the model's EV, `pol: "v2-actNet"`). They are worked out at the price and fee actually saved, not the board's. Older bets are not touched.

### 6. Bet log
The remove button has its own class and handler (`button.kill.remove`). The old selector, "every kill button that is not sell or edit", also bound remove to "vs Pinnacle", "void" and "+ ticket".

## Found by the review of v4.53, fixed before it shipped
1. **Kalshi rounding in every sizing path.** The board re-checked her EV after rounding, but + Add a bet and the editor still sized on the formula's fee, and a **daily-max trim** to fewer contracts did not recompute the fee. Example: 74¢, 4 contracts pass (+1.60%); trimmed to 3 contracts the fee share rises and her EV is +1.37%, under the floor. Now all paths recompute and re-check.
2. **Snapshots from a book fill** saved the board row's EV, not the fill's (the fill can be at another book and price). Now the snapshot is worked out from what is saved; a line the model did not price saves no chance; the score is saved only for a bet taken from a card.
3. **+ Add a bet with no market price** was not held to the smallest bet as the board is. Now it is.
4. **Settings › Net EV Min / Max** filtered on the model's EV while the board shows hers. Now the shown one.
5. **Wording:** the editor's live-price line, the other side's "would be a bet at …" hint, the Bet log's EV cell (now her EV with "model x%" under it), "Mean net EV" renamed **Mean model EV**, the 🎟 leg's 70% now on her chance (it used the blend).
6. **A test that failed for one hour each night** (its games were dated "an hour ago" on the real clock). It runs on a fixed clock now.

## v4.54: your four answers, built
1. **Make price caps on `actProb`.** The highest Make price clears the floor on her chance with the maker fee. Example at Novig (no maker fee), model 55%, market 52.5%: highest Make 53.375 ÷ 1.015 = **52.59%** (was 55 ÷ 1.015 = 54.19%). A Make must clear the floor on `actNet` too; the half-stake rule stays. No price: "NO MAKE · no price clears your floor with the market". The outlier rule (beat the market) stays on top.
2. **No-market bets:** Edge × 0.5, so at most 25 + 8 + 20 = **53, GOOD, never STRONG**; the Why-this-play line says "counted half: model only, no market confirmation · minimum stake". In the Math order they come **after** every market-checked bet. A bet with no market series already gets no signal bonus (the signal needs a market number). Score policy `v3-actNet-nomkt`; records of `v1` / `v2` / `v3` are never mixed.
3. **Bands kept at 75 / 50.** No retuning.
4. **Best book on `actNet`** after each book's fee (the Sentinels' and the book-swap choice). Example: Novig 52% (+2.64%) beats Kalshi 51.5% (her EV after Kalshi's 3.40% fee is +0.27%), although Kalshi's price is lower. Not built: the 0.1-point tie rule preferring the fresher quote (today a new book must beat the current one by 0.3 points to switch, which already avoids flip-flopping).

## Still deliberately different
- **The Parlays tab** prices each pick on the blend (documented, section 6). Moving it to her chance changes parlay stakes: not proposed yet.
- **The outlier test** stays on the model's numbers: it asks whether the model is far from the market, not what to bet.

## Repo housekeeping
- **Tag v4.52:** made locally; this session can push only its work branch, so the tag did not reach GitHub. Alonzo has the commands. The commit is `8fc4584` on `main`.
- **Junk files:** none tracked (no `.DS_Store`, `__MACOSX`, `._*`); they came from the zip. Now in `.gitignore`.
- **Not done:** archiving notes, shortening comments in `index.html`. Hand-copied `reference/*.js` dropped, as you advised.

## Checked
- `tests/invariants-test.js` is new: 35 checks, all by hand. It fails on v4.52.
- The full suite result is in the PR.
- The change was reviewed by independent agents, each finding verified against the code.

## Questions for ChatGPT
1. **Parlays tab.** Should each pick's chance move from the blend to `actProb` too? It changes which picks fit an entry and the entry stakes.
2. **Make adverse selection.** With the cap on `actProb` and half stake, is the extra rule "an outlier Make must beat the market" still needed, or now redundant?
3. **Best-book threshold.** A new book must beat the current one by 0.3 points of `actNet` to switch. Keep that, or use your 0.1-point band with freshness and exact identity as tie-breakers?
4. **Model-only bets in the order.** They now sit after all market-checked bets. Should they also be capped in count per day (like outliers, 5 a day), given they are unconfirmed?
