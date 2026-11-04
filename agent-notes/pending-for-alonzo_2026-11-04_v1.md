# Still to do: Alonzo's checklist (on the Mac and phone)

---
Ref:        CC-2026-11-04-01
Date/time:  2026-11-04 12:30 America/Chicago
From:       Claude Code
To:         Alonzo (owner)
Subject:    Everything waiting on you, in order
Version:    v1
Status:     open
---

Do these in order. Each one says what to send back to Claude Code when you're done.

## 1. Change the screener passphrase (urgent, about 5 minutes, on the Mac)
The old one was typed into the Project chat, so treat it as exposed.
- [ ] Open Terminal.
- [ ] Go to the Worker folder:
      ```bash
      cd ~/prop-bet-api
      ```
- [ ] Set a new passphrase:
      ```bash
      npx wrangler secret put SCREENER_PASS
      ```
      When it asks, type a new passphrase of 12 or more characters. Never type it into any chat.
- [ ] Deploy:
      ```bash
      npx wrangler deploy
      ```
- [ ] On each device (phone and laptop), open props.0xbeta.dev → Settings → Screener passphrase → type the new one → Save.
- [ ] Check: the board loads (press Load).

**Tell Claude Code:** "passphrase changed". Don't include the passphrase.

## 2. Check that v3.58 is live (2 minutes, phone and laptop)
- [ ] Open props.0xbeta.dev and pull down to refresh.
- [ ] You see **v3.58** under the date on the phone, or next to the title on the laptop.
- [ ] You see the **🌍 Leagues** tab next to Board.

**Tell Claude Code:** "v3.58 seen".

## 3. The soccer test (5 minutes, uses about 2 The Odds API credits)
- [ ] Tap 🌍 Leagues. Wait for it to finish checking.
- [ ] Find **La Liga** (or any soccer league listed), then tap **Load odds**.
- [ ] Read the message under the Sources row, for example "✓ 12 bets on the board, 2 La Contadora would place · books: …".
- [ ] Sources → **Sportsbook API** → **Load +EV picks**. Read that message too.

**Tell Claude Code:** paste both messages (or a screenshot of them).

## 4. ChatGPT review (10 minutes)
- [ ] Paste into ChatGPT: the review request CC-2026-11-03-07 v2, then the addendum CC-2026-11-03-10. Both are in GitHub: `agent-notes/chatgpt-review_2026-11-03_v2.md` and `agent-notes/chatgpt-addendum_2026-11-03_v1.md`.
- [ ] Copy ChatGPT's whole answer.

**Tell Claude Code:** paste the answer. Claude Code checks each point against the code before changing anything.

## 5. Bring the Project's agent up to date (5 minutes)
- [ ] Paste into the Project chat, in this order:
  - `how-we-work_2026-11-03_v1.md` (CC-2026-11-03-08)
  - `release-v3.57_2026-11-03_v2.md` (CC-2026-11-03-06)
  - `reply-to-11_2026-11-03_v1.md` (CC-2026-11-03-09)
- [ ] Optional: add them to Project knowledge.
- [ ] Copy its reply.

**Tell Claude Code:** paste its reply. It should include its next Ref.

## 6. Put the Worker on GitHub, private (about 15 minutes, on the Mac)
This unlocks Pick6 step 2 and the automatic league list in 🌍 Leagues.
- [ ] Follow `agent-notes/worker-to-github_2026-11-03_v2.md` step by step. It includes checks A, B and C, which make sure no key gets uploaded.
- [ ] The new repo must be **Private**.

**Tell Claude Code:** "prop-bet-api is on GitHub", plus what checks A, B and C printed. Nothing printed is the answer we want.

## 7. After step 6 (Claude Code builds; you only deploy)
Claude Code adds these to the Worker:
- the free The Odds API league list and game list;
- Pick6 lines;
- a limit on wrong passphrase guesses.

Then on the Mac:
- [ ] Pull and deploy:
      ```bash
      cd ~/prop-bet-api && git pull && npx wrangler deploy
      ```
- [ ] On the app, open 🌍 Leagues and tap Check again. The note "after the Worker update" should be gone.

**Tell Claude Code:** "Worker deployed".

## Where everything lives
- All notes and their versions: https://github.com/AloZic80/ev-bet-screener/tree/main/agent-notes (index: `agent-notes/README.md`)
- The app: https://props.0xbeta.dev
