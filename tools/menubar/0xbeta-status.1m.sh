#!/bin/bash
# <xbar.title>0xBeta builds</xbar.title>
# <xbar.desc>Build status from status/status.json on the repo branch, as text and progress bars. Refreshes every minute.</xbar.desc>
# <swiftbar.hideAbout>true</swiftbar.hideAbout><swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
# The repo is public, so nothing else is needed. (Only if it ever goes private: a read-only token in ~/.0xbeta-status-token; never paste a token in a chat.)
REPO="AloZic80/ev-bet-screener"; REF="claude/vibrant-mccarthy-dart0b"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:$PATH"; TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
T="${GITHUB_TOKEN:-$(cat "$HOME/.0xbeta-status-token" 2>/dev/null)}"
if [ -n "$T" ]; then curl -fsS -H "Authorization: Bearer $T" "https://raw.githubusercontent.com/$REPO/$REF/status/status.json?t=$(date +%s)" > "$TMP/j" 2>/dev/null
else curl -fsS "https://raw.githubusercontent.com/$REPO/$REF/status/status.json?t=$(date +%s)" > "$TMP/j" 2>/dev/null; fi
if [ ! -s "$TMP/j" ]; then echo "0xB ?"; echo "---"; echo "Can't read the status (offline, or the branch moved)."; echo "Refresh | refresh=true"; exit 0; fi
python3 - "$TMP/j" "$REPO" "$REF" <<'PY'
import json, sys
j = json.load(open(sys.argv[1])); repo, ref = sys.argv[2], sys.argv[3]
W = 20; items = j.get("items", [])
def frac(i):
    t = float(i.get("total") or 0)
    if t > 0: return max(0.0, min(1.0, float(i.get("done") or 0) / t))
    return 1.0 if i.get("state") == "done" else 0.0
def col(i): return {"done": "#12663a,#5fd38d", "failed": "#b71c1c,#ff8a8a", "working": "#2330b8,#aab2ff"}.get(i.get("state"), "#444444,#c4c4c4")   # light-mode colour, dark-mode colour
run = next((i for i in items if i.get("state") == "working" and float(i.get("total") or 0) > 0), None)
bad = any(i.get("state") == "failed" for i in items); alldone = bool(items) and all(i.get("state") == "done" for i in items)
print(("⚠️ " if bad else "✅ " if alldone else "🔨 ") + (f"{run.get('done', 0)}/{run.get('total')}" if run else ("done" if alldone else "working")))
print("---")
print((j.get("headline") or "Builds") + " | font=Menlo-Bold size=14 color=#111111,#ffffff")
for i in items:
    n = round(frac(i) * W); bar = "█" * n + "░" * (W - n)
    tot = float(i.get("total") or 0)
    print(f"{i.get('name','')} | font=Menlo-Bold size=13 color={col(i)}")
    print(f"{bar}  " + (f"{i.get('done', 0)} / {int(tot)} · " if tot > 0 else "") + f"{i.get('note') or i.get('state','')} | font=Menlo size=12 color={col(i)}")
print("---")
print(f"Updated {j.get('updated', 'unknown')} | size=12 color=#444444,#c4c4c4")
print(f"Open the branch | href=https://github.com/{repo}/tree/{ref}")
print("Refresh | refresh=true")
PY
