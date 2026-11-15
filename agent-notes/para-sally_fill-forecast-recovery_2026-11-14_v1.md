# For Sally · Recovering forecasts for book fills from price history · 2026-11-14

Ref: CC-2026-11-14-11 · from El Capataz (Claude Code) · times America/Chicago · a proposal, nothing built

## The problem
Alonzo picked three bets from cards on the board (Evan Bouchard Over 2.5 SOG and Dawson Mercer Over 1.5 SOG on Novig, about 2 PM today; WVU −2.5 on Novig,
Fri 11/13 9:41 PM). He placed them at Novig without pressing "I bet this". The app read the fills from Novig and logged them itself ("auto · Novig").
A fill gets a forecast only if its card is still on the board **when the fill is read**. By then the board had reloaded or the card had dropped
(for example the game started), so they were logged with **no forecast**: no La Contadora chance, no Fair then, no Net EV, only the v4.87 ENTRY PRICE BAND.

## What the app already keeps
`mbev.px`: a price history per card, keyed by pxKey = sport | name | market | side | game day. Each point is [minute, offered price, La Contadora's
fair chance, market no-vig chance, market source s/c]. A point is added when something changes or every 15 minutes; up to 40 points per card,
250 cards, kept 3 days. It lives only on the device that showed the board (not synced).

## Proposal (automatic for every new fill, plus a one-time pass over the log)
When a fill matches no card:
1. Look up `mbev.px` with the fill's pxKey (same sport, player or team, market and line, side, game day).
2. Take the **last point at or before the fill time** (bet time), only if it is **before kickoff** and **no more than M minutes before the fill**.
3. Attach it to the bet as a forecast with its source: `snap.forecastFrom = {src:'price_history', at:<point time>, ageMin, fair, mkt, offeredThen}`.
   EV is computed at the price actually paid (the fill), with La Contadora's chance from that point, using the same formula as everywhere else.
4. Label in the Bet log: "forecast from price history at 1:55 PM (6 min before the bet)".
5. Never overwrite a forecast a bet already has. Never change the fill's price, stake or result.
The same check runs once over logged bets with no forecast whose history is still on the device (under 3 days).

## Questions
1. **M, the window.** How old may the history point be relative to the bet time? I suggest 15 minutes, the history's own heartbeat (points are at most
   15 minutes apart while the board is open). Older points: no forecast.
2. **How they count.** These forecasts were real pregame numbers that the app showed before the bet. But the bet was not tied to the card when it was placed.
   - Option a: count them like any other bet in bands, Said vs won (calibration-v1) and the Scorecard.
   - Option b: show the band, but report them as a separate group ("forecast from history") until there are enough of them to compare.

   I lean to b, since calibration-v1 is frozen as "earliest valid pregame ticket with her chance".
3. **The price moved.** If the history's offered price differs from the fill price by more than X points, should we still attach it?
   (EV is computed at the fill price either way.)
4. **The root cause.** Should the app also save a small "cards shown" record that syncs across devices, so a fill read on the phone can find a card
   shown on the Mac? It would be bigger: it adds synced data.

Nothing is built until we agree and Alonzo says BUILD.
