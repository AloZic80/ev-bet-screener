# Para ChatGiPiTiTi — 0xBeta Screener v4.49 (2026-11-10)

Ref: CC-2026-11-10-05 · Written by Claude Code, Tue 2026-11-10, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) reads Alonzo's fills from Novig, Kalshi and Polymarket US about once a minute, so his bets are logged and marked ALREADY BET. Since v4.46, a red bar above the bottom tabs says when that read fails.

## What Alonzo asked
He sees "Not read from Polymarket US: Polymarket 429 error code: 1015": "it is great, but NO WAY to remove it. Perhaps circle the Bet log, because I believe it is the Bet log missing, which I will check later tonight."

## What was built (v4.49)
- **× on the red bar** hides it until the kind of problem changes. The kinds are: the Worker failing, a given book failing, checks paused, last read too old. A different problem shows the bar again.
- **While any problem lasts, the Bet log tab has a red ring,** with the message on hover.
- **The top of the Bet log (From your books)** says the same thing, with Check now. It never says "all matched" when nothing could be read.
- **When the reads work again,** the bar, the ring and the hidden choice all clear.
- Error text is tidied ("code: 1015 ." → "code: 1015.").

## Also asked: "WHY are the same bets on Feeling Lucky and Clairvoyant? It makes no sense."
- **The two modes have the same limits:** Kelly 0.33, a 15% daily max and a 2.5% game cap, against Safe's 0.25, 10% and 2%.
- **Clairvoyant only adds long shots:** anytime TD, home run or goal at +200 or longer, +8% to +15% model EV, half size, $2 max.
- **With no long shot on the board, both modes show the same cards.** The mode note now says so, with the count. For example: "none on the board now clears +8%, so these are the same cards as Feeling Lucky", or in Feeling Lucky, "Clairvoyant … only adds long shots: 1 on the board now would show there".

## What the message means
- **Cloudflare error 1015 is a rate limit:** Polymarket's edge is refusing requests from the Worker's address for a while.
- **Cloudflare Workers share outgoing addresses,** so other people's Workers can trigger it too, not only his.
- **Only Polymarket US is affected:** Novig and Kalshi are still read. A Polymarket US bet placed meanwhile is logged once Polymarket answers again, or by hand with I bet this.

## Questions for ChatGPT
1. When a read-only exchange API rate-limits a shared serverless address (Cloudflare 1015), what back-off would you use? For example: double the wait after each 429 up to 15 minutes, and serve the last good answer with its age meanwhile. Is it worth reading Polymarket fills less often (every 5 minutes) when he has no open Polymarket bets?
2. Should the modes differ by more than limits? For example, Feeling Lucky could lower the EV floor a little or admit Watch bets at the minimum stake. Or are modes that only change how much (not which bets) the safer design?
