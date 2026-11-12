// node tests/v483-test.js — v4.83 (agreed with Sally, owner "BUILD" Thu 11/12): the 🔔 alert waits for a 🦑 press to finish, an open banner drops
// cards that stopped being Perfectas you can see, a filter change takes a quiet baseline, #1 MATH PICK never goes to a ⏱ Old card, 👻 AWOL and ⏱ Old
// cards are $0 and hold none of the daily max ("if found / if refreshed: up to $X"), and a tap on the price that gets a sure NO OFFER is $0 at once.
// La Contadora = 64% (model = market) at 58% (Novig, no fee): EV +10.3%, 💪 Machín, ◎ 6 of 6 while the price is under 10 minutes old.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,700)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T02:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr,loc,nick)=>({ha,id:abbr,abbr,name:loc+' '+nick,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const GI={state:'pre',startISO:iso(TIP),eventId:'401900',timeCT:'',detail:'',teams:[T('away','CHA','Charlotte','Hornets'),T('home','PHX','Phoenix','Suns')]};
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
const row=(id,name,team,market,book,price,c)=>({name,team,game:'CHA @ PHX',matchup:'CHA @ PHX',side:'O',sport:'NBA',market,kind:'prop',book,offeredRaw:am(price),offeredProb:price,fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:GI,src:'api:NBA:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('g','Collin Gillespie','PHX','1.5 Threes','Novig',0.58,0.64), row('b','Devin Booker','PHX','2.5 Threes','Novig',0.58,0.64), row('m','Miles Bridges','CHA','1.5 Threes','Novig',0.58,0.64),
  row('k','Kel Oubre','PHX','1.5 Threes','Kalshi',0.55,0.64), row('g2','Collin Gillespie','PHX','9.5 Points','Novig',0.60,0.64)];   // g2: the same player, a smaller edge (one per player: g wins)
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig,Kalshi',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    const ANS={};
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])), R={}; bets.forEach(d=>{ const a=!/^open:/.test(d.id) && ANS[d.name]; R[d.id]=a||{ok:true, src:d.book, price:d.name==='Kel Oubre'?0.55:0.58, bid:0.53, at:Date.now(), outcome:'o-'+d.name, title:d.name}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const look=()=>p.evaluate(()=>{ const el=document.getElementById('perfAlert'), on=!!(el && el.classList.contains('on')), g=k=>lastRows.find(r=>r.apiKey===k)||{};
      return {on, lines:on?[...el.querySelectorAll('.pa-i')].map(x=>x.textContent):[], seen:Object.keys(JSON.parse(localStorage.getItem('mbev.perfSeen')||'{}')).filter(k=>k!=='_init').length,
        ring:Object.fromEntries(['g','b','m','k'].map(k=>[k, g(k).ring?g(k).ring.n+'/'+g(k).ring.of:null])), stake:Object.fromEntries(['g','b','m','k'].map(k=>[k, +(+g(k).stake||0).toFixed(2)])),
        hold:Object.fromEntries(['g','b','m','k'].map(k=>[k, g(k).hold||null]))}; });
    const ev=(f,a)=>p.evaluate(f,a).then(()=>p.waitForTimeout(300));
    if(W===1280){
      const v0=await look();
      check('three Novig Perfectas (6 of 6) on the board; alerts are off, so no banner', v0.ring.g==='6/6' && v0.ring.b==='6/6' && v0.ring.m==='6/6' && !v0.on, v0);
      // alerts on while the search shows only Kel: the board in view is the starting point
      await ev(()=>{ filterPlayer='Kel'; refresh(); localStorage.setItem('mbev.perfNotify','1'); localStorage.removeItem('mbev.perfSeen'); refresh(); });
      const v1=await look();
      check('alerts turned on with the search on "Kel": nothing rings, and the three hidden Perfectas are not saved as seen', !v1.on && v1.seen<=1, v1);
      await ev(()=>{ filterPlayer=''; refresh(); });
      const v2=await look();
      check('3. clearing the search is a filter change: a quiet baseline, so the three Perfectas now in view do not ring, and they are still not saved as seen', !v2.on && v2.seen<=1, v2);
      await ev(()=>{ const r=lastRows.find(x=>x.apiKey==='m'); r.awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh(); });
      await ev(()=>{ delete lastRows.find(x=>x.apiKey==='m').awol; refresh(); });
      const v3=await look();
      check('a Perfecta that leaves the view (👻 AWOL) and comes back rings: "◎ New Perfecta · Miles Bridges …"', v3.on && v3.lines.length===1 && /^Miles Bridges Over 1\.5 Threes · Novig/.test(v3.lines[0]), v3);
      // 1. no 🔔 while a press is still working
      await ev(()=>{ lastRows.find(x=>x.apiKey==='b').awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh(); });
      await ev(()=>{ delete lastRows.find(x=>x.apiKey==='b').awol; window._perfHold=1; refresh(); });
      const v4=await look();
      check('1. while a 🦑 press is still working (window._perfHold), a card that becomes a Perfecta does not ring and is not saved as seen', v4.lines.length===1, v4);
      await ev(()=>{ delete window._perfHold; refresh(); });
      const v5=await look();
      check('1. at the press’s last redraw it rings: the banner now names Bridges and Booker', v5.lines.length===2 && v5.lines.some(t=>/^Devin Booker/.test(t)), v5);
      // 2. the open banner drops cards that stopped being Perfectas you can see
      await ev(()=>{ lastRows.find(x=>x.apiKey==='m').awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh(); });
      const v6=await look();
      check('2. Bridges goes 👻 AWOL: his line leaves the open banner; Booker stays', v6.on && v6.lines.length===1 && /^Devin Booker/.test(v6.lines[0]), v6);
      await ev(()=>{ filterPlayer='Gillespie'; refresh(); });
      const v7=await look();
      check('2. a filter that hides Booker drops his line too; no line left, no banner', !v7.on, v7);
      await ev(()=>{ filterPlayer=''; refresh(); });
      // 5. ⏱ Old and 👻 AWOL: $0, no daily max, "if refreshed / if found: up to $X"
      await ev(()=>{ lastRows.find(x=>x.apiKey==='b').loadedAt=new Date(Date.now()-13*3600e3).toISOString(); refresh(); });
      const v8=await look();
      check('5. Booker’s price is 13 hours old: $0 and no daily max, with what he would get kept ($ as Gillespie’s); Bridges (AWOL) the same', v8.stake.b===0 && v8.hold.b && v8.hold.b.why==='old' && Math.abs(v8.hold.b.stake-v8.stake.g)<0.005 && v8.stake.m===0 && v8.hold.m && v8.hold.m.why==='awol', v8);
      await p.evaluate(()=>setMode('old')); await p.waitForTimeout(300);
      const c1=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Devin Booker/.test(x.textContent)); return {money:c?c.querySelector('.sc-money').textContent.replace(/\s+/g,' ').trim():null, top:document.querySelectorAll('#placeCards .sc-mathtop').length}; });
      check('5. his card in ⏱ Old says "$0 if refreshed: up to $X"; 4. no card in ⏱ Old is the #1 MATH PICK', /^\$0 ?if refreshed: up to \$\d+\.\d\d/.test(c1.money||'') && c1.top===0, c1);
      await p.evaluate(()=>setMode('awol')); await p.waitForTimeout(300);
      const c2=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Miles Bridges/.test(x.textContent)); return c?c.querySelector('.sc-money').textContent.replace(/\s+/g,' ').trim():null; });
      check('5. Bridges in 👻 AWOL says "$0 if found: up to $X"', /^\$0 ?if found: up to \$\d+\.\d\d/.test(c2||''), c2);
      const dec=await p.evaluate(()=>{ localStorage.setItem('mbev.cards','0'); refresh(); return [...document.querySelectorAll('.dec')].map(x=>x.textContent.trim()); });
      check('5. table view: his row says "👻 AWOL $0" (not BET $X)', dec.includes('👻 AWOL $0') && !dec.some(t=>/^BET \$/.test(t)), dec);
      await ev(()=>{ localStorage.setItem('mbev.cards','1'); setMode('safe'); });
      // 6. a tap on the price: Kalshi says there is no offer to buy → $0 at once, out of Place these
      ANS['Kel Oubre']={ok:false, note:'Kalshi: no offer to buy right now'};
      const k0=await look();
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Kel Oubre/.test(x.textContent)); c.querySelector('.sc-price').click(); }); await p.waitForTimeout(1600);
      const k1=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k'); return {stake:+r.stake||0, gone:r.qGone||null, out:(r.flags||[]).filter(f=>f[0]==='out').map(f=>f[1]), card:[...document.querySelectorAll('#placeCards .sc-card')].some(x=>/Kel Oubre/.test(x.textContent))}; });
      check('6. Kel had a stake; the tap’s "no offer to buy" from Kalshi makes him $0 at once, out of Place these, with "NO OFFER at Kalshi · … · Send the Sentinels to check other books"', k0.stake.k>0 && k1.stake===0 && !k1.card && k1.gone && k1.gone.tap && k1.out.some(t=>/^NO OFFER at Kalshi · exact market found, but nobody is selling this side now · Send the Sentinels to check other books$/.test(t)), {k0:k0.stake, k1});
      delete ANS['Kel Oubre'];
      await p.evaluate(async()=>{ await shopExchanges(); }); await p.waitForTimeout(500);
      const k2=await p.evaluate(()=>{ const r=lastRows.find(x=>x.apiKey==='k'); return {stake:+r.stake||0, gone:r.qGone||null}; });
      check('6. the next 🦑 press reads a price at Kalshi: he is back with a stake', k2.stake>0 && !k2.gone, k2);
      // Los Chismosos: a held card must not win the one-per-player pick (its runner-up would be $0 too)
      const e0=await p.evaluate(()=>{ const g=k=>lastRows.find(r=>r.apiKey===k); return {g:+g('g').stake||0, g2:+g('g2').stake||0}; });
      await ev(()=>{ lastRows.find(x=>x.apiKey==='g').awol={book:'Novig', note:'Novig: no market at your line', at:Date.now()}; refresh(); });
      const e1=await p.evaluate(()=>{ const g=k=>lastRows.find(r=>r.apiKey===k); return {g:+g('g').stake||0, hold:g('g').hold||null, g2:+g('g2').stake||0, tier:g('g').tier||null}; });
      check('Gillespie’s Threes win his one-per-player pick ($8.93, Points $0); when the Threes go 👻 AWOL ($0, held), his Points bet gets the money instead, and the held card is never re-offered as an extra', e0.g>0 && e0.g2===0 && e1.g===0 && e1.hold && e1.g2>0 && !e1.tier, {e0, e1});
    } else {
      await p.evaluate(()=>{ lastRows.find(x=>x.apiKey==='b').loadedAt=new Date(Date.now()-13*3600e3).toISOString(); refresh(); setMode('old'); }); await p.waitForTimeout(400);
      const L=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .sc-card')].find(x=>/Devin Booker/.test(x.textContent)), m=c&&c.querySelector('.sc-money'), r=m&&m.getBoundingClientRect(), cr=c&&c.getBoundingClientRect();
        return {money:m?m.textContent.replace(/\s+/g,' ').trim():null, inside:!!(r&&cr&&r.right<=cr.right+1), sideways:document.documentElement.scrollWidth>innerWidth}; });
      check('390 px: "$0 if refreshed: up to $X" fits inside the card, no sideways scroll', /if refreshed: up to/.test(L.money||'') && L.inside && !L.sideways, L);
    }
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
