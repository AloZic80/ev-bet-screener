# For Sally · Forecast recovery (v5.06): 6 decisions before the build · 2026-11-14

Ref: CC-2026-11-14-18 · from El Capataz (Claude Code) · times America/Chicago · nothing built

Before building, I had the code mapped and the plan checked by a skeptic. The agreed scope holds, but six points need your call. Each has a default
I would use; reply "agree" or change any.

1. **The synced ledger would sync the whole app every minute.** Sync runs every 60 s. Any changed record re-uploads the whole document (log, Watch,
   every collection), and the other devices download it and redraw the log and the board. A record per pregame card (about 20 a minute while the board
   is open) means a full sync and redraw on every device every minute: roughly 10–20 MB an hour per device, and the phone's log jumping.
   **Default:** every card is still recorded locally, but only two kinds of ledger records sync: (a) ones a recovered bet links to, and (b) ones "pinned" near a pending
   fill (same identity, observedAt within the 15 minutes before its placedAt). Cross-device recovery still works through the synced LOG: the phone
   logs the fill, the log syncs, the Mac (which saw the card) recovers it and the log syncs back. (Alternative: release the whole ledger in 15-minute
   batches.)
2. **Two safety fixes, no policy change (FYI):** ledger deletions are never synced (a storage eviction or a reload must not wipe the ledger on every
   device), and each record syncs as ONE sealed string, so the generic sync can never mix fields from two records.
3. **Legacy identity: exact text vs the alias table.** The board saved Mercer and Bouchard as "1.5 Shots"; Novig's fills say "1.5 Shots On Goal".
   Under "exact market text" they can never be recovered. **Default:** exact text, plus `market-alias-v1` aliases only when the alias is confirmed
   (`evidence:'book-rule-confirmed'`). If Alonzo confirms his books settle "Shots" on shots on goal, the two NHL bets can recover; otherwise they cannot.
   Same canonical stat, exact line, side and qualifiers, exactly one series, kickoff verified, 15 minutes: all unchanged.
4. **Pinning history touches a board decision.** The long-shot moneyline rule (v4.69 `lsmlClass`) reads the same local history for logged moneylines,
   and its day and game counts can zero a stake. Keeping extra history alive for pending fills would change which moneylines find a reading.
   **Default:** never pin moneyline history (moneylines recover from the new ledger only), and never change `lsmlClass`.
5. **What the one-line report shows.** On most days it would read "0 recovered · N had no matching history" (229 of his 353 bets are fills with no forecast).
   **Default:** show it only when at least one forecast was recovered or rejected for a reason other than "no history", and say "on this device".
6. **Receipts must match the screen.** The CSV and the Reports lists would still say "no band" for a recovered bet. **Default:** add CSV columns at the END
   (recovered chance, EV at fill, source, policy) so old columns keep their places, and the "no band" filter header adds
   "· N with a recovered forecast (kept apart)".

Two facts for Alonzo, from the mapping:
- **WVU −2.5 cannot be recovered from the old history:** it was saved with no sport, and the old history drops a spread line's sign (−2.5 and +2.5 look
  the same). The new ledger keeps the sign, so future spreads can be.
- **Mercer and Bouchard** (saved with no game) can be checked only after ESPN posts their final box score, and only under point 3.
