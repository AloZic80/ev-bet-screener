# Personal edition (owner, 2026-11-16)

"i want the AI as my companion. lots of the features we have will not go out as the app that we will charge FYI. this is mine personally."

This app (props.0xbeta.dev) is Alonzo's own. Features listed here are personal-only: a paid public version, if one is ever made, is a
separate build that leaves them out (and gets its own legal review, CLAUDE.md "The end game").

| Feature | Since | Why personal |
|---|---|---|
| AI helper (slip reader, screenshot prices, news, match, results, ask my log, weekly words, bug notes) | v5.15 | his Anthropic key and credit; his data |
| Exchange integrations (Kalshi, Polymarket US, Novig fills and settlements) | v4.x | his own accounts, read-only |
| Scout now, Schedule, Auto Sentinels, Alerts | v5.18 | his feeds' quotas and his routine |
| 🤝 El Compa, the AI companion chat (job compa; asks before any action that spends feed calls) | v5.19 (Worker v3.47) | talks with him about his own board, log, plan and schedule; runs his own scouts; his Anthropic key and credit |

## The paid version (owner, 2026-11-16)
"THe one we will charge, will be lighter. by then we will use/pay for 1 API only. Unless they get there own. But, we can figure that out later."
Lighter build, one paid data API (or users bring their own key). Decide later; nothing built for it yet.

## Free sources to add (owner, 2026-11-16)
"i do have some other API's i want to add. Free ones, but it will alleviate some of the ones we have since they can easily dwindle down."
Plan: free sources go behind the Worker (keys as Worker secrets), cached, and are used first so BettingPros / SGO / Odds API quota lasts longer.

## API-Sports (checked 2026-11-17)
Free plan = seasons 2022–2024 only, 100 requests a day per sport: no current games, odds or scores. Owner: "why would i want old seasons and have a limit on requests?" · "ok, we remove on next build".
To do on the next Worker change: remove src/apisports.js, its two routes and its test (v3.46). Owner removes the secrets APISPORTS_KEY and the misnamed one, and resets the key on api-sports.io.

## Dev mode now, Regular mode after 1,000+ bets (owner, 2026-11-17)
"yes, i understand the TOO few, but thats for final REPORTS. this is an ONGOING survey and go with the stats we go now. When we sell the app, then it would be different. See this as a Dev app. since we also have an AI now" (about the per-tab edge highlights), then at 8:27 PM:
"from now on, we are making my dev app. when we are ready after 1k or more, we change go reg mode".
- Dev mode (now): running-survey labels (tab edge highlights, "so far" badges) show live with no minimum sample, always with the count ("so far · N bets"). A label never changes a decision, stake, order or tab content.
- Reports, the Scorecard and the 1,000-bet test keep their careful small-sample wording in both modes.
- Regular mode: after 1,000+ settled bets, on the owner's word. Highlights get sample gates, as a paid version would have. Nothing is built for the switch yet.

## v5.24 levels (2026-11-21)
God (⚡) is this personal edition and stays the default. Easy (🟢) is what a paying newcomer would see: Today, My bets, Learn, Settings. Plus (⭐) is reserved, nothing assigned. The "Back to God mode" switch and the "who sees what" labels exist only while `DEV_APP` is true. Easy has no AI helper, scout, alerts or God words. Details: `memory/decisions/tiers-and-easy.md`.
