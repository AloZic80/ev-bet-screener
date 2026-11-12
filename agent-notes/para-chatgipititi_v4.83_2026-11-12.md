# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.83 (2026-11-12)

Ref: CC-2026-11-12-11 · Written by Claude Code, Thu 2026-11-12, afternoon, America/Chicago. No keys or passwords in it.
The v4.83 scope you and Claude Code agreed (`v483-scope-agreed_2026-11-12_v1.md`); Alonzo said "BUILD".

## What was built
1. **🔔 waits for a 🦑 press to finish.** The check is held from the press's first redraw to its last (after 👻 AWOL is written). A card that is a
   Perfecta only in the middle gives no banner, sound or notification and is not saved as seen.
2. **The open banner re-checks its lines** on every redraw. Each line keeps its card's key; a line whose card went 👻 AWOL or ⏱ Old, lost a
   check, was placed or is now hidden by a filter is dropped (its notification closed too). No line left: no banner.
3. **The alert follows his filters:** only what Show › ◎ Perfectas would list under his sport, search, Settings filters and book chips. A
   change of those filters takes a quiet baseline (this session only, not saved as seen); the Show menu is not a filter. A Perfecta that leaves
   the view and comes back can ring.
4. **#1 MATH PICK skips ⏱ Old cards** (AWOL since v4.82; $0, GONE and NO OFFER never had it). No fresh card, no badge.
5. **👻 AWOL and ⏱ Old cards are $0** and hold none of the daily max. The card says "$0 · if found: up to $X" or "$0 · if refreshed: up to
   $X"; the table view says "👻 AWOL $0" / "⏱ OLD PRICE $0". They stay listed in their tab. Found or refreshed, the next audit sizes them
   again with the room left then; the old stake is never put back by itself. $X is the stake before the daily max.
6. **A tap on the price** that gets a sure NO OFFER / GONE from the card's own Kalshi or Polymarket book: $0 at once, out of Place these, no
   "what to type" strip, "NO OFFER at Kalshi · exact market found, but nobody is selling this side now · Send the Sentinels to check other
   books". The next press decides again. UNREADABLE answers are unchanged.

No floor, fee, Kelly, cap or grading rule changed. The daily max now leaves out AWOL and ⏱ Old cards, as agreed.

## Fixed before publishing (our reviewer)
- A held card was set aside only for the daily max, so it still won the one-per-game and one-per-player picks: its bettable runner-up ended at
  $0 too. Now it is set aside before all of them, and the runner-up gets the money.
- A held long shot could be re-offered as a 🔮 Hail Mary ($1). Not any more.
- The 🔔 hold now starts before the press waits for prices (a redraw in that wait could ring).

## Reported, not changed
- A card from a market the open check found closed (v2.97) is AWOL with $0 but no "if found: up to $X".
- The quiet baseline after a filter change lives for the session only, so those Perfectas can ring once after a reload.

## The numbers (test board)
Three Novig cards, La Contadora 64% at 58%, EV +10.3%, $8.93 each. One goes 👻 AWOL and one is 13 hours old: both $0, "up to $8.93", and their
$17.86 of daily max is free for fresh cards.

## Tests
- New `v483-test` (18 checks, with the one-per-player case): the quiet baseline, a card that leaves and comes back rings, the press hold, banner lines dropped (AWOL,
  filter), Old and AWOL at $0 with their text (card, table, 390 px), no #1 MATH PICK in ⏱ Old, the tap's NO OFFER and the press that brings
  it back.
- `awol-test` and `old-prices-test` now expect $0 for AWOL and ⏱ Old.
- The full suite passed before publishing.

## Question for you
"If found: up to $X" uses the stake before the daily max. With the day's max already used, $X can be more than the room left. Should it say
"up to $X (room left today: $Y)"?
