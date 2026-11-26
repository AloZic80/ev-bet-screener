# Auto betting (decision file, 2026-11-25)

**Owner, 2026-11-25:** "this Auto Betting will be $25 throughout EACH day. for now. and then we will modify." Earlier: "what i want is for it to do bets for me while i work, just like other apps do for stocks"; "We will have limits, as we do already."

## What is decided
- The budget for betting that Claude does for the owner is **$25 per day in total**, for now. His own bets and earlier bets are not counted ("dont worry about what i had").
- The owner will change the number later, in his own words.

## What is NOT decided or built
- Nothing places a bet by itself. Today: Claude prefills in the owner's Chrome, **stops before Place**, the owner clicks Place, then Claude records it (skill `.claude/skills/prefill-bet`).
- Claude pressing Place, and any autopilot, need the owner's written rule here and in `CLAUDE.md` first, plus: El Licenciado's terms review of Novig (gate F), a hard cap enforced in code (not by instruction), a fresh price check before each bet, an audit log and a kill switch.
- Plan agreed in chat (stages): 1 supervised prefill (now); 2 "place it" per bet; 3 paper-money autopilot on the Worker; 4 real-money Worker autopilot with the cap in its code. The owner wants Stage 4 eventually ("while I work").
- Personal edition only; never part of a paid build.

## How the $25 is used today
Batch prefill runs count each prefilled and placed bet against $25 for the day (America/Chicago day), by the real fill. Past $25: stop and say so.

## Test run authorized (owner, 2026-11-25, in his words: "i want to do a test run with $10 Bets, so 10, $1 bets Auto")
For THIS test run only, Samson (Claude Code on the owner's Mac, `claude --chrome`) may press Place itself, under hard limits: Novig only; only approved Novig picks the app lists as bettable and not already bet; exactly $1 per bet; at most 10 bets and $10 in all, and never more than $25 a day; one pick at a time; a fresh app price check (Open the book) before each; the live slip must match the pick exactly (event, team or player, market, line, side) with a price at or below OK up to; any warning, login, changed price or terms prompt, missing value or less than $1 available means SKIP (never place). After each Place: read the order on Novig, then the app's Bet log (the app logs Novig fills itself; never press I bet this if the entry is there). One line per bet or skip in `agent-notes/samson-log.csv`. Stop after the 10th bet, on the first error, or if $25 would be passed; "STOP" from the owner stops at once. No app code is edited. This is guarded automation, experimental, unverified under book terms (Novig terms not fully read; gate F). The limits are instructions to the agent, not a technical lock. After the run the owner decides what next; any further auto placing needs a new go.

## Order of the limits (owner, 2026-11-25: "$25 will start after the $10 we start TODAY")
1. **Test run first, starting today:** 10 bets of $1, $10 in all. While it runs, $10 is the total; the $25 does not apply yet.
2. **After the test run is finished** (10 bets done, or the owner ends it): the **$25 a day** budget begins, for now. The owner will change it later in his own words.
3. Nothing in step 2 lets Samson press Place by itself: the exception above covers the $10 test run only. The $25 a day is the budget for the supervised loop (the owner places) until he says otherwise.

## Update 2026-11-25, 5:58 PM CT: Samson declines to press Place
Samson (Claude Code on the owner's Mac) declined to press Place, even with the owner's authorization above, and said it is a limit on what it does in a browser that permission does not lift. The cloud Claude does not try to work around that. So **the "Test run authorized" exception for Samson pressing Place is not in effect.** The $10 test run (10 bets of $1, Novig) goes ahead **supervised**: Samson finds the pick, runs the fresh check, checks the slip and sets $1, the **owner presses Place**, then Samson checks the order, the Bet log and writes the Samson-log line. The $25 a day (from tomorrow) is the budget for that same supervised loop.
The way to "bets while I work, like stock apps" is Stage 4 (a Worker autopilot on the owner's own Worker, Novig's own API, the cap in code, kill switch, audit log), built with the owner's go after the terms review (gate F), paper mode first. The earlier idea of a browser agent clicking Place (Stage 2) is dropped.

## Parole bait orders for Samson, prepare only (owner, 2026-11-25: "create isnt POST...thats me")
Samson may CREATE (prepare) a Parole bait order on Novig: it fills in the market, side, line, bait price and size from the app's Parole view, and stops before the post button. **The owner posts it.** Samson never presses Post, Place or Submit.
**Open orders count against the $25 a day while they are open**, not only when they fill (a dozen resting orders could all fill). Before preparing one, Samson adds today's fills plus open orders (Samson log and the app) and skips the order if it would pass $25. Log lines: "bait order posted" (price, size, open), "filled" (the app logs Novig fills itself: check the Bet log first, never press I bet this if the entry is there), "cancelled". The 10 x $1 test run stays first and separate.
