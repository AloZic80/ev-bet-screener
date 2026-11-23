# 🤖 Jarvis v1 (v5.27, 2026-11-22) · active

Owner, 11/22: "i want my scout to think for me and tell me what to bet, based off La Conta' but still to do the work for me ... i still need to click and make the bet, but for it to do pop ups";
"i have an API with $100 worth that i want to use on the app ... a Jarvis"; "approved only ... a near miss if it feels it"; "time would be dynamic ... during the week, its based off lunch or break,
meetings, etc, and weekend its almost ALL DAY"; "sound on"; then "BUILD ALL".

## The rule
- **La Contadora decides.** A pop-up is a board row that `scApproved` passes (inside My plan with the option on), in her order (`mathKey`). The stake, her most (OK up to), the book and the
  "Type this" ticket (`scTicket`) are read from that row. "Price must be X or better" is her most rounded to the strict side (as the ◎ alert's `perfAlertText`): cents on Kalshi / Polymarket
  (the card's own floor), a % on the other exchanges and predict apps (floored to 0.1%; the card's tile rounds, so it can be 0.1 lower than the tile), American odds elsewhere (never a price
  over her most; the card's tile rounds to the nearest, so it can be 1 point stricter).
- **The AI only labels.** Job `news` through `aiCall` (game, sport, market, start, player or team; nothing else), once a pick a day, cached in `mbev.ai.news`; only with the AI helper on and the
  Worker not paused. The moved-price line is the app's own `pxMove`. Nothing either says changes a pick, a stake or the order.
- **Never places a bet.** Open the book is the card's own `.pp-open` (the book-open handler, `slipLinkFor` on a phone). I bet this opens the card's own form (`openBetEditor`) inside the
  pop-up; its Save is the normal save, so the bet is ALREADY BET and Jarvis marks it done (never pops again). Not now: 30 minutes. Skip today: not again today.
- **Near-miss:** at most 2 a day, only a 🍀 Just missed row (`r.xc==='lucky'`: Watch, her EV with the market 0% or better, under the floor), game ahead and open, whose news check gives no warning
  (out, questionable, limited = warning; no answer = no near-miss). The pop-up says "Just missed · not approved · the app gives it no stake" and has no stake line. Needs the AI on.
- **Windows:** `mbev.jarvis` (synced) `{on, sound, plan, near, days:{0..6:{off, w:[[start,end],...]}}}`, Central time. Defaults Mon–Fri 12:00–1:00 PM and 3:00–3:30 PM, Sat–Sun
  9:00 AM–11:00 PM. An end before its start runs past midnight. Quiet for 1 hour wins; Talk now opens until midnight or until pressed again. Device only: `mbev.jarvisRun`.
- **The loop:** every 30 s while the page is open. Inside a window, every 10 to 15 minutes (randomised, plus up to 50 s): `scRunRow` with the Scout's own row at most once an hour (its daily
  scout cap and the calls left still hold), the Sentinels only in between; skipped while the Worker is paused, while a scout is busy, or when Auto Sentinels ran in the last 8 minutes or a set
  time fired in the last 15. Outside: silent, no calls; new picks go on a "While you were away" list (up to 30) shown first when the next window opens (started, moved, already bet, still approved).
- **Sound and notifications:** `perfBeep` on each pop (Sound on by default, a switch in the panel); a Notification per pick while the tab is hidden, after "Turn on phone/browser notifications".
- **Spend line:** today's and this month's AI spend from `mbev.ai.log`, the Worker's caps ($5 a day, $90 a month, or what `/ai/status` said).
- God only: `jvActive()` = `DEV_APP && easyLevel()==='god' && on`; `#jvPop` is hidden in Easy by CSS too.

## Tests
`tests/v527-jarvis-test.js`.

## Round 2 (2026-11-23, review of 69e5685)
- J1–J3: the pick on screen is identified by its key, book and price, never a board idx. `jvRecheck` (called from `render` after every board render, so also after sync and fill imports, and on every tick) closes it when it is gone or already bet ("already in your Bet log", marked done), and redraws it when its book, price, stake, OK up to or ticket changed (an open bet form is closed). I bet this and Save check again first (`jvCurRow`, `jvSig`); Save on a changed or already-bet pick is refused.
- J4: Jarvis's own BettingPros scouts use at most `JV_SCOUT_DAY` = 3 calls a day of the scout cap (`scCalls` in `mbev.jarvisRun`), and none while a ⏰ set time is still to come today. The panel says "Jarvis scouts today: n of 3".
- J5: inside an open Jarvis window, `scAlert` skips the picks Jarvis pops (`jvTakes`); outside, the 🔔 alert works as before. One AI news call a pick: `aiNewsOnce` (shared in-flight call by `aiNewsKey`) plus today's cache, in both `jvNews` and `scNewsAll`.
- J6: `mbev.jarvisRun` is written only when it changed. J7: Talk now ends at the next Central midnight (`jvMidnight`, also on clock-change days).
- J8: one tab pops at a time: `mbev.jarvisLease` {id, at}, taken by the tab you use (pointer, key, focus), renewed each tick, free after 90 s or when the tab closes or reloads (pagehide). The tab that loses it closes its pop-up at once (storage event); the one that takes it pops at its next check, never in the middle of a tap.
- J9: "N more after this" counts only picks that will show (`jvMoreN`); the ticket, AI and price-move lines sit in a `details` toggle, folded under 700 px; Why? scrolls the card below the pop-up.

## Round 3 (2026-11-23, review of af32355)
- N1: `jvSig` includes the row's idx, so a shifted row redraws; a capture listener on Open the book resolves the row by key at tap time (`jvCurRow`) and sets the button's data-idx to it, or holds the tap and redraws when the pick changed.
- N2: the "Type this" ticket is always in view. Only the news and price-move lines fold (folded under 700 px), with a ▸/▾ marker, and stay as the owner left them across a redraw (`cur.moreOpen`).
- N3: `mbev.jarvisLease` is taken or renewed only inside a window or Talk now, and renewed only after 60 s of its 90 s life (about once a minute). The queue is sorted by `mathKey` before each pop (a pick handed back by another tab included). `R.toned` keeps one tone and notification per pick for 25 minutes, so a handover does not ring twice; a Not now return rings again.
- N4: the pop-up is in the page (the first child of `body`, `position:relative`), not over it: it pushes the page down and never covers a control. When the page is scrolled down, `jvKeep` scrolls by the pop-up's change in height, so what is on screen does not move. A browser driven by a test (`navigator.webdriver`) gets Jarvis only when it saved `mbev.jarvis` itself (`jvAutomated`); the owner's own browser has Jarvis on by default. v527-jarvis-test opts in.

## Round 4 (2026-11-23, review of 1b39290)
- N5: a steady page. `jvKeep` (with `jvKeepStart` / `jvKeepEnd`) reads the top of the first in-flow element after `#jvPop` before every change of its height (open, redraw, Not now, Skip today, close, the late news line, the fold) and scrolls back by exactly the difference right after; `html.jv-noanc` turns the browser's own scroll anchoring off meanwhile. Measured: no control moves more than 0.4 px at 390 and 1280, from the top, scrolled and at the bottom. At the very top this puts the pop-up just above the screen.
- N6: `#jvChip`, a fixed pill (32 px, 30 px on a phone) when the pop-up is above the screen: "🤖 Jarvis: N picks ↑" centred on a computer, "🤖 N picks ↑" at the top right on a phone (clear of the header buttons). A tap scrolls up to the pop-up. Hidden while the pop-up is in view or a bet form, El Compa or a dialog is open. Content still scrolls under it, like any bar fixed at the top.
- S3: a tap refused because the pick left the board says "The last pick changed; this is the next one." on the next pick (`jvSaid`).

## Round 5 (2026-11-23)
- Owner spec "big, top of the screen, impossible to miss": at the top of the page (scrollY 8 px or less before the change) nothing is held: the pop-up opens in view and pushes the page down, and closing just closes; no chip there. Scrolled down, the round-4 hold and the chip are unchanged.
