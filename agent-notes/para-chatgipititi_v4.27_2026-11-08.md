# Para ChatGiPiTiTi — 0xBeta Screener v4.27 (2026-11-08)

Ref: CC-2026-11-08-05 · Written by Claude Code, Sun 2026-11-08, about 6:30 PM America/Chicago
Purpose: Alonzo pastes this into ChatGPT for a second opinion. One of these is written for every build from now on (name: para-chatgipititi_<version>_<date>.md). No keys, no passphrase, no sync password in it, ever.

## What the app is (one paragraph)
0xBeta Screener is a one-file sports-betting screener (props.0xbeta.dev). It finds bets with an edge (+EV) by comparing a book's price with a fair price (Pinnacle with the vig removed, or the consensus), sizes the stake with a fractional Kelly, says what to type at the book, and keeps an honest record: only settled bets win or lose, and the Scorecard's 1,000-bet test says whether the edge is real or luck so far. Prices come through Alonzo's own Cloudflare Worker; scores and grading from ESPN. Personal app for Alonzo and Augi.

## What Alonzo asked today, and what was built

1. **v4.24** (PR #73): the Worker had hit Cloudflare's free limit (142k requests in a day). Every Worker call is now counted (⚡ chip); a limit answer pauses background polling 10 minutes; polling is slower when the page is idle; live edges re-price a team only when ESPN's number moved; book chips on the board; the math checked against brute force (all correct).
2. **Worker v3.41** (deployed on Alonzo's "Yes"): the passphrase travels as a cookie, so each call is one request instead of two.
3. **v4.25** (PR #74): Novig game lines travel together (a 30-game live scan is ~20 requests, not ~80); drop-downs for every explanation; on a phone the board's tick boxes and the Today card's book tiles fold; **a Novig fill with only a team code now marks the board card ALREADY BET** (Alonzo's CHI moneyline was shown as not bet).
4. **v4.26** (PR #75): the ESPN-style score ribbon: each game tile with an open bet says "N bets risking $x"; the menu lists 🎯 My games and only the sports with an open bet; All sports brings the full list back.
5. **v4.27** (this build): the **Hard stop**. Alonzo: "I want to be strict with myself and be honest and not bet if by 3 PM I am already up ... I still have the option to go on, but at least it is there for me to say and think... ok, mejor no." Past the daily max, the first Save press stops: "🛑 Hard stop: today is at $48.00 of your $50.00 daily max; this $3.00 makes $51.00. Mejor no?" A second press saves. Edits, settled records and free bets are not stopped.

## The bankroll question Alonzo asked (for ChatGPT to check)
Bankroll $500, settings as shipped: Kelly fraction 0.25, edge haircut 0.5, smallest bet $1, largest $10, max per game 2% ($10), daily max 10% ($50), daily bet goal 20 (a goal, never enforced).

Stake per bet = bankroll × 0.25 × (edge × 0.5) ÷ net odds, inside $1–$10:

| Edge after fees | at −110 (b = 0.909) | at +230 (b = 2.3) |
|---|---|---|
| 2% | $1.37 | $1.00 (the minimum) |
| 4% | $2.75 | $1.09 |
| 6% | $4.12 | $1.63 |
| 10% | $6.87 | $2.72 |

Claude Code's recommendation to Alonzo: the daily max in dollars ($50) is the only hard wall; the number of bets falls out of it (about 12–16 at $3–4 each); a count is a goal, not a quota; being up at 3 PM changes nothing because the daily max is figured on the bankroll typed in Settings, not on the day's winnings; the bankroll number is updated monthly from the Scorecard. Nine good bets at 6 PM is a complete day.

Question for ChatGPT: do you agree with 10% of bankroll as the daily cap at quarter-Kelly with a 50% haircut, or would you cap by the sum of Kelly stakes instead?

## Still open
- Worker v3.42 (prop-bet-api PR #5): a Novig fill carries its game's two teams. Waits for Alonzo's go.
- Kalshi college team codes vs ESPN's: not verified.
