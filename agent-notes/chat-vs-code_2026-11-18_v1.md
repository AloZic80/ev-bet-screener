# Chat vs Code: which one, when, and how to move between them

Ref: CC-2026-11-18-02 · El Capataz (Claude Code) for El Jefe · Wed 2026-11-18, America/Chicago

> Owner, 11/17: "Code lives/uses a repo, regular doesnt" · "explain when its best to start a project on chat and then move to Code" ·
> "tell me how i swiftly go from Chat to Code ... Because you told me you can't read the chats or project files".

## 1. The short version

| | **Chat** (claude.ai chats and Projects) | **Code** (Claude Code: this cloud session, the Mac terminal, the desktop app's Code tab) |
|---|---|---|
| Lives in | conversations; a Project keeps files ("Project knowledge") and instructions | a **git repository** (folder of files with history on GitHub) |
| Good at | thinking, research, writing, specs, mockups, artifacts (pages you can open) | changing code, running tests, branches, pull requests, publishing |
| Its memory | the chat, the Project's files and instructions | the repo itself: `CLAUDE.md`, `memory/`, `agent-notes/`, the commit history |
| Can it run your app's tests? | no | yes (El Juez) |
| Can it see the other one? | no: Chat does not see the repo unless you attach files | no: Code cannot read your chats or Project files |

So yes: **Code uses a repo; Chat does not.** Each one is blind to the other unless you carry things across (section 4).

## 2. Start in Chat when...

- the idea is still fuzzy, or you want to talk it through, name it, or research it;
- you want a spec, a plan, a list of questions, or a mockup to look at;
- you want a second opinion (Sally) before anything is built.

## 3. Move to Code when...

- something must **run**, be **saved in files**, **tested**, or **published** (a website, the Worker, a script);
- the spec is agreed and you say "build";
- you need to change something that already exists in a repo.

Rule of thumb: **Chat decides what; Code makes it real.**

## 4. The bridges (how things cross)

**Chat → Code**

1. **Paste.** Copy the text from Chat and paste it into the Code session. Best for short notes. (What you already do with Sally.)
2. **Artifact link.** Ask Chat to put the spec in an artifact, then paste its claude.ai link into Code. Code can open artifacts you own with its artifact
   reader (confirmed in this session's tools). Best for a long spec or a mockup.
3. **File upload.** Download a file from Chat (a .md, a PDF, a zip) and drop it into the Code chat. Code reads it in full.
4. **The GitHub mailbox** (the standard): save the handoff into the private `claude-handoffs` repo's `inbox/`; Code picks it up by name. Works from your
   phone, keeps a history, and nothing gets lost when a chat closes. See "SOP: Chat → Code handoff".

**Code → Chat**

5. **Reports and notes.** Code writes reports in the repo (`agent-notes/`) and sends you the PDF or .md; you add them to the Project's knowledge.
6. **Para ChatGiPiTiTi notes** for Sally, as one copy-paste block.

What Code **cannot** do: read your claude.ai chat history or a Project's knowledge files directly. If something is only in a chat, bring it over with 1–4.

## 5. The swift path (Chat → Code, every time)

1. In Chat, when the idea is ready: **"Write the handoff for Claude Code using the template."** (The template is in the SOP.)
2. Save it: download the .md and upload it to `claude-handoffs/inbox/` on github.com (phone works), or keep it as an artifact.
3. In Code: **"Pick up handoff 2026-11-18_screener_la-sala"** (or paste the artifact link).
4. Code checks it against the real code, asks its questions, and builds only after you say **build**.
5. Code moves the handoff to `done/` with a short reply and sends you the report for the Project.

## 6. Which Code?

| Where | Good for | Note |
|---|---|---|
| Cloud session (like this one) | long builds while you are away, scheduled tasks, phone follow-up | wiped when the session ends; everything worth keeping is pushed to GitHub |
| Mac terminal (`claude`) / desktop Code tab | your Mac's own files, the mods (Model Selector), quick looks | same weekly limit as everything on your Max plan |

Both read the same repos on GitHub, so work on one branch at a time from one place to avoid collisions.

*Where this guide is unsure about a menu name or setting, check in the app: the products change faster than this note.*
