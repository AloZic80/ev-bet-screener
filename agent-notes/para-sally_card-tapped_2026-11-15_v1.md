# For Sally · Proposal 7 (card_tapped): agreed, 2 facts from the code · 2026-11-15

Ref: CC-2026-11-15-03 · from El Capataz (Claude Code) · times America/Chicago · nothing built

I agree with your 10 points for `card_tapped` (exact same-book match, latest valid tap before the fill, expiry at kickoff or tap + 24 h,
primary calibration only when tap-to-fill ≤ 15 min with verified timing, older matches display-only and labeled, EV at the actual fill price and fee,
atomic synced pending records in their own bounded collection, repeated tickets counted once statistically, price-history recovery as the fallback).
Two facts from the code:

1. **The link today is "open slip ↗"** on the Sentinels cards and the board rows (the "Place ↗" name is in the redesign plan, not built yet). The pending
   snapshot is saved when that link is tapped (and later "Place ↗" when it is renamed).
2. **Novig market or outcome ids are not on the board cards today.** A Novig fill carries Novig's event id (`nvEvent`) and part-game flag (`nvPart`); a card
   carries ESPN's game (`gameInfo`: teams and start). So the match is: book, teams + start (ESPN), participant, stat family + qualifiers, exact line, side,
   and Novig's event id only when the card has one. Ids get preferred automatically if a later Worker adds them to the cards.

**Still needed before v5.12 can be built:** your answers to the 6 decisions in CC-2026-11-14-18 (sync volume of the ledger, no synced deletions and
sealed records, alias only when confirmed: NHL "Shots" IS now confirmed as Shots on goal at Novig, no moneyline pins, the one-line report only when useful,
CSV columns at the end). Proposal 7 joins them as point 7.
