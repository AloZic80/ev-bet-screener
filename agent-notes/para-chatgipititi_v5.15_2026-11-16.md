# Para ChatGiPiTiTi (Sally): 0xBeta Screener v5.12 to v5.15 (2026-11-16)

Ref: CC-2026-11-16-01 · Written by Claude Code, Mon 2026-11-16, America/Chicago. No keys or passwords in it.

## What the app is
A one-file sports-betting screener for Alonzo (props.0xbeta.dev). It finds bets with an edge, sizes the stake and keeps an honest bet log. La Contadora's conservative chance decides every bet and stake: `min(model, market + 0.35 × (model − market))`.

## What was asked and built
**v5.12: bug fixes.**
- The Parlays tab marks a parlay you logged.
- The Fix button uses all the fees of a bet split across orders.
- A Save keeps a newer fill re-read.
- Dark pop-ups are readable.
- Pick'em apps get their own TODAY tiles.

**v5.13: no daily Suertudo / Brujo bets.**
- Alonzo: "Remove the suertudo or brujo daily allowed. Since I shouldn't be doing any unless I see or now something from my end."
- Hail Marys are now Watch only: no stake and no daily count.

**v5.13: fixes from the first Las Karens review.** Four AI "customers" (newcomer, phone-only, know-it-all, pro) used the app:
- A calm "Not connected yet" note replaces a raw 401 error banner.
- Paste and its Sample work.
- The price shown on fee bets is the price paid (Kalshi 40¢ shows +140).
- The daily max meter counts what the Hard stop counts.
- The Bet log's parlay panel matches + Add a bet's parlay form.

**v5.14: the second review, on a realistic practice copy.** The Pro re-did the board math by hand and all of it matched.
- Alonzo: "removing the Daily bet goal 20 … REmove math pick."
- The model's number is labelled "Model", not "Fair": the card reads Market · Model · La Contadora.
- Exchange chips show the price after the fee.
- One daily-max number everywhere.
- Parole fits a phone.
- Calmer Parlay headline: "Needs 56.2% a pick to break even".

**v5.15: the AI helper.**
- Alonzo has $100 a month of Claude API credit: "Lets use it to its full potential. All that we can." He chose Sonnet. It is for him only.
- **Rule:** the AI reads, checks and explains; it never decides a bet or a stake, and nothing is saved without his tap.
- **Jobs:**
  - read a bet slip;
  - read prices from a sportsbook screenshot (La Contadora prices them like any row);
  - check news (a label only);
  - suggest a fill-to-bet match;
  - find a result ESPN cannot grade;
  - check a book's grade;
  - map new market names;
  - "ask my log";
  - a weekly summary in plain words;
  - bug notes.
- **Data points:** every job keeps data (slips read and corrections, a learned name table, result sources, a market map). These let the app later do the same jobs with plain rules and no AI.
- **Safety:**
  - The key lives only in his Cloudflare Worker.
  - Spending is capped at $5 a day and $90 a month.
  - A security review (La Guardia) found nothing critical, and its fixes were applied.
  - The Worker part is not live until Alonzo deploys it.

## Numbers
- **v5.13 on Alonzo's backup:**
  - 28 of 353 bets now show the price paid with the fee.
  - Total profit is unchanged ($42.47).
  - "Against the screener" went from 116 to 76, with 40 now shown as "not priced" (own bets with no fair price).
- **Each version** passed the full test suite before publishing.
  - v5.14 failed once: a 11.5 px label was under the 12 px floor. It was fixed, then passed.
- **AI cost estimate** on Sonnet 5.5 ($2 / $10 per million tokens):
  - about 1¢ per slip;
  - a news check about 4¢ (3 searches).

## Questions to check
1. Should stake sizing also count parlay entries against the daily max? Today the meter does, but the trim on singles does not. It is a cap, so it needs Alonzo's own words.
2. Is "read prices from a screenshot" sound as a price source, given its age and possible misreads? The rows are tagged and he confirms them first.
3. Which AI data points would you trust enough to turn into plain rules, and after how many examples?
