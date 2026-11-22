# Para ChatGiPiTiTi: recheck of the numbers (app v5.24, 2026-11-21)

Paste this whole note into ChatGPT. It stands alone.

## What the app is

0xBeta Screener is one web page (props.0xbeta.dev) that Alonzo and Augi use to find sports bets with an edge, size the stake, and track results. One conservative chance drives every decision: `min(model, market + 0.35 × (model − market))`. EV after fees must clear a 1.5% floor. The stake is quarter Kelly on half the edge, then caps (largest bet $10, 2% of bankroll per game, 10% per day). Prices come through his own Cloudflare Worker; scores and grading come from ESPN's public scoreboard.

## What was asked

Right after v5.24 (a simple "Easy" level for newcomers) was published, Alonzo asked Claude Code: "recheck the numbers and App to see if you find any errors on the math/formulas or what or how we can improve the app."

## What was done

Twelve read-only auditors, one area each, on a frozen copy of the live app and Worker. An auditor could call something an error only with a check that runs. Then independent skeptics tried to refute each serious claim along a real path through the app. Nothing was changed. 123 findings; 46 have had the second look: 35 confirmed, 8 are written rules working as designed, 2 unverifiable from that session, 1 unreachable. The second look for 20 more claims (typed inputs, parlays, Worker, statistics) is still to run.

## What held up (recomputed independently)

- Price ↔ chance for all 19,802 whole American prices: 0 failures.
- EV after each book's fee, "OK up to" by brute force (28,028 cases), the conservative chance (20,000 cases): 0 mismatches.
- The Kelly stake is never above one eighth of full Kelly (34,892 cases).
- On 6,000 random boards every staked bet clears the floor, sits at or under "OK up to", and respects the daily max, the model-only and long-shot limits and one bet per player.
- Profit for 260,000 random bets in 13 shapes; every money total on every screen on logs up to 3,000 bets.
- Game-line grading (114 hand cases, 30,000 random), prop stat reading on real ESPN box scores.
- The bootstrap ranges in Reports hold the truth as often as they say, when read once.

## Confirmed errors, worst first

1. **"Check results" flips old settled bets.** It matches by the two team codes on today's scoreboard only, so any earlier bet on the same pairing is graded again from today's game. One press changed 9 of 12 saved results in the test. No trace is left on the bet.
2. **Storage wall.** The browser's localStorage holds 5,242,880 characters; a bet takes about 1,450. With sync on, the log stops saving at about 1,300 to 1,700 bets, and a bet lost there is then deleted from the Worker copy too.
3. **Grading gaps:** a postponed game graded as a 0–0 final; a void that does not stay void; a prop exactly on a whole-number line saved as a loss; back-to-back games between the same teams; doubleheaders; same-name players.
4. **Exchange profit:** a win built from two orders (10 contracts at 40¢ then 10 at 60¢) is saved as +$6.19; right is +$9.66. A position sold in part drops the cash from the sale (app −$5.18, right −$1.76).
5. **Limits:** the per-game cap counts only money already in the bet log, so five $10 props on one game list $50 against a $20 cap. "+ Add a bet" sizes without the long-shot moneyline rule and one bet per player ($5.59 where the board gives $1.00).
6. **Security:** a restored backup file can run code in the page (four unescaped spots); the passphrase cookie is scoped to the whole domain, so the page host receives it.

## Claimed, second check pending

- "Consensus odds" typed by hand is used as the market chance with the vig still in: stake $9.55 where the right number is $4.71.
- A thin exchange book (ask 65, bid 43.5) is averaged into the fair chance: SKIP becomes BET.
- A pasted typographic minus ("−110") is read as +110.
- Combo parlays with legs at different prices are staked 1.4 to 2.3 times the policy size.
- The Watch study's bootstrap uses a generator that repeats after about 10,000 draws.
- The 1,000-bet verdict tests the 90% ROI range; the written rule says 95%.

## Questions to check, please

1. **Fix rule for grading.** Is "accept a scoreboard event only when it starts within 6 hours of the bet's saved start; with no start, only on the bet's own date or the day after, and only if the 4-hour rule holds" the right rule? What would you add for doubleheaders?
2. **History repair.** Re-grade every settled bet from its own date as a dry run and let the owner approve each change, never clearing a result first. Any trap in that plan?
3. **Per-game cap.** Should the cap be applied across the board's own rows in the same order as the daily max, or is "against logged money only" defensible because the board lists alternatives?
4. **Combo-parlay haircut.** Policy is quarter Kelly on half the edge. For a one-price combo, should each leg's chance be pulled halfway toward its own price (`q_i + 0.5 × (p_i − q_i)`) and not toward one shared break-even? Work example A: legs 70% at a 65% price and 25% at a 22% price.
5. **CLV on exchange bets.** It is measured against the ask at kickoff with no fee, so a taker bet on a quiet market reads 0.00%. Should the close be the middle of bid and ask (or both sides de-vigged), with a second "after fee" figure?
6. **The 1,000-bet verdict.** 90% or 95% for the ROI range? And since the verdict is read after every bet (13% false alarms between bets 1,000 and 2,000 when the CLV half passes), should it be read only at fixed checkpoints?
7. **Fees.** Polymarket US is reported at 9.5% × price × (1 − price) for accounts under $10,000 of 30-day volume since 2026-11-14 (the app uses 6.95%). DraftKings Predictions is priced with no fee. Can you confirm both at the source?
8. **Whole-number lines.** The EV formula `chance ÷ price − 1` has no push. A de-vigged market chance means "wins when it does not push". What should the model chance mean there, and is a note enough?
