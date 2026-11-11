# History: what each version did and why

Moved here word for word from `CLAUDE.md` on 2026-11-10 (it had grown to about 300 long lines read in every session). Nothing was removed.
Search this file by function name or version (`grep -n "propSame" memory/history.md`) before touching that code. The current rules are in
`memory/decisions/`; when a line here disagrees with a decision file, the decision file is the rule and this is the record.
New builds add their line at the top of the right section.

## Gotchas
- v4.67 (owner: "Yes to all", after the CSV analysis): `logCsv` adds five columns at the end (old ones keep their places): stat (`b.market`: a sacks
  bet said only "O 0.5"), mode (Safe / Feeling Lucky (just missed) / Clairvoyant (Hail Mary) from `b.tier`), source (`srcTagCore` text), band
  (`logBandOf`), La Contadora EV % (`snap.actNet`; the "EV after fees %" column is the model's). On a phone the ESPN scores box is one line too
  (`#ssFoldBtn`, `body.ss-open`, shown on every tab like the box). `tests/csv-columns-test.js` (7), phone-header-test (24).
- v4.66 (owner: "I want to be able to click on the betting range ... or tell on the log which ones are classified as unlikely, coin flip, etc, but after
  the bet or on the log"): `logBandOf(b)` (the band from the fair odds saved with the bet; none saved = 0, "no band") and `logBandChip(b)` on every single
  in the Bet log; `logBandFilter` shows one band with "N bets · W–L–P · won X% vs Y% expected · ±$"; the Bet result study's bands are buttons that open
  the log on that band. Bug fixed: `toProb('')` is null and `cvBand(null)` gave band 1, so a bet with no fair odds was counted in the study as Unlikely
  at 0% expected. `tests/log-bands-test.js` (15).
- v4.65 (owner, phone, the "51 pass · of 2223 · 2172 skipped · 2 already bet" box: "I'm sure you can accommodate the top info somewhere else or
  abbreviate"): under 760 px the box is one line inside itself (`#sbFoldBtn`): "Board 51 of 2,223 pass · 2 already bet ▾" (already bet in the alert's
  red, so it is never hidden), closed every time the app opens (`window._sbOpen`). `tests/phone-header-test.js` (22).
- v4.64 (owner, phone, a screenshot of the Today card: "Even this"): under 760 px the Today card is one line (`#tbFoldBtn`), closed every time the app
  opens (`window._tbOpen`); `hdFoldPaint` writes "TODAY · $10.50 · 4 bets · 1–1 · $2.00 in play ▾" (another day: its label; no bets: "no bets"; bets to
  check in orange). `.head.tb-open` shows the card; by book stays remembered inside it. `tests/phone-today-test.js` (15); live-batch-test opens the line.
- v4.63 (owner, phone, screenshot of the BettingPros and Sources panels: "make them cleaner as well. I don't need to have them open all the time.
  Because the my bets will be all the way to the bottom"): under 760 px each panel is one line (`#bpFoldBtn`, `#srcFoldBtn`, `.hd-fold`), closed every
  time the app opens (`window._bpOpen`, `window._srcOpen`, not saved); `hdFoldPaint` (hoisted, reads the page; a MutationObserver on #savedNote, #srcBar,
  #apiSport) writes "BettingPros · NBA · tomorrow · not live ▾" and "Sources · BettingPros 37 left · Worker 631 calls ▾". `.head.bp-open` /
  `.head.src-open` show the panels. A computer is unchanged. `tests/phone-header-test.js` (19); bp-several-test opens the line first on a phone.
- v4.62 (owner: "Did I not say that what's on the screenshot should all be in a drop down because I don't need to see it all the time?"): v4.60 had left
  the Today's games line (#todayLine) and Cover bands (.cv-legend-box) outside. `barPhonePlace` (hoisted; runs at startup and on a matchMedia change)
  moves them into the board bar on a phone, first among what Filters opens, and back above the bar on a computer. `tests/phone-filters-test.js` (24).
  Lesson: when the owner points at a screenshot, everything in it is the scope; ask if a part looks out of place, do not leave it out.
  Same version (owner, with a screenshot of his phone showing everything open: "Did I not say this needs to be all on a drop down?"): his phone had
  remembered Filters as open (mbev.barMore from v4.25). Filters now starts closed every time the app opens (`window._barOpen`, not saved) and the
  old key is removed at startup. live-batch-test now expects Filters closed after a reload.
- v4.61 (owner: "I had already said build", after a six-reviewer recheck of v4.57 found 12 real issues): book-swap cards follow the unreadable rule
  (the shown swap book's last quote stays in `_altQ` marked `_unread`; the incumbent is `_swapInc`, the book shown when the last press started; a fresh
  price replaces it only if it clears `cfg.eMin`, else `r.swapNone`); a card moved to Kalshi that fails the floor after the fee rounding is decided again
  without Kalshi (`shopChk.skip='kalshi_fee_rounding'`, swap: `_swapSkip`); `r.priceAt` (kept in KEEP_FIELDS) = when a cached answer was fetched
  (BettingPros `meta.fetched_at`, Sportsbook API `x-sb-at`; SportsGameOdds and The Odds API saved answers: 'unknown' = not fresh), read by `bookPick`;
  the unread incumbent's age comes from `shop.scan` or the board, never `_liveAt`; a press's "none" result wins over the age label; "live" only while
  the last press read it ("last read 20m ago"); tooltips name the bypass and `r.shop.from`; `swapBooks` resets before its empty-books return;
  a failed /live request leaves the unasked rows untouched and keeps the error on screen; "repriced" = book or price really changed.
  Then, same version (owner: "You can decide if you think it's the best thing to do", "Ok fix it and build"): `rowSeenAt` (the card's age pill, the ◎
  fresh check, the score's Fresh) reads `priceAt` when set and `swap.at`; `shopExchanges` no longer bumps `_liveAt` for every quote: `decide` sets it
  only when the winner is a live-read price, so reading Novig does not make a Bovada price new; `srcFetch` returns `at` (the Worker's `x-src-at`, kept
  on its saved answers), so SportsGameOdds and The Odds API saved answers carry their real time; OddsPapi rows are `priceAt:'unknown'` (the Worker
  caches each game 15 min with no time; `g.at` is used if it ever sends one). A second review (4 reviewers, 20 findings, all accepted) also gave:
  `r.shop.from` only when the book changed and `r.shop.kept` (tooltip "was read again ... keeps its place"); the Kalshi second pass says
  `exchange_unreadable_no_actionable_quote`, not `nothing_readable` (swap: when `_swapSkip` is not empty); a failed or thrown /live request restores the
  unasked rows' `_shopQ` and 🔓/🔒 (`r._was`) and does not stamp `pkSentAt`; the swap tooltip names the unreadable book, `snap.shop.swapFrom`;
  `swapBooks` drops `shopChk` when it makes a swap card; "live · was" becomes "read 5m ago · was" after `shopLim` (`shopSameOld`); `barSumPaint`
  skips Sport / Sweet spot / My games on the pasted board and reads `boardBooks`; `#shopMsg` keeps its place on a phone; `aria-controls` lists all.
  A third review (3 reviewers, 13 confirmed, 1 medium) then gave: `decide` deletes `_liveAt` when the winner is not a live price (a Pull sportsbook
  that wins the card back is as old as the board), `swapHunt` no longer sets `_liveAt` (a swap card's age is `swap.at`), `bookPick`'s `seen` is
  `max(shop.scan, _liveAt)` else the board; `rowSeenAt` no longer counts `exOpen.at` (the open-market check leaves the card's price as it was);
  tooltips: `unreadLater` for a moved card, "was read again 2m ago and kept its place"; a failed scan gives unasked rows no new 🔓/🔒 and drops a
  restored tag that is no longer true; the Kalshi re-decision loops up to 4 rounds (each only takes cards off Kalshi); the age pill says "Paste the
  board again" for pasted rows; `ringRecheck` compares `shopStaleSig()` with the one saved at the last draw (it compared a count).
  A last short check (2 reviewers) found two low points in that redraw: the signature is now saved in `ringRecheck` before `refresh()` (a draw held
  back by an open editor was asked for on every tick) and at the start of `renderCore`, before the cards are built.
  `tests/book-choice-v461-test.js` (74, fails on v4.60), `tests/phone-filters-test.js` (22).
- v4.60 (owner, phone: "I think this can be on a drop down?", "Also this", "For now only on phone"): under 760 px the board bar shows only the search
  box, Filters and Send the Sentinels (CSS `order`); Show, Sort, Sport, the book chips, the tick boxes, Show all notes and Cards fold behind Filters
  (`.board-bar.bar-open`, the same `mbev.barMore` switch). `barSumPaint` (hoisted, reads the page and localStorage only) names what hides bets on the
  button ("Filters · Novig · Sweet spot ▾", 3 or more: "3 on"). A computer is unchanged. `tests/phone-filters-test.js` (19); live-batch-test now
  expects Cards folded on a phone.
- v4.59 (owner: "I want to be able to search by sacks"): `passesSearch` also matches `r.market` and `shortStat(r.market)`; placeholder "Search player, team or stat…". `tests/search-stat-test.js` (7).
- v4.58 (owner, phone: "buttons don't highlight anymore"): with Settings › Colour scheme › Custom on a dark colour (navy), `palCss` kept that
  colour as the dark-mode `--brand`, so the chosen tab, the mode chips and Load were as dark as the page. Dark `--brand` must now also be 3:1 from
  `--panel` and `--page` (lightened until it is, white text still 4.6:1). Not caused by v4.57. The built-in dark schemes other than green are
  2.3 to 2.7:1 from the panel (not changed; reported). `tests/palette-test.js` checks it, with two navies added.
- v4.57, agreed with ChatGPT then "BUILD" (11/10), closes two gaps ChatGPT found in v4.56. `bookPick(r, Q, cfg, now)` (pure, hoisted) is one Sentinels
  decision: the book shown now is the incumbent (the Pull book `shop.orig` is only the "was" label); fresh incumbent (an exchange read in this scan, or a
  sportsbook price whose `loadedAt` / `pasteAt` is inside `shopLim`: 3 min, 90 s within 5 min of kickoff) keeps the 0.3-point `actNet` margin; an exchange
  that could not be read gives way to the best fresh price with `actNet >= cfg.eMin` (`exchange_unreadable`; fresh prices but none clears it: `exchange_unreadable_no_actionable_quote`, nothing moves); a stale sportsbook price gives way to the best fresh exchange price with
  `actNet >= cfg.eMin` (`sportsbook_stale_unrefreshable`), else nothing moves and the card reads "No current best book confirmed · sportsbook price is stale ·
  check the book manually"; nothing readable = `nothing_readable`. The decision is kept on `r.shopChk` and saved by `shopSnap(r)` into `snap.shop.chk`
  (incumbent, challenger, p, actNet, age, readable, margin applied / bypassed, none). Book-swap cards: `r.swap.at` (the quote's `_at`), `shopStale` covers
  them, `swapBooks` keeps the shown swap book (`r._swapBook`) unless another is 0.3 better, and `shopExchanges` feeds a swap row's fresh quotes into
  `r._altQ` (they were read once and never again). `tests/book-choice-v457-test.js` (27).
- v4.56, the first build under the new rule (Claude Code and ChatGPT agreed the scope in writing, then the owner said "BUILD"): pick'em entries with a line not
  checked in the app (`dfs:'unknown'`) are provisional (`pkProvisional`): "PROVISIONAL BEST · check that the app has this exact line", EV and stake "if every
  line matches", and Log this entry asks once ("I checked: every line in the app matches"), saving `pk.lineVerifiedByUser`, `verifiedAt`, `unchecked`;
  every pick'em entry shows `PK_SETTLE` and saves `pk.app`, `pk.pays`, `pk.settle:'plain-win-loss-v1'`. Model-only legs (`l.mo`) are out of `pkBest`,
  ready-made slips and `pkSentLegs`; by hand they get a warning and the entry is never best. Book choice: `shopStale` (3 min, 90 s within 5 min of kickoff;
  shopped claims only) shows "Price 4m old · best book no longer confirmed · Send the Sentinels", redrawn by the 30 s `ringRecheck` with no price reads;
  in `shopExchanges` the 0.3-point margin is skipped when the row's own exchange could not be read (`r.shop.bypass`), and nothing readable gives
  `r.shopNone` ("no price could be read · refresh prices"); `snap.shop` saves from, at, age, stale, bypass. `orderDiag` + a Settings card measure open
  orders (matched, model-only, unmatched) without counting them. `tests/scope-v456-test.js` (17 checks; fails on v4.55), `sentinels-parlay-test` updated.
- v4.55 (owner pasted ChatGPT's reply to v4.54; `pkProbOf`, `MODEL_ONLY`, `r.moN`, `snap.modelOnly`, `pk.policy`): a Parlay pick's chance is La Contadora's
  (`okProb`), not the blend: lower only when the model is below the market (56% vs 60% → 56%, was 58.6%); it feeds the filters, `pkDist`, EV, Kelly and ranking;
  a logged entry saves `pk.policy:'actProb-v2'`; old entries keep their chances. Model-only bets (`r.noMkt`): at most 5 a game day (counting logged
  `snap.modelOnly`) and 1 a game, best `actNet` first, then fresher, then shorter odds; decision "MODEL ONLY $1.00 · no market confirmation · n of 5 today";
  skips say "model-only limit reached" / "model only: one a game". Kept on ChatGPT's advice, now tested: an outlier Make must beat the market; a book switch
  needs 0.3 points of `actNet`. Not built: the freshness / liquidity tie-breakers and the "stale quote overrides 0.3" rule. `tests/model-only-parlay-test.js`.
- v4.54 (owner: "Build v4.54 as well!!", ChatGPT's scope): Make price caps on `actProb` with the maker fee (`abMakeLadder`, Parole; "NO MAKE · no price clears your floor with
  the market"); a Make must clear the floor on `actNet` too; the Sentinels pick a book on `actNet` after its fee (`shopExchanges`, `swapHunt` `netAt`); no market price:
  Edge × 0.5 (max 25 + 8 + 20 = 53, GOOD, never STRONG; `POLICY.sent` = `v3-actNet-nomkt`) and `mathKey` − 0.5, so model-only bets come after market-checked ones.
  Review fixes folded into v4.53 before it shipped: Kalshi rounding re-checked after a daily-max trim (`take()`), in `abStake` (via `kalshiFit`) and in `recStake`; + Add a
  bet holds a no-market bet to the minimum; the other side's hint and the editor's live line on her chance; Settings › Net EV Min/Max filter on the +EV shown; the 🎟
  leg's 70% on `actProb`; snapshots worked out from what is saved (`actFair`, `actMkt`, `noAct`; the score only for a bet taken from a card, `sentOk`); the Bet log's EV
  cell shows `snap.actNet` with "model x%" under it; "Mean net EV" renamed "Mean model EV". `tests/ribbon-risk-test.js` runs on a fixed clock (it failed from midnight
  to 1 AM Chicago). `tests/invariants-test.js` (35 checks).
- One number for every decision (v4.53, `POLICY`, `actNetOf`, `kellyFor`, `sentScore` `e1`/`total1`, `snap.act`/`actNet`/`policy`/`sent`, `button.kill.remove`; owner, 11/10,
  pasting ChatGPT's code review: "Yes—build it"): La Contadora's EV (`r.actNet`) now also drives the stake (`auditCore`, the editor's `recStake`, `abStake`), the
  Math order and daily fill (`mathKey`), which bet of a game keeps its stake, the score's Edge and the EV shown (card pill, table +EV with "model x%" under it,
  Live Games, Copy board, Sort › +EV). Before, the stake and the order used the blend: the same when the model is above the market, higher when it is below
  (56% vs 60% at 52%: $8.59 → $5.21). After Kalshi's fee is rounded up per order, `actNet` is worked out again and re-checked (it was the model's EV only: a
  row at +1.8% before and +1.3% after kept a $1.08 stake). + Add a bet: a price only the model likes is a SKIP ("with the market it is +0.2%, under your 1.5%
  floor"; it said BET while "Pay up to" was below the price). The editor recommends $0 under the floor. Scores are lower for most bets (model +5.8%, hers +2.6%:
  87 → 61); cut-offs unchanged. Bet log: the remove handler is bound to `button.kill.remove` (the old `kill:not(.sell):not(.edit)` also caught vs Pinnacle,
  void and + ticket). Makes keep their own price cap. `tests/invariants-test.js` (29 checks, fails on v4.52). Rule: `memory/decisions/actionable-ev.md`.
- Much of the HTML is built inside single-quoted JavaScript strings. An apostrophe in that text ("it's") ends the string and
  breaks the whole app. Write "it is", or `\'`.
- Saving the bet log (v3.82, `saveLog` → `lsSafeSet`): if the browser storage is full, the app's caches (`LS_CACHES`: rosters, injuries,
  weather, league scan, quotes, logos) are dropped to make room; if it still fails, a red `#saveFail` note shows. Never swallow a log save error.
  v3.83: `saveFills` (From your books: Add, Ignore) saves the same way.
- From your books › Add (v3.87, `addFromFill`, `abFromFill`): opens the + Add a bet tab (`v-add`) filled in from the fill; the fill stays
  listed until Save bet, which links it (`linkFill`, `fillSeen` 'added') and removes it. Before, it switched to the Board tab and dropped the fill.
- Book fills (v3.89): a fill that matches no logged bet and no board row is still logged on its own when the book describes it
  (`fillDescOk`, `autoAddFromDesc`: player, stat, line, side, or team and line; price, cost, kickoff). Only undescribed ones wait in From
  your books. Ignore is also kept by fingerprint (`fillIgnored`, `fillPrint`, `mbev.fillIgnored`) and filtered on every render, so a
  re-read, a `fillV` reset or a new fill id cannot bring it back. Add saves in one tap when the form is complete (`addFromFill`).
- v3.90: fills already waiting go through the same steps on every check (`pendingAutoAdd`); each fill in `syncFills` is in its own try,
  so one that fails cannot stop the others (its error shows as "could not log it"). My books has + Add on each not-logged row (`.mb-add`)
  and a reason line (`fillWhyNot`).
- v3.91: + Add (My books and From your books, `addFillNow`) logs a described fill in one tap; the form opens only when the book did not
  say what the bet is. A fill marked added or linked whose bet is not in the log is logged again on the next check (`fillLost`),
  unless you removed that bet by hand (it is in `removedBets` with that fill id).
- Save in the bet editor (v3.89, `ebSay`): a second-press check (worse than fair, a limit) or a missing field shows an amber `.eb-warn`
  box and the button reads "Save bet anyway".
- `addToLog` copies a fixed list of fields into a saved bet. A new field on the row (like `towin`) must be added there too, or
  it's silently dropped. `fee` is only stored when a bet is edited.
- Stat names are shortened on screen only (`shortStat`, e.g. Receptions to Rec). The saved `market` text keeps full names
  because grading and matching read it.
- Team codes are normalised to ESPN's (`normAbbr`, e.g. NYK to NY).
- Grading (`autoGradeLog`) runs on page load and on the refresh buttons, not when a bet is saved.
  The Check results button (`checkResultsRun`, also Look out's "Check results again") skips `gradedBy==='manual'` bets and keeps a
  win/loss/push when ESPN cannot grade it (v3.84); before, it overwrote them with `?` and they went back to Look out.
  v3.93: every result you set (Look out, editor, + Add a bet) is also kept in `mbev.grades` (synced, `SYNC_SETS.grades`) by bet id and by
  `gradeKey` (name, market, side, game day). `gradesReapply` (run by `renderLookOut`) puts it back on a bet with no result: same id or a
  twin. Clear in the editor forgets it (`gradeRemember`). Call `gradeRemember(b)` wherever a new manual result is set.
- v3.94: `statForMarket` NHL and MLS check shots before goals ("Shots On Goal" was graded as goals). ESPN's NHL `SOG` column is always 0;
  shots on goal are `S`. NHL/MLS shots bets graded by ESPN the old way are graded again once (`fixSog94`). Real box score in
  `tests/fixtures-nhl-2026-11-05.json`. Ignore also counts `fillSeen` 'ignored' (synced) and `mbev.fillIgnored` is in `SYNC_SETS`.
  v3.95: v3.94 cleared shots bets of every age but `autoGradeLog` only grades the last 4 days, so older ones went to Look out (30 on
  Alonzo's phone). `redo94` grades every `fixSog94` bet without a result, whatever its age; only "Shots On Goal" markets are cleared.
  Lesson: never clear saved results to force a regrade; grade first and replace only when the new grade exists.
- v3.96: `autoGradeLog` also grades every Look out bet from the last 30 days (`redo94`), and each bet is in its own try. Bets from your
  books keep `placedAt` (the fill's time, `notePlaced`) and `evOkFor` counts the 4-hour rule from it; a bet whose book gave the start
  time (`autoFrom` + `start`) matches that exact game. Before, a fill read after 10 PM made a 6 PM game "too early" (Dorofeyev 11/5).
  Real NFL box score in `tests/fixtures-nfl-2026-11-01.json`.
  v3.97: `evOkFor` also accepts a game played on the bet's set game day (`dateSet` + `date`), whoever set it: Saquon 11/1 was logged
  from the Novig fill on 11/5 (not `manual`), so the 4-hour rule from the save time hid its game.
- Real money (v3.98, edit editor `.eb-money`): Got back $ (stake included) and Winnings $ (stake not included) fill each other in; saved
  as `towin` (the profit) with `paidReal` (a boost or what the book really paid), kept when stake or odds change. Lost $ → `lostAmt`
  (only when it differs from the stake). 🎁 Free bet → `free`: `betProfit` counts a loss as $0 and a win as winnings only; free stakes
  are not money staked (Today card, `dayStats`, Performance ROI `_st`). Performance profit and ROI never include the returned stake.
  v4.03: the 🎁 tick saves at once (`.eb-free`, and `.pl-free` in the parlay editor); `ebMoneyApply` is used by Save changes and by
  Mark WIN / LOSS / PUSH (Mark LOSS used to close the editor without the tick). A free parlay that wins counts payout − stake (the
  stake does not come back), one that misses $0. `tests/free-bet-test.js`.
- Today card (v3.98, `renderTodayBar`): per day and per book: money staked (free bets apart, 🎁), bets, ✓ played · ▶ playing · ⏳ to play,
  won $ vs lost $, ▶ money at risk, ⏳ money not started. `heldValue` (owner, 2026-11-05, replacing the v3.08 rule): a game not started
  and a free bet count $0, not as lost; once the game starts the stake counts as gone until it wins. Worst = won − lost − money playing.
  v3.99: on a computer the tiles had `white-space:nowrap` (old `.tb-t` rule), so the longer lines ran into the next tile; they wrap now.
  Owner, 2026-11-06: "what you make for Phone mode also needs to look right in web browser mode". Check every layout change at
  phone (390) and computer widths (1000, 1280, 1960); `tests/money-test.js` checks the Today card at all four.
- IN PLAY (v4.07, owner: "do not say lost, say IN PLAY and put it in grey, unless I already lost it"): `heldValue` counts a bet whose
  game is playing as $0 (`d` = its stake in play); only settled bets are won or lost (replaces the v3.08/v3.98 "counts as gone" rule).
  Today card: the pill is settled only (UP / DOWN), with a grey `.tb-pill.inplay` "IN PLAY $x"; worst (if everything playing loses) is
  grey. Calendar: a day's colour and W/L come from settled bets only, with grey "▶ $x in play" and "⏳ $y to play" lines (`playingAmt`);
  best/worst day and the chart use settled days only. Bets by game day: "$x in play" in grey.
  v4.08 (owner: "worst is only REAL DATA", "a BEST DAY EVER and vice versa"): the calendar footer shows this month's best and worst
  settled day with their dates, and "Ever: best · worst" over the whole log. On a phone the day boxes drop the $ (`.cal-cur`) so
  +20.88 fits. `tests/cal-worst-test.js` is Alonzo's November (Fri 11/6 in play: grey, not the worst day).
- Performance calendar (v4.00, `calDays`, `renderCal`): money on games not started is grey (`.cal-tp`, `toPlayAmt`), never green or red;
  a day with only unstarted games is a grey amount (`.cal-c.tp`) and is not a best or worst day. ▶ marks games playing (hidden on a phone).
- Today card days (v4.01, `tbDay`, `.tb-day`): ‹ › step a day back or forward and "Today" comes back; the label shows the day
  ("WED, 11/4"). `tbDay` null means today and follows the clock past midnight. The arrows stop the click that opens the Bet log.
- Book slips on a phone (v4.04, `slipReady`, `#slipGo`): an iPhone opens a book's app (Novig `novigapp://`, Kalshi, Polymarket, DraftKings)
  only from a tap on the link itself, never from a tab the page opened and pointed there after an `await`. So on a phone the logo (or book name) tap
  fetches the slip, then shows a bar with a real "Open in Novig ›" link (and the website for Novig). Kalshi, Polymarket US, DraftKings
  and PrizePicks (`BOOK_HOME.pp`, v4.04) the same; DraftKings and PrizePicks have no prefilled slip. The Mac keeps the side window.
- Books you can't bet (v4.05, `swapBooks` in `auditCore`, `swapHunt` after each `refresh`): owner is in Texas (no DraftKings / FanDuel
  sportsbooks). A row at a book not in "Books you bet" takes the same bet at your best book: another board row (same `coreKey` and game,
  e.g. Bovada from SportsGameOdds → the unbettable row hides, `swapHid`) or a live Kalshi / Polymarket US / Novig price (`r._altQ`,
  fetched once per row) → the row moves there (`r.swap.orig` keeps the original, restored before every audit) and is screened at that
  price. No price anywhere: stays "not a book you bet". The Sentinels never let a book you do not bet win. BettingPros has DraftKings
  Predictions (book 74) and Underdog Predict (76): requested when those are in your books; it has no FanDuel Predicts.
- What to type on Kalshi (v4.09, `kalshiHow`, `kalshiHowHtml`, `.kx-how` strip across a Kalshi card): owner typed the card's $1.62 into
  Kalshi's Shares box and bought $0.88. The strip says, in Kalshi's words: 1 Press YES / NO (an Under is NO on the Over), 2 Shares
  = stake ÷ (limit + Kalshi fee), 3 Limit price = La Contadora's `maxPriceFor` in whole cents rounded down, then check Cost ≈ stake and
  Max payout = shares × $1. Not shown when the price is over her limit. "I bet this" on Kalshi labels the % fields Price ¢ / Max payout $.
  Owner: the same for every book next (he will say which); Bovada stays manual until there is money for an API.
- The price as a % (v4.10, `impTagHtml`, `.imp`; owner: "+230, what does that mean in %?"): under each price on the board and the
  Place cards, its chance (+230 = 100 / 330 = 30.3%), green "OK to" La Contadora's most at that book (`maxPriceFor`, after its fee), or amber
  "need ≤ x% · look elsewhere" when it costs more. I bet this / + Add a bet: the check line starts "+230 = 30.3%" and ends "look elsewhere"
  when the typed price is not worth it. The board lists passing bets only, so amber shows mostly when you type a price. `tests/price-pct-test.js`.
- BettingPros ☰ Several (v4.11, `bmPaint`, `loadSeveral`, `#bpMulti`, `mbev.bpMulti`; owner: "choose all of those or not, around what we
  can do"): tick sports (All with games = a game in 24 hours, or None); the line shows sports × calls each against `_bpLeft`. Load (and
  Refresh) then run `loadApi(fresh, sport)` for each, soonest first; no game in 24 hours is skipped, and a sport that would go over the calls
  left is not loaded. While open, the one-sport menu is greyed; closed, Load works as before. `tests/bp-several-test.js`.
- The board waits while you bet (v4.12, `boardEditorOpen`, `_boardPending`, `_boardForce`; owner: "if I press I bet this, do not move it",
  "refreshes"): `render` called while an I bet this box is open on the board or a Place card only remembers the call; it runs once the box
  is saved or closed (checked every 400 ms). A click or change of your own outside the box sets `_boardForce` for that tick, so sort,
  filters, Parlay and other buttons still redraw. Save / Cancel must remove the editor before redrawing (they do). `tests/editor-stays-test.js`.
- Book on the board (v4.13, `#boardBook`, `boardBook`, `mbev.boardBook`; owner: "only choose by book: Kalshi, Novig"): next to Sport, the
  books on the board with counts ("Kalshi · 2"), from the rows left after sport and duplicates; picking one shows only its bets (table and
  Place these). It matches `bookLabel(r.book)`, so a swapped row (v4.05) counts at the book it moved to. Separate from Settings' typed Book
  filter (`filterBook`). `tests/board-book-test.js`.
- Placed at an exchange (v4.14, `exQs`, `r.waitOrder`; owner: "still seeing Kalshi slips I made on the board", three resting orders,
  0 filled): in `auditCore` a Kalshi / Polymarket US / Novig row's own quotes (`_openQ`, `_shopQ`, `_altQ`, `_par`: ref + side) also match
  a logged bet's `fillRef`/`fillSide` (a fill worded differently is still `prior`) and an order in `myOrders` (/mine/orders, read with
  each fills check; `syncOrders` redraws when it changes): `r.waitOrder`, decision "ORDER WAITING n shares at x¢", Already bet group, no
  stake, not in Place these, Sentinels or Parlays. Cancelled at the book: back in Place these. `tests/kalshi-placed-test.js`.
- Rows with full team names (v4.15, `giTeamsOf`, `giTeamFor`, `gameHintOf`; Alonzo's three Kalshi orders were other games): The Odds API
  writes "Texas Tech Red Raiders @ Oklahoma State Cowboys", so `liveDesc` found no codes and the exchanges were never asked; "open slip"
  opened Kalshi's home page and the Oklahoma St. market there was another game. Codes now come from ESPN's `gameInfo.teams` (`rowAsBet`
  carries `gameInfo`; `betMatches` uses them too). The Kalshi strip says "in Texas Tech at Oklahoma State, Sat, 11/14, 11:00 AM CT"; an
  order on the same school in another game (`r.otherGameOrder`, title match, more than 36 h apart) says "is another game. This one is not
  placed"; a slip the book cannot find says which game to pick (card note, phone bar). Kalshi's college codes are not checked against ESPN's
  (kalshi.com is not reachable from the build machine). `tests/kalshi-game-test.js`.
- v4.16: Bet log › Bets you took › Download (`csvDays`, `logCsv`, `#csvDay`, `#csvDl`): All days or one game day, one row per bet, newest
  first; profit is `betProfit` (settled only, free bets count winnings only), parlays keep their legs; UTF-8 mark for Excel. Parlays: Send the
  Sentinels (`#pkSentGo`) is on combo apps too. `pkBetTag` on every leg list (Sentinels' picks, slip and entry cards, pick list): "✓ you bet
  this: single $x on Book", "order waiting on Book", or "in your Book parlay (n picks)" (logged parlays of the last 2 days, `parlay.pk.legs` or
  the book's text legs; name or team code, line and side must match). `tests/csv-parlay-tags-test.js`.
- Startup order (v4.16 fix, `nrmT`, `tests/startup-test.js`): v4.15's `giTeamFor` called `nrm`, a `const` defined near line 8700. A bet from
  the books with a full team name and ESPN's game made the Bet log call it during startup, before that line ran: "Cannot access 'nrm' before
  initialization" stopped the page halfway (no board, Sources, budget or Today card; localStorage untouched). Code that can run at startup must
  use function declarations (hoisted, like `nrmT`), never a `const`/`let` helper defined further down. The startup test loads data like Alonzo's.
- Orders waiting at your books (v4.17, `renderLogOrders`, `renderOrdersTop`, `#logOrders`, `#ordersTop`, `window._ordersErr`; owner: "I don't see
  them on my Bet log, so where are they?", three Kalshi orders with Filled 0): drawn by `renderMakes` after each `syncOrders`. Top of the Bet log:
  each order (book, YES/NO, what, market title, shares at the limit = cost rounded up like Kalshi's Cash, filled, game time), the money held and
  "not bets yet; a filled order goes into the Bet log". Under the Today card: "N orders waiting at … · $x held · See them ›". When /mine/orders
  fails or returns `errors`, both say "Could not read your orders: …" instead of showing nothing. `tests/log-orders-test.js`.
- The order on the card (v4.18, `orderTagHtml`, `.ord-tag`, `r.otherSideOrder`; owner: "put the note on the bet that is technically still open,
  I need an identifier so I will not bet twice"): in `auditCore` an order is matched to a game-line row by Kalshi's team code (`o.bet.team`, NO =
  the other team), or, when Kalshi's code is not ESPN's (BG for BGSU), the closer code in a market whose title names the school. Within 36 h it
  is this bet (`waitOrder`, ORDER WAITING); further apart `otherGameOrder` ("another game: this one is not placed"); the other team in this game
  `otherSideOrder`. The tag sits under the pick on the card and in the odds cell of the row. `tests/order-tag-test.js`.
- Typed-in bets on the Parlays tab (v4.19, `pkSegs`, `pkSegHit`, `pkParlaysWith`; owner: "I made this bet and saved it manually but you don't
  identify it as already bet on"): a parlay from Add a parlay (legs typed like "Mahomes O 1.5 TD, Bijan O 70.5 rush") counts like one logged from
  the tab: legs split on ; , new line | " + "; same pick = last name (or team code / school) and line, and the side when written (O/Over/U/Under).
  `pkNotLogged` leaves those picks out of entries and slips (as v4.06) and `pkBetTag` tags them; a single typed in with + Add a bet, worded
  differently, is tagged too (same stat family). A parlay saved with no legs cannot be matched. `tests/manual-parlay-test.js`.
- Orders against every card (v4.20; owner: "you have the Kalshi API, get my bets even if not filled and put an identifier on them"): v4.14/v4.18
  checked orders only against cards priced at that same exchange (`o.book===exSrc`), so a Kalshi order on the same team or player at a Novig,
  Bovada or other card got nothing. Now every card is checked against every order (ref match stays same-book; `betMatches` and the team checks
  take any book), the tag names the order's book, and with no ESPN `gameInfo.teams` the school comes from the name (longest prefix found in an
  order title: "Oklahoma State Cowboys" → oklahoma st). `tests/order-anybook-test.js`.
- The Sentinels cards (v4.21, `placeCardHtml`, `sentScore`, `pxNote`/`pxSeries`/`pxChartSvg`, `scKalshiLine`, `.sc-card`, `#placeCards.sc-grid`; owner,
  showing OddsJam's Momentum: "I want it like this", "they call it Momentum, we call it Sentinels", "La Contadora already allowed the bet, so we
  may not need all the info, unless a drop-down", "you decide, nice GUI, phone and Mac"): Place these is a grid of short cards (1 column on a
  phone, 2-3 on a computer; narrow cards switch layout by `@container (max-width:360px)`). Short card: score, book + EV after fees, ⏱ age of the
  price (`rowSeenAt`: `loadedAt`, `_liveAt` set by `shopExchanges`/`swapHunt`, `shop.at`, `exOpen.at`; amber after 30 min), the price move in
  the last hour (`pxMove`), who / stat / kickoff + game, tags (order tag, injury, weather, swap/shop, warns, Makes), the bet bar (pick + v4.10's
  `impTagHtml` line, stake, pays/wins, price chip `.sc-price.book` that opens the slip through the logo handler), the one-line Kalshi "what to
  type", I bet this (its box opens under `.sc-act`), Parlay, open slip. "Why this play?" (`details.sc-why`, closed by default, remembered per bet
  in `mbev.scOpen`, all open with Show all notes): tiles (EV, Fair, OK up to, Market, Consensus, Projection, Rating, Hit rate), the score's
  parts, the price chart, the decision, the full Kalshi strip, notes, Share. Score 0-100 = Edge 50·min(1, EV/6%) + Market (`mktNet`: 20 at
  break-even, 30 at +4%, 0 at -3%, x0.85 consensus, 8 with no market) + Fresh (20 under 3 min, 0 at 90). Price history: `mbev.px` (in
  `LS_CACHES`), per bet `[minute, price, fair]`, a point on a change or every 15 min, 40 points, 250 bets, 3 days; recorded at the end of
  `auditCore`. Cents for Kalshi / Polymarket, % for Novig and other % apps, odds for sportsbooks. Sort › Sentinel score. `tests/sentinel-card-test.js`;
  `tests/kalshi-how-test.js` reads the one line on the card, then opens Why this play? for the four steps.
- v4.22 (owner: "on the Mac it is confusing, two boxes side by side; on a computer one per line, and side to side"): Place these is one card per
  line everywhere (`#placeCards.sc-grid` is the `sclist` container); from 760 px wide (`@container sclist (min-width:760px)`) each card is a
  grid row: score | who + kickoff/game | the bet bar | buttons, tags and the Kalshi line under it, Why this play? across (two columns inside:
  numbers and score left, chart right). The ×N game-count flag stays in the notes, not on the card.
- The board keeps its place (v4.23, `boardAnchor`, `boardAnchorBack`, `renderCore`, `window._bAnchor`; owner: "it refreshes and the board goes up,
  I lose the bet"): `render` now wraps `renderCore`; before it, the first bet whose top is on the screen (card `data-pck`, or a table row's
  `pxKey`) and its position are remembered, and after it the page scrolls so that bet is back at the same spot. Photos, injury and weather tags
  fill in a moment after each redraw and push the bets down again; Safari (iPhone, Mac) has no scroll anchoring, so a ResizeObserver on
  `#placeCards` and `#tbody` re-applies the anchor for 4 s after a redraw unless you scrolled, tapped or typed since. `tests/board-scroll-test.js`
  (also with `overflow-anchor:none`, as in Safari).
- Worker calls (v4.24; Cloudflare: "exceeded its daily requests limit", 142k in a day, 8,700 per 15 min on a college-football Saturday):
  the cause was Live edges (`leScan`): both teams × three exchanges × up to 30 live games every 30 s, each Novig game line its own request
  (`LIVE_SPLIT`, v3.16, needed on the free plan), and every call with the `x-screener-pass` header costs a CORS preflight (a second Worker
  request). Now: the fetch wrapper counts every call by path and day (`mbev.wk`, `wkState`, the ⚡ chip on the Sources row with the top paths
  on hover; amber at 30k, red at 50k); a 429, or a 5xx whose text says 1027 / exceeded / limit, pauses background polling 10 min (`wkPause`,
  `wkPaused`: fills, orders, live prices, live edges, Parole, book swap, sync; your own presses still go). Cadences: fills and orders every
  60 s while you use the page, 180 s when left open (`wkIdle`: no scroll, tap or key in 3 min, from v4.23's `_bUserT`); `fillAt` is set before
  the read so a failing Worker is not asked every 20 s; live prices every 60 s when a bet kicks off within the hour, else 300 s (`liveEvery`);
  live edges at least 60 s, only the exchanges in Books you bet, and a team is re-priced only when ESPN's number moved ≥ 1 point or its price
  is over 3 min old (`leData.M`, "N prices kept from the last scan"). Cookie mode: when a Worker answer carries `x-auth-cookie: 1` (Worker
  v3.41, PR not merged until the owner says so) and the page is on 0xbeta.dev, the passphrase goes as the `mbev_pass` cookie for `.0xbeta.dev`
  with `credentials:'include'` and no header, so there is no preflight; a 401 in cookie mode goes back to the header and retries once
  (`mbev.wkCookie`). Tests never run from 0xbeta.dev except `worker-calls-test.js`, which serves the page at props.0xbeta.dev for that check.
  `tests/worker-calls-test.js`; `tests/math-audit-test.js` checks the arithmetic (odds ↔ chance, EV after fees, `maxPriceFor`, `kalshiHow`,
  the Kelly stake, `betProfit`, `pkDist`/`pkEV`/`pkBreakEven`) against brute force inside the page.
- Book chips (v4.24, `#bookChips`, `.bchip`, `boardBooks`, `mbev.boardBooks`; owner: "buttons so that I can only choose certain books to
  display, instead of All or just one"): a chip per book on the board with its count (logo when there is one), several on at once, All
  clears; the filter runs after sport and duplicates, before search. v4.13's `mbev.boardBook` carries over as one chip. `tests/board-book-test.js`.
- Novig game lines travel together (v4.25, `LIVE_HEAVY_N`, `LE_GAMES_PER_CALL`; owner: "Yes, BUILD"): the fetch wrapper used to send each Novig
  moneyline / spread / total as its own `/live` request (v3.16, the Worker's 45-call budget). The Worker reads a catalogue page once per request
  (`once` memo in `live.js`) and both sides of a game share one book read, so heavy bets are now grouped by sport + start, up to 6 per request
  (3 games, both sides: ~36 calls at worst on a cold cache); other bets stay together as before. `leScan` asks once per 3 games (both teams,
  every exchange you bet) instead of 8 bets however they fell: a 30-game Saturday scan is ~20 requests, not ~80. A failed or busy exchange
  answer is asked again after a minute (`M[id].at` is set 2 min back); an ok one is kept 3 min while ESPN is unchanged (v4.24). The polling
  timers (fills, orders, live prices, live edges, sync) already run only while the page is visible; `tests/live-batch-test.js` checks it.
- Already bet by team code (v4.25, `glTeamSame`, `sameTime`, `rCode`, `rTeams` in `auditCore`; owner, 11/8: a Novig "CHI Winner" fill placed at
  11:07 AM, and at 2 PM the Sentinels card "Chicago Bulls · Moneyline · Novig +388" still said I bet this): a bet logged from a fill (`autoAddFromDesc`:
  name = the team code, no game text) or typed in matched neither `coreKey` (the row says "Chicago Bulls") nor `glSame` (needs the game text).
  Now a game line with the same kind and team code (ESPN's code for a full name, via `giTeamFor`), on the same game day or within 6 h, is the
  same bet (a spread needs the same line); the price may differ. `coreKey` and `glSame` also require `sameTime` now, so a bet on CHI today no
  longer marks CHI's game tomorrow. The OTHER-side warning (v3.13) also finds a logged bet with no game text on the other team of the row's game.
  Worker v3.42 (`novigBet`, PR not merged until the owner says so): a Novig fill carries `away`/`home` from the description ("PHI @ CHI"), so the
  logged bet gets its game. `tests/fill-prior-test.js` (fails on v4.24).
- Augi's look and his five tabs (v4.29, `tabGroupPaint`, `#subTabs`, `.subhome`, `data-group`, `body[data-group]`; owner, after seeing Augi's Odds Board
  (AugiM13/screener): "I like his GUI, it is cleaner ... we can change it to my liking, but in his style ... our settings and math ... his 5 tabs"):
  the bar is Board, Live Games, Parlay, Bet log, Settings (his order, a segmented bar with the active tab solid #087B44; on a phone the fixed bottom
  bar). The other views keep their tab buttons, `data-view` and handler, but sit in `#subTabs` under their group: Board → Leagues, Parole,
  Moneylines (and the hidden Pasted / Paste a board); Bet log → + Add a bet, Performance. The group's main tab stays lit (`.grp`) while one of its
  row's views is open; the `.subhome` pill goes back to the main view. His palette in the v4.29 CSS block (light and dark tokens: page #F2F8F4,
  accent #087B44 / dark #6EE3A4, ink #13271E, soft #5C7066, `--dim` #4A5D54, dark `--jetta` #087B44 so white text on the Safe button passes),
  the system font (`system-ui`), 12 px panels, 44 px inputs on a phone. A sub-row tab is hidden unless its group is open, so a test that opens
  one from another tab clicks it with `p.evaluate(()=>el.click())`. Our math, cards, Today card and data are unchanged. `tests/tabs-test.js`.
- Augi's cover bands and Bet result study (v4.31, `cvBand`, `cvNames`, `cvRanges`, `cvChipHtml`, `renderStudy`, `#studyPanel`, `#studyScope`, `.cv-chip .cv-1..9`;
  owner: "Augi did some changes for stats ... I want his features, but with our math/settings"): his 5-point bands on our fair probability (board
  `r.fairProb`, logged bet `toProb(b.fair)`): Long Shot <45, Feeling Lucky 45-50, On the Line 50-55, Slight Lean 55-60, Lean 60-65, Solid 65-70, Strong
  70-75, Heavy Favorite 75-80, High Cover 80+. A chip in the board's Cover cell and the Sentinels card's tag line (a label: no rule or stake changes).
  Performance › Bet result study (after Is the model honest?): singles only, by game day (All / This month / Last 7 days / Today): logged, pending,
  W–L–P, average prediction and hit rate on graded wins and losses only, difference in points, profit from `betProfit`. Our parlay legs are not
  graded one by one, so his "parlay legs" view is not here. His light colours were darkened a little for AA on 10.5 px text. `tests/cover-study-test.js`.
- Augi's screens, step 2 of 5: Live Games, the Game Hub (v4.35, `#hubPanel` at the top of `v-live`, `hubState`/`mbev.hub`, `hubLoad`, `hubOpen`, `hubRows`,
  `hubNoVig`, `hubState3`; owner: "Build"): sport buttons, Scheduled / Live / Final with counts, a day (`fetchScoreboardDay`), game cards with "N bets
  risking $x" (`ssRiskMap`) and how many board props the game has. A game: score and status, ESPN's line from the summary's `pickcenter` with the vig
  out, the last six plays (`plays`, or football `drives.current.plays`), your logged bets in it, and the board's props for that exact game (by
  `gameInfo.eventId`, else both team codes) with La Contadora's decision (BET $x / ALREADY BET / STARTED / skip), a search box and See on Board
  (fills `#filterPlayer`). Summary via `fetchBoxscore` (cached). ESPN only, no Worker calls (Augi's hub spends Odds API credits per game for props;
  ours reads the board already loaded). Live games refresh every 30 s while the Live tab is open. `tests/game-hub-test.js`.
- Augi's screens, step 3 of 5: the Bet log (v4.36, `#lcPanel` under Look out and the orders, `lcRender` (run by `renderLog`), `lcMonth`/`lcDay`, `lcBands`,
  `lcStats`, `lcPeriod`/`mbev.lcPeriod`, import `lcParse`/`lcHave`/`lcRecord`/`lcImpPaint`; owner: "build"): his bet calendar by game day (`calDays`: settled
  profit coloured, a day with only open bets "$x open" in grey); tap a day: bets, staked, settled profit, in play, to play, open, and the daily max as a bar
  (`cfg.dayMax`, our version of his daily goal); "Show this day" sets `logDayFilter`. Cover range breakdown for the day: singles by `toProb(b.fair)`, legs of
  parlays from the Parlays tab by `parlay.pk.legs[].p`, typed parlays Unknown (one per pick). Track by Daily / Weekly (from Monday) / Monthly: bets, pending,
  W–L–P, staked, profit and ROI on settled bets only (`betProfit`, plus `removedBets` losses). Import (a `details.help`): his `augi-bet-import` v1 JSON
  (singles and parlays with exact legs, 200 tickets, 500 KB), read on the device only; each ticket checked (game day, book, cost, total return > cost), one
  already in the log unticked (same id, or same name, market, O/U and game day; a parlay by day, stake and legs). Singles are saved as typed-in bets
  (`manual`, `dateSet`, O/U, odds from cost ÷ return, `srcType:'import'`, `imported`), parlays by `parlayRecord`. No result: graded like any typed bet.
  `tests/bet-calendar-test.js`.
- Augi's screens, step 4 of 5: Parlay (v4.37, `pkRetRows`, `pkRetHtml`, `pkDraftText`, `pkCopyText`, `.pk-ret`, `.pk-copy`, `.pk-draft`; owner: "build"): every
  entry card (`pkCard`: best for each size, ready-made slips, the Sentinels' picks, Your entry; the card carries `data-id`) shows what it pays for each way
  it can finish in dollars at the stake typed (Flex: all hit, one miss, two misses = Augi's partial return; chances from `e.d`/`pkDist`, multiples from
  `pkMult`), updated as you type (`input` on `.pk-stake`). Copy draft writes plain text (app, Power / Flex / combo, each pick with its chance and `pkWhere`,
  the stake, each payout and chance, expected return, "Not placed"); the clipboard, else `execCommand('copy')`, else a read-only `.pk-draft` box to copy
  by hand. Copying logs nothing. `tests/parlay-draft-test.js` (the test page is not https, so it stubs `navigator.clipboard`).
- Custom colours (v4.37, `window.palCss` in the head script, `#palCustomCss`, `palCustomSet`, `palCustomHex`, `#palPick`, `#palGrid`, `mbev.palCustom`; owner:
  "can I choose from a grid, not just those colours, like a colour wheel"): Settings › Layout › Colours › Custom: the device's own colour picker (wheel and grid on
  Mac and iPhone) or a grid of 20 colours. `palCss(hex)` builds the light and dark token set from the hue (page, panels, rules tinted; `--brand` and `--accent`
  toned darker or lighter step by step until white on the brand and accent on page, panel and `--accent-bg` pass 4.6:1), written before the first paint.
  `tests/palette-test.js` checks nine awkward colours (yellow, cyan, magenta, lime, grey, black, white, brown, orange) in both themes.
- Augi's screens, step 5 of 5: Settings (v4.38, `cnPaint`, `cnTest`, `#cnBox`, `crPaint`, `crRefresh`, `#credPanel`, `rgPaint`, `#rulesGlance`; owner: "Build"):
  the passphrase panel is now Connect: the Worker host (`API_BASE`), a chip (passphrase saved or not, never the value), and Test connection (free): the
  Worker's `/src/status` (lists the sources with a key, calls no provider; 401 = passphrase does not match SCREENER_PASS), "Keys set / No key yet".
  API credits & usage (`#credPanel`): a card per source from what the app already keeps (BettingPros `lastBudget`/`_bpLeft`, The Odds API `mbev.oaq`,
  Sportsbook API `mbev.sbq`, OddsPapi `_opUsage`, Pinnacle live `lePinnUse()` of `LE_PINN_DAY`, SportsGameOdds key, your Worker `wkState()` with the
  busiest paths); Refresh asks only `/budget`, `/src/status` and `/oddspapi/usage`. Your rules at a glance (`#rulesGlance`, before Screens): every rule
  from `cfgRead()` in four groups (Screens, Stake sizing, Limits, Fees), redrawn on any input in Settings. Mode raises are included (cfgRead). (v4.50: a mode no longer raises anything.)
  `tests/settings-connect-test.js`. Option 2 (Augi's five screens on our engine) is complete with this step.
- Already bet, player props worded by the book (v4.39, `propSame` next to `coreKey`, used in `auditCore`'s `prior` and `otherSide`; owner, 11/9: "I made this
  bet but it still shows as bettable ... crucial fix", Lekkerimaki Over 1.5 Shots on Novig): `autoAddFromDesc` logs a fill in the book's words ("Jonathan
  Lekkerimäki", "1.5 Shots On Goal"), the board says "Jonathan Lekkerimaki", "1.5 Shots", and `coreKey` compares exact text, so the card stayed in Place these.
  `propSame(L, r, anySide)`: props only, same sport when both known, same player by `nrmT` (accents, case) or same last name and first initial, same line,
  same side (unless anySide), same `statFam` (Shots = Shots On Goal = SOG) and no period / power-play / alt qualifier difference (`qualOK` both ways); with
  `sameTime`. Hoisted and startup-safe: if `statFam`'s table is not defined yet it compares plain words. `tests/prop-prior-test.js` (fails on v4.38).
- Novig "2+" and the fills check (v4.40, `normFillBet`, `propSame`, `myFillsGet`/`myFillsSet`/`fillPriorFor`, `mbev.myFills`; owner, 11/9: his Novig portfolio
  "Jonathan Lekkerimaki 2+ Yes · Shots On Goal", $2.15 → $4.17, placed 1:07 PM, still bettable on the board at 1:17): the Worker cannot read "2+" as
  "player line STAT", so it sends no player and Novig's strike (2) as the line; `normFillBet` only turned "2+" into 1.5 when no line came, so the bet was
  logged as "2 Shots On Goal" and matched nothing (v4.39 alone did not fix it). Now "N+" is always Over N−0.5, and `propSame` also reads a book's logged
  integer line N (Over) as N−0.5. And `auditCore`'s `prior` ends with `fillPriorFor(r)`: every buy fill from the last fills read (kept 3 days, not sold)
  that `betMatches` the row makes it ALREADY BET at the fill's price, logged or not (waiting in From your books, ignored, or worded otherwise). A change
  in the fills list sets `changed`, so the board redraws. Once (`fixPlus40` in `autoGradeLog`): a bet logged from a Novig fill with an integer prop line N
  (Over) becomes N−0.5, the old text in `edits`; an automatic PUSH becomes WIN (exactly N ≥ N−0.5), wins and losses stand, manual grades are kept.
  `tests/novig-plus-test.js` (9 of 17 fail on v4.39).
- "OK up to" on the blend (v4.41, `okProb(fair, mkt)`, `okProbR(r)` next to `maxPriceFor`; owner: "Fix and build", after an outside math check of
  `docs/EV-CALCULATOR.md`): `maxPriceFor` was given the model chance (`r.fairProb`) while the stake is sized on the blend, so a price between the two was "OK"
  where the stake was $0. Every caller now passes `okProb` = min(model, market + mWeight × (model − market)), the model alone when there is no market:
  `impTagHtml`, `maxTagHtml`, `pickPayHtml`, the Place card (`mx`), `scKalshiLine` and the Kalshi strip (limit price), the bet editor's check (line moves shift
  the market with the model) and + Add a bet. The screen floor still uses model net EV. Wording: THIN "still clears your estimated EV floor"; the Scorecard
  verdict says "evidence, not proof". `tests/blend-limit-test.js`. The doc names model / market / sizing chances, calls out rounding, the parlay independence
  assumption and the FanDuel Predicts fee (2% ÷ price of the stake).
- One-tap slips on a phone (v4.42, `slipLinkFor`, `a.sc-price.sc-link`; owner: "my slips do not open when I press the icon to open the app, those links are
  NOT working", then "APP link first and then https last"): on a phone the Place card's price chip is a real `<a href>` when the book's price is already
  known on the row (`_openQ`, `_shopQ`, `_altQ` at that book, within 8 points of the card's price): Novig `novigapp://events/<outcome>/novig/<stake>`, Kalshi /
  Polymarket US the market's https url, DraftKings / PrizePicks their home. One tap with no `await` before it, so iOS can hand it to the app. The capture
  click handler lets `a.sc-link` through; for Novig it then shows the `#slipGo` bar with "website (if the app did not open)" (the https slip). Unknown
  price: the tap checks it and shows the bar as before (app link first, website second). `slipLinkFor` is hoisted with its own maps (startup-safe).
  `novigapp://` is still unconfirmed (novig.com cannot be read from the build machine). `tests/slip-onetap-test.js`; `tests/slip-app-test.js` unchanged.
- EV floor on the conservative chance, and WATCH (v4.43, `r.actProb`, `r.actNet`, `r.watch` in `auditCore`; group 5 in `grpOf` with `GRP_RANK`, `#boardView` "watch";
  owner: "build", after ChatGPT: "move the actionable screen floor to the same conservative chance used by OK up to and stake sizing"): `r.net` stays the model's EV;
  `r.actNet` is EV on `okProbR(r)`. Floor: model under it → "net EV under the floor" (a skip); model over it but `actNet` under it (with a market price) → `r.watch`,
  out flag "WATCH · the model likes it (+x%), but with the market it is +y%, under your z% floor". Watch rows are always listed (`shown` adds them even without Show
  rejected), in their own group after Already bet and before Skip; Show › 👀 Watch lists only them. No market price: the model alone, as before. `tests/floor-watch-test.js`.
- Watch bets as shadow records (v4.44, `watchNote`, `watchAll`/`watchSave`, `watchGrade`, `watchStats`, `renderWatchStudy`, `#watchPanel`, `mbev.watchObs`; owner, passing
  on ChatGPT: "record every Watch bet as a shadow observation, without counting it as a wager"): at the end of `auditCore` (next to `pxNote`) every `r.watch` row
  before its game is saved ONCE by `pxKey` (sport, name, market, side, game day) with the shown price and fee, model / market / blend chances, `net`, `actNet`,
  time and version (3,000 kept). `autoGradeLog` then runs `watchGrade` (same `findBetGame` then `gradeBet` / `gradeGameLine`; 5 h after the start, up to 30 days).
  Performance: Watch bets panel: counts, a stage (<100 descriptive, 100-299 directional, 300-999 useful if the range clears zero, 1,000+ credible), Brier and log
  loss for model, market and blend on graded wins and losses (pushes out), market minus model Brier with a 95% range from 1,000 by-game resamples (seeded, from
  20 graded), and a $1 ROI at the shown price. Never in the Bet log, profit, ROI, the calendar, the Today card or the daily max. `tests/watch-shadow-test.js`.
- Watch bets v2 (v4.45, `watchKeyOf`, `watchGk`, `watchState`, `watchPolicyRun`/`watchRank`/`watchWhy`, `watchCloseScan`, `watchMergeRec`, `watchPut`/`watchPolPut`,
  `watchSyncForm`, `watchPrune`, `watchStats(A,{boot,pol})`, `mbev.watchPol`, `mbev.devId`; owner: "BUILD", plan in `agent-notes/watch-v2-plan_2026-11-09_v1.md`, agreed with
  ChatGPT over two rounds): the key is sport, player, `statFam` (or game-line kind), side, exact line and ESPN event id (else start); `pk` keeps v4.44's `pxKey`
  so old records are not duplicated. The first sighting is the frozen calibration snapshot (with `dev`, `devName`, `tz`, `tsrc:'device'`); later sightings add to
  `sig` only when the price or a forecast moved, otherwise only `seen` (last seen before the cutoff) moves. One pick per game, made once at 5 min before
  kickoff from sightings before the cutoff (also retrospectively on the next load): highest `actNet` (ties within 0.0001 → fresher, higher blend, shorter odds,
  key); primary if seen within 30 min of kickoff, `fallback` 31-120, else `none`; its `snap` is the price used for its ROI. Closes: Watch bets at Kalshi /
  Polymarket US / Novig in the last 10 min before kickoff (`ld` = the `liveDesc` saved with the record), policy picks first, 8 per `/live`, 24 per 2 min, every
  30 s timer while visible; fair = ask ÷ (ask + 1 − bid); `closeWhy` when missing. Sync: collections `watch` (without `sig`, `seen`, `closeTry`) and `wpol`;
  `syncMergeAll` now stamps and pushes ids a `put` returns (the merge changed this device's copy). Two copies keep the earliest valid pre-start snapshot whole,
  the other in `alt` (`conflict` over 5 min apart); picks: primary > fallback > none, then earliest, the other in `other`. Pruning after grading and syncing
  (7 days with sync off) drops `sig` and `ld`, keeps `first`, `last`, `nSig`. Performance (only while it is open, cached): game-balanced market − model Brier with
  5,000 seeded game resamples, `half` width; stages by bets AND games (100/50, 300/150 + range clear of 0, 1,000/500 + range clear + half ≤ 0.005 + CLV
  (30+ closes) and All-Watch ROI pointing the verdict's way); verdict "Statistically" (L > 0) / "Materially" (L > 0.001); All-Watch ROI and the primary and
  fallback ROIs never combined, by sport, kickoff band (CT) and device. A Worker time `srv` is preferred when present (not built in the Worker yet).
  `tests/watch-v2-test.js`; `tests/watch-shadow-test.js` updated (`d` is game by game now, `dBet` bet by bet).
- Books not read (v4.46, `renderFillWarn`, `#fillWarn`, `window._fillReadErr`, `window._fillOkAt`; owner, 11/10: "my bets are not getting picked up ... they still show
  at the board", "another one ... was NOT logged"): `syncFills` returned quietly on a Worker HTTP error or a network failure, so nothing was logged or marked
  ALREADY BET and nothing said why; Check my books now even said "all 3 books answered". Now a red bar fixed just above the bottom tabs (every tab; it never moves the board) says your books were
  not read and why (HTTP status, 401 passphrase, 429 daily limit), or names a book in Books you bet that failed on its own (`j.errors`), or says background
  checks are paused, or the last good read is over 6 min old; with "press I bet this or + Add a bet" and Check now. A good read lifts a `wkPause`.
  `tests/fill-warn-test.js`; `tests/worker-calls-test.js` updated (an answered press resumes polling).
- One bet per player, from your books too (v4.47, `samePlayerAs`, `inGame`/`rKeyT` in `auditCore`'s same-game block, `r.samePlayerBet`; owner, 11/10: a Jordan Mason
  rushing-yards bet, and the card "Jordan Mason Under 11.5 Rushing Attempts" showed nothing: "sometimes it is bad or not recommended to make bets on the same person
  on the same game. Correlation."): the v2.50 same-game check needed the same game text on both sides, but a bet logged from a fill has none (or codes where the
  board has full names), so one-per-player (`r.samePlayer` → stake 0) never fired. The same game is now also the same two team codes (ESPN's for the row) at the
  same time (`sameTime`), a bet with no game text whose team is in the game, or the same player (`samePlayerAs`, hoisted: `nrmT` or last name + first initial,
  props only, same sport) at the same time. The warning names the bet ("you already bet Mason Over 62.5 Rushing Yards in this game: one bet per player"), and
  the Place card now shows 'corr' flags as 🔗 tags ("Same game as your Cook …"), which were in the table only. `tests/same-player-test.js`.
- Player exposure and the board mode (v4.48, `playerBetLabel`, `heldActEv`, `modeNoteHtml`, `.sc-mode`, a same-player block after v2.55's one-side-per-game block;
  owner, passing on ChatGPT: "keep one bet per player per game as the automatic default ... before either is placed, keep the candidate with the highest
  conservative actNet ... show the other as PLAYER EXPOSURE ... still display whether the new candidate is better or worse ... separate the mode from card
  quality"): two or more props on the same player in the same game, none bet yet → the best by `actNet` (ties within 0.0001 → bigger stake, then blend) keeps
  its stake, the others get `glConflict` (`player:true`), stake 0, "PLAYER EXPOSURE · Mason Under 11.5 Rushing Attempts is the better bet on this player
  (+5.9% vs +3.4%): one bet per player". A held one: "PLAYER EXPOSURE · already hold Mason Over 62.5 Rushing Yards: no additional stake · this one looks
  better (+5.9% vs +3.2% when you took yours)" (`heldActEv`: `okProb` of the bet's snap model and market at its odds; none for a book fill without a snap).
  `samePlayerAs` (v4.48): different known teams never match, and the first names must agree (an initial, or one the start of the other: Jon = Jonathan; Five
  Star is not Four Star). Not built (ChatGPT: later, after measuring correlations): a manual override with a combined player cap. Safe / Feeling Lucky /
  Clairvoyant: in a mode other than Safe the Place these header says "Board mode: … A mode, not a kind of bet: every card here is a normal bet. It raises
  today's limit to $75.00 (Safe: $50.00); you are at $52.15, so in Safe no more cards would show today", long shots are tagged 🔮 LONG SHOT · Clairvoyant only.
  `tests/same-player-test.js` (18 checks).
- The books warning can be hidden (v4.49, `fillWarnState`, `#fillWarnX`, `.fw-x`, `mbev.fillWarnHid`, `.tab-alert`, `.fw-go`; owner, 11/10, about "Not read from Polymarket US:
  Polymarket 429 error code: 1015": "it is great, but NO WAY to remove it. Perhaps circle the Bet log"): × hides the red bar until the kind of problem changes
  (`worker`, `books:<which>`, `paused`, `stale`); while any problem lasts the Bet log tab has a red ring (inset box-shadow, the message on hover) and From your
  books at the top of the Bet log says it with Check now ("nothing new could be read", never "all matched" then). Fixed → bar, ring and the hidden choice are
  cleared, so the next problem shows. A failed read now redraws From your books too. Error text is tidied ("code: 1015 ." → "code: 1015.").
  Cloudflare 1015 is Polymarket rate-limiting the Worker's address (Workers share addresses); a Worker back-off on Polymarket 429s would be a Worker change.
  `tests/fill-warn-test.js` (15 checks).
  Also v4.49 (owner: "WHY are the same bets on Feeling Lucky and Clairvoyant? It makes no sense."): the two modes have the same limits (`MODES`: Kelly 0.33,
  game cap 2.5%, daily max 15%); Clairvoyant only adds long shots (`isLongShot`, `LONGSHOT`: +8% to +15% model EV, half size, $2 max). `modeNoteHtml` now
  counts them (`lastRows` long shots that pass, +8% to +15%, not started): "none on the board now clears +8%, so these are the same cards as Feeling Lucky",
  or in Feeling Lucky "Clairvoyant … only adds long shots: 1 on the board now would show there". `tests/same-player-test.js` (24 checks).
- Modes as the owner means them, ◎ PERFECTA, 🎟 parlay legs (v4.50, `MODES`, `EXTRAS`, `RING`, `extrasAssign`, `extrasUsed`, `extrasKalshi`, `extraLine`, `extrasCardsHtml`,
  `hmOpenMap`, `modeCountsPaint`, `modeNoteHtml`, `ringOf`/`ringDirt`/`ringAssign`/`ringRecheck`, `injKnown`/`wxKnown`, `ringChipHtml`, `legTagHtml`/`legNeed`, `tierTagHtml`,
  `renderTiers`, `#tierPanel`; owner, 11/10: "Safe was meant for the best bets, Feeling Lucky are the ones that just missed it, but if I want to bet a few, it's fine. And
  Clairvoyant are bets that are Hail Marys ... a dream of the Sports Gods"; "sweet spots will always be on the Safe bets"; "a circle around the bet ... BET NOW before it
  changes"; "some that are just better to use as parlays"; then "build - and check everything again"; plan in `agent-notes/modes-perfecta-plan_2026-11-10_v1.md`):
  - A mode no longer changes the best bets or their sizes. `MODES` only carries `lucky` / `hail`; `cfgRead` no longer raises Kelly, the game cap or the daily max, and
    the looser Market EV limits (`mev*`) and `LONGSHOT` are gone. An `isLongShot` row never gets a stake ("long shot — only in 🔮 Clairvoyant mode, as a Hail Mary").
    This replaces the v4.48 / v4.49 mode note.
  - `extrasAssign` (end of `auditCore`, after `applyDayLimits`): `r.xc` is a candidate whatever the mode. 'hail' = `Math.round(r.amer)` ≥ `EXTRAS.hailOdds` (+300) or
    `isLongShot`, with no 'out' flag other than WATCH / odds outside / net EV under the floor / gross EV over the ceiling. 'lucky' = `r.watch` with `actNet` ≥ 0 and no
    other 'out' flag. Never: a best bet (`pass` and `stake` > 0), prior, order waiting, moved, removed, hidden duplicate, `glConflict`, the other side, a player you hold
    a bet on (`r.samePlayerX`, extras included), a game-line axis you hold. In its mode it becomes `r.tier` with `r.xStake` (`cfg.sMin`, or $1 for a Hail Mary; Kalshi
    in whole contracts, `r.xContracts`) until that game day has `EXTRAS.luckyDay` (5) / `EXTRAS.hailDay` (3) logged bets with that `tier`. `r.stake` stays 0 and
    `r.pass` false, so Place these, the daily max, the Sentinels, Parlays and the #1 math pick never see an extra.
  - A logged extra (`b.tier`) does not block a best bet: `r.samePlayer` and the one-side-per-game `held` check skip tier bets (the 🔗 same-game note still shows).
  - The board: groups 6 (Just missed) and 7 (Hail Marys), `GRP_RANK=[0,3,5,6,7,4,1,2]`. Cards go under Place these (`extrasCardsHtml`); Hail Marys are grouped by game
    in `details.hm-game`, and only the open games get their cards built (a click on a closed game's summary redraws with it open; `hmOpenMap` remembers your taps
    until a reload; more than 6 long shots start closed, a search opens them). `placeCardHtml(r,cfg,{tier})`: strip `.sc-xtop`, an icon for
    the score, La Contadora's EV on the pill, `.sc-xline` in the Kalshi line's place. Cards off: `.x-chip` and "🍀 JUST MISSED $x" / "🔮 HAIL MARY $x" in the table.
    The default −300 to +500 Settings odds filter does not hide a Hail Mary; Only sweet spot does not hide extras. Each mode button shows what it would add (`.mode-n`),
    and `#contadora` says what is on the board for the mode and how many of the day's count are used (`modeCountsPaint`).
  - I bet this on an extra opens at its own stake (`st0`), says what the math thinks, and a Hail Mary the math dislikes needs a second press. `addToLog` saves
    `tier` (`r.tier || r.xc`: what kind of bet it was, whatever the mode) and `snap.ring`; `saidOf` → JUST MISSED / HAIL MARY with `said.tier`; `dayStats().extra`
    (not "against the screener"); the Bet log tags them (`tierTagHtml`).
  - Records: `scoreSet` keeps `b.tier` bets out of the Scorecard (like research Makes) and says so; Performance › ◎ Rings and extras (`renderTiers`): best bets by
    ring (6 of 6, 5 of 6, 4 or fewer), Just missed, Hail Marys. Money views (Today card, calendar, daily max, Hard stop) count extras like any bet.
  - Sweet spot (`isSweet`): on `actNet` (La Contadora's EV), never on an extra. The odds range stays −150 to +150 (the owner gave no new one).
  - ◎ PERFECTA (`RING`, best bets only): zone 50–75% (`actProb`), edge +4% to +12% (`actNet`), room ≥ 2.5 pts over the price after its fee, model ≥ market and
    `mktNet` > 0, price read ≤ 10 min ago (`rowSeenAt`), clean (`ringDirt`: outlier, risk, no market, capped stake, any warn flag but ×N, injury from `injLoad`, bad
    weather from `window._wxBad`, a price up ≥ 1 pt in the hour). 6 of 6: `.sc-perf` gold card, "◎ PERFECTA · BET NOW"; 5 of 6: `.sc-perf5`, the miss named; the list
    is in Why this play? (`.sc-ringl`). `ringRecheck` runs every 30 s and after injuries or weather load, and redraws only when a ring changes. Show › ◎ Perfectas.
  - 🎟 `r.leg`: a prop La Contadora gives 70%+ (`blendProb`); Show › 🎟 Parlay legs lists them all, passing or not.
  - Also in v4.50: book chips are counted after every other filter (the block moved below the Show filter), so a chip's number is what you see; the Bet log's red
    circle is on the number only (`.tab-alert .tab-n`, a "!" when empty); the "screener said x%" note is rounded; a prop with no number reads Yes / No; Show › Watch
    is remembered.
  - Not built: a manual same-player override with a combined cap (waits for measured correlations); the Worker time stamp; tier / ring columns in the CSV.
  `tests/modes-perfecta-test.js` (46 checks); `tests/same-player-test.js` and `tests/fill-warn-test.js` updated.
- ⚡ Signal, like OddsJam's Momentum (v4.52, `sigMove`, `sigPts`, `.sc-pill.sig`, Sort › ⚡ Signal; owner, 11/10, showing the Momentum ad: "this is what the
  sentinels do or want them to do ... make sure it is doing the same", then "yes. Proceed"): Momentum ranks by a sharp book moving (+120 → +100 = 4.5 points),
  how long ago, and a book that has not followed. `pxNote` now keeps the market's no-vig chance as a 4th number (`[minute, price, fair, market]`); `sigMove`
  compares it with its lowest point in the last 6 hours: `rise` (shown from 1 point), `mins` since first seen near the new level, `behind` when the book's
  price moved less than half as much. Card pill "⚡ market +4.5 pts · 20m" ("sharp market" when `r.mktSharp`), green when the book is behind; the Sentinel
  score gets up to +5 for a sharp market, +2 for the consensus (full at +4 pts within 15 min, 0 after 2 hours, only when behind; no signal = the old
  score), listed in Why this play?. After ChatGPT's review and the code review: each point also keeps which market it is (5th value 's' sharp / 'c'
  consensus) and only same-source points count; scored on the last 2 hours (6 kept as context); no signal on a rebound after a bigger drop, with no
  market number on the latest load, or when the latest point is over 2 hours old; a market that came back over half a point from its high is not
  "behind"; "sampled" when the loads around the move are over 30 min apart. It never changes a decision or a stake. Not real time:
  it sees only what this device loaded (a point per load or Sentinels run). Live would need the Worker to snapshot on a timer (a Worker change: ask first).
  Not built: the market line on the price chart.
- Reading the record (v4.52, `tierCmp`, `tierCmpHtml`, `.tier-cmp`, in Performance › ◎ Rings and extras; owner, passing on ChatGPT): Perfecta minus the other
  ringed best bets as a difference, ROI and CLV, with a 95% range from 5,000 seeded resamples of whole games (mulberry32; games resampled inside three kinds: both groups, Perfecta only, other only;
  from 5 settled bets a group over 4 games, the CLV range from 5 closes a group; "extremely preliminary" under 30 bets or 15 games; cached by content);
  stage by the smaller group (under 100 bets or 50 games descriptive, then directional, 300/150 useful if the range excludes zero, 1,000/500 credible); the
  top sports and markets of each group. Under it: every Just-missed Watch bet (`xc:'lucky'` saved on the Watch record since v4.52; older ones by `actNet` ≥ 0 and a price under
  Hail Mary odds), chosen or not, as a $1 shadow record at two prices kept apart: when first seen, and the 5-minute-cutoff policy pick (`watchStats`), next to the 🍀 line that is only the ones placed. `tests/signal-record-test.js`.
- Each mode lists only its own bets (v4.51, `modeFamOf`, `famIs` and `mN` in `renderCore`, `r.xFit`, `modeElse`, `modeEmptyText`, `modeCountsPaint(rows,mN)`; owner, 11/10:
  "they aren't supposed to be under the same either - show on Safe, Feeling Lucky, etc. only where they fit"). This replaces v4.50's stacking (Feeling Lucky =
  Safe's cards + Just missed, Clairvoyant = both + Hail Marys). `MODES.clair` no longer has `lucky`. The math is the same in every mode; only the list changes.
  - `modeFamOf(r)` → 'safe' | 'lucky' | 'hail', every row in exactly one: a bet you hold by `prior.tier` (anything else 'safe', whatever the price did since);
    a candidate by `r.xc`; whatever passes every screen 'safe'; of the rest, long shots 'hail', Watch rows 'lucky', other rejects 'safe'. So Safe has no Watch
    group any more (Show › 👀 Watch in Safe says they are under Feeling Lucky), and a held 🍀 / 🔮 bet shows as ALREADY BET in its own mode (listed even when
    its row fails a screen).
  - `extrasAssign` works out the offer whatever the mode (`r.xFit`) and gives `r.tier` / `r.xStake` / `r.xWhy` only in the row's own mode. The number on each
    mode button is how many bets it holds (`mN.safe` = group 0, `mN.lucky` / `mN.hail` = `xFit`), counted after sport, search, Settings, sweet spot and book
    chips, so it is what you see there. `#contadora` says where the other bets are ("Your 5 best bets are under 🛡️ Safe · …"); a mode's card header shows
    even with nothing to offer ("No more today" when the day's count is used); `#emptyMsg` is mode-aware. Show › Passing = the mode's bets to place.
  - Cover bands: Augi's "Long Shot" (<45%) and "Feeling Lucky" (45–<50%) are **Unlikely** and **Coin Flip** (`cvNames`, the legend), so they do not share
    names with the modes. Not changed: the band "Strong" (70–75%) still shares a word with the Sentinel score's STRONG.
  - From ChatGPT's review (pasted by the owner): a Hail Mary says "Needs 22.2% · market 19.0% · La Contadora 19.4%" then "Math says −12.9% at this price"
    (`extraLine`); 🎟 `r.leg` also needs `actNet` ≥ 0 (v4.52: ≥ your floor `cfg.eMin`, no outlier, a market price); Rings and extras marks the 🍀 / 🔮 lines "a user-selected subset". The six ◎ checks
    are frozen as they are (room stays 2.5 points); do not retune them on the bets used to judge them.
  - Also fixed: two Settings tooltips still said "Feeling Lucky uses 2.5% / 15%" (gone since v4.50).
  - From the review of this build: an order waiting or a moved line (`r.waitOrder`, `r.moved`) is always 'safe' (the do-not-bet-twice mark stays in the default
    mode); a held 🔮 bet past +500 is not hidden by the default odds filter; a best bet your daily max or game cap left with no stake stays Safe's (not a
    $1 Hail Mary past the limit); `r.xCap` marks "the day's count is used"; Show › 👀 Watch also lists Just missed; Clairvoyant goes back to Safe at
    midnight with the page left open (`ringRecheck`); the Live Games hub's See on Board opens the mode that lists the bet (`data-fam`).
  - Owner, 11/10: "wait for the para-chatgipititi after you build the last one and put all in that one": no v4.51 note on its own; the next one covers it.
  `tests/modes-perfecta-test.js` (rewritten, 66 checks); `tests/same-player-test.js`, `bet-calendar-test.js`, `board-notes-test.js`, `cover-study-test.js` updated.
- Augi's screens on our engine, step 1 of 5: the Board (v4.34, `boardView`/`#boardView`/`mbev.boardView`, `.cv-legend-box`, `lnGet`/`lnSet`/`lnBtnHtml`/`.ln-ed`,
  `mbev.lineNotes`; owner: "What you recommend" → option 2, "BUILD"): Show menu next to Sort (All groups / Passing / Outliers only / Already bet / Skipped;
  Skipped also lists rejected rows without Show rejected), filtered after `grpOf`. Augi's cover legend (nine chips) in a `details.help` above the bar.
  A note of your own on each line: 📝 on cards (in `.sc-act`) and table rows (name cell), keyed by `pxKey` (sport, name, market, side, game day),
  400 notes max, this device only; the box is an `.editor`, so redraws wait while you type; Save / Delete / Cancel remove it before redrawing.
  Next steps agreed: 2 Live Games (Augi's Game Hub), 3 Bet log, 4 Parlay, 5 Settings. `tests/board-notes-test.js`.
- iPhone pinned bar and colour schemes (v4.32, v4.33; owner: "when I scroll up, the tab bar does not stay pinned down"; "an option to change the colour
  palette, in case I want blue, red, etc., but as a scheme"): at startup `.tabs` is moved to be the FIRST child of `<body>` (not the last: tests and
  links pick the first `.tab[data-view="v-board"]`, which must be Board, not the hidden Pasted) and gets its own layer (`translateZ(0)`), the usual
  cure for iPhone Safari letting a fixed bar slide while scrolling back up; not reproducible in Chromium. Colours: Settings › Layout › Colours
  (`#paletteSeg`, `palPaint`, `html[data-palette]`, `mbev.palette`, set in the head script before the first paint; this device only): Green (Augi's,
  default), Blue, Red, Purple, Graphite, each a full light and dark token set in the v4.33 CSS block. `--brand` is the solid colour under white
  text (active tab, dark-mode buttons, Safe), `--accent` text and outlines; light rules use `:not([data-theme="dark"])` so they never beat the dark
  ones. Wins (`--live`, `--gain`) stay green and losses red in every scheme. `tests/palette-test.js` checks all 10 for 4.5:1.
- Bar at the bottom, ribbon menu on top (v4.30; owner: "I do not like that the bar does not stay on the bottom, it is in the middle"; "on the ESPN ribbon,
  have the scoreboard under where we can choose My games, Top events, NBA ... use how I had it, with all the sports available"): the five tabs are
  `position:fixed` at the bottom at every width (was phones ≤640 only; `body` keeps 76 px of room), `layout-test.js` now expects fixed on Desktop
  too. The ribbon is a column: the menu row (select, ⟳, updated) on top, the scores under it. `ssFillSel` lists every league again with 🎯 My games
  first; v4.26's "only the sports you bet in" menu and its All sports box (`#ssAll`, `mbev.ssAll`) are gone.
- Math order and the #1 pick (v4.28, `mathKey`, `scWord`, `mathTop`, `.sc-mathtop`, `.sc-word`; owner: "still confused on the green, blue and school-bus
  yellow. Tell me THIS one is what the math says to bet on. The sort, stars is not always the best bets, so what is it?"): one order for everything,
  the edge after blending the market with the model (`blendNet`, what the stake is sized on), outliers last. The daily max is filled in it (it already
  was), Sort › ✅ Math is now the default (`sortBy='math'`; Top bets by BettingPros stars is still in the menu), and the Place card with the highest
  `mathKey` says "✅ #1 MATH PICK" whatever the sort. The Sentinel score keeps its colour and says it in a word: STRONG 75+ (green), GOOD 50-74 (blue),
  THIN under 50 (yellow: still +EV, the smallest stakes). The Place these header says the math says bet every card, best first, to the daily max.
  `mathTop` inlines the Place test because `isPlace` is a `const` defined further down (startup rule). Tests read the score with `parseInt`.
  `tests/math-pick-test.js`.
- Hard stop (v4.27, in the bet editor's Save handler next to the v2.71 limit check; owner: "I want to be strict with myself ... build the Hard
  Stop. I still have the option to go on, but at least it is there for me to say and think... ok, mejor no"): when the stake would take the bet's
  game day past `cfg.dayMax` (`dayStats()[day].staked` + stake), the first press shows "🛑 Hard stop: today is at $48.00 of your $50.00 daily max;
  this $3.00 makes $51.00. Mejor no?" and the button reads Save bet anyway (`saveBtn.dataset.hs`); the second press saves. Not on edits, settled
  records or free bets. The day is `.eb-date`, else `gameDayOf(r)`, else today. The board already keeps rows past the max out of Place these
  (v2.x "daily max reached"); this covers I bet this and + Add a bet. Novig and other % books: the stake is the Cost box (`.eb-cost`, pmMode).
  `tests/hard-stop-test.js` (settings seeded as `saveCfg` writes them, with `cfgVer`, or the v2.53 migration turns a $500 bankroll into $1000).
- Score ribbon: My games and bet risk (v4.26, `ssRiskMap`, `ssMine`, `ssBetSports`, `ssFillSel`, `ssTile(..., risk)`; owner, 11/8: "On the ESPN banner?
  ... option for My Games as well, or by sport that I am only betting; if the sport doesn't have a bet, it won't come out"): each game tile with an
  open bet of yours says "N bets risking $x" (ESPN's "1 Bet risking $1.26"; free bets count as bets, risk $0; settled and parlays are not in it).
  The menu lists 🎯 My games (`MINE`, the games with your open bets, from today's ESPN scoreboards) and ONLY the sports you have an open bet in,
  rebuilt on every draw; `All sports` (`#ssAll`, `mbev.ssAll`) brings back the full league menu. `ssFillSel` keeps the chosen value when it
  is still there, else My games. `tests/ribbon-risk-test.js`; `tests/ribbon-test.js` ticks All sports first.
- Drop-downs (v4.25, `details.help`, `helpApply`, `mbev.help`; owner: "if you feel certain things can be, or are only needed with, a drop-down,
  then do"): the explanation on every tab (Live edges, Live bars, Moneylines, Lines, Add a bet, Parlays, Bets by game day, Bets you took,
  Scorecard stages, Is the model honest, CLV foot, Settings: sync, stakes, sports, sweet spot, Leagues, Parole) and the parlay legend are
  `<details class="help" data-help="id">`, closed to start; the ones you open are remembered per device (`toggle` listener, capture phase) and
  put back by `helpApply` at startup and after the Scorecard and `#pkSent` redraw. Bet log: Download, ⬇ CSV and Check results stay on the panel;
  Show as CSV, Grab closing lines, Back up, Restore and Delete every logged bet sit under "More" (`log-more`). On a phone (≤760 px) the board's
  tick boxes (Only sweet spot, Show rejected, Only games I already bet, Show all notes) fold behind `#barMoreBtn` "Filters" (`.bar-more`,
  `mbev.barMore`); ≤900 px the Today card's book tiles hide behind "by book" (`.tb-more` in the All card, `todaybar.tb-fold`, `mbev.tbBooks`;
  the click is caught on `document` in capture phase so it does not open the Bet log). On a computer both are simply there. Chromium keeps a
  layout box for the content of a closed `<details>`, so a visibility check in a test must also look for a closed `details` ancestor.
- Colours: light-mode text greens and amber are AA-checked (`--live`, `--neon`, `--warn`, `--gain`). Run the accessibility
  report after changing colours.
- Editing a logged parlay (v3.85, `plEditOpen`, `plParseLegs`, `plDec`): the log's parlay row has edit: each leg (text and American
  odds, parsed from `parlay.legs` "text odds; text odds"), add or remove legs, stake, and Pays if all hit (from the legs until typed).
  Saving sets `parlay.legs`, `picks`, `pays.all`, `odds`; an all-hit parlay gets the new payout; each edit goes in `edits`.
- Editing a saved bet (v3.88): the editor has Game day (`.eb-date`, from `gameDayOf`). A new day sets `date`, `dateSet` and moves
  `start` to the same kickoff time on that day; the old day goes in `edits[].before.date`.
- An open editor in the Bet log (v3.86, `logEditorOpen`): background redraws (live prices, fills, sync) wait (`logRenderLater`) until it
  is saved or closed. Your own buttons must remove the editor before calling `renderLog`, or their redraw waits too.
- The Bet log draws newest first, grouped by game day (`logDays` remembers open/closed days per device). `data-i` on its
  buttons is still the bet's index in `logged`, not its position on screen.
- Look out (`lookOutWhy`): a bet with no result once its game is surely over (`overAfterH`: 5 hours, 8 for fights, 100 for
  golf), a typed game whose day has passed, a `?` result, or a parlay whose day has passed. Its count is on the Bet log tab
  and the Today card. The same finish time drives the log's "over · result pending" label.
- 🔒 Spent (v3.67, `betLocked`): stake on bets settled, sold, or whose game has started (a typed game: its day has passed),
  shown per game day in "Bets by game day" and on the Today card, with the rest as "not started".
- Leagues: `MORE_LEAGUES` (code, name, sport, ESPN path, The Odds API key) feeds `ESPN_MAP`, `SOCCER`, `SPORT_NAMES` and
  `OA_SPORTS`. A league with no ESPN path still loads and can be bet; its result comes from you via Look out. The Odds API
  panel also takes any key typed in, and the Sportsbook API keeps leagues it doesn't know under their own code.
- Pictures on every row (board, Parlays, Bet log: `avatarHtml`, filled in by `avFill`) and on Place these cards: the player's
  photo is FantasyPros by player ID (`r.pid`, also saved with the bet by `addToLog`), else ESPN's headshot only on an exact
  name match on one of the game's two rosters (`espnShotFor`, `avEspn`; rosters saved 3 days in `mbev.rosters`). No exact
  match, no photo: the team logo stays. Team bets show the team logo, game totals both.
- Score ribbon (v3.77, `renderStrip`, `ssFillSel`, `ssMulti`, `ssExtra`): the menu has ⭐ Top events (ESPN's
  `site.web.api.espn.com/apis/personalized/v2/scoreboard/header`, layout undocumented, read defensively; falls back to Live now),
  🔴 Live now (every league, quiet ones skipped via `leQuiet`), every `ESPN_MAP` league by sport, and `SS_EXTRA` (F1, NASCAR,
  IndyCar, golf, tennis, UFC, more): ESPN scoreboards for the ribbon only, kept out of `ESPN_MAP` so grading does not change.
- 🚑 Injury flag (v3.78, `injTagHtml`, `injFill`, `injGet`): a player prop whose player is on ESPN's free `/injuries` list
  (per league, `ESPN_MAP` path) gets OUT / IR / SUSP (red) or DOUBTFUL / QUESTIONABLE / DTD (amber) on the board and Place these,
  ESPN's note on hover. Exact `normName` match only. Kept in `mbev.inj` for 30 minutes (names, status, team, note only).
- 🌬️ Weather tag (v3.79, `wxTagHtml`, `wxFill`, `wxGeo`, `wxHour`): outdoor NFL, NCAAF and MLB games (`WX_SPORTS`; domes by
  ESPN's `venue.indoor` never) get wind (15 mph or gusts 25+), rain or snow (50%+) or cold (32°F or less) at kickoff. ESPN gives
  indoor, the city and its own sky and temperature; Open-Meteo (free, no key) the hourly wind, gusts and rain chance. City
  coordinates kept for good (`mbev.wxGeo`), forecasts 1 hour (`mbev.wx`). If Open-Meteo fails, ESPN's forecast still flags rain, snow, cold.
  v3.80: the game is found by the row's ESPN id (`gameInfo.eventId`), then codes, then full names (`wxFind`). v3.81: normal weather
  gets a quiet chip (`wx calm`: sky, °F, mph) and domes "🏟️ dome", so a checked game always shows something.
- The data sources row (`#srcBar`, `#srcPanel`) is on the main page under the BettingPros bar. Settings keeps the passphrase.
  v4.02 (owner: "on the Performance tab we do not need the API info, it makes everything cluttered"): the BettingPros bar (`.loadbar`,
  `#apiStatus`), Sources (`.srcline`, `#srcPanel`) and the board count (`.statbox`) show on the Board only, by CSS on `body[data-view]`
  (set by the tab handler). Leagues' Load odds switches to the Board first, so its Sources panel still opens. Performance starts with
  Results by day (`#calPanel`), then the Scorecard.
- 🌍 Leagues tab (`lgLeagues`, `lgScan`, `lgPaint`): every league the app knows, plus The Odds API's own list once the Worker
  has `src=oddsapi_sports` (free), and which have games in the next 3 days (ESPN; `src=oddsapi_events` once the Worker has it;
  the Sportsbook API's last load). Saved 30 minutes in `mbev.lgScan`. Load odds uses The Odds API panel's loader.
- 🔴 Live edges (v3.71, `leScan`, `lePaint`, top of the Live tab): games in progress only. The fair price is ESPN's live win
  chance (`liveGameProbs`), because the board's model is pre-game; prices are Kalshi, Polymarket US and Novig through the Worker's
  `/live` (moneylines, ids `le:<event>:<team>:<exchange>`). Flagged only with `LE_MIN` (3%) edge after the fee (`feeRate(..., live)`),
  a chance of 8-92%, and a price within `LE_GAP` (10 points, v3.72; was 25) of ESPN's. Shows "pay at most" (`leMaxPay`). Repeats with
  Auto-refresh, 30 s at most. v3.72: `leSeen` remembers per game when ESPN's number last changed and when the game last moved
  (period, score, clock, last play); edges are hidden once ESPN is unchanged for `LE_STALE` (2 min) while the game moved
  (`leRunning`: not halftime, end of period or a delay). Each game shows "ESPN changed N ago".
  v3.74: Pinnacle live (`lePinnId`, `lePinnML`, `leTeamHit`): the Worker's `/pinnapi/live?sport_id=N` (note in
  `agent-notes/worker-pinnapi-live_2026-11-04_v1.md`; not deployed yet) passes pinnapi's `/kit/v1/markets?event_type=live`.
  When it answers, Pinnacle's no-vig moneyline is the fair price and ESPN must agree (a plus after the fee); a 404 means
  "not on your Worker yet" and ESPN alone is used. The response layout is from pinnapi's docs, not yet seen live.
  v3.76: every team league in `ESPN_MAP` (`LE_TEAM`: football, basketball, hockey, baseball, soccer); a league with nothing live
  is skipped for `LE_QUIET` (10 min); up to `LE_MAXG` (30) games. A game ESPN has no win chance for (often soccer) is priced by
  Pinnacle alone. pinnapi's trial is 100 requests a day: Pinnacle live is asked only on a Scan press (`leScan(true)`), at most
  `LE_PINN_DAY` (40) a day per device (`mbev.lePinn`); Auto-refresh reuses the last answer until it is a minute old, then ESPN.

## Parlays tab (PrizePicks, DraftKings Pick6)
- The math lives in the `pk*` functions (`pkDist`, `pkEV`, `pkBreakEven`, `pkKelly`, `pkEntry`). `tests/parlay-test.js` checks them against
  independent brute force; keep it passing if you touch them.
- Legs come from every prop row on the board that hasn't started, passing or not; the chance is the row's `blendProb`.
  PrizePicks rows come from BettingPros (book id 37, when PrizePicks is ticked under Books you bet). BettingPros has no Pick6.
- Payout defaults are in `PK_DEFAULT`; the owner's edits are saved per device in `mbev.pk`. Pick6 defaults are a copy of
  PrizePicks Power until the owner enters Pick6's own.
- "Best for your bankroll" is the entry with the most log growth at its suggested stake, not the biggest return.
- The Sentinels (`shopExchanges`) end by sending the Parlays tab every prop that clears the per-pick break-even of a 2- to
  6-pick entry, good alone or not (v3.62: good-alone ones, `pkAlone`, are marked "✓ good alone too") (`pkSentLegs`, drawn by `pkSentHtml` in `#pkSent`). The ring on the fits circles (2 3 4 5 6) follows the
  size picked (`pkState.sentN`, v3.70); picks that fit it come first, and "↓ See the best N-pick entry" jumps to its card. 4 picks is
  starred as the target; the card there is "★ The Sentinels' 4 picks", not "Best for your bankroll".
- Apps (v3.59): `PK_APPS`, ticked ones in `pkState.apps`. Pick'em apps (PrizePicks, Pick6, Underdog, Sleeper) use payout
  tables (Underdog and Sleeper start as copies of PrizePicks'). Combo apps (`PK_PRICED`: Kalshi, Novig, Polymarket US, DK and
  FD Predictions, Fliff, Bovada…) use `pkLegsPriced`: only legs that app offers, paying the legs' odds multiplied with the
  fee off each (`pkArr`). Promos on Your entry: a discounted line (`pkState.adj`, chance from the projection by `pkDiscP`,
  or typed) and a boost (`pkState.boost`, what all-hit pays). The Sentinels' size is `pkState.sentN` (4 by default).
- More books (v3.68), names from OpticOdds' public list (their IDs only work with their paid API): pick'em Dabble, Betr Picks,
  ParlayPlay (PrizePicks payouts to start); combos Underdog Predict, Robinhood, Gemini, Fanatics Markets, Webull, Crypto.com;
  in `BET_BOOKS` and `BOOK_CHOICES` also Circa Sports, BookMaker, BetOnline, LowVig, Heritage, BetUS, PS3838 and others.
- Ready-made slips (v3.61, `pkSlipsHtml`): size buttons 2-Leg to 6-Leg (`pkState.slipN`, 4 by default); the best slips by
  bankroll growth from the playable picks, up to 5. One player per slip; across slips a player can repeat unless
  `pkState.slipRepeat` is false. Works for pick'em and combo apps.
- No home-run slips (v3.64): a combo leg must pass `pkComboOk`: an edge after fees, at least `pkState.minPC` likely (20%),
  and with "Only good bets" (`pkState.goodOnly`, on by default) good alone, an outlier, a small-risk bet or +EV alone (its
  `tag`). Combo slips must hit at least `pkState.slipMinHit` (5%). Slips rank most likely to win first (`pkState.slipRank`).
  Careful when editing these long lines: a `//` comment placed mid-line silently comments out the rest of the line.
- Recommended thresholds (v3.66, `pkRec`, `pkApplyRec`): choosing the app or the slip size sets them. Pick'em: picks from
  the size's break-even + 1 point, rounded to 0.5 (PrizePicks Power 4-Leg 57%). Combos: each pick 40%, slip hits 20/10/5/3/2%
  for 2-6 legs. The note `#pkRec` says what is recommended and offers "use it" after the owner types their own.
  v3.92: on combo apps the pick'em boxes (Power/Flex `#pkPlay`, Picks from `#pkMinPL`) are hidden by a CSS rule; `hidden` alone lost to display:flex.
- Logged entries (v4.06, `pkNotLogged`, `pkLoggedLegKeys`): a pick already in a parlay in the Bet log (last 2 days, `parlay.pk.legs`) is
  already bet: `pkLegs` / `pkLegsPriced` leave it out of entries, slips and pick lists, and `#pkNote` says how many. Before, Log this entry
  only remembered it in memory (`_pkLogged`) until a reload, and its picks stayed in the pool.
- Every leg shows where it plays (`pkWhere`: sport · team · game · time) on the Sentinels' list, slip cards and the pick list.
- **Get Pick6 lines** (and PrizePicks) calls the Worker's `/src/odds?src=oddsapi_events` and `src=oddsapi_props` (The Odds API,
  region `us_dfs`, JSON passed through unchanged; see `agent-notes/`). Only the games of the best NFL/NBA picks, at most 6 per press,
  4 stats each. A board row at the app's own line is `own`; a different line (`diff`) or a pick the app doesn't offer (`none`) is
  kept out of entries; games not looked up stay `unknown` ("check line").

