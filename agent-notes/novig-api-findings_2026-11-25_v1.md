# Novig API: what the docs say (read 2026-11-25 by a helper agent; verify the key pages before building)
Ref: CC-2026-11-25-NOVIG-01 · source: https://docs.novig.com/ (pages listed at the end). No keys or secrets in this file.

## Orders
- Place: `POST /v3/orders` (key type `trading`). Body: `outcomeId` (the side you buy), `price` (decimal probability on a grid: 0.001 steps to 0.050, 0.005 steps 0.055 to 0.945, 0.001 steps 0.950 to 0.999), `qty` (whole contracts; a winner pays 1 cent each), `tif` (`GTC`, `GTT`, `IOC`, `FOK`, `PO`), optional `ttl`, optional `clientId`. 201 means queued, not resting; the `open` event on the private stream confirms it. **Not idempotent**: a retry can place a second order.
- Cancel: `DELETE /v3/orders/{id}` (idempotent). Batch place and cancel exist (up to 256 per batch). Order states: PENDING, OPEN, FILLED, CANCELED, REJECTED (a partial fill stays OPEN; track `remaining`).
- Private stream events: open, fill (price, qty, remaining, taker; no fee), cancel, reject.

## Keys and money
- Signed requests: headers `Novig-Key-Id`, `Novig-Timestamp` (within 30 s), `Novig-Signature` (Ed25519 or P-256 over a 6-line string with the body hash). Keys are created in the web app: Profile > Settings > Novig API.
- Key types: `management` (money yes, orders no), `management::read`, **`trading` (orders yes, money NO, one per subaccount)**, `trading::read`. Revoking takes up to 60 s and leaves resting orders on the book.
- **A dedicated subaccount funded with only the daily budget is a hard cap that no code can exceed** (the trading key cannot move money). Idea to confirm in the docs before relying on it.
- **Paper environment**: `https://api.paper.novig.com`: play money, no location check. Production `https://api.novig.com`. A key works only in the environment where it was created.

## What can block an unattended server
- **Location check on every placement** (cancels skip it): the IP must not be a restricted state (Arizona, Michigan, Nevada), a VPN, proxy or Tor; and the key holder's **last device geolocation from the Novig app must be under 3 days old**. Only opening the Novig app in a permitted state renews it. Codes: 451 `GEOLOCATION_EXPIRED` etc.; **retrying a 451 can get the account locked (423)**. `GET /v3/account/geolocation` shows when it expires.
- KYC must be passed (403 `KYC_REQUIRED`). Shared or proxy-fronted IPs can be flagged; the docs recommend a fixed IP you control; **not verified for Cloudflare Workers**. Clock skew over 30 s gives 401.
- Rate limits are token buckets per subaccount (numbers not captured; `GET /v3/limits` reports them).

## Fees and rules
- Taker pays `0.06 x P(1-P) x N x 1 cent`; **a maker never pays** (so limit "bait" orders pay no fee). From 2026-12-01 pre-game fee 0.03 on some markets.
- No policy on bots or automated trading, no API terms and no "Trade Credits" rule were found in the pages read. Still unconfirmed: read Novig's full terms (gate F).

## Pages read
https://docs.novig.com/ · /llms.txt · /api/api-keys.md · /api/environments.md · /api/concepts/order-lifecycle.md · /api-reference/execution/place-an-order.md · /api-reference/execution/cancel-an-order.md · /api/throttling.md · /api-reference/accounts/get-the-geolocation-status.md · /api/errors.md · /api/concepts/fees.md · /api/streaming/private.md. Not read: quickstart, signing, account model, batch pages, `/v3/limits`.
