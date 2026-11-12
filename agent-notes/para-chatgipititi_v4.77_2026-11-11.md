# Para ChatGiPiTiTi — 0xBeta Screener v4.77 (2026-11-11)

Ref: CC-2026-11-11-04 · Written by Claude Code, Wed 2026-11-11, evening, America/Chicago. No keys or passwords in it.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. It finds bets with an edge. La Contadora is the conservative chance,
min(model, market + 0.35 × (model − market)), and its EV after fees decides everything. It sizes the stake, says what to type at the book, and tracks
results honestly.

## What Alonzo asked
"could we put the older bets in another category. or Tab in itself. If sentinels takes them out of jail, then good. but, lets not mix them with our
regular tabs."

The case behind it: an Oklahoma State card at Kalshi 49¢ marked "⏱ 5d", when Kalshi had it at 61¢. The board keeps a row until its game day, so a
price from a load days ago can sit among today's best bets.

## What was built (listing only; no floor, fee, Kelly, cap or stake changed)
- **The tab.** A sixth tab after 🔮 Brujo: **⏱ Old**. Any card whose price was read more than 12 hours ago is listed there instead of its own tab, whatever its chance.
  - "Read" is the newest of: the board load, a Sentinels answer, a swap.
- **Coming back.** A 🦑 Sentinels press, which re-reads every bet at Kalshi, Polymarket and Novig whatever tab is open, or a board reload that reads a fresh price sends the card back to its tab.
- **What stays put.** A bet he already placed, an order waiting at a book, or the same bet at another line stays where it is.
- **Extras.** Near-misses (🍀) and Hail Marys (🔮) with old prices are offered there too, and only there.
- **What YES means there.** Place these in ⏱ Old says: "⏱ Read more than 12 hours ago: La Contadora said YES at these prices. Check each price at the book first, or press 🦑 Send the Sentinels or reload the board; a fresh price sends the card back to its tab."
- **La Contadora's line:** "These prices are more than 12 hours old. I said yes at those prices, not at today's. Check each one first: send the Sentinels or reload the board, and the fresh ones go back to their tabs."
- **The count.** "N in the tabs ▸" (v4.76) gets its own line: "2 in ⏱ Old: read more than 12 hours ago, check each price first".
- **On a phone** the six tabs sit in two rows of three. The name is short ("⏱ Old") so they fit.

## Also in v4.77: the header counts only what he can bet now
He asked: "are those on jail and passed bets part of the 72? i hope not ... i want only live bets i can get. if anything, add where they are...in jail".
- They were: "72 pass" counted every approved bet, including finished games, bets already placed and prices the app could not confirm.
- Now the big number is the approved bets he can place now (in the tabs, not ⏱ Old): "6 to bet now · of 1518".
- "66 elsewhere ▸" lists the others by where they are: ⏱ Old, game started or over, already bet, can't confirm, $0 stake, removed, hidden by a filter or book chip.
- It also says how many sit in 🔒 Skipping Jail. Those passed at the board's price and fail at the live price, so they were never in the approved count.
- Counting only.

## Review fixes (independent reviewers read v4.76; each finding was challenged, and Claude Code checked the code)
- 🍀 Suertudo said "2 just missed" when one of the two was an approved Coin Flip. It now counts only the near-misses.
- An approved long shot offered as a $1 Hail Mary is counted in the tabs, not under "$0 stake". A bet he removed gets its own line.
- An empty 💪 Machín no longer says "every bet failed" when the other tabs have bets. "Back to Safe at midnight" now says Machín.
- Live Games:
  - a box score that does not list the player yet is read again at most once a minute (NFL lists a player only after his first stat);
  - two games listing the same name: the one starting at the book's time is taken;
  - no guess while another game in the window has not started;
  - a game still ahead says "Not started".
- Not done, reported: the Game Hub cards and the scores strip still find a bet's game by team codes only.

## The numbers (from the test)
- Price ages: 13 hours → ⏱ Old; 5 days → ⏱ Old; 11 hours → stays in its tab.
- A held bet with a 2-day-old price stays in 💪 Machín.
- Same chance, same price, same stake ($5.95) whether listed in Machín or in ⏱ Old.
- After a press reads the 13-hour card fresh at Novig, it is back under 💪 Machín.

## Tests
- New: `tests/old-prices-test.js`, 16 checks: the six tabs, what is listed where, same stakes, the held bet, the 11-hour edge, the Sentinels press, and 390/1000/1280/1960 px with no sideways scroll.
- `tests/tabs-v476-test.js` now expects six tabs.
- The full suite result is in the PR.

## Questions for ChatGPT
1. **The daily max (a stake rule, not built).** Should a card in ⏱ Old stop counting toward the daily max until it is re-checked? A 5-day-old price can look like the best edge on the board (49¢ shown, 61¢ real) and take money from the fresh bets. Nothing is built until you agree and Alonzo says build.
2. **Is 12 hours the right line?** The ⏱ pill turns amber at 30 minutes. A shorter line pushes this morning's sportsbook cards into ⏱ Old by evening, and only a reload (BettingPros: 50 calls a day) refreshes those.
