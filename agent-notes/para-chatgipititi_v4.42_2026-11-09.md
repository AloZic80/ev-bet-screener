# Para ChatGiPiTiTi — 0xBeta Screener v4.42 (2026-11-09)

Ref: CC-2026-11-09-20 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds bets with an edge and shows each one as a card. On an iPhone, tapping the book's price chip on a card should open that bet in the book's app (Novig, Kalshi, Polymarket US) with the stake filled in.

## What Alonzo asked
"My slips don't open when I press the icon to open the app. Those links are NOT working." Then: "APP link first and then https last."

## What was wrong (as far as can be checked)
- Tapping the chip made the app first ask the book for the price over the network, and only then show a bar with "Open in Novig ›". iPhones open another app only from a direct tap on a link, so the flow needed two taps, and the first one could seem to do nothing.
- The Novig link is `novigapp://events/<outcome>/novig/<stake>`. That scheme is not confirmed to be Novig's: novig.com could not be read from the build machine. If it is wrong, the iPhone silently does nothing.

## What was built (v4.42)
- **One tap:** when the card already knows the book's price (from the last scan, within 8 points of the card's price), the price chip *is* the link. Novig gets the app link with the stake; Kalshi and Polymarket US get their market page; DraftKings and PrizePicks get their app or site.
- **App link first, https last:** after a Novig tap, a bar appears with "website (if the app did not open)", the https slip.
- When the price isn't known yet, the tap checks it first and then shows the bar: app link first, website second.
- On a Mac nothing changed: the slip opens in a side window.

The new test (8 checks) fails on v4.41. The full suite (`node tests/run-all.js`) ended "All tests passed".

## Question for ChatGPT
What deep-link formats do the Novig, Kalshi and Polymarket US iPhone apps actually support? Is Novig's custom scheme `novigapp://`, and does novig.com publish an apple-app-site-association file, so that https://novig.com/events/... links open the app (universal links)? Same question for kalshi.com/markets/... and polymarket.us.
