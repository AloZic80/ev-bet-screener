// Practice copy (for tests; copied from the practice harness, v5.14): opens index.html (or opts.html) at http://app.test/ with a fake, already-connected state and no real network. opts.rows(board) may change the invented board.
// Usage: const { openPractice } = require('.../practice/practice.js'); const { ctx, page, errors } = await openPractice(browser, { width: 1280, height: 900 });
const fs = require('fs'), path = require('path');
const F = require('./practice-fixtures.js');
const INDEX = path.join(__dirname, '..', 'index.html');
const ORIGIN = 'http://app.test';

// Worker answers (pathname -> JSON). /live is computed per request from the board.
function workerAnswer(pathname, url, board) {
  const j = o => ({ status: 200, body: o });
  switch (pathname) {
    case '/budget': return j({ limit: 50, used: 17, left: 33 });
    case '/src/status': return j({ sources: [
      { id: 'bettingpros', name: 'BettingPros', key: true, loads: true }, { id: 'pinnapi', name: 'Pinnacle', key: true, loads: true },
      { id: 'sgo', name: 'SportsGameOdds', key: true, loads: true }, { id: 'sbapi', name: 'Sportsbook API', key: true, loads: true },
      { id: 'oddsapi', name: 'The Odds API', key: true, loads: true }, { id: 'oddspapi', name: 'OddsPapi', key: true, loads: true }] });
    case '/oddspapi/usage': return j({ used: 41, limit: 250, left: 209, per_day: 7, days_left: 28, reserve: 20 });
    case '/mine/fills': return j({ fills: [] });
    case '/mine/orders': return j({ orders: [] });
    case '/mine/selftest': return j({ ok: true, note: 'practice copy: nothing was checked' });
    case '/src/test': return j({ ok: true, note: 'practice copy' });
    case '/bp/sports': return j({ results: {}, budget: { limit: 50, used: 17, left: 33 } });
    case '/pinnapi/live': return j({ events: [] });
    case '/oddspapi/sports': case '/oddspapi/leagues': case '/oddspapi/board': case '/oddspapi/totals': return j({});
    case '/moneyline': case '/src/odds': case '/src/sbapi': case '/close': return j({ props: [], rows: [], games: [], data: [] });
    case '/props': case '/spread': case '/total': case '/moneylines':   // loading new boards is not possible: a 429 leaves the saved board as it is
      return { status: 429, body: { error: 'Practice copy: loading new prices is switched off (the saved board stays)', _meta: { budget: { limit: 50, used: 50, left: 0, window: '24h', exhausted: true, next_free_at: new Date(F.NOW + 3600e3).toISOString() } } } };
    case '/live': {
      let bets = []; try { bets = JSON.parse(url.searchParams.get('bets') || '[]'); } catch (e) {}
      const R = {};
      bets.forEach(d => {
        const stat = String(d.stat || ''), line = d.line, nm = String(d.name || '').toLowerCase();
        const row = board.find(r => r.name.toLowerCase() === nm && String(r.market).replace(/^[+-]?[\d.]+\s+/, '') === stat && ((r.market.match(/^([+-]?[\d.]+)/) || [])[1] == null || parseFloat(r.market) === line))
          || board.find(r => r.name.toLowerCase() === nm && r.kind === d.kind);
        if (!row || /^(kalshi|poly|novig)$/.test(d.book) === false) { R[d.id] = { ok: false, note: 'practice copy: no price for this one' }; return; }
        const wiggle = ({ kalshi: -0.01, poly: 0.005, novig: 0.0 })[d.book] || 0;
        const price = Math.min(0.97, Math.max(0.03, row.offeredProb + wiggle));
        R[d.id] = { ok: true, src: d.book, price: +price.toFixed(3), bid: +(price - 0.01).toFixed(3), ask: +price.toFixed(3), title: d.name, ref: 'PRACTICE-' + d.id, at: new Date().toISOString(),
          url: d.book === 'kalshi' ? 'https://kalshi.com/practice' : d.book === 'poly' ? 'https://polymarket.us/practice' : undefined, outcome: d.book === 'novig' ? 'out-1' : undefined };
      });
      return j({ at: new Date().toISOString(), results: R }); }
    default:
      if (pathname.startsWith('/sync/head')) return j({ empty: true });
      if (pathname.startsWith('/sync')) return j({ empty: true, ok: true });   // sync is never stored
      return j({});
  }
}

async function openPractice(browser, opts) {
  opts = opts || {};
  const html = opts.html || fs.readFileSync(INDEX, 'utf8');
  const width = opts.width || 1280, height = opts.height || 900, theme = opts.theme;
  const ctxOpts = { timezoneId: 'America/Chicago', locale: 'en-US', viewport: { width, height }, deviceScaleFactor: 1 };
  if (opts.isMobile) Object.assign(ctxOpts, { isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const ctx = await browser.newContext(ctxOpts);
  await ctx.clock.install({ time: new Date(F.NOW) });
  const board = (opts.rows || (x => x))(F.BOARD_ROWS()), seed = {
    cfg: F.CFG, board: { v: 1, savedAt: new Date(F.NOW - 2 * 60e3).toISOString(), slate: F.DAY, rows: board }, log: F.LOG_ROWS(), pass: 'practice', theme: theme || null };
  await ctx.addInitScript(s => { try { if (sessionStorage.getItem('practiceSeeded')) return; sessionStorage.setItem('practiceSeeded', '1'); localStorage.clear();
    localStorage.setItem('mbev.cfg', JSON.stringify(s.cfg)); localStorage.setItem('mbev.cards', '1'); localStorage.setItem('mbev.pass', s.pass);
    localStorage.setItem('mbev.board', JSON.stringify(s.board)); localStorage.setItem('mbev.log', JSON.stringify(s.log));
    if (s.theme) localStorage.setItem('mbev.theme', s.theme); } catch (e) {} }, seed);
  const page = await ctx.newPage(); const errors = [], blocked = [];
  page.on('pageerror', e => errors.push(e.message));
  await ctx.route('**/*', route => {
    const req = route.request(), u = req.url(); let U; try { U = new URL(u); } catch (e) { return route.abort(); }
    if (u.startsWith(ORIGIN + '/')) return route.fulfill({ contentType: 'text/html', body: html });
    const cors = { 'access-control-allow-origin': req.headers()['origin'] || ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-expose-headers': '*' };
    if (/(^|\.)0xbeta\.dev$|\.workers\.dev$/.test(U.hostname)) {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' });
      const a = workerAnswer(U.pathname, U, board);
      return route.fulfill({ status: a.status, headers: Object.assign({ 'content-type': 'application/json' }, cors), body: JSON.stringify(a.body) });
    }
    if (U.hostname === 'site.api.espn.com' || U.hostname === 'site.web.api.espn.com') {
      const jr = o => route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(o) });
      const m = U.pathname.match(/\/sports\/(football\/nfl|basketball\/nba)\/(scoreboard|summary)/);
      if (m) {
        const sport = m[1] === 'football/nfl' ? 'NFL' : 'NBA';
        if (m[2] === 'scoreboard') return jr(F.scoreboard(sport));
        const g = F.GAMES.find(x => x.id === U.searchParams.get('event')); return g ? jr(F.summary(g)) : route.fulfill({ status: 404, headers: cors, body: '{}' });
      }
      if (/\/scoreboard/.test(U.pathname)) return jr({ events: [] });   // any other league: no games today
      if (/\/(injuries|roster)/.test(U.pathname) || /scoreboard\/header/.test(U.pathname)) return jr({ injuries: [], athletes: [], sports: [] });
    }
    if (/(^|\.)bettingpros\.com$/.test(U.hostname) && /\.(svg|png)$/.test(U.pathname)) {   // team logos: a plain grey disc with the code, no network
      const code = (U.pathname.match(/\/([A-Z0-9_]+)\.\w+$/) || [, '?'])[1];
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#d5dbe3"/><text x="20" y="24" font-size="11" font-family="sans-serif" text-anchor="middle" fill="#445">' + code.slice(0, 4) + '</text></svg>' }); }
    if (U.hostname === 'fonts.googleapis.com') return route.fulfill({ status: 200, contentType: 'text/css', body: '' });   // no web fonts: the page falls back to system fonts
    blocked.push(u); return route.abort();
  });
  await page.goto(ORIGIN + '/'); await page.waitForTimeout(opts.settleMs || 2500);
  return { ctx, page, errors, blocked };
}
module.exports = { openPractice, fixtures: F };
