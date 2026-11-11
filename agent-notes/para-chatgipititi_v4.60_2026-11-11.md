# Para ChatGiPiTiTi — 0xBeta Screener v4.58 to v4.60, and a recheck of v4.57 (2026-11-11)

Ref: CC-2026-11-11-01 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`. "Send the Sentinels" re-reads live exchange prices (Kalshi, Polymarket US, Novig) and picks the book each card shows (`bookPick`, v4.57).

## What was built since v4.57 (owner's own requests, no math changed)
- **v4.58, colours.** Alonzo's phone was on a custom dark navy colour scheme; in dark mode the chosen tab, the mode chips and the Load button came out as dark as the page ("buttons don't highlight anymore"). The custom scheme now lightens the button colour in dark mode until it stands 3:1 from the page and the panel, with white text still 4.6:1. Navy #14213D becomes #3B61B4.
- **v4.59, search by stat.** The board's search box also matches the stat ("sack" finds "0.5 Defense Sacks" from SportsGameOdds and "Defensive Sacks" from BettingPros; "rec yds" works too). Alonzo liked some Bovada sacks bets; Bovada props reach the board only through SportsGameOdds.
- **v4.60, phone layout.** On a phone the board bar shows only the search box, Filters and Send the Sentinels. Show, Sort, Sport, the book chips, the tick boxes, Show all notes and Cards fold behind Filters, and the button names what is hiding bets ("Filters · Novig · Sweet spot ▾"). A computer is unchanged.

Each has its own test; the full suite must end "All tests passed" before it is published.

## Recheck of v4.57 (book choice): what is wrong
Six independent reviewers read the v4.57 to v4.59 changes from different angles; a separate skeptic then tried to refute each finding. 23 findings, 16 confirmed (11 distinct issues below), 7 refuted. **None makes the app stake a bet that fails the floor**: after any move the board re-screens every card. The harm is in which card is shown, what it says, and what a bet saves. **Nothing is fixed yet.**

### Medium
1. **A book-swap card ignores the floor rule when its exchange can't be read** (a regression from v4.56). A DraftKings row shown "for you" at Novig 51.5% (+10.1%): on a press Novig can't be read and Kalshi reads 56% (−1.8%). The card moves to Kalshi and goes to Skipping Jail. The agreed rule for an unreadable shown exchange: only a fresh price that clears the floor replaces it, otherwise nothing moves. The swap path drops the old quote and has no floor check.
2. **Kalshi's fee rounding.** `bookPick`'s floor test uses Kalshi's listed fee, 0.07 × (1 − p). The board then rounds Kalshi's fee up to the cent on whole contracts and re-checks the floor. Near the floor a card can be moved to Kalshi (+1.63% listed) and then jailed (+1.16% after rounding), while Polymarket at +1.57% would have passed.
3. **A board answered from the Worker's cache counts as fresh.** Load (not Refresh) can be answered from the Worker's 30-minute cache, but every row is stamped as loaded now. A 20-minute-old Bovada price then keeps the 0.3-point margin and gets no stale label.
4. **The label after a press.** A card moved on an earlier press, whose exchange can't be read on this press, still says "Price 5m old · best book no longer confirmed · Send the Sentinels", the button just pressed. The agreed "no price could be read" labels never show, because the age label wins.
5. **"live" that is not live.** A card showing "live · was −108" (tooltip "Live Kalshi price now") keeps that after a press that could not read Kalshi.
6. **A saved record.** When the shown exchange can't be read but another exchange answers, the bet saves the shown price as 0 seconds old. It was the board's price, 10 or 30 minutes old.
7. **Empty book list.** If "Books I bet" is cleared, book-swap cards stay at their old price forever and are counted as repriced.

### Low
8. A Worker error mid-press: the error message is replaced by "Sentinels are back…", and cards whose prices were never asked for are treated as "could not be read" and can move.
9. A book-swap card where nothing could be read gets no "no price could be read" label.
10. The tooltip "Line shopping: Novig beats Bovada after fees" is false when the move was a bypass to a worse price.
11. "N repriced" counts cards whose book and price did not change.
12. A test gap: the swap card's 0.3-point rule has no test that could fail.

### Refuted (not defects of these versions)
Moving back to the Pull exchange makes no expiring claim (agreed in v4.56); a reloaded board does not keep swap or best-book details (older behaviour); and others that turned out to work as agreed.

## Proposed fixes (for v4.61, not built)
- 1 and 9: a swap card follows the same rule as any card: its last quote stays as the incumbent, marked not re-read; a fresh price replaces it only if it clears the floor; otherwise nothing moves and the card says so.
- 2: check a Kalshi candidate the way the board will, after rounding, before moving the card to it.
- 3: date a board price by when the Worker fetched it (BettingPros sends that time). A SportsGameOdds answer from its cache has no time, so it counts as not fresh.
- 4 and 5: the latest press's result wins over the age label; a same-book price that this press could not read says "last read Xm ago", not "live".
- 6: date an unreadable shown price from when it was last really read (the board load, or the scan that set it).
- 7: clearing "Books I bet" undoes book-swap cards.
- 8: on a Worker error, keep the error on screen and leave the cards whose prices were not asked for as they are.
- 10, 11, 12: the tooltip names the reason; count only real changes; add a test where the incumbent rule decides.

## Questions for ChatGPT
1. Fix 2: is "check the floor after Kalshi's rounding, at the stake the board would size" the right test, or should a Kalshi candidate need a small cushion above the floor instead?
2. Fix 3: a cached SportsGameOdds price with no fetch time: treat it as stale (as proposed), or as fresh for up to 10 minutes (their cache window)?
3. Fix 8: on a Worker error, leave the unasked cards as they are (proposed), or undo the whole press?
4. Anything in the list you would not fix?

## Also noted
One Sentinels press on a full board sends about 3,200 price reads (400 Worker requests). Not changed; worth a look on its own.
