# Put the Worker on GitHub (private), so Claude Code can build Pick6 step 2

---
Ref:        CC-2026-11-03-02
Date/time:  2026-11-03 20:35 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         Alonzo (owner)
Subject:    Steps to put ~/prop-bet-api in a private GitHub repo
Version:    v1
Replies to: CC-2026-11-03-01
Status:     for review
---

About 10 minutes, all on your Mac. **The repo must be private:** it holds your Worker's code. Your API keys are not in the code
if they were set with `npx wrangler secret put`, but step 2 below double-checks that.

## 1. Create the empty repo on GitHub
1. Go to https://github.com/new
2. Repository name: **prop-bet-api**
3. Choose **Private**.
4. Leave "Add a README", ".gitignore" and "license" **unticked**.
5. Press **Create repository**.

## 2. On your Mac: make sure no secrets get uploaded
Open Terminal and run these one at a time:

```bash
cd ~/prop-bet-api
```

```bash
printf 'node_modules/\n.wrangler/\n.dev.vars\n.env\n.env.*\n*.log\n.DS_Store\n' >> .gitignore
```

That keeps out installed packages, Wrangler's local files and the local secrets files (`.dev.vars`, `.env`).
Now check the code itself for a key typed straight into it:

```bash
grep -rInE "(api[_-]?key|secret|token|password)[\"']?\s*[:=]\s*[\"'][A-Za-z0-9_\-]{16,}" --exclude-dir=node_modules --exclude-dir=.wrangler --exclude=.dev.vars --exclude=.env .
```

- **Nothing printed:** good, go on to step 3.
- **Something printed:** stop. Don't upload. Tell Claude Code what file and line it named (not the key itself).
  That key should move into `npx wrangler secret put` and be replaced at the provider.

## 3. Upload it
Run these one at a time. If the first says "not a git repository", run `git init` first.

```bash
git status
```

```bash
git add -A
```

```bash
git commit -m "Worker as deployed"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/AloZic80/prop-bet-api.git
```

```bash
git push -u origin main
```

If `git remote add` says "remote origin already exists", run `git remote set-url origin https://github.com/AloZic80/prop-bet-api.git`
and then the push. If the push asks you to sign in, use GitHub Desktop or run `gh auth login` first.

## 4. Let Claude Code see it
1. Go to https://github.com/apps/claude/installations/select_target and pick your account (AloZic80).
2. Under **Repository access**: if it says "Only select repositories", add **prop-bet-api** and save.
   If it says "All repositories", there's nothing to do.

## 5. Tell Claude Code
Say: **"prop-bet-api is on GitHub"**. Claude Code then:
1. Adds the repo to its session and reads the Worker.
2. Builds Pick6 step 2 on a branch: the two routes, the credit floor and the headers, exactly as approved.
3. Tests it and opens a pull request for you to look at.

You merge it, then deploy from your Mac:

```bash
cd ~/prop-bet-api && git pull && npx wrangler deploy
```

After that, **Get Pick6 lines** in the Parlays tab works. The first press is the 2-credit test from the approval.
