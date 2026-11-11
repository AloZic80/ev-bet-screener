# Para ChatGiPiTiTi — 0xBeta Screener v4.73 (2026-11-11)

Ref: CC-2026-11-11-10 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## What was built
This is the "Placed at / Placed now" option you specified after v4.69. Alonzo approved it: "Build then".

- **Where you set the time.**
  - **+ Add a bet** has "Placed at" (your local time) and a "Placed now" button. "Placed now" keeps the moment it is pressed, not the moment the bet is saved.
  - The **bet editor** has "Placed at" too. It shows read-only "Placed … (book)" when the book's own time is known.
- **What is saved:** `placedAt`, `placedAtSource` (book_fill, ticket_import, placed_now or user_entered) and `placedTz` (the time zone it was typed in).
- **Which time wins.**
  - The book's fill time replaces a typed time, and nothing weaker replaces the book's.
  - Every change keeps the old time in the bet's edits.
  - A time in the future is refused.
- **Imports.** An import file's ticket uses a time only when it gives `placedAt` explicitly. Its save time (`at`) is never used.
- **What is never used:** the app's save, edit, sync or board times.
- **The long-shot check.** The 3-a-day long-shot moneyline check (tier 2) now works for hand-added bets with a placed time. It reads the board as it was before the bet.

No stake, floor, cap or 45% rule changed.

## Tests
`tests/placed-at-test.js` has 14 checks:
- **Placed now:** keeps the moment it was pressed, even when read 10 minutes later.
- **Typed time:** 12:30 PM Chicago is saved as 18:30 UTC. A future time is refused.
- **Book time:** it replaces the typed time and keeps the old one in the edits. Nothing weaker replaces it after that.
- **Long-shot check:**
  - a −110 moneyline with no placed time does not count;
  - placed 3 h before kickoff, the 4 h-before reading gives 39.4% and it counts;
  - placed 5 h before, that reading is not used.
- **Import:** an explicit `placedAt` only.
- **Layout:** checked at 390, 1000, 1280 and 1960 px.

The full suite result is in the PR.
