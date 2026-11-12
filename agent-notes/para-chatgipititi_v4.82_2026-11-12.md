# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.82 (2026-11-12)

Ref: CC-2026-11-12-05 · Written by Claude Code, Thu 2026-11-12, about 9:45 AM, America/Chicago. No keys or passwords in it.
A small fix on top of v4.81 (👻 AWOL). The v4.81 note (`para-chatgipititi_v4.81_2026-11-12.md`) explains AWOL.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. La Contadora's chance, min(model, market + 0.35 × (model − market)), and its EV after fees
decide everything. The app sizes the stake, says exactly what to type at the book, and tracks results honestly. The exchange connections are read-only.

## What was asked
Nobody asked; Claude Code caught it in its own v4.81 screenshots and told Alonzo before building. The Collin Gillespie card (Novig) sat under
👻 AWOL with "👻 AWOL · Novig: no market at your line", and the same card still said:
- "◎ PERFECTA · BET NOW · 6 of 6" (the gold ring);
- "✅ #1 MATH PICK".

A card the book cannot find should not say BET NOW.

## What was built
- **The ring stays; its words change.** The six ◎ checks are frozen, so an AWOL card can still pass all six. It now reads
  "◎ PERFECTA · 👻 AWOL · look at the book first · 6 of 6 · price read 1m ago" instead of "◎ PERFECTA · BET NOW".
- **#1 MATH PICK skips AWOL cards.** Inside 👻 AWOL every card is AWOL, so no card there is the #1 math pick.
- Already true since v4.81:
  - the 🔔 alert and Show › ◎ Perfectas skip AWOL cards (the reviewers found one timing gap in the alert, below);
  - AWOL cards are not counted in "to bet now".

Label only: no stake, floor, fee, Kelly, cap or grading rule changed.

## The numbers
None changed. Gillespie's card keeps La Contadora's chance, its EV and its stake; only two labels changed.

## Tests
- `awol-test` has 20 checks (one new): with the book not finding the bet, the card says neither BET NOW nor #1 MATH PICK, and its ring reads
  "👻 AWOL · look at the book first".
- The full suite passed before publishing.

## Found by the reviewers, older, reported and not changed
1. The 👻 AWOL and ⏱ Old headings still end with "Best first on Sort › Math, band by band; bet down the list until your daily max."
2. A 🦑 Sentinels press redraws the board once before it marks the cards it could not find as AWOL. A card that becomes a new Perfecta in that
   first redraw can get the 🔔 alert, then move to 👻 AWOL a moment later.
3. With cards turned off (the table view), an AWOL row shows no 👻 marker or reason; the pill is on cards only.
4. An open 🔔 banner keeps the line of a card that later goes AWOL, and shows it again when a new alert rebuilds the banner.
5. A tap on the price that gets Kalshi or Polymarket "no offer to buy" sends the card to 👻 AWOL with its stake, while a 🦑 press gives $0 for
   the same answer (your v4.75 rule). Should a tap follow the v4.75 rule too? That is a stake rule: nothing changes until you and Alonzo agree.

## A correction to the v4.81 note
Its list of what sends a card to AWOL included "game not found". That was dropped before v4.81 was published (your question 2 there): the Worker
also says it for a league it does not read, so it is our side, not the book's. The app never sent a "game not found" card to AWOL; only the note
was wrong.

## Question for you
1. A ⏱ Old card (price read more than 12 hours ago) can still be "✅ #1 MATH PICK" inside the ⏱ Old tab. It can never be a 6-of-6 Perfecta (one
   check needs a price read in the last 10 minutes). Should #1 MATH PICK skip ⏱ Old cards too, since their prices must be checked first? Not
   changed until you and Alonzo agree.
