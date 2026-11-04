# Tests

Headless-browser tests for `index.html` and `phone.html`. They load the real page, stub the network
(ESPN scoreboards are faked, everything else is blocked), click through the app like a person would,
and check what gets saved. Nothing in this folder is part of the website.

## Run them

First time, on your computer:

```bash
cd tests && npm install && npm run setup
```

Every time:

```bash
cd tests && npm test
```

(`node tests/run-all.js` from the repo root does the same once Playwright is installed.)

## What pass means

`npm test` prints one line per test file and ends with **All tests passed** (exit code 0).
Any `FAIL` line means don't push; the lines under it say which check failed.

The `INFO real clock` line is expected to show `7 passed, 4 failed` for now: a bet saved more than
4 hours after its game started isn't matched to that game (the 4-hour check in `evOkFor`), so it isn't
graded automatically. That decision is parked; the line is shown, not counted.

## The pass/fail tests

| File | What it checks |
|---|---|
| `towin-test.js [tz] [clock]` | Adds CHA @ DET (ESPN stub: 2026-11-02, Detroit wins 112–104), DET moneyline at DraftKings: $1.00 to win $0.99, then $10.00 to win $9.95. Saved date 2026-11-02, saved `towin`, profit = To win, graded WIN after a reload. `run-all` sets the clock to 2026-11-03T02:30:00Z (bet saved during the game). |
| `towin-edit-pct-test.js` | % mode (Cost + To win) saves the slip's real profit; editing a saved bet keeps, replaces or drops To win correctly. |
| `add-bet-test.js` | Bets that already happened (Result: won / lost / push), typed games and teams, American / decimal / % odds, To win on a fee book, Mark PUSH, results surviving a reload, hidden paste tabs, score strip, phone tab bar. |
| `layout-test.js` | Layout toggle: Phone on a computer opens `phone.html` (360 / 390 / 430 frame), Desktop on a phone shows the 1280px layout, Auto, and the way back. |
| `parlay-test.js` | Parlays tab. The math, checked against independent code: Power break-evens equal payout^(-1/n), Flex break-evens are worth exactly 0, 40 random entries match brute force over all 2^n outcomes, Kelly matches a fine search and the textbook formula. Then the tab on a sample board: PrizePicks lines first, one pick per game, best entries, your own entry, logging to the Bet log, Flex, editing payouts, Pick6. |

## Reports (not pass/fail)

| File | What it shows |
|---|---|
| `a11y-report.js` | Accessibility (WCAG 2.1 AA): text contrast in light and dark, names on buttons and inputs, keyboard focus, phone tap targets, reflow at 320px. |
| `overflow-report.js` | Text that runs off its box or makes something scroll sideways, per tab, at 1440 / 1100 / 820 / 390px. |
| `table-width-report.js` | How far each table scrolls sideways at 1440 / 1280 / 1100 / 1024 / 900px. |

`seed.js` is the sample data the reports use: 8 NFL props with long names on the board and in the bet log,
plus one finished NBA bet.
