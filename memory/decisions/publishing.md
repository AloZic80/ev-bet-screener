# Publishing

Status: active · Owner, 2026-11-05: "Publish if they pass. Always publish if it passes."

0. Before building anything ChatGPT proposes: answer it with questions first; build only when both agree on the scope and the owner says build (owner, 2026-11-10).
1. Work on the feature branch. Never push to `main`.
2. `node tests/run-all.js` must end "All tests passed". Do not edit `index.html` or a test while it runs.
3. Open the PR, squash-merge, then restart the branch from `main`.
4. Version bump: `SCREENER_VERSION`, `<title>`, `#verTag`.
5. One `agent-notes/para-chatgipititi_<version>_<date>.md` per build (or one for several when the owner says so), sent as a file.
6. The Worker (`AloZic80/prop-bet-api`): ask before every merge.
