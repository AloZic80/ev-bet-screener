# 👀 Watch list: 0xBeta Screener, live beta

Ref: CC-2026-11-11-08 · Wed 2026-11-11, updated late evening, America/Chicago · Live: **v4.77**, v4.78 in testing

Alonzo: "we will say OK Lets put IT LIVE, but, we still need to be on top of it."
**Live beta** means: live and usable, still a work in progress. Every change still goes through El Juez (all tests green) before it goes live. This page lists what is open; it is updated with every build.

## ⏳ Waiting on El Jefe (a word from you)
- [ ] **🍀 Near-misses: A, B or C?**
  - A: hide them, only YES bets on the board;
  - B: list them in their own band's tab, as "🍀 Just missed · NO";
  - C: leave them as they are.
- [ ] **Worker v3.43:** say "merge the Worker". It finds Kalshi games by team names when the codes don't match (the Oklahoma State case). PR: AloZic80/prop-bet-api#6.
- [ ] **Javiera's names** for the crew. Code word: "Frijolito".

## 🤖 Waiting on ChatGiPiTiTi (tomorrow)
- [ ] Should ⏱ Old prices also stop counting toward the **daily max** until re-checked? This is a stake rule, so nothing is built until you both agree.
- [ ] Is **12 hours** the right line for ⏱ Old?
- [ ] Should the **cover chip** follow La Contadora's chance, like the tabs do?
- [ ] Should Live Games **save** the game it finds for a bet that came without one?
- [ ] The CSV "mode" column, swap cards with NO OFFER, and Part B (the Worker's completeness flag). These are older questions.

## 🔍 The v4.78 polish build (in testing): the items below are fixed in it, except the cover chip (Sally's question)
The full review (Los Chismosos, each finding challenged by Los Desconfiados) is in: **21 confirmed, 3 refuted**. Most were fixed in v4.77. Still open, all labels, listing or Live Games (no stake, no grade):
- [ ] **⏱ Old, unknown read time:** a price whose read time is "unknown" (some cached answers) never reaches ⏱ Old. Fix: count it from the board load time.
- [ ] **⏱ Old, page left open:** a card that turns 12 hours old waits for the next redraw to move. Fix: the 30-second check also moves it.
- [ ] **"No more today":** when the day's 5 near-misses (or 3 Hail Marys) are used and an approved Coin Flip (or long shot) is on the board, the header says "none just missed" instead of "No more today".
- [ ] **Live Games:** a game found by the player is never re-checked. Fix: check it again on each pass, and let it go if a second game lists the same name before the final.
- [ ] **The Game Hub cards** ("N bets risking $X"), "Your bets in this game" and the scores strip still find a bet's game by team codes only. A Novig player bet found by its player is missing there.
- [ ] **On a pasted sportsbook board**, ⏱ Old says "press the Sentinels or reload", but only pasting the board again refreshes those prices. Each card's ⏱ tooltip already says so.
- [ ] Wording: Suertudo's La Contadora line ("A few that just missed") and its empty-tab text still describe only the near-misses, not the Coin Flips.
- [ ] (For ChatGiPiTiTi, above) the cover chip shows the model's chance while the tab and header use La Contadora's.

## 🔍 Still open after v4.78
- [ ] Grading, before v4.76: a prop with no teams is graded from the first finished game that lists the player, with no check for a second game with the same name. Live Games now refuses to guess. Question 8 for Sally.

## 🗓️ Planned
- [ ] **Weekend:** the live crew progress page (original animated crew, a progress bar per job).

## ✅ Done tonight
- v4.76: five tabs by chance; YES/NO said outright; Live Games finds Novig bets by the player; a grading bug fixed (mid-game box score); "N in the tabs".
- v4.77: ⏱ Old tab; the big number = bets you can place now; review fixes (Suertudo count, empty Machín, same-name players, NFL late listing).
