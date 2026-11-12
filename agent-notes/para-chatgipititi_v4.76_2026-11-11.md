# Para ChatGiPiTiTi — 0xBeta Screener v4.76 (2026-11-11)

Ref: CC-2026-11-11-03 · Written by Claude Code, Wed 2026-11-11, evening, America/Chicago. No keys or passwords in it.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. It finds bets with an edge. La Contadora is the conservative chance,
min(model, market + 0.35 × (model − market)), and its EV after fees decides everything. It sizes the stake, says what to type at the book, and tracks
results honestly. Prices come through Alonzo's Cloudflare Worker; scores and grading come from ESPN.

## What Alonzo asked, and what was built (listing, labels and Live Games; no floor, fee, Kelly, cap or stake changed)
1. **Five tabs, highest chance first** (his words: "Boring, Volado, Machín, Suertudo, Brujo", "only 5 tabs. start with boring and end with Brujo", then his
   cover-band list: "WE are going to add all those, inside those 5 Tabs"). An approved bet goes by La Contadora's chance:
   - 😴 Boring: 75%+, High Cover and Heavy Favorite;
   - 💪 Machín: 60–75%, Strong, Solid and Lean; the app opens here; it was 🛡️ Safe;
   - 🪙 Volado: 50–60%, Slight Lean and On the Line;
   - 🍀 Suertudo: 45–50%, Coin Flip, plus the near-misses; it was Feeling Lucky;
   - 🔮 Brujo: under 45%, Unlikely, plus the Hail Marys; it was Clairvoyant.

   Inside each tab, Place these is grouped under a header per band, highest first.
2. **YES / NO, said outright.** He asked: "what the hell does, JUST MISSED floor by blah blah. Like, Do i Still Bet or not?"
   - Place these now says "✅ La Contadora: YES. The math says bet every card here."
   - A near-miss card says "🍀 La Contadora: NO · just under your floor (+0.8% vs your 1.5%) · optional, smallest bet". The same words appear in its decision, in the 🍀 header and in the table group.
   - Example: model 50%, market 45% → La Contadora 45 + 0.35 × 5 = 46.75%. At a price of 46.38% her EV is 46.75 / 46.38 − 1 = +0.80%, under the 1.5% floor but not below 0%.
3. **Live Games found the game.** He saw "Game not found on ESPN · Not started" for AJ Dybantsa Under 23.5 Pts+Reb (Novig, −104, $2.61) while ESPN showed WSH 101 – IND 114 in the 4th.
   - **Cause.** Novig describes a player prop only as "<player> <line> <stat>", with no teams. The fill was saved without its game, and Live Games looked only by team codes. Grading was fine: after the final it finds the box score that lists the player.
   - **Fix.** Live Games now looks the same way while the game is on:
     - games of that sport, in progress or final;
     - starting within 90 minutes of Novig's start time;
     - inside the 4-hour rule;
     - whose box score lists the player.
   - **Matching.** Exactly one game, or nothing. It is remembered for the session only, and the saved bet is not changed. Bets with no game are no longer lumped into one list, and the status says "Game not known yet" instead of "Not started".
4. **Found while testing 3, and fixed: Live Games could settle a prop from a box score read mid-game.**
   - When a game went final, Live Games settled props from the last box score it had cached, possibly from before the final minute.
   - Test: Siakam Over 27.5. The cached mid-game copy said 20 points and the bet was marked **lost**; the final was 28, a **win**.
   - Fix: a final game now reads ESPN's final box score (as every other grader already did) and settles only when that box score says final. Otherwise "Check results" grades it later.
5. **"72 pass" vs the tabs (6 + 1 + 27).** He asked twice. The header counts every approved bet. The tabs count only what he can bet now, under his filters and book chips, and they add the extras offered (near-misses, Hail Marys), which are not approved.
   - New: "N in the tabs ▸" next to the header. It lists where each approved bet is, under the first reason it is not in a tab: in games that started, already bet, can't confirm the game on ESPN, $0 stake, filters, book chips, the same bet twice, the other board.
   - The lines add up to the header. It counts only; nothing is moved or staked by it.
   - It also says what else the tab buttons count, for example "1 🔮 Hail Mary offered to you: not approved, so not in the 8".
   - His Settings show every book on, but **"No DFS pick'em" is checked**, so PrizePicks, Underdog, Sleeper, Dabble, Betr Picks and ParlayPlay rows are rejected (they count as skipped, not approved).

## Next (his request, after this release): v4.77 "⏱ Old prices"
His words: "put the older bets in another category. or Tab in itself. If sentinels takes them out of jail, then good. but, lets not mix them with our regular tabs."
- A sixth tab after Brujo holds any card whose price was read more than 12 hours ago, from any tab.
- A Sentinels press or a reload that reads a fresh price sends the card back to its tab.
- Bets he already placed stay where they are.
- Listing only.

## Still waiting
- Worker v3.43 (Kalshi games found by team names when the codes differ, e.g. Oklahoma State): the PR is open and waits for his go.

## Tests
- New: `tests/tabs-v476-test.js` (26 checks), `tests/live-player-test.js` (14), `tests/pass-where-test.js` (14).
- The new tests failed on the old file where they should: Live Games 9 checks; the mid-game settle reproduced.
- 27 older test files were updated only for the tab split. Each test now opens the tab its sample bet belongs in; no check was removed or loosened.
- The full suite result is in the PR.

## Questions for ChatGPT
1. **Old prices and the daily max.** Should a card in "⏱ Old prices" also stop counting toward the daily max until it is re-checked? A 5-day-old price can look like a big edge (Oklahoma State: 49¢ shown, 61¢ real), sit at the top of the list and take money from fresh bets. That is a stake rule, so nothing is built until you agree and Alonzo says build.
2. **12 hours.** Is 12 hours the right line? The ⏱ pill turns amber at 30 minutes. A shorter line would push morning boards into Old prices by evening and cost BettingPros calls (50 a day) to reload.
3. **The cover chip.** It shows the model's cover % (since v4.31, as BettingPros does), while the tabs and band headers use La Contadora's chance. So a near-miss in 🍀 Suertudo (La Contadora 46.75%, Coin Flip) shows an "On the Line" chip (model 50%). Should the chip follow La Contadora, show both, or stay?
4. **Live Games.** Should the game found by the player be saved on the bet (its game, ESPN id), so the Bet log and ALREADY BET can use it? As built, it is kept for the session only.
