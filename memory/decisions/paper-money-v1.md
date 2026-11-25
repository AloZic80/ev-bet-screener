# Paper money (paper-money-v1) · active since v5.30 (2026-11-25)

Owner, 11/15: "Shadow Bets!! Hell yeah!! ... like Paper Money". Spec: `agent-notes/para-sally_paper-money_2026-11-15_v1.md` (proposal) and
`agent-notes/sally-all-open-questions-reply_2026-11-17_v1.md` (part B and her answer to the 11/17 message, which wins where they differ). Owner, 11/25:
"BUILD I SAID", also yes to (1) IndexedDB storage, settled records never pruned, and (2) the written guess below. Personal edition, God view only.

## The rule
- **Recording only.** Nothing about a paper bet changes a decision, a stake, a floor, a threshold, the order or the board. Never in `mbev.log`, the Today
  card, the Bet log totals, the calendar, Reports' real totals, the Scorecard, the 1,000-bet blocks, sync or a daily max. No Worker call of its own.
- **Which cards:** pregame board cards (`api:` / `paste` rows) that La Contadora approves (`listedOf` status `approved`: `r.pass`, not held, moved or an
  extra), her EV at least the floor, and a stake from the price and value rules at least the smallest bet before the player, game and day limits
  (`r.ppPre`), whose chance (`actProb`) is under the plan minimum (`planCfg`; plan off = nothing new). A $0 from the one-per-player, game, axis, day,
  outlier-count or long-shot-moneyline limits stays a paper bet (`limitZero`, out of the staked ROI). Not paper: outliers, long shots, AWOL, Old or a
  price read 30+ minutes ago, a started or closed game, pick'em books and parlays. Model-only cards are kept and tagged.
- **One record per exact outcome** (`watchKeyOf`: sport, player or team, stat family, side, line, ESPN event or start), any book; also found by `pk`
  (the same key with the start time), so the card before and after ESPN's event id arrives is one record (round 2, D1).
- **Groups, reported apart:** Paper · Unlikely (<45%), Paper · Coin Flip (45% to plan minimum), Paper · Below plan minimum (50%–X%) when the minimum is
  over 50%. The group and the plan minimum are frozen at the first sighting.
- **Prices:** `first` (frozen whole: price, fee, model, market, her chance and EV, the app's stake, version, time). `near` = the eligible sighting closest
  to 5 minutes before the start within the last 30 minutes; if a closer sighting no longer qualifies, `near` is cleared and the reason saved (`nsWhy`,
  counted in `nsMiss` once each time the reason changes). Times are when the price was read (`seenAt`), not the redraw (round 2, D2, D5). `stale` = the latest sighting 31–120 minutes before. Nothing after the start. No extra re-reads (B2-2): coverage comes from the
  board loads, Sentinels and scouts that already run.
- **Real-bet overlap:** a single in the Bet log on the exact outcome (same game day, placed before the start), or the board's ALREADY BET: marked
  `real`, kept in the $1 totals and counted apart.
- **Grading:** `paperGrade`, after `autoGradeLog`, with the Bet log's own ESPN code. A push is $1 staked, $0 back. Settled: `obs` dropped, the record kept.
- **Storage:** IndexedDB `mbev-paper`, store `paper`, key `k`, on this device only (not synced). The CSV button is the copy. Each save reads the saved
  copy first: another tab's first sighting, result and real-bet mark are kept (round 2, D3). Grading also runs when no real bet is open (D4).

## Reports › 📝 Paper money (God view only)
- The written guess (fixed in `ppGuess`, shown before any outcome): "48.5–50% beats 45–48.5% on flat-$1 ROI at the near-start price; judged after 100
  outcomes and 50 games each side". Sides by the near-start chance; only paper bets first seen from 2026-11-25 (CT) count; judged by a 5,000-draw
  whole-game bootstrap of the ROI difference (held / did not hold / not shown either way).
- Each group: the "$1 on each, near-start price" headline (settled, W–L–P, games, profit, ROI, 95% range by game, Read word capped at Leaning:
  Too few to read under 30 outcomes or 15 games, Early sample under 50 / 25). Under More: every paper bet at its first price; early price only
  ("not checked in the 30 minutes before the game"); the stale step; what the app would have staked; won vs La Contadora's expected and Brier;
  "CLV: exchange cards only" (first price against the near-start price at the same book: the last price seen, not a true close).

## Tests
`tests/v530-paper-test.js` (34 checks, round 2 D1–D5 included).

## Open for the owner
- Paper records are per device (IndexedDB, not synced): a card seen on the phone and the computer is two separate records, one in each browser.
- Clearing the browser's site data deletes them; the CSV is the only copy.
