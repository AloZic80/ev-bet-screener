# Para ChatGiPiTiTi — 0xBeta Screener v5.77 and Worker v3.92 (2026-11-28)

**For:** ChatGPT (El Consultor). **From:** El Capataz (Claude Code), at the owner's ask.
**Your job:** read this, check it against what you know, and send back questions and objections. Your reply is a proposal, not a go.

## What the app is
A personal betting screener for Alonzo and Augi (props.0xbeta.dev, one file `index.html`) plus a Cloudflare Worker (api.0xbeta.dev) that holds prices and keys. The Worker's hands-free engine places $1 Novig moneylines by itself; the app reads Novig's fills back from the Worker and puts each bet in the Bet log.

## What was asked
Owner, 2026-11-27: a Novig bet he pressed Add on was gone ("i dont see this bet. it asked if i want to add, and i did but i dont see it anymore"); bets "that contradict themselves" (a real DEN -1.5 bet next to bets that said the Steelers would win); the same bet in the log twice. Then: "use the NOVIG API to come back and add the bets made today correctly first."

## What was found (reproduced on the live v5.76 code)
1. A Novig tennis moneyline has no team code. The app logs a fill by itself only when it has one, so the tennis bet waited in From your books.
2. Pressing Add opened the + Add a bet form. It has no tennis. It stayed on NFL, on the first game in its list, with the away team selected, and the tennis bet's cost and price filled in.
3. Pressing Save bet logged that NFL team's moneyline and tied the tennis fill to it. In the reproduction "V. Lepchenko to win, $0.98 at 22.0%" became "PIT Moneyline, Novig, +355, $0.98". ESPN then graded it on the football game.
4. A side named in full words ("Chiefs") was saved the same way as the away team, which can be the opposite team.
5. Hands-free began betting tennis in Worker v3.70 (2026-11-27 1:24 AM CT). The app was not taught to log tennis.

## What was built
- **Worker v3.92 (read-only):** reads Novig's own history. A closed market keeps its name (`GET /v3/history/markets/<id>`); each bet carries its league, sport, event wording and the other side's name (`/v3/catalog/events/<id>`); each settled position carries Novig's grade (`GET /v3/history/positions?status=SETTLED`: WIN, LOSS, PUSH or a fair-value number), cached 2 minutes. 16 new checks; all 22 Worker test files pass.
- **App v5.77:** a side named in words is logged by itself under those words, with the league, match and start; Novig's result grades the bet tied to that outcome (a result you set yourself still wins); the Add form picks no game and no team for a book bet and refuses to tie it to boxes that say something else; bets already saved wrong are listed at the top of the Bet log with "Fix it from Novig" (old values kept in the bet's edits, `snap` untouched) and "Leave it"; a card's Save checks the log for the same bet; a named side matches a logged bet by whole words only (it matched any piece of a word: the code NE inside "Sinner"). The v5.76 backup journal no longer calls a bet "gone" when it was taken out on purpose (Easy's Undo, Delete all, a sync merge), is stored packed, and never takes the room the log needs. 50 new checks.

## Second review, before anything was published (2026-11-28, about 1:30 AM to 2:10 AM CT)
Two independent reviewers read the two changes. They found real faults; all are fixed and each has a check that fails on the build before the fix.
- **A second row.** The new whole-word name rule had no "cannot tell". A bet already in the log as `DEN` plus a Novig bet named "Denver Broncos" became two rows (proven by running). Now the rule answers yes, no or cannot tell: the row's own game teams (one must fit better: "Los Angeles Chargers" is not the Rams), the same words, the league's team list (NFL, MLB), and otherwise a code that could be short for the words is "cannot tell". Cannot tell never ties and never adds: the bet waits in From your books, names the row it may be, and offers **It is that bet** next to **Add**.
- **The other side of a market.** `settlementFor` (Check results) matched a book result by book and market only. With both outcomes held it took whichever row came first. Now a result that names its outcome is taken only by the bet holding that outcome, in all three places.
- **Older copies of the app.** Worker v3.92 now sends Novig's results only to an app that asks (`nv=1`, v5.77 and later). A v5.76 copy still open on a phone gets exactly what v3.91 sent.
- **The Worker's timer.** Cloudflare allows 50 outside calls per timer run, shared with hands-free. The new look-ups could have pushed the 5-minute pass from 27 calls at most to 46. It is held at 27. A refused results read is now retried after 5, 10, 20, 40 minutes, then hourly; an event Novig never returns after 30 minutes, 1, 2, 4, 8, 16 hours, then daily.
- **A second look at the fixes** found one more wrong tie (a short name inside the words outranked the other team's exact name: "Florida State" was taken for Florida) and three small Worker points (the results read could lose its call to name look-ups; a wait was written down as an error every 5 minutes; no overall time allowance for look-ups). Fixed the same way, with checks.
- **Smaller:** the repair list also finds a side named in words saved as the other team; Fix keeps a result typed by hand unless Novig's own result is in hand; two positions on one outcome (two wallets) are two receipts; the backup journal no longer calls a bet "gone" after Easy's Undo, Easy's Remove or "forget".

## Tests
App: `tests/v577-novig-names-test.js` 79 checks; the full suite is 218 files (see the pull request for the run on the exact commit). Worker: `test/novig-results-test.mjs` 29 checks; all 22 Worker test files pass.

## The numbers
Example: V. Lepchenko, 4.44 contracts for $0.9768 (22.0%), Novig paid $4.44, profit $3.46. Saved wrong it read as a $0.98 loss on a football game: a $4.44 swing on a $1 bet.

## What to check (objections, not code)
1. Fix it clears a result that did not come from the book (it was another game's) and takes Novig's. Is there a case where the old result should stay?
2. A Novig market settled at fair value (a decimal, not WIN or LOSS) is left without a win or loss. What should the log record for it?
3. The duplicate check calls two saves the same bet when the day, kind, name, line, side and book match and the stakes are within 4%. Too loose or too tight?
4. Should the Autopilot be kept off any sport the app cannot grade without the book's own result?
