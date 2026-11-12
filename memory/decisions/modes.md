# Modes: five tabs (Boring, Machín, Volado, Suertudo, Brujo)

Status: active · Introduced: v4.50, made exclusive in v4.51, five tabs by La Contadora's chance in v4.76 · Approved by: Alonzo · Last verified: 2026-11-12

## Rule
- A mode never changes the math (stakes, daily max, what passes). It only changes the list.
- Five tabs, highest chance first (owner, 11/12: "only 5 tabs. start with boring and end with Brujo"). An approved bet goes by La Contadora's
  chance (`actProb`, `passFam`), each cover band in one tab:
  - 😴 Boring (`boring`): 75% or more: High Cover, Heavy Favorite;
  - 💪 Machín (`safe`, the app opens here; was 🛡️ Safe): 60 to 75%: Strong, Solid, Lean;
  - 🪙 Volado (`volado`): 50 to 60%: Slight Lean, On the Line;
  - 🍀 Suertudo (`lucky`; was Feeling Lucky): 45 to 50%: Coin Flip, plus the Just missed offers;
  - 🔮 Brujo (`clair`, family `hail`; was Clairvoyant): under 45%: Unlikely, plus the Hail Marys.
- Inside a tab, Place these is grouped under a header per cover band (`rowBand`, `bandHead`), highest first; your sort applies inside a band.
- Each row is listed in exactly one tab (`modeFamOf`):
  1. a bet you hold: by `prior.tier` (Just missed, Hail Mary), else by its chance if it passes, else Machín;
  2. an order waiting or a moved line: Machín;
  3. a candidate: its own tab (`r.xc`);
  4. passes every screen: by its chance (`passFam`);
  5. of the rest: long shots Brujo, Watch rows Suertudo, other rejects Machín.
- Just missed (`xc:'lucky'`): a Watch row with `actNet` ≥ 0 and no other reject. Smallest bet, 5 a game day. Its card says
  "La Contadora: NO · just under your floor (+X% vs your Y%) · optional, smallest bet"; Place these says "✅ La Contadora: YES" (v4.76).
- Hail Mary (`xc:'hail'`): +300 or longer, or a scorer long shot from +200. $1, 3 a game day. Brujo goes back to Machín at midnight.
- A best bet that your daily max or game cap left with no stake stays in its chance tab, out of Place these.
- Each tab button counts its own Place these bets plus the extras offered there. The header's "N pass" counts every approved row; "N in the tabs ▸"
  (`passWhere`, `passWhereHtml`) lists where each approved row is, under the first reason it is not in a tab, so the lines add up (v4.76).
- Extras are real bets in the money views, and are kept out of the Scorecard.

## Code
`MODES`, `EXTRAS`, `extrasAssign` (`xc`, `xFit`, `tier`, `xCap`), `modeFamOf`, `passFam`, `rowBand`, `renderCore` (`famIs`, `mN`, `passW`), `passWhere`,
`passWhereHtml`, `modeCountsPaint`, `modeEmptyText`, `extrasCardsHtml`, `extraLine`.

## Tests
`tests/tabs-v476-test.js`, `tests/pass-where-test.js`, `tests/modes-perfecta-test.js`, `tests/longshot-mode-test.js`, `tests/same-player-test.js`, `tests/floor-watch-test.js`.

## Supersedes
v4.51 to v4.75: three modes (🛡️ Safe the best bets, 🍀 Feeling Lucky the Just missed, 🔮 Clairvoyant the Hail Marys). v4.50: modes stacked
(Feeling Lucky = Safe + Just missed). v2.65 to v4.49: modes raised Kelly, the game cap and the daily max.
- v4.74 (owner: "Safe are leans and such ... Have them only where they belong"): an approved bet under 45% (La Contadora's chance) is listed under 🔮 Clairvoyant as "edge · long shot", not 🛡️ Safe. Stake and math unchanged.
- v4.76 (owner's cover-band list: "WE are going to add all those, inside those 5 Tabs"): the five tabs above replace Safe / Feeling Lucky / Clairvoyant.
