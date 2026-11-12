# Para ChatGiPiTiTi (Sally): 0xBeta Screener v4.79 (2026-11-11)

Ref: CC-2026-11-11-10 · Written by Claude Code, Wed 2026-11-11, 11:15 PM, America/Chicago. No keys or passwords in it.

## What the app is
A one-page sports-betting screener for Alonzo and Augi. La Contadora (named Doña Petra, after Alonzo's grandmother) is the conservative chance,
min(model, market + 0.35 × (model − market)), and its EV after fees decides everything. The app sizes the stake, says exactly what to type at the book,
and tracks results honestly. The exchange connections are read-only: the app never places a bet.

## What Alonzo asked
A Perfecta card: **Sebastian Aho (CAR) Over 0.5 assists** on Polymarket US, price 44¢ (+127). La Contadora's chance was 44.0%, "OK to 47.5%",
stake $4.61. On Polymarket US he chose a **Market** order for $4.61, and the slip said **"High slippage"**. His questions: "yes or no?",
"slippage to common person means NO", "so, PUT IT", "with High Slippage?".

What happened: the book had too few shares at 44¢, so a Market order for $4.61 kept buying at higher prices. An earlier slip showed $4.61 → $8.64,
an average of about 53¢. That is above La Contadora's most (47.5¢), so the Market order was a NO. A **Limit** order at 47¢ is a YES: it never pays
more than 47¢, it takes what is offered up to 47¢, and the rest waits on the book.

## What was built
1. **A Polymarket US "what to type" strip**, like the Kalshi one:
   - On the card, for Aho: `On Polymarket · Limit, not Market · YES on 1+ · Limit 47¢ · Shares 9 · Cost ≤ $4.39`. A team bet names its side instead, e.g. `SEA +1.5` (see below).
   - In "Why this play?", five boxes:
     1. Order type: Limit ("tap Market ⌄ and pick Limit. Never Market").
     2. Press YES / NO for props and totals. An Under is NO on the Over. "1+" is Polymarket's name for Over 0.5. A team bet names its side (below).
     3. Limit price = La Contadora's most, in whole cents, rounded down.
     4. Shares = whole shares, stake ÷ (limit + fee); if the form asks for dollars, shares × limit.
     5. Then check: Cost ≤ shares × limit × (1 + fee), rounded up; pays $1 a share.
   - One plain line on what "High slippage" means, and "Not filled by the start? Cancel it."
   - No strip when the price is over her most, or when the stake buys less than one share.
   - **Caught before publishing** (the reviewers read v4.79 itself; El Juez had already passed it). On Polymarket US a moneyline or a spread is ONE market with two sides: one team is YES, the other NO. Our Worker prices an underdog spread as NO on the favourite's market. The first version said a bare YES for every team bet, which could buy the other side. Now:
     - a team bet names the side to press (CAR, SEA +1.5);
     - it says YES or NO only when it knows: from the Sentinels' own quote ("NO · <market>"), or from the spread's sign ("SEA +1.5 · on a Yes / No market for CAR −1.5 that is NO");
     - a soccer Draw row gets no strip (it names the home team);
     - "OK up to" now rounds down to whole cents, like the strip (it showed 48¢ for 47.68¢).
2. **Five fixes from the reviewers** (Los Chismosos found them in v4.78; Los Desconfiados tried to refute each one and could not):
   - A 30-second check asked for a redraw on every tick while a bet editor was open. It now asks once.
   - "No more today" (Hail Marys) showed up when only the long-shot moneyline allowance held a candidate back and no Hail Mary was used.
   - The ⏱ Old tab's La Contadora line said YES above the near-miss and Hail Mary cards listed there.
   - Live Games:
     - stopped downloading final box scores that can never list the player (about 0.4 GB over an NHL night on a phone);
     - checks the other games every 5 minutes, not every minute, once a bet's game is found;
     - keeps the found game when ESPN does not answer, instead of dropping it.

No floor, fee, Kelly, cap, stake or grading rule changed.

## The numbers (worked by hand, and in the tests)
- Polymarket US fee in the app: 6.95% × (1 − price), the same curve as Kalshi.
- Alonzo's slip: limit 47¢; one share costs 0.47 × (1 + 0.0695 × 0.53) = $0.4873. $4.61 ÷ 0.4873 = 9.46, so **9 shares**:
  - $4.23 before the fee;
  - **Cost ≤ $4.39** with it;
  - **pays $9.00** if it wins.
- Test board: model 56%, market 47%:
  - La Contadora 50.15%.
  - Her EV at 47¢ = (0.5015/0.47 − 1 − 0.0368)/1.0368 = +2.9%. At 48¢ it is +0.8%, under the 1.5% floor, so the limit is 47¢.
- Tests:
  - `poly-strip` (20 checks, at 390, 1000, 1280 and 1960 px);
  - `no-more-today` (7);
  - `live-player` (33: final box scores read once, the 5-minute re-check, ESPN not answering);
  - `old-prices` (23: the editor-open check).
- Each new check was run on v4.78 first and failed there.

## Questions for you
1. **Limit price.** The strip sets the limit at La Contadora's most (47¢), not at the price shown (44¢). With a thin book, part of the order can fill at 45–47¢, still at or above the floor. A limit at 44¢ protects more of the edge but may fill less, or not at all. Which should it be?
2. **Share count.** The count is worked at the limit price (9), so the cost never passes the stake even if every share fills at 47¢. At 44¢, 10 shares would fit. Is "never over the stake" the right side to err on?
3. **Fee.** The app assumes Polymarket US charges 6.95% × (1 − price), like Kalshi. Is that the real Polymarket US fee? Is it charged at the trade or from the payout?
4. **Kalshi, already live since v4.09 (reported to Alonzo, not changed).** The Kalshi strip says YES on an underdog spread. Kalshi's market is "<favourite> wins by over 1.5", so SEA +1.5 is NO there (our Worker prices it that way). A soccer Draw row also names the home team on Kalshi, and the Worker prices Draw rows as the home team on both books. Do you agree the same fix applies to Kalshi?
5. **Polymarket US forms (unverified).** Does the Limit form ask for shares or dollars, and can shares be fractional? Are moneylines Yes / No on "<team> wins", or one button per team? The strip covers both; a screenshot from Alonzo would settle it.
6. The earlier questions in the "Since you've been gone" note are still open.
