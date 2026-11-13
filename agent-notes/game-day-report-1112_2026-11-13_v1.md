# 📋 Game-day report: Thu 11/12 (from Alonzo's Bet log CSV)

Ref: CC-2026-11-13-07 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. From the CSV Alonzo pasted (game day 11/12,
18 bets). Numbers only from that file; nothing was changed in the app or the log. One night is a small sample: it says almost nothing about
the edge (the 1,000-bet Scorecard does).

## The night
| | |
|---|---|
| Bets | 18, all Novig, all logged by the app from his fills |
| Record | **14–4** (no pushes) |
| Staked | $30.29 |
| Profit | **+$10.27** (ROI +33.9%) |
| What La Contadora expected | about **+$1.33** (her EV × stake, 15 bets with an EV saved) |
| Expected wins | 8.9 of those 15; he won 11 |
| Closing line | 12 with a closing price: 8 beat it, 3 worse, 1 even; average CLV **+0.92%** |

The profit is mostly variance (about $9 above the math). The closing line is the healthier sign: most prices were better than where the
market closed.

## By La Contadora's tab (her chance when taken; derived under tabs-v476, since these were logged before v4.86)
| Tab | Bets | W–L | Staked | Profit | ROI | Expected profit | Expected wins |
|---|---|---|---|---|---|---|---|
| 💪 Machín (60–75%) | 9 | 6–3 | $14.40 | +$3.29 | +22.8% | +$0.78 | 5.6 |
| 🪙 Volado (50–60%) | 6 | 5–1 | $9.84 | +$2.60 | +26.4% | +$0.54 | 3.3 |
| no forecast (fills with no card) | 3 | 3–0 | $6.05 | +$4.38 | +72.4% | — | — |

## By sport and stat
- NHL 14 bets, 10–4, +$6.22 (Shots on goal: 11 bets, 8–3, +$6.64). NBA 4 bets, 4–0, +$4.05.
- The losses: Arttu Hyry O1.5 shots (−$3.52), Dallas Stars ML −160 (−$2.27), Noah Ostlund O1.5 shots (−$0.99), T.J. Hughes O1.5 shots
  (−$0.99).

## Closing line, the three that closed worse
Dallas −160 (CLV −3.29%), Royce O'Neale O1.5 threes (−2.44%), Arttu Hyry (−0.37%). Best: Clayton Keller U1.5 points (+4.63%, but a $0.01
fill), Gillespie O14.5 PRA (+3.37%), Brandt Clarke O1.5 shots (+2.97%).

## Things that look off in the records
1. **Four "placed" times are the time the app read the fill, not when he bet:** Dahlin, Diabate, Holloway and Clarke all say 7:54:45 PM (Dahlin's
   game started 7:00). They are graded correctly; the times are not real.
2. **Diabate has no sport and no game** (a Novig prop names no teams and matched no card). Graded anyway, but outside that game's checks.
3. **"STL @ UTAH" (Holloway) vs "STL @ UTA" (Keller, Snuggerud):** one game, two spellings; same-game checks may treat them as two games.
4. **Clayton Keller staked $0.01:** a sliver of an order filled at −194 (a full share costs about $0.66). Check Novig for the rest.
5. **The "band" column is the model's chance, not La Contadora's** (O'Neale: "Strong" by the model's 73%, La Contadora 61.9%). This is the
   cover-chip item on the later list.
6. **No closing price** for T.J. Hughes, Fabian Zetterlund and TOR @ PHI (their games started before a close was read).
7. **The v4.86 columns are blank** for all 18: correct, they were logged before v4.86; the labelled "derived tab" is filled in.

## Suggested next steps (nothing built)
- Fix the team-code spelling (UTAH → UTA) so one game has one name (point 3). Naming only.
- Keep logging: the Scorecard needs hundreds of settled bets before the edge question has an answer.
