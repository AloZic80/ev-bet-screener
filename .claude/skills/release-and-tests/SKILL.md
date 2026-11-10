---
name: release-and-tests
description: Use when finishing a build: running the tests, bumping the version, opening and merging the pull request, writing the notes for the owner and ChatGPT.
---

# Release and tests

1. **Parse check** after every edit of `index.html`: both `<script>` blocks must compile (`new Function`).
2. **One test** for what changed, then the tests of anything nearby.
3. **Layout or colour change:** look at 390, 1000, 1280 and 1960 px; run `node tests/a11y-report.js` and `node tests/table-width-report.js`.
4. **Review** the diff with independent readers, each on one angle, and verify every finding against the code before fixing it.
5. **Full suite:** `node tests/run-all.js` must end "All tests passed". Do not edit `index.html` or a test while it runs (each test reads the file when it starts). A new test file goes in `tests/run-all.js`.
6. **Version:** exactly three places: `SCREENER_VERSION`, `<title>`, `#verTag`.
7. **Record:** update the decision file in `memory/decisions/`, add a line to `memory/history.md`, and `docs/EV-CALCULATOR.md` if the math moved.
8. **Publish** (owner, 2026-11-05: "Always publish if it passes"): commit, push the feature branch, open the PR (what was asked, what changed, the test result), squash-merge, restart the branch from `main`. Any failing test: do not publish; report it.
9. **Notes:** `agent-notes/para-chatgipititi_<version>_<date>.md` (what the app is, what was asked, what was built, the numbers, questions), sent to the owner as a file.
10. **Reply:** what he sees now, in plain words; what was not built; anything noticed and not changed.

Never: push to `main`, skip or weaken a test to get green, merge the Worker without the owner's go, put a key or the passphrase anywhere.
