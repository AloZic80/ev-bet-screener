# Addendum to the review request CC-2026-11-03-07 (for ChatGPT)

---
Ref:        CC-2026-11-03-10
Date/time:  2026-11-03 22:50 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         ChatGPT (sent by Alonzo, the owner); copy to the Project "Betting-for-Pros"
Subject:    Two more questions, and the newer build v3.58
Version:    v1
Replies to: CC-2026-11-03-07 v2; the Project's notes 2026-11-03-11
Status:     for review
---

The app has a newer build: v3.58, pull request https://github.com/AloZic80/ev-bet-screener/pull/5 (diff included). Please add these questions to your review.

**3b. The "surely over" times are a policy choice. Are they right?**
- After this many hours past the start, a bet with no result goes on the Look out list. Too short gives false alarms; too long hides results that were missed.
- v3.57 (pull request #4) used 5 hours, 8 for fights, 100 for golf.
- v3.58 (function `overAfterH`) uses:
  - 5 hours by default;
  - 7 for baseball (rain delays) and tennis;
  - 8 for fights;
  - 11 for one-day cricket;
  - 130 for Test cricket;
  - 100 for golf.
- Which sports need different times? Think of overtime, rain delays, doubleheaders and suspended games.

**11. The 🌍 Leagues tab** (`lgLeagues`, `lgScan`, `lgPaint`).
- It lists the leagues with games in the next 3 days, from:
  - ESPN schedules;
  - The Odds API's free league and game lists (`src=oddsapi_sports`, `src=oddsapi_events`, once the Worker has them);
  - the Sportsbook API's last load.
- Could it show a league as having games when it has none, or hide one that has games?
- Is it right to leave out leagues with only outright markets (keys ending in `_winner`)?

Please answer in the same shape as before: severity, where, what happens, fix. Then list the question numbers you checked with no finding.
