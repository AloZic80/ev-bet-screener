# 📊 Betting report: Oct 24 to Thu Nov 12

Ref: CC-2026-11-13-08 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago.
**Sources:** the master file through game day 11/10 (`bets-oct24-nov10_master_2026-11-11.csv`, 327 bets: the app's log checked against
JuiceReel, plus Polymarket and FanDuel screenshots) and Alonzo's Bet log CSV for Thu 11/12 (18 bets). Game day 11/11 is missing (only one
open bet in the 11/11 export). Edge signals (CLV, model EV) come from the app's export (`0xbeta-bets-all-2026-11-11.csv`) plus 11/12.
Nothing was changed in the app or the log. This is far short of the 1,000-bet Scorecard: patterns below are early and can be noise.

## Overall (345 settled bets)
| | |
|---|---|
| Record | 161–179–2 |
| Staked | $746.43 |
| Profit | **+$17.39** (ROI +2.3%) |
| Without Bovada (two small parlays and a few long shots that hit) | −$45.08 on $697.39 (−6.5%) |

The positive total rests on a handful of long-shot hits at Bovada (+$62.47 on $49): a $1 three-leg parlay (+$12.66), a $1 shots parlay
(+$9.15), Trey Murphy III O3.5 assists +165 (+$8.22), Josh Sweat O0.5 sacks +275 (+$7.89).

## By week
| Week of | Bets | W–L–P | Staked | Profit | ROI |
|---|---|---|---|---|---|
| Oct 19 | 38 | 18–19–0 | $125.84 | +$4.21 | +3.3% |
| Oct 26 | 107 | 50–53–2 | $199.26 | +$6.73 | +3.4% |
| Nov 2 | 142 | 59–83–0 | $308.78 | +$8.65 | +2.8% |
| Nov 9 (to 11/12) | 58 | 34–24–0 | $112.55 | −$2.20 | −2.0% |

## By book
| Book | Bets | W–L–P | Staked | Profit | ROI |
|---|---|---|---|---|---|
| Novig | 246 | 116–128–1 | $511.75 | −$24.41 | −4.8% |
| Polymarket | 39 | 13–25–0 | $108.71 | −$15.43 | −14.2% |
| Bovada | 24 | 17–6–1 | $49.04 | +$62.47 | +127.4% |
| DraftKings | 17 | 6–11–0 | $49.91 | −$0.91 | −1.8% |
| FanDuel Predicts | 13 | 6–6–0 | $15.31 | −$1.06 | −6.9% |
| Kalshi | 6 | 3–3–0 | $11.71 | −$3.27 | −27.9% |

## By sport
| Sport | Bets | W–L–P | Profit | ROI |
|---|---|---|---|---|
| NHL | 126 | 66–59–0 | +$21.04 | +8.3% |
| NFL | 89 | 37–49–1 | +$5.40 | +2.5% |
| NBA | 84 | 39–44–1 | +$3.80 | +2.4% |
| NCAAF | 40 | 16–24–0 | −$22.74 | −21.8% |
| MLB, NCAAB, mixed parlay | 6 | | +$9.89 | |

## By bet type (the biggest groups)
| Type | Bets | W–L–P | Profit | ROI |
|---|---|---|---|---|
| Shots on goal (NHL) | 88 | 49–38–0 | **+$17.27** | +9.7% |
| Moneyline | 54 | 17–37–0 | **−$29.44** | −29.3% |
| Spread | 45 | 18–25–0 | −$8.49 | −7.1% |
| Game total | 33 | 13–20–0 | −$17.94 | −19.3% |
| Pts+Reb+Ast | 13 | 8–5–0 | +$6.34 | +33.9% |
| Sacks | 11 | 6–4–1 | +$20.04 | +96.0% |
| Parlays | 9 | 4–5–0 | +$16.73 | +98.9% |

## By price (the chance the price implies)
| Price | Bets | W–L–P | Profit | ROI |
|---|---|---|---|---|
| Long shots, +150 or longer (<40%) | 58 | 14–43–1 | **−$21.92** | −19.4% |
| 40–50% | 113 | 57–56–0 | +$11.12 | +4.4% |
| 50–60% | 128 | 63–63–1 | −$6.25 | −2.2% |
| Favorites, −150 or shorter (60%+) | 30 | 19–10–0 | +$9.10 | +17.9% |
| Unknown price (parlays, some screenshots) | 16 | 8–7–0 | +$25.34 | |

## The edge signals (app-logged bets only)
- **Closing line:** 166 bets with a closing price: beat it 70, worse 73, even 23. Average CLV **+0.31%**, median 0. So far, no clear sign of
  beating the market's final price.
- **The model's own EV:** on 261 settled bets the model expected **+$44.49** (on $535.11); the result was **−$15.43**. The model was too sure:
  this is exactly why La Contadora (min of the model and market + 35% of the gap) has decided stakes since v4.53. Most of these bets are older
  than that.
- **Thursday 11/12 alone** (La Contadora on): expected +$1.33, made +$10.27; CLV +0.92% on 12 bets.

## What it points to (early, not proof)
- **Holding up:** NHL shots on goal (88 bets, +9.7%), favorites at 60%+.
- **Hurting:** moneylines (−29%), long shots +150 and longer (−19%), game totals (−19%), NCAAF (−22%). Note: since v4.68 long-shot moneylines
  are limited (3 a game day, one a game) and since v4.74 long shots sit in 🔮 Brujo.
- **Without the Bovada hits the record is about −6.5%.** The closing line is roughly even. Both say: keep stakes small and let the
  Scorecard reach a few hundred La Contadora bets before reading anything into it.

## Data notes
- Game day 11/11 is not in either file (send an "all" export for a complete record).
- Some 11/12 records need cleanup (see the 11/12 report): fill times, Diabate's missing game, UTAH vs UTA.
