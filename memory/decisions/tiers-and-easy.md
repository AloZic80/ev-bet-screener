# Levels (God / Easy / Plus) and the Easy app: decisions (owner, 2026-11-20)

Ref: CC-2026-11-21-01 · El Capataz · status: designed and judged, build pending the owner's pick of the final mockup. Scratch work (maps, mockups, judge notes): the session scratchpad `easy/` folder; the lasting parts are copied below.

## The owner's words
- 11/20: "I want the app to be for people that dont know how to bet, have never betted in their lives, dont know sports, ever. So, besides the BOARD, lets make an Easy Board of sorts. the rest of the app is GOD MODE LEVEL. which they wont need or understand. So, like i said, this is going to be an app we will offer as subscription, but we are in GOD mode, but we need to start seeing what the customers will se. So make tabs for just them. Later we can add for customers who pay a little extra for other features. so, what im saying is that, we need to differentiate already."
- 11/20: "for me in GOD mode, let me tell the difference of what they cant see and i can or and have access to"
- 11/20: "Check everything and lets start."

## Levels
| Level | Who | Sees |
|---|---|---|
| ⚡ God | the owner (and Augi) | everything the app has, plus a way to tell what customers cannot see |
| 🟢 Easy | a subscriber who has never bet and does not follow sports | four tabs: Today, My bets, Learn, Settings |
| ⭐ Plus | later, customers who pay a little extra | Easy plus features the owner picks later; nothing is assigned yet |

God stays the default and the dev app (`DEV_APP`) keeps a "View as" switch (device-only `mbev.viewAs`, flag on `<html data-viewas>`; `body.dataset.view` is the open tab and is not touched). A label, a view or a level never changes a decision, a stake, the order or a floor. A paid public build is separate and has no way back to God mode (CLAUDE.md "personal edition").

## Defaults used by El Capataz (the owner said "lets start"; each is one setting)
1. Today lists bets La Contadora approves that can be placed now (the existing `scApproved(r)`, plus: not a pasted row, live state open, her chance 60% or more, price within her most, only the person's books), at most 5, in the board's own order.
2. The stake is the app's own stake (no new sizing rule; a fixed "$3 each" would need the owner's own words).
3. El Compa and every AI tool stay God only.
4. Open questions for the owner: a minimum stake (at a $200 bank the app's own stake rounds to $0 on the sample picks); how fresh a price must be for Easy (the app only calls a price Old after 12 h; suggest 30 minutes); exchange picks: one tap or always the full form; My bets: singles only; whole-number prop pushes (see the grading finding) before Easy shows results.

## What each level gets (area level; the full list is the code registry once built)
- God only: the Board and its eight chance tabs, Old and AWOL, card details (score, EV, hold, the ◎ checks, price chart, Why this play?), Sentinels and the API dock, Today bar and score strip, Leagues, Parole, Moneylines, Paste a board, Live Games, Parlay, the Bet log tools (calendar, + Add a bet, Read slip, From your books, CSV, backup, Send my log), Performance, Reports, the Scorecard, Settings sections (Connect, sync, floors, fees, sizing, caps, My plan, layout, palette, AI helper, schedule), El Compa, Scout, every AI tool, the exchange fills.
- Easy: Today (the short list and a focused pick page with "Type this"), My bets (open, won, lost, an honest "so far"), Learn, Settings (money set aside, my apps, light/dark).
- Plus: nothing assigned yet.

## The design (chosen by five judges' tally; the owner still picks)
Four takes were drawn (La Lista, Uno a la vez, El Coach, La Libreta). Judges: newcomer B>A>D>C, phone-only B>A>D>C, Pro B>C>A>D, safety C>A>B>D, engineer A>D>C>B. A and B tied, so the final mockup E combines A's list with B's focused pick page (three sections, pinned actions), D's My bets ledger without the bank framing, C's help footer and "only saves a note" wording, and A's Undo. God side: "View as" switch plus level labels; recommended G1 quiet (labels appear when "Show who sees what" is on).

## Rules the Easy app must keep (from the Pro and La Guardia; each testable)
- "Never worse than" prices are computed from La Contadora's exact most (maxPriceFor), rounded toward the STRICTER price (an acceptable American price has an implied chance at or below her most). Never hand-typed. "OK up to" on the God card is rounded to the nearest price and can sit just past her most; Easy shows the strict price.
- Edge is an expected return, not a gap of percentages. Two lines: "La Contadora's chance (79.4%) is 4.4 points above what the price assumes (75.0%)." and "Edge +5.9%: about 5.9 cents back for each $1 put in, on average, over many bets."
- A price is explained in money before any −300 or 57¢ appears; American odds never stand alone.
- The "Any single bet can lose. The edge only shows over many bets." line is visible without scrolling on Today and every pick page, in every state. Never: guaranteed, sure, lock, can't lose, free money, hot, hurry, last chance, streak, countdown, "only N left", "luck evens out".
- Every card shows the stake and "lost if it misses $X" at the same size as the payout.
- A help line (real, lawyer-approved number; placeholder for now) on Today, My bets and Settings; an age and location check and a stake limit before any outside use (customer build; ask El Licenciado).
- "Money set aside" is the person's own number (floor above $0), never a balance; never the words balance, deposit, wallet.
- Open bets are "in play", never won or lost; So far counts settled bets only, with the count.
- "I placed it" only saves a note: it opens the existing bet editor on a hidden host and clicks its Save (same record as "I bet this"; never addToLog directly), with Undo. The app never places bets. A placed bet leaves Today at once.
- Skip is as plain as Place. No God-only words on Easy screens (EV, CLV, Kelly, hold, the model's chance, stale, outlier, Sentinels, moneyline, O/U).
- No key, passphrase, email or sync password on screen, in a log, a URL or an export. In a customer build there is no "Back to God mode" element, text or handler (DEV_APP false).
- Tab handler guard: Easy refuses a God view (20+ code paths click God tabs); God DOM stays present, hidden by CSS (several nodes are read unguarded at startup).

## Built in v5.24 (customer-build notes)
- `DEV_APP` is defined once in its own tiny head script; the head sets `data-viewas` from it, so a customer build is Easy at first paint even with a forged `mbev.viewAs`.
- A real customer build still needs a build step that strips the dev strings from the page source (not built; owner decision).
- Open owner decisions: minimum stake for small banks; Easy price freshness (suggest 30 min); Easy ownership this tab vs device; hide exchange picks that cannot fill at their limit; sportsbook fallback form; Novig +219/+220; a fill on a finished game; push grading of whole-number props; lawyer items (age/place gate, real help number, stake limits); G1 vs G2 labels; timers spend Worker calls; how Easy gets fresh prices.
