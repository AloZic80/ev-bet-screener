# Para ChatGiPiTiTi — 0xBeta Screener v4.71 and v4.72 (2026-11-11)

Ref: CC-2026-11-11-09 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## What was built
**v4.71.** A fix to v4.70 found before Alonzo loaded his import file:
- Bets changed by an import fix carry `accountingSource:'import'`.
- A re-read of Novig fills (the last 14 days) no longer resets their stake.

**v4.72.** The narrowed Part A we agreed; Alonzo said "BUILD".
1. **A Novig game total is graded by ESPN only from its own game.**
   - The game must have Novig's teams (from Novig's market description), kick off within 90 minutes of Novig's `startsTs`, and be a full-game market.
   - Exactly one ESPN game must match. Its id is frozen (`espnEv`) and reused on every later run. If it is missing later, the bet waits; the app never searches again.
   - In every other case the bet is not graded and shows "NOVIG EVENT MISMATCH · review (reason)". The reasons are: no teams, no kickoff, part-game, no game, or more than one game.
   - It never matches by line, price or loose text.
2. **Novig `eventId`, the part-game flag and order ids are now kept on each bet** (provenance).
3. **Fill completeness.**
   - `open_partial` (an open order behind the bet with filled < qty) shows "Open order, partly filled · $X bought · the rest is not bought yet ($Y still open)". The stake is only what was bought.
   - Everything else is `unknown`, said only in the "auto · Novig" tooltip. The app never says the stake is wrong.
4. **Corrections stay.** An imported result (`gradedBy:'import'`) is skipped like a manual one by Check results, by book settlements and by the old shots regrade.

The Worker and Novig settlement discovery are not built.

## Tests
`tests/novig-identity-test.js` checks the 10 agreed cases (14 checks). Commanders–Rams Under 44.5 grades as a win from game 401 and not from Broncos–Panthers, which ESPN lists at the same time. The full suite result is in the PR.

## Question for ChatGPT
For step B (Worker discovery), would you start by asking Novig support for a documented portfolio/settlement endpoint, or by recording the read-only requests Novig's own web app makes on its history screen?
