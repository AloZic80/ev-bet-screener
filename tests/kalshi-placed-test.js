// node tests/kalshi-placed-test.js — v4.14. Alonzo: "I am still seeing Kalshi slips I made on the board". Two cases left them in Place these:
// an order still waiting on Kalshi (placed, not filled), and a bet logged from the Kalshi fill whose name the book words differently.
// Both now match by Kalshi's own market code and side, and move to Already bet. A NO order does not hide the YES bet.
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T18:00:00Z'), H=3600e3, iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07';
const team=(ha,abbr)=>({ha,id:abbr,abbr,name:abbr,loc:abbr,nick:abbr,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(t,o,book,k)=>({name:t,team:t,game:o+' @ '+t,matchup:t+' vs '+o,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book,offeredRaw:'-105',offeredProb:0.512,fairProb:0.55,fairRaw:'',mktProb:0.55,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(NOW+5*H),timeCT:'',detail:'',teams:[team('away',o),team('home',t)]},src:'api:oddsapi:NCAAF',apiKey:k});
const ROWS=[row('AKR','KENT','Kalshi','k1'), row('BGSU','TOL','Kalshi','k2'), row('BALL','NIU','Kalshi','k3')];
const LOG=[{id:'b1',name:'Bowling Green Falcons',kind:'moneyline',market:'BGSU to win',book:'Kalshi',odds:'-108',stake:3.1,date:DAY,gameDay:DAY,start:iso(NOW+5*H),sport:'NCAAF',autoFrom:'kalshi',fillBook:'kalshi',fillRef:'KX-BGSU',fillSide:'yes',fills:['f1'],placedAt:iso(NOW-H)}];
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({timezoneId:'America/Chicago',viewport:{width:1280,height:900}}); await ctx.clock.install({time:new Date(NOW)});
  await ctx.addInitScript(([rows,d,L])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); localStorage.setItem('mbev.log',JSON.stringify(L)); }catch(e){} }, [ROWS,DAY,LOG]);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  let ORDERS={orders:[]};
  await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
    if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(ORDERS)});
    if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
    if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
  await p.goto('http://app.test/'); await p.waitForTimeout(800);
  await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(800);
  // the prices the app read for each Kalshi row (market code + side)
  await p.evaluate(()=>{ const Q=(ref,t)=>({ok:true,src:'kalshi',ref,title:t,price:0.51,at:new Date().toISOString()});
    lastRows.find(r=>r.team==='AKR')._openQ=Q('KX-AKR','AKR wins'); lastRows.find(r=>r.team==='BGSU')._openQ=Q('KX-BGSU','BGSU wins'); lastRows.find(r=>r.team==='BALL')._openQ=Q('KX-BALL','BALL wins'); refresh(); });
  await p.waitForTimeout(600);
  const see=()=>p.evaluate(()=>({cards:[...document.querySelectorAll('#placeCards .pcard')].map(c=>['AKR','BGSU','BALL'].find(t=>c.textContent.includes(t+' @')||c.textContent.includes(t+' vs')||c.textContent.includes(t))),
    already:[...document.querySelectorAll('#tbody tr.dupe')].map(t=>t.textContent.replace(/\s+/g,' ').slice(0,400))}));
  /* v4.76: approved bets are split into tabs by La Contadora's chance. AKR, BGSU and BALL (model = market = 55%) are 🪙 Volado bets (50 to 60%), and an
     order waiting at a book stays in the opening tab, 💪 Machín (modeFamOf). So each look reads every tab and puts them together: "out of Place these"
     means in no tab, "in Already bet" means in some tab (before, all of them were in the one default tab). Ends back on the opening tab. */
  const seeTabs=async()=>{ const V={cards:[],already:[],tabs:{}}; for(const m of ['boring','safe','volado','lucky','clair']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(300); const v=await see(); V.cards.push(...v.cards); V.already.push(...v.already); V.tabs[m]={cards:v.cards, already:v.already.length}; }
    await p.evaluate(()=>setMode('safe')); await p.waitForTimeout(300); return V; };
  const A=await seeTabs();
  check('a bet logged from the Kalshi fill (worded "Bowling Green Falcons") matches the BGSU row by Kalshi\'s market code → Already bet', !A.cards.includes('BGSU') && A.already.some(t=>/BGSU/.test(t) && /ALREADY BET/.test(t)), A);
  // an order waiting on Kalshi for AKR (YES), and a NO order on BALL (the other side)
  ORDERS={orders:[{id:'o1',book:'kalshi',ref:'KX-AKR',side:'yes',price:0.52,qty:6},{id:'o2',book:'kalshi',ref:'KX-BALL',side:'no',price:0.47,qty:4}]};
  await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(800);
  const B=await seeTabs();   /* v4.76: AKR's ORDER WAITING row is in 💪 Machín, BALL's card in 🪙 Volado: every tab, put together */
  check('an order still waiting on Kalshi moves AKR to Already bet: "ORDER WAITING on Kalshi: 6 shares at 52¢"', !B.cards.includes('AKR') && B.already.some(t=>/AKR/.test(t) && /ORDER WAITING/.test(t) && /6 shares at 52¢/.test(t)), B);
  check('a NO order on BALL does not hide the YES bet: BALL stays in Place these', B.cards.includes('BALL'), B.cards);
  ORDERS={orders:[]}; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(800);
  const C=await seeTabs();   /* v4.76: every tab, put together (AKR and BALL are back under 🪙 Volado) */
  check('when the order is gone (cancelled), AKR is back in Place these', C.cards.includes('AKR') && C.cards.includes('BALL') && !C.cards.includes('BGSU'), C.cards);
  check('no page errors', !errs.length, errs);
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
