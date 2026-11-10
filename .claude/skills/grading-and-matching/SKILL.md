---
name: grading-and-matching
description: Use when changing how a bet is graded, how a book fill or order is matched to a board row or logged bet, ALREADY BET, same player or same game checks, or the 4-hour rule.
---

# Grading and matching

## Before editing
Read `memory/incidents/recurring-bugs.md` (the already-bet and regrade rows) and search `memory/history.md` for the function you are touching.

## Rules that must hold
- A bet the owner placed must never stay bettable on the board. When in doubt, mark it ALREADY BET.
- Matching goes from exact to loose: fill ref and side, `coreKey`, `propSame` (accents, initials, stat family, "N+" = Over N−0.5), `glTeamSame` (team codes), then `fillPriorFor`. All with `sameTime` (same game day or within 6 hours).
- Different known teams never match. First names must agree (an initial, or one the start of the other).
- Never clear a saved result to force a regrade. Grade first; replace only when the new grade exists. A result set by hand (`gradedBy:'manual'`, `mbev.grades`) is never overwritten.
- The 4-hour rule (`evOkFor`): board bets and fills ignore a game that started over 4 hours before the bet; a bet that names its game (`manual`, `dateSet`, a fill with its start) is graded against that game.
- Exchange integrations are read-only.
- Each fill and each bet is handled in its own `try`: one failure must not stop the others, and a failed read must be said on screen (`renderFillWarn`).

## How to work
1. Reproduce with the owner's real wording in a test (the book's text against the board's text).
2. The test must fail on the current file.
3. Check ESPN quirks against the fixtures in `tests/fixtures-*.json` (NHL shots are column `S`, not `SOG`).
4. Run `fill-prior`, `prop-prior`, `novig-plus`, `same-player`, `grading`, `check-results`, then the full suite.
