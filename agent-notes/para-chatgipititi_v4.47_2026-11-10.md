# Para ChatGiPiTiTi — 0xBeta Screener v4.47 (2026-11-10)

Ref: CC-2026-11-10-03 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge and lists the ones to place as cards ("Place these"). It already had a rule from long ago: **one bet per player in a game**, because two props on the same player in the same game move together (correlation).

## What Alonzo asked
1. "I already made a bet for Jordan Mason for rushing yards, yet I don't see anything indicating I already made a bet with him. I know it's not the same bet, but sometimes it's bad or not recommended to make bets on the same person in the same game. Correlation."
2. "82 STRONG, Sweet Spot, but it's under the Clairvoyant tag. I thought that was Hail Mary bets. Explain."

## What was wrong (1)
- The one-per-player rule only looked at bets whose saved game text matched the board's.
- A bet logged from a book's fill (Novig) usually has no game text, or codes like "BUF @ MIN" where the board writes "Buffalo Bills @ Minnesota Vikings".
- So the rule never fired, and the card "Jordan Mason Under 11.5 Rushing Attempts" stayed in Place these with a stake.
- The "Same game as your …" note existed, but it only showed in the table, never on the cards.

## What was built (v4.47)
- **Same game** now also means:
  - the same two team codes (ESPN's) at the same time;
  - a bet with no game text whose team plays in this game;
  - the same player (accents and a first initial ignored) at the same time.
- A second prop on a player you already bet in that game gets **no stake** and the warning "you already bet Mason Over 62.5 Rushing Yards in this game: one bet per player (both move with the same game)". It leaves Place these.
- A bet on another player in a game you already have money on stays, with a 🔗 tag on the card: "Same game as your Cook 15.5 Rushing Attempts ($1.50 in)".

New test: 10 checks. The full suite result is in the PR.

## About (2), no change
- Safe, Feeling Lucky and Clairvoyant are **modes for the whole board**, not labels on a bet.
- Clairvoyant is Feeling Lucky plus long shots: anytime TD, home run or goal at +200 or longer, at half size, $2 max, +8% EV or more. It goes back to Safe at midnight.
- Feeling Lucky and Clairvoyant also raise:

  | Setting | Safe default | Feeling Lucky / Clairvoyant |
  |---|---|---|
  | Kelly | 0.25 | 0.33 |
  | Game cap | 2% | 2.5% |
  | Daily max | 10% | 15% |

- The 82 STRONG card (Eklund Over 1.5 Shots, −113) is a normal bet. But with $52.15 already staked and Safe's $50 daily max (10% of $500), Safe would show no more cards today. Clairvoyant's $75 max is why cards are still there.

## Question for ChatGPT
For same-player props in the same game, is a flat "one bet per player" the right default? Or should the app allow a second prop when the correlation is low, or cap the combined stake on that player instead? Two cases:
- Over rushing yards with Under rushing attempts are negatively correlated: a partial hedge that pays the vig twice.
- Over yards with Over attempts are positively correlated: doubled exposure.
