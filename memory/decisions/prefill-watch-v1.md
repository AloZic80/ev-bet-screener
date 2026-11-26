# Prefill watch loop (v1) — active, personal edition only

Ref CC-2026-11-25-WATCH-01. Agreed with the owner 2026-11-25 ("build what you need").
Loop text: `agent-notes/prefill-watch-loop_2026-11-25_v1.md`. Record: `agent-notes/prefill-check-log.csv`.

- A Claude Code session (Sonnet 5.5) checks the board every 15 min, 6:00 AM to 11:00 PM CT (owner, 2026-11-25: "make it 6:00 AM to 11:00PM for now"); overnight only one check per hour.
- Each check: one read of the board, one CSV line (empty checks too). A Novig pick found = notify the owner and wait; nothing prefilled without his OK.
- Order (see `auto-betting.md`): the 10 x $1 test run first, then $25 a day. Counted only from `agent-notes/samson-log.csv` (owner, 2026-11-25: "use agent-notes/samson-log.csv for every step and for counting the daily total"); today's $1 CLE counts in the day, not in the test run. `prefill-check-log.csv` is timing only.
- Samson never presses Place; the owner does. Every step gets a Samson-log line, pushed with `git push origin HEAD:claude/mac-samson`.
- Novig fills are logged by the app itself (seen 2026-11-25: the CLE fill was auto-logged within ~12 min). After "placed", check the log first; press I bet this only if no entry exists.
- **Review due 2026-12-09**: read the CSV, show picks by hour and weekday; the owner picks the new schedule. Timing only: never a stake, limit, floor or decision.

## Schedule and buttons (owner, 2026-11-25, about 6:15 PM CT)
- The "updated" time next to My games is the live-scores strip, not the props board: never time anything from it.
- 6:00 AM CT each day: press Settings → Jarvis → **Talk now** (lasts until midnight), only if it is not already on.
- Press **Load** only at 8:00 AM, 12:00 PM, 4:00 PM and 7:00 PM CT, and only with at least 10 BettingPros calls left; then wait 2 minutes for the Sentinels and check.
- Every other check: no Load; read the board and log the Price read age (newest row price) and the BettingPros calls left.
- Same rows and prices as the last check: write "no change" and do nothing else.
- These two buttons (Talk now, Load) are the only app buttons besides Open the book that the loop may press. Never Place.
- How it runs: recurring jobs can start up to 30 min late, so a 12:05 AM job creates each day's on-time one-shot jobs (6:00 Talk now; 8/12/4/7 Load).
- Owner, 2026-11-25 ~11:15 PM: "that you recommend according to the standard and you hand off": when a check finds an approved Novig pick within the limits, Samson prepares the slip right away (no OK asked), then notifies the owner and hands off. The owner still presses Place.
