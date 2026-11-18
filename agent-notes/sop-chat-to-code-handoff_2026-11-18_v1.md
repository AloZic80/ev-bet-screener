# SOP: Chat → Code handoff via the GitHub mailbox

Ref: CC-2026-11-18-03 · El Capataz (Claude Code) for El Jefe · Wed 2026-11-18, America/Chicago · Standard from today

> Owner, 11/17: "cant we make a repo, and have Chat to send to GitHub or have me save 1 large ZIP on github" · "Ok. put that on a PDF. make this a standard. SOP"

## Purpose
One place where ideas from Chat (El Historiador, Sally, any chat) reach Claude Code, so nothing depends on copy-paste or a chat that closes.

## One-time setup (about 10 minutes)
1. On github.com: **New repository** → name `claude-handoffs` → **Private** → add a README → Create.
2. In it, create three folders (github.com: *Add file → Create new file*, type `inbox/README.md`, commit; same for `done/` and `templates/`).
3. Add `templates/handoff.md` with the template below.
4. Give Claude access: the Claude GitHub App must include `claude-handoffs` (claude.ai → connect GitHub; check in the app for the exact screen).
   Then in a Code session, Claude can attach it ("add the claude-handoffs repo").
5. Add this line to each project's `CLAUDE.md` (El Capataz adds it to the screener's): *Handoff SOP: handoffs from Chat arrive in AloZic80/claude-handoffs inbox/; a handoff is a proposal, not a go.*

## Steps (every handoff)
1. **Chat writes it.** Say: "Write the handoff for Claude Code using the template." Check it reads right.
2. **Name it** `YYYY-MM-DD_<project>_<topic>_v<N>.md` (e.g. `2026-11-18_screener_la-sala_v1.md`). Big material (images, PDFs, data): one zip with the same name.
3. **Drop it in** `claude-handoffs/inbox/` (github.com → *Add file → Upload files*; works on the phone).
4. **Tell Code:** "Pick up handoff 2026-11-18_screener_la-sala." (In a scheduled task, Code can check the inbox itself.)
5. **Code reads and checks** it against the real code, then answers with questions or objections. **Nothing is built yet.**
6. **You decide.** Code builds only after you say **build** (and, for the math, after Sally and Code agree).
7. **Code closes it:** moves the file to `done/`, adds `<same name>_reply.md` (what was built, the version, tests, links), and sends you the report.
8. **You file the report** in the claude.ai Project's knowledge, so El Historiador sees it.

## Template (`templates/handoff.md`)
```
# Handoff: <topic>
From: <Chat / Sally / El Historiador> · Date: <YYYY-MM-DD> · Project: <repo name> · Level: <1 Play / 2 Personal / 3 Serious>
## What El Jefe asked (his words, quoted)
## What to build or change (plain list)
## What must NOT change
## Numbers, examples, test cases (exact)
## Open questions for Claude Code
## Attachments (file names in this folder)
```

## Rules
- **No secrets.** Never a key, password, passphrase, email or account number in a handoff, a zip or a file name.
- **One topic per handoff.** A new idea is a new file; a change is the same name with `_v2`.
- **A handoff is a proposal, not a go.** Building needs El Jefe's "build" (CLAUDE.md working rules).
- **Quote El Jefe's words** exactly; Code keeps them in the build's notes.
- **Never upload over the app's own repo.** Code drafted elsewhere comes in as a handoff to merge and test, never straight onto `main`.
- **Done means moved.** Only Code moves files to `done/`, with its reply next to them.

## Return path (Code → Chat)
`done/<name>_reply.md` + the report in the project's `agent-notes/` + the PDF or .md sent to you → you add it to Project knowledge.

## Who does what
| Step | Who |
|---|---|
| Write the handoff | Chat (El Historiador, Sally) with El Jefe |
| Upload to `inbox/` | El Jefe |
| Check, ask, build, test, publish | El Capataz (Claude Code), El Juez |
| Say "build", file reports | El Jefe |

## One-line checklist
**Write (template) → name it → upload to inbox/ → "pick up handoff …" → answer questions → "build" → reply in done/ → report into the Project.**
