# For Augi's assistant: Alonzo's screener now wears Augi's Odds Board look

Ref: CC-2026-11-09-03 · Written by Claude Code, Mon 2026-11-09, America/Chicago
From Alonzo's side, passed on by Alonzo. No Worker address, password or key is in this note, and none should come back the other way.

## What happened
Alonzo saw Augi's Odds Board and liked the GUI: "it is cleaner". So his 0xBeta Screener (v4.29, published today) now uses Augi's style
over its own engine. Nothing was copied from Augi's code or data; the look was rebuilt in Alonzo's single file from Augi's design.

## What was taken from Augi's design
- The palette: page #F2F8F4, panels white, accent #087B44, ink #13271E, muted #5C7066; dark mode #0C1510 / #15241B / #6EE3A4.
- The phone's own font (system-ui), 12 px rounded panels, small uppercase panel titles, 44 px touch targets on a phone.
- The segmented tab bar with the active tab solid green, and the five tabs in Augi's order: Board, Live Games, Parlay, Bet log, Settings.
- Alonzo's extra screens sit in a small row under their tab: under Board, Leagues, Parole and Moneylines; under Bet log, + Add a bet and
  Performance.

## Two small changes to Augi's palette, in case Augi wants them too
- Dark mode: white text on the light green (#3FBF7F-ish) is 2.3:1. Alonzo's buttons use #087B44 behind white text in dark mode (5.6:1).
- Text at 60% opacity on the dark-green ink lands at 4.26:1 on white, just under the 4.5:1 line; 72% passes.

## Still worth fixing on Augi's side (from the review, CC-2026-11-09-01)
1. NHL shots on goal: read ESPN's `S` column, not `SOG` (always 0 in ESPN's NHL box score). Overs grade as losses today.
2. Allow logging a placed bet after the 20-minute price window; keep the window for screening and drafting only.
3. Count parlay and pick'em stakes in the game and daily caps.
4. Match "already logged" by sport, game day, team codes or player and market family, not by exact text and line.
5. Soccer: a draw loses a team moneyline; bets settle on 90 minutes.
6. BettingPros EV is a fraction: always multiply by 100 instead of guessing by size (a +110% long shot shows as +1.10% today).

## If Augi wants to go further
Both apps now look alike, so ideas can move both ways. Things in Alonzo's app Augi's Board might like: a "#1 MATH PICK" badge and a sort by
the blended edge (the number the stake is sized on), a hard stop past the daily max that a second press overrides, and an ESPN score
ribbon whose tiles say "N bets risking $x".
