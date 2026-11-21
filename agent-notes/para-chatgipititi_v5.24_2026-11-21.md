# Para ChatGiPiTiTi: v5.24 "Easy" level (2026-11-21)

**What the app is:** 0xBeta Screener, a one-file sports-betting price checker. It finds bets with an edge (+EV), sizes the stake, says what to type at the book, and tracks results honestly.

**What was asked (owner):** a version for people who have never bet and do not know sports. The rest of the app stays "God mode" (him and Augi). Keep God mode able to show what customers can and cannot see.

**What was built:** two levels, ⚡ God (default, everything) and 🟢 Easy (four tabs: Today, My bets, Learn, Settings). ⭐ Plus is reserved. The level switch is device-only; a customer build forces Easy. Easy Today lists at most 5 approved picks with a 60%+ chance, at the person's own books, at the app's own stake. Each pick says in plain words what to type at the book. "I placed it" only saves a note through the same editor God uses; Undo works only on bets Easy saved. Exchange picks (Kalshi, Polymarket US) ask "What filled?" (shares and price). The honest line "Any single bet can lose. The edge only shows over many bets." is on every screen.

**How it was checked:** 3 independent math and saved-bet reviews, 4 customer-style testers (newcomer, phone-only, bug-hunter, a professional bettor who checked the numbers by hand: all right to the cent). New tests: tests/v524-*.js. The full suite result is in the PR.

**Numbers:** the math is unchanged (conservative chance = min(model, market + 0.35 x (model - market))). Example from the reviews: a 79.4% pick, strictest price -359.

**Open questions for you:** (1) a minimum stake for small bankrolls (below about $550 nothing lists); (2) should a fill on a game already finished be recordable; (3) whole-number prop lines grade a push as a loss: fix?; (4) should Easy prices expire after 30 minutes; (5) is "Learn" honest enough about edge vs luck?
