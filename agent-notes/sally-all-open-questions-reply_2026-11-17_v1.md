# Sally's decisions on "all open questions" (A–F), as pasted by Alonzo, Tue 2026-11-17 ~9:15 PM CT

Ref: CC-2026-11-17-01 · Recorded by El Capataz. Her reply to `para-sally_all-open-questions_2026-11-15_v1.md` (and the paper-money note).
Sally: "Decisions only — this is not BUILD authorization." Alonzo: "From before, but still wait for next" (her answer to the 11/17 Paper money message is still to come).

## A. v5.12 card_tapped
- A1-1 Yes. Exclude the entire "also at" strip, including live exchange prices and reference-only chips.
- A1-2 Yes. A qualifying price-chip action counts on computer and phone.
- A1-3 Yes. Enter on a focused book logo counts as the person's action.
- A1-4 Yes. Fee in every complete atomic snapshot. Save every qualifying tap separately; matching may select the latest eligible one.
- A2-1 Yes. Multiple taps of one identical bet are not ambiguous: latest eligible tap, earlier kept for audit. Competing taps for different bets prevent automatic linking. "Pending" is decided at placement, even if the tap expires before the fill arrives.
- A2-2 Yes. The fill-time-valid link counts while unconfirmed; direct ESPN check after the game even if already settled. A conflict invalidates the forecast.
- A2-3 Yes. Same ESPN event ID when both have one; otherwise same two teams and starts within 90 minutes.
- A2-4 Yes. Joined Kalshi codes agree only if they equal the card's two ESPN codes in either order. A placeholder-time fill may link later when ESPN identifies the game. An abbreviated player name does not match by name alone; require matching market IDs.
- A2-5 Yes. Keep the wager and its money in Scorecard and the 1,000-bet blocks. Remove only its forecast from forecast analyses: bands, Said vs won, Edge check, So far, Brier.
- A2-6 Yes. An ESPN conflict is final for that bet's forecast: no history fallback, no superseding copy afterward.
- A2-7 Yes. One shared game-matching and ESPN-validation function for tapped-card links and board-observation recoveries.
- A2-8 Yes. Approve screen and report wording, hover states, and `card_tapped_invalidated` with `espn_game_differs`. Do not show "Provisional."
- A2 size: about 35–45 lines and seven tests.
- A3-1 Yes, an explicit one-supersession limit. A third tap stays in the tap audit but neither replaces nor creates another linked copy.
- A3-2 Allow an automatic link or the single superseding copy after settlement if the qualifying tap predates placement. Mark it "written after the result"; those copies independently excludable for checks.
- A3-3 Yes. Only a later tap of the same exact bet may supersede.
- A3-4 Yes. Recalculate from the later tap's entire frozen record: age, card state, price gap, corrected-clock result.
- A3 size: about 25–35 lines and six tests.
- A-Defaults-1 Retain until tap time plus three days. A-Defaults-2 Corrected time decides the 24-hour expiry. A-Defaults-3 Replace the old ambiguous-device-times recovery rule with the same corrected-clock rule everywhere.

## B. v5.13 Paper money
- B1-1 Yes. Use the existing `listedOf` meaning of approved; no positive stake required.
- B1-2 (a). Fresh = read under 30 minutes ago and neither Old nor AWOL. Keep model outliers and model-only cards, tagged clearly.
- B1-3 Yes to freezing the applicable minimum, accepting decimals, creating nothing when the plan is off. If the minimum exceeds 50%, add a third group "Paper · Below plan minimum (50%–X%)", not folded into Coin Flip.
- B1 words: approved.
- B2-1 (a): all paper bets at first price; the near-start subset at near-start price; a separately labeled 31–120-minute stale-fallback step. Won % and forecast score use every eligible paper bet.
- B2-2 No automatic last-10-minute rereads in v5.13. Measure near-start coverage first; a close scan later only on Alonzo's explicit approval.
- B2-3 Yes. Eligibility must still hold at cutoff; otherwise save and count the reason no near-start price was recorded.
- B2 words: approved.
- B3-1 Judge BET before portfolio and allocation limits. A $0 from daily, player or game limits stays a paper bet at $1 but out of staked ROI. A $0 because the bet itself fails the listed approval rules is not a paper bet.
- S-1 Keep real-bet overlaps in the paper $1 totals, clearly marked and counted (prevents selection after the fact). Paper's hypothetical stake separate from actual money. Exact-outcome definition; exclude alternate lines, opposite sides, parlays, pick'em legs and live bets.
- S-2 Show "CLV: exchange cards only." Do not imply it covers the whole paper sample.
- S-3 Yes. One near-start "$1 on each" headline per group; first-price, stale-fallback and hypothetical-stake detail under More. Proposed plain wording.

## C. Band study
- C1-1 Yes. Keep the 32 bets in Block 1 with the disclosure that they are a known head start, not proof.
- C1-2 Require 100 new outcomes and 50 games on each side (the slice and the rest of its official band). Include the power warning.
- C1-3 Yes. Always cap the exploratory 2.5% view at Leaning.
- C1-4 Yes, if the Paper-only guess, exact boundaries, direction, outcome measure and stopping rule are written before v5.13 starts collecting.
- C1-5a Yes. Example becomes "51–54% earns more than the rest of 50–55%."
- C1-5b Yes. Add "Study bets only (Scorecard, since 11/11)", on by default. Off makes the display exploratory and capped at Leaning.

## D. So far
- D1-1 Yes. The Reports period is the reporting window, not one of the nine filters.
- D1-2 Yes. Any active filter triggers the cap, including one on the grouping's own field.
- D1-3 Yes. Name the changed rules so-far-v2, with the proposed explanation.
- D2 Yes. "Down, not confirmed · did not pass the many-group check" and the matching "Up, not confirmed…".
- D3-1 Update all six locations. D3-2 Keep levels and thresholds, add the plain lead-ins. D3-3 "Too few outcomes" for 30–99 outcomes; "Too few games" for 100+ outcomes on 15–49 games. D3-4 Labels may change under frozen calibration-v1 if calculations, thresholds and membership do not; record it as wording-only.
- D4 With one eligible row: "Leaning up/down" by the 90% range, and "Only 1 group has 100 outcomes on 50 games, so it was tested alone. It did not pass its own 10% test."

## E. Kalshi wording
- E1 Both age steps: "Price 30+ min old · re-check" and "Old price (12h+) · re-check". EV pill: "price needs re-check" for either, exact reason in its hover.
- E2 The `ct` hover for Kalshi only (not Polymarket US, whose fills can be fractional). No trading logic changes.

## F. To win and Total payout
- F1-1 Yes. F1-2 Price/value judgment unchanged; stop auto-filling Stake when Free bet is selected. F1-3 A free single's Total payout always equals To win. F1-4 Proposed helper wording. F1-5 Separate single and parlay rules in their own words; they share the stored profit-only result.
- F1 cap note: no daily-max or Hard-stop change without Alonzo's separate decision.
- F2 Rename every on-screen "winnings" that means profit, not only the Real money box. Keep "Got back $". Do not rename saved fields or exports.
- F3-1 `max($0.02, 1% of expected total)` in both directions. F3-2 Keep the tested line, add the reverse-check line. F3-3 When both warnings could apply, show only the To-win/profit correction. F3-4 Add "A boost? Keep what you typed."
- F4-1 "To win $1.52 · total payout $3.04." F4-2 "To win $15.00 · stake not returned." F4-3 Keep it in the row, two-line 390 px layout. F4-4 Same wording in Reports › Open bets. F4-5 Typed To win when present, else derived from saved odds and fee; hide when the odds cannot be read.

## El Capataz's notes (before any build)
- Some of A–F may already be partly live (v5.10 shipped To win / Total payout; v5.05 Kalshi wording). At build time, check each item against the code and list done / not done.
- Her B answers already cover the detailed Paper money options, and differ from the short 11/17 message in two places: S-1 keeps real-bet overlaps in the paper $1 totals (marked), and B3-1 judges BET before the limits. Her next reply decides.

## Sally's answer to the 11/17 Paper money message (pasted ~9:20 PM CT) · "Yes, with a few changes"
- B1 Both, reported apart: "Paper · Unlikely (<45%)" and "Paper · Coin Flip (45% to plan minimum)". Freeze each record's plan minimum.
- B2 Near-start price primary, first sighting as backup; keep both. Use the valid pregame observation closest to 5 min before kickoff within the 30-minute window. If none: report first-price performance apart, labeled "Early price only · not checked in the 30 minutes before the game."
- B3 BET calls only. Cards skipped because the wager fails La Contadora's price/value rules are not included.
- 1 Judge BET before portfolio limits ($0 from daily/game/player limits stays a paper bet; inadequate value, market disagreement, outlier, AWOL or old price does not).
- 2 Keep "bet for real" records in the flat-$1 paper totals, marked and counted apart. Never mix hypothetical dollars with real money.
- 3 CLV for exchange cards only, unless a genuine closing price exists for other books.
- 4 Cluster ranges by game, count pushes consistently. Reports keeps explicit early-sample wording even in DEV mode.
- 5 Record first snapshot, near-start snapshot, frozen forecast/model/market/price/fee, app version, plan minimum, eligibility reason, real-bet overlap. Never prune the settled analytical record, only disposable observation history.
- 6 Any band guess written with exact boundaries, direction, metric and stopping rule before the first eligible paper outcome.
- "Otherwise yes to Paper money as a recording-only feature with no changes to decisions, stakes, floors or thresholds."

El Capataz: agrees with all of it. Two points sent back (storage for unpruned records; the written guess) before building.
