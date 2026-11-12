# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.80 (2026-11-12)

Ref: CC-2026-11-12-03 · Written by Claude Code, Thu 2026-11-12, morning, America/Chicago. No keys or passwords in it.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. La Contadora (named Doña Petra, after Alonzo's grandmother) is the conservative chance,
min(model, market + 0.35 × (model − market)), and its EV after fees decides everything. The app sizes the stake, says exactly what to type at the book,
and tracks results honestly. The exchange connections are read-only.

## What Alonzo asked
After v4.79 I asked him five things. His answer: **"Yes all across. And what you seems better."** I had recommended option A for the near-misses.

## What was built
1. **Near-misses, option A.** The bets that just miss La Contadora's floor are no longer offered at the smallest bet.
   - They stay 👀 Watch records (no money), so the record still shows whether they would have won.
   - 🍀 Suertudo now lists only the Coin Flips she approves (45–50%).
   - The code is kept behind a switch (`EXTRAS.nearMiss`), so B or C stays one line away.
2. **Show › ◎ Perfectas lists the 6-of-6 bets from every tab,** whichever tab is open. Before, it filtered inside the open tab.
3. **Kalshi spreads (since v4.09 they said YES on every spread).**
   - Kalshi's spread market is "<team> wins by over X". A favourite (−1.5) is YES on its own market.
   - An underdog (+1.5) is **NO on the other team's market**, e.g. "NO on CAR wins by over 1.5 (= SEA +1.5)". That is how our Worker already prices it.
4. **Soccer Draw rows.**
   - A Draw row names the home team as its team, so it was read and labelled as the home team winning.
   - Now: no Kalshi / Polymarket strip, the card says "Draw (tie)" with no home logo, and the app never asks the Worker for a Draw's price.
   - Worker v3.44 also refuses Draws: "Draw: not read".
5. **🔮 Brujo** now says "long-shot moneyline limit used (3 a game day, one a game)" when that limit is the only thing holding a long shot back. Before, it said "none right now" (the v4.79 review's last finding).
6. **🔔 Notifications, level 1** (Settings › "Tell me when a new ◎ Perfecta shows up", while the app is open):
   - for each new Perfecta: a banner at the top, a short sound, and a browser notification;
   - the words say what to do, e.g. "SEA +1.5 · Kalshi · OK up to 66¢: a Limit at 66¢, not Market";
   - each Perfecta alerts once (remembered 3 days);
   - turning it on takes the board as it is, so there is no burst;
   - nothing extra is read from any API. On an iPhone, browser notifications need the app added to the Home Screen; the banner and sound work anyway.
7. **Worker v3.43** is live too: Kalshi games are found by team names when ESPN's code differs (the Oklahoma State case).

No floor, fee, Kelly, cap or grading rule changed. The one stake change is that near-miss offers are gone (option A).

## Tests
- `v480-test` (21 checks): no near-miss offers, Perfectas in every tab, Kalshi NO on underdog spreads, Draw cards, the Draw never asked, notifications once each, no burst, off by default, the banner fixed and inside 390 px.
- The near-miss tests (`tabs-v476`, `modes-perfecta`) switch the offers back on for themselves, so that code stays covered.
- Worker: `draw-test` (4).
- The full suite result is in the PR. Independent reviewers read the diff, and skeptics tried to refute each finding.

## Questions for you
1. **Near-misses as 👀 Watch only.** Is there a reason to keep offering any of them, e.g. the ones within 0.3 points of the floor? I would say no: a NO is a NO.
2. **A Draw is not priced** on the exchanges until each book's draw market is mapped (Kalshi tie market, Polymarket draw side, Novig 3-way). Is it worth mapping, or are soccer draws rare enough to skip?
3. **Notification words.** For an exchange it says "a Limit at <her most>¢, not Market". For a sportsbook it says "OK up to <odds>". Anything you would add so a beginner cannot misread it?
4. The earlier questions (v4.79 note: the limit price, the share count, the Polymarket fee, the Polymarket forms) are still open.
