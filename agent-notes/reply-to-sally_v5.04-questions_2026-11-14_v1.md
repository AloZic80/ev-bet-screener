# Reply to Sally · v5.04 display questions · 2026-11-14

Ref: CC-2026-11-14-08 · from El Capataz (Claude Code) · times America/Chicago · nothing below is built

Sally, I checked your three answers against the code. Here is what the app does today, where I agree, and what I still need from you.

## 1. Price movement arrows
- **Already true:** v5.04 did not put ▲/▼ on price moves. The card's move pill still reads `↘ −4.5 pts`, and its hover text says "The price fell from 58.0% to 53.5% in 52 min".
  It is green when the price fell (cheaper for the buyer) and amber when it rose. So the two conventions are already separate. **Agreed.**
- **Your change:** the pill would say `Price ↘ 4.5 pts` (or "Price fell 4.5 pts ↘"), with no minus sign. I agree the sign is redundant next to the arrow.
- **Question 1a.** The pill measures the **chance** the price implies (58.0% → 53.5%), not the American odds. If the pill says "Price fell 4.5 pts", is
  that clear enough, or should it be "Price fell 4.5 pts (58.0% → 53.5%)"?

## 2. Price-age wording
- **Today:** every width says "Price under 1 min old" / "Price 45 min old" / "Price 2 h old". Over 30 minutes the pill turns amber and its hover says
  "Send the Sentinels for a fresh one". There is no "just read", no "time unknown" and no "stale · re-check" text. When the age is unknown, the pill is left out.
- **Your proposal:** "Price 45m old" when it fits, "45m old" on a phone only if it does not fit, plus a fixed set of states.
- **Question 2a.** Which thresholds? The app has two today: **30 min** turns the pill amber, and **12 h** sends the card to the ⏱ Old prices tab.
  Is "Price stale · re-check" the 30-min state, and does "Price just read" mean under 1 minute?
- **Question 2b.** "Price time unknown": is it worth showing, or is leaving the pill out (as now) fine? Every card where it is missing comes from a pasted board.

## 3. Kalshi: 6.79 shares versus 7 contracts
- **I agree, and it is my bug, not a design choice.** `memory/platforms/books.md` records Kalshi as **whole contracts, fee rounded up per order (active)**.
  The card follows that rule. The "On Kalshi, enter" strip does not: it divides the stake by the limit with a straight-line fee, which gives 6.79.
  So `6.79` is wrong on Kalshi and should go everywhere. Alonzo can confirm on the order ticket that Kalshi takes whole contracts only; the build machine cannot reach kalshi.com.
- **Your numbers check out.** With Kalshi's fee, ceil(7% × N × P × (1 − P)), rounded up to the cent:

  | | 6 contracts | 7 contracts |
  |---|---|---|
  | at 62¢ | $3.82 | **$4.46** (the card's stake) |
  | at 64¢ | $3.94 | $4.60 (over $4.46) |

  So at the 64¢ max only 6 contracts fit.
- **Question 3a, the one that decides the slip: what goes in Kalshi's Limit box?** A limit order fills at the current ask or better. Two cases:
  - **Type 62¢:** 7 contracts never cost more than $4.46. If the price moves up, the order waits.
  - **Type 64¢:** 7 contracts can cost $4.60, 14¢ over the stake. Typing 6 is safe but buys one fewer contract even when 62¢ is still there.

  Your wording ("7 at 62¢ · max price 64¢ · reduce to 6 if placing at the max") shows both cases but does not say which one to type. The buyer's tool
  rule is "say exactly what to type". My suggestion: the strip says **7 contracts, limit 62¢** (never over the stake). A small line underneath says
  "Still worth it up to 64¢: at 64¢, 6 contracts fit." Do you agree, or do you want 64¢ in the box?
- **Question 3b. Which budget?** The $4.46 is already Kelly's stake rounded down to whole contracts at 62¢. N_max at 64¢ could be computed against
  the rounded $4.46 (6 fit) or against the unrounded Kelly or cap amount (7 might fit if that amount is $4.60 or more). I would use the rounded stake
  shown on the card, so the two numbers can never disagree. OK?
- **Question 3c.** The Bet log saves the card's sizing (7 at 62¢). Once a fill comes in from Kalshi, the real fill replaces it, as today. Anything to add there?

Nothing is built until you and I agree on the exact wording and Alonzo says BUILD.
