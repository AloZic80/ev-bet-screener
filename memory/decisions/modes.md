# Modes: five tabs (Boring, Machín, Volado, Suertudo, Brujo), ⏱ Old and 👻 AWOL

Status: active · Introduced: v4.50, made exclusive in v4.51, five tabs by La Contadora's chance in v4.76, ⏱ Old in v4.77 · Approved by: Alonzo · Last verified: 2026-11-12 (v4.80)

## Rule
- A mode never changes the math (stakes, daily max, what passes). It only changes the list.
- Five tabs, highest chance first (owner, 11/12: "only 5 tabs. start with boring and end with Brujo"). An approved bet goes by La Contadora's
  chance (`actProb`, `passFam`), each cover band in one tab:
  - 😴 Boring (`boring`): 75% or more: High Cover, Heavy Favorite;
  - 💪 Machín (`safe`, the app opens here; was 🛡️ Safe): 60 to 75%: Strong, Solid, Lean;
  - 🪙 Volado (`volado`): 50 to 60%: Slight Lean, On the Line;
  - 🍀 Suertudo (`lucky`; was Feeling Lucky): 45 to 50%: Coin Flip, plus the Just missed offers;
  - 🔮 Brujo (`clair`, family `hail`; was Clairvoyant): under 45%: Unlikely, plus the Hail Marys.
- ⏱ Old (`old`, v4.77; Alonzo: "lets not mix them with our regular tabs"): any card whose price was read more than 12 hours ago (`rowOld`, `OLD_PRICE`),
  whatever its chance, extras included. A Sentinels press or a reload that reads it fresh sends it back. A bet you hold, an order waiting or a moved line
  stays where it is. Its Place these says La Contadora said YES at those prices: check each price first. Since v4.78 a price read at an unknown time
  counts from the board load, and a card that turns old with the page open moves within 30 seconds (`ringRecheck`; v4.79: asked for once while an
  editor holds the draw, then drawn when it closes). Its La Contadora line (v4.79): her YES was for those prices, and the 🍀 Just missed and
  🔮 Hail Mary cards listed there never had it.
- 👻 AWOL (`awol`, v4.81; Alonzo: "Those go either on OLD or a AWOL category / Tab if they can't be found anymore"): a card whose own book said, on
  the last check, that it cannot find this bet (no market at your line, not listed, nobody selling, the line moved): a 🦑 press,
  the open check after a load, or a tap on the price (`rowAwol`, `awolNote`). Busy, not mapped, "game not found", a Draw or "could not tell" are
  our side: not AWOL. Listing only (same stake), like ⏱ Old; a check that finds it sends it back. A closed market from the open check keeps the
  v2.97 rule (no money) and is listed there too. AWOL comes before ⏱ Old. v4.82: an AWOL card never says BET NOW or #1 MATH PICK; its ◎ ring
  (six checks unchanged) reads "◎ PERFECTA · 👻 AWOL · look at the book first", and `mathTop` skips it.
- Inside a tab, Place these is grouped under a header per cover band (`rowBand`, `bandHead`), highest first; your sort applies inside a band.
- Each row is listed in exactly one tab (`modeFamOf`):
  1. a bet you hold: by `prior.tier` (Just missed, Hail Mary), else by its chance if it passes, else Machín;
  2. an order waiting or a moved line: Machín;
  3. the book could not find it on the last check: 👻 AWOL (v4.81); then a price read more than 12 hours ago: ⏱ Old (v4.77);
  4. a candidate: its own tab (`r.xc`);
  5. passes every screen: by its chance (`passFam`);
  6. of the rest: long shots Brujo, Watch rows Suertudo, other rejects Machín.
- **Near-misses are not offered since v4.80** (owner: option A, "what you seems better"): `EXTRAS.nearMiss=false`. They stay 👀 Watch records (no money),
  so the record still shows whether they would have won. 🍀 Suertudo lists only the Coin Flips La Contadora approves. The machinery below is kept
  (switch it back on with `EXTRAS.nearMiss=true`).
- Just missed (`xc:'lucky'`, only when `EXTRAS.nearMiss`): a Watch row with `actNet` ≥ 0 and no other reject. Smallest bet, 5 a game day. Its card says
  "La Contadora: NO · just under your floor (+X% vs your Y%) · optional, smallest bet"; Place these says "✅ La Contadora: YES" (v4.76).
- Hail Mary (`xc:'hail'`): +300 or longer, or a scorer long shot from +200. $1, 3 a game day. Brujo goes back to Machín at midnight.
- "No more today" (`full()`, `mN.fullL` / `mN.fullH`): none offered in that tab and a candidate is held back by the day count itself
  (`r.xCapDay`, v4.79). A candidate held back only by the long-shot moneyline allowance (3 a game day, one a game: `r.xCap` without `xCapDay`)
  shows its own reason and does not make the tab say "no more today".
- A best bet that your daily max or game cap left with no stake stays in its chance tab, out of Place these.
- Each tab button counts its own Place these bets plus the extras offered there. Since v4.77 the header's big number is the approved bets you can bet now
  ("to bet now · of N", `passW.now`: in the tabs, not ⏱ Old); "N elsewhere ▸" (`passWhere`, `passWhereHtml`) lists every other approved row under the first
  reason it is not in a tab, plus how many sit in 🔒 Skipping Jail (v4.76 showed "N pass" and "N in the tabs ▸").
- Extras are real bets in the money views, and are kept out of the Scorecard.
- Show › ◎ Perfectas (v4.80) lists the 6-of-6 bets of every tab, whichever tab is open.
- 🔔 (v4.80, level 1, while the app is open): Settings › "Tell me when a new ◎ Perfecta shows up": a fixed banner, a short sound and a browser
  notification, once per Perfecta (kept 3 days); turning it on takes the board as it is. A label: no stake or decision changes.

## Code
`MODES`, `EXTRAS`, `OLD_PRICE`, `rowOld`, `rowAwol`, `awolNote`, `extrasAssign` (`xc`, `xFit`, `tier`, `xCap`, `xCapDay`), `modeFamOf`, `passFam`, `rowBand`, `renderCore` (`famIs`, `mN`, `passW`), `passWhere`,
`passWhereHtml`, `modeCountsPaint`, `modeEmptyText`, `extrasCardsHtml`, `extraLine`.

## Tests
`tests/tabs-v476-test.js`, `tests/old-prices-test.js`, `tests/no-more-today-test.js`, `tests/awol-test.js`, `tests/v480-test.js`, `tests/pass-where-test.js`, `tests/modes-perfecta-test.js`, `tests/longshot-mode-test.js`, `tests/same-player-test.js`, `tests/floor-watch-test.js`.

## Supersedes
v4.51 to v4.75: three modes (🛡️ Safe the best bets, 🍀 Feeling Lucky the Just missed, 🔮 Clairvoyant the Hail Marys). v4.50: modes stacked
(Feeling Lucky = Safe + Just missed). v2.65 to v4.49: modes raised Kelly, the game cap and the daily max.
- v4.74 (owner: "Safe are leans and such ... Have them only where they belong"): an approved bet under 45% (La Contadora's chance) is listed under 🔮 Clairvoyant as "edge · long shot", not 🛡️ Safe. Stake and math unchanged.
- v4.76 (owner's cover-band list: "WE are going to add all those, inside those 5 Tabs"): the five tabs above replace Safe / Feeling Lucky / Clairvoyant.
