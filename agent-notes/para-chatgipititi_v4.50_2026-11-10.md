# Para ChatGiPiTiTi — 0xBeta Screener v4.50 (2026-11-10)

Ref: CC-2026-11-10-07 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.
This note also covers v4.48 and v4.49, as Alonzo asked.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora, its EV calculator, judges every bet on a conservative chance:

`min(model, market + 0.35 × (model − market))`

The EV floor (1.5%), "OK up to" and the stake all use that chance. A bet the model likes but that chance does not is a Watch bet.

## v4.48 (earlier today): player exposure
Built from your advice on same-player props.
- **Before either is placed:** two or more props on the same player in the same game → only the one with the highest conservative EV keeps a stake. Ties within 0.0001 go to the bigger stake, then the higher blend.
- **After one is placed:** the other reads "PLAYER EXPOSURE · already hold Mason Over 62.5 Rushing Yards: no additional stake", and says whether it looks better or worse than the held one. Nothing is added either way.
- **Same player** means the same last name with first names that agree (an initial, or one the start of the other). Two players with the same name on different teams never match.
- **Not built, as you advised:** a manual override with a combined player cap. It waits for measured correlations.

## v4.49 (earlier today): the books warning
- **× on the red "your books were not read" bar** hides it until the kind of problem changes.
- **The Bet log tab is marked** while a problem lasts (since v4.50: a red circle on its number only).
- **The top of the Bet log** says the same thing, with Check now.
- His message was "Polymarket 429 error code: 1015": Polymarket's edge rate-limiting the Worker's shared address. Novig and Kalshi were still read.

## What Alonzo asked for v4.50
- "Safe was meant for the best bets, Feeling Lucky are the ones that just missed it, but if I want to bet a few, it's fine. And Clairvoyant are bets that are Hail Marys, but the night before I had a dream of the Sports Gods."
- "Sweet spots will always be on the Safe bets, since they are safe to bet because of the chances I got to win."
- "What is the perfect bet? ... a circle around the bet, highlighted ... it passes EVERYTHING almost perfectly." Also: "the background can change a bit, to distinguish as a BET NOW before it changes", and "some are just better to use as parlays, since they don't pay as much".
- "It says Novig 53, but I can't even see the ones rejected ... I will get confused." And: "just a circle on the number, not the word Bet log."
- Then: "build - and check everything again."

## What was built (v4.50)

### 1. Modes
Before, all three modes listed the same bets; Feeling Lucky and Clairvoyant only raised Kelly (0.33), the game cap (2.5%) and the daily max (15%). Those raises are gone. A mode never changes the best bets or their stakes now.

| Mode | Lists | Stake |
|---|---|---|
| Safe | The best bets: everything La Contadora approves. | Kelly, as before. |
| Feeling Lucky | Safe, plus "Just missed": Watch bets whose conservative EV is 0% or better, with no other screen failed. | The smallest bet each, up to 5 a game day. |
| Clairvoyant | Feeling Lucky, plus "Hail Marys": every bettable long shot that is not a best bet (+300 or longer, and TD, home-run or goal scorers from +200), math edge or not. | $1 each, up to 3 a game day. Back to Safe at midnight. |

- **Each Hail Mary says what the math thinks:** "La Contadora gives 19.4%; +350 needs 22.2%". "✓ the math agrees" appears only when her EV is above zero. Saving one the math dislikes takes a second press.
- **Never offered as an extra:** already bet, an order waiting, started, the other side of a held bet, a player he already holds a bet on, or a game-line side he already holds.
- **A held extra does not block a best bet** on that player or game. It does block another extra on him.
- **Money:** extras are real bets. They count in the day's total, and the Hard stop still asks past the daily max.
- **Records:** extras are kept out of the Scorecard's 1,000-bet test, so it judges only the best bets. Performance has a new table: best bets by ring (6 of 6, 5 of 6, 4 or fewer), Just missed, Hail Marys, each with W–L–P, staked, profit, ROI and beat-the-close.

### 2. Sweet spot
Only ever on a best bet, and judged on the conservative EV, not the model's. Example from his board: Eklund Over 1.5 Shots had the sweet-spot tag at model +6.3%; La Contadora gives it +3.1%.

### 3. PERFECTA ring
A best bet that passes six checks:

| # | Check | Passes when |
|---|---|---|
| 1 | Zone | conservative chance 50% to 75% |
| 2 | Edge | conservative EV +4% to +12% |
| 3 | Room for error | conservative chance ≥ 2.5 points above the price after its fee |
| 4 | Lined up | model ≥ market, and the market alone beats the price |
| 5 | Fresh | price read in the last 10 minutes |
| 6 | Clean | no warning note, injury, bad weather, outlier, capped stake, or a price up ≥ 1 point in the last hour |

- **6 of 6:** gold ring, tinted card, "PERFECTA · BET NOW". **5 of 6:** a thin ring that names the miss. The ring follows the clock without a reload.
- **It is a label:** stakes are unchanged. The checks are saved with a logged bet, so results can be compared later.
- **Worked example (6 of 6):** model 60%, market 58.5%, price 54% at Novig (no fee).
  - Conservative chance = 58.5 + 0.35 × 1.5 = 59.0%.
  - EV = 59.025 ÷ 54 − 1 = +9.3%.
  - Room = 5.0 points.
  - Market alone = 58.5 ÷ 54 − 1 = +8.3%.

### 4. Parlay leg tag
A player prop with a conservative-blend chance of 70% or more gets "PARLAY LEG". A 4-pick PrizePicks Power entry pays 10×, so each pick needs 0.1^(1/4) = 56.2%.

### 5. Two display fixes
- **Book chips** now count what is listed after every other filter. Before, "Novig 53" was counted before the search, the Settings filters, Only sweet spot and the Show menu.
- **The Bet log's red circle** is on the number only.

## Checked
- A new test file with 46 checks covers the modes, the caps, the ring, the sweet spot, the parlay tag, the records and four screen widths.
- Text contrast of the new colours passes WCAG AA in all five colour schemes, light and dark.
- The full suite result is in the PR.

## Questions for ChatGPT
1. **Ring thresholds.** Zone 50–75%, EV +4% to +12%, room ≥ 2.5 points, fresh ≤ 10 minutes. Are any of these too tight or too loose for player props? Should "room for error" scale with the chance (more points needed for long shots), instead of a flat 2.5?
2. **Reading the ring's record.** Performance will show Perfectas against the other best bets. How many settled bets per group before a difference in ROI or CLV means anything, and should the comparison be clustered by game like the Watch study?
3. **Just missed.** They are bet at the smallest stake when he chooses. They are also still recorded as Watch shadow observations. Is there a selection problem in reading the Just-missed record (he picks which ones to bet), and should the app flag that next to its ROI?
4. **Hail Marys.** Long shots sit where models and markets are least reliable (favourite–longshot bias). Is "La Contadora gives x%; the price needs y%" the most useful single line to show, or would you show the market's no-vig chance instead of the blend?
