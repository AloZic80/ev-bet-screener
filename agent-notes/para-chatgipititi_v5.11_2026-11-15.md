# Para ChatGiPiTiTi (Sally): 0xBeta Screener v5.11 (2026-11-15)

Ref: CC-2026-11-15-09 · Written by Claude Code, Sun 2026-11-15, America/Chicago. No keys or passwords in it.

## What the app is
A one-file sports-betting screener for Alonzo (props.0xbeta.dev): it finds bets with an edge, sizes the stake and keeps an honest bet log.

## What was asked
1. "Add a Bet needs to allow me to do Parlay. I did a PrizePick parlay and won, and i want to add it."
2. "You found bugs but left alone ? Why not address them?" Then: "Fix all 8".
3. "save tokens with what we are doing" and "LETS CHOOSE SONNET instead of Haiku": helper agents now run on Sonnet, Opus only for money and the final review.

## What was built (v5.11)
- **Parlays in + Add a bet.** A new Type, "Parlay / pick'em (2+ picks)", with these fields:
  - App, Power or Flex, Picks, Entry $ (Free entry), Pays if all hit $, To win $, Game day, Legs, Result and Paid $.
  - Save writes the same record as the Bet log's parlay panel.
  - Parlays stay out of the Scorecard and the stake sizes, but their entry counts toward the daily max.
- **Money fixes (3):**
  - **Kalshi and Polymarket US wins.** They now count the fee saved with the bet. Before, a fill that was never edited counted its win as if no fee was paid. On Alonzo's backup: 4 wins, $0.60 less profit in all.
  - **Hand-corrected fills.** A stake, price, To win or fee he corrects by hand on a book fill now stays. A later re-read of the fills no longer puts the old number back. It only says so when the order grew. A Save with nothing changed marks nothing.
  - **Parlay keys.** Every new parlay gets its own key, so two with the same name on the same day stay two bets (in a sync, and in Reports). Old parlays are not rewritten.
- **Screen fixes (5):**
  - The Bet log fits a 900 px window.
  - Bet log › edit stays on screen on a phone.
  - + Add a bet's boxes are the same width as in the other forms.
  - In dark mode, the chosen Reports period button is readable (5.3 to 7.6:1 contrast).
  - Kalshi says "OK to 64.9% (64¢ limit)", so the two numbers read as one order.
- **Two earlier fixes:**
  - A "check" banner no longer shows when it is empty.
  - An "also at" price with no link no longer opens the card's own book.

## Numbers
- New tests: bugfix-money-test (37 checks) and bugfix-layout-test (33). Both fail on the old file and pass on the new one.
- Also: v511-test (75), v511-followups-test (5) and also-at-nolink-test (5).
- Full suite: see the PR.

## A question to check
Free bets and parlay entries count toward the daily max (the Hard stop) today. Should a FREE entry count, since no money of his is at risk? This needs Alonzo's own words (it is a cap).
