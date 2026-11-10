# La Contadora: how the screener's EV calculator works

This is the math behind every bet the 0xBeta Screener (props.0xbeta.dev) shows. Written 2026-11-09 for **v4.43**, updated for v4.45 and v4.50; revised after an outside math check.

The worked example is a real card from Alonzo's board: **Jonathan Lekkerimaki (VAN) Over 1.5 Shots, Novig -108, PHI @ VAN, 8:30 PM CT.**

> **About the numbers.** The app works with unrounded chances. A card shows them rounded: "-125" and "55.5%" are both rounded from the model's unrounded chance, about 55.46% (worked back from the card's +6.8% at 51.92%). Worked from the rounded figures, an example can differ from the card by a few tenths. The card is right; the rounding is in the display. Where it matters, both are shown below.

---

## 1. Three different chances (they are not three confirmations)

| Name | What it is | Where it comes from | Example |
|---|---|---|---|
| **Model chance** | The model's estimate of how often the bet wins | BettingPros' projection. With no projection, a sharp price with the vig removed (Pinnacle). The card's "Fair" tile shows it and says which. | 55.46% (shown as -125 / 55.5%) |
| **Market chance** | What the betting market says, vig removed | The consensus of several books | 52.6% |
| **Sizing chance (the blend)** | The market pulled toward the model by your **model weight** (0.35) | `blend = market + 0.35 × (model − market)` | 52.6 + 0.35 × 2.86 = **53.60%** |

The model and the market are **not independent confirmations** of each other. They often share information. The blend exists because the model alone is too sure of itself. **The EV floor, your stake, the "math" order and OK up to all use the same conservative chance:** the blend, or the model when that is lower. When a bet has no market price, the model chance is used, and the stake is capped at your smallest bet.

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
- **Net EV ≥ 1.5% on the conservative chance** (v4.43; before, the model chance) and **gross EV ≤ 40%** on the model. Above 40% is almost always a wrong match, not a real edge.
- **WATCH:** a bet the model clears but the conservative chance does not is listed in its own **Watch** group, never placed. It reads "WATCH · the model likes it (+3.7%), but with the market it is +0.2%, under your 1.5% floor". Show › 👀 Watch lists only these, which is useful to see whether the model or the market was right.
- **Every Watch bet is saved once as a shadow record** (v4.44): the price you were shown and the model, market and blend chances. After the game it is graded like your bets. **Performance: Watch bets** compares the three forecasts with Brier scores (lower is better) and log loss, and gives a 95% range for "market minus model", resampled by game. It also shows what a $1 bet at the shown price would have returned. These records are never bets and never touch your money or your stats. Under 100 graded the comparison is descriptive only; around 1,000, if the model still beats both the market and the blend, the model weight or the floor can be revisited.
- **Watch bets v2** (v4.45):
  - **The headline** is market − model Brier averaged game by game (a game with many props counts once), with a 95% range from 5,000 resamples of games.
  - **Stages need both bets and games:** Directional 100 / 50; Useful 300 / 150 with the range clear of zero; Credible 1,000 / 500, the range clear of zero and within ±0.005, and the closing line and ROI agreeing. "Materially" means the range starts beyond 0.001. These were fixed before any results.
  - **One pick per game:** 5 minutes before kickoff, the highest conservative EV at the price last seen. Seen within 30 minutes of kickoff it is a primary pick; 31–120 minutes, a stale fallback, kept apart; older, no pick. Its ROI is never mixed with the all-Watch ROI.
  - **Closing prices** for Watch bets come free from Kalshi, Polymarket US and Novig, both sides de-vigged, reported as "Watch CLV on exchange-priced observations" with its capture rate.
  - **Phone and Mac** build one sample; the earliest complete pre-game copy of each record wins, taken whole.
- With no market price there is no market check: the model alone decides, and the stake is capped at the smallest bet.
- **Three levels:** clears the EV floor → passes every screen (odds, books, already bet, caps) → actionable at your limits (a stake of at least your smallest bet, room under the game cap and the daily max). Only all three make Place these.
- Not started, and at a book in **Books you bet**. A bet at a book you can't use moves to your best book, or stays off.
- **Not already bet.** This is checked against your Bet log, your book fills (Novig, Kalshi, Polymarket US) and your open orders. Different wordings count as the same bet: "Lekkerimäki" = "Lekkerimaki", "Shots On Goal" = "Shots", "2+" = Over 1.5.

All of these are **estimates**. A bet that passes has an *estimated* edge, not a guaranteed one.

## 5b. Modes, the sweet spot and ◎ PERFECTA (v4.50, v4.51)

**A mode never changes the best bets or their stakes.** Since v4.51 each mode lists only its own bets, so no bet sits under two modes; the number on each mode button is how many it holds.

| Mode | What it lists | Stake |
|---|---|---|
| 🛡️ Safe | The best bets: everything that passes section 5. | Section 4. |
| 🍀 Feeling Lucky | Only **Just missed**: Watch bets whose conservative EV is 0% or better. The other Watch bets are listed under them, not offered. | The smallest bet each, up to 5 a game day. |
| 🔮 Clairvoyant | Only **Hail Marys**: every long shot you could bet (+300 or longer, and touchdown, home-run or goal scorers from +200), math edge or not. | $1 each, up to 3 a game day. Back to Safe at midnight. |

- A bet you hold stays in the mode you took it in (a Just missed under Feeling Lucky, a Hail Mary under Clairvoyant, anything else under Safe).
- Each Hail Mary shows the three numbers side by side (v4.51): "Needs 22.2% · market 19.0% · La Contadora 19.4%", then "Math says −12.9% at this price". "Needs" is the price after its fee; "La Contadora" is the conservative chance. It says "✓ the math agrees" only when her EV is above zero.
- Extras are real bets: they count in your day's money, and the Hard stop still asks past the daily max.
- Extras are kept out of the Scorecard's 1,000-bet test, which only judges the best bets. **Performance › ◎ Rings and extras** keeps their own record.

**🎯 Sweet spot** is only ever on a best bet, and is judged on the **conservative EV** (since v4.50; before, the model's own EV).

**◎ PERFECTA** is a best bet that passes six checks:

| # | Check | Passes when |
|---|---|---|
| 1 | Zone | the conservative chance is 50% to 75% |
| 2 | Edge | the conservative EV is +4% to +12% (above 12% is usually a stale price or a wrong match) |
| 3 | Room for error | the conservative chance is 2.5 points or more above the price after its fee |
| 4 | Lined up | model ≥ market, and the market alone beats the price |
| 5 | Fresh | the price was read in the last 10 minutes |
| 6 | Clean | no warning note, injury, bad weather, outlier, capped stake, or a price up a point in the last hour |

- **6 of 6:** a gold ring, a tinted card and "BET NOW". **5 of 6:** a thin ring that names the miss. The list is in "Why this play?".
- The ring is a label. It never changes a stake.
- **Example (6 of 6):** model 60%, market 58.5%, price 54% at Novig (no fee).
  - Conservative chance = 58.5 + 0.35 × 1.5 = **59.0%** (in the zone).
  - EV = 59.025 ÷ 54 − 1 = **+9.3%**.
  - Room = 59.0 − 54.0 = **5.0 points**.
  - Market alone: 58.5 ÷ 54 − 1 = +8.3%, so it is lined up.

**🎟 Parlay leg:** a player prop with a 70%+ chance pays little alone (a fair price near −233 or shorter). On a pick'em app every pick pays the same, and a 4-pick PrizePicks Power entry (10×) needs about **56.2%** a pick (0.1 to the power ¼).
- The tag also needs the conservative EV at the prop's own price to clear **your normal floor** (1.5% by default; v4.51 used 0%), no outlier flag and a market price. A 76% prop at −400 is −5.0%: no tag.
- The 56.2% assumes four independent picks. Two picks from the same game move together, so the real chance of the entry can be lower.

**The six ◎ checks are frozen as of v4.50 (2026-11-10).** They will not be retuned on the same bets used to judge them. Performance compares Perfectas with the other best bets as a difference (ROI and CLV) with a range from resampling whole games (v4.52).

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

### The ⚡ signal (v4.52)
- The app keeps the market's no-vig chance each time a bet is loaded. When that chance is **1 point or more above its lowest in the last 6 hours**, the card shows "⚡ market +4.5 pts · 20m".
- **Bonus:** up to +5 on the score for a sharp market, +2 for the consensus, only when the book's price moved less than half as much and the market has not come back from its high. Bonus = 5 × min(1, rise ÷ 4 pts) × recency (1 within 15 min, falling to 0 at 2 hours) × source (1 sharp, 0.4 consensus).
- The rise is measured against the lowest point of the last 2 hours. A rebound after a bigger drop, or a change of market source, is not a signal. The bonus never changes a decision or a stake.
- **Example:** consensus market 45.5% → 50.0% (+4.5 pts) seen 20 min ago, book unchanged: 5 × 1 × (1 − 5 ÷ 105) × 0.4 = 1.9, rounded to **+2**. The same move in the sharp market: 4.8, rounded to **+5**.
- It is not live: a move is seen only when the board is loaded or the Sentinels run.

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

*Revised 2026-11-09 after an outside math review: rounding called out, the three chances named, the parlay independence warning added, the FanDuel fee spelled out, "OK up to" moved to the blend (app v4.41), the THIN and 1,000-bet wording made statistical, and the EV floor moved to the conservative chance with model-only passes as WATCH (app v4.43); Watch bets v2 (app v4.45); modes, the sweet spot on the conservative EV and ◎ PERFECTA (app v4.50).*
