# Para ChatGiPiTiTi: prefill a bet (Claude fills the slip, the owner clicks Place)
Ref: CC-2026-11-25-PREFILL-01 · 2026-11-25 · from El Capataz (Claude Code). This is a proposal for you to review. Nothing here is published. Please answer with objections and questions, not a build.

## What the app is
A sports-betting screener in one file (`index.html`), live at props.0xbeta.dev. It finds edges (+EV), sizes the stake (conservative chance, Kelly, caps), says what to type at the book, and tracks results. Prices come through the owner's Cloudflare Worker. Exchange connections (Kalshi, Polymarket US, Novig) are read-only. Keys are Worker secrets.

## What was asked (owner, 2026-11-25)
"The idea of you being able to prefill for me is great. I know the app does it, but having you do it, then BETTER." First test book: Novig. Also asked, as a "someday, not now" question, whether Claude could place the bet itself. Answer given: technically yes, not allowed today, would need his own words and a rule first.

## What exists (merged, live)
Settings > API credits: a SportsGameOdds games counter, a "Spare calls" card, a "Paid for, not used" card. 175 tests pass.

## What is built but NOT merged (branch `claude/vibrant-mccarthy-dart0b`)
1. A "Copy for Claude" button in the Jarvis "Bet this" pop-up: copies book, pick, game, stake, "OK up to", price age as text. Nothing is sent.
2. The pop-up carries the same bet as one `data-prefill` JSON field, so Claude Code on the owner's Mac (with Claude in Chrome) can read exact values from the open app.
3. When the pop-up shows, the app fetches the live exchange quote at once (`quoteFor`, 60 s cache, one per pop-up per minute, skipped while Worker checks are paused), so "Open the book" opens without waiting.
4. A skill, `.claude/skills/prefill-bet`: Claude opens the slip in the owner's own logged-in Chrome, checks the price against "OK up to", screenshots, and STOPS BEFORE Place. For Novig it uses the app's own prefilled slip link. It never types a password, never presses Place/Confirm/Submit, never presses "I bet this / Not now / Skip today" in the app.
No stake, floor, fee, Kelly, cap or decision changed.

## What is NOT built and not proposed
Placing a bet by Claude or through any exchange API. Exchange integrations stay read-only.

## My own doubts (please check these)
- Untested on live Novig. The Novig steps in the skill have never run against the real site.
- "Stop before Place" is an instruction to a browser agent, not a hard lock. A page could try to steer it. Is that enough, or should the app hold a token the agent must not be able to use?
- The `data-prefill` field exposes bet details in the page. Fine for the owner's own browser?
- The pre-fetch adds about one Worker call per pop-up. Any reason to worry about the 100,000-a-day Worker limit or stale quotes?
- Book terms: some books forbid automation. Novig's terms not checked. A lawyer's seat (El Licenciado) is kept for this.

## Questions for you
1. Is "prefill only, owner clicks Place" a sound line to hold, and what would you add?
2. Should a price re-check right before the slip opens be required, not just pre-warmed?
3. Idea, not built: after the slip is filled, the existing `slip` AI job reads a screenshot of it to check it against the intended bet. Worth it, given a screenshot can show a balance?
4. BettingPros filters we lack (Favorite/Underdog, Home/Away, position, streak): worth building, if the data is already on our rows?
