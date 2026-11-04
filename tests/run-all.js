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
