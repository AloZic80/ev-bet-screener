# Para ChatGiPiTiTi — 0xBeta Screener v5.64 (2026-11-27)

**For:** ChatGPT (El Consultor; the owner also calls La Contadora's math "her"). **From:** El Capataz (Claude Code), at the owner's ask.
**Your job:** read this, check it against what you know of the math, and send back questions and objections. Your reply is a proposal, not a go: nothing is built until Claude Code and you agree on the exact scope and the owner says build. Do not ask for keys, passwords or the passphrase.

## What the app is
A personal betting screener for Alonzo and Augi (props.0xbeta.dev, one file `index.html`) plus a Cloudflare Worker (api.0xbeta.dev) that holds prices and keys. One conservative chance, `min(model, market + 0.35 × (model − market))`, and the EV it gives drive every decision. Labels and modes never change a stake. The six ◎ checks, floors, fees, Kelly and caps are frozen without the owner's own words.

## What changed since the last note (v5.30, 11/25)
1. **Hands-free engine on the Worker (v3.58 to v3.75).** The Worker, not the owner, loads prices. It takes Pinnacle's price with the vig removed as the fair price, compares it to Novig, runs La Contadora's math, and when a game passes it places a $1 Novig limit order itself. Moneylines only so far. Floor 3% edge, ceiling 12%, price band 12 to 88%, at least 20 minutes before the start. Hard limits: $10 a day, $20 Novig cap, a daily Proceed button, a kill switch, one order per game and axis, stop after 4 failed orders. Football is live; NBA, NHL and tennis have their own modes (Shadow by default; one chip was seen LIVE and is flagged).
2. **Price sources.** Pinnacle prices come from pinnapi, then Pinnodds, then The Odds API as a back-up (each with its own key and daily budget; free plans are 100 a day). v3.75 adds PinnRadar as a third look-only provider (soccer three-way, handicaps and totals; not in the chain yet).
3. **Saving calls.** Lists are cached by sport (football about 58 minutes, others about 173 minutes at 50 a day). v3.72 adds a schedule check: when the first game is over 6 hours away, the list is kept until 3 hours before it. A 429 holds asking for 15 minutes.
4. **Shapes, read-only.** `/handsfree/shapes?league=` shows what Novig lists per league (market types, outcomes, line fields) so soccer three-way and spread/total matching can be built on real data. Not built yet.
5. **Control page (v5.54 to v5.64).** Terminal look; four tabs (Hands-free, Games, Settings, Other); phone cards; closed dropdowns with live summaries; a provider picker for the Pinnacle look (v5.64); a Board redraw log (v5.63) because a Board row keeps redrawing every few seconds (cause unknown, not reproducible with empty feeds).

## The numbers
App tests: about 215 files, all pass on each publish. Worker tests: 12 files (hands-free file has 148 checks). Daily Pinnacle budget 50 per provider, Odds API 8. Orders so far are $1 each.

## What to check (please answer with objections, not code)
1. **Edge band.** The engine only bets between 3% and 12% edge. Is a ceiling of 12% right, or does a larger gap usually mean the Pinnacle or Novig price is stale or mismatched?
2. **Devig.** The fair price uses two-way devig (`devig2`). For soccer three-way (home, draw, away) which devig do you want, and should a draw ever be bet?
3. **Spreads and totals.** Novig lines can sit at different numbers than Pinnacle's main line. What is the safest rule to match them (same number only, or adjust)?
4. **Stake.** $1 orders are only for proving the engine. When to scale, and by what rule that the 1,000-bet test can judge?
5. **Anything in the above you would call a flaw in the math, the guards, or the order of work.** List worst first.

## Rules Claude Code follows (so you can plan around them)
Answer before building; one terminal step at a time for the owner; no change to the math without the owner's own words; only settled bets win or lose; plain words for people who may not know betting.
