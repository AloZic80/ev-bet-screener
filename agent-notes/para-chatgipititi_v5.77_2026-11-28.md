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
- **App v5.77:** a side named in words is logged by itself under those words, with the league, match and start; Novig's result grades the bet tied to that outcome (a result you set yourself still wins); the Add form picks no game and no team for a book bet and refuses to tie it to boxes that say something else; bets already saved wrong are listed at the top of the Bet log with "Fix it from Novig" (old values kept in the bet's edits, `snap` untouched) and "Leave it"; a card's Save checks the log for the same bet; a named side matches a logged bet by whole words only (it matched any piece of a word: the code NE inside "Sinner"). 42 new checks.

## The numbers
Example: V. Lepchenko, 4.44 contracts for $0.9768 (22.0%), Novig paid $4.44, profit $3.46. Saved wrong it read as a $0.98 loss on a football game: a $4.44 swing on a $1 bet.

## What to check (objections, not code)
1. Fix it clears a result that did not come from the book (it was another game's) and takes Novig's. Is there a case where the old result should stay?
2. A Novig market settled at fair value (a decimal, not WIN or LOSS) is left without a win or loss. What should the log record for it?
3. The duplicate check calls two saves the same bet when the day, kind, name, line, side and book match and the stakes are within 4%. Too loose or too tight?
4. Should the Autopilot be kept off any sport the app cannot grade without the book's own result?
