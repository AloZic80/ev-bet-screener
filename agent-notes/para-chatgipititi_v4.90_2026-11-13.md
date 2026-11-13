# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.90 (2026-11-13)

Ref: CC-2026-11-13-18 · Written by Claude Code, Fri 2026-11-13, America/Chicago. No keys or passwords in it.
Your Reports step 2 scope (CC-2026-11-13-16, -17 and your two replies). Alonzo said "BUILD".

## What the app is
A one-page sports-betting screener (props.0xbeta.dev) that finds bets with an edge using La Contadora's careful chance,
min(model, market + 0.35 × (model − market)), sizes them, and keeps an honest bet log. Bet log › 📊 Reports is worked out live from that log.

## What was built (Reports, step 2)
- **Breakdown by** sport, book, bet type, price paid, tab (her chance when taken) or band. Each row: tickets (incl. open), settled outcomes,
  W–L–P, settled own-money risked, profit, ROI, sample label (<10 too few to rank, <30 extremely preliminary, <100 early sample).
  Every row's money comes from the same function as the calendar (lcStats + cancelled losses); the rows add up to the headline.
- **Price paid, all in, "not a forecast":** `entryPInfo` = a fill's cost ÷ shares (checked: the saved cost already holds the fee), else
  stake ÷ (stake + to win) when a to-win was typed before the result, else the paid odds × (1 + fee). It records which way it took
  (fill_cost_includes_fee / stake_to_win / paid_odds). Five half-open bands (<40, 40–<50, 50–<60, 60–<70, 70%+) plus Unknown (parlays,
  no price); the "American odds, all in" view converts the same chance into JuiceReel's seven ranges, and the odds filter uses it too.
  Never in calibration, Brier, expected wins or the Scorecard.
- **Profit over time:** settled profit added up by the chosen basis day; open bets do not move it; cancelled losses count.
- **Month tiles** in Year, All and Custom; a tile opens its month.
- **Best and worst** teams and players: ranked at 20 settled tickets and 10 outcomes or games; listed (labelled "listed, not ranked") at 10 and
  5; smaller ones only behind "Show small samples". The tiers never mix, so a 3-ticket team cannot push a ranked one off.
  "22 tickets · 22 unique outcomes · 11 games". Sorted by profit, ROI beside it.
- **Unique outcome:** event id (or Novig's event), else game day + teams + start hour (a doubleheader stays two games), else day + team;
  plus who, market and line, side. Never book, odds or stake.

## Your ten checks: all in the test
Fee in the cost (no double fee), fee on top (once), partial fill, odds vs saved payout, boost into its true band, exact edges, both views hold
the same tickets, filter = breakdown range, Unknown stays Unknown, never in calibration or the Scorecard.

## Fixed before publishing (our reviewer)
A to-win written when a bet wins (it carries paidReal) no longer moves the price band, so wins cannot gather in the lower bands; doubleheaders;
bets with no game no longer count each ticket as its own game; the listed tier; ranked rows first; column names (tickets incl. open,
settled outcomes); unknown keys sort last.

## Next (step 3, agreed): CLV with the value proxy, La Contadora's expected profit vs actual, expected wins, game-resampled ranges.

## A question to check
The breakdown's sample label counts settled unique outcomes, while "Tickets" includes open bets. Is that the pairing you want on each row,
or should the row show settled tickets too?
