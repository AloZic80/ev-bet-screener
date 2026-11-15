# For Sally · "So far: where it's working" in Reports · 2026-11-14

Ref: CC-2026-11-14-15 · from El Capataz (Claude Code) · times America/Chicago · a proposal, nothing built

## What Alonzo asked
"I want the report to pretty much see where the types of bets are winning so we can address them as I go. I know we still need more bets, but as a
So Far based on what we have ... it will be dynamic. Once MLB starts it will change as well. I want this type of report to show up on the app."
He wants every grouping ("Could we [do] all?") and asked to run the rules by you first.

## What the app already has (Reports tab, v4.89–v4.90)
Reports › "By" already breaks the bets down by ONE grouping at a time: Sport, Book, Bet type, Price paid, Tab (her chance when taken), Band.
Columns: tickets (incl. open), settled outcomes (one per outcome), W–L–P, settled risked, profit, ROI, and a sample word (`rpSample`: under 10
"too few to rank", under 30 "extremely preliminary", under 100 "early sample"). Date range, placed/game-day basis and filters already apply.
Separately: CLV (`rpClvHtml`), the edge test (`rpEdgeHtml`), Said vs won (calibration-v1) and the Scorecard (the 1,000-bet test).

## Proposal: add to that breakdown, plus one summary card
1. **Two new groupings:** **Market**, i.e. the stat family with the line ignored ("Over 2.5 SOG" and "Over 3.5 SOG" both go to "Shots on goal";
   spreads, totals and moneylines by name; an unknown stat keeps its own text). And **Sport · type · market** combined (e.g. "NHL · prop · Shots on goal",
   "NFL · spread"). MLB rows appear on their own once there are MLB bets.
2. **Three new columns on every grouping:**
   - **ROI 95% range:** whole games re-drawn (the Scorecard's game-cluster bootstrap, `rpBootGames`, 2,000 draws).
   - **Expected vs actual:** the sum of La Contadora's EV × stake at the price paid (snap.actNet) against the real profit, in SD, only for bets that
     carry her chance, with the coverage shown ("18 of 25 have her chance"). v5.06 recovered forecasts are left out, or shown apart (your rule).
   - **CLV:** the median and the number of bets with a close.
3. **A label per row (display only):**
   - under 30 settled outcomes: **too few**;
   - 95% range above 0 and 100+ outcomes: **holding up so far**; 95% range below 0 and 100+: **struggling so far**;
   - otherwise, if the 80% range is above or below 0: **leaning up** / **leaning down**;
   - else **no clear lean**.
4. **A "So far" card at the top of Reports:** up to 3 "leaning up / holding up" and 3 "leaning down / struggling" rows across ALL groupings, each
   with its n and range. Under it, one honest line: "**N groups are shown. With a 95% range, about 1 in 20 groups clears zero by luck alone.** These are
   leads to watch, not proof. The 1,000-bet test is the Scorecard." The date range and filters on the page apply (e.g. since 11/11).
5. Nothing changes a stake, floor, decision or the Scorecard; no new data is saved. A new section version name: `so-far-v1`.

## Questions
1. **Thresholds:** 30 for "too few", 100 for "holding up / struggling", 80% range for "leaning". Different numbers?
2. **Many groups:** is the "1 in 20" line enough, or should "holding up" use a stricter rule when many groups are shown (e.g. Holm or a false discovery
   rate across the rows on screen)? I lean to the plain line plus requiring 100+ outcomes, to keep it readable.
3. **Weighting:** ROI by stake (as Reports does now), with the flat $1 ROI in the row's tooltip?
4. **Overlap:** the top card mixes groupings (a bet is in "NHL", "Shots on goal" and "Volado" at once). Fine as "leads", or one grouping at a time only?
5. **Expected vs actual:** only bets with La Contadora's own chance (snap.act), or also the older model-fallback forecasts, shown apart?

Nothing is built until we agree and Alonzo says BUILD. It would come after v5.05 and v5.06.
