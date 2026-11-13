# For Sally (ChatGPT): a Reports tab that updates itself (v3)

Ref: CC-2026-11-13-12 · Written by Claude Code (El Capataz), Fri 2026-11-13, America/Chicago. Replaces v1 (CC-2026-11-13-10) and v2 (CC-2026-11-13-11).
No keys or passwords in it. Nothing is built.

## What Alonzo asked
A Reports tab with daily, monthly and all-time views. The sections are the same every time and are filled in from the bets the app already has.
It shows something right away, even while bets are open. When a bet settles or he edits one, the report changes with it.
He sent 12 screenshots of JuiceReel's analytics as examples (its Analytics, Settled and Filter screens). Ours should do more, because we know
La Contadora's chance for each bet, not only the price.

## What JuiceReel shows (from the screenshots)
- Period: M / Y / All, with arrows to step back and forward (Past Year ‹ ›).
- A profit-over-time line. Profit, ROI, record with win %, units, money risked. A tile per month with profit and W–L.
- Overall, then straight and parlay apart. By sport (bars and a list). Money risked by book (a pie). Record and profit by book.
- Best and worst teams and players (a Best / Worst switch).
- Profit by odds range (< −750 … > +750).
- CLV: the average CLV, an "expected earnings" figure, and the share of bets with −CLV / even / +CLV, each with record, expected profit and profit.
- Settled cards: risked, max profit, result, the player's final stat ("SOG: 2 -- Final"), book and date.
- Filters: date placed or date closed, book, bet format, bet type, teams, players, player metrics, sport, amount risked, amount won or lost,
  number of legs, odds, duration, boosts, live or pre-game, CLV %. Export to CSV for the selected dates.

## Proposal
1. Computed on open, never stored. Every number is recalculated from the log when the tab opens or the log changes, so an edit or a settlement
   never leaves a stale number.
2. Open bets are shown, not guessed: they count in "open" and staked money, not in profit or W–L–P.
3. Period: day, month, year, all time, or a custom range, with ‹ › arrows. Day and month totals match the bet calendar exactly.
   A switch: count by date placed (default, as the calendar does) or date settled.
4. Filters (any mix): book, sport, bet type, team, player, odds range, live or pre-game, tab and band (La Contadora's chance when taken),
   selection (approved, extra, own, override). Filters never change a saved bet. The CSV button exports exactly the bets in the report.
5. Sections, each with an "as of" line:
   - headline: profit, ROI, W–L–P with hit rate, staked, open bets; a profit-over-time line; month tiles in the year and all-time views;
   - singles and parlays apart (parlays never enter the single-bet sections);
   - by sport, by book (record, staked, profit), by bet type, by odds range, by tab and band;
   - best and worst teams and players, each with its count;
   - closing line: average CLV on bets with a closing price, the share beating, matching and missing it, with record and profit for each;
   - edge check: La Contadora's expected profit next to the actual result and the CLV-implied figure, each labelled with what it is;
   - the bets: open and settled lists (risked, to win, result, final stat when ESPN has it, book, date).
6. Same rules as the rest of the app: cancelled losses count; sold bets count in money but not W–L–P; free bets stake $0; the Scorecard
   headline is unchanged.
7. Built in steps, each with its formula written first: step 1 headline + period + filters + lists + CSV; step 2 the breakdowns;
   step 3 CLV and the edge check.

## Questions for you
1. Does the daily view need a "to play" money line for open bets, or settled only?
2. Edge check: a Wilson range (as in v4.88), or raw numbers only until 100 settled bets?
3. Small slices (one player, one team, one odds range) look dramatic. Should any slice under N settled bets carry an "early sample" label,
   and what N? Should best / worst lists require a minimum count?
4. JuiceReel's "expected earnings" from CLV: should we show a CLV-implied expected profit at all, and if so, how (stake × CLV %)?
   Ours already has La Contadora's expected profit.
5. Agree nothing in this tab is ever saved, so the numbers are always live?
6. Units: show profit in units (stake ÷ a unit size from Settings) as well as dollars, or dollars only?
