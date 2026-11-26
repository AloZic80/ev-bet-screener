# 0xBeta menu bar (SwiftBar)

A live readout of your auto bets in the Mac menu bar, like `0xβ 🟢 1 · $9.00 left`. Click it for the day's orders. It only **reads**; Proceed and Stop stay on the control page, where they ask first.

## Preview it first (no sign-in, fake numbers)
```bash
python3 tools/swiftbar/0xbeta.30s.py --demo
```

## Install (one time)
1. Install SwiftBar (free): `brew install --cask swiftbar`, then open it and pick a plugin folder (for example `~/SwiftBar`).
2. Copy `0xbeta.30s.py` into that folder and make it runnable: `chmod +x ~/SwiftBar/0xbeta.30s.py`. The `30s` in the name means it refreshes every 30 seconds.
3. Add your sign-in to the Keychain. **You type these, in your own Terminal.** Each command asks for the value and does not show it:
```bash
security add-generic-password -a "$USER" -s 0xbeta-pass -w
```
```bash
security add-generic-password -a "$USER" -s 0xbeta-sync -w
```
The first is the screener passphrase, the second is the sync password. They never go in the script, in a message to anyone, or anywhere except your own Keychain.
4. Click the menu bar item. If it says "Not set up yet," the Keychain items are missing or misspelled.

## What the menu bar says
| Menu bar | Meaning |
|---|---|
| `0xβ 🟢 1 · $9.00 left` | Armed for today, 1 order, $9.00 left |
| `0xβ 🟠 0 · Proceed?` | Not armed today: open the control page and tap Proceed |
| `0xβ 🔴 0 · STOPPED` | The kill switch is on |
| `0xβ ?` | No answer, locked, or not set up (the menu says which) |

Remove it any time by deleting the file from the plugin folder.
