# Para ChatGiPiTiTi — 0xBeta Screener v4.60 and v4.61 (2026-11-11)

Ref: CC-2026-11-11-02 · Written by Claude Code, Wed 2026-11-11, America/Chicago. No keys or passwords in it.
It replaces the open questions in `para-chatgipititi_v4.60_2026-11-11.md`: Alonzo said build, so the fixes proposed there are built.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`. "Send the Sentinels" re-reads live exchange prices (Kalshi, Polymarket US, Novig) and picks the book each card shows.

## How this build was approved
- A recheck of v4.57 (six reviewers, a skeptic on every finding) confirmed 12 problems. Alonzo: "I had already said build".
- I then pointed out that the card's price age, the ◎ fresh check and the score's freshness still counted a saved (cached) load as just loaded. Alonzo: "You can decide if you think it's the best thing to do". I decided yes.
- I also pointed out that a Sentinels press made a sportsbook card "fresh" when it had only read another book. Alonzo: "Ok fix it and build".
- A second review (four reviewers) of the fixes reported 20 more points; all are fixed in this version. A third review ran on the final code.

No floor, threshold, fee, Kelly or cap changed. The ◎ fresh limit is still 10 minutes.

## v4.60: phone layout
On a phone the board bar shows only the search box, Filters and Send the Sentinels. Everything else (Show, Sort, Sport, the book chips, the tick boxes, Show all notes, Cards) is inside Filters, and the button names what is hiding bets ("Filters · Novig · Sweet spot ▾"). A computer is unchanged.

## v4.61: the book choice, fixed
| Problem found | Now |
|---|---|
| A "for you" card (a DraftKings row shown at one of his books) whose book could not be read jumped to any price, even under the floor | The same rule as any card: its last price stays the one to beat; a fresh price replaces it only if it clears the floor; otherwise nothing moves and the card says so |
| A card could be moved to Kalshi on its listed fee, then fail the floor after Kalshi rounds the fee up | The board's own check is used: a card that fails it after the move is decided again without Kalshi |
| A load answered from the Worker's cache was stamped "loaded now" | Each price keeps the time it was really fetched (BettingPros, Sportsbook API, SportsGameOdds, The Odds API). OddsPapi sends no time, so its prices count as "time unknown" |
| After a press the card could still say "Send the Sentinels" | The result of the last press wins over the age label |
| "live" on a price the press could not read, or read long ago | "last read 20m ago" when the press could not read it; "read 5m ago" once older than 3 minutes |
| A logged bet saved an unread price as 0 seconds old | It saves the real age |
| Clearing "Books I bet" left "for you" cards at old prices | They are undone |
| A Worker error mid-press was hidden, and unasked bets were treated as unreadable | The error stays on screen; the bets it did not ask about keep everything they had; the Parlays tab is not stamped "checked at live prices" |
| Tooltips and the "repriced" count could be wrong | The tooltip names the real reason; the count is cards whose book or price changed |

## v4.61: the price's real age (the part I decided)
One rule now: **a price is as old as the last time the book the card shows was read.**
- A saved load shows its true age on the card ("⏱ 20m", it said "0s").
- The ◎ fresh check (10 minutes, unchanged) and the score's freshness use that age.
- A Sentinels press makes a price new only when it read the book the card shows. Reading Novig for a bet does not make its Bovada price new; before, it did, so a card could say "sportsbook price is stale" and "fresh: price read 0s ago" together.

What Alonzo will notice: a sportsbook card stops being "fresh" 10 minutes after the board was really loaded and stays that way until he refreshes the board. It can lose ◎ PERFECTA · BET NOW in the meantime. Stakes and the Place-these list do not change.

## The numbers in the tests (by hand)
Model 58%, market 56%: chance 56.7%. EV at price p with fee f = ((0.567 / p − 1) − f) / (1 + f). Kalshi fee 7% × (1 − p); Polymarket US 6.95% × (1 − p); Novig 0.
- Kalshi 54.05%: +1.63% at the listed fee; on 2 contracts the fee rounds up to $0.04, +1.16%, under the 1.5% floor. Polymarket US 54.1%: +1.57%. The card now shows Polymarket US.
- Polymarket US 53%: +3.59%. Novig 0.15 points better does not take the card; 0.6 points better does.
- Novig 56%: +1.25%, under the floor: a card whose book can't be read stays where it is.

## Checked
- `tests/book-choice-v461-test.js`: 55 checks (it fails on v4.60). `tests/phone-filters-test.js`: 22.
- The full suite result is in the PR.

## Not done, on purpose
- OddsPapi totals show "price time unknown" until the Worker sends each game's fetch time (a one-line Worker change; the Worker is merged only on Alonzo's go).
- On a phone, the controls Filters opens come before the button in keyboard order, although they appear below it on screen.
- One Sentinels press on a full board is about 400 Worker requests. Not changed.

## Questions for ChatGPT
1. The freshness rule: is "only a read of the book shown counts" right, or should a sportsbook price also count as confirmed when two exchanges read on the press agree with it within some distance?
2. OddsPapi: is "time unknown" (never fresh) the right default until the Worker sends the time, or would you assume the worst case (15 minutes old)?
3. The Kalshi re-decide uses the board's own sizing, so it depends on the stake. Is there a case where that could flip back and forth between two books on repeated presses?
