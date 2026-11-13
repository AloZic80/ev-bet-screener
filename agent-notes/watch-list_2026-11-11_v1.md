# 👀 Watch list: 0xBeta Screener, live beta

Ref: CC-2026-11-11-08 · updated Thu 2026-11-12, about 10 AM, America/Chicago · Live: **v4.86** · Worker **v3.44**

Alonzo: "we will say OK Lets put IT LIVE, but, we still need to be on top of it."
**Live beta** means: live and usable, still a work in progress. Every change still goes through El Juez (all tests green) before it goes live. This page lists what is open; it is updated with every build.

## ⏳ Waiting on El Jefe (a word from you)
- [x] **🍀 Near-misses: A, B or C?** A ("what you seems better"), live since v4.80.
  - A: hide them, only YES bets on the board;
  - B: list them in their own band's tab, as "🍀 Just missed · NO";
  - C: leave them as they are.
- [x] **Worker v3.43:** merged and deployed ("Yes all across"). It finds Kalshi games by team names when the codes don't match (the Oklahoma State case). PR: AloZic80/prop-bet-api#6.
- [ ] **Javiera's names** for the crew. Code word: "Frijolito".

## 🤖 Waiting on ChatGiPiTiTi (tomorrow)
- [ ] Should ⏱ Old prices also stop counting toward the **daily max** until re-checked? This is a stake rule, so nothing is built until you both agree.
- [ ] Is **12 hours** the right line for ⏱ Old?
- [ ] Should the **cover chip** follow La Contadora's chance, like the tabs do?
- [ ] Should Live Games **save** the game it finds for a bet that came without one?
- [ ] The CSV "mode" column, swap cards with NO OFFER, and Part B (the Worker's completeness flag). These are older questions.

## ✅ The v4.78 polish build (live 10:47 PM): the items below are fixed, except the cover chip (Sally's question)
The full review (Los Chismosos, each finding challenged by Los Desconfiados) is in: **21 confirmed, 3 refuted**. Most were fixed in v4.77. Still open, all labels, listing or Live Games (no stake, no grade):
- [ ] **⏱ Old, unknown read time:** a price whose read time is "unknown" (some cached answers) never reaches ⏱ Old. Fix: count it from the board load time.
- [ ] **⏱ Old, page left open:** a card that turns 12 hours old waits for the next redraw to move. Fix: the 30-second check also moves it.
- [ ] **"No more today":** when the day's 5 near-misses (or 3 Hail Marys) are used and an approved Coin Flip (or long shot) is on the board, the header says "none just missed" instead of "No more today".
- [ ] **Live Games:** a game found by the player is never re-checked. Fix: check it again on each pass, and let it go if a second game lists the same name before the final.
- [ ] **The Game Hub cards** ("N bets risking $X"), "Your bets in this game" and the scores strip still find a bet's game by team codes only. A Novig player bet found by its player is missing there.
- [ ] **On a pasted sportsbook board**, ⏱ Old says "press the Sentinels or reload", but only pasting the board again refreshes those prices. Each card's ⏱ tooltip already says so.
- [ ] Wording: Suertudo's La Contadora line ("A few that just missed") and its empty-tab text still describe only the near-misses, not the Coin Flips.
- [ ] (For ChatGiPiTiTi, above) the cover chip shows the model's chance while the tab and header use La Contadora's.

## ✅ v4.79 (live): what to type on Polymarket US + the v4.78 review
- [x] **Polymarket US strip** (the Aho bet, "High slippage"): Limit, not Market · YES / NO · limit = La Contadora's most · whole shares · Cost ≤.
- [x] The v4.78 review: 5 confirmed (Los Chismosos found, Los Desconfiados could not refute), all fixed:
  - ⏱ Old with an editor open: the redraw was asked for every 30 s; now once.
  - "No more today" when only the long-shot moneyline allowance held a Hail Mary back (none used).
  - The ⏱ Old La Contadora line said YES above the 🍀 / 🔮 cards.
  - Live Games re-downloaded final box scores every minute (about 0.4 GB a night on a phone).
  - Live Games dropped the found game when ESPN did not answer once or twice.
- [x] Caught before publishing: Polymarket team bets (one market, two sides): the strip names the side (SEA +1.5); a Draw row gets no strip; "OK up to" rounds down.
- [x] (v4.80) **⏳ El Jefe: Kalshi too?** The Kalshi strip (since v4.09) says YES on an underdog spread; on Kalshi it is NO on "<favourite> wins by over". Draw rows name the home team on Kalshi as well. Same fix, next build, on your word.
- [x] (Worker v3.44) **Worker (needs your go):** the Sentinels price a soccer Draw row as the home team on Kalshi and Polymarket.
- [x] (v4.80) **Next build (text only, confirmed by Los Desconfiados):** when only the long-shot moneyline limit (3 a game day, one a game) holds a 🍀 / 🔮 candidate back, the header says "none right now". It should name that limit.
- [x] (v4.80: "Draw (tie)") **Draw rows, every book (since before v4.79):** the card's pick line says "<home> to win" for a soccer Draw. Same fix as the Kalshi one, on your word.
- [ ] **Unverified on Polymarket US** (a screenshot would settle it): does the Limit form ask for shares or dollars? Can shares be fractional? Are moneylines Yes / No or one button per team?
- [ ] For Sally: limit at La Contadora's most (47¢) or at the price shown (44¢)? Is the 6.95% × (1 − price) fee right for Polymarket US?

## ✅ v4.80 + v4.81 (live) and Worker v3.43 + v3.44 (live), on "Yes all across"
- [x] Near-misses option A (not offered; 👀 Watch keeps the record) · ◎ Perfectas across every tab · Kalshi underdog spreads are NO · Draw cards · 🔔 level 1 · 👻 AWOL tab.
- [x] Worker v3.43 (Kalshi games by team names) and v3.44 (a Draw is not read) merged and deployed.

## ✅ v4.82 (live): an AWOL card never says BET NOW or #1 MATH PICK
- [x] The ring on a 👻 AWOL card reads "◎ PERFECTA · 👻 AWOL · look at the book first" (the six checks are unchanged); #1 MATH PICK skips AWOL cards.
- [ ] For Sally (and you): should #1 MATH PICK skip ⏱ Old cards too? An old price can still be the tab's #1 there.

## ✅ v4.83 (live), agreed with Sally, on "BUILD"
- [x] 🔔 waits for a 🦑 press to finish · the open banner drops cards no longer Perfectas you can see · a quiet baseline after a filter change.
- [x] 👻 AWOL and ⏱ Old cards are $0 and hold no daily max ("if found / if refreshed: up to $X") · #1 MATH PICK skips ⏱ Old · a tap's NO OFFER / GONE is $0 at once.
- [x] v4.84 (live): the synthetic-hold tag, a label only (agreed with Sally, "BUILD").
- [x] v4.85 (live): the hold tag wraps inside its column (it ran over the game time).
- [x] v4.86 (live): each new bet keeps its tab, selection, classification and availability; CSV columns; the "Own / unverified" Scorecard line.
- [ ] For Sally: a longer freshness limit for sportsbook-only holds?
- [ ] Reported: a closed-market AWOL card has no "if found: up to $X"; a quiet baseline can ring once after a reload.

## ⏳ Open (reported by the reviewers, not changed)
- [ ] **🔔 + filters:** the banner can announce a Perfecta your book chips or filters hide. Should the alert follow your filters? (your call)
- [ ] Draw bets: Live Games treats a Draw as the home team; ALREADY BET matching mixes Draws with the home team's moneyline; a Draw's label and logo in the Bet log; `pxKey` shared by Draws (all older).
- [ ] Sportsbook "OK up to" on the card rounds to the nearest odds (can be a hair over her most). Kalshi / Polymarket round down.
- [ ] 🔔 polish: the scroll after "Show them", the other board's first alert, an alert before the weather loads, keyboard order.
- [ ] For Sally: should AWOL and ⏱ Old stop counting toward the daily max until a check finds them?

## 🔍 Still open after v4.79
- [ ] Grading, before v4.76: a prop with no teams is graded from the first finished game that lists the player, with no check for a second game with the same name. Live Games now refuses to guess. Question 8 for Sally.

## 🗓️ Planned
- [ ] **Weekend:** the live crew progress page (original animated crew, a progress bar per job).

## ✅ Done tonight
- v4.76: five tabs by chance; YES/NO said outright; Live Games finds Novig bets by the player; a grading bug fixed (mid-game box score); "N in the tabs".
- v4.77: ⏱ Old tab; the big number = bets you can place now; review fixes (Suertudo count, empty Machín, same-name players, NFL late listing).
- v4.78: the review's leftovers (⏱ Old unknown time and page left open, "No more today", Live Games re-checks, Game Hub counts).
