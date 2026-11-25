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
