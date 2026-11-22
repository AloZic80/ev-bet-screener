# Recheck of the numbers: the evidence (appendix)

Live v5.24 (commit 08ed18c), Sat 2026-11-21. Built by script from the auditors' and skeptics' own answers; nothing here was changed in the app. "Second look" is the skeptic's verdict where one was run; severity is the skeptic's when there is one, else the auditor's. S1 = changes a decision, a stake, a saved result or a money total; S2 = a number on screen is wrong or misleading; S3 = cosmetic.

**123 findings from 12 auditors; 71 were given a second look, 58 of those confirmed.**

## Index

| Id | Kind | Severity | Second look | Finding |
|---|---|---|---|---|
| ENG-2 | improve | S1 | Confirmed | Storage wall: about 2,000 bets in practice (3,500 at best), reached on day 50 to 80 at 25-40 bets a day |
| EV-1 | policy | S1 | Could not be verified here | Polymarket US: the app's 6.95% fee looks like the top-volume rate; small accounts are reported at 9.5% si … |
| EV-2 | policy | S1 | Could not be verified here | DraftKings Predictions, Fanatics Markets and other prediction apps are priced with no fee at all |
| GRADING-1 | bug | S1 | Confirmed | "Check results" re-grades every old bet against TODAY's game when the same two teams play again |
| GRADING-10 | bug | S1 | Confirmed, narrower | MLB game called early: totals and run lines are graded on the short score |
| GRADING-2 | bug | S1 | Confirmed, narrower | Live Games settles a bet on tomorrow's game from today's final (same teams on back-to-back days) and the  … |
| GRADING-3 | bug | S1 | Confirmed | A postponed or canceled game is graded as a 0-0 final |
| GRADING-4 | bug | S1 | Confirmed, narrower | A prop saved without its teams is graded against another game where a player with the same name played |
| GRADING-5 | bug | S1 | Confirmed | Doubleheader: a bet that names game 2 is graded on game 1, before game 2 starts |
| GRADING-6 | bug | S1 | Confirmed, narrower | A bet voided with the void button does not stay void |
| GRADING-7 | bug | S1 | Confirmed, narrower | Exchange positions partly sold, or settled at a part value, are saved with the wrong profit |
| GRADING-9 | bug | S1 | Confirmed, narrower | Stat names the grader does not know are graded as a different stat instead of being left for the owner |
| GRADING-K1 | bug | S1 | Confirmed | K1 full picture: a result exactly on a whole-number prop line is saved as LOSS for the Over and for the U … |
| GUARDIA-1 | bug | S1 | Confirmed | A bet-log backup file you restore can run a program inside the app and read the passphrase |
| PARLAY-1 | bug | S1 | Confirmed | A boost or discount typed once is saved and applied to every later 'Your entry', any size and any day |
| PARLAY-2 | bug | S1 | Confirmed, narrower | Combo (one-price) parlays: the haircut pulls every leg toward one shared break-even, so legs at different … |
| PARLAY-3 | bug | S1 | Confirmed | After a DNP on a Flex entry, the parlay editor keeps the old size's one-miss payout, so the saved profit  … |
| PRICES-1 | bug | S1 | Confirmed | "Consensus odds" typed in + Add a bet is used as the market chance with the vig still in (the screen call … |
| PRICES-2 | bug | S1 | Confirmed, narrower | "What should I bet?" lets a thin exchange book (one thinQ calls "not a price") set the fair chance, turni … |
| PRICES-3 | bug | S1 | Confirmed | The editor's Odds box accepts text that is not a price and reads it as a different price (a typographic m … |
| PROFIT-1 | bug | S1 | Confirmed | A won exchange bet built from two orders is priced at the LAST order's price for all its contracts |
| PROFIT-2 | bug | S1 | Confirmed | A position sold in part is not counted: the cash from the sale is dropped (and two sales never make the b … |
| STAKE-1 | bug | S1 | Confirmed | The per-game cap only counts money already in the Bet log, so the board can list more on one game than th … |
| STAKE-2 | bug | S1 | Confirmed | + Add a bet sizes without the long-shot moneyline rule, one bet per player, the moneyline gap rule and th … |
| WORKER-1 | bug | S1 | Confirmed, narrower | /moneyline keeps quotes the book has switched off (is_off / active:false). /spread and /total drop them.  … |
| EASY6-1 | bug | S2 | Confirmed | With a small bank, Today names $650 as the amount at which a pick lists, but $550 already lists one |
| ENG-1 | bug | S2 | Confirmed, narrower | Settings (bankroll, Kelly, floors) revert silently when storage is full |
| ENG-3 | improve | S2 | Confirmed | Grade history is never pruned and stores every finished board row, with duplicates across slate dates |
| EV-3 | bug | S2 | Confirmed | 'also at' prices FanDuel Predicts with no fee: it can say OK and 'Better confirmed price' for a bet that  … |
| GRADING-12 | improve | S2 | not run | A player whose name has an accent on ESPN is never graded automatically |
| GRADING-8 | bug | S2 | Confirmed, narrower | A result settled by the book is cleared once when the fill was first read the day after its game |
| GUARDIA-11 | policy | S2 | not run | One shared passphrase opens everything on the Worker, and a customer (Easy) build still calls the owner-o … |
| GUARDIA-2 | bug | S2 | Confirmed | The passphrase cookie is sent to GitHub Pages (props.0xbeta.dev) and any other *.0xbeta.dev site on every … |
| IMP-4 | improve | S2 | not run | Say where the Market number comes from: which books, how many, how old |
| PARLAY-4 | bug | S2 | By design (your rule) | A pick'em entry's stake is pushed UP to the smallest bet, and an entry needs only EV above 0% (no 1.5% fl … |
| PARLAY-5 | bug | S2 | Confirmed | Combo apps: the 'best entry for each size' cards ignore the 5% minimum hit chance, so a 3% slip is marked … |
| PARLAY-6 | policy | S2 | By design (your rule) | Every pick'em app uses a copy of PrizePicks' payout table; some apps pay differently or are not fixed-tab … |
| PARLAY-7 | improve | S2 | not run | A DNP, tie or refund on a pick'em entry has no choice in the Bet log; PK_SETTLE is only a sentence |
| PARLAY-8 | policy | S2 | not run | Same-game picks: how far the independent EV can be off (and in which direction) |
| PARLAY-9 | policy | S2 | not run | A model-only pick added by hand still gets a full Kelly stake for the entry |
| PRICES-4 | bug | S2 | Confirmed | In a game with a Draw, both team moneylines are thrown out as "both sides sum to 74%, juice left in" |
| PRICES-5 | bug | S2 | Confirmed, narrower | Sportsbook API: the fair chance can be an unlabelled estimate (a guessed 4.5% / 6% margin), or a wrong "e … |
| PROFIT-3 | bug | S2 | Confirmed, narrower | A won Kalshi or Novig fill is paid from a rounded American price, not from its contracts |
| PROFIT-4 | policy | S2 | By design (your rule) | The Scorecard and Reports print a different profit and ROI for the same bets when a free bet wins, and th … |
| STAKE-3 | bug | S2 | Confirmed | The bet form says 'recommended at this price: $10.00' on a card the board gave $0 for a limit |
| STAKE-4 | bug | S2 | Confirmed | Easy: 'About $X or more lists at least one pick' is false about 2% of the time (it can name less than wha … |
| STAKE-5 | bug | S2 | Confirmed | A free bet in the Bet log uses up the daily max and the game cap when stakes are sized, while every scree … |
| STAKE-P1 | policy | S2 | By design (your rule) | One bet per player (and one side per game): the highest EV keeps the stake even when it is an outlier or  … |
| STAKE-P2 | policy | S2 | By design (your rule) | Two different 'used today' numbers: the sizing leaves parlays and sold bets out of the day, the Bet log s … |
| STATS-1 | policy | S2 | Confirmed, narrower | CLV on exchange bets is measured against the ASK at kickoff and ignores the fee, so it reads positive (or … |
| STATS-2 | bug | S2 | Confirmed | The Watch study's '5,000 resamples' come from a random generator that repeats itself after about 10,000 d … |
| STATS-3 | bug | S2 | Confirmed | The 1,000-bet verdict tests the 90% ROI range; the written rule says the 95% range |
| STATS-4 | policy | S2 | Confirmed, narrower | The running Scorecard verdict is worked out again after every bet: with zero true edge it says 'evidence  … |
| STATS-5 | bug | S2 | Confirmed, narrower | 'That isn't luck' and 'normal bad luck' are printed from a bare median, one of them from 30 bets, under a … |
| WORKER-2 | bug | S2 | Confirmed, narrower | Polymarket: when the same two teams play twice within 18 hours (an MLB series night game then day game),  … |
| WORKER-4 | bug | S2 | Confirmed | OddsPapi monthly budget: one board load can spend the 10-call reserve and go past the monthly limit, beca … |
| WORKER-5 | bug | S2 | Confirmed, narrower | /mine Kalshi soccer (3-way) fills: NO on a team is saved as the other team's moneyline; NO on TIE gets a  … |
| EASY6-2 | bug | S3 | Confirmed, narrower | An order still waiting at the exchange closes What filled?, throws away what was typed and says "already  … |
| EASY6-3 | bug | S3 | Confirmed | The held full form says "The price changed" twice |
| EASY6-4 | bug | S3 | By design (your rule) | Save what filled still passes a limit it never named, if the limit appears between the two taps |
| EASY6-5 | bug | S3 | Confirmed, narrower | On a phone the new top toast covers the pick page's Back button for 5 seconds |
| EASY6-6 | bug | S3 | Confirmed, narrower | Browser Back leftovers: one dead Back in God after a level switch, and a phone pick that Back cannot clos … |
| EASY6-7 | improve | S3 | By design (your rule) | The typo guard only checks for prices that are too low: 95 cents typed for 59 cents saves on the first ta … |
| EASY6-8 | improve | S3 | Cannot happen with real data | A rebuilt row with the same price stored as a number instead of text is called "the price changed" |
| EASY6-9 | policy | S3 | not run | With $300 set aside Today says only that today's limit is used up, though $550 would list a pick |
| ENG-4 | improve | S3 | Confirmed | ctDay builds a date formatter on every call: Bet log takes 4.7 s and Reports 2.0 s at 5,000 bets |
| ENG-5 | improve | S3 | not run | Test suite: 55 min one by one, 14.5 min with 4 workers, all 160 pass side by side |
| ENG-6 | improve | S3 | not run | Two tests write screenshots to a hard-coded old session folder outside the repo |
| ENG-7 | improve | S3 | not run | About 9 KB of unused code: 10 functions and 46 CSS classes |
| EV-4 | policy | S3 | By design (your rule) | Kalshi: EV uses the smooth fee while Kalshi rounds up to the cent. The v5.05 decision, measured |
| EV-5 | bug | S3 | Confirmed, narrower | The price is saved as whole American odds, so the win recorded differs by a few cents from the 'back' amo … |
| EV-6 | bug | S3 | not run | The written policy still describes the Kalshi rule that v5.05 removed |
| EV-7 | bug | S3 | Confirmed, narrower | A Novig bet on a game in play: the board's EV leaves out the live fee that the bet form adds |
| EV-I1 | improve | S3 | not run | Idea: let the owner's own fills check the fee settings |
| EV-I2 | improve | S3 | not run | Idea: the ticket's limit is 'OK up to', where EV is only the floor, while the stake is sized for the EV a … |
| EV-I3 | improve | S3 | not run | Idea: a fee box left empty counts as 0% without saying so |
| GRADING-11 | policy | S3 | By design (your rule) | The 4-hour rule grades a no-start fill against game 1 when it was placed during game 1 for tomorrow's rem … |
| GRADING-13 | improve | S3 | not run | The pick'em note says "this app's rules" |
| GUARDIA-10 | improve | S3 | not run | Links built from outside data: Moneylines Open book link is unescaped and not scheme-checked |
| GUARDIA-12 | improve | S3 | not run | Another web page he visits could burn his API budget with one link (Lax cookie, top-level GET) |
| GUARDIA-3 | bug | S3 | Confirmed, narrower | Clearing the passphrase in Settings does not remove the cookie |
| GUARDIA-4 | improve | S3 | By design (your rule) | Data routes open to everyone if the SCREENER_PASS secret is ever missing |
| GUARDIA-5 | improve | S3 | Confirmed, narrower | The share code is described as one-time but works for 24 hours, and the app cannot revoke it |
| GUARDIA-6 | improve | S3 | not run | Send my log sends everything except notes, including exchange fill and order ids, market tickers, time zo … |
| GUARDIA-7 | improve | S3 | not run | No limit on wrong passphrases or wrong sync passwords; 4-character unsalted sync hash is the credential |
| GUARDIA-8 | improve | S3 | not run | The Odds API key is stored in clear in the browser and goes out in a URL |
| GUARDIA-9 | improve | S3 | not run | Share size cap counts characters not bytes; no Origin check; code is logged by Cloudflare |
| IMP-1 | improve | S3 | not run | Warn when the bet log has no backup and sync is off; ask the browser to keep the data |
| IMP-10 | improve | S3 | not run | Make it installable on a phone and say when the board shown is an old saved one |
| IMP-11 | improve | S3 | not run | A place to note each book's own limit (what the book lets you stake) |
| IMP-2 | improve | S3 | not run | On the God card, show the highest price to take in the book's own format (-216), not only 68.4% |
| IMP-3 | improve | S3 | not run | Use one name for the price limit on every screen |
| IMP-5 | improve | S3 | not run | After Load, say plainly what changed since the last board |
| IMP-6 | improve | S3 | not run | Tell the person when the typed bankroll no longer matches their results |
| IMP-7 | improve | S3 | not run | Clean up the card's chips: a dash with no words, the age twice, four labels for one chance |
| IMP-8 | improve | S3 | not run | A one-tap 'Re-check this price' on a sportsbook card |
| IMP-9 | improve | S3 | not run | Show every 'updated' time in Chicago time like the rest of the app |
| PARLAY-10 | improve | S3 | not run | The leg-tag decision file says blendProb; the code (correctly per v4.55) uses La Contadora's chance |
| PARLAY-11 | improve | S3 | not run | Discount estimate (pkDiscP): the arithmetic is right, but the assumption gives extreme chances when the p … |
| PRICES-10 | improve | S3 | not run | Ideas: one price reader for everything typed, say where the market chance came from, and size an estimate … |
| PRICES-6 | policy | S3 | Confirmed | Whole-number lines: the EV formula (chance / price - 1) has no push in it |
| PRICES-7 | bug | S3 | not run | A price stamped in the future counts as "read 0 s ago" (a device clock running slow makes saved answers l … |
| PRICES-8 | improve | S3 | not run | The Odds API consensus averages in a book whose own two sides do not add up (no sanity range) |
| PRICES-9 | bug | S3 | not run | "Check market odds" can tag a row with another line's price, and drops the plus sign |
| PROFIT-5 | bug | S3 | not run | The Today line still says "(on the line counted as gone)"; since v4.07 nothing in play is counted |
| PROFIT-6 | bug | S3 | not run | Live Games: a free bet's "pays $…" includes a stake that does not come back, so its break-even % is too l … |
| PROFIT-7 | improve | S3 | not run | The Bet log's CSV does not add up to the day on screen when a cancelled bet lost money |
| PROFIT-8 | improve | S3 | not run | Small display effects of keeping money as decimals, not cents: half-cent ties round down, a zero day can  … |
| PROFIT-9 | bug | S3 | not run | A bet marked WIN with no readable price counts as a win and as "in play" at once, with $0, and is not fla … |
| STAKE-I1 | improve | S3 | not run | Stake settings accept anything: an empty Kelly or haircut zeroes every stake with no reason, a negative g … |
| STAKE-I2 | improve | S3 | not run | Smallest and largest bet are dollars while the caps are percentages, so they do not follow the bankroll |
| STAKE-I3 | improve | S3 | not run | Small differences: stakes are not whole cents inside, the exact-floor comparison has no tolerance, a Make … |
| STATS-6 | bug | S3 | Confirmed, narrower | 'The model is beating the market' is printed on any difference from 100 picks, even when the two Brier sc … |
| STATS-7 | bug | S3 | Confirmed, narrower | The Scorecard counts a bet with no game text as its own game, even when its event is saved; Reports count … |
| STATS-8 | bug | S3 | Confirmed, narrower | A chance a hair under a band edge is filed under the edge on the board and above it in the saved record;  … |
| STATS-9 | improve | S3 | not run | Ideas for this area |
| WORKER-3 | bug | S3 | Confirmed, narrower | Polymarket moneyline/spread: a team code the event does not know silently gets the other side's price ins … |
| WORKER-6 | bug | S3 | not run | BettingPros 50-a-day counter loses a call when two loads overlap (read, then write, in the Cache API) |
| WORKER-7 | bug | S3 | not run | AI spend counter ($5 a day / $90 a month caps) undercounts when answers finish together |
| WORKER-8 | bug | S3 | not run | /mine Novig: the fallback for quantities sent in whole contracts rescales the price but not the quantity |
| WORKER-9 | bug | S3 | not run | /pinnapi/live cache hit drops the x-src-at time, so the app stamps a cached Pinnacle live price as read n … |
| WORKER-I1 | improve | S3 | not run | Improvement: send the fetch time with every price, not the reply time |
| WORKER-I2 | improve | S3 | not run | Improvement: consensus counts quotes, not distinct books, and takes the median of each side separately |

## ev: EV, fees, OK up to, the exchange tickets (Kalshi, Polymarket US), Makes, and which book is pick …

### EV-1 · Polymarket US: the app's 6.95% fee looks like the top-volume rate; small accounts are reported at 9.5% since November 2026

- **Kind / severity (auditor):** policy / S1 · confidence 0.6 · by reading only
- **Where:** feeRate (index.html line 3258); Settings > Fees box fPoly, default 6.95 (line 2737). The shape of the formula, fee x (1 - price) of the stake, is right; the question is the number.
- **Inputs:** Her chance 55%, Polymarket price 51 cents, bank $1,000, default settings. Grid: prices 17 to 75 cents, chances from 2% under to 8% over the price.
- **The app gives:** Fee 6.95% x 0.49 = 3.41% of the stake; EV +4.3%; stake $5.58. At its own limit (OK up to 52.45 cents for a 55% chance) EV +1.5%. Kalshi 50c vs Polymarket 49.5c at a 55% chance: app scores Polymarket +7.34%, Kalshi +6.28% and picks Polymarket.
- **Right:** If the coefficient is 0.095 (reported for accounts under $10,000 of 30-day taker volume): fee 4.66%, EV +3.0%, stake $3.97. At the app's limit the EV is +0.3%, not +1.5%. Polymarket 49.5c is +6.02%, so Kalshi 50c (+6.28%) is the better bet.
- **Why:** Polymarket US's fee page and press reports of a November 2026 CFTC filing (as the search tool read them; I could not open the pages themselves) give fee = coefficient x contracts x p x (1 - p) with the coefficient by 30-day taker volume: 0.095 under $10,000, 0.085, 0.075, and 0.0695 only at $250,000 or more (new accounts get 0.0695 for 7 days). With $1 to $10 stakes his account is almost surely in the first tier. EV per dollar put in = (q - p - F) / (p + F) with F = coefficient x p x (1 - p).
- **Money effect:** About 1.2 points of EV too high at 50 cents on every Polymarket US bet (2.0 points at 17 cents). On the grid, 705 of the 1,617 cells the app passes (44%) are under the 1.5% floor at 9.5%, and 811 cells show a positive EV that is not there. Stakes about 40% too big. The ticket's 'Cost <=' is passed in 2,331 of 13,873 tickets (worst 22 cents over a $9.96 stake).
- **How often:** Every Polymarket US bet, if his account is under $10,000 of taker volume in 30 days. One-minute check with no code: any Polymarket fill after 11 November, fee / (shares x price x (1 - price)); about 0.095 means the setting should be 9.5.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/ev/q1b.js (poly_095, polyExample), q456.js (Q4.over095), q6e.js -> {"appPicks":"Polymarket US","appEvKalshiPts":6.28,"appEvPolyPts":7.34,"polyAt9_5Pts":6.02}. The a …
- **Proposed fix (not applied):** No code change. A fee setting is the owner's decision: set Settings > Fees > Polymarket US to what his own fills show. Idea EV-I1 would catch the next change automatically.
- **Second look: Could not be verified here** (severity S1, confidence 0.75, re-ran the check: yes)
  - Corrections to the claim: (1) The start date on the page is 14 November 2026, 12:00 AM ET, not 11 November. The owner's check should use fills placed after 14 November. Fills before that date were charged 0.0695, so the old setting was right for them. (2) A resting Limit order that fills later as a maker pays no fee. Only taker fills pay the tier. The app's Limit is at La Contadora's most, which is usually above the ask, so it normally fills at once as a taker and the claim holds for those fills. (3) The auditor's arithmetic is right.
  - Its own check: I re-ran q1b.js and q6e.js and got the same numbers. Then I worked the example by hand. At a 55% chance and 51 cents: at 6.95% the fee is 0.0695 x 0.51 x 0.49 = 0.01737 a share, so EV = (0.55 - 0.51 - 0.01737) / 0.52737 = +4.29%, which is what the app shows. At 9.5% the fee is 0.02374 a share, so EV = +3.05%. Kalshi at 50 cents: +6.28%. Polymarket at 49.5 cents with 9.5%: +6.02%. The app's feeRate is (cfg.poly/100) x (1 - p), and the setting defaults to 6.95 (index.html lines 2737 and 3262). docs/EV-CALCULATOR.md line 57 says the same, and memory/platforms/books.md has no Polymarket fee fact. I could NOT open the source: docs.polymarket.us does not resolve from this session (the host is not on the allowed network list), and kalshi.com failed the same way, so I stopped fetching. All I have is the search engine's reading of Polymarket US's OWN pages (docs.po …
  - Written decision found: No written decision on the 6.95 number beyond docs/EV-CALCULATOR.md line 57 ('Polymarket US / 6.95% x (1 - price) / Same curve.') and the v3.03 comment on feeRate. The fee setting is the owner's to choose (CLAUDE.md: no fee change without the owner's own words).
  - How often for you: Every taker fill on Polymarket US since 14 Nov, if the 0.095 tier applies to him. Polymarket US is his second book by count (34 of 353 tickets by 11/14).
  - Your saved history: The money saved on his bets should already be right: a Polymarket fill brought in from the book carries the real fee in b.fee, and betProfit uses b.fee before snap.fee (v5.11, betFeeOf). What may be off is the forecast saved at bet time (snap.fee, snap EV and stake), which used 6.95. Dry run, changing nothing: for each Polymarket US bet with bet time on or after 2026-11-14 that has b.fee and a share count, list b.fee / (shares x p x (1 - p)) next to snap.fee / (1 - p). Rows where the first is about 0.095 and the second 0.0695 are bets that were sized a …
  - Smallest safe fix: No code change. The owner sets Settings > Fees > Polymarket US to what his own fills show (9.5 if the check gives about 0.095). One-minute check: open any Polymarket US fill placed after 14 Nov and work out fee / (shares x price x (1 - price)). About 0.095 means set 9.5; about 0.0695 means keep 6.95. To have the page read here, docs.polymarket.us must be allowed in the session's network settings.
  - Risks in the fix: Changing his own setting breaks no test. Changing the app's DEFAULT would break tests that pin 6.95 (tests/book-choice-v461-test.js, tests/poly-strip-test.js, tests/v513-firstrun-test.js all mention fPoly / 6.95), and the migration at line 12267 only fills 6.95 when the box is empty. The setting is one number …
  - Tests that pin today's behaviour: Tests that pin the 6.95 default: book-choice-v461-test.js, poly-strip-test.js, v513-firstrun-test.js. No test checks the fee against Polymarket's real tiers.

### EV-2 · DraftKings Predictions, Fanatics Markets and other prediction apps are priced with no fee at all

- **Kind / severity (auditor):** policy / S1 · confidence 0.55 · by reading only
- **Where:** feeRate (index.html line 3258): only Kalshi, ProphetX, Polymarket, Novig, Fliff and a name with both 'fanduel' and 'predict' have a rule; any other name gets the licensed-book fee, 0 by default. These apps are offered in + Add a bet and in Books you bet (line 6239).
- **Inputs:** Her chance 57.5%, price 52 cents at DraftKings Predictions; and a thinner one, chance 54.5% at 52 cents.
- **The app gives:** Fee 0 for DraftKings Predictions, DK Predictions, Fanatics Markets, Crypto.com, Robinhood, Underdog Predict, Sporttrade. EV +10.6%, OK up to 56.7 cents. Thin case: +4.8% (a bet).
- **Right:** With the 2 cents a contract that review sites report (DraftKings Predictions: 1 cent under 20c and at 97c+, 2 cents from 20c to 96c, on each buy; Fanatics about 2 cents mid-range): EV = (0.5752 - 0.52 - 0.02) / 0.54 = +6.5%, OK up to 54.7 cents. Thin case: +0.9%, under the floor.
- **Why:** A per-contract fee paid at purchase is exactly what the app already counts for FanDuel Predicts (2% / price of the stake). The same size of fee at these apps is simply not in the rule list, so their EV is shown as if they were a no-fee sportsbook.
- **Money effect:** About 4 points of EV too high at mid prices; bets shown between +1.5% and about +5% at these apps are under the floor or negative after the fee. Example: a $5 bet shown at +4.8% is really worth about +4 cents, not +24 cents.
- **How often:** Only when a bet is priced at one of these apps (a board row, + Add a bet, a book swap). I cannot see whether he uses them; the default Books you bet contains 'draftkings'.
- **Check that runs:** node .../audit/ev/q6c.js -> feeAt52: DraftKings Predictions 0, Fanatics Markets 0, FanDuel Predicts 0.03846; dkPred: appEvPts 10.62, evWith2centFeePts 6.52; dkPredThin: 4.81 vs 0.93. The fee facts are from review sites via search (casino.org pages) …
- **Proposed fix (not applied):** Owner's decision (a fee setting): give prediction apps a per-contract fee like FanDuel Predicts' (one Settings box), or extend the FanDuel rule to names with 'predict' / 'fanatics markets'. He can confirm the fee on any slip before confirming an order.
- **Second look: Could not be verified here** (severity S1, confidence 0.7, re-ran the check: yes)
  - Corrections to the claim: (1) Narrower. Among the apps that can be a board row, the bug only touches DraftKings Predictions and Underdog Predict. Fanatics Markets and the other combo apps are only ever priced by hand in + Add a bet. (2) The 'right answer' depends on a total of 2 cents a contract, which is not confirmed. DraftKings' own terms only confirm $0.01 plus an exchange fee of unknown size. With $0.01 alone, the example is EV (0.5752 - 0.52 - 0.01) / 0.53 = +8.5% (not +6.5%), and the thin case is +2.8%: it still passes, it is not under the floor. With 2 cents the auditor …
  - Its own check: Code fact, run (q6c.js again, and read feeRate): any name without kalshi, prophet, polymarket, novig, fliff, or both fanduel and predict gets cfg.book/100, which is 0. 'DraftKings Predictions', 'DK Predictions', 'Underdog Predict', 'Fanatics Markets', 'Crypto.com', 'Robinhood' and 'Sporttrade' all get 0. Which of these can be a board row (grep): DraftKings Predictions can. BettingPros book 74 is asked for when it is in Books you bet (index.html line 11053; the Worker maps 74 to 'DraftKings Predictions' in src/index.js line 218; tests/texas-swap-test.js line 44). The Sportsbook API's DRAFT_KINGS_PREDICTIONS also maps to it (sbBook, line 10589). Underdog Predict can too, through BettingPros book 76. Fanatics Markets, Crypto.com, Robinhood, Gemini, Webull and Sporttrade can NEVER be a board row. No loader maps a source to them: BOOK_IDS has no crypto or robin …
  - Written decision found: None. History v4.05 (memory/history.md line 416) records that BettingPros carries DK Predictions (74) and Underdog Predict (76), but no fee was ever set for them. docs/EV-CALCULATOR.md's fee table only lists Kalshi, Polymarket US, Novig, FanDuel Predicts, and ProphetX, Fliff and licensed books ('the % of stak …
  - How often for you: Sometimes: 9 of 353 tickets by 11/14, and only when DraftKings Predictions is in Books you bet (the default list has 'DraftKings', the sportsbook, which does not match it).
  - Your saved history: His 9 DK Predictions bets were saved with snap.fee 0, so their forecast EV and stake were too high. Whether the PROFIT is wrong depends on whether the stake he typed included the per-contract fee; a typed bet has no b.fee. Dry run: list DK Predictions bets with (stake, odds, snap.fee). He compares each one with the book's history (amount charged versus contracts x price) and approves any change one by one.
  - Smallest safe fix: This is the owner's decision (a fee setting). The smallest choice: a per-contract cents box for the other prediction apps, counted the way the FanDuel Predicts rule already is (cents / price of the stake), set from his own slips. Until then, he can treat any DK Predictions EV under about +4% as doubtful. One-minute check: on a DK Predictions slip (or the fill in his history) see the fee and the shares; fee / shares = cents a contract. Do the same once on Fanatics Markets if he uses it.
  - Risks in the fix: A new fee rule changes the EV, the floor and the stake for DK Predictions and Underdog Predict rows. That needs the owner's own words. tests/books-test.js line 38 only pins the FanDuel Predicts fee and the sportsbooks' 0 (DraftKings, FanDuel), so it would still pass. A rule matched on /predict/ must not catch …
  - Tests that pin today's behaviour: None pins a 0 fee for the prediction apps. books-test.js pins the FanDuel Predicts fee and 0 for the sportsbooks.

### EV-3 · 'also at' prices FanDuel Predicts with no fee: it can say OK and 'Better confirmed price' for a bet that is under the floor

- **Kind / severity (auditor):** bug / S2 · confidence 0.95 · proven by a check that runs
- **Where:** altBooksAll, index.html line 5448 (a board row is stored under its short label: book: bookLabel(x.book) = 'FD Predicts') and line 5458 (maxPriceFor(act, e.book) and feeRate(e.book, ...) use that label). feeRate needs 'fanduel' AND 'predict' in the name, so 'FD Predicts' gets fee 0.
- **Inputs:** Model 55%, market 54% (her chance 54.35%). Card at Kalshi 51 cents. The same bet on the board at FanDuel Predicts 52 cents. Books you bet = Novig, Kalshi, FanDuel Predicts.
- **The app gives:** Chip 'FD Predicts -108 52.0% · OK ✓'. Tooltip: 'under La Contadora's OK to 53.5% at this book (its fee included) · her EV here +4.5% after fees'. Note under the card: 'Better confirmed price at FD Predicts · Send the Sentinels to update the card'.
- **Right:** Fee 2% / 0.52 = 3.85% of the stake. OK up to 51.55% (52 cents is over it). EV = (0.5435 - 0.52 - 0.02) / 0.54 = +0.65%. The board's own FanDuel Predicts row for the same bet says exactly that: WATCH, +0.6%, under the 1.5% floor, $0. The Kalshi card is +3.0%, so nothing better is at FanDuel.
- **Why:** The chip is built from the display label, and the fee rule does not recognise the label. The exchanges are not affected (their chips use the real names: Kalshi chip OK up to 51.8% vs Novig 53.55%, checked).
- **Money effect:** The chip sizes nothing and moves nothing (tapping it opens the FanDuel row, which has the right numbers). The risk is acting on it: it points him from a +3.0% bet to a +0.65% one while saying it is 1.5 points better, about 4 points of EV overstated on that chip.
- **How often:** Whenever a bet on the board also has a FanDuel Predicts row and FanDuel Predicts is in Books you bet.
- **Check that runs:** node .../audit/ev/q6d.js -> alsoAtChip {label:'FD Predicts', feeUsed:0, state:'ok', okUpToShown:0.5355, evShownPts:4.52}; fanduelPredictsRowOnTheBoard {feeUsed:0.0385, evPts:0.65, pass:false, watch:true, okUpTo:0.5155}; text 'also at -108 52.0% · O …
- **Proposed fix (not applied):** In altBooksAll use the row's real book for the two math calls: const fb=e.x?e.x.book:e.book; then maxPriceFor(act, fb, cfg.eMin) and feeRate(fb, e.p, cfg.fees) (and feePaidOf in the chip). Or let feeRate accept 'fd predict'. Add a test with a FanDuel Predicts row.
- **Second look: Confirmed** (severity S2, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: It is rarer than 'whenever'. Only the Sportsbook API brings a FanDuel Predicts row: BettingPros has none (line 11053), and SGO and the Odds API do not map it. That feed carries game lines only (moneyline, spread, total) and skips started games. FanDuel Predicts must also be in Books you bet for the chip to sit in his list and say 'Better confirmed price'. I could not get the card itself painted in the headless page (no [data-pcidx] card was drawn), so the chip text comes from altBooksHtml on the real rows, the same function the card calls at line 6381.
  - Its own check: I reproduced it along the real load path, not by calling the inner function with made-up inputs. My script is skeptic-fees/ev3_real.js, output in ev3_real.out. It sends a Sportsbook API answer shaped the way sbToRows reads it: one moneyline with a KALSHI outcome at 51 cents and a FAN_DUEL_PREDICTS outcome at 52 cents, both sides' averages, fair 54.35%. Books you bet is typed into the real #books box as 'Novig, Kalshi, FanDuel Predicts'. Then loadSbapi() runs (mergeRows, audit, render). Result: the board rows are Kalshi fee 0.0343, +3.03%, pass, $3.94, and FanDuel Predicts fee 0.0385, +0.65%, not passing, $0. altBooksAll(Kalshi row) gives the chip label 'FD Predicts', fee 0, state 'ok', OK up to 53.55%, EV +4.52%. altBooksHtml prints 'also at -108 52.0% · OK ✓ ... Better confirmed price at FD Predicts'. My own arithmetic: fee = 0.02 / 0.52 = 3.846% of the s …
  - Written decision found: None. The v4.95 and v5.09 comments on the also-at strip say the chip should use 'its fee included'. The tooltip itself says 'at this book (its fee included)', so the label is a plain bug.
  - How often for you: Rare: 1 FanDuel Predicts ticket in 353 (a free bet). It needs a Sportsbook API game line at FanDuel Predicts for the same pick as another card, with FanDuel Predicts in his books.
  - Your saved history: None. The chip sizes and saves nothing; tapping it opens the FanDuel Predicts row, which shows the right numbers. No saved bet can hold this error.
  - Smallest safe fix: In altBooksAll (line 5458) use the row's real book for the math: const fb=e.x?e.x.book:e.book; then maxPriceFor(act, fb, cfg.eMin) and feeRate(fb, e.p, cfg.fees). Keep e.book (the label) for display and for the put() id. New test: the ev3_real.js setup, checking the chip state is 'over' and the chip's OK up to is 51.55%, which matches the FanDuel Predicts row.
  - Risks in the fix: Low. For live entries e.x is null, so nothing changes for them. Board rows of other books give the same answer under the label or the real name, except DraftKings Predictions, which is 0 under both. tests/v501-test.js and tests/v509-test.js cover also-at but have no Predicts row, so they should still pass.
  - Tests that pin today's behaviour: None pins the wrong behaviour. v501-test.js and v509-test.js test also-at without a Predicts row.

### EV-4 · Kalshi: EV uses the smooth fee while Kalshi rounds up to the cent. The v5.05 decision, measured

- **Kind / severity (auditor):** policy / S2 · confidence 0.9 · proven by a check that runs
- **Where:** kalshiFractionalFit / kalshiFitRow (lines 4085, 4100), auditCore line 3929. The code does exactly what memory/decisions/actionable-ev.md (v5.05) says.
- **Inputs:** Orders $1.00 to $5.00 by 5 cents, asks 17 to 75 cents, shown EV from 1.5% to 4.0%: 124,254 cases, filled at the ask. Real fee: the 7% fee rounded up to the cent per order (also run as cost + fee rounded up to the cent as one total: same within 0.01 point).
- **The app gives:** Approves on the smooth fee. Worst case: ask 54c, budget $1.00, 1.74 shares, smooth fee 3.03 cents: shown +4.0%.
- **Right:** After the fee really charged (4 cents): +3.0%. Near the floor: ask 26c, budget $1.03, 3.73 shares: shown +2.35%, real +1.38% (under the floor).
- **Why:** Rounding can take less than 1 cent per order, so on a $1 order it is at most 1 point of EV and cannot turn a +1.5% bet negative; it is biggest on the smallest orders.
- **Money effect:** Never negative (0 of 124,254; 0 of 28,674 even if the whole order fills at the limit, worst +0.5%). Under the 1.5% floor after the real fee: 9.8% of the grid (17.5% for $1.00-1.50, 11.6% for $1.55-2.50, 7.3% for $2.55-5.00); 6.5% (209 of 3,238) when budgets are the app's own Kelly sizes at a $1,000 bank. Average cost 0.2 point of EV = half a cent per order ($0.0048): ab …
- **How often:** Every Kalshi order loses between 0 and 1 cent to it, if Kalshi rounds up at all (one fill in memory/platforms/books.md showed no round-up; Kalshi's API notes describe a rebate across fills).
- **Check that runs:** node .../audit/ev/q3.js (part B: underFloor 12132 of 124254, negative 0, avgDropPts 0.203, byBudget) and q1b.js (kalshiKellySized: bet 3238, underA 209, negA 0, avgExtraFeeDollarsA 0.0048).
- **Proposed fix (not applied):** None proposed: a question for the owner. Keep as is, or check the floor at the rounded fee only for orders under about $2.50, where 12% to 18% of approved bets end under the floor.
- **Second look: By design (your rule)** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The numbers are right. There are two things that make the real cost smaller: a Kalshi fill that rests as a maker pays a quarter of the fee, so there the app's 7% is cautious; and the one fill the owner checked showed no round-up at all.
  - Its own check: I re-ran q3.js and got the same output. Then I wrote my own grid (skeptic-fees/ev4_own.py, run with python -I, nothing from the app): budgets $1.00 to $5.00 by 5 cents, asks 17 to 75 cents, shown EV 1.5% to 4.0% by 0.1, shares = the largest 0.01 with shares x p x (1 + 0.07(1 - p)) within the budget, fee charged = the 7% fee rounded up to the cent. Result: 124,254 cases; 12,281 under the floor (9.9%); 0 negative; average drop 0.206 points. By budget: 17.7% ($1.00-1.50), 11.8% ($1.55-2.50), 7.4% ($2.55-5.00). Worst case: $1.00 at 40 cents, +4.0% shown, +2.98% real. Both hand cases check: 54 cents / $1 / 1.74 shares goes from +4.00% to +2.97%; 26 cents / $1.03 / 3.73 shares goes from +2.35% to +1.38%. Kalshi's own pages (search-engine reading only; kalshi.com did not resolve here) back the premise. The fee schedule PDF (dated 7 Jul 2026) says fees = round up( …
  - Written decision found: memory/decisions/actionable-ev.md line 15 (v5.05): 'EV and the floor use the smooth fee; the v2.50 recompute from the rounded fee and its floor drop are gone (superseded)'. The 'fee rounded up to the cent' there is only a sizing safety buffer.
  - How often for you: Every Kalshi taker order, 0 to 1 cent each, if Kalshi rounds up at all. Kalshi is 6 of 353 tickets, so about $5 per 1,000 orders at most.
  - Your saved history: Saved Kalshi fills carry the real fee in b.fee, so the money totals are right. Only the forecast EV is up to 1 point high on $1 orders.
  - Smallest safe fix: None. This is a question for the owner (keep as is, or check the floor at the rounded fee for orders under about $2.50). Changing the floor rule needs his own words.
  - Risks in the fix: Checking the floor at the rounded fee would bring back the v2.50 behaviour that v5.05 replaced, and would change kalshiFractionalFit and kalshiFitRow. Tests built for the v5.05 sizing would need updating.
  - Tests that pin today's behaviour: The v5.05 Kalshi sizing tests, and math-audit-test.js line 40 (the Kalshi smooth fee).

### EV-5 · The price is saved as whole American odds, so the win recorded differs by a few cents from the 'back' amount the card and form showed (adds to known K3)

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** addToLog saves odds: r.offeredRaw (line 7838); betProfit (line 8100) works a win out from those odds; the form's Max payout is saved as towin only when a slip was typed (ed._slip, about line 6877). autoAddFromRow (line 14198) does the same for fills.
- **Inputs:** Kalshi card at 52 cents saved through I bet this with nothing typed; Novig card at 52.0%, $10.
- **The app gives:** Kalshi: form says cost $9.17, max payout $17.05; the saved bet has odds '-108' (= 51.92%) and betProfit on a win = +$7.92; the log shows '51.9c + fee'. Novig: card '$10.00 wins $9.23'; saved '-108'; a win is recorded as +$9.26.
- **Right:** Kalshi: 17.05 - 9.17 = +$7.88. Novig: 10 / 0.52 - 10 = +$9.23.
- **Why:** 52% is -108.33 in American odds; rounding to -108 changes the payout. At most half an odds point: up to 0.5% of the stake on a win, either direction, so it roughly cancels over many bets. A record that differs from the receipt, not a leak.
- **Money effect:** Up to 5 cents per $10 win, up or down. Kalshi example +4 cents, Novig +3 cents.
- **How often:** Every exchange bet (prices are in cents or percent) whose win was not typed. For fills the exact payout is known (fillQty shares x $1) but not used.
- **Check that runs:** node .../audit/ev/q7.js -> Kal Card: form {cost:'9.17', win:'17.05'}, saved {stake:9.17, odds:'-108', profitIfWin:7.92, paidOdds.listed:'51.9c'}; Novi Card: money '$10.00 wins $9.23', saved profitIfWin 9.26. Also there (adds to K10): the Polymarket …
- **Proposed fix (not applied):** When the form has both Cost and Max payout for an exchange bet, save towin = payout - cost; for a fill, towin = fillQty - (cost + fee). betProfit already prefers towin.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The 'right answer' assumes the order filled exactly as the card said. Once the fill links, the true win is fillQty - fillCost from the fill (fillQty and fillCost are then on the bet), not the card's figure. The effect is 0 to 5 cents per $10 win either way, cancelling over many bets. It is the PROFIT-3 rounding on card-saved bets. I rate it S3 (cents; it changes no decision and no stake), not S2.
  - Its own check: Re-ran q7.js: the Kalshi card bet is saved with stake 9.17 and odds '-108', and profitIfWin is 7.92; the Novig card shows '$10.00 wins $9.23' and saved profitIfWin is 9.26, as claimed. My own arithmetic: 17.05 shares at 52c = $8.866 + fee 0.07 x 17.05 x 0.52 x 0.48 = $0.298, so about $9.17. A win pays $17.05, so +$7.88. The app: 9.17 x (1/0.51923 - 1 - 0.0336)/1.0336 = 7.92. Novig: 10/0.52 - 10 = 9.23 against 10 x (1/0.51923 - 1) = 9.26. By reading linkFill: when the real fill later links to this card bet, the price differs by 0.0008, under the 0.006 threshold, so nothing is flagged and the rounded -108 stays.
  - Written decision found: None.
  - How often for you: Most exchange bets saved from cards, cents each.
  - Your saved history: Cents. Bets with fillQty and fillCost linked (and stake equal to fillCost within $0.06) can be recomputed exactly; card bets with no fill cannot (snap.kalshiFee.shares gives the planned shares only).
  - Smallest safe fix: Covered by the PROFIT-3 fix where a fill is linked (fillQty - fillCost when stake equals fillCost and nothing was hand-edited). For a card bet with no fill, save towin = payout - cost when the form had both. The test that must fail first and pass after: the q7 Kalshi and Novig cards, which must record 7.88 and 9.23.
  - Risks in the fix: Low. Keep a typed towin first. Do not touch snap.
  - Tests that pin today's behaviour: bugfix-money-test.js M1 (rounded fill odds kept on Save).

### EV-6 · The written policy still describes the Kalshi rule that v5.05 removed

- **Kind / severity (auditor):** bug / S3 · confidence 0.95 · by reading only
- **Where:** docs/EV-CALCULATOR.md line 109; memory/platforms/books.md line 5.
- **The app gives:** The doc says: Kalshi's fee is rounded up to the cent on each order; after the stake is turned into whole contracts her EV is worked out again with the fee really charged and a bet under the floor is skipped. books.md says the app still sizes Kalshi in whole contracts.
- **Right:** Since v5.05 the app sizes in 0.01 shares, keeps EV on the smooth fee and skips nothing after rounding (memory/decisions/actionable-ev.md is right).
- **Why:** The doc paragraph was not updated when v5.05 superseded v4.53; a reader checking the Kalshi numbers against the doc gets the old rule.
- **Check that runs:** grep -n 'rounded up to the cent on each order' docs/EV-CALCULATOR.md -> 109; tests/v505-test.js on the frozen copy: 52 passed (K4: no recompute from the rounded fee); EV-4 shows approved bets under the floor after rounding.
- **Proposed fix (not applied):** Rewrite those two passages to the v5.05 rule (0.01 shares, smooth-fee EV, the cent round-up is a sizing buffer only).

### EV-7 · A Novig bet on a game in play: the board's EV leaves out the live fee that the bet form adds

- **Kind / severity (auditor):** bug / S3 · confidence 0.8 · proven by a check that runs
- **Where:** auditCore (line 3693+): r.fee = feeRate(r.book, r.offeredProb, cfg.fees) with no live flag; the form passes it (liveG(), line 6695). The Novig fee box's tooltip (line 2738) says the board adds it.
- **Inputs:** Novig 52 cents, model 56%, market 55% (her chance 55.35%), game state 'in'.
- **The app gives:** Board: fee 0, EV +6.4%, stake $0 with the flag 'game started — can't bet pre-game'.
- **Right:** With the live fee 6% x 0.48 = 2.88% of the stake: EV +3.5%.
- **Why:** The board never stakes a started game, so no money moves; only the EV shown for an in-play Novig row is about 3 points high, and the tooltip promises otherwise.
- **Check that runs:** node .../audit/ev/q6c.js -> novigLive {board:{fee:0, actNetPts:6.44, stake:0}, withLiveFee:{fee:0.0288, actNetPts:3.46}}
- **Proposed fix (not applied):** Pass r.gameInfo.state==='in' as the live flag in auditCore, or drop 'the board' from the tooltip.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The '+3.5%' answer is only right when the row's price is a live quote. Usually it is a stale pre-game price that can no longer be bet, so the number shown matters little either way. The real defect is the tooltip's promise ('the board ... adds that itself'). There is no money effect: the stake is $0, and + Add a bet and the editor add the live fee (liveG) to anything he saves.
  - Its own check: I re-ran q6c.js. On a Novig row whose game is 'in' the board shows fee 0 and +6.44%, stake $0, flag 'game started — can't bet pre-game'. With the live fee 0.06 x 0.48 = 2.88%, EV = (0.5535/0.52 - 1 - 0.0288) / 1.0288 = +3.46%. auditCore line 3706 calls feeRate(r.book, r.offeredProb, cfg.fees) without the live flag. The Novig fee box's tooltip (line 2738) says the screener adds the live fee 'the board, + Add a bet and the bet editor'. For the board that is not true. When can a board row be live? The premise that the board hides started games by default is wrong. #cHideStarted has no 'checked' at line 2729, and cfgRead().hideStarted is false in the booted app. So started rows stay on the board, grey, at $0, and are counted under 'started' in passWhere. But what price does such a row show? SGO (line 10769), the Odds API (10722), the Sportsbook API (10614) and …
  - Written decision found: Nothing written that keeps the board pre-game only. The tooltip at line 2738 promises the opposite, and docs/EV-CALCULATOR.md's Novig line ('0 before the game; 6% x (1 - price) once it is live') does not say which screens apply it.
  - How often for you: Whenever he leaves the board open past a Novig row's kickoff, often while Live Games is open. Only the EV on a $0 grey row is affected.
  - Your saved history: None. Saved Novig bets on started games get the live fee from + Add a bet and the editor, and fills carry the real fee.
  - Smallest safe fix: Smallest and safest: drop 'the board' from the fNovig tooltip, so it says the screener adds the live fee in + Add a bet and the bet editor. The other way is to pass r.gameInfo && r.gameInfo.state==='in' as the live flag in auditCore line 3706. That changes r.pass on started Novig rows and so the 'started' count in passWhere.
  - Risks in the fix: The tooltip change carries no risk. The auditCore change touches every started Novig row's pass and the counts on screen, which must still add up (CLAUDE.md: counts on screen must match what is listed). math-audit-test.js line 40 only pins feeRate itself.
  - Tests that pin today's behaviour: math-audit-test.js line 40 (the Novig fee: 0 before the game, 6% x (1 - p) live, through feeRate directly).

### EV-I1 · Idea: let the owner's own fills check the fee settings

- **Kind / severity (auditor):** improve / S3 · confidence 0.7 · by reading only
- **Where:** Settings > Fees; the fills already store fillFee and fillCost (autoAddFromRow, line 14198)
- **The app gives:** The fee percentages are typed defaults; nothing compares them with what the books really charged.
- **Right:** Per book, show 'your last 10 fills: fee / (shares x price x (1 - price)) = 9.4%; Settings says 6.95%'.
- **Why:** It would have flagged the Polymarket change (EV-1) on the first fill, would settle Kalshi's rounding question (EV-4) with his own data, and needs no outside source.

### EV-I2 · Idea: the ticket's limit is 'OK up to', where EV is only the floor, while the stake is sized for the EV at the ask

- **Kind / severity (auditor):** improve / S3 · confidence 0.6 · proven by a check that runs
- **Where:** kalshiHow (line 13422), polyHow (line 13452)
- **Inputs:** Kalshi card: her chance 57.5%, ask 52c, budget $9.51 sized on +7.0%; limit 54c.
- **The app gives:** 'Limit 54c', 17.05 shares, max cost $9.51.
- **Right:** If the order fills at 54c on a thin book, EV is about +3.2%, where the same Kelly rule would size about $4.70. Still positive and never under the floor.
- **Why:** A limit order can fill anywhere up to its limit. Showing 'Limit 53c (ask + 1c)' as the normal choice and 'never above 54c' as the ceiling keeps the fill near the price the stake was sized on.
- **Check that runs:** node .../audit/ev/q7.js (Kal Card: ticket 'Shares 17.05 ... Limit 54c ... Max cost $9.51', EV +7.0% at 52c); q3.js fillAtLimit (worst +0.5%, 0 negative).

### EV-I3 · Idea: a fee box left empty counts as 0% without saying so

- **Kind / severity (auditor):** improve / S3 · confidence 0.75 · by reading only
- **Where:** cfgReadBase (line 3591): v = parseFloat(value) // 0 for fKalshi, fPoly, fFdp, fProphet
- **The app gives:** An emptied Kalshi or Polymarket fee box makes every EV at that book fee-free (about 3.4 points too high at 52 cents). FanDuel Predicts' fallback to 2 only applies to a negative value, not an empty one.
- **Right:** Fall back to the default (7, 6.95, 2, 1) or mark the box when it is empty.
- **Why:** A slip of the finger in Settings silently removes a fee from every decision.

**Checked and found right (15):**

- Net EV = ((q/p - 1) - f) / (1 + f) is exactly 'expected profit per dollar actually put in' for a fee paid at purchase, win or lose. Written independently as (q*C - C*p - F) / (C*p + F) for Kalshi (7% x C x p x (1-p)), Polymarket US (6.95%), Novig pre-game (0) and live (6%), FanDuel Predicts (2 cents a contract = 2% of the payout), ProphetX / flat % of stake, a sportsbook: 57,967 grid cases, largest gap 4e-15 (q1_q2.js).
- auditCore's r.gross, r.net, r.fee, r.actProb, r.actNet and actNetOf: 700 seeded rows through the real audit() at 7 books, with and without a market price: 0 mismatches.
- maxPriceFor is the highest price whose net EV clears the floor: brute force on a 0.0001 grid, chances 5% to 95%, 7 books, floors 0% to 5%, 4 fee settings = 28,028 cases, 0 mismatches; EV at the limit equals the floor within 2e-11; it rises with the chance and falls as the floor rises; one crossing only.
- EV is never non-monotonic in the price, FanDuel Predicts included: EV = (q - p - 0.02) / (p + 0.02) falls as p rises for every q; Kalshi and Polymarket also fall over the whole range. The bisection is safe.
- A book with a fee always shows a lower limit: 724 cases at default fees (55% chance: Novig 54.19%, ProphetX 53.65%, Polymarket 52.45%, Kalshi 52.44%, FanDuel Predicts 52.19%).
- Kalshi ticket (kalshiFractionalFit, kalshiFitRow, kalshiHow): limit = OK up to in whole cents rounded down and lowered while EV at the limit is under the floor; shares = the largest 0.01 whose shares x limit + fee rounded up to the cent fits the budget; cost; payout = shares. 20,000 seeded cases against exact integer arithmetic: 0 mismatches, never over the budget, always the largest that fits. By hand: $3.22 at 51.9c -> 52c, 5.98 …
- Kalshi '-> X cents with fee' line: X = L x (1 + 7% x (1 - L)) at all 99 cent prices (52c -> 53.7c).
- Polymarket US ticket (polyHow): limit, whole shares, cost at or under the stake, payout: 13,873 tickets from 20,000 seeded cases, 0 mismatches at the app's 6.95% (see EV-1 for 9.5%).
- Makes: the highest Make price on her chance with the maker fee (Kalshi 1.75% x (1-p), Novig and Polymarket 0): 6,000 cases / 4,083 ladders against brute force: exact, no rung above it, every rung clears the floor, 'net if taken' exact. Doc example 55% / 52.5% at Novig = 52.586% = 53.375 / 1.015. Parole ladder: 2,984 ladders, none above the cap or under the floor.
- 'NO MAKE' appears only when her chance is under about 1% (any higher chance has some price that clears the floor); otherwise the ladder says 'SKIP — no rung fits your odds range'. Consistent with the doc.
- Which book is picked (bookPick): compared on her EV after each book's own fee, 0.3-point switching rule: 8,000 seeded cases with 2 or 3 exchange prices, 0 wrong. Kalshi 50c vs Novig 51c: picks Novig (+6.57% vs +5.02%). A challenger 0.2 point better stays out, 0.4 point better moves. A stale sportsbook price is replaced by the best fresh exchange price that clears the floor.
- shopLim: 3 minutes, 90 seconds within 5 minutes of the start.
- 'also at' for the exchanges: each chip's limit and EV use that book's own fee, ordered by EV after the fee (FanDuel Predicts is the exception: EV-3).
- Saved equals shown for the EV, fee, chance, price and Kalshi order: real card -> I bet this -> Save for Kalshi, Polymarket US, Novig and FanDuel Predicts: card +7.0% saved as 0.0703, fee 0.0336, 17.05 shares at 54c saved as shown (q7.js). Existing tests on the frozen copy: tests/v505-test.js 52 passed, tests/math-audit-test.js 11 passed.
- Outside check (search results only, the books' own pages were blocked): Kalshi taker 0.07 and maker 0.0175 x C x P x (1-P) match the app; Novig pre-game free and live 0.06 match (0.03 on some pages, where the app is on the safe side); FanDuel Predicts 'up to two cents per dollar of potential payout' matches at mid prices and is on the safe side at the ends; ProphetX is reported as 1% of net winnings, where the app's 1% of stake is …

**Not checked:**

- report.md was NOT written: this session's Write tool refuses report files from subagents ('return findings as text'), and I did not work around it. The full report is this structured answer; every proof is a script with its saved output in /tmp/cla …
- The books' own fee pages: fetching kalshi.com, docs.polymarket.com, rg.org and prophethelp.zendesk.com was blocked in this session (hosts did not resolve). Everything in the outside check comes from web search results, so EV-1 and EV-2 are 'reporte …
- ProphetX's real rate (1% vs the 2% some reviews give): if it is 2% of net winnings the app is up to 0.7 point too high on long shots (108 of 3,245 passing grid cells under the floor). Could not verify.
- shopExchanges end to end with a live Worker answer (network blocked): I tested its decision function bookPick directly and read the rest. swapBooks / swapHunt by reading only: same netAt with real book names and the same 0.3 rule.
- The owner's real fills (not available here): EV-1 and EV-4 are measured on grids, not on his bets.
- Layout of the tickets at 390 / 1000 / 1280 / 1960 px (not a numbers question).

**Noticed outside its area:**

- Kelly uses b = 1/price - 1 for books with a fee; with the fee the real b is slightly smaller, so stakes are a touch under exact Kelly (safe side).
- The Parole ladder's 'payout' is stake / price with no maker fee: about 1 cent high per $1 on a Kalshi Make.
- betProfit for a bet logged from a fill does not use the stored fillQty (see EV-5): for the results auditor.
- The Make ladder floors rungs to whole cents; Novig trades in half points (max 52.59% gives a rung at 52%, 52.5% would be allowed).
- My q1_q2.js counter 'feeLowerFail: 58' is my own comparator under a made-up fee setting (Novig 1% vs Kalshi 10% x (1-p) at high prices), not an app error; at default fees it is 0 of 724.

## stake: how much to bet, and the limits on it (kellyFor, actNetOf, auditCore stake path, applyDayLim …

### STAKE-1 · The per-game cap only counts money already in the Bet log, so the board can list more on one game than the cap, and with under $500 set aside a single bet can pass it

- **Kind / severity (auditor):** bug / S1 · confidence 0.85 · proven by a check that runs
- **Where:** auditCore, index.html about line 3890: `else if(s>0 && r.gameInPlay){ const room=...cfg.gameCap... }`. r.gameInPlay exists only when a logged bet is on that game; there is no per-game pass over the board's own stakes (the daily max has one, applyDayLimits).
- **Inputs:** (a) $1,000 set aside (cap $20), five props on five players of ONE game, each price 56%, model 63%, market 64% (her EV +12.5%, Kelly $17.68, largest bet $10), nothing logged. (b) $200 set aside (cap $4), one prop: price 70.19%, model 75.89%, market 78.25% (her EV +8.12%), nothing logged. (c) two $10 bets on a game with $7.51 already logged.
- **The app gives:** (a) $10 + $10 + $10 + $10 + $10 = $50 on one game, no cap note on any row; God view header says 'Place these · 5 · La Contadora: YES. The math says bet every card here'; Easy lists the same 5 picks at 'You pay $10.00' each. After the first two are logged the other three drop to $0 ('game cap reached'). (b) $4.78 on a $4 cap; at $400 set aside (cap $8) a bet gets $10. (c) both stay at $10: $27.51 on a $20 cap.
- **Right:** (a) at most $20 on that game in total (by the app's own logged-money rule, same team and side counting 1.5x, it would stop at $15). (b) $4.00, which is what + Add a bet gives for the same bet ('game cap'). (c) $12.49 between the two.
- **Why:** Settings label: 'Max per game % of bankroll: Most you'll have riding on one game (2% of $1000 = $20)'. docs/EV-CALCULATOR.md section 4: 'Max per game: 2% of bankroll'; section 5 says a bet is only actionable with 'room under the game cap'. The cap is checked row by row against logged money only, never against the other rows of the same game, and not at all when nothing is logged. + Add a bet (abStake) does apply it with nothing logged, so the two sizers disagree. No written decision says the cap is meant to arrive only as bets are logged (searched memo …
- **Money effect:** Up to 2.5x the cap in (a): $50 instead of $20 riding on one game. 20% to 25% over the cap for a single bet in (b). It adds risk on one game (its results move together); it does not change EV.
- **How often:** 6,000 seeded random boards: 611 had a game over its cap by the board's own list (213 of the 2,258 boards at the default $1,000, 9.4%); 131 single bets were over the cap, all with a bank of $10 or $200. Real boards carry many props a game, so busy games are where it shows. A user who logs each bet before placi …
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t0-gamecap.js && node t0b-gamecap-screen.js && node t2-property.js 500 3   (invariants I5a, I5b). Output: '(a) ... "gameCap":20,"stakes":[10,10,10,10,10 …
- **Proposed fix (not applied):** Enforce the cap that is already set (no change to its size): (1) apply the room to every row whether or not money is logged on the game; (2) add a per-game pass like applyDayLimits, in mathKey order, with the same trim-or-drop and the 'game cap reached' note. Tell the owner first: under $500 set aside this lowers single stakes to 2% of the bank.
- **Second look: Confirmed** (severity S1, confidence 0.85, re-ran the check: yes)
  - Its own check: Re-ran t0 and t0b: same output as claimed ($50 on a $20 cap; $4.78 on a $4 cap at $200). Own check 1, the practice board (an invented but realistic board written by someone else) at $2,000 set aside: KC @ DEN carries $41 over 5 bets on a $40 cap. At $200, $400 and $1,000 no game was over. Own check 2, logging the five picks one at a time: the cap then stops at $15 or $20. Reading: the cap at index.html 3918 runs only when logged bets exist on that game; applyDayLimits (4103) adds up the board's rows per day but never per game; the Hard stop (6853) checks only the daily max. + Add a bet (abStake 14656) applies the cap with nothing logged, so the two sizers disagree.
  - Written decision found: None. The Settings label says 'Most you'll have riding on one game (2% of $1000 = $20)'. EV-CALCULATOR.md line 132 says a bet is actionable only with 'room under the game cap'. No note in history.md, exposure.md or the code comments (v2.50 at 3911) says the cap is meant to count only logged money. One test (v …
  - How often for you: At $1,000 set aside (cap $20, largest bet $10), it takes 3 or more staked picks on one game. On busy NBA and NHL nights that is likely, so expect a few times a week. Whether money really goes over depends on whether he logs (or a fill is read back) before placing the next one; placing a batch from Place these and logging afterwards gets past the cap.
  - Your saved history: No saved number is wrong; only how much went on one game. Dry run over the Bet log: group own-money singles that are not sold and not free by game (same rule as inGame: gameKey, or team codes plus start time) and game day; add up the stakes; list each game over 2% of the bank in use that day. Nothing needs to change.
  - Smallest safe fix: Add a per-game pass after applyDayLimits, in the same mathKey order: room = gameCap minus the weighted logged money minus what earlier rows of that game already took; trim, or drop with 'game cap reached'. Also apply the room when nothing is logged. The test must fail now and pass after: 5 props on one game, nothing logged, $20 cap → total of staked rows ≤ $20; one bet at $200 set aside → ≤ $4.00.
  - Risks in the fix: It enforces a cap the owner already set; it does not change its size. But under $500 set aside it lowers single stakes, so tell the owner first. Practice-board tests at $1,000 have no game over the cap, so they should not move (by reading only). v517-tabrows already raises the cap. Watch pass-where-test.js an …
  - Tests that pin today's behaviour: None pins the missing per-game pass. v517-tabrows-test.js works around the cap; v514-screen-test.js pins the 'per-game cap' wording.

### STAKE-2 · + Add a bet sizes without the long-shot moneyline rule, one bet per player, the moneyline gap rule and the model-only count, and takes the daily room from today instead of the bet's game day

- **Kind / severity (auditor):** bug / S1 · confidence 0.75 · proven by a check that runs
- **Where:** abStake (index.html line 14640), called by abUpdate94 (line 14746). Day room: `gameDayOf(x)===today` with today = ctDay(Date.now()).
- **Inputs:** Bank $1,000, Novig. (1) Away moneyline, price 33.0% (+203), model 36%, market +170 (37%). (2) Adam Able Over 1.5 Shots at +100, model 55%, market -127, with $3 already logged on Adam Able Over 0.5 Points in that game. (3) the same prop for a game tomorrow, with $100 logged today, and the reverse ($100 logged on tomorrow's games, today empty).
- **The app gives:** (1) typed in the real form: '🟢 BET $5.59 — +9.1% net' (and still $5.59 when 3 long-shot moneylines are already logged today). (2) typed in the real form: '🟢 BET $10.00 — +10.0% net'. (3) $0 'trimmed to your daily max ($100.00 bet of $100.00)' for tomorrow's game; and $10 when tomorrow's own day is full. Also $1.00 for a moneyline with the model 9 points above the market, and $1.00 for the 6th no-market bet of the day.
- **Right:** What the board gives for the same bets: (1) $1.00 (smallest bet, '1 of 3'), $0 once 3 are logged; (2) $0 'PLAYER EXPOSURE · already hold Able Over 0.5 Points: no additional stake'; (3) $10 for tomorrow's game when only today is full, $0 when tomorrow's day is full; $0 for the gap-research moneyline and for the 6th model-only bet.
- **Why:** memory/decisions/exposure.md (v4.68): a moneyline with her chance under 45% gets 'the smallest bet, at most 3 a game day and 1 a game, in every mode' (written after a week that lost $43.63 on 34 long shots), a moneyline with the model 8+ points above the market is 'research only', and there is 'one bet per player per game'. actionable-ev.md lists abStake as sizing like the board ('held to the smallest bet, like the board'). The daily max is per game day: the Hard stop on the same form uses the bet's game day, and so does the board.
- **Money effect:** A long-shot moneyline typed by hand is advised at 5.6 times the board's stake ($5.59 instead of $1.00); a second bet on a held player at $10 instead of $0.
- **How often:** Every long-shot moneyline and every second bet on a held player that goes through + Add a bet. The day mix-up whenever a bet is typed the day before its game and either day is near its max.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t6b-addform.js (the real form: cases 1 and 2) && node t6-editor-add.js (cases 10 to 14b and 17, abStake called with the arguments abUpdate94 passes). Ou …
- **Proposed fix (not applied):** Pass the bet's kind, name, game and game day to abStake: take the room from the bet's game day; hold a moneyline with okProb under 0.45 to the smallest bet inside the same 3-a-day / 1-a-game count; return $0 with the board's words when the Bet log already holds that player in that game, when the model is 8+ points above the market on a moneyline, or past the model-only count.
- **Second look: Confirmed** (severity S1, confidence 0.8, re-ran the check: yes)
  - Its own check: Re-ran t6b (the real form): '🟢 BET $5.59' for the long-shot moneyline where the board gives $1, and '🟢 BET $10.00' for a held player where the board gives $0. Re-ran t6 cases 11 to 14b and 17: they match. Reading abStake (14640): there is no isLongShot / lsml, samePlayer, moneyline-gap or model-only-count logic, and the day room uses gameDayOf(x)===ctDay(Date.now()). On Save (abOpenEditor, then the openBetEditor save): the Hard stop uses the bet's game day, so it catches 14b but not the others; pastLim reads r.flags, which a typed bet does not have. The gap case is held to $1 as an 'outlier' where the board gives $0.
  - Written decision found: exposure.md (v4.68) says the long-shot moneyline rule holds 'in every mode', and that there is one bet per player per game. actionable-ev.md line 25 says + Add a bet holds a no-market bet to the smallest bet 'like the board'. No note exempts + Add a bet.
  - How often for you: Low to moderate. It matters only when he sizes from + Add a bet before placing, for example an underdog moneyline typed by hand or a second prop on a player he holds. When he logs a bet already placed, the size line is only advice. The day mix-up needs a bet typed the day before its game with either day near its max.
  - Your saved history: The stakes he saved are the ones he typed; no total is wrong. If + Add a bet saves its verdict in the bet's said or snap fields, past advice could read $5.59 where the board would have said $1 (not checked).
  - Smallest safe fix: Pass kind, name, game and game day into abStake. Take the room from that game day. Apply the long-shot hold and its 3-a-day / 1-a-game count; return $0 for a held player, for the gap rule and past the model-only count, using the board's words. Tests: the t6b cases 1 and 2 and t6 cases 13, 14, 14b and 17 should match the board.
  - Risks in the fix: Changes advised stakes only; no saved bet changes. The 3-a-day count must use the same logged-bet classification as the board (lsmlCls, v4.69).
  - Tests that pin today's behaviour: scope-v468-test.js and lsml-class-test.js (board only); same-player-test.js and hard-stop-test.js. None pins abStake leaving these rules out.

### STAKE-3 · The bet form says 'recommended at this price: $10.00' on a card the board gave $0 for a limit

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** recStake inside openBetEditor (index.html line 6732). It keeps the board's stake as a ceiling only when that stake is above zero: `if(r.stake>0) st=Math.min(st, r.stake)`. Its own comment says 'same sizing; the board's caps still apply'.
- **Inputs:** Bank $1,000, a prop at price 50%, model 55%, market 56% (her EV +10%), opened with the table's 'I bet this' in six situations: day used up ($100 logged); player already held; long-shot moneyline with 3 already logged; 6th no-market bet of the day; moneyline gap research; price outside the odds range (-400).
- **The app gives:** Board $0 each time. The form's line reads 'recommended at this price: $10.00' (day used up, player held, better prop on the same player, odds outside range), '$5.60' (long-shot moneyline limit reached, not even the $1 hold), '$10.00' (6th no-market bet, not even the $1 no-market hold), '$1.00' (gap research). The Stake box itself is empty in all of them.
- **Right:** $0.00, or the board's reason, as the comment promises. When the board has a stake the form agrees with it (Novig $10.00; Kalshi $5.67 · 10.33 shares at a 53 cent limit on board, form and + Add a bet; no market $1.00; game-cap trim $5.00; daily trim $5.00).
- **Why:** The one line in the form that advises a size contradicts the board's decision. Only the day case gets a second look, from the Hard stop on save.
- **Money effect:** No saved number is wrong by itself because the Stake box is empty; the risk is typing the $10 the line suggests on a bet the board had stopped.
- **How often:** Each time 'I bet this' is opened on a table row the board left at $0 for a limit (God view; Easy only opens approved picks).
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t6-editor-add.js   (cases 9, 10, 12, 13, 16, 17, 18; output saved in t6-out.txt)
- **Proposed fix (not applied):** When the board's stake is $0 and the price in the form is the card's price, show the board's reason instead of a dollar figure (or return 0); apply the no-market hold in recStake in every case.
- **Second look: Confirmed** (severity S2, confidence 0.85, re-ran the check: yes)
  - Its own check: Re-ran t6: cases 9, 10, 12, 13, 16, 17, 18 and 19 read 'recommended at this price: $10.00', '$5.60' or '$1.00' where the board gives $0, and the Stake box is empty. Reading recStake (6732): `if(r.stake>0) st=Math.min(st, r.stake)` gives no ceiling when the board stake is 0, and there is no no-market hold (case 17 shows $10).
  - Written decision found: None. The comment at 6730 says 'same sizing; the board's caps still apply', which the code contradicts.
  - How often for you: Each time he logs a $0-limited card through the form. That is usually after he has placed it, so the line is a misleading echo more than advice.
  - Your saved history: None: the Stake box is empty, so what is saved is what he typed.
  - Smallest safe fix: In recStake, when the price in the form equals the card's price and r.pass is false or r.stake is 0 for a cap or rule, return 0 and show the board's reason; apply the noMkt hold. Test: t6 cases 9, 10 and 17 should read $0.00 or the reason.
  - Risks in the fix: Keep the fixed stake of 🍀/🔮 extras (r.tier) as it is; when the typed price differs from the card's price (lineChanged and price edits), keep the re-sizing.
  - Tests that pin today's behaviour: Searched tests for 'recommended at this price': nothing pins the $0 case.

### STAKE-4 · Easy: 'About $X or more lists at least one pick' is false about 2% of the time (it can name less than what is already set aside, or an amount at which nothing lists)

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** easyBankNeed (index.html line 5762), shown by ezNoStakeHtml (line 5930). New in v5.24.
- **Inputs:** (1) $100 set aside; the same prop (Gus Gray Over 0.5 Assists) at Kalshi (price 58.03%, model 61.48%, market 61.22%) and at Novig (price 61.3%, model 76.7%, market 72.71%: a model-EV outlier), plus one more thin Kalshi prop. (2) $200 set aside; two Polymarket props on one player: Under 0.5 Assists (65.75%, 69.12%, 68.32%) and Over 1.5 Shots (63.37%, 69.21%, 64.98%).
- **The app gives:** (1) On the Easy screen: '2 prices are worth paying today, but with $100 set aside the bet the app suggests is under $1, so they are not listed. About $50 or more lists at least one pick. Put a bigger number in Settings'. (2) 'About $250 or more lists at least one pick'; at $250 the screen becomes 'Nothing worth paying today. That is a normal day.'
- **Right:** (1) $150 (Easy's list is empty at $50 and $100 and has 1 pick from $150). (2) No amount up to $1,000 lists a pick: at $250 the other prop on that player gets the stake and takes the one-per-player place, and its chance is under 60% so Easy does not list it.
- **Why:** The simulation matches rows by a key shared by the same bet at two books, and returns as soon as any row with that key reaches $1, including an outlier row that Easy never lists; and it does not replay the one-bet-per-player and one-side-per-game picks, which change when more money gives a second bet a stake.
- **Money effect:** Display only, no stake changes: a newcomer is told to raise the number and still sees nothing, or is told a number below the one already typed.
- **How often:** 4,000 seeded random boards: on the 551 where Easy listed nothing because the bets were under $1, the money set aside was really set to each amount of its grid: 539 exact, 0 too high, 12 too low (2.2%). Needs the same bet at two books or two bets on one player on a small bank.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t5b-easyneed-screen.js (the real Easy screen, both cases) && node t5-easyneed.js 500 3 (the count; seeds 1 to 8 in t5-out-*.txt). Output: 'ON SCREEN: .. …
- **Proposed fix (not applied):** In easyBankNeed count a row as listed only when it is the wanted row itself and Easy could list it (not an outlier, evDisplayState actionable); never return an amount at or under the current one; leave the sentence out when a wanted pick has another row on the same player or the same bet at another book.
- **Second look: Confirmed** (severity S2, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: Reconciled with EASY6-1: one cause (the trial run does not copy the board's one-bet-per-player choice and counts rows that Easy never lists), errors in both directions. STAKE-4's '0 too high in 4,000 boards' is only true of its own random generator; the practice board shows a too-high case. So '2%' is not a real rate.
  - Its own check: Re-ran t5b: both cases print as claimed. The auditor's case 1 gave the same bet different model chances at the two books, which real data would not do, so I rebuilt it with the same model (0.70) and market (0.66) at both books and only the price different (Kalshi 62¢, Novig 60¢, an outlier on the model's own EV). At $60 set aside the screen says 'About $50 or more lists at least one pick', which is below what is already set aside; nothing lists up to $1,000. Cause in easyBankNeed: rows that share a pxKey return as soon as the outlier row reaches $1, the one-bet-per-player choice is not replayed, and the amounts tried start at $50 even when that is under the current bank.
  - Written decision found: None (new in v5.24).
  - How often for you: Almost never for him (the sentence shows only on Easy with a small bank). It matters for the newcomer edition.
  - Your saved history: None (display only).
  - Smallest safe fix: Count a trial as listed only for the wanted row itself, and only if Easy could list it (not an outlier, actionable); never name an amount at or under the current one; replay the one-per-player choice in each trial, or re-run the real sizing on a copy of the rows at the trial bank (this also fixes EASY6-1). Tests: s4-samemodel and t5b case 2 → no sentence or a correct amount; the practice board at $100 → $550.
  - Risks in the fix: Display only. Re-running the real auditCore per trial costs more CPU (about 40 trial amounts); keep it memoised.
  - Tests that pin today's behaviour: v524-fixes2-test.js (easyListNoStake counts) and v524-easy-screens-test.js may pin the sentence text.

### STAKE-5 · A free bet in the Bet log uses up the daily max and the game cap when stakes are sized, while every screen counts it as $0

- **Kind / severity (auditor):** bug / S1 · confidence 0.75 · proven by a check that runs
- **Where:** applyDayLimits (`used[k]=(used[k]//0)+(+b.stake//0)`, index.html line 4105), the game cap's inPlay sum in auditCore, abStake (line 14653), easyBankNeed (line 5765).
- **Inputs:** Bank $1,000 (daily max $100). A $95 bet marked 🎁 free (free:true) logged for today's games, then a prop worth $10 (price 50%, model 55%, market 56%).
- **The app gives:** The board trims the bet to $5.00 (capBy 'day'), while dayStats() for that day, which the Bet log strip, the Hard stop and + Add a bet's 'Today $X of $100' line read, says $0.00 staked.
- **Right:** $10.00: a free bet is $0 of your money everywhere else (`b.free ? 0 : stake` in the Today card, the strip, the Hard stop, ROI; docs/EV-CALCULATOR.md section 8).
- **Why:** The sizing counts the free bet's face amount as money at risk; the rest of the app does not. The two disagree on the same screen with no reason shown.
- **Money effect:** On a day with a sportsbook bonus bet the board hands out less than the daily max allows ($5 instead of $10 here; nothing at all after a $100 free bet). Under-betting, never over-betting.
- **How often:** Only on days with a logged free bet large enough to bring the day (or one game) near its limit.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t3-edges.js   (lines C3 and C3b: stake 5, capBy 'day' · {"staked":0})
- **Proposed fix (not applied):** Use `b.free ? 0 : (+b.stake//0)` in those four places.
- **Second look: Confirmed** (severity S2, confidence 0.8, re-ran the check: yes)
  - Its own check: Re-ran t3 C3 and C3b: the board trims to $5 (capped by the day) while dayStats shows $0 staked. Reading: applyDayLimits line 4105, easyBankNeed, abStake (the day and the game) and the game cap's inPlay all add +b.stake with no b.free test. Free bets are stored as free:true with the face amount in stake (lines 6493 and 6608; book-statement fixes at 5264 and 5284).
  - Written decision found: Not by design. The v5.13 comment at line 5215 deliberately changed the display and the Hard stop to count 'a free bet … at $0' ('Before … a free bet counted'). The sizers were left out.
  - How often for you: Rare. Free bets come only from sportsbook promos (not Novig, Kalshi or Polymarket), and his $1 to $10 bets seldom bring a $100 day or a $20 game near the limit.
  - Your saved history: None for saved results; it only made him bet less on those days.
  - Smallest safe fix: Use b.free?0:(+b.stake//0) in the 4 places. Test: C3 → $10. Treating free as $0 cannot let real money past a cap, unless a real bet is wrongly marked 🎁.
  - Risks in the fix: Very small. The claim's S1 overstates it: it can only lower a stake (under-betting), so S2.
  - Tests that pin today's behaviour: hard-stop-test.js pins the free bet at $0 for the Hard stop. Nothing pins the sizers counting it.

### STAKE-P1 · One bet per player (and one side per game): the highest EV keeps the stake even when it is an outlier or a no-market bet held to $1, pushing out a normally sized, market-checked bet

- **Kind / severity (auditor):** policy / S1 · confidence 0.8 · proven by a check that runs
- **Where:** auditCore, the one-side-per-game block (v2.55) and the same-player block (v4.48): both sort by actNet. The code follows memory/decisions/exposure.md ('the highest actNet keeps its stake').
- **Inputs:** Bank $1,000, two props on one player in one game: Gus Gray Over 2.5 Shots, price 61.13%, model 71.3%, market 63.7% (a model-EV outlier, her EV +8.6%); Gus Gray Under 1.5 Shots, price 63.79%, model 66.03%, market 65.72% (her EV +3.2%).
- **The app gives:** The outlier keeps $1.00 (held to the smallest bet); the market-checked bet, which would be $7.04, gets $0: 'PLAYER EXPOSURE · Gray Over 2.5 Shots is the better bet on this player (+8.6% vs +3.2%): one bet per player'. In Easy the player disappears (outliers are not listed).
- **Right:** A question for the owner, not a fix: should this pick use the same order as the daily max (mathKey: market-checked bets first, then no-market, then outliers)? Then the $7.04 bet would stay and the outlier would wait.
- **Why:** Outliers and no-market bets are the bets the app trusts least: it holds them to $1 and hands them the day's money last. But an outlier has a high EV by definition, so in this one rule it ranks first.
- **Money effect:** $1 on the bet the app flags instead of about $7 on the one the market agrees with.
- **How often:** In 1,500 random boards: 1,025 of 2,435 player picks and 310 of 732 side-of-game picks. My generator makes outliers more common than a real board, so read it as 'it happens', not as a rate.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t7-outlier-wins.js   (first example line is the case above)
- **Proposed fix (not applied):** None proposed: the rule was agreed in the owner's and ChatGPT's words. If he wants it, the change is to sort those two blocks by mathKey instead of raw actNet.
- **Second look: By design (your rule)** (severity S2, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: A policy question for the owner, not a bug. The actNet that wins is already La Contadora's conservative EV, not the model's; the outlier still wins because that EV is higher too.
  - Its own check: Re-ran t7: the first case is exactly as claimed (the outlier keeps $1; the market-checked bet, which would get $7.04, gets $0). Reading 3990-4000: sorted by actNet, ties within 0.0001 go to the bigger stake, then the higher blend. The facts are right; the stated rates come from the auditor's own generator.
  - Written decision found: history.md lines 658-662 and exposure.md line 5: 'Before either is placed, the highest actNet keeps its stake' (owner passing on ChatGPT's words, v4.48).
  - How often for you: Whenever a player has two props and the better one is an outlier or a no-market bet. Real rate unknown.

### STAKE-P2 · Two different 'used today' numbers: the sizing leaves parlays and sold bets out of the day, the Bet log strip and the Hard stop count them

- **Kind / severity (auditor):** policy / S2 · confidence 0.8 · proven by a check that runs
- **Where:** poolOf / applyDayLimits (index.html lines 4077, 4105: parlays and sold bets skipped) against dayStats().staked (lines 5215, 6857: everything counted). Written and deliberate (v2.73, v5.00, v5.13 comments).
- **Inputs:** Bank $1,000. A $95 parlay (or a $95 bet later sold) logged for today, then a prop worth $10.
- **The app gives:** The board gives the prop its full $10 and would hand out $100 of singles, while the strip reads '$95.00 of your $100.00 daily max' and the Hard stop asks on each save after the first $5.
- **Right:** A question for the owner: is the board meant to keep listing bets that the Hard stop will question?
- **Why:** The Settings label says the daily max is 'everything together'; the two counts answer different questions and sit on the same screen.
- **Money effect:** The day can reach $195 against a $100 daily max when a $95 parlay is logged, with a Hard stop prompt on each single.
- **How often:** 153 of 6,000 random boards ended over the daily max this way (boards with a parlay or a sold bet in the log).
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t3-edges.js (C1, C2) && node t2-property.js 500 1 (I6-policy)
- **Proposed fix (not applied):** None proposed (owner decision).
- **Second look: By design (your rule)** (severity S2, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Facts right. It remains a question for the owner.
  - Its own check: Re-ran t3 C1 and C2: $10 with a $95 parlay or a $95 sold bet logged. Reading: poolOf gives 'parlay' for parlays, applyDayLimits skips sold bets, and dayStats counts both (the v5.13 comment at 5215). Facts confirmed.
  - Written decision found: Comments for v2.73, v5.00 and v5.13 at line 5215 ('parlays stay out of the daily max, as everywhere (poolOf, v2.73)'). The Settings label (2758) says 'everything together: the API board, the pasted Market EV page and your exchange fills', which does not name parlays.

### STAKE-I1 · Stake settings accept anything: an empty Kelly or haircut zeroes every stake with no reason, a negative gives a negative stake, a percent typed by mistake puts every bet at the largest bet

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** cfgReadBase (index.html line 3591): `parseFloat(...)//0`, no bounds on kelly, shrink, bank, sMin, sMax; auditCore adds no note when Kelly gives $0.
- **Inputs:** Default bet (+10% at 50%, Kelly $12.50 → $10). Kelly left empty; haircut left empty; Kelly -0.25; bankroll -1000; Kelly 25; haircut 50; game cap 0%.
- **The app gives:** Empty Kelly or haircut: stake $0, the row still passes, no note. Kelly -0.25 or bankroll -1000: an internal stake of -$12.50 (nothing is listed). Kelly 25 or haircut 50: $10, the largest bet, on every passing bet. Game cap 0%: no effect unless a bet is logged on the game, then $0 ('game cap reached ($0.00 on this game)'), while daily max 0% means off.
- **Right:** Kelly and haircut held between 0 and 1, bankroll at or above 0, and a plain note when a setting makes every stake $0.
- **Why:** A typing slip in Settings silently changes every stake; the $10 largest bet is the only thing that limits the damage.
- **Money effect:** Kelly typed as 25: a thin +2% bet that should be $2.50 becomes $10.
- **How often:** Only on a typing mistake in Settings.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t3b-badinputs.js && node t3c-zero-caps.js
- **Proposed fix (not applied):** Clamp in cfgReadBase and show a one-line reason on the board when Kelly, haircut or bankroll is 0.

### STAKE-I2 · Smallest and largest bet are dollars while the caps are percentages, so they do not follow the bankroll

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** kellyFor (cfg.sMax) and the smallest-bet check in auditCore; cfgRead for the percentage caps.
- **Inputs:** The same bet (+10% at 50%) at $10, $200, $400, $1,000 and $100,000 set aside.
- **The app gives:** $0 at $10 (Kelly $0.13: nothing can reach $1); $2.50; $5.00; $10.00; and still $10.00 at $100,000 (Kelly says $1,250), where the game cap ($2,000) and the daily max ($10,000) can never bind.
- **Right:** Fine for one owner at $1,000. For other people, bet limits as a share of the money set aside would scale with it (adds detail to known item K7).
- **Why:** At large banks every bet is the same $10 whatever its edge; at small banks nothing is listed.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t3-edges.js   (lines D)
- **Proposed fix (not applied):** An idea for a public version only: express the smallest and largest bet as percentages of the bankroll.

### STAKE-I3 · Small differences: stakes are not whole cents inside, the exact-floor comparison has no tolerance, a Make under $2 is more than half the Take stake

- **Kind / severity (auditor):** improve / S3 · confidence 0.85 · proven by a check that runs
- **Where:** auditCore `r.stake = s` (raw number, only Kalshi is cut to the cent); `if(r.net<cfg.eMin)` with no tolerance; makeTotal (index.html line 14639): Math.max(cfg.sMin, half).
- **Inputs:** Polymarket prop 52% / 56% / 60%; a bet at exactly +1.5% (price 50%, model 50.75%); Take stakes of $1.50 and $1.00.
- **The app gives:** Board stake $5.7087 shown as $5.71 (form $5.71, + Add a bet $5.70); 4,234 of 20,528 staked bets are not whole cents. The exactly-1.5% bet fails on the board (0.5075 ÷ 0.50 − 1 is 0.0149999999999999 in the computer) while the form and + Add a bet allow a tolerance. Make total $1.00 for a $1.50 Take and for a $1.00 Take; $1.00 within 2 hours of the game whatever the Take.
- **Right:** Round down to the cent in one place; one tolerance for the floor everywhere; docs section 4 says only 'A Make stays half the Take stake'.
- **Why:** One-cent and edge-of-floor differences; none changes a decision in practice.
- **Check that runs:** cd /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake && node t6-editor-add.js (case 3) && node t3-edges.js (A1) && node t2-property.js 500 1 (I13)
- **Proposed fix (not applied):** Cut r.stake to the cent once in auditCore, as Kalshi already does; use `cfg.eMin-1e-9` in the board's floor check; say in the doc that a Make is never under the smallest bet.

**Checked and found right (15):**

- Kelly arithmetic (kellyFor, actNetOf, okProb): 34,892 cases over 6 books, prices 5% to 95%, edges 0.5% to 40%. The growth-optimal stake was found by numerical search with the fee paid win or lose (it matched the closed form to 6e-8). The app was never above one eighth of it. Exactly 0.125 with no fee (Novig, sportsbooks); 0.116 to 0.117 at Kalshi and Polymarket (about 7% under an eighth, because the app divides by the payout befor …
- Property test, 6,000 seeded boards (110,948 rows, 17,628 logged bets, 20,528 staked bets; banks $10 to $100,000; six books): zero counter-examples for actNet equal to the formula, the floor on actNet and on the model, price at or under OK up to (own bisection), stake at or under Kelly and the largest bet, never under the smallest bet, outliers and no-market bets at the smallest bet. (t2-property.js seeds 1 to 12, t2-summary.txt)
- Daily max with the Bet log: zero counter-examples as the app counts it (2,222 cuts, 128 trims); the day's money is handed out in mathKey order (no lower-ranked bet got money after a higher one was cut or trimmed).
- Model-only bets at most 5 a game day and 1 a game, counting logged ones; long-shot moneylines need a market price, get the smallest bet, at most 3 a day and 1 a game, counting logged ones (815 staked, 1,157 refused for no market). By hand: 4 logged + 3 on the board leaves the best one at $1; 2 long-shot moneylines logged + 3 on the board leaves the best one at $1. (t3-edges.js I1 to I4)
- One bet per player per game and one side (and one total) per game: zero cases of two staked, zero cases where the kept bet had the lower actNet (1,554 player picks, 1,140 side picks, 1,640 held players, 876 held sides).
- Nothing started, at a book not chosen, or identical to a logged bet got a stake (11,026 started rows, 11,273 other-book rows, 3,980 already-bet rows); every $0 on a passing row carried a note saying why.
- Kalshi rows (3,533 staked): the order fits inside the stake with the fee rounded up to the cent, the limit price clears the floor, shares match.
- Edges: room exactly $10 keeps $10; $9.99 trims to $9.99; exactly $1.00 gives $1.00; $0.99 gives $0 with 'daily max reached'. Game cap with $10 / $15 / $19 / $19.50 logged gives $10 / $5 / $1 / $0 'game cap reached'; same team and side counts 1.5x. Smallest above largest gives $0 with the reason. Kelly 1 and haircut 1 gives full Kelly $100, held to the $10 largest bet. (t3-edges.js)
- Bankroll change during a day with $60 logged: $1,000 leaves room $40; $600 room $0; $500 'daily max reached — $50'; $2,000 room $140. The day's limit follows the number in Settings at once.
- Game day around midnight Central: a game at 11:40 PM CT on 11/10 counts with 11/10; a game at 12:10 AM CT the same night starts a new day with its own $100 (one late slate can carry two days' money: it follows the written game-day rule). A logged bet with no start time counts on its saved date.
- A mode, a tab, a label or the Easy level never changes a stake: 400 boards audited under all 10 tabs and under html[data-viewas=easy], 0 differences in pass, stake, shares, cap label or actNet. As a what-if only (not the live setting), with the 🍀 / 🔮 extras switched on the best bets were still identical. (t4-modes.js)
- The editor and + Add a bet agree with the board for: a plain bet (Novig $10.00), Kalshi ($5.67 · 10.33 shares at a 53 cent limit on all three), no market ($1.00), game-cap trim ($5.00), daily trim ($5.00). A Make is half the Take stake at the maker fee ($10 → $5, $5 → $2.50). (t6-editor-add.js)
- easyBankNeed: exact on 539 of 551 tested boards, never too high, never non-monotone; easyNoStakeCause reads day / game / player / minimum from the board's own notes.
- cfgRead: game cap, daily max (and the unused dayMaxMev) are bankroll × percent; no mode changes them. Daily max 0% turns it off, as its label says.
- The app's own tests on the frozen copy: tests/hard-stop-test.js 5 of 5, tests/invariants-test.js 35 of 35.

**Not checked:**

- The full report.md could not be written: this session blocks report files from this agent. /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stake/report.md holds only three lines of early working notes. The whole repor …
- Waiting orders (myOrders) inside the daily max and the long-shot moneyline count: read only, no order fixtures were run.
- swapBooks moving a row to another book before sizing, AWOL / Old holds and stale best-book claims: not generated in the random boards (every price was one minute old).
- The 🍀 / 🔮 extras as live bets: they are switched off in v5.24 (EXTRAS.nearMiss and hailBets are false); only the what-if in question 4.
- The Make ladder end to end (rungs, 30 / 35 / 35 split): only abStake with make:true and makeTotal.
- + Add a bet's day and model-only cases through the typed form: run through abStake with the arguments the form passes. The long-shot moneyline and the held player were typed in the real form.
- Real boards: every board here is invented, so every 'how often' is from random boards, not from the owner's data.

**Noticed outside its area:**

- FanDuel Predicts' fee is modelled as paid win or lose (2% ÷ price of the stake); if it is only charged on a win, EV and Kelly there are understated (fees auditor).
- A Kalshi limit is OK up to cut down to whole cents; on a market quoted in fractions of a cent it could sit under the current ask (Kalshi auditor). Not run.
- extrasUsed counts sold extras toward the 5 / 3 a day (extras are off in v5.24). By reading only.
- A Polymarket long-shot moneyline loses its 'NxC' share note in the God table: the long-shot block deletes r.contracts and nothing else reads it (cosmetic).

## profit, payout and every money total on screen (key: profit) · frozen live copy v5.24 (commit 08ed1 …

### PROFIT-1 · A won exchange bet built from two orders is priced at the LAST order's price for all its contracts

- **Kind / severity (auditor):** bug / S1 · confidence 0.93 · proven by a check that runs
- **Where:** linkFill, index.html line 14349 (autoFrom branch: b.stake=b.fillCost; b.odds=fmtOdds(Math.round(americanOf(f.price)))); the Fix / Keep mine path does the same (line 14351 fillDiff.price=px, applied at line 14207); then betProfit line 8100. The fee rate (snap.fee) also stays that of the first order.
- **Inputs:** Kalshi, one market. Order 1: 10 contracts at 40c ($4.00 + $0.17 fee). Later order 2: 10 contracts at 60c ($6.00 + $0.17 fee). Kalshi settles YES. Played end to end through the app's own syncFills() with the Worker's /mine/fills answer supplied by the script.
- **The app gives:** Bet saved as stake $10.34 at -150 (the 60c of the second order for all 20 contracts), fee rate 0.0425 (first order's). Won: +$6.19. Orders the other way round (60c then 40c): +$14.80. 20 at 50c then 20 at 53c: +$17.49.
- **Right:** 20 contracts pay $1 each = $20.00; paid $10.34; profit +$9.66 in both orders of the first example; +$18.70 in the 50c/53c example.
- **Why:** Money in minus money out: contracts x $1 - everything paid. The bet record itself holds it: fillQty 20, fillCost 10.34 (20 - 10.34 = 9.66), and Kalshi's settlement writes bookPaid: 20 on the bet; bookPaid is written once and never read anywhere in the app. The app's own test tests/v512-money-test.js line 56 states the rule in words ("8 x $1 = $8.00 - $4.14 = +$3.86") but only tries two orders at the SAME price, where the error is zero. The % mode already follows this idea for typed slips (line 6877: "the slip's profit, not the rounded odds").
- **Money effect:** -$3.47 on a $10.34 bet (40c then 60c); +$5.14 with the orders reversed; -$1.21 on $21.30 for a 3-cent gap (50c then 53c). Roughly (price gap) x contracts of the earlier order, on every total that includes the bet (Today card, calendars, Reports, Scorecard, CSV, Easy).
- **How often:** Only when one bet is filled by two or more SEPARATE orders at different prices (adding to a position later, or re-placing a limit order). One order filled in pieces is fine (the Worker averages the pieces). Polymarket US wins are later corrected by the settlement's own profit (polyPaid); Kalshi and Novig wins …
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t5-sync-fills.js (output saved in out/t5-sync-fills.txt): {"name":"Player TWO","odds":"-150","stake":10.34,"fee":0.0425,"fillQty":20,"fillCost":10.34,"result …
- **Proposed fix (not applied):** In linkFill, set the price from what the bet holds, not from the last order: price = (fillCost - fillFee) / fillQty, fee rate = fillFee / (fillCost - fillFee). Better: a won bet that still equals its fills pays fillQty x $1 - fillCost (see PROFIT-3). Not applied.
- **Second look: Confirmed** (severity S1, confidence 0.93, re-ran the check: yes)
  - Corrections to the claim: Adds to the claim: Novig is hit the same way (it has no Worker settlement, so ESPN grades it and the win comes from odds). Polymarket US wins are replaced by polyPaid, as claimed. Only wins are wrong; a loss is -stake = -fillCost, which is right. The Fix / Keep mine path for a bet first saved from a card also offers the last order's price (fillDiff.price = px); I checked that by reading only. Fee units from (b): the claim's fee rounding is fine within a cent. books.md (one order, 11/14) says Kalshi seems to charge fees to a fraction of a cent, which mo …
  - Its own check: I did not use the auditor's hand-written fills. I ran the real Worker code (prop-bet-api/src/mine.js handleMine, imported read-only, with a throwaway local key and fetch answered locally) on raw Kalshi-API-shaped fills, then fed its /mine/fills answer into the frozen app's syncFills (skeptic-exchange-money/worker.mjs, steps.mjs, app-e2e.js, output app-e2e.out). Question (a): groupFills merges and averages only the pieces of ONE order (same order_id). My case B, 8@45c + 8@47c in one order, came through as a single fill of 16 @ 0.46. Two separate orders stay two fills, each with its own price, so the bug is reachable. Case A: order 1 is 7@33c ($2.31 + $0.11 fee), order 2 is 12@58c ($6.96 + $0.21). Paid $9.59; 19 contracts win $19.00; true profit +$9.41. The app saved odds -138 (the 58c of the last order) with fee rate 0.0476 (order 1's), so a win reads +$6.2 …
  - Written decision found: None that allows it. The opposite is written: tests/v512-money-test.js lines 55-57 (v5.12) state the rule for a bet linked to two orders: 'If it wins: 8 x $1 = $8.00 - $4.14 = +$3.86'. That test only uses two orders at the same price, so it pins nothing at different prices.
  - How often for you: Only when he places a second separate order on a market he already bet (adding later, or re-placing a limit order that did not fully fill). The board marks the card ALREADY BET, which makes this less common; the frequency in his log is unknown. With $1-$10 bets the error is roughly the first order's contracts x (price gap / last price): cents to a few dollars per bet, u …
  - Your saved history: Yes, already saved, because profit is computed from the saved odds. Dry-run check: list bets with autoFrom set, 2 or more distinct 'o:' order ids in fills, result win, no towin, and accountingSource not user or import. Compare betProfit(b) with fillQty - fillCost, and with bookPaid - fillCost where bookPaid exists (Kalshi). Any gap over 1 cent goes on the list for the owner to approve.
  - Smallest safe fix: For a win on a bet that still equals its fills (autoFrom, fills present, accountingSource not user or import, no towin typed), profit = fillQty - fillCost; the same in rpToWin and the Today card's Open upside. Or keep odds in step with the average: in linkFill autoFrom, price = (fillCost - fillFee)/fillQty and b.fee = fillFee/(fillCost - fillFee). The test that must fail first and pass after: two orders, 10@40c then 10@60c, settled YES, must give +9.66 in either order.
  - Risks in the fix: fillQty can itself be wrong, through the new re-read bug below and on bets linked before v5.11 (the q0 fix). Using fillQty - fillCost carries that error over, so cross-check with Kalshi's bookPaid when present. Never rewrite snap. Leave hand-edited bets alone (accountingSource user or import). Tests to re-run …
  - Tests that pin today's behaviour: tests/v512-money-test.js (F2: two orders at the same price, so it passes either way); bugfix-money-test.js; import-v2-test.js (linkFill leaves import and user bets alone).

### PROFIT-2 · A position sold in part is not counted: the cash from the sale is dropped (and two sales never make the bet SOLD)

- **Kind / severity (auditor):** bug / S1 · confidence 0.88 · proven by a check that runs
- **Where:** syncFills, the sell branch, index.html lines 14410-14411: b.soldFills=+f.qty; b.soldCash=price*qty; the bet becomes SOLD only if soldFills >= contracts bought. soldFills and soldCash are overwritten by each sale (not added) and nothing else reads them; betProfit then settles the whole stake. Novig: line 14428 …
- **Inputs:** Kalshi, 10 contracts at 50c = $5.18 paid with the fee. (a) sold 5 at 70c ($3.50 - $0.08 fee), other 5 LOST; (b) sold 5 at 70c, other 5 WON; (c) sold 5 at 70c then the last 5 at 80c; (d) sold all 10 at 70c in one sale ($7.00 - $0.15 sell fee).
- **The app gives:** (a) -$5.18; (b) +$4.82; (c) never marked sold (soldFills stays 5); when a result arrives it is graded as a full win +$4.82 or full loss -$5.18; (d) SOLD for $7.00: +$1.82 (the sell fee is ignored: soldCash = price x contracts).
- **Right:** (a) 3.42 - 5.18 = -$1.76; (b) 3.42 + 5.00 - 5.18 = +$3.24; (c) 3.42 + 3.94 - 5.18 = +$2.18; (d) 7.00 - 0.15 - 5.18 = +$1.67.
- **Why:** Profit = cash received (sales after their fee, plus $1 per contract still held if it wins) minus cash paid. The sale's cash and fee are in the Worker's fill (price, qty, fee) and partly copied to the bet (soldCash), but never used unless one sale covers the whole position.
- **Money effect:** (a) loss overstated by $3.42 on a $5.18 bet; (b) win overstated by $1.58; (c) off by +$2.64 or -$7.36; (d) +$0.15 too much (every fully sold Kalshi bet is over by its sell fee).
- **How often:** Every partial cash-out on Kalshi or Polymarket US read from the book; every position closed in more than one sale. The owner already has a manual box for one of the cases ("Lost $", history v3.98: "what you really lost (a partial cash-out), if you typed it"); a partial sale followed by a WIN has no box. Case  …
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t5-sync-fills.js (out/t5-sync-fills.txt): HALFL app -5.18 real -1.76 (difference -3.42); HALFW app 4.82 real 3.24 (+1.58); TWOSELL soldFills 5, sold null, gr …
- **Proposed fix (not applied):** Add the sales up per bet, once per sale id (soldFills += qty; soldCash += price*qty - fee); mark SOLD when the sum reaches the contracts bought; when the rest settles, profit = soldCash + (contracts left x $1 if it won) - fillCost. Not applied.
- **Second look: Confirmed** (severity S1, confidence 0.88, re-ran the check: yes)
  - Corrections to the claim: Case (c) as the claim words it depends on Kalshi listing a settlement for a closed position: with yes and no counts both 0 the Worker sends side null, and the app's Kalshi branch ignores st.side and would grade it a full win or loss. Without that settlement the bet stays open until ESPN grades it, then the whole stake counts. Either way the total is wrong. Novig never sends a 'sell' fill: its sales are buys of the other outcome. A partial one is lost the same way, so the line 14428 point stands. Each sell fee is about 1 cent per order higher or lower i …
  - Its own check: Re-ran t5, which prints exactly the claim's numbers. My own run went through the real Worker on raw Kalshi data (app-e2e.out). A Kalshi sell arrives as its own fill: action 'sell', price 0.62, qty 4, cost 2.48, fee 0.07 in dollars. The cost does not have the fee taken off. 12@45c paid $5.61 in all. C: sold 4@62c ($2.48 - $0.07 = $2.41), the other 8 win: true +$4.80, app +$6.38. D: the other 8 lose: true -$3.20, app -$5.61. E: sold 6@62c ($3.62), then 6@70c ($4.20 - $0.09 = $4.11): true +$2.12. The app never marks it SOLD; soldFills is 6 and soldCash 4.20 (the second sale overwrote the first) and the bet stays open. F: all 12 sold in one sale at 62c: true $7.44 - $0.20 - $5.61 = +$1.63, app +$1.83 (the sell fee is ignored). By reading syncFills (14410-14411): b.soldFills = f.qty and b.soldCash = price x qty are set, not added, and nothing else reads them. N …
  - Written decision found: None for partial sales. The only related decision is history v3.98: a hand-typed 'Lost $' (lostAmt) for a partial cash-out that lost. There is no box for a partial sale followed by a win.
  - How often for you: Every time he cashes out part of a Kalshi, Polymarket US or Novig position, closes one in more than one sale, or fully sells a Kalshi position (the sell fee, a few cents). How often he sells is unknown; at $1-$10 bets each case is off by up to the sale cash (a few dollars).
  - Your saved history: Yes. On the bet: soldFills > 0 with no sold (a partial sale; soldCash holds only the LAST sale's gross, no fee); sold.auto true with sold.price = soldCash (a full sale, over by the sell fee: estimate it as Kalshi's 7% fee on soldFills at soldCash/soldFills). Kalshi wins or losses where bookPaid is below fillQty also point to a partial sale. The sell fee and earlier sales are not stored, so the exact figure needs the book's history (the Worker keeps only 14 days) or the owner's statement. A dry run can list these bets but can only estimate their profit.
  - Smallest safe fix: In the sell branch, add up per sale id, once each: soldFills += qty, soldCash += price x qty - fee, and keep soldIds so a re-read does not count a sale twice. Mark SOLD when soldFills reaches fillQty. In betProfit, when soldFills is between 0 and fillQty and the rest has settled: profit = soldCash + (fillQty - soldFills) x $1 if won - fillCost. For Novig, keep soldFor and soldQty on the bet for partial hedges and use the same formula. The test that must fail first and pass after: the C, D, E and F cases above.
  - Risks in the fix: A re-read must never add the same sale twice (key it by sale id). A hand result or a typed lostAmt or towin must win. Do not clear a result to force a regrade. The Novig sale pairing (oldest position first) decides which bet a hedge closes when the same market holds two bets. Tests to run: novig-plus-test.js, …
  - Tests that pin today's behaviour: None tests a sale on Kalshi or Polymarket (grep for soldFills and soldCash in tests/ finds nothing). novig-plus-test.js and fill-autolog-test.js cover Novig sold or fill basics only.

### PROFIT-3 · A won Kalshi or Novig fill is paid from a rounded American price, not from its contracts

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** autoAddFromDesc / autoAddFromRow (index.html lines 14178-14203: offeredRaw = fmtOdds(Math.round(americanOf(prob)))), then betProfit (line 8100), rpToWin (11712) and the Today card's Open upside.
- **Inputs:** One Kalshi order: 190 contracts at 52c, fee $3.32, paid $102.12. 52c becomes -108 (really -108.33). Also 19 contracts at 52c; 100 at 7c; a sweep of every whole-cent price 2c..98c at 25 contracts.
- **The app gives:** +$88.16 (190 contracts); +$8.81 (19 contracts); +$92.57 (100 at 7c).
- **Right:** 190 - 102.12 = +$87.88; 19 - 10.22 = +$8.78; 100 - 7.46 = +$92.54.
- **Why:** Each contract pays exactly $1; the American price rounded to a whole number moves 1/price by up to 0.5%, so the computed payout moves by up to 0.5% of the cost. The bet stores fillQty and fillCost, which give the exact number.
- **Money effect:** +$0.28 on a $102 bet, +$0.03 on a $10 bet; across all 97 prices the differences run from -5c to +5c and add to -$0.02: no lean either way, so ROI is not biased, but a single bet can differ from the book's statement by up to 0.5% of its cost.
- **How often:** Every won Kalshi or Novig bet logged from a fill whose price is not an exact whole American number (most prices). Polymarket US wins are replaced by the settlement's profit (polyPaid).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t4-fill-profit.js (out/t4-fill-profit.txt): A real 8.78 app 8.81; B real 87.88 app 88.16; C real 92.54 app 92.57; sweep n 97 sumDiff -0.02 worst 43c: app 13. …
- **Proposed fix (not applied):** In betProfit, before the odds branch: for a bet that still equals its fills (autoFrom, stake === fillCost, not edited by hand, fillQty > 0) a win pays fillQty - fillCost; the same in rpToWin and the Today card's Open upside. This also removes most of PROFIT-1. Not applied.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: Narrower in money: at most about 0.5% of the cost on a win, either way, and it adds to about zero over many bets (the auditor says so too). For this owner's $1-$10 bets that is 0 to 5 cents a win. It is a saved total, but too small to change a decision; S2 at most, close to S3. books.md does not contradict it: Novig pays $1 per contract (qty counts 1-cent contracts, divided by 100 in the Worker).
  - Its own check: Re-ran t4: A 8.81 against a true 8.78, B 88.16 against 87.88, the sweep sums to -0.02, as claimed. My own run through the real Worker gave the same. G: one order 37@47c, paid $17.39 + $0.65 = $18.04, wins $37: true +$18.96; app +$19.00 (+113 from 47c, really +112.77). B: one order in two pieces averaged to 0.46, paid $7.64: true +$8.36, app +$8.33. My own sum for 190@52c: 102.12 x (1/0.51923 - 1 - 0.03360)/1.03360 = 88.16, against 190 - 102.12 = 87.88. Novig (by reading): price = cost/qty arrives as any fraction, and autoAddFromDesc and autoAddFromRow save fmtOdds(Math.round(americanOf)), so the same applies. No Novig settlement replaces it.
  - Written decision found: None. The v5.12 test text (8 x $1 - cost) states the contract rule.
  - How often for you: Most of his Kalshi and Novig wins from fills, a few cents each, with no lean either way.
  - Your saved history: Yes, cents. A dry run can recompute it exactly: autoFrom bets with one order in fills, result win, no towin: fillQty - fillCost (or Kalshi bookPaid - fillCost) against betProfit.
  - Smallest safe fix: Same as PROFIT-1: a win on an untouched fill bet pays fillQty - fillCost. One fix covers both.
  - Risks in the fix: Same as PROFIT-1 (fillQty must be right; leave hand edits and towin alone).
  - Tests that pin today's behaviour: bugfix-money-test.js M1 (fill odds that do not survive the % box: it checks that Save changes nothing, and keeps the rounded odds); v512-money-test.js.

### PROFIT-4 · The Scorecard and Reports print a different profit and ROI for the same bets when a free bet wins, and the Scorecard's note does not say free bets are left out

- **Kind / severity (auditor):** policy / S2 · confidence 0.9 · proven by a check that runs
- **Where:** scoreSet (index.html line 9470: settled = S.filter(x=>x._pl!=null && x._st>0) drops every free bet); lcStats / rpAgg (lines 5177, 11700: a free bet's winnings count, its stake is $0); the note #scParlayNote (line 9504).
- **Inputs:** 10 own $10 bets at +100, 5 won and 5 lost (= $0.00), plus one FREE $25 bet at +200 that won $50.00. Also the 600-bet seeded log (seed 1).
- **The app gives:** Scorecard: Profit $0.00, ROI +0.0%, note: "Parlays are left out of this Scorecard (it tests single bets), but Results by day and Reports count them." Reports, Bet calendar, Results by day and the tab badge: +$50.00, ROI +50.0%.
- **Right:** Both follow a written line: docs section 8 ("A free bet counts as $0 when it loses, and as its winnings only when it wins": Reports does that) and history v4.86 (free bets are "CLV only" in the Scorecard; the CSV column "in Scorecard" says so). Not a code error: two rules under one word, and the on-screen note that explains the gap omits free bets and cancelled bets.
- **Why:** Reports' ROI rises with every free bet that wins and can never fall when one loses: the +50% above is a break-even bettor. The Scorecard's number is the cleaner measure of skill but hides real money and does not say it does. Question for the owner: which one is "my ROI", and should each be named differently.
- **Money effect:** Worked example: $50.00 and 50 points of ROI apart on 11 bets. On the 600-bet log the Scorecard's profit is below Results by day by parlays +$505.87, free-bet winnings +$1,127.35, extras/research +$233.43 and cancelled -$21.95; only the first and third are named in the note.
- **How often:** Whenever the log holds a free bet that won (7% of the generated bets were free; the owner's real share is unknown to me).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t7-small.js part B (out/t7-small.txt): scorecard ["Profit$0.00on $100.00 staked","ROI+0.0%..."], reports "Settled: $100.00 risked, +$50.00 ... ROI+50.0%", be …
- **Proposed fix (not applied):** Owner's choice. Smallest: add "free bets" and "cancelled bets that lost money" with their amounts to the Scorecard note, and print "free-bet winnings in this ROI: +$X" under the Reports ROI tile. Not applied.
- **Second look: By design (your rule)** (severity S2, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The facts are right. Both numbers follow written rules, so this is a question for the owner, not a bug. The only real gap is the note's wording (it leaves out free bets and cancelled bets), which is S3 text. Reports' ROI rising with every free-bet win (+50% for a break-even record) is policy: which ROI is 'my ROI'.
  - Its own check: Re-ran t7 part B: Scorecard Profit $0.00, ROI +0.0%; Reports, Bet calendar and the tab badge +$50.00, ROI +50.0%. The note reads 'Parlays are left out ... (plus any Just missed, Hail Mary and research bets, also left out here)' and does not mention free bets. Read scoreSet: settled = S.filter(x => x._pl != null && x._st > 0), which leaves out every free bet (stake $0). betProfit counts a free bet's winnings only.
  - Written decision found: docs/EV-CALCULATOR.md line 224: 'A free bet counts as $0 when it loses, and as its winnings only when it wins.' memory/history.md lines 101-106 (v4.86): free bets are 'CLV only' in the Scorecard; the CSV column 'in Scorecard' says so.
  - How often for you: Each free (bonus) bet that wins; his share of free bets is unknown.
  - Your saved history: No saved number is wrong; it is how two screens add up the same bets.
  - Smallest safe fix: Owner's choice. Smallest: add free bets (and their winnings amount) to the #scParlayNote text, and show 'free-bet winnings in this ROI: +$X' under the Reports ROI. No change to any number without his word.
  - Risks in the fix: Text only. Watch the apostrophe rule inside single-quoted JavaScript strings. Tests that read the Scorecard: v507-test.js, v510-test.js, v486-test.js.
  - Tests that pin today's behaviour: v486-test.js (in Scorecard column), v507-test.js, v510-test.js, bugfix-money-test.js.

### PROFIT-5 · The Today line still says "(on the line counted as gone)"; since v4.07 nothing in play is counted

- **Kind / severity (auditor):** bug / S3 · confidence 0.95 · proven by a check that runs
- **Where:** renderTodayLine, index.html line 8195 (shown when d.risk > 0).
- **Inputs:** Today: one bet lost $1.50; one $2.00 bet whose game is playing.
- **The app gives:** "Today's games: 2 bets · $3.50 of $100.00 max (0.3% of bankroll) · 0–1–0 · 1 pending · −$1.50 (on the line counted as gone)"
- **Right:** The -$1.50 is the settled loss only; the $2.00 in play is NOT in it. The Today card right above says "IN PLAY $2.00 not won or lost yet". The words should say that too.
- **Why:** History v4.07: "only settled bets are won or lost (replaces the v3.08/v3.98 'counts as gone' rule)". The number was changed then; the bracket was not.
- **Money effect:** None on the number; the words tell the reader the day already includes the $2.00 as lost when it does not.
- **How often:** Every day that has a bet in play, when the board bar is open.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t7-small.js part A (out/t7-small.txt).
- **Proposed fix (not applied):** Replace the bracket with "($2.00 in play, not counted)" using d.risk. Not applied.

### PROFIT-6 · Live Games: a free bet's "pays $…" includes a stake that does not come back, so its break-even % is too low

- **Kind / severity (auditor):** bug / S3 · confidence 0.85 · proven by a check that runs
- **Where:** betPayout, index.html line 8239 ((+b.stake//0)+p), used for "pays $" and "break-even %" in Live Games (lines 8782 and 8795).
- **Inputs:** A free $5 bet at +150, open, with a cash-out offer of $3.00.
- **The app gives:** pays $12.50 (same as a cash bet); break-even 24%.
- **Right:** pays $7.50 (a free bet returns the winnings only); break-even 3.00 / 7.50 = 40%.
- **Why:** The app's own betProfit and twTotal give 7.50 for the same bet ("a free bet wins the same winnings (its stake does not come back)"); betPayout adds the stake back regardless of free.
- **Money effect:** A sell-or-hold read on a free bet is judged against $12.50 instead of $7.50: the offer looks worth taking only above 24% when the real line is 40%.
- **How often:** Only a free bet watched in Live Games with the cash-out box used.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t7-small.js part C: {"freePays":12.5,"ownPays":12.5,"freeProfitIfWin":7.5,"rpToWinFree":7.5,"twTotalFree":7.5}. The 24% / 40% is arithmetic on those numbers  …
- **Proposed fix (not applied):** return p==null?null:(b.free?0:(+b.stake//0))+p; Not applied.

### PROFIT-7 · The Bet log's CSV does not add up to the day on screen when a cancelled bet lost money

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** logCsv, index.html line 11632: cancelled bets are written only for the Reports export (meta.cancelled), not for Bet log › CSV (line 11655).
- **Inputs:** 600-bet seeded log with 18 cancelled bets that lost money; 800-bet log, each of its last 40 days exported alone.
- **The app gives:** CSV profit column adds to $5,921.09; calendar, Results by day and Reports say $5,899.14. Per day: 16 of 40 day files differ from the day on screen.
- **Right:** The same total, or a line saying what the file leaves out. Every difference equals exactly that day's cancelled loss ($21.95 in all).
- **Why:** The screens subtract a cancelled bet's loss (removedBets.lost); the Bet log file has no row for it, while the Reports file does.
- **Money effect:** $21.95 on $5,899 in the example. Parlays, free bets (flag "yes", stake shown, profit as on screen), pushes (0.00), sold ("sold") and open bets (blank profit) are treated the same in the file and on screen.
- **How often:** Whenever a removed bet has a typed loss.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t2-reconcile.js 1 600 and t7-small.js part F ("16 of 40; every one explained by cancelled bets that lost money: true").
- **Proposed fix (not applied):** Write the cancelled rows in the Bet log export too, as the Reports export does. Not applied.

### PROFIT-8 · Small display effects of keeping money as decimals, not cents: half-cent ties round down, a zero day can print −$0.00 in red, Open upside 2 cents off its tickets

- **Kind / severity (auditor):** improve / S3 · confidence 0.92 · proven by a check that runs
- **Where:** betProfit line 8100 (toFixed(2) on a float); money() line 8150 with renderTodayLine line 8195 and logDayHtml line 7999 (class from d.profit>=0); renderTodayBar line 9133 (toWin added unrounded).
- **Inputs:** (a) $1.42 at +975 wins $13.845; (b) a day with win +$0.24 and losses −$0.01 and −$0.23; (c) 12 open tickets whose own To win add to $26.38.
- **The app gives:** (a) $13.84; (b) Today line and Bet log day header "−$0.00" in the losing colour; (c) "Open upside +$26.40".
- **Right:** (a) $13.85 by round-half-up; (b) "$0.00"; (c) $26.38, the sum of what each row shows.
- **Why:** (a) 13.845 is stored as 13.8449999…; (b) 0.24 − 0.01 − 0.23 is −2.8e-17 in floating point; (c) unrounded amounts are added, each row shows its own rounded one.
- **Money effect:** (a) 1 cent on 139 of 20,000 random wins (0.7%; only with odd-cent stakes, which the Kelly stakes are); this was the only cause of any difference between the app and my independent totals (1 to 4 cents on 1,500 to 3,000 bets). (b) and (c) are display only. Long sums do not drift: 3,000 bets within 0.00000000001 of the cents total.
- **How often:** (a) about 1 win in 150; (b) only on a day that nets to exactly zero (28% of such splits print −$0.00, 28% +$0.00); (c) most days with several open bets, by a cent or two.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t1b-random.js and t6-floats.js (out/t1b-random.txt, out/t6-floats.txt).
- **Proposed fix (not applied):** One helper that rounds a win half-up on integer cents; treat /x/ < 0.005 as 0 before money() and its colour; add the rounded To win per ticket. Not applied.

### PROFIT-9 · A bet marked WIN with no readable price counts as a win and as "in play" at once, with $0, and is not flagged

- **Kind / severity (auditor):** bug / S3 · confidence 0.8 · proven by a check that runs
- **Where:** betProfit returns null with no price (line 8112), so heldValue (8143) calls the bet open; dayStats (8123) and lcStats (5177) still count the W.
- **Inputs:** A $7 bet whose odds are empty, marked WIN, next to a normal $3 win and two open bets.
- **The app gives:** Today line "2–0–0 · 2 pending · +$3.00"; Today card "All 1–0 … 3 playing … IN PLAY $12.00" (the $7 is in it); Reports: 4 tickets, 2 won, 3 open; lookOutWhy gives nothing. Easy labels it "nopx".
- **Right:** One consistent state: won, money unknown, listed under "to check".
- **Why:** The W–L counters read b.result; the money and the played/playing counters read betProfit, which cannot price it.
- **Money effect:** The win's money ($7 at an unknown price) is missing from every total and its stake sits in IN PLAY for good.
- **How often:** Only when a saved bet has no price. I did not find a form that saves one today (not checked exhaustively); old or imported rows could.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/profit/t7-small.js part D (out/t7-small.txt).
- **Proposed fix (not applied):** List it under "⚠ to check: won, but no price or winnings saved". Not applied.

**Checked and found right (17):**

- betProfit, every shape, by hand (t1-shapes.js, 47 cases): minus and plus prices, EVEN, number odds, saved To win, Kalshi / Polymarket US / Novig-live fee on the bet or in its snapshot, free bet win / loss / push, boost, real payout typed, lost amount typed (also $0), sold, free sold, push, void-as-push, open, no readable price, fractional stakes, 13 parlay shapes: 45 agree; the other 2 are a parlay marked win or push with NO payou …
- betProfit, random (t1b-random.js): 260,000 seeded bets in 13 shapes against exact BigInt arithmetic: identical except 255 exact half-cent ties (1 cent each, PROFIT-8).
- Fee charged on top of the price: stake x (1/p - 1 - f) / (1 + f) derived independently (cost = stake/(1+f), contracts = cost/p, profit = contracts - stake): exact on 60,000 random fee cases, fee on the bet or in snap.fee, free or not.
- Results by day (dayStats), Performance calendar and Bet calendar (calDays, All and each book): every day of 5 seeded logs (300, 600, 1,500, 3,000, 3,000 bets; 40 days, 11 books, parlays, free bets, sold, cancelled, open): profit, staked, in play, to play and counts agree with independent integer-cent sums; the per-book calendars add to All (t2-reconcile.js).
- Today card as PRINTED on screen: 14 days x 5 logs, 2,764 printed numbers (staked, bets, played / playing / to play counts and money, won, lost, the pill, IN PLAY, to play, Open upside, W–L, every book tile): agree; the only 8 differences are the one-cent ties (t2b-todaycard.js).
- Reports: all time, month and day totals agree; every filter (book, sport, type, price, tab, band, selection) adds back to the whole in profit, settled risked and tickets; every month and every day add to all time; the date-placed basis gives the same all-time money (t8-partitions.js, 35 checks, 0 differences).
- Scorecard money (profit, staked, ROI, weekly review column): agrees with its own written rule (singles; no parlays, extras, research, free bets), and Scorecard + what it leaves out = Reports to the cent.
- CSV export: rows = bets; profit column = every settled ticket; stake column; parlays, free bets, pushes, sold and open bets are treated the same in the file and on screen (cancelled bets apart, PROFIT-7).
- Bet log band-filter totals: 7 bands, count and net agree with independent sums; parlays are left out and the line says so.
- Easy level: easyLedger, easyInPlay, easySoFar agree (singles only, minus cancelled singles); open money ties to Reports once open parlays are added back.
- Tab 'so far' badges (tabEdgeStats): profit and staked agree with an independent sum of singles that have her chance saved and a win / loss / push.
- Bet calendar › Track by day, week and month, and Results by day › Last 7 days: the columns add to the totals.
- Game day (gameDayOf, ctDay, todayCT), 'today', the 7-day list, the Today card, Reports › Day and the CSV's game-day column: 5 device time zones (Chicago, Los Angeles, Madrid, UTC, Tokyo) x 15 clocks x 31 bets placed 1 and 61 minutes each side of midnight Chicago, of the UTC date change, of Sun 2026-11-01 (25-hour day, both 1:30 AMs) and of Sun 2027-03-14 (23-hour day); expected days written by hand: 3,525 checks, 0 differences; no …
- 'Within 6 hours' comparisons (lines 3763, 4892, 14877): all are differences of absolute milliseconds, so a clock change cannot break them (by reading only).
- ROI denominator: own money on settled tickets on every screen; the returned stake is never in a profit or an ROI; pushes count in the denominator with $0 profit; docs section 8's free-bet rule holds on every screen except the Scorecard (PROFIT-4).
- Floating point: sums of 3,000 bets stay within 1e-11 of the cents total; no drift into a visible cent from addition (t6-floats.js).
- The app's own tests on the frozen copy, run one file at a time: money-test 33 pass, free-bet-test 8 pass, towin-total-test 48 pass, bet-calendar-test 33 pass.

**Not checked:**

- REPORT FILE: the brief asked for audit/profit/report.md; the harness refused the report file ("Subagents should return findings as text, not write report files"), so I did not write it and did not work around the refusal. The whole report is in thi …
- The owner's real bet log (not available here): how many of his bets have two orders or a partial sale is a count on his own data (bets with autoFrom and fills.length > 1; bets with soldCash and no sold).
- Kalshi's and Polymarket's live answers (no network, no keys): whether Kalshi lists a settlement for a fully sold position, and the fee on a sale, are taken from the Worker's parser (prop-bet-api/src/mine.js), read only.
- Polymarket US wins after a partial sale (polyPaid shares the settlement's profit by stake): not simulated.
- The Scorecard's statistics (ranges, verdict, CLV), Rings and extras, Watch bets and research ROI tables: another auditor's area; only read.
- The bet editor's forms were not driven click by click (the app's towin-total-test and free-bet-test do that and pass); I tested the records they save.
- Parlay 'one miss / two misses' payouts are taken as typed; whether a free pick'em entry really pays a partial return was not checked against any book.
- How a sportsbook rounds an exact half cent (the 1-cent ties) is not known to me.

**Noticed outside its area:**

- todayYMD() (the date the board asks ESPN for) is the DEVICE's date, not Chicago's: off on 6 of 15 test clocks in Los Angeles and 7 in Madrid; after midnight a still-playing late game is  …
- The one-time v2.83 repair (index.html lines 9311-9313) deletes the start time AND the result of a non-manual bet whose saved time is more than 4 hours and a calendar day after its game,  …
- bookPaid (the book's own payout) is saved on the bet at a Kalshi or Polymarket settlement (line 14445) and is never shown or compared with the app's number (1 occurrence in the whole fil …
- A Kalshi settlement that carries no side falls back to b.fillSide // 'yes' (line 14440), so a closed position could be graded as if still held (by reading only, plus the simulated case i …

## grading (who won) and settlement

### GRADING-1 · "Check results" re-grades every old bet against TODAY's game when the same two teams play again

- **Kind / severity (auditor):** bug / S1 · confidence 0.95 · proven by a check that runs
- **Where:** checkResultsRun, index.html 12158-12180: findGame(scoreboardCache[b.sport], b.game) / findGameAny on today's ESPN list, no date check, no evOkFor; loops over all logged bets and skips only sold, parlays, gradedBy manual/import (a book-settled result is not skipped)
- **Inputs:** Six $10 bets at -110 on CHA @ DET of 11/2 (DET won 112-104, Cunningham 31, total 216) and DET @ CHA of 10/25, all saved WON. On 11/20 the teams meet again (CHA 120, DET 101, Cunningham 18). Check results pressed once.
- **The app gives:** Moneyline, prop, total, the Kalshi-settled prop and the 10/25 bet all flip win -> loss; only the hand-graded one is kept. Profit of the six: +$54.54 -> -$40.91.
- **Right:** A settled bet belongs to the game it was placed on; all six stay WON.
- **Why:** The button matches by team codes only, so any later meeting of the same two teams on today's list is taken as the bet's game and its score/box score replaces the saved result.
- **Money effect:** $95.45 swing on six $10 bets in the example; also rewrites the history behind Reports, the Scorecard and calibration.
- **How often:** Whenever the button is pressed while a rematch is final on today's list: NBA/NHL teams meet 2-4 times a season, MLB up to 13, NFL division rivals twice (week list). With 350+ bets logged, most game nights have a repeated pairing.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/wrong-game-check.js (output wrong-game-check.out)
- **Proposed fix (not applied):** In checkResultsRun skip a bet that already has win/loss/push, and find the game of open bets with findBetGame(b) instead of today's list.
- **Second look: Confirmed** (severity S1, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: The auditor drove checkResultsRun() through page.evaluate. The real click gives the same result. Add to the claim: bets with no start are hit too, and book-linked Kalshi or Polymarket bets settled within the last 3 days are put back by syncFills.
  - Its own check: I pressed the real button, not an inner function: g1-button.js boots the app with a saved log, opens the Bet log tab, checks that #checkResults is visible and clicks it. ESPN's answer for today is the real capture in tests/fixtures-nhl-2026-11-05.json (PHI @ NYR, NYR 3-2, Noel Acciari 1 goal and 2 shots, real box score). The saved bets were all settled correctly on an earlier PHI @ NYR (10/18) and one on NYR @ PHI (10/09). One press changed 9 of the 12 saved results in localStorage: the old PHI moneyline win became a loss, the old NYR moneyline loss became a win, Under 4.5 total win became a loss, Acciari Under 0.5 goals win became a loss (the plain one and the Kalshi book-settled one with gradedBy 'book'), the swapped-venue bet flipped, and a bet with no start (noStart) flipped too. Kept: the hand-graded one, Under 5.5 (the same result by luck), the other …
  - Written decision found: None for which game. memory/history.md 365-366 (v3.84) only says the button skips gradedBy manual and keeps a win, loss or push when ESPN cannot grade. Nothing decides that today's list may grade an old bet.
  - How often for you: Likely, and likely already in his history. He presses Check results and his few hundred settled bets since late October cover most NBA and NHL games. Any press made after a rematch of a pairing he bet earlier has gone final flips about half of those old bets (game lines by the new score, props by the player's new stat). It happens at night, when he is most likely to pre …
  - Your saved history: Yes, it can already be in his saved history, and it leaves no trace on the bet (see the dry-run in ownCheck). The wrong results also go to the other device (saveLog then syncTouched) and feed Reports, the Scorecard and calibration. (b) Nothing corrects it later. autoGradeLog grades only open bets, its v2.85 guard only acts on a start in the future, and fix83 runs once per bet. One exception: a Kalshi or Polymarket fill whose settlement is still in the Worker's window (syncFills asks for 3 days; Poly sends its last 60 resolutions) gets the book's result …
  - Smallest safe fix: The smallest safe fix: in checkResultsRun accept the found event only when it is the bet's own game. When b.start is valid, ev.date must be within 6 h of it. With no start, ctDay(ev.date) must be b.date or the day after, and evOkFor(b,ev) must hold. Otherwise continue and leave the result as it is. This is better than the auditor's "skip every settled bet": with my fix the button still re-checks today's bets, and it still repairs GRADING-2, which I showed it does today (g2-checkfix.out: pressed on Saturday night it puts the three wrong Saturday bets ri …
  - Risks in the fix: None against the project rules: no result is cleared, a result is replaced only when a new grade exists, and manual and import results are still skipped. Tests that pin the button and must still pass: tests/check-results-test.js, grade-stick-test.js, novig-identity-test.js (case 10), parlay-edit-test.js. None …
  - Tests that pin today's behaviour: check-results-test.js, grade-stick-test.js, novig-identity-test.js, parlay-edit-test.js (they pin the manual, import and book-kept rules; none pins the wrong-game regrade)

### GRADING-2 · Live Games settles a bet on tomorrow's game from today's final (same teams on back-to-back days) and the wrong result sticks

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** renderLive 8741 (findGame/findGameAny on today's list, never compared with b.start) and 8761-8763 (settle); liveOpenBets 8230 admits any bet starting within 24 h
- **Inputs:** Three $10 bets on Saturday CHA @ DET (start saved). Friday DET @ CHA is final 99-110. Saturday's real final: CHA 95, DET 118.
- **The app gives:** Friday's final saves ml=loss, total=loss, spread=win. The automatic grader's v2.85 guard reopens them while Saturday has not started, Live Games settles them again on its refresh, and after Saturday's real final the log still says DET moneyline LOSS and CHA +3.5 WIN.
- **Right:** DET moneyline WIN, Over 215.5 LOSS, CHA +3.5 LOSS (from Saturday's game).
- **Why:** Live Games ties a bet to an event by team codes only; home/away is ignored by findGameAny, and nothing checks the event's start against the bet's saved start. A settled bet is never looked at again.
- **Money effect:** $19.09 per $10 bet at -110 that is saved the wrong way round.
- **How often:** Needs a bet saved a day ahead and the same pairing on consecutive days: NHL/NBA home-and-homes and two-game sets, every MLB series in season.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/wrong-game-live.js
- **Proposed fix (not applied):** In renderLive accept an event only if evOkFor(b,ev) and, when b.start exists, the event starts within 6 h of it.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: The claim's "the wrong result sticks" holds only when the app is not visible from the last wrong settle through tip-off: path C shows the strip timer repairs it when the tab stays open. Live Games also does not settle props found by player name this way (liveGameByPlayer has the 90-minute check), only bets with teams.
  - Its own check: g2-live.js uses the real Live Games tab, real page reloads and the app's own timers. Friday DET @ CHA is final 99-110, and three bets saved Friday 2 pm carry Saturday's CHA @ DET start. Tapping the Live Games tab Friday at 9:30 pm settles them wrong straight away: DET moneyline loss, Over loss, CHA +3.5 win. Then three paths: - A: the page is reloaded Saturday 10 am, before tip-off. The v2.85 guard reopens them and Saturday's final grades them right (win, loss, loss). - B: the first reload is Saturday 7 pm, after tip-off. The wrong results stay for good. - C: the tab is left open overnight. The score strip runs renderStrip and then autoGradeLog at least every 5 minutes while the page is visible (index.html 8983). After midnight today's list is Saturday's, so Live Games cannot settle them again, and they end right. The wrong result sticks only when the app  …
  - Written decision found: None found for Live Games. v2.85 (the guard in autoGradeLog, 9315-9316) shows the project already counts "graded before its game started" as a wrong-game grade.
  - How often for you: Rare. The same pairing on consecutive days happens mostly in NHL home-and-home sets, a few per team per season. NBA rarely does it, NFL never, and MLB is out of season. He also has to have Live Games open (or press Check results) after the first game's final, and then not open the app before the second game starts. He opens it most days, so the second condition fails of …
  - Your saved history: Low, but possible. Such a bet ends up settled with its saved start before the time of the first settle. Nothing records the game that was used. Dry-run: list bets with a game line whose pairing also went final on the day before b.start, and grade them again from the event at b.start. (b) The autoGradeLog v2.85 guard corrects it only before the real game starts. Afterwards nothing does, except two things. Pressing Check results on the real game's day after its final puts it right: I proved that in g2-checkfix.out, through the very fault in GRADING-1. A  …
  - Smallest safe fix: In renderLive, when b.start is a valid time, accept the event only if Math.abs(Date.parse(ev.date)-Date.parse(b.start)) is under 6 h. Adding evOkFor alone does nothing here: Friday's game starts after the bet was saved. liveGameByPlayer already uses a 90-minute window for bets without teams. Test: a Live Games test where Friday's final and a bet carrying Saturday's start must stay open after the tab is drawn. It fails on v5.24 (g2-live.js path A, the step 'Live Games tab tapped').
  - Risks in the fix: Low. A game moved by more than 6 h is not settled by Live Games, and autoGradeLog grades it later. live-player-test.js and live-batch-test.js must still pass. Fix it together with GRADING-1, or the Check results repair path changes.
  - Tests that pin today's behaviour: live-player-test.js, live-batch-test.js (the Live settle); none pins the 24 h window with a rematch

### GRADING-3 · A postponed or canceled game is graded as a 0-0 final

- **Kind / severity (auditor):** bug / S1 · confidence 0.7 · proven by a check that runs
- **Where:** autoGradeLog 9354, checkResultsRun 12174, renderLive 8761, watchGrade 9698, attachAutoGrades 7486 all test only state==='post'; gradeGameLine 7186 has no 'was it played' check
- **Inputs:** ESPN event LAL @ DEN with STATUS_POSTPONED (state post, completed false, score 0-0); six $10 bets at -110 saved the day before.
- **The app gives:** Under 220.5 = WIN (+$9.09), Over = LOSS (-$10), LAL +4.5 = WIN, DEN -4.5 = LOSS, moneyline = push, the prop = '?' (left for the owner).
- **Right:** No action: stake back on every bet.
- **Why:** A game that is not played has no winner; ESPN lists a postponed/canceled game in state 'post' with completed false, and the app treats 'post' as final.
- **Money effect:** Each $10 total or spread bet is saved as +$9.09 or -$10 instead of $0.
- **How often:** MLB rainouts (dozens a season), a few NBA/NHL/soccer games a season. Assumption to confirm with one real reading: ESPN's postponed shape (state post, completed false, score 0); no fixture in the repo has one.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/postponed.js
- **Proposed fix (not applied):** One helper evPlayed(ev): status.type.completed===true and the name is not POSTPONED/CANCELED/SUSPENDED/FORFEIT; grade only then, otherwise leave the bet open with a Look-out reason.
- **Second look: Confirmed** (severity S1, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: The assumption is now verified with real ESPN data. Confidence should go from 0.7 to about 0.95.
  - Its own check: I settled the assumption with ESPN's real public JSON. All 10 real postponed games I found have status.type {id:'6', name:'STATUS_POSTPONED', state:'post', completed:false, detail:'Postponed'} and both scores '0': MLB DET@NYM 2024-04-02 and 04-03, ATL@CHW 04-03, MIL@CIN and MIN@DET 04-11, TOR@BAL 05-14; NBA CHA@LAL 2025-01-09, HOU@ATL, SA@LAL and CHA@LAC 2025-01-11. The summary for event 401568544 has the same header status, and its box score lists players with '--' in every stat. I fed that real scoreboard and summary to the frozen app (ppd-real.js). autoGradeLog and Check results both save Under 8.5 WIN +$9.09, Over LOSS -$10, DET +1.5 WIN, NYM -1.5 LOSS, NYM ML push, props '?'. gameStatusOf (7141) drops `completed`, and every grading path tests only state==='post'.
  - Written decision found: None.
  - How often for you: Rare for NBA, NHL and NFL: a handful of postponed games a season across each league (weather, emergencies such as the 4 NBA games in January 2025). MLB rainouts are dozens a season but MLB is out of season. Props are not hit ('--' does not parse, so they go to '?'). Totals, spreads and run lines are; the moneyline becomes a push (right by luck).
  - Your saved history: Possible but unlikely in his few hundred bets. Dry-run: for each settled game-line bet with no gradedBy and no book resultSrc, fetch ESPN's scoreboard for its game day (fetchScoreboardDay), find its event, and list those whose status.type.name is POSTPONED, CANCELED or SUSPENDED. Change nothing.
  - Smallest safe fix: A helper evFinal(ev) = status.type.completed===true. Expose `completed` from gameStatusOf and require it in autoGradeLog, checkResultsRun, renderLive, watchGrade and attachAutoGrades. Otherwise leave the bet open with a Look-out reason ('postponed: void at the book'). Never write push automatically.
  - Risks in the fix: tests/watch-shadow-test.js stubs gameStatusOf as {state:'post', eventId, teams} with no completed, so it would need its stub updated. Most other test events carry completed:true (grading-test, check-results-test). In novig-identity-test the status sits under competitions[0], so check it. Keep boxDone as it is …
  - Tests that pin today's behaviour: None pins postponed games. Tests that build final events: grading-test.js, check-results-test.js, towin-test.js, practice-fixtures.js, watch-shadow-test.js.

### GRADING-4 · A prop saved without its teams is graded against another game where a player with the same name played

- **Kind / severity (auditor):** bug / S1 · confidence 0.85 · proven by a check that runs
- **Where:** findBetGame step 2 (9254-9259), nflStat 7378 ('anywhere ? 0 : null'), evOkFor 9208 (dateSet lets every game of that day in although the bet has a start), findAthleteStat 7313 (name by includes)
- **Inputs:** Three Novig prop fills on 'Josh Allen' (Buffalo QB; Novig props carry no teams), start saved as BUF @ MIA 3:25 pm. Jacksonville's Josh Allen plays JAX @ TEN at noon.
- **The app gives:** At 3:10 pm, before the real game starts, and unchanged after it: Over 1.5 pass TDs = loss, Over 249.5 pass yards = loss, Under 30.5 rush yards = win; the bet's game is rewritten to 'JAX @ TEN'.
- **Right:** WIN (3 TDs), WIN (288 yards), LOSS (41 rushing yards).
- **Why:** The first finished game that day whose box score contains the name is taken; a same-named defender counts as 'played, 0 passing yards'. The saved start time is not used to choose.
- **Money effect:** $19.09 per $10 bet.
- **How often:** Needs a no-teams prop and two same-named players on one day: NFL Josh Allen (BUF/JAX) most Sundays, NHL Sebastian Aho. Rare but hits a heavily bet player.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/same-name.js
- **Proposed fix (not applied):** In findBetGame try the event whose start matches b.start first; in step 2 accept a game only when the stat was really found in the wanted table.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: The NFL Josh Allen pair is very likely not real (ESPN: Josh Hines-Allen). The real example is NHL Sebastian Aho. Add that Novig's start is overwritten, which removes the evidence.
  - Its own check: g4-aho.js uses a real same-name pair (NHL Sebastian Aho) and the real fill path. The fake Worker answers /mine/fills with a Novig fill described the way Novig describes props ("Sebastian Aho 2.5 SHOTS_ON_GOAL", no teams), and syncFills then autoAddFromDesc logs it. The box scores are the real ESPN NHL capture with one player renamed. The logged bet has game '' (no teams), dateSet true, autoFrom novig and Novig's start of 6 pm. At 5:50 pm the grader takes the noon PIT @ NYR game, where the other Aho had 1 shot. It saves LOSS, game 'PIT @ NYR' and start 18:00Z, before the real CAR @ BOS game has started, and the result stays LOSS after that game's final (4 shots: the right answer is WIN). Novig's start is overwritten and only placedAt and nvEvent are left. The auditor's own Josh Allen example is probably not real. As far as I know, ESPN has listed Jacksonvil …
  - Written decision found: Known and left open, not chosen. memory/history.md 193: "Not changed: ... findBetGame's by-player search (pre-existing: it takes the first finished game that lists the name)." The project chose the opposite rule for Live Games (v4.77/v4.78).
  - How often for you: Rare. It needs a Novig prop that was not first logged from the board (an auto-added fill) on a player who shares his name with another active player in the league who plays the same day. NHL Sebastian Aho is the real case, and the owner bets Aho (history.md 168, the 11/11 Aho bet). Teammates with the same name (Elias Pettersson, both Vancouver) are a different case. Eac …
  - Your saved history: Possible but rare. On a hit, the saved bet shows an auto-added Novig prop (autoFrom novig, nvEvent present) whose b.game was filled in by the grader and whose b.start is the wrong game's start. Novig's own start is gone. Dry-run: for each auto-added Novig prop, read the box scores of every final game on its day and list the bets whose name appears in two or more of them. He checks those in Novig's own history (nvEvent names Novig's event). (b) autoGradeLog causes it and never looks again. The v2.85 guard cannot catch it because the start was rewritten  …
  - Smallest safe fix: In findBetGame step 2 (index.html 9254-9259), apply the rule Live Games already uses (liveGameByPlayer, v4.77/v4.78, tests/live-player-test.js case 7). When b.start is valid, take only games within 90 minutes of it, prefer the exact start, and make no guess while a game in that window has not finished or when two games list the name. Also, do not overwrite b.start or b.game from a by-player match outside that window. Do NOT take the auditor's second half ("accept a game only when the stat was really found in the wanted table"). nflStat's 'anywhere ? 0' …
  - Risks in the fix: Removing nflStat's 0 rule would break correct grading of "played but no attempts" props. The 90-minute rule can leave a bet waiting when Novig's start is wrong by more than 90 minutes: it then goes to Look out, which is safe. Must still pass: grading-test.js, live-player-test.js, prop-prior-test.js, novig-plu …
  - Tests that pin today's behaviour: live-player-test.js (case 7 pins the no-guess rule for Live Games only); grading-test.js

### GRADING-5 · Doubleheader: a bet that names game 2 is graded on game 1, before game 2 starts

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** findBetGame 9238-9241 (first matching event of the day), evOkFor 9204 (the exact-start branch also returns true for any game after saved-4h), autoGradeLog 9347 (overwrites b.start with game 1)
- **Inputs:** NYY @ BOS twice on one day (12:10 and 6:10 pm); four bets saved at 9 am carrying game 2's start: board moneyline, hand-picked moneyline, Kalshi fill total, board prop. Game 1: 2-7, Judge 0 hits. Game 2: 6-1, Judge 3 hits.
- **The app gives:** All four saved LOSS at 4 pm from game 1, start rewritten to 12:10, unchanged after game 2.
- **Right:** All four WIN (game 2). The written rule says a hand-picked bet is graded against the game matched by exact start time.
- **Why:** Both games pass the 4-hour rule when the bet is saved before them, and the first in ESPN's list wins; the exact start is not preferred.
- **Money effect:** $19.09 per $10 bet.
- **How often:** MLB only (about 30-40 doubleheaders a season); nothing until spring. grading-test.js passes because its bets are saved the day after.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/doubleheader.js
- **Proposed fix (not applied):** In findBetGame, if b.start is valid, first look for an event within 60 s of it; fall back to the first match only when there is none.
- **Second look: Confirmed** (severity S1, confidence 0.85, re-ran the check: yes)
  - Its own check: I re-ran doubleheader.js and its output matches the saved one exactly. By reading I checked each step. findBetGame (9233-9241) uses days=[gameDayOf(b)], and both games pass evOkFor when the bet is saved before both. For a hand-picked bet with dateSet, evOkFor returns true at once (9206). For a fill, the exact-start branch only adds a 'true'; it never says no. findGame then returns the first NYY @ BOS in ESPN's list. autoGradeLog then overwrites b.start with game 1's start (9351), so the v2.85 guard cannot catch it. The bet shapes are real: board rows carry the start, + Add a bet saves manual and dateSet, and Kalshi tickers give the start. The written rule (CLAUDE.md, the grading skill) says a bet that names its game is graded against that game, so the hand-picked case breaks a written rule.
  - Written decision found: None. The written rule (CLAUDE.md "graded against it"; grading-and-matching SKILL "a bet that names its game ... is graded against that game") supports the claim.
  - How often for you: Zero now: MLB is out of season. From spring, about 30-40 doubleheaders a season, and only bets on game 2 are hit.
  - Your saved history: None in his saved history: his log began after the MLB regular season, and the postseason has no doubleheaders. (b) autoGradeLog causes it. The v2.85 guard is defeated because b.start is rewritten to game 1. A Kalshi or Polymarket settlement within syncFills' window puts a fill right, but a same-day Check results press then grades it on game 1 again (findGame takes the first match).
  - Smallest safe fix: Among events of the same pairing on the bet's day, take the one nearest b.start. Never take one more than 3 h before b.start while a nearer one exists. Use 'nearest', not the auditor's 'within 60 s': ESPN moves game 2's listed time when game 1 runs long, so a 60-second match would fall back to game 1, the same fault. Do not overwrite b.start with an event farther away than that. A better long-term fix is to save the ESPN event id picked in + Add a bet; addToLog copies a fixed list of fields, so it must be added there. Test: a doubleheader with bets sav …
  - Risks in the fix: Low. grading-test.js must still pass: its bets are saved the day after, and the 4-hour and dateSet paths must not change for single games.
  - Tests that pin today's behaviour: grading-test.js (no doubleheader case)

### GRADING-6 · A bet voided with the void button does not stay void

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** void button 15559 (sets voided and result push, no gradedBy); autoGradeLog 9314 (v2.85 deletes any result whose start is in the future) and settled() 9305; checkResultsRun 12164
- **Inputs:** Void pressed on a MIA moneyline the day before its game, and on a total after its game.
- **The app gives:** Pre-game void: push -> open on the next grader run -> 'pending' after Check results -> LOSS (-$10) once the game ends. After-game void: push -> loss when Check results runs with its game on today's list.
- **Right:** Stake back, $0, for good.
- **Why:** The void is stored as a plain push with no 'set by you' mark, so the future-start guard and Check results treat it as an automatic grade.
- **Money effect:** The full stake counted as lost (or a win counted) on a bet the book cancelled.
- **How often:** Every time a bet is voided before its game starts (the usual moment a book cancels one).
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/stick.js
- **Proposed fix (not applied):** Treat b.voided like a hand result: skip it in the v2.85 loop, settled(), checkResultsRun and liveOpenBets.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: Narrower: the wrong money result needs an ESPN-gradable bet. Wider in one way: a voided bet that ESPN cannot grade becomes open and is hidden from Look out (lookOutWhy skips voided).
  - Its own check: Re-ran stick.js: identical. The void handler (15559) sets only voided=1, voidedAt and result='push'; there is no gradedBy and no gradeRemember. Before the game: the v2.85 loop in autoGradeLog (9314) deletes any win, loss or push whose start is in the future, with no check of voided or gradedBy. gradesReapply (8030) skips voided bets, so nothing restores the push. When the game ends, ESPN grades it (open = !settled). After the game: checkResultsRun (12163-12178) skips only manual and import, so pressing Check results while the game is still on today's ESPN list overwrites the push with ESPN's grade. Question (c): `voided` is read only by gradesReapply (8030), lookOutWhy (8035) and the button label (7952). betProfit, the CSV and the day totals read only `result`. So once the push is gone, the money counts ESPN's grade (or open). lookOutWhy returns '' for a v …
  - Written decision found: None. The v3.33 comment on the button says 'stake back, counts as a push'.
  - How often for you: Rare. Most voids are props on a player who did not play, voided after the game. In that case v2.85 does not fire and ESPN cannot grade, so the push stays (only Check results while ESPN still lists the game with a stat could flip it). Exchanges (Novig, Kalshi, Polymarket) seldom void. 'Every time a bet is voided before its game' is true only for losing the push; a wrong  …
  - Your saved history: Exactly findable, no change: logged.filter(b => b.voided && b.result !== 'push') lists every void that lost its push, with voidedAt as the time he pressed it.
  - Smallest safe fix: Treat b.voided like a hand result: skip it in the v2.85 loop, settled() (count voided as settled), checkResultsRun, liveOpenBets and the book read. A one-line guard `if(b.voided) return/continue` in each place.
  - Risks in the fix: Low. tests/invariants-test.js (lines 135-140) pins only that void and unvoid toggle the mark and open no prompt; it still passes. Unvoid deletes the result and must leave the bet gradable again.
  - Tests that pin today's behaviour: tests/invariants-test.js (the void toggle only). A new test should fail before the fix and pass after: void a future moneyline, run autoGradeLog, finish the game, then autoGradeLog plus  …

### GRADING-K1 · K1 full picture: a result exactly on a whole-number prop line is saved as LOSS for the Over and for the Under

- **Kind / severity (auditor):** bug / S1 · confidence 0.98 · proven by a check that runs
- **Where:** gradeBet 7454 and gradeRow 7466 (no equal case); reached from autoGradeLog 9357, checkResultsRun 12177-12178, renderLive 8762, watchGrade 9699, attachAutoGrades 7500 (also writes won:false to the grade history); propVerdict 8274 shows 'Won' for the Under at the same time
- **Inputs:** Jokic 27 points, 12 rebounds; $10 bets Over 27, Under 27, Over 12 rebounds; control Over 26.5; game total 213 on a 213 line.
- **The app gives:** All three props saved loss (-$10 each) on all three saving paths; board row and grade history say loss; the 213 total is a push (game lines are right). Live card says 'Lost' for the Over and 'Won' for the Under.
- **Right:** Push, $0, on all three.
- **Why:** 27 is neither over nor under 27; both sides losing is impossible at a book.
- **Money effect:** The whole stake per bet (-$10 instead of $0) plus a false loss in win rate and calibration.
- **How often:** Owner's export: 1 of 169 props (0.6%) is on a whole-number line (10/26 Novig PRA Over 25, saved L, $2.78: check by hand). No test bet and no practice-log bet is affected (all on half lines). Random check: 2,689 of 30,000 random props land on the line and all are called loss.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/k1.js, k1-reallog.js, random-check.js
- **Proposed fix (not applied):** gradeBet/gradeRow: if(val===line) return push; checkResultsRun 12178 reads g.push; attachAutoGrades applies its push branch to props; propVerdict says Push. Regrade: one flagged pass over props saved loss by ESPN (not manual/import/book/sold/voided, not in mbev.grades): find the game, read the final box, run the new grader, and only when it answers push write push and keep the old value in b.edits; if the box cannot be read change nothing and retry later.
- **Second look: Confirmed** (severity S1, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: Narrower than 'every saving path': Kalshi and Polymarket results are overwritten by the book's settlement at the next book read, so the damage that stays is on Novig, sportsbook and hand-added bets.
  - Its own check: Re-ran k1.js: identical. Read gradeBet (7447) and gradeRow (7459): `won = side==='O' ? val>line : val<line` has no equal case, so 27 on a line of 27 loses for the Over and for the Under. checkResultsRun (12177) also ignores push for props. Checked whether the inputs are real: Kalshi lines are floor_strike, the half line (the Worker's live.js matches it to the board's half line). Polymarket and Novig 'N+' become N-0.5 (mine.js 210; normFillBet and v4.40). So whole lines come from sportsbooks, typed bets, or Novig lines without the '+'. Book read (14437-14444): Kalshi and Polymarket results overwrite ESPN's every minute; Novig has no branch there. Recorded decision: none. memory/decisions/tiers-and-easy.md:23 and :50 list 'push grading of whole-number props' as an OPEN owner question, not a decision.
  - Written decision found: Open question only: memory/decisions/tiers-and-easy.md lines 23 and 50 ('push grading of whole-number props').
  - How often for you: About 0.6% of props: 1 of 169 in his 10/24-11/10 export (Novig PRA Over 25, saved L, $2.78; whether it landed exactly on 25 is not known). Kalshi and Polymarket fills heal themselves when the books are read. Novig, sportsbook and hand-added bets keep the wrong loss.
  - Your saved history: Yes, a few at most. Dry-run list, changing nothing: logged.filter(b => b.kind==='prop' && b.result==='loss' && !b.sold && !b.voided && !['manual','import','book'].includes(b.gradedBy) && (!b.resultSrc // b.resultSrc==='ESPN') && Number.isInteger((lineSide(b.market,b.betnow,b.line)//{}).line) && !(gradesLoad().id[b.id] // gradesLoad().k[gradeKey(b)])). For each one, findBetGame, then fetchBoxscore, then statForMarket, and show the ones where the stat equals the line. The owner approves each with the existing Mark PUSH button: gradedBy manual plus gradeR …
  - Smallest safe fix: gradeBet and gradeRow: if(val===line) return {val,line,side,push:true}. checkResultsRun line 12178, attachAutoGrades, watchGrade and propVerdict must read push. Review of the regrade plan, line by line. (1) 'Props saved loss by ESPN': the app stores no ESPN mark on automatic grades, so select 'no gradedBy, resultSrc missing or ESPN'. Exclude both the id and the key in mbev.grades (the plan names only mbev.grades in general). (2) 'Find the game, read the final box, run the new grader, write only on push, old value in b.edits': this follows 'grade first, …
  - Risks in the fix: Do not apply push to fills whose line might mean 'N+' and is not converted. Kalshi uses half-line floor_strike, so it is safe, and Novig is converted by v4.40. No test pins a loss on an exact line (all test props are on half lines). tests/novig-plus-test.js pins Novig push at N becoming a win at N-0.5; keep t …
  - Tests that pin today's behaviour: None pins the loss. Related: tests/novig-plus-test.js, tests/grading-test.js, tests/check-results-test.js. A new test should fail before the fix and pass after: Over 27 and Under 27 with …

### GRADING-7 · Exchange positions partly sold, or settled at a part value, are saved with the wrong profit

- **Kind / severity (auditor):** bug / S1 · confidence 0.8 · proven by a check that runs
- **Where:** syncFills sell branch (a partial sell only stores soldFills/soldCash), settlement block 14432-14443 (saves bookPaid but only win/loss/push), betProfit 8100 (never reads bookPaid or soldCash)
- **Inputs:** 10 contracts at 40c: cost $4.00 + fee $0.17 = stake $4.17. Cases: 4 sold at 60c then the rest resolve YES / NO; Kalshi 'scalar' at 50c; Polymarket 50/50; all 10 sold at 60c.
- **The app gives:** Part sold then YES: +5.83; part sold then NO: -4.17; scalar and 50/50: push $0.00; all sold: +1.83.
- **Right:** +4.16; -1.84; +0.83 each; +1.66 (sell fee $0.17).
- **Why:** Cash from a partial sale and a part payout are saved on the bet but never enter the profit; a part-value settlement is not a refund of the stake.
- **Money effect:** $1.67 and $2.33 on a $4.17 position in the examples; $0.83 on a part settlement; the sell fee on a full sale.
- **How often:** Only when part of a position is sold before it settles, or a market resolves at a part value. The other 10 of 16 settlement cases (YES/NO win and loss, partly filled order, Polymarket long/short, other-side settlement ignored, hand result kept) are right to the cent.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/settle.js
- **Proposed fix (not applied):** At settlement, when bookPaid is known and soldCash>0 or the result is scalar/part, save the real money (towin = bookPaid + soldCash - stake, or lostAmt = stake - soldCash); count the sell's fee in soldCash.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.75, re-ran the check: yes)
  - Corrections to the claim: Narrower on the new part: Kalshi player-prop, moneyline and spread markets are binary, so 'scalar' should be very rare for his bets. A Polymarket US 50/50 settles a cancelled or postponed game, also rare. I could not confirm either against the live books (no network or keys); UNVERIFIABLE in practice, but the code path is real. Kalshi 'void' (case 5, fee kept or refunded) is not part of this claim and is unknown. The partial-sale cases are PROFIT-2: count them once.
  - Its own check: Re-ran settle.js (saved output): 6 of 16 cases differ, as claimed. Where it agrees with PROFIT-2: a partial sale then a win or a loss, and a full sale over by its sell fee. Those are the same code (the syncFills sell branch and betProfit, which never read soldCash or bookPaid), and my own runs C, D and F above reproduce them through the real Worker. What it adds: a part-value settlement. Kalshi market_result 'scalar' becomes outcome 'void' in the Worker (parseKalshiSettlements) and 'push' in the app; Polymarket's 50/50 becomes 'void' through byPay. Both are saved as push $0.00 although bookPaid (the part payout) is on the bet: 10@40c paid $4.17, $5.00 back, so true +$0.83. Checked by reading the Worker plus the auditor's run. polyPaid acts only on a win, so a Polymarket push ignores its pnl.
  - Written decision found: None.
  - How often for you: Partial sales: whenever he cashes out part of a position. Part-value settlements: perhaps a few times a season (a cancelled game on Polymarket US).
  - Your saved history: Find them without changing anything: push results with bookPaid not 0 and not about fillCost; plus the PROFIT-2 markers (soldFills > 0, sold.auto).
  - Smallest safe fix: At settlement, when bookPaid is known and the result is part-value (Kalshi scalar, Polymarket 'void' with a payout between 0 and the share count), save the money: towin = bookPaid - fillCost, or lostAmt = fillCost - bookPaid, and keep the result as push or win/loss by its sign. For a Polymarket push use the settlement's pnl. The partial-sale part: see the PROFIT-2 fix. The test that must fail first and pass after: settle.js cases 6, 8, 9, 10 and 14.
  - Risks in the fix: Writing towin or lostAmt must never overwrite a hand result (gradedBy manual or import is already skipped). Mark them towinSrc 'book' so a later read can tell them apart. Do not clear results to regrade.
  - Tests that pin today's behaviour: None for scalar or 50/50 settlements or partial sales.

### GRADING-8 · A result settled by the book is cleared once when the fill was first read the day after its game

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** autoGradeLog 9309-9311 (v2.82/v2.83 repair compares the start with snap.at, when the app read the fill, not placedAt, then deletes b.result)
- **Inputs:** Two Kalshi fills placed Monday afternoon, read Tuesday morning, both already saved WON by Kalshi.
- **The app gives:** On the next open: one becomes '?' (ESPN cannot grade it) and one becomes loss (ESPN's grade), both still labelled as from Kalshi; restored to win at the next read of the books if the Worker answers.
- **Right:** The book's result stays; nothing is cleared before a new grade exists.
- **Why:** Breaks the written rules 'never clear a saved result to force a regrade' and 'the book's own result wins'.
- **Money effect:** Usually under a minute of wrong totals; permanent if the Worker cannot be read or the settlement is older than the 3-day window.
- **How often:** Every exchange fill first read on a later day than its game, once per bet.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/late-fill.js
- **Proposed fix (not applied):** Use placedAt (else snap.at) in that loop and skip bets whose result came from a book or an import.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: Narrower than 'one becomes ? and one becomes loss': with the books already read in the session, the ? case is restored at once. Only the ESPN-disagrees case shows wrong, until the next book read.
  - Its own check: Re-ran late-fill.js: identical. In the real path the book read (14444) sets result and resultSrc=Kalshi with no gradedBy, matching the auditor's fixture. The v2.82/v2.83 loop (9311-9313) compares the start with snap.at (when the app read the fill) and deletes b.result; it checks only manual and autoRes===false, not resultSrc or gradedBy. My variant (own-checks.js 3): settlements already in memory from the same session's book read. The bet ESPN cannot grade is restored in the same pass (setFromSettlement, gradedBy book). The bet ESPN grades differently stays loss with resultSrc Kalshi until the next book read. On open, line 9110 runs autoGradeLog and then syncFills, so it is seconds to a minute.
  - Written decision found: None for fills. Rule broken: 'Never clear saved results to force a regrade' (CLAUDE.md).
  - How often for you: Once per late-read fill. Lasting harm only when ESPN disagrees with the book (a K1 exact line, a misread line or a stat correction) and the next book read does not come (Worker down, or the settlement past the 3-day window before he opens the app again). Novig results are not rewritten by the book read, so a Novig late fill that ESPN grades differently keeps ESPN's answ …
  - Your saved history: Low; mostly healed. Dry-run: bets with resultSrc set to a book name and gradedBy !== 'book' whose result differs from the settlement the Worker returns now (inside its window), and bets with resultSrc set and result '?'.
  - Smallest safe fix: In that loop use Date.parse(b.placedAt) when it is there, else snap.at. Skip any bet with gradedBy book, manual or import, or with a resultSrc. Never delete a result there; drop only the start and let the regrade replace it.
  - Risks in the fix: tests/regrade-old-test.js and tests/lookout-grade-test.js touch these repair loops; re-run both. The v2.82 purpose (undo a match to a game that started well before the bet was placed) must still hold for board bets without placedAt.
  - Tests that pin today's behaviour: regrade-old-test.js, lookout-grade-test.js (related, not pinning this exact case).

### GRADING-9 · Stat names the grader does not know are graded as a different stat instead of being left for the owner

- **Kind / severity (auditor):** bug / S1 · confidence 0.8 · proven by a check that runs
- **Where:** hoopsStat 7383 (only FIRST and DOUBLE are refused), statForMarket 7423 (NHL /ASSIST/ before a goals+assists combo), NFL_STAT_RULES 7340 (rush+rec before TD, COMPLETION before LONG, INTERCEPTION always the passing table), findAthleteStat 7303 (batting table before pitching)
- **Inputs:** Eight probe bets: 1Q Points, 1st Half Points, Fantasy Points, NHL Goals + Assists, NFL Rushing + Receiving Touchdowns, a defender's Interceptions, Longest Passing Completion, a two-way MLB player's Pitcher Strikeouts.
- **The app gives:** Quarter/half/fantasy bets graded on full-game points; Goals + Assists read as assists only (2 instead of 3: loss); rush+rec TDs read as yards (105: win); defender INT read as interceptions thrown (0: loss); longest completion read as number of completions; pitcher Ks read from the batting table (2 instead of 9: loss).
- **Right:** Not gradable ones go to Look out; the others win/lose on the right column.
- **Why:** The first matching pattern wins, and partial-game or unknown wordings fall into a full-game rule.
- **Money effect:** The stake plus the missed win each time ($19.09 on a $10 bet at -110).
- **How often:** Low: none of these names is on the board's own list; they arrive only as a typed stat (+ Add a bet is free text) or a fill's wording.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/props-table.js (rows marked PROBE in props-table.md)
- **Proposed fix (not applied):** Return null for any market matching the app's DERIV pattern or FANTASY; put the combo rules before the single ones; read the pitching table for PITCH markets.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Only typed stats reach it; none come from the Worker, fills or the board.
  - Its own check: Re-ran props-table.js: identical. My own direct calls on ESPN-shaped boxes (own-checks.js 2): '8.5 1Q Points', '12.5 1st Half Points', '12.5 1H Points' and '45.5 Fantasy Points' all return 27, the full-game points. NHL '2.5 Goals + Assists' returns 2 (assists only) while '2.5 Points' returns 3. A defender's '0.5 Interceptions' returns 0 although he caught 1 (nflStat reads passing INT; he is elsewhere in the box, so anywhere=true and 0). From reading NFL_STAT_RULES (7336-7355): 'Rushing + Receiving Touchdowns' hits the RUSH+REC yards rule first. hoopsStat refuses only DOUBLE and FIRST. Checked whether the inputs are real: the Worker's stat names (mine.js K_STAT, Polymarket sportsMarketType, Novig STAT_TYPE) do not produce these wordings. fillDescOk refuses fills marked as part of a game. The board's list does not have them. The Stat box in + Add a bet is fr …
  - Written decision found: None.
  - How often for you: Very rare: he would have to type a quarter, half, fantasy, combined-goal or defender stat by hand. MLB two-way players (Ohtani) are out of season.
  - Your saved history: Dry-run list: settled props with no gradedBy (not manual, import or book) whose market matches /\b(1Q/2Q/3Q/4Q/1H/2H/1ST/2ND/QUARTER/HALF/PERIOD/FANTASY)\b/GOALS?\s*\+\s*ASSISTS/RUSH\w*\s*\+?\s*REC\w*\s*(TD/TOUCHDOWN)/LONGEST\s*(PASS/COMPLETION)/PITCHER/i.
  - Smallest safe fix: Return null (Look out) for markets matching the partial-game or FANTASY pattern the app already knows (marketAliasV1, pinned by tests/v507-test.js u5). Put a NHL GOALS+ASSISTS rule before /ASSIST/, and rush+rec TD before rush+rec yards. Return null for defender interceptions unless the box has an interceptions table.
  - Risks in the fix: tests/v507-test.js pins the alias policy for these names (u4, u5, int rows); keep the grader in step with it. Do not change how NHL 'Points' is read (correct today).
  - Tests that pin today's behaviour: tests/v507-test.js (alias layer), tests/grading-test.js, tests/nhl-shots-test.js.

### GRADING-10 · MLB game called early: totals and run lines are graded on the short score

- **Kind / severity (auditor):** bug / S1 · confidence 0.6 · proven by a check that runs
- **Where:** gradeGameLine 7186 and its callers (no innings check)
- **Inputs:** Constructed ESPN event 'Final/6', NYY 1, BOS 3.
- **The app gives:** Under 8.5 = win, BOS -1.5 = win, BOS moneyline = win.
- **Right:** Moneyline stands (official after 5 innings); totals and run lines are void unless 9 innings (8.5 if the home team leads) are played.
- **Why:** Usual sportsbook rule for shortened baseball games.
- **Money effect:** A void saved as a win or a loss.
- **How often:** A few rain-shortened games a season; MLB is out of season now. ESPN's wording for a called game is an assumption.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/rules.js
- **Proposed fix (not applied):** For MLB totals and spreads grade only when 9 or more innings were played; otherwise leave it for the owner.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.75, re-ran the check: yes)
  - Corrections to the claim: ESPN's wording is now verified: STATUS_FINAL, completed true, 'Final/N', status.period N. The fix must test the period, not the status name.
  - Its own check: Real ESPN shape: I scanned 76 days of MLB 2024 scoreboards (1,026 games) and found 3 called games: TOR@KC 2024-04-25 'Final/5' (period 5), ATL@CHW 04-01 'Final/8' and DET@NYY 05-05 'Final/8'. All are STATUS_FINAL, state post, completed:true; only shortDetail and status.period show the short game. I fed the real TOR@KC event (KC 2, TOR 1) to autoGradeLog: U8.5 win, O8.5 loss, KC -1.5 loss, TOR +1.5 win, KC ML win. The usual sportsbook rule is no action on totals and run lines under 9 innings (8.5 when the home team leads); the moneyline stands after 5. So 4 of the 5 are wrong at a sportsbook.
  - Written decision found: None.
  - How often for you: Zero now (MLB is out of season, and he bets mostly NBA, NHL and NFL). When MLB returns, about 1 in 300 games, and only matters on MLB totals and run lines. Kalshi and Polymarket MLB rules were not checked; their book read would overwrite ESPN's grade anyway.
  - Your saved history: Unlikely (his log starts 10/24, at the end of the MLB postseason). Dry-run: MLB total and spread bets with no gradedBy whose ESPN event has status.period < 9.
  - Smallest safe fix: For MLB totals and spreads, grade only when status.period >= 9; otherwise use the book's settlement or leave it in Look out ('game called early: check the book'). Keep the moneyline.
  - Risks in the fix: Extra-inning games have period > 9 (fine). gameStatusOf must pass period through. Some books settle an Over already won at the stoppage; leaving it for the owner avoids picking a rule.
  - Tests that pin today's behaviour: None.

### GRADING-11 · The 4-hour rule grades a no-start fill against game 1 when it was placed during game 1 for tomorrow's rematch

- **Kind / severity (auditor):** policy / S1 · confidence 0.9 · proven by a check that runs
- **Where:** evOkFor 9209 (t >= at - 4 h), findBetGame 9237
- **Inputs:** A fill with no start time, placed Monday 8 pm (1 h after Monday's tip) on Tuesday's LAL @ DEN.
- **The app gives:** Graded with Monday's game: win.
- **Right:** Tuesday's game: loss. The same fill placed 4.5 h after tip is graded right.
- **Why:** The written rule cannot tell a live bet on tonight's game (which it must grade) from a bet on tomorrow's rematch. Question for the owner: when a fill has no start and the same teams play again within two days, should the app ask instead of guessing?
- **Money effect:** $19.09 on a $10 bet when it happens.
- **How often:** Rare: needs a no-start fill, back-to-back games between the same teams, and a bet placed within 4 hours after the first tip.
- **Check that runs:** /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/grading/which-game.js
- **Second look: By design (your rule)** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The auditor's class 'policy' is right. S1 per hit, but practically S3 given how rarely a fill has no start.
  - Its own check: I re-ran which-game.js: 1 of 11 differs, as claimed. The no-start fill placed Monday 8 pm for Tuesday is graded on Monday. The inputs are the same as those of a live bet on Monday's game, which the rule is meant to grade (fill-noStart-live is right). No rule can tell those two apart from these inputs. Reachability is narrow. The Worker gives a start on almost every fill: Novig startsTs (prop-bet-api src/mine.js 313), Kalshi from occurrence_datetime or the ticker's date (106-126), Polymarket gameStartTime (202). A fill with a start keeps findBetGame to its own day. A no-start fill needs the book to leave the time out.
  - Written decision found: .claude/skills/grading-and-matching/SKILL.md, the rule list: "The 4-hour rule (`evOkFor`): board bets and fills ignore a game that started over 4 hours before the bet; a bet that names its game ... is graded against that game." CLAUDE.md, Working rules: "Board bets and exchange fills can't name their game, so …
  - How often for you: Very rare: NHL home-and-home sets only, and his fills almost always carry a start.
  - Your saved history: Negligible. A suspect bet would be a fill with no start whose b.start was filled in by the grader with a game that tipped off within the 4 h before placedAt, while the same pairing played the next day. (b) autoGradeLog causes it. Nothing corrects it except a Kalshi or Polymarket settlement within syncFills' window.
  - Smallest safe fix: No code fix without the owner's word: it is the written 4-hour rule. Question for the owner: when a fill has no start time and the same two teams play again within two days, should the bet wait in Look out instead of taking the game in progress?
  - Risks in the fix: Changing the rule would stop live bets with no start from being graded; they would go to Look out.
  - Tests that pin today's behaviour: grading-test.js, fill-prior-test.js (the 4-hour rule)

### GRADING-12 · A player whose name has an accent on ESPN is never graded automatically

- **Kind / severity (auditor):** improve / S2 · confidence 0.9 · proven by a check that runs
- **Where:** normName 7325, nameMatch 7326, findAthleteStat 7303 (no accent folding)
- **Inputs:** ESPN 'Jonathan Lekkerimäki' / 'Nikola Jokić' against the bet's plain spelling.
- **The app gives:** Stat not found: the bet goes to Look out.
- **Right:** Graded like any other bet.
- **Why:** Safe failure (no wrong result) but every such bet must be graded by hand; the fill-matching code already folds accents.
- **Check that runs:** node tools/fn.js --expr with statForMarket (output pasted in report.md)
- **Proposed fix (not applied):** Fold accents in both places with normalize('NFD').

### GRADING-13 · The pick'em note says "this app's rules"

- **Kind / severity (auditor):** improve / S3 · confidence 0.6 · by reading only
- **Where:** PK_SETTLE, index.html 12745
- **The app gives:** "Ties, DNPs and cancelled players follow this app's rules, not sportsbook push rules."
- **Right:** Name the pick'em app (PrizePicks etc.), since a newcomer reads 'this app' as the screener.
- **Why:** Wording only.
- **Proposed fix (not applied):** "follow the pick'em app's own rules".

**Checked and found right (13):**

- Game lines (moneyline, spread, total): 114 hand-worked cases across NFL, NBA, NCAAB, NCAAF, WNBA, NHL, MLB, EPL, MLS, UCL; 109 agree, the 5 that differ are the never-played games of GRADING-3 (gl-table.md)
- 30,000 seeded random game lines (9 sports, home and away, half and whole lines, ties, 5,617 pushes): 0 differences from an independent grader
- Spread sign for the away team, favourite and underdog, push exactly on the number, pick'em 0; totals over/under with half and whole lines and pushes
- NFL tie = push on a two-way moneyline; soccer three-way result (a draw loses the team bet, wins the Draw bet), 90 minutes only after extra time or penalties, quarter lines left ungraded; every soccer league in ESPN_MAP is treated as soccer
- Player props: 122 cases over every family the app grades (NBA/WNBA/NCAAB, NFL/NCAAF, NHL, MLB); 96 agree, 18 differ only by K1, 8 are the unusual wordings of GRADING-9 (props-table.md)
- Right box-score column for every real player: 376 reads over 23 stat families in the two real ESPN fixtures, 0 differences; NHL shots come from column S (ESPN's SOG column is all zeros); hockey points = goals + assists; combos are summed right; MLB 6.2 innings = 20 outs
- "N+" is read as Over N - 0.5 (and NO as Under) in gradeBet: by-hand cases plus 30,000 random props
- Did not play, missing from the box score or unknown stat is never a loss by default: the bet stays open in Look out with the reason (books void such bets)
- Which game: 10 of 11 cases right through the automatic grader (consecutive days with a saved start, a bet saved the day before, a game ending after midnight, a typed bet with a chosen day, a bet saved 6 h after tip is not graded)
- A result set by hand is never overwritten (automatic grader, Check results, reload, changed feed, a book settlement saying the opposite); an ESPN push survives a reload; a settled result is kept when the feed changes shape
- Exchange settlements: 10 of 16 cases right to the cent (Kalshi YES/NO win and loss, partly filled order, Polymarket long/short with payout after fee, a settlement for the other side is ignored)
- Sport rules: NHL shootout total counts one extra goal, MLB extra innings count, NBA/NFL overtime counts for totals, spreads and props, soccer is 90 minutes plus stoppage; tennis/MMA/golf are not graded by ESPN in this app
- The six existing grading test files pass on the frozen copy: 38 of 38 checks

**Not checked:**

- Real ESPN answers for a postponed, suspended, forfeited or rain-shortened game (no network): GRADING-3 and GRADING-10 rest on ESPN's known status shapes and need one real reading to confirm
- Soccer player props beyond confirming that a summary without a player table is not graded
- A partial sale on Novig (read only; expected to behave like the Kalshi part sale)
- Whether Kalshi refunds its fee on a void
- Parlays and pick'em entries (graded by hand by design), the AI grade helper, CSV import results, results arriving from another device through sync
- Whether an "N+" row can ever reach the board's own grader (gradeRow)
- The box score of the one real whole-number bet in the export (10/26 Novig PRA Over 25, saved L, $2.78)

**Noticed outside its area:**

- betProfit never reads bookPaid or soldCash although both are saved on the bet (profit area; grading side is GRADING-7)
- lineVal (3486) takes the first number in market + name, so a moneyline on the 76ers or 49ers reads 76 or 49 as its line where it is used (3506)
- checkResultsRun writes result='pending' on old open bets when today's rematch is in progress (same root as GRADING-1)
- The main repo /home/user/ev-bet-screener already had one uncommitted change before this audit (agent-notes/easy-mode-findings_2026-11-21_v1.md); not touched by me

## prices: the inputs to everything (price parsing, the MODEL chance, the MARKET chance, vig removal p …

### PRICES-1 · "Consensus odds" typed in + Add a bet is used as the market chance with the vig still in (the screen calls it no-vig)

- **Kind / severity (auditor):** bug / S1 · confidence 0.92 · proven by a check that runs
- **Where:** abRowFields, index.html line 12947 (cons = toProb(consRaw) -> mktProb: cons); shown by abUpdate94 as "Market 55.0% (-122) no-vig (consensus)"
- **Inputs:** + Add a bet > Model numbers: Cover probability 58, Consensus odds -122 (the other side of that consensus is -102), price -110 at DraftKings (no fee), bank $1,000, defaults. Second case: Cover 55, Consensus -120 (other side +100), price -110.
- **The app gives:** Case 1: market 54.95% (= 122/222, one side's raw price), her chance 56.02%, EV +6.95%, "BET $9.55", "Pay up to 55.2% (-123)". Case 2: market 54.55%, her 54.70%, EV +4.44%, "BET $6.09".
- **Right:** Case 1: market = 54.95 / (54.95 + 50.50) = 52.11%; her chance = 52.11 + 0.35 x (58 - 52.11) = 54.17%; EV = 54.17 / 52.38 - 1 = +3.42%; stake = 1000 x 0.25 x (0.0342 x 0.5) / 0.909 = $4.71; most to pay = 54.17 / 1.015 = 53.4% (-114). Case 2: market 52.17%, her 53.16%, EV +1.49% = under the 1.5% floor: a Watch, no stake.
- **Why:** docs/EV-CALCULATOR.md section 1 defines the market chance as "what the betting market says, vig removed"; every loader removes it and the verdict text itself prints "no-vig". Only this typed box skips it. A raw price is always above the no-vig chance, so whenever the model is above the market the error pushes her chance, the EV, the stake and "Pay up to" too HIGH (never the safe direction). No written decision covers it (searched memory/history.md, decisions, docs).
- **Money effect:** Stake doubled ($9.55 vs $4.71 on one bet); the app says OK up to -123 where the right limit is -114 (at -120 the bet is really worth -0.7%). Case 2 turns a no-stake Watch into a $6.09 bet. The wrong market number is also saved on the bet (mkt, snap.market), so Reports' model-vs-market comparison gets a biased market for these bets.
- **How often:** Every hand-added bet where the optional Consensus odds box is filled. The help says "Copy what the app shows ... consensus is the market check", and what BettingPros shows is one side's raw consensus price. Board rows are NOT affected (the Worker de-vigs both sides).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/prices/t4-consensus.js  -> "app market chance: 54.95% = 122/222, the vig still in / right 52.11% ... app EV 6.95% / right 3.42% ... stake app $9.55 / right $4.71 .. …
- **Proposed fix (not applied):** Ask for both consensus prices (this side and the other side, as the card's Consensus tile already shows them: "O -122 / U -102") and use pa / (pa + pb). With only one side typed, do not use it as the market: treat the bet as "no market check" (smallest stake) and say so.
- **Second look: Confirmed** (severity S1, confidence 0.93, re-ran the check: yes)
  - Corrections to the claim: Answer to instruction (a). The box was meant to take a one-sided raw price, so the bug is the missing de-vig plus the 'no-vig (consensus)' label, not the kind of number typed. The evidence: the label is 'Consensus odds', the placeholder is 'e.g. -122', the help says 'Copy what the app shows ... consensus is the market check', and the card's own Consensus tile shows raw prices for both sides ('O -122 / U -102', built from consOdds and consOtherOdds). BettingPros shows the same: one raw price per side. So a person copying from BettingPros types one side' …
  - Its own check: I ran k1-consensus.js with my own numbers on the real form: Cover 56, Consensus odds -110 (other side also -110, so the no-vig market is exactly 50.00%), FanDuel +100. The app's market chance is 52.38%, which is -110 with the juice still in. The Worker's de-vig, as the board uses it, gives 50.00%. The app's own chance is 53.65% and the screen says 'BET $9.11, +7.3% net ... Market 52.4% (-110) no-vig (consensus)'. Worked by hand: own chance 50 + 0.35 x 6 = 52.10%, EV +4.20%, stake 1000 x 0.25 x 0.5 x 0.042 / 1 = $5.25. The auditor's two cases also check out by hand: market 52.11%, own chance 54.17%, EV +3.42%, $4.71; and EV +1.49%, under the floor. Code: abRowFields line 12947 sets mktProb straight from toProb(consRaw); abFair passes it on as mkt.
  - Written decision found: None. There is nothing on abCons or this box in memory/history.md, memory/decisions/, docs/EV-CALCULATOR.md or memory/incidents/. docs/EV-CALCULATOR.md defines the market chance as having the vig removed, and the Worker de-vigs the same consensus pair for board rows (prop-bet-api src/index.js lines 316-321).
  - How often for you: Only on bets added by hand where he opens the folded 'Model numbers' section and fills the Consensus odds box. Board bets, exchange fills and 'I bet this' from a board row are not affected. How often he does it cannot be seen here; probably a small share of his 25 to 40 bets a day. When it happens it always pushes the chance, the EV, the stake and 'Pay up to' too high ( …
  - Your saved history: Saved bets can already hold the wrong market. addToLog stores consOdds (the typed text) and snap.market (the chance that was used). Read-only dry-run: list logged bets with src 'manual', consOdds set, and snap.market equal to toProb(consOdds). Each of those used the raw price. For each, show the stake and what the market would have been at a typical margin (the other side was never saved, so this can only be an estimate). The owner then approves any change bet by bet; snap stays as it is.
  - Smallest safe fix: Add an 'Other side' consensus box and use pa / (pa + pb), with the same 0.98 to 1.25 sanity check the Worker uses. With only one side typed, do not use it as the market: treat the bet as 'no market check' (held to the smallest bet) and say so. Do not guess a margin. Test: Cover 56, Consensus -110 with other side -110, FanDuel +100 must show Market 50.0% and BET $5.25 (fails today with $9.11). With one side only, the bet must be held to the minimum.
  - Risks in the fix: tests/v511-test.js lists abCons among the form fields it reads and clears, so a new box must be added there too. abRowFields saves consOdds, and addToLog keeps it, so the new other-side field must also be added to addToLog's field list, or it is dropped. Hand bets with one side typed will get smaller stakes ( …
  - Tests that pin today's behaviour: None pins the raw use. tests/v511-test.js only reads and clears the abCons field.

### PRICES-2 · "What should I bet?" lets a thin exchange book (one thinQ calls "not a price") set the fair chance, turning a SKIP into a full-size BET

- **Kind / severity (auditor):** bug / S1 · confidence 0.88 · proven by a check that runs
- **Where:** abAsk, index.html lines 14701-14704 (mids.push((x.q.price+x.q.bid)/2) for every quote, no thinQ test) -> abFair line 14672 (fair = X.mid) -> abUpdate94 (line 14723 isOut = !FA.ex && ...; line 14746 noMkt: ms==null && !FA.ex)
- **Inputs:** + Add a bet, NBA prop Over 24.5 Points, no cover % typed, Novig price 50%. Exchange answers: Novig ask 50.0 / bid 49.0; Kalshi ask 65.0 / bid 43.5 (the owner's own v5.21 Mamukelashvili shape: 21.5 points between ask and bid).
- **The app gives:** Fair = average of the two middles = (49.5 + 54.25) / 2 = 51.88% -> "BET $4.68 — +3.8% net ... at Novig", sized by full Kelly (an exchange-middle fair is not held to the smallest bet) and with the outlier test switched off for it.
- **Right:** With the thin book left out, fair = 49.5% -> "SKIP — you'd lose 1.0% on average" (the same script's first run shows exactly that).
- **Why:** v5.21 (memory/history.md line 909) decided a live exchange price more than 10 points over its own bid "never fills I bet this, is not 'Novig now', and is left out of best odds and the hold". The middle of a 43.5 / 65 book only says "somewhere between 43 and 65"; it should not be half of the fair chance. This path was not covered by that fix.
- **Money effect:** A $4.68 bet that the tight book alone prices at -1.0% (about 5 cents expected loss here), but the direction is the dangerous one (SKIP becomes BET) and the stake grows with the false middle, limited only by the max bet.
- **How often:** Whenever one of the three exchanges lists the prop with a wide book and the owner uses What should I bet? without a cover % (the form also asks by itself 1.2 s after any change, lines 14937-14938). Thin prop books on Kalshi and Novig are common.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/prices/t8-thinmid.js  -> "Novig alone ... middle 49.50% ... verdict: SKIP — no edge — you'd lose 1.0%" then "plus a THIN Kalshi book: ask 65.0 / bid 43.5 ... middle …
- **Proposed fix (not applied):** In abAsk skip a quote when thinQ(x.q) before pushing its middle (both the me and op lists). Question for the owner, not a fix: should a fair chance that comes only from exchange middles be sized like "no market check" (smallest bet)? Today it gets the full Kelly stake and no outlier test.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.82, re-ran the check: yes)
  - Corrections to the claim: 'Sized by full Kelly' really means the normal quarter-Kelly stake with the 0.5 haircut, not held to the smallest bet. It is not full Kelly. The 'right' answer (fair 49.5%) is the app's own v5.21 rule carried over to this path; nobody knows the true chance. Narrower than claimed: it needs no cover % typed, no board row for that bet (abFair takes the board row first), and at least one exchange listing it with a book more than 10 points wide. The Kalshi line is also listed in the verdict at -22.1%, so the thin book is visible, but it still moves the fair  …
  - Its own check: Code read: abAsk (lines 14701-14702) pushes the middle (price + bid) / 2 for every quote with a bid above 0, on both the me and op lists, with no thinQ test. thinQ (line 13206) and its v5.21 users at lines 4315, 6786, 6811, 6813 and 6814 all leave thin quotes out, but abAsk does not. abFair (line 14672) uses X.mid as the fair chance only when there is no cover % and no board row. Then ex=true, which switches the outlier test off (isOut is !FA.ex) and sets noMkt false, so the bet is not held to the minimum. The Worker's /live answers do carry bid for Kalshi, Novig and Polymarket (prop-bet-api src/live.js lines 164, 215, 332), so the input shape is real. The auditor's run reproduces: SKIP (fair 49.5%) without the thin book, 'BET $4.68, +3.8% net' with a 65.0/43.5 Kalshi book (thinQ true). Hand check of $4.68: fair 51.875%, EV 3.75%, 1000 x 0.25 x 0.5 x 0.037 …
  - Written decision found: memory/history.md line 909 (v5.20 / v5.21): thinQ, 'a live exchange price more than 10 points over your own side's bid ... never fills I bet this, is not "Novig now", and is left out of best odds and r.sh (the hold)'. It does not mention abAsk. This is a gap in that decision, not a choice to keep abAsk as it  …
  - How often for you: Only for + Add a bet bets with no cover % and no board row. The form asks the exchanges by itself 1.2 seconds after any change (abScheduleAsk). Thin Kalshi and Novig prop books are common, so it can happen on some hand-added props, but most of his bets come from the board or from fills, which this path does not touch.
  - Your saved history: A bet saved after this verdict keeps snap.evModel 'exchange' (addToLog line 7848) and snap.model equal to the middle used. The quotes themselves are not saved, so the log cannot show which ones were thin. Read-only dry-run: list bets with snap.evModel === 'exchange' and src 'manual' for the owner to look over. It cannot say for sure which were affected.
  - Smallest safe fix: In abAsk, skip a quote when thinQ(x.q) before pushing its middle, on both the me and op lists. If every quote is thin, mid is null and the verdict says 'Can't judge it yet' (the safe direction). Test: the t8 shape (Novig 50/49 plus Kalshi 65/43.5) must give SKIP, which fails today with BET $4.68. Separate question for the owner, not a fix: should a fair chance that comes only from exchange middles be held to the smallest bet?
  - Risks in the fix: Low. tests/v521-novig-thin-test.js covers the card path and should still pass. tests/v510-test.js line 137 sets abX by hand with mid null and is not affected.
  - Tests that pin today's behaviour: None pins the inclusion of thin quotes in abAsk.

### PRICES-3 · The editor's Odds box accepts text that is not a price and reads it as a different price (a typographic minus becomes a plus)

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** toProb, index.html line 3231 (strips every character that is not a digit, +, - or . and accepts any number, even under 100), behind priceText(...).replace(/^(\d)/,'+$1') in the bet editor: Save lines 6834-6838, the value check 6696, + Add a bet 12963, the To win link 6520
- **Inputs:** + Add a bet, DraftKings, $10, saved as a WIN, Odds box typed: "−110" (U+2212, the minus a sportsbook web page prints; copy and paste), "–110" (en dash), "1,91" (decimal comma), "5/2", "2" or "3" (decimal odds with no point), "0.52", "52", "-50", "+99".
- **The app gives:** "−110" and "–110" are saved as written and read as +110 (47.62%): profit recorded $11.00. "1,91" -> +191 (34.36%), $19.10. "5/2" -> +52 (65.79%), $5.20. "2" -> +2 (98.04%), $0.20. "0.52" -> 99.48%, $0.05. "52", "-50", "+99" are accepted as prices (65.8%, 33.3%, 50.25%). With a 50% model typed, "-110" gives "SKIP — you'd lose 4.5%" but pasted "−110" gives "BET $1.00 — +5.0% net ... at DraftKings 47.6% (+110)".
- **Right:** -110 is 52.38% and a $10 win pays $9.09 whichever dash draws the minus; 1,91 is 52.36% ($9.10); 5/2 is 28.57% ($25.00); decimal 2 and 3 are 50% and 33.3% ($10, $20); an American price under 100 in size does not exist and should be refused with the existing "Type the odds (e.g. -110 or +120)..." message.
- **Why:** A price read wrong is a wrong bet. The Paste box already converts typographic minus signs (cleanPaste, line 3334), which shows the app has met them; the editor does not. The placeholder promises "-110 · 1.91 · 52%".
- **Money effect:** A won $10 bet at -110 recorded as +$11.00 instead of +$9.09 (+$1.91 on the money total, the ROI and the CLV of that bet); the value check flips from SKIP (-4.5%) to BET (+5.0%). The screen does echo "(+110)", which a careful eye can catch.
- **How often:** Only when a price is pasted from a page that uses a typographic minus, or typed in a format the box does not know. Typed with the keyboard's own hyphen it is always right. Same family, smaller (adds to K3): a percent or decimal typed here is stored as the nearest whole American price, so the saved chance drif …
- **Check that runs:** node .../audit/prices/t1-parse.js (49 formats through the parser; 19,802 whole American prices round-trip with 0 failures), t2-editor.js (the real screen: "−110" saved as "−110", chance 47.62%, profit $11 vs right $9.09; "1,91" $19.1; "5/2" $5.2; " …
- **Proposed fix (not applied):** In the editor's reading only: run the text through the same dash clean-up as cleanPaste, then refuse anything that is not EVEN, a %, a decimal with a point above 1.00, or a whole American price of 100 or more in size.
- **Second look: Confirmed** (severity S1, confidence 0.92, re-ran the check: yes)
  - Corrections to the claim: Answer to instruction (b), the practice data: none of the 16 practice bets (tests/practice-fixtures.js LOG_ROWS: -115 -110 +102 -120 +105 -135 -112 -105 +108 -108 +500 +200 -122) is affected. The dash case is the realistic one. Decimal '2' or '3', '5/2' and '1,91' are unlikely for a US bettor but are read just as wrongly. The '(+110)' echo shows in + Add a bet's verdict; the Bet log editor's form shows nothing.
  - Its own check: k3-paste.js pastes into the real boxes. (1) + Add a bet, DraftKings, $10, WIN, pasted '−110' (the box holds U+2212 then 110): saved odds '−110' (character codes 2212 31 31 30), snap.price '−110', chance 47.62%, profit $11.00; the right answer is $9.09. (2) Bet log edit of a saved -110 bet, pasted '−110' over it: saved '−110', profit $11.00, and the edit form shows no warning. (3) The Paste-board path is safe: cleanPaste turns '−110' and '–105' into '-110' and '-105'. Code read: toProb (line 3231) strips every character that is not a digit, +, - or a dot, so U+2212 disappears and 110 reads as +110. Nothing refuses a size under 100. The auditor's t2 and t10 runs reproduce exactly. Typed '-110' with model 50% gives SKIP -4.5%; pasted '−110' gives BET $1.00 +5.0%.
  - Written decision found: None. cleanPaste (line 3332) already converts these dashes on the Paste board, so the app has met them before. The editor's placeholder promises '-110 · 1.91 · 52%'.
  - How often for you: Rare. Only sportsbook bets added by hand where the price is copied from a web page that uses a typographic minus. Exchange bets (Kalshi, Novig, Polymarket) use the @ % box; board and fill bets fill the odds in themselves. When it does happen, it changes a saved profit (for example +$1.91 on a $10 win at -110) and can flip SKIP to BET.
  - Your saved history: Yes, if he ever pasted such a price. The saved odds text keeps the odd character, so a read-only list finds them: logged bets whose odds text, trimmed, has a character other than a digit, '+', '-' or '.' (leaving out EVEN, EV and PK), or whose number is under 100 in size. k3-paste.js part (4) does exactly that. Show date, name, odds, stake and result, so he can confirm each one and correct it by hand.
  - Smallest safe fix: In the editor's reading only (priceText or its callers at lines 6696, 6834, 12963 and the To win link at 6520), first change U+2212, U+2012-2015, U+FE63 and U+FF0D to '-', as cleanPaste does. Then refuse anything that is not EVEN, a %, a decimal with a point above 1.00, or a whole American price of 100 or more in size, using the existing 'Type the odds (e.g. -110 or +120)...' message. Test: a pasted '−110' must save as '-110' with a $9.09 win (fails today with $11), and '52' or '+99' must be refused.
  - Risks in the fix: Change the reading only; never rewrite saved bets automatically. Opening an old bet whose odds are not a real price would then refuse to save until he corrects it (acceptable, and it makes him look). Exchange bets use the % box and store prices of 100 or more in size, so the size check does not hit them. toPr …
  - Tests that pin today's behaviour: None pins the dash or small-number reading. tests/bugfix-money-test.js and the v524-* tests call toProb with clean prices only.

### PRICES-4 · In a game with a Draw, both team moneylines are thrown out as "both sides sum to 74%, juice left in"

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** pairUp, index.html lines 3496-3514 (else if(da==='ML'&&db==='ML') match = a.name!==b.name) and the tolerance test in auditCore line 3737 (Math.abs(r.pairSum-1)>cfg.devig -> flag out). Note: cfg.devig is not a de-vig method, it is this tolerance (2%); the only method is proportional scaling (Settings says "Mul …
- **Inputs:** An EPL game through the real The Odds API loader: Pinnacle Arsenal -105 / Chelsea +290 / Draw +270; Bovada (a book I bet) Arsenal +112, Chelsea +300, Draw +275.
- **The app gives:** The three fair chances are right (49.30 + 24.68 + 26.02 = 100.00%) and Arsenal at +112 is +4.52% EV, but the row is OUT: "both sides sum to 74.0%, juice left in", stake $0. The same shape in the NBA passes ("devig clean at 100.0%", BET $3.11).
- **Right:** In a 3-way market the two teams are not "both sides": they add to 100% minus the draw. Arsenal +112 should be judged on its +4.52% like any other row.
- **Why:** The pairing rule was written for two-way games. Nothing is wrong with the fair price, and the message blames the price. No written decision or test covers it (searched history, decisions, incidents, tests; tests/sources-test.js builds soccer, MMA and cricket games with a Draw but never checks that a team row can pass).
- **Money effect:** No money lost: a missed bet. Every team moneyline in a draw sport (soccer, and boxing / MMA / cricket when the Draw is more than 2%) is silently unbettable from the board. The Draw row itself is not paired and can still pass.
- **How often:** Every 3-way game loaded from The Odds API or SportsGameOdds (both list every side); from the Sportsbook API only when both teams are picks in the same load.
- **Check that runs:** node .../audit/prices/t13-pairsum.js  -> "Arsenal Bovada +112 fair 49.30% EV 4.52% / pair sum 74.0% / pass false stake $0.00 / both sides sum to 74.0%, juice left in" ... "NBA: Boston Celtics Bovada -135 fair 58.51% EV 1.84% / pair sum 100.0% / pas …
- **Proposed fix (not applied):** In pairUp do not pair two moneylines when the game has a Draw row or isSoccer(sport) (or add the Draw row's chance to the sum when it is on the board).
- **Second look: Confirmed** (severity S2, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The claim says the Draw row 'is not paired and can still pass'. That depends on order: when the Draw row comes first in the game's list, the Draw and one team are paired and blocked, and the other team escapes. Answer to instruction (c): soccer is fully wired in (SOCCER set line 7052, OA_SPORTS EPL and other leagues, SGO_LEAGUES MLS and UCL on the free plan, threeWay in oaToRows lines 10727-10740 and in sbToRows line 10607). There is no sign that the owner loads soccer: his sports are NBA, NHL and NFL, and the sport menu needs a soccer league picked. N …
  - Its own check: k4-threeway.js uses my own MLS game: Pinnacle Galaxy +150, Sounders +170, Draw +240, no-vig 37.58 / 34.79 / 27.63 (adds to 100%); Bovada Galaxy +180, which is +5.21% EV by hand. Through the real oaToRows (The Odds API) and audit(): Galaxy actNet 5.21%, pass false, stake $0, out 'both sides sum to 72.4%, juice left in'. Through the real sgoToRows (SportsGameOdds, ml3way, periodID reg, the way the loader reads soccer) the result is the same. With the SGO odds in the order draw, home, away, the Draw is paired with the Galaxy (65.2%) and both are out, while the Sounders row goes unpaired. The auditor's t13 (EPL at Bovada) reproduces as written. Code: pairUp line 3514 (ML with ML when the names differ), and the tolerance check in auditCore at line 3737.
  - Written decision found: None. The only origin is the v2.44 comment inside pairUp (written for Over/Under pairs). memory/history.md has no entry for pairUp, pairSum or 'juice left in'. Nothing in memory/decisions/ or docs/EV-CALCULATOR.md covers 3-way pairing.
  - How often for you: Close to never for him today. It only matters if he loads a soccer league, or a fight or cricket game with a Draw price. It is a missed bet in the safe direction, never a wrong stake.
  - Your saved history: None. The rows are blocked (a missed bet); nothing wrong is saved.
  - Smallest safe fix: In pairUp, do not pair two moneylines (or a moneyline with a Draw) when the game's list holds a Draw row or isSoccer(r.sport). Alternatively, add all three when all three are on the board. Test: the k4 or t13 game must give Galaxy (or Arsenal) at Bovada pass true with no 'juice left in' flag (fails today), and an NBA pair must still say 'devig clean at 100.0%'.
  - Risks in the fix: Low. oaToRows already rejects a 2-way line in a 3-way game and needs full 3-way sets, so the tolerance check is not the only guard there. tests/sources-test.js and v480-test (Draw rows) should be run.
  - Tests that pin today's behaviour: None. grep finds no 'juice left in', pairSum or pairUp in tests/. tests/sources-test.js builds 3-way games but never checks that a team row can pass.

### PRICES-5 · Sportsbook API: the fair chance can be an unlabelled estimate (a guessed 4.5% / 6% margin), or a wrong "exact" built from two numbers that are not the two sides

- **Kind / severity (auditor):** bug / S2 · confidence 0.6 · proven by a check that runs
- **Where:** sbToRows, index.html lines 10601-10605 (the averages map keyed by market key) and 10620-10624 (fair = avg/sum when the set has 2 or 3 entries, else avg/1.045 or avg/1.06); sbHow is set at lines 10520 and 10632 and read nowhere
- **Inputs:** Constructed feed answers (I have no saved real answer of this feed): (a) one side only, average 58%; (b) the SAME team at two spread lines under one market key: -3.5 at 52% and -5.5 at 44%.
- **The app gives:** (a) 55.50% (= 58 / 1.045), stored as sbHow "estimated (typical 4.5% margin)" but nothing on screen reads sbHow, so the card says "consensus no-vig". (b) 54.17% and 45.83%, labelled "exact (all 2 sides)".
- **Right:** (a) Unknown without the other side: 55.77% if the books hold 4%, 54.21% if they hold 7% (1.3 points lower, about 2.5 points of EV at -110); it should be shown as an estimate. (b) The two numbers are one team at two lines, not two sides: with a normal margin the -3.5 line is about 49.8%, so the app is 4.4 points too high (a false +EV).
- **Why:** The policy says the market chance has the vig removed; a guessed margin is not that, and the row already knows it is a guess but never says so. In (b) the "complete set" test counts entries instead of checking they are opposite sides at mirror lines (the The Odds API loader does check).
- **Money effect:** (a) up to about 2.5 points of EV overstated on a pick whose other side is missing; these rows have model = market, so the stake follows it. (b) a 4.4-point false edge if the feed sends that shape.
- **How often:** (a) whenever the feed lists a pick without the other side's average. (b) only if one market key carries several spread lines in one load; the totals code already adds the line to the key, which suggests keys do span lines, but I could not see a real answer. Severity becomes S1 on any load where (b) occurs.
- **Check that runs:** node .../audit/prices/t3-loaders.js (section Sportsbook API)  -> "one side only (58): app 55.50% = 58 / 1.045 / estimated (typical 4.5% margin) / if the books really hold 4% it is 55.77%, at 7% it is 54.21%" and "the same team at -3.5 (52) and -5.5 …
- **Proposed fix (not applied):** (a) show sbHow on the card's Market tile and treat an estimated fair as "no market check" (smallest stake). (b) for spreads require the two entries to be different teams at mirror lines and the sum to sit between 1.00 and 1.20, else fall back to the estimate.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.6, re-ran the check: yes)
  - Corrections to the claim: (a) The guess is not biased one way: a 4.5% margin can be too high or too low, so the error is plus or minus, not 'up to 2.5 points overstated'. The proven defect is that the estimate is unlabelled and sized like a de-vigged price. (b) is UNVERIFIABLE (instruction d): no real Sportsbook API /v0/advantages answer is saved anywhere. agent-notes/for-augi-worker-api_2026-11-12_v1.md says 'no real /v0/ response is saved in either repo'. The SB fixture in tests/sources-test.js and that note's example are both made up, and prop-bet-api/test has no Sportsbook  …
  - Its own check: k5-sbapi.js runs the real sbToRows on the documented shape. (a) With one side only (average 58%), fair is 55.50% = 58 / 1.045 and sbHow says 'estimated (typical 4.5% margin)'. grep shows sbHow is written at lines 10520 and 10632 and read nowhere, so the card's Market tile says 'consensus no-vig' (line 6337). (b) With the same team at -3.5 (52%) and -5.5 (44%) under one market key, fair is 54.17% and labelled 'exact (all 2 sides)', because the spread key leaves out the line and the slot count reaches 2. The by-hand figures match.
  - Written decision found: None as an owner decision. The 1.045 / 1.06 estimate is only described, as behaviour, in agent-notes/for-augi-worker-api_2026-11-12_v1.md line 180. memory/history.md has no sbToRows entry.
  - How often for you: One Sportsbook API call per load; game lines only, no player props. Mostly not his bet type (props), so it is a minor share of his bets.
  - Your saved history: Bets taken from these rows store snap.evModel 'market' and snap.market equal to the fair used, but sbHow is not saved, so the log cannot tell estimated from exact. A dry-run can list bets whose board row came from the Sportsbook API (src or apiKey starting 'sb-'), for him to look over.
  - Smallest safe fix: (a) Show sbHow on the Market tile and treat an estimated fair as 'no market check' (smallest stake). (b) Only after a real answer is seen: for spreads, require the two entries to be different participants at mirror modifiers with a sum between 1.00 and 1.20, else use the estimate. Test: a one-side pick must show 'estimated' and stake at the minimum (fails today).
  - Risks in the fix: Holding estimated rows to the minimum will shrink or remove Sportsbook API picks if most real answers are one-sided. That is a stake change, so ask the owner first.
  - Tests that pin today's behaviour: tests/sources-test.js (SB 3-way fixture, Belgian league kept under its own code). Nothing pins sbHow or the spread-key pairing.

### PRICES-6 · Whole-number lines: the EV formula (chance / price - 1) has no push in it

- **Kind / severity (auditor):** policy / S2 · confidence 0.7 · proven by a check that runs
- **Where:** auditCore line 3705 (r.gross = r.fairProb/r.offeredProb - 1), actNetOf line 13362; every loader passes whole-number lines through unchanged
- **Inputs:** "Over 5 Rebounds" at -110 (a $10 bet pays $9.09); 10% of games land exactly on 5; truth 50% win / 10% push / 40% lose.
- **The app gives:** The row is screened and staked like any other (pass, $8.34 with a 55.56% chance). If the chance it is given means "wins outright" (50%): EV -4.55% = -$0.45, a skip. If it means "wins when it does not push" (55.56%, which is what a de-vigged market price is): EV +6.06% = +$0.61.
- **Right:** True expected profit = 0.50 x $9.09 - 0.40 x $10 = +$0.55 (+5.45%). So the app is off by -$1.00 per $10 in the first reading (exactly the push chance: a good bet is skipped) and by +$0.06 per $10 in the second (a factor 1 / (1 - push chance); the Kelly stake is not affected in that case).
- **Why:** The formula assumes every bet wins or loses. The market chance (two prices de-vigged) is always the second kind; I could not confirm which kind BettingPros' model chance is on a whole-number line, and if it is the first kind the blend mixes two definitions on those rows. The hold label already knows (shIdent: a whole-number line can push); the EV does not.
- **Money effect:** About 6 cents per $10 overstated on de-vigged game lines at whole numbers (NFL -3, 44); up to $1.00 per $10 understated (missed bets) if the model source sends "wins outright".
- **How often:** NFL spreads and totals on whole numbers and some props; most player props are on half numbers and are not affected.
- **Check that runs:** node .../audit/prices/t7-push-ages.js (first section)  -> "truth: 50% win, 10% push, 40% lose -> expected profit $0.55 (5.45%) / app, wins outright (50%): EV -4.55% = $-0.45 -> off by $-1.00 / app, wins when it does not push (55.56%): EV 6.06% = $0 …
- **Proposed fix (not applied):** A question for the owner, not a fix: on whole-number lines show "push possible: EV is approximate", and ask the model source which chance it sends. K1 (a push graded as a loss) is the grading side of the same thing.
- **Second look: Confirmed** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: None to the numbers. A de-vigged two-way market price is the 'wins when it does not push' kind, so for market-driven rows the error is only about 6 cents per $10. Which kind BettingPros' cover_probability is on a whole-number line is still unknown.
  - Its own check: Facts: auditCore line 3705 is r.gross = r.fairProb / r.offeredProb - 1, and actNetOf (line 13362) is ((q / price - 1) - f) / (1 + f). Neither has a push term. Dollars by hand for $10 at -110 (pays $9.0909), with 50% win, 10% push, 40% lose: 0.5 x 9.0909 - 0.4 x 10 = +$0.545 (+5.45%). Using 50% gives 0.5 / 0.52381 - 1 = -4.55% (-$0.45), off by -$1.00. Using 55.56% (= 0.5 / 0.9) gives +6.06% (+$0.61), off by +$0.06, which is a factor of 1 / (1 - 0.1). Kelly with a push: maximising p ln(1 + bf) + q ln(1 - f) gives f = (pb - q) / (b(p + q)), which is ordinary Kelly on the chances given no push. The app's stake, net / b with net = p'/price - 1, is therefore unaffected in the second reading, as the claim says. Rerun t7: stake $8.34 = 1000 x 0.25 x 0.5 x 0.0607 / 0.909.
  - Written decision found: No written decision on the EV side. A related open item: index.html line 5605 says 'a whole number can push, and the grader counts a push as a loss until the owner decides', and line 4299 (shIdent) already knows that whole-number lines can push. This is a question for the owner, not by design.
  - How often for you: Rare. His props are mostly on half-point lines; Kalshi and Novig 'N+' markets are yes/no with no push. It touches NFL spreads and totals on whole numbers and a few sportsbook props.
  - Your saved history: None from the EV side (no saved result changes). Grading a push as a loss is K1's matter.
  - Smallest safe fix: A question for the owner, as the auditor says: show 'push possible: EV is approximate' on whole-number lines, and ask which chance BettingPros sends. No formula change without his word.
  - Risks in the fix: A label only, so no stake change. Changing the formula would touch the frozen math (actNet), which needs the owner's go.
  - Tests that pin today's behaviour: None about pushes in EV. tests/math-audit-test.js and invariants-test.js pin the current formula.

### PRICES-7 · A price stamped in the future counts as "read 0 s ago" (a device clock running slow makes saved answers look fresh)

- **Kind / severity (auditor):** bug / S3 · confidence 0.8 · proven by a check that runs
- **Where:** ringOf check 5, index.html line 4394 (age = at ? Math.max(0, Date.now()-at) : null); the score's Fresh part; rowSeenAt line 5053
- **Inputs:** A saved Worker answer (BettingPros "from cache", a cached Sportsbook API answer) is stamped with the Worker's clock (line 11092) and compared with the device clock. Device 10 minutes slow.
- **The app gives:** A price really 15 minutes old shows "fresh: price read 5m ago" and passes check 5; a stamp in the future shows "fresh: price read 0s ago", score Fresh 20/20. Device 10 minutes fast: a 2-minute-old saved answer fails check 5 (the safe direction).
- **Right:** A time in the future is not a read: it should say "price time unknown: re-check", as the hold label already does (shAssign: at>now+60e3).
- **Why:** Age = device time minus Worker time, so a slow device clock subtracts from every saved answer's age; the clamp to 0 hides it. A fresh (not cached) load is stamped with the device clock and is not affected. The 12-hour Old rule and the 3-minute / 90-second rule behave exactly as written (boundaries run: 12.0 h not old, 12.01 h old; 180 s fresh, 181 s stale; 90 s / 91 s within 5 minutes of the start).
- **Money effect:** None directly: the ring and the score are labels. Phones keep their clocks within seconds, so this is rare.
- **How often:** Only with a device clock minutes off AND a saved (cached) answer.
- **Check that runs:** node .../audit/prices/t7-push-ages.js (section check 5)  -> "stamp 8 min in the FUTURE ... check 5: true / fresh: price read 0s ago / score Fresh 20/20" and "stamp 5 min ago (device 10 min slow, price really 15 min old) check 5: true"
- **Proposed fix (not applied):** In ringOf (and the score's age) treat a stamp more than one minute in the future as an unknown time.

### PRICES-8 · The Odds API consensus averages in a book whose own two sides do not add up (no sanity range)

- **Kind / severity (auditor):** improve / S3 · confidence 0.75 · proven by a check that runs
- **Where:** oaToRows, index.html around line 10745 (if(!(sum>0)) return; is the only test)
- **Inputs:** Three sportsbooks on Miami (-120/+100, -118/-102, -125/+105) plus an exchange quoted 40c / 40c (the two sides add to 80%), no Pinnacle price.
- **The app gives:** The exchange is scaled to 50 / 50 and averaged in: Miami 51.79%.
- **Right:** Without the broken book: 52.39%. The Worker already uses a range for the same job (0.98 to 1.25 for props, 1.00 to 1.20 for game lines).
- **Why:** A two-sided total far from 100% is a stale or one-sided quote, not a market opinion.
- **Money effect:** 0.6 points of market chance in this example; only with "+ exchanges" ticked and no Pinnacle price.
- **How often:** Rare.
- **Check that runs:** node .../audit/prices/t3-loaders.js  -> "Miami with the 40c/40c exchange left out would be 52.39% (the app averages it in: 51.79%)"
- **Proposed fix (not applied):** Skip a book whose sides add to under 1.00 or over 1.20 (3-way: the same idea on three sides).

### PRICES-9 · "Check market odds" can tag a row with another line's price, and drops the plus sign

- **Kind / severity (auditor):** bug / S3 · confidence 0.85 · proven by a check that runs
- **Where:** extractOddsApiPrice, index.html line 7569 (no comparison of out.point with the row's line); tag at line 4651 (fmtOdds(String(price)))
- **Inputs:** Row "Over 6.5 K"; DraftKings has Over 6.5 at -115, FanDuel has Over 7.5 at +150.
- **The app gives:** The tag "Market: 150 (FanDuel)".
- **Right:** "Market: -115 (DraftKings)": the row's own line, with its sign.
- **Why:** The best price is taken for the player and side across books without checking the line.
- **Money effect:** None (a label). The tool sits inside the hidden Paste tab and is off by default.
- **How often:** Rarely reachable today.
- **Check that runs:** node .../audit/prices/t12-oddscheck.js  -> {"row":"6.5 K Over","got":{"price":150,"book":"FanDuel","point":7.5},"tag":"Market: 150 (FanDuel)"}
- **Proposed fix (not applied):** Require out.point === lineVal(r); format with fmtOdds(Number(price)).

### PRICES-10 · Ideas: one price reader for everything typed, say where the market chance came from, and size an estimated or one-sided market like "no market check"

- **Kind / severity (auditor):** improve / S3 · confidence 0.7 · by reading only
- **Where:** priceText / toProb callers (editor, + Add a bet, consensus box, parlay legs); the card's Market tile (line 6337)
- **The app gives:** Four typed-price paths with slightly different rules; a Market tile that says only "consensus no-vig" or "sharp no-vig" whatever the source.
- **Right:** (1) One reader that returns the chance and what it understood ("read as +110 = 47.6%"), cleans dashes and refuses non-prices: fixes PRICES-3 everywhere. (2) The Market tile names its source and quality: "Pinnacle no-vig", "consensus of 6 books", "estimated margin", "typed by you" (the data is already on the row: mktSharp, sbHow, consensus_book_count). (3) A market chance that is an estimate or a single raw price is treated as no market check (smallest stake) until both sides are known. (4) A push note on whole-number lines. (5) If soccer is ever added  …
- **Why:** Each of PRICES-1, 2, 3 and 5 is the same weakness: an input whose quality the app does not check or show.

**Checked and found right (16):**

- American price -> chance -> American price: all 19,802 whole prices from -10000 to +10000 round-trip with 0 failures; text and number forms agree; -100, +100, EVEN, pk and EV are all 50% (t1-parse.js).
- Decimal (1.91) and percent (51.9%) in the Odds box: 900 decimals and 999 percents read right to the nearest whole American price (drift at most 0.12 points; see the PRICES-3 note).
- The Odds API loader (oaToRows) for moneyline, spread and total: every market chance equals my hand de-vig to 9 decimals. The vig is removed inside each book at the same line by proportional scaling (the only method; cfg.devig is a 2% tolerance, not a method); Pinnacle is used when present, else the mean of 3 or more books; under 3 books and no Pinnacle gives no row; a book at another total line is not mixed in; a spread with one s …
- Three-way market with a Draw: the three chances add to 100.00% and a book quoting a 2-way (draw refunds) line is skipped as a different bet (t3-loaders.js).
- Sportsbook API with both (or all three) sides present: fair = average / sum (58 + 46 -> 55.77% / 44.23%).
- BettingPros props (Worker normalize, by reading; arithmetic repeated by hand): both sides' consensus prices at the bet's own line, a / (a + b), only when the two add to between 98% and 125%; another line or one side missing gives no market chance, so the bet is "no market check" at the smallest stake; the recommended side's own chance is used, no 1 - p anywhere.
- BettingPros game lines (Worker consensus by reading; gameRowsToInternal run): median of each side across 3+ fresh books at the exact line, the two medians normalised (sum 1.00 to 1.20), alternate lines dropped, best price per team and line, Over and Under kept apart; a game without exactly two sides gets no consensus.
- OddsPapi totals (Pinnacle two-way no-vig at the same line) and the hub's hubNoVig (-150 / +135 -> 58.51 / 41.49).
- okProb: 12 edge cases plus 20,000 seeded random cases against min(model, market + w x (model - market)), and actNetOf against q / (p x (1 + fee)) - 1: 0 differences. No market, or a market of 0 or 1 -> the model alone; model = market -> that number; model below market -> the model; weight 0 -> the market (or the model if lower); weight 1 -> the model; a blank or text weight -> 0.35; -3 -> 0; 7 -> 1 (t5-edges.js).
- Odds window: the bet's own price is tested and both ends are inside (-300 and +500 in; -301 and +501 out; +100 is read as -100, inside).
- Gross EV cap on the model chance: exactly 40% passes, 40.01% is out.
- Outlier flag: model EV above 15% (15.02% yes, 14.98% no) or model more than 8 points over the market (8.01 yes, 8.00 no); a model below the market is never an outlier; with no market only the EV test applies.
- Old (12 hours) and the 3-minute / 90-second rule at their boundaries; an unknown time falls back to the load time and fails check 5; Z and -06:00 stamps are the same instant (t7-push-ages.js).
- Synthetic hold label (v4.84): Novig 49c + Kalshi 50c = 0.75% after fees (quoted -1.00%), -110 / -110 = 4.76%; no number for two different lines, a side older than 10 minutes, or a missing side. thinQ: more than 10 points between ask and bid is thin (10.00 is not, 10.01 is) (t11-hold-thin.js).
- One card, one truth: on the practice board all 35 rows with a price and a model chance were recomputed from raw fields with my own code (own fee formulas, own bisection for OK up to) and compared with the EV pill, the chance chip, the price line, six Why-this-play tiles, the score bar, and the table row (28 rows across every band tab): 0 disagreements beyond the known one-tick rounding of OK to (K2) (t6-onecard.js).
- The other side as 1 - p: used only in + Add a bet (no draw sport is offered there) and in the hold label (guarded for whole-number lines and NFL ties). No loader builds one side's chance from the other's.

**Not checked:**

- report.md was NOT written: the harness blocked report files for subagents, so the full report is this structured answer and the evidence is the scripts and outputs in the prices folder.
- The Worker as deployed: I read the repo (/home/user/prop-bet-api, HEAD 34831e7) but could not run it or see a live answer, so the BettingPros and Pinnacle market-chance paths are by reading only.
- What BettingPros' market_probability / cover_probability mean on a whole-number line (wins outright, or wins when it does not push), and whether SportsGameOdds' fairOdds on the two sides add to 100%: these need real answers from the sources.
- The real shape of the Sportsbook API feed: PRICES-5 is proven only on data I built to the shape the code expects.
- How the Worker turns an exchange order book into price and bid (the /live route), the closing-line de-vig used for CLV, parlay leg prices, the Easy level's price wording, and the Cheat Sheet paste parser beyond reading it (its fair chance is price  …
- PRICES-3 frequency: I could not check offline which sportsbook pages print a typographic minus; the behaviour itself is proven in the real screen.

**Noticed outside its area:**

- thinQ calls a book with no bid at all (bid 0 or missing) "not thin"; only a wide two-sided book is thin (seen in t11-hold-thin.js).
- BettingPros game lines keep only the single best-priced book per team and line (gameRowsToInternal); if that book is not one you bet, your own book's slightly worse price for the same li …
- The practice fixture has a Polymarket price written "+92" (not a real American price); the app reads it as 52.08% without complaint (the PRICES-3 parser again).
- The hold band says "UNDERROUND · CHECK" at exactly 0.0% (shBand: h<=0).
- mktProb of exactly 0 or 1 would be treated by okProb as no market while r.noMkt stays false (no smallest-stake cap); no loader can produce it today.

## Parlays and pick'em entries (key PARLAY): pkDist, pkMult, pkPays, pkPlays, pkEV, pkBreakEven, pkKel …

### PARLAY-1 · A boost or discount typed once is saved and applied to every later 'Your entry', any size and any day

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** renderParlays 'your entry' (index.html ~12806-12811: mArr[0]=pkState.boost; pkState.adj[l.key]), the input handlers at 12872-12876, pkSave. The boost is one global number in mbev.pk. A discount is keyed by player/stat with no line and no date.
- **Inputs:** Yesterday, for a 4-pick entry: boost 15x and a discount on LeBron James Points (line 18.5, chance 80%). Both are still in mbev.pk after a reload the next day. Today he ticks LeBron Over 25.5 Points plus two other picks at 58.7% (a 3-pick PrizePicks Power, 5x).
- **The app gives:** Card 'Your 3 picks (with your promos)', pays 15x. LeBron is priced at line 18.5 and 80%. Expected return +313.5%, stake $10.00 (the largest bet). 'Log this entry' would save pays all = 15 x stake, LeBron's market as '18.5 Points' and p 0.80.
- **Right:** Today's entry has no promo: 5x and LeBron at 25.5 / 58.7%, so expected return +1.1% and a $1.00 stake (also see PARLAY-4).
- **Why:** The promo state is never tied to the entry it was typed for. The boost is only reset by its 'no boost' button. The discount is only removed by 'no discount' or by clearing its box, and its key has no line, so a new line for the same player and stat picks up the old line and chance.
- **Money effect:** In this example the stake is $10 instead of $1, and the saved entry says it pays $150 on a $10 stake when it really pays $50. Reports and the log's money then use the wrong pay if all hit.
- **How often:** Only after the owner has used Promos once. From then on it affects every 'Your entry' until he clears it. The card title does say '(with your promos)'.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q7b_stale_promo.js gives shownTitle 'Your 3 picks (with your promos)', shownPays 'pays 15x', legsUsed LeBron ['18.5', 0.8, disc true], shownEV 3.135, shownSt …
- **Proposed fix (not applied):** Store a promo together with the entry it belongs to (app, play, size and the sorted leg keys including the line) and a date, and drop it when any of these change. At minimum, key a discount by player/stat/line/day and clear the boost when the entry's size or app changes.
- **Second look: Confirmed** (severity S1, confidence 0.92, re-ran the check: yes)
  - Corrections to the claim: Wider than claimed: it also affects combo apps, where the boost cannot be cleared on screen.
  - Its own check: p1_ui.js uses the real Parlays tab. Day 1 (clock 2026-11-21): I tap the Parlay tab, tick 4 PrizePicks picks with the real .pk-pick boxes, then type 15 in .pk-boost and LeBron line 16.5 and chance 80 in .pk-disc-line and .pk-disc-p (change events). The card becomes 'Your 4 picks (with your promos)', pays 15x. mbev.pk stores boost 15 and adj {'lebron james/points':{line:'16.5',p:0.8}}. Day 2 is a new browser with the same mbev.pk, clock 2026-11-22, and a new board where LeBron is at 25.5. I tick only 3 picks. The card reads 'Your 3 picks (with your promos)', pays 15x, LeBron at 16.5 and 80%, EV +313.5%, stake $10. Without the old promos: EV +1.1%, stake $1. pkLog would save pays.all = 15 x stake and LeBron's market '16.5 Points'. Wider than claimed (p1_combo.js): on Kalshi the saved boost is applied too (pays 15x instead of 3.92x, stake $10 instead of $4.57) …
  - Written decision found: None. History (Parlays tab, v3.59) only describes the feature: 'a boost (pkState.boost, what all-hit pays)'. Nothing says it should outlive the entry it was typed for.
  - How often for you: Only if he has ever typed a promo. After that it affects every 'Your entry' (pick'em and combo) until he clears it on a pick'em app. Likely rare for him: he mostly bets singles at exchanges and logs parlays now and then.
  - Your saved history: Yes. A logged entry saves parlay.pays.all = stake x the boost, and pk.pays = [boost], and grading 'all hit' pays that. To find them without changing anything, list every kind:'parlay' row with a pk block where: (a) the app is pick'em and pk.pays[0] differs from PK_DEFAULT[app][pk.play][picks][0], or from his own edited table in mbev.pk.pays; or (b) the app is in PK_PRICED and pk.pays[0] is a round number far from any product of leg prices; or (c) a pk.legs market line differs from the line in the legs text he typed. He approves each row himself.
  - Smallest safe fix: Save the promo with what it was typed for: app, play, size, the sorted leg keys including the line, and the day. Apply it only while all of these match, and never apply a boost on a PK_PRICED app (no UI exists there). At minimum: key the discount by name/stat/line and clear the boost when the app, the size or the day changes.
  - Risks in the fix: Low. He would have to retype a promo if he changes the entry. Saved rows must not be rewritten.
  - Tests that pin today's behaviour: tests/parlay-apps-test.js lines 37-45 check that a discount and a boost are applied on the same entry. A fix keeps that passing. New test: after a boost on 4 picks, untick one pick (or r …

### PARLAY-2 · Combo (one-price) parlays: the haircut pulls every leg toward one shared break-even, so legs at different prices are over-staked 1.4 to 2.3 times

- **Kind / severity (auditor):** bug / S1 · confidence 0.85 · proven by a check that runs
- **Where:** pkEntry line 12483: adj = be + (1-h)*(p-be), where be = pkBreakEven(n,[M]) = M^(-1/n). That is the right shared break-even on pick'em apps (every pick pays the same), but on combo apps (pkArr = product of leg mults) each leg has its own price.
- **Inputs:** Default settings (bank $1,000, Kelly 0.25, haircut 0.5), caps off to show the sizing itself. A: legs 70% at a 65% price and 25% at 22% (combined 6.99, EV +22.4%). B: 75%@70%, 52%@48%, 30%@27% (EV +29%). C: 70%@60% plus 20%@20%, a leg with no edge (EV +16.7%).
- **The app gives:** Stakes: A $7.68, B $5.00, C $6.52.
- **Right:** Quarter Kelly on half the edge (EV-CALCULATOR section 4, and the code's own comment 'the board's edge haircut, applied to each pick'): A $4.67, B $3.61, C $2.84. Halving each leg's own edge gives about the same: $4.56, $3.46, $2.84. With equal leg prices the app is right ($8.54 = per-leg $8.54).
- **Why:** In example A the shared break-even is sqrt(0.65 x 0.22) = 37.8%. The 25% long shot is pulled UP to 31.4%, above its own true chance, while the favourite is pulled down to 53.9%. So the 'haircut' combo keeps EV +18.3% where half the edge would be about +11%.
- **Money effect:** Inside the $10 cap the stake is about 1.6 to 2.3 times the policy stake: $7.68 instead of $4.67 on example A.
- **How often:** Every combo-app entry (Kalshi, Novig, Polymarket US, Bovada, ...) whose legs have different prices, which is almost all of them. Pick'em apps are not affected.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q3b_combo_haircut.js gives A appStake 7.68, halfEdgeStake 4.67; B 5.00 vs 3.61; C 6.52 vs 2.84; equal prices 8.54 vs 8.54.
- **Proposed fix (not applied):** In pkEntry, when pkPriced(app), haircut each leg toward its own price, q_i = 1/mult_i: adj_i = q_i + (1-h)(p_i - q_i). Keep the shared break-even for pick'em.
- **Second look: Confirmed, narrower** (severity S1, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: The 1.4 to 2.3x holds only for favourite plus long-shot mixes. Typical combos with legs of 40% or more are about 1.05 to 1.10x. Also worth saying: the haircut can push a combo stake ABOVE the no-haircut stake when a leg has no edge.
  - Its own check: p2_own.js: for a combo that pays M=prod(1/q_i) only if all legs hit, I maximised P*ln(1+f(M-1))+(1-P)ln(1-f) on a 1e-6 grid, then took quarter Kelly at $1,000. Each leg's edge halved (q_i+0.5(p_i-q_i)) gives A $4.56, B $3.46, C $2.84. The app (pkEntry, caps off) gives A $7.68, B $5.00, C $6.52. Equal prices agree ($8.54 both). Case C goes further than the claim: the 20%-at-20% leg (no edge) is pulled UP to 27.3%, so the haircut stake ($6.52) is LARGER than quarter Kelly on the full, unhaircut edge ($5.68, app with shrink 0). In other words, on combos the 'haircut' can add edge instead of removing it. The auditor's arithmetic matches mine. On more typical combos the gap is small: Kalshi-like 62%@58% plus 45%@41% gives app $7.17 vs $6.63 (1.08x), and 66/62, 58/55, 47/44 gives $4.62 vs $4.26 (1.08x). The 1.4 to 2.3x only shows when a favourite is mixed with a …
  - Written decision found: None for combos. EV-CALCULATOR section 4 says 'quarter Kelly on half the edge'. Section 6 says nothing about entry sizing. The code comment at pkEntry (index.html 12484) says 'the board's edge haircut, applied to each pick'. On pick'em, pulling toward the one shared break-even is exactly that, because every p …
  - How often for you: Whenever he sizes a combo from the Parlays tab on Kalshi, Novig or Polymarket. With the recommended 40% minimum per leg, stakes are typically 5 to 10% too high (cents). Only with long-shot legs, at the 20% default, is it 1.4 to 2.3x.
  - Your saved history: No saved result is wrong: the stake is what he really placed. Past combo stakes may have been somewhat larger than policy. To list them: kind:'parlay' rows with pk.app in PK_PRICED. pk.legs stores each p but not each leg's price, so the exact policy stake cannot be recomputed from the record alone, only compared by hand.
  - Smallest safe fix: In pkEntry, when the arr comes from a PK_PRICED app, haircut each leg toward its own price: adj_i = q_i + (1-h)(p_i - q_i), with q_i = 1/l.mult. Keep the shared break-even for pick'em. This changes how the haircut is applied (not the 0.5 itself) and changes stakes, so it needs the owner's go in his own words.
  - Risks in the fix: Combo stakes go down, and the 'best' card and slip order (both by growth on the haircut chances) can change. Pick'em is unchanged. Needs the owner's go because it changes stakes.
  - Tests that pin today's behaviour: tests/parlay-test.js lines 62-66 pin the shared break-even haircut for PrizePicks Power only; a fix keeps that passing. No test pins combos. New test: Kalshi legs 70%@65% and 25%@22% at  …

### PARLAY-3 · After a DNP on a Flex entry, the parlay editor keeps the old size's one-miss payout, so the saved profit is too high

- **Kind / severity (auditor):** bug / S1 · confidence 0.9 · proven by a check that runs
- **Where:** plEditOpen Save (index.html ~12382): P.pays = Object.assign({}, P.pays, {all}) keeps m1 and m2. The editor has no box for them.
- **Inputs:** PrizePicks 4-pick Flex, $5 (5x / 1.5x: $25 if all hit, $7.50 with one miss). P4 does not play, so PrizePicks treats it as a 3-pick Flex (2.25x / 1.25x: $11.25 / $6.25). In Bet log > edit he removes P4 and types 11.25, then 2 of the 3 hit.
- **The app gives:** The list reads '2 of 3 — $7.50'. Choosing it saves payout $7.50 and profit +$2.50.
- **Right:** $5 x 1.25 = $6.25 back, profit +$1.25. The app saves $1.25 too much (twice the real profit). A $10 5-pick Flex that drops to 4 picks is $5 too much (2x kept instead of 1.5x).
- **Why:** The one-miss and two-miss payouts belong to the old size. Removing a leg changes the size but not those payouts.
- **Money effect:** +$1.25 per $5 entry in the example; +$5 on a $10 5-pick Flex that drops to 4 picks.
- **How often:** Every Flex entry with a DNP, reboot or tie that the owner fixes through the editor. Ties are common on whole-number lines. Saved history can be checked without changing anything: list parlays with parlay.pk.play 'flex' whose edits[] show the pick count went down while pays.m1 stayed the same.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q4_dnp.js gives FX_saved.pays {all:11.25, m1:7.5}, FX_opts '2 of 3 — $7.50', FX_2of3 {payout 7.5, profit 2.5, byHand payout 6.25, profit 1.25}. Power case PW …
- **Proposed fix (not applied):** Show the 1-miss and 2-miss boxes in the parlay editor for a Flex entry (as + Add a bet does), or clear m1 and m2 when the leg count changes and ask for them. Do not touch saved rows without the owner approving each one.
- **Second look: Confirmed** (severity S1, confidence 0.9, re-ran the check: yes)
  - Its own check: Re-ran q4_dnp.js, which drives the real Bet log: it clicks .pl-edit, removes leg 4 with its × button, types 11.25 in .pl-pay, clicks .pl-save, then picks '2 of 3' in select.pl-hit. Saved: picks 3, pays {all:11.25, m1:7.5, m2:0}; the list reads '2 of 3 — $7.50'; result win, payout 7.50, profit +2.50. By hand, a PrizePicks 3-pick Flex (PK_DEFAULT flex 3: 2.25x / 1.25x) on $5 with 2 of 3 is $6.25, profit +1.25. Code read: plEditOpen Save does P.pays=Object.assign({},P.pays,{all}), and the editor has only stake, 'Pays if all hit' and free bet, no 1-miss or 2-miss box. The pl-hit change handler pays m1 for n-1 hits and m2 for n-2. The seeded record has the same shape parlayRecord gives (pays {all,m1,m2}). The app offers no other way to record a smaller entry: the hits list only uses the saved m1 and m2. A 5-pick Flex dropping to 4 also keeps m2 = 0.4x, so a wro …
  - Written decision found: None that covers it. PK_SETTLE (index.html 12745) and EV-CALCULATOR section 6 only warn that 'a reboot or a smaller entry can change the payout'. They do not say the editor should keep the old size's partial payouts.
  - How often for you: Rare: only Flex pick'em entries (PrizePicks etc.) where a player does not play or ties and he edits the entry. His log is mostly singles.
  - Your saved history: Yes, for the profit of such entries. To find them without changing anything: kind:'parlay' rows with pays.m1>0 (or pk.play 'flex') and an edits[] entry whose before.legs had more legs (count the ';' separators) than the current parlay.picks, and whose pays.m1 or m2 was not updated. Show each with its hits and payout for him to approve.
  - Smallest safe fix: In plEditOpen, for an entry with pays.m1>0 or pk.play==='flex', show 1-miss and 2-miss boxes, as + Add a bet does (plM1/plM2). Or, when the leg count changes, set m1 and m2 to 0 and ask for them. Never touch saved rows without his approval of each.
  - Risks in the fix: Low. Power entries (m1 0) are unchanged.
  - Tests that pin today's behaviour: tests/parlay-edit-test.js covers editing a Bovada parlay (all-hit pay only, m1 0) and would keep passing. New test: a 4-pick Flex at 25/7.5 edited to 3 picks, typing 11.25 and a one-miss …

### PARLAY-4 · A pick'em entry's stake is pushed UP to the smallest bet, and an entry needs only EV above 0% (no 1.5% floor)

- **Kind / severity (auditor):** bug / S1 · confidence 0.85 · proven by a check that runs
- **Where:** pkEntry line 12483: stake = Math.min(sMax, Math.max(sMin, raw)). renderParlays, pkSlipsHtml and pkSentHtml accept any entry with e.ev > 0. pkComboOk accepts any leg with p x mult > 1.
- **Inputs:** Default settings. PrizePicks 4-pick Power (10x), picks at 56.5%: EV +1.9%, Kelly (on the haircut chances) $0.26. 2-pick Power (3x) at 58%: EV +0.9%, Kelly $0.57.
- **The app gives:** Stake box $1.00 in both cases (3.8 times and 1.7 times Kelly), with 'Log this entry'. The +0.9% entry can be 'Best for your bankroll'. On combo apps every card at 3 to 6 legs showed $1.00.
- **Right:** Policy (EV-CALCULATOR section 4 and the v2.50 comment at line 3900): 'Smallest bet is a don't bet below, never bet at least'. A single that sizes under $1 is skipped ('stake under the $1.00 minimum — skip'). A single also needs La Contadora's EV of at least 1.5%.
- **Why:** The clamp is written as 'at least sMin'. Whether entries should also clear the 1.5% floor is not written anywhere: a policy question for the owner.
- **Money effect:** Cents to under $1 too much per entry, but always on the thinnest-edge entries. About $20 a week of extra stake on near-zero-edge entries if he logs about 30 such entries a week.
- **How often:** Every entry whose Kelly stake is under $1. At a $1,000 bankroll that is most marginal entries and most long combos.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q2b_stake.js gives twoPick58 {ev 0.0092, raw 0.574, stake 1}, fourPick565 {ev 0.019, raw 0.264, stake 1}. q5_rules.js comboCards show stake 1 at 3 to 6 legs. …
- **Proposed fix (not applied):** stake = raw >= sMin ? Math.min(sMax, raw) : 0, with 'under your $1 minimum: skip' on the card. Ask the owner whether entries (and combo legs) should need the 1.5% floor.
- **Second look: By design (your rule)** (severity S2, confidence 0.75, re-ran the check: yes)
  - Corrections to the claim: The clamp is a documented choice for the Parlays tab, not an oversight, even though it conflicts with the singles rule. The 1.5% floor part is undocumented policy.
  - Its own check: Re-ran q2b_stake.js: 2-pick Power at 58% gives EV +0.92%, raw Kelly $0.574, stake $1; 4-pick at 56.5% gives EV +1.9%, raw $0.264, stake $1. The code clamps with Math.min(sMax, Math.max(sMin, raw)). In p5_own.js the Kalshi 3- to 6-leg cards all show $1.00 (raw $0.98, $0.52, $0.27, $0.135). The 4-leg card is marked best only because its $0.52 is pushed up to $1.
  - Written decision found: Found for the clamp, not for the floor. The Parlays tab's own help text, unchanged since the tab was built in commit d22b22e (2026-11-04), says: index.html line 2540, 'Suggested stakes use your Kelly fraction and edge haircut, kept between your smallest and largest bet.' tests/parlay-test.js lines 63-64 pin i …
  - How often for you: Whenever he uses a suggested Parlays stake. Cents up to under $1 more than Kelly on each entry.
  - Your saved history: Nothing saved is wrong: the stake is what he placed. To list affected entries: kind:'parlay' rows with stake == his smallest bet and a small pk.ev (for example under 3%).
  - Smallest safe fix: Owner's question, not a plain fix: should entries follow the singles rule (stake 0 and 'under your $1 minimum: skip' when raw < sMin), and should entries or combo legs need the 1.5% floor? If he says yes: stake = raw>=sMin ? min(sMax,raw) : 0, and change the help text at line 2540 and parlay-test.js line 63 together.
  - Risks in the fix: Many cards would show 'skip', and 'best for your bankroll' would change (PARLAY-5's best card would lose its stake). It changes a stake rule, so it needs the owner's word.
  - Tests that pin today's behaviour: tests/parlay-test.js lines 63-64 (the clamp). The help text at index.html line 2540.

### PARLAY-5 · Combo apps: the 'best entry for each size' cards ignore the 5% minimum hit chance, so a 3% slip is marked 'Best for your bankroll'

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** pkBest (line 12576) on a combo app checks only pkComboOk on each leg. renderParlays (12796) marks the best card by growth. Only pkSlipsHtml applies slipMinHit (12644).
- **Inputs:** Kalshi, six NHL legs from different games, each 43.05% (La Contadora) at a 40% price, after tapping the app (pkApplyRec: minPC 40%, slip must hit 5% for 4 legs).
- **The app gives:** Cards for 2 to 6 legs, all with a stake and 'Log this entry'. The 4-leg card hits 3.43% of the time (6-leg 0.64%) and is the one marked 'Best for your bankroll'. Below it the slips section says 'No 4-Leg slip pays ... hit at least 5% of the time'.
- **Right:** Doc section 6: 'slips must hit at least 5% of the time, so no long-shot slips', and the Recommended line says 'the slip hits at least 5%'. The 4- to 6-leg cards should be left out or marked below the minimum. The best is then the 2-leg (18.5%) or 3-leg (8.0%).
- **Why:** The rule was added to the ready-made slips (v3.64) but not to the size cards built by pkBest.
- **Money effect:** No direct overcharge ($1 stakes here), but the app recommends the very long-shot combos the owner asked not to see (v3.64), and two parts of one screen contradict each other.
- **How often:** Any combo app with 4 or more legs that pass.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q5_rules.js gives comboCards n4 pAll 0.0343, n6 pAll 0.0064; comboBestCardTitle ['4 picks']; slipsHtml '...No 4-Leg slip pays ... hit at least 5% of the time …
- **Proposed fix (not applied):** In renderParlays, on a combo app give a card 'best' (and a stake) only when e.pAll >= slipMinHit, or have pkBest skip sizes that miss it.
- **Second look: Confirmed** (severity S2, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The best mark depends on the $1 clamp (PARLAY-4). The recommended threshold depends on the size; only the 4-leg value is 5%.
  - Its own check: p5_own.js: 6 NHL moneylines in 6 games on Kalshi, La Contadora 43.05% at a 40% price. I tap the Parlay tab, then the real Kalshi chip (pkApplyRec sets minPC 40% and slipMinHit 5%; Recommended reads 'the slip hits at least 5% ... ✓ in use'). All five size cards (2 to 6 picks) have a stake and a Log button. The 4-pick card (hits 3.43%) is marked best; the 6-pick hits 0.64%. The slips section on the same screen says 'No 4-Leg slip pays ... hit at least 5% of the time'. Code: pkBest on a combo app checks only pkComboOk on each leg, while pkSlipsHtml also checks e.pAll>=minHit. The 'Slip hits at least … %' box (index.html 2523, tooltip 'No home-run slips') sits in the shared combo controls above both the slips and the cards. The 'best' mark comes only from the $1 clamp: the 4-leg card's raw Kelly is $0.52, and its growth at $1 (5.06e-5) is barely above the 2-le …
  - Written decision found: No exemption for the cards. History line 892 (v3.64 'No home-run slips') puts pkComboOk (which pkBest uses) and 'Combo slips must hit at least pkState.slipMinHit (5%)' in the same rule. EV-CALCULATOR section 6, line 197: 'slips must hit at least 5% of the time, so no long-shot slips'. One could read 'slips' a …
  - How often for you: When he opens the Parlays tab on Kalshi, Novig or Polymarket with a full board. Stakes there are $1.
  - Your saved history: No saved money is wrong. To list such entries: kind:'parlay' rows with pk.app in PK_PRICED and pk.pAll < 0.05.
  - Smallest safe fix: In renderParlays, on a combo app, give a card 'best' only when e.pAll >= pkState.slipMinHit, and mark cards below it 'below your slip minimum'. Decide with the owner whether the threshold is the stored number or the per-size pkRec(app,n).hit (20/10/5/3/2%). With per-size, every card in this example would fail.
  - Risks in the fix: Low. It only changes which card gets the best mark and the labels.
  - Tests that pin today's behaviour: None pins the cards ignoring slipMinHit. New test: the scenario above, where the 4-pick card must not be marked best.

### PARLAY-6 · Every pick'em app uses a copy of PrizePicks' payout table; some apps pay differently or are not fixed-table at all

- **Kind / severity (auditor):** policy / S2 · confidence 0.6 · proven by a check that runs
- **Where:** PK_DEFAULT (index.html 12419-12431). Underdog, Sleeper, Dabble, Betr Picks, ParlayPlay and DraftKings Pick 6 are all copies of PrizePicks. Power 2-6: 3/5/10/20/37.5x. Flex 3-6: 2.25/1.25, 5/1.5, 10/2/0.4, 25/2/0.4. Break-even per pick: Power 57.7/58.5/56.2/54.9/54.7%; Flex 59.1/56.9/54.3/54.2%.
- **Inputs:** Public pages, by web search only. Direct page fetches were blocked by this session's network, so every number below is from search summaries and is marked 'could not verify' where sources disagree.
- **The app gives:** PrizePicks 3-pick Power 5x. Betr 6-pick 37.5x. No 2-pick Flex. Sleeper and Pick6 treated as fixed tables.
- **Right:** PrizePicks: its Ways to Pick page (https://www.prizepicks.com/ways-to-pick), as summarised by search, says 3-pick Power 6x, while CBS (April 2026) and an older PrizePicks guide say 5x (could not verify). A 2-pick Flex at 2x/0.5x was announced Sept 2026 (https://www.prizepicks.com/playbook-article/2-pick-flex-plays-on-prizepicks-hit-one-pick-get-paid). Demons and goblins change payouts per pick. Betr: RotoWire's table gives 2-8 picks 3/5/10/20/30/50/100x, so 6 picks is 30x, not 37.5x (https://www.rotowire.com/news/betr-picks-vs-parlayplay-which-pickem-a …
- **Why:** The EV is only as right as the table, and tables are editable by design ('Payouts are editable because they change'). But the starting values silently assume PrizePicks everywhere.
- **Money effect:** At 58% picks, a 3-pick Power at 5x is EV -2.4% (break-even 58.5%); at 6x it is +17.1% (break-even 55.0%), so good entries are hidden. Betr 6-pick at 56%: the app says +15.7%; at 30x it is -7.5%, a losing entry shown as good.
- **How often:** Every entry on an app whose real table differs, unless the owner typed the app's own payouts under Payouts.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q1_tables.js prints every table (q1_tables.out). q1b_tables_money.js prints the EV effect of the other tables.
- **Proposed fix (not applied):** Owner's call. Ask him to type each app's current table from the app's lineup screen. Show 'payouts not checked for this app' on apps still using the PrizePicks copy. Treat Sleeper (and per-pick-multiplier entries) as priced legs whose multipliers are typed in.
- **Second look: By design (your rule)** (severity S2, confidence 0.7, re-ran the check: yes)
  - Corrections to the claim: The outside payout figures were not verified here (search summaries only). The code facts are right, and starting from PrizePicks' table is written down.
  - Its own check: Code facts checked with fn.js: PK_DEFAULT gives PrizePicks, Underdog, Sleeper, Dabble, Betr Picks and ParlayPlay the same tables: Power 2-6 at 3/5/10/20/37.5x; Flex 3-6 at 2.25/1.25, 5/1.5, 10/2/0.4, 25/2/0.4. DraftKings Pick 6 has the Power table only. There is no 2-pick Flex. pkPays uses the owner's own table from mbev.pk when he typed one. I did not try the outside tables (no web fetch).
  - Written decision found: memory/history.md line 874 ('Pick6 defaults are a copy of PrizePicks Power until the owner enters Pick6's own'), line 882 ('Underdog and Sleeper start as copies of PrizePicks''), line 887 ('ParlayPlay (PrizePicks payouts to start)'). index.html line 12443 comment: 'Payouts are editable because they change, an …
  - How often for you: Only when he uses a pick'em app other than PrizePicks without typing its table. I could not verify whether PrizePicks' own 3-pick Power is 5x or 6x today.
  - Your saved history: Saved pick'em rows keep pk.pays (the table used) and pk.ev. To list them: rows where pk.app is not PrizePicks and pk.pays equals the PrizePicks default. He can then compare each with what the app really paid.
  - Smallest safe fix: Owner's call. In one minute he can open each pick'em app's lineup screen, compare its payouts with Parlays › Payouts, and type them in. Optionally show 'payouts not checked for this app' while a table is still the PrizePicks copy. Sleeper and Pick6 working differently (per-pick multipliers, pools) is a design question.
  - Risks in the fix: None if only a label is added.
  - Tests that pin today's behaviour: tests/parlay-test.js (Power break-evens equal payout^(-1/n) on the PrizePicks table).

### PARLAY-7 · A DNP, tie or refund on a pick'em entry has no choice in the Bet log; PK_SETTLE is only a sentence

- **Kind / severity (auditor):** improve / S2 · confidence 0.8 · proven by a check that runs
- **Where:** Bet log parlay row select.pl-hit (index.html 7919-7923, 7959-7963). PK_SETTLE (12745) is text only. pk.settle 'plain-win-loss-v1' is saved but never read. Parlays have no void button and are only graded by hand (12164).
- **Inputs:** PrizePicks 4-pick Power $5 with one DNP and three hits. A 2-pick Power $5 with one tie and one hit.
- **The app gives:** The only choices are 'all 4 hit — $50.00' or 'lost — $0' (2-pick: $15 or $0). The real money needs the hidden editor route: remove the leg and type the new pay. That route is right for Power (q4_dnp.js PW_all3 +$20 = by hand) and wrong for Flex (PARLAY-3).
- **Right:** PrizePicks drops the entry one size: the 4-pick pays the 3-pick 5x, $25 (+$20). A 2-pick with a tie and a hit pays 1.5x, $7.50 (+$2.50) (https://www.prizepicks.com/help-center/injuries-and-dnps, https://prizepicks.com/help-center/payouts, from search). Choosing the nearest option records +$45 or -$5 instead of +$20.
- **Why:** Question 4: the app records only what is picked from the list. PK_SETTLE is the only handling, and a fully refunded entry cannot be marked a push.
- **Money effect:** $25 wrong either way on a $5 4-pick in the example.
- **How often:** Every pick'em entry with a DNP, tie or reboot.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q3_logprofit.js gives F_opts ['pending','all 4 hit — $50.00','lost — $0'], G_opts ['pending','all 2 hit — $15.00','lost — $0'].
- **Proposed fix (not applied):** Add a choice on pick'em rows: 'a pick was void, DNP or tie: the entry became N-1 picks'. It takes the smaller size's payouts from the app's table saved with the entry, then asks how many hit. Add 'refunded' as a push.

### PARLAY-8 · Same-game picks: how far the independent EV can be off (and in which direction)

- **Kind / severity (auditor):** policy / S2 · confidence 0.9 · proven by a check that runs
- **Where:** pkDist / pkEV (independence). 'One pick per game' is on by default (pkState.oneGame true, verified). The doc warns that multiplying 'can overstate'.
- **Inputs:** Two of the picks are from one game. rho is the correlation between those two picks' win/lose outcomes. $5 entry, picks at 60% (Flex at 58%).
- **The app gives:** 2-pick Power 3x: +8.0% ($0.40). 4-pick Power 10x: +29.6% ($1.48). 5-pick Flex: +26.9% ($1.35).
- **Right:** 4-pick 10x: rho +0.2 gives +46.9% (the app is 17.3 points or $0.86 too LOW), rho +0.5 gives +72.8% ($2.16 too low), rho -0.2 gives +12.3% ($0.86 too HIGH), rho -0.5 gives -13.6% ($2.16 too high, a losing entry shown as +29.6%). 2-pick 3x: ±14.4 points ($0.72) at 0.2 and ±36 points ($1.80) at 0.5. 5-pick Flex: ±9.2 points ($0.46) and ±22.9 points ($1.14).
- **Why:** Picks that move together (a QB's yards and his receiver's yards, both Over) make 'all hit' MORE likely, so the app understates. Picks that work against each other (two players sharing the same shots, or Over on one side and Under on the other) make it less likely, so the app overstates. The doc's wording ('can overstate') is only half the story, and its QB/receiver example is the understate case.
- **Money effect:** Up to about $2 of expected value per $5 entry at a correlation of 0.5, either way.
- **How often:** Only when 'One pick per game' is unticked or he builds his own entry (the default prevents it).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q67_corr_promo.js gives the corr[] block.
- **Proposed fix (not applied):** Owner's call. Keep 'One pick per game' on. Reword the doc to say which way each kind of pairing errs, and on a hand-built entry with two picks from one game show 'EV assumes these two are unrelated; could be ±15 to 40 points'.

### PARLAY-9 · A model-only pick added by hand still gets a full Kelly stake for the entry

- **Kind / severity (auditor):** policy / S2 · confidence 0.75 · proven by a check that runs
- **Where:** pkEntry / pkCard. A card with a model-only pick is never 'best' and shows a warning, but its Stake box is not held to the minimum.
- **Inputs:** Entry of 4 at 10x: one model-only pick at 66% plus three at 62%.
- **The app gives:** EV +57.3%, stake $7.30 with 'Log this entry'.
- **Right:** For singles, EV-CALCULATOR section 4 says bets with no market price are capped at the smallest bet ($1). Doc section 6 only says such an entry is 'never called best' and says nothing about its stake.
- **Why:** The single-bet rule was never carried over to entries.
- **Money effect:** $7.30 instead of at most $1 on an entry the app itself says it cannot check.
- **How often:** Only when he adds a model-only pick by hand.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/parlay/q2b_stake.js gives modelOnlyEntry {ev 0.573, stake 7.3}.
- **Proposed fix (not applied):** Ask the owner. Proposal: cap an entry that holds a model-only pick at the smallest bet, as singles are.

### PARLAY-10 · The leg-tag decision file says blendProb; the code (correctly per v4.55) uses La Contadora's chance

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** memory/decisions/perfecta-and-parlay-leg.md ('blendProb ≥ 70%') vs ringAssign line 4404 (r.actProb >= 0.70).
- **Inputs:** A prop with blend 72% and La Contadora 69%, EV +5%.
- **The app gives:** No tag (right by the code and the task's rule).
- **Right:** Same. Only the decision file is out of date.
- **Why:** The doc was not updated when v4.55 moved to actProb.
- **Check that runs:** q5_rules.js legTag: T2 false. T1 (72%, +2%) true; T3 (EV -5%), T4 (+1.4% < 1.5% floor), T5 (no market) and T6 (outlier) all false.
- **Proposed fix (not applied):** Change 'blendProb' to 'actProb (La Contadora's chance)' in the decision file.

### PARLAY-11 · Discount estimate (pkDiscP): the arithmetic is right, but the assumption gives extreme chances when the projection sits on the line

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · proven by a check that runs
- **Where:** pkDiscP line 12625.
- **Inputs:** It assumes the stat follows a normal curve centred on the projection, with a spread backed out of the board's chance: sd = (projection - line) / z(chance). Over 20.5 points, projection 22.0, chance 58% gives sd 7.43; discounted to 18.5 gives 68.1% (direct calculation 68.1%). A projection of 20.6 on a 20.5 line at 58% gives sd 0.50, so a 2-point discount reads 99%.
- **The app gives:** 68.12% (right). 99% in the thin-gap case. A count stat (Over 1.5 shots, projection 2.1, 62%, discounted to 0.5) gives 79.2%.
- **Right:** Arithmetic exact. The normal CDF is within 2.1e-7 over -6 to 6 and the inverse is within 2.1e-7. The thin-gap 99% is an artefact of the assumption. For count stats a Poisson curve with mean 2.1 gives 87.8%, so the normal is on the low (safe) side there.
- **Why:** The spread comes from a tiny projection gap, and the chance is La Contadora's (conservative) while the projection is the model's.
- **Check that runs:** q67_corr_promo.js gives disc {impliedSD 7.43, app 0.6812, direct 0.6812}, discUnder {app 0.7764, direct 0.7764}, discThin {app 0.99}, discCount {app 0.7924, poisson 0.8775}, discWrongSide null.
- **Proposed fix (not applied):** Floor the implied spread (for example at a typical spread for the stat) or refuse an estimate when /projection - line/ < 0.5. Show 'estimated, type your own if you know it' more plainly.

**Checked and found right (19):**

- pkDist vs all 2^n outcomes: 3,000 seeded random entries of 2-8 picks (chances 35-85%), worst gap 2.8e-16 (q2_brute.js).
- pkEV vs brute force on the same 3,000 entries with random 1- to 3-tier payout tables: worst gap 7.1e-15.
- pkBreakEven vs an independent brute-force bisection: 400 random tables plus every PrizePicks Power and Flex size, worst gap 2.2e-16 (Power 57.74/58.48/56.23/54.93/54.66%; Flex 59.09/56.89/54.25/54.21%).
- pkKelly vs a fine search of expected log growth (0.0005 grid refined to 1e-6): 411 positive-EV random entries, worst stake-share gap 5.0e-7 and no growth lost.
- Doc example (Flex 4 at 61/60/59/58.5%, $5): app EV +14.52%, all hit 12.63%, 3 of 4 34.24%: matches the doc. Stake $7.75 = 0.25 x 0.0310 x $1,000.
- 'Best for your bankroll' picks the card with the most growth at its stake among cards with EV > 0 (q5: growth 4-pick 0.000051 > 2-pick 0.000050). Growth is computed on the haircut chances at the suggested stake.
- Pick'em haircut toward the shared break-even is close to 'half the edge' when all picks pay the same (4 at 60%: f 0.0157 vs 0.0164).
- Sportsbook parlay through the real Bet log: 3 legs +100/+100/-110, $10, pays $76.36: won +$66.36, lost -$10 (both by hand).
- A void leg via the real editor: removing the leg re-prices from the legs ($40.00, odds +300). Then 'all 2 hit' gives +$30 = by hand.
- Free-bet parlay: won +$30 (winnings only, $40 - $10), lost $0. Boost: a typed pay of $50 on legs worth $40 is kept, won +$40.
- Flex grading in the Bet log: 5-pick 10/2/0.4x, $5: 4 of 5 is $10 (win +$5), 3 of 5 is $2 (loss -$3).
- parlayRecord: odds = americanOf(stake/all), its own key from its own id. pkLog saves app, play, pays, each pick's p (4 dp), policy 'actProb-v2' and settle. Nothing in the code rewrites a logged entry's leg chances (grep).
- Chance per pick is La Contadora's actProb (pkProbOf), not the blend: with the model below the market the pick uses 60.0% (blend 61.75%).
- Model-only pick (noMkt) is kept out of pkBest, the Sentinels' list (pkSentLegs) and ready-made slips (q5).
- 'One pick per game' is on by default, and pkBest took one pick per game with two G1 picks available.
- Ready-made combo slips apply the 5% minimum hit chance (pkSlipsHtml). Only the size cards do not (PARLAY-5).
- Leg tag: 70%+ on actProb, EV at its own price >= 1.5% floor, market price, no outlier, not started: six constructed props, all as the rule says.
- pkNormCdf (max error 2.1e-7) and pkNormInv; pkDiscP equals a direct normal calculation for Over and Under.
- Existing tests run one at a time: parlay-test 24/24, parlay-apps-test 20/20, model-only-parlay-test 13/13.

**Not checked:**

- Direct reads of the app's payout and help pages: www.prizepicks.com could not be reached from this session (blocked by the network allowlist), so the tables in PARLAY-6 come from web-search summaries only and are marked could-not-verify where sourc …
- Real Kalshi, Novig and Polymarket combo quotes: the app prices a combo as the product of leg prices minus a per-leg fee, called approximate. The real combo price, often with extra margin, and Kalshi's one-fee-per-combo were not checkable offline.
- + Add a bet manual parlay (abParSave): checked by reading only. Win, loss and partial branches look consistent with the Bet log list. A free Flex entry whose two-miss payout is below the entry cannot be saved as partial there (edge case, not run).  …
- pickem-books-test.js and parlay-edit-test.js were not run (time); their paths were exercised by my own scripts.
- Daily max and per-game caps for parlays: they use their own pool (poolOf 'parlay'). Not audited: stake caps belong to the stake area.

**Noticed outside its area:**

- The Bet log parlay editor does not reset P.hits or the payout when legs change after a non-all grade (graded '3 of 4', then edited to 3 legs, leaves hits 3 = 'all 3' selected with the ol …
- pkLegsPriced counts an 'outlier' or 'small risk' as a 'good' combo leg (pkComboOk 'Only good bets'), and r.net is the model's EV, not La Contadora's. Each leg still needs actProb x mult  …

## Worker numbers (prop-bet-api v3.48, commit 34831e7): how each source becomes the price, side, line  …

### WORKER-1 · /moneyline keeps quotes the book has switched off (is_off / active:false). /spread and /total drop them. A dead price becomes the best price on the board and enters the consensus.

- **Kind / severity (auditor):** bug / S1 · confidence 0.55 · proven by a check that runs
- **Where:** src/index.js handleMoneyline: the consensus loop at line 1060 checks only cost and freshness; pushLine at lines 1172-1179 checks only freshness. Compare handleSpread lines 1380-1382 and 1469, and handleTotal lines 1597 and 1650, which also check !line.is_off && line.active !== false.
- **Inputs:** NBA NYK @ BOS. FanDuel, DraftKings and BetMGM quote NYK +150/+145/+148 and BOS -170/-175/-172. Novig quotes NYK +300 and BOS -400, both is_off:true, active:false, updated 1 minute ago.
- **The app gives:** The Worker returns the Novig +300 row as a current quote: edge_vs_consensus 0.5507 (+55%), consensus_fair_probability 0.3877, consensus_book_count 4 (the dead quote is counted as a 4th book). /spread with the same switched-off Novig quote drops it (6 rows, none from Novig).
- **Right:** A switched-off or inactive quote is not bettable. It must not appear as a current row and must not enter the median, exactly as /spread and /total already do.
- **Why:** The app's gameRowsToInternal (index.html line 10939) keeps the lowest implied probability per team as the best price and never sees is_off, because the Worker does not pass that field through. So +300 becomes the NYK card. The conservative chance on a game line equals the market (0.388), so actNet is about 4 x 0.388 - 1 = +55%. Stake = min(sMax 10, 1000 x 0.25 x (0.55 x 0.5) / 3) = $10. The app says to place $10 at a Novig +300 that does not exist.
- **Money effect:** A false +EV card with a full stake (capped at $10 by default) on a price the book will not take. The consensus that every other book on that game is judged against also shifts.
- **How often:** Whenever BettingPros sends a suspended moneyline quote updated in the last 3 hours (a book pulling a game on injury news is exactly that case). Confidence is 0.55 because I could not confirm offline that BettingPros moneyline offers carry is_off/active. The spread and total code reads them from the same /v3/o …
- **Check that runs:** worker-routes.mjs (part 2). Output: FAIL /moneyline: a switched-off Novig quote (+300, is_off) is dropped like /spread drops it -> [{"team":"NYK","cost":300,"edge_vs_consensus":0.5507,"consensus":0.3877,"n":4},{"team":"BOS","cost":-400,...}] ; PASS …
- **Proposed fix (not applied):** In handleMoneyline use the same test as /spread: skip a line when line.is_off // line.active === false, both in the consensus loop (line 1060) and in pushLine (line 1176).
- **Second look: Confirmed, narrower** (severity S1, confidence 0.5, re-ran the check: yes)
  - Corrections to the claim: The claim's worked example is wrong. The +300 dead quote is thrown out by the app's 40% gross-EV ceiling: stake $0, not $10. The real risk is a dead quote only a little off the market, roughly +3% to +40% gross EV. Those get through with a real stake: $1 on underdogs (long-shot moneyline minimum), up to $10 on favourites. The 'enters the consensus' part matters little, because the median of 4 books barely moves (0.3877 with or without it).
  - Its own check: Code read side by side: handleMoneyline's consensus loop (src/index.js about line 1060) and its pushLine (about lines 1172-1179) check only cost and freshness. handleSpread (lines 1380-1382 and 1469) and handleTotal (lines 1597 and 1650) also drop is_off / active:false lines. The difference has been there since the first commit (985a98f, and the 2026-10-24 backups). The auditor's script reproduces: Novig +300 comes back with edge_vs_consensus 0.5507 and book count 4. The median barely moves the consensus (0.3877). My own run, w1-app.mjs: real Worker /moneyline output fed into the real app (gameRowsToInternal, then audit, default settings). (A) The claim's own example, a dead Novig +300: the app flags it 'gross EV over the ceiling' plus a MODEL EV OUTLIER note. pass false, stake $0. So the claim's 'places $10 at a Novig +300' is WRONG for its example. The s …
  - Written decision found: None. The Worker comment above isUsableCurrent in handleSpread ('A line is only usable if it is live on the book's side: not switched off, not inactive, and fresh') is the stated rule. The moneyline route simply does not apply it.
  - How often for you: Unknown, and possibly never. It depends on whether BettingPros moneyline lines carry these flags at all. If they do, a book pulling a line on injury news, near tip-off for NBA / NHL / NFL moneylines, is exactly the case: maybe a few times a week across his slate.
  - Your saved history: Possible but hard to see. A bet placed from such a card would mostly fail at the book, because the price was not there. If he placed one at a different real price, the log holds the real price and stake, and only snap.listed / the shown EV would be off. Dry run over the log: list game-line bets (kind moneyline) whose snap.listed price differs from the filled odds by more than about 20 cents of American odds, for him to look at one by one. Nothing stored marks is_off, because the Worker never passes it through.
  - Smallest safe fix: Worker src/index.js handleMoneyline: skip a line when line.is_off // line.active === false, in the consensus loop (about line 1060) and in pushLine for tag 'current' (about line 1176), exactly as handleSpread does at line 1469. Test that must fail before and pass after: worker-routes.mjs part 2 (a switched-off Novig quote is dropped from /moneyline rows and from the median), plus a case with the dead price at a moderate +180, so the test does not rely on the app's ceiling. Merge only on the owner's go (Worker rule).
  - Risks in the fix: Low. If BettingPros does not send the flags, it changes nothing. If it sends active:false on lines that are in fact live, those quotes vanish from /moneyline. That is the same behaviour as /spread and /total today.
  - Tests that pin today's behaviour: None. No Worker test covers moneyline is_off, and no app test covers gameRowsToInternal.

### WORKER-2 · Polymarket: when the same two teams play twice within 18 hours (an MLB series night game then day game), /live takes the first event in the list, not the one nearest the bet's start time

- **Kind / severity (auditor):** bug / S1 · confidence 0.7 · proven by a check that runs
- **Where:** src/live.js polyEvent, lines 176-181: (list.events).find(... okTeams && /start - t0/ < 18 h)
- **Inputs:** The events list holds NYY @ BOS Tue 2027-06-01 23:10Z and NYY @ BOS Wed 2027-06-02 17:05Z (17.9 h apart). The bet is NYY moneyline Wed 17:05Z. Tuesday's NYY ask is 0.80; Wednesday's is 0.55.
- **The app gives:** ok:true, price 0.80, ref to the mlb-nyy-bos-2027-06-01 event (Tuesday's game, possibly in play).
- **Right:** 0.55, Wednesday's market. Choose the event whose start is nearest the bet's start, and refuse when two events fall inside the window.
- **Why:** find() returns the first match, and Polymarket lists events in start order (assumed), so the earlier game wins. If Tuesday's game is finished its markets are closed and the answer is "no market", which is safe. If it is in progress, the in-play price is returned for Wednesday's bet.
- **Money effect:** Worked example: the BOS side of the same bet is priced at 1 - Tuesday's bid 0.78 = 0.22 (about +355) instead of about 0.47. Against a fair price near 0.45 the card shows about +100% EV and gets the full stake. The app would also tell him to type a price that is not Wednesday's.
- **How often:** MLB (series between the same two teams, getaway-day games 17-18 h after a night game), and in rarer cases NHL/NBA home-and-home pairs within 18 h. Only while the earlier game is open or in play. Not in season now (November).
- **Check that runs:** live-mapping.mjs. Output: FAIL Poly: a bet on Wednesday 1:05 PM ET NYY @ BOS is priced from Wednesday (0.55), not Tuesday night (0.80, maybe in play) -> {"ok":true,"price":0.8,..."url":"https://polymarket.us/event/mlb-nyy-bos-2027-06-01"}
- **Proposed fix (not applied):** In polyEvent, filter by teams and window, sort by /start - t0/, take the nearest, and return null if a second one is within a few hours of it. Novig props use a ±6 h window with the same first-match rule (live.js lines 262-263 and 312-323) and have the same risk on MLB doubleheaders.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.75, re-ran the check: yes)
  - Corrections to the claim: Correct as code. For this owner it only matters in MLB series, with the getaway-day game 17-18 h after a night game, and in MLB doubleheaders for the Novig ±6 h rule. The money example (+100% EV) would be thrown away by suspectQ, because 0.22 vs about 0.47 is more than 15 points off the market, and also by the 40% ceiling. Only a small in-play drift gets through.
  - Its own check: live-mapping.mjs reproduces: a Wednesday bet is priced 0.80 from Tuesday's event (mlb-nyy-bos-2027-06-01). Code read: polyEvent (src/live.js lines 176-181) uses .find() on the events list with a window of 18 h on either side, so it returns the first match whatever the order. App side: liveDesc (index.html line 13229) sends start = b.start or gameInfo.startISO, which is the game's real start. That part is correct, so the Worker's choice is the only problem. Every board path builds the description from the card itself (w3-app run: a board row gives a real start). What stops the damage (by reading): every caller applies suspectQ. It drops a quote more than 15 points from the market (line 13207, used at lines 3689, 5503, 6810-6811, 7281, 9689, 13258, 14741, 15041). So an in-play price far from pre-game, and a finished game's 0.99 / 0.01, are thrown away. Only  …
  - Written decision found: None.
  - How often for you: Zero now (November, NBA / NHL / NFL). In MLB season, a few series a month where the earlier game is still open or in play when he checks the later one, and then only while the in-play price stays within 15 points of the market.
  - Your saved history: No. No MLB bets have been made since this rule could matter in the current window. If it ever happened, the only stored trace is b.liveLast (marked volatile, not synced) or a swap card's price. Nothing saved on settled bets.
  - Smallest safe fix: src/live.js polyEvent: filter by teams and the window, sort by /start - t0/, take the nearest, and return null (game not found / ambiguous) when a second match lies within, say, 6 h of the nearest. Apply the same to the Novig ±6 h first-match (live.js lines 262-263, 312-323). Test: live-mapping.mjs Poly NYY @ BOS Tue / Wed case must price Wednesday (0.55). A Tuesday bet must still price Tuesday. A single-game case must be unchanged.
  - Risks in the fix: Low. Refusing ambiguous pairs can hide a price that is real. It is reported as 'game not found' (AWOL), not as a wrong price. Worker merge only on the owner's go.
  - Tests that pin today's behaviour: None (no Worker test covers polyEvent ordering).

### WORKER-3 · Polymarket moneyline/spread: a team code the event does not know silently gets the other side's price instead of "not found"

- **Kind / severity (auditor):** bug / S2 · confidence 0.6 · proven by a check that runs
- **Where:** src/live.js polyPrice. Line 203: long = !!(side && side.long), so a missing side means long=false (the short side). Line 205: oid falls back to the away team when b.team matches neither away nor home.
- **Inputs:** Event KC/DEN with full_game_winner long=KC, bid 0.60, ask 0.63. Bet kind moneyline, team 'XXX' (stands in for a full name such as 'Kansas City Chiefs' that the app's liveDesc sends when it cannot turn the name into a code: index.html line 13229).
- **The app gives:** ok:true, price 0.40, title 'NO · KC vs DEN'. That is the DEN price, returned for a bet that may be on KC.
- **Right:** ok:false ("team not found"). Kalshi and Novig already return not-found in this case.
- **Why:** When teamId(b.team) is null, no marketSide matches and the code falls through to the short side, which is a different team about half the time.
- **Money effect:** A favourite priced at the underdog's price shows a large false edge (KC at 0.40 against a fair price near 0.61 is about +50%), which gets the full stake.
- **How often:** Rare: only when the app sends a team the event's abbreviations do not include (unresolved names, an alias missing from P_ALIAS). Then the price is wrong about half the time.
- **Check that runs:** live-mapping.mjs. Output: FAIL Poly moneyline on a team code the event does not have ... -> {"ok":true,"src":"poly","price":0.4,"title":"NO · KC vs DEN",...}
- **Proposed fix (not applied):** If teamId(b.team) is null, or the found side is undefined, return {ok:false, note:'Polymarket: team not found'}. In the spread branch, also require b.team to be b.away or b.home.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.7, re-ran the check: yes)
  - Corrections to the claim: The money example (KC priced at 0.40 shows +50% and gets the full stake) does not happen along a real path. Board cards always send a matching code, so no stake is ever computed from this. A lopsided wrong-side quote on a logged bet is dropped by suspectQ. What remains is a wrong live price in the bet log for a hand-typed bet with an unresolvable team, near-even games only.
  - Its own check: live-mapping.mjs reproduces: team XXX on a KC / DEN event comes back ok:true at 0.40, 'NO · KC vs DEN'. Code read: polyPrice (live.js line 203): when teamId(b.team) is null, no marketSide matches, so long=false and the short side is priced. My app check, w3-app.js: what liveDesc really sends for Polymarket US. - Board moneyline row from gameRowsToInternal: team KC, away / home DEN / KC. - Logged bet with code KC: team KC. - WSH: team WAS / WAS (both normalised the same way). In every board and fill path, the team is one of the two game codes, because both go through normAbbr. polyEvent matches the event with the same pTeams sets, so teamId always resolves. The bug is reached only when the team text is not a code and cannot be resolved: a free-typed team like 'Kansas City Chiefs', 'CHIEFS' or 'KNICKS' with a typed game 'KC @ DEN' and no ESPN team list (+ Ad …
  - Written decision found: None. memory/platforms/books.md line 14 describes the one-market-two-sides model, not this fallback.
  - How often for you: Rare. He mostly logs from fills or from the ESPN list, which give matching codes. Possibly a handful of free-typed Polymarket bets ever.
  - Your saved history: No saved money numbers. liveLast is volatile and display only. Dry run: list bets at Polymarket US, kind moneyline or spread, whose team (after normAbbr) is not one of teamsOf(game). Those are the only ones that could have shown a wrong live price.
  - Smallest safe fix: live.js polyPrice: if teamId(b.team) is null, or the found side is undefined, return {ok:false, note:'Polymarket: team not found'}. In the spread branch also require tid and oid to be non-null. Test: live-mapping.mjs 'team code the event does not have' must give ok:false, and the existing KC / DEN long and short checks must still pass.
  - Risks in the fix: Very low. It only turns a guessed price into 'not found' (AWOL), as Kalshi and Novig already do. Worker merge only on the owner's go.
  - Tests that pin today's behaviour: None.

### WORKER-4 · OddsPapi monthly budget: one board load can spend the 10-call reserve and go past the monthly limit, because the usage it checks is cached for 60 s

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** src/oddspapi.js opUsage, lines 27-34 (the /account answer is cached 60 s); opBill, lines 59-66 (checks that stale 'left' before every billable call); handleOpBoard, lines 269-272 (up to 16 billable calls within about 10 s)
- **Inputs:** Account: 238 of 250 used (12 left, reserve 10). GET /oddspapi/board?limit=8, then limit=16.
- **The app gives:** limit=8: 10 billable calls made, 2 left at the end (8 of the 10 reserve calls spent). limit=16: 18 billable calls made, -6 left (6 past the monthly limit). Both replies show usage 238 used / 12 left.
- **Right:** At most 2 billable calls (left minus the reserve), and the reply should show the real count after the calls.
- **Why:** Every opBill re-reads the same cached /account answer, so 'left' never goes down during the burst.
- **Money effect:** No stake effect. Calls past the plan get refused (or billed, depending on OddsPapi), and the reserve the owner set aside for checks on placed bets is gone.
- **How often:** Near the end of a month with a busy board, which is when the reserve matters.
- **Check that runs:** oddspapi-check.mjs and oddspapi-check16.mjs. Output: FAIL ... {"left_at_start":12,"reserve":10,"billable_calls_made":10,"left_after":2,..."usage_the_reply_shows":{"used":238,"left":12}} ; with 16 games: {"billable_calls_made":18,"left_after":-6}
- **Proposed fix (not applied):** Read /account once per request, then count down locally (left--) on each billable call. Cap the board's limit at left - reserve - 2 (the fixtures and markets calls).
- **Second look: Confirmed** (severity S2, confidence 0.85, re-ran the check: yes)
  - Its own check: Both auditor scripts reproduce. With 12 left and a reserve of 10: limit 8 makes 10 billable calls (2 left after). Limit 16 makes 18 calls (6 past the monthly limit). The reply shows 238 used / 12 left both times. Code read confirms the mechanism: - opUsage caches the /account answer for 60 s (src/oddspapi.js lines 27-34). - opBill re-reads that cached 'left' before every billable call (lines 59-66) and never counts down. - handleOpBoard calls gameTotals once per game, 600 ms apart. 16 games take about 10 s, well inside 60 s. The markets call is billed too. The stub's /account returns the true count each time, so the overrun comes only from the cache. The app really offers 4 / 8 / 16 (index.html line 10465, select opN; also the scout at line 13622). The Worker runs on the custom domain api.0xbeta.dev (index.html line 10170, wrangler routes), where the Cache …
  - Written decision found: The reserve itself is a written choice: OP_RESERVE = 10 and the comment 'Every billable call goes through here: it checks the monthly budget first.' The overrun contradicts that stated intent. Not a decision to allow it.
  - How often for you: Only near the end of the month, when the allowance is nearly used. Then one 16-game load can spend the whole reserve and go up to about 6 calls past the plan.
  - Your saved history: No bet data is affected. The OddsPapi bill or refusals are the only trace. The per-day counts in KV (opcalls:YYYY-MM-DD) show how many billable calls were really made, and can be compared against the plan.
  - Smallest safe fix: In handleOpBoard (and any loop of opBill), read opUsage once, then count 'left' down locally on each billable call, and stop when left <= OP_RESERVE. Also cap the number of games at left - OP_RESERVE - (fixtures / markets calls not yet cached). Return the counted-down usage in the reply. Test: oddspapi-check.mjs and oddspapi-check16.mjs must make at most 2 billable calls with 12 left and show 'left' after the calls.
  - Risks in the fix: Low. A board may return fewer games than asked near the month's end, which is the intent of the reserve. Worker merge only on the owner's go.
  - Tests that pin today's behaviour: None.

### WORKER-5 · /mine Kalshi soccer (3-way) fills: NO on a team is saved as the other team's moneyline; NO on TIE gets a made-up team

- **Kind / severity (auditor):** bug / S2 · confidence 0.75 · proven by a check that runs
- **Where:** src/mine.js kalshiBet, line 129: team = yes ? t : tk.teamsCode.replace(t, '')
- **Inputs:** Ticker KXEPLGAME-26NOV14CHEARS-ARS, side no. Ticker KXEPLGAME-26NOV14CHEARS-TIE, side no.
- **The app gives:** {kind:'moneyline', team:'CHE'} and {kind:'moneyline', team:'CHEARS'}
- **Right:** NO on Arsenal means 'Chelsea or a draw', which is not a Chelsea moneyline. In a 3-way game, a NO should stay unmatched (kind 'other', or a double-chance label), never become a team moneyline.
- **Why:** The rule 'NO on A = B wins' only holds in two-way markets. The app grades a soccer team moneyline as a loss on a draw (index.html line 7201).
- **Money effect:** A draw makes the saved 'CHE ML' grade as a loss while Kalshi pays the NO as a win. Kalshi's own settlement overrides ESPN grading (index.html line 14432), so the final result is corrected, but until then the bet shows as lost. The label stays wrong, and ALREADY BET marks the CHE card instead of the real position.
- **How often:** Every Kalshi soccer NO fill (the app has Kalshi draw cards since v4.80).
- **Check that runs:** mine-check.mjs. Output: FAIL Kalshi soccer (3-way) NO on ARS must NOT be saved as a CHE moneyline -> {"sport":null,"teamsCode":"CHEARS",..."kind":"moneyline","team":"CHE"} ; FAIL ... NO on TIE ... -> {"team":"CHEARS"}
- **Proposed fix (not applied):** In kalshiBet: if the series is a soccer GAME series (or the outcome code is TIE), return kind 'other' for side 'no' instead of guessing the other team.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.7, re-ran the check: yes)
  - Corrections to the claim: Two paths. With no matching soccer card on the board, the bet is saved with an empty sport: ESPN never grades it, Kalshi's settlement grades it right, only the label is wrong. With a matching CHE card on the board, it is worse than the claim says: it is saved as that card (sport EPL), a draw shows LOSS until Kalshi settles it, and the bet's saved gross / net EV is wrong for good (about -39% in my example). Whether Kalshi's soccer tickers look exactly like KXEPLGAME-...-ARS / -TIE is not verified offline. The Worker's /live has no Kalshi soccer series a …
  - Its own check: mine-check.mjs reproduces: KXEPLGAME-26NOV14CHEARS-ARS side no comes back as kind moneyline, team CHE, sport null. The -TIE ticker side no comes back as team CHEARS. Code read: kalshiBet line 129, team = yes ? t : teamsCode.replace(t,''). SPORT_OF knows no soccer series, so sport is null. My app checks. (1) w5-app.js: with no matching card on the board, autoAddFromDesc saves 'CHE Moneyline' and 'CHEARS Moneyline' with sport '' (empty) and game 'CHEARS'. ESPN_MAP[''] is undefined, so autoGradeLog never ESPN-grades them. The Kalshi settlement (index.html about line 14440: win when result === fillSide 'no') grades them correctly. In this path the claim's 'a draw grades it as a loss' does NOT happen. Only the label is wrong. (2) w5b-app.js: with a soccer CHE moneyline card on the board (sport EPL), rowForFill matches the fill to that card. betMatches skips the …
  - Written decision found: None for /mine. History line 160 and books.md line 16 describe Kalshi two-way NO only.
  - How often for you: Low. He bets mostly NBA / NHL / NFL. It happens only on Kalshi soccer NO fills, if he places any. Each one is wrong every time.
  - Your saved history: Yes, if he ever placed one. The result is fixed by Kalshi's settlement unless he set it by hand. The label, and in the board path the saved gross / net EV, stay wrong. Dry run, changing nothing: list bets with autoFrom 'kalshi' or fillBook 'kalshi', fillSide 'no', kind 'moneyline', and fillRef matching /^KX(?!NFL/NBA/WNBA/MLB/NHL/NCAA)[A-Z]*GAME-/ (or ending in -TIE). Show each one's name, sport, gross / net and result for him to approve one by one. Never rewrite snap.
  - Smallest safe fix: Worker mine.js kalshiBet: when the GAME series is not a known two-way sport (SPORT_OF is null), or the outcome code is TIE, return kind 'other' for side 'no' (and for TIE on either side), so the app keeps it unmatched for him to label. Optionally also: in the app, betMatches should not skip the sport check when the fill's sport is null for game lines. That is an app change and needs its own go. Test: mine-check.mjs soccer NO on ARS gives kind 'other', and TIE gives no team. The NFL NO-on-KC gives DEN case must still pass. An app test should show that a …
  - Risks in the fix: Low. Those fills land in 'From your books' for a hand label instead of auto-logging. Already-saved bets must not be rewritten automatically (snap rule). Worker merge only on the owner's go.
  - Tests that pin today's behaviour: None. Worker test/draw-test.mjs covers Draw rows in /live, not /mine fills.

### WORKER-6 · BettingPros 50-a-day counter loses a call when two loads overlap (read, then write, in the Cache API)

- **Kind / severity (auditor):** bug / S3 · confidence 0.8 · proven by a check that runs
- **Where:** src/index.js bpFetch, lines 111-121 (budgetState reads, push, budgetSave writes; no lock)
- **Inputs:** Counter at 49/50. Two /props loads at the same moment (two tabs or devices, or a Schedule row firing during a manual load).
- **The app gives:** Both pass the check: 2 BettingPros calls are made, the counter ends at 50, and /budget says used 50, left 0, while 51 calls were really made.
- **Right:** With 1 call left, only one load should call BettingPros, and every call made should be counted.
- **Why:** Both requests read the 49 before either saves. The Cache API is also not durable storage and can lose the counter entirely (by reading).
- **Money effect:** None directly. BettingPros answers 429 and the Worker then blocks until UTC midnight, so the board goes stale.
- **How often:** Only when loads overlap. The app loads sports one after another (for loops), so mostly when two devices or tabs are used.
- **Check that runs:** worker-routes.mjs (part 1). Output: FAIL budget ... {"bettingpros_calls_made":2,"counter_after":50,"limit":50} ; FAIL /budget says calls used = calls really made -> {"shown_used":50,"really":51,"shown_left":0}
- **Proposed fix (not applied):** Keep the counter in the Durable Object the Worker already has (SyncStore), whose single-threaded fetch makes check-and-count atomic.

### WORKER-7 · AI spend counter ($5 a day / $90 a month caps) undercounts when answers finish together

- **Kind / severity (auditor):** bug / S3 · confidence 0.8 · proven by a check that runs
- **Where:** src/ai.js addSpend, lines 379-388 (KV read, add, write; the comment says 'one user, so a read-then-write is enough')
- **Inputs:** Three POST /ai 'market' jobs at once, each costing $0.007 (1,000 tokens in at $2 per million, 500 out at $10 per million).
- **The app gives:** spentToday $0.007 and spentMonth $0.007, while $0.021 was spent.
- **Right:** $0.021 on both counters.
- **Why:** Each answer reads the same old total and writes old total plus its own cost, so the last write wins. The caps check that undercounted total before the next call.
- **Money effect:** A few cents per lost update. The caps can be passed by about the sum of the lost amounts.
- **How often:** Low. The app calls the AI one at a time (for example the news loop at index.html line 13697 awaits each call), so this needs two devices, or two buttons pressed while El Compa is running.
- **Check that runs:** ai-spend-check.mjs. Output: FAIL AI spend: 3 answers at $0.007 each = $0.021 spent; the counter says $0.007 today, $0.007 this month
- **Proposed fix (not applied):** Same as WORKER-6: add spend inside the Durable Object, or keep one KV key per call and sum them.

### WORKER-8 · /mine Novig: the fallback for quantities sent in whole contracts rescales the price but not the quantity

- **Kind / severity (auditor):** bug / S3 · confidence 0.4 · proven by a check that runs
- **Where:** src/mine.js parseNovigFills, lines 349-352
- **Inputs:** Novig fill qty 30, cost $14.70 (the case the code itself guards against: cost/(qty/100) > 1).
- **The app gives:** price 0.49 (rescaled), qty 0.3. So price x qty = $0.147, not $14.70.
- **Right:** price 0.49 and qty 30.
- **Why:** When the price would come out above 1, the code concludes that qty is in $1 contracts and fixes the price, but it still divides qty by 100.
- **Money effect:** A wrong contract count on the fill card and in any later shares calculation. The stake uses cost + fee, which is right.
- **How often:** Only if Novig ever reports whole contracts. The normal 1-cent case (301 for $1.4749 gives 3.01 at 0.49) is correct. Confidence is about whether this branch ever runs.
- **Check that runs:** mine-check.mjs. Output: FAIL Novig fallback branch ... -> {"price":0.49,"qty":0.3,"cost":14.7,"price_x_qty":0.147}
- **Proposed fix (not applied):** When the fallback fires, set qty = n as well.

### WORKER-9 · /pinnapi/live cache hit drops the x-src-at time, so the app stamps a cached Pinnacle live price as read now

- **Kind / severity (auditor):** bug / S3 · confidence 0.9 · by reading only
- **Where:** src/index.js handlePinnLive, line 856 (the hit is re-wrapped with only Content-Type and x-src-cached); the app reads x-src-at // Date.now() (index.html line 8878)
- **Inputs:** Two scans within 10 s.
- **The app gives:** The second answer has no x-src-at, so the app records at = now.
- **Right:** The time the price was really read (copy x-src-at from the cached response, as /src/odds does at sources.js line 102).
- **Why:** The age is understated by up to 10 s (the cache's max-age).
- **Money effect:** At most 10 s of understated age, within the app's 90-second window.
- **How often:** Every cache hit on Live edges.
- **Proposed fix (not applied):** Return new Response(hit.body, {headers: hit.headers}) plus x-src-cached:1.

### WORKER-I1 · Improvement: send the fetch time with every price, not the reply time

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · by reading only
- **Where:** src/live.js line 359 (at = new Date() for every result); cachedJson / once (a 20 s edge cache plus a 15 s in-memory reuse for Kalshi and Polymarket markets; a 10 s cache plus 15 s reuse for the Novig book); src/oddspapi.js gameTotals, lines 175-183 (each game cached 15 min, no time per game, the board's 'fetc …
- **The app gives:** A /live price can be about 35 s (Kalshi/Polymarket) or about 25 s (Novig) old while 'at' says now. OddsPapi board games can be up to 15 min old; the app already marks them 'unknown' (opToRows comment v4.61).
- **Right:** Carry each upstream read time (the cache put time) into the result, so the app's 3-minute / 90-second freshness rule measures the real age.
- **Why:** Today this stays inside the app's 90 s window for /live, so it is not a bug. But the app's rule cannot be checked against the truth, and OddsPapi prices count as 'unknown' age.
- **Proposed fix (not applied):** Store {data, at} in the cache. Return at per result in /live, and per game in /oddspapi/board.

### WORKER-I2 · Improvement: consensus counts quotes, not distinct books, and takes the median of each side separately

- **Kind / severity (auditor):** improve / S3 · confidence 0.6 · by reading only
- **Where:** src/index.js lines 1057-1063 (moneyline), 1400-1406 (spread), 1617-1623 (total)
- **The app gives:** consensus_book_count is the number of quote lines, so a book that lists two lines at the same number counts twice toward MIN_CONSENSUS_BOOKS=3 and the median. Each side's median can come from a different set of books, and the two medians are then normalised.
- **Right:** Textbook practice is to devig each book's own pair, then take the median of those fair chances, counting each book once.
- **Why:** With few books, one book counted twice, or unpaired medians, can move the market chance that feeds the 0.35 blend.
- **Proposed fix (not applied):** Group by book id, keep one pair per book at the line, devig per book, then take the median (keep the 3-book minimum on distinct books).

**Checked and found right (14):**

- Kalshi /live (live.js kalshiPrice), 5 constructed cases checked by hand: favourite KC -3.5 = YES on 'KC wins by over 3.5' at the YES ask 0.49; underdog DEN +3.5 = NO on that same market at the book's own NO ask 0.53; moneylines each at their own YES ask; total Over = YES ask and Under = the NO ask; a prop Under = the NO ask 0.45, not the NO bid 0.41. The book's no_ask is used, never 1 minus the yes bid.
- Polymarket /live: long side at the best ask; short side at 1 minus the best long bid (right for one order book); the shown bid is 1 minus the ask; spread signs (KC -3.5 = long at line -3.5; DEN +3.5 = short of the same market); total Over long and Under short; prop line N+ = N - 0.5.
- Novig /live: buying your outcome = 1 minus the best bid on the other outcome (0.50 and 0.54 by hand); the spread's signed line must match (POR -7.5 is refused when only +7.5 is offered); totals require both teams in the description; Over/Under by outcome name; Draw/Tie rows never read (repo test 4/4).
- Line conventions agree between live.js and mine.js: Kalshi floor_strike 249.5 = '250+' = Over 249.5 (the ticker suffix 250 gives 249.5 too); Polymarket N+ = N - 0.5; Kalshi spread YES = team -strike and NO = the other team +strike.
- BettingPros props devig (index.js lines 317-322): multiplicative a/(a+b) at the same line only, sums outside 0.98-1.25 rejected. Moneyline/spread/total consensus: the median per side at the exact line, then normalised; book 0 (the aggregate) excluded; at least 3 quotes per side; sum must be 1.0-1.2. Spread mirror key: team X at k is paired with team Y at -k (lineKey turns -0 into 0.0).
- edge_vs_consensus and edge_vs_pinnacle = decimal x fair - 1 (the textbook EV per $1). americanToDecimal and americanToImpliedProb are right for every real American price, including exactly +100 and -100. decimalToAmerican rounds (for example 1.995 gives -100); it is used only for the Pinnacle display, which the app does not read.
- Pinnacle devig on /moneyline (1/d normalised, margin 0-12% accepted) and OddsPapi sharpFair: Over 1.87 / Under 2.02 gives 0.5193 / 0.4807, matching the hand calculation.
- OddsPapi findFixture: a Monday 7:15 PM CT game (01:15 UTC Tuesday) is found with the Central date.
- /mine Kalshi: partial fills grouped by order (10 @ 0.40 + 30 @ 0.42 = 40 contracts, $16.60, average 0.415, fees added to 0.68); NO-side price read from no_price; settlement P/L = revenue - cost - fee (40 - 16.60 - 0.68 = 22.72); result yes/no is compared with the side held; void/scalar = void.
- /mine Polymarket: BUY_SHORT at long price 0.63 = NO at 0.37; cost = trade cost minus fee, and the app adds the fee back as the stake (index.html line 14183), so stake = what was paid; a resolution of a short Under that lost gives loss, P/L -4.0456; the winner is read from marketSides price 1/0 before falling back to the payout.
- /mine Novig: qty in 1-cent contracts (301 for $1.4749 = 3.01 at 0.49).
- Kalshi ticker times: ET to UTC by the US daylight-saving rule (second Sunday of March to first Sunday of November); noon ET when the ticker has no time.
- AI cost arithmetic (usageOf): input + output + cache reads + 5-minute and 1-hour cache writes kept apart, the fallback cache-read rate, $0.01 a search. The day and month reset at Central midnight. Worst case is checked before each call. The repo test (115/115) passes. The list prices themselves were not re-verified.
- Cached /props, /moneyline, /spread, /total answers keep _meta.fetched_at (30-minute cache; the 7-day last-good copy is marked stale) and the app ages them by it. /src/odds and /src/sbapi keep x-src-at / x-sb-at on a cache hit.

**Not checked:**

- Real field names and shapes from the books (offline only): whether BettingPros moneyline lines carry is_off/active (this decides WORKER-1); whether Kalshi event tickers for MLB carry a start time; the order of Polymarket's events list; whether Novi …
- The time zone of BettingPros /v3/events 'scheduled' (bpTime reads 'YYYY-MM-DD HH:MM' as UTC). If it is Eastern time, NBA/NHL/MLB kickoffs from that path would be 4-5 h early: those games would be dropped as already started (the safe direction) and  …
- SportsGameOdds, The Odds API and Sportsbook API: the Worker only passes them through (sources.js), so their American-to-chance mapping, sides and lines are done in the app (index.html), outside this area.
- Cache API eviction losing the BettingPros counter, and different Cloudflare data centres keeping separate counters (owner and Augi): by reading only.
- Claude list prices in ai.js PRICE: not re-verified against current Anthropic pricing.
- sync.js, share.js, and the ai.js prompts and jobs beyond the spend counter: not about numbers, not checked.

**Noticed outside its area:**

- App gameRowsToInternal (index.html line 10939) picks the best price per side with no is_off/active information, so it cannot protect itself from WORKER-1.
- App liveDesc (index.html line 13229) can send a full team name instead of a code when giTeamFor fails; that is what triggers WORKER-3.
- App opToRows already marks OddsPapi board prices as priceAt 'unknown' because the Worker does not say when each game was read (see WORKER-I1).

## stats: the statistics in Reports, the Scorecard and the records (formulas, ranges, bands, gates, th …

### STATS-1 · CLV on exchange bets is measured against the ASK at kickoff and ignores the fee, so it reads positive (or even) on bets that did not beat the market

- **Kind / severity (auditor):** policy / S1 · confidence 0.8 · proven by a check that runs
- **Where:** clv (index.html line 7875); refreshLivePrices lines 13261 and 13267 (b.closeLive = r.price, then b.closing, source 'live:kalshi/poly/novig'); the Worker's src/live.js lines 164, 215, 332 return price = ask ('what it costs now to buy YOUR side'). Used by the Scorecard (Beat the close, Median and Mean CLV, the  …
- **Inputs:** Kalshi prop bet at -108 (51.9 cents), kickoff in 30 minutes; the exchange then shows bid 49 / ask 53 (middle 51, one cent AGAINST the bet). Second case: a Make filled at 50 cents (+100) on a market that sits at bid 50 / ask 52 and never moves.
- **The app gives:** Case 1: closing saved '-113' (live:kalshi), CLV +2.17%, counted as 'beat the close'. Case 2: closing '-108', CLV +3.85%. The fee changes nothing: CLV is identical with fee 0.035 and with no fee, while the same bet's win pays $4.30 instead of $4.63.
- **Right:** Against the middle of the same market: case 1 is -1.78% (and -4.98% once Kalshi's fee is in the price paid); case 2 is +2.0% (the real value of buying at the bid on a 50/52 market), not +3.85%. The app's own Watch study already uses the stricter standard for the same exchanges ('both sides de-vigged', docs section 5).
- **Why:** Definition in the code: CLV = chance(closing price) / chance(your price) - 1, positive when you paid less than the close. Three different things are saved as 'the close': (1) typed by hand, used as typed; (2) 'market no-vig' from Fetch closing lines, both consensus sides with the vig removed, same line only (strict: bet -110 against -110/-110 gives -4.55%, never positive when the price moved against you); (3) for Kalshi, Polymarket US and Novig bets, automatically, the ask on your side within 45 minutes of kickoff. Kind 3 contains half the spread (the  …
- **Money effect:** 1,000 Kalshi takes of $5 at 52 cents when the fair price is 51 and the book sits at 50/52: the app shows CLV 0.0% ('even with the close'); the real expectation is about -1.9% for the spread and -3.4% for the fee, roughly -$265 on $5,000. If the spread widens to 49/53 before kickoff the same losing bets show +2.2% CLV. The verdict's CLV half then passes by itself (measur …
- **How often:** Every exchange bet closed automatically. In the owner's 11/14 export all 168 closes were exchange closes (agent-notes/bet-log-evaluation_2026-11-14_v1.md: median 0.00%, 25 exact ties, 'so many bets close at your price').
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/clv-cases.js (output clv-cases.out): end to end through the app's real refreshLivePrices with the /live answer supplied: 'closing saved "-113" (live:kalshi),  …
- **Proposed fix (not applied):** For the owner to decide (not a plain fix): the Worker already returns bid and ask; save both and use the middle (or both sides de-vigged, as the Watch study does) as the exchange close, show 'CLV after fee' beside it, and label old closes 'ask'. Correct the help text, which says 'not devigged' although Fetch closing lines saves a devigged close.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Narrower on the effect. For a taker, the ask at the time of the bet compared with the ask at kickoff is consistent: with an unchanged market it gives exactly 0, not a positive number. It reads positive only when the spread widens, or for a Make (a resting order filled at its own price). That is the owner's real picture: 168 exchange closes, median 0.00%, 25 exact ties, mean +0.27% (−0.24% when measured on the cost with the fee, agent-notes/bet-log-evaluation_2026-11-14_v1.md:494). So today it hides a fee-sized loss rather than inventing a gain, and the …
  - Its own check: The facts check out. clv (line 7875) = toProb(closing)/toProb(odds) − 1, with no fee term anywhere. refreshLivePrices (line 13261): within 45 minutes of kickoff, b.closeLive={p:r.price}. Line 13267 then saves b.closing=fmtOdds(americanOf(p)) and closingSource 'live:'+src. The Worker (/home/user/prop-bet-api/src/live.js lines 164, 215, 332) returns price = ask for Kalshi, Polymarket US and Novig, and sends bid next to it. Line 12144 saves a 'market no-vig' close from Fetch closing lines. Help text at line 3077 says 'It is not devigged', which is wrong for that kind. My own figures for case 1: −108 is 0.51923; an ask of 53¢ gives −112.8, which rounds to −113 = 0.53052; 0.53052/0.51923 − 1 = +2.17%. Against the 51¢ middle, 0.51/0.51923 − 1 = −1.78%. With a Kalshi fee of about 1.75¢ in the cost, 0.51/0.5367 − 1 ≈ −4.97%. Case 2: an ask of 52¢ gives −108 = 0.51 …
  - How often for you: Every exchange close. That is all 168 of his closes as of 11/14.
  - Your saved history: His saved closes are asks (closingSource 'live:kalshi/poly/novig'). The middle cannot be rebuilt for old bets because the bid was not saved. A dry-run list could show, for each bet, closingSource and whether CLV is exactly 0 or positive at a maker price.
  - Smallest safe fix: Owner's policy call, as the auditor says: save bid and ask, use the middle (or both sides de-vigged, as Watch does), show CLV after the fee next to it, and label old closes 'ask'. Fix the help text at line 3077 now (words only).
  - Risks in the fix: Changing what is saved as b.closing would change old CLV numbers. A saved close must not be rewritten: add a new field (for example closeMid), and leave b.closing alone.
  - Tests that pin today's behaviour: Not searched in depth. clv-cases.js drives refreshLivePrices; tests that touch closeLive would pin the current saving.

### STATS-2 · The Watch study's '5,000 resamples' come from a random generator that repeats itself after about 10,000 draws

- **Kind / severity (auditor):** bug / S2 · confidence 0.97 · proven by a check that runs
- **Where:** watchStats, index.html line 9749: let seed=12345; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; }
- **Inputs:** Seeded Watch records, 40 logs each at 50, 150, 300, 500 and 1,000 games, passed to the app's real watchStats.
- **The app gives:** At 500 games: range -0.00417 to +0.00400 where a sound bootstrap and the textbook formula both give -0.00392 to +0.00378. App width / sound width: 0.90-1.10 at 50 games, 0.83-1.12 at 150, 0.82-1.32 at 300, 0.75-1.32 at 500, 0.61-1.27 at 1,000; an end of the range is off by up to 83% of the half-width at 1,000 games. 'Range clear of zero' differs from the sound answer in 2, 0, 1, 3 and 3 of 40 logs; the plus-or-minus 0.005 gate differs in 18 of 40 logs that sit near it.
- **Right:** A stable range: my own bootstrap (mulberry32, 100,000 resamples) agrees with mean +/- 1.96 x sd/sqrt(games) within 2% at every size.
- **Why:** seed*1103515245 is larger than a JavaScript number can hold exactly in 99,577 of 100,000 draws, so the low digits are lost: it agrees with the exact generator on 1 of the first 1,000 draws, enters a loop after 5,938 draws and then repeats the same 10,466 numbers. The headline needs 5,000 x games draws (2.5 million at 500 games), so the '5,000 resamples' are about 10,466 / games different ones (about 20 at 500 games). The more Watch bets, the worse the range, the opposite of what the stages assume. The same fault was found and fixed next door: tierCmp ( …
- **Money effect:** No stake changes today. The range decides the stage ('Useful comparison' needs it clear of zero, 'Credible evidence' also needs plus-or-minus 0.005) and the words 'Statistically / Materially favors the model'; docs section 5 says at Credible 'the model weight or the floor can be revisited', so a wrong range could one day move the 0.35 weight.
- **How often:** Always; grows with the number of games.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/lcg-cycle.js ('enters a loop after 5938 draws; loop length 10466 draws'; 'agrees with the exact (BigInt) generator on 1 of the first 1000 draws') and watch-rn …
- **Proposed fix (not applied):** In watchStats use the app's own rng32 as bootGames, sfBootRatio and tierCmp do: const rnd=rng32(12345); The headline d, the Brier scores and the counts do not change.
- **Second look: Confirmed** (severity S2, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: Two sub-points are overstated. (1) 'About 10,466 / games different resamples (about 20 at 500 games)' is wrong as worded. All 5,000 resample means are different numbers (I counted 5,000 of 5,000 at both sizes), because each resample is a different window of the same 10,466-number loop. They overlap heavily, so they carry roughly that little independent information, but they are not 20 copies. (2) 'The ±0.005 gate differs in 18 of 40 logs' was measured at 300 games. The gate only counts for Credible, which needs 500+ games; at 500 and 1,000 games it dif …
  - Its own check: Printed watchStats from the live copy (line 9739). It still has: let seed=12345; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; }. rng32 (line 9438) sits next to it unused. I measured the loop myself with a Map of seen states (cycle.js): the first repeat comes at draw 16,404, back to the state of draw 5,938, so the loop is 10,466 draws long. The generator agrees with the exact BigInt version on 1 of the first 1,000 draws, and 99,577 of 100,000 products pass 2^53, where JavaScript numbers stop being exact. Effect, from the app's real watchStats against a sound 5,000-resample bootstrap (the same size, so the noise comparison is fair) and a 200,000-resample reference, 60 seeded logs each. At 150 games, an end of the app's range is off by a median 13% of the half-width (90th percentile 22%, worst 30%); the sound 5,000-draw boo …
  - Written decision found: Not by design. recurring-bugs.md:12 marks it open; .claude/skills/betting-math/SKILL.md:35 says 'use mulberry32'.
  - How often for you: Every look at the Watch study. Today it changes only words (stage and verdict), and only for logs whose range sits near zero: about 1 in 30 logs in my runs. Nothing is saved, so nothing old needs a fix.
  - Your saved history: None: the range is worked out on render and never saved.
  - Smallest safe fix: In watchStats replace the inline generator with const rnd=rng32(12345); as bootGames, sfBootRatio and tierCmp already do. The headline difference d, the Brier scores and the counts do not change. Test: a new check that watchStats gives the same ci as a mulberry32 bootstrap of the game means, within 5% of the half-width, at 500 games. It fails now (median 21%) and passes after.
  - Risks in the fix: The fixtures in tests/watch-v2-test.js sit near the gates: 'Credible ... range within ±0.005' (2,000 bets in 1,000 games) and '1,000 bets in only 500 games: range wider than ±0.005, so Useful, not Credible'. A new generator moves the range slightly and could flip one of them. Run watch-v2-test.js, watch-shado …
  - Tests that pin today's behaviour: tests/watch-v2-test.js (5,000 resamples, the ±0.005 stage fixtures, under 2 s), tests/watch-shadow-test.js (range around d at 60 graded), tests/signal-record-test.js, tests/v491-test.js  …

### STATS-3 · The 1,000-bet verdict tests the 90% ROI range; the written rule says the 95% range

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** scVerdict, index.html line 9478: okR = roiB && roiB.lo>0 (lo = 5th percentile, the range printed '(90%)'), okC = medB && medB.lo25>0 (2.5th percentile). docs/EV-CALCULATOR.md section 8: 'It checks whether the 95% ranges for ROI and median CLV are both above zero.' Each 1,000-bet block uses the same function.
- **Inputs:** Seeded 1,000-bet history (seed 3 in scorecard-tables.js): ROI +6.0%, 90% range +0.7% to +11.6%, 95% range -0.3% to +12.7%, median CLV 95% range from +0.3%.
- **The app gives:** '✅ After 1,000+ bets, the profit range and the closing-line range are both above zero: good evidence of an edge (evidence, not proof).'
- **Right:** By the written rule: no evidence yet, because the 95% ROI range (-0.3% to +12.7%) includes zero.
- **Why:** The two halves use different bars and the document names one. With a true edge of exactly zero the ROI half passed in 4.3%, 5.3%, 6.8% and 4.3% of histories (400 each; 5% is what a 90% range implies, 2.5% is what the doc's 95% implies). The screen is self-consistent (the ROI box prints '(90%)'), so either the code or the doc should move; which one is the owner's call.
- **Money effect:** The verdict is the gate for 'No raising stakes or claims to buyers before 1,000'. A bettor with zero real edge whose CLV half passes (easy: STATS-1) is told 'good evidence of an edge' about twice as often as the written rule allows (about 5% instead of 2.5% at one look).
- **How often:** Any history whose ROI 5th percentile is above zero and 2.5th is not: about 2.5% of zero-edge histories and roughly 7% of true +3% histories at 1,000 bets.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/scorecard-tables.js (output scorecard-tables.out, last four lines) and coverage.out (the last four lines).
- **Proposed fix (not applied):** Either okR = roiB && roiB.lo25>0 (and print the ROI range as 95% like the CLV box), or change section 8 to say '90% range for ROI, 95% for median CLV'. One line either way.
- **Second look: Confirmed** (severity S2, confidence 0.88, re-ran the check: yes)
  - Corrections to the claim: Which side was intended is not written down. The mixed 90/95 code is the older of the two. The 95% sentence came later, as a re-wording after an outside math review, and nobody checked it against okR. So the history leans toward the doc being a loose description of the code, not a decision to use 95%. The doc is still the written policy. Owner's call.
  - Its own check: scVerdict (line 9477): const okR=roiB&&roiB.lo>0, okC=medB&&medB.lo25>0. bootGames (line 9450) returns lo:q(0.05), lo25:q(0.025), so ROI is tested on its 5th percentile (the 90% range) and median CLV on its 2.5th (the 95% range). On screen (renderScorecard) the ROI box prints rng(roiB) = 'range lo to hi (90%)' and the Median CLV box prints 'range lo25 to hi975 (95%)'. The screen matches the code. docs/EV-CALCULATOR.md section 8, line 225: 'It checks whether the 95% ranges for ROI and median CLV are both above zero.' My own run (verdict-own.js, real scBoots and scVerdict on seeded 1,000-bet histories): seed 6 gives ROI +5.6%, lo +0.61%, lo25 −0.34%, median CLV lo25 +0.78%, and the verdict is vc 'good', '✅ After 1,000+ bets, the profit range and the closing-line range are both above zero: good evidence of an edge'. Seed 7 is the same story (lo +0.23%, lo25 − …
  - Written decision found: Doc: docs/EV-CALCULATOR.md:225 (95% for both). Code since 2026-10-30: 90% ROI, 95% CLV, and the screen labels each one honestly. No written decision picks 90% for ROI.
  - How often for you: Not yet. His log has a few hundred settled bets and the verdict reads 'Not yet — N more'. Once past 1,000, roughly 2.5% of zero-edge histories would get the ✅ under the code but not under the doc, and only if the CLV half also passes. On his real log it does not today (median CLV 0.00%).
  - Your saved history: None saved. The verdict is worked out on render.
  - Smallest safe fix: Owner's choice, one line either way. (a) Code to match the doc: okR=roiB&&roiB.lo25>0, and print the ROI range as lo25 to hi975 '(95%)'. (b) Doc to match the code: section 8 says '90% range for ROI, 95% for median CLV'. A test for (a): a seeded 1,000-bet history like verdict-own seed 6 (lo>0, lo25<0) must give '❌'. It gives '✅' today.
  - Risks in the fix: (a) changes a gate on the main evidence test, so it needs the owner's own word ('do not change a threshold without the owner's go'). tests/v510-test.js P3 expects block 1 to read '✅ ... good evidence of an edge'. If its fixture's ROI 2.5th percentile is not above zero, that test would fail and its fixture wou …
  - Tests that pin today's behaviour: tests/v510-test.js (P3: the exact ✅ and ❌ verdict strings per block), tests/blend-limit-test.js (the 'evidence, not proof' wording).

### STATS-4 · The running Scorecard verdict is worked out again after every bet: with zero true edge it says 'evidence of an edge' at some point in 13% of histories

- **Kind / severity (auditor):** policy / S2 · confidence 0.85 · proven by a check that runs
- **Where:** renderScorecard / scVerdict (lines 9477-9545): from 1,000 settled bets the verdict is recomputed on every render with all bets so far.
- **Inputs:** 400 seeded histories, true edge exactly zero, typical clusters (2.1 bets a game, same-game correlation 0.3), the CLV half taken as passing (STATS-1), the app's real bootGames at every 50 bets from 1,000 to 2,000.
- **The app gives:** ROI range above zero at bet 1,000 only: 5.8%. At bet 2,000 only: 6.5%. At SOME look between 1,000 and 2,000: 13.0%. At least one of the two fixed blocks (bets 1-1,000, 1,001-2,000): 8.3%.
- **Right:** A test read once has the 5% its range implies. A test read every day needs a stricter bar or fixed checkpoints to keep that 5%.
- **Why:** Each look is honest alone (the ranges hold the truth as often as they say: see Checked and found right), but the best of many looks is not. With an honest zero-median CLV the two halves together keep the false alarm at 0.0% to 0.5%; the weakness shows only when the CLV half passes by itself.
- **Money effect:** The first ✅ is the owner's signal that stakes may go up. About 1 zero-edge bettor in 8 sees it at least once during the second thousand bets.
- **How often:** Whenever the Scorecard is read between checkpoints after 1,000 bets.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/peek.js 400 (output peek.out).
- **Proposed fix (not applied):** A question for the owner: make the 1,000-bet blocks (already built, each judged once when full) the verdict that counts, and word the running Scorecard line between checkpoints as 'so far', or require the range to stay above zero at two checkpoints in a row.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.75, re-ran the check: no)
  - Corrections to the claim: Conditional: the 13% needs the CLV half to pass by itself. With an honest zero-median CLV the auditor's own coverage.out gives 0.0% to 0.5%. On the owner's real log (median CLV 0.00%) the CLV half fails, so the 13% does not apply to him today. The fixed 1,000-bet blocks the owner already has (plan-and-blocks-v1, each judged once) are the existing fix in part.
  - Its own check: Logic check of peek.js only, not re-run (it is slow). Wins are drawn as sqrt(0.3)·z_game + sqrt(0.7)·noise < Φ⁻¹(q). That noise has unit variance, so P(win)=q, and the payout 1/q − 1 gives exactly zero EV per bet. The same-game correlation is 0.3, as claimed. It calls the app's real bootGames(S.slice(0,n), roiOf) and tests B.lo>0, the same okR as scVerdict, every 50 bets from 1,000 to 2,000. The CLV half is fixed to pass (_clv: 0.01 on every bet), which is an assumption. The result (one look 5.8%/6.5%, any look 13.0%, two fixed blocks 8.3%) is what repeated looking gives: 21 correlated looks roughly double the one-look rate. The logic is sound.
  - How often for you: Not yet (a few hundred settled).
  - Your saved history: None saved.
  - Smallest safe fix: Owner's question, as the auditor says: make the fixed blocks the verdict that counts, or word the running line 'so far'.
  - Risks in the fix: Wording only.
  - Tests that pin today's behaviour: tests/v510-test.js (the block verdicts).

### STATS-5 · 'That isn't luck' and 'normal bad luck' are printed from a bare median, one of them from 30 bets, under a verdict that says 'not yet ... claiming anything'

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** scVerdict, index.html lines 9482-9486: shown when C.length>=30; '⚠ ... not beating the closing price ... That isn't luck' when the median CLV of the last 100 closes is <= 0 and there are 100 closes; '📉 Down $X in the last 30 days, but still beating the close ... normal bad luck' when that median is > 0 and t …
- **Inputs:** (a) 30 settled bets with a close, median CLV +2.4%, last 30 days -$10. (b) 100 settled bets, 51 closes at CLV 0.0% and 49 at +4.8%; then 50 and 50. (c) Simulated bettors, 4,000 seeded histories a line, bet-to-bet CLV spread 3 points.
- **The app gives:** (a) stage 'Anecdotal', then '📉 Down $10.00 in the last 30 days, but still beating the close (median +2.4%) — normal bad luck', with no count of the closes behind it. (b) 51/49: '⚠ The last 100 bets are not beating the closing price (median +0.0%). That isn't luck — check what changed.'; 50/50: nothing. One bet flips it. (c) A bettor who truly beats the close by +0.5% is told 'That isn't luck' in 8.3%, 9.6% and 8.7% of histories (100, 200, 500 closes). A losing bettor who truly does NOT beat the close (-0.5%) is told 'normal bad luck' in 18.3% of histo …
- **Right:** A line that says 'luck' or 'not luck' should rest on the range the same box already computes (Median CLV 95% range), on at least the Scorecard's own 100 ('Under 100 = stories'), and should show its count. A median of exactly 0.0% is 'even with the close', not 'not beating'.
- **Why:** The Scorecard's own rule is 'Under 100 = stories' and its main line says 'Not yet ... before raising stakes or claiming anything'; the two lines under it then make a claim from a point estimate. The owner's 11/14 note already saw the exact-zero case on his real log ('at exactly zero, That isn't luck says more than the data shows': noticed, not changed). New here: the measured error rates, the 30-bet line with no count, and that with the close measured at the ask (STATS-1) 'still beating the close' is easier to reach than it should be.
- **Money effect:** No stake changes, but 'normal bad luck. Hope for the best' is the line that tells a losing bettor to carry on; it reaches about 1 in 5 losing, no-edge bettors at 30 closes.
- **How often:** The ⚠ line is on the owner's real Scorecard today (11/14 export: median +0.0%, 16 of the last 100 closes at his own price).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/gates.js (last block, output gates.out) and verdict-words.js (output verdict-words.out).
- **Proposed fix (not applied):** Use the range of the last 100 closes: ⚠ only when its upper end is below zero; 📉 only when its lower end is above zero; both from 100 closes, each with its count ('last 100 closes'); at a median of exactly zero say 'even with the close'.
- **Second look: Confirmed, narrower** (severity S2, confidence 0.88, re-ran the check: yes)
  - Corrections to the claim: Narrower than worded for the ⚠ line. It does show its count, and it only fires from 100 closes, which is the Scorecard's own minimum. Its faults are that it rests on a bare median with no range, and that it says 'not beating' (and 'That isn't luck') at a median of exactly 0.0%. The 📉 line is fully as claimed: it fires from 30 closes, shows no count and has no range. Note too that ⚠ counts 'bets' but means closes, and orders them by day only.
  - Its own check: Exact strings and conditions in scVerdict (lines 9482-9486). Both lines are gated by C.length>=30 (C = settled bets with a closing price). rec = the 100 closes with the latest _day, rMed = their median. '⚠ The last '+rec.length+' bets are not beating the closing price (median X). That isn't luck — check what changed.' needs rMed<=0 and C.length>=100. '📉 Down $X in the last 30 days, but still beating the close (median X) — normal bad luck. Hope for the best, expect the worst.' needs last30<0 and rMed>0 and only C.length>=30. I checked the arithmetic myself. With 51 closes at 0.0% and 49 at +4.8%, the median of 100 is the average of the 50th and 51st values = 0 → ⚠. With 50/50 it is (0+4.8)/2 = +2.4% → nothing. One bet flips it. Normal approximation for the rates: the median of 100 closes with a spread of 3 points has a standard error of about 1.2533×3/10 = …
  - How often for you: ⚠: today, every visit, while his median of the last 100 closes is 0.00% (25 exact ties in 168 closes). 📉: any month he is down while the median close is above zero.
  - Your saved history: None saved.
  - Smallest safe fix: Display only, one function. ⚠ only when the 95% range of the last 100 closes (bootGames(rec, medOf).hi975<0) is below zero. 📉 only when that range's lo25>0 with 100+ closes. Each line says its count ('last 100 closes'). At a median of exactly 0 say 'even with the close'. Tests: the 51/49 history must not print 'That isn't luck', and a 30-close losing history must not print 'normal bad luck'. Both print today.
  - Risks in the fix: tests/v510-test.js P3 checks that block 2 shows '⚠ The last 100 bets are not beating the closing price' and block 3 shows '📉 Down … normal bad luck'; its fixtures (block 3 has only 50 bets) would need updating, with the owner's agreement on the new words. No decision or stake changes.
  - Tests that pin today's behaviour: tests/v510-test.js (P3: the ⚠ and 📉 strings on the 1,000-bet blocks).

### STATS-6 · 'The model is beating the market' is printed on any difference from 100 picks, even when the two Brier scores print as the same number

- **Kind / severity (auditor):** bug / S2 · confidence 0.92 · proven by a check that runs
- **Where:** renderCalibration, index.html line 9427 (Performance, Is the model honest): both.length<100 ? '(too few to call)' : bm<bk ? 'the model is beating the market' : 'the market is more accurate than the model'.
- **Inputs:** 400 seeded logs of 300 graded picks where the model and the market are equally good by construction (the same noise around the true chance); and one log at 99 and 100 picks.
- **The app gives:** A winner is named in 400 of 400 logs: 'the model is beating the market' 196 times, 'the market is more accurate than the model' 204 times. In 94 of the 400 the two printed scores are the same number (for example 'model Brier 0.233 vs market 0.233 — the model is beating the market'). At 99 picks '(too few to call)'; at 100 picks the verdict, on 0.237 against 0.243.
- **Right:** With no real difference the line should say so. The Watch study answers the same question the careful way (the difference, game by game, with a 95% range, and 'No verdict: the range includes zero').
- **Why:** A bare comparison of two averages with no range is right half the time when there is nothing to find. The Brier and log-loss numbers themselves are correct (recomputed: 746 picks, 0.236 / 0.666 / 0.237).
- **Money effect:** None directly; it is the line an owner would lean on when deciding whether to trust the model more than the 0.35 weight allows.
- **How often:** Every time the section has 100 or more picks with a market price.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/honest-word.js (output honest-word.out).
- **Proposed fix (not applied):** Print the difference (market minus model) with a range from re-drawing whole games, as watchStats does, and name a winner only when the range leaves out zero; otherwise 'no clear difference yet (N picks)'.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: Narrower: it shows its count and sits outside the places the written careful-wording rule names, so it does not break the dev-mode rule. What is left is a misleading word: 'beating' between two equal printed scores. I rate it S3/S2-low, not S2. No money or decision rests on it today.
  - Its own check: renderCalibration (line 9408, Performance › 'Is the model honest?'): '(N picks with a market price): model Brier X vs market Y' then both.length<100 ? '(too few to call)' : bm<bk ? 'the model is beating the market' : 'the market is more accurate than the model'. A winner is named on any strict difference, and an exact tie goes to the market. My own simulation (brier-tie.js), with the model and the market equally good by construction, 1,000 logs each: 100 picks gives 504 'model beating' and 496 'market more accurate', the two printed scores are the same number in 99 logs, and a paired 95% test would name a winner in only 46. 300 picks: 499/501, same printed number in 178, paired test 39. 746 picks: 520/480, same printed number in 256, paired test 51. So the line names a winner every time, and in 10–26% of logs it does so between two equal printed numbers. T …
  - How often for you: Every look once 100 such picks exist. With 746 picks, about 1 visit in 4 shows equal printed numbers with a winner named.
  - Your saved history: None saved.
  - Smallest safe fix: Display only: a winner only when a by-game paired range (as watchStats does, with rng32) leaves out zero, otherwise 'no clear difference yet (N picks)'. At the very least, 'about even' when the two scores round to the same number. Test: equal printed scores must not say 'beating'.
  - Risks in the fix: None to the math. No test pins the strings (grep of tests/ for 'beating the market' and 'too few to call' finds nothing). Owner's word needed for new wording.
  - Tests that pin today's behaviour: None found.

### STATS-7 · The Scorecard counts a bet with no game text as its own game, even when its event is saved; Reports counts the same bets as one game

- **Kind / severity (auditor):** bug / S3 · confidence 0.9 · proven by a check that runs
- **Where:** gkOf, index.html line 9446 (the key is the game text plus the day; with no game text it is the bet's own id) against rpGameKey line 11774 (event id first, then game text plus day plus start hour).
- **Inputs:** Ten settled props on one game saved without game text but with gameInfo.eventId (or Novig's nvEvent), as a book fill can be; and a doubleheader (same teams, same day, 1 PM and 7 PM).
- **The app gives:** Scorecard: 'from 10 separate games' (Reports: 1 game). Doubleheader: Scorecard 1 game, Reports 2.
- **Right:** One game, as Reports counts it, so the range re-draws those ten bets together ('Bets on the same game move together, so the ranges count each game once').
- **Why:** Two different definitions of 'a game' in one app. Treating same-game bets as separate games makes the Scorecard's ranges a little too narrow for those bets.
- **Money effect:** Small: on the owner's 11/14 export 18 of about 350 bets had no game text. The header's game count and the ranges move slightly; the direction is 'too confident'.
- **How often:** Every bet saved without game text (book fills mostly).
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/misc.js (section 6, output misc.out).
- **Proposed fix (not applied):** Let gkOf use the same key as Reports (call rpGameKey, or take the event id first).
- **Second look: Confirmed, narrower** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Smaller than worded. The doubleheader half needs same-day repeat games, which hardly happen in NBA, NHL or NFL, and MLB is out of season. Only the no-game-text half matters: 18 of about 350 bets on 11/14. It makes the Scorecard's ranges slightly too narrow.
  - Its own check: gkOf (line 9446): key = gameKey(b.game) + '/' + day, and with no game text also '/' + b.id + odds + stake. So each bet without game text is its own cluster, even when gameInfo.eventId or nvEvent is saved. rpGameKey (line 11774) takes the event id first (gameInfo.eventId, eventId, nvEvent), then game, day and start hour. Line 14335 shows Novig fills save nvEvent. The auditor's misc.out section 6 printed 10 vs 1 (event id), 10 vs 1 (Novig event), and 1 vs 2 for a doubleheader. The code agrees by reading.
  - How often for you: About 5% of his bets.
  - Your saved history: None saved.
  - Smallest safe fix: gkOf takes the event id first, as rpGameKey does (or calls rpGameKey).
  - Risks in the fix: The Scorecard ranges shift a little. bootGames seeds from xs.length*7919+G.length, so a change in the game count changes the draw; tests that pin exact ranges (v510-test.js) may need a look.
  - Tests that pin today's behaviour: tests/v510-test.js (block ranges), tests/v507-test.js (rpGameKey).

### STATS-8 · A chance a hair under a band edge is filed under the edge on the board and above it in the saved record; own bets sit in a tab badge but under 'No tab' in Reports

- **Kind / severity (auditor):** bug / S3 · confidence 0.9 · proven by a check that runs
- **Where:** snap.act is saved rounded to 4 decimals (line 7853) while snap.listed.tab is frozen from the unrounded chance (listedOf, line 4259); tabOfChance (line 4214) and passFam allow 1e-9 under an edge, cvBand / cvRow (lines 5073, 5096) allow nothing; tabEdgeStats (line 4236) groups by the saved chance, rpTabOf (line …
- **Inputs:** (a) Chance 54.996%. (b) Model 72.3%, market 30.3%: the blend is 45% on paper and 0.44999999999999996 in the computer (18 of 177 such exact-edge blends land below). (c) An own bet with La Contadora's chance 62% saved.
- **The app gives:** (a) Board: Dado tab, 50-55 band; frozen tab Dado; Reports By tab: Dado. But the log chip says Faint Lean (55-57.5), Reports By band '55-<57.5%', Said vs won 55-60, and the per-tab 'so far' badge counts it under Volado. (b) Board: Suertudo tab (45-50) with an 'Unlikely, under 45%' band header and chip; once saved, 45% everywhere. (c) Badge: Parejo; Reports By tab: 'No tab' (that one is by design, v4.86: an own bet has no tab).
- **Right:** The same band on every screen for one bet. Exactly on an edge all eight screens agree today (15 edges tested: the edge belongs to the band above it).
- **Why:** Rounding the saved chance after the tab was chosen, and two different tolerances at an edge.
- **Money effect:** None: labels only. A count on a tab badge can differ by one from Reports By tab.
- **How often:** (a) about 1 bet in 1,000 for the tabs and 1 in 500 for the 2.5-point rows; (b) only when a blend is exactly an edge on paper; (c) every own bet that has a chance saved.
- **Check that runs:** node /tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/audit/stats/bands.js (sections 1, 2, 3, 3b; output bands.out).
- **Proposed fix (not applied):** Choose the frozen tab from the rounded chance that is saved (round first, then tabOfChance), and give cvBand / cvRow the same 1e-9 allowance as tabOfChance. For (c) say on the badge that it counts every bet by its chance, own bets included.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Part (c) (an own bet under 'No tab' in Reports) is by design: v4.86, an own bet has no tab, as the auditor says. So only (a) and (b) remain: labels, roughly 1 bet in 1,000.
  - Its own check: tabOfChance (line 4214) subtracts 1e-9 at each edge; cvBand (line 5073) uses plain p<.55 and so on. snap.act is saved to 4 decimals after the tab is frozen from the unrounded chance. Auditor's bands.out: exactly on an edge, all screens agree (15 edges). At 0.54996 the board shows Dado / On the Line and the saved 0.55 shows Faint Lean / volado badge. At 0.44999999999999996 the board's band header says 'under 45%' while the tab says Suertudo. The code agrees by reading.
  - How often for you: About 1 bet in 1,000; a count off by one.
  - Your saved history: The frozen snap.listed.tab must not be rewritten on old bets (never rewrite a bet's snap).
  - Smallest safe fix: Round first, then tabOfChance; give cvBand and cvRow the same 1e-9 allowance.
  - Risks in the fix: Labels only. Tests that pin band rows at exact edges must still pass (the edge stays with the band above).
  - Tests that pin today's behaviour: Not searched in depth.

### STATS-9 · Ideas for this area

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · proven by a check that runs
- **Where:** Scorecard, Reports, Performance
- **The app gives:** (1) Three range levels on one question: the Scorecard prints ROI '(90%)' next to Median CLV '(95%)', Reports prints the same ROI at 95%, and the research line's 'hopeful end (90%)' is the 90th percentile (one end of an 80% range). (2) The Performance calibration table says 'model too confident' from 100 picks when the gap passes 5 points; at 100 picks 5 points is one standard error, so chance alone does that about 1 time in 6 for a perfect model (Reports' Said vs won uses the Wilson range, which is the sound way). (3) The signal bonus: on exact ties fl …
- **Right:** One level for one question (or always show both), the Wilson range on the calibration table, ties rounded after snapping to 4 decimals, and the Watch verdict words held back until Directional or prefixed 'so far'.
- **Why:** Each is a small source of mixed messages; none changes a stake.
- **Check that runs:** scorecard-recompute.out (range labels), sent.out (20 tie cases listed), gates.out (Watch rows 2-4).

**Checked and found right (20):**

- Scorecard, every box (scorecard-recompute.js; three seeded logs of 264, 910 and 1,937 rows with free bets, research Makes, extras, gap-research, $0 stakes, typed winnings, partial losses, sold bets, Kalshi fees, pushes, open bets, parlays): which bets are in (same ids as my own rule), games, each bet's profit and CLV, Profit, staked, ROI, Beat the close, Median CLV, Mean CLV, Worst drawdown: equal to my own code to the printed dig …
- Scorecard ranges: my own whole-game bootstrap fed the same random stream lands on the same numbers to 12 decimals. ROI and Mean CLV = 5th and 95th percentile (printed 90%), Median CLV = 2.5th and 97.5th (printed 95%), 10,000 resamples of whole games, seeded (same log, same range). An unrelated generator (40,000 resamples) agrees within 0.2 points.
- Scorecard tables (scorecard-tables.js): the 12 Sport · market rows and the 8 weekly rows (settled, staked, profit, ROI, beat close, median CLV) match my own code.
- Do the ROI ranges tell the truth? Yes (coverage.js, the app's real bootGames and sfBootRatio). Typical clusters (2.1 bets a game, same-game correlation 0.3), 800 histories a line, margin ±2.1 points: the Scorecard's 90% range held the true edge 90.4% / 91.4% / 90.3% of the time at 100 / 300 / 1,000 bets with a true edge of 0%, and 90.1% / 89.6% / 89.3% with +3%; the 95% range (Reports › So far) 93.3% to 96.3%. Other mixes (indepen …
- The 1,000-bet verdict with an honest closing line: true edge zero and median CLV truly zero, it said 'good evidence of an edge' in 0.0% of 400 histories at 1,000 bets and 0.5% at 2,000 (ROI half alone 4.3% and 5.3%, CLV half 2.5% and 2.8%).
- Reports › Edge check (reports-recompute.js, 910-row seeded log): expected profit, actual, eligible count, actual minus expected and its 95% range by game (exact with the same random stream; 2,000 resamples of whole games, percentiles 2.5 and 97.5), expected wins, actual wins, eligible outcomes, the independent SD: all match.
- Reports › CLV: with-a-close count, average, median, stake-weighted CLV, the value proxy, and the beat / even / missed groups (0.1-point band): match.
- Said vs won and the Wilson range: 11 bands, counts, wins, average said, 95% range and the 'said too high / low' flag match my own code; wilson95 equals published values (8 of 10: 0.4902 to 0.9433; 0 of 5: 0 to 0.4345; 5 of 5: 0.5655 to 1; 50 of 100: 0.4038 to 0.5962; 1 of 30: 0.0059 to 0.1667).
- Reports › By (So far), By sport rows: tickets, W–L, unique outcomes, games, risked, profit, ROI, flat $1 ROI, median CLV with coverage, expected against actual: match. The ROI 95% range and the null-centred p value agree with my own bootstrap on an unrelated generator (20,000 draws) within Monte Carlo noise; the Benjamini–Hochberg screen equals my own step-up on 3,000 random sets; the Read word follows.
- Per-tab 'so far' badge (tabEdgeStats): count, wins, expected wins, profit, ROI and CLV match for all 8 tabs; the badge always carries its count (' · N').
- Perfecta minus the other best bets (tierCmp): the ROI and CLV differences match; its 95% ranges (whole games re-drawn inside three kinds of game, 5,000 resamples, mulberry32) agree with my own stratified bootstrap (ROI -2.0 to +37.7 against -2.4 to +38.0 points).
- Performance › Is the model honest: Brier and log loss (746 picks: 0.236 / 0.666, market 0.237) match. Bet result study: 16 rows (average prediction, hit rate with its Wilson range, gap, net) match. Entry-price bands: 7 rows (break-even rate with the fee in, win rate, profit, ROI) match.
- Watch study arithmetic (misc.js): graded, games, pushes, the three Brier scores, log loss, the headline market minus model averaged game by game, the bet-by-bet figure, the $1 ROI (watchRoiOf with a fee) and the Watch CLV: equal to my own code to 12 decimals. Only its range is wrong (STATS-2).
- Stages and gates taken as written, bets AND games (gates.js): Watch 100/50 Directional, 300/150 Useful only with the range clear of zero; Perfecta comparison 100/50, 300/150, 1,000/500, 'extremely preliminary' under 30 bets or 15 games; Reports Read 30/15, 50/25, 100/50 with the many-group check; Said vs won 30/15 and 100/50; the edge-check words as in the v4.91 note; Scorecard stage and segment tags at 100 / 300 / 1,000.
- Who stays out: parlays, research Makes, Just missed, Hail Marys and gap-research bets are in neither the Scorecard's settled bets nor its CLV; a free bet counts for CLV only ('CLV only (free bet)'); a $0 stake is never settled; Watch records live in their own store and never reach the bet log. The 1,000-bet blocks: block 1 is exactly the first 1,000 Scorecard bets placed since 11/11 in the order placed (first p0, last p999), block …
- Bands exactly on an edge (bands.js): at each of 15 edges (45% to 80% in 2.5 steps) the board tab, the board band and row, the log chip, Reports By band, By tab, the 2.5-point steps, Said vs won and the tab badge all put the value in the band above the edge. A chance saved as 0.575 stays in the 57.5 row everywhere. Price bands, American buckets and the synthetic-hold band follow their labels.
- Sentinel score, arithmetic against docs section 7 (sent.js): 14,112 grid cases (Edge 50 x min(1, EV / 6%), halved with no market; Market 20 at break-even, 30 at +4%, 0 at -3%, x 0.85 consensus, 8 with none; Fresh 20 under 3 minutes to 0 at 90): 0 differences; a no-market bet tops out at 53 as written; total capped at 100.
- Signal bonus: 576 cases (rise 0.5 to 8 points, 0 to 120 minutes, sharp and consensus, book moved 0 / 40 / 50 / 60% of the rise): 556 equal my formula, the other 20 are exact ties decided by floating point (STATS-9). The doc's examples give +2 (consensus, 1.9) and +5 (sharp, 4.8); a rebound and a change of source give 0.
- CLV sign and edge cases (clv-cases.js): -110 against a -120 close +4.13%, against +100 -4.55%, against -110 0.00%; +150 against +130 +8.70%, against +170 -7.41%; an empty, missing or unreadable close gives no CLV and is left out with the count shown. The 'market no-vig' close is strict and never positive when the price moved against the bet.
- The resampling generator rng32 is the reference mulberry32 (100,000 of 100,000 draws identical), uniform (chi-square 105 on 99 degrees of freedom over 2,000,000 draws), lag-1 correlation -0.001. pkNormCdf is within 2.1e-7 of the exact normal curve and pkNormInv returns 1.95996 for 97.5%.

**Not checked:**

- Real data: the owner's bet log and Watch records are not available here; everything ran on seeded synthetic logs (the 11/14 figures quoted come from agent-notes/bet-log-evaluation_2026-11-14_v1.md).
- Coverage was measured for the ROI ranges only. Not measured: the Median CLV range, the 'actual minus expected' dollar ranges, the Perfecta difference ranges and the Watch range's own coverage (only its stability against a sound bootstrap).
- marketFamilyOf (the market alias table) and mfEvOf: labels, not statistics; covered by tests/v507-test.js, not re-derived here.
- Watch capture paths that need live prices and the clock (watchCloseScan, watchPolicyRun, watchGrade): only the arithmetic on finished records was checked.
- The calibration points that come from the board's grade history (gradeHistory): only the bet-log path was exercised.
- The research-Makes stop rule (researchState) beyond reading it; the Reports charts (rpChartHtml, rpMonthsHtml, rpBwHtml) and the CSV columns; the Easy-level screens.
- The Worker's /close consensus contents (what BettingPros returns) behind the 'market no-vig' close.

**Noticed outside its area:**

- Worker src/live.js: 'price' for Kalshi, Polymarket US and Novig is the ask on your side (lines 164, 215, 332); it becomes the bet log's closing price (STATS-1). Bid is returned too and n …
- The tab lines for Volado, Parejo and Dado (CONTADORA, index.html lines 3568-3569) say 'the edge is real' with no sample at all, while docs section 5 says an edge is estimated, not guaran …
- Scorecard grammar: 'Not yet — 1 more settled bets'.
- toProb reads a bare number as American odds, so a close typed as '52' (cents) is read as +52 (65.8%), which would make a CLV far too high; not tested further.
- bootQ (index.html line 9439) is never called (dead code).

## improve-app: what would most improve the app for its users (God view and Easy)

### IMP-1 · Warn when the bet log has no backup and sync is off; ask the browser to keep the data

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · by reading only
- **Where:** index.html:11583 (backupLog handler: only prints 'Backed up N bets', stores no date); header #syncChip line 2221 shows '☁ off'; no navigator.storage.persist() anywhere
- **Inputs:** Bet log with sync off
- **The app gives:** The bet log (the receipt book) lives only in localStorage when sync is off (it is off in the practice copy and by default). Nothing records when the last backup was made, nothing nags, and the browser is never asked for durable storage.
- **Right:** Show 'Last backup: never / 9 days ago' in the Bet log header when sync is off, with one calm Back up button, and call navigator.storage.persist() once so the browser is less likely to clear the log.
- **Why:** A browser clear, a new phone or Safari's idle-site cleanup would erase every bet, every closing line and the whole record that the 1,000-bet test depends on. The fix changes no math.
- **Money effect:** Protects the record, not a single bet.
- **How often:** Every user with sync off, every day.
- **Proposed fix (not applied):** Store mbev.lastBackup (ISO time) in the backupLog handler and in the sync success path; show a quiet line in the Bet log More menu header; request persistent storage on first save. Needs no owner decision beyond the wording.

### IMP-2 · On the God card, show the highest price to take in the book's own format (-216), not only 68.4%

- **Kind / severity (auditor):** improve / S3 · confidence 0.85 · proven by a check that runs
- **Where:** index.html:13391 (impTagHtml: 'price 66.7% · OK to 68.4%'); the American limit appears only inside Why this play? ('OK UP TO -216')
- **Inputs:** Practice board, Isiah Pacheco card at 1280 and 390 px
- **The app gives:** Card: 'Over 10.5 · price 66.7% · OK to 68.4%' next to the button '-200 66.7%'. To compare the book's -216 or -195 with the limit the person must convert 68.4% to American odds in their head.
- **Right:** 'OK to 68.4% (-216 or better)' on the card, rounded to the strict side as Easy already does.
- **Why:** The app's own rule is to say exactly what to type at the book. Sportsbooks show American odds, so the limit should be in the same format as the price being compared. Easy already does this; God does not.
- **Money effect:** Fewer mis-compares at the book; no change to any decision.
- **How often:** Every sportsbook card on the board.
- **Proposed fix (not applied):** Append fmtOdds of the strict-side rounding of mx to the card tag (display only). Share the rounding with Easy so K2 (one tick past) is not repeated.

### IMP-3 · Use one name for the price limit on every screen

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · proven by a check that runs
- **Where:** Card 'OK to' (11 uses), Why this play? 'OK UP TO' / 'OK up to' (15), bet form 'pay up to 68.4% max' (7), Polymarket strip 'Cost ≤', Easy 'never worse than'
- **Inputs:** Practice copy: card, Why this play?, I bet this form
- **The app gives:** Four or five names for the same number, in % on one screen and in odds on the next. Raised by the Karens on 11/13 (complaint 12), 11/14 (K12) and still on screen today: the card says 'OK to 68.4%', the form says 'pay up to 68.4% max', Why says 'OK UP TO -216'.
- **Right:** One phrase (for example 'Most to pay') with the price in the book's format and the percent beside it, on card, Why, form, strips, Easy and Learn.
- **Why:** A know-it-all bettor and a newcomer both cannot tell whether these are the same limit.
- **Money effect:** None; avoids mis-reading a limit.
- **How often:** Every card.
- **Proposed fix (not applied):** Pick the word (owner), then replace in one pass with the tests that grep the strings updated. Wording only, no math.

### IMP-4 · Say where the Market number comes from: which books, how many, how old

- **Kind / severity (auditor):** improve / S2 · confidence 0.7 · by reading only
- **Where:** index.html:6337 (tile 'Market': only 'sharp no-vig' or 'consensus no-vig'); FA.mktSrc at 14673 is just 'consensus' or 'your board'
- **Inputs:** Why this play? on any board card
- **The app gives:** Why this play? shows MARKET 68.0% 'consensus no-vig' and nothing else. The market number drives the conservative chance, the stake and the order, but the person cannot see whether it is Pinnacle alone or a 3-book average, nor its age. Pro asked on 11/13 (complaint 5) and 11/14 ('Fair from: Pinnacle no-vig, 40s').
- **Right:** 'Market 68.0% · Pinnacle no-vig, read 40 s ago' or 'average of 4 books, oldest 3 min'.
- **Why:** The fair price is the product the app sells to a buyer; its source and age are the first thing a careful bettor checks. A number that drives money with no source line misleads by omission.
- **Money effect:** None directly; trust and error-spotting.
- **How often:** Every card with a market.
- **Proposed fix (not applied):** Carry the source names and read time that the row already has (or that the Worker returns) into the tile subtitle. If the row lacks the list, ask the Worker to add it. Display only.

### IMP-5 · After Load, say plainly what changed since the last board

- **Kind / severity (auditor):** improve / S3 · confidence 0.7 · by reading only
- **Where:** No code found: grep for 'new since / moved / changed since last' finds nothing for the board; the board is already saved with savedAt in mbev.board and the Why chart saves prices for 3 days
- **Inputs:** Two consecutive loads
- **The app gives:** A new load silently replaces the board. A careful bettor cannot see 'which prices moved, which cards are gone, which are new' without comparing by hand.
- **Right:** One calm line under the header: '6 prices moved (largest: Doncic over 4.5, -140 to -155), 2 cards left the list, 3 are new'. No urgency, no colours of alarm.
- **Why:** Price movement is what a price-checker user cares about, and the data to compute it is already on the device.
- **Money effect:** Helps avoid placing a stale-looking price; no change to stakes.
- **How often:** Every load.
- **Proposed fix (not applied):** Compare the previous saved rows to the new ones by pxKey before overwriting; render one summary line with a Show details toggle. Display only.

### IMP-6 · Tell the person when the typed bankroll no longer matches their results

- **Kind / severity (auditor):** improve / S3 · confidence 0.6 · by reading only
- **Where:** Settings > Stake sizing 'Bankroll $2000.00' (cfg.bank); the log shows +$35.32 settled in the practice data; no code links the two
- **Inputs:** Settings > Stake sizing
- **The app gives:** Stakes are sized from a typed number. After weeks of results the typed bankroll can be far from reality and the app never says so.
- **Right:** A quiet hint on Settings and the Bet log: 'You set $2,000; your log is +$35.32 since you set it. Update it if your account balance changed.' It changes nothing by itself.
- **Why:** Kelly stakes scale with the bankroll; a wrong one makes every stake wrong in the same direction. The hint keeps the decision with the owner (no rule changes).
- **Money effect:** At 10% off the true bankroll every stake is 10% off.
- **How often:** Every user, after the first weeks.
- **Proposed fix (not applied):** Save the date the bankroll was last edited; compare the settled profit since. Display only; wording is the owner's.

### IMP-7 · Clean up the card's chips: a dash with no words, the age twice, four labels for one chance

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · proven by a check that runs
- **Where:** Card header on the board: 'Hold —', 'price read 2m ago' (banner) and 'Price 2m old' (pill); '75 STRONG', 'Solid', '67.5–<70%', 'chance 69.4%'
- **Inputs:** Practice board, first card at 390 and 1280 px
- **The app gives:** On the Pacheco card: a pill that reads 'Hold —' with no words (its meaning is only inside Why: 'the other side has no price read in the last 10 minutes'); the price age shown twice; the same chance written as a score word, a band word, a band range and a percent.
- **Right:** Show 'Hold: not read' or hide the pill when it is only a dash; one age; one band label with the range on hover.
- **Why:** A number or label on screen with no words saying what it is; one thing with several names (Karens 11/13 complaint 9).
- **Money effect:** None.
- **How often:** Every card.
- **Proposed fix (not applied):** Hide the dash-only Hold pill or add a title and word; drop one of the two age displays; keep band range in the title. Labels only, no decision changes.

### IMP-8 · A one-tap 'Re-check this price' on a sportsbook card

- **Kind / severity (auditor):** improve / S3 · confidence 0.55 · by reading only
- **Where:** Card shows '↻ check exchanges' only (exchange prices); a sportsbook price can only be refreshed by loading the whole board or the Sentinels (shopBtn, line 2375)
- **Inputs:** Board card older than 3 minutes
- **The app gives:** A card says 'Price 2m old' but the person cannot re-read just that price before placing; the only refresh costs a whole board load or a Sentinels pass.
- **Right:** A small 'Re-check price' that reads one game's prices through the Worker and updates age, OK to and the card.
- **Why:** Pro on 11/14: speed to a trusted price is what a serious bettor pays for. It also makes the freshness rule useful.
- **Money effect:** Avoids placing at a price that moved; cost is API credits.
- **How often:** Whenever a card is older than a few minutes.
- **Proposed fix (not applied):** Reuse the Sentinels' per-game read for one row. Needs the owner's decision because each press spends Worker calls and credits.

### IMP-9 · Show every 'updated' time in Chicago time like the rest of the app

- **Kind / severity (auditor):** improve / S3 · confidence 0.75 · by reading only
- **Where:** index.html:8806, 8966 and 11235 use toLocaleTimeString with no timeZone ('updated 12:00:00 PM' next to the scores); Reports, the log and the calendar use America/Chicago
- **Inputs:** Device time zone not Central
- **The app gives:** Browser time on three stamps, Chicago time elsewhere. Same as Karens complaint 11/15 #11; still true.
- **Right:** Pass timeZone 'America/Chicago' (or label the zone) on those three stamps.
- **Why:** Away from Chicago (travel, a phone set to another zone) the stamps disagree with kickoff times and the log.
- **Money effect:** None.
- **How often:** Only when the device is not in Central time.
- **Proposed fix (not applied):** Add {timeZone:'America/Chicago'} to the three calls. One line each.

### IMP-10 · Make it installable on a phone and say when the board shown is an old saved one

- **Kind / severity (auditor):** improve / S3 · confidence 0.65 · by reading only
- **Where:** No manifest, service worker or beforeinstallprompt (grep finds none); no 'saved board from ...' wording (grep finds none); only the Old tab after 12 h
- **Inputs:** Phone, no network or a reload
- **The app gives:** On a phone it is a browser tab with an address bar; opening it with no network gives nothing; a reload shows the last saved board with no plain banner of how old it is.
- **Right:** Add to Home Screen (full-screen app), a cached last board and log, and a banner 'Prices saved 3 h ago, not live' whenever the board is not from this session.
- **Why:** Karens 11/14 (phone and Pro) ranked this high; the owner uses it on a phone at the book. The banner also fixes the quiet risk of reading old prices as current.
- **Money effect:** Fewer stale-price mistakes.
- **How often:** Every phone session.
- **Proposed fix (not applied):** A manifest and a minimal service worker that caches index.html only (no new dependency, no CDN); the banner needs no worker. The icon needs the logo: owner decision (a human designer is planned).

### IMP-11 · A place to note each book's own limit (what the book lets you stake)

- **Kind / severity (auditor):** improve / S3 · confidence 0.5 · by reading only
- **Where:** No code found for 'book limit'; Settings has one per-bet cap for all books (the card says 'capped at your max bet')
- **Inputs:** Settings > Books you bet
- **The app gives:** A book that limits the owner to $5 still gets a $10 suggestion; the person does the comparison by hand. Pro asked on 11/13 (complaint 15) and 11/14.
- **Right:** A note per book ('FanDuel: max $5') that the card shows as 'this book allows $5'. The first step is display only; any effect on the stake is a cap and needs the owner's words.
- **Why:** Real accounts get limited; showing it keeps 'what to type' honest.
- **Money effect:** Avoids a bet the book will reject or shrink.
- **How often:** For any limited account.
- **Proposed fix (not applied):** Settings field per book and a card line. Do not size from it without the owner's go.

**Checked and found right (3):**

- Already built, so left out: closing-line value on each bet (Bet log 'Close (same line)' and 'CLV' columns, Reports 'Closing line' block); price age on cards ('Price 2m old', 'price read 2m ago'); Easy '-359 or better' wording, the small-bank message with the amount, keyboard handling (ezKb), Undo toast, history Back (pushState), 'Only save what the book says filled', 'see next'; quiet parlay headline and removal of the daily goal  …
- Fresh look on the practice copy at 1280 and 390 px: board and the Pacheco card, Why this play?, the I bet this form (shows the price, EV 'Worth it +4.1% (model alone +8.0%)', recommended stake, pay up to, best odds across books), Bet log with calendar and day panel, Reports, Parlays, Settings > Your rules at a glance: numbers shown (stake $10.00, wins $5.00 at -200, 66.7%, calendar totals) were consistent on screen.
- Reports and the calendar label their bases (parlay legs counted as picks, settled vs staked) so I did not list them again.

**Not checked:**

- Real phone keyboard, real Worker data (practice copy has fixed data and no network), real settlement.
- Exchange cards (Kalshi, Polymarket) in God view were not opened this pass; Easy was read from notes and code, not re-run.
- Whether the Worker already returns the list of books behind the market (needed for IMP-4); by reading only.
- Speed: no timing was measured; the Speed group is represented only by IMP-8 and IMP-10.

**Noticed outside its area:**

- Known and unchanged: Easy small-bank empty Today needs the owner's minimum-stake decision; dev strings in the customer page need a build step (K7).
- The 'Suertudo 2 · outside your plan' cards are counted in the header's '18 to bet now' while the tab says outside your plan; policy question for the owner, not a math error.

## easy6: independent review of Easy step 6 (v5.24, commit 08ed18c): the six saved-bet fixes N1 to N6  …

### EASY6-1 · With a small bank, Today names $650 as the amount at which a pick lists, but $550 already lists one

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** easyBankNeed (index.html ~5760), shown by ezNoStakeHtml
- **Inputs:** Practice board, money set aside $10, $20, $40, $60 or $100
- **The app gives:** "About $650 or more lists at least one pick."
- **Right:** $550. The real board, re-run at each $50 step, first lists a pick at $550 (Luka Doncic Over 4.5 rebounds, DraftKings, $2.47). With $150 or $200 set aside the app already says $550.
- **Why:** The re-run treats both Luka props (Over 8.5 assists at FanDuel, Over 4.5 rebounds at DraftKings) as live. The real board keeps only one bet per player (glConflict), and it only decides that once both have stakes. At $100 neither has a stake, so neither is marked, and the re-run gives the assists prop $2.47 of the day's room first. The real board at $550 gives that prop $0 and the rebounds prop $2.47.
- **Money effect:** Display only, no stake changes. The person is told to set aside $100 more than needed.
- **How often:** Whenever the small-bank sentence shows and one player has two qualifying props
- **Check that runs:** scripts/bank.js (logs/bank.txt), scripts/bank3.js (trace), scripts/bank4.js (logs/bank4.txt)
- **Proposed fix (not applied):** In the re-run, skip a row once a better row of the same player has taken a stake in that trial; or re-run the real sizing on a copy of the rows with the trial bank
- **Second look: Confirmed** (severity S2, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: Both claims are true and come from the same cause. STAKE-4 shows the amount named too low, or for a pick that never lists; EASY6-1 shows it $100 too high.
  - Its own check: Re-ran bank.js and bank4.js: at $10 to $100 it names $650, and the first amount that really lists is $550; at $150 to $200 it already names $550. Own check e61-check.js: at $550 Luka Rebounds (DraftKings) lists at $2.47, and Assists gets PLAYER EXPOSURE. That is a near-tie in actNet (0.05875 vs 0.05867, inside the 0.0001 tie rule), so the bigger stake wins, as written. At $450 and $500 nothing lists and the sentence disappears.
  - Written decision found: None.
  - How often for you: Easy view with a small bank only: rare for him.
  - Your saved history: None (display only).
  - Smallest safe fix: Same fix as STAKE-4 (replay the one-per-player choice, or re-run the real sizing per trial bank).
  - Tests that pin today's behaviour: v524-fixes2-test.js line 105 (the cause counts).

### EASY6-2 · An order still waiting at the exchange closes What filled?, throws away what was typed and says "already in My bets" when nothing is there

- **Kind / severity (auditor):** bug / S2 · confidence 0.75 · proven by a check that runs
- **Where:** ezHeldNote (index.html ~6019, the new N2 rule row.prior//row.waitOrder//row.removed) and its toast in easyPaintToday
- **Inputs:** Polymarket US pick (Anthony Davis Over 12.5 rebounds), What filled? open with 11 shares at 57 cents typed. myOrders then shows a waiting order on this pick (the unfilled rest of a partial fill), then refresh()
- **The app gives:** At 390 and 1280: the form and the 11 typed shares are gone. Toast: "This bet is already in My bets. Nothing new was saved." The log is unchanged, My bets has no such bet, and the pick has left Today, so Easy can no longer record it.
- **Right:** A waiting order is not a bet in My bets. Either keep the form open with a line such as "An order on this pick is still waiting at Polymarket US. Save only the part that filled.", or say what is true.
- **Why:** N2 was written for a bet placed in another tab (prior). waitOrder and removed mean something else. The same wrong words were already on the Save path (step 4/5); step 6 adds the automatic close that drops the typed numbers.
- **Money effect:** No stake changes. Until the app's own fill sync logs the filled part (or never, if the sync is off), the person is told a real fill is saved when it is not.
- **How often:** Only with an exchange connected and a limit order resting while the form is open
- **Check that runs:** scripts/order.js (logs/order.txt)
- **Proposed fix (not applied):** Close only on row.prior. For waitOrder, keep the form and add the waiting-order line. For removed, use the existing "removed somewhere else" line.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The auditor's 'partial fill' framing is weaker than claimed: a real partial fill also gives a fill record, so the form closes on prior anyway (shown in order2.js fillOnly and fillPlusOrder). The 'until the app's own fill sync logs the filled part' is also true for that prior case, i.e. existing behaviour, not new in waitOrder. Rated S3 (wording and lost typing, no money or decision).
  - Its own check: Re-ran order.js at 390 and 1280: the form and the typed 11 shares vanish and the toast says 'This bet is already in My bets. Nothing new was saved.' while logged stays 16 and My bets has no such bet. My own variant (skeptic-easy6/order2.js, same pick, 390 px): (a) a Polymarket fill record in myFills (a partial fill as the Worker really sends it) with or without the waiting order gives row.prior (fromFill), so the form closes on N2's own prior rule with the same toast and nothing is logged; (b) only a waiting order (no fill record) gives row.waitOrder with the same close and toast. I read how waitOrder is built (index.html 3779-3805): it is set only when there is no prior, from myOrders.orders (the Worker's /mine/orders, Polymarket 'leavesQuantity' = the rest still resting). So the auditor's data is real, but a real partial fill also produces a fill record  …
  - Written decision found: No written decision for waitOrder. N2 (code comment line 6019 and tests/v524-fixes3-test.js line 45) is about a bet placed in another tab or device (prior). Test 6c pins the held note only.
  - How often for you: Uncommon: he places limit orders on exchanges daily, but having the What filled? form open (Easy level, dev switch only) at the moment the order list first shows that order is rare. Easy is a View-as level for him, not his daily screen.
  - Your saved history: Nothing saved or changed: logged count stays the same in every run. No saved history can be wrong because of it.
  - Smallest safe fix: In ezHeldNote close only on row.prior (and removed with its own existing line); for waitOrder keep the form and the typed numbers and add one line: 'An order on this pick is still waiting at <book>. Save only the part that filled.' Or at minimum a different toast for waitOrder: 'An order on this pick is waiting at the book. Nothing was saved.'
  - Risks in the fix: Keeping the form open on waitOrder lets the person save a fill while the order still rests; easyFillSave still refuses on waitOrder ('already'), so the form would need that path relaxed too, or the sentence must say the fill cannot be recorded here until the order list shows it. A wording-only fix is the safe …
  - Tests that pin today's behaviour: tests/v524-fixes3-test.js N2 (prior closes the form), tests/v524-fixes-test.js 6m (already wording on Save path). No test covers waitOrder closing the form.

### EASY6-4 · Save what filled still passes a limit it never named, if the limit appears between the two taps

- **Kind / severity (auditor):** bug / S2 · confidence 0.85 · proven by a check that runs
- **Where:** ezFillSaveUi / easyFillSave (opt.force = !!s.fillForce). The N3 fix resets fillForce only when the person types.
- **Inputs:** Polymarket US pick, 5 shares, the risk-bet limit flag on the row. Tap 1 names the risk limit. With nothing typed, another bet is logged elsewhere, which uses up the day ($43 to $200.50 of $200). Tap 2.
- **The app gives:** Saved at once ($2.94). Only the confirmation says, afterwards, "This fill went past the daily limit."
- **Right:** A limit is passed only on a second tap after its own message (the code comment and review 3 N3 both say so). Review 3 proposed forcing only the stops named on the last tap.
- **Why:** force passes every stop, not just the ones named on the last tap
- **Money effect:** The fill is real, so the record is true. What is lost is the warning before saving: $2.94 over the daily max in this run.
- **How often:** Rare: needs another tab, device or fill sync to log a bet in the seconds between the two taps
- **Check that runs:** scripts/typo.js case F-board (logs/typo.txt)
- **Proposed fix (not applied):** Keep s.fillStops = res.stops and force only those stops; any new stop gets its own message first
- **Second look: By design (your rule)** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Not rare as the auditor says: no other tab is needed, two stops at once is enough. But it is the pinned design, so BY-DESIGN, with a question for the owner.
  - Its own check: Re-ran typo.js F-board: same output as claimed (tap 2 saves $2.94 and says afterwards 'went past the daily limit'). My own check (skeptic-easy6/force2.js) shows the claim is both narrower in cause and wider in reach: no event between the taps is needed. With the day already near its max before tap 1 plus the risk flag, tap 1 names only the risk limit; tap 2 saves and the confirmation says 'went past the limit for riskier picks today and the daily limit', so the daily limit was never named before saving. That is the loop in easyFillSave (opt.force presses up to 4 times through every stop). It is written on purpose: the code comment at lines 6074-6075 says the form 'can stop up to three times in a row ... pressed again and again', and test 1e in tests/v524-fixes2-test.js is literally 'three stops in a row (risk limit, daily limit, a price above her most): th …
  - Written decision found: tests/v524-fixes2-test.js lines 35 and 39 (1b, 1e): second tap saves through all stops and names them afterwards; code comment index.html around line 6074. The auditor cites review 3 N3 ('force only the stops named on the last tap'); I found no such rule in memory or agent-notes (grep), only the N3 reset-on-t …
  - How often for you: Only when his daily or risk limit is already hit and he records a fill on Easy: rare, and he is warned by the first stop plus told afterwards.
  - Your saved history: None: every such fill is saved with the passed limits written in the confirmation note; nothing changes a stake or a decision.
  - Smallest safe fix: If the owner wants it stricter: keep s.fillStops = res.stops and have force pass only those; any new stop gets its own message first. This changes tests 1e (three stops would then need three taps).
  - Risks in the fix: More taps to record a real fill on a limit-heavy day; the owner designed 'one more tap' as the rule. Worth one question to the owner: 'Should one second tap pass every limit, or only the one it named?'
  - Tests that pin today's behaviour: tests/v524-fixes2-test.js 1b and 1e (would fail if a second tap stopped at every unnamed limit again).

### EASY6-3 · The held full form says "The price changed" twice

- **Kind / severity (auditor):** bug / S3 · confidence 0.95 · proven by a check that runs
- **Where:** ezHeldNote (the N6 change s.msg = s.msg ? s.msg+' '+t : t)
- **Inputs:** Sportsbook pick (Luka, DraftKings) whose row moves to -400 after the pane was painted; tap I placed it
- **The app gives:** "The price changed. Check the price at the book and open the full form below. Nothing was saved yet. The price changed. Check the price at the book, then record what you placed. Nothing is saved until you tap Save."
- **Right:** One sentence. The append was meant to keep the "removed somewhere else" note only.
- **Why:** The new code appends to ezPlaced's own moved message, which says the same thing
- **Check that runs:** scripts/held.js (logs/held.txt)
- **Proposed fix (not applied):** Append only when s.formGoneSaid is true
- **Second look: Confirmed** (severity S3, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: none
  - Its own check: Re-ran held.js at 390 and 1280: the note reads 'The price changed. Check the price at the book and open the full form below. Nothing was saved yet. The price changed. Check the price at the book, then record what you placed. Nothing is saved until you tap Save.' Cause read in ezHeldNote: s.msg = s.msg ? s.msg+' '+t : t, where s.msg already holds ezPlaced's own 'price changed' message on this exact path (sportsbook pick moved, I placed it, held full form). Real path: a real button on a real sportsbook pick whose price moves after painting.
  - Written decision found: Test N6c in tests/v524-fixes3-test.js line 72 deliberately appends the held note after a 'removed somewhere else' note, so the append was meant for that case, not for ezPlaced's message.
  - How often for you: Occasional: sportsbook picks (DraftKings etc.) move often; he mostly uses exchanges, which have their own form. Wording only.
  - Your saved history: None: text only, nothing saved.
  - Smallest safe fix: Append only when s.formGoneSaid is true (or when the existing s.msg does not already contain the same sentence).
  - Risks in the fix: Very small; make sure the 'game has started' held note still appends after the price message if both apply.
  - Tests that pin today's behaviour: N6c (keep it passing: it needs removed-somewhere-else + The price changed together).

### EASY6-5 · On a phone the new top toast covers the pick page's Back button for 5 seconds

- **Kind / severity (auditor):** bug / S3 · confidence 0.85 · proven by a check that runs
- **Where:** Step 6 CSS #v-etoday .ez-toast{top:...} (Karens 6), with a toast shown while a pick is open (e.g. "Open the X app on your phone.")
- **Inputs:** 390x844, pick open, the Open-book button of a book with no link
- **The app gives:** The toast spans x 12-378, y 8-52 px; the Back button spans x 12-106, y 6-54 px. elementFromPoint at the middle of Back returns the toast, so a tap on Back does nothing.
- **Right:** Back stays tappable. After Not for me the toast covers no list button (checked), and at 1280 it covers nothing.
- **Why:** The toast was moved to the top and still takes taps
- **Check that runs:** scripts/toast.js (logs/toast.txt)
- **Proposed fix (not applied):** While the pane is open on a phone, place the toast below the pane head, or give it pointer-events:none except its Undo button
- **Second look: Confirmed, narrower** (severity S3, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: Narrower than 'any toast': only the no-link Open-book toast appears while a pick is open.
  - Its own check: Re-ran toast.js: at 390 px the toast spans 12-378 x 8-52 and the Back button 12-106 x 6-54; elementFromPoint at the middle of Back returns the toast; at 1280 nothing is covered. The toast stays 5 s (ezToast: 5000 ms; 8000 with Undo). I traced which toasts appear while a pick page is open: only the 'nobook' button (line 6142, an Open-book button for a book with no link, 'Open the X app on your phone.'); every other toast (skip, undo, price changed, already) shows after the pane closes. ezBookUrl falls back to BOOK_HOME for known books, so the button without a link is rare.
  - Written decision found: CSS comment: toast moved to the top in step 6 (Karens 6). No decision about Back overlap.
  - How often for you: Rare for his books (Novig, Kalshi, Polymarket US, major sportsbooks have a link or home URL); wait 5 seconds or use the phone's own Back.
  - Your saved history: None.
  - Smallest safe fix: While the pane is open on a phone give the toast pointer-events:none except its Undo button, or put it below the pane head.
  - Risks in the fix: Low: the toast has no tappable part except Undo (44 px).
  - Tests that pin today's behaviour: tests/v524-today-test.js and v524-fixes3-test.js check toast position (covered list buttons), not the pick Back button.

### EASY6-6 · Browser Back leftovers: one dead Back in God after a level switch, and a phone pick that Back cannot close after a rotate

- **Kind / severity (auditor):** bug / S3 · confidence 0.85 · proven by a check that runs
- **Where:** ezHist / ezPop (step 6, Karens 7)
- **Inputs:** H1: 390 px, open a pick, easySetLevel('god'), then Back. H2: open at 390, widen to 1280 (a phone in landscape is wider than 760 px), Back, narrow again. H3: reload with a pick open.
- **The app gives:** H1: the {ez:1} entry stays and the first Back in God does nothing (dev app only, so God behaves differently after step 6). H2: the pick is open with no history entry and the next Back leaves the app. H3: one dead Back after the reload.
- **Right:** The entry is removed when the pane stops being a phone page. There is no loop or trap in any sequence: two Backs always leave; Back during a save keeps the pane and saves once; the customer build works; no entry is added at 1280.
- **Why:** ezPop returns early for God and at desktop width without clearing histPushed; easySetLevel does not call ezHist
- **Check that runs:** scripts/hist.js (logs/hist.txt); customer build in scripts/settings.js
- **Proposed fix (not applied):** Call ezHist(false) on a level switch and on a resize past 760 px; reset histPushed in ezPop at desktop width
- **Second look: Confirmed, narrower** (severity S3, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: H1 is dev-only (not in any customer build), as the claim itself notes.
  - Its own check: Re-ran hist.js (all eight cases). H1: level switch with a pick open leaves {ez:1} in history and the first Back in God does nothing (the page does not leave, state goes to null); H1 happens only in the dev app (DEV_APP=true, the View-as switch), so a customer build never has it. H2: ezWide is min-width 760 px, so a phone turned to landscape (about 844 px) counts as wide: ezPop returns early without clearing histPushed, the pick stays open after Back, and after turning back to portrait the next Back leaves the app (nextBackLeft true). H3: after a reload with a pick open, one extra dead Back (2 Backs to leave instead of 1). H4-H8 behave right (no loop, save then Back works, Back during a save keeps the pane and saves once).
  - Written decision found: Step 6 Karens 7 added the Back handling (ezHist/ezPop); no decision about these sequences.
  - How often for you: H1 only him (dev switch). H2 only if he rotates a phone with a pick open (rare). H3 only after a reload with a pick open. No money or saved data involved.
  - Your saved history: None.
  - Smallest safe fix: Call ezHist(false) in easySetLevel and on a resize past 760 px; reset s.histPushed in ezPop when it returns early at desktop width.
  - Risks in the fix: history.back() calls in resize handlers can fire twice; keep s.histIgnore guard and test 1280 and 390 round trips.
  - Tests that pin today's behaviour: tests/v524-fixes3-test.js (Back cases H4-H8 style checks), tests/v524-fixes-test.js.

### EASY6-7 · The typo guard only checks for prices that are too low: 95 cents typed for 59 cents saves on the first tap

- **Kind / severity (auditor):** improve / S2 · confidence 0.8 · proven by a check that runs
- **Where:** ezFillSaveUi (the guard is cv < cc/2 only) plus the first-tap pass of "the most La Contadora would pay"
- **Inputs:** Polymarket US pick, card 57 cents, most 60 cents; 11 shares at 95 cents
- **The app gives:** Saved on one tap: cost $10.49 (over the $10 per-bet limit), price -2057, EV about -34% at La Contadora's chance. The only warnings are the yellow line before and "went past the most" after.
- **Right:** The same one calm question when the price is far above the card
- **Why:** A two-digit swap is a common typo. The task asked only for the downward guard, so this is a design gap.
- **Money effect:** A $10.49 record at a price that did not happen, if it was a typo
- **Check that runs:** scripts/typo.js case T-up (logs/typo.txt)
- **Proposed fix (not applied):** Ask once when the price is far above the card, for example more than 1.3 times the card or 10 cents or more above the most
- **Second look: By design (your rule)** (severity S3, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: Class 'improve', not S2; the person is warned before and after, and has Undo. The auditor's 'over the $10 per-bet limit' is not a stop on a forced fill; it is only the typed cost.
  - Its own check: Re-ran typo.js T-up: 11 shares at 95 cents saved on the first tap ($10.49, -2057). Before the tap the screen already shows the yellow line 'This is above the most La Contadora would pay (60¢). You can still save what really filled.'; after it the confirmation says 'This fill went past the most La Contadora would pay. That was your call' and has the 'Saved by mistake? ... Undo' row (seen in T-seq and my force2 run: undo button present). The EV of -34% in the claim is at her chance, fine, but the record is the person's own fill, not a bet decision.
  - Written decision found: tests/v524-fixes2-test.js line 45 check 1f: 'a price above her most alone (warned on screen) still saves on the first tap, and the confirmation says only that'. Code comment line ~6080: 'a price above her most was warned about already'. The step-6 typo guard was asked only for the low side (Karens 4, comment  …
  - How often for you: Rare: he types the fill price after a limit order at about the card price; a 95 for 59 swap would need a two-digit slip, and the yellow line shows as he types.
  - Your saved history: A typo saved this way is in the log with its true cost field wrong; findable by listing Easy fill bets whose price is more than 30 percent above the card price recorded on the bet (snap) or whose confirmation note says 'went past the most'. None known.
  - Smallest safe fix: Optional improvement: add the same one calm question when cv > 1.3 x card or 10 cents or more above her most (reuse s.fillTypo). Keep the existing 1f case for prices slightly above her most.
  - Risks in the fix: A real market-order fill above the card (thin Polymarket book) would need one extra tap. Changing 1f's meaning needs the owner's word.
  - Tests that pin today's behaviour: tests/v524-fixes2-test.js 1f (fails if a far-above price needs a second tap); T-seq style test for the low guard in tests/v524-fixes3-test.js.

### EASY6-8 · A rebuilt row with the same price stored as a number instead of text is called "the price changed"

- **Kind / severity (auditor):** improve / S3 · confidence 0.7 · proven by a check that runs
- **Where:** easyPlacedSave movedPick (r.offeredRaw !== pk.rowRaw), easyRowFor
- **Inputs:** Pick shown at "-300"; board rebuilt with offeredRaw -300 as a number
- **The app gives:** saved:false, reason 'moved': a false alarm that opens the full form
- **Right:** Treat the same price as the same. No wrong save is possible this way: an in-place price change on the same row is caught, and the same text saves once.
- **Why:** Strict comparison of the raw value. Every source today stores text (fmtOdds), so this is only a guard for later.
- **Check that runs:** scripts/n1.js (logs/n1.txt)
- **Proposed fix (not applied):** Compare the normalized American price on both sides
- **Second look: Cannot happen with real data** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The auditor already says 'every source today stores text'; that is correct, so there is no reachable case.
  - Its own check: Re-ran n1.js: the only way offeredRaw is a number is the script writing nr.offeredRaw=Number(...) by hand. I grepped every assignment of offeredRaw in index.html (about 30): every board row builder goes through fmtOdds (line 3375, 3458 string template, 10251, 10517, 10628, 10751, 10791, 10951, 10963, 10978); fmtOdds (line 3241) returns a string for every input (strings returned as-is, numbers turned into '+120' or '-300', empty into an em dash). The other writers copy an existing row's value (swap/shop restore, lines 3651-3674, 14037-14064), take typed text (aiOddsTxt for the screenshot rows, line 15816), or the editor's own L.odds (line 6470/6872), which is a log-bet shape, not a board row. Boards saved to localStorage and synced to the Worker are JSON of the same strings. So with real data a board row never holds a numeric offeredRaw.
  - Written decision found: None needed.
  - How often for you: Never today.
  - Your saved history: None.
  - Smallest safe fix: Optional hardening only: compare String(a).replace('+','') on both sides. Not needed now.
  - Risks in the fix: None, but adds no value today.
  - Tests that pin today's behaviour: n/a (tests/v524-fixes3-test.js N1 pins the 'moved' price check with text prices).

### EASY6-9 · With $300 set aside Today says only that today's limit is used up, though $550 would list a pick

- **Kind / severity (auditor):** policy / S3 · confidence 0.7 · proven by a check that runs
- **Where:** ezNoStakeHtml / easyNoStakeCause (step 5 rule kept in step 6: a limit that is used up is never answered by a bigger number)
- **Inputs:** Practice board, $300: causes {min:0, day:4, game:1}
- **The app gives:** "today's limit is used up (a safety stop). It resets tomorrow." No amount is named.
- **Right:** Owner's call. The daily limit is a share of the money set aside, so a bigger number does raise it: at $550 a pick lists.
- **Why:** This is a builder's wording rule; I found no owner decision behind it (searched history.md and tiers-and-easy.md). The intent, never inviting a bigger bankroll to get around a safety stop, is sound.
- **Check that runs:** scripts/bank.js (bank 300 line)

**Checked and found right (13):**

- N1: an in-place price change on the row the pane holds is caught (moved, nothing saved). A rebuilt board with the same book and text price saves once at that price.
- Held full form: its own Save makes exactly one bet, with the confirmation and Undo, at 390 and 1280. The feared paint race does not happen in Chromium.
- Undo/Remove matrix, 14 cases each: plain, pending and ? are removed; win, loss, push and sold are refused; fill-linked, autoFrom, edited, changed-stake and changed-price bets are refused; a refused bet always stays in the log.
- Typo guard sequences (20c tap, 25c tap, tap) ask again after each edit and save once. Typing resets both fillTypo and fillForce.
- Strict price rule: 20,000 seeded American and 20,000 cents cases. The named price is always at or under the most, the skip price always over it; -101 after +100 is right. On every practice pick the EV is at or above the 1.5% floor at the named price and below it at the skip price, so the P4 words are true.
- 'The card says N or more; the book calls it Over N-0.5' is right for Overs, Unders and game totals both ways, and absent for moneylines, whole-number lines and Under 0.5.
- The per-bet limit shown in Settings ($10) is the real sMax, and its sentence matches kellyFor.
- Settings refusals through the real box: -50, 9.99, 100000.01, .5 and 1e3 refused; 500, 500., 0500, 10, 100000, 12.5 and ' 700 ' saved.
- The small-bank amount is right from $150 up ($550, matching the real board).
- Keyboard class in Chromium clears after Not now, Back, Escape, a tab switch, a switch to God, and a save; it is never set at desktop width.
- God screens are identical before and after a visit to Easy at 390 and 1280; the new CSS is scoped.
- The customer build (DEV_APP false): Back closes a pick and the second Back leaves.
- tests/v524-fixes3-test.js: 46 passed, 0 failed.

**Not checked:**

- iPhone Safari (WebKit is not installed): whether focusout fires when a focused field is removed. If it does not, the header and tab bar could stay hidden after the form closes by Back or by the N2 close.
- A real Worker order and fill sync (EASY6-2 was driven through the app's own myOrders list), and whether autoAddFromRow would log the partial fill.
- Kalshi picks (the practice board has only a Polymarket US exchange pick) and the Kalshi 'with the fee, at the limit' line.
- Learn wording, tap sizes and contrast beyond the step 6 test.

**Noticed outside its area:**

- At bank $100, Luka's 11/16 game row is flagged 'daily max reached for Sun 11/15's games': the day key comes from the board's slate (rowDay). Not checked further.

## improve-eng: engineering health (storage, speed, tests, errors, dead weight)

### ENG-1 · Settings (bankroll, Kelly, floors) revert silently when storage is full

- **Kind / severity (auditor):** bug / S2 · confidence 0.9 · proven by a check that runs
- **Where:** save() index.html ~12252 (bare try/catch around localStorage.setItem('mbev.cfg')); saveSweet ~6452
- **Inputs:** Storage filled to the last character, then save() with the bank box set to a longer number
- **The app gives:** At full storage the bankroll box shows the new value, nothing is stored, no banner. After a reload the old bankroll is back.
- **Right:** A failed settings save should say so the way the bet log does, and use the same fallback that frees caches.
- **Why:** Project rule: never swallow a save error. Only the bet log follows it. Stakes are sized from the bank, so a reverted bankroll silently changes stakes.
- **Money effect:** After reload stakes use the old bankroll, no warning
- **How often:** Only at the wall (about 2,000 settled bets), but then every settings change
- **Check that runs:** audit/improve-eng/atwall2.js: cfgFull saved '3000' while box '77777777777777', banner null; after reload bank 3000
- **Proposed fix (not applied):** Replace the bare setItem in save() and saveSweet() with lsSafeSet and call saveFailNote(!ok).
- **Second look: Confirmed, narrower** (severity S2, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: It happens only when the free space is smaller than how much the settings text grows (one to a few characters), so only when storage is already at the wall. Same-length or shorter changes are not lost. In the session the stakes follow the box; the revert shows only after a reload.
  - Its own check: Through the real Settings screen (settings-full2.js: typed into the boxes, pressed Tab, reloaded) with 0 characters free: bank 2500 to 12500 (one character longer) was not stored, no banner, and the stakes used 12500 for the rest of the session (cfgRead reads the box). After the reload 2500 was back. But changes of the same length or shorter save fine once the stored settings already hold every field (2000 to 2500 saved; floor 1.5 to 2 saved, and it carried the bank along). With 1 character free, the +1 change saved. The auditor's reproducer also counted the first save growing from 3 fields to all of them (settings-full.js shows even a same-length change failing in that case), which overstated it.
  - Written decision found: None. CLAUDE.md only says 'Never swallow a log save error'.
  - How often for you: Zero today. Rare even at the wall, because other small saves usually leave a few characters free.
  - Your saved history: None. Settings are not stored on bets (snap.fees is a copy taken when the bet was saved).
  - Smallest safe fix: In save() and saveSweet(), save with lsSafeSet and show a message for settings when it fails. Do not call saveFailNote(false) after a successful settings save, because that would hide a still-valid bet-log banner. Give settings their own message: the current banner text names the bet log.
  - Risks in the fix: saveFailNote(false) removes the bet-log banner. Using it for settings could hide an earlier failed bet save. lsSafeSet deletes caches, which is fine. No test pins the current silent behaviour.
  - Tests that pin today's behaviour: None pin it. tests/save-test.js covers only the log and Ignore. New test: fill storage, type a longer bank, expect a message, and after reload either the new value or the message.

### ENG-2 · Storage wall: about 2,000 bets in practice (3,500 at best), reached on day 50 to 80 at 25-40 bets a day

- **Kind / severity (auditor):** improve / S2 · confidence 0.9 · proven by a check that runs
- **Where:** localStorage mbev.* keys; lsSafeSet/LS_CACHES 7804-7807; watchSave 9629; autoSaveBoard 11000
- **Inputs:** Binary search with the app's own saveLog, other keys held at measured sizes
- **The app gives:** Limit is 5,242,880 characters. A saved bet is about 1,550 chars (1,252 to 1,735 when saved, plus about 100 graded). Bets that fit: 3,523 with an empty app; 2,002 with 3,000 Watch shadow records; 1,899 with also a 200-row board and price history; 817 if the grade history also reaches 10,000 entries.
- **Right:** The bet log must always have room; the research and cache keys should give way first.
- **Why:** The log fallback only evicts LS_CACHES (rosters, injuries, weather, scans, price history). Watch records (up to 2.25M chars, cap 3,000), the board, the grade history, removed bets and the sync bookkeeping (about 430 chars a bet with sync on) are not evictable. Every other key swallows its save error without a message; only the log shows a banner, and there is no early warning.
- **Money effect:** No money math changes, but new bets stop being saved after the wall (banner shows, bet is lost on reload)
- **How often:** Certain at the owner's pace: 1,000 bets arrive on day 25-40, the wall on day 50-80 realistic, day 88-140 at best
- **Check that runs:** audit/improve-eng/quota.js, betsize.js, wall.js, wall2.js, atwall.js
- **Proposed fix (not applied):** Let the log fallback also drop Watch sightings, then oldest pruned Watch records, then grade history; cap Watch records by size; warn at 80% used (lsSize exists); longer term move watchObs, board, gradeHistory and price history to IndexedDB.
- **Second look: Confirmed** (severity S1, confidence 0.85, re-ran the check: yes)
  - Corrections to the claim: The auditor's 'about 2,000 in practice' is for sync off. With sync on (the owner uses it across devices) it is nearer 1,300 to 1,700, so the wall comes sooner. 'Banner shows, bet is lost on reload' is right, and with sync on the Worker copy is deleted as well. The day counts depend on how fast Watch records and grade history grow, which I could not measure on his real data. At 30 bets a day and a few hundred already logged, the wall is roughly 1 to 2 months away with sync on.
  - Its own check: Limit measured: 5,242,880 characters (key + value; an emoji counts as 2). Bets saved through the real paths: 'I bet this' + Save gave 1,544 and 1,605 characters (ungraded); '+ Add a bet' moneyline marked Won gave 1,170; a Novig fill through syncFills gave 1,202 (ungraded). Grading adds about 35 to 130 (result, gradedBy, closeLive, closing). With sync on, the sync bookkeeping (mbev.syncMeta) measured about 360 characters per bet (108k for 300 bets). Bets that fit, worked out from these sizes at about 1,450 per bet: lean (sync off, no Watch records, small board): about 3,400 to 3,600, the same as the auditor's 3,523. Typical (sync on, Watch records at their 3,000 cap of about 2.1M, 200-row board, some grade history): about 1,300 to 1,700, lower than the auditor's 2,002, which assumed sync off. Heavy (plus about 10,000 grade-history entries): about 800 or few …
  - Written decision found: memory/history.md line 342 (v3.82): saveLog uses lsSafeSet, deletes the caches first, shows a banner. Nothing written about Watch records, grade history or sync at the wall.
  - How often for you: Zero today. Certain later at his pace. Once at the wall, every new bet is lost on the next reload (and deleted from the Worker with sync on), unless a later save happens to fit.
  - Your saved history: None saved yet as long as no 'could not be saved' banner has appeared. Lost bets leave no record locally. With sync on, a tombstone in mbev.syncMeta (c.log.T) for an id that never was removed by hand would show one. A dry run can list T ids not found in mbev.removed and check them against the Worker's daily backups.
  - Smallest safe fix: (1) Never save a sync tombstone for a log id while the last log save failed: keep a 'log save failed' flag and skip tombstones for log ids. After syncMetaSave frees space, save the log again. (2) Let lsSafeSet for mbev.log also drop Watch sightings, then the oldest pruned Watch records, then old grade-history entries, before giving up. (3) Show a warning at 80% used (lsSize() already exists). (4) Later: move Watch records, board, grade history and price history to IndexedDB.
  - Risks in the fix: Dropping Watch records shrinks the Watch study's sample, so the owner should decide the order. Tombstone logic is shared with removed bets: a real deletion must still go up to the Worker. Never rewrite existing snaps to make them smaller.
  - Tests that pin today's behaviour: tests/save-test.js pins the banner and the cache-first deletion; it has no sync case. No test covers the sync tombstone after a failed save. Needed: a test with a mock Worker, storage fu …

### ENG-3 · Grade history is never pruned and stores every finished board row, with duplicates across slate dates

- **Kind / severity (auditor):** improve / S2 · confidence 0.85 · proven by a check that runs
- **Where:** attachAutoGrades 7485-7507, saveGradeHistory 7473
- **Inputs:** attachAutoGrades on 20 final prop rows, twice under different slate dates
- **The app gives:** One entry of about 180 chars per finished board row, bet or not, keyed with the slate input date. 20 rows became 40 entries after reloading under another slate date. No cap, errors swallowed, whole history uploaded in each board sync (15484).
- **Right:** Bounded size, one entry per game/prop.
- **Why:** At 200 rows a day this is 36k chars a day, the whole quota in about 145 days; 10,000 entries (1.6M chars) cut the room for bets from 3,523 to 2,441.
- **Money effect:** None directly; it uses space the bet log needs
- **How often:** Every board load that has finished games
- **Check that runs:** audit/improve-eng/ghgrow.js and wall2.js (max_gh10k_only 2441)
- **Proposed fix (not applied):** Key by game day, cap by age, or keep per-bucket counts for old rows.
- **Second look: Confirmed** (severity S2, confidence 0.8, re-ran the check: yes)
  - Corrections to the claim: The copies come from loading or restoring the same finished rows on a later calendar day (overnight, or a second device), not from every reload. Side effect worth checking: if the calibration panels and the 'Educated guess' sort count these entries, duplicated rows count twice.
  - Its own check: I reran ghgrow.js: 20 entries became 40, about 179 characters each. The real path, read from the code: initDate (line 12312) puts today's date in #slate on every page load, and a restored saved board is graded again by attachAutoGrades (line 11007) under that new date. So the first open each morning adds a second copy of every finished row from last night's board. Sync also merges the other device's grade history into this one (line 15462) and uploads the whole history with each board sync (15484). saveGradeHistory swallows its error. Nothing ever prunes it. The practice copy has no finished games, so the full path was driven with stubbed box scores.
  - Written decision found: None found in memory/history.md or decisions.
  - How often for you: Every day that the board has finished games when opened.
  - Your saved history: No bets are affected. To see the duplicates, group mbev.gradehistory keys by everything after the first '/' and count groups with more than one entry.
  - Smallest safe fix: Key entries by the game's own day (gameInfo.startISO) instead of #slate, and cap by age or count. Fold old entries into per-bucket counts.
  - Risks in the fix: Changing the key once leaves old and new keys side by side. Any cleanup changes calibration counts, so it is the owner's call. Never touch the bet log.
  - Tests that pin today's behaviour: tests/live-edges-test.js, manual-parlay-test.js, v513-money-test.js, v514-labels-test.js and v515-ai-test.js mention gradeHistory; none pins the key format against a new day.

### ENG-4 · ctDay builds a date formatter on every call: Bet log takes 4.7 s and Reports 2.0 s at 5,000 bets

- **Kind / severity (auditor):** improve / S2 · confidence 0.95 · proven by a check that runs
- **Where:** ctDay index.html 8076 (toLocaleDateString with options per call)
- **Inputs:** Practice copy with 300, 1,500, 5,000 bets
- **The app gives:** 67.6 microseconds per call; renderLog calls it 30,206 times, rpRender 20,917 times at 5,000 bets. Times at 5,000 bets: renderLog 4,686 ms, renderPerf 2,621, rpRender 2,046, refresh 1,487 (x4 on a mid phone).
- **Right:** Same date string with a shared Intl.DateTimeFormat at 1.3 microseconds per call: identical on 100,000 random times.
- **Why:** Profiler shows ctDay as the top self-time function. With only that function swapped: renderLog 3,065, renderPerf 357, rpRender 160, refresh 470 ms. Remaining cost is renderLog drawing every bet with no paging.
- **Money effect:** None
- **How often:** Every Bet log or Reports open; grows with bets
- **Check that runs:** audit/improve-eng/speed2.js, prof.js, ctday.js, speed3.js
- **Proposed fix (not applied):** One shared formatter inside ctDay; later page the Bet log.
- **Second look: Confirmed** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: Speed only; no number is wrong, so S3, not S2. The 'after' times ran second in the same page, which may flatter them slightly. At his few hundred bets the Bet log takes about 0.25 s. It matters from about 1,500 bets, around 5 s on a mid-range phone.
  - Its own check: My own timing (speed.js, my own log built from the practice bets). 1,500 bets: renderLog 1,342 to 672 ms, renderPerf 744 to 26, rpRender 106 to 3, refresh 402 to 75. 5,000 bets: 4,604 to 2,182, 1,840 to 234, 1,387 to 143, 1,259 to 387. The Bet log HTML was the same length both ways. ctDay was called 11,026 times by renderLog at 1,500 bets. Per call: 71.5 vs 1.2 microseconds. Same day string on 304,742 times: every Central hour plus or minus 1 ms from 2025 to 2027, every minute through the daylight-saving weekends, and 200k random times, under device time zones Chicago, Los Angeles and Tokyo: 0 differences. One difference: ctDay(NaN) gives 'Invalid Date' today; the shared formatter throws RangeError.
  - Written decision found: None.
  - How often for you: Every time the Bet log or Reports opens; it grows with the number of bets.
  - Your saved history: None; display only.
  - Smallest safe fix: function ctDay(ms){ return isNaN(ms)?'Invalid Date':CT_DAY_FMT.format(ms); } with CT_DAY_FMT built once. It must be reachable during startup: build it lazily inside the function, or put it on a line that runs earlier, never a const declared further down. Paging the Bet log comes later.
  - Risks in the fix: Without the NaN guard, an unparseable start string (unguarded calls at lines 3762, 12679, 12832, 15914) would throw and could break a whole page render. Startup order rule: no const helper that a render reaches before it is defined.
  - Tests that pin today's behaviour: tests/v524-fixes-test.js, v524-fixes2-test.js, v524-fixes3-test.js and v524-today-test.js use ctDay. Add a check that ctDay(NaN) returns 'Invalid Date' and that the day strings around Ce …

### ENG-5 · Test suite: 55 min one by one, 14.5 min with 4 workers, all 160 pass side by side

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** tests/run-all.js (spawnSync, one file at a time)
- **The app gives:** Sequential cost is about 55 min (sum of per-test times 3,343 s; 12-file sample alone averaged 12.1 s but 8 files take 95-224 s).
- **Right:** A runner with workers and a skip-passed restart.
- **Why:** Ran all 160 with 4 workers: 0 failures, wall 871 s. Same 12 files took 148 s contended vs 145.5 s alone, so no interference. No test opens a port or reads another test's file.
- **Check that runs:** audit/improve-eng/prun.js, prun-4.log, timetests.log
- **Proposed fix (not applied):** Add a worker count and one result line per file; restart skips passed files.

### ENG-6 · Two tests write screenshots to a hard-coded old session folder outside the repo

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · by reading only
- **Where:** tests/v512-screen-test.js:67, tests/v523-ticket-test.js:14,37
- **The app gives:** Absolute scratch paths of one past session.
- **Right:** Write only when an env var points to a folder.
- **Why:** Harmless side by side but not portable.
- **Proposed fix (not applied):** Guard with process.env.SHOTS like the v524 tests.

### ENG-7 · About 9 KB of unused code: 10 functions and 46 CSS classes

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** pickPayHtml, fetchPinnacleMap, bootQ, opSlug, propKey, propKeyOf, matchKeyOf, applyAdvancedFilters, pcCell, lsEdge; classes such as pc-hdr, par-slip, alert-btn, odds-cell, filter-slider
- **The app gives:** Named nowhere else in index.html, tests or docs.
- **Right:** Could be removed.
- **Why:** Under 0.5% of the 1.9 MB file; not worth risk now.
- **Check that runs:** audit/improve-eng/dead.py, deadcss.py
- **Proposed fix (not applied):** Remove in a quiet release if wanted.

**Checked and found right (8):**

- Real quota measured in Chromium: 5,242,880 characters, same for ASCII, accented and symbol text
- lsSafeSet empties caches first (rosters dropped, 1.4k bet saved with 100 chars free, no banner); banner only after caches are gone, and the reload matches what it says (log 16 of 17)
- Board audit and render grow linearly to 1,000 rows (audit 258 ms, render 200 ms; 1.3 s and 1.2 s at 4x CPU)
- Startup to a usable board: about 430-560 ms, 2.0-2.2 s at 4x CPU; file 1.93 MB, 631 KB gzipped
- saveLog of 5,000 bets takes 136 ms
- All 160 test runs pass with 4 workers side by side; no shared ports or files
- Zero page errors, unhandled rejections or console warnings on every tab at 1280 and 390 px; only failed requests are the blocked ESPN core API
- Only 10 functions and 46 CSS classes are unused (under 0.5% of the file)

**Not checked:**

- iPhone/Safari storage limit and speed on a real device
- Sync with a real Worker: syncMeta growth (about 430 chars a bet) is computed from the real functions, not a synced session
- Easy-level screens for console errors (only reached as hidden views)
- A real owner log: the practice fixture bets are 672 chars against 1,452 for a bet saved through addToLog

**Noticed outside its area:**

- The storage-full banner says Tell Claude Code in God level only; fine for the owner, not for customers

## La Guardia: security and privacy (share endpoint v3.48, keys and passphrase, Easy level, HTML injec …

### GUARDIA-1 · A bet-log backup file you restore can run a program inside the app and read the passphrase

- **Kind / severity (auditor):** bug / S1 · confidence 0.95 · proven by a check that runs
- **Where:** index.html srcTagCore line 9269 (b.autoFrom not escaped, also inside a title attribute); csvDays line 11630 (value="'+d+'" with the bet date not escaped); restore handler line 11602 (logged.push(b) with no checks); board row kind line 4675 (r.kind not escaped). No Content-Security-Policy anywhere.
- **Inputs:** A Back up bet log JSON whose bet has autoFrom or date = x"><img src=x onerror="...">; owner presses Restore bet log and picks it.
- **The app gives:** Says 'Restored 1 bet.' and the script runs at once. In the test it read the (fake) passphrase from localStorage mbev.pass in both variants (autoFrom and date). Nothing stops it sending the passphrase, the sync hash, the Odds API key or the log to any site.
- **Right:** Text from a file must be shown as text: esc() at those spots, and the restore must keep only known fields with the right type.
- **Why:** esc() exists and covers almost every field (board rows 31 fields and bet log 30 fields tried one at a time and all together; only autoFrom, date and kind slipped through). With no CSP, one slip is enough to run a script.
- **Money effect:** None directly. A stolen passphrase opens /mine/fills and /mine/orders (his exchange trades), the AI budget ($5/day) and the share route; the sync hash plus passphrase opens the cloud copy of the log.
- **How often:** Only if he restores a file he did not make. Rare today (only he makes backups); real once boards or logs are exchanged between people.
- **Check that runs:** S/audit/guardia/xss-exec.js -> backup file autoFrom: scriptRan true, readPassphraseFromStorage FAKE-PASSPHRASE-FOR-TEST; backup file date: same. Found with xss2.js log (names exactly autoFrom and date) and xss3.js. The kind field: markup elements w …
- **Proposed fix (not applied):** esc() at lines 9269, 11630, 4675; whitelist and type-check fields in the restore (date ^\d{4}-\d\d-\d\d$, autoFrom kalshi/poly/novig, kind from a fixed list); add a CSP meta with connect-src limited to the Worker, ESPN and book hosts; add ' to esc().
- **Second look: Confirmed** (severity S1, confidence 0.95, re-ran the check: yes)
  - Corrections to the claim: Add the 12929 ESPN abbreviation sink. kind at 4675 is proven to run, but only in table view with rejects shown. date runs only when the bet has dateSet or no start time.
  - Its own check: Real Restore button through the file chooser (restore-xss.js, restore-xss2.js). - autoFrom: the script runs at once, reads the fake passphrase, and runs again on every reload. The bet is saved in mbev.log, so it is a stored script that sync also copies to his other devices. - date: runs when the bet's day comes from date (dateSet true, or no start time). The attacker writes the file, so this can be reached. - Escaped, nothing ran: 14 other text fields, name, kind on the Bet log, every snap text, parlay legs and market. - kind on the board (line 4675): runs when cards are off and Show the rejects is ticked (board-dbg2.js ran=true). It did not run in the default card view. - New sink: the ESPN team abbreviation at line 12929, in the + Add a bet Team list. The script ran (espn-where.js). - Other doors, escaped: Paste, book fills and orders, ESPN names, detail …
  - Written decision found: none
  - How often for you: Near zero today: only he makes his backups and boards. It becomes real once files are exchanged with other people or the app is offered to others.
  - Your saved history: His saved log could hold such a row only if he restored someone else's file. A read-only console check (dry-run-log-check.js) lists any bet whose autoFrom is not kalshi/poly/novig, whose date is not YYYY-MM-DD, whose kind has < > " or ', or that has markup anywhere. It changes nothing.
  - Smallest safe fix: 1. esc() at 9269-9270 (autoFrom in the text and in the title), 11630 (the date in option value), 4675 (r.kind) and 12929 (tt[k]). 2. In the Restore handler, and on rows that arrive by sync, keep autoFrom only if it is kalshi/poly/novig, date only if it matches ^\d{4}-\d\d-\d\d$, and kind only from the fixed list. 3. Optional: a hash-based CSP. 4. Test: restore one file per poisoned field, and open a board with a poisoned kind in table view with rejects shown. It must run before the fix and not after.
  - Risks in the fix: No test pins the current restore (no test file uses restoreFile or restoreLog). A strict script-src 'self' would break the app; the auditor's connect-src-only CSP would not break it, but would not stop a script from running either. A hash CSP must be recomputed on every edit of the inline script (a test can c …
  - Tests that pin today's behaviour: none for restore; add-bet-test.js and own-bets-test.js use abTeam (escaping does not change normal abbreviations)

### GUARDIA-2 · The passphrase cookie is sent to GitHub Pages (props.0xbeta.dev) and any other *.0xbeta.dev site on every page load

- **Kind / severity (auditor):** bug / S2 · confidence 0.95 · proven by a check that runs
- **Where:** index.html lines 10207-10208: document.cookie='mbev_pass=...; domain=.0xbeta.dev; path=/; secure; samesite=lax; max-age=31536000' (not HttpOnly, set from JavaScript). The page host props.0xbeta.dev is inside .0xbeta.dev.
- **Inputs:** Live app on props.0xbeta.dev with cookie mode on (the Worker sends x-auth-cookie: 1).
- **The app gives:** The request for https://props.0xbeta.dev/ carries Cookie: mbev_pass=<passphrase> (carriesPassphrase true in the test). The cookie lasts 365 days and any script on any sibling subdomain can read it.
- **Right:** The passphrase should reach only api.0xbeta.dev, ideally in an HttpOnly cookie set by the Worker, or no cookie mode.
- **Why:** A host-wide cookie is attached to every request to every subdomain, including the static page host run by GitHub. The rule says the passphrase must not leave the owner's own Worker.
- **Money effect:** None seen. GitHub (CDN and logs) learns the passphrase each page load; it unlocks /mine/fills, /mine/orders, AI spend and shares. Chains with GUARDIA-7.
- **How often:** Every page load while cookie mode is on (the live setting).
- **Check that runs:** S/audit/guardia/canary.js (pageHostCookies: [{url https://props.0xbeta.dev/, cookieNames [mbev_pass], carriesPassphrase true}]); cookie-stay.js prints domain .0xbeta.dev, secure true, httpOnly false, sameSite Lax, expires 365 days.
- **Proposed fix (not applied):** Worker sets Set-Cookie with Domain=api.0xbeta.dev; HttpOnly; Secure; SameSite=Lax from a small login call; or drop cookie mode (the 7,200 s preflight cache already cuts most of the cost).
- **Second look: Confirmed** (severity S2, confidence 0.92, re-ran the check: yes)
  - Corrections to the claim: Calling it 'GitHub learns it' overstates what was shown: GitHub receives it in every request; whether it is logged is unknown.
  - Its own check: cookie-scope.js: the frozen app served at https://props.0xbeta.dev inside the browser, with a stand-in Worker that answers x-auth-cookie: 1. - After cookie mode turns on, the cookie is domain .0xbeta.dev, path /, not HttpOnly, Secure, SameSite Lax, 365 days. - A reload of props.0xbeta.dev/ carries mbev_pass. - A request to other.0xbeta.dev carries it, and a script on that page reads it from document.cookie. - A page cannot set a cookie for api.0xbeta.dev only (the browser refuses: canScopeToApiFromPage false). Who can see it today: - GitHub Pages receives it on every page and file request. Whether GitHub logs it cannot be known here. - The Worker. - Every other subdomain of 0xbeta.dev, now or later, and the scripts on it. - Scripts on props: nothing new there, they can already read localStorage mbev.pass.
  - Written decision found: Cookie mode itself is recorded: memory/history.md 512-514; agent-notes/app-review_2026-11-08_v1.md 46-49 'sets the passphrase as the mbev_pass cookie for .0xbeta.dev (Secure, SameSite=Lax) ... no OPTIONS'; Worker src/index.js 23-26. None of these weighs sending the passphrase to the page host or to sibling su …
  - How often for you: Every page load and every file the page loads. Whether other subdomains of 0xbeta.dev exist is not known: the owner can list his DNS records in one minute.
  - Your saved history: Nothing about money or results is stored. If the passphrase may have been seen, rotating it is the only remedy.
  - Smallest safe fix: This keeps the reason for cookie mode (no preflight): 1. The Worker sets the cookie itself with Set-Cookie: mbev_pass=...; HttpOnly; Secure; SameSite=Lax; Path=/ and no Domain, so it is host-only to api.0xbeta.dev. 2. It sets it from one small login call whose body is text/plain. That is a simple request, so no preflight; the reply needs Allow-Credentials true and the exact origin, both already sent. 3. Every later call uses credentials:'include' as today. props and api are the same site, so the browser does not treat it as a third-party cookie. 4. Add …
  - Risks in the fix: tests/worker-calls-test.js line 75 checks /mbev_pass=secret1/ in document.cookie and must change. This is a Worker change, merged only on the owner's go. An HttpOnly cookie cannot be cleared by the page, which is why the logout route is needed.
  - Tests that pin today's behaviour: tests/worker-calls-test.js (cookie mode check at line 75 and the 401 fallback check after it)

### GUARDIA-3 · Clearing the passphrase in Settings does not remove the cookie

- **Kind / severity (auditor):** bug / S2 · confidence 0.95 · proven by a check that runs
- **Where:** index.html line 10208 is the only place mbev_pass is written; nothing deletes it; Settings box line 11256 only changes localStorage mbev.pass. Worker accepts the cookie: index.js 192-200.
- **Inputs:** Cookie mode on, then the passphrase box emptied.
- **The app gives:** localStorage mbev.pass is '' but document.cookie still holds mbev_pass=FAKE-PASS-ABC for the rest of the 365 days, and the Worker still accepts it.
- **Right:** Emptying or changing the passphrase (or a 401) should expire the cookie.
- **Why:** On a shared or sold device, 'I removed my passphrase' is not true.
- **How often:** Every time a passphrase is cleared or changed.
- **Check that runs:** S/audit/guardia/cookie-stay.js: before cookie mbev_pass=FAKE-PASS-ABC; after emptying, stored '' and cookie unchanged.
- **Proposed fix (not applied):** Write mbev_pass=; max-age=0; domain=.0xbeta.dev; path=/ when the box is emptied or on 401.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The claim says 'every time a passphrase is cleared or changed'. A change is wrong: it is overwritten on the next call. Only clearing and the 401 path leave the cookie. The app itself stops sending it after clearing; it is the page host and a typed Worker address that still get it.
  - Its own check: cookie-scope.js: emptying the real Settings box (#screenerPass) stores '', but the mbev_pass cookie stays. - The app's own calls afterwards do NOT carry it. Without the header the wrapper does not add credentials:'include' (appCallAfterClear: cookie false). - Typing https://api.0xbeta.dev/mine/fills in the same browser does carry it, and the Worker accepts it (index.js 197-200). - Page loads keep sending it to props.0xbeta.dev for 365 days. - By reading lines 10207-10208: a CHANGED passphrase overwrites the cookie on the next Worker call. The 401 fallback (line 10211) turns cookie mode off but leaves the old cookie.
  - Written decision found: none
  - How often for you: Rare: only when he empties the box (for example on a shared or sold device).
  - Your saved history: none
  - Smallest safe fix: When the box is emptied, and on the 401 fallback, write document.cookie='mbev_pass=; max-age=0; domain=.0xbeta.dev; path=/; secure'. Test: empty the box, then the cookie is gone.
  - Risks in the fix: None for the app. It is superseded if GUARDIA-2's host-only HttpOnly cookie is adopted, which then needs a Worker logout call.
  - Tests that pin today's behaviour: tests/worker-calls-test.js (cookie mode); none pins clearing

### GUARDIA-4 · Data routes open to everyone if the SCREENER_PASS secret is ever missing

- **Kind / severity (auditor):** improve / S2 · confidence 0.9 · proven by a check that runs
- **Where:** prop-bet-api src/index.js lines 189-201 (locked() returns false when env.SCREENER_PASS is unset); only /share, /ai* and /sync* fail closed.
- **Inputs:** Worker deployed or rotated with SCREENER_PASS missing or mistyped.
- **The app gives:** With the secret set, 12 routes answer 401. With it missing: /mine/fills 200, /mine/orders 200, /mine/selftest 200 (prints raw samples of his fills and orders), /budget 200, /live 200, /src/status 200; only /ai* answers 503.
- **Right:** Fail closed: no passphrase set means locked, except OPTIONS.
- **Why:** The comment's reason (do not break the site on first deploy) is already met by the routes that fail closed; the exchange data should too.
- **How often:** Rare, one operator mistake away (rotation, new environment, wrong secret name).
- **Check that runs:** S/audit/guardia/failopen-probe.mjs (node --import /home/user/prop-bet-api/test/cf-stub-loader.mjs failopen-probe.mjs).
- **Proposed fix (not applied):** locked() returns true when !env.SCREENER_PASS for all routes except preflight.
- **Second look: By design (your rule)** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: None on the facts; the auditor already filed it as 'improve'.
  - Its own check: failopen-probe.mjs re-run gives exactly the claim. With the secret: 12 routes answer 401. Without it: /mine/fills, /mine/orders, /mine/selftest, /budget, /live and /src/status answer 200; /ai/* answers 503. Reading index.js 197-200: locked() returns false when env.SCREENER_PASS is unset. Worker offline tests: ai-test 'fix 1: no SCREENER_PASS → 503 not_locked' passes, and share-test 'no passphrase set on the Worker: never open (503)' passes. So only /ai and POST /share fail closed. deploy.yml line 5 says the Worker's secrets are not touched by deploys.
  - Written decision found: Worker src/index.js 189-191: 'Until the secret exists, nothing is locked, so deploying this can't break the site.' agent-notes/for-augi-worker-api_2026-11-12_v1.md line 24: 'Unset = nothing locked.' Line 243: 'A route missing from dataRoute, SRC_PATHS and SYNC_PATHS is open; set SCREENER_PASS first.' Worth on …
  - How often for you: Very rare: one operator mistake.
  - Your saved history: none
  - Smallest safe fix: If the owner agrees: locked() returns true when !env.SCREENER_PASS, for every route except OPTIONS. This matches what v3.45 already did for /ai and v3.48 for /share.
  - Risks in the fix: A first deploy to a fresh Worker without the secret would show every source as locked (401) until the secret is set. That is the stated reason for the current design. Worker change, merged only on the owner's go.
  - Tests that pin today's behaviour: prop-bet-api test/ai-test.mjs (fix 1, fail closed for /ai), test/share-test.mjs (POST /share 503). Nothing pins fail-open for the data routes.

### GUARDIA-5 · The share code is described as one-time but works for 24 hours, and the app cannot revoke it

- **Kind / severity (auditor):** improve / S2 · confidence 0.9 · proven by a check that runs
- **Where:** prop-bet-api src/share.js lines 3, 32-34 (GET never deletes); src/index.js line 21 Access-Control-Allow-Methods 'GET, PUT, POST, OPTIONS' (no DELETE); app index.html lines 11567-11578 ('reads it once') and 11573 (only POST, no Delete button).
- **Inputs:** Press Send my log, paste the code to El Capataz.
- **The app gives:** A second GET returns the whole log again. The browser preflight for DELETE answers allowMethods GET, PUT, POST, OPTIONS (deleteAllowed false), so only curl with the passphrase can delete.
- **Right:** Delete on first read, or a working Stop sharing button; wording that says what is true.
- **Why:** The code is pasted in chats and screens; anyone who sees it in 24 hours reads every row, stake and result. 256-bit codes are unguessable but not secret once pasted. KV deletes and expiry can also lag about a minute in other locations (documentation, not run).
- **How often:** Every share.
- **Check that runs:** S/audit/guardia/share-probe.mjs -> preflightDELETE {status 204, allowMethods 'GET, PUT, POST, OPTIONS', deleteAllowed false}; share-test.mjs shows GET does not delete.
- **Proposed fix (not applied):** Delete the key after the first successful GET (or second); add DELETE to CORS methods and a Stop sharing button; reword the text.
- **Second look: Confirmed, narrower** (severity S3, confidence 0.9, re-ran the check: yes)
  - Corrections to the claim: The screen does not describe the code as one-time; it says 24 hours, which is true. Only the code comments say 'one-time' or 'reads it once'. The real gap is that the app cannot revoke the code.
  - Its own check: share.js read in full. GET /share/<code> never deletes; the key lives 24 h (TTL 86400). share-test and share-probe show the code still works after reading, and the preflight answers Allow-Methods 'GET, PUT, POST, OPTIONS' (index.js 21), so a browser DELETE is refused; DELETE works only with curl and the passphrase. The app has no Stop sharing button (index.html 11570-11581, POST only). The wording the owner sees is accurate: the button title says 'for 24 hours' (2951) and the result says 'works for 24 hours' (11577). 'one-time' and 'reads it once' appear only in code comments: share.js 2, index.js 11, index.html 11567.
  - Written decision found: share.js line 3: 'GET /share/<code>: the copy, for 24 hours'. The 24-hour life is written down. The missing revoke in the app is not.
  - How often for you: Each time he presses Send my log (occasional). The code goes to Claude Code chats.
  - Your saved history: none
  - Smallest safe fix: 1. Delete the key after the first successful GET, or add DELETE to Allow-Methods and a Stop sharing button. 2. Correct the comments ('one-time', '256 bits': the code has 244 random bits from two UUIDs).
  - Risks in the fix: Delete-on-read: a second read by Claude Code (a retry) would get 404. KV deletes can take about a minute to reach other locations (documentation, not run). tests/v522-share-log-test.js checks the 'Sent 2 bets' wording; prop-bet-api test/share-test.mjs checks that 'GET with the code returns the rows'. Both mus …
  - Tests that pin today's behaviour: prop-bet-api test/share-test.mjs; tests/v522-share-log-test.js

### GUARDIA-6 · Send my log sends everything except notes, including exchange fill and order ids, market tickers, time zone and edit history

- **Kind / severity (auditor):** improve / S3 · confidence 0.9 · proven by a check that runs
- **Where:** index.html line 11569 shareLogRows copies each bet whole and deletes only notes and note; Worker share.js line 21 stores rows as sent.
- **Inputs:** A log with bets read from Kalshi, Polymarket or Novig.
- **The app gives:** No passphrase, sync password, hash, Odds API key or email in the body (fake-secret scan: shareBodyHasSecret false). But it carries fills (fill ids), nvOrders (Novig order ids), nvEvent, fillRef (e.g. KXNFLGAME-26NOV15KCDEN-KC), fillSide, fillOutcome, placedTz, edits with before values, snap.fees, and the rest of the bet fields.
- **Right:** Send an allow-list of what El Capataz needs; the button tooltip says only 'no keys, no passwords, no notes'.
- **Why:** Fill and order ids tie the log to his exchange accounts. They cannot move money (read-only, no keys) but they are account identifiers nobody needs.
- **How often:** Every share.
- **Check that runs:** S/audit/guardia/canary.js (field names listed; canary-sharejson.txt holds the sample).
- **Proposed fix (not applied):** Allow-list the fields; drop fills, nvOrders, nvEvent, fillRef, placedTz and edits[].before. Also the app sends parlays that the Worker silently drops.

### GUARDIA-7 · No limit on wrong passphrases or wrong sync passwords; 4-character unsalted sync hash is the credential

- **Kind / severity (auditor):** improve / S3 · confidence 0.8 · by reading only
- **Where:** index.js lines 197-201 (given !== env.SCREENER_PASS, not constant time, no counter); sync.js line 121 (401 bad_key, no lockout); app syncTurnOn line 15505 (minimum 4 characters, SHA-256('0xbeta-sync:'+password) unsalted, stored as mbev.syncKey and sent as x-sync-key).
- **Inputs:** Someone holding the passphrase (see GUARDIA-2) guessing sync passwords.
- **The app gives:** Unlimited guesses at Worker speed; a short sync password falls in minutes. A wrong sync password learns only bad_key (and that the passphrase was right).
- **Right:** Longer sync password, rate limit on 401s, constant-time passphrase compare.
- **Why:** No rate limiting anywhere in the Worker source (grep: none).
- **How often:** Only under attack.
- **Check that runs:** By reading only (grep of src/*.js and the two lines cited).
- **Proposed fix (not applied):** 12+ character or generated sync password; one Cloudflare rate-limit rule on 401s; constant-time compare.

### GUARDIA-8 · The Odds API key is stored in clear in the browser and goes out in a URL

- **Kind / severity (auditor):** improve / S3 · confidence 0.85 · proven by a check that runs
- **Where:** index.html lines 12186-12192 (localStorage mbev.oddsapi {on,key}); lines 7550 and 7556 (fetch to api.the-odds-api.com/...?apiKey=...).
- **Inputs:** Odds API cross-check turned on with a key.
- **The app gives:** The key never reached any export, clipboard, console, sync document or share in the scan, but it is in the URL of that third-party call and visible in the Network tab, a proxy or an extension.
- **Right:** The rule says no key in a URL; the Worker already has ODDS_API_KEY and /src/odds.
- **Why:** Route it through the Worker and remove the input.
- **How often:** Each cross-check press.
- **Check that runs:** S/audit/guardia/canary.js (oddsKey only in localStorage mbev.oddsapi); sync-doc.js (not in the sync document).
- **Proposed fix (not applied):** Use /src/odds on the Worker; delete the key box and stored key.

### GUARDIA-9 · Share size cap counts characters not bytes; no Origin check; code is logged by Cloudflare

- **Kind / severity (auditor):** improve / S3 · confidence 0.85 · proven by a check that runs
- **Where:** share.js line 17 (text.length > MAX, body fully read first); share.js has no Origin check (ai.js has ORIGIN_OK); wrangler.jsonc observability.enabled.
- **Inputs:** 7.9 million 'é' characters in rows.
- **The app gives:** Accepted, 15.1 MB stored against an 8 MB cap. A POST with a foreign Origin and the cookie is accepted (not exploitable: Lax cookie is not sent on cross-site POST). GET /share/<code> URLs go to Workers Logs in his own account (documentation, not run).
- **Right:** Cap in bytes, Content-Length pre-check, same Origin check as /ai.
- **Why:** Consistency and cost; KV allows 25 MiB so nothing breaks today.
- **How often:** Rare.
- **Check that runs:** S/audit/guardia/share-probe.mjs (sizeCap: status 200, MB 15.1; cookiePostFromForeignOrigin 200).
- **Proposed fix (not applied):** Compare TextEncoder byte length; pre-check Content-Length; add the origin check.

### GUARDIA-10 · Links built from outside data: Moneylines Open book link is unescaped and not scheme-checked

- **Kind / severity (auditor):** improve / S3 · confidence 0.75 · by reading only
- **Where:** index.html line 11422 href="'+r.link+'" (r.link is BettingPros line.link passed through index.js 1205, 1496, 1660); other hrefs use esc() but accept any scheme (5482, 5967, 6380, 13995, 14845, 15098).
- **Inputs:** A moneyline row whose link starts with javascript: or contains a double quote.
- **The app gives:** The link is written as is and would act on click.
- **Right:** Only https:// (or novigapp://) links, escaped, as the AI link already does (line 15626).
- **Why:** Third-party data should never be a script URL.
- **How often:** Needs a hostile or broken upstream value; low.
- **Check that runs:** By reading only.
- **Proposed fix (not applied):** One safeUrl() helper for every href.

### GUARDIA-11 · One shared passphrase opens everything on the Worker, and a customer (Easy) build still calls the owner-only routes

- **Kind / severity (auditor):** policy / S2 · confidence 0.8 · proven by a check that runs
- **Where:** Easy probe with DEV_APP=false (easy-probe.js) requests /mine/fills, /mine/orders, /ai/status, /live, /oddspapi/usage, /src/status, /budget with the passphrase; Worker gates /mine/* and /ai with the passphrase only.
- **Inputs:** A customer build pointed at the owner's Worker.
- **The app gives:** Any customer who knows the passphrase could read the owner's exchange fills and spend his AI money.
- **Right:** A paid version needs its own Worker without /mine and /ai, or a per-user login, before anyone else gets the app.
- **Why:** Today it is not a hole (one person); it is the first thing to settle for the end game. The written plan already says personal features stay out of a paid build.
- **How often:** Not applicable today.
- **Check that runs:** S/audit/guardia/easy-probe.js 'requests' list.
- **Proposed fix (not applied):** Owner decision: separate Worker or accounts for the paid build.

### GUARDIA-12 · Another web page he visits could burn his API budget with one link (Lax cookie, top-level GET)

- **Kind / severity (auditor):** improve / S3 · confidence 0.6 · by reading only
- **Where:** Worker GET data routes accept the cookie with no Origin or Sec-Fetch-Site check (index.js 1735-1741).
- **Inputs:** A page that navigates the browser to https://api.0xbeta.dev/props?...&fresh=1 or /oddspapi/board.
- **The app gives:** Spends BettingPros (50 a day) or OddsPapi calls; the answer cannot be read by that page.
- **Right:** Reject cross-site navigations for cost-bearing routes.
- **Why:** SameSite=Lax sends cookies on top-level GET navigations.
- **How often:** Needs him to visit a hostile page; low.
- **Check that runs:** By reading only; not run (needs a real browser on the real domain).
- **Proposed fix (not applied):** Require Sec-Fetch-Site same-site or the passphrase header on cost-bearing routes.

**Checked and found right (7):**

- Share endpoint (local run, no network): the 15 existing share tests pass; POST needs the passphrase (401 without or wrong, 503 when none is set, fails closed); JSON only (415); rows must be a list (400); code is 64 hex = 244 random bits (UUID version and variant bits fixed), 3,000 of 3,000 codes unique, fixed symbols only at positions 12, 16, 44, 48; stored with expirationTtl 86400 under share:<code> only; Cache-Control no-store o …
- No fake secret (passphrase, sync password, its SHA-256, Odds API key) appears in the CSV, bet-log backup, board file, clipboard, console, visible text, share body, sync document, El Compa context or weekly summary (canary.js, sync-doc.js). The passphrase appears only in the x-screener-pass header or cookie to api.0xbeta.dev, plus the GUARDIA-2 cookie to the page host. The sync hash is only in x-sync-key and mbev.syncKey.
- aiCall sends only {job, input} with small inputs (match sends the fill without its ids; ask sends chosen columns of up to 500 bets; weekly sends totals). The Worker /ai route is fail-closed, has an Origin check, JSON type check, size limits, spend caps before the call, and scrubs the passphrase, API key and sync password from input (ai.js 343-350, 432-460).
- Easy customer build (DEV_APP=false): a stored mbev.viewAs=god, ?viewAs=god, #god, #v-log, ?embed=phone and the app's own easySetLevel('god') all stay Easy; only the 4 Easy tabs are visible; El Compa, Send my log, sync box, CSV, backup, View-as switch hidden or absent; the Back button leaves the app instead of opening a God screen; Easy Settings has no passphrase box.
- HTML injection: board rows (31 string fields) and bet log (30 fields) tried one at a time and all together; a pasted board with markup in a player name and a book name showed as text and ran nothing (xss-paste.js); ESPN names, AI answers (aiAsk, aiMatchAsk, aiWeekly), El Compa text (compaRich escapes first, links http(s) only) and the AI source link (http(s) and only pages the search returned) are escaped in the places read. Only  …
- Sync: stored in one Durable Object (bets-v1), compare of the sync hash is constant time, both passphrase and sync password are needed, a wrong sync password learns only bad_key; the sync document holds the log, parlays, results, cfg (books, bank, version), schedule and AI data points and no key or passphrase.
- No committed secrets in either repo (searched for key shapes and private keys; the only long hex is the SHA-256 of the empty string). Upstream API keys are used only in request headers or the upstream URL and error texts are scrubbed (sources.js 27, oddspapi.js 21). Password inputs are type=password and the screen shows only 'passphrase saved'.

**Not checked:**

- The live Worker and real Cloudflare behaviour: KV propagation delay after DELETE or expiry, what Workers Logs record, any WAF or rate-limit rule already set in the dashboard, GitHub Pages response headers.
- Whether the board row kind field can run a script by itself (markup was created in the all-fields run, no clean script run from kind alone), the Open board file door and the Import tickets door (lcImpSave) beyond the fields listed, and screens that …
- Real-browser behaviour of the Lax cookie cross-site GET (GUARDIA-12) and clipboard permission prompts.
- Content of the real /mine/selftest screen output (Settings, line 15133): read only; it prints raw upstream samples (fill and order ids) behind the passphrase, no keys.
- The report.md file asked for in the brief could not be written (the tool refused report files); this structured answer carries the full content, and every check script is in the folder below.

**Noticed outside its area:**

- shareLogRows sends parlays that the Worker silently drops (share.js keeps only rows): data loss in the note, not a leak.
- If a Stop sharing button is built, Access-Control-Allow-Methods in index.js line 21 must also list DELETE (same fix as GUARDIA-5).
- The bet field named apiKey in the log is a board row key (e.g. oldp14), not a secret; the name is misleading and may alarm a reader.

