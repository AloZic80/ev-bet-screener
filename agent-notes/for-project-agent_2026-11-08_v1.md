# Note for the Project's agent (Betting-for-Pros): where the screener stands on 2026-11-08

Ref: CC-2026-11-08-03 · Written by Claude Code, Sun 2026-11-08, about 3:50 PM America/Chicago
Purpose: Alonzo asked for "an MD so that I can ask my other Agent, or they can know what we did". This is the standalone brief. Nothing in it
is a secret: no keys, no passphrase, no sync password (they never go in notes or chats).

## What the product is
- 0xBeta Screener: one file, `index.html` (about 10,400 lines of HTML, CSS and JavaScript), served by GitHub Pages at props.0xbeta.dev from the
  `main` branch of AloZic80/ev-bet-screener. No build step. `phone.html` frames it at phone width on a computer.
- Purpose: find bets with an edge (+EV), size the stake (Kelly, capped), say what to type at the book, and keep an honest record (only settled
  bets win or lose; the Scorecard's 1,000-bet test says whether the edge is real). Personal app for Alonzo and Augi for now.
- Prices come through Alonzo's Cloudflare Worker (AloZic80/prop-bet-api, api.0xbeta.dev): BettingPros (the board), Pinnacle via pinnapi (fair
  reference), SportsGameOdds, Sportsbook API, The Odds API, OddsPapi, and read-only access to Alonzo's own Kalshi, Polymarket US and Novig accounts
  (fills, orders, live prices). ESPN's public scoreboard (no key) gives scores, schedules and grading.
- Everything a user saves lives in the browser's localStorage (`mbev.*`), optionally synced through the Worker with a sync password.

## Who does what (agreed 2026-11-03, 2026-11-05)
- Claude Code changes the app's code: a feature branch, Playwright tests (`node tests/run-all.js` must end "All tests passed"), a pull request,
  then merge = publish. Alonzo's standing rule: "Publish if they pass. Always publish if it passes." The Worker is different: merging into its
  `main` deploys it, so Claude Code asks plainly before each Worker merge and quotes the answer.
- The Project's agent (you) keeps the history, researches and writes specs. ChatGPT gives second opinions. Alonzo decides.
- Code drafted elsewhere comes to Claude Code as a note to merge and test, never as an upload over `main`.

## What was published today (2026-11-08)
- **Worker v3.41** (PR #4, merged 12:50 PM on Alonzo's "Yes"): the screener's passphrase may travel as the `mbev_pass` cookie for `.0xbeta.dev`
  instead of a custom header, so a browser sends no CORS preflight: one counted request per call instead of two. The header still works.
  Background: Cloudflare's free plan allows 100,000 Worker requests a day; the Worker hit 142k on Saturday 11/7 (Live edges × Novig one-per-request
  × preflights × two devices).
- **App v4.24** (PR #73, about 1 PM): every Worker call counted by path (⚡ chip on the Sources row); a 429 or daily-limit answer pauses
  background polling 10 minutes; fills and orders every 60 s in use, 180 s idle; live prices every 60 s only near a kickoff, else 5 min; live
  edges at least 60 s, only the exchanges in Books you bet, re-pricing a team only when ESPN's win chance moved; cookie mode; book chips on the
  board (several books at once); the math checked against brute force inside the page (odds ↔ chance, EV after fees, La Contadora's OK up to,
  Kalshi shares, the Kelly stake, betProfit, parlays): all of it was already right.
- **App v4.25** (PR #74, about 3:45 PM): Novig game lines travel together (up to 6 per `/live` request, grouped by league and kickoff; a live
  scan asks once per 3 games; a 30-game Saturday scan is ~20 requests, not ~80); a failed or busy exchange answer is asked again after a minute;
  drop-downs for the explanation on every tab, the Bet log's once-a-month buttons, and on a phone the board's tick boxes and the Today card's
  book tiles; **already bet by team code**: a bet logged from a book's fill with only a team code and kickoff (Novig gives no game text) now
  marks the board card for that team's game, whatever the price (Alonzo's CHI moneyline, 11/8).
- **Worker v3.42** (PR #5, **not merged**, waits for Alonzo): a Novig fill carries the game's two teams from Novig's description ("PHI @ CHI").

## How the pieces fit (for specs)
- Board rows come from BettingPros (`loadApi`), pastes, The Odds API and the Sportsbook API; `auditCore` screens each row (La Contadora: odds
  range, EV floor after fees, devig, outliers, one per player, game and daily caps) and marks ALREADY BET / ORDER WAITING / other side from the
  Bet log, the book fills and the open orders. Place these = the Sentinels cards (score 0-100 = Edge + Market + Fresh), one per line.
- Fills: the Worker's `/mine/fills` every minute; a described fill is logged on its own (`autoAddFromDesc`); undescribed ones wait under
  From your books. Orders: `/mine/orders`, shown at the top of the Bet log and as tags on cards.
- Grading: ESPN box scores, on page load and the refresh buttons; results you set are remembered by bet and by twin; Look out lists what ESPN
  could not grade. Performance: Results by day (calendar), the Scorecard (1,000-bet test), Is the model honest?, Where the edge comes from.
- Tests: `tests/*.js` (55 files), each loads the real page in headless Chromium with the network stubbed; `tests/README.md` explains; the
  a11y and width reports are not pass/fail.
- Notes: `agent-notes/<topic>_<date>_v<N>.md`, header with a `CC-` Ref, times in America/Chicago. `CLAUDE.md` is the living list of rules and
  gotchas per version.

## Open items you could research or spec
1. Novig's API: does a market object carry `league` or an event with a league? The Worker guesses the sport of a fill from the stat name
   (`nvSport`) and from today will read the game from the description; a real field would be better. Also whether `/v3/catalog/markets`
   accepts an `eventId` or team filter (today it pages by league and start window, up to 14 pages of 500).
2. Kalshi college team codes vs ESPN's (BG for BGSU, OKLST for OKST): a list would make the order tags exact. The build machine cannot reach
   kalshi.com.
3. Cloudflare: the free plan (100k requests a day) vs Workers Paid ($5 a month, 10M). After v3.41 + v4.25, a normal day should sit far under
   the limit; the ⚡ chip shows the count per device. The fallback plan is the paid tier, not more client tricks.
4. The Chrome-tab bet reader (`tools/read-books.mjs`) waits for Alonzo's first `books-dump.json`.
5. Two pre-existing accessibility notes: rating stars on the pink already-bet rows are 3.2:1 in light mode; the Today card is click-only.

## Things to keep in mind when writing specs for Claude Code
- Much of the HTML is built in single-quoted JavaScript strings: an apostrophe in text breaks the page (write "it is").
- A `//` comment in the middle of a one-line record comments out the rest of the line; use `/* */`.
- Code that can run at startup must be a function declaration (hoisted), never a `const` helper defined further down (v4.15 lesson).
- Never clear saved results to force a regrade; grade first and replace only when the new grade exists (v3.95 lesson).
- A version bump is three places (`SCREENER_VERSION`, `<title>`, `#verTag`); every layout change is checked at 390, 1000, 1280 and 1960 px, light
  and dark; colours are AA-checked.
