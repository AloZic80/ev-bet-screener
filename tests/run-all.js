// node tests/run-all.js — runs every pass/fail test against ../index.html and ../phone.html; exits 1 if any fails.
const { spawnSync } = require('child_process'); const path = require('path');
const runs = [
  ['To win, date and grading (bet saved during the game)', 'towin-test.js', ['UTC', '2026-11-03T02:30:00Z']],
  ['Same bet saved the next day (grades itself)',          'towin-test.js', ['UTC', '2026-11-04T00:05:00Z']],
  ['Grading bets added after kickoff (4-hour rule)',        'grading-test.js', []],
  ['% mode and editing a saved bet',                       'towin-edit-pct-test.js', []],
  ['+ Add a bet: past bets, price formats, results, tabs', 'add-bet-test.js', []],
  ['Layout toggle (Auto / Phone / Desktop)',               'layout-test.js', []],
  ['Parlays: the math against brute force, and the tab',   'parlay-test.js', []],
  ['Parlays: Get Pick6 lines (stub Worker, step-2 routes)', 'pick6-lines-test.js', []],
  ['Your own bets: formats, not started / live / over, grading, fill-in, calendar', 'own-bets-test.js', []],
  ['Bet log: newest first, days open and close, Look out, board bet with a result', 'log-test.js', []],
  ['Sportsbook vs prediction app (DraftKings, DK Predictions, Pick 6, FD Predicts)', 'books-test.js', []],
  ['Player photos: FantasyPros by ID, ESPN by exact name, no guesses', 'photos-test.js', []],
  ['Sources on the main page; every sport (league menu, typed key, 3-way, unknown leagues)', 'sources-test.js', []],
  ['The Sentinels send parlay picks (not good alone, good in 2 to 6 picks) to the Parlays tab', 'sentinels-parlay-test.js', []],
  ['🌍 Leagues: which leagues have games, from what the sources say; one tap loads the odds', 'leagues-test.js', []],  ['Parlays for every app: pick’em and combos, size buttons, discounts and boosts', 'parlay-apps-test.js', []],
  ['🔴 Live edges: games in progress, ESPN live win chance against Kalshi, Polymarket US and Novig', 'live-edges-test.js', []],
  ['Score ribbon: Top events, Live now in every league, F1, golf, tennis, UFC', 'ribbon-test.js', []],
  ['🚑 Injury flag: ESPN injury report on player props (board, Place these)', 'injury-test.js', []],
  ['🌬️ Weather tag: wind, rain, snow, cold at kickoff on outdoor NFL, college football and MLB games', 'weather-test.js', []],
  ['Bet log saves even with the browser storage full (caches make room), or says it could not', 'save-test.js', []],
  ['Check results keeps results you set yourself, and settled ones ESPN cannot grade', 'check-results-test.js', []],
  ['Edit a logged parlay: each leg and its odds, stake, what it pays', 'parlay-edit-test.js', []],
  ['From your books › Add opens + Add a bet and keeps the fill until it is saved', 'fill-add-test.js', []],
  ['Editing a saved bet can fix its game day', 'edit-date-test.js', []],
  ['Save says why it needs a second press, in a box you can see', 'save-confirm-test.js', []],
  ['Novig bets log on their own; From your books Ignore sticks', 'fill-autolog-test.js', []],
  ['+ Add logs a described bet in one tap; a bet marked added but missing is logged again', 'fill-oneclick-test.js', []],
  ['A result you set stays: put back if lost, and on a second copy of the same bet', 'grade-stick-test.js', []],
  ['NHL shots on goal graded from shots, not goals (ESPN box score of 11/5); Ignore from another device', 'nhl-shots-test.js', []],
  ['Shots bets of every age that v3.94 cleared are graded again (11 days later)', 'regrade-old-test.js', []],
  ['Look out bets graded on their own: Saquon 11/1 (Lost), Dorofeyev logged after 10 PM (Won), real ESPN box scores', 'lookout-grade-test.js', []],
  ['Real money: Got back / Winnings (boosts), amount lost, free bets; Today card played / playing / to play per book', 'money-test.js', []],
  ['Free bets: the tick saves at once (also before Mark LOSS), parlays too; a free parlay win pays its winnings', 'free-bet-test.js', []],
  ['On an iPhone the prefilled slip waits as a real link, so the book app opens; Mac unchanged', 'slip-app-test.js', []],
  ['Texas: a bet at a book you do not bet moves to your best book (board row or live Novig/Kalshi/Polymarket), screened at that price', 'texas-swap-test.js', []],
  ['Calendar: in play is never a loss; best and worst day, this month and ever, from real results only (Alonzo\'s November)', 'cal-worst-test.js', []],
  ['v4.29: Augi\'s look and his five tabs (Board, Live Games, Parlay, Bet log, Settings), the rest in the row under theirs', 'tabs-test.js', []],
  ['v4.28: Sort › Math (edge first) is the default, the #1 MATH PICK card, the score colours in words', 'math-pick-test.js', []],
  ['v4.27: the hard stop: past the daily max, Save stops and says so; a second press is your call', 'hard-stop-test.js', []],
  ['v4.26: the score ribbon: My games, only the sports you bet in (All sports brings the rest back), each tile says what your open bets risk', 'ribbon-risk-test.js', []],
  ['v4.25: Novig game lines travel together (6 per request, by kickoff); a scan asks once per 3 games; busy answers retried in a minute; a hidden tab makes no calls; drop-downs (explanations, Bet log More, phone Filters and by book)', 'live-batch-test.js', []],
  ['v4.25: a Novig fill on a team with no game text marks the Bulls card ALREADY BET; not the Bulls tomorrow; the 76ers are the other side (Alonzo\'s CHI bet, 11/8)', 'fill-prior-test.js', []],
  ['v4.24: calls to the Worker counted and shown; a limit answer pauses polling 10 min; fills/orders every 1 or 3 min, live prices every 1 or 5; live edges re-price only what moved; cookie mode (no preflight)', 'worker-calls-test.js', []],
  ['v4.24: the math, checked on its own: odds ↔ chance, EV after fees, OK up to, Kalshi shares, Kelly stake, betProfit, parlays', 'math-audit-test.js', []],
  ['v4.23: background refreshes keep the bet you are looking at in place (also like Safari, with tags filling in later)', 'board-scroll-test.js', []],
  ['v4.21: the Sentinels cards: short card, Why this play? (remembered), score, freshness, price chart; phone and Mac', 'sentinel-card-test.js', []],
  ['v4.20: your orders mark the same bet on a card at any book (and with no ESPN team codes)', 'order-anybook-test.js', []],
  ['v4.19: a parlay or single you typed in counts as already bet on the Parlays tab (however the legs are written)', 'manual-parlay-test.js', []],
  ['v4.18: the card says when you already have an order on that team (this game, another game, the other team)', 'order-tag-test.js', []],
  ['v4.17: orders waiting at your books: Bet log box, a line at the top, and the reason when they cannot be read', 'log-orders-test.js', []],
  ['v4.16: startup with bets from your books (full team names): the whole page loads (v4.15 stopped halfway)', 'startup-test.js', []],
  ['v4.16: CSV download (a day or all), Send the Sentinels on combo apps, legs you already bet say so', 'csv-parlay-tags-test.js', []],
  ['v4.15: Kalshi on rows with full team names: exact game asked, the strip names it, an order on another game says not placed', 'kalshi-game-test.js', []],
  ['v4.14: a Kalshi order waiting (or a fill worded differently) moves its bet to Already bet, by market code and side', 'kalshi-placed-test.js', []],
  ['v4.13: the board Book menu: only the bets at one book (counts, remembered, All books)', 'board-book-test.js', []],
  ['v4.12: background redraws wait while I bet this is open (the box stays, the page does not move)', 'editor-stays-test.js', []],
  ['v4.11: BettingPros ☰ Several: tick sports, calls vs left today, load soonest first, stop before going over', 'bp-several-test.js', []],
  ['v4.10: the price as a % (+230 = 30.3%), OK to / look elsewhere, on the board, Place cards and I bet this', 'price-pct-test.js', []],
  ['Kalshi: what to type (YES/NO, Shares, Limit price, Cost and Max payout) for La Contadora\'s bet; the form in Kalshi\'s words', 'kalshi-how-test.js', []],
];
const run = (file, args) => spawnSync(process.execPath, [path.join(__dirname, file), ...args], { encoding: 'utf8', timeout: 300000 });
const last = r => ((r.stdout || '') + (r.stderr || '')).trim().split('\n').pop();
let bad = 0;
for (const [name, file, args] of runs) {
  const r = run(file, args), ok = r.status === 0; if (!ok) bad++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + ': ' + last(r));
  if (!ok) ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /^FAIL |Error/.test(l)).slice(0, 12).forEach(l => console.log('    ' + l));
}
console.log(bad ? `\n${bad} test file(s) failed` : '\nAll tests passed');
process.exit(bad ? 1 : 0);
