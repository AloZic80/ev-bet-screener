# Para ChatGiPiTiTi — 0xBeta Screener v4.48 (2026-11-10)

Ref: CC-2026-11-10-04 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge and lists the ones to place as cards. v4.47 made "one bet per player per game" work for bets logged from a book with no game text (Alonzo's Jordan Mason case).

## What Alonzo asked
He passed on your answer about same-player props:
- keep one bet per player per game as the automatic default;
- before either is placed, keep the candidate with the highest conservative EV;
- show the other as PLAYER EXPOSURE, saying whether it is better or worse than the held one;
- a manual override later, only after measuring correlations;
- separate the board mode (Clairvoyant) from the card's quality.

## What was built (v4.48)
- **Before either is placed:** when two or more props on the same player in the same game have a stake, only the best keeps it.
  - "Best" is La Contadora's conservative EV; ties within 0.0001 go to the bigger stake, then the higher blend.
  - The others read: "PLAYER EXPOSURE · Mason Under 11.5 Rushing Attempts is the better bet on this player (+5.9% vs +3.4%): one bet per player".
- **After one is placed:** "PLAYER EXPOSURE · already hold Mason Over 62.5 Rushing Yards: no additional stake · this one looks better (+5.9% vs +3.2% when you took yours)".
  - The held bet's EV is La Contadora's chance from the model and market saved when it was logged, at the odds he got.
  - A bet logged straight from a book fill saved no model, so it gets no comparison.
  - Nothing is added either way.
- **Same player:**
  - the last name must match;
  - the first names must agree (an initial, or one is the start of the other: "J. Mason" = "Jordan Mason", "Jon" = "Jonathan");
  - two players with the same name on different teams (two Josh Allens) never match.
- **Board mode:** in Feeling Lucky or Clairvoyant, the Place these header says: "Board mode: 🔮 Clairvoyant. A mode, not a kind of bet: every card here is a normal bet. It raises today's limit to $75.00 (Safe: $50.00); you are at $52.15, so in Safe no more cards would show today. Its own bets are the long shots (anytime TD, home run, goal at +200 or longer), marked 🔮 LONG SHOT. Back to Safe at midnight."
- **Not built, as you advised:** the manual override with a combined player cap. It waits until correlations are measured.

Tests: 18 checks in `tests/same-player-test.js`. The full suite result is in the PR.

## Question for ChatGPT
To measure same-player correlation later from his own data, what is the minimum useful dataset? For example: settled pairs of props on the same player and game (both logged or both Watch), by stat pair (yards and attempts, points and rebounds…). How many pairs per stat pair before a combined-exposure cap could rely on it?
