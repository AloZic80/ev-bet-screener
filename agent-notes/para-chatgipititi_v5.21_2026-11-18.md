# Para ChatGiPiTiTi (Sally): 0xBeta Screener v5.20 + v5.21 (2026-11-18)

Ref: CC-2026-11-18-05 · Written by Claude Code, Wed 2026-11-18, America/Chicago. No keys or passwords in it.

## What the app is
A one-file sports-betting screener for Alonzo (props.0xbeta.dev). La Contadora's conservative chance, `min(model, market + 0.35 × (model − market))`, decides every bet and stake.

## New standing rule
Alonzo, 11/17: "from now on, we are making my dev app. when we are ready after 1k or more, we change go reg mode". Dev mode: running-survey labels show live with no minimum sample, always with the count. Reports keeps its careful small-sample wording. After 1,000+ settled bets he decides when to switch to Regular mode (sample gates).

## What was asked and built
- **v5.20 · Kalshi links** ("its never the same play"): Kalshi has no prefilled link; its URL opens the game page. Every tap now copies the exact market name, and a toast says what to paste, the side and the limit.
- **v5.21 · Novig thin book** ("please fix"): the "I bet this" form had filled Novig "now" 65.0% (−186) for a bet Novig actually filled at 55%. Cause: the peer book was thin. The ask was 1 − the 35¢ bid on No; his own side's bid was 43.5¢, a 21.5-point gap. Now a live price more than 10 points above your own side's bid is a "thin reading". It never fills the form, is not shown as the live price, and is not used in best odds or the hold. The form says to check the slip. App only; the Worker is unchanged.
- **v5.21 · tab edge so far** ("If you see that im on an Edge from all bets on ... Machin, Parejo, Volado ... highlight"): each chance tab shows his settled single bets whose saved La Contadora chance falls in its range. It shows count, profit, ROI, wins vs the wins the saved chances expected, and CLV where a closing price exists. A tab gets a green ring when ahead (profit > 0 and wins ≥ expected), with no minimum sample. Label only.

## Numbers
- El Juez: 150 test files, "All tests passed".
- New tests: 18 + 13 + 16 checks. The thin test uses his exact 65.0% / 43.5% example.

## Questions to check
1. Is "more than 10 points between your price and your own side's bid" a sound thin-book rule for Novig, Kalshi and Polymarket US? Or should it also look at size, or at the distance from the card's price?
2. For the tab ring, "ahead" means profit > 0 and wins ≥ expected. Would you add CLV to that test, or keep CLV as information only?
3. Still open from last night: your yes on Paper money's storage (IndexedDB, never pruning settled records) and the written band guess (48.5–50% beats 45–48.5% on flat-$1 ROI at the near-start price; 100 outcomes and 50 games each side).
