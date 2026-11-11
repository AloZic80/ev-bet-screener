# Para ChatGiPiTiTi — 0xBeta Screener v4.69 (2026-11-11)

Ref: CC-2026-11-11-05 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees. Since v4.68, long-shot moneylines (La Contadora under 45%) are limited to 3 a game day and 1 a game, at the smallest bet.

## How it was approved
You agreed the v4.69 scope ("The scope is settled from my side"). Claude Code checked that the app saves the board readings it needs. Alonzo: "ok, after you check > BUILD".

## What was built: which logged moneyline counts toward the 3 a day
The app checks these in order; the first answer wins:
1. **`snapshot_act`.** La Contadora's chance saved with the bet. If it is 45% or more, the bet does not count and nothing below is checked.
2. **`pregame_board_act`.** The latest board reading of this exact bet: same sport, team, market and line, side, and game day.
   - The reading must be from at or before the time the book says you placed the bet (`placedAt`), and before kickoff.
   - The chance is `min(model, market + 0.35 × (model − market))` from that reading.
   - With no `placedAt` or no kickoff, this step is skipped. A reading from after you placed the bet is never used.
   - If the chance is 45% or more, the bet does not count and the next step is not checked.
   - Board readings are kept 3 days, on the device that loaded the board, so the result is saved on the bet.
3. **Fallback:** the model's fair chance under 45% OR the price you paid under 45%. It counts for exposure only, and the source is saved as one of:
   - `model_fair_fallback`
   - `paid_price_inferred`
   - `model_fair_and_paid_price`

Every moneyline bet keeps `lsmlCls` {src, p, obsAt, at, ver}. In the Bet log, each counted bet is tagged with its source. Only the price-alone case says "inferred from paid price · no forecast snapshot".

No stake, floor, cap or 45% line changed. The analysis after about 100 outcomes stays an external CSV report.

## Numbers in the test (by hand)
- +150 = 40.0%; −110 = 52.4%; +123 = 44.84% (counts); +122 = 45.05% (does not count); +200 = 33.3%.
- Reading at model 42%, market 38% → 39.4% (counts). Reading at model 52%, market 49% → 50.05%: does not count, and the +200 price is not checked.
- Saved 46% with a +200 price and a 40% fair: does not count.
- The only reading came after you placed the bet: not used.
- No placed time, or no kickoff: no reading used.
- Five long shots logged on one day, so a board long shot at +9.44% gets no stake (limit reached).
- `tests/lsml-class-test.js`: 15 checks. The full suite result is in the PR.

## Limits to know
- A bet added by hand usually has no `placedAt` (only book fills have it), so step 2 is skipped for it and the fallback decides. You asked for this: no guessing the order of events.
- A hand-added bet at a book the board does not scan rarely matches a board reading anyway.

## Question for ChatGPT
For a bet added by hand, should the time it was saved in the app count as an upper bound for `placedAt` in step 2? A board reading from before the save could still come after the real placement. I left it out as agreed.
