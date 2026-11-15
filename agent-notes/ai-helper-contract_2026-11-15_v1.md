# AI helper: the plan and the Worker ↔ app contract (v1)

Ref: CC-2026-11-15-12 · El Capataz, Sun 2026-11-15, America/Chicago. No keys or passwords in it.
Owner, 11/15: "its only for me now." · "Lets use it to its full potential. All that we can." · Model: "LETS CHOOSE SONNET". Budget: $100 of API credit a month.
Explainer for the owner: agent-notes/ai-helper-explained_2026-11-15_v1.pdf.

## Rules (from CLAUDE.md, unchanged)
- **It reads, checks, explains and records; it never decides.** La Contadora's math alone decides every bet and stake. No AI output changes:
  - a decision, a stake, a floor, a cap, Kelly or the order;
  - the six ◎ checks;
  - the Scorecard eligibility.

  An AI flag is a label.
- **Nothing is saved without the owner.** Every AI result that would write a bet, a grade, a match or a price is shown as a proposal with **Use / Edit / Ignore**.
- **Where the data goes:**
  - The key lives only in the Worker (secret `ANTHROPIC_API_KEY`).
  - Calls go to Anthropic only. No passphrase, key or email is ever sent in a prompt.
  - Only the item asked about is sent. "Ask my log" sends the log rows it needs: the owner's own data, to Anthropic only.
- **No external services** other than Anthropic, plus Anthropic's own web search tool for the news and grading jobs.

## The Worker: `POST /ai` (prop-bet-api, branch `claude/ai-helper`; merged and deployed only on the owner's go)
- **Lock:** `locked(req, env)`, the same as every data route. Then it checks that `ANTHROPIC_API_KEY` exists. If it doesn't, the answer is `{ok:false, error:"not_set_up"}`.
- **Body:** `{ job: "<name>", input: {...} }`.
  - The Worker owns each job's system prompt, model, effort, tools and output schema (structured outputs). The app cannot send a prompt or choose a model.
- **Model:** `claude-sonnet-5-5` for every job.
  - Effort: `low` for reading jobs; `medium` for match, grade and ask.
  - Prompt caching on each job's fixed system prompt.
  - Refusal fallback on (`fallbacks: "default"`).
- **Caps** (Worker vars, changeable): `AI_DAY_USD` 5 and `AI_MONTH_USD` 90.
  - Spend is counted in KV (`ai:spend:YYYY-MM-DD` and `ai:spend:YYYY-MM`, America/Chicago) from each response's `usage`, at Sonnet's list prices including cache reads and writes, plus web-search calls.
  - Over a cap the answer is `{ok:false, error:"cap", resets:"..."}` and no call is made.
- **Answer:** `{ok:true, job, out:{...per schema}, usage:{in, out, cacheRead, cacheWrite, searches}, usd, spentToday, spentMonth}`.
- **`GET /ai/status`** (locked): `{setUp, spentToday, spentMonth, capDay, capMonth}`.
- **Bug notes:** the `bug` job also stores its note in KV (`ai:bug:<ts>`, kept 60 days). `GET /ai/bugs` (locked) lists them, for El Capataz.

### Jobs (input → out)
| job | input | out (structured) | tools |
|---|---|---|---|
| `slip` | `{image (base64 png/jpg), mediaType, hint?}` | `{book, kind: single\|parlay, placedAt?, stake, odds, toWin?, totalPayout?, free?, legs:[{player?, team?, market, line?, side?, odds?}], entryType?: power\|flex, paysAll?, flexPays?, ticketId?, confidence, unclear:[field]}` | none (vision) |
| `prices` | `{image, mediaType, book?, sport?}` | `{book, rows:[{player?, team?, game?, market, line?, side, odds}], unclear:[...]}` | none (vision) |
| `news` | `{player?, team?, game, sport, market?, startISO}` | `{status: ok\|questionable\|out\|limited\|unknown, summary (≤ 2 sentences), checkedAt, sources:[{title,url}]}` | web search, at most 3 |
| `match` | `{fill:{...}, candidates:[{i, label, game, start}]}` | `{i \| null, confidence, why}` | none |
| `grade` | `{bet:{player?, team?, market, line?, side, game, sport, date}}` | `{result: win\|loss\|push\|void\|unknown, stat?, source:{title,url}, why}` | web search, at most 3 |
| `settle` | `{bet, bookResult}` | `{agrees: true\|false\|unknown, ourResult, stat?, source, why}` | web search, at most 3 |
| `market` | `{names:[string], known:[{key,label}]}` | `{map:[{name, key \| null, why}]}` | none |
| `ask` | `{question, rows:[compact log rows], fields:[...]}` | `{answer (plain, with the numbers), table?:[[...]], usedRows}` | none |
| `weekly` | `{summary:{...numbers the app computed}}` | `{text (≤ 200 words, plain, no hype, says when a sample is too small)}` | none |
| `bug` | `{version, error, stack?, where, recent:[actions]}` (no bets, no keys) | `{title, likelyCause, whereInCode?, steps}` | none |

## The app (index.html, v5.15 onward; each job published only when El Juez passes)
- **Settings › AI helper:** on/off (off by default until `/ai/status` says it is set up), today's and this month's spend, the caps (read-only), and "Clear AI data".
- **Job buttons:**
  - **+ Add a bet:** "📷 Read slip" (paste, drop or pick an image). It fills the form; the owner checks it and presses Save.
  - **Board:** "📷 Add prices from a screenshot". Rows are tagged `src:'ai-shot'`, read time, and *"read from a screenshot"*. La Contadora prices them like any row; their age shows like any price.
  - **Card ⋯ › "Check news".** It shows a ⚠ label on the card for the day. The label changes no decision.
  - **Unmatched fill › "Suggest the match".** The match is proposed, then confirmed.
  - **"Not graded" bet › "Find the result".** The result is proposed with its source, then confirmed.
  - **Reports › "Ask my log"** and a **"This week in plain words"** button.
  - **Unknown BettingPros markets:** sent to `market` at most once a day; the owner confirms the map.
  - **A caught page error:** a "Send a bug note" button.
- **Data points kept** (localStorage `mbev.ai.*`, in sync when on). These are what make the app better when the AI is off:
  - `mbev.ai.slips`: `{at, book, text fields read, corrections:{field:[ai, mine]}}`. No image is kept.
  - `mbev.ai.names`: a learned name table (player, team and market aliases) that matching and Paste use with no AI.
  - `mbev.ai.sources`: which site graded which sport and market.
  - `mbev.ai.markets`: the confirmed market map.
  - `mbev.ai.news`: the last check per player and day.
  - `mbev.ai.log`: `{at, job, usd}`, so the owner sees what was spent on what.
- **Later** (after a month of data): plain readers per book (slips and screenshots) and grading-source rules, built from `mbev.ai.slips` and `mbev.ai.sources`. These work with the AI off.
