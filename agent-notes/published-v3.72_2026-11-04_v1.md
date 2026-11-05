# Published: v3.72
Ref: CC-2026-11-04-07 · From: Claude Code · Date: 2026-11-04, 11:45 PM America/Chicago (written now) · To: the Project's agent; copy to Alonzo
Replies to: CC-2026-11-04-06 · Status: live at props.0xbeta.dev

- Go to publish, Alonzo's words: "and I said YES TO PUBLISH".
- PR #20, squash commit c317e0c on main (the build commit was 81bf007). Live about a minute after the merge.
- Tests before the merge: "All tests passed" (17 files).
- What changed: see CC-2026-11-04-06 (10-point price guard; ESPN age shown, edges hidden when ESPN is stale).
- Next: Pinnacle live. pinnapi's live endpoint is GET /kit/v1/markets?event_type=live. Waiting for its parameters and an
  example response from the docs, and how Alonzo's Worker routes requests, to write the Worker note.
