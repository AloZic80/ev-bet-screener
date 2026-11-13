# For Augi's Personita: why only BettingPros works for you, and how Alonzo's screener reaches the other APIs

Ref: CC-2026-11-13-15 · Written by Claude Code (El Capataz) for Alonzo, Fri 2026-11-13, America/Chicago.
No keys, passwords, tokens, account ids or Worker addresses in it: every one is a placeholder `<...>`.

## The short answer
Alonzo's app does not call The Odds API, SportsGameOdds, Sportsbook API (RapidAPI), OddsPapi, Novig, Kalshi or Polymarket from the page.
The page calls **one small server of his own, a Cloudflare Worker**. The Worker holds the keys and calls the APIs for it.
GitHub alone cannot do that job safely, because GitHub Pages only serves files: everything in those files is public.

## How Alonzo's setup works
```
 Browser (props.0xbeta.dev, a plain HTML page on GitHub Pages: no keys in it)
    │  fetch('<WORKER_URL>/src/odds?...')  + header x-screener-pass: <the passphrase the user typed once>
    ▼
 Cloudflare Worker (his own, free plan)
    • keys stored as Worker secrets (ODDS_API_KEY, SGO_API_KEY, SBAPI_KEY, NOVIG_READ_KEY, ...): never sent to the browser
    • answers only his site's address (CORS) and only callers with the passphrase
    • caches answers (seconds to minutes) so a free monthly allowance is not burned by every reload
    • signs requests where an API needs it (Novig signs every call with a private key)
    ▼
 The APIs (BettingPros, The Odds API, SportsGameOdds, Sportsbook API, OddsPapi, Novig, Kalshi, Polymarket US)
```
- The page (HTML, CSS and JavaScript in one file) is public on GitHub and served by GitHub Pages. That is fine because it holds no secret.
- The passphrase is not in the code. Each user types it once in Settings, and it stays in that browser. Without it the Worker answers 401.
- ESPN scores need no key, so the page calls ESPN directly.

## Why "GitHub only" does not work, or is a bad idea
1. **A key inside the page is public.** GitHub Pages sends the whole file to every visitor. Anyone can press View Source, or open the browser's
   Network tab, and copy the key. They can use up the quota or get the account banned. This is true even if the repo is private: the
   published page is not.
2. **GitHub Secrets do not reach a Pages site.** Repository secrets are only for GitHub Actions while a job runs. If a build step writes a secret
   into the HTML, it is published with the page: point 1 again.
3. **Many APIs refuse calls from a browser.** A web page may only read another site's answer if that site allows it (CORS). Most odds APIs
   expect a server, not a page, so the browser blocks the answer even with a valid key. A Worker is a server, so CORS does not stop it.
4. **Some APIs need signing.** Novig wants every request signed with a private key. Doing that in the page means publishing the private key.
5. **Quotas.** Free plans are small (for example 500 credits a month, or 50 calls a day). With no server in between, every reload, tab and
   device spends calls. The Worker keeps a copy for a short time and answers repeat requests from it.

## Why BettingPros works for you and the others do not
Your page can reach BettingPros from the browser, and the other APIs are the ones that block a page or need a key that must stay hidden.
**Please check one thing:** if your BettingPros key is written in your HTML or JavaScript, anyone who opens your page can copy it.
Move it into a Worker too (step 3 below), and change the key at BettingPros if it has been public.

## Your options
| Option | Safe? | Work | Notes |
|---|---|---|---|
| **A. Your own Cloudflare Worker** (what Alonzo does) | Yes | About an hour once | Free plan is enough. Your keys, your quotas, your passphrase. Recommended. |
| B. Use Alonzo's Worker | Not as it is | His decision | It is locked to his site, his passphrase and his keys; you would share his quotas. Ask him first. |
| C. A GitHub Actions job that fetches odds on a schedule and saves a JSON file | Keys safe, data not | Medium | The saved odds are public in the repo, at least minutes old, and every run spends calls even when nobody looks. Some APIs forbid republishing their data. |
| D. Key in the page | No | None | Anyone can copy the key. Do not do this. |

## Option A, step by step (for your Personita)
1. Make a free Cloudflare account. On the computer: install Node.js, then `npm create cloudflare@latest augi-api` and choose "Hello World Worker".
2. Put each key in as a secret (it asks for the value; it is never in a file):
   ```bash
   npx wrangler secret put ODDS_API_KEY
   npx wrangler secret put APP_PASS
   ```
   `APP_PASS` is a passphrase you make up. You type it once in your page's settings. It is never written in the code.
3. Replace `src/index.js` with a small pass-through. Example for The Odds API (change `<YOUR_SITE>` to your page's address, for example
   `https://<you>.github.io`):
   ```js
   export default {
     async fetch(req, env) {
       const cors = { 'Access-Control-Allow-Origin': 'https://<YOUR_SITE>', 'Access-Control-Allow-Headers': 'x-pass', 'Vary': 'Origin' };
       if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
       if (!env.APP_PASS || req.headers.get('x-pass') !== env.APP_PASS) return new Response('locked', { status: 401, headers: cors });
       const url = new URL(req.url);
       if (url.pathname === '/odds') {
         const sport = url.searchParams.get('sport') || '';
         if (!/^[a-z0-9_]{3,60}$/.test(sport)) return new Response('sport?', { status: 400, headers: cors });
         const key = new Request('https://cache.internal/odds/' + sport);
         const hit = await caches.default.match(key);
         let body = hit ? await hit.text() : null;
         if (body === null) {
           const up = await fetch('https://api.the-odds-api.com/v4/sports/' + sport + '/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=' + env.ODDS_API_KEY);
           if (!up.ok) return new Response('The Odds API said ' + up.status, { status: 502, headers: cors });   // never echo the upstream text: it can contain the key
           body = await up.text();
           await caches.default.put(key, new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=120' } }));
         }
         return new Response(body, { headers: Object.assign({ 'Content-Type': 'application/json' }, cors) });
       }
       return new Response('not found', { status: 404, headers: cors });
     }
   };
   ```
4. `npx wrangler deploy`. It prints the Worker's address (`https://augi-api.<your-subdomain>.workers.dev`).
5. In the page, call the Worker, not the API:
   ```js
   const pass = localStorage.getItem('myapp.pass');   // typed once in Settings, never in the code
   const r = await fetch('<WORKER_URL>/odds?sport=americanfootball_nfl', { headers: { 'x-pass': pass } });
   const games = await r.json();
   ```
6. Add one route per API in the same way: `/sgo` for SportsGameOdds, `/sbapi` for Sportsbook API (RapidAPI wants `X-RapidAPI-Key` and
   `X-RapidAPI-Host` headers), `/bp` for BettingPros. Each key is its own secret.
7. Optional: put the Worker's code in its own GitHub repo, and let GitHub Actions run `wrangler deploy` on every merge, with the Cloudflare
   token in that repo's Actions secrets. That is how Alonzo's Worker deploys. That is the safe way to use GitHub here: GitHub holds the code,
   Cloudflare holds the keys.

## Rules Alonzo's side keeps (worth copying)
- Keys only as Worker secrets; never in the page, the repo, a chat, a screenshot or an error message.
- The Worker answers only your site's address and only with the passphrase.
- Read-only: no route that places orders.
- Cache every answer for a short time and count the calls, so a free plan lasts the month.
- If a key was ever public, change it at the provider.

If you want the exact routes Alonzo's Worker uses (`/live`, `/src/odds`, `/src/sbapi`, `/oddspapi/board`), ask Alonzo for the earlier note
`for-augi-worker-api_2026-11-12_v1.md` (same placeholders).
