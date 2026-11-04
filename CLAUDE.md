# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 8,400 lines).
  `phone.html` only frames `index.html` at phone width (Settings > Layout > Phone on a computer). There is no build step.
- Live at props.0xbeta.dev (see `CNAME`), served by GitHub Pages from `main`; merging a pull request is what deploys (about a minute).
  Claude Code may merge its own pull requests, but only after the owner says go. The Worker is deployed by the owner (`npx wrangler deploy`).
- Who does what (`agent-notes/how-we-work_2026-11-03_v1.md`): Claude Code is the only one that changes the app's code
  (branch, tests, publish on the owner's go). The claude.ai Project's agent keeps the history, researches and writes specs;
  ChatGPT gives second opinions; the owner decides, deploys the Worker and carries notes. Code drafted elsewhere comes in
  as a note to merge and test, never as an upload over `main`.
- Notes for the Project's agent or ChatGPT: the owner copy-pastes them into those chats. Always put the full text in the
  reply as one copy-paste block per note (say where it goes); the `agent-notes/` file is the record.
- Reports: after each step, write one report in `agent-notes/` (`<topic>_<YYYY-MM-DD>_v<N>.md`, header with a `CC-` Ref, times in
  America/Chicago) and give it to the owner, who adds it to the claude.ai Project "Betting-for-Pros" (Project knowledge).
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
- Grading and the 4-hour rule (`evOkFor`): a bet added by hand names its game (picked from the ESPN list, matched by exact
  start time, or typed with a chosen date) and is graded against it even when saved after kickoff. Board bets and exchange
  fills can't name their game, so they keep the rule: a game that started more than 4 hours before the bet was saved is ignored.
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
- The Bet log draws newest first, grouped by game day (`logDays` remembers open/closed days per device). `data-i` on its
  buttons is still the bet's index in `logged`, not its position on screen.
- Look out (`lookOutWhy`): a bet with no result once its game is surely over (`overAfterH`: 5 hours, 8 for fights, 100 for
  golf), a typed game whose day has passed, a `?` result, or a parlay whose day has passed. Its count is on the Bet log tab
  and the Today card. The same finish time drives the log's "over · result pending" label.
- Leagues: `MORE_LEAGUES` (code, name, sport, ESPN path, The Odds API key) feeds `ESPN_MAP`, `SOCCER`, `SPORT_NAMES` and
  `OA_SPORTS`. A league with no ESPN path still loads and can be bet; its result comes from you via Look out. The Odds API
  panel also takes any key typed in, and the Sportsbook API keeps leagues it doesn't know under their own code.
- Pictures on every row (board, Parlays, Bet log: `avatarHtml`, filled in by `avFill`) and on Place these cards: the player's
  photo is FantasyPros by player ID (`r.pid`, also saved with the bet by `addToLog`), else ESPN's headshot only on an exact
  name match on one of the game's two rosters (`espnShotFor`, `avEspn`; rosters saved 3 days in `mbev.rosters`). No exact
  match, no photo: the team logo stays. Team bets show the team logo, game totals both.
- The data sources row (`#srcBar`, `#srcPanel`) is on the main page under the BettingPros bar. Settings keeps the passphrase.
- 🌍 Leagues tab (`lgLeagues`, `lgScan`, `lgPaint`): every league the app knows, plus The Odds API's own list once the Worker
  has `src=oddsapi_sports` (free), and which have games in the next 3 days (ESPN; `src=oddsapi_events` once the Worker has it;
  the Sportsbook API's last load). Saved 30 minutes in `mbev.lgScan`. Load odds uses The Odds API panel's loader.

## Parlays tab (PrizePicks, DraftKings Pick6)
- The math lives in the `pk*` functions (`pkDist`, `pkEV`, `pkBreakEven`, `pkKelly`, `pkEntry`). `tests/parlay-test.js` checks them against
  independent brute force; keep it passing if you touch them.
- Legs come from every prop row on the board that hasn't started, passing or not; the chance is the row's `blendProb`.
  PrizePicks rows come from BettingPros (book id 37, when PrizePicks is ticked under Books you bet). BettingPros has no Pick6.
- Payout defaults are in `PK_DEFAULT`; the owner's edits are saved per device in `mbev.pk`. Pick6 defaults are a copy of
  PrizePicks Power until the owner enters Pick6's own.
- "Best for your bankroll" is the entry with the most log growth at its suggested stake, not the biggest return.
- The Sentinels (`shopExchanges`) end by sending the Parlays tab the props that are not single bets to place (`pkAlone`)
  but clear the per-pick break-even of a 2- to 6-pick entry (`pkSentLegs`, drawn by `pkSentHtml` in `#pkSent`). 4 picks is
  starred as the target; the card there is "★ The Sentinels' 4 picks", not "Best for your bankroll".
- **Get Pick6 lines** (and PrizePicks) calls the Worker's `/src/odds?src=oddsapi_events` and `src=oddsapi_props` (The Odds API,
  region `us_dfs`, JSON passed through unchanged; see `agent-notes/`). Only the games of the best NFL/NBA picks, at most 6 per press,
  4 stats each. A board row at the app's own line is `own`; a different line (`diff`) or a pick the app doesn't offer (`none`) is
  kept out of entries; games not looked up stay `unknown` ("check line").

## Testing
`tests/README.md` has the details. Before pushing:

```bash
node tests/run-all.js
```

It must end with "All tests passed".
For layout or colour changes, also look at `node tests/a11y-report.js` and `node tests/table-width-report.js`.
