# Modes: Safe, Feeling Lucky, Clairvoyant

Status: active · Introduced: v4.50, made exclusive in v4.51 · Approved by: Alonzo · Last verified: 2026-11-10

## Rule
- A mode never changes the math (stakes, daily max, what passes). It only changes the list.
- Each row is listed in exactly one mode (`modeFamOf`):
  1. a bet you hold: by `prior.tier`, anything else Safe;
  2. an order waiting or a moved line: Safe;
  3. a candidate: its own mode (`r.xc`);
  4. passes every screen: Safe;
  5. of the rest: long shots Clairvoyant, Watch rows Feeling Lucky, other rejects Safe.
- Just missed (`xc:'lucky'`): a Watch row with `actNet` ≥ 0 and no other reject. Smallest bet, 5 a game day.
- Hail Mary (`xc:'hail'`): +300 or longer, or a scorer long shot from +200. $1, 3 a game day. Clairvoyant goes back to Safe at midnight.
- A best bet that your daily max or game cap left with no stake stays Safe's.
- Extras are real bets in the money views, and are kept out of the Scorecard.

## Code
`MODES`, `EXTRAS`, `extrasAssign` (`xc`, `xFit`, `tier`, `xCap`), `modeFamOf`, `renderCore` (`famIs`, `mN`), `modeCountsPaint`, `modeEmptyText`, `extrasCardsHtml`.

## Tests
`tests/modes-perfecta-test.js`, `tests/same-player-test.js`, `tests/floor-watch-test.js`.

## Supersedes
v4.50: modes stacked (Feeling Lucky = Safe + Just missed). v2.65 to v4.49: modes raised Kelly, the game cap and the daily max.
