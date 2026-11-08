# App review and fixes — v4.24 (Worker calls, book chips, math check)

Ref: CC-2026-11-08-01 · Written by Claude Code, Sun 2026-11-08, about 1:10 PM America/Chicago
For: Alonzo, and the claude.ai Project "Betting-for-Pros" (project knowledge). ChatGPT may read it for a second opinion.
Repos: AloZic80/ev-bet-screener (the app, v4.24 published), AloZic80/prop-bet-api (the Worker, PR #4 **not merged**, waits for Alonzo's go).

## 1. What was wrong, and why it mattered

Cloudflare emailed on 2026-11-08: the Worker "exceeded its daily requests limit" (100,000 on the free plan). The usage chart showed
142k requests from the one Worker in a day, nothing overnight, and bars of 5,000–8,700 requests per 15 minutes on Saturday afternoon.
When the limit is hit, every call fails until midnight UTC: no prices, no book fills, no Load. The bets saved on the phone and Mac
are not affected (they live in the browser), but the app cannot find edges, which is its whole job.

Cause, found in the code (app v4.23 and Worker v3.40):

1. **Live edges** (Live tab, `leScan`). Every scan priced **both teams × three exchanges × up to 30 live games**, every 30 s. On a
   college-football Saturday that is ~180 bets per scan.
2. **Novig game lines travel one per request** (`LIVE_SPLIT`, v3.16). Finding a Novig moneyline can take ~14 catalogue pages on the
   Worker, and a free-plan Worker request may make 50 outside calls, so each Novig game line is its own request. ~60 of the 180 above.
3. **Every call pays a CORS preflight.** The passphrase travels in a custom header (`x-screener-pass`); browsers send an OPTIONS request
   first, and Cloudflare counts it. So Cloudflare counts about **twice** what the app sends.
4. **A failing Worker was asked faster, not slower.** The fills reader only remembered its last read on success, so once the Worker
   started failing it was asked every 20 s instead of every minute.

Estimate: one scan ≈ 75 app requests ≈ 150 counted; every 30 s → ~4,500 per 15 minutes per open device. Two devices (phone + Mac)
match the 8,700 bars. The 5-minute Worker cron is ~290 requests a day and is not the problem.

## 2. What changed in the app (v4.24, published)

**Seeing the calls.** Every call to the Worker is counted by path and day on the device (`mbev.wk`). The Sources row has a new chip,
**⚡ Worker · N calls today**; hover shows the top paths. Amber at 30,000, red at 50,000 (because Cloudflare counts ~2×).

**Pausing on a limit.** A 429, or a 5xx whose text says 1027 / exceeded / limit, pauses all background polling for 10 minutes: fills,
orders, live prices, live edges, Parole, the book swap and sync. The chip says "paused until …". A press of your own (Check my books now,
Scan, Send the Sentinels, Load) still goes through. After 10 minutes polling resumes by itself.

**Polling cadences.**
| What | Before | Now |
|---|---|---|
| Book fills (`/mine/fills`) | every 60 s; every 20 s when failing | every 60 s while you use the page; every 180 s when it is left open (no scroll, tap or key in 3 min); a failed read waits its turn too |
| Open orders (`/mine/orders`) | every 60 s | same as fills |
| Live prices of your open bets (`/live`) | every 60 s | every 60 s when a bet kicks off within the hour, else every 5 min |
| Live edges (`/live`) | every 30 s, both teams, 3 exchanges, 30 games | at least 60 s; only the exchanges in Books you bet; a team is priced again only when ESPN's win chance moved ≥ 1 point or its price is over 3 min old; the rest is kept ("8 prices kept from the last scan") |
| Sync, Parole, book swap | their own timers | unchanged, but they wait while paused |

**Cookie mode (removes the preflight; needs the Worker PR).** Once a Worker answer carries `x-auth-cookie: 1`, the app sets the
passphrase as the `mbev_pass` cookie for `.0xbeta.dev` (Secure, SameSite=Lax) and sends its calls with credentials and **no custom
header**: a simple request, no OPTIONS. A 401 in cookie mode goes back to the header and retries once. Until the Worker PR is merged,
nothing changes (the header keeps working).

**Book chips (Alonzo: "buttons so that I can only choose certain books to display").** The one Book menu (v4.13) is now a row of chips
under Sort / Sport: **All · N**, then one chip per book on the board with its logo and count. Tap one or several; All clears. Remembered
on the device (`mbev.boardBooks`); the v4.13 choice carries over. Works for the table and the Sentinels cards.

**Math, checked on its own (`tests/math-audit-test.js`).** Inside the page, against independent arithmetic: odds ↔ chance both ways
(every price −5000…+5000 round-trips); EV after fees equals the plain definition (pay p·(1+fee) per $1 of payout); La Contadora's "OK up
to" equals brute force at Kalshi, Polymarket, Novig and a sportsbook, and the EV right at it is the floor (1.5%); Kalshi shares = floor
(stake ÷ (limit + fee)), cost ≤ stake within 2¢, payout = shares × $1, an Under is NO on the Over; the board's stake is Kelly:
bank × fraction × (edge × shrink) ÷ b, capped at the max; `betProfit` for a win, loss, push, free bet (loses $0, wins its winnings),
typed boost, Kalshi fee; parlays: the hit distribution equals brute force, EV and break-even match the formulas. **All of it was
already right; nothing in the math had to change.**

## 3. What changed in the Worker (v3.41, PR #4, NOT merged)

`src/index.js` only: `withCors` adds `Access-Control-Max-Age: 7200` (a preflight answer kept 2 hours), `Access-Control-Allow-Credentials:
true` and `x-auth-cookie: 1`; `locked()` also accepts the passphrase from the `mbev_pass` cookie. The header still works. Same routes,
same budget, same secrets. Merging deploys it (the repo's workflow). **Alonzo decides.** Expected effect: the counted requests drop
by about half on top of the app's cuts.

## 4. Tests

`node tests/run-all.js` ended **All tests passed** (52 files). New: `worker-calls-test.js` (16 checks: the count, the 60/180 s and
60/300 s cadences, the 10-minute pause on 1027 and on 429, a press goes through, resume, cookie mode on/off, live edges asking only
Kalshi/Novig and keeping 8 prices on an unchanged second scan), `math-audit-test.js` (11), `board-book-test.js` rewritten for chips (19,
two widths, the v4.13 carry-over). Chip and ⚡ text passes AA contrast in light and dark.

## 5. Advice (building, not betting)

1. **Merge the Worker PR #4** when ready: it halves the counted requests. Then watch the ⚡ chip for a week. If a normal day shows
   under ~20,000 calls on the chip, the free plan is enough; the paid plan ($5/month, 10M requests) is the fallback, not the fix.
2. **Live edges is the expensive feature.** Even now it is the most Worker-hungry screen. Keep it closed when not watching live games,
   and keep Auto-refresh at 60 s or more. If it grows, the next step is a Worker-side cache of exchange prices (one fetch per market per
   30 s shared by every device) rather than more client tricks.
3. **One device at a time for background work.** Two open devices double everything. A future change could elect one "leader" tab per
   browser (localStorage lock) so only it polls; the others read its results.
4. **The Sentinels and the board swap also go through `/live`.** A 100-row NCAAF board costs ~130 requests per Sentinels press. Fine for
   a press, not for a timer: keep the Sentinels manual.
5. **Scorecard honesty is the product.** The math is right; the risk is data quality (a wrong fair price from a stale market, a swapped
   team code). The order tags (v4.14–v4.20) and the price chart (v4.21) are the right kind of guard; keep adding checks that compare
   two sources rather than trusting one.

## 6. Still open
- Kalshi's college team codes are not verified against ESPN's (the build machine cannot reach kalshi.com). The cards say which game to
  pick when a slip is not found.
- The Chrome-tab bet reader (`tools/read-books.mjs`) waits for Alonzo's first `books-dump.json`.
- Cloudflare Pages move (repo private) is deferred.
