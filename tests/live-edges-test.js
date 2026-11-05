// node tests/live-edges-test.js — 🔴 Live edges (v3.71): games in progress, ESPN's live win chance against what Kalshi,
// Polymarket US and Novig sell each team at now. Flags only an edge after the fee, a chance between 8% and 92%, and a price
// close enough to ESPN's to be the same bet. ESPN and the Worker's /live are stubbed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const FULL={LAL:['Los Angeles','Lakers'], BOS:['Boston','Celtics'], MIA:['Miami','Heat'], NY:['New York','Knicks'], DEN:['Denver','Nuggets'], PHX:['Phoenix','Suns'], ARS:['','Arsenal'], CHE:['','Chelsea']};
const comp=(ha,ab,score)=>({homeAway:ha, score:String(score), team:{abbreviation:ab, shortDisplayName:FULL[ab][1], name:FULL[ab][1], location:FULL[ab][0], displayName:FULL[ab].join(' ').trim()}});
let PINN=null, SOC=null, PINN1=null; const sbAsked=[], pinAsked=[];   // v3.76: SOC = a Premier League game with no ESPN win chance; PINN1 = Pinnacle soccer   // v3.74: null = the Worker has no /pinnapi/live yet (404)
const pinnEv=(home,away,dh,da)=>({event_id:1, sport_id:3, home, away, periods:{num_0:{money_line:{home:dh, away:da}}}, state:{match:{quarter:3}}});
const ev=(id,a,h,sa,sh,pHome,state)=>({id, date:new Date(Date.now()-3600e3).toISOString(), status:{period:3, displayClock:'5:12', type:{name:'STATUS_IN_PROGRESS', state:state||'in', shortDetail:'3rd 5:12', detail:'3rd Quarter'}},
  competitions:[{competitors:[comp('away',a,sa),comp('home',h,sh)], situation:{lastPlay:{probability:{homeWinPercentage:pHome, awayWinPercentage:1-pHome}}}}]});
const NBA={events:[ev('401','LAL','BOS',70,78,0.55), ev('402','MIA','NY',60,90,0.97), ev('403','DEN','PHX',0,0,0.5,'pre')]};
// what the exchanges sell each team at now (by the id the app sends: le:<event>:<team>:<exchange>)
const PRICES={'le:401:BOS:kalshi':{ok:true,src:'kalshi',price:0.50,title:'Boston wins'}, 'le:401:LAL:kalshi':{ok:true,src:'kalshi',price:0.47},
  'le:401:BOS:novig':{ok:true,src:'novig',price:0.90}, 'le:401:BOS:poly':{ok:false,note:'Polymarket: no market'}, 'le:401:LAL:poly':{ok:true,src:'poly',price:0.33},
  'le:402:NY:kalshi':{ok:true,src:'kalshi',price:0.90}, 'le:501:ARS:kalshi':{ok:true,src:'kalshi',price:0.44,title:'Arsenal wins'}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const asked=[];
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); asked.push(...bets); const results={}; bets.forEach(d=>{ if(PRICES[d.id]) results[d.id]=PRICES[d.id]; });
      return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({results})}); }
    if(/scoreboard/.test(u)) sbAsked.push(u); if(/pinnapi\/live/.test(u)) pinAsked.push(u);
    if(/api\.0xbeta\.dev\/pinnapi\/live\?sport_id=1/.test(u)) return PINN1 ? r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-expose-headers':'x-src-at','x-src-at':new Date().toISOString()},body:JSON.stringify(PINN1)}) : r.fulfill({status:404,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{}'});
    if(/espn\.com.*soccer\/eng\.1\/scoreboard/.test(u) && SOC) return r.fulfill({contentType:'application/json',body:JSON.stringify(SOC)});
    if(/api\.0xbeta\.dev\/pinnapi\/live\?sport_id=3/.test(u)) return PINN ? r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-expose-headers':'x-src-at','x-src-at':new Date().toISOString()},body:JSON.stringify(PINN)}) : r.fulfill({status:404,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"error":"not found"}'});
    if(/espn\.com.*basketball\/nba\/scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(NBA)});
    if(/espn\.com.*scoreboard/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(1200);
  await p.click('.tab[data-view="v-live"]'); await p.waitForTimeout(300);
  await p.click('#leScan'); await p.waitForFunction(()=>!document.getElementById('leScan').disabled && document.querySelector('#leBody .le-game'), null, {timeout:15000});
  const G=await p.evaluate(()=>[...document.querySelectorAll('#leBody .le-game')].map(g=>({head:g.querySelector('.le-head b').textContent, edge:g.classList.contains('has-edge'),
    sides:[...g.querySelectorAll('.le-side')].map(s=>({team:s.querySelector('b').textContent, espn:s.querySelector('.le-espn').textContent, q:[...s.querySelectorAll('.le-q')].map(x=>({t:x.textContent, good:x.classList.contains('good')}))}))})));
  check('only games in progress, with the score', G.length===2 && G[0].head==='NBA · LAL 70 @ BOS 78' && G[1].head==='NBA · MIA 60 @ NY 90', G.map(g=>g.head));
  check('asks each exchange for each team, as a moneyline', asked.filter(d=>/^le:401:/.test(d.id)).length===6 && asked.every(d=>d.kind==='moneyline' && d.away && d.home && d.team), asked.slice(0,2));
  const bos=G[0].sides[1], lal=G[0].sides[0], q=(s,n)=>(s.q.find(x=>x.t.startsWith(n))||{});
  check('ESPN 55% vs Kalshi 50¢: an edge after the fee, with the most to pay', /ESPN 55\.0%/.test(bos.espn) && q(bos,'Kalshi').good && /\+6\.3% ✓ edge · pay at most 51\.6¢/.test(q(bos,'Kalshi').t) && G[0].edge, q(bos,'Kalshi'));
  check('no edge when the price is above the chance', !q(lal,'Kalshi').good && /-/.test(q(lal,'Kalshi').t), q(lal,'Kalshi'));
  check('a price far from ESPN is ignored (different market), and no price says so', q(bos,'Novig').t==='Novig ?' && !q(bos,'Novig').good && q(bos,'Polymarket').t==='Polymarket —', bos.q);
  check('a game nearly decided (97%) is not flagged, even when the price looks good', !G[1].edge && /too sure/.test(G[1].sides[1].espn) && /^Kalshi 90\.0¢ · \+/.test(q(G[1].sides[1],'Kalshi').t) && !q(G[1].sides[1],'Kalshi').good, G[1].sides[1]);
  check('v3.72: a price 12 points from ESPN is ignored too (the guard is 10 points, was 25)', q(lal,'Polymarket').t==='Polymarket ?' && !q(lal,'Polymarket').good, q(lal,'Polymarket'));
  check('v3.72: each game says when ESPN last changed its number', /ESPN changed \d+ s ago/.test(await p.textContent('#leBody .le-game .le-head .meta')), await p.textContent('#leBody .le-game .le-head .meta'));
  check('v3.73: the hint says the stale check needs about 2 minutes of watching', /needs about 2 minutes of watching/.test(await p.textContent('#lePanel .hint')), true);
  const rescan=async()=>{ await p.click('#leScan'); await p.waitForFunction(()=>!document.getElementById('leScan').disabled, null, {timeout:15000}); await p.waitForTimeout(100); };
  const back=()=>p.evaluate(()=>leSeen.forEach(r=>{ r.pAt-=180000; r.sigAt-=180000; }));
  const g0=()=>p.evaluate(()=>{ const g=document.querySelector('#leBody .le-game'); return {meta:g.querySelector('.le-head .meta').textContent, good:!!g.querySelector('.le-q.good'), sum:document.getElementById('leSum').textContent}; });
  await back(); NBA.events[0].status.displayClock='3:40'; await rescan();
  let st=await g0();
  check('v3.72: ESPN unchanged 3 minutes while the clock ran: edges hidden, and it says why', !st.good && /ESPN changed 3 min \d+ s ago · stale: edges hidden/.test(st.meta) && !/✓/.test(st.sum), st);
  await back(); NBA.events[0].status.displayClock='0:00'; NBA.events[0].status.type.name='STATUS_HALFTIME'; NBA.events[0].status.type.shortDetail='Halftime'; await rescan();
  st=await g0();
  check('v3.72: halftime is not stale: the edge stays', st.good && !/stale/.test(st.meta) && st.sum==='✓ 1 live edge', st);
  await back(); NBA.events[0].status.type.name='STATUS_IN_PROGRESS'; NBA.events[0].status.type.shortDetail='3rd 2:00'; NBA.events[0].status.displayClock='2:00'; NBA.events[0].competitions[0].situation.lastPlay.probability={homeWinPercentage:0.56, awayWinPercentage:0.44}; await rescan();
  st=await g0();
  check('v3.72: once ESPN moves again the edge is back', st.good && /ESPN changed \d+ s ago/.test(st.meta) && !/stale/.test(st.meta), st);
  await back(); NBA.events[0].competitions[0].situation.lastPlay.probability={homeWinPercentage:0.55, awayWinPercentage:0.45}; await rescan();
  check('v3.74: no Pinnacle route on the Worker yet: ESPN only, and it says so', /Pinnacle live: not on your Worker yet \(ESPN only\)/.test(await p.textContent('#leStamp')), await p.textContent('#leStamp'));
  PINN={events:[pinnEv('Boston Celtics','Los Angeles Lakers',1.80,2.10), pinnEv('New York Knicks','Miami Heat',1.03,12.0)]}; await rescan();
  const pz=await p.evaluate(()=>{ const g=document.querySelector('#leBody .le-game'), s=g.querySelectorAll('.le-side'); return {stamp:document.getElementById('leStamp').textContent, meta:g.querySelector('.le-head .meta').textContent, bos:s[1].textContent, good:[...s[1].querySelectorAll('.le-q.good')].map(x=>x.textContent)}; });
  check('v3.74: Pinnacle live (vig removed) is the fair price, ESPN agrees: edge kept, both shown, Pinnacle age shown', /Pinnacle live on/.test(pz.stamp) && /ESPN 55\.0% · Pinnacle 53\.8%/.test(pz.bos) && /Pinnacle \d+ s old/.test(pz.meta) && pz.good.length===1 && /^Kalshi 50\.0¢ · \+4\.1% ✓ edge · pay at most 5[01]\.\d¢/.test(pz.good[0]), pz);
  PINN={events:[pinnEv('Boston Celtics','Los Angeles Lakers',1.90,1.98)]}; await rescan();
  const pd=await p.evaluate(()=>{ const s=document.querySelectorAll('#leBody .le-game')[0].querySelectorAll('.le-side'); return {bos:s[1].textContent, good:document.querySelectorAll('#leBody .le-q.good').length, sum:document.getElementById('leSum').textContent}; });
  check('v3.74: Pinnacle says 51% while ESPN says 55%: Pinnacle wins, no edge', /Pinnacle 51\.0%/.test(pd.bos) && pd.good===0 && !/✓/.test(pd.sum), pd);
  PINN={events:[pinnEv('Los Angeles Lakers','Boston Celtics',2.10,1.80)]}; await rescan();
  check('v3.74: home and away listed the other way round still match the right team', /^BOS.*Pinnacle 53\.8%/.test(await p.evaluate(()=>document.querySelectorAll('#leBody .le-game')[0].querySelectorAll('.le-side')[1].textContent)), await p.evaluate(()=>document.querySelectorAll('#leBody .le-game')[0].querySelectorAll('.le-side')[1].textContent));
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(200); PINN={events:[pinnEv('Boston Celtics','Los Angeles Lakers',1.80,2.10)]}; await rescan();
  const chip=await p.evaluate(()=>[...document.querySelectorAll('#leBody .le-q')].map(q=>{ const c=q.closest('.le-game').getBoundingClientRect(), r=q.getBoundingClientRect(); return {t:q.textContent, out:r.right>c.right+0.5}; }).filter(x=>x.out));
  check('v3.75: on a phone every chip, the ✓ edge one too, stays inside its card', chip.length===0 && await p.$('#leBody .le-q.good'), chip);
  await p.setViewportSize({width:1400,height:1000}); await p.waitForTimeout(200);
  PINN=null; await rescan();
  const top=await p.evaluate(()=>({sum:document.getElementById('leSum').textContent, tab:document.getElementById('leTabN').textContent, stamp:document.getElementById('leStamp').textContent}));
  check('the count is on the Live tab and the panel says when it checked', top.sum==='✓ 1 live edge' && top.tab==='1' && /checked \d/.test(top.stamp), top);
  const n0=sbAsked.length; await rescan(); const n1=sbAsked.length-n0;
  check('v3.76: every team league is checked (first scan), then leagues with nothing live are skipped', n0>=40 && n1<=3, {first:n0, next:n1});
  SOC={events:[ev('501','CHE','ARS',0,1,null)]}; SOC.events[0].competitions[0].situation={}; PINN1={events:[{home:'Arsenal', away:'Chelsea', periods:{num_0:{money_line:{home:2.0, draw:3.6, away:4.0}}}}]};
  await p.evaluate(()=>leQuiet.clear()); await rescan();
  const so=await p.evaluate(()=>{ const g=[...document.querySelectorAll('#leBody .le-game')].find(x=>/EPL/.test(x.querySelector('.le-head b').textContent)); return g?{head:g.querySelector('.le-head').textContent, ars:g.querySelectorAll('.le-side')[1].textContent, good:[...g.querySelectorAll('.le-q.good')].map(x=>x.textContent)}:null; });
  check('v3.76: a soccer game ESPN has no win chance for is priced by Pinnacle alone (draw included)', so && /no ESPN win chance: Pinnacle only/.test(so.head) && /ESPN — · Pinnacle 48\.6%/.test(so.ars) && so.good.length===1 && /^Kalshi 44\.0¢ · \+6\.4% ✓ edge/.test(so.good[0]), so);
  SOC=null; PINN1=null;
  PINN={events:[pinnEv('Boston Celtics','Los Angeles Lakers',1.80,2.10)]}; let k=pinAsked.length;
  await p.evaluate(()=>leScan(false)); await p.waitForFunction(()=>!leBusy);
  const au=await p.evaluate(()=>document.getElementById('leStamp').textContent);
  check('v3.76: Auto-refresh does not ask Pinnacle (daily limit); it says to press Scan', pinAsked.length===k && /\d+ of 40 Pinnacle checks today/.test(au), {asked:pinAsked.length-k, au});
  await p.evaluate(()=>localStorage.setItem('mbev.lePinn',JSON.stringify({day:ctDay(Date.now()),n:40}))); k=pinAsked.length; await rescan();
  const cap=await p.evaluate(()=>document.getElementById('leStamp').textContent);
  check('v3.76: after 40 Pinnacle checks today, a press uses ESPN and says so', pinAsked.length===k && /today.s 40 used|40 of 40/.test(cap), {asked:pinAsked.length-k, cap});
  await p.evaluate(()=>localStorage.removeItem('mbev.lePinn')); PINN=null;
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  const ph=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1, right:document.getElementById('lePanel').getBoundingClientRect().right, w:innerWidth}));
  check('phone: fits the screen', !ph.overflow && ph.right<=ph.w+1, ph);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
