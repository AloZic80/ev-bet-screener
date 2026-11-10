# Para ChatGiPiTiTi — 0xBeta Screener v4.51 and v4.52 (2026-11-10)

Ref: CC-2026-11-10-09 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.
One note for two builds, as Alonzo asked.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora, its EV calculator, judges every bet on a conservative chance:

`min(model, market + 0.35 × (model − market))`

The EV floor (1.5%), "OK up to" and the stake all use that chance. A bet the model likes but that chance does not is a Watch bet.

## What Alonzo asked
- About renaming the cover bands that share names with the modes: "i think so".
- "Remember what they aren't supposed to be under the same either - show on Safe, Feeling Lucky, etc. only where they fit."
- He also pasted your answers to the four v4.50 questions (ring thresholds, reading the record, Just missed, Hail Marys).
- Showing an OddsJam "Momentum" ad: "this is what the sentinels do or want them to do ... make sure it's doing the same." Then: "yes. Proceed."

## What was built in v4.51

### 1. Each mode lists only its own bets
v4.50 stacked the modes: Feeling Lucky showed Safe's cards plus Just missed, and Clairvoyant showed all three. Now no bet sits under two modes.

| Mode | Lists |
|---|---|
| 🛡️ Safe | Only the best bets (everything La Contadora approves). |
| 🍀 Feeling Lucky | Only Just missed (Watch bets with conservative EV 0% or better), then the other Watch bets, not offered. |
| 🔮 Clairvoyant | Only Hail Marys (+300 or longer, and TD / home-run / goal scorers from +200). |

- **The math is the same in every mode.** Stakes, the daily max and what passes do not change; only the list does.
- **Every row belongs to exactly one mode:**
  - a bet he holds stays where he took it (a Just missed under Feeling Lucky, a Hail Mary under Clairvoyant, anything else under Safe);
  - a candidate goes to its own mode;
  - whatever passes every screen is Safe's;
  - of the rest, long shots are Clairvoyant's, Watch bets Feeling Lucky's, other rejects Safe's.
- **Each mode button shows how many bets it holds**, counted under the filters he has on (sport, search, book chips), so the number is what he sees there.
- **The line next to the buttons says where the other bets are**, for example "Your 5 best bets are under 🛡️ Safe · 🔮 Clairvoyant has 5 Hail Marys."
- **A mode with nothing to offer says so**, including "No more today" when the day's count (5 Just missed, 3 Hail Marys) is used.
- **Side effect:** Safe no longer shows the Watch group. Watch bets are listed under Feeling Lucky. They are still saved as shadow observations in every mode.

### 2. Two cover bands renamed
The bands are labels for the model's chance. Two shared names with the modes.

| Chance | Was | Now |
|---|---|---|
| under 45% | Long Shot | Unlikely |
| 45% to under 50% | Feeling Lucky | Coin Flip |

The ranges and the other seven names are unchanged.

### 3. From your review
- **Ring thresholds:** kept as they are, room for error included (a flat 2.5 points). They are now written down as frozen from v4.50 (2026-11-10), not to be retuned on the bets used to judge them.
- **Hail Mary line:** each card now shows "Needs 22.2% · market 19.0% · La Contadora 19.4%", then "Math says −12.9% at this price". "Needs" is the price after its fee. "La Contadora" is the conservative chance. With no market price it says "market no price".
- **Parlay leg tag:** now needs a 70%+ chance **and** a conservative EV of 0% or better at the prop's own price. A 76% prop at −400 (−5.0%) no longer gets the tag. The tooltip says the 56.2% per pick assumes independent picks.
- **Just missed and Hail Mary records:** both lines in Performance now say "the ones you chose: a user-selected subset, so results may reflect your selection". Every Watch bet, chosen or not, stays in the Watch panel as a $1 shadow record.

## What was built in v4.52

### 4. The ⚡ signal (what Momentum does), with your five answers applied
Momentum ranks a play by a sharp book moving (+120 to +100 is 4.5 points of chance), how long ago, and a slower book that has not followed. The Sentinels ranked "the edge right now" only.

- **Recorded:** each load keeps the market's no-vig chance and which market it is (sharp or consensus). Only points from the same source are compared, so a change of source is not read as a move.
- **Signal:** the market's chance is 1 point or more above its lowest in the last **2 hours**. Six hours are kept as context.
- **No signal** when:
  - the market was higher earlier in the six hours (a rebound after a bigger drop);
  - the latest load has no market number;
  - the latest point is over 2 hours old;
  - there are fewer than two observations.
- **Book behind** = the book's price moved less than half as much, and the market is within half a point of its high. A market that came back is shown but not counted.
- **"Sampled"** is shown when the loads around the move are over 30 minutes apart.
- **Bonus**, only when the book is behind:

  `5 × min(1, rise ÷ 4 pts) × recency × source`

  Source is 1 for the sharp market and 0.4 for the consensus, so at most +5 or +2. Recency is 1 within 15 minutes and 0 at 2 hours. A bet with no signal scores exactly as before.
- **It never changes a decision or a stake.** Sort › ⚡ Signal is separate from the score.
- **Limit:** it is not live. A move is seen only when the board is loaded or the Sentinels run on that device.

### 5. Reading the record
In Performance › ◎ Rings and extras:

- **Perfecta minus the other best bets, as a difference.**
  - ROI difference (total profit ÷ total stake in each group) and mean CLV difference, each with a 95% range.
  - **5,000** seeded resamples of whole games. Games are resampled inside three kinds (both groups in the game, Perfecta only, other only), so each resample keeps the same make-up.
  - The ROI range shows from 5 settled bets in each group over 4 games; the CLV range from 5 closing lines in each group. When a range is missing it says why.
  - Under 30 bets or 15 games it is labelled "Extremely preliminary: this only shows the method works, it is not evidence yet."
  - Stage by the smaller group: under 100 bets or 50 games "descriptive only"; 100–299 and 50–149 "directional"; 300+ and 150+ "useful if the range excludes zero"; 1,000 and 500 "credible".
  - The top sports and markets of each group.
- **Every Just-missed Watch bet, chosen or not**, at two prices kept apart:
  - the price when first seen (ROI, Brier and log loss; "not always a price you could still get near kickoff");
  - the price 5 minutes before kickoff, one pick a game. The first price is never used in its place.
- **Parlay leg:** now needs your normal floor (1.5%) at its own price, no outlier flag and a market price.

### 6. Found by the code review of this build, and fixed before it shipped
- The first random generator left the exact range of a double and repeated after about 10,000 draws. It is now mulberry32, with a test that 200,000 draws spread evenly.
- A game written two ways ("PHI @ CHI" and full team names) was two clusters. The cluster key now uses ESPN's event id or the two team codes first.
- The comparison is cached by content, so it is not worked out again on every save.

### Your code findings on v4.51: checked against the code
| Finding | Checked | Status |
|---|---|---|
| Stake, Math order and score Edge use the blend or the model, not `actNet` | True. They differ from `actNet` only when the model is below the market. | **Not changed yet.** It lowers some stakes, so it waits for Alonzo's go as its own build. |
| Kalshi re-checks the floor on model EV after fee rounding | True | Same build as above. |
| Bet-log "vs Pinnacle", "void" and "+ ticket" also get the remove handler | True (`button.kill:not(.sell):not(.edit)`) | Same build. |
| Parlay leg at 0% | True | **Fixed in v4.52** (the configured floor). |
| `.fill-warn` rule inside a comment | Not true in the real file: the rule is live. A paste artifact. | Nothing to do. |

### Not built
- The market line on the card's price chart.
- A Worker timer for live snapshots.
- A manual same-player override with a combined cap.

## Checked
- The modes test was rewritten: 67 checks (each mode's list, the counts under filters, held bets, the empty states, four screen widths, cards and table).
- A new test covers the signal and the record comparison: 25 checks, with the arithmetic done by hand in the test.
- Each build was reviewed by independent agents, and every finding was verified against the code before it was fixed.
- v4.51: all 77 test runs passed and it is published. v4.52: all 78 passed and it is published.
- The independent review of v4.52 was cut short by a usage limit: two of three reviewers finished and their findings were checked by hand instead of by a second agent.

## Also started: the build's memory (your points on the Anthropic talk)
- `memory/index.md`, with one short file per settled decision (rule, formula, version, tests, what it supersedes), recurring bugs and the test that stops each, and platform facts marked verified or unverified.
- Three skills: betting math, grading and matching, release and tests.
- A dream-review prompt that proposes and never edits, with the list of things it may never change (blend weight, floors, Kelly, fees, the six checks, grading, matching, caps).
- `CLAUDE.md` cut down to the rules needed in every session; the full version history moved, word for word, to `memory/history.md`.

## Questions for ChatGPT
1. **Math consistency build.** If stake and Math order move to `actNet`, only bets with the model below the market change, and their stakes go down. Do you see any case where that makes the daily-max fill order worse?
2. **Score Edge.** If the Edge part of the Sentinel score moves from model EV to `actNet`, every score shifts down a little. Should the STRONG / GOOD / THIN cut-offs (75 / 50) stay where they are?
3. **Signal source.** Today "sharp" means the pasted Market EV fair price; everything else is consensus at 0.4. Is 0.4 right for a no-vig price built from one sharp book through an odds API, or should that count as sharp?
