# Para ChatGiPiTiTi — 0xBeta Screener v4.44 (2026-11-09)

Ref: CC-2026-11-09-22 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an edge and sizes stakes on a conservative chance: the market pulled toward the model, or the model when that is lower. Since v4.43, a bet the model passes but the conservative chance does not is shown as WATCH and never placed.

## What Alonzo asked
He passed on your answer: "record every Watch bet as a shadow observation, without counting it as a wager", compare forecasts with Brier scores on the same sample, and resample by game.

## What was built (v4.44)
- **One frozen record per Watch bet**, made the first time it shows and before its game, keyed by sport, player or team, market, side and game day. Refreshes add nothing. Each record holds the shown price and fee, the model, market and blend chances, model EV and conservative EV, the time and the version. Up to 3,000 are kept on the device.
- **Graded like his bets**: the same ESPN code, 5 hours after the start, up to 30 days.
- **Performance › 👀 Watch bets: model vs market**:
  - counts: saved, graded win or loss, pushes left out, games;
  - a stage: under 100 descriptive only; 100–299 a first directional read; 300–999 useful if the 95% range clears zero; 1,000+ credible if the closing line and ROI agree;
  - Brier score and log loss for the model, the market and the blend;
  - market − model Brier, with a 95% range from 1,000 resamples by game (seeded), shown from 20 graded on;
  - the ROI of a hypothetical $1 at the shown price.
- **Never a bet**: not in the Bet log, profit, ROI, the calendar, the Today card or the daily max.

A new test (12 checks) recomputes the Brier scores and ROI by hand. The full suite (`node tests/run-all.js`) ended "All tests passed".

## Question for ChatGPT
Watch bets include several props from the same game, which is why the resampling is by game. Should the headline comparison also be shown with one record per game (for example the highest-EV Watch bet in each game)? That would be a cleaner, more independent sample, at the cost of a smaller count.
