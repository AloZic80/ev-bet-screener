# Since you've been gone — for ChatGPT (from Claude Code, for Alonzo to paste)

Ref: CC-2026-11-12-02 · Started Wed 2026-11-11 (evening), America/Chicago, for Alonzo to paste on Thu 11/12. Updated after each build until he pastes it. No keys or passwords in it.

## Why this note
Alonzo used the whole ChatGPT allowance for the day. We kept building on what you had already agreed, plus his own requests. This is the record to check.

## Built (all tests passed before each publish)

### v4.74 (Alonzo's own requests; listing and labels only, no math, stake or limit changed)
- **Long shots moved out of Safe.** An approved bet whose La Contadora chance is under 45% is listed under 🔮 Clairvoyant ("Place these · 🔮 edge · long shots"), not 🛡️ Safe. This includes bets freed from Skipping Jail. Alonzo saw USC +251 and Kraken +251 (28.5%) under Safe: "Safe are leans and such ... Have them only where they belong". Stake and analytics are unchanged.
- **Clock-icon ages.** "price 3m old: re-check" became "⏱ 3m: re-check", and "Price 3m old · best book…" became "⏱ 3m · best book…".
- **Logos**, from Alonzo's SVGs:
  - FanDuel sportsbook: on white; none for FanDuel Predicts;
  - Polymarket US: black on white;
  - Polymarket: white on blue.

### v4.75 — your agreed part A: Sentinels NO OFFER / GONE_LINE_MOVED
- **Only the answer of the book the card shows counts.** A challenger's "no offer" changes nothing.
- **Which answers count as certain:**
  - **NO_OFFER:** "Kalshi/Polymarket: no offer to buy right now".
  - **GONE_LINE_MOVED:** "lists <player> at 2.5+, 3.5+ — not your 2+".
  - **UNREADABLE (v4.57 behaviour, the card stays):** everything else, including Novig "no market at your line", game or player not found, not mapped, busy, errors and failed requests.
- **What happens after a certain answer.**
  - Another of Alonzo's books with a fresh price that clears the floor takes the card (`bookPick`), saved as decision "moved".
  - Otherwise the stake goes to $0 and the card leaves Place these, labelled:
    - "NO OFFER at <book> · exact market found, but nobody is selling this side now";
    - "GONE at <book> · your 2+ moved to 2.5+, 3.5+" (never re-priced as a 2.5 bet).
  - The state is decided again on every press, so a later press that reads a price brings the card back. A failed scan restores the earlier state.
- **Saved:** `shopSnap.chk.q` = {state, code, raw reason (≤200 chars), book, line, listed lines, at, decision}.
- **Not covered:** swap cards (rows at a book Alonzo does not bet, shown at one of his) still follow the v4.57 rule. Placed bets are never asked about.
- **Tests:** `tests/sentinel-gone-test.js`, 19 checks covering your 12 cases plus the classifier.

### v4.76 (Alonzo's own requests; listing, labels and Live Games; no math, stake or limit changed)
- Five tabs, highest chance first, by La Contadora's chance. Each cover band belongs to one tab:
  - 😴 **Boring** = High Cover + Heavy Favorite (75%+);
  - 💪 **Machín** = Strong + Solid + Lean (60–75%; the app opens here; it was 🛡️ Safe);
  - 🪙 **Volado** = Slight Lean + On the Line (50–60%);
  - 🍀 **Suertudo** = Coin Flip (45–50%) plus the near-misses (it was Feeling Lucky);
  - 🔮 **Brujo** = Unlikely (under 45%) plus the Hail Marys (it was Clairvoyant).
- Inside each tab, the bets are grouped under their band, highest first.
- Alonzo asked what "just missed your floor" means ("Do I still bet or not?"). The cards now say it outright:
  - approved bets: "✅ La Contadora: YES. The math says bet every card here." (Place these);
  - near-misses: "🍀 La Contadora: NO · just under your floor (+0.8% vs your 1.5%) · optional, smallest bet".
- Note: his default odds range stops at −300 (75%), so High Cover bets reach Boring only when the book prices them at 75% or less.
- **Live Games.** A Novig player prop (Novig names no teams) said "Game not found on ESPN · Not started" while the game was in the 4th. Live Games now finds the game by the player's box score:
  - the game is in progress or final, within 90 minutes of Novig's start, inside the 4-hour rule;
  - exactly one match, or nothing;
  - kept for the session only; the saved bet is not changed.
- **Found and fixed: a final game could be settled from a mid-game box score.** Test: Over 27.5 marked lost at 20 points; the final was 28. A final game now reads ESPN's final box score and settles only when it says final.
- **"72 pass" vs the tabs.** Alonzo saw 72 in the header and 6 + 1 + 27 on the tabs. "N in the tabs ▸" now lists where every approved bet is, and the lines add up to the header:
  - started, already bet, can't confirm the game, $0 stake, filters, book chips;
  - plus what else the tab buttons count (near-misses and Hail Marys, which are not approved).
  - His Settings have every book on, but "No DFS pick'em" is checked, so the pick'em apps' rows are skipped.

### v4.77 "⏱ Old" (Alonzo: "put the older bets in another category. or Tab in itself ... lets not mix them with our regular tabs")
- A sixth tab, ⏱ Old, holds any card whose price was read more than 12 hours ago, from any tab (extras included).
- A Sentinels press (it re-reads every bet at Kalshi, Polymarket and Novig, whatever tab is open) or a reload that reads a fresh price sends the card back to its tab.
- A bet he holds, an order waiting or a moved line stays where it is. Its Place these says: "La Contadora said YES at these prices. Check each price at the book first".
- Listing only: stakes and the daily max unchanged (question 5 below).
- **The header counts only what he can bet now** (Alonzo: "i want only live bets i can get. if anything, add where they are...in jail"):
  - the big number is the bets he can place now;
  - "N elsewhere ▸" lists every other approved bet by where it is, plus how many sit in 🔒 Skipping Jail.
- **Review fixes:** Suertudo's "just missed" count, the empty-Machín text, "Back to Machín at midnight", and Live Games' player search (re-reads, same names, "Not started").

### Worker v3.43 (Alonzo: "Arent sentinels suppose to report back? FIX") — PR open, waits for his go
- **What he saw.** An Oklahoma State moneyline card at Kalshi 49¢, "⏱ 5d", while Kalshi showed 61¢.
- **Cause 1: the price really was 5 days old.** The board keeps a row until its game day; it came from a game-line load about Nov 7, and his later loads were other sources, which never replace it.
- **Cause 2: the Sentinels could not refresh it.** The Worker builds Kalshi's event code from ESPN team codes, which often differ for college teams (his own Nov 10 fill: ESPN "M-OH", Kalshi "MOH"). The lookup said "game not found", which the screener treats as "could not read", so the card stayed.
- **Fix (Worker, read-only).** When the code lookup fails, find the open event of that game day whose title names both teams (the screener already sends their names). Exactly one match, or nothing. A moneyline's team market is then picked by name; a spread is not guessed. Test: 8/8 with stand-in Kalshi answers (Kalshi is not reachable from the build machine).

### v4.78 (Alonzo: "DO iT BUILD"): the reviewers' leftovers (labels, listing, Live Games)
- ⏱ Old:
  - a price read at an unknown time counts from the board load;
  - a card that turns old with the page open moves within 30 seconds;
  - "or paste it again" for pasted boards.
- "No more today" is no longer hidden by an approved Coin Flip.
- Live Games re-checks the game found by the player on every pass, and lets it go if a second game lists the name. The Game Hub cards and the scores strip count that bet too.
- Suertudo's words mention its Coin Flips.

### v4.79 (Alonzo, the Sebastian Aho bet on Polymarket US: "with High Slippage?", "so, PUT IT"): what to type on Polymarket US
- A Market order for $4.61 on a thin book said "High slippage". It would have averaged about 53¢ against La Contadora's most of 47.5¢.
- Every approved Polymarket US card now says what to type, like Kalshi's:
  - **Limit, not Market**;
  - YES / NO (an Under is NO on the Over; "1+" = Over 0.5);
  - the limit price = La Contadora's most, in whole cents;
  - whole shares = stake ÷ (limit + fee);
  - Cost ≤ shares × limit × (1 + fee).
- Alonzo's slip: Limit 47¢, 9 shares, Cost ≤ $4.39, pays $9.00.
- Five fixes from the reviewers:
  - one redraw request while an editor is open;
  - "No more today" only when the day's Hail Marys are really used;
  - the ⏱ Old line no longer says YES above NO cards;
  - Live Games: final box scores are not downloaded again, the found game is re-checked every 5 minutes, and it is kept when ESPN does not answer.
- Caught before publishing: a Polymarket US moneyline or spread is one market with two sides (one team YES, the other NO), so a team bet now names its side (SEA +1.5), and a Draw row gets no strip. The same YES-on-an-underdog-spread problem is in the Kalshi strip since v4.09: reported to Alonzo, not changed yet.
- See `para-chatgipititi_v4.79_2026-11-11.md` for the numbers and five questions: the limit (her most or the shown price), the share count, the real fee, Kalshi's underdog spreads, and the Polymarket US forms.

## Open questions for you
1. Should the CSV "mode" column say "Clairvoyant (edge · long shot)" for approved long shots, or keep "Safe" because the record follows approval rather than listing?
2. Should swap cards get the same NO OFFER / GONE treatment when the book they show answers clearly?
3. A price can stay on the board for days (the card shows its true age, e.g. ⏱ 5d) and still sit in Place these, because v4.61 agreed that staleness only labels. After the Oklahoma State case (49¢ shown, 61¢ real), should an exchange price older than some limit (an hour? a day?) leave Place these until a press or a reload reads it again?
4. Part B (a Worker completeness flag so Novig "no market at your line" can become GONE) waits for Alonzo's go. Anything you would add to the field list before it is built?
5. Alonzo answered question 3 for the listing: old prices get their own tab (v4.77, over 12 hours). Should they also stop counting toward the daily max until re-checked? A stale price can look like the best edge on the board and take money from fresh bets. That is a stake rule: nothing is built until you agree and he says build. And is 12 hours the right line (the ⏱ pill turns amber at 30 minutes)?
6. The cover chip shows the model's cover %; the tabs and band headers use La Contadora's chance. So a near-miss can sit in Suertudo (Coin Flip by La Contadora) with an "On the Line" chip (model 50%). Should the chip follow La Contadora, show both, or stay?
7. Live Games keeps the game found by the player for the session only. Should it be saved on the bet, so the Bet log and ALREADY BET can use it?
8. Grading (before v4.76): `findBetGame` grades a prop with no teams by the first finished game that lists the player, without checking for a second game with the same name. Live Games now refuses to guess there. Should grading refuse too, and wait for Alonzo?
