# (Record, CC-2026-11-15-04) v5.12 scope: forecast for every book fill the app can link (card_tapped + price-history recovery) · FINAL (Sally agreed 11/15; owner BUILD: "BUILD", "BUILD IT ALL")

Base documents (read them): $S/v506-scope.md (R1–R6: recovery object, 15-minute window, legacy local history, fobs ledger, display, reports, one-time pass),
$S/v506-plan.md (the code map and the skeptic's corrections A1–A7, B1–B10, C1–C14: they still apply; line numbers moved, find code by its text),
agent-notes para-sally_fill-forecast-recovery v1/v2/v3, para-sally_card-tapped_2026-11-15_v1.md. Where this file differs from them, THIS FILE WINS.

## Order of forecast sources for a logged bet (never overwrite an earlier one)
direct frozen forecast (snap.act from the card when the bet was saved)  >  card_tapped (below)  >  price-history recovery (legacy px / fobs)  >  "No forecast · not linked to a board observation"
Never create a band from the entry price as a forecast (the v4.87 ENTRY PRICE BAND stays a price band, labeled as such).

## C. card_tapped (new)
- C1 Trigger: a trusted user tap (isTrusted click) on the card's / board row's "open slip ↗" link (later "Place ↗"). Not on card open, Other books, scans, generated links. Save immediately on tap, before navigation.
- C2 Record (immutable, atomic): {id, source:'card_tapped', tappedAt, deviceId, timestampSource:'device', targetBook, exchangeMarketId?, exchangeOutcomeId? (when the card has them; today none for Novig), identity:{sport, eventId?, away, home, start, participant, marketFamily, exactMarketText, line, side, qualifiers, part:'full'|...}, forecast:{model, market, act, offeredPrice, marketSource, modelWeight, mathPolicy:'act-v2', appVersion}, cardState:{decision, stake, approved, actionable, awol, stale, gone}, expiresAt=min(kickoff, tappedAt+24h), status:'pending'}.
- C3 Match a fill (Novig, Kalshi, Polymarket: whichever fills the app reads): same book; exact identity: same sport, normalized ESPN teams, compatible verified start, participant, stat family + settlement qualifiers (nvPart must agree: a part-game fill never matches a full-game card), exact line, exact side; ids win when both sides have them, an id CONFLICT rejects; unknown/conflicting kickoff or teams → ineligible; tap ≤ fill placement < kickoff; exactly one candidate after taking the LATEST valid tap at or before the fill (keep earlier taps for audit).
- C4 Primary eligibility: tap-to-fill ≤ 15 min, verified timing (book placement time; no device-time conflict), valid act, card approved & actionable at tap time → `card_tapped_primary` (counts like a direct forecast: band, Said vs won, Brier/log loss, primary calibration). Otherwise (16 min to 24 h, or the card was AWOL/stale/zero-stake/not approved at tap) → `card_tapped_stale_display_only`: band and EV shown, labeled "CARD FORECAST · tapped 2h before placement · not in the main checks", kept out of primary calibration and the Scorecard's selection evidence.
- C5 EV at the actual fill price and fee: EV_fill = (act_tap/p_fill − 1 − f_fill)/(1 + f_fill). Save card price, fill price, gap, act, EV. Never change stake, price, result or accounting.
- C6 Unmatched or accidental taps: expire silently; never a bet, never in any statistic.
- C7 Repeated tickets on one outcome: both financial; one outcome statistically.
- C8 NO moneylines in v5.12 at all (stricter reading of both proposals): no card_tapped for moneylines, no px history pins for moneylines, no ledger recovery for moneylines; lsmlClass untouched.

## L. Ledger and sync (fobs + pending taps; Sally's answers)
- L1 Bounds: ≤ 8 observations per exact identity; ≤ 1,500 ACTIVE observations; 3-day retention; pending taps expire at kickoff or tap + 24 h. Records copied into a bet (consumed) do not count toward the active cap.
- L2 Pruning order: expired unmatched taps → older than 3 days → oldest excess per identity (> 8) → oldest global excess. Never prune a record a bet references only by id: copy the complete fields into the bet first (with the observation id and a checksum).
- L3 Lifecycle: active / consumed / sealed / expired_local. Consumed: complete copy into the bet, id + checksum saved, source marked sealed, forecast fields never mutated, kept until sync confirms, then prunable locally.
- L4 No synced deletions for automatic expiry (no tombstones); an expired record uploaded by another device is ignored/pruned deterministically from its expiresAt. Each record syncs as ONE sealed string (skeptic A3).
- L5 Sync traffic (skeptic A1): only records a bet links to, pinned records near a pending fill, and pending taps sync; ordinary sightings stay local (no whole-ledger sync every minute).
- L6 Settings diagnostic: "Forecast ledger: 842 / 1,500 active · 17 pending taps · oldest 2.4 days".
- L7 No new Worker or provider calls.

## A. Aliases (Sally: scope the evidence)
- A1 For recovery and card_tapped matching: aliases only when the settled contract is the same and confirmed: NHL + Novig: "Shots", "Shots OnGoal", "Shots On Goal", "SOG" → Shots on goal, with {aliasPolicy:'forecast-alias-v1', aliasEvidence:'novig_rule_confirmed', bookScope:'novig', sportScope:'NHL'}. Period / power-play / alternate qualifiers stay separate; exact line and side still required. Unconfirmed wording: unmapped.
- A2 Reports (v5.07/v5.08 market-alias-v1): make the plain "Shots" merge book-scoped the same way: it applies to Novig bets; plain "Shots" at another book stays its own family until confirmed there (display only; update tests/v507-test.js U2 with a // v5.12 comment).

## R. Display and reports
- R1 Bet log row: band and EV from the source, with a tag: "CARD FORECAST · tapped N min before placement" / "FORECAST RECOVERED · board N min before placement" / "PRICE MOVED …" as in v5.06 scope R4.
- R2 Reports: one compact line only when useful (any non-direct source in the period): "Forecast sources: 84 direct · 6 card-tapped · 3 recovered from history · 11 without forecast"; hidden when all are direct. Source classes: direct_card, card_tapped_primary, card_tapped_stale_display_only, price_history_recovered, model_fallback, no_forecast. Only direct and card_tapped_primary enter primary calibration (Said vs won calibration-v1 population stays as today for direct; card_tapped_primary joins it; history recoveries stay in their separate section per v5.06 R5).
- R3 CSV: append at the END: forecast_source, forecast_observed_at, forecast_age_min, forecast_identity_policy, forecast_identity_confidence, forecast_math_policy, forecast_app_version, forecast_model_pct, forecast_market_pct, forecast_act_pct, forecast_offered_then_pct, forecast_fill_price_pct, forecast_price_gap_pts, forecast_primary_eligible, forecast_exclusion_reason, forecast_observation_id, card_tapped_at, card_tap_to_fill_min, card_tapped_book, card_actionable_when_tapped. Blank when unavailable; never reconstructed.

## Rules
No change to accounting, stakes, results, floor, Kelly, caps or any decision. File style as always (// v5.12 comments, /* v5.12 */ CSS block, no apostrophes in single-quoted strings, function declarations, no duplicate names). Do NOT bump the version.
Tests: tests/v512-test.js covering C1–C8, L1–L6, A1–A2, R1–R3 with exact values, plus the v5.06-scope cases (window edges 15/16 min, price gaps 3/8, ambiguity, missing placedAt/kickoff, idempotent one-time pass); update signal-record-test (px points longer, skeptic A5) and any test whose text changes.
