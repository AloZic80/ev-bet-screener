# The AI helper, app side (ai-helper-v1) · active since v5.15 (built, not yet published)

Owner, 11/15-16: "its only for me now." · "Lets use it to its full potential. All that we can." · Model: "LETS CHOOSE SONNET". The plan and the exact
Worker ↔ app contract: `agent-notes/ai-helper-contract_2026-11-15_v1.md`. The Worker side is prop-bet-api `src/ai.js` (branch `claude/ai-helper`,
deployed only on the owner's go).

## The rule
- **It reads, checks, explains and records; it never decides.** No AI answer changes a decision, a stake, a floor, a cap, Kelly, the order, the six ◎
  checks or the Scorecard. "⚠ check news" and "📷 read from a screenshot" are labels.
- **Nothing is written without the owner.** A bet, a grade, a match, a price or a market name is a proposal first: Use / Ignore (Edit = change the form,
  the book or the odds before Use or Save). Grade Use goes through the Look out list's own Won / Lost / Push buttons; match Use through linkFill /
  autoAddFromRow, as Add does; prices through a board row La Contadora prices like any (src `ai-shot`, the read time as `priceAt`).
- **Off until set up:** GET `/ai/status` must say `setUp:true` and Settings › AI helper › "Use the AI helper" must be ticked (`mbev.ai.on`, this device).
  Every AI button is hidden while off (`html.ai-on`). A `not_set_up` answer turns it off again.
- **One way out:** `aiCall(job, input)` → POST `API_BASE + '/ai'` with `apiHeaders()` (the passphrase header; the fetch wrapper's cookie mode applies).
  Every Worker error code has plain words (`aiErrText`); never raw JSON. The app sends no prompt and no model.
- **What is sent:** only the item asked about. Slip and price pictures go as a JPEG of at most 1,600 px (canvas), never kept. Ask my log sends only the
  columns the question needs (date, result, profit, stake, + sport, market, side, book, odds, fee by keyword), never notes, ids or keys. The weekly
  summary sends the Bet log's Last 7 days totals only. The bug note sends version, error, stack, where and the last 20 taps (button words only).

## Data points (localStorage; in sync through `SYNC_SETS` when sync is on)
| Key | Shape |
|---|---|
| `mbev.ai.slips` | `[{at, book, kind:single|parlay, fields:{what was read}, corrections:{field:[ai, mine]}}]` (last 300) |
| `mbev.ai.names` | `[{kind:'fill', book, fill:'<book>|<nrm fill label>', to:'bet'|'row', card:'<nrm name stat line side>', fillText, cardText, at}]` |
| `mbev.ai.sources` | `{'<SPORT>|<statFam or kind>': {domains:{domain:n}, n, last, at}}` |
| `mbev.ai.markets` | `{'<market name, lower case>': {key|null, name, at}}` (null = ignored, not asked again) |
| `mbev.ai.news` | `{'<SPORT>|<nrm player or team>|<game day>': {status, summary, sources:[{title,url,seen}], checkedAt, day}}` (3 days kept) |
| `mbev.ai.log` | `[{at, job, usd, err?}]` (last 200) |
This device only: `mbev.ai.on`, `mbev.ai.status`, `mbev.ai.mkProp` (market map waiting for Use / Ignore), `mbev.ai.mkDay` (once a day).

## Used with the AI off
- `betForFill` and `rowForFill` check `mbev.ai.names` right after the exact fill links (`aiNamesBet`, `aiNamesRow`): same book, same card key, within 48 h.
- `statFam` checks `mbev.ai.markets` first (`aiMarketKey`), so a confirmed BettingPros name matches book fills.

## Tests
`tests/v515-ai-test.js` (fake Worker per job and per error code; fails on the v5.13 file).

## Not done in v1
- The confirmed market names feed the fill matcher (`statFam`), not ESPN grading (`statForMarket` keeps its own regex rules).
- Paste does not read `mbev.ai.names` yet (it has no name step to hook); per-book readers from `mbev.ai.slips` are the "Later" step of the contract.
