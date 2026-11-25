# Prefill watch loop (v1) — active, personal edition only

Ref CC-2026-11-25-WATCH-01. Agreed with the owner 2026-11-25 ("build what you need").
Loop text: `agent-notes/prefill-watch-loop_2026-11-25_v1.md`. Record: `agent-notes/prefill-check-log.csv`.

- A Claude Code session (Sonnet 5.5) checks the board every 15 min, 6:00 AM to 11:00 PM CT (owner, 2026-11-25: "make it 6:00 AM to 11:00PM for now"); overnight only one check per hour.
- Each check: one read of the board, one CSV line (empty checks too). A Novig pick found = notify the owner and wait; nothing prefilled without his OK.
- Daily cap: $25 across bets placed together that day, counted from the CSV `placed` lines.
- Novig fills are logged by the app itself (seen 2026-11-25: the CLE fill was auto-logged within ~12 min). After "placed", check the log first; press I bet this only if no entry exists.
- **Review due 2026-12-09**: read the CSV, show picks by hour and weekday; the owner picks the new schedule. Timing only: never a stake, limit, floor or decision.
