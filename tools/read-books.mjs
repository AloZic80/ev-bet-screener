// read-books.mjs — reads the bet-history pages you have open in Chrome (Bovada, PrizePicks, Underdog, Kalshi, Novig) and saves
// their text to one file, so the 0xBeta Screener can learn each book's layout and log your bets.
// It only READS what is on screen: it never clicks, never types, never sees your password, and sends nothing anywhere.
// Needs Node 22 or newer (no installs) and a Chrome started with remote debugging (see tools/README-read-books.md).
//   node read-books.mjs            → saves ~/Desktop/books-dump.json
const PORT = process.env.CDP_PORT || 9222;
const BOOKS = [['bovada', /bovada\./i], ['prizepicks', /prizepicks\./i], ['underdog', /underdogfantasy\.|underdogsports\./i], ['kalshi', /kalshi\./i], ['novig', /novig\./i]];
import { writeFileSync } from 'node:fs'; import { homedir } from 'node:os'; import { join } from 'node:path';
if (typeof WebSocket === 'undefined') { console.error('This needs Node 22 or newer (node -v). Install the LTS from nodejs.org.'); process.exit(1); }
let tabs;
try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); }
catch (e) { console.error('Could not reach Chrome on port ' + PORT + '. Start it with the command in tools/README-read-books.md first.'); process.exit(1); }
const pages = tabs.filter(t => t.type === 'page' && BOOKS.some(([, re]) => re.test(t.url)));
if (!pages.length) { console.error('No Bovada / PrizePicks / Underdog / Kalshi / Novig tab is open in that Chrome window. Open your bet history there and run me again.'); process.exit(1); }
function evalIn(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl), timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error('timed out')); }, 15000);
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id !== 1) return; clearTimeout(timer); ws.close();
      d.result && d.result.result ? resolve(d.result.result.value) : reject(new Error(JSON.stringify(d.error || d))); };
    ws.onerror = () => { clearTimeout(timer); reject(new Error('could not attach to the tab')); };
  });
}
// the visible text, plus each repeated block's text (a bet card usually is one), so a layout can be read without guessing
const READ = `(() => { const txt = document.body ? document.body.innerText : '';
  const blocks = [...document.querySelectorAll('[class*="bet" i],[class*="slip" i],[class*="entry" i],[class*="lineup" i],[class*="position" i],[class*="order" i],[class*="history" i],[data-testid]')]
    .filter(e => e.innerText && e.innerText.length > 20 && e.innerText.length < 2000).slice(0, 300)
    .map(e => ({ tag: e.tagName.toLowerCase(), cls: String(e.className || '').slice(0, 120), testid: e.getAttribute('data-testid') || '', text: e.innerText }));
  return { title: document.title, url: location.href, text: txt, blocks }; })()`;
const out = { at: new Date().toISOString(), pages: [] };
for (const t of pages) {
  const book = BOOKS.find(([, re]) => re.test(t.url))[0];
  try { const v = await evalIn(t.webSocketDebuggerUrl, READ); out.pages.push({ book, ...v }); console.log('✓ ' + book + ': ' + (v.text || '').length + ' characters, ' + v.blocks.length + ' blocks — ' + v.title); }
  catch (e) { console.log('✗ ' + book + ': ' + e.message + ' (' + t.url + ')'); }
}
const file = process.env.OUT || join(homedir(), 'Desktop', 'books-dump.json');
writeFileSync(file, JSON.stringify(out, null, 1));
console.log('\nSaved ' + out.pages.length + ' page(s) to ' + file + '\nOpen it, cross out anything you want (balance, account number), then send it to Claude.');
