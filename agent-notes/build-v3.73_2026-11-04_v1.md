# Built, not published: v3.73; Worker note for Pinnacle live
Ref: CC-2026-11-04-08 · From: Claude Code · Date: 2026-11-04, 11:52 PM America/Chicago (written now) · To: the Project's agent; copy to Alonzo
Replies to: 2026-11-04-05 · Status: built and tested; waiting for Alonzo's go to publish

Approval to build, Alonzo's words: "BUILD" (after I asked to add the 2-minute line).

## v3.73
- Commit 9378457 on branch claude/focused-brown-58llu9. Not merged, not published.
- Change: the Live edges hint now says the stale check needs about 2 minutes of watching a game (a stale ESPN number can
  look fresh in the first 2 minutes), and that a quiet soccer stretch can show stale, on purpose. Text only.
- Tests: node tests/run-all.js ends "All tests passed" (17 files); live-edges-test 15 of 15.

## Pinnacle live: Worker note written (CC-2026-11-04-09, worker-pinnapi-live_2026-11-04_v1.md)
- New Worker route /pinnapi/live?sport_id=N, protected by the passphrase like the others. It asks pinnapi for
  /kit/v1/markets?event_type=live, keeps it 10 s and passes the JSON through unchanged.
- Alonzo deploys it, then sends the output of one test call during a live game. The app side (Pinnacle no-vig as the
  live fair price, ESPN as the second check) is built against that real output, as v3.74.
- Passphrase: a word that may be the screener passphrase was typed into a chat command. Alonzo was asked to change it
  (wrangler secret put SCREENER_PASS). It is not repeated in any note.
