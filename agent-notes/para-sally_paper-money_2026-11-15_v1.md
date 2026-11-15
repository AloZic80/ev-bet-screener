# For Sally · "Paper money": shadow bets on the cards Alonzo skips · 2026-11-15

Ref: CC-2026-11-15-02 · from El Capataz (Claude Code) · times America/Chicago · a proposal, nothing built

## Why
Since 11/11 Alonzo bets only La Contadora chances of 50% and up (his plan), so the Coin Flip (45–50%) and Unlikely (<45%) cards get no new results.
He likes Coin Flips ("they have made me money") and wonders if the money sits near 48.5%. In his log so far it is the opposite (45–47.5%: 9–1, +$24.30;
47.5–48.5%: 4–5, −$3.54; 48.5–50%: 9–9, +$6.20; 36 of 37 on the model's forecast), which is exactly why the band study tests guesses on NEW bets only.
Without new Coin Flip bets there is nothing to test, so he asked for shadow bets: "Shadow Bets!! Hell yeah!! ... like Paper Money".

## Proposal (reuses the Watch v2 machinery, v4.44–v4.52, never in money views)
1. **Which cards:** every pregame card that La Contadora rates BET (passes the floor, has a stake) and whose chance is **under his plan minimum** (50%, set in
   Settings, v5.10). One paper bet per outcome (game, player/team, market, line, side), at the card's shown book.
2. **Frozen when:** the first sighting is saved whole; the cutoff snapshot 5 minutes before kickoff (Watch's `watchPolicyRun` timing) is the primary record
   when seen within 30 minutes, else the first sighting. Never after kickoff; no AWOL or old-price cards.
3. **Paper stake:** flat **$1** per paper bet (for the statistics), plus the app's own Kelly stake saved alongside ("what the app would have staked").
4. **If he bets it for real**, the real bet counts as real; the paper record is kept but marked "bet for real" and left out of the paper totals.
5. **Grading:** ESPN, like real bets. **Never** in TODAY, the Bet log totals, the Scorecard or the 1,000-bet blocks.
6. **Report:** Reports gets a "Paper money" section: settled, won–lost, paper profit and ROI (flat $1 and Kelly), game-clustered ranges, CLV, the Read word,
   and the same By groupings (Band, 2.5% steps, Market, Sport…) for paper bets only. Words: "Paper money: what these cards would have done. No money was bet."
7. **For the band study:** paper bets from 11/15 on can test the written guesses (e.g. "48.5–50% beats 45–48.5%") on new outcomes, with the plan's rules.
8. **Sync and storage:** like Watch records (`watch` collection rules: one record per key, earliest valid pre-start snapshot kept whole, conflicts kept apart),
   with a cap and pruning after grading + sync.

## Questions
1. Include Unlikely (<45%) too, or Coin Flips only? (I lean to both, reported apart: under-45% is the other half of his question.)
2. The primary snapshot: cutoff (5 min before) or first sighting? (Watch v2 uses the cutoff as primary; I lean the same.)
3. Should paper bets also cover **SKIP** cards in 45–50% (not just BET), so the study sees the whole band? That would grade the price, not the app's call.
