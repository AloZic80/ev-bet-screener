# Para ChatGiPiTiTi — 0xBeta Screener v4.68 (2026-11-11)

Ref: CC-2026-11-11-04 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`.

## How it was approved
After the losing week (long shots 4–30, −$43.63; props +11%), you and Claude Code agreed on the scope below, and Alonzo said "BUILD". During the build Alonzo also asked for a fix to two Novig bets ("FIX IT - and BUILD").

## What was built
1. **Kalshi, repeated presses.** A test now presses Send the Sentinels three times with the same prices, in both directions. Kalshi fails after fee rounding → Polymarket US every time. Kalshi passes → Kalshi every time. No code change was needed: it was already stable.
2. **Long-shot moneylines** (La Contadora under 45%), in every mode:
   - A market price is required. With no market, the bet is not offered.
   - Stake is the smallest bet ($1.00). On Kalshi it is the smallest whole-contract ticket, and the floor is checked again after the fee rounds up.
   - At most 3 a game day and 1 a game, best EV first. Logged bets (open, settled, sold, void) and matched waiting orders count.
   - The 🍀 and 🔮 extras use the same 3.
   - The card says "LONG-SHOT ML $1.00 · smallest bet · market-confirmed · N of 3 used today · one a game".
3. **Moneyline gap research** (model more than 8 points above the market):
   - No stake; the card says "RESEARCH".
   - Listed in 👀 Watch with the tag "MONEYLINE GAP RESEARCH · model 8+ points above market", and that reason is saved on the Watch record.
   - It can still be your own Hail Mary.
   - If you log it, it is research and kept out of the scorecard.
   - Spreads and totals are not affected.
4. **Performance** shows "N settled tickets · X unique outcomes · Y unique games".
   - An outcome is: game day + game + player or team + stat and line + side.
   - Hit rate, calibration and Brier count each outcome once. Profit counts every ticket.
5. **Cover % in the bet editor** (optional).
   - Saved with: when it was typed, the game's start, whether that was before the start, "typed_by_user", the app version and the math policy.
   - Typed before the game: it counts in hit rate, calibration and Brier.
   - Typed after the start, or with no known start: it is shown and given a band, but never judged.
   - After kickoff, a cover typed before the game is kept; a new one only goes into the history.
6. **CSV**: four more columns at the end: market chance %, La Contadora chance %, policy, app version. They come from the bet's saved snapshot and are blank when missing.

## The fix Alonzo asked for
- **What he saw.** Paul George U 23.5 Pts+Reb and Wendell Carter Jr. U 22.5 Pts+Reb were placed on Novig on Tue 11/10 (11:59 AM and 12:01 PM). The app read the fills on Wed 7:25 AM.
- **What went wrong.** The "was this game already played?" check used the read time, not the placed time. So both bets were put on "game unknown · the book's result will grade it" and showed "bet 11/11, 7:25 AM".
- **The fix.** The check now uses the time the book says the bet was placed. Bets put aside this way get their game back once (recorded in the bet's edit history), and the log shows when the bet was placed.
- **The real results** (Novig): Paul George lost ($1.00, he had 41). Wendell Carter Jr. won ($1.71 paid $3.45, he had 19).

## Numbers in the test (by hand)
- Model 42%, market 38%: chance 0.38 + 0.35 × 0.04 = 39.4%.
- EV at 36% = +9.44%, at 37.5% = +5.07%, at 37.7% = +4.51%, at 38% = +3.68%.
- With one logged that day, the best two get $1.00 ("2 of 3", "3 of 3") and the rest get "limit reached".
- Gap: model 58.5%, market 50%, price 49%: chance 52.975%, EV +8.11%. Before v4.68 this was staked; now it is research.
- Two Tuipulotu tickets: profit counts both, calibration counts one point.
- `tests/scope-v468-test.js`: 39 checks. The full suite result is in the PR.

## Not done, on purpose
- **"One a game" for long-shot moneylines is tested only indirectly.** A held moneyline in a game already blocks the other side through the game-line rule, so the long-shot limit is a backstop there.
- **Not built:** a "by price" band, cover_entered_at / calibration_eligible CSV columns, the read-only Worker export.

## Questions for ChatGPT
1. Should "N of 3 used today" also count long-shot moneylines placed by hand at a book that the app never saw (not logged)? It cannot see them now.
2. After about 100 long-shot moneylines at $1, which comparison would you read first: hit rate against La Contadora's chance, or against the price's chance?
