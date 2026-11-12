# When game lines and player props show up (all times Central)

Ref: CC-2026-11-11-11 · Wed 2026-11-11, 11:45 PM, America/Chicago · For Alonzo (and Augi), for the claude.ai Project "Betting-for-Pros".

Alonzo asked: "can you find out when books or when in general do NBA, NHL, etc bets comeout?" and "AUgi ... says after a certain time x comes out".
How this was made: five research workers (one per sport group, one for the exchanges) searched the web; one wrote this sheet. Direct page fetches
were blocked on the build machine, so most facts come from search excerpts of the pages listed in section 4, cross-checked. The Kalshi times
come from Kalshi's own public market data (when each market was listed). H / M / L = how sure.

**Augi's times:** when Augi says when a market comes out ("after X time"), they go in a column here next to what the research found.

As of Nov 12, 2026. H/M/L = how sure; [n] = source. Exchanges = Kalshi, Polymarket US, Novig. ESPN Bet is now theScore Bet [1]. Project notes (memory/platforms/books.md): DraftKings and FanDuel sportsbooks are not open in Texas; their prices still show in the data.

## 1. When markets appear

| Sport | Game lines appear | Player props appear | What triggers or delays them |
|---|---|---|---|
| **NBA** | Day before, about 4–9 p.m.; small limits until game-day late morning [3][4]. Kalshi: spreads the evening before, winners 4–7 days out [5]. | Mostly game day. Kalshi points props: 21 of 25 games listed overnight (10 p.m.–4 a.m.); Novig priced by 5 a.m. [5][6]. Books: some by morning, most by early afternoon [7]; Bovada 10 a.m. or 1 p.m. (page says both) [3]. | Injury report by 5 p.m. local the day before (4–7 p.m. CT); game-day update 11 a.m.–1 p.m. local (10 a.m.–3 p.m. CT), earlier for early tips [2]. Questionable players’ props come last (L). |
| **NHL** | Day before, by evening; Bovada 1 p.m. [3][8]. Kalshi winners about 7 days out [5]. | Skater props (shots, goals, points) by late morning: DraftKings and FanDuel shots by 6 a.m. [9], Kalshi 12 hours before puck drop [5], Novig 8–9 a.m. [6], Bovada 11 a.m. [3]. Goalie saves later: Kalshi median 11:35 a.m. (early games), 1:06 p.m. (late) [5]. | Starting goalie, usually named after the morning skate (9 a.m.–12:30 p.m. CT), sometimes only at warm-ups [10]. No required injury report; lineups 20 minutes before [11]. |
| **NFL** | Next week’s spreads Sunday 3:30 p.m., moneylines Monday 8 a.m. (Bovada) [3]; most books by Sunday evening (M) [12]. Kalshi winners 10–14 days out [5]. | First batch Tue–Wed (BetMGM: Tuesday for Thursday games, Wednesday for Sunday); more through Thursday (M) [12]. Kalshi passing yards Tue–Wed [5]. | Practice reports Wed–Fri, 3 p.m.; status report Friday 3 p.m. (Wednesday for Thursday games); inactives 90 minutes before kickoff [13]. |
| **College football** | Circa (Las Vegas) Sunday 1 p.m. [14]; some books Sunday morning (L) [15]; Bovada spreads Sunday 7:30 p.m., totals Monday 7 p.m. [3]. | Not verified; Bovada game day 9 a.m. or 1 p.m. [3]. Banned in many states [16]; none on the exchanges (M) [17]. | SEC reports Wed–Fri by 7 p.m., final 90 minutes before kickoff [18]. |
| **College basketball** | Spreads 9 p.m. the night before; totals 9 a.m. (Bovada) [3]. | About 1 p.m. (Bovada) [3]; banned in many states [16]. | No regular-season injury report found. |
| **MLB** (back spring 2027) | About 9 p.m. the night before (Bovada) [3]. | Bovada 1 p.m., or 2 hours before first pitch [3]. | Starting-pitcher changes, lineups, weather (M) [22]. |

## 2. Best times to press Load

A Load costs 2 calls per sport (the top 40 props by edge, of those posted so far); a repeat Load within 30 minutes is free. Limit: 50 calls per rolling 24 hours [19]. Times follow when books post; how fast BettingPros shows a new prop is unknown.

**Weekday NBA + NHL night** (first games 6–6:30 p.m.; 4 calls a load):
1. 10 a.m. (optional): NHL skater props up, NBA partial.
2. 1:30–2:30 p.m.: main load; most NBA game-day reports and early-game goalies are in.
3. 4:30–5:15 p.m.: last full board before first games.
4. 7:45 p.m.: West Coast games only.

About 16 calls; add college basketball to loads 2 and 3. Weekend early games: 9–10 a.m., then 90 minutes before the first. Set the Board date to tomorrow to preview NBA, NHL or MLB [19].

**NFL week** (2 calls a load; each shows the week’s props so far): Wed and Fri 4 p.m.; Sun 10:45 a.m. (after noon-game inactives) and 2 p.m. (late games); Tue 4 p.m. for the Thursday game; 5:55 p.m. before night games. College football Saturday: 9–10 a.m., then 2 hours before big kickoffs.

**MLB day** (from spring 2027): 10:30 a.m., 1:15 p.m. (after Bovada’s props), 4–5 p.m. for 6–7 p.m. first pitches, 6:45 p.m. for West Coast games.

## 3. Watch out

- **News pulls markets.** A doubtful player’s props (often teammates’ too) come down and return at new numbers (M) [20]; quarterback doubt pulled a college game in 2026 (H) [15].
- **Early numbers take small bets.** Limits start low and rise toward game time; props take less than spreads (M) [4].
- **Exchanges list early, trade thin.** Kalshi, 11:30 p.m. Wednesday: most of Sunday’s NFL passing-yard lines had buy and sell prices over 3¢ apart; Thursday’s had 16 of 19 within 3¢ [5].
- **Missing is not always late.** NBA partner books dropped opening-tip bets and unders on players expected under 12 minutes (H) [21].
- **Bovada’s page** looks 2019-era (2019 NASCAR names) and contradicts itself on props [3].
- **BettingPros lockout:** after a "limit" answer, the app waits until 6 p.m. CT (midnight UTC) before asking again [19].

## 4. Sources

1. https://cdcgaming.com/brief/a-new-dawn-for-penn-espn-bet-is-replaced-with-thescore-bet/ — rebrand (H)
2. https://official.nba.com/nba-injury-report-2026-27-season/ — NBA deadlines (H, re-checked)
3. https://www.bovada.lv/help/sports-faq/odds-posting-schedule — Bovada times, from Eastern (M, re-checked; old, conflicting)
4. https://www.actionnetwork.com/education/how-do-betting-lines-work-vegas — openers, limits (M)
5. https://api.elections.kalshi.com/trade-api/v2/markets with https://site.api.espn.com start times — Kalshi listing times and quotes, Sep–Nov 2026 (H; NBA props: 25 games)
6. https://www.rotoballer.com/nba-best-bets-for-novig-11-9-26-expert-player-prop-picks/1988223 and https://www.rotoballer.com/nhl-best-bets-today-top-player-props-novig-picks-11-10/1989254 — Novig prices (M)
7. https://sportsinsights.zendesk.com/hc/en-us/articles/360036438171-What-time-are-player-props-added-to-the-tool — props by early afternoon (M, 2019)
8. https://www.cbssports.com/nhl/odds/20261112/ — next-day lines (M)
9. https://steezanomics.com/picks/best-shots-on-goal-props-wednesday-november-11-2026/ — shots props, 5:50 a.m. (M)
10. https://www.espn.com/espn/betting/story/_/id/42470775/nhl-odds-betting-goaltending-factor (H) and https://www.bettoredge.com/post/nhl-starting-goalie-betting (M) — goalie news
11. https://media.nhl.com/site/asset/public/ext/2024-25/2024-25Rules.pdf and https://pmc.ncbi.nlm.nih.gov/articles/PMC12644416/ — lineup deadline, no injury rule (H)
12. https://sports.betmgm.com/en/blog/nfl/first-anytime-touchdown-scorer-predictions-odds-picks-jaa-nfl/, https://www.covers.com/nfl/prop-betting-tips, https://www.cbssports.com/nfl/news/nfl-week-16-lookahead-lines-early-best-bets/ — NFL timing (M)
13. https://www.nfl.com/news/2026-27-national-football-league-important-dates and https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/news/nfl-2023-week-17-early-inactives-jacoby-brissett-out-sam-howell-back-in-for-commanders — reports, inactives (H)
14. https://www.espn.com/chalk/story/_/id/34281754/lsu-attracted-significant-money-qa-las-vegas-oddsmaker — Circa openers (H)
15. https://www.espn.com/espn/betting/story/_/id/49921234/college-football-betting-buzz-odds-updates-line-moves-spreads — Sunday-morning numbers (L), pulled game (H)
16. https://www.rotowire.com/betting/college-basketball/odds (H) and https://marylandmatters.org/2026/10/14/state-laws-aim-to-limit-prop-betting-shield-players-from-abuse/ (M) — state bans
17. https://www.ingame.com/cfb-player-props-draftkings-kalshi/ — exchanges (M)
18. https://www.si.com/college/oklahoma/football/sec-announces-policies-and-procedures-for-new-availability-report-01j6ytq381jt — SEC reports (H)
19. Our own code (the Worker and the screener) — the call budget (H)
20. https://sportsgameodds.com/docs/info/best-practices — pulled markets (M)
21. https://www.espn.com/nba/story/_/id/50196498/nba-tells-sportsbooks-stop-certain-bets-restrict-parlays — 2026-27 bans (H)
22. https://www.rotowire.com/betting/mlb/odds — what moves MLB lines (M)
