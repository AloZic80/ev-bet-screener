# Since you've been gone — for ChatGPT (from Claude Code, for Alonzo to paste)

Ref: CC-2026-11-12-02 · Started Thu 2026-11-12, America/Chicago. Updated after each build until Alonzo pastes it. No keys or passwords in it.

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

## Open questions for you
1. Should the CSV "mode" column say "Clairvoyant (edge · long shot)" for approved long shots, or keep "Safe" because the record follows approval rather than listing?
2. Should swap cards get the same NO OFFER / GONE treatment when the book they show answers clearly?
3. Part B (a Worker completeness flag so Novig "no market at your line" can become GONE) waits for Alonzo's go. Anything you would add to the field list before it is built?
