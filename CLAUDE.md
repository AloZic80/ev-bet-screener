# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 8,400 lines).
  `phone.html` only frames `index.html` at phone width (Settings > Layout > Phone on a computer). There is no build step.
- Live at props.0xbeta.dev (see `CNAME`), served by GitHub Pages from `main`. The owner merges pull requests; merging is what deploys.
- Prices come through the owner's Cloudflare Worker (`API_BASE`; a separate repo, `~/prop-bet-api` on the owner's Mac,
  deployed with `npx wrangler deploy`). Scores, schedules and grading come from ESPN's public scoreboard (free, no key).
- Everything a user saves lives in their browser's localStorage under `mbev.*` keys (`mbev.log` bet log, `mbev.board`,
  `mbev.theme`, `mbev.layout`, ...), optionally synced to the Worker with a sync password.

## Data sources (behind the Worker unless noted)
| Source | Used for |
|---|---|
| BettingPros | The main board: player props and game lines, projections, cover %, consensus. 50 calls a day. |
| Pinnacle (pinnapi) | Sharp prices: the fair reference with the vig removed. |
| SportsGameOdds | Props and game lines from FanDuel, DraftKings, BetMGM, Caesars, ESPN Bet, Bovada and others. 2,500 games a month on the free plan. |
| Sportsbook API | Its own +EV picks, re-checked by the screener. 1 call per load. |
| The Odds API | Game lines only (moneyline, spreads, totals); exchanges double the cost. Credits. |
| OddsPapi | NFL game totals: Pinnacle no-vig next to Bovada. 1 call per game, monthly allowance. |
| Kalshi, Polymarket US, Novig | The owner's own fills and settlements (read-only): My books, settlement grading, live exchange prices. |
| ESPN (direct, no key) | Scores, live stats, schedules and automatic grading. |

## Working rules
- Never push to `main`. Work on a feature branch and push that. Open a pull request only when the owner asks.
- Change only what was asked, found by exact text. Don't reformat, rename or reorder. Report anything else you notice instead of fixing it.
- Keep the file's style: long one-line records, a `// vX.YY:` comment on lines you change, and new CSS in a versioned block
  (`/* v3.54 ... */`) near the end of the first `<style>` instead of editing old rules.
- A version bump is exactly three places: `SCREENER_VERSION`, `<title>` and `#verTag`. Only when the owner asks.
- Parked decision, don't change it: `evOkFor` ignores a game that started more than 4 hours before the bet was saved,
  so bets added the day after their game aren't graded automatically.
- No new external dependencies, CDNs or build tools.

## Gotchas
- Much of the HTML is built inside single-quoted JavaScript strings. An apostrophe in that text ("it's") ends the string and
  breaks the whole app. Write "it is", or `\'`.
- `addToLog` copies a fixed list of fields into a saved bet. A new field on the row (like `towin`) must be added there too, or
  it's silently dropped. `fee` is only stored when a bet is edited.
- Stat names are shortened on screen only (`shortStat`, e.g. Receptions to Rec). The saved `market` text keeps full names
  because grading and matching read it.
- Team codes are normalised to ESPN's (`normAbbr`, e.g. NYK to NY).
- Grading (`autoGradeLog`) runs on page load and on the refresh buttons, not when a bet is saved.
- Colours: light-mode text greens and amber are AA-checked (`--live`, `--neon`, `--warn`, `--gain`). Run the accessibility
  report after changing colours.

## Testing
`tests/README.md` has the details. Before pushing:

```bash
node tests/run-all.js
```

It must end with "All tests passed". The `INFO real clock` line showing 4 failures is the parked 4-hour check, not a new bug.
For layout or colour changes, also look at `node tests/a11y-report.js` and `node tests/table-width-report.js`.
