# Project report: v3.57 (your own bets, the Bet log by day with Look out, photos, every sport)

---
Ref:        CC-2026-11-03-06
Date/time:  2026-11-03 22:05 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         Project "Betting-for-Pros" (Alonzo, owner, and the Project's agent)
Subject:    What v3.57 changes, what was checked, the owner's questions answered, what is open
Version:    v1
Replies to: none (follows CC-2026-11-03-05)
Status:     for review
---

Pull request: https://github.com/AloZic80/ev-bet-screener/pull/4 (published when merged; GitHub Pages takes about a minute).

## 1. What changed
| Area | Before | Now |
|---|---|---|
| Your own bets | A typed game (no game time) showed no status; a bet added for a later game never got BettingPros' fair price | Status by the date you chose: plays / today / over, set the result / played. The bet picks up the board's fair price and EV once its row is on the board. A picked game says "over · result pending" once it is surely finished |
| Board bets (La Contadora's OK) | Odds or %, stake, To win, but no result | Same box, plus a **Result** box (Won / Lost / Push) when the game has started. Saves in one press, graded by you. Past 4 hours, a note says it will not grade itself |
| Bet log | Oldest first, one long list | Newest first, one row per game day that opens and closes (remembered on the device) |
| Bets that never got graded | Easy to miss | **Look out** list at the top of the Bet log, with Won / Lost / Push / Find it. Its count is on the Bet log tab and on the Today card |
| DraftKings vs DK Predictions vs DK Pick 6 vs FanDuel vs FD Predicts | Already separate (since v3.09 and v3.25) | Now tested end to end. FD Predicts bets also carry the PREDICTS tag in the log |
| Player photos | Only on "Place these" cards, FantasyPros only (no photo when that failed, or for soccer and others) | FantasyPros by player ID first. Otherwise ESPN's headshot, only on an exact name match on the game's two rosters |
| Data sources row | In Settings (v3.54 to v3.56) | Back on the main page, under the BettingPros bar. Settings keeps the passphrase |
| Sports | The Odds API: 17 leagues. Sportsbook API: dropped any league not in a list of 10 | The Odds API: 69 leagues grouped by sport, plus any key typed. A Draw makes a market 3-way in any sport. The Sportsbook API keeps every league. ESPN grading covers 36 more leagues |

## 2. Checked
- `node tests/run-all.js`: 13 test files, all pass. New ones:
  - own-bets: 19 checks
  - log: 23
  - books: 11
  - photos: 11
  - sources: 12
- Accessibility report: same as the live v3.56, nothing new:
  - the decorative ★ is at 3.19:1;
  - the Today card's whole-card click has no keyboard path of its own; the Bet log tab is the keyboard path.
- Width reports: no sideways scrolling from 1024px up, same as v3.56.
- **Not checked live.** This cloud session cannot reach api.0xbeta.dev or ESPN (its network policy).
  - The new league keys and ESPN paths are the published ones.
  - A wrong one only answers "unknown sport" for that league.
  - The owner's first soccer load is the live check (steps in section 4).

## 3. Every API, every sport (the owner asked: all sports, from every API, future-proof)
| Source | Sports the app asks it for (v3.57) | To get more |
|---|---|---|
| BettingPros (main board) | MLB, NFL, NCAAF, NBA, NHL, NCAAB, WNBA, MLS, SOCCER, plus any code that Settings → 🌎 Sports finds. Props and game lines (no soccer game lines yet). La Contadora skips college player props by rule | Its all-soccer load (SOCCER) cannot be matched to ESPN games yet, so those rows land in Skipped. Needs one sample: Sources → BettingPros → Test → 📋 Copy for Claude |
| The Odds API | 69 leagues by sport, plus **any key typed** (tennis tournaments, new leagues). Moneyline, spreads, totals; US books (+ exchanges, double cost) | Fully automatic list: a Worker route `src=oddsapi_sports` passing The Odds API `/v4/sports` through (free, no credits). The menu then always shows what is in season |
| Sportsbook API | Every league it sends (unknown ones under their own code). Game lines only | Nothing; it is already open-ended |
| SportsGameOdds | Free plan: NFL, NCAAF, NBA, NCAAB, NHL, MLB, MLS, Champions League. Props and game lines | EPL, La Liga and others are "unavailable at your tier" (their answer on 10/31) |
| OddsPapi | NFL game totals, Pinnacle no-vig vs Bovada. Its sport and league menu already comes from OddsPapi itself | — |
| Kalshi, Polymarket US, Novig | Your fills and settlements in any sport they settle; live prices for open bets | — |
| ESPN (free) | Game times, scores and grading for 53 leagues | A league without an ESPN path still loads and can be bet; its result comes from the owner via Look out |

**Stats and combos** (the owner's "Pts, assists, rebounds" point):
- The app matches stats by family. Combos are families of their own, in any word order: Pts+Reb+Ast, Pts+Reb, Pts+Ast, Reb+Ast.
- So one book's "Points" line never counts as another's "Pts + Rebs + Asts".
- Names are shortened on screen only; saved bets keep full names for grading.
- What each book offers changes by sport and week. Each source's **Test (1 call)** button shows exactly which books and markets it sent.

## 4. The owner's questions, answered in the session
1. **Soccer.** No new API is needed for most of the world.
   - Why there were no soccer bets:
     - the app asked for only 10 leagues and dropped the rest;
     - BettingPros' all-soccer rows do not match ESPN games yet;
     - the source buttons were hidden in Settings;
     - with US books only, a league needs at least 3 books (or Pinnacle) to judge a fair price.
   - Test after publishing: Sources → The Odds API → a league under Soccer → Moneyline → Load game lines. Then Sources → Sportsbook API → Load +EV picks. Send Claude Code both messages.
2. **Live betting.** Partly possible today. The Live tab already has ESPN live scores and win odds, plus Kalshi, Polymarket and Novig prices every 15 seconds.
   - Real live +EV needs a live sharp price (Pinnacle or the exchanges) and the books' live prices, both updated in seconds, plus alerts.
   - Services that do it pay for second-by-second feeds.
   - The cheap first step: flag when one exchange is out of line with the other two (no new API).
3. **Why Augi sees BettingPros on campus Wi-Fi and the owner cannot.**
   - The university blocks the address the owner's browser talks to: props.0xbeta.dev and api.0xbeta.dev.
   - Augi's requests never touch that address. ChatGPT's servers, or GitHub's, fetch BettingPros for him, and the campus only sees chatgpt.com or github.com.
   - Advice given: use cell data or a hotspot. Do not route around the campus filter; it can break the university's rules.
4. **DraftKings vs DK Predictions vs FD Predicts.** Yes, the app keeps them apart (see section 1).

## 5. Open
1. **Owner:** confirm v3.57 on phone and laptop. On a phone, the version is under the board date.
2. **Owner:** run the soccer test in section 4 and send the results.
3. **Owner:** put the Worker on a private GitHub repo (`worker-to-github_2026-11-03_v2.md`, Ref CC-2026-11-03-02). That unlocks Pick6 step 2 and the free `src=oddsapi_sports` list.
4. **ChatGPT review:** `chatgpt-review_2026-11-03_v1.md` (Ref CC-2026-11-03-07). The owner sends it to ChatGPT and returns the answer to Claude Code.

Next Ref from Claude Code: **CC-2026-11-03-08**.
