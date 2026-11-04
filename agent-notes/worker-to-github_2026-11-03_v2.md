# Put the Worker on GitHub (private), so Claude Code can build Pick6 step 2

---
Ref:        CC-2026-11-03-02
Date/time:  2026-11-03 20:50 America/Chicago
From:       Claude Code (cloud session, repo AloZic80/ev-bet-screener)
To:         Alonzo (owner); copy to the other agent for review
Subject:    Steps to put ~/prop-bet-api in a private GitHub repo
Version:    v2 (adds two checks that no secrets file is uploaded, including from old history; replaces v1)
Replies to: 2026-11-03-06
Status:     for review
---

About 10 minutes, all on your Mac. **The repo must be private.** Keys stay in `npx wrangler secret`, never in files.
Run each command on its own and look at what it prints.

## 1. Create the empty repo on GitHub
1. Go to https://github.com/new
2. Name: **prop-bet-api**. Choose **Private**.
3. Leave README, .gitignore and license **unticked**. Press **Create repository**.

## 2. On your Mac: keep secrets out
```bash
cd ~/prop-bet-api
```

```bash
printf 'node_modules/\n.wrangler/\n.dev.vars\n.env\n.env.*\n*.log\n.DS_Store\n' >> .gitignore
```

**Check A: is any key typed into the code?**
```bash
grep -rIniE "(api[_-]?key|secret|token|password)[\"']?[[:space:]]*[:=][[:space:]]*[\"'][A-Za-z0-9_-]{16,}" --exclude-dir=node_modules --exclude-dir=.wrangler --exclude=.dev.vars --exclude=.env .
```
- **Nothing printed:** good.
- **Something printed:** stop. Tell Claude Code only the file name and line number, not the key.

```bash
git status
```
If it says "not a git repository", run `git init` and go on.

**Check B: was a secrets file ever saved in this folder's history?** (It matters only if the folder was already a git repo.)
```bash
git log --all --oneline -- .dev.vars .env '*.dev.vars' '*.env'
```
- **Nothing printed:** good.
- **Lines printed:** stop. Pushing would upload that old secrets file. Tell Claude Code; it will give you steps to start
  a clean history.

## 3. Upload
```bash
git add -A
```

**Check C: is a secrets file about to be uploaded?**
```bash
git ls-files | grep -iE '(^|/)(\.dev\.vars|\.env)'
```
- **Nothing printed:** good.
- **Something printed:** stop and tell Claude Code the file name.

```bash
git commit -m "Worker as deployed"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/AloZic80/prop-bet-api.git
```
(If it says "remote origin already exists", run `git remote set-url origin https://github.com/AloZic80/prop-bet-api.git` instead.)

```bash
git push -u origin main
```
If it asks you to sign in, use GitHub Desktop or run `gh auth login` first.

## 4. Give Claude Code access
Go to https://github.com/apps/claude/installations/select_target and choose **AloZic80**. If it says "Only select
repositories", add **prop-bet-api** and save.

## 5. Tell Claude Code
Say **"prop-bet-api is on GitHub"**, and paste what checks A, B and C printed (nothing is the answer we want).

## Tested
Claude Code tested the checks on sample folders before sending:
- Check A catches long keys in any capitalisation, and ignores short values and `env.X` references.
- Check B finds a secrets file committed in the past, and prints nothing on a clean or brand-new folder.
- Check C finds a secrets file that's about to be uploaded.
