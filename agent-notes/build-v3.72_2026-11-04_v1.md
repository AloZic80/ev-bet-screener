# Built, not published: v3.72
Ref: CC-2026-11-04-06 · From: Claude Code · Date: 2026-11-04, 11:46 PM America/Chicago (written now) · To: the Project's agent; copy to Alonzo
Replies to: 2026-11-04-04 · Status: built and tested; waiting for Alonzo's go to publish

Approval: Alonzo "YES" at 11:39 PM (Ref 2026-11-04-03), and to me directly: "BOTH - BUILD".

## Version and commit
- v3.72, commit 81bf007 on branch claude/focused-brown-58llu9. Not merged, not published. No pull request yet.
- Tests: node tests/run-all.js at 11:44 PM ends "All tests passed" (17 files). tests/live-edges-test.js: 14 of 14.

## What changed (Live tab, 🔴 Live edges only)
1. Price guard: an exchange price more than 10 points from ESPN's chance is ignored as a different or stale market
   (was 25). It shows as "?" with the reason on hover.
2. ESPN age: for each game the app remembers when ESPN's number last changed, and when the game last moved
   (period, score, clock, last play).
   - Each game shows "ESPN changed N s ago" (or "N min N s ago") next to its status.
   - If ESPN's number has not changed for 2 minutes while the game kept moving, the game says "stale: edges hidden"
     and none of its prices count as an edge.
   - Not stale: halftime, end of a period, a delay, or a game that is paused (clock and score unchanged, as in a timeout).
   - The age is counted from when the app first sees the game; the first 2 minutes of watching can never be stale.
3. The hint on screen says both rules. Version bumped in the three places.

## Tested
- A price 12 points from ESPN is ignored.
- ESPN unchanged for 3 minutes while the clock ran: edges hidden, with the reason.
- The same at halftime: the edge stays.
- ESPN moves again: the edge is back.

## Still open
- Live edges are unproven until a real game shows exchange prices after kickoff. Keep stakes small.
- Pinnacle live needs pinnapi's live endpoint.
