# Prefill watch loop: v1

Ref: CC-2026-11-25-WATCH-01 · written 2026-11-25, about 5:35 PM CT · by El Capataz (Claude Code)
Status: personal edition only. The prefill-bet skill is still "guarded automation, experimental".

## How to start it
1. Open a **new** Claude Code session in `~/ev-bet-screener`. A new session keeps every check cheap.
2. Type `/model sonnet`.
3. Paste the loop below.
4. Keep the Screener's Jarvis on **Talk now** (Settings → Jarvis): it is the free, instant alert.
5. When a pick is found: type `/model opus`, then "prefill it".
6. To check right away: type "check now".

## The loop (paste as one line)
```
/loop 15m Prefill watch. Rules: .claude/skills/prefill-bet/SKILL.md and memory/decisions/prefill-watch-v1.md. Time in America/Chicago. If it is between 9:15 PM and 10:00 AM and the minute is 15 or later, append a line "off-hours" to agent-notes/prefill-check-log.csv and do nothing else. Otherwise: in the props.0xbeta.dev tab in your Chrome group (open one if none), run one JavaScript read only (no screenshots, no clicks): approved Novig rows not already bet (scApproved, not prior, not waitOrder), each with jvPickTxt, jvGameTxt, stake, jvOkTxt(r,jvMax(r)). Today's total = the sum of today's "placed" lines in the CSV. Append one CSV line: time_ct,day,kind(check),novig_picks,picks(sport|pick|stake|okUpTo|hours to start; separated by ;),today_total,action(none or notified). If there is a pick and today's total plus its stake is $25 or less: send me a push notification and list the pick with its stake, its OK up to and today's total against $25, then wait for my OK. Never press Place. If today's total is $25: write "cap reached", tell me, and stop the loop.
```

## The record (`agent-notes/prefill-check-log.csv`)
Columns: `time_ct, day, kind, novig_picks, picks, today_total, action`.
`action` is one of: none, notified, prefilled, placed (with its stake), skipped (with the reason), off-hours, cap reached.
The record goes into the repo with the next commit.

## Review: 2026-12-09
Read the CSV and count picks by hour and by weekday. The owner picks the new hours. Then the loop either runs in self-paced mode (`/loop` with no interval), with short waits in the busy hours, or keeps a fixed schedule.
Timing only: no stake, limit or decision changes. Two weeks is a small sample, so say so.

## Things learned on 2026-11-25
- The app logs Novig fills by itself. The $1 CLE fill was in the log about 12 minutes after it was placed. After "placed", check the log before pressing I bet this, so a bet is never logged twice.
- Outside the Jarvis hours the pop-up is quiet, and a game line can have no Open the book button anywhere in the app. The skill then says stop, unless the owner says to use the Novig fallback.
