# For the Project agent: check the rebuild into Augi's screens (v4.34 to v4.38)

Ref: CC-2026-11-09-15 · Written by Claude Code, Mon 2026-11-09, America/Chicago · For: the claude.ai Project "Betting-for-Pros"
No passwords, keys or Worker secrets are in this note. Please do not ask for them.

## What was agreed
Alonzo liked Augi's Odds Board look (AugiM13/screener, `odds-board.html`) but wanted to keep our math and settings. Option 2 was chosen: rebuild our app into his five screens, one step at a time, on our engine. All five steps are now live at props.0xbeta.dev. Each one passed `node tests/run-all.js` and was published under Alonzo's rule "Always publish if it passes".

## Please check each step against the live app

| Step | Version | Augi's feature | What ours does | Test file |
|---|---|---|---|---|
| 1 Board | v4.34 | Show filter, cover legend, notes per line | Show: All / Passing / Outliers / Already bet / Skipped. The nine-band cover legend is in a drop-down. 📝 note on every card and row, kept on the device. | board-notes-test.js |
| 2 Live Games | v4.35 | Game Hub: games by sport, gamecast, line | Scheduled / Live / Final, "N bets risking $x", ESPN line with the vig removed, last plays, your bets, the board's props for that game with BET / ALREADY BET / STARTED / skip. ESPN only, no paid calls. | game-hub-test.js |
| 3 Bet log | v4.36 | Bet calendar, day summary, goal, cover breakdown, track by, import | Calendar by game day (settled profit only; open bets grey). Tap a day for its summary and the daily max bar. Cover bands. Daily / Weekly / Monthly table with ROI on settled bets. Import of his augi-bet-import v1 JSON, checked ticket by ticket. | bet-calendar-test.js |
| 4 Parlay | v4.37 | Slip draft, Copy draft, flex partial return | Every entry card shows each finish in $ with its exact chance (flex partial return), plus Copy draft as plain text. Copying never logs or places. | parlay-draft-test.js |
| 5 Settings | v4.38 | Connect + test, API credits page, rules grid | Connect with a free test (Worker `/src/status`, no provider called; 401 = wrong passphrase). A credits card per source. Every rule in one card, updated live. | settings-connect-test.js |

Also from Augi: his five tabs and green look (v4.29), the bottom bar (v4.30), cover bands and the Bet result study (v4.31). Extras: colour schemes (v4.33) and Custom colours from a wheel or grid (v4.37).

## Where ours differs from Augi's on purpose (please confirm these are right)
1. **Units:** EV is shown as a percent (+3.0%), never as 0.03 or 3.0 without the sign. His 11% vs 0.11% mix-up is the reason.
2. **Bets are grouped by game day, not the day placed.** The calendar, Track by and the daily max all count the day the game is played (Central time). His calendar uses the day placed.
3. **Only settled bets win or lose.** A game not started is "to play" and a game going on is "in play", both grey. His Pending is the same idea.
4. **His daily goal is a bet count; ours is the daily max in dollars** (10% of bankroll), shown as a bar, with the Hard stop asking before you go past it.
5. **Odds API credits:** his Game Hub spends credits per game; ours reads the board already loaded and spends nothing.
6. **Parlay legs are not graded one by one.** That is why his "parlay legs" study view is not in ours. A parlay is graded by "how many hit".
7. **No passphrase or key is ever shown.** Connect shows only whether one is saved.

## What I would like you to check
- [ ] Each row of the table matches what you see on props.0xbeta.dev (phone and computer).
- [ ] Anything Augi's `odds-board.html` has that is missing above (not his Worker keys or URL).
- [ ] That the "on purpose" differences are what Alonzo wants, especially 2 (game day) and 4 (dollars, not a bet count).
- [ ] The math on one example by hand: PrizePicks Flex, 4 picks at 61%, 60%, 59% and 58.5%, $5 stake. The app says all hit $25.00 12.6%, 3 of 4 $7.50 34.2%, less $0 53.1%, expected return +14.5%.
- [ ] Send findings back to Alonzo as a short list; Claude Code makes any changes.
