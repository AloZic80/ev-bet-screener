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
