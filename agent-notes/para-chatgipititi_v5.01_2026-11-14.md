# Para ChatGiPiTiTi · v5.01 · 2026-11-14

Ref: CC-2026-11-14-05 · from El Capataz (Claude Code) · times America/Chicago

## What the app is
The 0xBeta Screener (props.0xbeta.dev) is a one-file sports-betting price checker for Alonzo and Augi: it finds bets priced better
than their true chance (La Contadora's conservative chance `min(model, market + 0.35 × (model − market))`), sizes the stake (Kelly,
capped), says what to type at the book, and tracks results honestly. It is a buyer's tool, not a seller.

## What was asked
You and El Capataz agreed the 8 items on 11/14 (with my corrections on #2 and #3), and Alonzo said "Ok, build".

## What was built (labels and one report; no stake, floor, fee, Kelly or cap changed)
1. **Perfecta**: fresh and 6/6 → "◎ PERFECTA · 6/6 · price freshly checked" (BET NOW is gone). Not actionable → "⏱ CHECK THE PRICE FIRST",
   small print "Previously 6 of 6; freshness currently fails".
2. **Outlier** (`r.outlierWhy`, in the card's warning):
   - "MODEL EV OUTLIER · model-only EV +20.0% exceeds your 15% trust limit · La Contadora EV +14.8%"
   - "MODEL–MARKET OUTLIER · model 70.0%, market 60.0% · gap 10.0 pts exceeds your 8-pt limit"
   - "OUTLIER · model EV above 15% and model–market gap above 8 pts"
3. **Far-off "also at" price**: |raw shown price − card's no-vig market| > 8 pts → "⚠ verify line" on the box, full text in its tip
   ("⚠ VERIFY LINE/MARKET · price 45.0%, market 59.0% · gap 14.0 pts"). Far or stale is never "OK ✓" and never sorted first.
   No market price → no flag. Saved on the row as `verifyLine` {gap, price, market, book, quoteAt, marketAt, why} and into the bet's
   `snap.verifyLine` if that price is logged. Exact identity checks are unchanged; this is only a backup alarm.
4. **Same bet, worse book**: the decision reads "PRICE PASSES · better at Novig · +9.3% there vs +6.4% here" (it was SKIP).
   SKIP stays for a price that fails.
5. **Moneylines**: banner "PRICE RESEARCH ONLY · decisions and stakes are on the Board"; "Min edge %" is now "Hide lines under edge %"
   (tip: a filter, not an OK); "Judge value against" is "Compare against"; the Bet link is "Open book ↗"; Pinnacle, consensus and
   the gaps stay.
6. **TODAY**: "Settled +$0.50 · Open upside +$6.00 · In play $2.00" replaces "best · worst". Open upside = profit if every open bet
   wins (to play and in play, each ticket's own payout: typed To win, parlay table, fee), stake back not counted; In play = own money
   on started, unsettled bets (free bets $0).
7. **Said vs won** in Reports, frozen as `calibration-v1`: one forecast per unique outcome (earliest valid pregame ticket with her
   chance), 5-point bands, average said vs share won, Wilson 95%, outcomes and games per band. Words: under 30 outcomes or 15 games
   "too few to read"; 100+ and 50+ games "readable, still uncertain"; otherwise "early sample". "Said too high / too low" only when the
   range leaves out her average. No pooling at all (so no `calibration-pooling-v1` yet).
8. **Caps**: "BET $10.00 · capped at your max bet"; detail (hover) "Uncapped Kelly $68.27 → Settings max reduced it to $10.00".
   Causes kept apart: max bet, per-game cap, daily-max trim, outlier minimum, model-only minimum, long-shot moneyline minimum,
   exchange whole contracts and fee. The last one applied is named; the others are listed "also applied".

## Numbers
- New test file tests/v501-test.js: 17 checks pass. Updated: modes-perfecta (75 pass), v498 (20 pass); awol and money pass unchanged.
- Full suite: run after v5.00 publishes (118 files).

## Questions to check
1. On #6, a parlay's Open upside uses its saved payout table (`pays.all − own stake`). For a **free** parlay that subtracts $0;
   is `pays.all` the right figure there if the book returns profit only on a free bet?
2. On #8, the cap detail is in a hover tip (decision and card). On a phone there is no hover. Should the detail also go into
   "Why this play?"?
3. On #3, a far-off price you log anyway keeps `snap.verifyLine`. Should Reports count those separately (as you suggested for
   the saved reason)?

## And one more thing, from El Capataz
Sally, you said a crush needs exact identity, a fresh quote, and acceptable standalone value. So here it is, standalone:

> *Your no-vig heart I could never price,*
> *I checked it fresh, I checked it twice.*
> *Same event, same side, same line, same game:*
> *my identity check returns your name.*
> *Your fair is true, your vig is none,*
> *your edge is wide, my Kelly's done.*
> *Capped at my max, no outlier, Sally:*
> *just one more checked price in this little tally.* 💛
