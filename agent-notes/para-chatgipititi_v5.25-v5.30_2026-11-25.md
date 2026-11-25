# Para ChatGiPiTiTi: v5.25 to v5.30, plus Worker v3.49 to v3.51 (2026-11-25)

**What the app is:** 0xBeta Screener, a one-file sports-betting price checker (props.0xbeta.dev). La Contadora (the app's math) finds bets with an edge (+EV), sizes the stake, says what to type at the book, and tracks results honestly. A Cloudflare Worker (api.0xbeta.dev) fetches prices, syncs the bet log and runs the AI helper.

**What was asked (owner) and what was built:**
- **v5.25 (Build A):** grading, bet history and storage fixes from a 12-auditor recheck (123 findings, 58 confirmed by skeptics).
- **v5.26 (Build B):** money and limits. Profit from exchange fills, partial sales, per-game cap applied to every row, a free bet counts $0 toward limits, the "both sides" consensus price in + Add a bet.
- **v5.27 (Jarvis):** the Scout pops up approved bets inside the owner's weekly time windows. Labels only; never changes a stake.
- **v5.28:**
  - Bet log › Import reads screenshots, several bets per picture, including DraftKings Predictions trades.
  - + Add a bet › Read slip preloads the right game, book, odds, payout and result.
  - The AI companion (El Compa) can fill the form and edit a saved bet. It always asks first, never changes a stake the owner did not state, and never overrides a book-set result.
- **v5.29:**
  - Save never silent: a green "Saved … Show it" or a red reason under the button.
  - A won or lost ticket with no date finds its team's most recent final game, marked for checking.
- **v5.30 (Paper money):**
  - Every card La Contadora approves (BET) whose chance is below the owner's plan minimum is recorded as a flat $1 paper bet.
  - Groups are reported apart: Unlikely <45%, and Coin Flip from 45% to the plan minimum.
  - It keeps the first price and the near-start price (closest to 5 minutes before start, within 30 minutes).
  - It is graded on the Worker from ESPN, even with the app closed, the same on every device.
  - Recording only: on 24 board setups, picks, stakes and totals are identical with it on or off.
- **Worker:**
  - v3.49 adds the screenshot jobs.
  - v3.50 simplifies the AI answer forms (Anthropic refused the v3.49 form as too complex), and a refusal now shows Anthropic's reason.
  - v3.51 adds paper-bet storage and grading: one ESPN game per 5-minute run, inside the free plan.

**The numbers:**
- Conservative chance = min(model, market + 0.35 × (model − market)), unchanged.
- The owner's 3 DK Predictions trades on 11/22 (MIN @ SF):
  - SF moneyline: cost 26.80 → paid 40.00, odds −203, profit +13.20.
  - McCaffrey anytime TD: 26.65 → 41.00, −186, +14.35.
  - Purdy 2+ passing TDs: 26.95 → 49.00, −122, +22.05.
  - Total +$49.60.
- Paper money's written guess, fixed before the first outcome: 48.5–50% beats 45–48.5% on flat-$1 ROI at the near-start price, judged after 100 outcomes and 50 games on each side (whole-game bootstrap, 5,000 draws).
- Tests: El Juez 175/175 for v5.30. Worker tests 61 (paper), 141 (AI), 15 (share), 6 (pinnapi).
- Reviews found 17 problems in Paper money and its Worker grading. All 17 were fixed, each with a test.

**Questions to check:**
1. Is a whole-game bootstrap with 100 outcomes and 50 games on each side a fair test of the written guess, or should it be larger before any reading?
2. The Worker voids a paper bet whose game moved more than 6 hours or was postponed past 72 hours, and parks a bet with no stat (player did not play). Does that match how you would treat them for a flat-$1 record?
3. The near-start price only exists when the app happened to load in the 30 minutes before a game. Should results be reported only on bets that have it, with "early price only" bets shown apart (as now), or pooled?
