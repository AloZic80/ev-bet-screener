# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 8,400 lines).
  `phone.html` only frames `index.html` at phone width (Settings > Layout > Phone on a computer). There is no build step.
- Live at props.0xbeta.dev (see `CNAME`), served by GitHub Pages from `main`; merging a pull request is what deploys (about a minute).
  Claude Code may merge its own pull requests, but only after the owner says go. Before each merge ask plainly ("Publish v3.7x to props.0xbeta.dev now?")
  and quote the owner's answer in the report; "build" alone is not a go to publish (agreed 2026-11-04, Ref 2026-11-04-02).
  Owner, 2026-11-05: "Publish if they pass. Always publish if it passes." So for the app: when `node tests/run-all.js` ends
  "All tests passed", merge and publish without asking, and say so in the PR and the reply. Any failing test: do not publish, report it. The Worker (AloZic80/prop-bet-api, on GitHub since 2026-11-05) deploys itself: merging into its
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

## The end game (owner, 2026-11-07)
- For now a personal app for Alonzo and Augi. They love the math; keep replies about building, not advice.
- Later, possibly an app for other people who may not know sports or betting at all. They only need to know a bet has an
  **edge** (+EV): like flipping a coin at a price better than its true chance, many times. Any one bet can lose, and it is never
  always a profit, but over enough bets the math says it is. So every change should keep it simple to follow:
  find the edge (La Contadora), size the stake, say exactly what to type at the book (like the Kalshi strip), and track results
  honestly (only settled bets win or lose; the Scorecard's 1,000-bet test shows whether the edge is real or luck so far).
- Legal advice will be asked for before it is offered to anyone else.

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
- Saving the bet log (v3.82, `saveLog` → `lsSafeSet`): if the browser storage is full, the app's caches (`LS_CACHES`: rosters, injuries,
  weather, league scan, quotes, logos) are dropped to make room; if it still fails, a red `#saveFail` note shows. Never swallow a log save error.
  v3.83: `saveFills` (From your books: Add, Ignore) saves the same way.
- From your books › Add (v3.87, `addFromFill`, `abFromFill`): opens the + Add a bet tab (`v-add`) filled in from the fill; the fill stays
  listed until Save bet, which links it (`linkFill`, `fillSeen` 'added') and removes it. Before, it switched to the Board tab and dropped the fill.
- Book fills (v3.89): a fill that matches no logged bet and no board row is still logged on its own when the book describes it
  (`fillDescOk`, `autoAddFromDesc`: player, stat, line, side, or team and line; price, cost, kickoff). Only undescribed ones wait in From
  your books. Ignore is also kept by fingerprint (`fillIgnored`, `fillPrint`, `mbev.fillIgnored`) and filtered on every render, so a
  re-read, a `fillV` reset or a new fill id cannot bring it back. Add saves in one tap when the form is complete (`addFromFill`).
- v3.90: fills already waiting go through the same steps on every check (`pendingAutoAdd`); each fill in `syncFills` is in its own try,
  so one that fails cannot stop the others (its error shows as "could not log it"). My books has + Add on each not-logged row (`.mb-add`)
  and a reason line (`fillWhyNot`).
- v3.91: + Add (My books and From your books, `addFillNow`) logs a described fill in one tap; the form opens only when the book did not
  say what the bet is. A fill marked added or linked whose bet is not in the log is logged again on the next check (`fillLost`),
  unless you removed that bet by hand (it is in `removedBets` with that fill id).
- Save in the bet editor (v3.89, `ebSay`): a second-press check (worse than fair, a limit) or a missing field shows an amber `.eb-warn`
  box and the button reads "Save bet anyway".
- `addToLog` copies a fixed list of fields into a saved bet. A new field on the row (like `towin`) must be added there too, or
  it's silently dropped. `fee` is only stored when a bet is edited.
- Stat names are shortened on screen only (`shortStat`, e.g. Receptions to Rec). The saved `market` text keeps full names
  because grading and matching read it.
- Team codes are normalised to ESPN's (`normAbbr`, e.g. NYK to NY).
- Grading (`autoGradeLog`) runs on page load and on the refresh buttons, not when a bet is saved.
  The Check results button (`checkResultsRun`, also Look out's "Check results again") skips `gradedBy==='manual'` bets and keeps a
  win/loss/push when ESPN cannot grade it (v3.84); before, it overwrote them with `?` and they went back to Look out.
  v3.93: every result you set (Look out, editor, + Add a bet) is also kept in `mbev.grades` (synced, `SYNC_SETS.grades`) by bet id and by
  `gradeKey` (name, market, side, game day). `gradesReapply` (run by `renderLookOut`) puts it back on a bet with no result: same id or a
  twin. Clear in the editor forgets it (`gradeRemember`). Call `gradeRemember(b)` wherever a new manual result is set.
- v3.94: `statForMarket` NHL and MLS check shots before goals ("Shots On Goal" was graded as goals). ESPN's NHL `SOG` column is always 0;
  shots on goal are `S`. NHL/MLS shots bets graded by ESPN the old way are graded again once (`fixSog94`). Real box score in
  `tests/fixtures-nhl-2026-11-05.json`. Ignore also counts `fillSeen` 'ignored' (synced) and `mbev.fillIgnored` is in `SYNC_SETS`.
  v3.95: v3.94 cleared shots bets of every age but `autoGradeLog` only grades the last 4 days, so older ones went to Look out (30 on
  Alonzo's phone). `redo94` grades every `fixSog94` bet without a result, whatever its age; only "Shots On Goal" markets are cleared.
  Lesson: never clear saved results to force a regrade; grade first and replace only when the new grade exists.
- v3.96: `autoGradeLog` also grades every Look out bet from the last 30 days (`redo94`), and each bet is in its own try. Bets from your
  books keep `placedAt` (the fill's time, `notePlaced`) and `evOkFor` counts the 4-hour rule from it; a bet whose book gave the start
  time (`autoFrom` + `start`) matches that exact game. Before, a fill read after 10 PM made a 6 PM game "too early" (Dorofeyev 11/5).
  Real NFL box score in `tests/fixtures-nfl-2026-11-01.json`.
  v3.97: `evOkFor` also accepts a game played on the bet's set game day (`dateSet` + `date`), whoever set it: Saquon 11/1 was logged
  from the Novig fill on 11/5 (not `manual`), so the 4-hour rule from the save time hid its game.
- Real money (v3.98, edit editor `.eb-money`): Got back $ (stake included) and Winnings $ (stake not included) fill each other in; saved
  as `towin` (the profit) with `paidReal` (a boost or what the book really paid), kept when stake or odds change. Lost $ → `lostAmt`
  (only when it differs from the stake). 🎁 Free bet → `free`: `betProfit` counts a loss as $0 and a win as winnings only; free stakes
  are not money staked (Today card, `dayStats`, Performance ROI `_st`). Performance profit and ROI never include the returned stake.
  v4.03: the 🎁 tick saves at once (`.eb-free`, and `.pl-free` in the parlay editor); `ebMoneyApply` is used by Save changes and by
  Mark WIN / LOSS / PUSH (Mark LOSS used to close the editor without the tick). A free parlay that wins counts payout − stake (the
  stake does not come back), one that misses $0. `tests/free-bet-test.js`.
- Today card (v3.98, `renderTodayBar`): per day and per book: money staked (free bets apart, 🎁), bets, ✓ played · ▶ playing · ⏳ to play,
  won $ vs lost $, ▶ money at risk, ⏳ money not started. `heldValue` (owner, 2026-11-05, replacing the v3.08 rule): a game not started
  and a free bet count $0, not as lost; once the game starts the stake counts as gone until it wins. Worst = won − lost − money playing.
  v3.99: on a computer the tiles had `white-space:nowrap` (old `.tb-t` rule), so the longer lines ran into the next tile; they wrap now.
  Owner, 2026-11-06: "what you make for Phone mode also needs to look right in web browser mode". Check every layout change at
  phone (390) and computer widths (1000, 1280, 1960); `tests/money-test.js` checks the Today card at all four.
- IN PLAY (v4.07, owner: "do not say lost, say IN PLAY and put it in grey, unless I already lost it"): `heldValue` counts a bet whose
  game is playing as $0 (`d` = its stake in play); only settled bets are won or lost (replaces the v3.08/v3.98 "counts as gone" rule).
  Today card: the pill is settled only (UP / DOWN), with a grey `.tb-pill.inplay` "IN PLAY $x"; worst (if everything playing loses) is
  grey. Calendar: a day's colour and W/L come from settled bets only, with grey "▶ $x in play" and "⏳ $y to play" lines (`playingAmt`);
  best/worst day and the chart use settled days only. Bets by game day: "$x in play" in grey.
  v4.08 (owner: "worst is only REAL DATA", "a BEST DAY EVER and vice versa"): the calendar footer shows this month's best and worst
  settled day with their dates, and "Ever: best · worst" over the whole log. On a phone the day boxes drop the $ (`.cal-cur`) so
  +20.88 fits. `tests/cal-worst-test.js` is Alonzo's November (Fri 11/6 in play: grey, not the worst day).
- Performance calendar (v4.00, `calDays`, `renderCal`): money on games not started is grey (`.cal-tp`, `toPlayAmt`), never green or red;
  a day with only unstarted games is a grey amount (`.cal-c.tp`) and is not a best or worst day. ▶ marks games playing (hidden on a phone).
- Today card days (v4.01, `tbDay`, `.tb-day`): ‹ › step a day back or forward and "Today" comes back; the label shows the day
  ("WED, 11/4"). `tbDay` null means today and follows the clock past midnight. The arrows stop the click that opens the Bet log.
- Book slips on a phone (v4.04, `slipReady`, `#slipGo`): an iPhone opens a book's app (Novig `novigapp://`, Kalshi, Polymarket, DraftKings)
  only from a tap on the link itself, never from a tab the page opened and pointed there after an `await`. So on a phone the logo (or book name) tap
  fetches the slip, then shows a bar with a real "Open in Novig ›" link (and the website for Novig). Kalshi, Polymarket US, DraftKings
  and PrizePicks (`BOOK_HOME.pp`, v4.04) the same; DraftKings and PrizePicks have no prefilled slip. The Mac keeps the side window.
- Books you can't bet (v4.05, `swapBooks` in `auditCore`, `swapHunt` after each `refresh`): owner is in Texas (no DraftKings / FanDuel
  sportsbooks). A row at a book not in "Books you bet" takes the same bet at your best book: another board row (same `coreKey` and game,
  e.g. Bovada from SportsGameOdds → the unbettable row hides, `swapHid`) or a live Kalshi / Polymarket US / Novig price (`r._altQ`,
  fetched once per row) → the row moves there (`r.swap.orig` keeps the original, restored before every audit) and is screened at that
  price. No price anywhere: stays "not a book you bet". The Sentinels never let a book you do not bet win. BettingPros has DraftKings
  Predictions (book 74) and Underdog Predict (76): requested when those are in your books; it has no FanDuel Predicts.
- What to type on Kalshi (v4.09, `kalshiHow`, `kalshiHowHtml`, `.kx-how` strip across a Kalshi card): owner typed the card's $1.62 into
  Kalshi's Shares box and bought $0.88. The strip says, in Kalshi's words: 1 Press YES / NO (an Under is NO on the Over), 2 Shares
  = stake ÷ (limit + Kalshi fee), 3 Limit price = La Contadora's `maxPriceFor` in whole cents rounded down, then check Cost ≈ stake and
  Max payout = shares × $1. Not shown when the price is over her limit. "I bet this" on Kalshi labels the % fields Price ¢ / Max payout $.
  Owner: the same for every book next (he will say which); Bovada stays manual until there is money for an API.
- The price as a % (v4.10, `impTagHtml`, `.imp`; owner: "+230, what does that mean in %?"): under each price on the board and the
  Place cards, its chance (+230 = 100 / 330 = 30.3%), green "OK to" La Contadora's most at that book (`maxPriceFor`, after its fee), or amber
  "need ≤ x% · look elsewhere" when it costs more. I bet this / + Add a bet: the check line starts "+230 = 30.3%" and ends "look elsewhere"
  when the typed price is not worth it. The board lists passing bets only, so amber shows mostly when you type a price. `tests/price-pct-test.js`.
- BettingPros ☰ Several (v4.11, `bmPaint`, `loadSeveral`, `#bpMulti`, `mbev.bpMulti`; owner: "choose all of those or not, around what we
  can do"): tick sports (All with games = a game in 24 hours, or None); the line shows sports × calls each against `_bpLeft`. Load (and
  Refresh) then run `loadApi(fresh, sport)` for each, soonest first; no game in 24 hours is skipped, and a sport that would go over the calls
  left is not loaded. While open, the one-sport menu is greyed; closed, Load works as before. `tests/bp-several-test.js`.
- The board waits while you bet (v4.12, `boardEditorOpen`, `_boardPending`, `_boardForce`; owner: "if I press I bet this, do not move it",
  "refreshes"): `render` called while an I bet this box is open on the board or a Place card only remembers the call; it runs once the box
  is saved or closed (checked every 400 ms). A click or change of your own outside the box sets `_boardForce` for that tick, so sort,
  filters, Parlay and other buttons still redraw. Save / Cancel must remove the editor before redrawing (they do). `tests/editor-stays-test.js`.
- Colours: light-mode text greens and amber are AA-checked (`--live`, `--neon`, `--warn`, `--gain`). Run the accessibility
  report after changing colours.
- Editing a logged parlay (v3.85, `plEditOpen`, `plParseLegs`, `plDec`): the log's parlay row has edit: each leg (text and American
  odds, parsed from `parlay.legs` "text odds; text odds"), add or remove legs, stake, and Pays if all hit (from the legs until typed).
  Saving sets `parlay.legs`, `picks`, `pays.all`, `odds`; an all-hit parlay gets the new payout; each edit goes in `edits`.
- Editing a saved bet (v3.88): the editor has Game day (`.eb-date`, from `gameDayOf`). A new day sets `date`, `dateSet` and moves
  `start` to the same kickoff time on that day; the old day goes in `edits[].before.date`.
- An open editor in the Bet log (v3.86, `logEditorOpen`): background redraws (live prices, fills, sync) wait (`logRenderLater`) until it
  is saved or closed. Your own buttons must remove the editor before calling `renderLog`, or their redraw waits too.
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
  v3.80: the game is found by the row's ESPN id (`gameInfo.eventId`), then codes, then full names (`wxFind`). v3.81: normal weather
  gets a quiet chip (`wx calm`: sky, °F, mph) and domes "🏟️ dome", so a checked game always shows something.
- The data sources row (`#srcBar`, `#srcPanel`) is on the main page under the BettingPros bar. Settings keeps the passphrase.
  v4.02 (owner: "on the Performance tab we do not need the API info, it makes everything cluttered"): the BettingPros bar (`.loadbar`,
  `#apiStatus`), Sources (`.srcline`, `#srcPanel`) and the board count (`.statbox`) show on the Board only, by CSS on `body[data-view]`
  (set by the tab handler). Leagues' Load odds switches to the Board first, so its Sources panel still opens. Performance starts with
  Results by day (`#calPanel`), then the Scorecard.
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
  v3.92: on combo apps the pick'em boxes (Power/Flex `#pkPlay`, Picks from `#pkMinPL`) are hidden by a CSS rule; `hidden` alone lost to display:flex.
- Logged entries (v4.06, `pkNotLogged`, `pkLoggedLegKeys`): a pick already in a parlay in the Bet log (last 2 days, `parlay.pk.legs`) is
  already bet: `pkLegs` / `pkLegsPriced` leave it out of entries, slips and pick lists, and `#pkNote` says how many. Before, Log this entry
  only remembered it in memory (`_pkLogged`) until a reload, and its picks stayed in the pool.
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
