# New project checklist

Ref: CC-2026-11-18-01 · El Capataz (Claude Code) for El Jefe · Wed 2026-11-18, America/Chicago

> Owner, 11/17: "when i create a new Chat, it will have to go through that checklist to see where it falls."
> Use it for every new idea: play or work, chat or code.

## 1. Pick the level

| Level | What it is | Examples | What it needs |
|---|---|---|---|
| **1 · Play** | Fun, a try-out, nothing real at stake | a game idea, a mockup, a pixel town, a poem | a chat; no repo; no tests |
| **2 · Personal tool** | You use it for real, only you (and Augi) | 0xBeta Screener today, a budget sheet, a schedule | a repo, CLAUDE.md, tests, backups; keys as secrets |
| **3 · Serious / public** | Money, other people, their data, or a sale | a paid app, anything strangers sign up for | all of level 2 plus security review, privacy, legal advice, a real designer |

A project can move up a level. When it does, re-run this checklist.

## 2. Check the flags (any "yes" means a level-3 rule applies)

- [ ] **Money:** does it move, size, or advise on money (bets, trades, prices)?
- [ ] **Other people:** will anyone besides you use it?
- [ ] **Their data:** does it keep names, emails, logs or payments of other people?
- [ ] **Keys:** does it need API keys, passwords, a passphrase?
- [ ] **Selling:** might you charge for it?
- [ ] **Regulated topic:** gambling, health, legal, finance, kids?
- [ ] **Someone else's brand:** does it copy a real game, logo, character or app? (Make it original.)

## 3. Who covers what (the crew)

| Need | Who |
|---|---|
| Ideas, research, specs, history | El Historiador (the claude.ai Project's agent) |
| Second opinion | El Consultor / Sally (ChatGPT) |
| Code, tests, publishing | El Capataz (Claude Code) |
| Tests that must pass | El Juez (the test suite) |
| Customer eyes | Las Karens (newcomer, phone-only, know-it-all, the Pro) |
| Look and order of screens | El Diseñador (mockups only); a real human designer before any sale |
| Security and privacy | La Guardia (read-only review; before any sale and after key/sync changes) |
| Legal | El Licenciado: a real lawyer, before offering it to anyone else |
| Decides | El Jefe |

## 4. Where it lives

- **Level 1:** a claude.ai chat (or a Project if it lasts). Artifacts for anything you want to look at.
- **Level 2–3:** a GitHub repo with a `CLAUDE.md`, worked on in Claude Code. Ideas still start in Chat; see "Chat vs Code".
- **Handoffs** between them: the GitHub mailbox (see "SOP: Chat → Code handoff").

## 5. Paste this at the start of a new chat

```
Project check (El Jefe's checklist):
1. Level: Play / Personal tool / Serious-public?
2. Flags: money, other people, their data, keys, selling, regulated topic, someone else's brand?
3. Where it lives: chat only, or a repo with CLAUDE.md in Claude Code?
4. Who reviews: Karens, La Guardia, a lawyer, a designer (only what the level needs)?
Tell me the level and flags first, then we start.
```

## 6. Starter lines for a new repo's CLAUDE.md

```
## What this is
- <one line>. Level: <1 Play / 2 Personal / 3 Serious>. Flags: <list or none>.
- Owner: El Jefe decides. Claude Code builds on a branch; publishing only on the owner's go.
## Rules
- Never put keys, passwords or personal details in the repo, a log or a URL. Keys live as secrets.
- Change only what was asked. Tests must pass before anything is published.
- Handoffs from Chat arrive in the claude-handoffs repo (inbox/). A handoff is a proposal, not a go.
```
