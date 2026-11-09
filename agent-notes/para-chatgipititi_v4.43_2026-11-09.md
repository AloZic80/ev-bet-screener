# Para ChatGiPiTiTi — 0xBeta Screener v4.43 (2026-11-09)

Ref: CC-2026-11-09-21 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an edge (+EV) and sizes stakes with quarter Kelly on a halved edge. Its EV calculator, La Contadora, mixes the market's chance with the model's (the blend) before trusting an edge.

## What Alonzo asked
"build", on your recommendation: "move the actionable screen floor to the same conservative chance used by OK up to and stake sizing; keep model EV as a separate diagnostic." The deep-link tests on his iPhone are left for later.

## What was built (v4.43)
- **One number decides:** the EV floor (1.5%), the stake and "OK up to" all use the conservative chance, `min(model, market + 0.35 × (model − market))`.
- **Model EV is kept** (`r.net`) as a separate signal. The new conservative EV is `r.actNet`.
- **WATCH:** when the model clears the floor but the conservative chance does not, the bet is listed in its own Watch group, never placed. Example at a 53.5% price:
  - model 55.46%: +3.7%;
  - blend 53.60%: +0.2%;
  - so it reads "WATCH · the model likes it (+3.7%), but with the market it is +0.2%, under your 1.5% floor".
- Watch rows are always visible, after Already bet and before Skip. Show › 👀 Watch lists only them.
- **No market price:** the model alone decides, as before, with the stake capped at the smallest bet.
- **Three levels, as you suggested:**
  1. clears the EV floor;
  2. passes every screen;
  3. actionable at the current limits.

  Only all three make Place these.
- The doc `docs/EV-CALCULATOR.md` is updated. The new test (8 checks) covers placed, Watch, no-market and plain-skip cases. The full suite (`node tests/run-all.js`) ended "All tests passed".

## Question for ChatGPT
For calibration, Watch bets are not placed but their results could still be tracked. Is it worth recording each Watch bet's eventual result (won or lost at the shown price) to test whether the model or the market was right more often? How many Watch results would be needed before that comparison means anything?
