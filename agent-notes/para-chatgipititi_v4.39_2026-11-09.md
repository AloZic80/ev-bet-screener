# Para ChatGiPiTiTi — 0xBeta Screener v4.39 (2026-11-09)

Ref: CC-2026-11-09-16 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. When you have already bet something, the board must say ALREADY BET and must never offer it again.

## What Alonzo asked
"I made this bet but it still shows as bettable on the app. That is a crucial fix we need!" The card: Jonathan Lekkerimaki (VAN) Over 1.5 Shots, Novig -108, Philadelphia @ Vancouver, 8:30 PM CT, score 88 STRONG.

## What was wrong
The bet came in from his Novig account and was logged in Novig's own words: "Jonathan Lekkerimäki" (with ä) and "1.5 Shots On Goal". The board's card says "Jonathan Lekkerimaki" and "1.5 Shots". The already-bet check for player props compared those texts exactly, so it never matched, and the card kept asking him to bet it again.

## What was built (v4.39)
A player prop now counts as the same bet when all of these hold:
- Same sport.
- Same player, ignoring accents and capitals; "J. Lekkerimaki" also counts.
- Same stat family: Shots, Shots On Goal and SOG are one family.
- No different period or power-play wording: 1st-period shots, or power-play points vs points, are other bets.
- Same line and same side.
- Same game: within 6 hours of the same kickoff.

The card now says ALREADY BET at -110 (the price he got) and leaves Place these. These are not counted as already bet:
- Over 2.5: another line.
- Nils Lekkerimaki: another player.
- The same prop two days later: another game.

The Under 1.5 is not already bet either; it says "you bet the Over on this, this is the other side".

The new test fails on the old version (2 of 8 checks) and passes on the new one. The full suite (`node tests/run-all.js`) ended "All tests passed".

## Question for ChatGPT
Books word the same NHL prop as "Shots", "Shots on Goal" or "SOG", and those are one market. Are there other common props where two books use different names for the same market, or the same name for different markets, that a duplicate-bet check should know about? Examples might be NBA "3-pointers made" vs "threes", or MLB "hits allowed" vs "hits".
