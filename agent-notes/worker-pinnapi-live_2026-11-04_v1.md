# Worker change: Pinnacle live markets (/pinnapi/live)
Ref: CC-2026-11-04-09 · From: Claude Code · To: Alonzo (paste into ~/prop-bet-api/src/index.js, then `npx wrangler deploy`)
No keys in here: the Worker reads PINNAPI_KEY from its secret, as it does now.

## 1. Add the address to the protected list (line ~1705)
In the `dataRoute` list, after `"/oddspapi/leagues"`, add `"/pinnapi/live"`, so it reads:
    ... "/oddspapi/sports", "/oddspapi/leagues", "/pinnapi/live"].includes(pathname) || ...

## 2. Send it to its handler (right after the line with "/oddspapi/leagues", line ~1743)
    if (pathname === "/pinnapi/live" && req.method === "GET") return withCors(await handlePinnLive(req, env));   // v3.73: Pinnacle live for Live edges

## 3. The handler (right below the line `const PINNAPI_BASE = "https://pinnapi.com";`, line ~829)
// v3.73: GET /pinnapi/live?sport_id=3 -> pinnapi's live markets (GET /kit/v1/markets?event_type=live), JSON passed through
// unchanged. Kept 10 s, so several devices scanning share one call. sport_id is pinnapi's own: 1 Soccer, 2 Tennis,
// 3 Basketball, 4 Hockey, 5 Football, 6 Baseball, 8 MMA, 9 Boxing, 13 Cricket.
async function handlePinnLive(req, env) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sport_id") || "";
  const out = (obj, status) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json" } });
  if (!/^\d{1,2}$/.test(sid)) return out({ error: "sport_id must be a number, e.g. 3 for basketball" }, 400);
  if (!env.PINNAPI_KEY) return out({ status: "no_key", events: [] });
  const key = new Request(`https://pinnapi-cache.internal/live/${sid}`);
  const hit = await caches.default.match(key);
  if (hit) return new Response(await hit.text(), { status: 200, headers: { "Content-Type": "application/json", "x-src-cached": "1" } });
  const r = await fetch(`${PINNAPI_BASE}/kit/v1/markets?event_type=live&sport_id=${sid}`, { headers: { "x-portal-apikey": env.PINNAPI_KEY } });
  const body = await r.text();
  const res = new Response(body, { status: r.status, headers: { "Content-Type": "application/json", "Cache-Control": "max-age=10", "x-src-at": new Date().toISOString() } });
  if (r.ok) await caches.default.put(key, res.clone());
  return res;
}

## 4. Deploy, then test during a live game
    cd ~/prop-bet-api && npx wrangler deploy
Then, while an NBA game is on (put your passphrase where it says):
    curl -s -H "x-screener-pass: YOUR-PASSPHRASE" "https://api.0xbeta.dev/pinnapi/live?sport_id=3" | head -c 3000
Paste Claude Code the OUTPUT only (not the command line: it has your passphrase). That shows the real layout, so the app
side is built against it, not a guess. If pinnapi names the sport parameter differently than sport_id, the output says so.
