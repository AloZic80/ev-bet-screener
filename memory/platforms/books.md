# Books: what is confirmed

| Fact | Status |
|---|---|
| Kalshi: whole contracts; fee rounded up per order; limit price in whole cents | **outdated on contracts** (2026-11-14: Alonzo's Kalshi History shows fractional positions: 3.01 Yes $1.61, 10.09 Yes $4.51, 3.01 Yes $1.44, 1.81 No $0.99, and 4 Yes $1.17). The app still sizes Kalshi in whole contracts (v2.50 `kalshiFit`); the "On Kalshi, enter" strip gives 2-decimal shares. Fee rounding with fractions: one order checked 2026-11-14 (Miami (OH) Yes, Limit 52¢ taker, 3.01 filled, avg 53.41¢, cost $1.61, fees $0.05): the fee is **not** rounded up to the cent (the 7% curve gives at most $0.0527 on 3.01 shares at any price, so ceil would show $0.06); it looks charged to a fraction of a cent and only displayed rounded. One order only |
| Novig NHL player "Shots" props settle on shots on goal (the slip reads "Shots On Goal"; owner's Adam Fantilli 3+ Yes, 11/14). BettingPros calls the same market "Shots" | active (book-rule-confirmed, v5.08) |
| Kalshi college team codes equal ESPN's | **unverified** (kalshi.com not reachable from the build machine) |
| Novig app link `novigapp://events/<outcome>/novig/<stake>` | **unverified** (never confirmed on the owner's iPhone) |
| Novig "N+" means Over N−0.5 | active (v4.40) |
| Polymarket US 429 / Cloudflare 1015 = rate limit on the Worker's shared address | active (seen 2026-11-10) |
| Polymarket US: a Market order on a thin book shows "High slippage" and averages above the price shown (Aho 1+ assists: 44¢ shown, about 53¢ for $4.61). The cards say Limit at La Contadora's most (v4.79, `polyHow`) | active (owner's screenshots, 2026-11-12) |
| Polymarket US Limit form: whether it asks for shares or dollars, and whether shares can be fractional | **unverified** (the strip gives whole shares and the dollar amount) |
| Polymarket US moneyline / spread = ONE market with two sides: one team long (YES), the other NO; an underdog spread is NO on the favourite's market (Worker `live.js`) | active (how the Sentinels read the API) |
| Polymarket US moneylines on screen: Yes / No or one button per team | **unverified** (v4.79 names the side to press, e.g. CAR or SEA +1.5, and says YES / NO only when it knows) |
| Kalshi moneyline: one market per team (YES on "<team> wins"); spread: "<team> wins by over X", so an underdog +X is NO on the favourite's market (Worker `live.js`) | active; the app's Kalshi strip says so since v4.80 |
| A soccer Draw row (name Draw, team = the home team) | not read by the Worker since v3.44 (it was priced as the home team on Kalshi, Polymarket and Novig); the app never asks (v4.80). Each book's own draw market is not mapped yet |
| pinnapi live layout | **unverified** (from its docs) |
| Owner is in Texas: no DraftKings / FanDuel sportsbooks | active |
| Exchange integrations are read-only | active, never to change without the owner |
