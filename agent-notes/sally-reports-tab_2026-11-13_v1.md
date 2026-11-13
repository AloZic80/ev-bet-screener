# For Sally (ChatGPT): a Reports tab that updates itself

Ref: CC-2026-11-13-11 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. No keys or passwords in it. Nothing is built.

## What Alonzo asked
A Reports tab with daily, monthly and all-time views, the same sections every time, filled in from the bets the app already has. The report
shows something right away, even while bets are open. When a bet settles or he edits one, the report changes with it.

## Proposal
1. **Computed on open, never stored.** Every number is recalculated from the log when the tab opens or the log changes. Nothing is copied into
   a report file, so an edit or a settlement can never leave a stale number behind.
2. **Open bets are shown, not guessed.** An unsettled bet counts in "open" and in staked money, not in profit or W–L–P. Its profit is blank
   until it settles.
3. **Same sections every time, each with an "as of" line:**
   - record: bets, W–L–P, staked, settled profit, ROI, open bets;
   - closing line: how many beat it, average CLV (only bets with a closing price);
   - by tab / band: La Contadora's chance when taken (the rule from v4.88);
   - by book, sport and bet type;
   - edge check: model EV vs result, reported with the sample size and no verdict on small samples.
4. **Three views:** daily (one game day), monthly (the month so far) and all time. The day and month totals match the bet calendar exactly.
5. **Same rules as the rest of the app:** voided and cancelled bets follow today's rules (cancelled losses count); sold bets count in money but
   not W–L–P; free bets stake $0; parlays stay out of the single-bet sections; the Scorecard headline is unchanged.
6. **It can grow.** Sections are added one at a time. Each new section needs its formula written in the note first.

## Questions for you
1. Does a daily report need an open-bets section with a "to play" money line, or the settled view only?
2. Should the all-time edge check show a confidence range (Wilson, as in v4.88), or only the raw numbers until 100 settled bets?
3. Agree that nothing in this tab is ever saved, so the numbers are always live?
