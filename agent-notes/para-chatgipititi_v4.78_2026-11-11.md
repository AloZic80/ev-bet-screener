# Para ChatGiPiTiTi (Sally) — 0xBeta Screener v4.78 (2026-11-11)

Ref: CC-2026-11-11-09 · Written by Claude Code, Wed 2026-11-11, late evening, America/Chicago. No keys or passwords in it.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. La Contadora (now named Doña Petra, after Alonzo's grandmother) is the conservative chance,
min(model, market + 0.35 × (model − market)), and its EV after fees decides everything. The app sizes the stake, says what to type at the book, and
tracks results honestly.

## What Alonzo asked
"DO iT BUILD", after independent reviewers (Los Chismosos) read v4.76 and v4.77 and skeptics (Los Desconfiados) tried to refute each finding. That left
21 confirmed findings; v4.77 fixed most of them, and v4.78 fixes what was left. Labels, listing and Live Games only: no floor, fee, Kelly, cap,
stake or grading rule changed.

## What was built
1. **⏱ Old (prices read more than 12 hours ago):**
   - A price read at an unknown time (some cached answers) now counts from when the board was loaded. Before, it could never become old.
   - With the page left open, a card that turns 12 hours old moves to ⏱ Old within 30 seconds, without a tap.
   - On a pasted board the words now add "or paste it again". The Sentinels cannot refresh a pasted sportsbook price.
2. **"No more today"** (the day's 5 near-misses or 3 Hail Marys are used) is decided by the extras alone. An approved Coin Flip or long shot on the board no longer hides it.
3. **Live Games** (the game found by the player for a Novig prop that names no teams):
   - It is checked again on every pass, and let go as soon as a second game lists a player with the same name. No guess.
   - The Game Hub cards ("N bets risking $X"), its "your bets in this game" list and the scores strip now count that bet too.
4. **🍀 Suertudo's words** now mention the Coin Flips it lists (45–50%, approved), not only the near-misses.

## Tests
- `old-prices` (20: unknown read time, page left open, pasted-board words), `live-player` (25: the re-check, the Game Hub count), `tabs-v476` (29: "No more today").
- `modes-perfecta` follows the new Suertudo text.
- The full suite result is in the PR. The reviewers read the v4.78 diff again before publishing.

## Questions still waiting for you (from the "Since you've been gone" note)
1. Should ⏱ Old prices stop counting toward the daily max until re-checked? This is a stake rule: nothing is built until you agree and Alonzo says build.
2. Is 12 hours the right line?
3. Should the cover chip on each card follow La Contadora's chance, like the tabs and band headers do, instead of the model's?
4. Should a game found by the player be saved on the bet?
5. Grading, before v4.76: `findBetGame` grades a prop with no teams by the first finished game whose box score lists the player. It does not check whether two games list the same name. Live Games now refuses to guess in that case. Should grading also refuse, and wait for Alonzo, when two games list the name?
