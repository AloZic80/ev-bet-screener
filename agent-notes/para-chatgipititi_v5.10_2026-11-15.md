# Para ChatGiPiTiTi · v5.08 and v5.10 (To win + Total payout, My plan, 1,000-bet blocks) · 2026-11-15

Ref: CC-2026-11-15-07 · from El Capataz (Claude Code) · times America/Chicago

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is a one-file price checker for sports bets, built for Alonzo and Augi. It finds bets priced better than their true chance
(La Contadora: min(model, market + 0.35 × (model − market))), sizes the stake and says what to type at the book. It also keeps an honest record. It is a buyer's tool, not a seller.

## Version note
This build was made as "v5.09", but another session published a different v5.09 first (the "also at" strip with exchange prices, PR #150, 1:14 AM). So the To win / Total payout build ships as **v5.10**, together with the plan reminder and the 1,000-bet blocks (also v5.10). The numbers after it do not move: v5.11 parlays in + Add a bet, v5.12 forecast recovery, v5.13 Paper money. Notes sent before this one (CC-2026-11-15-06 part F) call it v5.09.

## What was asked
- **v5.08:** Alonzo sent his Novig slip ("Adam Fantilli 3+ Yes · Shots On Goal"). Novig's plain NHL "Shots" is shots on goal. All 61 NHL "Shots" bets in his log were placed at Novig.
- **v5.10:** "i want it to show both. Because it does say, TOTAL WIN or To Win." The trigger was a Bovada ticket (Trent Walker, 11/13): a $1.52 stake at 2.00 shows
  "Winnings +$3.04". That is the total return, stake included, and it had been typed into To win, so the bet showed $3.04 profit instead of $1.52.
  He also found that the parlay form had no PrizePicks: "you dont even have PrizePicks".
- **v5.10, part 2:** "id say 11/11. So, do your other recomendations to tell the other Brujo and such apart. BUILD IT ALL". Since 11/11 he bets only
  La Contadora chances of 50% and up; he keeps the Brujo and Coin Flip tabs ("just in case im feeling like i just came back from the future") but wants
  the app to say they are outside his plan, and 1,000-bet blocks from 11/11 ("the first 1K is a starting point, ... the next 1K Confirms it and the 3rd
  1K Reconfirms it").

## What was built
- **v5.08 (live 12:44 AM):** one switch. Reports › Market now merges plain NHL "Shots" into Shots on goal, with evidence "book-rule-confirmed" (your rule for the
  alias). Grading was already the same.
- **v5.10 (display and input only):**
  - The bet form (I bet this, + Add a bet, Bet log › edit) shows **To win** (the profit; still the only box Save keeps) and a new **Total payout** (stake included)
    side by side, linked both ways. Type one and the other fills in. A new stake keeps the box typed last and moves the other one. For a free bet, Total payout = To win.
  - **Two gentle lines, never blocking:**
    - When To win equals Stake × decimal odds (± 1¢), the app says "This looks like the total payout (stake included). To win would be $X", with a "Use $X" button.
    - A Total payout under the stake says a total payout includes the stake.
  - **Open single bets show both amounts** in the Bet log row and in Reports › Open bets, e.g. "to win $1.52 · total $3.04". Parlays are unchanged.
  - **The parlay form's book list** adds PrizePicks, Underdog, Sleeper, Betr and ParlayPlay at the end. The old options keep their order.
  - **Review fixes:**
    - Emptying a Total payout that was filled in for you keeps a To win you typed. For a boost, Save keeps the boosted profit, not the price's.
    - The two boxes wrap together.
    - On a phone, the boxes, the check line and the Real money box stay on screen.
- **Unchanged:** Save, betProfit, the saved fields, the % boxes (Cost, @ %, Pays back), grading, stakes and decisions.

- **v5.10, part 2 (display only; policy plan-and-blocks-v1):**
  - **Settings › My plan:** La Contadora's chance at least 50% since 11/11 (a reminder only; 0 turns it off). Cards under it say "Outside your plan · you
    bet 50% and up since 11/11" (muted grey, never red); table rows say "Outside your plan"; Suertudo and Brujo get "· outside your plan" (on a phone,
    one muted line under the tabs); the bet form and + Add a bet show it on the side the verdict bets; the #1 math pick banner adds it too.
  - **Performance › Your 1,000-bet blocks** (under the Scorecard): block 1 = the 1st to 1,000th Scorecard bet placed since 11/11, then 1,001–2,000 and
    2,001–3,000. Each block is judged alone by the Scorecard's own code (moved out word for word; the Scorecard's output is byte-identical). The head-start
    note: on his 11/14 export, 32 settled bets (+$32.68) were already known when 11/11 was chosen.
  - **Reports › By › "Band, 2.5% steps (exploratory)"**: snap.act saved before the game only.
  - Never changes a stake, the floor, BET / SKIP, Kelly, a cap, the order or which bet is #1.

## Numbers
- **The Trent Walker case:** $1.52 at +100. To win 1.52 fills Total 3.04. Typing 3.04 into To win shows "To win would be $1.52"; Use $1.52 gives To win 1.52 and
  Total 3.04. Save keeps towin 1.52, so the profit if it wins is +$1.52.
- **Other cases:**
  - −110 on $10: To win 19.09 raises the line ("To win would be $9.09"); 9.09 raises nothing.
  - A boost: To win typed as 9.50 at −110 stays 9.50 after the auto-filled Total payout is emptied.
  - A free bet with To win 1.52 gives Total 1.52.
- **Tests:** tests/towin-total-test.js has 48 checks, including the board table on a phone at 360, 390 and 414 px. tests/pickem-books-test.js has 4.
  The full suite (`node tests/run-all.js`) passed on the build alone: 128 of 128 files, "All tests passed" (Sun 11/15, 4:53 to 5:18 AM). It runs again on v5.10 with main's v5.09 merged in before publishing.

- **v5.10 part 2 tests:** tests/v510-test.js has 54 checks (the Scorecard and Said vs won pinned to hashes taken before v5.10; each block checked against
  the Scorecard run on that block alone).

## Questions to check
These 4 were already sent in CC-2026-11-15-06 (part F), and Sally answered them (F1 a Free bet tick in both forms, F2 rename to Profit $, F3 a soft reverse check, F4 keep the line with new words). They are kept here for the record; the follow-up waits for El Capataz's check and the owner's BUILD.

1. **A free bet typed as Total payout where there is no Free bet tick.** Only Bet log › edit has the tick. In + Add a bet or I bet this, a free $10 bet at +150 typed
   as Total payout 15 saves To win 5, not 15. Ticking Free later does not fix the saved To win. Options: add the Free bet tick to those two forms (a new saved input),
   or add one line next to Total payout ("A free bet? Type its To win: its stake does not come back."). Which is better for someone new to betting?
2. **One word, two meanings.** At Bovada, "Winnings" is the total payout, and the new Total payout tip says so. But the Bet log editor's Real money box has a
   "Winnings $" field that means profit only (Performance and ROI use it). Rename that field "Profit $", or keep the name and add a line?
3. **No reverse check.** A profit typed into Total payout on an underdog (e.g. +150, $10 stake, 15 typed as the total) raises no line. Only "less than the
   stake" catches it, and only on favourites. Is a check worth it, or would it nag on real totals?
4. **A new small line in the Bet log row** ("to win $1.52 · total $3.04", open single bets only). The row had no To win before. Useful, or noise?
