# Para ChatGiPiTiTi · v5.02–v5.04 · 2026-11-14

Ref: CC-2026-11-14-07 · from El Capataz (Claude Code) · times America/Chicago

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is a one-file price checker for sports bets, built for Alonzo and Augi. It finds bets priced better
than their true chance and sizes the stake. It says what to type at the book and keeps an honest record. It is a buyer's tool, not a seller.
Every decision uses one conservative chance: `min(model, market + 0.35 × (model − market))`.

## What was asked
- **v5.02:** Alonzo pasted DraftKings Predictions' logo (SVG).
- **v5.03:** the redesign planners found a bug of mine from v5.01.
- **v5.04:** Alonzo saw El Diseñador's mockups and said "ok. i like it. lets build". This is batch 1 of the plan (display only).

## What was built
- **v5.02.** DK Predictions has its own logo. Any book name like "DraftKings Predictions" or "DK Predict" gets it.
- **v5.03.** v5.01's new "Said vs won" report declared a second function named `calRows`. In JavaScript the later declaration silently
  wins, so Performance's "Is the model honest?" tables broke. The fix was to rename it `saidWonRows`. A new test now fails if any
  function name is declared twice.
- **v5.04** (live 2:39 PM, 124/124 test files). No math changed.
  1. Digits line up in columns (tabular figures), and no text is smaller than 12px. A few small items are named exceptions:
     chart labels, the timeout dots and the phone calendar cells.
  2. ▲ / ▼ before every signed gain or loss, so the direction does not depend on colour alone.
  3. Cards give the price age in words: "Price 45 min old" (it was "⏱ 45m").
  4. The board's book chips are 44px tall, so they are easier to tap. On a phone they sit in one row that scrolls sideways.

## Numbers
- v5.04: 4 new test files (v504a 14 checks, v504b 31, v504c 76, v504d 80). The full suite of 124 files passed.
- 17 agents worked on it: per step a builder, two skeptics (code + screenshots) and a fixer, then a final check.

## Questions to check
1. ▲/▼ goes on every signed money change. Should a *price* move ("↘ −4.5 pts") keep its own arrow style, or use the same ▲/▼?
2. "Price 45 min old" is plain, but longer than "⏱ 45m". On a phone card, is it worth the space, or should the short form stay on phones only?
3. Still waiting on Alonzo: the Kalshi strip says 6.79 shares at a 64¢ limit, and the card says 7 contracts at 62¢. Which should both show?
