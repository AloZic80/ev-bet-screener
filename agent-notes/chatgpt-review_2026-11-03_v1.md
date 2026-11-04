# Review request: v3.57 of the 0xBeta Screener (for ChatGPT)

---
Ref:        CC-2026-11-03-07
Date/time:  2026-11-03 21:55 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         ChatGPT (sent by Alonzo, the owner); copy to the Project "Betting-for-Pros"
Subject:    An independent check of what Claude Code built in v3.57
Version:    v1
Replies to: none
Status:     for review
---

Hi. Alonzo asked for a second opinion on this release.
- Please look for **bugs, wrong math and risky behaviour**. A rewrite is not needed.
- Claude Code will check each finding against the code before changing anything.

## The app in brief
- One file, `index.html` (HTML, CSS and JavaScript, about 8,700 lines, no build step), served by GitHub Pages at props.0xbeta.dev.
- Public repo: https://github.com/AloZic80/ev-bet-screener
- The changes are in this pull request, which includes the diff: https://github.com/AloZic80/ev-bet-screener/pull/4
- Prices come through the owner's Cloudflare Worker. API keys are Worker secrets, not in the repo.
- Results come from ESPN's public scoreboard. Saved bets live in the browser's localStorage (`mbev.*` keys).
- Notes for agents are in `CLAUDE.md`. The tests are in `tests/`; `node tests/run-all.js` runs them (needs Node and Playwright).

## What changed (function names to search for in index.html)
1. `betStillOpen`: a bet with no game time, dated up to 7 days after the board date, counts as open. That way a hand-added bet on a later game finds its board row (`fillManualFromRow`).
2. `playedHtml`:
   - a game with no time shows its status by its date;
   - a timed game says "over · result pending" after `overAfterH` hours (5; 8 for fights; 100 for golf).
3. `openBetEditor`:
   - for a board row whose game has started (`liveState(r)==='started'`), a Result select appears (`.eb-res-new`);
   - a chosen result skips the "not worth it" and limit second presses and saves the bet graded (`gradedBy:'manual'`).
4. `renderLog`, `logDayHtml`, `lookOutWhy`, `renderLookOut`, `lookChip`:
   - the log is sorted newest first and grouped by game day (`gameDayOf`); closed days stay in the page, hidden;
   - Look out lists bets with no result once the game is surely over, typed games whose day has passed, `?` results, and parlays whose day has passed.
5. Photos (`rosterLoad`, `espnShotFor`, `pcShotErr`, `pcFillShots`, `normPName`): FantasyPros by player ID first, then ESPN's headshot by exact normalized name on one of the game's two rosters. A name on both rosters gets no photo.
6. Leagues (`MORE_LEAGUES`, `oaCodeOf`, `srcSportOptions`):
   - 52 more leagues, each with The Odds API key and ESPN path;
   - any key can be typed in;
   - `oaToRows`: a Draw makes an h2h set 3-way in any sport;
   - `sbToRows`: a league not in `SB_SPORTS` is kept under its own code (3-way if that competition has a `MONEYLINE_3WAY` market).
7. The data sources row (`#srcBar`) moved from Settings back to the page header.

## Questions to check
For each, say **"no finding"** if it looks right.
1. **De-vig math in `oaToRows`.**
   - The fair price is Pinnacle's no-vig price when Pinnacle is in the answer. Otherwise it is the average no-vig price over at least 3 books.
   - A 3-way set must have all 3 outcomes.
   - Is that right for soccer, cricket (Test draws) and rugby? Any edge case where a 2-outcome set from one book mixes with 3-outcome sets?
2. **`sbToRows` with unknown leagues.**
   - Could a non-soccer competition with a `REGULATION_TIME` segment get through wrongly?
   - Could a 2-way moneyline in a sport with draws be priced wrong?
3. **`lookOutWhy`.**
   - Are there bets it misses (no game time, no date, sold, voided, exchange fills)?
   - Are there false alarms, for example a game still going after 5 hours, or a rain delay?
4. **`betStillOpen` at -7 days.** Side effects on same-game limits, "already bet" matching or the Today card for bets dated in the future?
5. **The board Result box.** Can a bet be saved with a result while its game has not started? Can the "4 hours" note be wrong?
6. **`normPName` and photos.** Names that normalize to the same text but are different people? Names that should match but do not?
7. **League keys and ESPN paths in `MORE_LEAGUES`.** Any The Odds API key or ESPN league path that is wrong or out of date? Claude Code could not load them live from its sandbox.
8. **Security.**
   - Anything in the page that could expose a key?
   - The page sends the screener passphrase as a header only when set. Is that enough, given the repo is public and the Worker URL is in the code?
9. **Anything else** you would change before the owner bets real money on it.

## Known limits (please do not report these)
- No live test from Claude Code's sandbox: api.0xbeta.dev and ESPN are blocked there.
- BettingPros' all-soccer load (SOCCER) is not matched to ESPN games yet, so those rows are skipped.
- Tennis, MMA, boxing, cricket, rugby, AFL and leagues with no ESPN path are graded by the owner, from Look out.
- The Odds API menu is a built-in list until the Worker passes through The Odds API's free `/v4/sports` list.

## Please answer in this shape
One block per finding:
- **Severity:** bug / risk / nit
- **Where:** function name, and line if you have it
- **What happens:** the input and the wrong result
- **Fix:** one or two lines

Then the question numbers you checked with no finding.
