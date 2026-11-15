# For Sally · every open question in one note · 2026-11-15

Ref: CC-2026-11-15-06 · from El Capataz (Claude Code) · 5:07 AM America/Chicago · nothing new built on these · collects CC-2026-11-15-05, CC-2026-11-15-02,
CC-2026-11-15-01, CC-2026-11-14-20, CC-2026-11-14-19 and the v5.09 questions

Sally, this is every question still open for you, in one place. Parts A and B each hold up a build. Parts C to F are about things already live or going
live this morning; they change only words or rules. Answering by number is enough (for example "A2: c").

The app is the 0xBeta Screener (props.0xbeta.dev), a one-file price checker for Alonzo's sports bets. La Contadora's chance is
min(model, market + 0.35 × (model − market)), and it drives every decision.

---

## A. v5.12 card_tapped: two facts I gave you were wrong, 3 questions (CC-2026-11-15-05) · holds up v5.12

While checking the v5.12 build plan against the code, a reviewer found that two facts in my note CC-2026-11-15-03 were wrong. Your rules C1 and C3 were
written on those facts, so I am not building the trigger or the team rule until you answer. The rest of the agreed scope (CC-2026-11-15-04) is unchanged.

**The corrected facts**
1. **Board rows have no "open slip ↗" link.** Only the cards have that text. A board row opens the book's slip from its book logo or name. On a phone the
   card's one-tap slip link is the price chip. So C1 as written records taps only from the cards' "open slip ↗": never from the board table, and never
   from the phone's price chip.
2. **A Novig player-prop fill arrives with no team names.** The Worker reads teams only from a game's description, and a player prop's description has none.
   Kalshi sends one joined code (for example "LALBOS") that the app does not split into two teams. So C3 as written ("unknown teams → ineligible") matches
   no exchange player prop at fill time. None of Alonzo's NHL shots fills would ever get a card forecast. Grading fills in the teams later, from ESPN. In his
   backup, 17 of the 26 Novig props logged without a card have teams now and 9 do not (7 of those 9 settled).

**A1 · Which taps count (C1)**
- (a) As written: only the cards' "open slip ↗". The board table and the phone's price chip never record.
- (b) Any real tap that opens this card's or this row's own-book slip: "open slip ↗", the card's price chip, the card's book logos, and the row's book logo
  or name. Never "Other books", the Bet log, other lists, the slip bar, scans, or clicks made by a script.
- My recommendation: (b). On a phone the price chip is the tap Alonzo uses most, so (a) would leave most phone bets with no card forecast.

**A2 · Teams (C3)**
- (a) Keep C3 as written. A fill's teams count as known once ESPN names its game: the grader's own lookup gives ESPN's teams and start, and when it also
  gives the event id, that must equal the tap's. The match then comes after the game, from the pass after grading, on the device that tapped. Expired taps
  stay on that device for 3 days for this.
- (b) At fill time: the card must have ESPN teams and start; the fill's start must be within 90 minutes of the card's (Novig's tolerance since v4.72); fill
  teams, when present, must equal the card's, and a conflict rejects. Missing fill teams are allowed for player props and spreads, never for totals.
  Player, stat, line, side and book are still exact.
- (c) Both: match by (b) at fill time, then check again with (a) when ESPN names the game. If ESPN's game contradicts the card's teams or start, the copy
  is hidden as "no longer describes its bet" (never deleted or rewritten).
- My recommendation: (c). Alonzo sees the band right away, and C3's guarantee still holds once the game is known (about 10 more lines and 3 tests).

**A3 · "The latest valid tap" across two devices**
- A tap is saved at once but uploads about 3 seconds later. On a phone, the book's app opens right after the tap and iOS pauses the page, so the upload can
  wait. If the Mac reads the fill first and holds an OLDER tap of the same card, it uses that one.
- (a) Accept it and write it down. It needs a tap of the same card on both devices, and it is rare.
- (b) When a strictly later valid tap (still at or before placement) arrives, add ONE superseding copy; the first copy stays for audit (about 15 lines, 2 tests).
- My recommendation: (a) for v5.12.

**Defaults the build uses unless you object**
- **Price gap between card and fill (not in the scope):** the recovery's rule applies. Over 8 points rejects the match as probably another market; 3 to 8
  points adds a PRICE MOVED tag. The gap never changes the class, and EV is always at the fill price and fee.
- **Expired taps:** at kickoff or tap + 24 h a tap stops syncing and never matches a fill placed after it. It stays on the device that made it for 3 days,
  so a fill placed in time but read later still matches.
- **Minutes shown:** primary rounds down and display-only rounds up, so a display-only tag never reads "15 min".
- **A device clock off by more than 5 minutes:** the corrected time decides. A tap that falls after the placement on the corrected clock is not a candidate.
- **Kalshi start time:** I will check that a real Kalshi fill's start time is the game's start before the build. If it is not, Kalshi taps wait for A2(a)'s
  ESPN check; nothing is widened.

The reviewer also found 11 problems in my build plan, all fixed there; none changes a rule you agreed to. Two examples: a price-history clean-up would
have kept extra old moneyline histories, which feed the long-shot limits; and an id match could pair a Kalshi NO fill with a YES tap. No decision, stake,
floor, fee or cap changes, and moneylines stay out of v5.12 entirely.

---

## B. "Paper money": shadow bets on the cards Alonzo skips (CC-2026-11-15-02) · holds up v5.13

**Why.** Since 11/11 Alonzo bets only La Contadora chances of 50% and up (his plan), so the Coin Flip (45–50%) and Unlikely (<45%) cards get no new
results. He likes Coin Flips ("they have made me money") and wonders if the money sits near 48.5%. His log so far says the opposite:
- 45–47.5%: 9–1, +$24.30
- 47.5–48.5%: 4–5, −$3.54
- 48.5–50%: 9–9, +$6.20
- 36 of 37 were on the model's forecast

That is why the band study tests guesses on NEW bets only. With no new Coin Flip bets there is nothing to test, so he asked for shadow bets: "Shadow
Bets!! Hell yeah!! ... like Paper Money".

**Proposal** (it reuses the Watch v2 machinery from v4.44–v4.52, and paper bets never appear in money views)
1. **Which cards:** every pregame card that La Contadora rates BET (passes the floor, has a stake) whose chance is under his plan minimum (50%, set in
   Settings in v5.10). One paper bet per outcome (game, player or team, market, line, side), at the card's shown book.
2. **When it is frozen:** the first sighting is saved whole. The cutoff snapshot 5 minutes before kickoff is the primary record when seen within 30 minutes;
   otherwise the first sighting is. Never after kickoff, and no AWOL or old-price cards.
3. **Paper stake:** a flat $1 per paper bet for the statistics, plus the app's own Kelly stake saved alongside ("what the app would have staked").
4. **If he bets it for real,** the real bet counts as real. The paper record is kept, marked "bet for real" and left out of the paper totals.
5. **Grading** comes from ESPN, like real bets. Paper bets are never in TODAY, the Bet log totals, the Scorecard or the 1,000-bet blocks.
6. **Report:** Reports gets a "Paper money" section with settled count, won–lost, paper profit and ROI (flat $1 and Kelly), game-clustered ranges, CLV, the
   Read word, and the same By groupings for paper bets only. Its words: "Paper money: what these cards would have done. No money was bet."
7. **For the band study:** paper bets from 11/15 on can test the written guesses (e.g. "48.5–50% beats 45–48.5%") on new outcomes, under the plan's rules.
8. **Sync and storage** work like Watch records: one record per key, the earliest valid pre-start snapshot kept whole, conflicts kept apart, a cap, and
   pruning after grading and sync.

**B1.** Include Unlikely (<45%) too, or Coin Flips only? I lean to both, reported apart: under 45% is the other half of his question.
**B2.** Which snapshot is primary: the cutoff (5 minutes before) or the first sighting? Watch v2 uses the cutoff as primary, and I lean the same.
**B3.** Should paper bets also cover SKIP cards in 45–50% (not just BET), so the study sees the whole band? That would grade the price, not the app's call.

---

## C. The band study plan (CC-2026-11-15-01) · please agree or change

Alonzo chose 11/11 as the start of his 1,000-bet blocks and of a band study. The rules are frozen before the bets come in:
1. The official 5-point bands are never redrawn.
2. For the first 500 study bets, an exploratory 2.5-point view in Reports gives leads only, with the BH many-group check.
3. At 500 bets, ONE written guess with exact edges, tested only on the bets that come after it.
4. A new band set (bands-v2) only if the guess passes there; v1 is kept.

Study bets are Scorecard bets only, with La Contadora's chance saved before kickoff. The app shows the head start from choosing 11/11 after a good week:
32 settled bets, +$32.68. The blocks and the 2.5-point view are in v5.10, going live this morning.
At 500 bets a 2.5-point band holds about 50–80 bets, and its win-rate range is about ±12 points, wider than the band, so 500 gives leads, not answers.
At about 10 bets a day, 500 settled study bets arrive around the end of December.
**C1.** Anything you would change?

---

## D. "So far" report, live since v5.07 (CC-2026-11-14-20) · words and rules only

**D1 · A filter shrinks the many-group check.** With a filter on (e.g. NHL only, by Sport) the check covers 1 row, so its bar is 10% instead of 1%. The same
bets can then read "Holding up so far" filtered and "Unadjusted lead" unfiltered. The card now says when filters narrowed the check. Should the check always
run on the unfiltered grouping, or cap the word at "Leaning" when a filter is on?
**D2 · "Unadjusted lead" on a losing row.** A 100/50 row whose 95% range is entirely below zero but fails BH reads "Unadjusted lead · did not survive the
many-group check", listed under "Down so far". Should the losing side get its own word (e.g. "Unadjusted drop")?
**D3 · Three "Early sample" thresholds on one Reports page:** the headline (30–99 tickets), Said vs won (30–99 outcomes or under 50 games) and the By table's
Read (30–49 outcomes or under 25 games). Align them, or rename one?
**D4 · Only one row eligible.** "Did not survive the many-group check" would really mean the row failed its own 10% test. Reword that case?

---

## E. Kalshi in 0.01 shares, live since v5.05 (CC-2026-11-14-19) · words and rules only

**E1.** "Price stale · re-check" at 30 minutes sits on cards that are still actionable, while the 12-hour ⏱ Old tab also says "stale". Keep both, or call
the 30-minute state "Price 30m+ old · re-check"?
**E2.** Should the "Make my own" ladder move to 0.01 shares now, or wait for a maker fill to confirm that fractional maker orders work?

---

## F. To win and Total payout, v5.09 (going live this morning) · words and rules only

Alonzo: "i want it to show both. Because it does say, TOTAL WIN or To Win." A Bovada ticket showing "Winnings +$3.04" for a $1.52 stake at 2.00 is the
total return, and it had been typed into To win. The bet form now shows To win (the profit, still the only box Save keeps) and Total payout (stake
included) side by side, linked both ways. A gentle line appears when To win equals Stake × decimal odds: "This looks like the total payout ... To win
would be $1.52", with a "Use $1.52" button. Save, profit and saved fields are unchanged.

**F1 · A free bet typed as Total payout where there is no Free bet tick.** Only Bet log › edit has the tick. In + Add a bet or I bet this, a free $10 bet at
+150 typed as Total payout 15 saves To win 5, not 15, and ticking Free later does not fix the saved To win. Options: add the Free bet tick to those two
forms (a new saved input), or add one line next to Total payout ("A free bet? Type its To win: its stake does not come back."). Which is better for
someone new to betting?
**F2 · One word, two meanings.** At Bovada "Winnings" is the total payout, and the new Total payout tip says so. But the Bet log editor's Real money box has
a "Winnings $" field that means profit only (Performance and ROI use it). Rename that field "Profit $", or keep the name and add a line?
**F3 · No reverse check.** A profit typed into Total payout on an underdog (e.g. +150, $10 stake, 15 typed as the total) raises no line. Only "less than the
stake" catches the mix-up, and only on favourites. Is a check worth it, or would it nag on real totals?
**F4 · A new small line in the Bet log row** ("to win $1.52 · total $3.04", open single bets only). The row had no To win before. Useful, or noise?
