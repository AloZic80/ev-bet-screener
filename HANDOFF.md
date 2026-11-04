# 0xBeta Screener: status, next steps and instructions

Last updated: 4 Nov 2026. Repo: https://github.com/AloZic80/ev-bet-screener

---

## 1. Where things stand

Everything below is in **pull request #1** (https://github.com/AloZic80/ev-bet-screener/pull/1),
branch `claude/focused-brown-58llu9`. **Merging it puts it live** at props.0xbeta.dev. `main` is untouched until you merge.

What the PR adds:
- **Parlays tab** for PrizePicks and DraftKings Pick6 (section 5).
- **To win fixes:** the amount you type is saved and is the profit, on every book. % mode and editing a bet are fixed too.
- **Log bets that already happened:** a Result box (won / lost / push). The odds box takes American (-110), decimal (1.91) or a percentage (52.4%).
- **Look and layout:**
  - centred page, tabs pinned on desktop and a bottom bar on phones;
  - tidier Today card and BettingPros bar; Sources and the passphrase moved to Settings > Data sources;
  - long text wraps; short stat names (Receptions > Rec);
  - **Layout: Auto / Phone / Desktop** toggle; the Pasted and Paste a board tabs are hidden.
- **Accessibility (WCAG 2.1 AA):** readable colours in light and dark mode, names on every control, keyboard focus, phone tap targets.
- **Grading bets added after kickoff:** a bet you add by hand grades itself even when saved after the game started.
- **For agents:** `CLAUDE.md` (rules), `tests/` (100 automated checks, all passing) and `agent-notes/` (one file per instruction).

Nothing changes in the Worker, so no `wrangler deploy` is needed for this PR. Your saved bets and settings carry over.

---

## 2. Your next steps (the owner)

1. **Merge PR #1** when you're ready. On GitHub: open the PR, then **Merge pull request**, then **Confirm merge**. The site updates within a few minutes.
2. **Tick PrizePicks** under Settings > Books you bet, then press **Load**. BettingPros then brings PrizePicks' own lines into the Parlays tab.
3. **Check the payouts** in the Parlays tab (the Payouts section) against your apps. Pick6 starts with a copy of PrizePicks' payouts until you enter its own.
4. **Bets added after kickoff now grade themselves** (done). The one exception: a game more than 4 days back, where + Add a bet asks you to set Result yourself.
5. **Pick6's own lines:** step 1 is done. Send your agent `agent-notes/2026-11-04-pick6-step-2.md` (the same message as section 3B), then bring its test results back to Claude.
6. **Before you sell:** make the repo private and move hosting to Cloudflare Pages (section 7).

---

## 3. Instructions for the other agent

Copy each block as it is. Each new instruction also gets its own file in `agent-notes/`, so you can send just that file.

### 3A. Always send this first (whenever it works on this repo)

```
We're building 0xBeta Screener: github.com/AloZic80/ev-bet-screener (one-file app: index.html). Another agent (Claude) also works on it.
1. Get the latest code: git fetch origin && git checkout main && git pull. If PR #1 isn't merged yet, use branch claude/focused-brown-58llu9 instead.
2. Read CLAUDE.md before changing anything and follow it: never push to main; make your own branch (agent/<short-topic>); change only what I ask, found by exact text; don't reformat; never put an apostrophe inside the app's single-quoted JavaScript strings.
3. Before pushing, run the tests: cd tests && npm install && npm run setup && npm test. It must end with "All tests passed". If anything fails, stop and show me the output.
4. Push your branch and tell me its name and what changed. Don't open or merge pull requests unless I ask.
```

### 3B. DraftKings Pick6 lines in the Worker

BettingPros has PrizePicks lines but no Pick6 lines, so this adds them from The Odds API.

**Step 1: research. Done by your agent on 4 Nov; nothing built yet.**
- The Odds API has a DFS region, `us_dfs`. Its books are `pick6` (DraftKings Pick6), `prizepicks`, `underdog` and `dabble_us_dfs`.
- Pick6 picks with non-standard multipliers are listed under alternate markets (`_alternate` keys).
- **Cost:** markets × regions, per game. One region and 4 markets is 4 credits a game. Pricing 3 games for an entry costs about 12; a full NFL Sunday (about 13 games) costs about 52.
- Claude couldn't open the-odds-api.com from its session to double-check, so the step 2 test call confirms the real cost.

**Step 2: approve with this message (Claude's recommended version)**

```
Approved, with these changes. Build step 2:
1. On demand only: no schedule or cron. The route runs only when the app calls it.
2. Props route: GET /src/odds?src=oddsapi_props&sport=<sport key>&event=<event id>&markets=<comma list>. Always use regions=us_dfs, which returns pick6, prizepicks, underdog and dabble for the cost of one region. No _alternate markets (they carry non-standard payouts).
3. If markets is missing, use these defaults, and reject more than 4 markets per call:
   NFL (americanfootball_nfl): player_pass_yds,player_rush_yds,player_reception_yds,player_receptions
   NBA (basketball_nba): player_points,player_rebounds,player_assists,player_points_rebounds_assists
4. Event list: GET /src/odds?src=oddsapi_events&sport=<sport key>, using The Odds API events endpoint. Check whether it costs credits; if it does, cache it for 60 minutes.
5. Credit floor: if x-requests-remaining is under 60, answer HTTP 429 with {"error":"credit floor"} instead of calling The Odds API, so game lines always have credits left.
6. Reuse the existing The Odds API secret, the 10-minute cache and the x-src-quota / x-src-cached headers, exactly like src=oddsapi. Return The Odds API's JSON unchanged.
7. Don't change any other route. Deploy with npx wrangler deploy.
8. Test once: one event, 2 markets (should cost 2 credits). Send me the first 20 lines of the event list, the first 60 lines of the props response, the x-src-quota header, and the credits used on your Odds API usage page.
```

Once step 2 is done, Claude adds a **Get Pick6 lines** button to the Parlays tab. It asks only for the games you're
building from, matches each line to the board's player and stat, and marks any pick whose Pick6 line differs from the board.

**Original step 1 message (already sent):**

```
In ~/prop-bet-api (the Cloudflare Worker behind https://api.0xbeta.dev):
Goal: DraftKings Pick6 player-prop lines for the app's Parlays tab.
1. Check whether our The Odds API plan returns DraftKings Pick6 player props. In The Odds API docs, DFS apps are listed as bookmakers in their own region: find that region, the bookmaker key for DraftKings Pick6, and which NFL and NBA player-prop market keys it offers. Props come from the per-event odds endpoint and cost credits per market per event, so tell me the credit cost for one NFL Sunday BEFORE building anything.
2. If it's available and I approve the cost: extend the existing /src/odds route (it already proxies The Odds API with src=oddsapi) with src=oddsapi_props&sport=<sport key>&event=<event id>&markets=<comma list>&regions=<DFS region>, plus a way to list today's event ids. Reuse the same secret, the 10-minute cache and the x-src-quota / x-src-cached headers exactly like src=oddsapi. Return The Odds API's JSON unchanged.
3. Don't change any other route. Deploy with npx wrangler deploy, call the new route once, and send me the first 50 lines of the response.
```

### 3C. What to bring back to Claude

- From 3A work: the **branch name** and the agent's summary of what changed.
- From 3B step 2: the four things in point 8 (event list, props response, the quota header, credits used).
  Claude then connects Pick6 lines to the Parlays tab.

---

## 4. Who does what

| Who | Does |
|---|---|
| **You** | Merge pull requests (that's what deploys), run `npx wrangler deploy`, tick books and settings in the app |
| **Claude** (this session) | Everything in this repo: the app (`index.html`, `phone.html`), tests, `CLAUDE.md`, pull requests |
| **Your other agent** (on your Mac) | Only what lives on your Mac: the Worker (`~/prop-bet-api`) and deploying it |

Claude can't reach your Worker, because it's only on your Mac. **If you push the Worker to a private GitHub repo and tell Claude
its name**, Claude can write the Worker changes too, and you'd only run `npx wrangler deploy`.

---

## 5. Parlays tab: how it works

- PrizePicks and Pick6 pay a fixed multiple, so a pick's sportsbook price doesn't matter, only how likely it is to hit.
  Picks the board turns down as single bets can still be good parlay picks.
- Every prop on the board that hasn't started is a possible pick. PrizePicks' own lines come first. Lines from other books
  are marked **check line**.
- For 2 to 6 picks it shows the best entry with:
  - its expected return,
  - the break-even chance per pick,
  - how often all picks hit,
  - a suggested stake (your Kelly fraction and edge haircut from Settings, kept between your smallest and largest bet).
- **Best for your bankroll** marks the entry that grows your money most at its stake. That's not always the biggest
  return: a 6-pick can show +46% but hit only 4% of the time.
- **Your entry:** tick 2 to 6 picks to price your own. **Log this entry** puts it in the Bet log, where you grade it with
  "how many hit".
- **Power or Flex**, and editable payouts. Goblin and demon lines pay differently, so use standard lines or enter that entry's payout.
- Picks are treated as independent, so keep **one pick per game** on.

Break-even chance each pick needs (PrizePicks payouts):

| Picks | Power | Flex |
|---|---|---|
| 2 | 57.7% | none |
| 3 | 58.5% | 59.1% |
| 4 | 56.2% | 56.9% |
| 5 | 54.9% | 54.3% |
| 6 | 54.7% | 54.2% |

The math is checked against separate code in `tests/parlay-test.js`:
- break-evens against the exact formula;
- 40 random entries against brute force over every hit/miss outcome;
- Kelly stakes against a fine search.

---

## 6. Your data sources and what you can bet on

| Source | What it gives the app | Allowance (from your screenshot) |
|---|---|---|
| BettingPros | Main board: props, game lines, projections; also PrizePicks and Underdog lines | 50 a day |
| Pinnacle (pinnapi) | Sharp prices, the fair reference | on |
| SportsGameOdds | Props and lines from FanDuel, DraftKings, BetMGM, Caesars, Bovada and others | 2,500 games a month |
| Sportsbook API | Its +EV picks, re-checked by the app | on |
| The Odds API | Game lines only | credits |
| OddsPapi | NFL totals: Pinnacle against Bovada | monthly |
| Kalshi, Polymarket US, Novig | Your own bets (read-only) and live prices | none |
| ESPN | Scores and grading | free |

Live allowances: Settings > Data sources, tap a source, then **Test**.

**What you can bet on:** the app only recommends books ticked under Settings > Books you bet; other books' prices are
reference only. Which apps are allowed depends on your state, so check each app. Bovada is offshore, not licensed by a US state.

---

## 7. Making the repo private

- Not urgent: the code has no secrets. API keys and the passphrase live in the Worker.
- On a free GitHub account, a **private repo can't publish GitHub Pages**, so props.0xbeta.dev would stop updating.
  Either use a paid GitHub plan, or host on **Cloudflare Pages** (free, and you already use Cloudflare).
- Claude and your saved bets are not affected. Your other agent needs its own access to the private repo.
- Recommended before selling: Cloudflare Pages plus a private repo. If the Worker goes on GitHub, keep that repo private.

---

## 8. Adding bets

- **Odds formats:** American (-110, +120), decimal (1.91) or a percentage (52.4%). Use % mode (Cost, @ %, To win) for Kalshi-style slips.
- **To win** is the profit. When you type it, it's what the bet pays.
- **Before the game starts:** the bet is matched to the ESPN game and grades itself.
- **After the game started:** it still grades itself, as long as you pick the game from the ESPN list or type it with
  the right date. Bets from the board and exchange fills keep the 4-hour rule, because they can't name their game.
- **More than 4 days back:** set **Result** when you add it (the form asks), or grade it later with Mark WIN / LOSS / PUSH.
