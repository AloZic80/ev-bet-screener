---
name: betting-math
description: Use when changing EV, fees, the blend, the conservative chance, Kelly sizing, caps, OK up to, the Sentinel score or signal, the ◎ checks, the 🎟 tag, parlay math or profit.
---

# Betting math: how to change it safely

## Before editing
1. Read `memory/decisions/actionable-ev.md` and the decision file for what you are touching (`modes.md`, `perfecta-and-parlay-leg.md`, `signal.md`, `exposure.md`).
2. Read `docs/EV-CALCULATOR.md`: it is the written policy. Code and doc must say the same thing when you finish.
3. A change that moves a stake, a floor, a threshold or a fee needs the owner's go in his own words. Quote it in the PR.

## Rules that must hold
- `actProb = min(model, market + mWeight × (model − market))` and `actNet` (the EV at it): **every** actionable number uses them: the floor, OK up to, the stake, the Math order, the score's Edge, the EV shown, sweet spot, ring, leg, extras. Size only through `actNetOf` and `kellyFor`. The model's `net` is Model EV: a diagnostic.
- After any change, `node tests/invariants-test.js` must pass: a staked bet clears the floor on `actNet`, costs no more than OK up to, and still does after Kalshi's fee rounding.
- A label (ring, leg, band, signal, score) never changes a decision or a stake.
- A mode never changes the math.
- The six ◎ checks are frozen. Never retune a threshold on the bets used to judge it.
- Only settled bets win or lose. Free bets count winnings only. Extras stay out of the Scorecard.
- Old logged bets keep their snapshot (`snap`); never rewrite what was recorded at bet time.
- Never claim an edge from a small sample: show the stage (bets and games) next to any comparison.

## How to work
1. Write the failing check first, with the arithmetic done by hand in the test (independent of the page's own functions).
2. Make the change. Keep the file's style: one-line records, a `// vX.YY:` note on changed lines, `/* */` for a comment in the middle of a line.
3. Run the one test, then `node tests/math-audit-test.js`, then the full suite.
4. Update the decision file (rule, formula, version, tests, what it supersedes) and `docs/EV-CALCULATOR.md`.

## Mistakes already made
- "OK up to" on the model while the stake used the blend (v4.41).
- The floor on the model while the stake used the blend: bets that passed with a $0 stake (v4.43).
- The stake and the order on the blend while the floor used the min: higher stakes when the model was below the market (fixed v4.53).
- Kalshi's floor re-check after fee rounding on the model's EV only (fixed v4.53).
- A random generator that repeated after 10,000 draws (v4.52): use mulberry32.
- Counting the same evidence twice in the score: a signal overlaps Market and Fresh, so it is capped at +5 / +2.
