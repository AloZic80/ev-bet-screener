// node tests/kalshi-game-test.js — v4.15. Alonzo's 11/7 board: Texas Tech @ Oklahoma State (Sat 11/14) on Kalshi from The Odds API,
// full team names. His Kalshi order was "Oklahoma St. vs Kansas St." (another game): v4.14 rightly did not mark the card placed, but
// nothing said why, and "open slip" opened Kalshi's home page. Now: Kalshi is asked with ESPN's codes (TTU @ OKST, the 11/14 start),
// the strip names the game, an order on the same team in another game says "this one is not placed", an order on THIS game is ORDER
// WAITING, and a slip Kalshi cannot find says which game to pick. Phone (390) and computer (1280).
const path=require('path'); const INDEX=path.join(__dirname,'..','index.html');
const { chromium } = require('playwright'); const fs=require('fs');
const html=fs.readFileSync(process.argv[2]||INDEX,'utf8');
let pass=0, fail=0; const check=(n,ok,got)=>{ ok?pass++:fail++; console.log((ok?'PASS ':'FAIL ')+n+'  → '+JSON.stringify(got)); };
const NOW=Date.parse('2026-11-07T14:00:00Z'), iso=ms=>new Date(ms).toISOString(), DAY='2026-11-07', SAT14=Date.parse('2026-11-14T17:00:00Z'), SAT7=Date.parse('2026-11-07T23:00:00Z');
const T=(ha,abbr,loc,nick,short)=>({ha,id:abbr,abbr,name:short,loc,nick,logo:'',rec:'',color:'333333',alt:'ffffff'});
const row=(team,away,home,teams,k)=>({name:team,team,game:away+' @ '+home,matchup:away+' @ '+home,side:'',sport:'NCAAF',market:'Moneyline',kind:'moneyline',book:'Kalshi',offeredRaw:'+104',offeredProb:0.49,fairProb:0.52,fairRaw:'',mktProb:0.52,stars:null,evModel:'market',
  gameInfo:{state:'pre',startISO:iso(SAT14),timeCT:'',detail:'',teams},src:'api:oddsapi:NCAAF',apiKey:k});
const ROWS=[row('Oklahoma State Cowboys','Texas Tech Red Raiders','Oklahoma State Cowboys',[T('away','TTU','Texas Tech','Red Raiders','Texas Tech'),T('home','OKST','Oklahoma State','Cowboys','Oklahoma St')],'k1'),
            row('North Carolina Tar Heels','Louisville Cardinals','North Carolina Tar Heels',[T('away','LOU','Louisville','Cardinals','Louisville'),T('home','UNC','North Carolina','Tar Heels','North Carolina')],'k2')];
const ORD_OTHER=[{id:'o1',book:'kalshi',ref:'KXNCAAFGAME-26NOV07KSUOKST-OKST',side:'yes',action:'buy',price:0.49,qty:2,title:'Oklahoma St. vs Kansas St.',bet:{sport:'NCAAF',kind:'moneyline',team:'OKST',teamsCode:'KSUOKST',start:iso(SAT7)}},
                 {id:'o2',book:'kalshi',ref:'KXNCAAMBGAME-26NOV07UCONNUNC-UNC',side:'yes',action:'buy',price:0.45,qty:3.01,title:'North Carolina vs UConn',bet:{sport:'NCAAB',kind:'moneyline',team:'UNC',teamsCode:'UCONNUNC',start:iso(SAT7)}}];
const ORD_SAME={id:'o3',book:'kalshi',ref:'KXNCAAFGAME-26NOV14TTUOKST-OKST',side:'yes',action:'buy',price:0.49,qty:2,title:'Texas Tech at Oklahoma St.',bet:{sport:'NCAAF',kind:'moneyline',team:'OKST',teamsCode:'TTUOKST',start:iso(SAT14)}};
(async()=>{
  const b=await chromium.launch();
  for(const W of [390,1280]){
    const ctx=await b.newContext(Object.assign({timezoneId:'America/Chicago',viewport:{width:W,height:900}}, W===390?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'}:{})); await ctx.clock.install({time:new Date(NOW)});
    await ctx.addInitScript(([rows,d])=>{ try{ if(sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('mbev.board',JSON.stringify({v:1,savedAt:new Date().toISOString(),slate:d,rows})); }catch(e){} }, [ROWS,DAY]);
    const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    let ORDERS={orders:[]}; const asked=[];
    await p.route('**/*',r=>{ const u=r.request().url(); if(u.startsWith('http://app.test/')) return r.fulfill({contentType:'text/html',body:html});
      if(/\/mine\/orders/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify(ORDERS)});
      if(/\/mine\/fills/.test(u)) return r.fulfill({contentType:'application/json',body:JSON.stringify({fills:[]})});
      if(/\/live\?bets=/.test(u)){ const B=JSON.parse(decodeURIComponent(u.split('bets=')[1])); asked.push(...B); const R={}; B.forEach(x=>{ R[x.id]={ok:false,note:'Kalshi: game not found (KXNCAAFGAME)'}; }); return r.fulfill({contentType:'application/json',body:JSON.stringify({results:R})}); }
      if(/espn/.test(u)) return r.fulfill({contentType:'application/json',body:'{"events":[]}'}); return r.abort(); });
    await p.goto('http://app.test/'); await p.waitForTimeout(800);
    await p.evaluate(()=>{ const i=document.getElementById('books'); i.value='Kalshi'; i.dispatchEvent(new Event('input',{bubbles:true})); }); await p.waitForTimeout(1000);
    const D=await p.evaluate(()=>liveDesc(rowAsBet(lastRows.find(r=>/Oklahoma/.test(r.name)))));
    if(W===1280) check('Kalshi is asked for the exact game: TTU @ OKST, team OKST, the 11/14 start (it was not asked at all: full names had no codes)', D && D.away==='TTU' && D.home==='OKST' && D.team==='OKST' && D.start==='2026-11-14T17:00:00.000Z', D);
    const card=()=>p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/Oklahoma State/.test(x.textContent)); return c?c.textContent.replace(/\s+/g,' '):null; });
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(400);   /* v4.76: approved bets are split into tabs by La Contadora's chance: both games here (52%) are Place these cards under 🪙 Volado (50 to 60%), not the 💪 Machín tab the page opens in, so the cards are read there */
    const c0=await card();
    check(W+' px: the Kalshi strip names the game: "in Texas Tech at Oklahoma State, Sat, 11/14, 11:00 AM CT"', c0 && /in Texas Tech at Oklahoma State, Sat, 11\/14, 11:00 AM CT/.test(c0), c0&&c0.slice(0,600));
    // his orders: Oklahoma St. vs Kansas St., North Carolina vs UConn (other games, today)
    ORDERS={orders:ORD_OTHER}; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(900);
    const c1=await card(), unc=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/North Carolina/.test(x.textContent)); return c?c.textContent.replace(/\s+/g,' '):null; });
    check(W+' px: his order on Oklahoma St. vs Kansas St. is another game: the card stays and says "this one is not placed"', c1 && /Your Kalshi order “Oklahoma St\. vs Kansas St\.” \(2 at 49¢\) is another game\. This one is not placed\./.test(c1), c1&&c1.slice(-500));
    check(W+' px: the same for North Carolina vs UConn', unc && /“North Carolina vs UConn” \(3\.01 at 45¢\) is another game/.test(unc), unc&&unc.slice(-400));
    // an order on THIS game → ORDER WAITING, out of Place these
    ORDERS={orders:ORD_OTHER.concat([ORD_SAME])}; await p.evaluate(()=>syncOrders(true)); await p.waitForTimeout(900);
    /* v4.76: an order waiting on THIS game is listed under Already bet in the default tab (💪 Machín), so Oklahoma State leaves Volado's Place these.
       "Out of Place these" and the Already bet row are read in every tab and combined (before, both were in the one tab), then back to Volado. */
    const dupes=()=>p.evaluate(()=>[...document.querySelectorAll('#tbody tr.dupe')].map(t=>t.textContent.replace(/\s+/g,' ')));
    let c2=await card(); const al=await dupes();   // Volado, as it stands
    for(const m of ['boring','safe','lucky','clair']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(400); c2=c2||await card(); al.push(...await dupes()); }
    await p.evaluate(()=>setMode('volado')); await p.waitForTimeout(400);
    check(W+' px: an order on THIS game (Texas Tech at Oklahoma St., 11/14) moves it to Already bet: ORDER WAITING 2 shares at 49¢', !c2 && al.some(t=>/Oklahoma State/.test(t) && /ORDER WAITING/.test(t) && /2 shares at 49¢/.test(t)), {c2:!!c2, al});
    if(W===1280){
      // open slip on North Carolina: Kalshi cannot find it → the card says which game to pick
      await p.evaluate(()=>{ window.open=()=>({location:{}, closed:false}); const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/North Carolina/.test(x.textContent)); c.querySelector('.pp-open').click(); });
      await p.waitForTimeout(900);
      const n=await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/North Carolina/.test(x.textContent)); return (c.querySelector('.pp-open')||{}).textContent; });
      check('open slip that Kalshi cannot find says which game: "Pick Louisville at North Carolina, Sat, 11/14 …, not another game of the same team"', /Kalshi did not find this exact game\. Pick Louisville at North Carolina, Sat, 11\/14, 11:00 AM CT, not another game of the same team/.test(n||''), n);
    } else {
      await p.evaluate(()=>{ const c=[...document.querySelectorAll('#placeCards .pcard')].find(x=>/North Carolina/.test(x.textContent)); c.querySelector('.pp-open').click(); });
      await p.waitForTimeout(900);
      const bar=await p.evaluate(()=>{ const e=document.getElementById('slipGo'); return e&&!e.hidden?e.textContent:null; });
      check('390 px: on a phone the slip bar says the same', /did not find this exact game\. Pick Louisville at North Carolina/.test(bar||''), bar);
    }
    const spOf=()=>p.evaluate(()=>({vw:document.documentElement.clientWidth, sw:document.documentElement.scrollWidth}));
    let sp=await spOf();   // Volado, as it stands (the North Carolina card, and the slip bar on a phone)
    for(const m of ['boring','safe','lucky','clair']){ await p.evaluate(m=>setMode(m),m); await p.waitForTimeout(400); const s=await spOf(); if(s.sw-s.vw>sp.sw-sp.vw) sp=s; }   /* v4.76: and every other tab (the Already bet row is in 💪 Machín); the widest is checked */
    check(W+' px: nothing runs off the screen', sp.sw<=sp.vw+1, sp);
    check(W+' px: no page errors', !errs.length, errs);
    await ctx.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`); await b.close(); process.exit(fail?1:0);
})();
