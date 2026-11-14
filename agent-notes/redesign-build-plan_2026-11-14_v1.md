# Redesign build plan (El Diseñador round 3b → code)

Ref: CC-2026-11-14-06 · 2026-11-14 10:10 AM America/Chicago · made by 6 mappers, 6 skeptics and 1 planner (Ultracode). Planner versions v5.03+ shift by one: v5.03 became the calRows fix (owner item 27), so the planner's v5.03 ships as v5.04, and so on.

# El Capataz build plan: v5.03 to v5.22 (display and wording only)

Base: `/home/user/ev-bet-screener/index.html` at v5.02. Every version below is display or wording only. None of them touches okProb/actNet, floors, fees, Kelly, caps, stakes, grading, matching or addToLog's field list.

House rules for every version:
- New CSS goes in its own `/* v5.NN … */` block just before the first `</style>` (line 1671 today; it moves down as blocks are added).
- New JS helpers are hoisted `function` declarations. Mid-line comments use `/* v5.NN */`.
- No ASCII apostrophes inside single-quoted JS strings. Use ’ instead.
- Fonts use longhands (`font:inherit; font-size:…; font-weight:…`). Never `font:… inherit`.
- Line numbers are as of v5.02. Re-find each one by exact text, because every version moves them.
- Each version gets its own `tests/v5NN-test.js`, registered in `tests/run-all.js`. Run the full `node tests/run-all.js` after each version, not only the new file.
- Layout checks run at 390, 1000, 1280 and 1960 px, in light and dark.
- Layout versions also run `tests/a11y-report.js`, `tests/table-width-report.js` and `tests/overflow-report.js`.
- After each version: one line in `memory/history.md`, an agent-notes report, a para-chatgipititi note and a La Chamba post.
- The version numbers are placeholders. The three-place bump (SCREENER_VERSION, `<title>`, `#verTag`) happens only on the owner's word (see Needs owner #29).

## 1) Versions

| Version | Title | Steps merged | Tests touched | New test file | Size |
|---|---|---|---|---|---|
| v5.03 | Tabular digits and a 12 px text floor | Foundations 1 | rerun: bet-calendar, cal-worst, layout, phone-header, phone-today, awol (L69), v497, v500 | tests/v503-test.js | S |
| v5.04 | ▲/▼ next to every signed gain or loss | Foundations 2 | none expected (::before is not in innerText); rerun money, cal-worst, bet-calendar, v489, v501, signal-record, log, phone-today | tests/v504-test.js | S |
| v5.05 | Price age in words on every card | Foundations 4 (card part) + M2-7 | sentinel-card L38, L47, L69; book-choice-v461 L190 | tests/v505-test.js | S |
| v5.06 | Book chips at 44 px | M1-8 | rerun board-book, modes-perfecta L102-104, phone-filters, v500 L31-32 | tests/v506-test.js | S |
| v5.07 | ⓘ popovers and a Glossary page under More ▾ | Foundations 5 + M2-1 | tabs-test L23 (More ▾ list); rerun invariants L72, v493, sentinel-card, v489, v501 | tests/v507-test.js | M |
| v5.08 | Honest empty board: "No prices on the board yet" | M6-S7 | rerun modes-perfecta L52, tabs-v476 L63, phone-header, phone-today, v500, overflow-report | tests/v508-test.js | S |
| v5.09 | Bet calendar amounts that fit a phone, legend, best and worst day | M4-5 (+ lifts the v5.03 .lc-d exception) | bet-calendar L99-100 (and confirm L35-37, L97); v503-test exception list | tests/v509-test.js | S |
| v5.10 | ⭐ #1 banner in buyer's words | M1-2 | v497 L22 | tests/v510-test.js | S |
| v5.11 | Bet / Wins / Back row on cards | M2-2 | v497 L28, sentinel-card L38 (money part), kalshi-how L35; rerun v483 (390 fit) | tests/v511-test.js | S |
| v5.12 | Winner-bets page controls (chips, Fair from, one load button) | M5-S1 | rerun v501 check 5 | tests/v512-test.js | S |
| v5.13 | "Could not reach ESPN", never a false "no games" | M6-S6 (display part) | rerun/update phone-header L58, tabs-test L37, ribbon, ribbon-risk, bp-several, leagues L48, grade-stick | tests/v513-test.js | M |
| v5.14 | TODAY line: Settled · Open upside · In play · daily max | M1-3 | v500 L24, phone-today L23; rerun v498 L23-28, live-batch L124, log L37, money L51-55 | tests/v514-test.js | M |
| v5.15 | Card verdict line and price ruler | M2-3 | price-pct L29; rerun blend-limit, invariants L72, v493, v484, sentinel-card L84-92 | tests/v515-test.js | M |
| v5.16 | Show the math: five numbered steps | M2-5 | rerun sentinel-card L31/39/52, math-pick L24/31, v493 L22, signal-record L46, modes-perfecta L77, kalshi-how L30-31, poly-strip L22/42 | tests/v516-test.js | M |
| v5.17 | Winner bets as game rows (+ ALREADY BET mark, ★ your book) | M5-S2 + M5-S4 (star only) | v501 check 5 (source read); look at table-width, a11y, overflow reports | tests/v517-test.js | M |
| v5.18 | Winner bets status: "Loaded … · prices N min old · X lines in Y games" | M5-S3 | none | tests/v518-test.js | S |
| v5.19 | Bet editor on board cards as a sheet (phone) or right panel (computer) | M3-S1 (no rename) | rerun v497 L31-33, v500 L33-36, editor-stays, log L78-80, price-pct L35, invariants 80-99, modes-perfecta 121-180, sentinel-card L72, hard-stop L21, kalshi-how L35, old-prices L74 | tests/v519-test.js | M |
| v5.20 | Sheet: your books as chips, price as ¢ / Odds / % | M3-S2 + M3-S3 | kalshi-how L35-37 (texts kept), save-confirm L22; rerun add-bet, books, towin-edit-pct | tests/v520-test.js | M |
| v5.21 | Sheet: "Worked out for you" box | M3-S4 | rerun invariants 80-99, modes-perfecta 121-158, price-pct 32-38 | tests/v521-test.js | M |
| v5.22 | ✓ Saved sheet; logged bets marked at once, never bettable | M3-S6 | v497 L36-38; rerun fill-prior, kalshi-placed, novig-plus, prop-prior, modes-perfecta 127-166, log 75-77, v500 L31 | tests/v522-test.js | M |

## 2) Change lists

### v5.03 Tabular digits and a 12 px text floor
- New block `/* v5.03 (El Diseñador round 3): tabular digits, nothing under 12px */`.
- Tabular digits:
  - Add `font-variant-numeric:tabular-nums` to `body, button, input, select, textarea, svg text`.
  - Add it explicitly to any HTML rule that uses the `font:` shorthand, which resets the variant (for example `.pk-draft`).
- Font-size overrides:
  - Generate the list with a script over lines 41-1671 (121 declarations, not 117): `font-size:(7|9|9.5|10|10.5|11|11.5)px` and the `font:` shorthands. Copy each selector exactly.
  - Media-scoped rules get their override inside the same `@media` condition in the v5.03 block. This covers line 596 (`.tb-l2`, max-width 900) and any others the script finds.
  - Diff the computed sizes before and after at all four widths, to prove nothing else was restyled.
- Exceptions (not raised; each gets a comment):
  - `.lteam .tos` (7px decorative dots). Add aria-hidden to it in its JS.
  - All SVG text: `.sc-svg text` (1216), `.lf-pintx` / `.lf-num` / `.lspark text` (497/499/517), and renderCal's SVG `font-size="11"` / `"10.5"` attributes (11099/11101). Each chart is checked for label overlap instead.
  - The phone `.cal-c` cells (line 1142, Performance's Results by day).
  - `.lc-d small` (base rule and line 1397, ellipsis). This exception is lifted in v5.09.
- Inline JS sizes changed to 12px with `/* v5.03 */`:
  - `#fillsRaw` (2065).
  - playedHtml 7591, 7598 and 7603.
  - Re-grep `font-size:1[01]` and `font-size:9` after line 1671 for others.
- New test tests/v503-test.js, seeded like a11y-report:
  - Open every view (board, live, parlay, log, add, perf, reports, leagues, parole, money, settings) with all `<details>` open, at 4 widths × 2 themes.
  - No visible own-text element is under 12px, outside the listed exceptions (SVG text exempt).
  - Sampled real number elements (`.sc-t b`, `.tb-pill`, a Reports `td.num`, a button) have tabular-nums.
  - No sideways page scroll.

### v5.04 ▲/▼ next to signed gains and losses
- New hoisted `function dCls(x){…}` near `money()` (6467). It returns ` d-up`, ` d-dn` or `''`. Zero, null and NaN give `''`.
- New hoisted `function dClsR(x,step)`. It takes the arrow from the value as displayed (rounded to the shown decimals), so the arrow and the sign always agree.
- CSS: `.d-up::before{content:'▲ '}`, `.d-dn::before{content:'▼ '}`, font-size .8em. Colours are unchanged.
- Apply the classes:
  - rpCls (9889) and rpClvCls (10016) append the class from dClsR on the shown rounding: ROI to 0.1%, CLV to 0.01%.
  - renderTodayLine net (6510-6511).
  - renderTodayBar money spans only (7453, 7456, 7478, 7481).
  - lcRender `.lc-sum strong` (4403, 4411, 4418, 4435), but not `.lc-d small` (that is v5.09).
  - renderLog band and day net (6236, 6263, 6282, 6335).
  - renderScorecard profit and ROI (7814, 7848, 7854).
  - renderMyBooks P/L (12627, 12635, 12640).
- Card EV `<b>` (4803), the La Contadora EV tile (4767/4772) and pk-ev (10784):
  - Emit `dCls(evA)` on the element.
  - Do not key the arrow off the existing up/down classes. Those give 'down' to null and 0, which would show "▼ —" and "▼ 0.0%".
  - Muted (not actionable) EV gets no arrow.
- Left out: WON/LOST badges (4610), the calendar dayCells (6480), and `.lc-d small` (v5.09).
- tests/v504-test.js, seeded with one win and one loss:
  - Every '+$' element has a ▲ ::before and every '−$' element has ▼.
  - No d-up element shows '−' and no d-dn element shows '+'.
  - Cards with evA null, with evA 0 and with an outlier_untrusted EV have no arrow.
  - ROI at +0.04% and CLV at +0.004% get an arrow only if the shown text is non-zero.
  - The per-book pills in the TODAY bar fit at 390.

### v5.05 Price age in words on every card
- New hoisted `function ageWords(ms)`. It returns 'under 1 min', 'N min', 'N h' or 'N d', and `''` for null.
- Unchanged: `ageTxt` keeps the ring, the tooltips, shop-stale and the Sentinel bars. The ◎ fresh text '⏱ 20m: re-check' (book-choice-v461 L106/L145) stays.
- placeCardHtml (4804):
  - The age pill reads `<i class="age-dot"></i>Price '+ageWords+' old`, plus a `margin-left:auto` top-right position.
  - When sc.age==null it now shows `sc-pill age unk` "Price time unknown". Its tooltip says to re-check the price.
  - The 30-min `old` class and the title are unchanged.
- CSS: `.age-dot`, filled in the accent colour; hollow when `.old`.
- Tests:
  - sentinel-card L38 `/⏱ 5\ds/` becomes `/Price under 1 min old/`.
  - sentinel-card L47 becomes `/Price 40 min old/`.
  - sentinel-card L69 becomes `/Price under 1 min old/`.
  - book-choice-v461 L190 `/45m/` becomes `/Price 45 min old/`.
  - Grep old-prices, awol and v483 for '⏱ ' plus a digit in card text.
- tests/v505-test.js:
  - Every `.sc-card` has exactly one `.sc-pill.age` starting with 'Price '.
  - A row with no time shows 'Price time unknown'.
  - A 13 h row reads 'Price 13 h old' with `.old`.
  - v484 no-overlap holds at 390.

### v5.06 Book chips at 44 px
- CSS only: `.board-panel .book-chips .bchip{min-height:44px;border-radius:22px;padding:0 14px}` and tabular-nums on the counts. No JS change.
- tests/v506-test.js:
  - Chips are at least 44px tall at all 4 widths.
  - On each tab, the sum of the chip counts equals All, which equals the number of cards with `.bet-btn`.
  - phone-filters' above-the-fold order holds at 390.

### v5.07 ⓘ popovers and the Glossary page
- Hoisted functions:
  - `glossDefs()`: edge, fair, max, wins, back, bet, roi, clv, score, cut, mkt, groups. All text uses ’.
  - The Edge entry carries the coin-flip example ($2.10 back in total, $1.10 profit, about 5¢ ahead per $1, 0.5×2.10−1=+0.05), "Any one bet can lose. Edge is a long-run number, not a promise.", "Also called EV", and names La Contadora's conservative chance.
  - `infoBtn(k,v)` returns `<button type="button" class="ib" data-gl data-v aria-label="What is …?" aria-expanded="false">i</button>`.
  - `glossOpen` and `glossClose`, plus `glossRender()` for the page.
- One listener registered in the capture phase on document. It calls `e.preventDefault(); e.stopImmediatePropagation()`, so a tap on the ⓘ cannot:
  - toggle a `<summary>`, including `details.hm-game` (the listener at 6112);
  - set `_boardForce` (3670);
  - fire the card click handler (4558).
- The popover:
  - is a single body-level, position:fixed `#glPop` with role=dialog, clamped inside a 390 px viewport;
  - contains a 'Glossary ›' button that opens v-gloss at `#gl-<key>`;
  - closes on Esc, an outside click, a second tap or resize;
  - closes on scroll too, but scroll events in the first ~300 ms after opening are ignored, and focus uses `focus({preventScroll:true})`;
  - returns focus to the ⓘ when it closes.
- Background redraws: remember `{key, card pxKey}`. After render, reopen it if that card still exists; otherwise close it.
- Where the ⓘ goes:
  - Edge: as a sibling right after `.sc-pill.ev`, never inside it. The pill's title and text stay, so invariants L72 and v493 hold.
  - The 'OK up to' tile label ('max').
  - Reports ROI and CLV headings, only where they are not `th.sortable`. Never put an ⓘ inside th.sortable.
  - The score block in Why this play? ('score').
  - Never inside `.sc-price`, `.book` or `.pp-open`.
- CSS:
  - `.ib`: 18px circle, `position:relative`, `font:inherit; font-size:12px; font-weight:700; line-height:1`.
  - `.ib::after{inset:-13px}` gives a 44px tap area.
  - `#glPop` uses the theme variables.
- Glossary page:
  - Add `<button class="tab" … data-view="v-gloss" data-group="board">📖 Glossary</button>` after the Moneylines tab (1752).
  - Add `#v-gloss` with `<dl id="glList">` after #v-money.
- Tests: tabs-test L23 More ▾ join gains `|📖 Glossary`, and "no row under Board" must stay true.
- tests/v507-test.js:
  - The 44px hit box, checked with elementFromPoint at the corners.
  - The ⓘ's tap pad does not steal taps from the neighbouring `.sc-price`, `.pp-open` or pill.
  - The Edge popover text.
  - Esc closes it and focus returns to the ⓘ.
  - An ⓘ in an hm-game summary does not toggle it.
  - Reports headings do not sort when the ⓘ is tapped.
  - A background refresh with the same card keeps the popover.
  - The popover is inside the viewport at 390.
  - The Glossary page has one entry per key.
  - actNet and stake are unchanged before and after.
  - No page errors.

### v5.08 Honest empty board
- Add `#boardEmpty` (hidden by default) beside #emptyMsg (1845). It holds ▦, "No prices on the board yet", a short line, one `.act` button `#beLoad` "Load prices", and `#beCost`.
- Hoisted `bePaint()`, called at the end of renderCore:
  - Shows the card only when the board is not a paste board and has no non-paste rows. When shown, it sets `#emptyMsg` to display:none.
  - `#beCost` reads: "uses up to N of your L BettingPros calls today (a repeat load within 30 minutes uses none) · or paste a board".
  - N is `(document.getElementById('apiType').value==='props'?apiPages():2)` times the ☰ Several sport count, using the same logic as `#refreshApi`'s confirm (9396-9397). If possible, factor that into one shared hoisted helper.
  - L comes from `try{lastBudget.limit}catch(e){}`, falling back to 50.
- `#beLoad` clicks `#loadApi`. `#bePaste` clicks `#pasteLink`.
- `#emptyMsg`'s default text becomes "No bets to show in this tab." List this as a visible wording change in the PR.
- tests/v508-test.js:
  - On a fresh profile the card shows with exactly one `.act` button, says 'up to 5 of your 50', and never says 'min old'.
  - With ☰ Several on, the cost is multiplied.
  - Paste opens v-paste.
  - A stubbed load hides the card.
  - An empty paste board keeps the card hidden.
  - It fits at 4 widths with 44px targets.
  - Run the whole suite: about 98 tests start on an empty board.

### v5.09 Bet calendar amounts that fit a phone
- lcRender (4403/4404): inside the same `<small>`, wrap the existing text in `<span class="lc-amt">` (in the open-only cell too) and add a sibling `<span class="lc-amt-s">`.
  - Short form: ▲12 or ▼12 (whole dollars). Under $1 it shows `▲&lt;1` / `▼&lt;1`. Zero shows ±0. Never ▲0.
  - Open-only cells show ⏳6.
  - The aria-label keeps exact cents.
- `#lcLegend` after `#lcCal`: "▲ won · ▼ lost · ⏳ to play · whole dollars on a phone, settled only", plus "Best day … · worst …" from `calDays('All')` for the month, settled days only. Ties go to the latest day. Note that renderCal keeps the earliest.
- CSS:
  - `.lc-amt-s{display:none}`.
  - At max-width 640, hide `.lc-amt` and show `.lc-amt-s`. No extra `.lc-n` rule: that rule already exists at line 1397.
  - On desktop, ▲/▼ comes from `.lc-amt::before`.
  - Won and lost days get a marker that cannot be mistaken for the selected day (`aria-pressed` accent-bg) or today's ring. Use an inset left bar, not accent-bg.
- Lift the v5.03 `.lc-d small` exception: 12px in that block, and remove it from v503-test's exception list.
- Tests: bet-calendar L99-100 change to '▲5' and '▲10'. Confirm L35-37 desktop innerText and L97.
- tests/v509-test.js:
  - At 4 widths, a +$20.88 day shows ▲21 on a phone and +$20.88 on desktop, with no cell cut (scrollWidth ≤ clientWidth in each small).
  - ▲<1 shows for +$0.40.
  - An open-only cell shows only ⏳6.
  - No visible ▲0.
  - A pressed day's background differs from a won day's.
  - Best and worst day match calDays.

### v5.10 ⭐ #1 banner in buyer's words
- New hoisted `rowWorthNow(r)`, lifted from topJumpOnce's `ok()` (3582) with every gate intact, including `!r.glConflict` and `evDisplayState(r)==='actionable'`. topJumpOnce uses it. The later header pill and count reuse it.
- New hoisted `scPriceParts(r)`: the card's own price and odds expression (`okP ? americanOf(offeredProb) : offeredRaw`, with `pp()` cents for Kalshi and Polymarket). placeCardHtml switches to it with identical output, and the banner uses it. Do not use `g.amer`.
- New hoisted `bannerPick(r)`: side, line and stat words as the card builds them. Moneylines fall back to 'TEAM to win', and a draw to 'Draw (tie)'.
- Only the innerHTML line (3586) changes:
  - '#1 by the math: NAME PICK · BOOK PRICE (ODDS) · edge ▲ +X% · in <current tab label>'.
  - EV is `g.actNet ?? g.net`, the same as the card's evA, with `dCls`.
  - The tab name uses today's `MODES[fam].label` until the Name map is decided.
  - Everything is passed through `esc()`.
  - id, classes, data-mode-go, gating and click handler are unchanged.
- Tests: v497 L22 becomes `/#1 by the math: Clean Pick/` and `/in 🪙 Volado/`.
- tests/v510-test.js:
  - The banner's edge, price and odds equal the #1 card's, for both a Kalshi ¢ row and a sportsbook row.
  - It never names an already-bet, old or AWOL row.
  - It is hidden when the #1 card is on the open tab.

### v5.11 Bet / Wins / Back row on cards
- placeCardHtml `.sc-money` (~4812): when st>0 and pay!=null, render `.sc-m3`:
  - Bet $st.
  - Wins `infoBtn('wins')` $max(0, pay−st).
  - Back $pay.
  - Then the unchanged `.sc-lim`.
- Back now shows on sportsbook cards too. It is the same arithmetic, newly displayed.
- The hold branch text "$0 if refreshed / if found: up to $X" is unchanged. Tier cards use xStake. No stake shows "—".
- CSS: a 3-column grid, tabular digits, 12px labels.
- Tests:
  - v497 L28 becomes `/Bet \$[\d.]+ ?Wins.*\$[\d.]+ ?Back \$[\d.]+/`.
  - sentinel-card L38 money part changes the same way.
  - kalshi-how L35: confirm that its case-sensitive `/wins/` card finder still matches, and fix it if not.
- tests/v511-test.js:
  - Ray Sure shows Bet $4.46, Wins $2.54, Back $7.00, with Wins + Bet = Back.
  - A sportsbook Back equals Bet × (1+122/100), within 1¢ after the floor.
  - An old-price card keeps "$0 if refreshed: up to $".
  - The row fits at 390.

### v5.12 Winner-bets controls
- Add the `ml-sub` subtitle. `#mlResearch` is unchanged.
- `#moneySport` and `#moneyBasis` stay in the DOM, visually hidden (`.ml-vh`, `tabindex=-1`, `aria-hidden`). The label moves to the new controls through aria-labelledby.
- `#mlSportChips`, painted by `mlChipsPaint()`, which is called after the renderMoneylines() call at line ~9674:
  - Selecting a chip loads nothing.
  - Remember `moneyLoadedSport`. When it differs from the chosen chip, show "Showing NFL prices · press Compare prices again for NBA".
- `#mlBasisSeg` "Fair from: Pinnacle | Market average" dispatches 'change' on the select. The option texts are renamed to match.
- `#loadMoney`:
  - HTML text changes from 'Load moneylines' to 'Load prices'.
  - After a load it reads '↻ Compare prices again'.
  - Title: "Each load uses BettingPros calls: 1, plus 1 for the game list outside the NFL".
- `#moneyMinEv` moves into `<details class="ml-filter">`. Its default changes from 0 to blank, which now lists negative-edge lines. Say so in the PR.
- tests/v512-test.js:
  - 7 chips with exactly one checked.
  - A chip tap sends no /moneyline request.
  - The "showing NFL … for NBA" line appears when the sports differ.
  - The basis toggle works.
  - The default filter is blank.
  - The button text changes after a load.
  - No overflow at 4 widths.

### v5.13 "Could not reach ESPN"
- Hoisted `espnMark(key,ok)` and `espnDown(key)`, stored on `window._espnDown`.
- fetchScoreboard, fetchScoreboardDay and ssXFetch: mark the key down on catch and on `!res.ok`, and up on success. Return values and caching are unchanged.
- renderStrip: when empty and espnDown, show "Could not reach ESPN. Try again". `#ssRetry` calls `renderStrip(true)`. Otherwise keep "No NFL games today."
- ssMulti and ssExtra get the same split.
- scanSportTimes sets `window._sportErr`. paintSportSelects and bmPaint append ' · ESPN did not answer' instead of 'no games'.
- Kept as today: the multi-load skip (Needs owner #25) and the cached [] after a failure (reported, not changed).
- Tests:
  - About 60 test files abort ESPN, so their visible strip text changes. Grep tests for 'No .* games today' and 'no games'.
  - Update phone-header L58 (the fold line) if it needs it.
  - Rerun tabs L37, ribbon, ribbon-risk, bp-several, leagues L48 and grade-stick.
- tests/v513-test.js:
  - An aborted request shows the error. Retry recovers.
  - A 503 JSON answer shows the error.
  - A 200 with `{events:[]}` still says 'No NFL games today.'
  - With everything aborted, no sport option says 'no games'.
  - Grades are untouched.
  - The fold line fits at 4 widths.

### v5.14 TODAY line
- renderTodayBar (7430) sets `window._tbSum={dayKey, label, n, rec, bet, settled, upside, inPlay, none, isToday}` before it writes innerHTML, in both the early-return branch and the normal path. These are the numbers the open card already prints; there is no new math.
- New hoisted `dayMaxUsed(dayKey)`: the exact lcMaxL formula (4421), called with the date key, never the label.
- hdFoldPaint `#tbFoldBtn` line 1: TODAY · N bets · record, then `$used of $max daily max · $left left` (or `$bet bet today` when dayMax is 0; on another day it shows the day label and no max).
- Line 2, spans only (no divs inside the button):
  - Settled.
  - Open upside, with the small note "profit if every open bet wins".
  - In play.
  - All with ▲/▼ from dCls.
- Kept: `.hf-sum`, the `.hf-look` "bets to check" chip and ▾/▴. The no-bets line reads 'TODAY · no bets · $0 of $50 daily max'.
- Tests:
  - v500 L24 becomes `/In play\s*\$0\.00/` and `/3 bets/`.
  - phone-today L23 becomes `/In play\s*\$2\.00/`. Check that `t.includes(tot)` still holds, or assert `/of \$[\d.]+ daily max/`.
- tests/v514-test.js:
  - The 3b fixture line: Settled $0.00 · Open upside +$5.62 · In play $0.00 · $6.18 of $50 · $43.82 left.
  - It equals #lcMaxL after a second bet.
  - It equals `.tb-scen`'s open upside.
  - A non-today `tbDay` uses the date key.
  - The hf-look chip is present.
  - It fits at 4 widths.

### v5.15 Card verdict line and price ruler
- Hoisted `scVerdict(r,o)` gives the words in this order:
  1. 🍀 Just missed.
  2. 🔮 Hail Mary.
  3. `r.moved`: its own line, "You hold this bet at another line (X). This line: …", followed by the normal verdict.
  4. `r.prior` / `r.waitOrder`: "You already hold this line".
  5. Not actionable: soft text ("Not trusted", "Old price: check it first", "No current price").
  6. Over Max: "✕ Price passes · over your Max price".
  7. Worth it: "✓ Worth it · Edge (EV)" + pill + ⓘ, with the per-$1 sub-line. Model-only rows add " · model only, no market check".
  8. Worth it with no stake: "Worth it, but no stake: " + `pkNoStakeWhy`.
- Hoisted `scRulerHtml(...)`:
  - Markers for pay, max and fair (fair = `r.actProb ?? okProbR(r)`), aria-hidden.
  - Text row: You pay / Max price ⓘ / Fair chance ⓘ. Cents for Kalshi and Polymarket (okTo floored); % to 1 decimal for other books.
- placeCardHtml:
  - Remove `impTagHtml(r)` from `.sc-pick`. The function stays, because the table uses it.
  - Move `.sc-pill.ev` (title and `<b>` text exact) into the verdict head.
  - Render the verdict and ruler inside `.sc-bet` as its last child. A new grid child would break the owner's v4.22 side-by-side layout, which waits on Needs owner #11.
- Tests: price-pct L29 reads `.sc-rl` "You pay 30.3%". Rerun blend-limit, invariants L72, v493, v484 and sentinel-card L84-92.
- tests/v515-test.js:
  - Ray Sure reads "Worth it · Edge (EV) +4.6%" with "You pay 62¢ / Max price 64¢ / Fair chance 66.7%" and marker positions pay < max < fair.
  - Clean Pick shows %.
  - A price over Max shows Price passes.
  - A 🍀 card never shows "Worth it".
  - A moved-line card gets its own verdict.
  - Stake, actNet and the order are identical before and after.
  - No card is wider than its column at 4 widths.

### v5.16 Show the math
- Hoisted `mathStepsHtml(r,cfg,c)`. Every number is read from stored fields; nothing is re-derived in text.
  1. The price you pay. Price read N ago. Price after the fee shown as "about X¢ each", because Kalshi rounds its fee per order.
  2. The fair chance. Market (no vig), model, and "Fair chance used = lower of model, or market + W × (model − market)", where W is `cfgRead().mWeight`, never a hard-coded 0.35. With no market: "the model alone, minimum stake".
  3. Is it worth it? Edge after fees (evA), Max price, Bet + capDetail, and "Model’s own EV · not used for the edge or the stake size; over 15% it marks the bet Not trusted".
  4. Labels (never change the bet). The score is shown as text here; the `.sc-score` element stays where it is until the short-card decision. Also score parts, the cover chip and the book's cut.
  5. ◎ checks: the same `.sc-ringl li` markup. Remove the old r.ring branch; the X-tier `.sc-ringl` stays.
- Summary: Show the math / Hide the math. Keep everything else under "More detail".
- Change the 13 visible "Why this play?" titles and tooltips. Code comments stay.
- tests/v516-test.js:
  - Ray Sure's steps and numbers.
  - Setting mWeight to 0.5 changes the formula text.
  - The open state survives refresh().
  - The model EV line says "not used for the edge or the stake size".
  - Nothing is cut at 390.

### v5.17 Winner bets as game rows
- Load the grading-and-matching skill first, because the ALREADY BET mark reuses the board matcher.
- `#moneyBody` becomes `<div class="ml-games">` (the id is kept). `<h2>Lines by game</h2>`.
- Hoisted helpers:
  - `mlBest`: best row per team by net edge, tie going to `bookIsMine`. `_alt` is built from the unfiltered scored rows.
  - `mlGroup`.
  - `mlEdgeHtml`: ▲/▼ plus 'small edge', the kept ⚠ >10% note, or 'pays less than fair'.
  - `mlRowHtml`.
  - `mlMathHtml`: BettingPros EV, Cover and Rating and the other books, behind Show the math, uncoloured.
- Rows:
  - Big %, small odds, "Fair X%", and the edge labelled "edge vs fair".
  - `★ your book` (display only).
  - An ALREADY BET mark ("ALREADY BET · in your Bet log", link quiet or removed) when an open logged bet or fill matches.
  - 'cap reached' kept.
  - `Open <Book> ↗` link, with the `quiet` class when there is no edge or net ≤ 0.
- New escaping: `esc()` on the link, label and matchup.
- Help text: change the 'Consensus' wording to 'Market average (consensus)'. Report the stale "fallback" sentence; do not rewrite it.
- Tests: v501 check 5 reads `renderMoneylines.toString()+mlRowHtml.toString()+mlEdgeHtml.toString()`, or the rendered DOM.
- tests/v517-test.js:
  - 2 games and 4 rows. KC goes to DraftKings.
  - The KC and BUF texts.
  - The edge equals `netEdge` to 1 decimal.
  - No 'worth it' or 'Bet' verdict words.
  - Cap reached shows no link.
  - A logged KC bet shows the mark and no bold link.
  - The ★ appears per cfg books.
  - The basis switch re-picks the best row.
  - An injected link is escaped.
  - Show the math is closed and has its contents.
  - No overflow at 4 widths.

### v5.18 Winner bets status line
- `let moneyLoadedAt` taken from `data.fetched_at`, falling back to now. `#mlAge` has role=status.
- Hoisted `mlAgePaint(n,g)`: "● Loaded T · prices N old · X lines in Y games …", or "○ No prices loaded yet". It says "loaded", not "quoted".
- `#moneyStatus`'s first clause becomes "BettingPros sent N lines".
- A 30 s ticker:
  - runs only while v-money is open and the document is not hidden;
  - repaints the text only and never calls renderMoneylines.
- tests/v518-test.js:
  - The count equals the number of `.ml-row`.
  - Fast-forwarding 5 min shows '5 min old', and an open `.ml-math` stays open.
  - With the filter at 0 it shows "Showing 2 of 4 lines" and "2 lines in 2 games".

### v5.19 Bet editor as a sheet or right panel
- `asSheet` = a card that is not `.ab-host`. Table, Bet log and + Add a bet editors are unchanged.
- The node stays a child of the card (`at.after(ed)`). It gets class `editor eb-sheet`, role=dialog, and an aria-label equal to the card button's current name. The header uses that name too; the rename waits on Needs owner #12.
- The header meta line is built from `esc((r.sport||'')+' · '+giWhen(r.gameInfo)+' · '+(r.game||''))`. The draft used undefined `sport`/`game` variables, which would have stopped the editor from opening.
- `.eb-foot` wraps Save, Cancel and msg. It is `display:contents` outside the sheet.
- Closing:
  - ✕, a scrim tap or Esc closes it.
  - The Esc listener on `ed` calls stopPropagation, so the dock's document Esc handler does not also run.
  - A scrim tap must not reach the card's link handlers or set `_boardForce`.
- Focus:
  - Opening focuses the first visible field, or ✕.
  - Tab is trapped inside the sheet.
  - On close, focus returns to `.bet-btn`.
- ebIntoView: the sheet path skips the page scroll.
- Runtime guard: if the opened sheet does not span the viewport (an ancestor traps position:fixed, as older WebKit can), drop `eb-sheet` and fall back to the inline editor.
- The dock: the scrim's bottom inset is `var(--dockH)`, with no −10px. Opening `#apiDock` closes the sheet, or is blocked while it is open.
- CSS as planned (z 59 under the dock, 16px / 48px fields, 440px panel at ≥1000), plus a scroll lock through `body:has(...)`.
- tests/v519-test.js, at 4 widths:
  - role and label.
  - Full width on a phone; right edge equals innerWidth and width is 440 on a computer.
  - Save is reachable by elementFromPoint, including with the dock opened.
  - Fields are at least 16px and 48px; buttons at least 44px.
  - Scrim, ✕ and Esc each close it with the log unchanged.
  - A table-row editor stays inline.
  - A row with no gameInfo opens.
  - The fallback runs when the rect check fails (simulated).
  - Safe, Suertudo and Hail Mary prefills and messages are present.

### v5.20 Sheet: your books as chips, price as ¢ / Odds / %
- Hoisted `ebBookChipsHtml(r)`: the row's book ✓, then up to 5 of your books via `bookIsMine`, then Other ▾.
  - A chip sets the `.eb-book` value and dispatches change, exactly once.
  - Other ▾ shows the select.
  - A change made in the select moves the chip highlight.
- `.eb-seg` ¢ / Odds / %:
  - ¢ and % set `pct`; Odds sets `odds`. Then dispatch change.
  - Wording only; no conversion.
  - bookDefault and kw reset the highlighted segment and its words when the book changes.
- syncMode toggles a class when `.eb-sheet` is present, instead of fighting inline display styles.
- Sheet-only words: "You paid $". Read-only Side text.
- Kept texts: `.eb-pct-l` 'Price', `.eb-pct-u` '¢', `.eb-win-l` 'Max payout $' / 'Pays back $'.
- Test the `.on` and `aria-checked` contrast in both themes.
- tests/v520-test.js:
  - The chip order.
  - A Novig switch matches the same switch made in the select, with one runLive call.
  - An unmapped book is reachable via Other.
  - The segment semantics.
  - No ¢ wording is left on a sportsbook, and no % wording on Kalshi, after a book switch.
  - 62 under ¢ and under % gives the same `.eb-check` text.

### v5.21 Worked out for you
- `.eb-worked` box (aria-live) with an inner `paintWorked()`, called at the end of showCheck. It writes text only; no decision reads it.
- Profit if it wins: the typed To win, or `betProfit` on the odds that Save will store. Also Back, and "Same as odds".
- The Max price line uses showCheck's mx and v.anet, with ▲. Over Max reads "Over your Max price … · look elsewhere".
- Today line: dayStats on the game-day key plus this stake, "of $max". Hidden when dayMax is 0.
- Pays back $7.00 vs Worked back $7.01: the Worked box labels its figures "as your Bet log will count them", so two numbers never sit unlabelled.
- `.eb-check` and `.eb-rec` are untouched.
- tests/v521-test.js:
  - −163 on Kalshi.
  - The profit equals page `betProfit` to the cent, and equals the saved bet's profit.
  - Typing 66 flips the Max line.
  - The edge equals `.eb-check`'s.
  - Today shows $10.64 of $50.
  - Saving through the sheet and through the table row stores identical stake, odds, fee, net and snap.
  - A test that the two back numbers never differ without the label.

### v5.22 ✓ Saved sheet; logged bets marked at once
- Hoisted `ebSavedOpen(L)`, body-level `#ebSaved`:
  - ✓ Saved, the bet, `$stake at Book price · wins $`.
  - Today's staked and open upside (via the hoisted `openUpsideFor(day)`). It names the day when it is not today.
  - Note: "… marked ✓ You logged this … graded automatically".
  - "See it in my Bet log" and Done. No Undo.
  - Esc closes it, and it sits above the dock.
- The sheet path calls renderTodayBar then ebSavedOpen and sets the tap guard. There is no toast on this path. Other paths keep savedToast.
- decisionHtml's ALREADY BET cell gets the line "✓ You logged this · $X at P on Book". The flag text is unchanged.
- placeCardHtml: when `r.prior`, render `✓ Logged · see Bet log` and no `.bet-btn`. This is a definite change, not left to build time.
- Note the openUpsideFor / renderTodayBar duplication in history.md.
- Tests: v497 L36-38 change from #savedToast to #ebSaved.
- tests/v522-test.js:
  - #ebSaved shows within 300 ms.
  - The card has left the list, and a `tr.dupe` row shows ALREADY BET and '✓ You logged this'.
  - $X equals dayStats. Open upside equals `.tb-scen`. Wins equals the Worked profit.
  - No Undo.
  - Done and "See it" behave.
  - In the Safe, Suertudo and Perfecta modes, a saved bet's card has no `.bet-btn`, and v500 L31's chip count still matches.
  - At 4 widths Done is reachable.

## 3) Needs owner (kept out of every version)
1. Should Violet become the default colour scheme for everyone, or be an extra option under Settings › Layout › Colours with Green staying the default?
2. In Violet, should gains be violet and losses ink as in the mockup, which breaks the v4.33 rule that wins stay green and losses red in every scheme?
3. Should Violet replace the existing Purple scheme, or sit beside it?
4. Which time should the header "Prices N min old" pill show: the newest price read on the board, or the oldest price on the worth-it list? And what should it say when prices are loaded but nothing is worth it?
5. If the header is slimmed, where should the "Board for [date]" picker and the build date go: the top of the Sources sheet?
6. May Load move behind the Prices pill into a Sources sheet (this reverses your v4.92/v4.94 asks), or should a Load chip stay in the bottom bar? And does the bar stay at the bottom at every width?
7. Are these the board tab names: Usually wins / Often wins / Close calls / Just under even / Long shots / Old prices / Not found, with the crew name small underneath? Note that "Just under even 45–50%" is not true for just-missed and Watch rows, and "Long shots" also holds Hail Marys.
8. Should the crew names inside sentences (La Contadora lines, hints, "back to Machín at midnight") change along with the tabs, or later?
9. May "to bet now" become "worth it right now", with the count box moving from the header to just above the tabs?
10. The mock's "Re-check every price" is not true, because the Sentinels check only Kalshi, Polymarket and Novig. Should the Sentinels button read "↻ Re-check exchange prices" instead?
11. On a computer, may the cards change from your v4.22 "one per line, side by side" to short stacked cards 2–3 across, in the mock's order (what to type → verdict → Bet/Wins/Back → buttons)?
12. Should the buttons be renamed everywhere: "I bet this" → "Log my bet", "open slip ↗" → "Place ↗" (including the second one in the table at line 11321), and "Save bet" → "Save to my Record", with "Save bet anyway" → "Save anyway"?
13. Should the ESPN Scores box show on the Live tab only, instead of every tab?
14. On a sportsbook card with an old price, what should "↻ Re-check" do: (a) run a board Load, which spends BettingPros calls, (b) only point at the Load button and say what it costs, or (c) say "open the book and look"?
15. Should old-price cards lose the main log button but keep a quiet "Log anyway" link, so a bet you already placed can still be marked?
16. On a card whose best-book price was not confirmed again (stale), should Bet/Wins/Back still show, marked "if the price holds", or be hidden?
17. Should the Kalshi line say "Buy 7 YES at 62¢ (Max price 64¢) · Shares 7 · Cost $4.46 incl. $0.12 fee", or keep today's "Shares 6.79 · Limit 64¢ · Cost ≈ $4.46"?
18. Should the card labels change: "◎ PERFECTA 6/6" → "Passed all 6 checks", "OK up to" → "Max price", and the ring texts ("fair chance 66.7%", "price after fees")?
19. On the bet sheet, may a typed "Time placed" move the 4-hour grading anchor for board bets, or should it be stored for display only?
20. Should "Closing price" be typeable on the bet sheet before the game, or only in the Bet log editor, where it already is (it feeds Beat the closing price)?
21. Should the Record headline count every settled ticket in the period, like Reports and the calendar do (parlays, free-bet wins and cancel losses included), while the 1,000-bet bar keeps the Scorecard's set?
22. May the "Bet log" tab become "Record", with the row under it reading Summary · Calendar · Bets · Reports · Performance · + Add a bet?
23. Should Winner bets list only your books from Settings, or every book with ★ on yours?
24. May "Moneylines" become "Winner bets" (More ▾ item and page title, with the CLAUDE.md Karens line updated in the same PR), while the board's Bet type option keeps "Moneylines"?
25. When ESPN does not answer for a sport, should the multi-load still skip that sport (as today), or run it and spend the calls?
26. Should the first-run checklist be hidden for anyone who already has bets, and shrink to one line ("Getting started · 3 of 5 done ›") after the first board load?
27. Performance's "Is the model honest?" tables are broken today, because `calRows` is declared twice (lines 7709 and 10055). Fix it as its own small version?
28. The bet sheet (v5.19) is tested only in Chromium. Is it OK to publish it automatically with the built-in fallback, or do you want to check it on your iPhone first?
29. Should each publish bump the version number (v5.03, v5.04, …), or keep v5.02 until you say?

## 4) Mockup and number mismatches
- **Version tag.** The mocks say v5.00. The app is at v5.02.
- **One page-wide price age.** No single price age exists. Each row has its own rowSeenAt, so the newest-vs-oldest choice is open (Needs owner #4). A restored saved board must read "Saved board · not live", never "1 min old".
- **"Old" means three things.** The card turns amber after 30 min, ◎ fresh needs 10 min or less, and the Old tab starts at 12 h. The mocks show only fresh and 13 h. Cards with no known price time now say "Price time unknown", which no mock draws.
- **Loads vs calls.** "1 of 50 loads" is really calls, not loads. A props Load costs up to 5 calls (2 for game lines, 0 for a repeat within 30 minutes, times the sport count on ☰ Several). The Worker window is a rolling 24 h, not "today".
- **"Re-check every price".** Not true: it checks only Kalshi, Polymarket US and Novig.
- **Gain and loss colours.** The mock has violet gains and ink losses; the app keeps green and red (v4.33). The mock's dark buttons are light violet with dark text; the app keeps white on #6A55E0. The mock's grey light page appears only if Violet becomes the default.
- **Minus signs.** money() prints "−". EV and % texts print an ASCII "-" from toFixed. Left as is, because tests read them.
- **12 px floor.** The mock found 0 items under 12 px. The app has 121 rules, plus SVG chart text and a 7 px decorative row. SVG text is exempt (checked for overlap instead), and the calendar cells wait for v5.09.
- **Kalshi shares.**
  - The mock says "Shares 7 · Cost $4.46 incl. $0.12 fee". The live line says 6.79, while the card's Back $7.00 assumes 7 whole contracts. The app disagrees with itself here (Needs owner #17).
  - The editor prefills the Kelly stake, not a whole-contract cost.
  - The app's fee is a rate (not Kalshi's rounded per-order dollar fee) and is shown nowhere in dollars.
- **Worked profit.** The mock's profit $2.54 / back $7.00 becomes $2.55 / $7.01 under the saved-odds formula that the Bet log counts. The Pays back box still says $7.00. Open upside goes from $8.16 to $8.17. v5.21 labels the two figures.
- **Edge in the bet form.** The bet form shows +4.8% where the card shows +4.6% at the same 62¢. The ⓘ quotes the card's number. Not fixed here.
- **Model weight.** The mock hard-codes "0.35". The app prints the setting (mWeight).
- **Ring check wording.** The mock's ring texts differ from ringOf's words, though the numbers are the same (Needs owner #18).
- **Back $ on sportsbooks.** Today it shows only on exchange cards. v5.11 shows it everywhere, with the same arithmetic.
- **Price chip.** The mock puts the price big and the odds small; the app is the reverse. Only the ruler follows the mock until the short card ships.
- **Max price units.** For sportsbooks the ruler shows Max price in %, while the "OK up to" tile and chart show American odds, on the same card.
- **Ruler markers.** The mock's marker positions follow no single rule. The build uses one formula per card.
- **What the short card drops.** The mock has no score, photo, tags, Parlay or Notes buttons, other books or ⚡/↘ pills. The app keeps them (the score is also shown as text in Show the math).
- **Not-trusted card.** The mock names one outlier trigger; for Way Off the app fires both.
- **Old-price card.** No per-card re-check exists for sportsbooks.
- **Stale cards.** The "stale" state also covers best-book claims that are minutes old, with the stake kept.
- **Name map scope.** Crew names appear in about 150 sentences, plus the Solid / Slight Lean band chips. "Just under even" says "plus ones that just missed", but EXTRAS.nearMiss is off (v4.80).
- **Header contents.** The mock drops the date picker, build date, sync chip and layout button (all live, tested features). It puts the nav in the header at 1280, against the owner's bottom-bar rule. It uses "Live" and "Record" where the app says "Live Games" and "Bet log". Filters lives in More ▾ (v4.95/96).
- **Board mock data.** The board mock's cards and chips do not match the v5.00 stub render (Ray Sure at Kalshi; the app opens on Machín).
- **TODAY line.** The mock drops the count and the W–L, which tests require, so they are kept. The mock's $6.18 of $50 equals tot.bet only when there are no parlays, sold or free bets; the build uses the lcMaxL formula. The mock's › suggests a new page, but the line expands in place.
- **Mode tabs at 390.** The mock scrolls them sideways. Tests require them to wrap.
- **Book chips.** The mock draws letter initials; the app draws logos.
- **Group heading.** The mock's "Close calls · 3 worth it" heading is new (the .pc-head is kept).
- **Price passes card.** The "Price passes · better at DraftKings" card does not exist; such rows are table rows today.
- **Hero count.** "1 price passes · 9 compared" lumps every skipped reason in with PRICE PASSES.
- **Record.**
  - The headline set (rpAgg, by period) and the 1,000-bet set (scoreSet: all time, singles only) are different sets. The mock shows them as the same 7 bets.
  - Worst drop per period is new arithmetic.
  - The Scorecard's Beat the close includes open bets.
  - Reports has no Week.
  - No CLV trend exists today.
  - Best and worst day ties: renderCal keeps the earliest day.
  - The Bet log has no search box. "Void" is Mark PUSH.
- **Bet sheet.**
  - After a save the card moves to the Already bet group (a table row) rather than staying in the grid.
  - There is no Side input; the side is shown as text.
  - The real editor keeps the Pays back box, the live line, the recommendation and the second-press messages.
  - The daily total uses the game day.
  - Native time inputs ignore custom placeholders.
- **Winner bets.**
  - "Edge" there is netEdge vs Pinnacle or the market average, not actNet, so v5.17 labels it "edge vs fair".
  - The mock has 6 sport chips; the app has 7.
  - The mock has no DAL row, but real data has both teams.
  - BUF is hidden today by the 0 filter default.
  - FanDuel is not in the default My books, and the subtitle "at your books" is false today.
  - Rows with no link show "no link from the book".
  - The ⚠ note for edges over 10% is kept.
  - Kickoff times use the browser's local time zone.
- **First run.**
  - The default $1000 bankroll cannot be told apart from a chosen one, so the mock's "2 of 5 done" for a new user cannot come from existing data. New flags are needed.
  - "About 3 minutes" is unmeasured.
- **ESPN.** "Could not reach ESPN" appears in no mock. Today a failure always reads "no games", and the "Scores unavailable" branch can never run.
- **Security (La Guardia).** Today's Moneylines page inserts r.link, the team label and the matchup without esc(). v5.17 fixes it.

## 5) Risks to watch
- **v5.03 can widen rows.** Raising 121 rules can widen the TODAY chips, pills, the `.sc-word` badge and `#modeBar` at 390 (awol L69). Diff the computed sizes at all 4 widths. A wrongly copied long selector restyles unrelated elements.
- **v5.07 and v5.19 have stacked listeners.** The board has capture-phase and document-level listeners (3670, 4558, 6112, 8382) and redraws in the background every 20 s. The ⓘ and the sheet must survive redraws and never trigger their parent's action.
- **v5.13 changes text in many tests.** About 60 test files abort ESPN, so their visible strip and sport-option text changes. Grep before building.
- **v5.08 appears in many first views.** About 98 tests start on an empty board and will see the new card. Run the full suite.
- **v5.15 and v5.16 sit inside the v4.22 desktop grid.** That grid (container `sclist`, measured on the list, not the card) is still active. Keep new parts inside `.sc-bet` and do not move `.sc-score`, until Needs owner #11 is answered.
- **v5.19 on iPhone.** position:fixed inside `container-type:inline-size` may be trapped on WebKit. The guard falls back to the inline editor, but Safari is untested and publishing is automatic once the tests pass (Needs owner #28).
- **v5.22 duplicates a sum.** `openUpsideFor` repeats renderTodayBar's sum. An equality test pins the two together; note both places in history.md.
- **Apostrophes.** Every new string sits in single-quoted JS. Run startup-test first after each version.
- **Already bet.** Must never look bettable: v5.10 (banner gate), v5.17 (Winner-bets mark) and v5.22 (no `.bet-btn` on prior cards) each carry a test for it.
- **Counts must match.** Banner = card (v5.10). TODAY line = lcMaxL (v5.14). Chip sums = cards (v5.06). Winner-bets status = listed rows (v5.18).
- **Owner rules in nearby code.** No version may touch the v4.22 card layout, the v4.30 bottom bar, the v4.33 green/red rule, the v4.92/v4.94 Load placement, or the multi-load skip.
- **Line numbers drift.** Re-find every line by exact text in each version. The skeptics already found off-by-one references (9673 vs 9674, 1755 vs 1754).
