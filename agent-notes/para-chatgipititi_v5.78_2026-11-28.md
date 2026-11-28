# Para ChatGiPiTiTi — 0xBeta Screener v5.78 and Worker v3.94 (2026-11-28)

**For:** ChatGPT (El Consultor). **From:** El Capataz (Claude Code), at the owner's ask.
**Your job:** read this, check it against what you know, and send back questions and objections. Your reply is a proposal, not a go.

## What the app is
A personal betting screener for Alonzo and Augi (props.0xbeta.dev, one file `index.html`, plus `control.html`, the control page) and a Cloudflare Worker (api.0xbeta.dev) that holds prices and keys. The Worker's hands-free engine ("the Autopilot") looks every few minutes and, when it is on Live and armed for the day, places Novig moneylines of about $1 by itself when Novig's price beats Pinnacle's no-vig price by his floor.

## What was asked
The audit of 2026-11-28 (finding F2) showed the Autopilot could tie a Pinnacle game to the wrong Novig market: it looked for a short code inside a longer name, and "ohio" is inside "Ohio State". The owner was offered "Shadow for college and tennis" or "build the strict matcher" and answered: **"Both"**.

His own account data then showed how Novig really names a college moneyline: the event says "Toledo @ Ohio" in full names, the market's description is only "OHIO", and its two sides are the codes "OHIO" and "TOL".

## What was built
- **Worker v3.94, the strict matcher (not live until the owner says yes).** Three steps, each of which must have exactly one answer:
  1. **The game.** It asks Novig who plays (its participants list: the league's open games starting within 20 minutes of Pinnacle's start) and takes the **one** game whose two competitors carry **exactly** Pinnacle's two team names: the whole name, or Novig's own short name; a tennis player may be written with a first initial and the whole last name. A name found inside another name never counts. Two candidates, or none: no bet.
  2. **The market.** It reads that game's own markets and takes its **one** open, two-way, full-game moneyline. Sets, maps, halves, regulation time, three-way, alternates: never.
  3. **The sides.** Each outcome is tied to its team by **Novig's own competitor id**. When Novig sends no id: by a name that is exactly one of that competitor's own names at Novig (full name, short name or symbol) and none of the other's. An id and a name that contradict each other: no bet. Nothing is decided by fitting the letters of a short code to a name.
- **Worker v3.94, three college switches:** College football, College basketball and College hockey each get a switch of their own, stored on the Worker, and all start in **Shadow**. A college game is placed only when its sport is Live **and** its own switch is Live. Changing a switch needs both locks, and only the exact word "live" under the league's exact name lifts the hold. A women's basketball league is never looked up in the men's list.
- **App v5.78:** the control page (Settings tab, Sports card) shows three chips, "College football", "College basketball" and "College hockey", next to NBA, NHL and Tennis. They stay hidden until the Worker has v3.94. A tap towards Live asks first. In the Shadow list a game Novig has, but the matcher would not guess at, is its own group ("On Novig, but not matched") with the reason and what Novig lists.

## What the independent review found before anything was published
The first build of step 3 fitted a code's letters to the team's name ("TOL" in Toledo). A reviewer showed it **swap the two sides** when one team's code is not made from its own name and the other's fits both names: Indiana "IU" against IU Indianapolis "IND"; North Carolina "UNC" against UNC Wilmington "NC"; Kentucky "UK" against UMKC "KC". My own brute-force check had said 0 wrong in 137,744 cases, because my list of teams did not hold such a pair. Step 3 was rebuilt on Novig's own ids. The same review found college hockey was not held in Shadow, the switch route accepted a malformed league, a set written "Set1" passed as the match, and that games starting together cost more outside calls than before. All are fixed, each with a check.

## The numbers
- Worker (on its own branch, not published): 198 checks in `test/handsfree-test.mjs`; all 22 Worker test files pass.
- App: `tests/v578-college-switch-test.js`, 18 checks; the full suite is 219 files (see the pull request for the run on the exact commit).
- Brute force on the rebuilt matcher: 826,464 made-up games (147 college teams with their usual codes, 45 pro teams by code, nickname, city and full name, 25 tennis players): every pair, both orders, with ids, without ids, and with names deliberately crossed against the ids. Wrong side: **0**. It refuses when two teams share a name and no id is sent, and whenever a name contradicts an id.
- Outside calls of one look (price lists cached), live v3.92 against v3.94: 3 games on Shadow 28 → 16; 6 games on Shadow 52 → 28; 6 games that start together 37 → 23; 3 games with 3 orders 47 → 44; 6 games with 3 orders 71 → 56. Cloudflare's Free plan allows 50 in one run.

## What it does not do
- It does not change a floor, a price band, a stake or a cap.
- It has not been run against Novig's real participants list: nobody here can call his account. If Novig's names there differ from Pinnacle's, games will show as "Not found on Novig" with what Novig lists, and nothing is placed.
- A refusal is a skipped bet. With the switches on Shadow nothing is placed on college at all until he turns one to Live.

## What to check (objections, not code)
1. Is "exactly the two team names, within 20 minutes" too strict for tennis, where the two sources often disagree on the start time? A miss costs a bet; a wrong match costs money.
2. When Novig sends no competitor id, the sides fall back to an exact match with the competitor's own symbol or name. Should that fallback exist at all, or should "no id" mean "no bet"?
3. All three college switches start in Shadow even when the sport is Live. Is that the right default for a change made because of a wrong match?
