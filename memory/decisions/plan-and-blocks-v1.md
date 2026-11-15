# My plan, the 1,000-bet blocks and the band study (plan-and-blocks-v1) · active since v5.10

Owner, Sun 11/15: "id say 11/11. So, do your other recomendations to tell the other Brujo and such apart. BUILD IT ALL". Earlier: "i'll still want
them there, just in case im feeling like i just came back from the future. But, i already like that the app tells me already that I SHOULD NOT bet
them, nor the Coin Flips either". The study rules are in `agent-notes/band-study-plan_2026-11-15_v1.md` (CC-2026-11-15-01). Sally answered with
safeguards in her reply to CC-2026-11-15-06 (part C); they are proposals under review (CC-2026-11-15-08), not agreed yet.

## My plan (a reminder only)
- Settings › My plan: La Contadora's chance at least `planMin` (default 50%) since `planSince` (default 2026-11-11). 0 turns it off; a future date
  keeps it off until that day. `planSetAt` records when the date was last changed (the default date uses `PLAN_SET_AT`, 11/15 12:40 AM CT). All
  three are settings in `mbev.cfg` and sync with them.
- Cards under the minimum say "Outside your plan · you bet 50% and up since 11/11" (muted, never red); table rows show "Outside your plan" (full
  sentence on hover); chance tabs whose whole range is under the minimum get "· outside your plan" (on a phone one muted line under the tabs instead);
  the bet form and + Add a bet show it with the chance / decision line, on the side the verdict bets; the #1 math pick banner adds "· outside your plan".
- **It never changes a stake, the floor, a BET / SKIP, Kelly, a cap, the order or which bet is #1.** The Brujo and Coin Flip tabs stay.

## The 1,000-bet blocks (Performance, under the Scorecard)
- Block 1 = the 1st to 1,000th Scorecard bet placed since `planSince` (order: placedAt, else snap.at, else the bet's date), block 2 = 1,001–2,000,
  block 3 = 2,001–3,000. Free bets and $0 stakes take no place (the Scorecard never counts them as settled).
- Each block is judged alone by the Scorecard's own code (`scoreSet`, `scBoots`, `scVerdict`, moved out of `renderScorecard` word for word; the
  Scorecard's output is byte-identical). The head-start note says how many settled bets (and their profit) were already known when the date was set:
  on the owner's 11/14 export, 32 settled bets, +$32.68.

## The band study
- The official 5-point bands never change. Reports › By › "Band, 2.5% steps (exploratory)" reads `snap.act` saved before the game only; leads, not
  answers. At 500 settled study bets: one written guess with exact edges; tested only on bets after it is written. bands-v2 only if it passes there;
  v1 is kept. Proposed by Sally, under review (CC-2026-11-15-08): the guess also names its metric, direction, minimum future sample (at least 100 new
  outcomes and 50 games, per side or together to be settled), statistical rule and treatment of pushes / repeated tickets; the 11/11 start is labelled
  as chosen after seeing its first days, and the head start is not evidence. Known gap: the 2.5% view shows what the Reports page holds (its period
  and filters, all bet kinds), not only the study's Scorecard bets since 11/11.

## Tests
`tests/v510-test.js` (54): the settings, the reminder at 4 widths, the tabs, the blocks against the Scorecard run on each block alone, the head-start
note, the 2.5% grouping, and the Scorecard / Said vs won pinned to hashes taken before v5.10.
