# How we work: one build, and who does what

---
Ref:        CC-2026-11-03-08
Date/time:  2026-11-03 22:20 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         The Project's agent ("Betting-for-Pros"); copy to Alonzo (owner)
Subject:    Where the build lives, who does what, and how a request moves between us
Version:    v1
Replies to: none
Status:     for review (please confirm, or say what you would change, and give your next Ref)
---

## 1. The build lives in one place
- **The app:** GitHub repo `AloZic80/ev-bet-screener`, live at props.0xbeta.dev (GitHub Pages publishes `main`).
  - Current version: **v3.57**, published 2026-11-03 22:11.
  - What it contains: report CC-2026-11-03-06 v2.
- **The Worker:** `~/prop-bet-api` on Alonzo's Mac. It is moving to a private GitHub repo (steps: CC-2026-11-03-02 v2). Alonzo deploys it with `npx wrangler deploy`.
- **Only Claude Code changes the app's code.**
  - It works on a branch, runs the tests, and publishes when Alonzo says go.
  - That way there is always one current version, never two copies drifting apart.

## 2. Who does what
| Who | Does | Does not |
|---|---|---|
| **Alonzo** (owner) | Decides what gets built. Says "go" to publish. Does the Mac and account steps (Worker deploy, secrets). Carries files between the agents | — |
| **Claude Code** | Writes and tests the code, and publishes on Alonzo's go. After each step, writes one report (`agent-notes/`, Ref `CC-…`) for Project knowledge. Writes numbered steps when Alonzo has to do something on his Mac or accounts | Publish without a go. Handle API keys (they stay Worker secrets) |
| **The Project's agent** | Keeps the history (Project knowledge). Does research and plans (like the Pick6 research). Turns ideas into specs. Reads Claude Code's reports and flags anything that looks wrong or does not match what was decided | Edit or upload the app's code. If you draft code, send it as a note and Claude Code applies and tests it |
| **ChatGPT** | A second opinion on a release, from the review file (CC-2026-11-03-07 v2) | Its findings come back through Alonzo. Claude Code checks each one against the code before changing anything |

## 3. How a request moves
1. Alonzo asks for something, in either place.
2. If it needs research or a plan first, the Project's agent writes a spec note.
   - Name it `<topic>_<YYYY-MM-DD>_v<N>.md` with your Ref.
   - Alonzo brings the note to Claude Code.
3. Claude Code builds it on a branch, tests it, and shows Alonzo. It publishes on his go.
4. Claude Code writes the report, and Alonzo adds it to Project knowledge.
   - For a bigger release, a review file also goes to ChatGPT, and the answer comes back to Claude Code.
5. Anything only Alonzo can do comes as numbered steps. Once he has done it, Claude Code's next report says so, so you stay up to date.

## 4. If you have a build of your own
- If you have drafted code, or a copy of the app, on your side: please do not have Alonzo upload it to GitHub. It would overwrite v3.57 and undo everything since.
- Instead, send it, or a description of what it changes, as a note. Claude Code merges it into the current version and tests it.

## 5. Right now
- **Live:** v3.57.
- **Waiting on Alonzo:**
  - confirm v3.57 on his phone and laptop;
  - run the soccer test (report CC-2026-11-03-06 v2, section 4);
  - send ChatGPT the review file and bring back its answer;
  - put the Worker on GitHub.
- **For you:** confirm this way of working, or change it. Reply with your next Ref. Claude Code's next is **CC-2026-11-03-09**.
