# Worker autopilot: plan v1 (paper first)
Ref: CC-2026-11-25-AUTOPILOT-01 · written 2026-11-25 · by El Capataz (Claude Code). Owner's go, in his words: "A, paper first". No code is written yet; this plan needs his OK, and ChatGPT's review under the working rules.

## Goal
Bets placed **by the owner's own Worker** through Novig's API while he works, inside hard limits written in code. Samson (Claude Code on his Mac) does NOT place bets; it keeps preparing, checking and recording. After paper and the gates below, the Worker places real limit orders on its own.

## Flow (option A: the app triggers, the Worker acts)
1. The app (Jarvis, in an open tab) finds an approved Novig pick, with the app's stake and its exact limit (`limitExact`, the unrounded OK up to) and the Novig `outcomeId` from the live quote.
2. The app sends it to a new Worker route `/autobet` (screener passphrase header, like the other routes).
3. The Worker checks, in this order, and refuses on any failure: kill switch off; mode (PAPER or LIVE); the pick is Novig, today's game, not already sent (dedup key); the live Novig price from the Worker's own read is at or below the limit; order size between $1 and the per-order cap; **today's total (fills + open orders) plus this order is at or below the daily budget ($25 for now)**; the location check is valid (`GET /v3/account/geolocation`); never retry on 451 or 423.
4. It places a **limit order** (`POST /v3/orders`, tif GTC or GTT with a ttl, `clientId` set, never auto-resent) and writes an audit row. A cron every 5 minutes reads orders and fills and updates the day's counters.
5. The app shows an Autopilot card (Settings): mode, today's total, open orders, last decisions, a kill switch button.

## Hard limits (in the Worker's code)
- Daily budget $25 including open orders (owner, 2026-11-25; he will change it later in his words); per-order cap (to be set with him); only Novig; only picks the app sent as approved; one order per pick per day.
- A **dedicated Novig subaccount funded with only the daily budget** (a trading key cannot move money): a limit no code can pass. To confirm in the docs before use.
- Kill switch: a flag the Worker checks first; also revoking the key. Never use promo credits.
- Secrets only as Worker secrets (never printed, never in the app): separate PAPER and LIVE trading keys (a key works only in its own environment).

## Paper mode (no real money)
Same code against `https://api.paper.novig.com` (play money, no location check, its own key). Run about two weeks (it lines up with Samson's supervised run and the 2026-12-09 review). Compare what the Worker "bet" with what was approved and what the owner bet.

## Not in this plan
Moving La Contadora's math onto the Worker (stays in the app; frozen). Real money. Any change to a floor, stake rule, Kelly or cap.

## Gates before LIVE (each needs the owner's words)
1. Two weeks of paper that look right (orders match the picks; no duplicate; no breach of the budget).
2. Gate F: Novig's full terms on automation read (no ban found so far) by the owner or El Licenciado.
3. The owner's written rule (CLAUDE.md) with the numbers.
4. A funded $25 subaccount and a LIVE trading key set as a Worker secret by the owner himself.
5. A security review (La Guardia): no key in a log, URL or response; the kill switch tested; the dedup tested.
6. The owner's routine to open the Novig app at least every 3 days (the location check); the Worker stops, never retries, when it expires.
7. A merge into the Worker's `main` deploys it: the owner's go each time.

## Build steps (each: branch, tests, the owner's go)
S1 Worker: Novig signing (Ed25519 or P-256 with WebCrypto) and a read test against paper. S2 `/autobet` route with all checks and the audit log, PAPER only. S3 counters, cron reconcile, kill switch. S4 the app's Autopilot card and the trigger from Jarvis. S5 tests (the Worker's vitest suite) and La Guardia review. S6 paper run. Live is a separate decision.

## Questions for the owner
1. Per-order cap (a dollar figure)? 2. Only Novig approved picks, or also Parole bait orders? 3. Where does he create the paper key (the docs say paper has its own environment and keys)? 4. How will he be reminded to open the Novig app every 3 days?
