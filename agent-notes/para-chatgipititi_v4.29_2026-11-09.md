# Para ChatGiPiTiTi — 0xBeta Screener v4.29 (2026-11-09)

Ref: CC-2026-11-09-02 · Written by Claude Code, Mon 2026-11-09, America/Chicago
For ChatGPT, pasted by Alonzo. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV) by comparing a book's price with a fair price (Pinnacle with the vig removed, or the consensus), sizes each stake with quarter Kelly on a halved edge, and keeps an honest record. Bets that pass every rule ("La Contadora") show as cards under Place these.

## What Alonzo asked
Augi (a friend building a similar screener, "Odds Board") has a cleaner GUI. Alonzo: "I like his GUI, it is cleaner. Mine just has lots of info ... Can we integrate his with ours?" Then: "we can change it to my liking, but in his style, and our settings and math" and "his 5 tabs".

## What was built (v4.29)
- **His look on our app.** His greens and greys (page #F2F8F4, accent #087B44; dark mode #0C1510 / #6EE3A4), the phone's own font instead of Poppins and Oswald, white rounded panels, small uppercase titles, 44-pixel touch targets on a phone. Light and dark, phone and Mac.
- **His five tabs:** Board, Live Games, Parlay, Bet log, Settings. Our other six screens sit in a small row under their tab: under Board, Leagues, Parole and Moneylines; under Bet log, + Add a bet and Performance. The main tab stays lit while you are in its row.
- **Unchanged:** all the math (La Contadora, Kelly, the hard stop, the #1 math pick), settings, the bet log, sync, grading and every data source. Only paint and layout moved.
- Checked: every test passed (57 files); colour contrast passes in light and dark except one old note (amber stars on pink rows, 3.2:1, decoration next to the rating number).

## Also today
Alonzo's assistant reviewed Augi's code and found bugs worth fixing on his side: NHL shots on goal graded from ESPN's always-zero SOG column (should read S), placed bets blocked from the log after 20 minutes, daily caps counting singles only, duplicate detection by exact text, soccer draws graded as a push.

## Question for ChatGPT
For a betting screener used mostly on a phone, is a 5-tab bottom bar with a second row of sub-tabs under two of them easy enough to learn, or would you put Add a bet as its own main tab?
