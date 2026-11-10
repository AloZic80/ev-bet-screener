# 0xBeta Screener: notes for Claude and other agents

## What this is
- A sports-betting screener in one file: `index.html` (HTML, CSS and JavaScript, about 11,700 lines).
  `phone.html` only frames `index.html` at phone width (Settings > Layout > Phone on a computer). There is no build step.
- Live at props.0xbeta.dev (see `CNAME`), served by GitHub Pages from `main`; merging a pull request is what deploys (about a minute).
  Claude Code may merge its own pull requests, but only after the owner says go. Before each merge ask plainly ("Publish v3.7x to props.0xbeta.dev now?")
  and quote the owner's answer in the report; "build" alone is not a go to publish (agreed 2026-11-04, Ref 2026-11-04-02).
  Owner, 2026-11-05: "Publish if they pass. Always publish if it passes." So for the app: when `node tests/run-all.js` ends
  "All tests passed", merge and publish without asking, and say so in the PR and the reply. Any failing test: do not publish, report it. The Worker (AloZic80/prop-bet-api, on GitHub since 2026-11-05) deploys itself: merging into its
  `main` runs `.github/workflows/deploy.yml` (route test, then `wrangler deploy`, token in the `CLOUDFARE_API_TOKEN` secret). Same rule: ask before merging.
- Who does what (`agent-notes/how-we-work_2026-11-03_v1.md`): Claude Code is the only one that changes the app's code
  (branch, tests, publish on the owner's go). The claude.ai Project's agent keeps the history, researches and writes specs;
  ChatGPT gives second opinions; the owner decides, deploys the Worker and carries notes. Code drafted elsewhere comes in
  as a note to merge and test, never as an upload over `main`.
- Owner (2026-11-05): "build without my other agent". No relay blocks or reports for the other agents unless the owner asks;
  keep the record in the PR description. Still ask plainly before each publish.
- Notes for the Project's agent or ChatGPT: the owner copy-pastes them into those chats. Always put the full text in the
  reply as one copy-paste block per note (say where it goes); the `agent-notes/` file is the record.
- Para ChatGiPiTiTi (owner, 2026-11-08: "every time I ask something or something is changed, I can download that MD so I can ask my ChatGPT ...
  name it Para ChatGiPiTiTi with version or date"): every build also gets `agent-notes/para-chatgipititi_<version>_<YYYY-MM-DD>.md`, a standalone
  note for ChatGPT (what the app is, what was asked, what was built, the numbers, a question to check), sent to the owner as a file with the reply.
- Reports: after each step, write one report in `agent-notes/` (`<topic>_<YYYY-MM-DD>_v<N>.md`, header with a `CC-` Ref, times in
  America/Chicago) and give it to the owner, who adds it to the claude.ai Project "Betting-for-Pros" (Project knowledge).
- Prices come through the owner's Cloudflare Worker (`API_BASE`; a separate repo, `~/prop-bet-api` on the owner's Mac,
  deployed with `npx wrangler deploy`). Scores, schedules and grading come from ESPN's public scoreboard (free, no key).
- Everything a user saves lives in their browser's localStorage under `mbev.*` keys (`mbev.log` bet log, `mbev.board`,
  `mbev.theme`, `mbev.layout`, ...), optionally synced to the Worker with a sync password.

## The end game (owner, 2026-11-07)
- For now a personal app for Alonzo and Augi. They love the math; keep replies about building, not advice.
- Later, possibly an app for other people who may not know sports or betting at all. They only need to know a bet has an
  **edge** (+EV): like flipping a coin at a price better than its true chance, many times. Any one bet can lose, and it is never
  always a profit, but over enough bets the math says it is. So every change should keep it simple to follow:
  find the edge (La Contadora), size the stake, say exactly what to type at the book (like the Kalshi strip), and track results
  honestly (only settled bets win or lose; the Scorecard's 1,000-bet test shows whether the edge is real or luck so far).
- Legal advice will be asked for before it is offered to anyone else.

## Data sources (behind the Worker unless noted)
| Source | Used for |
|---|---|
| BettingPros | The main board: player props and game lines, projections, cover %, consensus. 50 calls a day. |
| Pinnacle (pinnapi) | Sharp prices: the fair reference with the vig removed. |
| SportsGameOdds | Props and game lines from FanDuel, DraftKings, BetMGM, Caesars, ESPN Bet, Bovada and others. 2,500 games a month on the free plan. |
| Sportsbook API | Its own +EV picks, re-checked by the screener. 1 call per load. |
| The Odds API | Game lines only (moneyline, spreads, totals); exchanges double the cost. Credits. |
| OddsPapi | NFL game totals: Pinnacle no-vig next to Bovada. 1 call per game, monthly allowance. |
| Kalshi, Polymarket US, Novig | The owner's own fills and settlements (read-only): My books, settlement grading, live exchange prices. |
| ESPN (direct, no key) | Scores, live stats, schedules and automatic grading. |

## Working rules
- Never push to `main`. Work on a feature branch and push that. Open a pull request only when the owner asks.
- Change only what was asked, found by exact text. Don't reformat, rename or reorder. Report anything else you notice instead of fixing it.
- Keep the file's style: long one-line records, a `// vX.YY:` comment on lines you change, and new CSS in a versioned block
  (`/* v3.54 ... */`) near the end of the first `<style>` instead of editing old rules.
- A version bump is exactly three places: `SCREENER_VERSION`, `<title>` and `#verTag`. Only when the owner asks.
- Grading and the 4-hour rule (`evOkFor`): a bet added by hand names its game (picked from the ESPN list, matched by exact
  start time, or typed with a chosen date) and is graded against it even when saved after kickoff. Board bets and exchange
  fills can't name their game, so they keep the rule: a game that started more than 4 hours before the bet was saved is ignored.
- No new external dependencies, CDNs or build tools.

## Rules that hold in every session
- **The file:** much of the HTML is built inside single-quoted JavaScript strings. An apostrophe in that text ("it's") ends the string and breaks the
  whole app: write "it is", `’` or `\'`. A `//` comment in the middle of a long line comments out the rest of it: use `/* */` there.
- **Startup order:** code that a render can reach must be a function declaration (hoisted), never a `const` / `let` helper defined further down.
- **A saved bet:** `addToLog` copies a fixed list of fields; a new field on a row must be added there or it is dropped. Never rewrite a bet's `snap`.
  Never swallow a log save error. Never clear saved results to force a regrade: grade first, replace only when the new grade exists.
- **Already bet:** a bet the owner placed must never stay bettable on the board. When in doubt, mark it.
- **The math:** one conservative chance, `min(model, market + 0.35 × (model − market))`, and the EV it gives (`actNet`) drive every decision: the floor,
  "OK up to", the stake, the order, the score's Edge, the EV shown (v4.53), the highest Make price and the best book (v4.54). The model's own EV is a diagnostic. A label (ring, leg, band,
  score, signal) or a mode never changes a decision or a stake. The six ◎ checks are frozen. Do not change a floor, a threshold, a fee, Kelly or a cap
  without the owner's go in his own words; do not tune anything on the bets used to judge it; do not call a small sample evidence.
- **Books:** exchange integrations are read-only. Keys stay as Worker secrets. Never print the passphrase. The Worker is merged only on the owner's go.
- **Screens:** check every layout change at 390, 1000, 1280 and 1960 px. Counts on screen must match what is listed.
- **Words:** plain language for someone who may not know betting; say exactly what to type at the book.

## Where things are written down
| Need | Read |
|---|---|
| The current rule for something (formula, version, tests) | `memory/index.md`, then the one file it points to |
| How to change the math, the grading or matching, or how to release | the skill: `.claude/skills/betting-math`, `grading-and-matching`, `release-and-tests` |
| Why a function is the way it is, version by version | `memory/history.md` (search by function name; do not read it whole) |
| The written math policy | `docs/EV-CALCULATOR.md` |
| Bugs that came back and the test that stops each | `memory/incidents/recurring-bugs.md` |
| What is confirmed about each book | `memory/platforms/books.md` |
| The periodic review that proposes changes (never makes them) | `memory/dream-review.md` |

After a build: update the decision file it touched and add its line to `memory/history.md`. Keep this file short.

## Testing
`tests/README.md` has the details. Before pushing:

```bash
node tests/run-all.js
```

It must end with "All tests passed".
For layout or colour changes, also look at `node tests/a11y-report.js` and `node tests/table-width-report.js`.
