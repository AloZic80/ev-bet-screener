# Las Karens: full-app review of v5.12 (2026-11-15)

Ref: CC-2026-11-15-10 · Written by Claude Code, Sun 2026-11-15, 7:20 PM America/Chicago. No keys or passwords in it.
Four testers, all running on Sonnet: the newcomer, the phone-only user, the know-it-all bettor and the pro (he).
They used the live site with an empty browser and no passphrase. They changed nothing.

**Limits.** With no passphrase the board never loaded, so the board's math, cards, Sentinels and Kalshi strip were not tested.
The ESPN calls failed in the test sandbox; this is probably the sandbox, not the site.
A rerun with the owner's own browser (passphrase typed by him) would cover those parts.

## Stars (average of the four)
| Page | Stars | Page | Stars |
|---|---|---|---|
| Board | 2.3 | Bet log + calendar | 3.3 |
| Live Games | 2.8 | + Add a bet (singles) | 3.8 |
| Parlay tab | 3.8 | + Add a bet (parlay) / Bet log parlay panel | 2.8 |
| Settings | 3.0 | Performance | 3.0 |
| Reports | 3.8 | Leagues | 3.0 |
| Parole | 2.8 | Moneylines | 3.0 |
| Paste | 1.5 | | |

## Complaints, worst first ("Pro" = the pro agrees, so it goes on top)
1. **(all four, Pro)** The red "books not read: HTTP 401" banner sits on every page.
   - It shows raw JSON and has no link to Settings.
   - On a phone it covers about a third of the screen and the More ▾ items (Parole, Moneylines), and its × is half under the bottom bar.
   - It also covers Mark WIN / LOSS at 1280.
   - The Bet log tab shows a red "!" on first use.
2. **(all four, Pro)** Paste is unreachable. "Paste ▸" and "Paste a board" stay hidden on an empty board. The built-in Sample reads 0 props (a WNBA sample in November, with no message saying why).
3. **(Pro)** An exchange bet's Odds column shows +150 at 40¢, but its profit uses the fee price: a Kalshi win of +$13.99 is +140. The price shown is not the price paid.
4. **(know-it-all, a real bug)** The daily-max meter leaves parlay entries out ($45 of $100 while $65.01 was staked). The v5.11 hint says they count.
5. **(know-it-all and Pro)** The Bet log's "Add a parlay" panel has no Free entry and no Power / Flex choice (+ Add a bet has both).
   - A $0 stake is refused, so testers faked $0.01, which produced +499900 odds.
   - No form fills in the known PrizePicks payouts (the Parlay tab already knows 3x / 5x / 10x / 20x / 37.5x).
   - At 1280 the panel's Picks, Stake and Pays boxes overlap, and the Book list is cut off.
6. **(Pro)** A hand-entered bet with no fair price is saved with decision SKIP. The card says "Can't judge it yet", but the log calls his own bet a SKIP.
7. **(know-it-all and Pro)** Profit numbers disagree with no explanation.
   - Performance shows "Results by day" +$47.49 next to the Scorecard's +$5.00, because parlays are left out of the Scorecard and the page does not say so.
   - Reports puts a big green ROI on 7 bets, while its "too few to read" caveat is small and far away.
8. **(Pro)** Settings fee wording:
   - Polymarket US reads "6.95% of price", but the app uses × (1 − price).
   - It is unclear whether Novig's live fee applies.
   - "Kelly 0.25 after a 0.5 haircut" does not say whether that means 0.125.
   - The devig method (multiplicative) is not stated anywhere.
9. **(Pro; owner decides, these are his modes)** Volume nudges against the calm buyer's-tool rule:
   - a "Daily bet goal 20" with a 0 / 20 counter;
   - Suertudo "5 a day" and Brujo "3 Hail Marys a day" (not +EV by the app's own rule);
   - "BET NOW" and "Send the Sentinels".
10. **(three of four)** The defaults do not match the season or each other:
    - Load defaults to MLB in November ("No MLB game in the next 24 hours").
    - Live Games opens on NBA while the scores strip shows NFL.
    - Leagues says "no games" when its source was simply locked.
11. **(know-it-all)** Times are mixed: "updated 6:57 PM" uses the browser's time, while Reports and the log use Chicago time.
12. **(know-it-all)** TODAY reads "won $82.49", which is the profit total and reads like money returned. Two TODAY bars show.
13. **(phone, Pro on the bar)** Phone details:
    - Many tap targets are under 40 px (Settings has 141).
    - Performance tiles use 10 px text.
    - The sources bar cuts off "SOURCES".
    - The Bet log table needs a sideways swipe for Stake and Result.
    - The saved toast covers the calendar's ‹ › buttons.
    - The Game list and the "Placed at" box are cut off.
14. **(newcomer only; the end-game users)**
    - Nothing on the first screen says what the app is or what to do first.
    - In-house words (La Contadora, Parole, Jail, Machín, Volado, Brujo, AWOL, CLV, band) are not explained where they appear.
    - The Settings page opens with the Worker, not with a bankroll or stake.
15. **Small:**
    - The saved toast has no player name.
    - Hand-entered bets can never get a closing price (CLV), and Reports does not say so.
    - Settings' default books do not include FanDuel or PrizePicks.
    - A Flex "2 of 3" counts as a win in W-L.

## Console
No page errors (no app crashes) anywhere. Only 401s (no passphrase) and ESPN CORS failures (the sandbox).
