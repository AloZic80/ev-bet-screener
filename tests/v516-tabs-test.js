// node tests/v516-tabs-test.js [index.html] — v5.16 (owner 11/16: "add more tabs on the board if need be. So, boring, Machin, Volado, etc. add in between.
// Choose the names. Ask Karens"; and "change the Cover range Breakdown between 2.5% ... That 5% difference is to large"; then "between <45%, 45-<47.5%,
// 47.6%-<50%, etc. to get more in detail with the data").
// 1. Eight chance tabs by La Contadora's chance, half-open: 😴 Boring 75%+ · 🛋️ Tranqui 70–75 · 💪 Machín 65–70 (key safe) · ⚖️ Parejo 60–65 ·
//    🪙 Volado 55–60 (key volado) · 🎲 Dado 50–55 · 🍀 Suertudo 45–50 · 🔮 Brujo under 45. Each lists only its own; its button count equals its cards;
//    stakes and decisions are the same in every tab; old saved mode keys still open; the tab row fits a 390 px phone.
// 2. Cover range rows in fixed 2.5-point steps (<45%, 45–<47.5% … 77.5–<80%, 80%+) in the calendar, the Bet result study, Reports and the CSV; totals unchanged.
// Each test bet has model = market = its chance, so La Contadora's chance is exactly that (as tabs-v476-test). Run on the old file it must fail.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { openPractice, fixtures: F } = require('./practice-copy.js');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8');
let pass = 0, fail = 0; const check = (n, ok, got) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + '  → ' + JSON.stringify(got === undefined ? null : got).slice(0, 600)); };
const TIP = F.NOW + 6 * 3600e3, iso = ms => new Date(ms).toISOString();
const T = (ha, abbr) => ({ ha, id: abbr, abbr, name: abbr + ' Team', loc: abbr, nick: 'Team', logo: '', rec: '', color: '333333', alt: 'ffffff' });
const am = p => p >= 0.5 ? String(Math.round(-100 * p / (1 - p))) : '+' + Math.round(100 * (1 - p) / p);
const row = (id, player, c, gap) => ({ name: player, team: 'T' + id, game: 'T' + id + ' @ H' + id, matchup: 'T' + id + ' @ H' + id, side: 'O', sport: 'NHL', market: '1.5 Shots On Goal', kind: 'prop', book: 'Novig', offeredRaw: am(c - (gap || 0.04)), offeredProb: +(c - (gap || 0.04)).toFixed(4), fairProb: c, fairRaw: '', mktProb: c, stars: 3, evModel: 'market',
  gameInfo: { state: 'pre', startISO: iso(TIP), eventId: '8' + id, timeCT: '', detail: '', teams: [T('away', 'T' + id), T('home', 'H' + id)] }, src: 'api:NHL:props', apiKey: 'v516' + id, loadedAt: iso(F.NOW - 60e3) });
// the chances at every edge the owner named, plus one each side of the ends
const CH = [['a', 'Alpha', 0.80], ['b', 'Bravo', 0.75], ['c', 'Charlie', 0.7499], ['d', 'Delta', 0.70], ['e', 'Echo', 0.6999], ['f', 'Foxtrot', 0.65], ['g', 'Golf', 0.60], ['h', 'Hotel', 0.55], ['i', 'India', 0.50], ['j', 'Juliet', 0.45], ['k', 'Kilo', 0.44]];
const ROWS = CH.map(x => row(x[0], x[1] + ' Edge', x[2], x[2] >= 0.8 ? 0.06 : 0.04));   // 80% at 74% (−285) stays inside the default −300 to +500 range
const WANT = { boring: ['Alpha Edge', 'Bravo Edge'], tranqui: ['Charlie Edge', 'Delta Edge'], safe: ['Echo Edge', 'Foxtrot Edge'], parejo: ['Golf Edge'], volado: ['Hotel Edge'], dado: ['India Edge'], lucky: ['Juliet Edge'], clair: ['Kilo Edge'] };
const ORDER = ['boring', 'tranqui', 'safe', 'parejo', 'volado', 'dado', 'lucky', 'clair', 'old', 'awol'];
(async () => {
  const b = await chromium.launch();
  // ---- 1. pure rule: the edges
  { const { ctx, page: p, errors } = await openPractice(b, { html, rows: () => ROWS, settleMs: 1800 });
    const E = await p.evaluate(() => [0.80, 0.75, 0.7499, 0.70, 0.6999, 0.65, 0.6499, 0.60, 0.5999, 0.55, 0.5499, 0.50, 0.4999, 0.45, 0.4499].map(a => { let t = null, f = null; try { t = tabOfChance(a); f = passFam({ actProb: a }); } catch (e) { t = 'ERR'; } return [a, t, f]; }));
    const want = { 0.80: ['boring', 'boring'], 0.75: ['boring', 'boring'], 0.7499: ['tranqui', 'tranqui'], 0.70: ['tranqui', 'tranqui'], 0.6999: ['machin', 'safe'], 0.65: ['machin', 'safe'], 0.6499: ['parejo', 'parejo'], 0.60: ['parejo', 'parejo'], 0.5999: ['volado', 'volado'], 0.55: ['volado', 'volado'], 0.5499: ['dado', 'dado'], 0.50: ['dado', 'dado'], 0.4999: ['suertudo', 'lucky'], 0.45: ['suertudo', 'lucky'], 0.4499: ['brujo', 'hail'] };
    check('tabOfChance and passFam put each edge in its tab (half-open: 70.0% is Tranqui, 69.99% Machín, 75.0% Boring, 50.0% Dado, 45.0% Suertudo)', E.every(x => x[1] === want[x[0]][0] && x[2] === want[x[0]][1]), E);
    const W = await p.evaluate(() => ['boring', 'tranqui', 'machin', 'parejo', 'volado', 'dado', 'suertudo', 'brujo'].map(tabWord));
    check('tabWord names all eight', JSON.stringify(W) === JSON.stringify(['Boring', 'Tranqui', 'Machín', 'Parejo', 'Volado', 'Dado', 'Suertudo', 'Brujo']), W);
    const btn = await p.evaluate(() => [...document.querySelectorAll('#modeBar button')].map(x => ({ m: x.dataset.mode, t: x.textContent.replace(/\s+/g, ' ').trim(), title: x.title })));
    check('the tab row, safest to riskiest: Boring, Tranqui, Machín, Parejo, Volado, Dado, Suertudo, Brujo, then Old and AWOL', JSON.stringify(btn.map(x => x.m)) === JSON.stringify(ORDER) && /^😴 Boring/.test(btn[0].t) && /^🛋️ Tranqui/.test(btn[1].t) && /^💪 Machín/.test(btn[2].t) && /^⚖️ Parejo/.test(btn[3].t) && /^🪙 Volado/.test(btn[4].t) && /^🎲 Dado/.test(btn[5].t), btn.map(x => x.t));
    const rng = { boring: /75% or better/, tranqui: /70 to 75%/, safe: /65 to 70%/, parejo: /60 to 65%/, volado: /55 to 60%/, dado: /50 to 55%/, lucky: /45 to 50%/, clair: /under 45%/i };
    check('each chance tab has a tooltip with its range', btn.slice(0, 8).every(x => rng[x.m].test(x.title)), btn.slice(0, 8).map(x => x.m + ': ' + x.title));
    const st = await p.evaluate(() => lastRows.filter(r => /^v516/.test(r.apiKey)).map(r => [r.apiKey, !!r.pass, +(+r.stake || 0).toFixed(2), +(+r.actProb).toFixed(4)]));
    check('all eleven test bets are approved with a stake, La Contadora at exactly their chance', st.length === 11 && st.every(x => x[1] && x[2] > 0) && st.every((x, i) => x[3] === CH[i][2]), st);
    // each tab lists only its own; the button count equals the cards listed; stakes and decisions the same in every tab
    const seen = {};
    for (const m of ORDER.slice(0, 8)) {
      await p.evaluate(m => setMode(m), m); await p.waitForTimeout(250);
      const v = await p.evaluate(() => ({ mode: betMode, cards: [...document.querySelectorAll('#placeCards .sc-card')].map(c => (c.textContent.match(/([A-Z][a-z]+ Edge)/) || [])[1]).filter(Boolean),
        n: (document.querySelector('#modeBar button.on .mode-n') || {}).textContent, rows: lastRows.filter(r => /^v516/.test(r.apiKey)).map(r => [r.apiKey, !!r.pass, +(+r.stake || 0).toFixed(2), r.dec || r.decision || null]) }));
      seen[m] = v.rows;
      check('tab ' + m + ' lists only ' + WANT[m].join(' and ') + ', and its button says ' + WANT[m].length, v.mode === m && JSON.stringify(v.cards.slice().sort()) === JSON.stringify(WANT[m]) && +String(v.n || '').trim() === v.cards.length, v);
    }
    const ref = JSON.stringify(seen.safe);
    check('stakes and decisions (pass, stake) are identical in every tab', ORDER.slice(0, 8).every(m => JSON.stringify(seen[m]) === ref), Object.keys(seen).map(m => m + ' ' + (JSON.stringify(seen[m]) === ref)));
    const cw = await p.evaluate(() => { const c = document.getElementById('countWhere'); return c ? c.textContent : ''; });
    check('"N in the tabs" names the new tabs with their counts', /🛋️ Tranqui 2/.test(cw) && /⚖️ Parejo 1/.test(cw) && /🎲 Dado 1/.test(cw) && /💪 Machín 2/.test(cw) && /🪙 Volado 1/.test(cw), cw);
    await p.evaluate(() => setMode('dado')); await p.waitForTimeout(200);
    const ct = await p.evaluate(() => (document.getElementById('contadora') || {}).textContent || '');
    check('🎲 Dado: La Contadora says its range, and where the others are', /50 to 55%/.test(ct) && /Tranqui has 2/.test(ct) && /Parejo has 1/.test(ct), ct);
    check('no page errors (tabs)', !errors.length, errors);
    await ctx.close(); }
  // ---- old saved mode keys still open a valid tab; Brujo from yesterday goes back to Machín
  for (const [saved, want] of [[{ mode: 'safe', day: F.DAY }, 'safe'], [{ mode: 'volado', day: F.DAY }, 'volado'], [{ mode: 'boring', day: F.DAY }, 'boring'], [{ mode: 'tranqui', day: F.DAY }, 'tranqui'], [{ mode: 'clair', day: '2026-11-14' }, 'safe'], [{ mode: 'nope', day: F.DAY }, 'safe']]) {
    const ctx = await b.newContext({ timezoneId: 'America/Chicago', viewport: { width: 1280, height: 900 } }); await ctx.clock.install({ time: new Date(F.NOW) });
    await ctx.addInitScript(([R, d, s]) => { try { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('mbev.cfg', JSON.stringify({ books: 'Novig', bank: '2000', cfgVer: 3.03 })); localStorage.setItem('mbev.cards', '1'); localStorage.setItem('mbev.board', JSON.stringify({ v: 1, savedAt: new Date().toISOString(), slate: d, rows: R })); localStorage.setItem('mbev.mode', JSON.stringify(s)); } catch (e) {} }, [ROWS, F.DAY, saved]);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://app.test/')) return r.fulfill({ contentType: 'text/html', body: html }); if (/0xbeta/.test(u)) return r.fulfill({ contentType: 'application/json', body: '{}' }); if (/espn/.test(u)) return r.fulfill({ contentType: 'application/json', body: '{"events":[]}' }); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const v = await p.evaluate(() => ({ mode: betMode, on: [...document.querySelectorAll('#modeBar button.on')].map(x => x.dataset.mode), cards: document.querySelectorAll('#placeCards .sc-card').length }));
    check('a saved mode ' + JSON.stringify(saved) + ' opens ' + want + ' (its button lit, its cards listed)', v.mode === want && JSON.stringify(v.on) === JSON.stringify([want]) && v.cards === WANT[want].length && !errs.length, Object.assign(v, { errs }));
    await ctx.close(); }
  // ---- the tab row at every width, light and dark: every tab on screen, no sideways scroll, rows of buttons that do not overlap
  for (const w of [360, 390, 1000, 1280, 1960]) for (const theme of ['light', 'dark']) {
    const { ctx, page: p, errors } = await openPractice(b, { html, width: w, height: 900, theme, isMobile: w < 500, rows: () => ROWS, settleMs: 1800 });
    const v = await p.evaluate(() => { const bar = document.getElementById('modeBar'), B = [...bar.querySelectorAll('button')].map(x => x.getBoundingClientRect());
      const ov = B.some((a, i) => B.some((c, j) => j > i && a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1));
      return { n: B.length, right: Math.max(...B.map(r => r.right)), left: Math.min(...B.map(r => r.left)), minH: Math.min(...B.map(r => r.height)), barH: Math.round(bar.getBoundingClientRect().height), rows: new Set(B.map(r => Math.round(r.top))).size, ov, sx: document.documentElement.scrollWidth - innerWidth }; });
    check(w + ' px ' + theme + ': all ten tab buttons on screen, none overlapping, at least 30 px tall, no sideways scroll' + (w <= 390 ? ', at most ' + (w < 390 ? 5 : 4) + ' rows' : ''), v.n === 10 && v.left >= 0 && v.right <= w && !v.ov && v.minH >= 30 && v.sx <= 0 && (w > 390 || v.rows <= (w < 390 ? 5 : 4)), v);
    check('no page errors (' + w + ' ' + theme + ')', !errors.length, errors);
    await ctx.close(); }
  // ---- 2. cover range rows: fixed 2.5-point steps, the same totals
  { const { ctx, page: p, errors } = await openPractice(b, { html, settleMs: 1800 });
    const D = '2026-11-05';
    const A = [0.4499, 0.45, 0.4749, 0.475, 0.4999, 0.50, 0.5249, 0.525, 0.62, 0.63, 0.7999, 0.80, 0.91];
    const R = await p.evaluate(([A, D]) => {
      const mk = (i, a) => ({ id: 'v516b' + i, key: 'v516b' + i, date: D, name: 'Cover ' + i, sport: 'NBA', market: (10.5 + i) + ' Points', side: 'O', book: 'Novig', odds: '-110', stake: 1, kind: 'prop', result: i % 2 ? 'win' : 'loss', start: D + 'T23:00:00Z', fair: '', snap: { at: D + 'T18:00:00Z', act: a, model: a, market: a } });
      A.forEach((a, i) => logged.push(mk(i, a)));
      logged.push({ id: 'v516none', key: 'v516none', date: D, name: 'No cover', sport: 'NBA', market: '9.5 Points', side: 'O', book: 'Novig', odds: '-110', stake: 1, kind: 'prop', result: 'win', start: D + 'T23:00:00Z', fair: '', snap: { at: D + 'T18:00:00Z' } });
      logged.push({ id: 'v516p', key: 'v516p', kind: 'parlay', sport: 'PARLAY', book: 'PrizePicks', name: 'Parlay', market: '2-pick parlay', odds: '+200', stake: 1, date: D, dateSet: true, start: D + 'T23:00:00Z', result: 'loss', parlay: { picks: 2, pk: { legs: [{ p: 0.575 }, { p: 0.5749 }] } }, snap: { at: D + 'T18:00:00Z' } });
      lcDay = D; lcMonth = D.slice(0, 7); lcRender();
      const B = lcBands(D), C = B.C, five = C.reduce((t, x) => t + x, 0);
      const rows = [...document.querySelectorAll('#lcBands .lc-band')].map(x => { const s = x.querySelector('span'); const lab = s.querySelector('.cv-chip, .linkbtn') || s; return { lab: (lab.textContent || '').trim(), grey: ((s.querySelector('.meta') || {}).textContent || '').trim(), n: +(x.querySelector('b').textContent.split(' ')[0]) }; });
      const sub = document.getElementById('lcBandSub').textContent;
      // the study, Reports and the CSV row word
      let study = [], rep = [], csv = [];
      try { renderStudy(); study = [...document.querySelectorAll('#studyRows tr td:first-child')].map(td => td.textContent.replace(/\s+/g, ' ').trim()); } catch (e) { study = ['ERR ' + e.message]; }
      try { rep = logged.filter(b => /^v516b/.test(b.id)).map(b => rpGroupKey(b, 'band')); } catch (e) { rep = ['ERR ' + e.message]; }
      return { rows, n: B.n, five, C, sub, study, rep, order: (() => { try { return rpGroupOrder('band'); } catch (e) { return []; } })() };
    }, [A, D]);
    const LBL = ['<45%', '45–<47.5%', '47.5–<50%', '50–<52.5%', '52.5–<55%', '55–<57.5%', '57.5–<60%', '60–<62.5%', '62.5–<65%', '65–<67.5%', '67.5–<70%', '70–<72.5%', '72.5–<75%', '75–<77.5%', '77.5–<80%', '80%+'];
    check('the calendar lists the 16 fixed 2.5-point rows, labelled exactly <45% … 80%+, then Unknown', JSON.stringify(R.rows.slice(0, 16).map(x => x.lab)) === JSON.stringify(LBL) && R.rows.length === 17 && /Unknown/.test(R.rows[16].lab), R.rows.map(x => x.lab));
    const by = Object.fromEntries(R.rows.map(x => [x.lab, x.n]));
    const wantN = { '<45%': 1, '45–<47.5%': 2, '47.5–<50%': 2, '50–<52.5%': 2, '52.5–<55%': 1, '55–<57.5%': 1, '57.5–<60%': 1, '60–<62.5%': 1, '62.5–<65%': 1, '65–<67.5%': 0, '67.5–<70%': 0, '70–<72.5%': 0, '72.5–<75%': 0, '75–<77.5%': 0, '77.5–<80%': 1, '80%+': 2, 'Unknown': 1 };
    check('edges: 44.99% <45 · 45.0% and 47.49% in 45–<47.5 · 47.5% and 49.99% in 47.5–<50 · 50.0% and 52.49% in 50–<52.5 · 52.5% and the 57.49% leg 52.5/55… · 79.99% in 77.5–<80 · 80.0% and 91% in 80%+', Object.keys(wantN).every(k => by[k] === wantN[k]), by);
    const sum = R.rows.reduce((t, x) => t + x.n, 0);
    check('the rows add up to the same total as the 5-point bands (13 singles + 1 no cover + 2 parlay legs = 16)', sum === 16 && R.n === 16 && R.five === 16 && /16 picks/.test(R.sub), { sum, n: R.n, five: R.five, sub: R.sub });
    const pairs = [[2, 1, 2], [3, 3, 4], [4, 5, 6], [5, 7, 8], [6, 9, 10], [7, 11, 12], [8, 13, 14]];
    check('each named band equals its two rows (Coin Flip = 45–<47.5 + 47.5–<50, Lean = 60–<62.5 + 62.5–<65 …)', pairs.every(([k, i, j]) => R.C[k] === R.rows[i].n + R.rows[j].n) && R.C[1] === R.rows[0].n && R.C[9] === R.rows[15].n, R.C);
    check('the band name sits in grey next to each row (Lean next to 60–<62.5% and 62.5–<65%)', R.rows[7].grey === 'Lean' && R.rows[8].grey === 'Lean' && R.rows[1].grey === 'Coin Flip' && R.rows[15].grey === 'High Cover', R.rows.map(x => x.grey));
    check('Performance › Bet result study uses the same rows', R.study.includes('45–<47.5% Coin Flip') && R.study.includes('47.5–<50% Coin Flip') && R.study.includes('80%+ High Cover') && !R.study.some(x => /^Lean/.test(x)), R.study);
    check('Reports › By Band uses the same rows, highest first', R.rep[1] === '45–<47.5% · Coin Flip' && R.rep[3] === '47.5–<50% · Coin Flip' && R.rep[11] === '80%+ · High Cover' && R.order[0] === '80%+ · High Cover' && R.order[15] === '<45% · Unlikely', { rep: R.rep, order: R.order.slice(0, 3) });
    // a tap on a row lists exactly those bets in the Bet log
    await p.evaluate(() => { const bt = [...document.querySelectorAll('#lcBands button.lbf')].find(x => x.textContent.trim() === '47.5–<50%'); bt && bt.click(); }); await p.waitForTimeout(400);
    const f = await p.evaluate(() => ({ filter: logBandFilter, txt: ((document.getElementById('logFilter') || {}).textContent || '').replace(/\s+/g, ' '), n: logged.filter(b => logInBand(b, logBandFilter) && (gameDayOf(b) || b.date) === logDayFilter).length }));
    check('tapping 47.5–<50% filters the Bet log to its 2 bets, and says so', f.n === 2 && /47\.5–<50%/.test(f.txt) && /2 bets/.test(f.txt), f);
    check('no page errors (cover rows)', !errors.length, errors);
    await ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
