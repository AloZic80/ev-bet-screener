# Since November 11: the middle category

Ref: CC-2026-11-14-14 · from El Capataz (Claude Code) · times America/Chicago

## At a glance

- **You did change what you bet.** Since 11/11 every bet with a saved chance is between 50% and 70%. Before, 39% were under 50%.
- **Your middle-category bets (Volado: a 50% to 60% chance) are 9 won and 4 lost since 11/11: +$21.20 on $30.22.** That is only 13 bets, and two of them (Carolina and Buffalo) made $16.67 of it.
- **The start day changes the story.** Counted from 11/10 instead, Volado is 9 won, 10 lost, +$8.90.
- **Good luck so far, not proof.** If La Contadora's chances are right, these bets should make about 5 to 7 cents per dollar over many bets, not 70. Your prices so far are about even with the last price before each game.
- **Your plan:** at today's pace the Scorecard reaches 1,000 settled bets about Jan 7, 2027, 2,000 about Mar 28 and 3,000 about Jun 16. For the 2nd and 3rd 1,000 to confirm, each must be scored on its own, which the Scorecard does not do yet.

Alonzo, Sat 11/14: "since November 11, i started to stick to the middle category. Not unlikely ones. and, im noticing its pretty solid. i know i wont always be green ...
the first 1K is a starting point, and the next 1K Confirms it and the 3rd 1K Reconfirms it."

From your bet log backup (saved Sat 11/14 3:54 PM, app v5.04), read on this computer only: nothing was sent anywhere and nothing in the app changed.
This is a record check, not betting advice. For all 353 bets, see the full evaluation, CC-2026-11-14-13.

**Words used**
- **Forecast:** the chance of winning saved with a bet. From 11/10 on it is La Contadora's; before, mostly the model's.
- **La Contadora:** the app's careful chance, min(model, market + 0.35 × (model − market)). When the model likes a bet more than the market does, she
  moves only 35% of the way from the market's price toward the model's; she is never above the model.
- **Band and tab:** the app sorts a chance into bands (Unlikely under 45%, Coin Flip 45–50%, On the Line 50–55%, Slight Lean 55–60%, then Lean, Solid,
  Strong, Heavy Favorite, High Cover) and the board into five tabs. Volado is the middle tab: 50% to under 60%.
- **ROI:** profit ÷ money staked. +70.2% means 70.2 cents of profit per dollar bet.
- **95% range:** how far luck alone could move a result with this many bets. If it includes 0, profit and luck cannot be told apart yet. The app finds it
  by re-drawing whole games 10,000 times, because bets on one game win or lose together.
- **SD:** the usual size of a luck swing. A result within 2 SD of what was expected is ordinary luck.
- **Break-even:** how often a bet must win to not lose money at the price paid. A −110 price needs 52.4%.
- **Wilson range:** a 95% range for a win rate that works with few bets.
- **The close and CLV:** the close is the last price before the game. CLV (closing line value) compares your price with it; above 0 means you got a better price.
- **Median:** the middle value when all are lined up.
- **Scorecard:** the app's 1,000-bet test. It counts settled singles only: no parlays, research bets, extras (Just missed, Hail Marys) or free bets (stake $0).
  Its stage words: under 100 bets "stories", 100–299 "directional", 300–999 "comparison", 1,000 "evidence".
- **Book fill:** the book's record that your order went through. The app logs a fill as a bet by itself.

## 1. Short answer, with the numbers

- **You did change what you bet.** From 11/11 on you placed no single bet under 50% (by the day placed): no Unlikely, no Coin Flip. Before 11/11, 103 of
  the 263 bets with a forecast (39%) were under 50%. Since, all 40 bets with a forecast sit between 50% and 70%, and 24 of them are in Volado.
- **Volado has gone well, but it is 13 bets.** Since 11/11 it is 9–4, +$21.20 on $30.22 staked (ROI +70.2%), in 12 games. The Scorecard calls anything
  under 100 bets "stories". Two bets, Carolina −2.5 and Buffalo −2.5, are $16.67 of the $21.20.
- **The start day changes the picture.** The move to Volado began a day or two earlier. On 11/10, the first day every bet with a forecast carried La Contadora's
  chance, its 6 settled Volado bets all lost (−$12.30). Counted from 11/10, Volado is 9–10, +$8.90 (ROI +20.9%).
- **Good luck so far, not proof yet.** Since 11/11 the bets won more than forecast, by an ordinary amount of luck (+1.3 SD). Your median CLV over all 168
  closes is exactly 0.00%: even with the last price before each game. Your 1K / 2K / 3K plan matches the app's own rule (nothing is decided before 1,000
  settled bets), as long as each 1,000 is scored on its own. The Scorecard does not do that yet.

## 2. What the middle category is in your bets

Here "Volado" means a bet whose band chance (`bandCover`) is 50% to under 60%: the app's On the Line and Slight Lean bands. "Machín" is 60% to under
75%, and so on. The band chance is La Contadora's chance saved with the bet (`snap.act`), else a cover you typed, else the model's fair price (the app's
fallback). Reports › Breakdown by band gives the same groups, but its "date placed" is the day a bet was saved, and it also counts extras. From 11/11 to
11/14 that adds only Paul George (placed 11/10, saved 11/11): On the Line plus Slight Lean there shows 14 settled, 9–5, +$20.20.

The app's own tab record (`rpTabOf`, Reports › Breakdown by tab) is narrower: the tab saved with a board bet, or else La Contadora's chance. Since v4.86
(11/13) a book fill is saved as "own", with no tab, and older bets have none. By the day placed it shows Volado since 11/11 as 10 settled, 7–3, +$10.72 on
$20.43 (in Reports, by the day saved: 11 settled, 7–4, +$9.72). Carolina −2.5 (+$9.10), Portland −10.5 and Shea Theodore are book fills saved as "own",
and 13 of the 24 Volado bets placed since 11/11 have no tab there. All time that view holds only 18 settled Volado bets (−$1.68, the 2 extras included),
and 286 of the 295 singles placed before 11/11 have no tab.

Singles placed, by the tab their band chance belongs to:

| Tab | Chance | Before 11/11 | Since 11/11 |
|---|---|---|---|
| Brujo | under 45% | 65 (25%) | 0 |
| Suertudo | 45% to under 50% | 38 (14%) | 0 |
| **Volado** | **50% to under 60%** | **98 (37%)** | **24 (60%)** |
| Machín | 60% to under 75% | 53 (20%) | 16 (40%) |
| Boring | 75% and up | 9 (3%) | 0 |
| no forecast | | 32 | 10 |
| **singles placed** | | **295** | **50** |

Bands in each tab: Brujo, Unlikely · Suertudo, Coin Flip · Volado, On the Line (50–55%) and Slight Lean (55–60%) · Machín, Lean, Solid and Strong · Boring,
Heavy Favorite and High Cover. Percent of the bets with a forecast (263 before, 40 since). Since 11/11 by band: On the Line 17, Slight Lean 7, Lean 14,
Solid 2. So your middle category is Volado, and above it you also take the low end of Machín (60% to 70%).

Which chance a band uses:
- Before 11/11: the model's fair price 254, La Contadora's chance 9 (all on 11/10), none 32.
- Since 11/11: La Contadora's chance 40, none 10.
- The tab saved with a bet tells little here. The five tabs came with v4.76, first used on the night of 11/11 (first Volado save 11/12 8:17 AM), so before
  then no bet could be saved from Volado. Since 11/11 the saved mode reads: Volado 21, Machín 23, the old 🛡️ Safe mode 3, Boring 2, Suertudo 1.
- 47 of those 50 bets are book fills the app logged by itself (Novig 43, Polymarket 4). For them the saved tab is only the one that happened to be open when
  the app read the fill. Only 3 were saved from a card: Trent Walker, Jaylen Raynor and Tyrese Proctor, all Volado.

Day by day (all singles placed):

| Day | Placed | Volado | Machín | Under 50% | None saved |
|---|---|---|---|---|---|
| Mon 11/9 | 27 | 12 | 7 | 3 | 5 |
| Tue 11/10 | 11 | 8 | 0 | 1 | 2 |
| Wed 11/11 | 6 | 2 | 2 | 0 | 2 |
| Thu 11/12 | 18 | 6 | 9 | 0 | 3 |
| Fri 11/13 | 10 | 4 | 3 | 0 | 3 |
| Sat 11/14 (not over) | 16 | 12 | 2 | 0 | 2 |

On 11/9 the chance is the model's; from 11/10 on, La Contadora's. On 11/10, 2 of the 8 Volado bets were Just missed extras, which the Scorecard leaves out.
The other 6 were saved while the old 🛡️ Safe (4) and 🍀 Feeling Lucky (2) modes were open; Machín and Suertudo did not exist yet.

## 3. Since 11/11: the middle vs the rest vs the same band before

Settled Scorecard bets. The ranges come from the app's own resampler (`bootGames`), the one the Scorecard uses.

| Group | Won–lost | Staked | Profit | ROI |
|---|---|---:|---:|---:|
| **Volado since 11/11** | 9–4 | $30.22 | +$21.20 | +70.2% |
| The rest since 11/11 | 14–5 | $30.12 | +$11.48 | +38.1% |
| · Machín (all 60–70%) | 8–5 | $19.46 | +$2.89 | +14.9% |
| · no forecast | 6–0 | $10.66 | +$8.59 | +80.6% |
| All since 11/11 | 23–9 | $60.34 | +$32.68 | +54.2% |
| Volado before 11/11 | 39–56, 1 sold | $228.09 | −$36.59 | −16.0% |
| Volado, all time | 48–60, 1 sold | $258.31 | −$15.39 | −6.0% |
| All before 11/11 | 130–157–2, 1 sold | $618.42 | −$10.73 | −1.7% |
| All, all time | 153–166–2, 1 sold | $678.76 | +$21.95 | +3.2% |

ROI 95% ranges:
- Volado since 11/11: +3.8% to +112.5% (12 games).
- The rest since 11/11: +4.0% to +63.6% (15 games). Machín: −37.7% to +49.6% (11). No forecast: too few.
- All since 11/11: +13.7% to +86.1% (21 games).
- Volado before 11/11: −39.2% to +6.6% (69 games). Volado, all time: −28.1% to +16.5% (81).
- All before 11/11: −16.1% to +12.5% (173 games). All, all time: −10.8% to +17.0% (194; the Scorecard tile shows the 90% range, −8.6% to +14.9%).

- **Not like for like.** Before 11/10 a band came from the model's fair price: 90 of the 96 Volado bets before 11/11. The 6 that had La Contadora's chance
  (all on 11/10) went 0–6.
- **Two bets carry Volado since 11/11:** Carolina −2.5 (+117, $7.78, won $9.10) and Buffalo −2.5 (+115, $6.58, won $7.57). Without them: +$4.53 on $15.86,
  ROI +28.6%, range −32.2% to +105.8% (10 games).
- **If every bet had been $1** (each bet's own return per dollar, averaged): Volado since 11/11 +48.6% (range −5.1% to +101.9%); all since 11/11 +37.7%
  (+9.2% to +67.0%). This counts Trent Walker's typed $3.04 as a +200% return (section 6).
- **The start day.** Counted from 11/9, Volado is 15–16 (ROI +6.2%); from 11/10, 9–10 (+20.9%, range −49.6% to +80.9%); from 11/11, 9–4 (+70.2%).
  Counting a bet's day from when it was saved, not placed, moves 4 bets placed around midday on 11/10 (saved 7:25 AM on 11/11) into 11/11. One is Wendell
  Carter Jr. at 49.75%, and Volado since 11/11 would be 9–5, +$20.20 (+64.7%), with Paul George added.
- The one parlay since 11/11 (a Novig 2-pick at +120, about a 45% chance by its price) lost $1.23. Parlays are not on the Scorecard.

Before 11/11 by band (mostly the model's forecast; small samples, wide ranges):

| Band | Settled | Won–lost | ROI |
|---|---|---|---|
| Unlikely (under 45%) | 63 | 14–48–1 | −28.6% |
| Coin Flip (45–50%) | 37 | 22–15 | +31.8% |
| On the Line (50–55%) | 59 | 21–37, 1 sold | −23.9% |
| Slight Lean (55–60%) | 37 | 18–19 | −2.4% |
| Lean (60–65%) | 29 | 19–9–1 | +30.8% |

Of the two bands you dropped, Unlikely lost and Coin Flip won. On the Line, half of Volado, was one of the weakest. The switch came after these
results were in, which is one more reason the new bets have to be judged on their own.

The full evaluation counts the same bets in other sets. Its On the Line + Slight Lean, all time (111 tickets, −$15.49), is Volado all time here (109, −$15.39)
plus the two Just missed extras, Jaylen Brown +$0.90 and Damian Lillard −$1.00. Its Unlikely (64) includes the free bet. Its win rate, 47.9%, counts all 330
decided tickets; 46.3% here (section 5) counts the 281 with a forecast.

What the app's call was when each bet since 11/11 was logged (`snap.said`, saved by `addToLog`):
- **BET:** 18 placed; settled 9–4, $31.14 staked, +$15.41.
- **OUTLIER** (the model's edge looks too big next to the market): 8 placed; 3–2, $4.98, +$0.71.
- **RISK** (a small risk bet the app keeps on purpose): 6 placed; 2–2, $3.98, −$0.21.
- **SKIP** (stored when the app read the fill: no card on the board, or no stake at that moment): 17 placed; 9–1, $20.24, +$16.77.
- **OLD PRICE** (price over 12 hours old, $0): 1 placed, still open.

BET, OUTLIER and RISK had a stake from the app when logged (32 of 50); SKIP and OLD PRICE did not (18). About half the profit since 11/11 (+$16.77 of
+$32.68) sits in bets saved as SKIP, and 12 of the 24 Volado bets were BET.

SKIP here is mostly a label, not a call. The call is saved when a bet is logged, and 47 of the 50 bets since 11/11 are book fills the app logged with the call
it saw when it read the fill. 10 of the 17 SKIP bets are fills it found no card for, which it always stores as SKIP: that is why all 10 bets with no forecast
are SKIP. 8 of the 10 settled SKIP bets were read more than an hour after you placed them, and 5 after their games began (Buffalo, OKC, Rasmus Dahlin,
Filip Forsberg, Jack Eichel). Buffalo −2.5 was placed at 6:19 PM and read at 11:56 PM. The cleaner read is the 13 settled BET bets: 9–4, +$15.41 on
$31.14. In Volado, the 8 settled BET bets went 5–3, +$11.44 on $19.64, and Carolina is +$9.10 of it.

## 4. Honest or lucky?

Each bet's forecast and the price paid give an expected profit. Luck moves the real result around it. Only chances saved before a known start time are
judged, as in the app's Reports (`rpPregame`, the rule of its Said vs won and Expected wins).

| Group (bets judged) | Forecast → won | Expected → actual | Gap |
|---|---|---|---|
| Volado since 11/11 (11) | 53.2% → 72.7% | +$1.86 → +$14.63 | +1.3 SD |
| Volado from 11/10 (15) | 53.9% → 53.3% | +$2.22 → +$4.32 | +0.2 SD |
| Machín since 11/11 (13) | 62.9% → 61.5% | +$1.07 → +$2.89 | +0.3 SD |
| All since 11/11 (24) | 58.5% → 66.7% | +$2.93 → +$17.52 | +1.3 SD |
| Volado before 11/11 (90) | 53.9% → 42.2% | +$13.54 → −$29.40 | −1.7 SD |
| All, all time (267) | 51.7% → 46.4% | +$44.01 → +$7.39 | −0.9 SD |

Wilson ranges for the win rate, and break-even, in the same order: 43.4–90.3% (break-even 50.2%) · 30.1–75.2% (51.2%) · 35.5–82.3% (59.2%) ·
46.7–82.0% (55.1%) · 32.5–52.5% (50.4%) · 40.5–52.4% (47.0%). In the last row, 238 of the 267 forecasts are the model's own chance.

Left out here: Buffalo and OKC since 11/11 (the app read their chance hours after their games began), MacKinnon and Paul George on 11/10 (one saved after
the start, one with no start time saved) and 12 older bets saved after their start. They all still count in the money in section 3. Sold bets are left out,
and win rates count won and lost bets only. Expected uses the price paid; the actual profit uses what was recorded, including the typed to-win on Trent
Walker ($3.04) and Portland ($1.68).

- Since 11/11 the bets won more often than forecast. +1.3 SD is luck of a common size; it does not show that the forecast is too low.
- Before 11/11 the same band won less often than forecast (−1.7 SD). That was mostly the model's forecast, not La Contadora's.
- All time, the bets judged here made +$7.39 against +$44.01 expected (−0.9 SD): ordinary bad luck, or a forecast that runs high. 267 bets cannot tell which yet.
- **What the bets should earn if La Contadora is right: about +5% to +7% of the money staked.** Since 11/11, +7.0% (+$2.93 on the $42.10 judged above).
  On her chances the app's Reports judge, from 11/10 on, +5.6% (+$3.17 on $56.12, from the EV saved with each bet). Her rule over the wider set, with
  the older bets rebuilt: +5.08% (+$27.35 on $538.66; both in the full evaluation, section 3). The last row's +8.2% is mostly the model's own chance,
  which the app keeps only as a check. Over many bets, results drift toward what the bets are really worth: single digits, not +70%.

The ranges:
- Volado since 11/11: ROI range +3.8% to +112.5% (90%: +14.3% to +107.7%). The low end is just above zero, but it rests on 12 games. Without the two biggest
  stakes it is −32.2% to +105.8%.
- All, all time: +3.2%, range −10.8% to +17.0% (90%: −8.6% to +14.9%). Zero is inside: no clear edge yet, and no clear lack of one.

The closing line, the other half of the app's test. CLV asks: did you get a better price than the last one before the start?

| Group | Closes | Beat / same / below | Median CLV (95% range) |
|---|---|---|---|
| All time | 168 | 72 / 25 / 71 | 0.00% (0.00% to +0.37%) |
| Since 11/11 | 18 | 11 / 3 / 4 | +0.93% (0.00% to +2.75%) |
| Volado since 11/11 | 7 | 5 / 1 / 1 | +0.93% (0.00% to +4.10%) |

All time the median is exactly 0.00%: 72 beat the close, 71 were below it, and 25 were the same price. Since 11/11 it is +0.93%, but on 18 closes, and its range
still starts at 0. The math policy (`docs/EV-CALCULATOR.md`): "Beating the closing line comes first; profit follows over time."

## 5. The 1K / 2K / 3K plan

**Where you are.** The Scorecard counts 322 settled bets. Its stage is "comparison" (300 to 999 bets). Its verdict box reads today:

> Not yet — 678 more settled bets before raising stakes or claiming anything.
>
> ⚠ The last 100 bets are not beating the closing price (median +0.0%). That isn't luck — check what changed.

The warning shows when the median of the last 100 closes is zero or below. Here it is exactly 0.00%, with 16 of those 100 at the same price: even with
the close, not behind it (the full evaluation, section 4).

Of the 322, 283 have a forecast that can be checked, and only 33 carry La Contadora's own chance. Volado has 109 settled and 11 open.
Her chance, counted three ways (the same line is in the full evaluation): 35 settled tickets carry her saved chance. 33 of them are Scorecard bets (the 2
Just missed extras are out). The app's Said vs won keeps 31: it drops the 4 not saved before a known kickoff (MacKinnon, Buffalo, OKC, and Paul George, who
has no start time) and keeps the 2 extras.

**Pace.** Since 11/11 you placed 50 Scorecard bets in 4 days: 6, 18, 10 and 16 (today is not over). That is 12.5 a day, 6 of them Volado. 18 of the 50
are still open. Four days is a short base, so the dates are rough.
- **1st 1,000, the starting point:** about 2027-01-07 for all Scorecard bets (12.5 a day); about 2027-04-11 for Volado alone (6 a day).
- **2nd 1,000, confirms (2,000 in all):** about 2027-03-28; Volado alone about 2027-09-25.
- **3rd 1,000, reconfirms (3,000 in all):** about 2027-06-16; Volado alone about 2028-03-09.

The bets with La Contadora's own chance (33 now, about 10 a day since 11/11) reach 1,000 about 2027-02-18.

**How the range narrows** (from today's spread, bets grouped by game):

| Settled bets | ROI 95% range | Win rate 95% range |
|---|---|---|
| now (322) | ±13.9 points | ±5.8 points |
| 1,000 | ±7.9 | ±3.1 |
| 2,000 | ±5.6 | ±2.2 |
| 3,000 | ±4.5 | ±1.8 |

Win rate: bets with a forecast that won or lost (281 now, 46.3% won). Each block of 1,000 on its own has about ±7.9. All three together narrow to about ±4.5.
This assumes today's mix of stakes and odds: more even stakes narrow it, more uneven stakes widen it.

**What the app's test needs at 1,000** (the Scorecard's verdict, `renderScorecard`):
1. The low end of the ROI 90% range above zero. At today's spread that means an ROI of about +6.6% or better (about +7.9% to clear the 95% range).
2. The low end of the median-CLV 95% range above zero. Today it is exactly 0.00% (the Scorecard tile shows +0.0% to +0.4%), so this half is not met yet.

Both met: the app says "good evidence of an edge (evidence, not proof)". Either one short: "no clear evidence of an edge yet". An ROI between 0% and
about +6.6% at 1,000 is still unclear.

**What the plan can show.** This is rough: a normal approximation, the ROI half of the test only, today's mix of stakes, a standard error of about 4.0
points at 1,000 bets and the +6.6% bar. Her expected return, about +5% to +7%, sits around that bar, so even if her chances are exactly right, a block
can miss it by luck:
- One block of 1,000 passes about 1 time in 3 (at +5%) to 1 in 2 (at +7%).
- All three blocks, each scored on its own: about 1 in 23 to 1 in 6.
- The 3,000 pooled into one test: about 7 to 9 times in 10.
- With no edge at all: one block passes 1 time in 20 by luck, three in a row about 1 in 8,000, and the 3,000 pooled 1 in 20.

So each block alone is a strict test: luck rarely fools it, but it often misses a real edge of this size. The three pooled find such an edge far more often.
Which reading counts (each block alone, or the three together) is best set before the results are in. Your call.

**For the 2nd and 3rd 1,000 to confirm:**
- Each is a new, separate block of 1,000, scored on its own. Reading the first 1,000 again inside the 2,000 is not a confirmation.
- The same rules all the way: floor, fees, Kelly, caps, the six ◎ checks and the tab lines unchanged. A rule change starts a new block.
- Each block's start day is set before its results are in, and kept. The Scorecard's first 1,000 already holds the 290 bets from before 11/11, made the old
  way. A first block of only the new way needs a start day, chosen now:
  - 11/11, the day you name: nothing is under 50% from then on, but it leaves out 11/10's 0–6.
  - 11/10, the first day every bet with a forecast carried La Contadora's chance.

  A block from 11/11 reaches 1,000 about 2027-01-30, about three weeks after the Scorecard. Your call.
- Today the Scorecard adds all bets together; it does not score a block on its own. That would be a small new view (not built, your call).

## 6. What to keep doing so the bets count

- **Log every bet, won or lost, when you place it.** Only settled bets count; an open bet counts once it is graded.
- **Save each bet from its card with "I bet this" when you place it, including any the app says SKIP.** That saves La Contadora's chance (`snap.act`),
  the price, the tab and the app's call at the moment you bet, so the record can later be split into "the app's call" and "my own picks". Since 11/11, 40
  of 50 bets have La Contadora's chance and 10 have none (all 10 SKIP). A bet with no forecast still counts on the Scorecard, but it has no band and no
  expected profit, so it cannot test the forecast.
- **Book fills.** A fill the app reads later gets the app's call from that later time, or SKIP if its card is gone, and a forecast only if its card is still
  on the board. Recovering the forecast from the price history is agreed and not built yet (CC-2026-11-14-11 and -12).
- **Closing prices.** The CLV half of the test needs them, and only 168 of the 322 have one. The app saves one when it reads a live price in the last 45
  minutes before the start. You can also press "Grab closing lines", best 5 to 15 minutes before the game (1 API call per game), or type one in the Bet log.
- **Keep the rules frozen inside a block**, and note the day if one changes.
- Parlays, research bets and extras (Just missed, Hail Marys) stay outside the 1,000.

**Records to check from this period** (details in the full evaluation, section 6):
- **Trent Walker** 3.5 receptions (Bovada, +100, $1.52, 11/13) is logged as winning $3.04. At +100, $1.52 wins $1.52, and $3.04 is the full payout with the
  stake back. If $3.04 was the payout, the profit is $1.52 too high: Volado since 11/11 would be +$19.68, not +$21.20. If the price really paid more than
  +100 (a boost), it is right as it is.
- **Filip Forsberg** Under 0.5 goals (Novig, 11/13, no forecast, saved as SKIP): the price was edited after the game, and the fill paid +$0.46, not +$0.85.
  With that fix, all since 11/11 is +$32.29, the rest since 11/11 +$11.09, no forecast +$8.20 and SKIP +$16.38. With Trent Walker as well, all since
  11/11 is +$30.77.
- **WVU −2.5, Dawson Mercer and Evan Bouchard:** open, and the app may not grade them.
- **Paul George** (11/10, one of the 0–6): no game or start time saved, graded by hand. Right game, right loss?

**Noticed, not changed.**
- `docs/EV-CALCULATOR.md` says the 1,000-bet test needs the 95% ranges for ROI and median CLV above zero. The code (`renderScorecard`) uses the ROI 90%
  range (the one the Scorecard's ROI box shows) and the median-CLV 95% range. This note follows the code.
- At exactly 0.00%, the warning's "That isn't luck" says more than the data shows.
- The band study (`bandCover`) counts a bet with no start time as saved before the game; the Reports (`rpPregame`) leave it out. Paul George is the one
  such bet here.

## How this was checked

Your bet log backup (saved Sat 11/14 3:54 PM, app v5.04), read on this computer only. Los Chambeadores ran the numbers and Los Desconfiados re-ran every
one. Los Chismosos (reviewers) then checked this note against the app's code and the full evaluation, and El Capataz re-ran each of their corrections with
the app's own functions (`bandCover`, `cvBand`, `tabOfChance`, `inScorecard`, `betProfit`, `bootGames`, `rpPregame`, `rpTabOf`, `rpPlacedDay`,
`saidOf`, `renderScorecard`). Results use settled bets only. A bet's day is the day it was placed (`placedAt`), in Chicago time. Scripts and outputs:
`eval-work-1111/` (first run and re-check) and `eval-review/` (review and corrections: `review.js`, `review2.js`, `extra.js`, `tabcheck.js`, `modes.py`
and the editor's `ed_*.js` / `ed_power.py`), both in
`/tmp/claude-0/-home-user/c5370435-0dbc-56b4-aaf1-597d242c119b/scratchpad/` (a scratch folder; a restart can clear it).
