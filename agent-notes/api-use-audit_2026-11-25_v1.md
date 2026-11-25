# API use: what each call returns and what the screener drops
Ref: CC-2026-11-25-API-01 · written 2026-11-25 (America/Chicago) · read-only audit, no math changed

Owner, 2026-11-25: "I need to utilize the API as much as I can" … "build all 3": (1) see what I use, (2) spend the spare quota, (3) more data per call.

## Built (Settings > API credits, press Refresh)
1. **See what I use:** SportsGameOdds now has a counter (games used this month of 2,500, kept on this device in `mbev.sgoq`, saved answers not counted). The other cards already existed.
2. **Spend the spare quota:** a "Spare calls" card lists what is left per source and what a call buys. It runs nothing by itself.
3. **Paid for, not used:** a card shows, per source, how many bets the last load kept and the top reasons the rest were left out (`mbev.skipq`).

## Audit: what the code drops (from `sgoToRows` and `oaToRows`)
| Source | Dropped on purpose | Could be more data per call |
|---|---|---|
| SportsGameOdds | part-game lines (halves, quarters), team totals, other game stats, yes/no props except Anytime TD (no grader), odds with no fair price, odds not on the owner's books | Each game already returns every market in one call, so there is no extra cost: the open question is graders for the yes/no props. Needs the owner's go. |
| The Odds API | only moneyline, spreads and totals are asked for; a book with a 2-way line in a 3-way game; fewer than 3 books and no Pinnacle ("too few books") | More markets cost more credits per league, so not free. Props are not requested at all. |
| OddsPapi | NFL game totals only | One call per game; more games = more calls. |
| BettingPros | n/a (board is whole) | 50 calls a day; unused calls reset. |

Nothing above was changed. A floor, threshold, fee, Kelly or cap was not touched.

## Question to check (for ChatGPT)
Is it worth building graders for the SportsGameOdds yes/no props (already paid for in each call), given a label never changes a stake?
