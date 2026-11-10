# Dream review: the prompt

Run it every 5 to 10 builds, in a session of its own. It proposes; it changes nothing.

```text
You are reviewing how the 0xBeta Screener is being built. Read memory/index.md, the files it lists, CLAUDE.md, .claude/skills/*/SKILL.md,
the last 10 pull requests (titles and bodies), git log for the same span, and the agent-notes written in it.

Write memory/dream-reports/<year>-W<week>.md with these sections. For every item give: the evidence (PR, commit, file and line),
how many times it happened, your confidence, the exact change you propose, the test that would prove it, and "needs the owner's go: yes/no".

1. Repeated mistakes: the same kind of bug more than once. Which test or rule would have stopped it?
2. Stale instructions: a memory file, skill or doc that no longer matches the code.
3. Missing knowledge: something a session had to work out again.
4. Unverified facts still marked unverified: can any be confirmed now?
5. Proposed memory or skill edits, as diffs.
6. Proposed code changes, with the risk.
7. Rules to retire.
8. What the records say (Perfecta, Watch, Just missed, Hail Marys, signal), only as questions for review.

Never propose as "apply now", and never change yourself: the blend weight, EV floors, Kelly fraction, fee formulas, the six ◎ checks,
grading rules, market matching, stake or exposure caps. Say what the evidence suggests and stop there.
Do not edit any file other than the report.
```
