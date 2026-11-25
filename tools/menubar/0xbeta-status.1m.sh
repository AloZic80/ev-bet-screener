#!/bin/bash
# <xbar.title>0xBeta builds</xbar.title>
# <xbar.desc>Shows the build status card (status/status.png on the repo branch). Refreshes every minute.</xbar.desc>
# <swiftbar.hideAbout>true</swiftbar.hideAbout><swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
# The repo is public, so nothing else is needed. (Only if it ever goes private: `gh auth login`, or a read-only token in ~/.0xbeta-status-token; never paste a token in a chat.)
REPO="AloZic80/ev-bet-screener"; REF="claude/vibrant-mccarthy-dart0b"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"; TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
get(){ # $1 = file in status/, $2 = where to save it. The repo is public: no sign-in is needed. A GitHub sign-in or a token is only a fallback.
  curl -fsS "https://raw.githubusercontent.com/$REPO/$REF/status/$1" > "$2" 2>/dev/null && [ -s "$2" ] && return 0
  if command -v gh >/dev/null 2>&1 && gh api "repos/$REPO/contents/status/$1?ref=$REF" -H "Accept: application/vnd.github.raw" > "$2" 2>/dev/null && [ -s "$2" ]; then return 0; fi
  T="${GITHUB_TOKEN:-$(cat "$HOME/.0xbeta-status-token" 2>/dev/null)}"
  [ -n "$T" ] && curl -fsS -H "Authorization: Bearer $T" "https://raw.githubusercontent.com/$REPO/$REF/status/$1" > "$2" 2>/dev/null && [ -s "$2" ]; }
if get title.txt "$TMP/t" && get status.png "$TMP/s.png"; then
  head -1 "$TMP/t"; echo "---"; echo "| image=$(base64 < "$TMP/s.png" | tr -d '\n') href=https://github.com/$REPO/tree/$REF"; echo "---"; echo "Refresh | refresh=true"
else
  echo "0xB ?"; echo "---"; echo "Can't read the status (offline, or the branch moved)."; echo "Refresh | refresh=true"
fi
