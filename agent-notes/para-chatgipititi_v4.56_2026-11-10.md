# Para ChatGiPiTiTi — 0xBeta Screener v4.56 (2026-11-10)

Ref: CC-2026-11-10-13 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an estimated edge (+EV) and sizes stakes with quarter Kelly on a halved edge. La Contadora judges every bet on `actProb = min(model, market + 0.35 × (model − market))` and the EV it gives after fees, `actNet`.

## How this build was approved
The first build under Alonzo's new rule: you and I agreed the exact scope in writing, then Alonzo said "BUILD". Nothing outside that scope was built.

## What was built (the agreed scope)

### Pick'em
- **Unchecked lines.** An entry with a pick whose line was not confirmed in the app is provisional:
  - the best one reads "PROVISIONAL BEST · check that the app has this exact line" instead of "Best for your bankroll";
  - its EV reads "expected return if every line matches", and the stake "(if every line matches)";
  - Log this entry asks once: the first press logs nothing and the button becomes "I checked: every line in the app matches"; the second press logs it.
- **Saved with the entry:** `lineVerifiedByUser`, when, how many lines were unchecked, the app, its payout table and `settle: "plain-win-loss-v1"`.
- **Settlement note** on every pick'em entry: "Ties, DNPs and cancelled players follow this app's rules, not sportsbook push rules. The EV shown assumes every pick settles as a plain win or loss; a reboot or a smaller entry can change the payout."
- **Model-only picks** are never in a recommended entry, a ready-made slip or the Sentinels' pick list. In the pick list they are marked "MODEL ONLY · no market check · excluded from recommended entries". Added by hand, the entry warns and is never called best.

### Book choice
- A best-book claim (a card the Sentinels moved to another book) holds **3 minutes**, **90 seconds** within 5 minutes of kickoff. After that it reads "Price 4m old · best book no longer confirmed · Send the Sentinels". No price is read again by itself.
- On a Sentinels press:
  - both books read: the 0.3-point margin applies;
  - the row's own exchange could not be read and another could: it moves without the margin, and saves why ("current book could not be read");
  - nothing could be read: no winner, "no price could be read · refresh prices".
- A bet taken from such a card saves where the best book came from, its age, whether it was stale, and the reason for any bypass.

### Model-only orders: measured only
A card in Settings › API credits & usage: "N open · M matched to a board row, of them K model-only · U unmatched · not counted against the model-only limit yet". It uses data already read; no Worker calls.

## Checked
- A new test, 17 checks, by hand; it fails on v4.55. One older test was updated for the confirmation step.
- The full suite result is in the PR.

## For later (agreed, not due yet)
After about 30 days, the order counter shows whether model-only orders happen. If they do, propose slot counting then.

## Question for ChatGPT
None new. If anything in this build differs from what we agreed, say so before the next scope.
