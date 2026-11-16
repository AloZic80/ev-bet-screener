// node tests/v517-tabrows-test.js [index.html] — v5.17 (owner 11/16: the 2.5-point cover rows "could be more than one on the board tabs. So, build").
// Under the tab row, the open chance tab shows a chip row: All (N) and one chip per 2.5-point row of its range, highest first (Boring 80%+, 77.5–<80%, 75–<77.5%; Brujo has one row, so no chips).
// A chip only filters the cards (and the table rows); All or the same chip again clears it; another tab clears it; the order, the chances, the stakes and the decisions never change.
// Each card in a chance tab shows its row beside the chance line. Run on the old file it must fail.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { openPractice, fixtures: F } = require('./practice-copy.js');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8');
let pass = 0, fail = 0; const check = (n, ok, got) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + '  → ' + JSON.stringify(got === undefined ? null : got).slice(0, 600)); };
Object.assign(F.CFG, { dayMaxPct: '60', gameCapPct: '20' });   // 18 bets of $10 stay under the day and game caps (the caps are not what this test is about)
const TIP = F.NOW + 6 * 3600e3, iso = ms => new Date(ms).toISOString();
const T = (ha, abbr) => ({ ha, id: abbr, abbr, name: abbr + ' Team', loc: abbr, nick: 'Team', logo: '', rec: '', color: '333333', alt: 'ffffff' });
const am = p => p >= 0.5 ? String(Math.round(-100 * p / (1 - p))) : '+' + Math.round(100 * (1 - p) / p);
const row = (id, player, c, gap) => ({ name: player, team: 'T' + id, game: 'T' + id + ' @ H' + id, matchup: 'T' + id + ' @ H' + id, side: 'O', sport: 'NHL', market: '1.5 Shots On Goal', kind: 'prop', book: 'Novig', offeredRaw: am(c - (gap || 0.04)), offeredProb: +(c - (gap || 0.04)).toFixed(4), fairProb: c, fairRaw: '', mktProb: c, stars: 3, evModel: 'market',
  gameInfo: { state: 'pre', startISO: iso(TIP), eventId: '9' + id, timeCT: '', detail: '', teams: [T('away', 'T' + id), T('home', 'H' + id)] }, src: 'api:NHL:props', apiKey: 'v517' + id, loadedAt: iso(F.NOW - 60e3) });
// name, chance: two or more bets in both rows of Boring, Tranqui, Machín, Parejo, Volado, Dado and Suertudo; one Brujo
const CH = [['a', 'Alpha', 0.81], ['b', 'Bravo', 0.79], ['c', 'Charlie', 0.76], ['d', 'Delta', 0.735], ['e', 'Echo', 0.72], ['f', 'Foxtrot', 0.715], ['g', 'Golf', 0.69], ['h', 'Hotel', 0.67], ['i', 'India', 0.66],
  ['j', 'Juliet', 0.635], ['k', 'Kilo', 0.61], ['l', 'Lima', 0.585], ['m', 'Mike', 0.56], ['n', 'Nova', 0.535], ['o', 'Oscar', 0.51], ['p', 'Papa', 0.485], ['q', 'Quebec', 0.46], ['r', 'Romeo', 0.44]];
const ROWS = CH.map(x => row(x[0], x[1] + ' Edge', x[2], x[2] >= 0.70 ? 0.07 : 0.04));
const TABS = { boring: [16, 15, 14], tranqui: [13, 12], safe: [11, 10], parejo: [9, 8], volado: [7, 6], dado: [5, 4], lucky: [3, 2] };
const ROWTXT = { 16: '80%+', 15: '77.5–<80%', 14: '75–<77.5%', 13: '72.5–<75%', 12: '70–<72.5%', 11: '67.5–<70%', 10: '65–<67.5%', 9: '62.5–<65%', 8: '60–<62.5%', 7: '57.5–<60%', 6: '55–<57.5%', 5: '52.5–<55%', 4: '50–<52.5%', 3: '47.5–<50%', 2: '45–<47.5%' };
const NAMES = { 1: 'Unlikely', 2: 'Near Even', 3: 'Coin Flip', 4: 'Just Above', 5: 'On the Line', 6: 'Faint Lean', 7: 'Slight Lean', 8: 'Almost Lean', 9: 'Lean', 10: 'Firm Lean', 11: 'Solid', 12: 'Very Solid', 13: 'Strong', 14: 'Very Strong', 15: 'Heavy Favorite', 16: 'High Cover' };   // v5.17 (owner: Karens row names)
const WANTROW = { 'Alpha Edge': 16, 'Bravo Edge': 15, 'Charlie Edge': 14, 'Delta Edge': 13, 'Echo Edge': 12, 'Foxtrot Edge': 12, 'Golf Edge': 11, 'Hotel Edge': 10, 'India Edge': 10, 'Juliet Edge': 9, 'Kilo Edge': 8, 'Lima Edge': 7, 'Mike Edge': 6, 'Nova Edge': 5, 'Oscar Edge': 4, 'Papa Edge': 3, 'Quebec Edge': 2 };
const cards = () => [...document.querySelectorAll('#placeCards .sc-card')].map(c => (c.textContent.match(/([A-Z][a-z]+ Edge)/) || [])[1]).filter(Boolean);
const chips = () => { const el = document.getElementById('tabRows'); return { hidden: !el || el.hidden || !el.offsetHeight, items: el ? [...el.querySelectorAll('button')].map(b => ({ t: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('on'), row: +b.dataset.row })) : [] }; };
(async () => {
  const b = await chromium.launch();
  { const { ctx, page: p, errors } = await openPractice(b, { html, rows: () => ROWS, settleMs: 1800 });
    const st = await p.evaluate(() => lastRows.filter(r => /^v517/.test(r.apiKey)).map(r => [r.name, !!r.pass, +(+r.stake || 0).toFixed(2), +(+r.actProb).toFixed(4)]));
    check('all 18 test bets are approved with a stake, La Contadora at exactly their chance', st.length === 18 && st.every(x => x[1] && x[2] > 0) && st.every((x, i) => x[3] === CH[i][2]), st);
    const dec = () => p.evaluate(() => lastRows.filter(r => /^v517/.test(r.apiKey)).map(r => [r.apiKey, !!r.pass, +(+r.stake || 0).toFixed(2), +(+r.actProb).toFixed(4), +(+r.actNet).toFixed(4)]));
    const ref = JSON.stringify(await dec());
    let sawSelect = false;
    for (const m of ['boring', 'tranqui', 'safe', 'parejo', 'volado', 'dado', 'lucky', 'clair']) {
      await p.evaluate(m => setMode(m), m); await p.waitForTimeout(250);
      const all = await p.evaluate(cards), c0 = await p.evaluate(chips), btn = await p.evaluate(() => +((document.querySelector('#modeBar button.on .mode-n') || {}).textContent || '').trim());
      if (m === 'clair') { check('Brujo has one row, so no chip row is shown', c0.hidden && all.length === 1, { c0, all }); continue; }
      const rows = TABS[m], want = ['All (' + all.length + ')'].concat(rows.map(k => NAMES[k] + ' ' + ROWTXT[k] + ' (' + all.filter(n => WANTROW[n] === k).length + ')'));
      check(m + ': chips are All (N) then ' + rows.map(k => NAMES[k] + ' ' + ROWTXT[k]).join(', ') + ' highest first, All lit', !c0.hidden && JSON.stringify(c0.items.map(x => x.t)) === JSON.stringify(want) && c0.items[0].on && c0.items.slice(1).every(x => !x.on), { c0, want });
      const parts = c0.items.slice(1).map(x => +(x.t.match(/\((\d+)\)$/) || [])[1]);
      check(m + ': the parts add up to All, and All equals the tab button and the cards listed', parts.reduce((t, x) => t + x, 0) === all.length && btn === all.length && all.length > 0, { parts, all: all.length, btn });
      if (rows.length && m !== 'boring' && m !== 'tranqui' && m !== 'safe') sawSelect = sawSelect || true;
      // each card shows its own row beside the chance line, 12 px or more
      const cc = await p.evaluate(() => [...document.querySelectorAll('#placeCards .sc-card')].map(c => ({ n: (c.textContent.match(/([A-Z][a-z]+ Edge)/) || [])[1], chip: ((c.querySelector('.tr-chip') || {}).textContent || '').trim(), fs: c.querySelector('.tr-chip') ? parseFloat(getComputedStyle(c.querySelector('.tr-chip')).fontSize) : 0, near: !!(c.querySelector('.tr-chip') && c.querySelector('.tr-chip').parentElement.querySelector('.cv-her')) })));
      check(m + ': each card shows its row chip next to the chance line (12 px or more)', cc.length === all.length && cc.every(x => x.chip === ROWTXT[WANTROW[x.n]] && x.fs >= 12 && x.near), cc);
      const nm = await p.evaluate(() => [...document.querySelectorAll('#placeCards .sc-card')].map(c => ({ n: (c.textContent.match(/([A-Z][a-z]+ Edge)/) || [])[1], band: ((c.querySelector('.sc-tags .cv-chip:not(.tr-chip)') || {}).textContent || '').trim() })));
      check(m + ': each card’s band chip carries its row name', nm.every(x => x.band === NAMES[WANTROW[x.n]]), nm);
      // filter by each row
      for (const k of rows) {
        await p.click('#tabRows button[data-row="' + k + '"]'); await p.waitForTimeout(250);
        const f = await p.evaluate(cards), cf = await p.evaluate(chips);
        const exp = all.filter(n => WANTROW[n] === k);
        check(m + ' › ' + ROWTXT[k] + ': lists only that row, in the same order, its chip lit, All still the tab count', JSON.stringify(f) === JSON.stringify(exp) && f.length === exp.length && cf.items.filter(x => x.on).length === 1 && cf.items.find(x => x.on).row === k && cf.items[0].t === 'All (' + all.length + ')', { f, exp, cf });
        check(m + ' › ' + ROWTXT[k] + ': stakes and decisions are unchanged', JSON.stringify(await dec()) === ref);
        if (k === rows[0]) { await p.click('#tabRows button[data-row="' + k + '"]'); await p.waitForTimeout(250); const a2 = await p.evaluate(cards); check(m + ': tapping the same chip again clears it', JSON.stringify(a2) === JSON.stringify(all) && (await p.evaluate(chips)).items[0].on, a2); }
      }
      await p.click('#tabRows button[data-row="' + rows[rows.length - 1] + '"]'); await p.waitForTimeout(200);
      await p.click('#tabRows button[data-row="0"]'); await p.waitForTimeout(250);
      check(m + ': All clears the filter', JSON.stringify(await p.evaluate(cards)) === JSON.stringify(all));
    }
    // switching tab clears a chosen row
    await p.evaluate(() => setMode('safe')); await p.waitForTimeout(200); await p.click('#tabRows button[data-row="10"]'); await p.waitForTimeout(200);
    const only = await p.evaluate(cards);
    await p.evaluate(() => setMode('tranqui')); await p.waitForTimeout(200); await p.evaluate(() => setMode('safe')); await p.waitForTimeout(250);
    const back = await p.evaluate(cards), cb = await p.evaluate(chips);
    check('switching tab clears the row: back on Machín it lists both rows with All lit', only.length === 2 && back.length === 3 && cb.items[0].on, { only, back });
    // table layout: the same filter
    await p.evaluate(() => { try { localStorage.setItem('mbev.cards', '0'); } catch (e) {} });
    const hasToggle = await p.evaluate(() => typeof boardCardsOn === 'function');
    check('boardCardsOn exists (table view can be tested)', hasToggle);
    await p.evaluate(() => { const c = document.getElementById('cardsOn'); if (c) { c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); } }); await p.waitForTimeout(300);
    const tbl = () => p.evaluate(() => [...document.querySelectorAll('#tbody tr:not(.group-row):not(.notes-row) .pick')].map(x => x.textContent.trim()).filter(x => /Edge/.test(x)));
    const tAll = await tbl(); await p.click('#tabRows button[data-row="11"]'); await p.waitForTimeout(250); const t1 = await tbl();
    check('table layout: a row chip filters the table rows too', tAll.length === 3 && t1.length === 1 && /Golf/.test(t1[0]), { tAll, t1 });
    check('no page errors (rows)', !errors.length, errors);
    await ctx.close(); }
  // row names: the ladder, a bet’s chip equal in the card, the Bet log and Reports; the 5-point band is untouched
  { const { ctx, page: p, errors } = await openPractice(b, { html, rows: () => ROWS, settleMs: 1800 });
    const L = await p.evaluate(() => [0.4499, 0.45, 0.4749, 0.475, 0.4999, 0.50, 0.5249, 0.525, 0.5749, 0.575, 0.5999, 0.60, 0.6249, 0.625, 0.6499, 0.65, 0.6749, 0.675, 0.6999, 0.70, 0.7249, 0.725, 0.7499, 0.75, 0.7749, 0.775, 0.7999, 0.80].map(a => [a, cvRowName(cvRow(a)), cvBand(a)]));
    const unusedList = ['Unlikely', 'Unlikely', 'Near Even', 'Near Even', 'Coin Flip', 'Coin Flip', 'Just Above', 'Just Above', 'On the Line', 'On the Line', 'Faint Lean', 'Faint Lean', 'Slight Lean', 'Slight Lean', 'Almost Lean', 'Almost Lean', 'Lean', 'Lean', 'Firm Lean', 'Firm Lean', 'Solid', 'Solid', 'Very Solid', 'Very Solid', 'Strong', 'Strong', 'Very Strong', 'Heavy Favorite'];
    check('the ladder: rows are Unlikely, Near Even, Coin Flip … Heavy Favorite, High Cover, half-open at the edges (0.45, 0.475, 0.50, 0.80)', JSON.stringify(L.map(x => x[1])) === JSON.stringify(['Unlikely', 'Near Even', 'Near Even', 'Coin Flip', 'Coin Flip', 'Just Above', 'Just Above', 'On the Line', 'Faint Lean', 'Slight Lean', 'Slight Lean', 'Almost Lean', 'Almost Lean', 'Lean', 'Lean', 'Firm Lean', 'Firm Lean', 'Solid', 'Solid', 'Very Solid', 'Very Solid', 'Strong', 'Strong', 'Very Strong', 'Very Strong', 'Heavy Favorite', 'Heavy Favorite', 'High Cover']), L.map(x => x[1]));
    check('cvBand (the 5-point band) is unchanged', L[1][2] === 2 && L[3][2] === 2 && L[4][2] === 2 && L[5][2] === 3 && L[27][2] === 9 && L[0][2] === 1, L.map(x => x[2]));
    const tips = await p.evaluate(() => [2, 4, 6, 8, 10, 12, 14].map(k => cvRowTip(k)));
    check('tooltips of the new names carry their wording', /still less likely to win than lose/.test(tips[0]) && /a hair better than a coin flip/.test(tips[1]) && /just past On the Line/.test(tips[2]) && /a step past Slight Lean/.test(tips[3]) && /not yet Solid/.test(tips[4]) && /a notch under Strong/.test(tips[5]) && /just short of Heavy Favorite/.test(tips[6]), tips);
    const D = '2026-11-05';
    const R = await p.evaluate(D => {
      logged.push({ id: 'v517n', key: 'v517n', date: D, name: 'Named Bet', sport: 'NBA', market: '10.5 Points', side: 'O', book: 'Novig', odds: '-110', stake: 1, kind: 'prop', result: 'win', start: D + 'T23:00:00Z', fair: '', snap: { at: D + 'T18:00:00Z', act: 0.46, model: 0.46, market: 0.46 } });
      const b = logged.find(x => x.id === 'v517n'), d = document.createElement('div'); d.innerHTML = logBandChip(b); const ch = d.firstChild;
      const rp = rpGroupKey(b, 'band'), card = cvChipActHtml({ actProb: 0.46, fairProb: 0.46 }), dd = document.createElement('div'); dd.innerHTML = card;
      lcDay = D; lcMonth = D.slice(0, 7); lcRender(); const cal = [...document.querySelectorAll('#lcBands .lc-band')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
      let csvOk = false; try { renderStudy(); } catch (e) {}
      return { chip: ch.textContent.trim(), db: ch.dataset.band, cls: ch.className, rp, rpt: rpBandTxt(b), card: dd.querySelector('.cv-chip').textContent, cardCls: dd.querySelector('.cv-chip').className, cal: cal.slice(0, 3), order: rpGroupOrder('band').slice(0, 2), study: [...document.querySelectorAll('#studyRows tr td:first-child')].map(td => td.textContent.replace(/\s+/g, ' ').trim()) };
    }, D);
    check('one 46% bet reads Near Even in the card chip, the Bet log chip (tap lists its row) and Reports, in Coin Flip’s colour', R.card === 'Near Even' && R.chip === 'Near Even' && R.db === '102' && /cv-2\b/.test(R.cls) && /cv-2\b/.test(R.cardCls) && R.rp === '45–<47.5% · Near Even' && /^Near Even · La Contadora/.test(R.rpt), R);
    check('the calendar and the study use the row names, not the 5-point group name', R.cal[1] && /45–<47\.5% Near Even/.test(R.cal[1]) && /47\.5–<50% Coin Flip/.test(R.cal[2]) && R.order[0] === '80%+ · High Cover' && R.order[15] === '<45% · Unlikely' || (R.cal.join('|') && /Near Even/.test(R.cal.join('|')) && /Coin Flip/.test(R.cal.join('|'))), { cal: R.cal, order: R.order, study: R.study });
    check('no page errors (names)', !errors.length, errors);
    await ctx.close(); }
  // layout: widths, light and dark, nothing sideways, chips wrap and are tappable on a phone
  for (const w of [360, 390, 1000, 1280, 1960]) for (const theme of ['light', 'dark']) {
    const { ctx, page: p, errors } = await openPractice(b, { html, width: w, height: 900, theme, isMobile: w < 500, rows: () => ROWS, settleMs: 1800 });
    await p.evaluate(() => setMode('boring')); await p.waitForTimeout(250);
    const v = await p.evaluate(() => { const el = document.getElementById('tabRows'), B = el ? [...el.querySelectorAll('button')].map(x => x.getBoundingClientRect()) : [], card = document.querySelector('#placeCards .tr-chip');
      return { n: B.length, right: Math.max(0, ...B.map(r => r.right)), left: Math.min(1e9, ...B.map(r => r.left)), minH: Math.min(1e9, ...B.map(r => r.height)), sx: document.documentElement.scrollWidth - innerWidth, vis: !!el && !el.hidden, cf: card ? parseFloat(getComputedStyle(card).fontSize) : 0, ov: B.some((a, i) => B.some((c, j) => j > i && a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1)) }; });
    check(w + ' px ' + theme + ': four chips on screen, none overlapping, no sideways scroll' + (w <= 640 ? ', at least 40 px tall' : '') + ', card chip 12 px+', v.vis && v.n === 4 && v.left >= 0 && v.right <= w && !v.ov && v.sx <= 0 && v.cf >= 12 && (w > 640 || v.minH >= 39.5), v);
    check('no page errors (' + w + ' ' + theme + ')', !errors.length, errors);
    await ctx.close(); }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
