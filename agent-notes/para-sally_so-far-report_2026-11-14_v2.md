# For Sally · "So far": I agree, with 3 clarifications · 2026-11-14

Ref: CC-2026-11-14-16 · from El Capataz (Claude Code) · times America/Chicago · nothing built

I agree with your 8-point scope: qualifier-safe Market and Sport · type · market; game-clustered ROI; expected vs actual on direct frozen
snap.act / actNet only, with its own clustered range (no plain SD); CLV with coverage; your thresholds (30/15, 30–49 or under 25 games, 50/25 at 90%,
100/50 at 95%); BH FDR at 10%; stake-weighted ROI first with flat $1 in the detail; the card following the selected grouping; recovered and fallback
forecasts shown apart. I checked it against the code. Three clarifications:

1. **One vocabulary.** The table already has a "Sample" word (`rpSample`: under 10 "too few to rank", under 30 "extremely preliminary", under 100
   "early sample"). Two sets of words would confuse. I propose your labels **replace** that column ("Read": too few to read / early sample / leaning
   up / leaning down / holding up so far / struggling so far / no clear lean). And since the card follows the selected grouping, I apply BH across
   **the rows of that grouping** for the "holding / struggling" label **in the table too**, so the table and the card never disagree. A row that clears
   the raw 95% range but not the FDR screen reads "lead · did not survive the many-group check". OK?
2. **The ROI range needs a new paired bootstrap.** The existing `rpBootGames` resamples ONE summed value per game (a profit total), not a ratio.
   For ROI I add a paired version: per game (profit, own-money stake); each draw is the sum of profits over the sum of stakes (ratio of sums, as you
   wrote). It uses the app's seeded `rng32`, cached by log and filter revision: 2,000 draws, 5,000 for rows near zero or card candidates. Two-sided
   p = min(1, 2·(k + 1)/(B + 1)), with k the draws on the far side of zero. The same per-game pairing gives the range for actual − expected.
3. **Market names in his log need a mapping table**, not just the line stripped. His props today (count, sport, stat as saved):
   61 NHL "Shots", 18 "Shots OnGoal", 15 "Shots On Goal"; 12 NBA "Points Assists Rebounds", 3 "Points+Rebounds+Assists", 2 "Points+Rebounds+Assists"
   (spelling), 1 "Points Rebounds Assists"; 8 "Threes", 1 "ThreePointersMade", 1 "3 Point Field Goals"; 3 "Saves", 1 "Goalie Saves"; 1 "Player Goals",
   1 "Goals"; 4 "Receiving Receptions"; "Interceptions" and "Passing Interceptions"; and 6 props with no sport saved.
   I propose an explicit alias list (same stat, same contract) and the "unmapped" marker for the rest. One open point I am asking **Alonzo**:
   is NHL "Shots" the same contract as "Shots On Goal" at his books? If not, they stay apart.

If you agree, this is the scope, and Alonzo's BUILD starts it right after v5.06.
