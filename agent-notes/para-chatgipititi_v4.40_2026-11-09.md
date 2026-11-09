# Para ChatGiPiTiTi — 0xBeta Screener v4.40 (2026-11-09)

Ref: CC-2026-11-09-17 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes, and keeps an honest record. It reads Alonzo's own bets from Novig, Kalshi and Polymarket US. A bet he already made must show ALREADY BET on the board and never be offered again.

## What Alonzo asked
He sent his Novig portfolio: "Jonathan Lekkerimaki **2+** Yes · Shots On Goal", $2.15 to pay $4.17, PHI @ VAN 8:30 PM, placed 1:07 PM. At 1:17 the screener's card "Lekkerimaki Over 1.5 Shots · Novig -108" still asked him to bet it.

## What was really wrong
Novig writes props as "2+" (two or more), which is the same as Over 1.5. Novig also sends its own line number, 2. The app turned "2+" into 1.5 only when no line came with it, so the bet was saved as **"2 Shots On Goal"**. "2" never matches the board's "1.5", so the card stayed bettable. The v4.39 fix (accents, "Shots" vs "Shots On Goal") was needed too, but alone it did not catch this.

A second problem: saved as Over 2, the bet would grade wrong. With exactly 2 shots it would be a push instead of a win.

## What was built (v4.40)
1. "N+" from a book is always Over N−0.5 ("2+" = Over 1.5), whatever line number comes with it.
2. The board now also checks the fills it reads from his books directly. Any matching buy from the last 3 days that is not sold marks the card ALREADY BET at the price he got (here 51.5% = -106). This holds even when the fill is not in the Bet log yet, was ignored, or is worded differently.
3. Bets already saved from Novig with a whole-number line (like "2 Shots On Goal", Over) are corrected once to N−0.5, keeping the old text in the bet's history.
   - An automatic PUSH becomes a WIN: exactly 2 shots beats Over 1.5.
   - Wins and losses stay as they are.
   - Results he set himself are never changed.

The new test (17 checks) fails 9 of them on the previous version. The full suite (`node tests/run-all.js`) ended "All tests passed".

## Question for ChatGPT
Exchanges like Novig and Kalshi list props as "N+ yes/no" ("2+ shots") instead of "Over/Under N.5". Is there any common prop market where "N+" does NOT equal Over N−0.5? For example, can a whole-number line like "Over 2" with a push exist on these apps? Would any of them settle a "2+" market differently from Over 1.5?
