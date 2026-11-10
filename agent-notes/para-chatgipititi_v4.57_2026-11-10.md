# Para ChatGiPiTiTi — 0xBeta Screener v4.57 (2026-11-10)

Ref: CC-2026-11-10-14 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`.

## How this build was approved
You found two gaps in v4.56 (book-swap cards never expired; the Sentinels compared against the Pull book, not the book shown). We agreed the fix in writing, including your sportsbook adjustment, then Alonzo said "BUILD". Nothing outside that scope was built.

## What was built

### One decision per row on a Sentinels press (`bookPick`)
The book **shown now** is the one to beat. The Pull book is kept only for the "was" label.

| The shown book's price | What happens |
|---|---|
| Fresh: an exchange read in this scan, or a sportsbook price the board loaded within 3 minutes (90 seconds within 5 minutes of kickoff) | Another fresh price needs 0.3 points more `actNet` |
| An exchange that could not be read | The best fresh price takes its place, no 0.3. Saved as `exchange_unreadable` |
| A sportsbook price that is stale | The best fresh exchange price whose `actNet` clears the floor replaces it, no 0.3, even if it is worse than the stale price. Saved as `sportsbook_stale_unrefreshable`; the card adds "sportsbook price stale and not refreshable" |
| Stale sportsbook and no fresh exchange price that clears the floor | Nothing moves: "No current best book confirmed · sportsbook price is stale · check the book manually" |
| Nothing readable for an exchange row | Nothing moves: "no price could be read · refresh prices" |

- A sportsbook price's age is the board's load time (a pasted board: the paste time). Loading the board again makes it fresh.
- While the Pull sportsbook's price is fresh it can win the bet back from an exchange, with the 0.3 points.
- After every scan the whole board is re-screened at the new prices.

### Book-swap cards (a row at a book Alonzo does not bet, shown at one he does)
- The swap is stamped with the time its price was read and expires like a best-book claim: "Price 3m old · best book no longer confirmed · Send the Sentinels". No price is read again by itself.
- A Sentinels press now reads those prices again. Before, they were read once and never refreshed.
- The swap book shown keeps its place unless another of his books is 0.3 points better.

### Saved with a bet
`snap.shop` now holds: the Pull book, whether it was a swap, the claim's time, age and staleness, the bypass reason, and the last check: incumbent and challenger (book, price, `actNet`, age in ms, readable, live), "applied" or "bypassed", and "none" with its reason when no book was confirmed.

## The numbers in the tests (by hand)
Model 58%, market 56%: chance = min(0.58, 0.56 + 0.35 × 0.02) = **56.7%**. EV at price p with fee f = ((0.567 / p − 1) − f) / (1 + f).
- Bovada 52%: +9.04%. Novig 51.9%: +9.25% (0.21 points better: stays at a fresh Bovada). Novig 51.5%: +10.10% (1.06 points better: moves).
- Stale Bovada 52% against Novig 52.2% (+8.62%, worse but above the floor): moves, bypassed. Against Novig 56% (+1.25%, below the floor): stays, "No current best book confirmed".
- Shown book Novig 51.5% (+10.10%) against Kalshi 49.8% after its fee 0.07 × 0.502 = 3.51% (+9.99%): 0.11 points apart. Novig stays. Measured against the Pull book (Kalshi), v4.56 moved it back.

## Checked
- New test `tests/book-choice-v457-test.js`: 24 checks. The v4.56 test was updated for the new reason code (`exchange_unreadable`).
- The full suite result is in the PR.

## Decisions I made inside the scope (please check)
1. **Exchange unreadable:** the best fresh price takes its place even when it is worse than the unreadable book's last price, and with no floor condition (the re-screen judges it). v4.56 required it to beat the last price. I read our agreed line "a fresh exact price replaces it" literally.
2. **Stale sportsbook:** the floor test uses the user's EV floor on `actNet` after the exchange's fee. The stale price's own EV is ignored.
3. **The stale-sportsbook label appears only after a Sentinels press** that checked the row, not by itself when a board passes 3 minutes.
4. **A pasted board** uses the paste time as its load time.

## Not changed
No floor, threshold, fee, Kelly or cap. No new Worker calls except that a Sentinels press now also refreshes swap cards within the same batch it already sends.

## Question for ChatGPT
Is decision 1 what you meant, or should an unreadable exchange keep its place when the only fresh price is worse than its last one?
