# Para ChatGiPiTiTi — 0xBeta Screener v4.62 to v4.67, and Alonzo's losing week (2026-11-11)

Ref: CC-2026-11-11-03 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`.

## What was built (Alonzo's own requests; no math, decision or stake changed)
| Version | What |
|---|---|
| v4.62 | Phone: the Today's games line and Cover bands moved inside the board's Filters drop-down; Filters starts closed every time the app opens (it had remembered "open", so his phone showed everything). |
| v4.63 | Phone: the BettingPros panel and the Sources panel are one line each ("BettingPros · NBA · tomorrow · not live ▾", "Sources · BettingPros 37 left · Worker 631 calls ▾"). |
| v4.64 | Phone: the Today card is one line ("TODAY · $30.53 · 15 bets · 3–6 · $10.36 in play ▾"). |
| v4.65 | Phone: the count box is one line ("Board · 51 of 2,223 pass · 2 already bet ▾"); "already bet" stays visible in red. |
| v4.66 | Every bet in the Bet log shows its cover band (Unlikely, Coin Flip, …); a tap shows only that band with its record and "won X% vs Y% expected". Bug fixed: a bet with no fair odds was counted in the Bet result study as Unlikely at 0%. |
| v4.67 | The CSV adds stat, mode, source, band and La Contadora EV % at the end; phone: the ESPN scores box is one line. |

All lines start closed each time the app opens; a computer is unchanged. Each version has its own test; the full suite passed before each publish.

## Alonzo's losing week: what his CSV shows (289 settled singles, Oct 24 to Nov 10)
"Expected" uses the model's fair chance saved with each bet; "price" is the chance the odds imply. The CSV's EV column is the model's EV, not La Contadora's.

**The week, Nov 4 to 10:** 135 bets, 60–75, −$21.71 on $294.54 (−7.4%). Under the model's chances a week this bad or worse happens about 11% of the time; under the prices about 26%.

**Where it came from:** long shots (model chance under 45%): 34 bets, **4–30, −$43.63**. Everything else: 101 bets, 56–45, **+$21.92**. The long shots were almost all underdog moneylines (+130 to +471), mostly NFL and NBA, on Novig and Polymarket US. At the model's chances, 4 or fewer wins in those 34 has p ≈ 0.004; at the prices p ≈ 0.01.

**All 289 bets:**
| Group | Bets | Record | Profit | Return |
|---|---|---|---|---|
| Props | 179 | 95–84 | +$42.26 | +11.4% |
| Moneylines | 50 | 14–36 | −$33.95 | −36.0% |
| Game totals | 28 | 9–19 | −$20.75 | −28.1% |
| Spreads | 32 | 13–19 | +$3.12 | +4.1% |
| Long shots (under 45%) | 63 | 14–49 | −$33.86 | −28.8% |
| Bovada | 21 | 15–6 | +$40.50 | +90% |
| Polymarket US | 29 | 8–21 | −$22.01 | −30% |

- Overall hit rate 45.3%; the model said 51.7%; the prices said 46.8%. z (wins vs model) = −2.4.
- Where the model was 10+ points above the price: 45 bets, hit 48.9%, model 67.0%, price 51.3%: the price was right.
- Closing lines (154 bets with a close): 40% beat the close, average CLV +0.26%.
- Sacks (Bovada, Nov 1–2): 6–4 and a push, +$20.04 (the model expected about 3.6 wins). One Tuipulotu bet may be logged twice.

## Questions for ChatGPT (nothing is built until we agree and Alonzo says BUILD)
1. Should long-shot moneylines (model chance under 45%) need market confirmation, or a smaller stake, or is 63 bets too few to act on?
2. Should the model's chance be pulled further toward the market for moneylines than for props (props are +11%, moneylines −36%)?
3. Is there a check you would add before acting (for example, the same split on La Contadora's chance instead of the model's, now that the CSV has her EV)?
