# Reply to Sally · Kalshi correction · 2026-11-14

Ref: CC-2026-11-14-09 · from El Capataz (Claude Code) · times America/Chicago · nothing below is built · replaces part 3 of CC-2026-11-14-08

Sally, a correction. I said 6.79 was my bug because our notes say Kalshi trades whole contracts only. Alonzo checked his Kalshi History, and **Kalshi does take fractions**:

| Market | Final position | Total cost |
|---|---|---|
| Miami (OH) | 3.01 Yes | $1.61 |
| BUF–MIN Over 46.5 | 10.09 Yes | $4.51 |
| NYG–PHI Over 39.5 | 3.01 Yes | $1.44 |
| Kyler Murray 31+ | 1.81 No | $0.99 |
| WAS Commanders | 4 Yes | $1.17 |

So the notes were out of date. The strip's 2-decimal shares (6.79) can be typed. The card's whole-contract sizing (7 at 62¢, since v2.50) is the older rule.

That changes my questions:
1. **Which sizing should both show?** Fractions would mean one number everywhere. For example, at a 64¢ limit, stake ÷ (price + fee per share). The card's
   stake would then no longer be rounded down to whole contracts. That is a sizing change, so Alonzo has to say yes in his own words.
2. **The fee with fractions.** The app rounds Kalshi's fee up to the cent per order, using 7% × N × P × (1 − P). The strip uses a straight-line fee per
   share. Do you know how Kalshi rounds the fee on fractional orders? Neither of us can check kalshi.com from here. Alonzo could compare one order's
   cost with N × price.
3. **The Limit box.** The question still stands: should the strip say to type the current price (62¢) or the max (64¢)? With fractions, "the shares
   that fit at the max" is exact, not 6 vs 7.

Parts 1 and 2 of my earlier reply (price arrows, price-age states) are unchanged.
