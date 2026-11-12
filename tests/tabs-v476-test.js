// node tests/tabs-v476-test.js — v4.76 (owner, 11/12: "Boring, Volado, Machín, Suertudo, Brujo", "start with boring and end with Brujo", and the
// Cover bands list: "WE are going to add all those, inside those 5 Tabs"): five tabs, highest chance first, each holding its cover bands:
// 😴 Boring = High Cover + Heavy Favorite (75%+) · 💪 Machín = Strong + Solid + Lean (60–75%) · 🪙 Volado = Slight Lean + On the Line (50–60%) ·
// 🍀 Suertudo = Coin Flip (45–50%) and the near-misses · 🔮 Brujo = Unlikely (under 45%) and the Hail Marys. Inside a tab, a header per band.
// Listing only: stakes unchanged. Each test bet has model = market = its chance, so La Contadora's chance is exactly that (worked by hand).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got===undefined?null:got).slice(0,600)); };
const NOW=Date.parse('2026-11-12T19:00:00Z'), DAY='2026-11-12', TIP=Date.parse('2026-11-13T01:00:00Z'), iso=ms=>new Date(ms).toISOString();
const T=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr+' Team',loc:abbr,nick:'Team',logo:'',rec:'',color:'333333',alt:'ffffff'});
const am=p=>p>=0.5?String(Math.round(-100*p/(1-p))):'+'+Math.round(100*(1-p)/p);
// chance c, price c − 4 points (Novig, no fee): EV = c/(c − 0.04) − 1, over the floor for every row. Alpha: 80% at 74% (−285, inside the default −300 to +500 range)
const row=(id,player,c,gap)=>({name:player,team:'T'+id,game:'T'+id+' @ H'+id,matchup:'T'+id+' @ H'+id,side:'O',sport:'NHL',market:'1.5 Shots On Goal',kind:'prop',book:'Novig',offeredRaw:am(c-(gap||0.04)),offeredProb:+(c-(gap||0.04)).toFixed(4),fairProb:c,fairRaw:'',mktProb:c,stars:3,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(TIP),eventId:'7'+id,timeCT:'',detail:'',teams:[T('away','T'+id),T('home','H'+id)]},src:'api:NHL:props',apiKey:id,loadedAt:iso(NOW-60e3)});
const ROWS=[row('a','Alpha Boring',0.80,0.06), row('b','Bravo Heavy',0.77), row('c','Charlie Strong',0.72), row('d','Delta Lean',0.62), row('e','Echo Slight',0.57), row('f','Foxtrot Line',0.52), row('g','Golf Coin',0.47), row('h','Hotel Unlikely',0.40)];
const WANT={boring:['Alpha Boring','Bravo Heavy'], safe:['Charlie Strong','Delta Lean'], volado:['Echo Slight','Foxtrot Line'], lucky:['Golf Coin'], clair:['Hotel Unlikely']};
(async()=>{ const b=await chromium.launch();
  for(const W of [1280,390]){
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:W,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    const tabs=await p.evaluate(()=>[...document.querySelectorAll('#modeBar button')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    check(W+' px: five tabs, highest chance first: Boring, Machín, Volado, Suertudo, Brujo, each with its count (2, 2, 2, 1, 1)', tabs.length===5 && /^😴 Boring 2$/.test(tabs[0]) && /^💪 Machín 2$/.test(tabs[1]) && /^🪙 Volado 2$/.test(tabs[2]) && /^🍀 Suertudo 1$/.test(tabs[3]) && /^🔮 Brujo 1$/.test(tabs[4]), tabs);
    const pass0=await p.evaluate(()=>lastRows.every(r=>r.pass && r.stake>0));
    check(W+' px: all eight bets are approved with a stake (stakes are not changed by the tab)', pass0, pass0);
    const look=()=>p.evaluate(()=>({cards:[...document.querySelectorAll('#placeCards .sc-card')].map(c=>(c.textContent.match(/(Alpha Boring|Bravo Heavy|Charlie Strong|Delta Lean|Echo Slight|Foxtrot Line|Golf Coin|Hotel Unlikely)/)||[])[1]),
      bands:[...document.querySelectorAll('#placeCards .pc-band')].map(x=>x.textContent.replace(/\s+/g,' ').trim())}));
    const BANDS={boring:['High Cover 80%+ · 1','Heavy Favorite 75–<80% · 1'], safe:['Strong 70–<75% · 1','Lean 60–<65% · 1'], volado:['Slight Lean 55–<60% · 1','On the Line 50–<55% · 1'], lucky:['Coin Flip 45–<50% · 1'], clair:['Unlikely <45% · 1']};
    for(const m of ['boring','safe','volado','lucky','clair']){ await p.evaluate(m=>setMode(m), m); await p.waitForTimeout(300); const v=await look();
      check(W+' px: '+m+' lists '+WANT[m].join(' and ')+' under their band headers ('+BANDS[m].join(' / ')+'), highest first', JSON.stringify(v.cards)===JSON.stringify(WANT[m]) && JSON.stringify(v.bands)===JSON.stringify(BANDS[m]), v); }
    await p.evaluate(()=>{ setMode('safe'); localStorage.setItem('mbev.cards','0'); }); await p.uncheck('#cardsOn').catch(()=>{}); await p.evaluate(()=>{ boardCardsOn&&refresh(); }); await p.waitForTimeout(300);
    const tbl=await p.evaluate(()=>[...document.querySelectorAll('#tbody tr.band-row')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    if(W===1280) check('the table view has the same band headers in Machín (Strong, Lean)', JSON.stringify(tbl)===JSON.stringify(['Strong 70–<75% · 1','Lean 60–<65% · 1']), tbl);
    const over=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); check(W+' px: no sideways scroll', over<=0, over);
    check('no page errors ('+W+')', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
