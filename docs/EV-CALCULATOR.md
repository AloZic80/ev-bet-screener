# La Contadora: how the screener's EV calculator works

This is the math behind every bet the 0xBeta Screener (props.0xbeta.dev) shows. Written 2026-11-09 for **v4.41**; revised after an outside math check.

The worked example is a real card from Alonzo's board: **Jonathan Lekkerimaki (VAN) Over 1.5 Shots, Novig -108, PHI @ VAN, 8:30 PM CT.**

> **About the numbers.** The app works with unrounded chances. A card shows them rounded: "-125" and "55.5%" are both rounded from the model's unrounded chance, about 55.46% (worked back from the card's +6.8% at 51.92%). Worked from the rounded figures, an example can differ from the card by a few tenths. The card is right; the rounding is in the display. Where it matters, both are shown below.

---

## 1. Three different chances (they are not three confirmations)

| Name | What it is | Where it comes from | Example |
|---|---|---|---|
| **Model chance** | The model's estimate of how often the bet wins | BettingPros' projection. With no projection, a sharp price with the vig removed (Pinnacle). The card's "Fair" tile shows it and says which. | 55.46% (shown as -125 / 55.5%) |
| **Market chance** | What the betting market says, vig removed | The consensus of several books | 52.6% |
| **Sizing chance (the blend)** | The market pulled toward the model by your **model weight** (0.35) | `blend = market + 0.35 × (model − market)` | 52.6 + 0.35 × 2.86 = **53.60%** |

The model and the market are **not independent confirmations** of each other. They often share information. The blend exists because the model alone is too sure of itself. Your stake, the "math" order and **OK up to** all use the blend. When a bet has no market price, the model chance is used, and the stake is capped at your smallest bet.

The **price** is what the book charges, written as a chance:
- Minus odds: `chance = −odds / (−odds + 100)`. For example, -108 → 108 / 208 = **51.92%**.
- Plus odds: `chance = 100 / (odds + 100)`. For example, +230 → 100 / 330 = 30.3%.

## 2. The edge: EV after fees

```
gross EV = chance ÷ price − 1
net EV   = (gross EV − fee) ÷ (1 + fee)          fee as a fraction of the stake
```

**Example on the model chance:** 55.46 ÷ 51.92 − 1 = **+6.8%**, the green number on the card. From the rounded "-125" (55.56%) you would get +7.0%; the card uses the unrounded 55.46%.

Novig charges no fee before the game, so here net EV = gross EV.

### Fees, as a fraction of the stake (`feeRate`)

| Book | Fee in the formula | Notes |
|---|---|---|
| Kalshi | 7% × (1 − price) | Kalshi's fee is 7% × price × (1 − price) per contract. Divided by the price paid, that is 7% × (1 − price) of the stake. |
| Polymarket US | 6.95% × (1 − price) | Same curve. |
| Novig | 0 before the game; 6% × (1 − price) once it is live | A live taker fee. |
| FanDuel Predicts | 2% ÷ price | The app treats FanDuel's "2% of the payout" as paid on every slip, win or lose, as the slip shows it before you confirm. The payout is stake ÷ price, so the fee is 2% ÷ price of the stake. The 2% is an estimate (Settings › Fees); the app marks these EVs "approximate". |
| ProphetX, Fliff, licensed books | the % of stake set in Settings | |

## 3. "OK up to": the most you can pay

`maxPriceFor` finds the highest price at which net EV still clears your floor (1.5%), after that book's fee.

**Since v4.41 it uses the sizing chance (the blend), or the model if that is lower**, because that is the number the stake is sized on. Before, it used the model chance, and the card said "OK" at prices where the stake was $0.

| | Limit at Novig (floor 1.5%) |
|---|---|
| From the model (55.46%), the old way | 54.64% |
| **From the blend (53.60%), now** | **52.81%** → the card says "51.9% · **OK to 52.8%**" |

A price of 53.5% passes the model's screen (+3.7% EV), but at the blend it is worth about 0%. The card now says "**need ≤ 52.8% · look elsewhere**" instead of "OK". The same limit drives:
- the price tag on the board and on the cards;
- "max";
- the I bet this check;
- + Add a bet;
- **Kalshi's limit price**, in whole cents rounded down.

## 4. How much to bet: quarter Kelly on half the edge

```
blendNet = ((blend ÷ price − 1) − fee) ÷ (1 + fee)
b        = 1 ÷ price − 1                               (what $1 wins)
stake    = bankroll × Kelly × (blendNet × haircut) ÷ b
```

| Setting | Default |
|---|---|
| Kelly fraction | 0.25 (quarter Kelly) |
| Edge haircut | 0.5 (the edge is halved first) |
| Edge used | blendNet when there is a market price; otherwise net EV × haircut |

**Example (bankroll $500, unrounded inputs):**
- blend 53.60% ÷ price 51.92% − 1 = **+3.23%**.
- b = 1 ÷ 0.5192 − 1 = **0.926**.
- stake = 500 × 0.25 × (3.23% × 0.5) ÷ 0.926 ≈ **$2.18**. The card shows **$2.17**: it uses Novig's exact price and the model's exact chance, a few hundredths away from the rounded inputs here.

From the rounded figures in the outside check (55.56% and 52.6% → blend 53.64%, blendNet +3.30%), the same formula gives $2.23. The gap comes from the inputs, not the formula.

Then the limits apply:
- **Largest bet** caps the stake. **Smallest bet** is a "don't bet below", never "bet at least".
- **Max per game:** 2% of bankroll.
- **Daily max:** 10% of bankroll. Past it, the **Hard stop** asks "Mejor no?" before saving.
- **Outliers**, and bets with no market price, are capped at the smallest bet.

## 5. What a bet must pass to be on the board

- Odds between **-300 and +500**.
- **Net EV ≥ 1.5%** (on the model chance) and **gross EV ≤ 40%**. Above 40% is almost always a wrong match, not a real edge.
- A stake above $0 from the blend. A bet the model likes but the blend does not gets no stake and is not placed.
- Not started, and at a book in **Books you bet**. A bet at a book you can't use moves to your best book, or stays off.
- **Not already bet.** This is checked against your Bet log, your book fills (Novig, Kalshi, Polymarket US) and your open orders. Different wordings count as the same bet: "Lekkerimäki" = "Lekkerimaki", "Shots On Goal" = "Shots", "2+" = Over 1.5.

All of these are **estimates**. A bet that passes has an *estimated* edge, not a guaranteed one.

## 6. Parlays and pick'em (PrizePicks, Pick6, Underdog…)

- Each pick's chance is its **blend**.
- An entry's value adds up every way it can finish: the chance of exactly k hits out of n (`pkDist`, a Poisson-binomial) times what k hits pays.

**Example:** PrizePicks Flex, 4 picks at 61%, 60%, 59% and 58.5%, $5 stake:
- All 4 hit: $25.00, **12.63%** of the time.
- 3 of 4 hit: $7.50, **34.24%** of the time.
- Less than that: $0, 53.13% of the time.
- Expected return: (25 × 0.1263 + 7.5 × 0.3424) ÷ 5 − 1 = **+14.5%**.

> **This assumes the picks are independent.** It multiplies each pick's own chance. Picks from the same game, or otherwise linked (a quarterback's passing yards and his receiver's yards, both teams' scoring), move together. Their real joint chance differs, and multiplying can **overstate** an entry's value a lot. That is why **"One pick per game"** is on by default; keep it on unless you have a joint model.
>
> **A likely pick is not automatically a good leg.** A 75% pick still needs its own value at its price. On combo apps (Kalshi, Novig, Polymarket…) each leg must pass on its own ("Only good bets", on by default), and slips must hit at least 5% of the time, so no long-shot slips.

"Best for your bankroll" is the entry that grows the bankroll most at its suggested stake. That is not always the one with the biggest return.

## 7. The Sentinel score (0–100)

```
Edge   = 50 × min(1, EV ÷ 6%)
Market = 20 at break-even, 30 at +4%, 0 at −3% (× 0.85 for consensus; 8 with no market)
Fresh  = 20 under 3 minutes old, falling to 0 at 90 minutes
```

The score is shown as a word: **STRONG** 75+, **GOOD** 50–74, **THIN** under 50. **THIN still clears the screener's estimated EV floor, but with weaker edge, price confirmation or freshness**, so it gets the smallest stakes. Estimated +EV is not guaranteed +EV.

## 8. Honest results

- Only **settled** bets count as won or lost. A game in play, or not started yet, shows in grey.
- Profit and ROI never include the returned stake.
- A free bet counts as $0 when it loses, and as its winnings only when it wins.
- The Scorecard's **1,000-bet test** asks whether your results and your closing-line value **give evidence of an edge**. It checks whether the 95% ranges for ROI and median CLV are both above zero. That is evidence, not proof. Correlated bets, longshot-heavy results and a changing mix of bets all weaken it, and even 1,000 bets can be luck. Beating the closing line comes first; profit follows over time.

---

## Where it is in the code (`index.html`)

| Piece | Function |
|---|---|
| Odds ↔ chance | `toProb`, `americanOf` |
| Fees | `feeRate` |
| Model EV, blend, stake | `auditCore` (`r.gross`, `r.net`, `r.blendProb`, `r.blendNet`, stake) |
| Conservative chance (v4.41) | `okProb`, `okProbR` |
| Most you can pay | `maxPriceFor` (given `okProb`) |
| Parlay math | `pkDist`, `pkEV`, `pkBreakEven`, `pkKelly`, `pkEntry` |
| Sentinel score | `sentScore` |
| Already bet | `coreKey`, `propSame`, `fillPriorFor` |

`tests/math-audit-test.js` checks this arithmetic against brute force on every build: odds ↔ chance, EV after fees, the most you can pay, the Kalshi shares, the Kelly stake, profit, and the parlay math. `tests/blend-limit-test.js` checks that "OK up to" follows the blend. Every setting is in **Settings › Your rules at a glance**.

*Revised 2026-11-09 after an outside math review: rounding called out, the three chances named, the parlay independence warning added, the FanDuel fee spelled out, "OK up to" moved to the blend (app v4.41), and the THIN and 1,000-bet wording made statistical.*
