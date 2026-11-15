# Decision: "So far: where it's working" (Reports) · so-far-v1

Status: **active** since v5.07 (2026-11-14). Agreed with Sally (CC-2026-11-14-15/16 and her replies); owner: all groupings, "Ask Sally, then build".
The version number v5.06 was left for forecast recovery while it waited for Sally; it will ship as v5.08.
Open for Sally: the many-group family shrinks under filters; "Unadjusted lead" on a losing row; "Early sample" has three thresholds on one Reports page.

## The agreed scope (as built; the fixer added: ranges shown from 15 settled games, the 90% range shown on Leaning rows, a no-sport prop mapped by the sport its event id proves)

Builds on Reports › By (index.html: rpGroupKey, rpGroupOrder, rpBreakHtml, rpSample, rpCounts, rpOutKey, rpGameKey, rpBootGames/rpBootGames0 with rng32, rpPregame, rpClvHtml/clv(), betProfit, heldValue, lcStats/rpAgg, RP state + rpSaveUi, the rpBy <select> ~line 2520).
Display only: NO change to any stake, decision, floor, the Scorecard, Said vs won (calibration-v1), or saved data. Section policy name: so-far-v1.

## S1. Two new groupings in Reports › By
- "Market": canonical stat family from an explicit, versioned alias table `market-alias-v1` (function declaration, e.g. marketFamilyOf(b) returning {key, label, mapped:true|false, aliasPolicy:'market-alias-v1'}).
  Props: strip the leading line number, normalize spacing/case/punctuation, then look up the alias table PER SPORT. Game lines: Spread, Total (Over/Under), Moneyline by kind. Parlays: "Parlay".
  Alias table v1 (same contract only):
   - Shots on goal (NHL): "Shots OnGoal", "Shots On Goal", "SOG", "Shots on Goal". NOT plain "Shots" (kept as its own family "Shots" until Alonzo confirms his books settle it on SOG; keep a one-line switch `MARKET_ALIAS_SHOTS_CONFIRMED=false` with evidence:'book-rule-confirmed' when turned on).
   - Points + rebounds + assists (NBA/NCAAB): "Points Assists Rebounds", "Points+Rebounds+Assists", "Points Rebounds Assists", "PRA", "Pts+Reb+Ast".
   - Points + rebounds: "Points Rebounds", "Points+Rebounds". Points + assists: "Points Assists", "Points+Assists". Rebounds + assists likewise.
   - Three-pointers made: "Threes", "ThreePointersMade", "3 Point Field Goals", "3-Pointers Made", "Three Pointers Made".
   - Goalie saves (NHL only): "Saves", "Goalie Saves".
   - Player goals (NHL/soccer player count props only, not anytime/first/last scorer): "Player Goals", "Goals".
   - Receptions (NFL/NCAAF): "Receiving Receptions", "Receptions".
   - Passing interceptions (NFL/NCAAF QB passing props only): "Passing Interceptions", and "Interceptions" ONLY when the player is the passer (if role unknown: unmapped).
   - Keep as their own families with readable names: Points, Rebounds, Assists, Steals, Blocks, Receiving Yards, Rushing Yards, Rushing Attempts, Passing Attempts, Passing TDs, Rushing + Receiving Yards, Defense Sacks (Sacks), Hits, Walks Allowed, etc.
  Qualifiers stay part of identity (never merged): period/quarter/half ("1st Period", "1Q", "1H"), power play, alternate, first/last/anytime, regulation/OT.
  Unknown text: label "Unmapped · <original stat>" (mapped:false), never dropped. No sport saved: unmapped unless identity proves the sport.
  Show under the table: "N tickets mapped · M unmapped (market-alias-v1)".
- "Sport · type · market": "<sport or (no sport)> · <prop|spread|total|moneyline|parlay> · <market family>" (e.g. "NHL · prop · Shots on goal", "NFL · spread").
- Add both to the rpBy select; existing groupings unchanged.

## S2. Columns added to EVERY grouping's table (existing columns stay)
Always show tickets · unique outcomes (rpOutKey) · games (rpGameKey).
- ROI (stake-weighted, primary, as now) + "ROI 95% range": paired whole-game bootstrap: per game g (P_g profit, S_g own-money stake, settled financial tickets only; free bets stake 0 as the app counts); each draw ROI* = ΣP*/ΣS*; skip a draw only if ΣS* = 0. 2,000 draws for display; 5,000 for card candidates, intervals near zero, and the BH test. Seeded rng32 (seed from the row's content so results are stable); memo keyed by log revision + filters + date range + basis + grouping + row.
- Flat $1 ROI in the row's tooltip/detail (each ordinary settled ticket at $1 at its actual price; exclude free, sold, boosts without payout data, parlays).
- "Expected vs actual": E = Σ stake × snap.actNet over ELIGIBLE tickets: direct frozen La Contadora forecast only (snap.act and snap.actNet present, rpPregame true), settled, own money (not free), not sold, not parlays, not v5.06 recovered (b.forecastRecovery), not model-fallback-only, not typed covers. A = Σ actual profit over the same tickets. Show "Expected +$4.20 vs actual +$7.10 · 18 of 25 settled tickets eligible" and a game-clustered range for (A − E) in dollars from per-game tuples (A_g, E_g, S_g) resampled whole. Never call it SD. Separately, small print: "Recovered from history: n (shown apart) · Model fallback: n (not included)".
- "CLV": median CLV with coverage: "Median CLV +0.7% · 18 of 25 tickets have a same-line close" (use the app's clv()).

## S3. The "Read" column replaces the old "Sample" column (rpSample words disappear from this table)
- fewer than 30 outcomes OR fewer than 15 games: "Too few to read"
- 30–49 outcomes OR fewer than 25 games: "Early sample"
- 50+ outcomes and 25+ games and 90% range entirely above / below 0: "Leaning up" / "Leaning down"
- 100+ outcomes and 50+ games and 95% range entirely above / below 0 AND passes BH FDR 10% (S4): "Holding up so far" / "Struggling so far"
- 100+ / 50+ and raw 95% range clears 0 but fails BH: "Unadjusted lead · did not survive the many-group check" (never used below the 100/50 gate)
- otherwise: "No clear lean"
(Order of checks: gates first; a 100/50 row that passes the 90% test but not 95%+BH reads "Leaning ...".)

## S4. Many-group check (BH)
- For each row of the CURRENTLY SELECTED grouping that meets 100 outcomes / 50 games: a null-centered paired game bootstrap p-value (5,000 draws): r = ΣP/ΣS; R_g = P_g − r·S_g; resample (R_g, S_g) whole games; T* = ΣR*/ΣS*; p = min(1, (1 + #{|T*| ≥ |r|}) / (B + 1)).
- Benjamini–Hochberg at q = 0.10 across those eligible rows, regardless of sign. The table and the card use the same adjusted result.
- (If an actual−expected test is shown: D_g = A_g − E_g, centered D_g − mean(D), same two-sided null test. Display only.)

## S5. "So far" card at the top of Reports
- Follows the selected grouping only ("So far · by Market"), with the same date range, basis and filters as the page.
- Up to 3 rows that are Holding up / Leaning up (best first by the low end of the range) and up to 3 Struggling / Leaning down (worst first), each with tickets · outcomes · games, ROI and its range, and its Read word. If none qualify: "Nothing reads clearly yet: N groups, all too few or no clear lean."
- One honest line under it: "Many overlapping groups were checked. 'Holding up' and 'Struggling' need the 95% range to clear zero and a 10% false-discovery-rate screen. Leads are not proof; the 1,000-bet test is the Scorecard."
- Calm wording, no hype, no advice; colours follow the app's up/down classes (wins green, losses red) with ▲/▼.

## S6. Performance and layout
- Compute lazily only when Reports is open; memoize; no work on the board render path. Must stay fast with 2,000+ bets (budget ~150 ms on a laptop for one grouping).
- Phone: the wide table keeps the app's existing card-style rows (data-l labels) at 390 px; no sideways page scroll at 390/1000/1280/1960; text ≥ 12 px.

## Rules
File style: // v5.07: comments; new CSS in a /* v5.07 ... */ block just before the first </style>; no apostrophes inside single-quoted JS strings; function declarations for anything a render reaches; no duplicate function names (tests/v503-test.js). Do NOT bump the version.
Tests: tests/v507-test.js (registered last in tests/run-all.js): alias table (each alias above; Shots stays separate; Interceptions without passer role unmapped; qualifiers kept apart; unmapped count shown); Sport·type·market keys; paired bootstrap ratio-of-sums vs a hand-computed tiny case and determinism (same input → same range); flat $1 ROI; expected vs actual eligibility (free, sold, parlay, recovered, fallback, post-start excluded) with exact sums; CLV coverage text; Read labels at each gate edge (29/30 outcomes, 14/15 games, 49/50, 24/25, 99/100, 49/50 games); null-centered p and BH on a constructed set where a raw 95% clears zero but fails BH → "Unadjusted lead ..." in BOTH table and card; the card follows the grouping; no change to Scorecard/Said vs won numbers (snapshot before/after on the same log). Update any existing test that asserts the old Sample words in the By table, with a // v5.07 comment.
