# Las Karens: second review, v5.13 on the practice copy (2026-11-15)

Ref: CC-2026-11-15-11 · Written by Claude Code, Sun 2026-11-15, America/Chicago. No keys or passwords in it.

**Setup.** The testers ran the real v5.13 page with a realistic fake board (35 rows), bet log (16 bets) and scores, so they did not need the passphrase. Load cannot fetch here, and the data is fixed.
**Result.** No page errors anywhere, at any width.
**The Pro's math checks all matched the app:**
- the no-vig market, the conservative chance (`min(model, market + 0.35 × gap)`) and the EV;
- the "OK up to" price, Kelly 0.125 and the stake caps;
- the Kalshi fee, the share cost and the EV after the fee;
- the Reports and Scorecard totals.

## Stars (practice copy)
- **Pro:** Reports 5, Performance 5. Board 3 and Parlay tab 2, for the labels, not the math.
- **Know-it-all:** most pages 4. Paste 2, and the phone Bet log 3.
- **Newcomer:** Parole 1, and most pages 3, for jargon.
- **Phone:** Parole 1 (wider than the screen), Parlay 2 (very long), the rest 3.

## Complaints, worst first ("Pro" = the Pro agrees, so it goes on top)
1. **(know-it-all, Pro; a real bug)** + Add a bet's "Today $X of daily max" still leaves parlay entries out ($38 there vs $43 everywhere else). v5.13 fixed the Bet log strip but not this second meter.
2. **(Pro)** On the card, "FAIR" is the model's number, while the no-vig market is a separate "MARKET" number and the conservative chance is a third. The label should say "Model".
3. **(Pro)** Exchange chips and strips do not show the price paid after the fee:
   - "Also at" marks Kalshi OK and Polymarket over with no all-in price shown.
   - A Polymarket card shows a $6.34 stake but "Cost ≤ $6.21".
   - Kalshi shows "11.43 shares".
4. **(Pro)** The Parlay tab's headline "+191.3% expected return if every line matches", in big green, multiplies the model's chances as if the picks were independent. It reads as hype. Plain alternative: "needs 56.2% a pick; yours average 73.6%".
5. **(Pro; owner decides)** The "Daily bet goal 20" with its "4 / 20" bars, and the "#1 math pick … Show it ›" banner, push volume.
6. **(phone; a real layout bug)** Parole is 551 px wide on a 390 px phone, so the whole page scrolls sideways.
7. **(know-it-all, Pro)** The Paste Sample contradicts itself: "2 pass every screen" while the list says "Every bet failed a screen". This may be partly the practice copy's fixed date.
8. **(Pro)** Labels can outrank warnings: a model outlier with a $1 stake shows score 96, and a 47% coin flip is "STRONG". These are labels only, but the trust warning should come first.
9. **(Pro)** Reports' "Is the model honest?" says "Nothing graded yet" while Calibration on the same page counts 12 graded bets.
10. **(Pro)** Boring's card says "not 50 to 75%" while Settings defines Boring as 75%+.
11. **(know-it-all, Pro)** The Settings Novig fee line is garbled; the v5.13 wording needs another pass.
12. **(know-it-all, Pro)** The Parlay tab's "no stake: one of your caps is reached" does not say which cap.
13. **(know-it-all)** Small items:
    - Free entry with Entry $0 is refused. By design a free entry is typed at its face value, but the hint should say so.
    - A parlay marked Won before its games start counts at once.
    - A card says "wins $4.34" where $4.348 should round to $4.35.
    - The game picker defaults to a finished game.
    - The header shows "build 22 Sep 2026".
14. **(phone)** Phone layout:
    - The bottom bar clips "Refresh (API)" and the sources row.
    - Many tap targets are under 40 px.
    - "Placed at" is clipped.
    - The Parlay page is 16,758 px tall with no jump links.
    - The More ▾ menu covers the mode chips and has no ×.
15. **(newcomer only; the end-game users)** Jargon everywhere:
    - Parole: Maker, Taker, bait, Jail.
    - Cards: Hold, Perfecta, Sentinels.
    - Mode names.
    - "I bet this" reads as logging a bet, not as "what to type at the book".
    - Reports' statistics wording.

## Practice-copy artifacts (not app problems)
- Load, Send the Sentinels and Moneylines cannot fetch.
- Every logged bet shows the same "4.0% / model 5.0%".
- The logos are grey.
- There is no CLV, because there are no closing prices.
