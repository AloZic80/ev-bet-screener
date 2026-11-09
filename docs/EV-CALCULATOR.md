# La Contadora: how the screener's EV calculator works

This is the math behind every bet the 0xBeta Screener (props.0xbeta.dev) shows. Written 2026-11-09 for v4.40.

The worked example is a real card from Alonzo's board: **Jonathan Lekkerimaki (VAN) Over 1.5 Shots, Novig -108, PHI @ VAN, 8:30 PM CT.**

---

## 1. Fair chance vs. the price

| | How it is found | Example |
|---|---|---|
| **Fair chance** | The model: BettingPros' projection, or a sharp price with the vig removed (Pinnacle, or the consensus of several books). | -125 = **55.5%** |
| **Price** | What the book charges, written as a chance. | -108 = 108 / 208 = **51.9%** |
| **Market** | The consensus price with the vig removed. | **52.6%** |

Converting odds to a chance:
- Minus odds: `chance = −odds / (−odds + 100)`. For example, -108 → 108 / 208 = 51.9%.
- Plus odds: `chance = 100 / (odds + 100)`. For example, +230 → 100 / 330 = 30.3%.

## 2. The edge: EV after fees

```
gross EV = fair ÷ price − 1
net EV   = (gross EV − fee) ÷ (1 + fee)
```

Fees by book (`feeRate`), editable in Settings › Screens › Platform fees:

| Book | Fee |
|---|---|
| Kalshi | 7% × (1 − price) |
| Polymarket US | 6.95% × (1 − price) |
| Novig | 0 before the game; 6% × (1 − price) once it is live |
| FanDuel Predicts | 2% of the payout |
| ProphetX, Fliff, licensed books | the % of stake set in Settings |

**Example:** 55.5 ÷ 51.9 − 1 = **+6.8%**. Novig before the game charges no fee, so net EV = **+6.8%**, the green number on the card.

### "OK up to": the most you can pay

`maxPriceFor` finds the highest price at which net EV still clears your floor (1.5%). It accounts for that book's fee.

**Example:** 55.5 ÷ 54.7 − 1 ≈ 1.5%, so the card says **OK up to 54.7%**. A price above that, and the board says "look elsewhere".

## 3. Not trusting the model fully: the blend

Stakes are not sized on the model alone. The market chance is pulled toward the model by your **model weight** (0.35):

```
blend    = market + model weight × (fair − market)
blendNet = ((blend ÷ price − 1) − fee) ÷ (1 + fee)
```

**Example:** 52.6 + 0.35 × (55.5 − 52.6) ≈ **53.6%**, so blendNet = 53.6 ÷ 51.9 − 1 ≈ **+3.3%**.

blendNet is "the math" used by:
- **Sort › ✅ Math**, best edge first.
- **✅ #1 MATH PICK**.
- Filling the daily max in order.

Outliers always go last.

## 4. How much to bet: quarter Kelly on half the edge

```
b     = 1 ÷ price − 1                  (what $1 wins)
stake = bankroll × Kelly × (edge × haircut) ÷ b
```

| Setting | Default |
|---|---|
| Kelly fraction | 0.25 (quarter Kelly) |
| Edge haircut | 0.5 (the edge is halved first) |
| Edge used | blendNet when there is a market price; otherwise net EV |

**Example (bankroll $500):** b = 1 ÷ 0.519 − 1 = 0.926, so stake = 500 × 0.25 × (3.3% × 0.5) ÷ 0.926 ≈ **$2.2**. The card says **$2.17**; the small gap is rounding.

Then the limits apply:
- **Largest bet** caps the stake. **Smallest bet** is a "don't bet below", never "bet at least".
- **Max per game:** 2% of bankroll.
- **Daily max:** 10% of bankroll. Past it, the **Hard stop** asks "Mejor no?" before saving.
- **Outliers** and bets with no market price are capped at the smallest bet.

## 5. What a bet must pass to be on the board

- Odds between **-300 and +500**.
- **Net EV ≥ 1.5%** and **gross EV ≤ 40%**. Above 40% is almost always a wrong match, not a real edge.
- Not started, and at a book in **Books you bet**. A bet at a book you can't use moves to your best book, or stays off.
- **Not already bet.** This is checked against your Bet log, your book fills (Novig, Kalshi, Polymarket US) and your open orders. Different wordings count as the same bet: "Lekkerimäki" = "Lekkerimaki", "Shots On Goal" = "Shots", "2+" = Over 1.5.

## 6. Parlays and pick'em (PrizePicks, Pick6, Underdog…)

- Each pick's chance is its **blend**.
- An entry's value adds up every way it can finish: the exact chance of k hits out of n (`pkDist`) times what k hits pays.

**Example:** PrizePicks Flex, 4 picks at 61%, 60%, 59% and 58.5%, $5 stake:
- All 4 hit: $25.00, 12.6% of the time.
- 3 of 4 hit: $7.50, 34.2% of the time.
- Less than that: $0, 53.1% of the time.
- Expected return: **+14.5%**.

"Best for your bankroll" is the entry that grows the bankroll most at its suggested stake. That is not always the one with the biggest return.

## 7. The Sentinel score (0–100)

```
Edge   = 50 × min(1, EV ÷ 6%)
Market = 20 at break-even, 30 at +4%, 0 at −3% (× 0.85 for consensus; 8 with no market)
Fresh  = 20 under 3 minutes old, falling to 0 at 90 minutes
```

The score is shown as a word: **STRONG** 75+, **GOOD** 50–74, **THIN** under 50. THIN is still +EV, just with the smallest stakes.

## 8. Honest results

- Only **settled** bets count as won or lost. A game in play, or not started yet, shows in grey.
- Profit and ROI never include the returned stake.
- A free bet counts as $0 when it loses, and as its winnings only when it wins.
- The Scorecard's **1,000-bet test** shows whether the edge is real or luck so far. Beating the closing line comes first, then profit.

---

## Where it is in the code (`index.html`)

| Piece | Function |
|---|---|
| Odds ↔ chance | `toProb`, `americanOf` |
| Fees | `feeRate` |
| Net EV, blend, stake | `auditCore` (`r.gross`, `r.net`, `r.blendProb`, `r.blendNet`, stake) |
| Most you can pay | `maxPriceFor` |
| Parlay math | `pkDist`, `pkEV`, `pkBreakEven`, `pkKelly`, `pkEntry` |
| Sentinel score | `sentScore` |
| Already bet | `coreKey`, `propSame`, `fillPriorFor` |

`tests/math-audit-test.js` checks this arithmetic against brute force on every build: odds ↔ chance, EV after fees, the most you can pay, the Kalshi shares, the Kelly stake, profit, and the parlay math. All of these settings are in **Settings › Your rules at a glance**.
