# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 8,400 lines).
  `phone.html` only frames `index.html` at phone width (Settings > Layout > Phone on a computer). There is no build step.
- Live at props.0xbeta.dev (see `CNAME`), served by GitHub Pages from `main`; merging a pull request is what deploys (about a minute).
  Claude Code may merge its own pull requests, but only after the owner says go. Before each merge ask plainly ("Publish v3.7x to props.0xbeta.dev now?")
  and quote the owner's answer in the report; "build" alone is not a go to publish (agreed 2026-11-04, Ref 2026-11-04-02). The Worker (AloZic80/prop-bet-api, on GitHub since 2026-11-05) deploys itself: merging into its
  `main` runs `.github/workflows/deploy.yml` (route test, then `wrangler deploy`, token in the `CLOUDFARE_API_TOKEN` secret). Same rule: ask before merging.
- Who does what (`agent-notes/how-we-work_2026-11-03_v1.md`): Claude Code is the only one that changes the app's code
  (branch, tests, publish on the owner's go). The claude.ai Project's agent keeps the history, researches and writes specs;
  ChatGPT gives second opinions; the owner decides, deploys the Worker and carries notes. Code drafted elsewhere comes in
  as a note to merge and test, never as an upload over `main`.
- Owner (2026-11-05): "build without my other agent". No relay blocks or reports for the other agents unless the owner asks;
  keep the record in the PR description. Still ask plainly before each publish.
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
- 🔒 Spent (v3.67, `betLocked`): stake on bets settled, sold, or whose game has started (a typed game: its day has passed),
  shown per game day in "Bets by game day" and on the Today card, with the rest as "not started".
- Leagues: `MORE_LEAGUES` (code, name, sport, ESPN path, The Odds API key) feeds `ESPN_MAP`, `SOCCER`, `SPORT_NAMES` and
  `OA_SPORTS`. A league with no ESPN path still loads and can be bet; its result comes from you via Look out. The Odds API
  panel also takes any key typed in, and the Sportsbook API keeps leagues it doesn't know under their own code.
- Pictures on every row (board, Parlays, Bet log: `avatarHtml`, filled in by `avFill`) and on Place these cards: the player's
  photo is FantasyPros by player ID (`r.pid`, also saved with the bet by `addToLog`), else ESPN's headshot only on an exact
  name match on one of the game's two rosters (`espnShotFor`, `avEspn`; rosters saved 3 days in `mbev.rosters`). No exact
  match, no photo: the team logo stays. Team bets show the team logo, game totals both.
- Score ribbon (v3.77, `renderStrip`, `ssFillSel`, `ssMulti`, `ssExtra`): the menu has ⭐ Top events (ESPN's
  `site.web.api.espn.com/apis/personalized/v2/scoreboard/header`, layout undocumented, read defensively; falls back to Live now),
  🔴 Live now (every league, quiet ones skipped via `leQuiet`), every `ESPN_MAP` league by sport, and `SS_EXTRA` (F1, NASCAR,
  IndyCar, golf, tennis, UFC, more): ESPN scoreboards for the ribbon only, kept out of `ESPN_MAP` so grading does not change.
- 🚑 Injury flag (v3.78, `injTagHtml`, `injFill`, `injGet`): a player prop whose player is on ESPN's free `/injuries` list
  (per league, `ESPN_MAP` path) gets OUT / IR / SUSP (red) or DOUBTFUL / QUESTIONABLE / DTD (amber) on the board and Place these,
  ESPN's note on hover. Exact `normName` match only. Kept in `mbev.inj` for 30 minutes (names, status, team, note only).
- 🌬️ Weather tag (v3.79, `wxTagHtml`, `wxFill`, `wxGeo`, `wxHour`): outdoor NFL, NCAAF and MLB games (`WX_SPORTS`; domes by
  ESPN's `venue.indoor` never) get wind (15 mph or gusts 25+), rain or snow (50%+) or cold (32°F or less) at kickoff. ESPN gives
  indoor, the city and its own sky and temperature; Open-Meteo (free, no key) the hourly wind, gusts and rain chance. City
  coordinates kept for good (`mbev.wxGeo`), forecasts 1 hour (`mbev.wx`). If Open-Meteo fails, ESPN's forecast still flags rain, snow, cold.
- The data sources row (`#srcBar`, `#srcPanel`) is on the main page under the BettingPros bar. Settings keeps the passphrase.
- 🌍 Leagues tab (`lgLeagues`, `lgScan`, `lgPaint`): every league the app knows, plus The Odds API's own list once the Worker
  has `src=oddsapi_sports` (free), and which have games in the next 3 days (ESPN; `src=oddsapi_events` once the Worker has it;
  the Sportsbook API's last load). Saved 30 minutes in `mbev.lgScan`. Load odds uses The Odds API panel's loader.
- 🔴 Live edges (v3.71, `leScan`, `lePaint`, top of the Live tab): games in progress only. The fair price is ESPN's live win
  chance (`liveGameProbs`), because the board's model is pre-game; prices are Kalshi, Polymarket US and Novig through the Worker's
  `/live` (moneylines, ids `le:<event>:<team>:<exchange>`). Flagged only with `LE_MIN` (3%) edge after the fee (`feeRate(..., live)`),
  a chance of 8-92%, and a price within `LE_GAP` (10 points, v3.72; was 25) of ESPN's. Shows "pay at most" (`leMaxPay`). Repeats with
  Auto-refresh, 30 s at most. v3.72: `leSeen` remembers per game when ESPN's number last changed and when the game last moved
  (period, score, clock, last play); edges are hidden once ESPN is unchanged for `LE_STALE` (2 min) while the game moved
  (`leRunning`: not halftime, end of period or a delay). Each game shows "ESPN changed N ago".
  v3.74: Pinnacle live (`lePinnId`, `lePinnML`, `leTeamHit`): the Worker's `/pinnapi/live?sport_id=N` (note in
  `agent-notes/worker-pinnapi-live_2026-11-04_v1.md`; not deployed yet) passes pinnapi's `/kit/v1/markets?event_type=live`.
  When it answers, Pinnacle's no-vig moneyline is the fair price and ESPN must agree (a plus after the fee); a 404 means
  "not on your Worker yet" and ESPN alone is used. The response layout is from pinnapi's docs, not yet seen live.
  v3.76: every team league in `ESPN_MAP` (`LE_TEAM`: football, basketball, hockey, baseball, soccer); a league with nothing live
  is skipped for `LE_QUIET` (10 min); up to `LE_MAXG` (30) games. A game ESPN has no win chance for (often soccer) is priced by
  Pinnacle alone. pinnapi's trial is 100 requests a day: Pinnacle live is asked only on a Scan press (`leScan(true)`), at most
  `LE_PINN_DAY` (40) a day per device (`mbev.lePinn`); Auto-refresh reuses the last answer until it is a minute old, then ESPN.

## Parlays tab (PrizePicks, DraftKings Pick6)
- The math lives in the `pk*` functions (`pkDist`, `pkEV`, `pkBreakEven`, `pkKelly`, `pkEntry`). `tests/parlay-test.js` checks them against
  independent brute force; keep it passing if you touch them.
- Legs come from every prop row on the board that hasn't started, passing or not; the chance is the row's `blendProb`.
  PrizePicks rows come from BettingPros (book id 37, when PrizePicks is ticked under Books you bet). BettingPros has no Pick6.
- Payout defaults are in `PK_DEFAULT`; the owner's edits are saved per device in `mbev.pk`. Pick6 defaults are a copy of
  PrizePicks Power until the owner enters Pick6's own.
- "Best for your bankroll" is the entry with the most log growth at its suggested stake, not the biggest return.
- The Sentinels (`shopExchanges`) end by sending the Parlays tab every prop that clears the per-pick break-even of a 2- to
  6-pick entry, good alone or not (v3.62: good-alone ones, `pkAlone`, are marked "✓ good alone too") (`pkSentLegs`, drawn by `pkSentHtml` in `#pkSent`). The ring on the fits circles (2 3 4 5 6) follows the
  size picked (`pkState.sentN`, v3.70); picks that fit it come first, and "↓ See the best N-pick entry" jumps to its card. 4 picks is
  starred as the target; the card there is "★ The Sentinels' 4 picks", not "Best for your bankroll".
- Apps (v3.59): `PK_APPS`, ticked ones in `pkState.apps`. Pick'em apps (PrizePicks, Pick6, Underdog, Sleeper) use payout
  tables (Underdog and Sleeper start as copies of PrizePicks'). Combo apps (`PK_PRICED`: Kalshi, Novig, Polymarket US, DK and
  FD Predictions, Fliff, Bovada…) use `pkLegsPriced`: only legs that app offers, paying the legs' odds multiplied with the
  fee off each (`pkArr`). Promos on Your entry: a discounted line (`pkState.adj`, chance from the projection by `pkDiscP`,
  or typed) and a boost (`pkState.boost`, what all-hit pays). The Sentinels' size is `pkState.sentN` (4 by default).
- More books (v3.68), names from OpticOdds' public list (their IDs only work with their paid API): pick'em Dabble, Betr Picks,
  ParlayPlay (PrizePicks payouts to start); combos Underdog Predict, Robinhood, Gemini, Fanatics Markets, Webull, Crypto.com;
  in `BET_BOOKS` and `BOOK_CHOICES` also Circa Sports, BookMaker, BetOnline, LowVig, Heritage, BetUS, PS3838 and others.
- Ready-made slips (v3.61, `pkSlipsHtml`): size buttons 2-Leg to 6-Leg (`pkState.slipN`, 4 by default); the best slips by
  bankroll growth from the playable picks, up to 5. One player per slip; across slips a player can repeat unless
  `pkState.slipRepeat` is false. Works for pick'em and combo apps.
- No home-run slips (v3.64): a combo leg must pass `pkComboOk`: an edge after fees, at least `pkState.minPC` likely (20%),
  and with "Only good bets" (`pkState.goodOnly`, on by default) good alone, an outlier, a small-risk bet or +EV alone (its
  `tag`). Combo slips must hit at least `pkState.slipMinHit` (5%). Slips rank most likely to win first (`pkState.slipRank`).
  Careful when editing these long lines: a `//` comment placed mid-line silently comments out the rest of the line.
- Recommended thresholds (v3.66, `pkRec`, `pkApplyRec`): choosing the app or the slip size sets them. Pick'em: picks from
  the size's break-even + 1 point, rounded to 0.5 (PrizePicks Power 4-Leg 57%). Combos: each pick 40%, slip hits 20/10/5/3/2%
  for 2-6 legs. The note `#pkRec` says what is recommended and offers "use it" after the owner types their own.
- Every leg shows where it plays (`pkWhere`: sport · team · game · time) on the Sentinels' list, slip cards and the pick list.
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
