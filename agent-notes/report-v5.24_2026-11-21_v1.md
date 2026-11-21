# Report CC-2026-11-21-01: v5.24 Easy level (America/Chicago, 2026-11-21)

Tests: all 160 test files passed (tests/run-all.js, run in segments across container restarts, same commit): 0 failed.

Built: Easy level (Today, My bets, Learn, Settings), God level labels, "View as" switch, customer-build guard, exchange "What filled?" form. Reviews: 3 Opus passes (saved bets, money), 4 Karens. Every defect found was fixed with a failing-before test, except the owner decisions below.

Owner decisions: minimum stake for small banks (about $550 needed at the practice data); push grading of whole-number props; Easy price freshness (suggest 30 min); Easy ownership this tab vs device; hide exchange picks that cannot fill at their limit; sportsbook fallback form; Novig +219/+220; fill on a finished game; the moved card has no dismiss button; customer build needs a build step to strip dev strings; lawyer items (age/place gate, real help number, stake limits); G1 vs G2 labels; timers spend Worker calls; how Easy gets fresh prices.
Not tested: a real phone keyboard, real settlement, widths beyond the four checked, a real Worker sync.
