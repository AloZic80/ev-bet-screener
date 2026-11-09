# Para ChatGiPiTiTi — 0xBeta Screener v4.32 and v4.33 (2026-11-09)

Ref: CC-2026-11-09-09 · Written by Claude Code, Mon 2026-11-09, America/Chicago. No keys or passwords in it.

## The app in one paragraph
0xBeta Screener (props.0xbeta.dev) finds sports bets with an edge (+EV), sizes stakes with quarter Kelly on a halved edge, and keeps an honest record. It wears Augi's Odds Board look with his five tabs pinned at the bottom.

## What Alonzo asked
1. "When I scroll up, the tab bar does not stay pinned down." (iPhone)
2. "With an option to change the colour palette, in case I want blue, red, etc., but as a scheme."

## What was built
- v4.32: the tab bar now sits directly in the page body on its own drawing layer, the usual fix for iPhone Safari letting a fixed bar slide while scrolling back up. Tested in Chrome's engine (stays at the bottom after scrolling back to the top); Safari itself could not be run on the build machine, so Alonzo's iPhone is the real check.
- v4.33: Settings › Layout › Colours: Green (Augi's, the default), Blue, Red, Purple, Graphite. Each is a full scheme for light and dark (page, panels, tabs, buttons, outlines). Wins stay green and losses red in every scheme. All ten combinations pass the 4.5:1 contrast rule. Saved on each device.

## Question for ChatGPT
In a betting app where green means a win and red a loss, is a red colour scheme a good idea, or should Red be dropped to avoid mixing "brand red" with "loss red"?
