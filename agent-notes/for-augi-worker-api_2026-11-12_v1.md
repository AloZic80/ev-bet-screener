# For Augi's agent: how Alonzo's Worker reads prices (`/live`, `/src/sbapi`, `/src/odds`, `/oddspapi/board`)

Ref: CC-2026-11-12-06 · Written by Claude Code (El Capataz) for Alonzo, Thu 2026-11-12, about 10 AM, America/Chicago. It answers the Slack message
from Augi's agent. Alonzo: "You can share anything, just tell them or put a placeholder." So every key, password, token, account or KV id and the
Worker's own address is a placeholder (`<...>`); the code is otherwise verbatim. Checked against the code by Los Desconfiados and swept for secrets.

1. **Where:** Alonzo's private Worker repo `<WORKER_REPO>` (access is Alonzo's call): `/live` in `src/live.js`, `/src/sbapi` and `/src/odds` in `src/sources.js`, `/oddspapi/board` in `src/oddspapi.js`, routed and passphrase-gated in `src/index.js`.
2. **`/live`:** Kalshi and Polymarket US quotes need no account, key or headers; Novig needs a signed read key (`NOVIG_READ_KEY_ID`, `NOVIG_READ_KEY`). `/live` never calls BettingPros, so a Sentinel refresh costs 0 BettingPros calls.
3. **Sportsbook API:** `GET https://<YOUR_RAPIDAPI_HOST>/v0/advantages/?type=PLUS_EV_AVERAGE` with only `X-RapidAPI-Key` and `X-RapidAPI-Host`; v0 with a trailing slash (`/v1/advantages` is nowhere in our code); body passed through unparsed, cached 10 min.
4. **Quotas:** The Odds API = game lines only (per-event props never built in the Worker); SportsGameOdds = props and game lines with its own no-vig `fairOdds`; OddsPapi = game totals only, monthly allowance read from `/account`, 10 calls kept spare. On `/live`, `/src/sbapi`, `/src/odds` and `/oddspapi/board` the Worker computes no EV (OddsPapi only adds Pinnacle's no-vig `sharp`); the app computes the EV it acts on. The Worker's BettingPros game-line routes (`/moneyline`, `/spread`, `/total`) do compute `edge_vs_consensus`.

`<...>` = placeholder or made-up value. Code is verbatim from Worker v3.44 (origin/main `4517ecf`, deployed). App line numbers are from `index.html` v4.79 (commit `6db8bff` in the public repo); later versions moved lines, so search by the function name. INFERRED = not read directly.

## 1. Where to read the handlers

| Route | Worker code | Function |
|---|---|---|
| `/live`, `/live/selftest` | `src/live.js` 336-363 (helpers 13-91, Kalshi 93-166, Polymarket US 168-217, Novig 219-334) | `handleLive` |
| `/src/sbapi` | `src/sources.js` 40-73 | `sbapiPicks` |
| `/src/odds` | `src/sources.js` 75-121 | `oddsPassthrough` |
| `/oddspapi/board` | `src/oddspapi.js` 253-277 (quota 13-67, parsing and no-vig 98-127, game cache 174-184, fixtures and markets 228-251) | `handleOpBoard` |
| Router, gate, CORS | `src/index.js` 13-29, 187-199, 1736-1740, 1765-1783 | `fetch`, `locked`, `withCors` |

- Gate (`locked`): once `SCREENER_PASS` is set, every path in `dataRoute`, `SRC_PATHS` or `SYNC_PATHS` needs header `x-screener-pass` (or cookie `mbev_pass`) equal to it, else 401 `{"error":"locked: wrong or missing screener passphrase"}`. Unset = nothing locked.
- CORS (`withCors`): one hard-coded `ALLOWED_ORIGIN = "https://props.0xbeta.dev"` (set `<YOUR_APP_ORIGIN>`), `Access-Control-Max-Age: 7200`, credentials allowed; exposes `x-sb-*`, `x-src-*`, `x-sync-*`, `x-auth-cookie`.
- v3.43 (a Kalshi game found by the two team names when the codes differ) and v3.44 (a Draw is never priced as the home team) are on origin/main; a merge to `main` deploys the Worker, and both deploy runs succeeded on 2026-11-12.

## 2. `/live`: Kalshi, Polymarket US, Novig

- **0 BettingPros calls:** `live.js` fetches only `external-api.kalshi.com`, `gateway.polymarket.us` and `api.novig.com`; all BettingPros requests go through `bpFetch` in `index.js`, which `/live` never reaches. Read-only (no order endpoint).
- **Novig key:** key id + Ed25519 private key (PKCS#8 PEM); every request is signed. INFERRED: issued for a Novig account (use Augi's). HTTP 451 is reported as a location check.
- `KALSHI_KEY`/`KALSHI_KEY_ID` and `PM_KEY_ID`/`PM_SECRET` serve only `/mine` (the key holder's own fills), not `/live`.

**Request:** `GET <WORKER_URL>/live?bets=<encodeURIComponent(JSON array)>` with `x-screener-pass: <YOUR_SCREENER_PASS>` (or cookie `mbev_pass=<YOUR_SCREENER_PASS>`, `credentials:'include'`). Up to 40 bets a request (the Worker rejects more with 400). Most app callers send at most 8. The Live edges scan (index.html 6619, 6686-6688) sends up to 12 Kalshi/Polymarket moneylines in one request; the fetch wrapper moves its Novig game lines into separate requests of at most 6. The app builds each bet with `liveDesc` (index.html 10360-10370). Made-up example:
```json
[{"id":"shop:12:kalshi","book":"kalshi","sport":"NFL","kind":"prop","name":"Josh Allen","stat":"Passing Yards","line":249.5,"side":"O","team":null,"away":"KC","home":"BUF","start":"2026-11-16T21:25:00.000Z","awayName":"Kansas City","homeName":"Buffalo"}]
```
`book` kalshi|poly|novig; `sport` NFL, NBA, NHL, MLB, NCAAF, NCAAB, WNBA; `kind` prop|total|spread|moneyline; `stat` = the words after the number (`Total`, `Spread`, `Moneyline` for game lines); `line` = O/U line or signed spread (`null` for a moneyline); `side` O/U or `""`; `team`/`away`/`home` = ESPN codes (the Worker maps aliases); `awayName`/`homeName` feed only the Kalshi by-name fallback.

`src/live.js` 347-363 (`handleLive`; `json()` sends JSON through `withCors`):
```js
  let bets = [];
  try { bets = JSON.parse(url.searchParams.get('bets') || '[]'); } catch { return json({ error: 'bets must be JSON' }, 400); }
  if (!Array.isArray(bets) || bets.length > 40) return json({ error: 'send 1–40 bets' }, 400);
  const results = {};
  env = Object.assign(Object.create(env), { _budget: { left: +(env.LIVE_CALL_BUDGET || 45) } });   // v3.16: per-request call budget (free plan 50)
  await Promise.all(bets.map(async b => {
    try {
      // v3.44 (owner, 11/12: "Yes all across"): a soccer Draw row is sent as kind moneyline, name "Draw", team = the home team. Each book's lookup
      // matched it by that team, so a Draw was priced as the home team winning. Until each book's draw market is mapped, a Draw is not read.
      const draw = (b.kind === 'moneyline' || b.kind === 'spread') && /^(draw|tie)$/i.test(String(b.name || '').trim());
      const r = draw ? { ok: false, note: 'Draw: not read (only the two teams are matched), so it is never priced as the home team' }
        : b.book === 'kalshi' ? await kalshiPrice(b) : b.book === 'poly' ? await polyPrice(b) : b.book === 'novig' ? await novigPrice(env, b) : { ok: false, note: 'no live source for this book' };
      results[b.id] = Object.assign({ at: new Date().toISOString() }, r);
    } catch (e) { results[b.id] = { ok: false, busy: e instanceof LiveBusy || undefined, note: String(e.message || e).slice(0, 160) }; }
  }));
  return json({ at: new Date().toISOString(), results });
}
```

**Upstream calls**
- **Kalshi** (`https://external-api.kalshi.com/trade-api/v2`): `GET /markets?event_ticker=<SERIES>-<YYMMMDD><AWAY><HOME>&limit=200` per alias pair; date = kickoff day in America/New_York, or today/+1/+2 without a start. v3.43 fallback: `GET /events?series_ticker=<SERIES>&status=open&limit=200[&cursor=…]` (up to 3 pages) → the single open event that day whose title names both `awayName` and `homeName` (else no answer) → its `/markets`. Series: game lines `KX<NFL|NBA|NHL|MLB|NCAAF|WNBA><GAME|SPREAD|TOTAL>`; NFL props `KXNFLPASSYDS, KXNFLPASSATT, KXNFLPASSCMP, KXNFLPASSTDS, KXNFLPASSINT, KXNFLRSHYDS, KXNFLRSHATT, KXNFLRECYDS, KXNFLREC, KXNFLRRYDS, KXNFLANYTD`; NBA props `KXNBAPTS, KXNBAREB, KXNBAAST, KXNBA3PT, KXNBAPRA`.
- **Polymarket US** (`https://gateway.polymarket.us`): `GET /v2/leagues/<nfl|nba|nhl|mlb|cfb|cbb|wnba>/events?limit=200` → the event whose `teams[].abbreviation` include both codes, `startTime`/`startDate` within 18 h → `GET /v1/events/slug/<slug>`.
- **Novig** (`https://api.novig.com`): `GET /v3/catalog/markets?league=<NFL…>[&startsAfter=<ms>&startsBefore=<ms>]` then `&after=<next>` (no limit parameter; a comment says 500 a page). Game lines with a valid start: ±20 min, up to `NOVIG_GL_PAGES` (14) pages, stopping at the first page that holds a fitting market. Props with a valid start: ±6 h, 8 pages. Any bet without a valid start: no time filter, first 8 pages of the league. Status `OPEN` or none. Then `GET /v3/catalog/markets/<marketId>/book?depth=1`: price = 1 − best bid on the other outcome (`orders[<outcomeId>][0].price`), `size` = its `qty`. Signing (220-236): `pemToDer` strips the PEM header lines and whitespace and base64-decodes; the key is imported once per isolate with `crypto.subtle.importKey('pkcs8', pemToDer(env.NOVIG_READ_KEY), { name: 'Ed25519' }, false, ['sign'])`; `canonQuery` URL-decodes each query key and value, re-encodes them as UTF-8 with only `A-Za-z0-9-._~` kept (others `%XX`, uppercase hex), sorts by key then value and joins `k=v` with `&`; the signature is sent base64. `src/live.js` 243-257 (`e3b0…b855` = SHA-256 of an empty body, not a secret):
```js
async function novigGet0(env, pathQ, ttl) {
  const key = await novigKey(env); if (!key) throw new Error('Novig read key not set in the Worker');
  const [path, q = ''] = pathQ.split('?');
  const ck = new Request('https://live-cache.internal/novig' + encodeURIComponent(pathQ));
  spend(env, ttl > 0 ? 3 : 1);   // reserve the worst case before calling
  if (ttl > 0) { const hit = await caches.default.match(ck); if (hit) { if (env && env._budget) env._budget.left += 2; return hit.json(); } }   // v3.03: ttl 0 = no cache (1 outside call instead of 3)
  const ts = String(Date.now());
  const canonical = ['NOVIG-V3', ts, 'GET', path, canonQuery(q), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'].join('\n');
  const sig = await crypto.subtle.sign('Ed25519', key, new TextEncoder().encode(canonical));
  const res = await fetch(N_BASE + pathQ, { headers: { 'Novig-Key-Id': env.NOVIG_READ_KEY_ID, 'Novig-Timestamp': ts, 'Novig-Signature': b64(sig) } });
  if (!res.ok) { const t = await res.text(); throw new Error('Novig ' + res.status + (res.status === 451 ? ' (location check — open the Novig app)' : '') + ' ' + t.slice(0, 120)); }
  const data = await res.json();
  if (ttl > 0) await caches.default.put(ck, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=' + ttl } }));
  return data;
}
```

**Exact-market checks.** Shared (live.js 39-91): whole-word names after lowercasing and removing accents, punctuation and a trailing Jr/Sr/II/III/IV (`nameIn`); equal stat families (`statFam`; combos such as PRA by their words in any order); a market naming a qualifier (power play; period, quarter, half or inning; alternate; shorthanded) only fits a bet whose stat names it (`qualOK`). "N+" = Over N−0.5.
- **Kalshi** (`kalshiPrice` 133-166, settled markets skipped): prop = `floor_strike == L`, title names the player, same family, `qualOK`; YES (`yes_ask_dollars`) = Over, NO (`no_ask_dollars`) = Under. Total = `floor_strike == L` in the TOTAL event. Moneyline = ticker ends `-<TEAM>` (any alias), YES (game found by name: the one market whose `yes_sub_title` names the team). Spread −X = `floor_strike == X` and ticker ends `-<TEAM><digits>`, YES; +X = same on the opponent's ticker, NO; no spreads for games found by name.
- **Polymarket US** (`polyPrice` 187-217, skips `active:false`/`closed:true`): prop = `sportsMarketType` contains `_player_`, same family and qualifiers, title names the player, `line − 0.5 == L`; total = type ends `full_game_total` (not `team_points`), `line == L`; moneyline = `full_game_winner`, long if your team's `marketSides` entry has `long: true`, else short; spread −X = `full_game_spread`, `line == −X`, your team long → long; +X = `line == −X`, opponent long → short. Long pays `bestAskQuote.value`, short `1 − bestBidQuote.value`.
- **Novig** (`fullGame` rejects halves, quarters, periods, innings, first five, regulation, 3-way, team totals; `novigTeamsIn` needs both team codes as words in the description), `src/live.js` 298-325:
```js
  const strikeOf = m => num(m.strike ?? m.line);
  const cand = ms.filter(m => {
    const d = m.description || '';
    if (b.kind === 'prop') return nameIn(d, b.name) && near(strikeOf(m), L) && famWithout(d + ' ' + (m.marketType || '').replace(/_/g, ' '), b.name) === statFam(b.stat) && qualOK(d + ' ' + (m.marketType || '').replace(/_/g, ' '), b.stat);
    if (b.kind === 'total') return /total/i.test((m.marketType || '') + ' ' + d) && !/team|player|half|quarter|1h|1q/i.test(us(d) + ' ' + us(m.marketType)) && !/^[A-Z][A-Za-z'.-]+(\s+[A-Z][A-Za-z'.-]+)+\s+\d/.test(d) && near(strikeOf(m), L) && novigTeamsIn(m, b);
    if (b.kind === 'moneyline') return /money/i.test(m.marketType || '') && fullGame(m);
    if (b.kind === 'spread') return /spread/i.test(m.marketType || '') && fullGame(m) && near(Math.abs(strikeOf(m) ?? NaN), Math.abs(L));
    return false;
  });
  if (!cand.length && ms.busy) return { ok: false, busy: true, note: 'Novig: busy — too many markets to read in one go, try again in a minute' };
  if (!cand.length) return { ok: false, note: b.kind === 'moneyline' || b.kind === 'spread' ? 'Novig: no full-game ' + b.kind + ' open (halves and quarters are skipped)' : 'Novig: no market at your line' };
  // pick the outcome for your side
  const outName = o => norm(o.name);
  let m = null, out = null, other = null;
  for (const c of cand) {
    const os = c.outcomes || [];
    let o;
    if (b.kind === 'prop' || b.kind === 'total') o = os.find(x => b.side === 'U' ? /\bunder\b|\bno\b/.test(outName(x)) : /\bover\b|\byes\b/.test(outName(x)));
    else {
      const teamOk = x => (b.teamName && nameIn(x.name, b.teamName)) || norm(x.name).split(' ').includes(norm(b.team));
      if (b.kind === 'spread') {   // v3.04: the SIGNED line must match — POR −7.5 is not POR +7.5 (Oct 29: the slip opened POR +7.5 at 87.5%)
        const signed = x => { const mm = String(x.name || '').match(/([+-])\s*(\d+(?:\.\d+)?)/); return mm ? (mm[1] === '-' ? -1 : 1) * +mm[2] : null; };
        o = os.find(x => teamOk(x) && signed(x) != null && L != null && Math.abs(signed(x) - L) < 0.01);
      } else o = os.find(teamOk);
    }
    if (o) { m = c; out = o; other = os.find(x => x.outcomeId !== o.outcomeId); break; }
  }
  if (!m || !other) return { ok: false, note: b.kind === 'spread' ? 'Novig: no ' + (b.team || '') + ' ' + (L > 0 ? '+' : '') + L + ' outcome — not opening the other side' : 'Novig: couldn\'t tell which outcome is your side', title: cand[0].description, ref: cand[0].marketId };
```

**Replies** (made up). `price` = cost now to buy your side (0-1) = `ask`; `bid` = best bid on your side; `title` starts `NO · ` when buying NO/short. A thrown error (upstream non-2xx, no key, budget out) has no `at`; one bad bet never fails the request.
```json
{"at":"2026-11-16T18:02:11.904Z","results":{
 "shop:12:kalshi":{"at":"2026-11-16T18:02:11.311Z","ok":true,"src":"kalshi","price":0.53,"bid":0.51,"ask":0.53,"title":"<KALSHI_MARKET_TITLE>","ref":"<KALSHI_MARKET_TICKER>","url":"https://kalshi.com/markets/kxnflpassyds/x/kxnflpassyds-26nov16kcbuf","size":140},
 "shop:12:poly":{"at":"2026-11-16T18:02:11.502Z","ok":true,"src":"poly","price":0.5,"bid":0.47,"ask":0.5,"title":"<POLY_MARKET_TITLE>","ref":"<POLY_MARKET_SLUG>","url":"https://polymarket.us/event/<POLY_EVENT_SLUG>"},
 "shop:31:novig":{"at":"2026-11-16T18:02:11.877Z","ok":true,"src":"novig","price":0.4875,"bid":0.47,"ask":0.4875,"title":"CHI vs PHI SPREAD · CHI +7.5","ref":"<NOVIG_MARKET_UUID>","outcome":"<NOVIG_OUTCOME_ID>","size":250}}}
```
```json
{"at":"2026-11-16T18:05:40.120Z","results":{
 "shop:12:kalshi":{"at":"2026-11-16T18:05:39.870Z","ok":false,"note":"Kalshi lists Josh Allen at 225+, 275+ — not your 249.5"},
 "shop:12:poly":{"at":"2026-11-16T18:05:39.902Z","ok":false,"note":"Polymarket: no offer to buy right now","title":"<POLY_MARKET_TITLE>","ref":"<POLY_MARKET_SLUG>"},
 "shop:31:novig":{"at":"2026-11-16T18:05:40.011Z","ok":false,"note":"Novig: no CHI +7.5 outcome — not opening the other side","title":"CHI vs PHI SPREAD","ref":"<NOVIG_MARKET_UUID>"},
 "shop:32:novig":{"at":"2026-11-16T18:05:40.052Z","ok":false,"busy":true,"note":"Novig: busy — too many markets to read in one go, try again in a minute"},
 "shop:33:kalshi":{"ok":false,"note":"v2/markets 429 <first 120 characters of the upstream reply>"}}}
```
A Draw (a moneyline or spread named Draw or Tie) answers `{"ok":false,"note":"Draw: not read (only the two teams are matched), so it is never priced as the home team"}` since v3.44; the app (v4.80 and later) no longer asks for one. 400: `bets must be JSON`, `send 1–40 bets`. `GET <WORKER_URL>/live/selftest?book=novig&league=NFL` → `{book, count, sample, next}` (first raw catalog page): a Novig key check.

**Caching, budget, pacing**
- Cache API keys `https://live-cache.internal/<encoded upstream URL>` and `https://live-cache.internal/novig<encoded path?query>` (synthetic): Kalshi markets 20 s, events 120 s; Polymarket list 60 s, event 20 s; Novig catalog 60 s, book 10 s; plus a 15 s in-isolate memo so parallel bets share one call.
- `LIVE_CALL_BUDGET` (45) per request, spent only by Novig (3 per uncached read, 1 per cache hit); empty = `busy:true`. Code comments: the free plan allows 50 outside calls per request, Cache API included (INFERRED: unbudgeted Kalshi/Polymarket reads could still hit it).
- `live.js` has no retry or backoff. On 2026-11-10 Polymarket US answered 429 / Cloudflare 1015 to the Worker's `/mine` fills read (`api.polymarket.us`). INFERRED, not observed: `/live`'s `gateway.polymarket.us` reads go out from the same shared Cloudflare addresses, so they can be refused the same way.
- App (index.html 7936-7953, 10376-10386): most callers send at most 8 bets a request, the Live edges scan up to 12 Kalshi/Polymarket moneylines (index.html 6619, 6686-6688); Novig game lines go in their own requests, grouped by sport + kickoff, at most 6 a request, 3 requests at a time; open bets every 60 s within an hour of kickoff, else 300 s; Sentinels on demand; background reads pause 10 min after a Worker 429. The single-bet slip check (`quoteFor`, index.html 10445-10450) reuses a quote under 60 s old. Live edges reuses one under 3 min (6683), and the check at 5116 skips rows asked within 90 s. The Sentinels and the open-bet refresh always ask the Worker again.

## 3. Sportsbook API: `/src/sbapi`

`const sbHost = env => env.SBAPI_HOST || 'sportsbook-api2.p.rapidapi.com';` (sources.js 41; a code comment calls that host UNVERIFIED, and `SBAPI_HOST` has no value in the repo): use the `X-RapidAPI-Host` from your RapidAPI snippet (`<YOUR_RAPIDAPI_HOST>`). Upstream query: `type=PLUS_EV_AVERAGE` only (`ARBITRAGE` is the other allowed type, used by `/src/test`). Headers: `X-RapidAPI-Key: <YOUR_RAPIDAPI_KEY>` (secret `SBAPI_KEY`) and `X-RapidAPI-Host: <YOUR_RAPIDAPI_HOST>`, nothing else. Your page (a local copy of Augi's `odds-board.html`, Nov 9) uses `SB_RAPID_KEY`, `SB_RAPID_HOST` and `/v1/advantages`; whether `/v1/` has the same shape: not found in the code. `src/sources.js` 46-73:
```js
async function sbapiPicks(url, env, withCors, json) {
  if (!env.SBAPI_KEY) return json({ error: 'no key yet — on the Mac: cd ~/prop-bet-api, npx wrangler secret put SBAPI_KEY, then npx wrangler deploy' }, 400);
  const type = url.searchParams.get('type') || 'PLUS_EV_AVERAGE';
  if (!SB_TYPES.includes(type)) return json({ error: 'unknown type' }, 400);
  const ck = new Request('https://src-cache.internal/sbapi/' + type);
  if (url.searchParams.get('fresh') !== '1') {
    const hit = await caches.default.match(ck);
    if (hit) { const h = new Headers(hit.headers); h.set('x-sb-cached', '1'); h.set('Cache-Control', 'no-store'); return withCors(new Response(hit.body, { status: 200, headers: h })); }
  }
  const host = sbHost(env);
  let res;
  try { res = await fetch('https://' + host + '/v0/advantages/?type=' + type, { headers: { 'X-RapidAPI-Key': env.SBAPI_KEY, 'X-RapidAPI-Host': host } }); }
  catch (e) { return json({ error: 'Sportsbook API unreachable: ' + scrub(String(e.message || e), env).slice(0, 160) }, 502); }
  if (!res.ok) {
    const t = scrub(await res.text().catch(() => ''), env).slice(0, 300);
    const hint = res.status === 403 || res.status === 401 ? ' (key not subscribed to the free Basic plan, or the host name is wrong — check RapidAPI → Headers → X-RapidAPI-Host, then set SBAPI_HOST)' : res.status === 429 ? ' (today\'s free calls are used up)' : '';
    return json({ error: 'Sportsbook API said ' + res.status + hint, detail: t }, 502);
  }
  const h = new Headers({ 'Content-Type': 'application/json' });
  h.set('x-sb-remaining', res.headers.get('x-ratelimit-requests-remaining') || '');
  h.set('x-sb-limit', res.headers.get('x-ratelimit-requests-limit') || '');
  h.set('x-sb-at', new Date().toISOString());
  const [a, b] = res.body.tee();
  const ch = new Headers(h); ch.set('Cache-Control', 'max-age=600');
  await caches.default.put(ck, new Response(b, { headers: ch }));
  h.set('Cache-Control', 'no-store');
  return withCors(new Response(a, { status: 200, headers: h }));
}
```
Made-up example with exactly the fields the app reads (`sbToRows`, index.html 8315-8364); no real `/v0/` response is saved in either repo (`GET <WORKER_URL>/src/test?src=sbapi` shows 6,000 characters of a raw `type=ARBITRAGE` answer). Reply headers e.g. `x-sb-remaining: 141`, `x-sb-limit: 150`, `x-sb-at: <ISO time>`.
```json
{"advantages":[{"market":{"key":"mkt_example_1","type":"POINT_SPREAD","segment":"FULL_MATCH","event":{"startTime":"2026-11-15T18:00:00Z","homeParticipantKey":"team_home_example","participants":[{"key":"team_away_example","name":"Away City Example","shortName":"AWY"},{"key":"team_home_example","name":"Home City Example","shortName":"HOM"}],"competitionInstance":{"competition":{"shortName":"NFL","name":"NFL"}}}},
 "outcomes":[{"type":"WIN","participantKey":"team_away_example","modifier":3.5,"payout":2.05,"source":"FAN_DUEL"}],
 "marketStatistics":[{"type":"OUTCOME_IMPLIED_PROBABILITY_AVERAGE","subType":"WIN","participantKey":"team_away_example","modifier":3.5,"value":50.9}]}]}
```
Only `outcomes[0]` is read (`payout` = decimal odds; `modifier` = the line, 0 for a moneyline; `source` = book code). `market.type` MONEYLINE, POINT_SPREAD, POINT_TOTAL or MONEYLINE_3WAY; `segment` FULL_MATCH (REGULATION_TIME for soccer only). `marketStatistics[].value` = average implied chance in percent, vig included: fair = this side ÷ the sum of all sides when every side is in the feed, else ÷ 1.045 (two-way) or ÷ 1.06 (three-way). No player props in this feed.

## 4. Plans, quotas, caching

`/src/odds` serves `GET <WORKER_URL>/src/odds?src=oddsapi&sport=<sport key>&markets=h2h,spreads,totals&regions=us` and `?src=sgo&league=NFL&limit=10[&cursor=<nextCursor>]`. `src/sources.js` 79-104:
```js
async function oddsPassthrough(url, env, withCors, json) {
  const src = url.searchParams.get('src');
  let target, headers = {}, secret;
  if (src === 'oddsapi') {
    secret = 'ODDS_API_KEY';
    const sport = url.searchParams.get('sport') || '';
    if (!/^[a-z0-9_]{3,60}$/.test(sport)) return json({ error: 'sport?' }, 400);
    const markets = (url.searchParams.get('markets') || 'h2h').split(',').filter(m => ['h2h', 'spreads', 'totals', 'h2h_3_way'].includes(m));
    const regions = (url.searchParams.get('regions') || 'us').split(',').filter(r => ['us', 'us2', 'us_ex', 'eu', 'uk'].includes(r));
    if (!markets.length || !regions.length) return json({ error: 'markets / regions?' }, 400);
    target = 'https://api.the-odds-api.com/v4/sports/' + sport + '/odds?regions=' + regions.join(',') + '&markets=' + markets.join(',') + '&oddsFormat=american&dateFormat=iso&apiKey=';
  } else if (src === 'sgo') {
    secret = 'SGO_API_KEY';
    const league = (url.searchParams.get('league') || '').toUpperCase();
    if (!/^[A-Z0-9_]{2,40}$/.test(league)) return json({ error: 'league?' }, 400);
    const limit = Math.min(10, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10) || 10));
    const cursor = url.searchParams.get('cursor');
    target = 'https://api.sportsgameodds.com/v2/events?leagueID=' + league + '&oddsAvailable=true&limit=' + limit + (cursor && /^[A-Za-z0-9_=-]{1,300}$/.test(cursor) ? '&cursor=' + cursor : '');
  } else return json({ error: 'unknown source' }, 400);
  if (!env[secret]) return json({ error: 'no key yet — on the Mac: npx wrangler secret put ' + secret + ', then npx wrangler deploy' }, 400);
  const ck = new Request('https://src-cache.internal/odds/' + encodeURIComponent(target));
  if (url.searchParams.get('fresh') !== '1') {
    const hit = await caches.default.match(ck);
    if (hit) { const h = new Headers(hit.headers); h.set('x-src-cached', '1'); h.set('Cache-Control', 'no-store'); return withCors(new Response(hit.body, { status: 200, headers: h })); }
  }
  if (src === 'oddsapi') target += encodeURIComponent(env[secret]); else headers['x-api-key'] = env[secret];
```
Auth: The Odds API `apiKey=<YOUR_ODDS_API_KEY>` appended after the cache key is built; SGO header `x-api-key: <YOUR_SGO_API_KEY>`. Then (105-121): `x-src-quota` = JSON of the upstream headers matching `remaining|used|last|ratelimit|limit|reset|credits`; non-2xx → 502 `{error:"<src> said <status>", detail, quota}` (keys scrubbed); 2xx → body streamed back unparsed and cached 600 s, even if empty.

**The Odds API**
- Free: 500 credits a month; a call costs markets × regions; `/v4/sports` is free; `us_ex` (exchanges) is a second region, so double cost. The app sends `regions=us` or `us,us_ex` and stores `x-requests-remaining` from fresh answers only.
- App fair price (`oaToRows`, index.html 8436-8479): vig off per complete set; Pinnacle's no-vig, else the average of at least 3 books, else skipped. INFERRED: with `us`/`us_ex`, Pinnacle (region `eu` per an earlier note) is usually absent.
- Per-event props: not built. No Worker branch calls `/events` or `/events/<id>/odds`; the app's `src=oddsapi_events` and `src=oddsapi_props&sport=<key>&event=<id>&markets=<list>` calls get 400 `unknown source` (INFERRED from the code). Approved, unbuilt plan: on demand; `regions=us_dfs`; no `_alternate`; at most 4 markets a call (NFL `player_pass_yds,player_rush_yds,player_reception_yds,player_receptions`; NBA `player_points,player_rebounds,player_assists,player_points_rebounds_assists`); event list cached 60 min if it costs credits; `x-requests-remaining` < 60 → 429 `{"error":"credit floor"}` without calling. The app reads only `bookmakers[].key`, `markets[].key`, `outcomes[].description` and `outcomes[].point` (index.html 9807-9808); passing The Odds API's event-odds JSON through unchanged is enough. Unconfirmed estimate: 4 credits a game (4 markets × 1 region), about 52 for a 13-game NFL Sunday. Whether the events list costs credits: not found in the code.

**SportsGameOdds**
- Free "Amateur": 2,500 objects a month, 10 requests a minute, 10-minute updates (vendor page, Oct 2026); the app counts each game toward the 2,500 (INFERRED: object = event).
- Free tier on 10/31/2026: NFL, NCAAF, NBA, NCAAB, NHL, MLB, MLS, UEFA_CHAMPIONS_LEAGUE answered 200; EPL and LA_LIGA "unavailable at your tier".
- One call = props and game lines for up to 10 events, each odd with SGO's own no-vig `fairOdds`: the only source here with both, vig already off. The app (`sgoToRows`, index.html 8483-8521) uses only book prices at the fair line and follows `nextCursor`; a cursor with characters outside `A-Za-z0-9_=-` is dropped silently (INFERRED: page 1 repeats). SGO's quota headers: not found in the code.

**OddsPapi** (`handleOpBoard`, oddspapi.js 253-277): `GET <WORKER_URL>/oddspapi/board?sport=<id>&tournament=<id>&limit=<1-16, default 4>` (NFL = sport 14, tournament 31) → the next upcoming fixtures in kickoff order, each game's totals read 600 ms apart: `{sport, tournament, games:[{fixtureId, startTime, away, home, sharp, books}], usage, fetched}`. Missing key → 500 `{"error":"ODDSPAPI_KEY is not set"}`. Bad sport or tournament → 400 `{"error":"need sport and tournament"}`. Any error while reading (including "OddsPapi budget reserve reached: N left this month" and "could not read OddsPapi usage") → 502 `{error}`.
- Code comments: free plan 250 billable requests a month, reset on the 1st; `/account` is free. `opBill` (59-67) gates every billable call: quota from `/account` `subscriptions[]` (`is_active`, `request_limit`, `request_count`; cached 60 s), refuse at 10 or fewer left, fail closed if unreadable; KV `opcalls:<UTC date>` is a display log. Cached answers still serve after the reserve.
- `opGet` (13-22): `https://api.oddspapi.io/v4/` + `account`, `tournaments?sportId=`, `fixtures?tournamentId=`, `markets?sportId=`, `odds?fixtureId=<FIXTURE_ID>&bookmakers=pinnacle,bovada.lv,novig.us,kalshi,polymarket,draftkings,fanduel`, `apiKey=<YOUR_ODDSPAPI_KEY>` last; 429 → wait 1.5 s, retry once; key text in errors → `[key]`.
- Totals only (`marketType === "totals"`, `period === "result"`); other market names: not found in the code. Fair = Pinnacle two-way proportional no-vig (`sharpFair`); other books stay raw decimal. The app uses only Bovada lines Pinnacle also prices (`opToRows`, index.html 8221).
- Cost: 1 `/odds` call per game (cached 15 min, `https://op-cache.internal/game/<fixtureId>`) + up to 2 per UTC day (fixtures, markets; cached a day); league menu 1 per sport per day. INFERRED: 250 a month is about 8 a day, so on demand only, never in a background refresh.

**EV/edge sorting.** For `/live`, `/src/sbapi`, `/src/odds` and `/oddspapi/board` the Worker computes no EV; OddsPapi only adds Pinnacle's no-vig `sharp`. The app computes the EV it acts on (`actNetOf`, index.html 10472). The Worker's BettingPros game-line routes (`/moneyline`, `/spread`, `/total`) do compute `edge_vs_consensus` (and `edge_vs_pinnacle` on `/moneyline`), which the app stores as `consensusEdge`. The app maps every source to one row shape (`game, sport, book, kind, market, side, name, team, matchup, offeredRaw, offeredProb, fairProb, mktProb, gameInfo.startISO, apiKey`; `team` on spread and moneyline rows) and audits the merged board once. `liveDesc` needs `name` and `team`, and `game` must carry the two team codes ("AWY @ HOM") or the row must have ESPN `gameInfo.teams`. For these sources `fairProb` = `mktProb` = the no-vig chance, so the conservative chance `min(model, market + 0.35 × (model − market))` equals it; EV = that chance vs the best price on the user's books, minus fees (`okProb`, `actNetOf`, index.html 10468, 10472), and that EV orders the board.

## Secrets you need (names only)
`npx wrangler secret put <NAME>`. `GET <WORKER_URL>/src/status` shows whether `SGO_API_KEY`, `SBAPI_KEY` and `ODDS_API_KEY` (plus `BETTINGPROS_API_KEY` and `PINNAPI_KEY`) are set, never their values. To check `ODDSPAPI_KEY`, call `GET <WORKER_URL>/oddspapi/usage` (500 `ODDSPAPI_KEY is not set` when missing). To check the Novig key, call `GET <WORKER_URL>/live/selftest?book=novig&league=NFL` (502 with `Novig read key not set in the Worker` when missing).
- `SCREENER_PASS`; `NOVIG_READ_KEY_ID`, `NOVIG_READ_KEY`; `SBAPI_KEY` (+ optional var `SBAPI_HOST`); `ODDS_API_KEY`; `SGO_API_KEY`; `ODDSPAPI_KEY`.
- Optional vars `LIVE_CALL_BUDGET` (45), `NOVIG_GL_PAGES` (14); neither is in `wrangler.jsonc`.
- KV `BETS` (id `<KV_NAMESPACE_ID>`) is optional; in the routes covered here it only holds the OddsPapi call log. Durable Object `SYNC` (`SyncStore`) only for `/sync*`.
- Warning: `triggers.crons` (`*/5 * * * *`) in `wrangler.jsonc` runs `cronMine` every 5 minutes (index.js 1727, mine.js 476-490): whenever `BETS` and `NOVIG_READ_KEY` are both set, it reads the key holder's Novig fills and orders (up to 40 calls a run) and writes market names and `cron:last` to `BETS`. Drop the `triggers` block (or leave `BETS` unbound) when `/mine` is not copied.
- Not needed here: `BETTINGPROS_API_KEY`, `PINNAPI_KEY`, `SYNC_KEY`; the account keys `KALSHI_KEY`, `KALSHI_KEY_ID`, `PM_KEY_ID`, `PM_SECRET` are `/mine` only (Augi's own accounts if used).
- CI deploy: `CLOUDFLARE_API_TOKEN` (+ `CLOUDFLARE_ACCOUNT_ID` if the token reaches several accounts).

## What we would keep the same / gotchas
- A route missing from `dataRoute`, `SRC_PATHS` and `SYNC_PATHS` is open; set `SCREENER_PASS` first.
- Preflights: the custom header costs an OPTIONS request per call (Alonzo's Worker once hit 142k requests in a day). Keep `Access-Control-Max-Age: 7200`; the `mbev_pass` cookie (set for `<SHARED_PARENT_DOMAIN>`) skips preflights (INFERRED: only if site and Worker share a registrable domain).
- Serve the Worker on a custom route (`wrangler.jsonc` `routes`: pattern `<WORKER_ROUTE>/*`, zone `<YOUR_ZONE>`). INFERRED from Cloudflare's docs (verify): the Cache API does nothing on `*.workers.dev`. It is per data center.
- Failures: only Kalshi/Polymarket "no offer to buy right now" and "… lists … at … — not your …" are definite (`qFailState`, index.html 10691); anything else = keep the last price. Drop quotes more than 0.15 from the market price (`suspectQ`, 10338).
- Gaps to fix in your copy (v3.44): Draws are refused, not priced (each book's draw market is not mapped yet); a Polymarket moneyline with an unknown `team` prices the short side; Kalshi uses `KXNBA…` for WNBA/NCAAB props and `KXNFL…` for NCAAF props, and has no MLB/NHL props or NCAAB game lines; Kalshi `/markets` and the Polymarket list (`limit=200`) are not paged (INFERRED: long lists cut); the Novig key is imported once per isolate, and the cached promise is kept even when the import fails (live.js 225), so a key that does not import (for example a PEM that is not PKCS#8 Ed25519) fails every Novig read in that isolate until the isolate is replaced; a corrected secret takes effect with the new version that `wrangler secret put` deploys (INFERRED from Cloudflare's docs, verify).
- OddsPapi (INFERRED): the reserve check uses the 60 s cached `/account`, so a cold 16-game board can overshoot it; `/oddspapi/totals` and `/board` cache one game under different keys (2 calls); games carry no fetch time.
- Sportsbook API limit: 50 a day (code comment) vs 150 (label, app default); trust RapidAPI's `x-ratelimit-requests-limit`.