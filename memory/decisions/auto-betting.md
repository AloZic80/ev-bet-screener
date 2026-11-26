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

## Worker autopilot, paper first (owner, 2026-11-25: "A, paper first")
The owner chose option A: the app triggers, **the owner's Worker places the orders through Novig's API**, with the $25 a day in code. Paper first (Novig's paper environment, play money). Plan: `agent-notes/worker-autopilot-plan_2026-11-25_v1.md`; docs findings: `agent-notes/novig-api-findings_2026-11-25_v1.md`. **Samson does not place bets**: the Worker will. Live needs the gates listed in the plan (paper clean, terms read, the owner's written rule, a funded $25 subaccount and key set by him, a security review, the 3-day Novig app check, his go on each merge). Never use promo credits. Nothing is built yet.

## Paper for two weeks, real money for Thanksgiving (owner, 2026-11-25: "2 weeks of Paper, but $10 daily for 2 days of actual. For my Thanksgiving pressing")
- **Paper:** the Worker autopilot runs on Novig's paper environment for about two weeks (plan: `agent-notes/worker-autopilot-plan_2026-11-25_v1.md`).
- **Real money, 2 days:** a budget of **$10 a day** for **Thursday 2026-11-26 and Friday 2026-11-27** (Thanksgiving). **By tomorrow the Worker autopilot cannot be built, tested and reviewed**, so these two days run the **supervised** way: Samson prepares, the owner presses Place (or Post for a bait order). Open orders count against the $10. This replaces the $25 a day for those two days only; the $25 a day (for now) applies after, still supervised until the Worker is live. Needs the owner's confirmation that "actual" means supervised.
- The 10 x $1 test run from 2026-11-25 stays separate; it has 0 of 10 done.

## Today's budget (owner, 2026-11-25: "can we do $7 today?")
Today (Wed 2026-11-25) the owner may bet up to $7 more, as $1 bets, supervised (Samson prepares, the owner presses Place), only on approved Novig picks. With the $1 CLE bet, today's total is at most $8. No picks are forced: if none is approved, nothing is bet.

## Correction: the real-money total is $27 (owner, 2026-11-25: "total $27")
Real-money budget for the three days: **Wed 11/25 $7** (the $1 CLE bet is not counted), **Thu 11/26 $10**, **Fri 11/27 $10**: **$27 in all**. Supervised (the owner places by hand; Samson may prepare). This replaces the earlier line that said today's total is at most $8.

## Order sizes for the Worker autopilot (owner, 2026-11-25: "for the paper, it can be any > for the real bets, only $1")
**Paper:** any size (the app's own stake, up to the paper money and the budget). **Real (LIVE):** exactly **$1 an order**; a stake under $1 is refused; the $25 a day stays for both for now. In code: `PRESETS` in the Worker's `src/autobet_logic.js` (branch `claude/novig-sign`, not merged).

## Real money first (owner, 2026-11-25: "NO NO, do REAL MONEY first")
Order of work changed: the Worker places **real $1 orders first**, before the two-week paper run. Safeguards kept: a separate Novig subaccount funded with only $25 (its trading key cannot move money), $1 an order and $25 a day enforced in the Worker's code, a kill switch, an audit log, a short paper smoke test before real money, a human tap first (an "Auto bet $1" button in the Jarvis pop-up) before any automatic trigger, a fresh production management key (the one shown on screen on 2026-11-25 is not used for this), the owner opening the Novig app at least every 3 days (location check), and his go on each merge (the Worker deploys on merge). **Gate F (Novig's full terms) is not closed: the owner's "real money first" is treated as accepting that, unless he says he wants El Licenciado first.** The two-week paper run moves behind this.
