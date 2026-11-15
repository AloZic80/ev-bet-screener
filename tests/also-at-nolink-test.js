// node tests/also-at-nolink-test.js — v5.11 bug fix (owner 11/15: "You found bugs but left alone ? Why not address them?").
// An "also at" price with no link (a live price whose book gave no web or app address) is ANOTHER book's price. Before, a tap on it fell through the
// slip handler to the card and opened the card's OWN book slip (on an exchange card: Novig, Kalshi, Polymarket), while its hover said "Tap to open it". Now the tap does nothing, the chip is not styled
// as tappable, and its hover says "No direct link here: open <book> and search for this bet." The card's own "open slip ↗" still opens its slip.
// The no-link case is made here by giving Kalshi's live price no address and removing Kalshi's home page from the page's list (as for a book the app
// has no address for). Fixture adapted from tests/v509-test.js.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,900)); };
const NOW=Date.parse('2026-11-15T01:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-14';
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const TEAMS=[T('away','NSH','Nashville','Predators'),T('home','VGK','Vegas','Golden Knights')];
const row=(extra)=>Object.assign({name:'Shane Wright',team:'NSH',game:'NSH @ VGK',matchup:'NSH @ VGK',side:'U',sport:'NHL',market:'0.5 Points',kind:'prop',book:'Hard Rock',offeredRaw:'-230',offeredProb:230/330,fairProb:0.73,fairRaw:'',mktProb:0.705,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+2*H),timeCT:'',detail:'',teams:TEAMS},src:'api:NHL:props',apiKey:'hr',loadedAt:iso(NOW-60e3)},extra||{});
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1100}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d,bk])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:bk,bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1');
    localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [[row({apiKey:'nv', book:'Novig', offeredRaw:'-233', offeredProb:0.70})], DAY, 'Novig, Kalshi, Polymarket US']);   // a Novig card: her chance 71.375% vs 70.0%, +2.0% EV
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); const R={};
      bets.forEach(dd=>{ const [kind,,bk]=dd.id.split(':'); if(kind==='alt' && bk==='kalshi') R[dd.id]={ok:true, src:'kalshi', price:0.70, at:new Date(Date.now()).toISOString()}; });   // Kalshi 70.0%, with no address
      return r.fulfill({contentType:'application/json',body:JSON.stringify({at:new Date(Date.now()).toISOString(),results:R})}); }
    if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1300);
  for(const t of ['safe','boring','volado','lucky','hail']){ const has=await p.evaluate(()=>!!document.querySelector('#placeCards .sc-card .sc-alts')); if(has) break; await p.evaluate(m=>{ try{ setMode(m); }catch(e){} }, t); await p.waitForTimeout(250); }
  // no address for Kalshi: its live price is shown without a link (as for any book the app has no address for)
  await p.evaluate(()=>{ try{ delete BOOK_HOME.kalshi; }catch(e){} window._opens=[]; window._slipReadyCalls=0; const wo=window.open; window.open=function(){ window._opens.push(String(arguments[0]||'')); return {closed:false, close(){}, location:{href:''}, document:{write(){}, close(){}}}; };
    if(typeof slipReady==='function'){ const sr=slipReady; window.slipReady=function(){ window._slipReadyCalls++; return sr.apply(this, arguments); }; } });
  await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')); const btn=c&&c.querySelector('.sc-alt-chk'); if(btn) btn.click(); }); await p.waitForTimeout(700);
  const chip=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')); if(!c) return null;
    const k=[...c.querySelectorAll('.sc-alts .sc-alt')].find(x=>/70\.0%/.test(x.textContent) && !x.hasAttribute('data-alt-idx') && !x.classList.contains('ref')); if(!k) return {none:true, strip:(c.querySelector('.sc-alts')||{}).textContent||''};
    k.setAttribute('data-test-nolink','1'); return {tag:k.tagName, cls:k.className, title:k.getAttribute('title')||'', cursor:getComputedStyle(k).cursor}; });
  check('the Kalshi live price with no address is plain text: a span with class nolink, not a link, and not styled as tappable', !!chip && chip.tag==='SPAN' && /\bnolink\b/.test(chip.cls) && chip.cursor==='default', chip);
  check('its hover no longer says "Tap to open it"; it says "No direct link here: open Kalshi and search for this bet."', !!chip && !/Tap to open it/.test(chip.title) && /No direct link here: open Kalshi and search for this bet\.$/.test(chip.title), chip&&chip.title);
  const url0=await p.evaluate(()=>location.href);
  if(chip && chip.tag) await p.click('[data-test-nolink="1"]'); await p.waitForTimeout(500);
  const after=await p.evaluate(()=>({opens:window._opens.slice(), slip:window._slipReadyCalls, url:location.href, bar:!!(document.getElementById('slipGo') && getComputedStyle(document.getElementById('slipGo')).display!=='none' && document.getElementById('slipGo').textContent.trim())}));
  check('a real tap on it opens nothing: no slip window, no slip bar, the page stays where it is (before v5.11 it opened Novig, the card’s own book)', after.opens.length===0 && after.slip===0 && after.url===url0 && !after.bar, after);
  // control: the card's own "open slip ↗" still opens its book's slip (so the spy above can see an opening)
  await p.evaluate(()=>{ window._opens=[]; });
  const own=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>x.textContent.includes('Shane Wright')); const o=c&&c.querySelector('.pp-open'); if(o) o.setAttribute('data-test-own','1'); return !!o; });
  if(own) await p.click('[data-test-own="1"]'); await p.waitForTimeout(800);
  const after2=await p.evaluate(()=>({opens:window._opens.slice()}));
  check('control: the card’s own "open slip ↗" still opens a slip window (the tap handler still works for the card’s own book)', own && after2.opens.length>=1, {own, after2});
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
