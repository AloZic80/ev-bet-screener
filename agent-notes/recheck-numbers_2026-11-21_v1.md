# Recheck of the numbers and the app (live v5.24)

**Ref:** CC-2026-11-21-02 · **Date:** Sat 2026-11-21, 2:45 PM to 5:30 PM America/Chicago · **By:** El Capataz (Claude Code)
**Asked by El Jefe:** "recheck the numbers and App to see if you find any errors on the math/formulas or what or how we can improve the app."
**Nothing in the app or the Worker was changed.** Every item below waits for his word.

## How it was done

- 12 auditors, one area each, on a frozen copy of what is live (app v5.24, Worker v3.48), read-only. An auditor could call something an error only with a check that runs and shows the wrong number next to the right one.
- Then skeptics (Los Desconfiados) tried to knock each serious claim down: re-run it, build their own check along a real path (the real button, real data shapes), look for a written decision that makes it "by design", and judge the fix against the project rules.
- Totals: **123 findings.** 46 have had the second look so far: **35 confirmed** (16 of them narrower than first claimed), **8 are written rules working as designed**, 2 could not be verified from here, 1 cannot happen with real data. **None was refuted outright.** The second group's 20 serious claims (prices, parlays, Worker, statistics) get their second look after the 9:10 PM limit reset; they are marked "second check pending" below.
- Full evidence, one entry per finding with its numbers, its check and the skeptic's verdict: `agent-notes/recheck-numbers-evidence_2026-11-21_v1.md`.

## The short answer

**The core math is right.** The formulas the app is built on were recomputed independently, tens of thousands of cases each, and matched (section 4).

**The errors are around the core:** which game a bet is graded against, exchange bets built from several orders, limits that one screen applies and another does not, numbers typed by hand in + Add a bet, and storage.

The five that matter most:

1. **"Check results" can flip old, settled bets** (confirmed by pressing the real button). Until it is fixed, do not press it.
2. **The bet log has a storage wall** at roughly 1,300 to 1,700 bets with sync on. A bet lost there is also deleted from the Worker copy.
3. **Grading gaps:** a postponed game graded as 0–0, a void that does not stay void, a push on a whole-number prop line saved as a loss.
4. **Exchange profit:** a win built from two orders at different prices, and a position sold in part, are saved with the wrong profit.
5. **Stake limits:** the per-game cap only counts money already logged, and + Add a bet sizes without several of the board's rules.

## 1. Confirmed errors (second check done)

### Grading: which game, and results that stick

| Id | What is wrong | Example | How often for you |
|---|---|---|---|
| GRADING-1 | "Check results" looks at today's games only. Any old bet on the same two teams is graded again from today's game. It skips only hand-graded, imported, sold and parlay bets. No trace is left on the bet. | One press changed 9 of 12 saved results in the test. Six $10 bets went from +$54.54 to −$40.91. | Likely already in your history: NBA and NHL pairs have started to meet again. Kalshi and Polymarket bets settled in the last 3 days repair themselves at the next book read; Novig, sportsbook and older bets stay wrong. |
| GRADING-2 | Live Games can settle tomorrow's bet from tonight's final when the same teams play back to back. | DET moneyline saved LOSS from Friday's game; Saturday's real result was a WIN. | Sticks only if the app is closed from that moment until tip-off. |
| GRADING-3 | A postponed or cancelled game is graded as a 0–0 final (checked against real ESPN data). | Under 220.5 = WIN, Over = LOSS; right is stake back. | A few NBA / NHL games a season; MLB rainouts in spring. |
| GRADING-6 | A bet voided before its game does not stay void. | Void → open again → LOSS (−$10) when the game ends. | Each void before the game, when ESPN can grade the bet. |
| GRADING-K1 | A prop landing exactly on a whole-number line is saved LOSS for the Over and the Under. | Jokic 27 points, Over 27: −$10; right is $0. | About 0.6% of props. One candidate in your log: 10/26 Novig PRA Over 25, saved L, $2.78. |
| GRADING-4 | A prop saved without its teams can be graded on another game where a player with the same name played. | NHL has two players named Sebastian Aho. | Rare; Novig props carry no teams. |
| GRADING-5 | A doubleheader bet that names game 2 is graded on game 1. | Four bets saved LOSS from game 1; game 2 was a win. | MLB only; nothing until spring. |
| GRADING-8 | A result settled by the book is cleared once when the fill was first read the day after its game. | Shows wrong until the next book read. | Each exchange fill first read a day late. |
| GRADING-9, 10 | Unusual stat names typed by hand are graded as another stat; a rain-shortened MLB game is graded on the short score. | "Goals + Assists" read as assists only. | Typed stats only; MLB only. |

### Exchange profit

| Id | What is wrong | Example | How often |
|---|---|---|---|
| PROFIT-1 | A won Kalshi or Novig bet built from two orders is paid at the last order's price for all its contracts. Only wins are wrong. | 10 contracts at 40¢ then 10 at 60¢, won: app +$6.19, right +$9.66. | Only when you add to a position at a different price. |
| PROFIT-2, GRADING-7 | A position sold in part: the cash from the sale is dropped, and two sales never mark the bet SOLD. A full sale ignores the sell fee. | 10 at 50¢, 5 sold at 70¢, rest lost: app −$5.18, right −$1.76. | Each partial cash-out. |
| PROFIT-3, EV-5 | A win is paid from the rounded American price, not from the contracts. | 190 contracts at 52¢: app +$88.16, right +$87.88. | Every exchange win, 0 to 5 cents per $10, either way; it cancels out over many bets. |

### Stake and limits

| Id | What is wrong | Example | How often |
|---|---|---|---|
| STAKE-1 | The per-game cap only counts money already in the Bet log. The board can list more on one game than the cap; under $500 set aside one bet can pass it. | Five props of one game at $10 each = $50 on a $20 cap. After two are logged, the other three drop to $0. | Whenever several picks share a game. |
| STAKE-2 | + Add a bet sizes without the long-shot moneyline rule, one bet per player, the moneyline gap rule and the model-only count, and takes the day's room from today, not the bet's game day. | Long-shot moneyline: $5.59 where the board gives $1.00. Second bet on a held player: $10 where the board gives $0. | Each such bet typed by hand. |
| STAKE-3 | The bet form says "recommended at this price: $10.00" on a card the board gave $0 for a limit. | Day used up, player already held. | Each time "I bet this" is opened on such a row. |
| STAKE-5 | A free bet in the log uses up the daily max and the game cap when stakes are sized, while every screen counts it as $0. | $95 free bet logged: the next bet is trimmed to $5. | Days with a bonus bet. Under-betting, never over. |

### Storage (measured twice)

| Id | What is wrong | Numbers |
|---|---|---|
| ENG-2 | The browser holds 5,242,880 characters for everything the app saves. A bet takes about 1,450. Watch records, the board, grade history and sync bookkeeping are never cleared to make room for the bet log, and there is no early warning. | Room for about 3,400 to 3,600 bets with a lean setup; **about 1,300 to 1,700 with sync on** and the Watch study at its cap; 800 or fewer with a large grade history. At the wall a red banner shows, the bet is gone after a reload, and with sync on it is then deleted from the Worker and your other devices. The Worker's daily backups (kept 3 weeks) are the only copy left. Safari may have half the room (not tested). |
| ENG-1 | At the wall, Settings changes (bankroll, Kelly, floors) revert after a reload with no message. | Only at the wall. |
| ENG-3 | The grade history is never pruned and stores every finished board row, with copies when the same rows load on a later day. The calibration panels may count copies twice (to check). | About 180 characters a row. |

### Security and privacy (La Guardia)

| Id | What is wrong | Notes |
|---|---|---|
| GUARDIA-1 | A bet-log backup file you restore can run code inside the app and read the passphrase. Four spots write outside text without escaping (a bet's source tag, its date, a row's kind, an ESPN team abbreviation). | Only if you restore a file you did not make. Every other field tried (61) is escaped. |
| GUARDIA-2 | The passphrase cookie is sent to the page host (GitHub Pages) and any other 0xbeta.dev site on every page load. | Whether the host logs it is unknown. |
| GUARDIA-3, 5 | Clearing the passphrase in Settings leaves the cookie; a shared log code works for 24 hours and the app has no way to revoke it. | Small. |

### Fees

| Id | Status | What |
|---|---|---|
| EV-3 | Confirmed | The "also at" chip prices FanDuel Predicts with no fee, so it can say "OK ✓" and "Better confirmed price" for a bet under your floor. Rare: only game lines from one feed. |
| EV-1 | **Your check needed** | Polymarket US: search results quoting its own fee page say small accounts (under $10,000 of volume in 30 days) pay 9.5% since Sat 11/14; the app uses 6.95%. If true: EV about 1.2 points too high at 50¢, stakes about 40% too big. Saved profit is right either way (it uses the real fee from the fill). The page could not be opened from this session. |
| EV-2 | **Your check needed** | DraftKings Predictions and Underdog Predict are priced with no fee. DraftKings' terms mention at least 1¢ a contract plus an exchange fee. You have 9 DK Predictions tickets. |

### Easy level, last build step (small)

"About $650 or more lists a pick" should say $550, and is sometimes wrong the other way (EASY6-1, STAKE-4). A waiting exchange order closes "What filled?" with the wrong words (EASY6-2). "The price changed" printed twice (EASY6-3). On a phone a toast covers the Back button for 5 seconds (EASY6-5). Back-button leftovers after a level switch or a rotate (EASY6-6).

## 2. Found by the second group (second check pending, after 9:10 PM)

I re-ran PRICES-1 and PRICES-2 myself through the real form: both reproduce.

| Area | Claim | Example |
|---|---|---|
| + Add a bet | "Consensus odds" is used as the market chance with the vig still in, while the screen calls it no-vig (PRICES-1). | Stake $9.55 where the right number is $4.71; a no-stake Watch becomes "BET $6.09". |
| + Add a bet | "What should I bet?" lets a thin exchange book (ask 65, bid 43.5) set the fair chance (PRICES-2). | SKIP (−1.0%) becomes "BET $4.68". |
| Odds box | A price pasted with a typographic minus ("−110") is read as +110; "1,91" and "5/2" are read as other prices (PRICES-3). | A $10 win recorded as +$11.00, not +$9.09. |
| Board | In a game with a Draw both team moneylines are thrown out (PRICES-4). | Missed bets only, soccer. |
| Parlays | A boost or discount typed once stays on every later entry (PARLAY-1). Combo parlays with legs at different prices are staked 1.4 to 2.3 times the policy size (PARLAY-2). After a DNP on a Flex entry the editor keeps the old one-miss payout (PARLAY-3). An entry's stake is pushed up to $1 and needs only EV above 0% (PARLAY-4). | $7.68 where policy gives $4.67. |
| Worker | /moneyline keeps quotes a book has switched off (WORKER-1, low confidence). Polymarket takes the first of two games between the same teams (WORKER-2, MLB). An unknown team code gets the other side's price (WORKER-3). The OddsPapi reserve can be overspent (WORKER-4). A Kalshi soccer NO fill is saved as the other team's moneyline (WORKER-5). | |
| Statistics | The Watch study's resampling uses the old random generator that repeats after about 10,000 draws (STATS-2). The 1,000-bet verdict tests the 90% ROI range; the written rule says 95% (STATS-3). "That isn't luck" and "The model is beating the market" print from small samples (STATS-5, 6). | |

## 3. Your rules working as written: questions for you

These are not errors. The code does what was decided; the auditors measured the cost.

1. **One bet per player (STAKE-P1):** the highest EV keeps the stake even when it is an outlier held to $1, pushing out a market-checked bet worth about $7. Should this pick use the same order as the daily max (market-checked first)?
2. **Two "used today" numbers (STAKE-P2):** sizing leaves parlays and sold bets out of the day; the strip and the Hard stop count them. A $95 parlay day can reach $195 against a $100 max.
3. **Two ROIs (PROFIT-4):** Reports counts free-bet winnings (a break-even bettor with one free win shows +50%); the Scorecard leaves free bets out and its note does not say so. Which is "my ROI"?
4. **Kalshi smooth fee (EV-4):** after the fee Kalshi really charges, about 6.5% of approved small orders end under the 1.5% floor. None is ever negative.
5. **CLV on exchange bets (STATS-1):** measured against the ask at kickoff, with no fee. It reads even or positive on bets that did not beat the market. All 168 closes in your 11/14 export were exchange closes, median 0.00%.
6. **The running verdict (STATS-4):** read after every bet, a bettor with zero edge sees "evidence of an edge" at some point in 13% of histories, when the CLV half passes.
7. **Whole-number lines (PRICES-6):** the EV formula has no push in it.
8. **Pick'em tables (PARLAY-6):** every app starts from a copy of PrizePicks' payouts.
9. **Before anyone else gets the app (GUARDIA-11):** one shared passphrase opens everything on the Worker; a paid build needs its own Worker or accounts.

## 4. Checked and found right

| Area | What was checked | Result |
|---|---|---|
| Price ↔ chance | All 19,802 whole American prices from −10000 to +10000, both ways | 0 failures |
| EV after fees | The formula against "expected profit per dollar put in" for each book's fee; 700 rows through the real audit at 7 books | 0 mismatches |
| OK up to | Brute force, 28,028 cases, 7 books, floors 0% to 5% | 0 mismatches |
| Conservative chance | 20,000 random cases against min(model, market + 0.35 × (model − market)) | 0 differences |
| Kalshi and Polymarket tickets | Limit, shares, cost, payout; 13,873 Polymarket tickets | 0 mismatches at the app's fee setting |
| Kelly stake | 34,892 cases against the true growth-optimal stake | Never above one eighth of full Kelly |
| Limits on the board | 6,000 random boards, 110,948 rows: the floor, OK up to, daily max, model-only and long-shot limits, one bet per player, nothing already bet or started | 0 counter-examples (the game cap apart) |
| Modes and levels | 400 boards under all 10 tabs and the Easy level | A mode, a label or Easy never changes a stake |
| Profit | 260,000 random bets in 13 shapes against exact arithmetic | Identical, except 255 half-cent ties |
| Money totals | Today card (2,764 printed numbers), calendars, Reports, Scorecard, CSV, Easy, on logs up to 3,000 bets | Agree to the cent, apart from the items above |
| Days and time zones | 5 device time zones, both daylight-saving changes | No bet moves day |
| Game lines | 114 hand-worked cases and 30,000 random ones, 9 sports | Right, apart from never-played games |
| Player props | 122 cases, 376 box-score reads over 23 stat families on real ESPN data | Right, apart from the push and unusual wordings |
| Statistics | Every Scorecard and Reports number recomputed; do the 95% ranges hold the truth 95% of the time | Match; the ranges are honest when read once |
| Parlay math | 3,000 entries against all outcomes; Kelly against a fine search | Exact |
| Worker conversions | Kalshi, Polymarket, Novig prices, sides and lines by hand; vig removal | Right for the cases built |
| Sentinel score | 14,112 grid cases against the written formula | Match |

## 5. How to improve the app (ranked)

1. **A read-only "Check my history" list.** Re-grade each settled bet from its own game date and list the ones that would change, for you to approve one by one. It finds the flips, the pushes, the voids and the exchange profits above without changing anything.
2. **Protect the bet log first.** A storage line in Settings, a warning at 80%, the log saved before caches and Watch records, and never delete from the Worker after a failed save.
3. **Warn when the log has no backup and sync is off** (IMP-1).
4. **Let your own fills check the fee settings** (EV-I1). A fill's fee ÷ (shares × price × (1 − price)) would have caught the Polymarket change the day it happened.
5. **Say where the Market number comes from**: which books, how many, how old (IMP-4).
6. **On the God card, show the highest price to take in the book's own format** (−216, not only 68.4%), and use one name for that limit everywhere (IMP-2, IMP-3).
7. **One price reader for everything typed** (PRICES-10): refuse what is not a price.
8. **Settings that refuse bad values** (STAKE-I1): an empty Kelly box zeroes every stake with no reason shown.
9. **The test suite in 14.5 minutes** instead of 55: four workers and a "start from file K" option (ENG-5). All 160 pass side by side.
10. **Speed for a long log** (ENG-4): one shared date formatter takes the Bet log from 4.7 s to 3.1 s at 5,000 bets; paging does the rest.
11. Smaller: say what changed after Load (IMP-5), all "updated" times in Chicago time (IMP-9), a one-tap "Re-check this price" (IMP-8), installable on a phone (IMP-10), a note for each book's own limit (IMP-11), a card-chip clean-up (IMP-7).

## 6. One-minute checks only you can do

1. **Polymarket US fee:** open any fill placed after Sat 11/14. Fee ÷ (shares × price × (1 − price)). About 0.095 → set Settings › Fees › Polymarket US to 9.5. About 0.0695 → keep 6.95.
2. **DraftKings Predictions fee:** on a slip, fee ÷ contracts = cents a contract.
3. **The 10/26 Novig bet** (PRA Over 25, saved L, $2.78): did it land exactly on 25?
4. **Storage on your Mac:** I can add a "Storage used" line to Settings; phones cannot run a console check.

## 7. What I need from you

1. **"Fix"**, and which group first. My order:
   - **Build A, results you can trust:** GRADING-1, 2, 3, 4, 5, 6, 8, K1, the read-only history check, and the storage guard.
   - **Build B, money and limits:** PROFIT-1, 2, 3; STAKE-1, 2, 3, 5; EV-3; the + Add a bet inputs (PRICES-1, 2, 3) once their second check is in.
   - **Build C:** parlays, the Easy step-6 items, the four escaping spots and the cookie clean-up, the statistics wording.
   - **Worker v3.49** (merged only on your plain go): the switched-off moneyline quotes, Polymarket's nearest game, the OddsPapi count, share revoke, locked when the secret is missing.
2. **Your answers to section 3**, by number.
3. **The earlier list** is still open: a minimum stake for small bankrolls, Easy prices expiring after 30 minutes, a way to hide a "Not worth it now" card, fills on finished games.

## Not checked

- Your real bet log. With the "Send my log" code I can recompute every bet in it.
- The live Worker and the live books (no keys here, by rule).
- The books' own fee and payout pages: this session's network does not reach them.
- A real phone, and Safari's storage limit.
