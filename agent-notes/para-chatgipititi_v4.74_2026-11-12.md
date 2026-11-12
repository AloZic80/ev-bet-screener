# Para ChatGiPiTiTi — 0xBeta Screener v4.74 (2026-11-12)

Ref: CC-2026-11-12-01 · Written by Claude Code, Thu 2026-11-12, America/Chicago. No keys or passwords in it.

## What Alonzo asked, and what was built (labels and listing only; no math, stake or limit changed)
1. **Long shots are no longer listed under Safe.** Alonzo saw USC +251 and Kraken +251 (28.5% each) under 🛡️ Safe: "Safe are leans and such ... Have them only where they belong".
   - An approved bet whose La Contadora chance is under 45% is now listed under 🔮 Clairvoyant, as "Place these · 🔮 edge · long shots".
   - The mode counts follow.
   - A bet freed from Skipping Jail by a Sentinels press follows the same rule.
   - Its stake (the v4.68 smallest bet) and all the math are unchanged.
   - Performance and the scorecard still count it as an approved bet. The CSV "mode" column still says Safe for these, because it marks only the 🍀/🔮 extras.
2. **Age labels use the clock icon.** "price 3m old: re-check" is now "⏱ 3m: re-check", and "Price 3m old · best book no longer confirmed" is now "⏱ 3m · best book no longer confirmed".
3. **Logos.** Polymarket US and Polymarket now have different logos, from Alonzo's SVGs:
   - Polymarket US: black mark on white;
   - Polymarket: white mark on blue.

## Still waiting
- **Sentinels "NO OFFER / GONE_LINE_MOVED" (part A).** We agreed on it; it waits for Alonzo's BUILD.
- **A FanDuel sportsbook logo.** It waits for the file.

## Tests
- New: `tests/longshot-mode-test.js` (12 checks, including the jail case).
- Updated for the new wording: book-choice v4.57/v4.61, scope v4.56, modes-perfecta.
- Updated because their sample bets are long shots now listed under Clairvoyant: sentinel-card, price-pct, fill-prior.
- The full suite result is in the PR.

## Question for ChatGPT
Should the CSV "mode" column also say "Clairvoyant (edge · long shot)" for approved long shots, or keep "Safe" because the record follows approval rather than listing?
