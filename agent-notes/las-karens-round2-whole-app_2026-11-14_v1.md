# Las Karens, round 2: the whole app (v4.99)
Ref: CC-2026-11-14-01 · Sat 11/14, about 8:20 AM CT · from El Capataz (Claude Code)

Four customer agents used every page of v4.99 (phone and computer, light and dark, stubbed data). They changed nothing.
The Pro marked every complaint AGREE or NEWCOMER ONLY. [N] newcomer · [P] phone · [K] know-it-all · [Pro].

## Stars per page (average of the four, worst first)
| Page | ★ avg | N | P | K | Pro | In one line |
|---|---|---|---|---|---|---|
| Sentinels result | 1.0 | 1 | – | – | – | "BET NOW" and "STALE" on the same card |
| Parole | 2.0 | 1 | 3 | 1 | 3 | the same bet listed twice; jargon (Jail, bait) |
| Parlay | 2.25 | 2 | 2 | 3 | 2 | "you bet this" from other days; "no stake left (caps)" with money left |
| + Add a bet | 2.25 | 3 | 2 | 2 | 2 | opens mid-form; NFL default; daily max differs from the Bet log |
| Moneylines | 2.5 | 2 | 3 | 3 | 2 | ignores your books and floor; no stake; count says 4, shows 3 |
| Paste a board | 2.5 | 1 | 3 | 3 | 3 | hard to find; "Cmd+A" on a phone |
| API row / BettingPros | 2.5 | 2 | 2 | 3 | 3 | MLB on an NBA board; cut off on a phone |
| Board | 2.75 | 2 | 3 | 3 | 3 | opens on "96 OUTLIER · not trusted" $1 cards |
| TODAY ▾ | 2.75 | 3 | 3 | 2 | 3 | the line says "$0.50 in play" when nothing is |
| Leagues | 2.75 | 1 | 3 | 3 | 4 | says "no games" when it could not load |
| Filters, Scores, Bet log, band tap, Settings | 3.25 | | | | | work; small fixes |
| Live Games, Performance | 3.5 | | | | | honest; small fixes |
| More ▾, Reports | 4.0 | | | | | the best pages |

## A. Real bugs (the Pro agrees) — no math, I fix them
1. TODAY line copies "worst $0.50" as "$0.50 in play". [K, Pro]
2. v4.99 band tap counts a parlay's whole result under every band of its legs (a 2-bet day showed 4 bets). [K, Pro] — mine
3. Parlay tab: "✓ you bet this" from settled bets on other days; "no stake left today (caps)" with money left; Sentinels pair uses a 15-hour-old price. [Pro, P]
4. Daily max: Bet log $12.50 vs + Add a bet $10.50 (one counts the parlay). [K, Pro]
5. Parole lists the same bet twice; "jailed: ×11" is a row count. [K, Pro]
6. Moneylines: "4 lines" shows 3; a "Bet" link on a game the board says is at its cap. [K, Pro]
7. Sentinels card: "BET NOW" next to "STALE · no price could be read" (v4.93 says a stale card is never actionable). [N, Pro]
8. Two "#1 MATH PICK" cards at once; the ⭐ banner stays on the tab it points to, with a stray ": NAME". [Pro, P, N]
9. Counts: book chips count rows not cards; "3 already bet" counts book rows; day header "3 bets" over 2 listed. [K, Pro, N]
10. Calendar and Reports band counts differ for the same day. [K, Pro]
11. Leagues and Scores say "no games" when the source did not answer. [N, Pro]

## B. Phone (the Pro agrees)
12. 22 fields still 13–14 px (iPhone zooms), incl. the bet form's Book and "Enter as" menus and 7 on + Add a bet. [P] — my v4.97 fix was partial
13. Cancel under the bottom bar at 390×664. [P] — v4.97 partial
14. Tabs open mid-page (where the last page was scrolled); + Add a bet opens mid-form. [P]
15. API row 786 px wide on a 390 px screen; BettingPros chip says MLB in November. [P, K, N, Pro]
16. Tap targets under 44 px (band buttons 20, CSV 21, tick boxes 24, chips 27, row buttons 29). [P]
17. The "also at" pop-up stays over the form and the Saved note. [P]

## C. Needs Sally or your own words (rules, not looks)
- "Outlier" blames the model when the book price is odd; the default tab opens on those cards. (Sally Q1)
- "OK ✓" on also-at vs SKIP in the table; far-off also-at price. (Sally Q2)
- Moneylines page using your books and your 1.5% floor, and getting a stake / I bet this (it is a second moneyline tool beside the board).
- TODAY best/worst: best counts unstarted bets as wins, worst leaves them out (your v4.07 rule). Same basis for both?
- $10 max bet on a $25,000 bankroll never says "capped". (your words needed)

## D. Newcomer only (the Pro shrugged; matters for selling)
- Jargon everywhere, no glossary or "?" (Parole, Moneylines, Reports, Settings, tab names).
- Paste a board hard to reach; three results pages overlap (Bet log calendar, Performance, Reports).
- "won 100% vs 57% expected" on 2 bets reads like proof; calendar day tap looks dead; pages slide.

## What they liked
- The core math checks out everywhere (chance, EV, odds↔%); all money totals agree to the cent across calendar, Reports, Performance, Filters.
- The board's moneyline card (best book, what to type, OK-to, also-at); "✓ Saved"; "wins / back"; the band tap.
- Reports' closing-line block, the 1,000-bet Scorecard, Live edges that don't dress up small edges; More ▾ and the bottom tabs.
