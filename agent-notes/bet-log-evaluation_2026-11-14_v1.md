# Bet log evaluation · data to 2026-11-14 3:54 PM

Ref: CC-2026-11-14-13 · from El Capataz (Claude Code) · times America/Chicago

## At a glance

- **You are up $43.07 on 333 settled bets** ($693.59 staked: about 6 cents per dollar). With this many bets, luck alone could still hide a losing record.
- **Bovada made +$63.86 on 26 bets you typed in,** which no book feed checks. All the other books together: −$20.79.
- **The app's Scorecard (322 bets) is +$21.95, 678 settled bets short of its 1,000-bet test.** Nothing is decided before then.
- **La Contadora's chances look honest so far** (18 won where she expected 17.81), and your prices are about even with the last price before each game.
- **Records:** 4 show a small fix (−$0.90 in all) and 23 need a look (section 6).
- **Your middle-category question** is answered in the middle-category report, CC-2026-11-14-14: since 11/11 Volado is 9 won, 4 lost, +$21.20, too
  few bets to tell skill from luck.

From your bet log backup (saved Sat 11/14 3:54 PM, app v5.04): 353 tickets, 20 removed, and 7,272 board sightings (not used for results). It was read on
this computer only: nothing was sent anywhere and nothing in the app changed. This is a record of how the bets went, not betting advice. How it was checked
is in Appendix G; the long tables are in the appendices at the end.

**Words used**
- **Ticket and outcome:** a ticket is one bet as logged. An outcome is one result, counted once even if you hold two tickets on it.
- **Odds:** +117 means $1 wins $1.17; −117 means $1.17 wins $1.
- **Prop, moneyline, spread, total, parlay:** one player's stat; who wins; win by more than the line; the combined score over or under; several picks on one
  ticket, all of which must win.
- **Push, void, sold, free bet:** a tie, stake back; cancelled, stake back; cashed out early; a bonus bet that costs you $0.
- **Exchange and fill:** an exchange is a book where you buy shares from other people (Novig, Polymarket US, Kalshi and others); each share pays $1 if it
  wins. A fill is the book's record that your order went through.
- **ROI:** profit ÷ money staked. +6.2% means 6.2 cents of profit per dollar bet.
- **95% range:** how far luck alone could move a result with this many bets. If it includes 0, profit and luck cannot be told apart yet. The app finds it by
  re-drawing whole games 10,000 times, because bets on one game win or lose together.
- **SD and z:** SD is the usual size of a luck swing; z is a gap counted in SDs. A gap under 2 SD is ordinary luck.
- **Wilson range:** a 95% range for a win rate that works with few bets.
- **No-vig price:** the market's price with the book's cut (the vig) taken out.
- **Brier score and log loss:** scores for forecasts; lower is better. Always saying 50% scores 0.250 and 0.693.
- **The close and CLV:** the close is the last price before the game. CLV (closing line value) compares your price with it; above 0 means you got a better price.
- **Mean and median:** the average, and the middle value when all are lined up.
- **Worst drawdown:** the deepest drop from a high point to a later low.
- **La Contadora:** the app's careful chance, min(model, market + 0.35 × (model − market)). When the model likes a bet more than the market does, she
  moves only 35% of the way from the market's price toward the model's; she is never above the model.
- **Scorecard:** the app's 1,000-bet test. Its stage words go by settled bets: under 100 "stories", 100–299 "directional", 300–999 "comparison", 1,000
  "evidence".
- **The app's sample words:** Said vs won says "too few to read" (under 30 outcomes or 15 games), "early sample", and from 100 outcomes and 50 games
  "readable, still uncertain". Reports' Expected wins says "extremely preliminary" under 30 outcomes, "descriptive only" under 100, "directional" under 300
  outcomes or 150 games, then "may be informative".

**How the totals fit together.** 333 settled tickets = 325 singles + 8 parlays. The Scorecard uses 322 of the singles: it leaves out the 2 Just missed
extras and the free bet, because a $0 stake has no ROI. The closing-price checks use 323: the Scorecard's 322 plus the free bet, which still has a price to
compare. Wins and losses use settled tickets only; open tickets are kept apart. "Now" is the backup's save time.

## 1. The short answer

- **Up $43.07, too early to call it an edge.** 333 settled tickets (158 won, 172 lost, 2 pushes, 1 sold): $693.59 staked, +$43.07, ROI +6.2%.
  Re-drawing whole games, the 95% range is −8.1% to +20.7%, so losing money is still inside it. The Scorecard's own set (322 bets: no parlays,
  extras or free bet) is +$21.95 (+3.2%), stage "Comparison", 678 bets short of the 1,000-bet test.
- **Bovada carries the profit.** Bovada: 26 tickets, +$63.86 (its 2 parlays made +$21.81 of it). Every other book together: −$20.79 on $641.68
  (−3.2%). Bovada tickets are as you entered them, with no book feed to check them, and 26 tickets in 20 games is not evidence.
- **La Contadora looks honest, not yet proven.** Her frozen forecasts (31 outcomes): 17.81 wins expected, 18 won. Her rule on 266 outcomes (235 older
  ones rebuilt, plus the 31 frozen): 132.24 expected, 123 won. That gap is inside normal luck, and most of it sits in her chances under 45% (14 of 60 won).
  The market's no-vig price was a hair more accurate (Brier 0.2302 against her 0.2323), also inside the noise.
- **Your prices are about equal to the close.** 168 of the 323 settled bets in the closing-price checks have a closing price, all from Novig, Polymarket US
  and Kalshi. Mean CLV +0.27% (95% range −0.65% to +1.22%), and most of that is one bet; the median is 0.00%. You beat the close on 72 of 168; leaving
  out the 25 exact ties, on 72 of 143 (50.3%).
- **Some records need your eye (section 6).** Four show a small fix (−$0.90 in all; profit +$42.17), and 23 more the data check could not settle. The
  biggest open questions are a second Tuli Tuipulotu ticket ($4.27) and Trent Walker's $3.04 to-win ($1.52). None of them changes the answers above.

## 2. Money

Only settled tickets count, and ROI is profit divided by your own money staked (the app's counting rules are in Appendix A). Every range re-draws whole
games 10,000 times with the app's own resampler (`bootGames`) and seed.

| Set | Won–lost | Profit | ROI |
|---|---|---:|---:|
| All settled (333) | 158–172 | +$43.07 | +6.2% |
| Scorecard (322) | 153–166 | +$21.95 | +3.2% |
| Without Bovada (307) | 140–165 | −$20.79 | −3.2% |

- Staked: $693.59, $678.76 and $641.68. Pushes and sold: 2 and 1, 2 and 1, 1 and 1.
- 95% ranges: all settled −8.1% to +20.7% (204 games); Scorecard −10.8% to +17.0% (194 games; the Scorecard tile shows the 90% range, −8.6% to +14.9%);
  without Bovada −17.3% to +10.5% (194 games). The full table, with singles and the exchange books, is in Appendix B.
- Win rate (wins over wins plus losses): 47.9%, Wilson 95% 42.5% to 53.3%.
- Without the 2 biggest wins (the two Bovada parlays): +$21.26 on $691.59 (+3.1%).

**By book**

| Book | Tickets | Profit | ROI |
|---|---:|---:|---:|
| Novig | 254 | −$2.15 | −0.4% |
| Polymarket US | 34 | −$23.71 | −29.8% |
| Bovada | 26 | +$63.86 | +123.0% |
| DraftKings Predictions | 9 | +$5.30 | +20.4% |
| Kalshi | 6 | −$3.31 | −29.2% |
| DraftKings | 2 | +$1.65 | |
| Polymarket | 1 | +$1.43 | |
| FanDuel Predicts | 1 (free bet) | $0.00 | |

95% ranges: Novig −16.2% to +15.1%; Polymarket US −67.0% to +3.1%; Bovada +55.6% to +206.5%; DraftKings Predictions −54.0% to +64.3%; the rest too few.
Records and stakes are in Appendix B. Bovada singles alone: 24 tickets, +$42.05 (+84.3%, 95% range +29.5% to +129.3%, 18 games). Its 2 parlays: +$21.81.
Bovada's is the only book range above zero. These money tables cut 49 groups, and one or two ranges clearing zero is about what chance alone gives.

**By bet kind**

| Kind | Tickets | Profit | ROI |
|---|---:|---:|---:|
| Props | 205 | +$56.07 | +13.7% |
| Spreads | 37 | +$22.32 | +23.3% |
| Parlays | 8 | +$21.22 | +165.4% |
| Totals | 30 | −$20.27 | −26.3% |
| Moneylines | 53 | −$36.27 | −36.4% |

95% ranges: props −3.6% to +30.3%; spreads −19.5% to +60.1%; parlays −40.9% to +520.3%; totals −65.9% to +18.6%; moneylines −64.5% to −6.0%.
The moneyline range sits below zero. Treat it as something to watch, not evidence: 53 tickets, and one of 49 groups.

By time, sport, stake size and band, no slice says anything yet; they are in Appendix B.

**Open tickets** (not counted above): 20, with $35.70 staked: 12 with no result yet and 8 marked pending. At 3:54 PM, 2 were in play
($1.99: Dawson Mercer and Kyle Connor) and 18 had not started ($33.71). None of them counts as lost. If every one wins, they add +$35.93.
No open ticket is a free bet.

Special tickets, the largest results, the worst drawdown and the exchange payouts are in Appendix C.

## 3. Is La Contadora honest? (said vs won)

La Contadora's chance is the app's careful chance: min(model, market + 0.35 × (model − market)). Honest means two things here: when she
says 55%, about 55% of those bets win; and over time the profit she expects shows up.

**The app's own test: Said vs won, calibration-v1.** It uses only bets with her chance frozen when saved (`snap.act`), saved before the
game, one per outcome. All of them are from 11/10 on.

| Her chance | Outcomes | She said | Won | Wilson 95% |
|---|---:|---:|---|---|
| 45–50% | 1 | 49.8% | 1 (100%) | 20.7% to 100% |
| 50–55% | 13 | 52.8% | 8 (61.5%) | 35.5% to 82.3% |
| 55–60% | 4 | 56.7% | 1 (25.0%) | 4.6% to 69.9% |
| 60–65% | 11 | 61.7% | 6 (54.5%) | 28.0% to 78.7% |
| 65–70% | 2 | 69.0% | 2 (100%) | 34.2% to 100% |
| **All** | **31 (22 games)** | | **18 won, 17.81 expected** | |

- Wins: +0.19 against her forecast (SD 2.74, z = +0.07). The app's by-game 95% range for won minus expected: −5.18 to +5.34.
- Money: she expected +$3.17 on $56.12 staked (+5.6%); it made +$8.85 (+0.45 SD; by-game range of the difference −$19.77 to +$30.92).
- The app's words for this set: "early sample" (Said vs won) and "descriptive only" (Expected wins, which gives no verdict before 100 outcomes). Said vs
  won flags a band "said too high" or "too low" at any count when its 95% range leaves out what she said; none of these five does.
- Her chance, counted three ways (the same line is in the middle-category report): 35 settled tickets carry her saved chance. 33 of them are Scorecard bets
  (the 2 Just missed extras are out). The app's Said vs won keeps 31: it drops the 4 not saved before a known kickoff (MacKinnon, Buffalo, OKC, and Paul
  George, who has no start time) and keeps the 2 extras.

**A wider look, rebuilt.** Older bets did not save her chance, so the same rule was applied to the model and market chances saved with each bet. It is a
rebuild, not her frozen forecast: 266 outcomes on 160 games, 235 rebuilt plus the 31 frozen (how they were picked: Appendix E).

- Wins: 132.24 expected, 123 won: 9.24 short (SD 7.98, z = −1.16). The app's by-game 95% range for won minus expected is −24.70 to +7.29,
  so zero is inside. The app's words: "readable, still uncertain", stage "directional".
- Where the gap sits: under 45%, all six bands won less often than she said: 14 won of 60, against about 20.55 expected. From 45% up: 109 won of 206,
  against about 111.69. Each band alone is inside its range, and the app calls every band under 45% "too few to read" (the bands: Appendix E).
- Money: she expected +$27.35 (ROI 5.08%) on $538.66; it made +$7.29 (1.35%). That is $20.06 short (SD $42.60, z = −0.47; by-game range
  −$101.40 to +$68.29). The actual profit's own range, −$73.48 to +$94.78, includes zero.
- The model's own EV, a diagnostic only, expected +$45.24 (8.40%) on the same bets (z = −0.89).
- If the market's no-vig price were the truth, these bets would have expected +$17.10 (258 tickets with a market price, $507.25 staked),
  against +$25.83 by her and +$6.37 actual. That is only an average; the profit SD is about $42.

**Accuracy.** On the 255 outcomes where all three forecasts exist, the Brier score is market 0.2302, La Contadora 0.2323 and model alone 0.2382. Her
difference from the market is inside the noise; the model alone is the weakest of the three, just past zero (detail: Appendix E).

**Verdict:** too early. Nothing shows dishonest forecasts, and nothing yet shows an edge over the market's no-vig price.

## 4. Closing line value

The app's rule (`clv`): CLV = (chance implied by the closing price) ÷ (chance implied by your price) − 1. Positive means you got a better
price than the close. "Beat the close" means CLV above zero. The close is the exchange's own last price read before kickoff. Numbers are on the 323 bets
of the closing-price checks (the Scorecard's 322 plus the free bet) unless said. 168 of them have a close (52.0%), all from Novig, Polymarket US and Kalshi;
the other books have none (coverage detail: Appendix F).

**Results** (168 closes, 101 games)

| Measure | Value | 95% range |
|---|---|---|
| Beat the close | 72 of 168 (42.9%) | Wilson 35.6% to 50.4% |
| Leaving out 25 exact ties | 72 of 143 (50.3%) | Wilson 42.3% to 58.4% |
| Mean CLV | +0.27% | −0.65% to +1.22% |
| Median CLV | 0.00% | 0.00% to +0.37% |
| Mean, in chance points | +0.13 | −0.24 to +0.47 |
| Stake-weighted CLV | −0.44% | −1.41% to +0.53% |
| Value proxy (stake × CLV, added up) | −$1.34 | |

- Your Scorecard shows the mean's 90% range: −0.50% to +1.07%.
- 72 above zero, 71 below, 25 exactly zero.
- The mean is mostly one bet: a Polymarket US NBA moneyline at +317 that closed at +203 (CLV +37.62%, won). It is 82% of the sum.
  Without it the mean is +0.05%; trimming the top and bottom 5% gives +0.01%.
- The median is exactly 0.00% in 94% of the app's re-draws, because so many bets close at your price.
- **The Scorecard's warning.** Its verdict box reads today:

  > Not yet — 678 more settled bets before raising stakes or claiming anything.
  >
  > ⚠ The last 100 bets are not beating the closing price (median +0.0%). That isn't luck — check what changed.

  The warning fires when the median of the last 100 closes is zero or below. Here it is exactly 0.00%, with 16 of those 100 at the same price: even with
  the close, not behind it (from the final run of the app's code). Noticed, not changed: at exactly zero, "That isn't luck" says more than the data shows.

**Verdict:** about even with the close. No edge and no leak show yet. By book, sport and kind every range includes zero (Appendix F). There are 168 closes;
by the stage words the app uses elsewhere, under 300 would be "directional".

## 5. What the record can and cannot say yet

- **Is the profit real?** 322 Scorecard bets, 194 games. The app's line: 1,000 bets, then the ROI range (90%) and the median-CLV range (95%) must both sit
  above zero. Stage now: Comparison, 678 to go. Today: ROI −8.6% to +14.9% and median CLV 0.00% to +0.37%. Neither is above zero.
- **Do her chances come true?** 31 frozen outcomes, 22 games. The app's lines: Expected wins gives no verdict before 100 outcomes; Said vs won flags a
  band only when its range leaves out what she said (none does). Words now: "early sample", "descriptive only". Today: 17.81 expected, 18 won.
- **The same, rebuilt.** 266 outcomes, 160 games. "May be informative" needs 300 outcomes and 150 games. Stage now: directional. Today: 9.24 wins short;
  range −24.70 to +7.29.
- **Better prices than the close?** 168 closes, 101 games. The app gives the close count no stage of its own; by its stage words elsewhere, under 300 would
  be "directional". Today: mean +0.27%, range −0.65% to +1.22%.

**It cannot say yet**
- That there is an edge, or a leak. Every overall range includes zero.
- Anything about one book, sport, kind, stake size or band. The money tables alone cut 49 groups; one or two ranges clearing zero
  (moneylines below, Bovada above) is what chance alone gives. Only Novig (254 tickets), props (205), NHL (123) and stakes of $1.01 to $2 (113) have 100
  or more.
- Whether Bovada's +$63.86 is skill: 26 tickets in 20 games, no book feed, and no closing prices in this log.

**It can say**
- The arithmetic: what was staked, won, lost and is still open, to the cent.
- That nothing so far shows the forecasts are dishonest: every band and every expected-against-actual check sits inside its range.
- That the closing-line half of the test sees only bets on Novig, Polymarket US and Kalshi, about half of the settled ones.

A range narrows with the square root of the count: four times as many bets halves its width. Under the Scorecard's rule, nothing is
decided before 1,000 settled bets.

## 6. Data to check by hand

Ids are the first 8 characters; the full ids and every field are in `final_handcheck-out.json` (Appendix G). "Change" is how much the
profit would move if the record is wrong in the way it looks.

**A. The record itself supports a fix.** Together −$0.90: all settled +$43.07 would be +$42.17, singles +$21.85 would be +$20.95, and the Scorecard's
+$21.95 would be +$21.05. With Trent Walker (B) as well, the total would be −$2.42 and the Scorecard +$19.53.
- **6d1455d6** Filip Forsberg Under 0.5 goals, Novig, 11/13. The price was edited after the game, from −217 to −117 (stake $0.99 to $1). The fill, $0.99 for
  1.45 shares, matches −217. The app counts +$0.85; the fill paid +$0.46. Change −$0.39.
- **e96b0f3d** Indiana Pacers ML, Polymarket US +317. The win is counted from the price with no fee; the shares paid less. Change −$0.22.
- **4a680d91** MOH ML, Kalshi −107. The same. Change −$0.10.
- **00bcd9f1** Jared McCain Over 1.5 threes, Polymarket US −161. The same. Change −$0.19.

**B. Needs your ticket or your memory**
- **7ab6402c** Trent Walker Over 3.5 receptions, Bovada +100, $1.52, 11/13. The typed to-win, $3.04, looks like stake plus winnings: at +100 the winnings
  are $1.52. A guess from the numbers: check the Bovada ticket; a boosted price would make it right. Change if so: −$1.52 if $3.04 was the payout.
- **b1793588** Tuli Tuipulotu Over 0.5 sacks, Bovada +135, $3.16, 11/1, "ticket 2". Made with the "+ ticket" button at 8:59 PM, about 6 hours after
  kickoff and 24 seconds after Arik Armstead was voided. Both copies won. Did you place two tickets? Change if so: −$4.27 if only one.
- **a48fbcc7** Bovada 3-pick parlay, 11/4. The odds changed from +1112 to +1266 on 11/5 at 5:57 PM, after its legs had started; graded by hand.
  Change if so: −$1.54 if it paid +1112.
- **538aa2d9** Trae Young Over 3.5 rebounds, FanDuel Predicts +179, $1.25, 11/2. Marked free on 11/6, four days after the game. Change if so: −$1.25 if
  not free.
- **3a277675** Ziaire Williams Over 8.5 points, Novig −106, $1, 11/1. Graded push by hand, but a half-point line cannot push. Did Novig void it?
  Change if so: up to $1 either way.
- **2a98a05a · 69b13257** Two Novig Under 6.5 at +117, $2.14 each (4.65 shares), 11/2. Same Novig market and outcome, saved on two games: COL @ CBJ (sold
  for $2.05 at 6:27 PM) and ANA @ VAN (lost). The ANA @ VAN order came about 31 seconds after that sale (read from the order id, a guess). One market
  cannot be two games. How many positions did you hold, and on which game? Change if so: +$2.14 if one position.
- **e8dfcc24** Brandin Podziemski Over 25 points+rebounds+assists, Novig +104, 10/26. Kept at $1.31; the removed record that held the Novig fill (5f350d1d)
  says $1.47. No start time saved; graded by hand. Change if so: −$0.16 if $1.47.
- **45f32220** DAL @ PHI Under 44.5, Polymarket US −116, 10/25. Stake $4.18, but the fill cost is $3.73 for 7.78 shares. Change if so: +$0.45 if $3.73.
- **695a0f98** Wendell Carter Jr. Under 22.5 points+rebounds, Novig +102, $1.71, won. Placed 11/10 11:59 AM. First saved on another game (ORL @ SAC), then
  given ORL @ UTAH (11/11 8:00 PM, 32 hours later). Right game, right win? Change: check.
- **40f9354d** Paul George Under 23.5 points+rebounds, Novig −108, $1, lost. Placed 11/10 12:01 PM. No game or start time saved (first flagged on
  BOS @ PHI); graded by hand. Right game, right loss? Change: check.

**C. Graded, though the app's own flag says "no ESPN game has these teams at this time".** Check each against Novig's settled list:
- 58ab57c7 VGK @ BOS Over 6.5 (lost)
- f63a4b72 TB @ CHI Over 47.5 (won)
- 0b6706ef DEN @ CAR Under 44.5 (lost)
- 2a98a05a ANA @ VAN Under 6.5 (lost; also in B)
- 3f0fe9f3 PHO @ GSW Under 227.5 (lost)
- 35d12ec9 New Mexico @ Nevada Over 38.5 (lost)
- 5b1284ba Georgia State @ Appalachian State Over 55.5 (won)
- 0bdd4055 NOP @ LAC Over 230.5 (won)

**D. Open, and the app may not grade them:**
- 3f81b9d6 WVU −2.5 (Novig, 11/14 4:30 PM, no sport or game saved)
- 7bf0447c Dawson Mercer Over 1.5 shots on goal (2:30 PM, game not found on ESPN)
- 7e7d2f5f Evan Bouchard Over 2.5 shots on goal (6:00 PM, game not found on ESPN)

**E. Forecast only, no money:**
- 7f78643a Jaylen Wells Over 11.5 points (Novig, 10/26): its market chance, 89.7%, came from the line "+11.5" read as a price.
- be6f743e Browns moneyline (Novig, 10/30): after a v3.19 repair it carries the forecast of another bet (Savion Williams rushing yards).
- Both are in the 266 rebuilt outcomes, not in the frozen 31.

Also checked: no save, placement, edit, sale, void or removal time is in the future. Who graded the 325 settled singles: ESPN 266, Polymarket US 21,
Kalshi 4 and you 33; 1 was sold. You graded all 18 with no game text and all 16 with no sport saved.

---

## Appendix A. How the app counts money

The app's rules (`betProfit`, `heldValue`): only settled tickets count. A free bet's stake counts as $0. A void is stored as a push:
$0 profit, and its stake stays in "staked". A sold ticket is the sale price minus the stake. A typed to-win or lost amount wins over the odds.
Open tickets count $0 until they settle, and a removed ticket counts only if it lost money (none did). ROI is profit divided by your own money
staked. Every range re-draws whole games 10,000 times with the app's own resampler (`bootGames`) and seed, because bets on one game move together.

## Appendix B. Money in full

| Set | Tickets | W–L–push–sold | Staked | Profit | ROI | 95% range | Games |
|---|---:|---|---:|---:|---:|---|---:|
| All settled | 333 | 158–172–2–1 | $693.59 | +$43.07 | +6.21% | −8.1% to +20.7% | 204 |
| Scorecard set | 322 | 153–166–2–1 | $678.76 | +$21.95 | +3.23% | −10.8% to +17.0% | 194 |
| Singles (parlays out, extras in) | 325 | 154–168–2–1 | $680.76 | +$21.85 | +3.21% | −10.9% to +16.9% | 196 |
| Without Bovada | 307 | 140–165–1–1 | $641.68 | −$20.79 | −3.24% | −17.3% to +10.5% | 194 |
| Exchange books (all 6) | 305 | 139–164–1–1 | $637.68 | −$22.44 | −3.52% | −17.3% to +10.2% | 193 |

Exchange books: Novig, Polymarket US, Polymarket, Kalshi, DraftKings Predictions and FanDuel Predicts.

**By book**

| Book | Tickets | Record | Staked | Profit | ROI | 95% range |
|---|---:|---|---:|---:|---:|---|
| Novig | 254 | 121–131, 1 push, 1 sold | $518.28 | −$2.15 | −0.4% | −16.2% to +15.1% |
| Polymarket US | 34 | 10–24 | $79.53 | −$23.71 | −29.8% | −67.0% to +3.1% |
| Bovada | 26 | 18–7, 1 void | $51.91 | +$63.86 | +123.0% | +55.6% to +206.5% |
| DraftKings Predictions | 9 | 4–5 | $26.02 | +$5.30 | +20.4% | −54.0% to +64.3% |
| Kalshi | 6 | 3–3 | $11.35 | −$3.31 | −29.2% | too few |
| DraftKings | 2 | 1–1 | $4.00 | +$1.65 | | too few |
| Polymarket | 1 | 1–0 | $2.50 | +$1.43 | | too few |
| FanDuel Predicts | 1 | 0–1 (free bet) | $0.00 | $0.00 | | too few |

**By bet kind**

| Kind | Tickets | Record | Staked | Profit | ROI | 95% range |
|---|---:|---|---:|---:|---:|---|
| Props | 205 | 112–91, 2 pushes | $408.19 | +$56.07 | +13.7% | −3.6% to +30.3% |
| Spreads | 37 | 17–20 | $95.78 | +$22.32 | +23.3% | −19.5% to +60.1% |
| Parlays | 8 | 4–4 | $12.83 | +$21.22 | +165.4% | −40.9% to +520.3% |
| Totals | 30 | 10–19, 1 sold | $77.03 | −$20.27 | −26.3% | −65.9% to +18.6% |
| Moneylines | 53 | 15–38 | $99.76 | −$36.27 | −36.4% | −64.5% to −6.0% |

**By time** (game day in Chicago time; weeks start Monday, as the app's calendar does)

| Period | Tickets | Staked | Profit | ROI | 95% range |
|---|---:|---:|---:|---:|---|
| October | 91 | $186.42 | +$11.25 | +6.0% | −16.8% to +25.8% |
| November, to 11/14 | 242 | $507.17 | +$31.82 | +6.3% | −11.6% to +23.8% |
| Week of 10/19 | 26 | $78.86 | +$7.05 | +8.9% | −33.3% to +39.2% |
| Week of 10/26 | 94 | $167.72 | +$13.59 | +8.1% | −20.5% to +36.1% |
| Week of 11/2 | 138 | $300.57 | +$2.81 | +0.9% | −22.0% to +24.6% |
| Week of 11/9 (not over) | 75 | $146.44 | +$19.62 | +13.4% | −16.3% to +42.4% |

**By sport** (singles only: 325 tickets, +$21.85; the 8 parlays, +$21.22, have no single sport): NHL 123 tickets, +$17.13 (+6.8%, range −16.7% to
+29.9%). NFL 80, −$7.58 (−4.0%). NBA 80, +$1.50 (+1.0%). NCAAF 23, +$5.61. No sport saved 16, +$5.35. MLB 2, +$2.68. NCAAB 1, −$2.84. Every sport with 3
or more games has a range that crosses zero.

**By stake:** $1 or less: 93 tickets, +$17.98. $1.01 to $2: 113, −$6.37. $2.01 to $3: 56, +$12.31. $3.01 to $5: 64, −$7.53.
Over $5: 6, +$26.68 (range −8.2% to +109.3%). The free bet (1 ticket, $0) is in no bucket. Every range crosses zero.

**By band.** The app bands a bet by La Contadora's saved chance first, then a typed cover, then the model's fair (`bandCover`).
Only 35 of the 333 settled tickets carry her own saved chance; 252 are banded by the model's fair, 38 have no chance saved and 8 are parlays.
So this is mostly a model-chance table. The middle bands since 11/11 are in the middle-category report.

| Band | Tickets | Record | Profit | ROI | 95% range |
|---|---:|---|---:|---:|---|
| Unlikely (under 45%) | 64 | 14–49, 1 push | −$33.86 | −28.6% | −66.2% to +12.6% |
| Coin Flip (45–50%) | 37 | 22–15 | +$26.96 | +31.8% | −11.9% to +71.0% |
| On the Line (50–55%) | 72 | 30–41, 1 sold | −$11.92 | −7.0% | −36.4% to +22.6% |
| Slight Lean (55–60%) | 39 | 19–20 | −$3.57 | −4.0% | −35.7% to +28.3% |
| Lean (60–65%) | 40 | 25–14, 1 push | +$16.84 | +25.6% | −5.3% to +51.7% |
| Solid (65–70%) | 19 | 12–7 | +$4.24 | +19.6% | −34.9% to +69.5% |
| Strong (70–75%) | 7 | 4–3 | +$1.62 | | too few |
| Heavy Favorite (75–80%) | 6 | 4–2 | +$3.02 | | too few |
| High Cover (80% and up) | 3 | 1–2 | −$0.28 | | too few |
| No chance saved | 38 | 23–15 | +$18.80 | +18.5% | −18.4% to +56.1% |
| Parlays | 8 | 4–4 | +$21.22 | | |

The middle-category report counts settled Scorecard bets by the day placed, so its numbers differ only by the set. Its Volado all time (109 tickets,
−$15.39) is On the Line + Slight Lean here (111, −$15.49) without the two Just missed extras (Jaylen Brown +$0.90, Damian Lillard −$1.00). Its Unlikely
before 11/11 (63) is 64 here with the free bet. Its win rate, 46.3%, counts the 281 bets with a forecast; 47.9% here counts all 330 decided tickets.

## Appendix C. Special tickets, largest results, drawdown, exchange payouts

**Special tickets, counted the app's way**
- Free bet: Trae Young, FanDuel Predicts, $1.25, lost: counts $0 (section 6).
- Void: Arik Armstead, Bovada, $2.06: a push, $0. The other push is Ziaire Williams, Novig, $1 (section 6).
- Sold: COL @ CBJ Under 6.5, $2.14 stake, sold for $2.05: −$0.09.
- Removed: 20 tickets, none marked placed, $0 lost. 13 were pending duplicate parlays: 12 Bovada combos removed in bursts on 11/4 and 11/5, and 1
  Polymarket US combo. So removals hide no settled loss.
- Extras ("lucky"): Jaylen Brown +$0.90 and Damian Lillard −$1.00. In the total, out of the Scorecard.
- Second ticket: Tuli Tuipulotu "ticket 2", +$4.27, counted as the app counts it (section 6).

**Largest results**
- Wins: Bovada 3-pick parlay at +1266, $1, +$12.66 (11/4). Bovada 3-pick parlay at +915, $1, +$9.15 (11/5). Carolina Hurricanes (SEA @ CAR)
  at +117, Novig, $7.78, +$9.10 (11/14). Trey Murphy III at +165, Bovada, $4.98, +$8.22 (11/2). Steelers at +114, Polymarket US, $7.18, +$8.19 (10/25).
- Losses: SF @ ATL total at +104, Novig, −$7.29 (10/25). Then six stakes of about $5 lost in full: Florida, Yaroslav Askarov, Saquon Barkley,
  Cedric Coward and Noah Gray ($5 each), and Jayson Tatum ($4.97).

**Worst drawdown:** −$52.23 by the app's own Scorecard rule (Scorecard bets in game-start order). It depends on the order: the re-check got
−$51.76 (bets with no start time placed at noon on their day) and −$45.51 (whole days). Read it as about −$45 to −$52.

**Exchange payouts:** on the 122 won exchange fills (Novig, Polymarket US, Kalshi), the app's profit from the odds is $251.24 and
shares × $1 minus cost is $250.24. The $1.00 gap is mostly four fills: Filip Forsberg $0.39, Indiana Pacers $0.22, Jared McCain $0.19 and MOH $0.10 (section 6).

## Appendix D. Where the first run and the re-check disagreed

Los Chambeadores ran each report first; Los Desconfiados re-checked it. In each case the re-check's number is used.

**Money**
- Games: 204 overall, not 206; 194 on the Scorecard, not 196; 158 in November, not 160. The first run used only part of the app's team-name
  list (`ABBR_FIX`) and split a few games. Ranges moved by 0.3 points or less.
- Won exchange fills: 122, not 117. The $1.00 gap is the same.
- The Tuipulotu copy: in the app, `dupOf` marks a second ticket made on purpose with the "+ ticket" button, not a mistaken duplicate.
- New in the re-check: the Trent Walker to-win looks like the full payout (section 6).
- Words: "moneylines are clearly down" was too strong.
- Drawdown: the re-check could not reproduce −$52.23 and wrote that the app has no drawdown rule. It has one, the Scorecard's
  "Worst drawdown" tile. The final run of the app's code gives −$52.23, the first run's figure.

**Forecasts**
- One older bet (7f78643a, Jaylen Wells Over 11.5 points) used the old saved blend, 76.85%, instead of her rule, 53%. Its market chance,
  89.7%, is itself a data error: the line "+11.5" was read as the price +11.5. With her rule: expected wins 132.24, not 132.48; z −1.16,
  not −1.19; her Brier 0.2323, not 0.2317; expected profit +$27.35, not +$28.15. The first run's one "clear" result (NBA, model worse than
  her) goes away: +0.0192, range −0.0009 to +0.0388.
- Actual profit +$7.29, not +$7.28, and +$6.37, not +$6.36: the app rounds a $2.125 win up to $2.13.
- The "70%+ model" counts came from all outcomes. On projection-only outcomes they are 8 of 13, 3 of 6 and 0 of 1.
- Two caveats were wrong: the old saved sizing chance matches her rule on 298 of 300 bets (not 302 of 304), and the market weight was 0.35
  on all 137 snapshots where it can be checked.
- Dropped as not shown: "the model did worse than a coin flip" (its range is −0.020 to +0.033) and "her 35% pull toward the market helped".
  She is built from the model and the market, so that is not a separate test anyway.

**Closing line**
- 101 games with a close, not 102. 119 settled singles on the live books with no close, not 117 (the first run left out the one old-Polymarket bet and the
  sold ticket).
- The median's range is 0.00% to +0.37% with the app's own resampler, not −0.37% to +0.37%.
- By day, 11/10 had 2 closes of 11 and 11/11 had 2 of 7 (not 2 of 12 and 2 of 6). Other range end points moved by under a point.

## Appendix E. Forecast detail

**How the rebuilt set was picked.** It starts from the 325 settled singles. It leaves out 2 with no snapshot, 38 with no model chance, 14 not saved before
the start, 1 sold and 2 pushes. Keeping one ticket per outcome leaves 266 outcomes on 160 games. Her saved chance is used wherever it exists, so the 31
frozen outcomes are among the 266.

The rebuilt bands, from the app's own `saidWonRows`:

| Her chance | Outcomes | She said | Won | Wilson 95% |
|---|---:|---:|---|---|
| 15–20% | 1 | 19.3% | 0 | 0.0% to 79.3% |
| 20–25% | 9 | 22.6% | 0 | 0.0% to 29.9% |
| 25–30% | 6 | 27.2% | 1 (16.7%) | 3.0% to 56.4% |
| 30–35% | 14 | 32.1% | 4 (28.6%) | 11.7% to 54.6% |
| 35–40% | 16 | 38.1% | 4 (25.0%) | 10.2% to 49.5% |
| 40–45% | 14 | 43.5% | 5 (35.7%) | 16.3% to 61.2% |
| 45–50% | 45 | 48.1% | 23 (51.1%) | 37.0% to 65.0% |
| 50–55% | 88 | 52.1% | 40 (45.5%) | 35.5% to 55.8% |
| 55–60% | 39 | 57.3% | 24 (61.5%) | 45.9% to 75.1% |
| 60–65% | 25 | 62.1% | 15 (60.0%) | 40.7% to 76.6% |
| 65–70% | 5 | 67.1% | 4 (80.0%) | 37.6% to 96.4% |
| 70–75% | 3 | 73.6% | 2 (66.7%) | 20.8% to 93.9% |
| 75–80% | 1 | 76.6% | 1 (100%) | 20.7% to 100% |

**Accuracy.** On the 255 outcomes (154 games, 118 won) where all three forecasts exist:

| Forecast | Brier | Log loss |
|---|---:|---:|
| Market no-vig | 0.2302 | 0.6505 |
| La Contadora | 0.2323 | 0.6554 |
| Model alone | 0.2382 | 0.6698 |
| Always 50% | 0.250 | 0.693 |

- Market minus La Contadora: −0.00215 per outcome (95% range −0.0062 to +0.0016). No clear difference.
- Model minus La Contadora: +0.00588 per outcome (range −0.0008 to +0.0130). Counting each game once, as the app's Watch study does:
  +0.0069 (range +0.0009 to +0.0133). Model minus market, the same way: +0.0105 (range +0.0011 to +0.0203). So the model alone is the
  weakest of the three, just past zero. The app's rule calls that "Directional" only: "Useful" needs 300 outcomes and 150 games with the range clear of zero.
- On the 128 outcomes where the model is its own projection (not a copy of the market): Brier market 0.2423, La Contadora 0.2459,
  model 0.2560. On average the model said 60.8%, she said 55.5% and the market 53.0%; 51.6% won.
- Her chance matches the market's to within 0.005 points on 126 of the 266 rebuilt outcomes (exactly on 119): there the model was the market. About half
  the record cannot tell her apart from the market.

**Caveats**
- "Saved before the game" is not always "saved when the bet was made". Of the 112 rebuilt outcomes with a placement time, 29 had their chance saved more
  than 5 minutes after you placed the bet, and 15 more than an hour after. The longest gap was 19.43 hours.
- These bets were picked because the price looked better than the forecast. Any noise in a forecast then makes the picked bets look
  "said too high" on average. So falling short of expected wins is not by itself a sign of dishonest forecasts.
- One rebuilt outcome (be6f743e, Browns moneyline) carries another bet's forecast (section 6). It is one of 266.

## Appendix F. Closing-line detail

**Coverage**
- Of the 323 settled bets in the closing-price checks (the Scorecard's 322 plus the free bet), 168 have a close (52.0%). Of all 353 logged: 170 (48.2%).
  Of the 20 open: none yet.
- Every close came from the book you bet: Novig 149, Polymarket US 18, Kalshi 3. Settled coverage: Novig 147 of 248, Polymarket US 18 of 32,
  Kalshi 3 of 6. Bovada (24), DraftKings Predictions (9), DraftKings (2), the old Polymarket book (1) and FanDuel Predicts (1) have none.
- Why 119 settled singles on the books the app reads live (Novig, Polymarket US, Polymarket, Kalshi) have none, by the app's live-price rules:
  - 53 were never read on this device.
  - 22 were read only more than 45 minutes before the start.
  - 21 were logged after kickoff.
  - 10 were placed after kickoff.
  - 10 were last read after kickoff.
  - 3 have no start time.
- On 10/25, none of 20 got one.
- Freshness: of the 151 closes with a time, the median was taken 0.73 minutes before kickoff; 20 were more than 30 minutes before (the longest 44.6 minutes).

**What you paid.** On 24 of the 26 Polymarket US and Kalshi fills, the cost per share is 1.0 to 2.7 points above the saved price (the fee).
The app's CLV uses the saved price. Measured on the cost, mean CLV is −0.24% and 71 of 168 beat the close.

**By group.** Every range includes zero, and only Novig has 100 or more closes.

| Group | Closes | Games | Beat | Mean CLV | 95% range |
|---|---:|---:|---|---:|---|
| Novig | 147 | 91 | 64 (43.5%) | +0.13% | −0.70% to +0.95% |
| Polymarket US | 18 | 16 | 6 (33.3%) | −0.15% | −4.31% to +5.57% |
| Kalshi | 3 | 3 | 2 | +9.77% | too few |
| NHL | 79 | 40 | 34 (43.0%) | −0.37% | −1.46% to +0.65% |
| NBA | 41 | 29 | 16 (39.0%) | +0.84% | −1.74% to +3.68% |
| NFL | 36 | 20 | 16 (44.4%) | +0.64% | −1.20% to +2.58% |
| NCAAF | 11 | 11 | 6 (54.5%) | +1.57% | −0.80% to +4.18% |
| Props | 104 | 56 | 48 (46.2%) | +0.26% | −0.60% to +1.07% |
| Moneylines | 42 | 41 | 15 (35.7%) | 0.00% | −2.60% to +2.97% |
| Spreads | 11 | 11 | 4 (36.4%) | −0.20% | −2.33% to +1.73% |
| Totals | 11 | 11 | 5 (45.5%) | +1.98% | −0.96% to +5.37% |

NCAAB has 1 close (0.00%), so the sport rows add up to 168. Moneylines: median −1.42%, stake-weighted −1.89%.

**CLV against results**
- Settled with a close: 168 tickets, 74–94, −$34.55 on $306.24 (ROI −11.3%, 95% range −30.9% to +7.7%).
- Without a close: 155 tickets (the free bet among them), 79–73 with 2 pushes and 1 sold, +$56.50 on $372.52 (+15.2%, range −3.5% to +33.5%).
- Most of that gap is the books with no live price. The 36 bets on Bovada, DraftKings, DraftKings Predictions and FanDuel Predicts made +$49.00 on $79.93.
  The 119 bets on the live books with no close made +$7.50 on $292.59 (+2.6%).
- The app's Reports step 3 (170 closes, extras included) splits them at ±0.1%:

| Group | Tickets | Record | Staked | Profit | ROI | 95% range |
|---|---:|---|---:|---:|---:|---|
| Beat the close | 73 | 40–33 | $116.06 | +$22.95 | +19.8% | −9.4% to +48.4% |
| Even (within 0.1%) | 25 | 13–12 | $44.38 | −$0.72 | −1.6% | −49.7% to +44.1% |
| Missed the close | 72 | 22–50 | $147.80 | −$56.88 | −38.5% | −62.5% to −13.0% |

- Beat minus missed: +58.3 ROI points (95% range +21.1 to +93.6). That is the one clear result in this section, and it is the expected one:
  a closing price carries late news, so the bets it moved toward win more often. By itself it does not show an edge.
- With a close, 74 won against 79.14 expected at your own prices (z = −0.81). The close forecast these a little better than your price did:
  log loss 0.6336 against 0.6384 (difference +0.0048, range −0.0019 to +0.0126).

## Appendix G. How this was computed

**How this was checked.** Los Chambeadores ran each report first (money, forecasts, closing line, data quality). Los Desconfiados re-checked each one with
their own code, most of it lifting the app's own functions out of `index.html`. Only numbers the re-check confirmed or corrected are used. Where the two
disagreed, the re-check's number is used and the change is named (Appendix D). El Capataz re-ran every re-check script (same output) and ran a last check
with the app's own code. Then Los Chismosos (reviewers) checked this note and the middle-category report against the app's code, and El Capataz re-ran each of
their corrections before using it.

Everything is in `/tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/eval-work/` (a scratch folder; a restart can
clear it). The backup is `/tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/eval-data/betlog.json`, and the app is
`/home/user/ev-bet-screener/index.html` (v5.04). Run each command from the eval-work folder.

- **Money (section 2).** First run `money.js`. Re-check used here: `skeptic_money.js` → `skeptic_money-out.json`.
  `node skeptic_money.js ../eval-data/betlog.json /home/user/ev-bet-screener/index.html 2026-11-14T21:54:08.580Z`
- **Forecasts (section 3).** First run `forecast_honesty.py`. Re-check: `skeptic_honesty.py` and `skeptic_honesty_checks.py`.
  `python3 -I skeptic_honesty.py ../eval-data/betlog.json skeptic_honesty_out.json`, and the same for `skeptic_honesty_checks.py` →
  `skeptic_honesty_checks_out.json`.
- **Forecasts, app code.** `skeptic_app_js_check.js` and `skeptic_app_js_extended.js`:
  `node skeptic_app_js_check.js /home/user/ev-bet-screener/index.html ../eval-data/betlog.json` (the same for the extended one).
- **Closing line (section 4).** First run `clv.js`, `clv_checks.js`. Re-check: `skeptic_clv.py` → `skeptic_clv-out.json`; `skeptic_clv_diag.py`,
  `_diag2.py`, `_diag3.py`, `skeptic_clv_tails.py`. `python3 -I skeptic_clv.py ../eval-data/betlog.json skeptic_clv-out.json`; the others print JSON:
  `python3 -I skeptic_clv_tails.py ../eval-data/betlog.json > skeptic_clv_tails-out.json`.
- **Data checks (section 6).** First run `data_quality.py`. Re-check: `skeptic_quality.py` → `skeptic_quality_out.json` (helpers:
  `skeptic_quality_appcheck.js`, `skeptic_quality_fair.py`, `_gaps.py`, `_gh.py`, `_sized.py`).
  `python3 -I skeptic_quality.py ../eval-data/betlog.json skeptic_quality_out.json`
- **Final checks (El Capataz).** `final_app_check.js`, `final_handcheck.py`, `final_forecast_items.py`, `final_figures.py`:
  `node final_app_check.js ../eval-data/betlog.json /home/user/ev-bet-screener/index.html 2026-11-14T21:54:08.580Z` ·
  `python3 -I final_handcheck.py ../eval-data/betlog.json skeptic_quality_out.json final_handcheck-out.json` ·
  `python3 -I final_forecast_items.py ../eval-data/betlog.json final_forecast_items-out.json` · `python3 -I final_figures.py . final_figures-out.json`
- **Review corrections (Los Chismosos, re-run by El Capataz)**, in the `eval-review/` folder next to eval-work: `review.js`, `review2.js`, `extra.js`,
  `misc.js`, `medzero.js`, and the editor's `ed_clvres.js` and `ed_eqmkt.js`. Each runs from eval-review as
  `node <script> ../eval-data/betlog.json /home/user/ev-bet-screener/index.html 2026-11-14T21:54:08.580Z`.

Notes:
- `final_app_check.js` runs the app's own functions, lifted word for word with the clock fixed at the save time, for the Scorecard tiles,
  its warning line, the worst drawdown, the Performance count and the Reports step-3 groups. It matches the re-check on every shared number except the two
  "CLV against results" ranges (Appendix F), where the re-check's fixed-seed re-draws and the app's differ by half a point or less; the app's are used.
- `final_handcheck.py` prints every field of each id in section 6. `final_forecast_items.py` confirms the two forecast-only bets sit in
  the rebuilt set. `final_figures.py` reads every figure of the first version back from the outputs, and adds the sums used in sections 3 and 6.
- `final_number_audit.py` checked that every number in sections 1 to 6 of the first version appears in a script output
  (`python3 -I final_number_audit.py /home/user/ev-bet-screener/agent-notes/bet-log-evaluation_2026-11-14_v1.md .`). The only three it
  could not match are rounding forms of stored values: 18.5% (stored as 18.45, from 18.4549), −0.00215 and +0.00588 (stored with 5 decimals).
  The corrections in this version come from the eval-review scripts above.
- Every re-check script was run again into `eval-work/rerun/` and gave the same output (only the input path text differs in one file).
- Ranges: money, Scorecard and "CLV against results" ranges use the app's own resampler (whole games, 10,000 re-draws, its own seed). Forecast ranges use
  the app's Reports resampler (2,000 re-draws) or fixed-seed re-draws, and the CLV group ranges use fixed-seed re-draws of whole games. They move
  by about half a point between methods; no conclusion here depends on that. Shares use Wilson 95% intervals.

**Where we had to guess**
- "Now" for open tickets is the backup's save time, 11/14 3:54 PM.
- The rebuilt forecasts apply her rule to old snapshots. The market weight was 0.35 wherever it can be checked, but they are still a rebuild.
- The Trent Walker payout and the Jaylen Wells market chance are read from the numbers alone.
- Order times come from Novig order ids, taken to be time-stamped; on the 79 bets that also have the book's placement time, the two agree
  within 5 seconds 98.7% of the time.
- The drawdown depends on order (Appendix C).
- Bovada tickets are as you entered them; nothing checks them against the book.

The data stayed on this computer: no network calls, and the scripts wrote only into the scratch folder.
