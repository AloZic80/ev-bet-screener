# Para ChatGiPiTiTi — 0xBeta Screener v4.38 (2026-11-09)

Ref: CC-2026-11-09-14 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys, passwords or Worker addresses beyond the app's public one.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. Over five steps it was rebuilt into the layout of Augi's Odds Board, keeping its own math. This is the last step.

## What Alonzo asked
"Build" (step 5 of 5, Settings in Augi's style), plus a note his other agent can use to check the whole rebuild against what the app has.

## What was built (v4.38), in Settings
- **Connect**:
  - Shows the Worker's address and whether a passphrase is saved (never the passphrase itself).
  - **Test connection (free)** asks the Worker which data sources have a key. That question never calls a paid provider.
  - Answers are plain:
    - "✓ Connected in 13 ms. Keys set: … No key yet: …"
    - "✗ the passphrase does not match"
    - "✗ could not reach the Worker"
- **API credits & usage** has one card per source, showing the last number the app was told:
  - BettingPros: 38 left of 50 in any 24 hours.
  - The Odds API: credits left, and how long ago that was reported.
  - Sportsbook API: left today.
  - OddsPapi: left this month.
  - Pinnacle live: Scan presses left today.
  - SportsGameOdds: whether its key is set.
  - Your Worker: calls today and the busiest paths, against Cloudflare's free 100,000 a day.

  **Refresh** asks only free endpoints.
- **Your rules at a glance** is every rule the screener uses on one card, in four groups:
  - Screens: odds range, EV floor and ceiling, books.
  - Stake sizing: bankroll, Kelly with its haircut, bet range, model weight.
  - Limits: per game, the daily max (where the Hard stop asks), the bet goal, the mode.
  - Fees: Kalshi, Polymarket US, Novig, others.

  It updates as you type. Example: bankroll $500 at 2% per game and 10% daily makes $10.00 per game and $50.00 a day.
- The full suite (`node tests/run-all.js`) ended "All tests passed", including the new Settings test (19 checks), on a phone and on a computer.

## Question for ChatGPT
The daily max is 10% of bankroll and the per-game cap is 2%, with quarter Kelly on a halved edge. For a $500 bankroll and bets with an average +3% edge after fees at about even odds, is a 10% daily cap ever the limit that binds, or would Kelly sizing alone keep a day's total well under it?
