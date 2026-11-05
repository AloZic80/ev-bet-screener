// node tests/live-edges-test.js — 🔴 Live edges (v3.71): games in progress, ESPN's live win chance against what Kalshi,
// Polymarket US and Novig sell each team at now. Flags only an edge after the fee, a chance between 8% and 92%, and a price
// close enough to ESPN's to be the same bet. ESPN and the Worker's /live are stubbed.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const comp=(ha,ab,score)=>({homeAway:ha, score:String(score), team:{abbreviation:ab, shortDisplayName:ab, name:ab}});
const ev=(id,a,h,sa,sh,pHome,state)=>({id, date:new Date(Date.now()-3600e3).toISOString(), status:{period:3, displayClock:'5:12', type:{name:'STATUS_IN_PROGRESS', state:state||'in', shortDetail:'3rd 5:12', detail:'3rd Quarter'}},
  competitions:[{competitors:[comp('away',a,sa),comp('home',h,sh)], situation:{lastPlay:{probability:{homeWinPercentage:pHome, awayWinPercentage:1-pHome}}}}]});
const NBA={events:[ev('401','LAL','BOS',70,78,0.55), ev('402','MIA','NY',60,90,0.97), ev('403','DEN','PHX',0,0,0.5,'pre')]};
// what the exchanges sell each team at now (by the id the app sends: le:<event>:<team>:<exchange>)
const PRICES={'le:401:BOS:kalshi':{ok:true,src:'kalshi',price:0.50,title:'Boston wins'}, 'le:401:LAL:kalshi':{ok:true,src:'kalshi',price:0.47},
  'le:401:BOS:novig':{ok:true,src:'novig',price:0.90}, 'le:401:BOS:poly':{ok:false,note:'Polymarket: no market'}, 'le:401:LAL:poly':{ok:true,src:'poly',price:0.33},
  'le:402:NY:kalshi':{ok:true,src:'kalshi',price:0.90}};
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({timezoneId:'America/Chicago', viewport:{width:1400,height:1000}});
  await ctx.addInitScript(()=>{ try{ if(sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded','1'); localStorage.clear(); }catch(e){} });
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const asked=[];
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/api\.0xbeta\.dev\/live\?/.test(u)){ const bets=JSON.parse(decodeURIComponent(u.split('bets=')[1])); asked.push(...bets); const results={}; bets.forEach(d=>{ if(PRICES[d.id]) results[d.id]=PRICES[d.id]; });
      return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({results})}); }
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
  const top=await p.evaluate(()=>({sum:document.getElementById('leSum').textContent, tab:document.getElementById('leTabN').textContent, stamp:document.getElementById('leStamp').textContent}));
  check('the count is on the Live tab and the panel says when it checked', top.sum==='✓ 1 live edge' && top.tab==='1' && /checked \d/.test(top.stamp), top);
  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  const ph=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1, right:document.getElementById('lePanel').getBoundingClientRect().right, w:innerWidth}));
  check('phone: fits the screen', !ph.overflow && ph.right<=ph.w+1, ph);
  check('no page errors', errs.length===0, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
