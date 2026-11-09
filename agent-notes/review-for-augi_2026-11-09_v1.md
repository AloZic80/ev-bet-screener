# Review of Augi's Odds Board, from Alonzo's side

Ref: CC-2026-11-09-01 · Written by Claude Code, Mon 2026-11-09, America/Chicago
For: Augi's agent (Project PP), passed on by Alonzo. Repo read: AugiM13/screener at 3f22ce0 (odds-board.html, game-hub.html).
No Worker address, password or key is in this note. I read the code only; running Augi's page and a real iPhone were out of reach from here.

## 1. Bugs worth fixing first

1. **NHL shots on goal grade wrong.** `playerStat` reads the `SOG` column for NHL shots. In ESPN's NHL box score `SOG` is 0 for every
   player; the real shots on goal are in `S`. From a real ESPN box score (11/5, Flyers): Acciari `SOG 0 · S 2`, Cates `SOG 0 · S 1`,
   Dvorak `SOG 0 · S 1`. So every NHL shots Over grades as a loss and every Under as a win. Fix: read `S` (use `SOG` only if it is
   non-zero), then re-grade NHL shots bets already settled by ESPN. We shipped the same bug in our app and found it the same way.
2. **A bet you already placed can be blocked from the log.** "I placed this · Log" is disabled once the row's price is over 20 minutes
   old (`openSingleEditor`, `oldQuote`). Placing happens in the book's app; if logging takes longer than 20 minutes, the bet cannot be
   recorded, so the game and daily caps under-count real money. Keep the 20-minute rule for screening and drafting, but always allow
   logging a placed bet with the price actually typed.
3. **The bankroll caps count singles only.** `screenRow` sums `placedSingles` for the game cap and the daily cap. Parlay and pick'em
   stakes are not counted, so a day can go over the daily cap through slips, and a pick can be a single and a parlay leg at once.
4. **"Already logged" needs the exact same text and line.** `rowKey` is game | player | market | outcome | point as text. A moved line
   (16.5 to 17.5) or the same game written differently by another source ("CHI @ PHI" vs "Chicago Bulls @ Philadelphia 76ers") is not
   seen as the same bet, and the Board offers it again. We hit this with a Novig moneyline. Suggest matching on sport + game day +
   team codes (or player) + market family, and showing "same bet, different line" instead of hiding the difference.
5. **A soccer draw is graded as a push on a moneyline.** `gradeFinalPick` returns push when the scores are level. In soccer a draw loses
   a team moneyline (unless the market is Draw No Bet). Also, ESPN's final for a cup game can include extra time; bets settle on 90'.

## 2. EV and probability units (the 11% vs 0.11% question)

- Inside the screen the units are consistent: probabilities are fractions (0 to 1), `gross` and `net` are fractions, and they are
  multiplied by 100 only for display and for comparing with the floors typed in percent. That part is right.
- The weak spot is `bpModelEvPercent(raw)`: it guesses the unit by size (`|raw| <= 1` means fraction, otherwise percent). BettingPros
  sends `market_expected_value` and `expected_value` as fractions (0.11 = +11%); our app reads the same fields and always multiplies by
  100. The guess breaks above +100% EV, which long shots reach: a raw 1.10 (+110%) is shown as +1.10%. Fix: decide the unit per source
  and field (BettingPros: always fraction, multiply by 100), and flag any |EV| over 50% as suspicious rather than reinterpreting it.
- `kitFair` has a fallback that builds a fair probability from an EV (`offer * (1 + ev / 100)`). That contradicts the Board's own rule
  ("a model EV alone cannot replace the missing probability"). Today only rows that already carry a probability reach it, but it is a
  trap for the next source added; consider removing it so such rows stay UNVERIFIED.

## 3. Which number decides PASS

- The fair probability is BettingPros' model probability when present (`kitFair` takes `modelProb` first), and the net EV floor and the
  displayed "Net +x%" use it. The stake, though, uses the market blend (`blend = market + weight × (model − market)`).
- So a pick can PASS on BettingPros' model while the blended edge is close to zero; usually the stake then falls under the minimum and
  it is skipped anyway, but the reason shown is the stake, not the edge. Suggest checking the floor on the blended net EV (the same
  number the stake is sized on) and showing that number on the row. In our app this one order (blended edge, outliers last) drives the
  sort, the daily cap and the "#1 math pick", which made it much easier to read.

## 4. The line to bet-log lifecycle

Source response → matchup check (`providerEventId`, `matchupVerified`) → fair probability (`kitFair`) → fee-adjusted EV and blended
Kelly stake (`kitMath`) → single / parlay decision (`screenRow`) → placed log → ESPN grade (`gradeFinalPick`). Identity is the text
`rowKey`, so anything that rewrites a game name, market label or line between steps (a rescan from another source, a line move)
breaks the link to the log and to "already logged". Points 2, 3 and 4 above are where money can go untracked.

## 5. Phone

- The Board table sits in `.overflow` with `max-height: 70vh` and its own scroll. On an iPhone that is a scroll trap: the finger moves
  the inner box, and the page (and the bottom navigation) only moves after the inner box hits its end. On a phone, let the page scroll
  and drop the max-height.
- Live Games embeds the Game Hub in an `<iframe>` with `min-height: 650px` and its own scrolling. Same trap, twice over inside the page.
  Either size the iframe to its content (the hub posts its height with `postMessage`) or render the hub inline on the phone.
- Could not be checked on a real device from here; the bottom-navigation behaviour needs Augi's iPhone.

## 6. Smaller things

- `index.html` at the root of the site is an old copy of Alonzo's Prop Screener v3.21 (615 KB). Nothing links to it and it holds no
  private address, but anyone opening the site root lands on it. A redirect to `odds-board.html` would avoid confusion.
- Sentinel cannot refresh book prices (documented). Showing each row's price age on the row, not only after 20 minutes, makes that
  visible before a decision.
