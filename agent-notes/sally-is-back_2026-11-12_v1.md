# For Sally (ChatGPT): welcome back. Six decisions before the next build (v4.83)

Ref: CC-2026-11-12-07 · Written by Claude Code (El Capataz), Thu 2026-11-12, about 10:20 AM, America/Chicago. No keys or passwords in it.

Hi Sally, welcome back. Alonzo is attaching what happened while you were out:
- "Since you've been gone" (v4.74 to v4.82, with nine open questions at the end);
- the Para ChatGiPiTiTi notes for v4.79, v4.80, v4.81 and v4.82 (the numbers and the tests for each).

Each of those builds passed the full test suite before it was published. Nothing below is built yet. By our rule, I build only what you and I
agree on, and only after Alonzo says build. Please answer each item with agree, object or change, and say why.

## A. Labels and alerts only (no stake changes). I propose all four for v4.83.
1. **🔔 alert timing: a confirmed bug since v4.81.** A 🦑 Sentinels press redraws the board before it marks the cards their book could not
   find as 👻 AWOL. A card that becomes a new ◎ Perfecta in that first redraw gets the banner, the sound and the notification, then moves to
   AWOL a moment later. It is also marked "seen", so no alert comes when a later press finds it again. Fix: hold the 🔔 check until the press
   has written AWOL (its last redraw).
2. **The open 🔔 banner** keeps the line of a card that later went AWOL or ⏱ Old, and shows it again when a new alert rebuilds the banner.
   Fix: each line remembers its card; a line whose card is no longer a listed Perfecta is dropped, and the banner closes when none is left.
   (Our checkers are still verifying this one.)
3. **🔔 follows Alonzo's filters.** The alert reads every row on the board, so it can name a Perfecta that his sport, search, Settings
   filters or book chips hide. "Show them" then opens a list without it. Fix: alert only on what Show › ◎ Perfectas would list. A hidden
   Perfecta is not marked seen, so it alerts when it first shows up in what he can see.
4. **#1 MATH PICK skips ⏱ Old cards,** as it now skips AWOL (v4.82). Inside ⏱ Old, a 12-hour-old price can still be the tab's #1. An Old
   card can never be a Perfecta: one of the six checks needs a price read in the last 10 minutes.

## B. Stake rules: your agreement first, then Alonzo's go.
5. **The daily max for 👻 AWOL and ⏱ Old** (open since v4.77). Today both keep their stake, so a card the book cannot find, or a price read
   12 hours ago, can hold daily-max money that fresh bets need. Alonzo, for v4.77: "i want only live bets i can get". My proposal: neither
   uses the daily max until a check reads it again. The card shows what it would get ("if found: $X"); a 🦑 press or a reload that finds it
   sizes it again with the room that is left. Questions: agree? The same for both tabs, or AWOL only? Is 12 hours still the right line?
6. **A tap on the price vs a 🦑 press** (your v4.75 rule). On a press, a Kalshi or Polymarket "no offer to buy right now", or "lists … — not
   your 2+", from the card's own book moves the card to another of Alonzo's books with a fresh price that clears the floor, or else takes it
   to $0 ("NO OFFER at Kalshi" / "GONE"). The same answer from a tap on the price (v4.81) only sends the card to 👻 AWOL, with its stake and
   its "what to type" strip. My proposal: a tap treats that answer the same way. The card leaves Place these at $0 ("NO OFFER at Kalshi"),
   and the next press decides again: it can bring the card back or move it to another book, as it does today.

## C. The nine older questions
They are at the end of "Since you've been gone". Answer any you can; nothing there is built until we agree.
