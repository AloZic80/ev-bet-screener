# Bugs that came back, and what stops each now

| Bug | Seen | Stops it |
|---|---|---|
| A `const` helper used at startup before its line ran ("Cannot access before initialization": half a page) | v4.15, v4.50 | Function declarations only for anything a render can call; `tests/startup-test.js` |
| An apostrophe inside a single-quoted string | several | Write "it is" or `’`; the script-parse check before every test run |
| A `//` comment in the middle of a long line cut the rest of the line | v3.64, v4.48 | Use `/* */` mid-line |
| A bet placed at a book still shown as bettable (wording differs) | v4.25, v4.39, v4.40, v4.47 | `propSame`, `glTeamSame`, `fillPriorFor`; `tests/prop-prior-test.js`, `tests/novig-plus-test.js`, `tests/fill-prior-test.js` |
| Clearing saved results to force a regrade lost them | v3.94 | Grade first, replace only when the new grade exists |
| A warning that moved the board | v4.46 | Fixed bars only; `tests/board-scroll-test.js`, `tests/editor-stays-test.js` |
| A test passed on a file being edited mid-run | v4.50 | Run the suite on a snapshot or stop editing |
| A random generator that repeated after 10,000 draws | v4.52 (caught in review) | mulberry32 in `tierCmp`; `watchStats` still uses the old one (open) |
| A count on screen that did not match the list ("Novig 53") | v4.50 | Count after every filter |
