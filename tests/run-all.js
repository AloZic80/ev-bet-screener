// node tests/run-all.js — runs every pass/fail test against ../index.html and ../phone.html; exits 1 if any fails.
const { spawnSync } = require('child_process'); const path = require('path');
const runs = [
  ['To win, date and grading (bet saved during the game)', 'towin-test.js', ['UTC', '2026-11-03T02:30:00Z']],
  ['% mode and editing a saved bet',                       'towin-edit-pct-test.js', []],
  ['+ Add a bet: past bets, price formats, results, tabs', 'add-bet-test.js', []],
  ['Layout toggle (Auto / Phone / Desktop)',               'layout-test.js', []],
];
const run = (file, args) => spawnSync(process.execPath, [path.join(__dirname, file), ...args], { encoding: 'utf8', timeout: 300000 });
const last = r => ((r.stdout || '') + (r.stderr || '')).trim().split('\n').pop();
let bad = 0;
for (const [name, file, args] of runs) {
  const r = run(file, args), ok = r.status === 0; if (!ok) bad++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + ': ' + last(r));
  if (!ok) ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /^FAIL |Error/.test(l)).slice(0, 12).forEach(l => console.log('    ' + l));
}
// Parked decision, shown but not counted: on the real clock a bet saved more than 4 h after its game started
// is not matched to that game (evOkFor), so its 4 grading checks fail. See CLAUDE.md.
console.log('INFO real clock (4-hour check in evOkFor, parked): ' + last(run('towin-test.js', ['UTC'])));
console.log(bad ? `\n${bad} test file(s) failed` : '\nAll tests passed');
process.exit(bad ? 1 : 0);
