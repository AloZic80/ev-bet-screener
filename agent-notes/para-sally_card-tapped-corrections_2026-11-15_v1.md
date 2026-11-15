# For Sally · v5.12 card_tapped: 2 facts I gave you were wrong, 3 questions · 2026-11-15

Ref: CC-2026-11-15-05 · from El Capataz (Claude Code) · 2:55 AM America/Chicago · nothing built · about the agreed scope CC-2026-11-15-04

While checking the v5.12 build plan against the code, a reviewer found that two facts in my note CC-2026-11-15-03 were wrong. Your rules C1 and C3 were
written on those facts, so I am not building the trigger or the team rule until you answer. The rest of the agreed scope is unchanged.

## The corrected facts

1. **Board rows have no "open slip ↗" link.** Only the cards have that text. A board row opens the book's slip from its book logo or name. On a phone the
   card's one-tap slip link is the price chip. So C1 as written ("the card's / board row's open slip ↗") records taps only from the cards' "open slip ↗":
   never from the board table, and never from the phone's price chip.
2. **A Novig player-prop fill arrives with no team names.** The Worker reads teams only from a game's description, and a player prop's description has
   none. Kalshi sends one joined code (for example "LALBOS") that the app does not split into two teams. So C3 as written ("unknown teams → ineligible")
   matches no exchange player prop at fill time. None of Alonzo's NHL shots fills would ever get a card forecast.
   Grading fills in the teams later, from ESPN. In his backup, 17 of the 26 Novig props logged without a card have teams now and 9 do not (7 of those 9 settled).

## Questions

**Q1 · Which taps count (C1)**
- (a) As written: only the cards' "open slip ↗". The board table and the phone's price chip never record.
- (b) Any real tap that opens this card's or this row's own-book slip: "open slip ↗", the card's price chip, the card's book logos, and the row's book
  logo or name. Never "Other books", the Bet log, other lists, the slip bar, scans, or clicks made by a script.
- My recommendation: (b). On a phone, the price chip is the tap Alonzo uses most. (a) would leave most phone bets with no card forecast.

**Q2 · Teams (C3)**
- (a) Keep C3 as written. A fill's teams count as known once ESPN names its game: the grader's own lookup gives ESPN's teams and start, and when it also gives
  the event id, that must equal the tap's. The match then comes after the game, from the pass after grading, on the device that tapped. Expired taps stay on
  that device for 3 days for this.
- (b) At fill time: the card must have ESPN teams and start; the fill's start must be within 90 minutes of the card's (Novig's tolerance since v4.72); fill
  teams, when present, must equal the card's, and a conflict rejects. Missing fill teams are allowed for player props and spreads, never for totals. Player,
  stat, line, side and book are still exact.
- (c) Both: match by (b) at fill time, then check again with (a) when ESPN names the game. If ESPN's game contradicts the card's teams or start, the copy is
  hidden as "no longer describes its bet" (never deleted or rewritten).
- My recommendation: (c). Alonzo sees the band right away, and C3's guarantee still holds once the game is known. It is about 10 more lines plus 3 tests.

**Q3 · "The latest valid tap" across two devices**
- A tap is saved at once but uploads about 3 seconds later. On a phone, the book's app opens right after the tap and iOS pauses the page, so the upload can
  wait. If the Mac reads the fill first and holds an OLDER tap of the same card, it uses that one.
- (a) Accept it and write it down. It needs a tap of the same card on both devices, and it is rare.
- (b) When a strictly later valid tap (still at or before placement) arrives, add ONE superseding copy. The first copy stays for audit. About 15 lines and 2 tests.
- My recommendation: (a) for v5.12.

## Unless you object, the build uses these defaults
- **Price gap between the card and the fill (not in the scope):** the recovery's rule. A gap over 8 points rejects the match as probably another market; 3 to 8
  points adds a PRICE MOVED tag. The gap never changes the class. EV is always at the fill price and fee.
- **Expired taps:** at kickoff or tap + 24 h a tap stops syncing and never matches a fill placed after it. It stays on the device that made it for 3 days, so
  a fill placed in time but read later still matches.
- **Minutes shown:** primary rounds down and display-only rounds up, so a display-only tag never reads "15 min".
- **A device clock that is off by more than 5 minutes:** the corrected time decides. A tap that falls after the placement on the corrected clock is not a candidate.
- **Kalshi start time:** I will check that a real Kalshi fill's start time is the game's start before the build. If it is not, Kalshi taps wait for (a)'s ESPN check. Nothing is widened.

## Fixed in the plan, scope unchanged
The reviewer also found 11 problems in my build plan, and all are fixed there. Two examples:
- A price-history clean-up would have kept extra old moneyline histories, which feed the long-shot limits.
- An id match could pair a Kalshi NO fill with a YES tap.

Nothing in these fixes changes a rule you agreed to. No decision, stake, floor, fee or cap changes. Moneylines stay out of v5.12 entirely.
