# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 10,400 lines).
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
- Para ChatGiPiTiTi (owner, 2026-11-08: "every time I ask something or something is changed, I can download that MD so I can ask my ChatGPT ...
  name it Para ChatGiPiTiTi with version or date"): every build also gets `agent-notes/para-chatgipititi_<version>_<YYYY-MM-DD>.md`, a standalone
  note for ChatGPT (what the app is, what was asked, what was built, the numbers, a question to check), sent to the owner as a file with the reply.
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
- Book on the board (v4.13, `#boardBook`, `boardBook`, `mbev.boardBook`; owner: "only choose by book: Kalshi, Novig"): next to Sport, the
  books on the board with counts ("Kalshi · 2"), from the rows left after sport and duplicates; picking one shows only its bets (table and
  Place these). It matches `bookLabel(r.book)`, so a swapped row (v4.05) counts at the book it moved to. Separate from Settings' typed Book
  filter (`filterBook`). `tests/board-book-test.js`.
- Placed at an exchange (v4.14, `exQs`, `r.waitOrder`; owner: "still seeing Kalshi slips I made on the board", three resting orders,
  0 filled): in `auditCore` a Kalshi / Polymarket US / Novig row's own quotes (`_openQ`, `_shopQ`, `_altQ`, `_par`: ref + side) also match
  a logged bet's `fillRef`/`fillSide` (a fill worded differently is still `prior`) and an order in `myOrders` (/mine/orders, read with
  each fills check; `syncOrders` redraws when it changes): `r.waitOrder`, decision "ORDER WAITING n shares at x¢", Already bet group, no
  stake, not in Place these, Sentinels or Parlays. Cancelled at the book: back in Place these. `tests/kalshi-placed-test.js`.
- Rows with full team names (v4.15, `giTeamsOf`, `giTeamFor`, `gameHintOf`; Alonzo's three Kalshi orders were other games): The Odds API
  writes "Texas Tech Red Raiders @ Oklahoma State Cowboys", so `liveDesc` found no codes and the exchanges were never asked; "open slip"
  opened Kalshi's home page and the Oklahoma St. market there was another game. Codes now come from ESPN's `gameInfo.teams` (`rowAsBet`
  carries `gameInfo`; `betMatches` uses them too). The Kalshi strip says "in Texas Tech at Oklahoma State, Sat, 11/14, 11:00 AM CT"; an
  order on the same school in another game (`r.otherGameOrder`, title match, more than 36 h apart) says "is another game. This one is not
  placed"; a slip the book cannot find says which game to pick (card note, phone bar). Kalshi's college codes are not checked against ESPN's
  (kalshi.com is not reachable from the build machine). `tests/kalshi-game-test.js`.
- v4.16: Bet log › Bets you took › Download (`csvDays`, `logCsv`, `#csvDay`, `#csvDl`): All days or one game day, one row per bet, newest
  first; profit is `betProfit` (settled only, free bets count winnings only), parlays keep their legs; UTF-8 mark for Excel. Parlays: Send the
  Sentinels (`#pkSentGo`) is on combo apps too. `pkBetTag` on every leg list (Sentinels' picks, slip and entry cards, pick list): "✓ you bet
  this: single $x on Book", "order waiting on Book", or "in your Book parlay (n picks)" (logged parlays of the last 2 days, `parlay.pk.legs` or
  the book's text legs; name or team code, line and side must match). `tests/csv-parlay-tags-test.js`.
- Startup order (v4.16 fix, `nrmT`, `tests/startup-test.js`): v4.15's `giTeamFor` called `nrm`, a `const` defined near line 8700. A bet from
  the books with a full team name and ESPN's game made the Bet log call it during startup, before that line ran: "Cannot access 'nrm' before
  initialization" stopped the page halfway (no board, Sources, budget or Today card; localStorage untouched). Code that can run at startup must
  use function declarations (hoisted, like `nrmT`), never a `const`/`let` helper defined further down. The startup test loads data like Alonzo's.
- Orders waiting at your books (v4.17, `renderLogOrders`, `renderOrdersTop`, `#logOrders`, `#ordersTop`, `window._ordersErr`; owner: "I don't see
  them on my Bet log, so where are they?", three Kalshi orders with Filled 0): drawn by `renderMakes` after each `syncOrders`. Top of the Bet log:
  each order (book, YES/NO, what, market title, shares at the limit = cost rounded up like Kalshi's Cash, filled, game time), the money held and
  "not bets yet; a filled order goes into the Bet log". Under the Today card: "N orders waiting at … · $x held · See them ›". When /mine/orders
  fails or returns `errors`, both say "Could not read your orders: …" instead of showing nothing. `tests/log-orders-test.js`.
- The order on the card (v4.18, `orderTagHtml`, `.ord-tag`, `r.otherSideOrder`; owner: "put the note on the bet that is technically still open,
  I need an identifier so I will not bet twice"): in `auditCore` an order is matched to a game-line row by Kalshi's team code (`o.bet.team`, NO =
  the other team), or, when Kalshi's code is not ESPN's (BG for BGSU), the closer code in a market whose title names the school. Within 36 h it
  is this bet (`waitOrder`, ORDER WAITING); further apart `otherGameOrder` ("another game: this one is not placed"); the other team in this game
  `otherSideOrder`. The tag sits under the pick on the card and in the odds cell of the row. `tests/order-tag-test.js`.
- Typed-in bets on the Parlays tab (v4.19, `pkSegs`, `pkSegHit`, `pkParlaysWith`; owner: "I made this bet and saved it manually but you don't
  identify it as already bet on"): a parlay from Add a parlay (legs typed like "Mahomes O 1.5 TD, Bijan O 70.5 rush") counts like one logged from
  the tab: legs split on ; , new line | " + "; same pick = last name (or team code / school) and line, and the side when written (O/Over/U/Under).
  `pkNotLogged` leaves those picks out of entries and slips (as v4.06) and `pkBetTag` tags them; a single typed in with + Add a bet, worded
  differently, is tagged too (same stat family). A parlay saved with no legs cannot be matched. `tests/manual-parlay-test.js`.
- Orders against every card (v4.20; owner: "you have the Kalshi API, get my bets even if not filled and put an identifier on them"): v4.14/v4.18
  checked orders only against cards priced at that same exchange (`o.book===exSrc`), so a Kalshi order on the same team or player at a Novig,
  Bovada or other card got nothing. Now every card is checked against every order (ref match stays same-book; `betMatches` and the team checks
  take any book), the tag names the order's book, and with no ESPN `gameInfo.teams` the school comes from the name (longest prefix found in an
  order title: "Oklahoma State Cowboys" → oklahoma st). `tests/order-anybook-test.js`.
- The Sentinels cards (v4.21, `placeCardHtml`, `sentScore`, `pxNote`/`pxSeries`/`pxChartSvg`, `scKalshiLine`, `.sc-card`, `#placeCards.sc-grid`; owner,
  showing OddsJam's Momentum: "I want it like this", "they call it Momentum, we call it Sentinels", "La Contadora already allowed the bet, so we
  may not need all the info, unless a drop-down", "you decide, nice GUI, phone and Mac"): Place these is a grid of short cards (1 column on a
  phone, 2-3 on a computer; narrow cards switch layout by `@container (max-width:360px)`). Short card: score, book + EV after fees, ⏱ age of the
  price (`rowSeenAt`: `loadedAt`, `_liveAt` set by `shopExchanges`/`swapHunt`, `shop.at`, `exOpen.at`; amber after 30 min), the price move in
  the last hour (`pxMove`), who / stat / kickoff + game, tags (order tag, injury, weather, swap/shop, warns, Makes), the bet bar (pick + v4.10's
  `impTagHtml` line, stake, pays/wins, price chip `.sc-price.book` that opens the slip through the logo handler), the one-line Kalshi "what to
  type", I bet this (its box opens under `.sc-act`), Parlay, open slip. "Why this play?" (`details.sc-why`, closed by default, remembered per bet
  in `mbev.scOpen`, all open with Show all notes): tiles (EV, Fair, OK up to, Market, Consensus, Projection, Rating, Hit rate), the score's
  parts, the price chart, the decision, the full Kalshi strip, notes, Share. Score 0-100 = Edge 50·min(1, EV/6%) + Market (`mktNet`: 20 at
  break-even, 30 at +4%, 0 at -3%, x0.85 consensus, 8 with no market) + Fresh (20 under 3 min, 0 at 90). Price history: `mbev.px` (in
  `LS_CACHES`), per bet `[minute, price, fair]`, a point on a change or every 15 min, 40 points, 250 bets, 3 days; recorded at the end of
  `auditCore`. Cents for Kalshi / Polymarket, % for Novig and other % apps, odds for sportsbooks. Sort › Sentinel score. `tests/sentinel-card-test.js`;
  `tests/kalshi-how-test.js` reads the one line on the card, then opens Why this play? for the four steps.
- v4.22 (owner: "on the Mac it is confusing, two boxes side by side; on a computer one per line, and side to side"): Place these is one card per
  line everywhere (`#placeCards.sc-grid` is the `sclist` container); from 760 px wide (`@container sclist (min-width:760px)`) each card is a
  grid row: score | who + kickoff/game | the bet bar | buttons, tags and the Kalshi line under it, Why this play? across (two columns inside:
  numbers and score left, chart right). The ×N game-count flag stays in the notes, not on the card.
- The board keeps its place (v4.23, `boardAnchor`, `boardAnchorBack`, `renderCore`, `window._bAnchor`; owner: "it refreshes and the board goes up,
  I lose the bet"): `render` now wraps `renderCore`; before it, the first bet whose top is on the screen (card `data-pck`, or a table row's
  `pxKey`) and its position are remembered, and after it the page scrolls so that bet is back at the same spot. Photos, injury and weather tags
  fill in a moment after each redraw and push the bets down again; Safari (iPhone, Mac) has no scroll anchoring, so a ResizeObserver on
  `#placeCards` and `#tbody` re-applies the anchor for 4 s after a redraw unless you scrolled, tapped or typed since. `tests/board-scroll-test.js`
  (also with `overflow-anchor:none`, as in Safari).
- Worker calls (v4.24; Cloudflare: "exceeded its daily requests limit", 142k in a day, 8,700 per 15 min on a college-football Saturday):
  the cause was Live edges (`leScan`): both teams × three exchanges × up to 30 live games every 30 s, each Novig game line its own request
  (`LIVE_SPLIT`, v3.16, needed on the free plan), and every call with the `x-screener-pass` header costs a CORS preflight (a second Worker
  request). Now: the fetch wrapper counts every call by path and day (`mbev.wk`, `wkState`, the ⚡ chip on the Sources row with the top paths
  on hover; amber at 30k, red at 50k); a 429, or a 5xx whose text says 1027 / exceeded / limit, pauses background polling 10 min (`wkPause`,
  `wkPaused`: fills, orders, live prices, live edges, Parole, book swap, sync; your own presses still go). Cadences: fills and orders every
  60 s while you use the page, 180 s when left open (`wkIdle`: no scroll, tap or key in 3 min, from v4.23's `_bUserT`); `fillAt` is set before
  the read so a failing Worker is not asked every 20 s; live prices every 60 s when a bet kicks off within the hour, else 300 s (`liveEvery`);
  live edges at least 60 s, only the exchanges in Books you bet, and a team is re-priced only when ESPN's number moved ≥ 1 point or its price
  is over 3 min old (`leData.M`, "N prices kept from the last scan"). Cookie mode: when a Worker answer carries `x-auth-cookie: 1` (Worker
  v3.41, PR not merged until the owner says so) and the page is on 0xbeta.dev, the passphrase goes as the `mbev_pass` cookie for `.0xbeta.dev`
  with `credentials:'include'` and no header, so there is no preflight; a 401 in cookie mode goes back to the header and retries once
  (`mbev.wkCookie`). Tests never run from 0xbeta.dev except `worker-calls-test.js`, which serves the page at props.0xbeta.dev for that check.
  `tests/worker-calls-test.js`; `tests/math-audit-test.js` checks the arithmetic (odds ↔ chance, EV after fees, `maxPriceFor`, `kalshiHow`,
  the Kelly stake, `betProfit`, `pkDist`/`pkEV`/`pkBreakEven`) against brute force inside the page.
- Book chips (v4.24, `#bookChips`, `.bchip`, `boardBooks`, `mbev.boardBooks`; owner: "buttons so that I can only choose certain books to
  display, instead of All or just one"): a chip per book on the board with its count (logo when there is one), several on at once, All
  clears; the filter runs after sport and duplicates, before search. v4.13's `mbev.boardBook` carries over as one chip. `tests/board-book-test.js`.
- Novig game lines travel together (v4.25, `LIVE_HEAVY_N`, `LE_GAMES_PER_CALL`; owner: "Yes, BUILD"): the fetch wrapper used to send each Novig
  moneyline / spread / total as its own `/live` request (v3.16, the Worker's 45-call budget). The Worker reads a catalogue page once per request
  (`once` memo in `live.js`) and both sides of a game share one book read, so heavy bets are now grouped by sport + start, up to 6 per request
  (3 games, both sides: ~36 calls at worst on a cold cache); other bets stay together as before. `leScan` asks once per 3 games (both teams,
  every exchange you bet) instead of 8 bets however they fell: a 30-game Saturday scan is ~20 requests, not ~80. A failed or busy exchange
  answer is asked again after a minute (`M[id].at` is set 2 min back); an ok one is kept 3 min while ESPN is unchanged (v4.24). The polling
  timers (fills, orders, live prices, live edges, sync) already run only while the page is visible; `tests/live-batch-test.js` checks it.
- Already bet by team code (v4.25, `glTeamSame`, `sameTime`, `rCode`, `rTeams` in `auditCore`; owner, 11/8: a Novig "CHI Winner" fill placed at
  11:07 AM, and at 2 PM the Sentinels card "Chicago Bulls · Moneyline · Novig +388" still said I bet this): a bet logged from a fill (`autoAddFromDesc`:
  name = the team code, no game text) or typed in matched neither `coreKey` (the row says "Chicago Bulls") nor `glSame` (needs the game text).
  Now a game line with the same kind and team code (ESPN's code for a full name, via `giTeamFor`), on the same game day or within 6 h, is the
  same bet (a spread needs the same line); the price may differ. `coreKey` and `glSame` also require `sameTime` now, so a bet on CHI today no
  longer marks CHI's game tomorrow. The OTHER-side warning (v3.13) also finds a logged bet with no game text on the other team of the row's game.
  Worker v3.42 (`novigBet`, PR not merged until the owner says so): a Novig fill carries `away`/`home` from the description ("PHI @ CHI"), so the
  logged bet gets its game. `tests/fill-prior-test.js` (fails on v4.24).
- Augi's look and his five tabs (v4.29, `tabGroupPaint`, `#subTabs`, `.subhome`, `data-group`, `body[data-group]`; owner, after seeing Augi's Odds Board
  (AugiM13/screener): "I like his GUI, it is cleaner ... we can change it to my liking, but in his style ... our settings and math ... his 5 tabs"):
  the bar is Board, Live Games, Parlay, Bet log, Settings (his order, a segmented bar with the active tab solid #087B44; on a phone the fixed bottom
  bar). The other views keep their tab buttons, `data-view` and handler, but sit in `#subTabs` under their group: Board → Leagues, Parole,
  Moneylines (and the hidden Pasted / Paste a board); Bet log → + Add a bet, Performance. The group's main tab stays lit (`.grp`) while one of its
  row's views is open; the `.subhome` pill goes back to the main view. His palette in the v4.29 CSS block (light and dark tokens: page #F2F8F4,
  accent #087B44 / dark #6EE3A4, ink #13271E, soft #5C7066, `--dim` #4A5D54, dark `--jetta` #087B44 so white text on the Safe button passes),
  the system font (`system-ui`), 12 px panels, 44 px inputs on a phone. A sub-row tab is hidden unless its group is open, so a test that opens
  one from another tab clicks it with `p.evaluate(()=>el.click())`. Our math, cards, Today card and data are unchanged. `tests/tabs-test.js`.
- Augi's cover bands and Bet result study (v4.31, `cvBand`, `cvNames`, `cvRanges`, `cvChipHtml`, `renderStudy`, `#studyPanel`, `#studyScope`, `.cv-chip .cv-1..9`;
  owner: "Augi did some changes for stats ... I want his features, but with our math/settings"): his 5-point bands on our fair probability (board
  `r.fairProb`, logged bet `toProb(b.fair)`): Long Shot <45, Feeling Lucky 45-50, On the Line 50-55, Slight Lean 55-60, Lean 60-65, Solid 65-70, Strong
  70-75, Heavy Favorite 75-80, High Cover 80+. A chip in the board's Cover cell and the Sentinels card's tag line (a label: no rule or stake changes).
  Performance › Bet result study (after Is the model honest?): singles only, by game day (All / This month / Last 7 days / Today): logged, pending,
  W–L–P, average prediction and hit rate on graded wins and losses only, difference in points, profit from `betProfit`. Our parlay legs are not
  graded one by one, so his "parlay legs" view is not here. His light colours were darkened a little for AA on 10.5 px text. `tests/cover-study-test.js`.
- Augi's screens, step 2 of 5: Live Games, the Game Hub (v4.35, `#hubPanel` at the top of `v-live`, `hubState`/`mbev.hub`, `hubLoad`, `hubOpen`, `hubRows`,
  `hubNoVig`, `hubState3`; owner: "Build"): sport buttons, Scheduled / Live / Final with counts, a day (`fetchScoreboardDay`), game cards with "N bets
  risking $x" (`ssRiskMap`) and how many board props the game has. A game: score and status, ESPN's line from the summary's `pickcenter` with the vig
  out, the last six plays (`plays`, or football `drives.current.plays`), your logged bets in it, and the board's props for that exact game (by
  `gameInfo.eventId`, else both team codes) with La Contadora's decision (BET $x / ALREADY BET / STARTED / skip), a search box and See on Board
  (fills `#filterPlayer`). Summary via `fetchBoxscore` (cached). ESPN only, no Worker calls (Augi's hub spends Odds API credits per game for props;
  ours reads the board already loaded). Live games refresh every 30 s while the Live tab is open. `tests/game-hub-test.js`.
- Augi's screens, step 3 of 5: the Bet log (v4.36, `#lcPanel` under Look out and the orders, `lcRender` (run by `renderLog`), `lcMonth`/`lcDay`, `lcBands`,
  `lcStats`, `lcPeriod`/`mbev.lcPeriod`, import `lcParse`/`lcHave`/`lcRecord`/`lcImpPaint`; owner: "build"): his bet calendar by game day (`calDays`: settled
  profit coloured, a day with only open bets "$x open" in grey); tap a day: bets, staked, settled profit, in play, to play, open, and the daily max as a bar
  (`cfg.dayMax`, our version of his daily goal); "Show this day" sets `logDayFilter`. Cover range breakdown for the day: singles by `toProb(b.fair)`, legs of
  parlays from the Parlays tab by `parlay.pk.legs[].p`, typed parlays Unknown (one per pick). Track by Daily / Weekly (from Monday) / Monthly: bets, pending,
  W–L–P, staked, profit and ROI on settled bets only (`betProfit`, plus `removedBets` losses). Import (a `details.help`): his `augi-bet-import` v1 JSON
  (singles and parlays with exact legs, 200 tickets, 500 KB), read on the device only; each ticket checked (game day, book, cost, total return > cost), one
  already in the log unticked (same id, or same name, market, O/U and game day; a parlay by day, stake and legs). Singles are saved as typed-in bets
  (`manual`, `dateSet`, O/U, odds from cost ÷ return, `srcType:'import'`, `imported`), parlays by `parlayRecord`. No result: graded like any typed bet.
  `tests/bet-calendar-test.js`.
- Augi's screens, step 4 of 5: Parlay (v4.37, `pkRetRows`, `pkRetHtml`, `pkDraftText`, `pkCopyText`, `.pk-ret`, `.pk-copy`, `.pk-draft`; owner: "build"): every
  entry card (`pkCard`: best for each size, ready-made slips, the Sentinels' picks, Your entry; the card carries `data-id`) shows what it pays for each way
  it can finish in dollars at the stake typed (Flex: all hit, one miss, two misses = Augi's partial return; chances from `e.d`/`pkDist`, multiples from
  `pkMult`), updated as you type (`input` on `.pk-stake`). Copy draft writes plain text (app, Power / Flex / combo, each pick with its chance and `pkWhere`,
  the stake, each payout and chance, expected return, "Not placed"); the clipboard, else `execCommand('copy')`, else a read-only `.pk-draft` box to copy
  by hand. Copying logs nothing. `tests/parlay-draft-test.js` (the test page is not https, so it stubs `navigator.clipboard`).
- Custom colours (v4.37, `window.palCss` in the head script, `#palCustomCss`, `palCustomSet`, `palCustomHex`, `#palPick`, `#palGrid`, `mbev.palCustom`; owner:
  "can I choose from a grid, not just those colours, like a colour wheel"): Settings › Layout › Colours › Custom: the device's own colour picker (wheel and grid on
  Mac and iPhone) or a grid of 20 colours. `palCss(hex)` builds the light and dark token set from the hue (page, panels, rules tinted; `--brand` and `--accent`
  toned darker or lighter step by step until white on the brand and accent on page, panel and `--accent-bg` pass 4.6:1), written before the first paint.
  `tests/palette-test.js` checks nine awkward colours (yellow, cyan, magenta, lime, grey, black, white, brown, orange) in both themes.
- Augi's screens, step 5 of 5: Settings (v4.38, `cnPaint`, `cnTest`, `#cnBox`, `crPaint`, `crRefresh`, `#credPanel`, `rgPaint`, `#rulesGlance`; owner: "Build"):
  the passphrase panel is now Connect: the Worker host (`API_BASE`), a chip (passphrase saved or not, never the value), and Test connection (free): the
  Worker's `/src/status` (lists the sources with a key, calls no provider; 401 = passphrase does not match SCREENER_PASS), "Keys set / No key yet".
  API credits & usage (`#credPanel`): a card per source from what the app already keeps (BettingPros `lastBudget`/`_bpLeft`, The Odds API `mbev.oaq`,
  Sportsbook API `mbev.sbq`, OddsPapi `_opUsage`, Pinnacle live `lePinnUse()` of `LE_PINN_DAY`, SportsGameOdds key, your Worker `wkState()` with the
  busiest paths); Refresh asks only `/budget`, `/src/status` and `/oddspapi/usage`. Your rules at a glance (`#rulesGlance`, before Screens): every rule
  from `cfgRead()` in four groups (Screens, Stake sizing, Limits, Fees), redrawn on any input in Settings. Mode raises are included (cfgRead).
  `tests/settings-connect-test.js`. Option 2 (Augi's five screens on our engine) is complete with this step.
- Already bet, player props worded by the book (v4.39, `propSame` next to `coreKey`, used in `auditCore`'s `prior` and `otherSide`; owner, 11/9: "I made this
  bet but it still shows as bettable ... crucial fix", Lekkerimaki Over 1.5 Shots on Novig): `autoAddFromDesc` logs a fill in the book's words ("Jonathan
  Lekkerimäki", "1.5 Shots On Goal"), the board says "Jonathan Lekkerimaki", "1.5 Shots", and `coreKey` compares exact text, so the card stayed in Place these.
  `propSame(L, r, anySide)`: props only, same sport when both known, same player by `nrmT` (accents, case) or same last name and first initial, same line,
  same side (unless anySide), same `statFam` (Shots = Shots On Goal = SOG) and no period / power-play / alt qualifier difference (`qualOK` both ways); with
  `sameTime`. Hoisted and startup-safe: if `statFam`'s table is not defined yet it compares plain words. `tests/prop-prior-test.js` (fails on v4.38).
- Augi's screens on our engine, step 1 of 5: the Board (v4.34, `boardView`/`#boardView`/`mbev.boardView`, `.cv-legend-box`, `lnGet`/`lnSet`/`lnBtnHtml`/`.ln-ed`,
  `mbev.lineNotes`; owner: "What you recommend" → option 2, "BUILD"): Show menu next to Sort (All groups / Passing / Outliers only / Already bet / Skipped;
  Skipped also lists rejected rows without Show rejected), filtered after `grpOf`. Augi's cover legend (nine chips) in a `details.help` above the bar.
  A note of your own on each line: 📝 on cards (in `.sc-act`) and table rows (name cell), keyed by `pxKey` (sport, name, market, side, game day),
  400 notes max, this device only; the box is an `.editor`, so redraws wait while you type; Save / Delete / Cancel remove it before redrawing.
  Next steps agreed: 2 Live Games (Augi's Game Hub), 3 Bet log, 4 Parlay, 5 Settings. `tests/board-notes-test.js`.
- iPhone pinned bar and colour schemes (v4.32, v4.33; owner: "when I scroll up, the tab bar does not stay pinned down"; "an option to change the colour
  palette, in case I want blue, red, etc., but as a scheme"): at startup `.tabs` is moved to be the FIRST child of `<body>` (not the last: tests and
  links pick the first `.tab[data-view="v-board"]`, which must be Board, not the hidden Pasted) and gets its own layer (`translateZ(0)`), the usual
  cure for iPhone Safari letting a fixed bar slide while scrolling back up; not reproducible in Chromium. Colours: Settings › Layout › Colours
  (`#paletteSeg`, `palPaint`, `html[data-palette]`, `mbev.palette`, set in the head script before the first paint; this device only): Green (Augi's,
  default), Blue, Red, Purple, Graphite, each a full light and dark token set in the v4.33 CSS block. `--brand` is the solid colour under white
  text (active tab, dark-mode buttons, Safe), `--accent` text and outlines; light rules use `:not([data-theme="dark"])` so they never beat the dark
  ones. Wins (`--live`, `--gain`) stay green and losses red in every scheme. `tests/palette-test.js` checks all 10 for 4.5:1.
- Bar at the bottom, ribbon menu on top (v4.30; owner: "I do not like that the bar does not stay on the bottom, it is in the middle"; "on the ESPN ribbon,
  have the scoreboard under where we can choose My games, Top events, NBA ... use how I had it, with all the sports available"): the five tabs are
  `position:fixed` at the bottom at every width (was phones ≤640 only; `body` keeps 76 px of room), `layout-test.js` now expects fixed on Desktop
  too. The ribbon is a column: the menu row (select, ⟳, updated) on top, the scores under it. `ssFillSel` lists every league again with 🎯 My games
  first; v4.26's "only the sports you bet in" menu and its All sports box (`#ssAll`, `mbev.ssAll`) are gone.
- Math order and the #1 pick (v4.28, `mathKey`, `scWord`, `mathTop`, `.sc-mathtop`, `.sc-word`; owner: "still confused on the green, blue and school-bus
  yellow. Tell me THIS one is what the math says to bet on. The sort, stars is not always the best bets, so what is it?"): one order for everything,
  the edge after blending the market with the model (`blendNet`, what the stake is sized on), outliers last. The daily max is filled in it (it already
  was), Sort › ✅ Math is now the default (`sortBy='math'`; Top bets by BettingPros stars is still in the menu), and the Place card with the highest
  `mathKey` says "✅ #1 MATH PICK" whatever the sort. The Sentinel score keeps its colour and says it in a word: STRONG 75+ (green), GOOD 50-74 (blue),
  THIN under 50 (yellow: still +EV, the smallest stakes). The Place these header says the math says bet every card, best first, to the daily max.
  `mathTop` inlines the Place test because `isPlace` is a `const` defined further down (startup rule). Tests read the score with `parseInt`.
  `tests/math-pick-test.js`.
- Hard stop (v4.27, in the bet editor's Save handler next to the v2.71 limit check; owner: "I want to be strict with myself ... build the Hard
  Stop. I still have the option to go on, but at least it is there for me to say and think... ok, mejor no"): when the stake would take the bet's
  game day past `cfg.dayMax` (`dayStats()[day].staked` + stake), the first press shows "🛑 Hard stop: today is at $48.00 of your $50.00 daily max;
  this $3.00 makes $51.00. Mejor no?" and the button reads Save bet anyway (`saveBtn.dataset.hs`); the second press saves. Not on edits, settled
  records or free bets. The day is `.eb-date`, else `gameDayOf(r)`, else today. The board already keeps rows past the max out of Place these
  (v2.x "daily max reached"); this covers I bet this and + Add a bet. Novig and other % books: the stake is the Cost box (`.eb-cost`, pmMode).
  `tests/hard-stop-test.js` (settings seeded as `saveCfg` writes them, with `cfgVer`, or the v2.53 migration turns a $500 bankroll into $1000).
- Score ribbon: My games and bet risk (v4.26, `ssRiskMap`, `ssMine`, `ssBetSports`, `ssFillSel`, `ssTile(..., risk)`; owner, 11/8: "On the ESPN banner?
  ... option for My Games as well, or by sport that I am only betting; if the sport doesn't have a bet, it won't come out"): each game tile with an
  open bet of yours says "N bets risking $x" (ESPN's "1 Bet risking $1.26"; free bets count as bets, risk $0; settled and parlays are not in it).
  The menu lists 🎯 My games (`MINE`, the games with your open bets, from today's ESPN scoreboards) and ONLY the sports you have an open bet in,
  rebuilt on every draw; `All sports` (`#ssAll`, `mbev.ssAll`) brings back the full league menu. `ssFillSel` keeps the chosen value when it
  is still there, else My games. `tests/ribbon-risk-test.js`; `tests/ribbon-test.js` ticks All sports first.
- Drop-downs (v4.25, `details.help`, `helpApply`, `mbev.help`; owner: "if you feel certain things can be, or are only needed with, a drop-down,
  then do"): the explanation on every tab (Live edges, Live bars, Moneylines, Lines, Add a bet, Parlays, Bets by game day, Bets you took,
  Scorecard stages, Is the model honest, CLV foot, Settings: sync, stakes, sports, sweet spot, Leagues, Parole) and the parlay legend are
  `<details class="help" data-help="id">`, closed to start; the ones you open are remembered per device (`toggle` listener, capture phase) and
  put back by `helpApply` at startup and after the Scorecard and `#pkSent` redraw. Bet log: Download, ⬇ CSV and Check results stay on the panel;
  Show as CSV, Grab closing lines, Back up, Restore and Delete every logged bet sit under "More" (`log-more`). On a phone (≤760 px) the board's
  tick boxes (Only sweet spot, Show rejected, Only games I already bet, Show all notes) fold behind `#barMoreBtn` "Filters" (`.bar-more`,
  `mbev.barMore`); ≤900 px the Today card's book tiles hide behind "by book" (`.tb-more` in the All card, `todaybar.tb-fold`, `mbev.tbBooks`;
  the click is caught on `document` in capture phase so it does not open the Bet log). On a computer both are simply there. Chromium keeps a
  layout box for the content of a closed `<details>`, so a visibility check in a test must also look for a closed `details` ancestor.
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
