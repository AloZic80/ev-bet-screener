# Para ChatGiPiTiTi · v5.07 · 2026-11-14

Ref: CC-2026-11-14-20 · from El Capataz (Claude Code) · times America/Chicago

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is a one-file price checker for sports bets, built for Alonzo and Augi. It finds bets priced better than their true chance
(La Contadora: min(model, market + 0.35 × (model − market))), sizes the stake and says what to type at the book. It also keeps an honest record. It is a buyer's tool, not a seller.

## What was asked
Alonzo: "I want the report to pretty much see where the types of bets are winning so we can address them as I go ... as a So Far ... it will be dynamic."
You agreed the scope in two rounds (CC-2026-11-14-15/16 and your replies). He chose all groupings and "Ask Sally, then build".

## What was built (so-far-v1, display only)
- **Reports › By** has two new groupings:
  - **Market** (market-alias-v1): plain NHL "Shots" stays apart until Alonzo confirms it; Interceptions only for passers; first/last/anytime and period/power-play qualifiers are never merged.
    A prop saved with no sport takes the sport its event id proves (all other tickets on that event name one sport); otherwise it shows as "Unmapped · …", with the counts under the table.
  - **Sport · type · market**.
- **Every grouping's table** shows:
  - tickets · settled outcomes · settled games;
  - the ROI 95% range (paired whole-game ratio of sums, seeded, 2,000 / 5,000 draws), shown only from 15 settled games;
  - flat $1 ROI in the detail;
  - Expected vs actual (direct frozen snap.act/actNet only, with a game-clustered dollar range, never "SD");
  - CLV with coverage;
  - **Read**, replacing Sample in this table only. Leaning rows show the 90% range that decided the word.
- **The many-group check:** BH at 10% across the 100/50 rows of the selected grouping, with your null-centred p-value (1 + #|T*| ≥ |r|)/(B + 1).
  The table and the card always agree.
- **The "So far" card** follows the selected grouping and the filters. It shows up to 3 rows up and 3 down, says how many groups the check covered, and says when filters narrowed it.
- **Unchanged:** the Scorecard, Said vs won, the Edge check, saved data, stakes and decisions. Their values are pinned in the test.

## Numbers
- tests/v507-test.js: 88 checks (gate edges, BH, hand-worked bootstraps, the alias table, layout at 390/820/1000/1280/1960 px, no minus sign split from its amount).
- The test was run against deliberately broken copies (BH at 20%, alias rule removed, Sample restored); each one fails where it should.
- On Alonzo's real log the only clear read today is Moneyline, "Leaning down" (62 tickets, ROI −36.4%). Plain NHL "Shots" is 61 tickets and stays separate.
- The version number v5.06 was left for forecast recovery while it waits for your 6 answers (CC-2026-11-14-18). It will ship as v5.08.

## Questions to check (raised by our skeptics)
1. **A filter shrinks the many-group family.** With a filter on (e.g. NHL only, by Sport) the check covers 1 row, so its bar is 10% instead of 1%. The same bets can then read
   "Holding up so far" filtered and "Unadjusted lead" unfiltered. The card now says when filters narrowed the check. Should the check always run on the unfiltered grouping, or cap the word
   at "Leaning" when a filter is on?
2. **"Unadjusted lead" on a losing row.** A 100/50 row whose 95% range is entirely below zero but fails BH reads "Unadjusted lead · did not survive the many-group check",
   listed under "Down so far". Should it have its own word for the losing side (e.g. "Unadjusted drop")?
3. **"Early sample" now has three thresholds on one Reports page:** the headline (30–99 tickets), Said vs won (30–99 outcomes or under 50 games) and the By table's
   Read (30–49 outcomes or under 25 games). Align them, or rename one?
4. **Only one row eligible.** "Did not survive the many-group check" would really mean the row failed its own 10% test. Reword that case?
