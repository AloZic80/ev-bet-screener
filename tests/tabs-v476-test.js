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
    check(W+' px: five tabs, highest chance first: Boring, Machín, Volado, Suertudo, Brujo, each with its count (2, 2, 2, 1, 1); v4.77: then ⏱ Old, 0 here (every price is a minute old)', tabs.length===6 && /^⏱ Old 0$/.test(tabs[5]) && /^😴 Boring 2$/.test(tabs[0]) && /^💪 Machín 2$/.test(tabs[1]) && /^🪙 Volado 2$/.test(tabs[2]) && /^🍀 Suertudo 1$/.test(tabs[3]) && /^🔮 Brujo 1$/.test(tabs[4]), tabs);
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
  // YES / NO (Alonzo, 11/12: "what the hell does, JUST MISSED floor by blah blah. Like, Do i Still Bet or not?"). In 🍀 Suertudo: Golf Coin is
  // approved (47% at 43%: +9.3%); India Near just missed: model 50%, market 45% → La Contadora 45% + 0.35 × 5 = 46.75%, at 46.38% (+116) her EV is
  // 46.75 / 46.38 − 1 = +0.80%, under the 1.5% floor (still 0% or better). Labels only: the stakes are what they were.
  { const NEAR=Object.assign(row('i','India Near',0.50), {mktProb:0.45, offeredProb:0.4638, offeredRaw:am(0.4638)});
    const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:1000}}); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([R,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.cfg',JSON.stringify({books:'Novig',bank:'500',cfgVer:3.03})); localStorage.setItem('mbev.cards','1'); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows:R})); }catch(e){} },[[row('g','Golf Coin',0.47), NEAR],DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html}); if(/0xbeta/.test(u)) return r.fulfill({contentType:'application/json',body:'{}'}); if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(1300);
    await p.evaluate(()=>{ EXTRAS.nearMiss=true; refresh(); }); await p.waitForTimeout(300);   /* v4.80: near-miss offers are off by default (owner: option A); this block keeps their machinery covered with them on */
    await p.evaluate(()=>setMode('lucky')); await p.waitForTimeout(400);
    const v=await p.evaluate(()=>{ const t=x=>x?x.textContent.replace(/\s+/g,' ').trim():null, near=lastRows.find(r=>r.name==='India Near'), golf=lastRows.find(r=>r.name==='Golf Coin');
      const card=[...document.querySelectorAll('#placeCards .sc-card')].find(c=>/India Near/.test(c.textContent));
      return {heads:[...document.querySelectorAll('#placeCards .pc-head')].map(t), band:t(card&&card.querySelector('.sc-xtop')), dec:t(card&&card.querySelector('.sc-dec')),
        near:{tier:near&&near.tier, act:near&&+near.actNet.toFixed(4), stake:near&&near.xStake, pass:near&&!!near.pass}, golf:{pass:golf&&!!golf.pass, stake:golf&&golf.stake}}; });
    check('the near-miss: La Contadora +0.80%, under the 1.5% floor, offered as 🍀 Just missed at the smallest bet; Golf Coin approved', v.near.tier==='lucky' && Math.abs(v.near.act-0.008)<0.0006 && v.near.stake>0 && !v.near.pass && v.golf.pass && v.golf.stake>0, {near:v.near, golf:v.golf});
    check('Place these says YES: "✅ La Contadora: YES. The math says bet every card here."', v.heads.length===2 && /Place these · 1/.test(v.heads[0]) && /✅ La Contadora: YES\. The math says bet every card here\. Best first/.test(v.heads[0]), v.heads[0]);
    check('the 🍀 header says NO first: "La Contadora: NO. The model likes these … not best bets. Optional …"', /^🍀 Just missed · 1 ?La Contadora: NO\. The model likes these, but with the market her EV is under your 1\.5% floor \(still 0% or better\): not best bets\. Optional: if you want a few, the smallest bet each/.test(v.heads[1]||''), v.heads[1]);
    check('the card says it outright: "🍀 La Contadora: NO · just under your floor (+0.8% vs your 1.5%) · optional, smallest bet"', v.band==='🍀 La Contadora: NO · just under your floor (+0.8% vs your 1.5%) · optional, smallest bet', v.band);
    check('its decision says the same under "🍀 JUST MISSED $"', /🍀 JUST MISSED \$\d+\.\d\d ?La Contadora: NO · just under your floor \(\+0\.8% vs your 1\.5%\) · optional, smallest bet/.test(v.dec||''), v.dec);
    /* v4.77 (Los Chismosos): Suertudo also lists approved Coin Flips, so its line counts only the near-misses; an empty Machín says where the bets are */
    const cnt=await p.evaluate(()=>(document.getElementById('contadora')||{}).textContent||'');
    check('v4.77: Suertudo\'s line counts only the near-miss: "🍀 1 just missed on the board" (Golf Coin is an approved Coin Flip, not a near-miss)', /🍀 1 just missed on the board/.test(cnt) && !/🍀 2 just missed/.test(cnt), cnt);
    await p.evaluate(()=>setMode('safe')); await p.waitForTimeout(300);
    const em=await p.evaluate(()=>({empty:(document.getElementById('emptyMsg')||{}).textContent||''}));
    check('v4.77: 💪 Machín has nothing but Suertudo has 2: it says "💪 Machín lists the bets La Contadora approves at 60 to 75%, and none is on the board right now … 🍀 Suertudo has 2 (1 just missed)", not "Every bet failed a screen"', /💪 Machín lists the bets La Contadora approves at 60 to 75%, and none is on the board right now/.test(em.empty) && /🍀 Suertudo has 2 \(1 just missed\)/.test(em.empty) && !/Every bet failed/.test(em.empty), em);
    await p.evaluate(()=>setMode('lucky')); await p.waitForTimeout(300);
    await p.evaluate(()=>{ localStorage.setItem('mbev.cards','0'); }); await p.uncheck('#cardsOn').catch(()=>{}); await p.evaluate(()=>{ refresh(); }); await p.waitForTimeout(300);
    const g=await p.evaluate(()=>[...document.querySelectorAll('#tbody tr.group-row:not(.band-row)')].map(x=>x.textContent.replace(/\s+/g,' ').trim()));
    check('the table view: "Place these · 1 · ✅ La Contadora: YES" and "🍀 Just missed · La Contadora: NO, just under your floor · optional …"', g.includes('Place these · 1 · ✅ La Contadora: YES') && g.some(x=>/^🍀 Just missed · La Contadora: NO, just under your floor · optional: the smallest bet each, up to \d+ a day · 1$/.test(x)), g);
    /* v4.78 (Los Chismosos): the day's 5 near-misses are used and an approved Coin Flip (Golf Coin) is on the board: the 🍀 header says "No more
       today" (it said "No bet on the board just missed", because the Coin Flip was counted as a near-miss) */
    await p.evaluate(()=>{ localStorage.setItem('mbev.cards','1'); const n=lastRows.find(x=>x.name==='India Near'); for(let i=0;i<5;i++) addToLog(Object.assign({}, n, {name:'Used '+i, apiKey:'u'+i, tier:'lucky', stake:1})); });
    await p.check('#cardsOn').catch(()=>{}); await p.evaluate(()=>{ setMode('lucky'); refresh(); }); await p.waitForTimeout(400);
    const nm=await p.evaluate(()=>({head:[...document.querySelectorAll('#placeCards .pc-head.lucky')].map(h=>h.textContent.replace(/\s+/g,' ').trim()), info:(document.getElementById('contadora')||{}).textContent||'', near:(lastRows.find(x=>x.name==='India Near')||{}).xCap||0}));
    check('v4.78: 5 near-misses used today, an approved Coin Flip on the board: "No more today: 5 a game day, and you have used them." and "🍀 no more today (5 a day)"', nm.near===1 && nm.head.some(h=>/No more today: 5 a game day, and you have used them\./.test(h)) && /🍀 no more today \(5 a day\)/.test(nm.info), nm);
    check('no page errors (YES / NO)', !errs.length, errs); await ctx.close(); }
  await b.close(); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0); })();
