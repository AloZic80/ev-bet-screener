#!/usr/bin/env python3
# <xbar.title>0xBeta Autopilot</xbar.title>
# <xbar.version>v5.39</xbar.version>
# <xbar.desc>Your auto-bet readout in the Mac menu bar: mode, armed for today, money used and left, today's orders. Read-only.</xbar.desc>
# <swiftbar.hideAbout>true</swiftbar.hideAbout>
# <swiftbar.hideRunInTerminal>true</swiftbar.hideRunInTerminal>
# <swiftbar.hideLastUpdated>false</swiftbar.hideLastUpdated>
# <swiftbar.hideDisablePlugin>true</swiftbar.hideDisablePlugin>
#
# v5.39 (owner 2026-11-26: "a Swiftbar of sorts, but i can see it all the time"). The file name (0xbeta.30s.py) makes SwiftBar run it every 30 seconds.
# It only READS your Worker's /autobet/status. It cannot place, stop or resume anything: Proceed and Stop stay on the control page, where they ask first.
# The sign-in is never in this file: it is read from your Mac's Keychain (items "0xbeta-pass" and "0xbeta-sync", added once by you, see README.md).
# Preview without signing in: run   python3 0xbeta.30s.py --demo
import sys, json, hashlib, subprocess, urllib.request, urllib.error, time, datetime

API = 'https://api.0xbeta.dev'
PAGE = 'https://props.0xbeta.dev/control.html'
SCREENER = 'https://props.0xbeta.dev/'

def keychain(service):
    try:
        r = subprocess.run(['security', 'find-generic-password', '-s', service, '-w'], capture_output=True, text=True, timeout=5)
        return r.stdout.strip() if r.returncode == 0 else ''
    except Exception:
        return ''

def money(n):
    try:
        return '$%.2f' % float(n)
    except Exception:
        return '-'

def clock(ms):
    try:
        return datetime.datetime.fromtimestamp(float(ms) / 1000.0).strftime('%-I:%M %p')
    except Exception:
        return ''

def fetch():
    pw = keychain('0xbeta-pass')
    sync = keychain('0xbeta-sync')
    if not pw or not sync:
        return None, 'setup'
    key = hashlib.sha256(('0xbeta-sync:' + sync).encode()).hexdigest()
    req = urllib.request.Request(API + '/autobet/status', headers={'x-screener-pass': pw, 'x-sync-key': key, 'x-sync-device': 'Menu bar', 'User-Agent': '0xbeta-menubar'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            j = json.loads(r.read().decode())
            return (j, None) if j.get('ok') is not False else (None, 'worker')
    except urllib.error.HTTPError as e:
        return None, ('locked' if e.code in (401, 403) else 'worker')
    except Exception:
        return None, 'offline'

DEMO = {'ok': True, 'mode': 'LIVE', 'killed': False, 'requireArm': True, 'armed': True, 'budget': 10, 'reserved': 1.0, 'left': 9.0,
        'orders': [{'t': int(time.time() * 1000) - 3600000, 'name': 'UTSA -12.5', 'result': 'placed', 'price': 0.48, 'qty': 208}]}

def main():
    demo = '--demo' in sys.argv
    st, err = (DEMO, None) if demo else fetch()
    if err:
        words = {'setup': 'Not set up yet: add the sign-in to the Keychain (README.md)', 'locked': 'The Worker says locked: check the Keychain items',
                 'worker': 'The Worker did not answer properly', 'offline': 'No connection to the Worker'}[err]
        print('0xβ ?')
        print('---')
        print(words + ' | color=#f0b840')
        print('Open the control page | href=' + PAGE)
        return
    os_ = st.get('orders') or []
    used, left = st.get('reserved') or 0, st.get('left') or 0
    killed = bool(st.get('killed'))
    needs = (not killed) and st.get('requireArm') and not st.get('armed')
    dot = '🔴' if killed else ('🟠' if needs else '🟢')
    label = 'STOPPED' if killed else ('Proceed?' if needs else money(left) + ' left')
    print('0xβ %s %d · %s' % (dot, len(os_), label))
    print('---')
    mode = 'REAL money' if st.get('mode') == 'LIVE' else 'Paper money'
    print('%s · %s | color=%s' % ('Autopilot', mode, '#3ddc84' if st.get('mode') == 'LIVE' else '#f0b840'))
    if killed:
        print('STOPPED: nothing is placed until you press Resume | color=#ff6b6b')
    elif needs:
        print('Not armed today: tap Proceed on the control page | color=#f0b840 href=' + PAGE)
    else:
        print('Armed for today')
    print('Today: %s used of %s · %s left' % (money(used), money(st.get('budget')), money(left)))
    print('Orders today: %d' % len(os_))
    print('---')
    if os_:
        for o in list(reversed(os_))[:8]:
            qty = ''
            if o.get('price'):
                try:
                    qty = ' · %.2f contracts at up to %.1f%%' % (float(o.get('qty') or 0) / 100.0, float(o['price']) * 100)
                except Exception:
                    qty = ''
            print('%s · %s · %s%s%s' % (clock(o.get('t')), o.get('name') or o.get('key') or '', o.get('result') or '', qty, (' (' + o['reason'] + ')') if o.get('reason') else ''))
    else:
        print('No orders yet today')
    print('---')
    print('Open the control page (Proceed, Stop) | href=' + PAGE)
    print('Open the screener | href=' + SCREENER)
    print('Refresh now | refresh=true')

main()
