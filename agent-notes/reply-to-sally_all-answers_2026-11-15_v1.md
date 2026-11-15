# For Sally · my check of your 17 answers against the code · 2026-11-15

Ref: CC-2026-11-15-08 · from El Capataz (Claude Code) · 6:35 AM America/Chicago · nothing built · answers your reply to CC-2026-11-15-06

Sally, I checked every decision against the code (four readers and a critic). Most I agree with as written. **I object to three** (A2's "exactly one
pending tap", D2's "decline" and D4's wording), and I need short answers on the rest. Reply by number (for example "A2-1: yes"). Nothing is built until
we agree and Alonzo says BUILD.

**Version note.** Another session published a different v5.09 (the "also at" strip with exchange prices). So the To win / Total payout build ships as
**v5.10**, together with the plan reminder and the 1,000-bet blocks. v5.11 is parlays in + Add a bet, v5.12 is card_tapped + forecast recovery, and
v5.13 is Paper money. Part F below goes into a small build after v5.11.

---

## A. v5.12 card_tapped

**A1 (b): agree.** Four clarifications:
- A1-1. "Other books" means everything inside the card's "also at" strip. That includes v5.09's live exchange prices and reference-only chips: their
  book logos reach the same slip handler, so we exclude the whole strip. Agree?
- A1-2. The price chip counts on a computer too. It is the same chip and opens the same slip.
- A1-3. Enter on a focused book logo is a real person's action, but the page passes it on as a script click, so as written it would not count. I
  propose counting it (one line). OK?
- A1-4. The fee is added to the frozen record: model, market, act, price, fee, EV and app version. The C2 list had no fee. Also, we read "one shared
  handler … the same atomic snapshot" as: every qualifying tap saves one complete record of the same shape, a second tap is a second record, and the
  match uses the latest (A3). Agree?

**A2 (c): agree, with one objection.**
- A2-1. **Objection:** "exactly one pending tap qualifies" would refuse the common case of two taps of the same card, against C3 and your A3. Our
  reading:
  - all qualifying taps must be for ONE bet (same game, player or team, stat and qualifiers, line, side, book);
  - the latest of them is used, and the earlier ones stay for audit;
  - taps for two different bets that both fit the fill give no automatic link;
  - "pending" includes a tap that expired after the fill was placed.
  Agree?
- A2-2. **A provisional link ESPN never confirms.** The grader stops looking once a bet is settled. In Alonzo's backup, 7 of the 9 teamless Novig props
  were settled without ESPN's teams. Proposal: the link counts, since it passed every fill-time rule, with "Game not yet confirmed by ESPN" in the hover.
  After the game the pass looks the game up itself on ESPN's free scoreboard (no Worker call), so bets settled by hand or by the book still get checked.
- A2-3. **"Matching event/teams/start":** the same ESPN event id when both sides have one, else the same two teams with starts within 90 minutes (a game
  moved by an hour is not a conflict). Agree?
- A2-4. **Kalshi.** A Kalshi fill carries one joined team code (e.g. "LALBOS"). Proposal: it counts as "teams present and agreeing" only when it equals
  the card's two ESPN codes joined, in either order; anything else is a conflict. A Kalshi start can be a placeholder (the ticker's date at noon), which
  fails the 90-minute rule: may such a fill be linked later, once ESPN names its game? And a Kalshi player name built from the ticker can be only an
  initial ("J. Hughes"): it never matches unless the market ids match. OK?
- A2-5. **The Scorecard reads no forecast at all**, so nothing leaves it. The bet's money stays in the Scorecard and the 1,000-bet blocks (it is a real
  bet). Only the forecast leaves the bands, Said vs won, the Edge check, So far and Brier. Agree?
- A2-6. **After an ESPN conflict, no fallback.** The bet stays "no forecast", with the reason kept. A history recovery would most likely come from the same
  wrong card. One ESPN check per bet applies to whichever copy is in use. After a conflict no copy is used, including a later superseding copy. Agree?
- A2-7. **The same game rule for history recoveries.** Do the fill-time rule and the later ESPN check also apply to recoveries from board observations?
  Proposal: yes, one function for both. Otherwise v5.06's "event id, else teams + start" stays there, and no teamless Novig prop is ever recovered.
- A2-8. **Showing the copy that no longer counts:**
  - On screen it reads "CARD FORECAST NOT USED · the card was for a different game". Your sentence is the first line of the hover.
  - Reports adds a separate line: "1 card forecast not used: the card was for a different game".
  - The CSV gets a **seventh** forecast_source value, `card_tapped_invalidated` (scope R2 has six), with exclusion `espn_game_differs`. That is a
    scope change: OK?
  - "Provisional" never appears on screen. The hover says "Game not yet confirmed by ESPN" or "Game confirmed by ESPN".
- Size: about 35–45 lines and 7 tests, not the "10 lines and 3 tests" I told you.

**A3 (b): agree.** Four clarifications:
- A3-1. At most one superseding copy. It holds the latest later tap known when it is written, and a third, even later tap changes nothing. OK as a
  written limit?
- A3-2. A phone that tapped can write the first link or the superseding copy after the bet has settled (the next morning, say). Proposal: allow it, since
  the tap was made before placement and the choice is automatic, and mark the copy "written after the result" so any check can be rerun without those
  copies. Or allow it only while the bet is open?
- A3-3. Only a later tap of the same bet supersedes (as in A2-1).
- A3-4. "Primary eligibility recalculated from the later tap's age" means from that tap's whole record: its age, the card's state at that tap, the price
  gap and the clock rule.
- Size: about 25–35 lines and 6 tests (I told you 15 and 2).

**Defaults: agree.** Our own plan had the clock rule wrong: it made any clock disagreement display-only. I have fixed the plan so the corrected time
decides, as I told you. Three details:
- D-1. "Kept locally for three days" is counted from the tap (tap + 3 days). OK?
- D-2. The corrected clock also decides the 24-hour expiry. OK?
- D-3. The corrected clock also replaces v5.06's recovery rule ("Forecast recovery ambiguous · device times disagree"), so the same clock problem has one
  answer, not two. OK?

---

## B. v5.13 Paper money

**B1: agree (both groups, never added together).**
- B1-1. **"Approved"** is the app's existing meaning (v4.86's `listedOf`): the card passes, is not held at $0 for AWOL or an old price, is not the same bet
  at another line, and is not saved against a red flag. It needs no stake.
- B1-2. **"Fresh":**
  - (a) the card's price was read under 30 minutes ago, and it is not Old or AWOL;
  - (b) the stricter "bettable now" test, which also leaves out model outliers and cards whose best book was checked more than 3 minutes ago.
  I lean (a), with outliers and model-only cards tagged.
- B1-3. **The plan minimum.**
  - Each paper bet saves the minimum it was judged under, and later changes never edit it. With the plan off (0) no new paper bets are made.
  - The box accepts decimals (48.5 works).
  - If the minimum is raised above 50%, do cards from 50% up to it become a third paper group, named by its band?
- Words: "Paper · Unlikely (under 45%)" and "Paper · Coin Flip (45–50%)".

**B2: agree (the near-start price is primary).**
- B2-1. **Which ROIs:**
  - (a) Watch's way:
    - every paper bet at its first price;
    - the paper bets that have a near-start price, at that price;
    - Watch also keeps a 31–120 minute "stale fallback" step apart.
  - (b) A split by which price exists.

  I lean (a), with Watch's 31–120 minute step. Won % and the forecast score come from every bet either way.
- B2-2. **"Observed within 30 minutes"** means the card's price was READ 5 to 30 minutes before the game, so the app has to be open then. In Alonzo's log
  only 8 of 24 recent kickoffs had a bet saved in that window. Should v5.13 re-read exchange paper cards itself in the last 10 minutes, like Watch's
  close scan? That means more Worker calls, and it only helps exchange cards.
- B2-3. **"Valid" at the cutoff** means it is still a paper bet then (BET, under the plan minimum, not AWOL or Old). A card that left the rules before the
  cutoff gets no near-start price, and the reason is kept and counted.
- Words: "Early price only · not checked in the 30 minutes before the game" instead of "First-sighting fallback · not observed near kickoff".

**B3: agree (BET cards only).**
- B3-1. **Is "BET" judged before or after the day and player limits?** I lean before: La Contadora's YES on the bet itself (B1-1), whatever the daily max,
  one bet per player, the game cap or the long-shot allowance did. Otherwise his real 50%+ bets would decide the paper sample.
  - A card held at $0 by a limit is paper: it counts at $1 and is left out of the staked ROI.
  - A card held at $0 for a reason about the bet itself is not paper, because the screener said no. Those reasons are: Kelly under the minimum stake,
    market disagrees, outlier too far below market, long shot (Hail Marys only), and long-shot moneyline with no market price.

  OK?

**Safeguards: agree, with three points.**
- S-1. **Bet for real:** stay out of Paper's money totals (your words), or stay in the $1 totals with a count ("n you also bet for real")? Watch keeps
  chosen bets in so he does not pick the sample: a Coin Flip that climbs to 50% and is then bet would otherwise drop out. I lean to keeping them in,
  marked. "Bet for real" means:
  - a single in the Bet log on the same outcome (player or team, stat, side, exact line, game), at any book, placed before the game;
  - not another line, the other side, a parlay or pick'em leg, or a live bet.
- S-2. **CLV:** the app has closing prices only for exchange cards (Watch's close scan). So either "CLV: exchange cards only" on screen, or no CLV. Which?
- S-3. **Too many numbers for a newcomer.** Two groups, two prices and two stakes make 8 ROI figures. Proposal: one headline per group ("$1 on each, at the
  price near the start") and the rest under "More". Plain words:
  - "$1 on each" and "What the app would have staked (as shown then)";
  - "Won % and forecast score (lower is better)".

---

## C. Band study (C1: agree)

- C1-1. **"Do not treat it as evidence"** is words only: the 32 bets stay in Block 1 and its verdict, as v5.10's agreed rule says. New words: "Block 1
  starts 11/11, a date you picked on 11/15 after seeing its first 4 days: its first 32 settled bets (+$32.68) were already known then. They count in
  Block 1 as a head start, not as proof the plan works." OK?
- C1-2. **"100 new outcomes and 50 games in the compared region":** on each side (the slice and the rest of its band), or both together? We write it in the
  plan, with a power note: 100 a side only catches a very large gap, and a 10-point ROI gap needs about 1,500 a side.
- C1-3. **Cap the 2.5% view at "Leaning" always**, as D1 does for filtered views, since it is exploratory? I lean yes.
- C1-4. **May Paper be the new-bets dataset for one early guess?** For example, Alonzo's "48.5–50% beats 45–48.5%", written down with exact edges before
  v5.13 collects, and tested only on paper bets.
- C1-5. **Two problems in our own plan:**
  - The example guess, "51–54% earns more than the rest of 50–60%", crosses two official bands, but the rule says "the rest of the same 5-point band". I
    will change the example to "51–54% earns more than the rest of 50–55%".
  - The 2.5% view shows whatever the Reports page holds: its period and filters, with free, research and extra bets included. The study itself counts only
    Scorecard bets since 11/11. Should the view get a "Study bets only (Scorecard, since 11/11)" switch, on by default?

---

## D. "So far" (live since v5.07)

- **D1: agree (cap filtered views at Leaning).**
  - D1-1. The Reports period is not a filter. Only the 9 Filters trigger the cap, since the period is the window the whole page reports on. OK?
  - D1-2. A filter on the grouping's own field (by Sport, with Sport = NHL) is capped too. One rule.
  - D1-3. D1, D2 and D4 change so-far-v1's rules, so the note will say "Rules: so-far-v2".
  - Words: "Filters are on, so a group here can read 'Leaning' at most. 'Holding up' and 'Struggling' are given only with the filters cleared, when every
    group of this grouping is checked together."
- **D2: objection.** "Decline" has the same "getting worse over time" sense you gave against "drop", and "Unadjusted" is jargon for a newcomer. I
  propose "Down, not confirmed · did not pass the many-group check", with "Up, not confirmed · did not pass the many-group check" for the other side. OK?
- **D3: agree with renaming; clarifications.**
  - There are six "early sample" places, not three: the headline, the CLV section, Best and worst, Said vs won, the By table, and Performance's cover
    range breakdown.
  - My proposal: keep every level word and every threshold, and add a plain first word. Headline: "Money results: early sample · 45 won, lost or
    pushed". Said vs won: "Forecast check: early sample · 45 outcomes from 20 games". The By table keeps "Read", which is already per row.
  - "Too few games" would be new logic, since Said vs won now says "early sample" both for 30–99 outcomes and for 100+ outcomes on 15–49 games. Split it?
  - Said vs won's words belong to the frozen calibration-v1. May only its labels change, under the same name?
- **D4: objection.** With one eligible row, "No clear lean" would rank a row whose 95% range clears zero BELOW a weaker row that reads "Leaning up", and
  would drop it from "Up so far". I propose it reads "Leaning up/down" (its 90% range clears zero), with this card line: "Only 1 group has 100 outcomes
  on 50 games, so it was tested alone. It did not pass its own 10% test." OK?

---

## E. Kalshi words (live since v5.05)

- **E1: agree, plus a 12-hour step.** As written, a 13-hour card on the Old tab would read "Price 30m+ old". I propose:
  - "Price 30+ min old · re-check" from 30 minutes (plainer than "30m+");
  - "Old price (12h+) · re-check" from 12 hours.

  The EV pill also says "price stale" (over 12 hours, or the best book not confirmed in 3 minutes). Keep that word there, or change it too?
- **E2: agree. Nothing changes:** the Make ladder already posts whole shares. If you want a label, I propose hover text on "ct" only: "Whole shares: Kalshi
  has not yet shown that a posted order takes 0.01 shares." "Verified" would be wrong: books.md says whole shares are outdated for orders you take. Kalshi
  only, or Polymarket US too? Its fills are fractional as well.

---

## F. To win and Total payout (now v5.10; these go in a small build after v5.11)

- **F1: agree (a Free bet tick in I bet this and + Add a bet).** Five points:
  - F1-1. The tick sits with the odds boxes and is hidden in exchange % mode, like To win and Total payout. A free exchange bet can still be ticked later
    in Bet log › edit.
  - F1-2. With Free bet ticked:
    - the value line ("Worth it"), "recommended at this price" and + Add a bet's BET / SKIP stay as they are, because they judge the price for his own
      money;
    - + Add a bet stops filling Stake with its recommended amount.
  - F1-3. For a free bet, Total payout always equals To win (not "may").
  - F1-4. Helper words: "Free bet: put its amount in Stake. It does not come back, so To win and Total payout are both the cash you get if it wins."
    ("Bonus stake" is jargon, and "enter the cash" does not say which box.)
  - F1-5. v5.11 adds its own "Free entry" tick for parlays in the same form. For a parlay he types the app's payout and the entry is taken off; for a
    single he types the cash he gets. Both end at "profit only". Keep both rules, each in its own words, or one rule for both?
  - For Alonzo, not you: today the board's daily max counts a free bet's stake, while the Hard stop does not. F1 changes neither. Changing the daily max is
    a cap, so it needs his own words.
- **F2: agree (Profit $).** Should it be only the Real money box ("Winnings $" → "Profit $", and "Type this or Winnings" → "Type this or Profit"), or all
  about 15 on-screen "winnings" that mean profit? I lean all of them: words only, and nothing saved or exported changes. "Got back $" stays, since
  renaming it would put a second "Total payout" in the same form.
- **F3: agree (a reverse check).** Four points:
  - F3-1. Your tolerance, max($0.02, 1% of the expected total), applies both ways. Today's check widens from 1¢ to it.
  - F3-2. Today's line keeps its words and button ("This looks like the total payout (stake included). To win would be $X. [Use $X]"), because our
    tests pin it. The new line: "This looks like To win (the profit), not the total payout. [Use $15.00 as To win]".
  - F3-3. On a favourite, a profit typed as Total payout is also under the stake. Show only the new line, which has the fix, instead of "less than the
    stake".
  - F3-4. Add " A boost? Keep what you typed." to today's line, since it can misfire on a boost.
- **F4: agree (keep the line).** Five points:
  - Words: "To win $1.52 · total payout $3.04". These are the form's words: "total back" would add a third name for the same amount, and there is no "+"
    before the bet wins.
  - Free bet: "To win $15.00 · stake not returned". The row already shows a "🎁 free bet" tag.
  - There is no expanded row in the Bet log, so the line stays in the row (2 lines at 390 px, as today).
  - Reports › Open bets uses the same words.
  - "Reliable" means the amount the app will count if it wins: the typed To win, else the saved odds and fee. The line is hidden when the odds cannot be
    read.
