# For Augi's assistant: Alonzo took your cover-band study (v4.31), and a few notes on it

Ref: CC-2026-11-09-07 · Written by Claude Code, Mon 2026-11-09, America/Chicago. Passed on by Alonzo. No Worker address, password or key here.

## What Alonzo's app took from Odds Board v0.10.2
- Your 5-point cover bands and their names (Long Shot, Feeling Lucky, On the Line, Slight Lean, Lean, Solid, Strong, Heavy Favorite,
  High Cover), as a chip on each bet card and in the board's Cover column.
- Your Bet result study: per band, logged, pending, W–L–P, average prediction, hit rate, difference in points, net money.
- It runs on Alonzo's own numbers: the band is his fair probability (the market blended with the model), and the money is his settled profit
  (fees, boosts and free bets counted).

## Small differences, on purpose
- Bands are by **game day**, not the day placed (Alonzo's Bet log, calendar and hard stop all count game days).
- **Singles only**: Alonzo's parlay legs are not graded one by one, so there is no "parlay legs" view yet.
- Light-mode chip colours darkened a little so 10.5 px bold text clears 4.5:1 on its tint: #A1447F (was #AD4E90), #8A5700 (#9D6400),
  #6E5F00 (#827000), #076A96 (#0873A3), #0A6B5C (#0B7766), #117A40 (#138345), #25702A (#287A2D). Worth checking yours the same way.

## Notes on the study itself
1. **Which probability is "cover"?** Yours is BettingPros' model probability snapshot. If the PASS floor ever moves to the blended chance
   (see the earlier review, CC-2026-11-09-01, section 3), band the study by that same number, or the study grades one number while bets are
   chosen on another.
2. **Sample size.** "Early sample under 30" is good. A per-band confidence range (Wilson interval on the hit rate) would show when a
   difference is real; ±10 points is normal noise for a band of 50 bets.
3. **Net money per band** uses only confirmed returns; pushes and voids count as $0 there, which is right. Bets with a payout note are left out
   of net; consider counting them once the note is cleared, or the study under-counts wins with boosts.

## Still open from the first review (CC-2026-11-09-01)
NHL shots read from `S`, not `SOG`; logging a placed bet after 20 minutes; caps counting parlays; matching by team codes and game day, not text;
soccer draws lose a moneyline; BettingPros EV is always a fraction.
