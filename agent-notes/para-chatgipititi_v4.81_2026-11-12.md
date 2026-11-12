# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.81 (2026-11-12)

Ref: CC-2026-11-12-04 · Written by Claude Code, Thu 2026-11-12, morning, America/Chicago. No keys or passwords in it.
v4.80 and v4.81 are published together. The v4.80 note (`para-chatgipititi_v4.80_2026-11-12.md`) has the rest.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. La Contadora's chance, min(model, market + 0.35 × (model − market)), and its EV after fees
decide everything. The app sizes the stake, says exactly what to type at the book, and tracks results honestly. The exchange connections are read-only.

## What Alonzo asked
A card for Collin Gillespie Over 1.5 threes at Novig, −135, stayed under 💪 Machín. When he tapped its price, the app said "⚠ Novig did not find this
exact game". His words: "Why is this still under Machín and it says Novig sentinels can't find it? Those go either on OLD or a AWOL category / Tab if
they can't be found anymore."

## Why it stayed
- The price was read 55 minutes earlier, and ⏱ Old starts at 12 hours.
- The "did not find" answer came from his tap (the slip check). That changed only the note on the card.
- The answers that did move cards before:
  - v4.75 (agreed with you): a clear NO OFFER or GONE (line moved) from Kalshi or Polymarket on a 🦑 press takes the stake to 0.
  - v2.97: the open check after a load gives no money to an exchange market with no seller.
- A Novig "not found" was neither, so the card stayed.

## What was built
- **👻 AWOL, a seventh tab** after ⏱ Old.
  - A card goes there when its own book said, on the last check, that it cannot find the bet:
    - no market at your line;
    - not listed;
    - game not found;
    - nobody selling;
    - the line moved.
  - The check can be a 🦑 Sentinels press, the open check after a load, or a tap on the price.
- **What does not count as AWOL** (our side, not the book's): busy, a market our Worker does not map, a Draw, "could not tell which outcome".
- **Listing only, like ⏱ Old:**
  - the card keeps its stake and shows why ("👻 AWOL · Novig: no market at your line (3m ago)");
  - it is not counted in "to bet now";
  - a check that finds the bet sends it back to its tab.
- **A closed market from the open check** keeps the v2.97 rule (no money) and is listed under AWOL instead of its old tab.
- A bet already placed never goes AWOL.

No floor, fee, Kelly, cap or grading rule changed.

## Tests
- `awol-test` (19 checks):
  - a 🦑 press puts the card in AWOL; a busy answer does not; a find sends it back;
  - a tap on the price (Alonzo's case) moves it;
  - the closed-market rule is unchanged;
  - which answers count as AWOL;
  - seven tabs fit at 390, 1000, 1280 and 1960 px, no sideways scroll.
- Older tests now count seven tabs.

## Questions for you
1. **AWOL keeps its stake** (listing only), like ⏱ Old. So an AWOL card still uses part of the daily max until a check finds it or the board reloads. Should AWOL (and ⏱ Old) stop counting toward the daily max? This is the same open question as for ⏱ Old, and nothing is built until you and Alonzo agree.
2. **"Game not found"** is treated as our side, not AWOL (changed before publishing, after the reviewers showed the Worker also says it for a league it does not read, or after searching the wrong series). Do you agree?

## Also fixed before publishing (the reviewers read v4.80 and v4.81)
- AWOL is decided after every move of a 🦑 press. Before this, the Kalshi fee check could move a card back to the book that had just said it cannot find it.
- Show › ◎ Perfectas never lists an AWOL or ⏱ Old card, uses its own words, and its empty text says the filters apply.
- A near-miss keeps its kind: one placed anyway is saved as a near-miss and stays out of the Scorecard.
- 🔔 notifications:
  - the words name the button on Kalshi or Polymarket ("press NO on CAR wins by over 1.5 · a Limit at 66¢, not Market") and the game of a total;
  - sportsbook odds are rounded the safe way;
  - "Show them" opens the board the alert came from;
  - a phone browser without page notifications (Chrome for Android) is told so.
