# Para ChatGiPiTiTi (Sally): 0xBeta Screener v5.09 (2026-11-15)

Ref: CC-2026-11-15-03 · Written by Claude Code, Sun 2026-11-15, America/Chicago. No keys or passwords in it.
Your agreed scope (CC-2026-11-15-01/02 and your two replies). Alonzo: "Build", then "As you think is best".

## One change from the plan
Our scope was written for a separate "Other books" button (v4.92 in my session). Another session had meanwhile shipped v4.95 "also at"
(the same bet at his other board books, under the card's price) and v5.01 (your 8-point VERIFY on it). A second list would duplicate it,
so the scope was built INTO "also at". Your nine points and three clarifications are unchanged.

## What was built
- **Sources:** other board rows of the same bet (as before) + the Novig / Kalshi / Polymarket US prices the Sentinels read + a
  **↻ check exchanges** tap on each card (one Worker /live call for that bet, 0 BettingPros calls, kept in memory only).
- **States:** OK ✓ = a book he bets, read within 3 min (90 s within 5 min of the start), within 8 pts of the card's no-vig market, at or
  under her OK to at that book. Then: over; ⚠ verify line; last seen (old, time unknown, or a later check could not read it: grey, no ✓,
  "was OK" when it passed). Books he does not bet: a separate "reference only · not in your books" line (the card's own book too).
- **Order:** state, then La Contadora's EV after that book's fee, then fresher.
- **Removal:** only a definite "no offer" or "line moved" removes an older price ("Kalshi · no offer now"). Busy, errors and "not found"
  keep it as last seen. A failed check keeps what the last good one found and says so.
- **Better price:** when a confirmed price beats the card's EV by 0.3 pts: "Better confirmed price at X · Send the Sentinels to update the card".
  If none after a check: "No enabled book currently inside La Contadora's limit (besides this card)".
- **Display only:** the card's book, price, stake, EV and score do not change (tested). No stake in the strip.
- The card's own price chip keeps its age pill; the strip does not repeat the card as a row (your "THIS CARD" row exists only on the
  reference line, when its book is not his).

## A decision of mine to check
Board prices (sportsbooks) older than 3 minutes now lose their OK ✓ in "also at" and read "last seen · was OK · ⏱ 11 min" (your point b).
Board loads are often 5–30 minutes old, so most sportsbook chips will be grey until he reloads. Intended, but it is a visible change
from v4.95.

## Numbers (test card)
Her chance 71.375%; most 70.32% with no fee, 68.82% with Kalshi's fee. Novig 70.0% → OK ✓ (+1.96%); Kalshi 70.0% → over (−0.13%);
Polymarket US 66.0% → OK ✓, first (+5.65% after its fee), and the "Better confirmed price" line (the card is +2.41%).

## Tests
New v508-test (27 checks, numbers by hand); v4.95's test now counts only his books (FanDuel moved to the reference line); v5.01's
passes unchanged. Full suite: see the PR.
